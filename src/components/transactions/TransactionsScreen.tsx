import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ScrollScreen } from '../../components/layout/Screen';
import Button from '../ui/Button';
import TransactionFilter from '../../components/transactions/TransactionFilter';
import TransactionList from '../../components/transactions/TransactionList';
import useExpenses from '../../hooks/useExpenses';
import { applyFilter, sortByDate } from '../../utils/calculations';
import { EMPTY_FILTERS, type Filters, type Transaction } from '../../types';

export default function Transactions() {
  const { transactions, categoriesFor, trash } = useExpenses();
  const router = useRouter();
  const [filters, setFilters] = useState<Filters>({ ...EMPTY_FILTERS });

  const categories = [...new Set([...categoriesFor('expense'), ...categoriesFor('income')])];
  const open = (t: Transaction) =>
    router.push({ pathname: '/transaction', params: { type: t.type, id: t.id } });

  return (
    <ScrollScreen>
      <View style={styles.trashRow}>
        <Button
          label={trash.length ? `Deleted (${trash.length})` : 'Deleted'}
          variant="ghost"
          compact
          onPress={() => router.push('/deleted')}
        />
      </View>
      <TransactionFilter
        filters={filters}
        onChange={setFilters}
        categories={categories}
        showType
      />
      <TransactionList
        items={applyFilter(sortByDate(transactions), filters)}
        onEdit={open}
        empty="No transactions match these filters."
      />
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  trashRow: { alignItems: 'flex-start', marginBottom: 10 },
});
