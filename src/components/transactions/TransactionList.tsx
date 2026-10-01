import { View } from 'react-native';
import Card from '../ui/Card';
import TransactionItem from './TransactionItem';
import type { Transaction } from '../../types';

export default function TransactionList({
  items,
  onEdit,
  empty = 'No transactions found.',
}: {
  items: Transaction[];
  onEdit: (t: Transaction) => void;
  empty?: string;
}) {
  if (!items.length) return <Card center>{empty}</Card>;
  return (
    <View>
      {items.map((t) => (
        <TransactionItem key={t.id} t={t} onEdit={onEdit} />
      ))}
    </View>
  );
}
