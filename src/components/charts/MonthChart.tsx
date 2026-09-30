import { StyleSheet, Text, View } from 'react-native';
import Card from '../ui/Card';
import useExpenses from '../../hooks/useExpenses';
import { useTheme } from '../../theme';
import { inMonth, totals } from '../../utils/calculations';
import { lastMonths, monthLabel } from '../../utils/dateUtils';

/** Income vs expenses per month, drawn with plain views. */
export default function MonthChart() {
  const { transactions, fmt } = useExpenses();
  const theme = useTheme();

  const data = lastMonths(6).map((m) => ({ m, ...totals(inMonth(transactions, m)) }));
  const max = Math.max(1, ...data.map((x) => Math.max(x.income, x.expense)));

  return (
    <Card>
      <Text style={[styles.title, { color: theme.ink }]}>Income vs expenses, last 6 months</Text>
      <View style={styles.cols}>
        {data.map((x) => (
          <View
            key={x.m}
            style={styles.col}
            accessible
            accessibilityLabel={`${monthLabel(x.m)}: ${fmt(x.income)} in, ${fmt(x.expense)} out`}
          >
            <View style={styles.pair}>
              <View
                style={[
                  styles.bar,
                  { backgroundColor: theme.inc, height: `${Math.max(2, (x.income / max) * 100)}%` },
                ]}
              />
              <View
                style={[
                  styles.bar,
                  { backgroundColor: theme.exp, height: `${Math.max(2, (x.expense / max) * 100)}%` },
                ]}
              />
            </View>
            <Text style={[styles.label, { color: theme.mute }]}>{monthLabel(x.m)}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  cols: { flexDirection: 'row', gap: 10, height: 150, alignItems: 'flex-end' },
  col: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end' },
  pair: { flex: 1, flexDirection: 'row', gap: 3, alignItems: 'flex-end' },
  bar: { flex: 1, minHeight: 2, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  label: { fontSize: 12, marginTop: 4 },
});
