/**
 * Root Layout — Dark theme, onboarding routing, font loading
 */
import { Colors } from '@/constants/theme';
import { useStudyStore } from '@/hooks/useStudyStore';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

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
  const segments = useSegments();
  const router = useRouter();

  

  useEffect(() => {
    // avoid navigating before the router/segments are ready
    setTimeout(() => {
      if (!segments) return;

      const inOnboarding = segments[0] === '(onboarding)';

      if (!onboardingComplete && !inOnboarding) {
        router.replace('/(onboarding)/subject');
      } else if (onboardingComplete && inOnboarding) {
        router.replace('/(tabs)');
      }
    }, 10);
  }, [onboardingComplete, segments, router]);

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
