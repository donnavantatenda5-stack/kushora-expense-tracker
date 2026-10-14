import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import DateField from '@/components/ui/DateField';
import Input from '@/components/ui/Input';
import Logo from '@/components/ui/Logo';
import { useAuth } from '@/context/AuthContext';
import { useExpenseContext } from '@/context/ExpenseContext';
import { useTheme } from '@/theme';

export default function SignInScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { signIn, signUp, resetPassword, resetAccount } = useAuth();
  const { clearAll } = useExpenseContext();

  const [mode, setMode] = useState<'in' | 'up' | 'reset'>('in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const swap = () => {
    setMode((m) => (m === 'in' ? 'up' : m === 'up' ? 'reset' : 'in'));
    setError(undefined);
  };

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError(undefined);

    let message: string | null;
    const authBirthday = birthday
      ? `${birthday.slice(5, 7)}/${birthday.slice(8, 10)}/${birthday.slice(0, 4)}`
      : '';
    if (mode === 'in') {
      message = await signIn(email, password);
    } else if (mode === 'up') {
      message = await signUp(name, email, password, authBirthday);
    } else {
      message = await resetPassword(name, authBirthday, password);
    }

    setError(message ?? undefined);
    setBusy(false);
    if (!message) {
      setName('');
      setEmail('');
      setBirthday('');
      setPassword('');
    }
  };

  const resetApp = async () => {
    if (busy) return;
    setBusy(true);
    setError(undefined);
    try {
      await resetAccount();
      clearAll();
      t.setName('white');
      setName('');
      setEmail('');
      setBirthday('');
      setPassword('');
      setMode('up');
      setConfirmReset(false);
    } catch {
      setError('Could not reset the app on this device.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false, animation: 'fade' }} />
      <KeyboardAvoidingView
        style={[styles.root, { backgroundColor: t.bg }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.brand}>
            <Logo size={64} />
            <Text style={[styles.wordmark, { color: t.ink }]}>Kushora</Text>
            <Text style={[styles.tagline, { color: t.mute }]}>Track your money, simply.</Text>
          </View>

          <View style={[styles.card, { backgroundColor: t.card, borderColor: t.line }]}>
            <Text style={[styles.title, { color: t.ink }]}>
              {mode === 'in'
                ? 'Sign in'
                : mode === 'up'
                  ? 'Create your account'
                  : 'Reset your password'}
            </Text>

            {(mode === 'up' || mode === 'reset') ? (
              <Input
                label="Name"
                value={name}
                onChangeText={setName}
                placeholder={mode === 'up' ? 'How should we greet you?' : 'Your full name'}
                autoCapitalize="words"
                autoComplete="name"
                returnKeyType="next"
              />
            ) : null}

            {mode !== 'reset' ? (
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoComplete="email"
                returnKeyType="next"
              />
            ) : null}

            {(mode === 'up' || mode === 'reset') ? (
              <DateField
                label="Birthday"
                value={birthday}
                onChange={setBirthday}
                placeholder="Select your birthday"
              />
            ) : null}

            <Input
              label={mode === 'reset' ? 'New password' : 'Password'}
              value={password}
              onChangeText={setPassword}
              placeholder={
                mode === 'up'
                  ? 'At least 6 characters'
                  : mode === 'reset'
                    ? 'Choose a new password'
                    : 'Your password'
              }
              secureTextEntry
              autoComplete={mode === 'up' ? 'new-password' : mode === 'reset' ? 'new-password' : 'current-password'}
              returnKeyType="go"
              onSubmitEditing={submit}
              error={error}
            />

            <Button
              label={mode === 'in' ? 'Sign in' : mode === 'up' ? 'Create account' : 'Update password'}
              onPress={submit}
              disabled={busy}
            />

            {mode === 'reset' ? (
              <Button
                label="Reset app and start over"
                variant="danger"
                onPress={() => setConfirmReset(true)}
                disabled={busy}
              />
            ) : null}

            <View style={styles.switchRow}>
              <Text style={[styles.switchText, { color: t.mute }]}>
                {mode === 'in' ? 'No account yet?' : mode === 'up' ? 'Already have an account?' : 'Remembered it?'}
              </Text>
              <Button
                label={mode === 'in' ? 'Create one' : mode === 'up' ? 'Sign in' : 'Back to sign in'}
                variant="ghost"
                onPress={swap}
              />
            </View>

            {mode !== 'reset' ? (
              <Button
                label="Reset password"
                variant="ghost"
                compact
                onPress={() => {
                  setMode('reset');
                  setError(undefined);
                }}
              />
            ) : null}
          </View>

          <Text style={[styles.foot, { color: t.mute }]}>
            Your account and transactions stay on this device only.
          </Text>
          {confirmReset ? (
            <ConfirmDialog
              title="Reset this app?"
              text="This deletes the saved account, transactions, categories, and preferences from this device. You can then create a new account."
              confirmLabel="Delete all data"
              onConfirm={resetApp}
              onCancel={() => setConfirmReset(false)}
            />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, gap: 20 },
  brand: { alignItems: 'center', gap: 6 },
  wordmark: { fontSize: 28, fontWeight: '800' },
  tagline: { fontSize: 15 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  switchText: { fontSize: 14 },
  foot: { fontSize: 13, textAlign: 'center' },
});