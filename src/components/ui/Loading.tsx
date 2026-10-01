import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';

export default function Loading({ text = 'Loading...' }: { text?: string }) {
  const t = useTheme();
  return (
    <View style={styles.box} accessibilityRole="progressbar" accessibilityLabel={text}>
      <ActivityIndicator color={t.inc} />
      <Text style={[styles.text, { color: t.mute }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { padding: 24, alignItems: 'center', gap: 10 },
  text: { fontSize: 15 },
});
