import { Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

const typeClasses: Record<string, string> = {
  default: 'text-[16px] leading-[24px]',
  defaultSemiBold: 'text-[16px] leading-[24px] font-semibold',
  title: 'text-[32px] font-bold leading-[32px]',
  subtitle: 'text-[20px] font-bold',
  link: 'text-[16px] leading-[30px] text-[#0a7ea4]',
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  className,
  ...rest
}: ThemedTextProps & { className?: string }) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      className={`${typeClasses[type] || ''} ${className || ''}`}
      style={[{ color }, style]}
      {...rest}
    />
  );
}
