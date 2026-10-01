import { Stack, useRouter } from 'expo-router';
import HeaderButton from '@/components/ui/HeaderButton';
import ChangePasswordForm from '@/components/settings/ChangePasswordForm';

export default function ChangePasswordScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Change password',
          // The root stack hides headers, so this has to opt back in for the
          // native header to apply the status bar inset.
          headerShown: true,
          headerLeft: () => <HeaderButton label="Close" onPress={() => router.back()} />,
        }}
      />
      <ChangePasswordForm />
    </>
  );
}
