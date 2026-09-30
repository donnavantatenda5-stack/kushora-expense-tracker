import type { CategoryTotal, Filters, Totals, Transaction } from '../types';

export const sum = (list: Transaction[]): number =>
  list.reduce((total, t) => total + t.amount, 0);

export const totals = (list: Transaction[]): Totals => {
  const income = sum(list.filter((t) => t.type === 'income'));
  const expense = sum(list.filter((t) => t.type === 'expense'));
  return { income, expense, balance: income - expense };
};

export const byCategory = (list: Transaction[]): CategoryTotal[] => {
  const map: Record<string, number> = {};
  for (const t of list) map[t.category] = (map[t.category] ?? 0) + t.amount;
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

export const sortByDate = (list: Transaction[]): Transaction[] =>
  [...list].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
  );

export const applyFilter = (list: Transaction[], f: Filters): Transaction[] =>
  list.filter(
    (t) =>
      (!f.type || t.type === f.type) &&
      (!f.cat || t.category === f.cat) &&
      (!f.q || `${t.category} ${t.note ?? ''}`.toLowerCase().includes(f.q.toLowerCase())),
  );

export const inMonth = (list: Transaction[], month: string): Transaction[] =>
  list.filter((t) => t.date.slice(0, 7) === month);

export const thisMonth = (list: Transaction[]): Transaction[] => {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return inMonth(list, month);
};

export const lastMonth = (): string => {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
