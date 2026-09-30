import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { radius, useTheme } from '../../theme';

/**
 * Search field for the transaction filters. The typed text is the value of a
 * controlled TextInput, so it always stays in step with what was entered, and
 * the clear button only appears once there is something to clear.
 */
export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search',
}: {
  value: string;
  onChangeText: (next: string) => void;
  placeholder?: string;
}) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.field,
          {
            backgroundColor: t.card,
            borderColor: focused ? t.inc : t.line,
          },
        ]}
      >
        <Text style={[styles.glyph, { color: t.mute }]}>⌕</Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={t.mute}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          selectionColor={t.inc}
          accessibilityLabel="Search transactions"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.input, { color: t.ink }]}
        />
        {value.length > 0 ? (
          <Pressable
            onPress={() => onChangeText('')}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            hitSlop={10}
            style={({ pressed }) => [styles.clear, { opacity: pressed ? 0.5 : 1 }]}
          >
            <Text style={[styles.clearGlyph, { color: t.mute }]}>✕</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 46,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 12,
  },
  glyph: { fontSize: 17 },
  // flex: 1 so the input takes the row and the typed text has room to grow.
  input: { flex: 1, fontSize: 16, paddingVertical: 10 },
  clear: { paddingLeft: 4 },
  clearGlyph: { fontSize: 15 },
});