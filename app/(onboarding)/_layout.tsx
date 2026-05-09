/**
 * Onboarding Layout — Stack navigator for onboarding flow
 */
import { Stack } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.bg.primary },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="subject" />
      <Stack.Screen name="sources" />
      <Stack.Screen name="deadline" />
      <Stack.Screen name="processing" />
      <Stack.Screen name="assessment" />
      <Stack.Screen name="roadmap-reveal" />
    </Stack>
  );
}
