import { StyleSheet, Text, View } from 'react-native';
import Card from '../ui/Card';
import { useTheme } from '../../theme';
import useExpenses from '../../hooks/useExpenses';

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'ink' | 'inc' | 'exp';
}) {
  const { fmt } = useExpenses();
  const theme = useTheme();
  return (
    <Card style={styles.card}>
      <Text style={[styles.label, { color: theme.mute }]}>{label}</Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={[
          styles.value,
          { color: tone === 'inc' ? theme.inc : tone === 'exp' ? theme.exp : theme.ink },
        ]}
      >
        {fmt(value)}
      </Text>
    </Card>
  );
}

export function BalanceCard({ value }: { value: number }) {
  const { fmt } = useExpenses();
  const theme = useTheme();
  return (
    <Card>
      <Text style={[styles.label, { color: theme.mute }]}>Total balance</Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={[styles.balance, { color: theme.ink }]}
      >
        {fmt(value)}
      </Text>
    </Card>
  );
}

export function IncomeCard({ value }: { value: number }) {
  return <Stat label="Income this month" value={value} tone="inc" />;
}

export function ExpenseCard({ value }: { value: number }) {
  return <Stat label="Expenses this month" value={value} tone="exp" />;
}

const styles = StyleSheet.create({
  card: { flex: 1 },
  label: { fontSize: 13, marginBottom: 4 },
  value: { fontSize: 20, fontWeight: '700' },
  balance: { fontSize: 38, fontWeight: '800' },
});
