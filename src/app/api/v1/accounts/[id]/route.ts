import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';
import { query } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await validateApiKey(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { userId } = auth;

  const body = await req.json();
  const { name, balance, color, icon } = body;

  const result = await query(
    `UPDATE accounts SET name=$1, balance=$2, color=$3, icon=$4
     WHERE id=$5 AND user_id=$6 RETURNING *`,
    [name, balance, color, icon, (await params).id, userId]
  );
  if (!result.rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(result.rows[0]);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await validateApiKey(_req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { userId } = auth;

  await query('DELETE FROM accounts WHERE id=$1 AND user_id=$2', [(await params).id, userId]);
  return NextResponse.json({ message: 'Deleted' });
}
