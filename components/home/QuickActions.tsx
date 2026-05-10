/**
 * Quick Actions — Challenge and Review action buttons
 */
import { NucleoIcon, NucleoIconName } from '@/components/ui/NucleoIcon';
import { Colors } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';


const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface QuickActionsProps {
  onTakeChallenge: () => void;
  onQuickReview: () => void;
  hasDueReviews: boolean;
  dueReviewCount: number;
  challengeAvailable: boolean;
}

export function QuickActions({
  onTakeChallenge,
  onQuickReview,
  hasDueReviews,
  dueReviewCount,
  challengeAvailable,
}: QuickActionsProps) {
  return (
    <View className="flex-row gap-md">
      <ActionButton
        iconName="rocket-blue"
        title="Take Challenge"
        subtitle={challengeAvailable ? 'Test what you studied today' : 'Flag an objective to start'}
        onPress={onTakeChallenge}
        disabled={!challengeAvailable}
        color={Colors.accent.primary}

      />
      <ActionButton
        iconName="sparkle-yellow"
        title="Quick Review"
        subtitle={hasDueReviews ? `${dueReviewCount} cards due` : 'No reviews due'}
        onPress={onQuickReview}
        disabled={!hasDueReviews}
        color="#FFD700"
        badge={hasDueReviews ? dueReviewCount : undefined}
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
  iconName: NucleoIconName;
  title: string;
  subtitle: string;
  onPress: () => void;
  disabled?: boolean;
  color: string;
  badge?: number;
}) {
  const scale = useSharedValue(1);
  const iconScale = useSharedValue(1);
  const iconRotation = useSharedValue(0);

  useEffect(() => {
    if ((iconName === 'rocket-blue' || iconName === 'sparkle-yellow') && !disabled) {
      iconScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      iconRotation.value = withRepeat(
        withSequence(
          withTiming(3, { duration: 400 }),
          withTiming(-3, { duration: 400 }),
          withTiming(0, { duration: 200 })
        ),
        -1,
        true
      );
    }
  }, [iconName, disabled]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: iconScale.value },
      { rotate: `${iconRotation.value}deg` },
    ],
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isRocket = iconName === 'rocket-blue';
  const isSparkle = iconName === 'sparkle-yellow';
  const resolvedIconName = iconName;

  const shouldAnimate = (isRocket || isSparkle) && !disabled;

  return (
    <AnimatedTouchable
      className={`flex-1 bg-bg-secondary rounded-lg p-lg items-center border relative ${disabled ? 'opacity-50' : ''}`}
      style={[
        { borderColor: disabled ? Colors.border.subtle : `${color}99` },
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
        {shouldAnimate ? (
          <Animated.View style={iconStyle}>
            <NucleoIcon name={resolvedIconName} size={28} />
          </Animated.View>
        ) : (
          <NucleoIcon name={resolvedIconName} size={28} />
        )}
      </View>
      <Text
        className={`text-md font-semibold ${disabled ? 'text-text-muted' : ''}`}
        style={!disabled ? { color } : undefined}
      >
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
