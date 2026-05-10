/**
 * Styled Button — Primary/Secondary/Ghost variants with animations
 */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors, Spacing } from '@/constants/theme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  fullWidth = false,
}: ButtonProps) {
  const scale = useSharedValue(1);
  const { isWide } = useResponsiveLayout();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const variantStyles = getVariantStyles(variant);
  const sizeStyles = getSizeStyles(size);

  return (
    <AnimatedTouchable
      className={`flex-row items-center justify-center rounded-md ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50' : ''}`}
      style={[
        variantStyles.container,
        sizeStyles.container,
        animatedStyle,
        fullWidth && isWide ? { maxWidth: 480, alignSelf: 'center' as const } : undefined,
        style,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variantStyles.textColor}
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text
            className="font-semibold text-center"
            style={[
              { color: variantStyles.textColor },
              sizeStyles.text,
              icon ? { marginLeft: Spacing.sm } : undefined,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </AnimatedTouchable>
  );
}

function getVariantStyles(variant: ButtonVariant): {
  container: ViewStyle;
  textColor: string;
} {
  switch (variant) {
    case 'primary':
      return {
        container: { backgroundColor: Colors.accent.primary },
        textColor: Colors.text.primary,
      };
    case 'secondary':
      return {
        container: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.accent.primary },
        textColor: Colors.accent.primary,
      };
    case 'ghost':
      return {
        container: { backgroundColor: 'transparent' },
        textColor: Colors.text.secondary,
      };
    case 'danger':
      return {
        container: { backgroundColor: Colors.accent.danger },
        textColor: Colors.text.primary,
      };
    case 'success':
      return {
        container: { backgroundColor: Colors.accent.success },
        textColor: Colors.text.inverse,
      };
  }
}

function getSizeStyles(size: ButtonSize): {
  container: ViewStyle;
  text: TextStyle;
} {
  switch (size) {
    case 'sm':
      return {
        container: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg },
        text: { fontSize: 13 },
      };
    case 'md':
      return {
        container: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl },
        text: { fontSize: 15 },
      };
    case 'lg':
      return {
        container: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xxl },
        text: { fontSize: 17 },
      };
  }
}
