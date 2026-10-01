import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Button from '../ui/Button';
import ConfirmDialog from '../ui/ConfirmDialog';
import DateField from '../ui/DateField';
import Input from '../ui/Input';
import Select from '../ui/Select';
import useExpenses from '../../hooks/useExpenses';
import { validate } from '../../services/expenseService';
import { today } from '../../utils/dateUtils';
import type { Transaction, TxDraft, TxErrors, TxType } from '../../types';

const blank = (type: TxType): TxDraft => ({
  type,
  amount: '',
  category: '',
  date: today(),
  note: '',
});

const toDraft = (t: Transaction): TxDraft => ({
  type: t.type,
  amount: String(t.amount),
  category: t.category,
  date: t.date,
  note: t.note ?? '',
});

/** Shared add/edit form for both income and expenses. */
export default function TransactionForm({
  type = 'expense',
  initial,
  onDone,
}: {
  type?: TxType;
  initial?: Transaction;
  onDone: () => void;
}) {
  const { add, update, remove, categoriesFor } = useExpenses();
  const [form, setForm] = useState<TxDraft>(() => (initial ? toDraft(initial) : blank(type)));
  const [errors, setErrors] = useState<TxErrors>({});
  const [confirming, setConfirming] = useState(false);

  const set = <K extends keyof TxDraft>(key: K, value: TxDraft[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = () => {
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    if (initial) update(initial.id, form);
    else add(form);
    onDone();
  };

  return (
    <View>
      <Input
        label="Amount"
        value={form.amount}
        onChangeText={(v) => set('amount', v.replace(/[^0-9.]/g, ''))}
        keyboardType="decimal-pad"
        placeholder="0.00"
        error={errors.amount}
        autoFocus={!initial}
      />
      <Select
        label="Category"
        value={form.category}
        onChange={(v) => set('category', v)}
        options={[{ value: '', label: 'Choose a category' }, ...categoriesFor(type)]}
        error={errors.category}
      />
      <DateField
        label="Date"
        value={form.date}
        onChange={(v) => set('date', v)}
        error={errors.date}
      />
      <Input
        label="Note (optional)"
        value={form.note}
        onChangeText={(v) => set('note', v)}
        maxLength={80}
        autoCapitalize="sentences"
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      <View style={styles.actions}>
        <Button label={initial ? 'Save changes' : `Add ${type}`} onPress={submit} style={styles.grow} />
        {initial ? (
          <Button label="Delete" variant="danger" onPress={() => setConfirming(true)} style={styles.grow} />
        ) : null}
      </View>
      {confirming && initial ? (
        <ConfirmDialog
          title="Delete this transaction?"
          text="It moves to Deleted, where you can restore it or delete it for good."
          confirmLabel="Delete"
          onConfirm={() => {
            remove(initial.id);
            onDone();
          }}
          onCancel={() => setConfirming(false)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  grow: { flex: 1 },
});
