/**
 * Styled Text Input — with floating label, focus animation, error state
 */
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  hint,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const borderOpacity = useSharedValue(0.15);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: error
      ? Colors.accent.danger
      : `rgba(108, 92, 231, ${borderOpacity.value})`,
  }));

  const handleFocus = (e: any) => {
    setIsFocused(true);
    borderOpacity.value = withTiming(0.6, { duration: 200 });
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    borderOpacity.value = withTiming(0.15, { duration: 200 });
    onBlur?.(e);
  };

  return (
    <View className="w-full" style={containerStyle}>
      {label && (
        <Text className={`text-sm font-medium mb-xs ${isFocused ? 'text-accent-primary' : 'text-text-secondary'}`}>
          {label}
        </Text>
      )}
      <Animated.View className="border-[1.5px] rounded-md bg-bg-secondary overflow-hidden" style={borderStyle}>
        <TextInput
          className="text-text-primary text-md px-lg py-md min-h-[48px]"
          placeholderTextColor={Colors.text.muted}
          selectionColor={Colors.accent.primary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={style}
          {...rest}
        />
      </Animated.View>
      {error && <Text className="text-accent-danger text-xs mt-xs">{error}</Text>}
      {hint && !error && <Text className="text-text-muted text-xs mt-xs">{hint}</Text>}
    </View>
  );
}
