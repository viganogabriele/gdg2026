/**
 * Quick Actions — Challenge and Review action buttons
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing, Shadow } from '@/constants/theme';

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
    <View style={styles.container}>
      <ActionButton
        icon="⚔️"
        title="Take Challenge"
        subtitle={challengeAvailable ? 'Test your knowledge' : 'No challenge available'}
        onPress={onTakeChallenge}
        disabled={!challengeAvailable}
        color={Colors.accent.primary}
      />
      <ActionButton
        icon="🧠"
        title="Quick Review"
        subtitle={hasDueReviews ? `${dueReviewCount} cards due` : 'No reviews due'}
        onPress={onQuickReview}
        disabled={!hasDueReviews}
        color={Colors.accent.secondary}
        badge={hasDueReviews ? dueReviewCount : undefined}
      />
    </View>
  );
}

function ActionButton({
  icon,
  title,
  subtitle,
  onPress,
  disabled,
  color,
  badge,
}: {
  icon: string;
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
      style={[
        styles.actionBtn,
        { borderColor: disabled ? Colors.border.subtle : `${color}44` },
        disabled && styles.disabledBtn,
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
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={[styles.actionTitle, disabled && styles.disabledText]}>
        {title}
      </Text>
      <Text style={styles.actionSubtitle}>{subtitle}</Text>
      {badge !== undefined && badge > 0 && (
        <View style={[styles.badge, { backgroundColor: color }]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: Colors.bg.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: Spacing.sm,
  },
  actionTitle: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  disabledText: {
    color: Colors.text.muted,
  },
  actionSubtitle: {
    color: Colors.text.muted,
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: Colors.text.primary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
});
