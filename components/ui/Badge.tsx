/**
 * Badge Display — icon with glow effect and locked/unlocked states
 */
import React from 'react';
import { View, Text } from 'react-native';
import { NucleoIcon, NucleoIconName } from '@/components/ui/NucleoIcon';
import { Colors, Shadow } from '@/constants/theme';

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
  const sizeConfig = {
    sm: { icon: 20, container: 48 },
    md: { icon: 28, container: 64 },
    lg: { icon: 36, container: 80 },
  }[size];

  return (
    <View className="items-center w-full">
      <View
        className={`rounded-lg items-center justify-center border-[1.5px] ${
          earned
            ? 'bg-bg-tertiary'
            : 'bg-bg-secondary border-border-subtle opacity-50'
        }`}
        style={[
          { width: sizeConfig.container, height: sizeConfig.container },
          earned && { ...Shadow.glow, borderColor: '#FFD000', shadowColor: '#FFD000' },
        ]}
      >
        <NucleoIcon
          name={icon as NucleoIconName}
          size={sizeConfig.icon}
          style={!earned ? { opacity: 0.25, tintColor: '#b8bbd6' } : undefined}
        />
      </View>
      <Text
        className={`font-medium mt-xs text-center ${earned ? 'text-text-primary' : 'text-text-muted'} ${
          size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-md' : 'text-sm'
        }`}
        numberOfLines={1}
      >
        {title}
      </Text>
      {description && (
        <Text className="text-text-muted text-xs text-center mt-[2px]" numberOfLines={2}>
          {description}
        </Text>
      )}
    </View>
  );
}
