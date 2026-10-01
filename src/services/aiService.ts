import { byCategory, lastMonth, sortByDate, thisMonth, totals } from '../utils/calculations';
import { EXPENSE_CATEGORIES } from '../data/categories';
import { today } from '../utils/dateUtils';
import type { Transaction } from '../types';

/** Minimal data sent to the AI route: totals and stripped transactions only. */
export const buildContext = (transactions: Transaction[], currency: string) => ({
  currency,
  today: today(),
  allTime: totals(transactions),
  thisMonth: totals(thisMonth(transactions)),
  thisMonthExpensesByCategory: byCategory(
    thisMonth(transactions).filter((t) => t.type === 'expense'),
  ),
  transactions: sortByDate(transactions)
    .slice(0, 60)
    .map(({ type, amount, category, date, note }) => ({ type, amount, category, date, note })),
});

export interface LocalAnswer {
  t: string;
  n?: string;
}

/** Offline answers, used when the AI route is unreachable. Saved data only. */
export function localAnswer(q: string, tx: Transaction[], fmt: (n: number) => string): LocalAnswer | null {
  const l = q.toLowerCase();
  const per = /last month/.test(l) ? 'last' : /all|ever|total/.test(l) ? 'all' : 'month';
  const lab = per === 'month' ? 'this month' : per === 'last' ? 'last month' : 'across all time';
  const list = per === 'all' ? tx : per === 'last' ? tx.filter((t) => t.date.slice(0, 7) === lastMonth()) : thisMonth(tx);
  const s = totals(list);
  const cats = byCategory(list.filter((t) => t.type === 'expense'));
  const calc = 'Calculated from your data.';

  if (/idea|reduce|cut|tip/.test(l)) {
    const top = cats[0];
    return {
      t: `${top ? `Your largest category ${lab} is ${top.name} (${fmt(top.value)}). ` : ''}Ideas:\n- Set a weekly limit for your top category.\n- Review subscriptions you rarely use.\n- Plan purchases before shopping.`,
      n: 'General suggestion, not financial advice.',
    };
  }
  if (/balance|left/.test(l) && !/spend|spent/.test(l)) {
    return { t: `Your current balance is ${fmt(totals(tx).balance)}.`, n: calc };
  }

  const cat = EXPENSE_CATEGORIES.find((c) => c !== 'Other' && l.includes(c.toLowerCase()));
  if (cat) {
    return { t: `You spent ${fmt(cats.find((c) => c.name === cat)?.value ?? 0)} on ${cat} ${lab}.`, n: calc };
  }

  if (/biggest|largest/.test(l)) {
    const e = list
      .filter((t) => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
    return e.length
      ? {
          t: `Your biggest expenses ${lab}:\n${e
            .map((t) => `- ${t.category}: ${fmt(t.amount)} (${t.date})`)
            .join('\n')}`,
          n: calc,
        }
      : { t: `I found no expenses ${lab}.` };
  }

  if (/most|category|categories/.test(l)) {
    return cats.length
      ? { t: `You spend the most on ${cats[0]!.name}: ${fmt(cats[0]!.value)} ${lab}.`, n: calc }
      : { t: `No expenses ${lab}, so I can't name a top category.` };
  }
  if (/compare|vs|versus/.test(l)) {
    return {
      t: `Income ${lab}: ${fmt(s.income)}\nExpenses ${lab}: ${fmt(s.expense)}\nSavings: ${fmt(s.balance)}`,
      n: calc,
    };
  }
  if (/income|earn|receive/.test(l)) return { t: `You received ${fmt(s.income)} in income ${lab}.`, n: calc };
  if (/spend|spent|expense/.test(l)) return { t: `You spent ${fmt(s.expense)} ${lab}.`, n: calc };
  return null;
}

export interface AssistantReply {
  text: string;
  note?: string;
}

/** Tries the AI route first, then falls back to the offline answers. */
export async function askAssistant({
  question,
  history,
  transactions,
  currency,
  fmt,
}: {
  question: string;
  history: { role: string; content: string }[];
  transactions: Transaction[];
  currency: string;
  fmt: (n: number) => string;
}): Promise<AssistantReply> {
  try {
    const r = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, history, context: buildContext(transactions, currency) }),
    });
    if (r.ok) {
      const d = (await r.json()) as { reply?: string };
      if (d.reply) return { text: d.reply, note: 'AI-generated, may be imperfect.' };
    }
  } catch {
    // No server reachable (or no key configured): use the offline answers.
  }
  const local = localAnswer(question, transactions, fmt);
  if (local) return { text: local.t, note: local.n };
  throw new Error('No answer available');
}
