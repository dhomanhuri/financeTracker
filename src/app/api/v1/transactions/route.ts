import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';

export async function GET(req: Request) {
  const auth = await validateApiKey(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { userId, userClient } = auth;

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    const { data, error } = await userClient
      .from('transactions')
      .select(`
        *,
        category:categories(name, type, color, icon),
        account:accounts(name)
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await validateApiKey(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { userId, userClient } = auth;

  try {
    const body = await req.json();
    const { amount, type, category_id, account_id, description, date } = body;

    // Basic validation
    if (!amount || !type || !category_id || !account_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Insert transaction
    const { data: transaction, error: txError } = await userClient
      .from('transactions')
      .insert([{
        user_id: userId,
        amount,
        type,
        category_id,
        account_id,
        description,
        date: date || new Date().toISOString()
      }])
      .select()
      .single();

    if (txError) throw txError;

    // 2. Update account balance
    const adjustment = type === 'income' ? amount : -amount;
    const { data: account } = await userClient
      .from('accounts')
      .select('balance')
      .eq('id', account_id)
      .single();

    if (account) {
      await userClient
        .from('accounts')
        .update({ balance: account.balance + adjustment })
        .eq('id', account_id);
    }

    return NextResponse.json(transaction);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
