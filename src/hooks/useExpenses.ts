import { useCallback } from 'react';
import { useExpenseContext } from '../context/ExpenseContext';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../data/categories';
import { formatCurrency } from '../utils/formatCurrency';
import type { ExpenseContextValue } from '../context/ExpenseContext';
import type { TxType } from '../types';

export default function useExpenses(): ExpenseContextValue & {
  categoriesFor: (type: TxType) => string[];
  fmt: (n: number) => string;
} {
  const ctx = useExpenseContext();

  const categoriesFor = useCallback(
    (type: TxType): string[] => {
      const base = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
      return [...base, ...ctx.customCategories.filter((c) => c.type === type).map((c) => c.name)];
    },
    [ctx.customCategories],
  );

  return {
    ...ctx,
    categoriesFor,
    fmt: (n: number) => formatCurrency(n, ctx.currency),
  };
}
