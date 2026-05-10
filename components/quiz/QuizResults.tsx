/**
 * Quiz Results — score display with XP gradient circle
 */
import React, { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { NucleoIcon } from '@/components/ui/NucleoIcon';
import { ProgressCircle } from '@/components/ui/ProgressCircle';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/theme';

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passThreshold: number;
  feedback?: string;
  onContinue: () => void;
  onRetry?: () => void;
  pointsEarned?: number;
  title?: string;
  continueLabel?: string;
  extraContent?: React.ReactNode;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function QuizResults({
  score, totalQuestions, correctAnswers, passThreshold,
  feedback, onContinue, onRetry, pointsEarned, title, continueLabel, extraContent,
  secondaryActionLabel, onSecondaryAction,
}: QuizResultsProps) {
  const passed = score >= passThreshold;
  const wrongAnswers = totalQuestions - correctAnswers;
  const scorePercent = Math.round(score * 100);

  return (
    <ScrollView
      contentContainerStyle={{ alignItems: 'center', padding: 24, paddingTop: 56, paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      <ResponsiveContainer maxWidth={520}>
        <View style={{ alignItems: 'center' }}>
          <Text
            style={{
              color: Colors.text.primary,
              fontSize: 26,
              fontWeight: '700',
              marginBottom: 6,
              textAlign: 'center',
            }}
          >
            {title ?? (passed ? 'Great work!' : 'Keep studying')}
          </Text>
          <Text
            style={{
              color: Colors.text.muted,
              fontSize: 14,
              marginBottom: 36,
              textAlign: 'center',
            }}
          >
            {passed ? 'You nailed this session' : 'Review the weak spots and try again'}
          </Text>

          {/* XP Circle */}
          <ProgressCircle
            progress={score}
            size={180}
            strokeWidth={14}
            gradientColors={[Colors.accent.xp, '#36c6e2', Colors.accent.primary]}
            gradientId="quiz-xp-grad"
            backgroundColor={Colors.bg.tertiary}
            showPercentage={false}
          >
            {pointsEarned !== undefined && pointsEarned > 0 ? (
              <XpLabel pointsEarned={pointsEarned} />
            ) : (
              <NucleoIcon name="circle-check" size={48} />
            )}
          </ProgressCircle>

          {/* Score pill */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              marginTop: 20,
              backgroundColor: Colors.bg.secondary,
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderWidth: 1,
              borderColor: Colors.border.subtle,
            }}
          >
            <Text style={{ color: Colors.text.muted, fontSize: 13 }}>Score</Text>
            <Text
              style={{
                color: passed ? Colors.accent.success : Colors.accent.danger,
                fontSize: 13,
                fontWeight: '700',
              }}
            >
              {scorePercent}%
            </Text>
          </View>

          {/* Stats row */}
          <View
            style={{
              flexDirection: 'row',
              gap: 12,
              marginTop: 24,
              width: '100%',
            }}
          >
            <StatCard value={correctAnswers} label="Correct" color={Colors.accent.success} />
            <StatCard value={wrongAnswers} label="Wrong" color={Colors.accent.danger} />
            <StatCard value={totalQuestions} label="Total" color={Colors.text.muted} />
          </View>

          {feedback ? (
            <Text
              style={{
                color: Colors.text.muted,
                fontSize: 14,
                textAlign: 'center',
                marginTop: 24,
                lineHeight: 22,
                paddingHorizontal: 8,
              }}
            >
              {feedback}
            </Text>
          ) : null}

          {extraContent}

          <View style={{ width: '100%', gap: 12, marginTop: 32 }}>
            <Button title={continueLabel ?? (passed ? 'Continue' : 'Back to Study')} onPress={onContinue} fullWidth />
            {secondaryActionLabel && onSecondaryAction ? (
              <Button title={secondaryActionLabel} variant="ghost" onPress={onSecondaryAction} fullWidth />
            ) : null}
            {!passed && onRetry && (
              <Button title="Retry Quiz" variant="secondary" onPress={onRetry} fullWidth />
            )}
          </View>
        </View>
      </ResponsiveContainer>
    </ScrollView>
  );
}

function XpLabel({ pointsEarned }: { pointsEarned: number }) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    rotation.value = withRepeat(
      withSequence(
        withTiming(4, { duration: 400 }),
        withTiming(-4, { duration: 400 }),
        withTiming(0, { duration: 200 }),
      ),
      -1,
      true,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[{ flexDirection: 'row', alignItems: 'baseline', gap: 5 }, animStyle]}>
      <Text style={{ color: Colors.text.primary, fontSize: 44, fontWeight: '800', letterSpacing: -1 }}>
        +{pointsEarned}
      </Text>
      <Text style={{ color: Colors.accent.xp, fontSize: 18, fontWeight: '800', letterSpacing: 1 }}>
        XP
      </Text>
    </Animated.View>
  );
}

function StatCard({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.bg.secondary,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border.subtle,
      }}
    >
      <Text style={{ color, fontSize: 22, fontWeight: '700' }}>{value}</Text>
      <Text style={{ color: Colors.text.muted, fontSize: 12, marginTop: 2 }}>{label}</Text>
    </View>
  );
}
