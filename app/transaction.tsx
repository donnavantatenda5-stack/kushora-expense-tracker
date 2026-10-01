import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import HeaderButton from '@/components/ui/HeaderButton';
import TransactionForm from '@/components/transactions/TransactionForm';
import { ScrollScreen } from '@/components/layout/Screen';
import useExpenses from '@/hooks/useExpenses';
import { useTheme } from '@/theme';
import type { TxType } from '@/types';

export default function TransactionScreen() {
  const params = useLocalSearchParams<{ type?: string; id?: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { transactions } = useExpenses();

  const type: TxType = params.type === 'income' ? 'income' : 'expense';
  const initial = params.id ? transactions.find((t) => t.id === params.id) : undefined;
  const title = `${initial ? 'Edit' : 'Add'} ${initial?.type ?? type}`;

  return (
    <>
      <Stack.Screen
        options={{
          title,
          presentation: 'modal',
          // The root stack sets headerShown: false, so it has to be turned back
          // on here or the Cancel button never renders.
          headerShown: true,
          headerStyle: { backgroundColor: theme.bg },
          headerTintColor: theme.ink,
          headerLeft: () => <HeaderButton label="Cancel" onPress={() => router.back()} />,
        }}
      />
      <ScrollScreen>
        <TransactionForm
          type={initial?.type ?? type}
          initial={initial}
          onDone={() => router.back()}
        />
      </ScrollScreen>
    </>
  );
}
