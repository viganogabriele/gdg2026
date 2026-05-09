import { StepIndicator } from '@/components/onboarding/StepIndicator';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { Colors } from '@/constants/theme';
import { useStudyStore } from '@/hooks/useStudyStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HOURS_OPTIONS = [5, 10, 20, 30];

const minDate = new Date();
minDate.setDate(minDate.getDate() + 1);

const defaultDate = new Date();
defaultDate.setDate(defaultDate.getDate() + 30);

function formatDate(date: Date) {
  return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function DeadlineScreen() {
  const store = useStudyStore();

  const initial = store.onboardingData.deadline
    ? new Date(store.onboardingData.deadline)
    : defaultDate;

  const [date, setDate] = useState(initial);
  const [hoursPerWeek, setHoursPerWeek] = useState(store.onboardingData.hoursPerWeek || 10);
  const [customMode, setCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const isCustomSelected = !HOURS_OPTIONS.includes(hoursPerWeek);

  const handleCustomSubmit = () => {
    const val = parseInt(customInput, 10);
    if (!isNaN(val) && val >= 1 && val <= 168) {
      setHoursPerWeek(val);
    }
    setCustomMode(false);
  };

  const handleContinue = () => {
    store.setOnboardingDeadline(date.toISOString(), hoursPerWeek);
    router.push('/(onboarding)/processing');
  };

  const setQuickDeadline = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDate(d);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={{ flex: 1 }} className="bg-bg-primary">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <StepIndicator totalSteps={6} currentStep={2} />

        <View className="flex-1 pt-xxl">
          <Text className="text-text-primary text-xxl font-bold">When is your deadline?</Text>
          <Text className="text-text-secondary text-md mt-sm mb-xxl">
            We'll plan your study schedule around this date
          </Text>

          <DatePicker
            label="Exam / Deadline Date"
            value={date}
            minimumDate={minDate}
            onChange={setDate}
          />

          <View className="flex-row gap-sm mt-md mb-xxl">
            {[7, 14, 30, 60, 90].map((days) => (
              <TouchableOpacity
                key={days}
                className="flex-1 bg-bg-secondary rounded-md py-sm items-center border border-border-subtle"
                onPress={() => setQuickDeadline(days)}
              >
                <Text className="text-text-secondary text-sm font-medium">{days}d</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-text-primary text-md font-semibold mb-md">Hours per week available</Text>
          <View className="flex-row gap-sm mb-sm">
            {HOURS_OPTIONS.map((h) => (
              <TouchableOpacity
                key={h}
                className={`flex-1 rounded-md py-md items-center border ${
                  hoursPerWeek === h && !isCustomSelected
                    ? 'bg-accent-primary border-accent-primary'
                    : 'bg-bg-secondary border-border-subtle'
                }`}
                onPress={() => { setHoursPerWeek(h); setCustomMode(false); }}
              >
                <Text className={`text-md font-semibold ${hoursPerWeek === h && !isCustomSelected ? 'text-text-primary' : 'text-text-secondary'}`}>
                  {h}h
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              className={`flex-1 rounded-md py-md items-center border ${
                isCustomSelected
                  ? 'bg-accent-primary border-accent-primary'
                  : 'bg-bg-secondary border-border-subtle'
              }`}
              onPress={() => { setCustomMode(true); setCustomInput(isCustomSelected ? String(hoursPerWeek) : ''); }}
            >
              <Text className={`text-md font-semibold ${isCustomSelected ? 'text-text-primary' : 'text-text-secondary'}`}>
                {isCustomSelected ? `${hoursPerWeek}h` : '...'}
              </Text>
            </TouchableOpacity>
          </View>

          {customMode && (
            <View className="flex-row gap-sm mb-md mt-sm">
              <TextInput
                className="flex-1 bg-bg-secondary rounded-md border border-accent-primary px-lg py-md text-text-primary text-md"
                placeholder="1 – 168"
                placeholderTextColor={Colors.text.muted}
                value={customInput}
                onChangeText={(t) => setCustomInput(t.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                maxLength={3}
                autoFocus
                selectionColor={Colors.accent.primary}
                onSubmitEditing={handleCustomSubmit}
              />
              <TouchableOpacity
                className="bg-accent-primary rounded-md px-lg py-md justify-center"
                onPress={handleCustomSubmit}
              >
                <Text className="text-text-primary text-md font-semibold">OK</Text>
              </TouchableOpacity>
            </View>
          )}

          <View className="bg-bg-secondary rounded-md p-lg border border-border-subtle mt-md">
            <View className="flex-row items-center justify-center gap-sm">
              <Ionicons name="calendar-outline" size={16} color={Colors.text.secondary} />
              <Text className="text-text-secondary text-sm text-center">
                Studying ~{hoursPerWeek}h/week until {formatDate(date)}
              </Text>
            </View>
          </View>
        </View>

        <View className="gap-sm pb-xxl">
          <Button title="Generate Study Plan" onPress={handleContinue} fullWidth size="lg" />
          <Button title="Back" variant="ghost" onPress={() => router.back()} fullWidth />
        </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
