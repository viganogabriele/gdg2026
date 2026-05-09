/**
 * Root Layout — Dark theme, onboarding routing, font loading
 */
import { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { useStudyStore } from '@/hooks/useStudyStore';
import { Colors } from '@/constants/theme';

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

  useEffect(() => {
    const inOnboarding = segments[0] === '(onboarding)';
    const inTabs = segments[0] === '(tabs)';

    if (!onboardingComplete && !inOnboarding) {
      router.replace('/(onboarding)/subject');
    } else if (onboardingComplete && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [onboardingComplete, segments]);

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
