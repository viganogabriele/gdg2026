/**
 * Quiz Results — score display with topic breakdown
 */
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { NucleoIcon } from '@/components/ui/NucleoIcon';
import { ProgressCircle } from '@/components/ui/ProgressCircle';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/theme';

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passThreshold: number;
  feedback: string;
  onContinue: () => void;
  onRetry?: () => void;
  pointsEarned?: number;
}

export function QuizResults({
  score, totalQuestions, correctAnswers, passThreshold,
  feedback, onContinue, onRetry, pointsEarned,
}: QuizResultsProps) {
  const passed = score >= passThreshold;

  return (
    <ScrollView contentContainerStyle={{ alignItems: 'center', padding: 24, paddingTop: 48 }}>
      <View className="mb-lg">
        <NucleoIcon
          name={passed ? 'award' : 'book-open'}
          size={64}
        />
      </View>
      <Text className="text-text-primary text-xxxl font-bold mb-xxl">
        {passed ? 'Level Complete!' : 'Keep Studying'}
      </Text>

      <ProgressCircle
        progress={score}
        size={160}
        strokeWidth={12}
        color={passed ? Colors.accent.success : Colors.accent.danger}
        showPercentage
      />

      <Text className="text-text-secondary text-lg mt-lg">
        {correctAnswers} / {totalQuestions} correct
      </Text>

      {pointsEarned !== undefined && pointsEarned > 0 && (
        <View className="bg-[rgba(255,215,0,0.15)] rounded-full px-lg py-sm mt-md">
          <Text className="text-accent-xp text-lg font-bold">+{pointsEarned} XP</Text>
        </View>
      )}

      <Text className="text-text-secondary text-md text-center mt-xxl leading-[22px] px-lg">
        {feedback}
      </Text>

      <View className="w-full gap-md mt-xxxl">
        <Button title={passed ? 'Continue' : 'Back to Study'} onPress={onContinue} fullWidth />
        {!passed && onRetry && (
          <Button title="Retry Quiz" variant="secondary" onPress={onRetry} fullWidth />
        )}
      </View>
    </ScrollView>
  );
}
