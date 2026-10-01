import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { radius, useTheme } from '../../theme';

export default function Card({
  children,
  small,
  center,
  style,
}: {
  children: React.ReactNode;
  small?: boolean;
  center?: boolean;
  style?: ViewStyle;
}) {
  const t = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: t.card, borderColor: t.line },
        small && styles.small,
        center && styles.center,
        style,
      ]}
    >
      {typeof children === 'string' ? <Text style={{ color: t.mute, fontSize: small ? 13 : 16 }}>{children}</Text> : children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 12,
  },
  small: { paddingVertical: 10, paddingHorizontal: 14 },
  center: { alignItems: 'center' },
});
