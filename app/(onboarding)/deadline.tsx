/**
 * Onboarding Step 3 — "When is your deadline?"
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StepIndicator } from '@/components/onboarding/StepIndicator';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useStudyStore } from '@/hooks/useStudyStore';
import { Colors } from '@/constants/theme';

const HOURS_OPTIONS = [5, 10, 15, 20, 30];

export default function DeadlineScreen() {
  const store = useStudyStore();
  const [dateText, setDateText] = useState(
    store.onboardingData.deadline
      ? new Date(store.onboardingData.deadline).toLocaleDateString()
      : ''
  );
  const [hoursPerWeek, setHoursPerWeek] = useState(store.onboardingData.hoursPerWeek || 10);

  // Simple date parsing from text input
  const parseDate = (text: string): Date | null => {
    const d = new Date(text);
    if (isNaN(d.getTime())) return null;
    return d;
  };

  const handleContinue = () => {
    let deadline: string;
    const parsed = parseDate(dateText);
    if (parsed && parsed > new Date()) {
      deadline = parsed.toISOString();
    } else {
      // Default: 30 days from now
      const d = new Date();
      d.setDate(d.getDate() + 30);
      deadline = d.toISOString();
    }
    store.setOnboardingDeadline(deadline, hoursPerWeek);
    router.push('/(onboarding)/processing');
  };

  const setQuickDeadline = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDateText(d.toISOString().split('T')[0]);
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <View className="flex-1 px-xxl">
        <StepIndicator totalSteps={6} currentStep={2} />

        <View className="flex-1 pt-xxl">
          <Text className="text-text-primary text-xxl font-bold">When is your deadline?</Text>
          <Text className="text-text-secondary text-md mt-sm mb-xxl">
            We'll plan your study schedule around this date
          </Text>

          <Input
            label="Exam / Deadline Date"
            placeholder="YYYY-MM-DD (e.g. 2025-06-15)"
            value={dateText}
            onChangeText={setDateText}
            containerStyle={{ marginBottom: 16 }}
          />

          {/* Quick date options */}
          <View className="flex-row gap-sm mb-xxxl">
            {[7, 14, 30, 60, 90].map((days) => (
              <TouchableOpacity
                key={days}
                className="bg-bg-secondary rounded-md px-lg py-sm border border-border-subtle"
                onPress={() => setQuickDeadline(days)}
              >
                <Text className="text-text-secondary text-sm font-medium">{days}d</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Hours per week */}
          <Text className="text-text-primary text-md font-semibold mb-md">Hours per week available</Text>
          <View className="flex-row gap-sm mb-xxl">
            {HOURS_OPTIONS.map((h) => (
              <TouchableOpacity
                key={h}
                className={`flex-1 rounded-md py-md items-center border ${
                  hoursPerWeek === h
                    ? 'bg-accent-primary border-accent-primary'
                    : 'bg-bg-secondary border-border-subtle'
                }`}
                onPress={() => setHoursPerWeek(h)}
              >
                <Text className={`text-md font-semibold ${hoursPerWeek === h ? 'text-text-primary' : 'text-text-secondary'}`}>
                  {h}h
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {dateText && (
            <View className="bg-bg-secondary rounded-md p-lg border border-border-subtle">
              <View className="flex-row items-center justify-center gap-sm">
                <Ionicons name="calendar-outline" size={16} color={Colors.text.secondary} />
                <Text className="text-text-secondary text-sm text-center">
                  Studying ~{hoursPerWeek}h/week until your deadline
                </Text>
              </View>
            </View>
          )}
        </View>

        <View className="gap-sm pb-xxl">
          <Button title="Generate Study Plan" onPress={handleContinue} fullWidth size="lg" />
          <Button title="Back" variant="ghost" onPress={() => router.back()} fullWidth />
        </View>
      </View>
    </SafeAreaView>
  );
}
