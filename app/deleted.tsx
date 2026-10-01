import { Stack, useRouter } from 'expo-router';
import HeaderButton from '@/components/ui/HeaderButton';
import DeletedList from '@/components/transactions/DeletedList';

export default function DeletedScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Deleted',
          presentation: 'modal',
          // The root stack hides headers, so this has to opt back in for the
          // native header to apply the status bar inset.
          headerShown: true,
          headerLeft: () => <HeaderButton label="Close" onPress={() => router.back()} />,
        }}
      />
      <DeletedList />
    </>
  );
}