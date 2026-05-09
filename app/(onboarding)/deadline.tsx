/**
 * Onboarding Step 3 — "When is your deadline?"
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StepIndicator } from '@/components/onboarding/StepIndicator';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useStudyStore } from '@/hooks/useStudyStore';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <StepIndicator totalSteps={6} currentStep={2} />

        <View style={styles.body}>
          <Text style={styles.title}>When is your deadline?</Text>
          <Text style={styles.subtitle}>
            We'll plan your study schedule around this date
          </Text>

          <Input
            label="Exam / Deadline Date"
            placeholder="YYYY-MM-DD (e.g. 2025-06-15)"
            value={dateText}
            onChangeText={setDateText}
            containerStyle={styles.dateInput}
          />

          {/* Quick date options */}
          <View style={styles.quickDates}>
            {[7, 14, 30, 60, 90].map((days) => (
              <TouchableOpacity
                key={days}
                style={styles.quickDateBtn}
                onPress={() => setQuickDeadline(days)}
              >
                <Text style={styles.quickDateText}>{days}d</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Hours per week */}
          <Text style={styles.hoursLabel}>Hours per week available</Text>
          <View style={styles.hoursOptions}>
            {HOURS_OPTIONS.map((h) => (
              <TouchableOpacity
                key={h}
                style={[styles.hoursBtn, hoursPerWeek === h && styles.hoursBtnActive]}
                onPress={() => setHoursPerWeek(h)}
              >
                <Text style={[styles.hoursText, hoursPerWeek === h && styles.hoursTextActive]}>
                  {h}h
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {dateText && (
            <View style={styles.summary}>
              <Text style={styles.summaryText}>
                📅 Studying ~{hoursPerWeek}h/week until your deadline
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Button title="Generate Study Plan" onPress={handleContinue} fullWidth size="lg" />
          <Button title="Back" variant="ghost" onPress={() => router.back()} fullWidth />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { flex: 1, paddingHorizontal: Spacing.xxl },
  body: { flex: 1, paddingTop: Spacing.xxl },
  title: { color: Colors.text.primary, fontSize: FontSize.xxl, fontWeight: FontWeight.bold },
  subtitle: { color: Colors.text.secondary, fontSize: FontSize.md, marginTop: Spacing.sm, marginBottom: Spacing.xxl },
  dateInput: { marginBottom: Spacing.lg },
  quickDates: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xxxl },
  quickDateBtn: { backgroundColor: Colors.bg.secondary, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderWidth: 1, borderColor: Colors.border.subtle },
  quickDateText: { color: Colors.text.secondary, fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  hoursLabel: { color: Colors.text.primary, fontSize: FontSize.md, fontWeight: FontWeight.semibold, marginBottom: Spacing.md },
  hoursOptions: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xxl },
  hoursBtn: { flex: 1, backgroundColor: Colors.bg.secondary, borderRadius: BorderRadius.md, paddingVertical: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border.subtle },
  hoursBtnActive: { backgroundColor: Colors.accent.primary, borderColor: Colors.accent.primary },
  hoursText: { color: Colors.text.secondary, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  hoursTextActive: { color: Colors.text.primary },
  summary: { backgroundColor: Colors.bg.secondary, borderRadius: BorderRadius.md, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border.subtle },
  summaryText: { color: Colors.text.secondary, fontSize: FontSize.sm, textAlign: 'center' },
  footer: { gap: Spacing.sm, paddingBottom: Spacing.xxl },
});
