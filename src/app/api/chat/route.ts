import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;
    const apiUrl = process.env.OPENAI_URL;

    if (!apiKey || !apiUrl) {
      return NextResponse.json(
        { error: 'OpenAI configuration missing' },
        { status: 500 }
      );
    }

    // Prepare system message to give context to the AI
    const systemMessage = {
      role: 'system',
      content: `You are Illyas Finance AI, a helpful financial assistant for the Illyas Finance Tracker app. 
      You help users manage their finances, explain financial concepts, and provide insights. 
      Keep your answers concise, professional, and friendly. 
      The user is currently using the app which features accounts, categories, and transaction tracking.`
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [systemMessage, ...messages],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log('AI Provider Response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('OpenAI API Error:', data);
      return NextResponse.json(
        { error: data.error?.message || 'Failed to fetch from AI' },
        { status: response.status }
      );
    }

    return NextResponse.json(data.choices[0].message);
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
