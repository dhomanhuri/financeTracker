import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';
import { query } from '@/lib/db';

export async function GET(req: Request) {
  const auth = await validateApiKey(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { userId } = auth;

  try {
    const accounts = await query(
      `SELECT * FROM accounts WHERE user_id = $1`,
      [userId]
    );

    const totalBalance = accounts.rows.reduce((sum, a) => sum + (isNaN(parseFloat(a.balance)) ? 0 : parseFloat(a.balance)), 0);

    const transactions = await query(
      `SELECT t.*,
              c.name AS category_name, c.type AS category_type,
              a.name AS account_name,  a.color AS account_color
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       LEFT JOIN accounts   a ON t.account_id  = a.id
       WHERE t.user_id = $1
       ORDER BY t.date DESC
       LIMIT 5`,
      [userId]
    );

    return NextResponse.json({
      total_balance:        totalBalance,
      account_count:        accounts.rows.length,
      recent_transactions:  transactions.rows,
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error' }, { status: 500 });
  }
}
