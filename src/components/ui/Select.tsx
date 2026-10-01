import { StyleSheet, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { radius, useTheme } from '../../theme';
import type { SelectOption } from '../../types';

type Option = string | SelectOption;

const toOption = (o: Option): SelectOption =>
  typeof o === 'string' ? { value: o, label: o } : o;

export default function Select({
  label,
  value,
  onChange,
  options,
  error,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  options: Option[];
  error?: string;
}) {
  const t = useTheme();

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: t.mute }]}>{label}</Text>
      <View style={[styles.box, { backgroundColor: t.card, borderColor: t.line }]}>
        <Picker
          selectedValue={value}
          onValueChange={onChange}
          dropdownIconColor={t.mute}
          style={[styles.picker, { color: t.ink }]}
          accessibilityLabel={label}
        >
          {options.map((o) => {
            const opt = toOption(o);
            return <Picker.Item key={opt.value} label={opt.label} value={opt.value} />;
          })}
        </Picker>
      </View>
      {error ? <Text style={[styles.error, { color: t.exp }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 12 },
  label: { fontSize: 14, marginBottom: 4 },
  box: {
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  // The wheel needs the full 44px row height plus its own padding, otherwise
  // iOS clips the top and bottom of the first and last labels.
  picker: { height: 46, width: '100%' },
  error: { fontSize: 13, marginTop: 4 },
});
