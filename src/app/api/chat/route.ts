import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const { messages } = await req.json();
    const apiKey  = process.env.OPENAI_API_KEY;
    const apiUrl  = process.env.OPENAI_URL;

    if (!apiKey || !apiUrl) {
      return NextResponse.json({ error: 'Configuration missing' }, { status: 500 });
    }

    const systemMessage = {
      role: 'system',
      content: `You are Illyas Finance AI, a helpful financial assistant for the Illyas Finance Tracker app. 
      You help users manage their finances, explain financial concepts, and provide insights. 
      Keep your answers concise, professional, and friendly.`,
    };

    const tools = [
      {
        type: 'function',
        function: {
          name: 'get_financial_summary',
          description: "Get a summary of the user's financial status",
          parameters: { type: 'object', properties: {} },
        },
      },
      {
        type: 'function',
        function: {
          name: 'create_transaction',
          description: 'Create a new financial transaction',
          parameters: {
            type: 'object',
            properties: {
              amount:      { type: 'number' },
              type:        { type: 'string', enum: ['income', 'expense'] },
              description: { type: 'string' },
              category_id: { type: 'string' },
              account_id:  { type: 'string' },
              date:        { type: 'string', format: 'date' },
            },
            required: ['amount', 'type', 'description', 'account_id', 'date'],
          },
        },
      },
    ];

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey.trim()}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [systemMessage, ...messages],
        max_tokens: 500,
        temperature: 0.7,
        tools,
        tool_choice: 'auto',
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || 'AI error' }, { status: response.status });
    }

    const message = data.choices[0].message;

    if (message.tool_calls) {
      const toolCall = message.tool_calls[0];

      if (toolCall.function.name === 'get_financial_summary') {
        const accounts     = await query('SELECT * FROM accounts WHERE user_id=$1 ORDER BY name', [userId]);
        const categories   = await query('SELECT * FROM categories WHERE user_id=$1 ORDER BY name', [userId]);
        const transactions = await query(
          `SELECT t.*, a.name AS account_name FROM transactions t
           LEFT JOIN accounts a ON t.account_id=a.id
           WHERE t.user_id=$1 ORDER BY t.date DESC LIMIT 10`,
          [userId]
        );
        const totalBalance = accounts.rows.reduce((s: number, a: {balance: number}) => s + parseFloat(String(a.balance)), 0);

        const summary = {
          accounts: accounts.rows,
          categories: categories.rows,
          recent_transactions: transactions.rows,
          total_balance: totalBalance,
        };

        const second = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey.trim()}` },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [systemMessage, ...messages, message,
              { role: 'tool', tool_call_id: toolCall.id, name: 'get_financial_summary', content: JSON.stringify(summary) }],
            max_tokens: 500, temperature: 0.7,
          }),
        });
        const sd = await second.json();
        return NextResponse.json(sd.choices[0].message);
      }

      if (toolCall.function.name === 'create_transaction') {
        const args = JSON.parse(toolCall.function.arguments);
        const tx = await query(
          `INSERT INTO transactions (user_id, amount, type, category_id, account_id, title, date)
           VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
          [userId, args.amount, args.type, args.category_id, args.account_id, args.description,
           args.date || new Date().toISOString().split('T')[0]]
        );
        const adjustment = args.type === 'income' ? args.amount : -args.amount;
        await query('UPDATE accounts SET balance = balance + $1 WHERE id=$2', [adjustment, args.account_id]);

        const second = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey.trim()}` },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [systemMessage, ...messages, message,
              { role: 'tool', tool_call_id: toolCall.id, name: 'create_transaction',
                content: JSON.stringify({ success: true, transaction: tx.rows[0] }) }],
            max_tokens: 500, temperature: 0.7,
          }),
        });
        const sd = await second.json();
        return NextResponse.json(sd.choices[0].message);
      }
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
