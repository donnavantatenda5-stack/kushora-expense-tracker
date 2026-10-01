import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import { ScrollScreen } from '../layout/Screen';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';

export default function ChangePasswordForm() {
  const t = useTheme();
  const { account, changePassword } = useAuth();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const mismatch = confirm.length > 0 && next !== confirm;

  const submit = async () => {
    if (busy) return;
    setError(undefined);
    setSaved(false);

    if (mismatch) {
      setError('The two new passwords do not match.');
      return;
    }

    setBusy(true);
    // The digest is deliberately expensive, so yield a frame before starting to
    // keep the button's disabled state visible instead of blocking the first paint.
    await new Promise((resolve) => setTimeout(resolve, 0));
    const message = await changePassword(current, next);
    setBusy(false);

    if (message) {
      setError(message);
      return;
    }

    setCurrent('');
    setNext('');
    setConfirm('');
    setSaved(true);
  };

  return (
    <ScrollScreen>
      <Card>
        <Text style={[styles.title, { color: t.ink }]}>Change password</Text>
        <Text style={[styles.mute, { color: t.mute }]}>
          {account?.email ?? ''}
        </Text>
      </Card>

      <Card>
        <Input
          label="Current password"
          value={current}
          onChangeText={(v) => {
            setCurrent(v);
            setSaved(false);
          }}
          placeholder="Your current password"
          secureTextEntry
          autoComplete="current-password"
        />
        <Input
          label="New password"
          value={next}
          onChangeText={(v) => {
            setNext(v);
            setSaved(false);
          }}
          placeholder="At least 6 characters"
          secureTextEntry
          autoComplete="new-password"
        />
        <Input
          label="Confirm new password"
          value={confirm}
          onChangeText={(v) => {
            setConfirm(v);
            setSaved(false);
          }}
          placeholder="Type it again"
          secureTextEntry
          autoComplete="new-password"
          error={mismatch ? 'The two new passwords do not match.' : error}
          onSubmitEditing={submit}
        />

        {saved && !error ? (
          <Text style={[styles.ok, { color: t.inc }]}>Password updated.</Text>
        ) : null}

        <View style={styles.actions}>
          <Button label="Update password" onPress={submit} disabled={busy} />
        </View>
      </Card>

      <Text style={[styles.foot, { color: t.mute }]}>
        The account lives on this device only, so this replaces the stored one in place.
      </Text>
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
  mute: { fontSize: 15 },
  ok: { fontSize: 15, marginBottom: 12 },
  actions: { marginTop: 2 },
  foot: { fontSize: 13, textAlign: 'center' },
});
