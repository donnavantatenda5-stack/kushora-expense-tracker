import type { Transaction, TxDraft, TxErrors, TxType } from '../types';

export const newTransaction = (data: TxDraft & { type: TxType }): Transaction => ({
  id: `t${Date.now()}${Math.random().toString(36).slice(2, 7)}`,
  type: data.type,
  amount: Number(data.amount),
  category: data.category,
  date: data.date,
  note: data.note.trim() || undefined,
  createdAt: new Date().toISOString(),
});

export const validate = (data: TxDraft): TxErrors => {
  const errors: TxErrors = {};
  if (!(Number(data.amount) > 0)) errors.amount = 'Enter an amount greater than zero.';
  if (!data.category) errors.category = 'Choose a category.';
  if (!data.date || Number.isNaN(new Date(data.date).getTime())) errors.date = 'Pick a valid date.';
  return errors;
};
