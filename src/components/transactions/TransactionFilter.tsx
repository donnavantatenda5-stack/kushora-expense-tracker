import { StyleSheet, View } from 'react-native';
import Button from '../ui/Button';
import SearchBar from '../ui/SearchBar';
import Select from '../ui/Select';
import { EMPTY_FILTERS, type Filters } from '../../types';

export default function TransactionFilter({
  filters,
  onChange,
  categories,
  showType,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
  categories: string[];
  showType?: boolean;
}) {
  const set = (key: keyof Filters) => (value: string) => onChange({ ...filters, [key]: value });

  return (
    <View style={styles.wrap}>
      <SearchBar
        value={filters.q}
        onChangeText={set('q')}
        placeholder="Search notes or category"
      />
      <View style={styles.row}>
        {showType ? (
          <View style={styles.col}>
            <Select
              label="Type"
              value={filters.type}
              onChange={set('type')}
              options={[
                { value: '', label: 'All types' },
                { value: 'income', label: 'Income' },
                { value: 'expense', label: 'Expense' },
              ]}
            />
          </View>
        ) : null}
        <View style={styles.col}>
          <Select
            label="Category"
            value={filters.cat}
            onChange={set('cat')}
            options={[{ value: '', label: 'All categories' }, ...categories]}
          />
        </View>
      </View>
      <View style={styles.clear}>
        <Button label="Clear filters" variant="ghost" onPress={() => onChange({ ...EMPTY_FILTERS })} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 4 },
  row: { flexDirection: 'row', gap: 10 },
  col: { flex: 1 },
  clear: { alignItems: 'flex-start' },
});
