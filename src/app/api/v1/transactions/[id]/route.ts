import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';
import { query } from '@/lib/db';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await validateApiKey(_req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { userId } = auth;

  // Ambil transaction dulu untuk revert balance
  const tx = await query(
    'SELECT * FROM transactions WHERE id=$1 AND user_id=$2', [(await params).id, userId]
  );
  if (!tx.rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const t = tx.rows[0];
  await query('DELETE FROM transactions WHERE id=$1', [(await params).id]);

  // Revert balance
  if (t.account_id) {
    const adjustment = t.type === 'income' ? -t.amount : t.amount;
    await query('UPDATE accounts SET balance = balance + $1 WHERE id=$2', [adjustment, t.account_id]);
  }

  return NextResponse.json({ message: 'Deleted' });
}
