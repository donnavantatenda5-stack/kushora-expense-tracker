import { StyleSheet, Text, View } from 'react-native';
import Card from '../ui/Card';
import useExpenses from '../../hooks/useExpenses';
import { useTheme } from '../../theme';
import type { CategoryTotal } from '../../types';

export default function CategoryChart({
  data,
  title = 'Spending by category',
  color = 'exp',
}: {
  data: CategoryTotal[];
  title?: string;
  color?: 'exp' | 'inc';
}) {
  const { fmt } = useExpenses();
  const theme = useTheme();
  const max = Math.max(1, ...data.map((d) => d.value));
  const fill = color === 'inc' ? theme.inc : theme.exp;

  return (
    <Card>
      <Text style={[styles.title, { color: theme.ink }]}>{title}</Text>
      {data.length ? (
        data.map((d) => (
          <View key={d.name}>
            <View style={styles.between}>
              <Text numberOfLines={1} style={[styles.name, { color: theme.ink }]}>
                {d.name}
              </Text>
              <Text style={[styles.value, { color: theme.ink }]}>{fmt(d.value)}</Text>
            </View>
            <View style={[styles.track, { backgroundColor: theme.line }]}>
              <View style={[styles.fill, { backgroundColor: fill, width: `${(d.value / max) * 100}%` }]} />
            </View>
          </View>
        ))
      ) : (
        <Text style={{ color: theme.mute, fontSize: 15 }}>No data yet.</Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  between: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  name: { fontSize: 15, flexShrink: 1 },
  value: { fontSize: 15, fontWeight: '700' },
  track: { height: 10, borderRadius: 5, overflow: 'hidden', marginTop: 4, marginBottom: 8 },
  fill: { height: '100%' },
});
