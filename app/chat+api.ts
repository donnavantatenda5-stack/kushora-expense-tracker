// Runs only on the server, so process.env here never reaches the app bundle.
// Without ANTHROPIC_API_KEY the route reports 503 and the app falls back to
// its offline answers.
const SYSTEM = `You are the in-app assistant of "Kushora", a personal expense tracker app.
Help ONLY with: (1) the user's own money using the DATA provided, (2) how to use the app, (3) short budgeting tips linked to their data.
App guide: tabs are Dashboard, Transactions, Expenses, Income, Categories, Reports, Assistant, Settings. Add with the "+ Income" / "+ Expense" buttons in the header (amount above zero, choose a category and a date, note optional). Tap a transaction to edit or delete it (delete asks for confirmation). Transactions/Expenses/Income have search and category filters plus "Clear filters". Categories adds or removes custom categories. Reports shows a 6-month chart and category breakdowns. Currency is changed in Settings. Data is stored on the device only.
Rules: use only the data provided, never invent numbers, say so if the data cannot answer. Separate calculated facts from general suggestions. This is not professional financial advice. If the question is unrelated to this app or the user's finances, politely say you can only help with the expense tracker. Reply in plain text under 120 words, no markdown.`;

interface IncomingMessage {
  role?: string;
  content?: string;
}

export async function POST(request: Request): Promise<Response> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return Response.json({ error: 'AI key not configured on the server.' }, { status: 503 });
  }

  let body: { question?: string; history?: IncomingMessage[]; context?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { question, history = [], context = {} } = body;
  if (!question || typeof question !== 'string') {
    return Response.json({ error: 'Missing question.' }, { status: 400 });
  }

  const messages = [
    ...history
      .slice(-10)
      .filter((m) => m && m.content)
      .map((m) => ({
        role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
        content: String(m.content).slice(0, 2000),
      })),
    { role: 'user' as const, content: question.slice(0, 1000) },
  ];

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
        max_tokens: 400,
        system: `${SYSTEM}\nDATA: ${JSON.stringify(context).slice(0, 20000)}`,
        messages,
      }),
    });

    const data = (await r.json()) as {
      content?: { type: string; text: string }[];
      error?: { message?: string };
    };
    if (!r.ok) {
      return Response.json(
        { error: data?.error?.message || 'AI request failed.' },
        { status: 502 },
      );
    }

    const reply = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim();
    return Response.json({ reply });
  } catch {
    return Response.json({ error: 'Could not reach the AI service.' }, { status: 502 });
  }
}
