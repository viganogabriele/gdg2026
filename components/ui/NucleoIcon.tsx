import { Image, ImageStyle } from 'expo-image';
import React from 'react';
import { StyleProp } from 'react-native';

export const NUCLEO_ICONS = {
  award: require('@/assets/svg/nucleo-glass/icon-award.svg'),
  bell: require('@/assets/svg/nucleo-glass/icon-bell.svg'),
  'book-open': require('@/assets/svg/nucleo-glass/icon-book-open.svg'),
  calendar: require('@/assets/svg/nucleo-glass/icon-calendar.svg'),
  'circle-check': require('@/assets/svg/nucleo-glass/icon-circle-check.svg'),
  dial: require('@/assets/svg/nucleo-glass/icon-dial.svg'),
  'face-grin': require('@/assets/svg/nucleo-glass/icon-face-grin.svg'),
  flame: require('@/assets/svg/nucleo-glass/icon-flame.svg'),
  'flame-fire': require('@/assets/svg/nucleo-glass/icon-flame-fire.svg'),
  folder: require('@/assets/svg/nucleo-glass/icon-folder.svg'),
  house: require('@/assets/svg/nucleo-glass/icon-house.svg'),
  link: require('@/assets/svg/nucleo-glass/icon-link.svg'),
  lock: require('@/assets/svg/nucleo-glass/icon-lock.svg'),
  rocket: require('@/assets/svg/nucleo-glass/icon-rocket.svg'),
  'rocket-red': require('@/assets/svg/nucleo-glass/icon-rocket-red.svg'),
  sparkle: require('@/assets/svg/nucleo-glass/icon-sparkle.svg'),
  'sparkle-yellow': require('@/assets/svg/nucleo-glass/icon-sparkle-yellow.svg'),
  star: require('@/assets/svg/nucleo-glass/icon-star.svg'),
  'star-xp': require('@/assets/svg/nucleo-glass/icon-star-xp.svg'),
} as const;

export type NucleoIconName = keyof typeof NUCLEO_ICONS;

interface NucleoIconProps {
  name: NucleoIconName;
  size?: number;
  color?: string;
  className?: string;
  style?: StyleProp<ImageStyle>;
}

export function NucleoIcon({ name, size = 24, color, className, style }: NucleoIconProps) {
  const iconSource = NUCLEO_ICONS[name];

  return (
    <Image
      source={iconSource}
      className={className}
      style={[{ width: size, height: size }, color ? { tintColor: color } : undefined, style]}
      contentFit="contain"
    />
  );
}
