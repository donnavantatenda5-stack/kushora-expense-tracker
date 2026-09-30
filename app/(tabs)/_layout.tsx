import { useEffect, useRef, type ComponentProps } from 'react';
import { Tabs } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PageHeader from '@/components/layout/PageHeader';
import { NAV } from '@/components/layout/nav';
import { useTheme } from '@/theme';

// expo-router bundles its own copy of the bottom tabs navigator, so the prop
// type is derived from Tabs rather than imported from a package path.
type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

/**
 * Horizontally scrollable tab bar. The web build used a scrollable bottom bar
 * so all eight pages fit; eight items do not fit a fixed bar on a phone, and
 * expo-router's tabs have no built-in scrolling, so this is custom.
 */
function TabBar({ state, descriptors, navigation }: TabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const scroller = useRef<ScrollView>(null);

  useEffect(() => {
    scroller.current?.scrollTo({
      x: Math.max(0, state.index * 82 - 120),
      animated: true,
    });
  }, [state.index]);

  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: theme.card, borderTopColor: theme.line, paddingBottom: insets.bottom },
      ]}
    >
      <ScrollView
        ref={scroller}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.items}
      >
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const label = String(options.title ?? route.name);

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
              style={({ pressed }) => [styles.item, { opacity: pressed ? 0.6 : 1 }]}
            >
              {options.tabBarIcon?.({
                focused,
                color: focused ? theme.ink : theme.mute,
                size: 18,
              })}
              <Text
                numberOfLines={1}
                style={[styles.label, { color: focused ? theme.ink : theme.mute }]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: true,
        // A custom `header` replaces react-navigation's Header outright, so
        // headerStyle/headerShadowVisible are ignored here. PageHeader paints
        // its own background and the status bar inset.
        header: ({ options }) => <PageHeader title={String(options.title ?? 'Kushora')} />,
        sceneStyle: { backgroundColor: theme.bg },
      }}
    >
      {NAV.map((item) => (
        <Tabs.Screen
          key={item.name}
          name={item.name}
          options={{
            title: item.label,
            tabBarIcon: ({ color }) => <Text style={[styles.icon, { color }]}>{item.icon}</Text>,
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: { borderTopWidth: 1 },
  items: { paddingTop: 4 },
  item: {
    minWidth: 82,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 6,
  },
  label: { fontSize: 11, fontWeight: '600' },
  icon: { fontSize: 18, lineHeight: Platform.OS === 'ios' ? 22 : 20 },
});
