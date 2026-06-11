import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';
import { query } from '@/lib/db';

export async function GET(req: Request) {
  const auth = await validateApiKey(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const result = await query(
    'SELECT * FROM financial_freedom_entries WHERE user_id=$1 ORDER BY created_at DESC LIMIT 1',
    [auth.userId]
  );
  return NextResponse.json(result.rows[0] || null);
}

export async function POST(req: Request) {
  const auth = await validateApiKey(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const data = await req.json();
  const {
    monthly_savings = 0, annual_savings = 0, return_rate = 0,
    monthly_expenses = 0, annual_expenses = 0, monthly_income = 0,
    dependents = 0, target_amount = 0, initial_savings = 0,
  } = data;

  const result = await query(
    `INSERT INTO financial_freedom_entries
       (user_id, monthly_savings, annual_savings, return_rate, monthly_expenses,
        annual_expenses, monthly_income, dependents, target_amount, initial_savings)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [auth.userId, monthly_savings, annual_savings, return_rate,
     monthly_expenses, annual_expenses, monthly_income, dependents, target_amount, initial_savings]
  );
  return NextResponse.json(result.rows[0], { status: 201 });
}
