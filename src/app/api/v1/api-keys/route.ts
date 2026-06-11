import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';
import { query } from '@/lib/db';
import crypto from 'crypto';

export async function GET(req: Request) {
  const auth = await validateApiKey(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const result = await query(
    'SELECT id, name, last_used_at, created_at FROM api_keys WHERE user_id=$1 ORDER BY created_at DESC',
    [auth.userId]
  );
  return NextResponse.json(result.rows);
}

export async function POST(req: Request) {
  const auth = await validateApiKey(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { name } = await req.json();

  // Generate raw key (hanya ditampilkan sekali)
  const rawKey = `ft_${crypto.randomBytes(32).toString('hex')}`;
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

  const result = await query(
    `INSERT INTO api_keys (user_id, key_hash, name) VALUES ($1,$2,$3) RETURNING id, name, created_at`,
    [auth.userId, keyHash, name]
  );

  return NextResponse.json({ ...result.rows[0], raw_key: rawKey }, { status: 201 });
}
