import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';

export async function GET(req: Request) {
  const auth = await validateApiKey(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { userId, userClient } = auth;

  try {
    const { data, error } = await userClient
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name');

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
