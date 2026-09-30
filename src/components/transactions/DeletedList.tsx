import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Button from '../ui/Button';
import Card from '../ui/Card';
import ConfirmDialog from '../ui/ConfirmDialog';
import { ScrollScreen } from '../layout/Screen';
import useExpenses from '../../hooks/useExpenses';
import { dateLabel, daysAgo, stampLabel } from '../../utils/dateUtils';
import { useTheme } from '../../theme';
import type { DeletedTransaction } from '../../types';

const relative = (iso: string): string => {
  const days = daysAgo(iso);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  return dateLabel(new Date(iso).toISOString().slice(0, 10));
};

function TrashRow({ entry }: { entry: DeletedTransaction }) {
  const { fmt, restore, destroy } = useExpenses();
  const theme = useTheme();
  const [confirming, setConfirming] = useState(false);
  const t = entry.transaction;
  const isIncome = t.type === 'income';

  return (
    <View>
      <View style={[styles.row, { borderBottomColor: theme.line }]}>
        <View style={styles.meta}>
          <Text numberOfLines={1} style={[styles.category, { color: theme.ink }]}>
            {t.category}
          </Text>
          <Text numberOfLines={1} style={[styles.sub, { color: theme.mute }]}>
            {dateLabel(t.date)}
            {t.note ? ` · ${t.note}` : ''}
          </Text>
          <Text style={[styles.stamp, { color: theme.mute }]}>
            Deleted {relative(entry.deletedAt)} · {stampLabel(entry.deletedAt)}
          </Text>
        </View>
        <Text style={[styles.amount, { color: isIncome ? theme.inc : theme.exp }]}>
          {isIncome ? '+' : '-'}
          {fmt(t.amount)}
        </Text>
      </View>

      <View style={styles.actions}>
        <Button label="Restore" compact onPress={() => restore(t.id)} style={styles.grow} />
        <Button
          label="Delete forever"
          variant="danger"
          compact
          onPress={() => setConfirming(true)}
          style={styles.grow}
        />
      </View>

      {confirming ? (
        <ConfirmDialog
          title="Delete forever?"
          text={`${t.category} of ${fmt(t.amount)} will be gone for good.`}
          confirmLabel="Delete"
          onConfirm={() => {
            destroy(t.id);
            setConfirming(false);
          }}
          onCancel={() => setConfirming(false)}
        />
      ) : null}
    </View>
  );
}

/** Recycle bin: everything deleted, newest first, restorable until emptied. */
export default function DeletedList() {
  const { trash, emptyTrash } = useExpenses();
  const theme = useTheme();
  const [confirming, setConfirming] = useState(false);

  if (!trash.length) {
    return (
      <ScrollScreen>
        <Card center>Nothing has been deleted yet.</Card>
      </ScrollScreen>
    );
  }

  return (
    <ScrollScreen>
      <Card small>
        Deleted items stay here until you empty the trash. Restoring puts a transaction back with
        its original amount, category and date.
      </Card>

      {trash.map((entry) => (
        <TrashRow key={entry.transaction.id} entry={entry} />
      ))}

      <Pressable
        onPress={() => setConfirming(true)}
        accessibilityRole="button"
        accessibilityLabel="Empty trash"
        style={({ pressed }) => [styles.empty, { opacity: pressed ? 0.6 : 1 }]}
      >
        <Text style={[styles.emptyLabel, { color: theme.exp }]}>Empty trash</Text>
      </Pressable>

      {confirming ? (
        <ConfirmDialog
          title="Empty the trash?"
          text={`${trash.length} deleted ${trash.length === 1 ? 'transaction' : 'transactions'} will be gone for good.`}
          confirmLabel="Empty"
          onConfirm={() => {
            emptyTrash();
            setConfirming(false);
          }}
          onCancel={() => setConfirming(false)}
        />
      ) : null}
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  meta: { flex: 1, minWidth: 0 },
  category: { fontSize: 16, fontWeight: '600' },
  sub: { fontSize: 13, marginTop: 2 },
  stamp: { fontSize: 12, marginTop: 3 },
  amount: { fontSize: 16, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 8, marginVertical: 10 },
  grow: { flex: 1 },
  empty: { alignItems: 'center', paddingVertical: 14 },
  emptyLabel: { fontSize: 15, fontWeight: '700' },
});