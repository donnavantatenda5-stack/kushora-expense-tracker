import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { radius, TOUCH, useTheme } from '../../theme';

export type ButtonVariant = 'primary' | 'inc' | 'exp' | 'ghost' | 'danger';

export default function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  style,
  compact,
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
}) {
  const t = useTheme();

  const bg: Record<ButtonVariant, string> = {
    primary: t.ink,
    inc: t.inc,
    exp: t.exp,
    ghost: 'transparent',
    danger: 'transparent',
  };
  const fg: Record<ButtonVariant, string> = {
    primary: t.bg,
    inc: '#fff',
    exp: '#fff',
    ghost: t.ink,
    danger: t.exp,
  };
  const bordered = variant === 'ghost' || variant === 'danger';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.btn,
        compact && styles.compact,
        {
          backgroundColor: bg[variant],
          borderWidth: bordered ? 1 : 0,
          borderColor: variant === 'danger' ? t.exp : t.line,
          opacity: disabled ? 0.5 : pressed ? 0.75 : 1,
        },
        style,
      ]}
    >
      <Text style={[styles.label, { color: fg[variant] }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: TOUCH,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compact: { minHeight: 38, paddingHorizontal: 11 },
  label: { fontSize: 15, fontWeight: '600' },
});
