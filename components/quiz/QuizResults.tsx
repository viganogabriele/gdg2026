/**
 * Quiz Results — score display with topic breakdown
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ProgressCircle } from '@/components/ui/ProgressCircle';
import { Button } from '@/components/ui/Button';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.emoji}>{passed ? '🎉' : '📖'}</Text>
      <Text style={styles.title}>{passed ? 'Level Complete!' : 'Keep Studying'}</Text>

      <ProgressCircle
        progress={score}
        size={160}
        strokeWidth={12}
        color={passed ? Colors.accent.success : Colors.accent.danger}
        showPercentage
      />

      <Text style={styles.scoreText}>
        {correctAnswers} / {totalQuestions} correct
      </Text>

      {pointsEarned !== undefined && pointsEarned > 0 && (
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>+{pointsEarned} XP</Text>
        </View>
      )}

      <Text style={styles.feedback}>{feedback}</Text>

      <View style={styles.actions}>
        <Button title={passed ? 'Continue' : 'Back to Study'} onPress={onContinue} fullWidth />
        {!passed && onRetry && (
          <Button title="Retry Quiz" variant="secondary" onPress={onRetry} fullWidth />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: Spacing.xxl, paddingTop: Spacing.huge },
  emoji: { fontSize: 64, marginBottom: Spacing.lg },
  title: { color: Colors.text.primary, fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, marginBottom: Spacing.xxl },
  scoreText: { color: Colors.text.secondary, fontSize: FontSize.lg, marginTop: Spacing.lg },
  xpBadge: { backgroundColor: 'rgba(255, 215, 0, 0.15)', borderRadius: BorderRadius.full, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, marginTop: Spacing.md },
  xpText: { color: Colors.accent.xp, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  feedback: { color: Colors.text.secondary, fontSize: FontSize.md, textAlign: 'center', marginTop: Spacing.xxl, lineHeight: 22, paddingHorizontal: Spacing.lg },
  actions: { width: '100%', gap: Spacing.md, marginTop: Spacing.xxxl },
});
