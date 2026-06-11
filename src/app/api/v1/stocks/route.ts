import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';
import { query } from '@/lib/db';

export async function GET(req: Request) {
  const auth = await validateApiKey(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const result = await query('SELECT * FROM stocks WHERE user_id=$1 ORDER BY symbol', [auth.userId]);
  return NextResponse.json(result.rows);
}

export async function POST(req: Request) {
  const auth = await validateApiKey(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { symbol, lots, buy_price } = await req.json();

  const result = await query(
    `INSERT INTO stocks (user_id, symbol, lots, buy_price) VALUES ($1,$2,$3,$4)
     ON CONFLICT (user_id, symbol) DO UPDATE SET lots=$3, buy_price=$4
     RETURNING *`,
    [auth.userId, symbol.toUpperCase(), lots, buy_price]
  );
  return NextResponse.json(result.rows[0], { status: 201 });
}
