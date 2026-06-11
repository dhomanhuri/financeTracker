import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';
import { query } from '@/lib/db';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await validateApiKey(_req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  await query('DELETE FROM stocks WHERE id=$1 AND user_id=$2', [(await params).id, auth.userId]);
  return NextResponse.json({ message: 'Deleted' });
}
