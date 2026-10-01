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
import Splash, { SPLASH_MS } from '@/components/ui/SplashScreen';

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
 * Holds the native splash until AsyncStorage has been read, then shows the
 * branded splash for SPLASH_MS before revealing the app.
 */
function Gate({ children }: { children: React.ReactNode }) {
  const { ready } = useExpenseContext();
  const { status } = useAuth();
  const theme = useTheme();
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.bg).catch(() => {
      /* not supported everywhere */
    });
  }, [theme.bg]);

  // The native splash only covers storage reads; the branded splash is ours.
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  useEffect(() => {
    const id = setTimeout(() => setSplashDone(true), SPLASH_MS);
    return () => clearTimeout(id);
  }, []);

  const settled = ready && status !== 'loading';
  if (!settled || !splashDone) {
    return <Splash />;
  }
  // "auto" would follow the OS scheme rather than the palette the user picked.
  return (
    <>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <AuthRedirect />
      {children}
    </>
  );
}

const styles = StyleSheet.create({
  // Deliberately no alignItems/justifyContent here. This view wraps every
  // screen, so centring it makes each screen shrink to its content width
  // instead of filling the viewport, which collapses the web build to a
  // zero-width column and leaves nothing clickable. The splash centres itself.
  gate: { flex: 1 },
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