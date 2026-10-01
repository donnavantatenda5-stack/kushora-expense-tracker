import type { Transaction, TxType } from '../types';
import { localDate } from '../utils/dateUtils';

const daysAgo = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return localDate(d);
};

const make = (
  i: number,
  type: TxType,
  amount: number,
  category: string,
  days: number,
  note: string,
): Transaction => ({
  id: `s${i}`,
  type,
  amount,
  category,
  date: daysAgo(days),
  note,
  createdAt: new Date().toISOString(),
});

const sampleData: Transaction[] = [
  make(1, 'income', 1200, 'Salary', 2, 'Monthly pay'),
  make(2, 'expense', 85, 'Food', 1, 'Groceries'),
  make(3, 'expense', 24, 'Transport', 3, 'Kombi fares'),
  make(4, 'expense', 300, 'Housing', 5, 'Rent share'),
  make(5, 'income', 150, 'Freelance', 8, 'Website fix'),
  make(6, 'expense', 40, 'Utilities', 6, 'Electricity'),
];

export default sampleData;
