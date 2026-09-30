import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../ui/Button';
import Card from '../ui/Card';
import ConfirmDialog from '../ui/ConfirmDialog';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { useTheme } from '../../theme';
import useExpenses from '../../hooks/useExpenses';
import type { CustomCategory, TxType } from '../../types';

export function CategoryForm() {
  const { addCategory } = useExpenses();
  const theme = useTheme();
  const [name, setName] = useState('');
  const [type, setType] = useState<TxType>('expense');
  const [error, setError] = useState<string | undefined>();

  const submit = () => {
    if (!name.trim()) {
      setError('Enter a category name.');
      return;
    }
    addCategory({ name: name.trim(), type });
    setName('');
    setError(undefined);
  };

  return (
    <Card>
      <Text style={[styles.h3, { color: theme.ink }]}>Add a custom category</Text>
      <Input label="Name" value={name} onChangeText={(v) => { setName(v); setError(undefined); }} error={error} />
      <Select
        label="Type"
        value={type}
        onChange={(v) => setType(v as TxType)}
        options={[
          { value: 'expense', label: 'Expense' },
          { value: 'income', label: 'Income' },
        ]}
      />
      <Button label="Add category" onPress={submit} />
    </Card>
  );
}

export function CategoryList() {
  const { categoriesFor, customCategories, removeCategory } = useExpenses();
  const theme = useTheme();
  const [target, setTarget] = useState<CustomCategory | null>(null);

  return (
    <View>
      {(['expense', 'income'] as TxType[]).map((type) => (
        <Card key={type}>
          <Text style={[styles.h3, { color: theme.ink }]}>
            {type === 'expense' ? 'Expense' : 'Income'} categories
          </Text>
          {categoriesFor(type).map((name) => {
            const isCustom = customCategories.some((c) => c.name === name && c.type === type);
            return (
              <View key={name} style={styles.between}>
                <Text style={[styles.name, { color: theme.ink }]}>{name}</Text>
                {isCustom ? (
                  <Button
                    label="Remove"
                    variant="ghost"
                    compact
                    onPress={() => setTarget({ name, type })}
                  />
                ) : null}
              </View>
            );
          })}
        </Card>
      ))}
      {target ? (
        <ConfirmDialog
          title={`Remove "${target.name}"?`}
          text="Existing transactions keep their category."
          confirmLabel="Remove"
          onConfirm={() => {
            removeCategory(target);
            setTarget(null);
          }}
          onCancel={() => setTarget(null)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  h3: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  between: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  name: { fontSize: 16, flexShrink: 1 },
});
