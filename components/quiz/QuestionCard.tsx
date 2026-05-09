/**
 * Question Card — quiz question with option selection and feedback
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';
import type { QuizQuestion } from '@/types';

interface QuestionCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answerIndex: number) => void;
  showFeedback: boolean;
}

export function QuestionCard({
  question, questionNumber, totalQuestions, onAnswer, showFeedback,
}: QuestionCardProps) {
  const shakeX = useSharedValue(0);
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const handleAnswer = (index: number) => {
    onAnswer(index);
    if (showFeedback) {
      if (index === question.correctIndex) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        shakeX.value = withSequence(
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
          withTiming(-10, { duration: 50 }),
          withTiming(0, { duration: 50 })
        );
      }
    }
  };

  const answered = question.userAnswer !== undefined;

  const getOptionStyle = (index: number) => {
    if (answered && showFeedback) {
      if (index === question.correctIndex) return styles.correctOption;
      if (index === question.userAnswer) return styles.wrongOption;
    } else if (answered && index === question.userAnswer) {
      return styles.selectedOption;
    }
    return null;
  };

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={styles.progress}>
        <Text style={styles.progressText}>{questionNumber} / {totalQuestions}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(questionNumber / totalQuestions) * 100}%` }]} />
        </View>
      </View>

      <Text style={styles.questionText}>{question.text}</Text>

      <View style={styles.options}>
        {question.options.map((option, index) => {
          const letter = String.fromCharCode(65 + index);
          return (
            <TouchableOpacity
              key={index}
              style={[styles.option, getOptionStyle(index)]}
              onPress={() => handleAnswer(index)}
              disabled={answered}
              activeOpacity={0.7}
            >
              <View style={styles.letterBadge}>
                <Text style={styles.letterText}>{letter}</Text>
              </View>
              <Text style={[styles.optionText, { flex: 1 }]}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {answered && showFeedback && (
        <View style={styles.explanation}>
          <Text style={styles.explanationTitle}>
            {question.userAnswer === question.correctIndex ? '✅ Correct!' : '❌ Incorrect'}
          </Text>
          <Text style={styles.explanationText}>{question.explanation}</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { padding: Spacing.lg },
  progress: { marginBottom: Spacing.xxl },
  progressText: { color: Colors.text.muted, fontSize: FontSize.sm, fontWeight: FontWeight.medium, marginBottom: Spacing.xs, textAlign: 'center' },
  progressBar: { height: 4, backgroundColor: Colors.bg.tertiary, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.accent.primary, borderRadius: 2 },
  questionText: { color: Colors.text.primary, fontSize: FontSize.xl, fontWeight: FontWeight.semibold, lineHeight: 28, marginBottom: Spacing.xxl },
  options: { gap: Spacing.md },
  option: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg.secondary, borderRadius: BorderRadius.md, padding: Spacing.lg, borderWidth: 1.5, borderColor: Colors.border.subtle, gap: Spacing.md },
  selectedOption: { borderColor: Colors.accent.primary, backgroundColor: 'rgba(108, 92, 231, 0.1)' },
  correctOption: { borderColor: Colors.accent.success, backgroundColor: 'rgba(0, 230, 118, 0.1)' },
  wrongOption: { borderColor: Colors.accent.danger, backgroundColor: 'rgba(255, 82, 82, 0.1)' },
  letterBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.bg.tertiary, alignItems: 'center', justifyContent: 'center' },
  letterText: { color: Colors.text.secondary, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  optionText: { color: Colors.text.primary, fontSize: FontSize.md, lineHeight: 22 },
  explanation: { backgroundColor: Colors.bg.tertiary, borderRadius: BorderRadius.md, padding: Spacing.lg, marginTop: Spacing.xxl, borderWidth: 1, borderColor: Colors.border.subtle },
  explanationTitle: { color: Colors.text.primary, fontSize: FontSize.md, fontWeight: FontWeight.semibold, marginBottom: Spacing.sm },
  explanationText: { color: Colors.text.secondary, fontSize: FontSize.sm, lineHeight: 20 },
});
