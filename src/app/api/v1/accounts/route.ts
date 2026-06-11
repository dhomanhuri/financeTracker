import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';
import { query } from '@/lib/db';

export async function GET(req: Request) {
  const auth = await validateApiKey(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const result = await query('SELECT * FROM accounts WHERE user_id=$1 ORDER BY name', [auth.userId]);
  return NextResponse.json(result.rows);
}

export async function POST(req: Request) {
  const auth = await validateApiKey(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { userId } = auth;
  const { name, balance = 0, color = '#3b82f6', icon = 'Wallet', notes } = await req.json();

  const result = await query(
    `INSERT INTO accounts (user_id, name, balance, color, icon, notes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [userId, name, balance, color, icon, notes || null]
  );
  return NextResponse.json(result.rows[0], { status: 201 });
}
