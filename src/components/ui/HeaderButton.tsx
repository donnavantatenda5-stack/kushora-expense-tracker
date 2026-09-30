import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../theme';

/** Cancel / Close affordance for a stack screen header. */
export default function HeaderButton({
  label,
  onPress,
  tone = 'mute',
}: {
  label: string;
  onPress: () => void;
  tone?: 'mute' | 'inc';
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      hitSlop={8}
      style={({ pressed }) => [styles.btn, { opacity: pressed ? 0.6 : 1 }]}
    >
      <Text style={[styles.label, { color: tone === 'inc' ? theme.inc : theme.mute }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { paddingVertical: 4, paddingHorizontal: 4 },
  label: { fontSize: 16 },
});
