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
import Input from '@/components/ui/Input';
import Logo from '@/components/ui/Logo';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/theme';

export default function SignInScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const swap = () => {
    setMode((m) => (m === 'in' ? 'up' : 'in'));
    setError(undefined);
  };

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError(undefined);
    // The redirect in the root layout takes over once the status flips.
    const message =
      mode === 'in' ? await signIn(email, password) : await signUp(name, email, password);
    setError(message ?? undefined);
    setBusy(false);
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
              {mode === 'in' ? 'Sign in' : 'Create your account'}
            </Text>

            {mode === 'up' ? (
              <Input
                label="Name"
                value={name}
                onChangeText={setName}
                placeholder="How should we greet you?"
                autoCapitalize="words"
                autoComplete="name"
                returnKeyType="next"
              />
            ) : null}

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoComplete="email"
              returnKeyType="next"
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder={mode === 'up' ? 'At least 6 characters' : 'Your password'}
              secureTextEntry
              autoComplete={mode === 'up' ? 'new-password' : 'current-password'}
              returnKeyType="go"
              onSubmitEditing={submit}
              error={error}
            />

            <Button
              label={mode === 'in' ? 'Sign in' : 'Create account'}
              onPress={submit}
              disabled={busy}
            />
            <View style={styles.switchRow}>
              <Text style={[styles.switchText, { color: t.mute }]}>
                {mode === 'in' ? 'No account yet?' : 'Already have an account?'}
              </Text>
              <Button label={mode === 'in' ? 'Create one' : 'Sign in'} variant="ghost" onPress={swap} />
            </View>
          </View>

          <Text style={[styles.foot, { color: t.mute }]}>
            Your account and transactions stay on this device only.
          </Text>
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  switchText: { fontSize: 14 },
  foot: { fontSize: 13, textAlign: 'center' },
});