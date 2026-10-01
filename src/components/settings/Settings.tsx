import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../ui/Button';
import Card from '../ui/Card';
import ConfirmDialog from '../ui/ConfirmDialog';
import Select from '../ui/Select';
import { ThemePicker } from '../ui/ThemeToggle';
import { ScrollScreen } from '../layout/Screen';
import { useTheme } from '../../theme';
import useExpenses from '../../hooks/useExpenses';
import { useAuth } from '../../context/AuthContext';

const CURRENCIES = ['USD', 'ZWG', 'ZAR', 'GBP', 'EUR'];

export default function Settings() {
  const { currency, setCurrency, reset } = useExpenses();
  const { account, signOut, resetAccount } = useAuth();
  const theme = useTheme();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [forgetting, setForgetting] = useState(false);

  return (
    <ScrollScreen>
      <Card>
        <Text style={[styles.label, { color: theme.mute }]}>Theme</Text>
        <ThemePicker />
        <Select
          label="Currency"
          value={currency}
          onChange={setCurrency}
          options={CURRENCIES.map((c) => ({ value: c, label: c }))}
        />
        <Text style={[styles.mute, { color: theme.mute }]}>Your data is saved on this device only.</Text>
        <Button label="Reset sample data" variant="danger" onPress={() => setConfirming(true)} />
      </Card>

      {account ? (
        <Card>
          <Text style={[styles.label, { color: theme.mute }]}>Account</Text>
          <Text style={[styles.who, { color: theme.ink }]}>{account.name}</Text>
          <Text style={[styles.mute, { color: theme.mute }]}>{account.email}</Text>
          <Button
            label="Change password"
            variant="ghost"
            onPress={() => router.push('/change-password')}
          />
          <Button label="Sign out" variant="ghost" onPress={() => setSigningOut(true)} />
          <Text style={[styles.foot, { color: theme.mute }]}>Forgot your password?</Text>
          <Button label="Reset account" variant="danger" onPress={() => setForgetting(true)} />
        </Card>
      ) : null}

      {confirming ? (
        <ConfirmDialog
          title="Reset sample data?"
          text="This replaces all your transactions with the sample data."
          confirmLabel="Reset"
          onConfirm={() => {
            reset();
            setConfirming(false);
          }}
          onCancel={() => setConfirming(false)}
        />
      ) : null}

      {signingOut ? (
        <ConfirmDialog
          title="Sign out?"
          text="You will need your email and password to get back in."
          confirmLabel="Sign out"
          cancelLabel="Stay"
          onConfirm={() => {
            setSigningOut(false);
            void signOut();
          }}
          onCancel={() => setSigningOut(false)}
        />
      ) : null}

      {forgetting ? (
        <ConfirmDialog
          title="Reset your account?"
          text="Your password cannot be recovered, so the account is removed and you create a new one with the same email. Your transactions and categories are kept."
          confirmLabel="Reset"
          cancelLabel="Cancel"
          onConfirm={() => {
            setForgetting(false);
            void resetAccount();
          }}
          onCancel={() => setForgetting(false)}
        />
      ) : null}
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, marginBottom: 6 },
  who: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
  mute: { fontSize: 15, marginBottom: 16 },
  foot: { fontSize: 13, marginBottom: 8 },
});
