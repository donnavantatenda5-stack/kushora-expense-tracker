import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';

// Brand mark. The web build masked a PNG with the current text colour so it
// flipped with the theme; here it is drawn from views so it needs no asset and
// follows the theme in both schemes.
export default function Logo({ size = 32 }: { size?: number }) {
  const t = useTheme();
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="Kushora logo"
      style={[
        styles.box,
        { width: size, height: size, borderRadius: size * 0.28, backgroundColor: t.ink },
      ]}
    >
      <Text
        style={{
          color: t.bg,
          fontSize: size * 0.6,
          fontWeight: '800',
          lineHeight: size * 0.78,
        }}
      >
        K
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center' },
});
