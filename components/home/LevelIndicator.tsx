/**
 * Level Indicator — single gradient ring for XP progress
 */
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { NucleoIcon } from '@/components/ui/NucleoIcon';
import { Colors } from '@/constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const GRADIENT: [string, string, string] = ['#9333ea', '#36c6e2', '#1156ae'];

const SIZE = 160;
const STROKE = 10;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

interface LevelIndicatorProps {
  currentLevel: number;
  totalLevels: number;
  levelTitle: string;
  completedMinutes: number;
  requiredMinutes: number;
  deadline: string;
  totalDays: number;
  totalPoints: number;
}

export function LevelIndicator({
  currentLevel,
  totalLevels,
  levelTitle,
  completedMinutes,
  requiredMinutes,
  deadline,
  totalDays,
  totalPoints,
}: LevelIndicatorProps) {
  const daysLeft = Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  const daysElapsed = Math.min(totalDays - daysLeft + 1, totalDays);
  const xpProgress = Math.max(0, daysElapsed / totalDays);

  const anim = useSharedValue(0);

  useEffect(() => {
    anim.value = withTiming(xpProgress, { duration: 1000, easing: Easing.bezierFn(0.25, 0.1, 0.25, 1) });
  }, [xpProgress]);

  const animProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRC * (1 - anim.value),
  }));

  return (
    <View style={{ alignItems: 'center', paddingVertical: 16 }}>
      <Text style={{ color: Colors.text.muted, fontSize: 11, fontWeight: '600', letterSpacing: 2, marginBottom: 12 }}>
        LEVEL {currentLevel} / {totalLevels}
      </Text>

      <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {/* Days left badge */}
        <View style={{
          position: 'absolute', top: 4, right: 0, zIndex: 1,
          backgroundColor: Colors.bg.tertiary,
          borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4,
          borderWidth: 1, borderColor: Colors.border.subtle,
          flexDirection: 'row', alignItems: 'center', gap: 3,
        }}>
          <Text style={{ color: Colors.accent.primary, fontSize: 12, fontWeight: '700' }}>{daysLeft}</Text>
          <Text style={{ color: Colors.text.muted, fontSize: 10, fontWeight: '500' }}>days left</Text>
        </View>

        <Svg width={SIZE} height={SIZE} style={{ position: 'absolute' }}>
          <Defs>
            <LinearGradient id="grad_xp" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={GRADIENT[0]} />
              <Stop offset="0.5" stopColor={GRADIENT[1]} />
              <Stop offset="1" stopColor={GRADIENT[2]} />
            </LinearGradient>
          </Defs>
          <Circle cx={CX} cy={CY} r={R} stroke={Colors.bg.tertiary} strokeWidth={STROKE} fill="none" />
          <AnimatedCircle
            cx={CX} cy={CY} r={R}
            stroke="url(#grad_xp)" strokeWidth={STROKE} fill="none"
            strokeDasharray={CIRC} animatedProps={animProps}
            strokeLinecap="round"
            transform={`rotate(-90, ${CX}, ${CY})`}
          />
        </Svg>

        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: Colors.text.primary, fontSize: 42, fontWeight: '800', lineHeight: 46 }}>
            {currentLevel}
          </Text>
          <Text style={{ color: Colors.accent.primary, fontSize: 10, fontWeight: '700', letterSpacing: 2 }}>
            LEVEL
          </Text>
        </View>
      </View>

      {/* XP label */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 }}>
        <NucleoIcon name="star-xp" size={16} />
        <Text style={{ color: Colors.accent.xp, fontSize: 16, fontWeight: '700' }}>{totalPoints} XP</Text>
      </View>

      <Text style={{ color: Colors.text.primary, fontSize: 18, fontWeight: '700', marginTop: 8 }} numberOfLines={1}>
        {levelTitle}
      </Text>
      <Text style={{ color: Colors.text.secondary, fontSize: 13, marginTop: 4 }}>
        {completedMinutes} / {requiredMinutes} min studied
      </Text>
    </View>
  );
}
