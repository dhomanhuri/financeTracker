import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';
import { query } from '@/lib/db';

export async function GET(req: Request) {
  const auth = await validateApiKey(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));
  const year  = parseInt(searchParams.get('year')  || String(new Date().getFullYear()));

  // Ambil semua budget bulan ini + total pengeluaran per kategori
  const result = await query(`
    SELECT
      b.id,
      b.category_id,
      b.amount        AS budget_amount,
      b.month,
      b.year,
      c.name          AS category_name,
      c.type          AS category_type,
      COALESCE(SUM(t.amount), 0) AS spent
    FROM budgets b
    JOIN categories c ON b.category_id = c.id
    LEFT JOIN transactions t
      ON  t.category_id = b.category_id
      AND t.user_id     = b.user_id
      AND t.type        = 'expense'
      AND EXTRACT(MONTH FROM t.date) = b.month
      AND EXTRACT(YEAR  FROM t.date) = b.year
    WHERE b.user_id = $1
      AND b.month   = $2
      AND b.year    = $3
    GROUP BY b.id, b.category_id, b.amount, b.month, b.year, c.name, c.type
    ORDER BY c.name
  `, [auth.userId, month, year]);

  return NextResponse.json(result.rows);
}

export async function POST(req: Request) {
  const auth = await validateApiKey(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { category_id, amount, month, year } = await req.json();
  if (!category_id || !amount) {
    return NextResponse.json({ error: 'category_id dan amount wajib' }, { status: 400 });
  }

  const m = month || new Date().getMonth() + 1;
  const y = year  || new Date().getFullYear();

  const result = await query(`
    INSERT INTO budgets (user_id, category_id, amount, month, year)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (user_id, category_id, month, year)
    DO UPDATE SET amount = EXCLUDED.amount
    RETURNING *
  `, [auth.userId, category_id, amount, m, y]);

  return NextResponse.json(result.rows[0], { status: 201 });
}
