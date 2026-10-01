import { useEffect, useState } from 'react';
import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { StyleSheet, View } from 'react-native';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ExpenseProvider, useExpenseContext } from '@/context/ExpenseContext';
import { ThemeProvider, useTheme } from '@/theme';
import Splash, { SPLASH_MIN_MS } from '@/components/ui/SplashScreen';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Already hidden, or unavailable on this platform.
});

/** Sends unauthenticated visitors to the sign-in screen and back once signed in. */
function AuthRedirect() {
  const { status } = useAuth();
  const segments = useSegments();

  if (status === 'loading') return null;
  const onSignIn = segments[0] === 'sign-in';
  if (status === 'signedOut' && !onSignIn) return <Redirect href="/sign-in" />;
  if (status === 'signedIn' && onSignIn) return <Redirect href="/(tabs)" />;
  return null;
}

/**
 * Covers the app with the branded splash while AsyncStorage and the session are
 * still being read.
 *
 * The splash is an overlay, not a replacement: the route tree stays mounted
 * underneath. That matters for the web target, because `web.output` is "server"
 * and every route is prerendered. A gate that swapped the tree for the splash
 * would make the server, where neither read can ever settle, emit splash-only
 * HTML for all 13 routes, and the client would then sit behind the splash until
 * it had hydrated.
 */
function Gate({ children }: { children: React.ReactNode }) {
  const { ready } = useExpenseContext();
  const { status } = useAuth();
  const theme = useTheme();
  const [splash, setSplash] = useState(false);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.bg).catch(() => {
      /* not supported everywhere */
    });
  }, [theme.bg]);

  // The native splash only covers storage reads; the branded splash is ours.
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  const loading = !ready || status === 'loading';

  useEffect(() => {
    if (!loading) {
      setSplash(false);
      return;
    }
    // Deliberately a macrotask, not a microtask. Storage resolves in a
    // microtask on web (AsyncStorage is localStorage there), so by the time
    // this runs the web build is normally loaded already and skips the splash
    // entirely. Native storage crosses a real bridge and takes frames, so the
    // splash does show there, and SPLASH_MIN_MS keeps it from flickering.
    const start = setTimeout(() => setSplash(true));
    return () => clearTimeout(start);
  }, [loading]);

  // Tracked separately from `loading` so the splash does not vanish the instant
  // the last read lands.
  useEffect(() => {
    if (!splash) return;
    const min = setTimeout(() => setSplash(false), SPLASH_MIN_MS);
    return () => clearTimeout(min);
  }, [splash]);

  // "auto" would follow the OS scheme rather than the palette the user picked.
  return (
    <>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <AuthRedirect />
      <View style={styles.stage}>
        {children}
        {splash ? <Splash overlay /> : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  // Deliberately no alignItems/justifyContent here. This view wraps every
  // screen, so centring it makes each screen shrink to its content width
  // instead of filling the viewport, which collapses the web build to a
  // zero-width column and leaves nothing clickable. The splash centres itself.
  gate: { flex: 1 },
  // Explicitly positioned, so the splash overlay resolves against this view
  // rather than the document on web.
  stage: { flex: 1, position: 'relative' },
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.gate}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <ExpenseProvider>
              <Gate>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="sign-in" />
                  <Stack.Screen
                    name="transaction"
                    options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
                  />
                  <Stack.Screen
                    name="deleted"
                    options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
                  />
                </Stack>
              </Gate>
            </ExpenseProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}