/**
 * Styled Text Input — with floating label, focus animation, error state
 */
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

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
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, isFocused && styles.labelFocused]}>
          {label}
        </Text>
      )}
      <Animated.View style={[styles.inputContainer, borderStyle]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.text.muted}
          selectionColor={Colors.accent.primary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
      </Animated.View>
      {error && <Text style={styles.error}>{error}</Text>}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.xs,
  },
  labelFocused: {
    color: Colors.accent.primary,
  },
  inputContainer: {
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.bg.secondary,
    overflow: 'hidden',
  },
  input: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 48,
  },
  error: {
    color: Colors.accent.danger,
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
  },
  hint: {
    color: Colors.text.muted,
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
  },
});
