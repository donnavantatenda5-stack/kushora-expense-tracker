import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, type } from '../../theme';
import Button from '../ui/Button';
import Logo from '../ui/Logo';
import { ThemeToggle } from '../ui/ThemeToggle';

// Below this width the logo, the title, the theme toggle and both add buttons
// no longer fit on one row, so the buttons drop to their own full-width row.
const STACK_BELOW = 560;

/**
 * Replaces the old Navbar: title on the left, add buttons on the right.
 *
 * This is used as the `header` render prop, which replaces react-navigation's
 * own Header component rather than wrapping it. That built-in Header is what
 * normally reserves the status bar strip and paints the background, so both are
 * handled here instead. `headerStyle` in the navigator has no effect for the
 * same reason.
 */
export default function PageHeader({ title }: { title: string }) {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const stacked = width < STACK_BELOW;

  const add = (kind: 'income' | 'expense') =>
    router.push({ pathname: '/transaction', params: { type: kind } });

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: t.bg,
          borderBottomColor: t.line,
          paddingTop: insets.top + (stacked ? 8 : 10),
          paddingLeft: 16 + insets.left,
          paddingRight: 16 + insets.right,
        },
      ]}
    >
      <View style={styles.top}>
        <View style={styles.titleWrap}>
          <Logo size={stacked ? 26 : 30} />
          <Text
            numberOfLines={1}
            style={[styles.title, { color: t.ink, fontSize: stacked ? 21 : type.h1 }]}
          >
            {title}
          </Text>
        </View>
        <ThemeToggle />
      </View>

      <View style={styles.actions}>
        <Button
          label="+ Income"
          variant="inc"
          compact={!stacked}
          style={stacked ? styles.grow : undefined}
          onPress={() => add('income')}
        />
        <Button
          label="+ Expense"
          variant="exp"
          compact={!stacked}
          style={stacked ? styles.grow : undefined}
          onPress={() => add('expense')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 10,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  titleWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  title: { fontWeight: '700', flexShrink: 1 },
  actions: { flexDirection: 'row', gap: 8 },
  grow: { flex: 1 },
});