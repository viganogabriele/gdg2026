/**
 * Badge Display — icon with glow effect and locked/unlocked states.
 * Tap a badge to open an animated popup card with description.
 */
import React, { useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import { NucleoIcon, NucleoIconName } from '@/components/ui/NucleoIcon';
import { Colors, Shadow, BorderRadius } from '@/constants/theme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

interface BadgeDisplayProps {
  icon: string;
  title: string;
  description?: string;
  earned: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function BadgeDisplay({
  icon,
  title,
  description,
  earned,
  size = 'md',
}: BadgeDisplayProps) {
  const [visible, setVisible] = useState(false);
  const { isDesktop } = useResponsiveLayout();

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const sizeConfig = {
    sm: { icon: isDesktop ? 24 : 20, container: isDesktop ? 56 : 48 },
    md: { icon: isDesktop ? 32 : 28, container: isDesktop ? 72 : 64 },
    lg: { icon: isDesktop ? 40 : 36, container: isDesktop ? 88 : 80 },
  }[size];

  const openModal = () => {
    if (!description) return;
    scaleAnim.setValue(0.6);
    opacityAnim.setValue(0);
    backdropOpacity.setValue(0);
    setVisible(true);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 65,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.6,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => setVisible(false));
  };

  return (
    <>
      {/* Badge tile */}
      <Pressable
        onPress={openModal}
        style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}
      >
        <View style={{ alignItems: 'center', width: '100%' }}>
          {/* Icon container */}
          <View
            style={[
              {
                width: sizeConfig.container,
                height: sizeConfig.container,
                borderRadius: BorderRadius.lg,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1.5,
                backgroundColor: earned ? Colors.bg.tertiary : Colors.bg.secondary,
                borderColor: earned ? '#FFD000' : Colors.border.subtle,
                opacity: earned ? 1 : 0.5,
              },
              earned && { ...Shadow.glow, shadowColor: '#FFD000' },
            ]}
          >
            <NucleoIcon
              name={icon as NucleoIconName}
              size={sizeConfig.icon}
              style={!earned ? { opacity: 0.25, tintColor: '#b8bbd6' } : undefined}
            />
          </View>

          {/* Title — always centered */}
          <Text
            style={{
              marginTop: 6,
              textAlign: 'center',
              fontWeight: '500',
              fontSize: size === 'sm' ? 11 : size === 'lg' ? 15 : 13,
              color: earned ? Colors.text.primary : Colors.text.muted,
            }}
            numberOfLines={2}
          >
            {title}
          </Text>
        </View>
      </Pressable>

      {/* Popup Modal */}
      <Modal transparent visible={visible} onRequestClose={closeModal} statusBarTranslucent>
        {/* Backdrop */}
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.65)',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: backdropOpacity,
          }}
        >
          <Pressable
            style={{ position: 'absolute', inset: 0 } as any}
            onPress={closeModal}
          />

          {/* Animated card */}
          <Animated.View
            style={{
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
              width: 280,
              borderRadius: 20,
              borderWidth: 1.5,
              borderColor: earned ? '#FFD000' : Colors.border.subtle,
              backgroundColor: Colors.bg.overlay,
              padding: 28,
              alignItems: 'center',
              ...(earned
                ? { ...Shadow.glow, shadowColor: '#FFD000', shadowOpacity: 0.45, shadowRadius: 20 }
                : Shadow.lg),
            }}
          >
            {/* Large icon */}
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1.5,
                borderColor: earned ? '#FFD000' : Colors.border.subtle,
                backgroundColor: earned ? Colors.bg.tertiary : Colors.bg.secondary,
                marginBottom: 16,
                ...(earned ? { ...Shadow.glow, shadowColor: '#FFD000' } : {}),
              }}
            >
              <NucleoIcon
                name={icon as NucleoIconName}
                size={40}
                style={!earned ? { opacity: 0.25, tintColor: '#b8bbd6' } : undefined}
              />
            </View>

            {/* Status pill */}
            <View
              style={{
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 4,
                backgroundColor: earned
                  ? 'rgba(255,208,0,0.15)'
                  : 'rgba(184,187,214,0.10)',
                borderWidth: 1,
                borderColor: earned ? '#FFD000' : Colors.border.subtle,
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '600',
                  color: earned ? '#FFD000' : Colors.text.muted,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                }}
              >
                {earned ? '✦ Earned' : '🔒 Locked'}
              </Text>
            </View>

            {/* Title */}
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: Colors.text.primary,
                textAlign: 'center',
                marginBottom: 8,
              }}
            >
              {title}
            </Text>

            {/* Description */}
            {description && (
              <Text
                style={{
                  fontSize: 13,
                  color: Colors.text.muted,
                  textAlign: 'center',
                  lineHeight: 20,
                }}
              >
                {description}
              </Text>
            )}

            {/* Close button */}
            <Pressable
              onPress={closeModal}
              style={({ pressed }) => ({
                marginTop: 24,
                borderRadius: 999,
                paddingHorizontal: 28,
                paddingVertical: 10,
                backgroundColor: earned
                  ? 'rgba(255,208,0,0.18)'
                  : Colors.bg.tertiary,
                borderWidth: 1,
                borderColor: earned ? '#FFD000' : Colors.border.subtle,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: earned ? '#FFD000' : Colors.text.muted,
                }}
              >
                Close
              </Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </Modal>
    </>
  );
}

