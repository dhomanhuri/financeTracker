import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';

export async function GET(req: Request) {
  const auth = await validateApiKey(req);
  
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { userId, userClient } = auth;

  try {
    // Get total balance
    const { data: accounts, error: accError } = await userClient
      .from('accounts')
      .select('balance')
      .eq('user_id', userId);

    if (accError) throw accError;

    const totalBalance = accounts?.reduce((sum, acc) => sum + acc.balance, 0) || 0;

    // Get recent transactions
    const { data: recentTransactions, error: txError } = await userClient
      .from('transactions')
      .select(`
        *,
        categories(name, type),
        accounts(name, color)
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(5);

    if (txError) throw txError;

    return NextResponse.json({
      total_balance: totalBalance,
      account_count: accounts?.length || 0,
      recent_transactions: recentTransactions
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
