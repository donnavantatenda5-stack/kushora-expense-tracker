import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme';

/** Plain full-height body, for screens that manage their own scrolling. */
export function Screen({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <View style={[styles.screen, { backgroundColor: t.bg }]}>{children}</View>;
}

/** Body that scrolls. Leaves room for the floating add buttons. */
export function ScrollScreen({
  children,
  bottomInset = 0,
}: {
  children: ReactNode;
  bottomInset?: number;
}) {
  const t = useTheme();
  return (
    <Screen>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, { paddingBottom: 20 + bottomInset }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {children}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 4 },
});
