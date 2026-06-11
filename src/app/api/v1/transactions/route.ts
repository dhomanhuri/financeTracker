import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';
import { query } from '@/lib/db';

export async function GET(req: Request) {
  const auth = await validateApiKey(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { userId } = auth;

  const { searchParams } = new URL(req.url);
  const limit  = parseInt(searchParams.get('limit')  || '20');
  const offset = parseInt(searchParams.get('offset') || '0');
  const from   = searchParams.get('from');
  const to     = searchParams.get('to');

  try {
    let sql = `
      SELECT t.*,
             c.name AS category_name, c.type AS category_type,
             a.name AS account_name,  a.color AS account_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN accounts   a ON t.account_id  = a.id
      WHERE t.user_id = $1
    `;
    const params: unknown[] = [userId];
    let idx = 2;

    if (from) { sql += ` AND t.date >= $${idx++}`; params.push(from); }
    if (to)   { sql += ` AND t.date <= $${idx++}`; params.push(to);   }

    sql += ` ORDER BY t.date DESC, t.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    if (from || to) {
      const sumResult = await query(
        `SELECT type, SUM(amount) AS total
         FROM transactions
         WHERE user_id = $1 ${from ? 'AND date >= $2' : ''} ${to ? `AND date <= $${from ? 3 : 2}` : ''}
         GROUP BY type`,
        [userId, ...(from ? [from] : []), ...(to ? [to] : [])]
      );

      const summary = { total_income: 0, total_expense: 0, net_change: 0 };
      sumResult.rows.forEach(r => {
        if (r.type === 'income')  summary.total_income  = parseFloat(r.total);
        else                      summary.total_expense = parseFloat(r.total);
      });
      summary.net_change = summary.total_income - summary.total_expense;

      return NextResponse.json({ period: { from, to }, summary, transactions: result.rows });
    }

    return NextResponse.json(result.rows);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await validateApiKey(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { userId } = auth;

  try {
    const body = await req.json();
    const { amount, type, category_id, account_id, title, description, date } = body;
    const transactionTitle = title || description;

    if (!amount || !type || !category_id || !account_id || !transactionTitle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO transactions (user_id, amount, type, category_id, account_id, title, date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, amount, type, category_id, account_id, transactionTitle, date || new Date().toISOString().split('T')[0]]
    );

    // Update account balance
    const adjustment = type === 'income' ? amount : -amount;
    await query(
      `UPDATE accounts SET balance = balance + $1 WHERE id = $2 AND user_id = $3`,
      [adjustment, account_id, userId]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error' }, { status: 500 });
  }
}
