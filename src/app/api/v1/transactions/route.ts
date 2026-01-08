import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';

export async function GET(req: Request) {
  const auth = await validateApiKey(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { userId, userClient } = auth;

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  try {
    let query = userClient
      .from('transactions')
      .select(`
        *,
        categories(name, type),
        accounts(name, color)
      `)
      .eq('user_id', userId);

    if (from) query = query.gte('date', from);
    if (to) query = query.lte('date', to);

    const { data, error } = await query
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // If period filter is applied, calculate summary for that period
    if (from || to) {
      let summaryQuery = userClient
        .from('transactions')
        .select('amount, type')
        .eq('user_id', userId);
      
      if (from) summaryQuery = summaryQuery.gte('date', from);
      if (to) summaryQuery = summaryQuery.lte('date', to);

      const { data: summaryData } = await summaryQuery;
      
      const summary = {
        total_income: 0,
        total_expense: 0,
        net_change: 0,
        transaction_count: data?.length || 0
      };

      summaryData?.forEach(tx => {
        if (tx.type === 'income') summary.total_income += tx.amount;
        else summary.total_expense += tx.amount;
      });
      summary.net_change = summary.total_income - summary.total_expense;

      return NextResponse.json({
        period: { from, to },
        summary,
        transactions: data
      });
    }

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
    const { amount, type, category_id, account_id, title, description, date } = body;
    
    // Use title if provided, otherwise fallback to description
    const transactionTitle = title || description;

    // Basic validation
    if (!amount || !type || !category_id || !account_id || !transactionTitle) {
      return NextResponse.json({ error: 'Missing required fields (amount, type, category_id, account_id, title/description)' }, { status: 400 });
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
        title: transactionTitle,
        date: date || new Date().toISOString().split('T')[0]
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
