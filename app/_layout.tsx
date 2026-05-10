/**
 * Root Layout — Dark theme, onboarding routing, font loading
 */
import { Colors } from '@/constants/theme';
import { useStudyStore } from '@/hooks/useStudyStore';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname, useRouter, useSegments } from 'expo-router';
import { Accelerometer } from 'expo-sensors';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import '../styles/global.css';

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.bg.primary,
    card: Colors.bg.secondary,
    border: Colors.border.subtle,
    primary: Colors.accent.primary,
    text: Colors.text.primary,
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const onboardingComplete = useStudyStore((s) => s.onboardingComplete);
  const isAddingRoadmap = useStudyStore((s) => s.isAddingRoadmap);
  const segments = useSegments();
  const router = useRouter();
  const pathname = usePathname();
  const lastOrientation = useRef<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    // avoid navigating before the router/segments are ready
    setTimeout(() => {
      if (!segments) return;

      const inOnboarding = segments[0] === '(onboarding)';

      if (!onboardingComplete && !inOnboarding) {
        router.replace('/(onboarding)/subject');
      } else if (onboardingComplete && inOnboarding && !isAddingRoadmap) {
        router.replace('/(tabs)');
      }
    }, 10);
  }, [onboardingComplete, isAddingRoadmap, segments, router]);

  const tiltToFocusEnabled = useStudyStore((s) => s.notificationPrefs.tiltToFocusEnabled);
  const isHomeTab = pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/index';

  useEffect(() => {
    if (!tiltToFocusEnabled || !isHomeTab) return;

    Accelerometer.setUpdateInterval(500);

    const subscription = Accelerometer.addListener(({ x, y }) => {
      const isLandscape = Math.abs(x) > 0.75 && Math.abs(y) < 0.5;
      const isPortrait = Math.abs(y) > 0.75 && Math.abs(x) < 0.5;

      if (isLandscape && lastOrientation.current !== 'landscape') {
        lastOrientation.current = 'landscape';
        const dir = x > 0 ? 'right' : 'left';
        router.push({ pathname: '/focus', params: { dir } });
      } else if (isPortrait && lastOrientation.current !== 'portrait') {
        lastOrientation.current = 'portrait';
      }
    });

    return () => subscription.remove();
  }, [pathname, router, tiltToFocusEnabled, isHomeTab]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={CustomDarkTheme}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.bg.primary } }}>
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="quiz/[id]" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="focus" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="spaced-review" options={{ presentation: 'modal' }} />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
