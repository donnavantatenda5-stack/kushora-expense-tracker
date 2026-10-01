import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, useTheme } from '../../theme';
import Button from './Button';

// In-app confirmation, used instead of the web-only window.confirm.
export default function ConfirmDialog({
  title,
  text,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: {
  title: string;
  text: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const t = useTheme();

  return (
    <Modal transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityLabel="Dismiss" />
        <View accessibilityRole="alert" style={[styles.box, { backgroundColor: t.bg, borderColor: t.line }]}>
          <Text style={[styles.title, { color: t.ink }]}>{title}</Text>
          <Text style={[styles.text, { color: t.mute }]}>{text}</Text>
          <View style={styles.row}>
            <Button label={confirmLabel} variant="danger" onPress={onConfirm} style={styles.grow} />
            <Button label="Keep it" variant="ghost" onPress={onCancel} style={styles.grow} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: 20,
  },
  box: {
    width: '100%',
    maxWidth: 380,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 18,
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  text: { fontSize: 15, marginBottom: 16 },
  row: { flexDirection: 'row', gap: 10 },
  grow: { flex: 1 },
});
