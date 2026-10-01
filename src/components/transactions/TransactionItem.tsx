import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import { dateLabel } from '../../utils/dateUtils';
import useExpenses from '../../hooks/useExpenses';
import type { Transaction } from '../../types';

export default function TransactionItem({
  t,
  onEdit,
}: {
  t: Transaction;
  onEdit: (t: Transaction) => void;
}) {
  const { fmt } = useExpenses();
  const theme = useTheme();
  const isIncome = t.type === 'income';

  return (
    <Pressable
      onPress={() => onEdit(t)}
      accessibilityRole="button"
      accessibilityLabel={`Edit ${t.category} ${fmt(t.amount)}`}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: theme.line, opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <View style={styles.meta}>
        <Text numberOfLines={1} style={[styles.category, { color: theme.ink }]}>
          {t.category}
        </Text>
        <Text numberOfLines={1} style={[styles.sub, { color: theme.mute }]}>
          {dateLabel(t.date)}
          {t.note ? ` · ${t.note}` : ''}
        </Text>
      </View>
      <Text style={[styles.amount, { color: isIncome ? theme.inc : theme.exp }]}>
        {isIncome ? '+' : '-'}
        {fmt(t.amount)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    minHeight: 56,
  },
  meta: { flex: 1, minWidth: 0 },
  category: { fontSize: 16, fontWeight: '600' },
  sub: { fontSize: 13, marginTop: 2 },
  amount: { fontSize: 16, fontWeight: '700' },
});
