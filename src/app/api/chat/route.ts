import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { messages, accessToken } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;
    const apiUrl = process.env.OPENAI_URL;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!apiKey || !apiUrl || !supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Configuration missing' },
        { status: 500 }
      );
    }

    // Create a Supabase client with the user's access token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    // Prepare system message to give context to the AI
    const systemMessage = {
      role: 'system',
      content: `You are Illyas Finance AI, a helpful financial assistant for the Illyas Finance Tracker app. 
      You help users manage their finances, explain financial concepts, and provide insights. 
      Keep your answers concise, professional, and friendly. 
      The user is currently using the app which features accounts, categories, and transaction tracking.
      
      You have access to the user's financial data via tools. Always use these tools to provide accurate information about the user's balance, transactions, and accounts before answering questions related to their data.`
    };

    const tools = [
      {
        type: 'function',
        function: {
          name: 'get_financial_summary',
          description: 'Get a summary of the user\'s financial status including total balance, accounts, and recent transactions',
          parameters: {
            type: 'object',
            properties: {},
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'create_transaction',
          description: 'Create a new financial transaction (income or expense)',
          parameters: {
            type: 'object',
            properties: {
              amount: { type: 'number', description: 'The amount of the transaction' },
              type: { type: 'string', enum: ['income', 'expense'], description: 'The type of transaction' },
              description: { type: 'string', description: 'What the transaction was for' },
              category_id: { type: 'string', description: 'The ID of the category' },
              account_id: { type: 'string', description: 'The ID of the account' },
              date: { type: 'string', format: 'date', description: 'The date of the transaction (YYYY-MM-DD)' },
            },
            required: ['amount', 'type', 'description', 'account_id', 'date'],
          },
        },
      }
    ];

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [systemMessage, ...messages],
        max_tokens: 500,
        temperature: 0.7,
        tools: tools,
        tool_choice: 'auto',
      }),
    });

    let data = await response.json();
    console.log('AI Provider Initial Response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || 'Failed to fetch from AI' },
        { status: response.status }
      );
    }

    const message = data.choices[0].message;

    // Handle tool calls
    if (message.tool_calls) {
      const toolCall = message.tool_calls[0];
      if (toolCall.function.name === 'get_financial_summary') {
        // Fetch real data from Supabase
        const { data: accounts } = await supabase
          .from('accounts')
          .select('*')
          .order('name');
        
        const { data: categories } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        const { data: transactions } = await supabase
          .from('transactions')
          .select('*, accounts(name)')
          .order('date', { ascending: false })
          .limit(10);

        const summary = {
          accounts: accounts || [],
          categories: categories || [],
          recent_transactions: transactions || [],
          total_balance: accounts?.reduce((acc: number, curr: any) => acc + curr.balance, 0) || 0
        };

        // Second call to AI with tool results
        const secondResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey.trim()}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              systemMessage,
              ...messages,
              message,
              {
                role: 'tool',
                tool_call_id: toolCall.id,
                name: 'get_financial_summary',
                content: JSON.stringify(summary),
              },
            ],
            max_tokens: 500,
            temperature: 0.7,
          }),
        });

        const secondData = await secondResponse.json();
        return NextResponse.json(secondData.choices[0].message);
      } else if (toolCall.function.name === 'create_transaction') {
        const args = JSON.parse(toolCall.function.arguments);
        
        // 1. Insert transaction
        const { data: transaction, error: txError } = await supabase
          .from('transactions')
          .insert([args])
          .select()
          .single();

        if (txError) {
          return NextResponse.json({ 
            role: 'assistant', 
            content: `Maaf, saya gagal membuat transaksi: ${txError.message}` 
          });
        }

        // 2. Update account balance
        const adjustment = args.type === 'income' ? args.amount : -args.amount;
        const { data: account } = await supabase
          .from('accounts')
          .select('balance')
          .eq('id', args.account_id)
          .single();

        if (account) {
          await supabase
            .from('accounts')
            .update({ balance: account.balance + adjustment })
            .eq('id', args.account_id);
        }

        // Second call to AI to confirm
        const secondResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey.trim()}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              systemMessage,
              ...messages,
              message,
              {
                role: 'tool',
                tool_call_id: toolCall.id,
                name: 'create_transaction',
                content: JSON.stringify({ success: true, transaction }),
              },
            ],
            max_tokens: 500,
            temperature: 0.7,
          }),
        });

        const secondData = await secondResponse.json();
        return NextResponse.json(secondData.choices[0].message);
      }
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
