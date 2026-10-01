import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { radius, useTheme } from '../../theme';
import { dateLabel, parseDate, today } from '../../utils/dateUtils';

export default function DateField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  error?: string;
}) {
  const t = useTheme();
  const [open, setOpen] = useState(false);
  const current = value || today();

  const handle = (e: DateTimePickerEvent, picked?: Date) => {
    // Android dismisses itself; iOS keeps the dialog open until Done.
    if (Platform.OS !== 'ios') setOpen(false);
    if (e.type === 'dismissed' || !picked) return;
    const m = String(picked.getMonth() + 1).padStart(2, '0');
    const d = String(picked.getDate()).padStart(2, '0');
    onChange(`${picked.getFullYear()}-${m}-${d}`);
  };

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: t.mute }]}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${dateLabel(current)}`}
        style={[styles.box, { backgroundColor: t.card, borderColor: error ? t.exp : t.line }]}
      >
        <Text style={[styles.value, { color: t.ink }]}>{dateLabel(current)}</Text>
      </Pressable>
      {open ? (
        <DateTimePicker
          value={parseDate(current)}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={handle}
        />
      ) : null}
      {error ? <Text style={[styles.error, { color: t.exp }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 12 },
  label: { fontSize: 14, marginBottom: 4 },
  box: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  value: { fontSize: 16 },
  error: { fontSize: 13, marginTop: 4 },
});
