import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ScrollScreen } from '../layout/Screen';
import TransactionFilter from '../transactions/TransactionFilter';
import TransactionList from '../transactions/TransactionList';
import useExpenses from '../../hooks/useExpenses';
import { applyFilter, sortByDate } from '../../utils/calculations';
import { EMPTY_FILTERS, type Filters, type Transaction, type TxType } from '../../types';

/** Expenses and Income screens are identical apart from the type they show. */
export function TypeList({ type, empty }: { type: TxType; empty: string }) {
  const { transactions, categoriesFor } = useExpenses();
  const router = useRouter();
  const [filters, setFilters] = useState<Filters>({ ...EMPTY_FILTERS });

  const items = applyFilter(
    sortByDate(transactions.filter((t) => t.type === type)),
    filters,
  );
  const open = (t: Transaction) =>
    router.push({ pathname: '/transaction', params: { type: t.type, id: t.id } });

  return (
    <ScrollScreen>
      <TransactionFilter filters={filters} onChange={setFilters} categories={categoriesFor(type)} />
      <TransactionList items={items} onEdit={open} empty={empty} />
    </ScrollScreen>
  );
}

export function Expenses() {
  return <TypeList type="expense" empty="No expenses found." />;
}

export function Income() {
  return <TypeList type="income" empty="No income found." />;
}
