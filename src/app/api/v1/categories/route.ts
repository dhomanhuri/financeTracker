import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';
import { query } from '@/lib/db';

export async function GET(req: Request) {
  const auth = await validateApiKey(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  // Return kategori milik user + kategori global (user_id IS NULL)
  const result = await query(
    `SELECT * FROM categories WHERE user_id = $1 OR user_id IS NULL ORDER BY type, name`,
    [auth.userId]
  );
  return NextResponse.json(result.rows);
}

export async function POST(req: Request) {
  const auth = await validateApiKey(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { name, type } = await req.json();

  const result = await query(
    `INSERT INTO categories (user_id, name, type) VALUES ($1,$2,$3) RETURNING *`,
    [auth.userId, name, type]
  );
  return NextResponse.json(result.rows[0], { status: 201 });
}
