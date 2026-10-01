import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Logo from './Logo';
import { useTheme } from '../../theme';

/**
 * Longest the branded splash is held once it has appeared, so the logo is not a
 * one-frame flicker. It is a minimum, not a delay: the splash is shown while
 * storage and auth are still loading and goes away as soon as they are done.
 */
export const SPLASH_MIN_MS = 600;

/**
 * Branded launch screen. Drawn in-app rather than relying only on the native
 * splash, because the native one is replaced by the host (Expo Go, or the
 * browser) and so never shows the logo during development.
 *
 * `overlay` draws it on top of the app instead of taking over the screen, which
 * is what lets the router keep rendering its route tree while this is up.
 */
export default function SplashScreen({ overlay = false }: { overlay?: boolean }) {
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
      style={[
        overlay ? styles.overlay : styles.root,
        { backgroundColor: t.bg, paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
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
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 10,
  },
  brand: { alignItems: 'center', gap: 8 },
  wordmark: { fontSize: 30, fontWeight: '800' },
  tagline: { fontSize: 15 },
});