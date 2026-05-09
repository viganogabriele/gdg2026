/**
 * Question Card — quiz question with option selection and feedback
 */
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { NucleoIcon } from '@/components/ui/NucleoIcon';
import { Colors } from '@/constants/theme';
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

  const getOptionBorderClass = (index: number) => {
    if (answered && showFeedback) {
      if (index === question.correctIndex) return 'border-accent-success bg-[rgba(0,230,118,0.1)]';
      if (index === question.userAnswer) return 'border-accent-danger bg-[rgba(255,82,82,0.1)]';
    } else if (answered && index === question.userAnswer) {
      return 'border-accent-primary bg-[rgba(108,92,231,0.1)]';
    }
    return 'border-border-subtle';
  };

  return (
    <Animated.View className="p-lg" style={containerStyle}>
      <View className="mb-xxl">
        <Text className="text-text-muted text-sm font-medium mb-xs text-center">
          {questionNumber} / {totalQuestions}
        </Text>
        <View className="h-[4px] bg-bg-tertiary rounded-[2px] overflow-hidden">
          <View
            className="h-full bg-accent-primary rounded-[2px]"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </View>
      </View>

      <Text className="text-text-primary text-xl font-semibold leading-[28px] mb-xxl">
        {question.text}
      </Text>

      <View className="gap-md">
        {question.options.map((option, index) => {
          const letter = String.fromCharCode(65 + index);
          return (
            <TouchableOpacity
              key={index}
              className={`flex-row items-center bg-bg-secondary rounded-md p-lg border-[1.5px] gap-md ${getOptionBorderClass(index)}`}
              onPress={() => handleAnswer(index)}
              disabled={answered}
              activeOpacity={0.7}
            >
              <View className="w-[32px] h-[32px] rounded-[16px] bg-bg-tertiary items-center justify-center">
                <Text className="text-text-secondary text-sm font-bold">{letter}</Text>
              </View>
              <Text className="text-text-primary text-md leading-[22px] flex-1">{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {answered && showFeedback && (
        <View className="bg-bg-tertiary rounded-md p-lg mt-xxl border border-border-subtle">
          <View className="flex-row items-center gap-sm mb-sm">
            <NucleoIcon
              name={question.userAnswer === question.correctIndex ? 'circle-check' : 'flame'}
              size={18}
            />
            <Text className="text-text-primary text-md font-semibold">
              {question.userAnswer === question.correctIndex ? 'Correct!' : 'Incorrect'}
            </Text>
          </View>
          <Text className="text-text-secondary text-sm leading-[20px]">{question.explanation}</Text>
        </View>
      )}
    </Animated.View>
  );
}
