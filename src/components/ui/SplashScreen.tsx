import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Logo from './Logo';
import { useTheme } from '../../theme';

/** How long the branded splash stays up on every launch. */
export const SPLASH_MS = 5000;

/**
 * Branded launch screen. Drawn in-app rather than relying only on the native
 * splash, because the native one is replaced by the host (Expo Go, or the
 * browser) and so never shows the logo during development.
 */
export default function SplashScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(lift, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, lift]);

  return (
    <View
      style={[styles.root, { backgroundColor: t.bg, paddingTop: insets.top, paddingBottom: insets.bottom }]}
      accessibilityRole="progressbar"
      accessibilityLabel="Kushora"
    >
      <Animated.View style={[styles.brand, { opacity: fade, transform: [{ translateY: lift }] }]}>
        <Logo size={84} />
        <Text style={[styles.wordmark, { color: t.ink }]}>Kushora</Text>
        <Text style={[styles.tagline, { color: t.mute }]}>Track your money, simply.</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  brand: { alignItems: 'center', gap: 8 },
  wordmark: { fontSize: 30, fontWeight: '800' },
  tagline: { fontSize: 15 },
});