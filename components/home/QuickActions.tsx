/**
 * Quick Actions — Challenge and Review action buttons
 */
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface QuickActionsProps {
  onTakeChallenge: () => void;
  onQuickReview: () => void;
  onFocusMode?: () => void;
  hasDueReviews: boolean;
  dueReviewCount: number;
  challengeAvailable: boolean;
}

export function QuickActions({
  onTakeChallenge,
  onQuickReview,
  onFocusMode,
  hasDueReviews,
  dueReviewCount,
  challengeAvailable,
}: QuickActionsProps) {
  return (
    <View className="flex-row gap-md">
      <ActionButton
        iconName="game-controller-outline"
        title="Take Challenge"
        subtitle={challengeAvailable ? 'Test your knowledge' : 'No challenge available'}
        onPress={onTakeChallenge}
        disabled={!challengeAvailable}
        color={Colors.accent.primary}
      />
      <ActionButton
        iconName="bulb-outline"
        title="Quick Review"
        subtitle={hasDueReviews ? `${dueReviewCount} cards due` : 'No reviews due'}
        onPress={onQuickReview}
        disabled={!hasDueReviews}
        color={Colors.accent.secondary}
        badge={hasDueReviews ? dueReviewCount : undefined}
      />
      <ActionButton
        iconName="time-outline"
        title="Focus Mode"
        subtitle={'Start a focused session'}
        onPress={() => onFocusMode && onFocusMode()}
        disabled={false}
        color={Colors.accent.success}
      />
    </View>
  );
}

function ActionButton({
  iconName,
  title,
  subtitle,
  onPress,
  disabled,
  color,
  badge,
}: {
  iconName: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  disabled?: boolean;
  color: string;
  badge?: number;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      className={`flex-1 bg-bg-secondary rounded-lg p-lg items-center border relative ${disabled ? 'opacity-50' : ''}`}
      style={[
        { borderColor: disabled ? Colors.border.subtle : `${color}44` },
        animatedStyle,
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
      }}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View className="mb-sm">
        <Ionicons name={iconName as any} size={28} color={Colors.text.primary} />
      </View>
      <Text className={`text-md font-semibold ${disabled ? 'text-text-muted' : 'text-text-primary'}`}>
        {title}
      </Text>
      <Text className="text-text-muted text-xs mt-xs text-center">{subtitle}</Text>
      {badge !== undefined && badge > 0 && (
        <View className="absolute top-[-6px] right-[-6px] w-[24px] h-[24px] rounded-full items-center justify-center" style={{ backgroundColor: color }}>
          <Text className="text-text-primary text-xs font-bold">{badge}</Text>
        </View>
      )}
    </AnimatedTouchable>
  );
}
