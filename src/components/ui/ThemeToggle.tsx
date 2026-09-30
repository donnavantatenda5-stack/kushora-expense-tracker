import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, THEME_LABELS, THEME_ORDER, THEMES, useTheme, type ThemeName } from '../../theme';

/**
 * Compact one-tap control for the page header. Each press advances to the next
 * palette and the dot previews what it will switch to.
 */
export function ThemeToggle() {
  const t = useTheme();
  const upcoming = THEME_ORDER[(THEME_ORDER.indexOf(t.name) + 1) % THEME_ORDER.length];

  return (
    <Pressable
      onPress={t.cycle}
      accessibilityRole="button"
      accessibilityLabel={`Theme: ${THEME_LABELS[t.name]}. Switch to ${THEME_LABELS[upcoming]}`}
      style={({ pressed }) => [
        styles.cycle,
        {
          backgroundColor: t.card,
          borderColor: t.line,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View style={[styles.swatch, { backgroundColor: THEMES[upcoming].bg, borderColor: t.line }]} />
      <Text style={[styles.cycleLabel, { color: t.ink }]}>{THEME_LABELS[t.name]}</Text>
    </Pressable>
  );
}

/** Explicit three-way picker, so the options are visible rather than inferred. */
export function ThemePicker() {
  const t = useTheme();

  return (
    <View style={styles.picker} accessibilityRole="radiogroup">
      {THEME_ORDER.map((name: ThemeName) => {
        const active = name === t.name;
        return (
          <Pressable
            key={name}
            onPress={() => t.setName(name)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={THEME_LABELS[name]}
            style={({ pressed }) => [
              styles.option,
              {
                backgroundColor: THEMES[name].bg,
                borderColor: active ? THEMES[name].inc : t.line,
                borderWidth: active ? 2 : 1,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <View style={[styles.chip, { backgroundColor: THEMES[name].ink }]} />
            <Text style={[styles.optionLabel, { color: THEMES[name].ink }]}>
              {THEME_LABELS[name]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  cycle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    minHeight: 38,
    paddingHorizontal: 11,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  cycleLabel: { fontSize: 13, fontWeight: '600' },
  swatch: { width: 16, height: 16, borderRadius: 8, borderWidth: 1 },
  picker: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 64,
    borderRadius: radius.md,
    paddingVertical: 8,
  },
  chip: { width: 22, height: 22, borderRadius: 11 },
  optionLabel: { fontSize: 13, fontWeight: '600' },
});