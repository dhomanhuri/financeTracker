import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';
import { query } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await validateApiKey(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { name, type } = await req.json();

  const result = await query(
    `UPDATE categories SET name=$1, type=$2 WHERE id=$3 AND user_id=$4 RETURNING *`,
    [name, type, (await params).id, auth.userId]
  );
  if (!result.rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(result.rows[0]);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await validateApiKey(_req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  await query('DELETE FROM categories WHERE id=$1 AND user_id=$2', [(await params).id, auth.userId]);
  return NextResponse.json({ message: 'Deleted' });
}
