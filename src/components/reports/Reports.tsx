import CategoryChart from '../charts/CategoryChart';
import MonthChart from '../charts/MonthChart';
import { ScrollScreen } from '../layout/Screen';
import useExpenses from '../../hooks/useExpenses';
import { byCategory } from '../../utils/calculations';

export default function Reports() {
  const { transactions } = useExpenses();

  return (
    <ScrollScreen>
      <MonthChart />
      <CategoryChart
        data={byCategory(transactions.filter((t) => t.type === 'expense'))}
        title="Spending by category"
      />
      <CategoryChart
        data={byCategory(transactions.filter((t) => t.type === 'income'))}
        title="Income by source"
        color="inc"
      />
    </ScrollScreen>
  );
}
