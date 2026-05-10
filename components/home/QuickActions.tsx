/**
 * Quick Actions — Challenge and Review action buttons
 */
import { NucleoIcon, NucleoIconName } from '@/components/ui/NucleoIcon';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/theme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
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
  challengeBoosted?: boolean;
}

export function QuickActions({
  onTakeChallenge,
  onQuickReview,
  hasDueReviews,
  dueReviewCount,
  challengeAvailable,
  challengeBoosted,
}: QuickActionsProps) {
  const { isWide } = useResponsiveLayout();

  const buttons = (
    <View style={{ flexDirection: 'row', gap: isWide ? 16 : 12 }}>
      <ActionButton
        iconName="rocket-blue"
        title="Take Challenge"
        subtitle={challengeAvailable ? 'Test what you studied today' : 'Flag an objective to start'}
        onPress={onTakeChallenge}
        disabled={!challengeAvailable}
        color={Colors.accent.primary}
        boosted={challengeBoosted}
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

  return buttons;
}

function ActionButton({
  iconName,
  title,
  subtitle,
  onPress,
  disabled,
  color,
  badge,
  boosted,
}: {
  iconName: NucleoIconName;
  title: string;
  subtitle: string;
  onPress: () => void;
  disabled?: boolean;
  color: string;
  badge?: number;
  boosted?: boolean;
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
    } else {
      // Reset animations if disabled or not boosted
      iconScale.value = withTiming(1);
      iconRotation.value = withTiming(0);
    }
  }, [iconName, disabled, boosted]);

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
  const resolvedIconName = (isRocket && boosted) ? 'rocket-red' as NucleoIconName : iconName;

  const shouldAnimate = ((isRocket && boosted) || isSparkle) && !disabled;

  const iconBg = boosted ? 'rgba(239,68,68,0.15)' : `${color}22`;
  const borderColor = boosted ? 'rgba(239,68,68,0.5)' : Colors.border.subtle;
  const titleColor = disabled ? Colors.text.muted : boosted ? '#ef4444' : color;

  return (
    <AnimatedTouchable
      style={[
        {
          flex: 1,
          backgroundColor: Colors.bg.secondary,
          borderRadius: 12,
          borderWidth: 1,
          borderColor,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          opacity: disabled ? 0.5 : 1,
        },
        animatedStyle,
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 15, stiffness: 400 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 400 }); }}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {/* Icon bubble */}
      <View style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: iconBg,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {shouldAnimate ? (
          <Animated.View style={iconStyle}>
            <NucleoIcon name={resolvedIconName} size={26} />
          </Animated.View>
        ) : (
          <NucleoIcon name={resolvedIconName} size={26} />
        )}
      </View>

      {/* Text */}
      <View style={{ flex: 1 }}>
        <Text style={{ color: titleColor, fontSize: 14, fontWeight: '600' }}>
          {title}
        </Text>
        <Text style={{ color: Colors.text.muted, fontSize: 12, marginTop: 2 }}>
          {subtitle}
        </Text>
      </View>

      {/* Badge */}
      {badge !== undefined && badge > 0 && (
        <View style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: color,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text style={{ color: Colors.text.primary, fontSize: 11, fontWeight: '700' }}>{badge}</Text>
        </View>
      )}
    </AnimatedTouchable>
  );
}
