import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import CategoryChart from '../charts/CategoryChart';
import TransactionList from '../transactions/TransactionList';
import { ScrollScreen } from '../layout/Screen';
import { BalanceCard, ExpenseCard, IncomeCard } from './StatCards';
import Greeting from './Greeting';
import { useTheme } from '../../theme';
import useExpenses from '../../hooks/useExpenses';
import { byCategory, sortByDate, thisMonth, totals } from '../../utils/calculations';
import type { Transaction } from '../../types';

export default function Dashboard() {
  const { transactions } = useExpenses();
  const theme = useTheme();
  const router = useRouter();

  const open = (t: Transaction) =>
    router.push({ pathname: '/transaction', params: { type: t.type, id: t.id } });

  const all = totals(transactions);
  const month = thisMonth(transactions);
  const monthTotals = totals(month);

  return (
    <ScrollScreen>
      <Greeting />
      <BalanceCard value={all.balance} />
      <View style={styles.row}>
        <IncomeCard value={monthTotals.income} />
        <ExpenseCard value={monthTotals.expense} />
      </View>
      <CategoryChart
        data={byCategory(month.filter((t) => t.type === 'expense'))}
        title="Spending this month"
      />
      <Text style={[styles.h2, { color: theme.ink }]}>Recent transactions</Text>
      <TransactionList
        items={sortByDate(transactions).slice(0, 5)}
        onEdit={open}
        empty="No transactions yet. Add your first income or expense."
      />
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  h2: { fontSize: 18, fontWeight: '700', marginTop: 6, marginBottom: 2 },
});
