/**
 * Level Indicator — two concentric gradient rings: outer = days, inner = XP
 */
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '@/constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const GRADIENT: [string, string, string] = ['#db57c3', '#36c6e2', '#1156ae'];

const SIZE = 170;
const OUTER_STROKE = 10;
const INNER_STROKE = 8;
const GAP = 10;
const CX = SIZE / 2;
const CY = SIZE / 2;
const OUTER_R = (SIZE - OUTER_STROKE) / 2;
const INNER_R = OUTER_R - OUTER_STROKE / 2 - GAP - INNER_STROKE / 2;
const OUTER_CIRC = 2 * Math.PI * OUTER_R;
const INNER_CIRC = 2 * Math.PI * INNER_R;

interface LevelIndicatorProps {
  currentLevel: number;
  totalLevels: number;
  levelTitle: string;
  completedMinutes: number;
  requiredMinutes: number;
  totalPoints: number;
  deadline: string;
  totalDays: number;
}

export function LevelIndicator({
  currentLevel,
  totalLevels,
  levelTitle,
  completedMinutes,
  requiredMinutes,
  totalPoints,
  deadline,
  totalDays,
}: LevelIndicatorProps) {
  const daysLeft = Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  const daysElapsed = Math.max(0, totalDays - daysLeft);
  const progress = totalDays > 0 ? Math.min(daysElapsed / totalDays, 1) : 0;
  const xpEarned = Math.round(progress * 100);

  const animDays = useSharedValue(0);
  const animXp = useSharedValue(0);

  useEffect(() => {
    const cfg = { duration: 1000, easing: Easing.bezierFn(0.25, 0.1, 0.25, 1) };
    animDays.value = withTiming(progress, cfg);
    animXp.value = withTiming(progress, cfg);
  }, [progress]);

  const daysAnimProps = useAnimatedProps(() => ({
    strokeDashoffset: OUTER_CIRC * (1 - animDays.value),
  }));
  const xpAnimProps = useAnimatedProps(() => ({
    strokeDashoffset: INNER_CIRC * (1 - animXp.value),
  }));

  return (
    <View style={{ alignItems: 'center', paddingVertical: 16 }}>
      {/* Rings */}
      <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={SIZE} height={SIZE} style={{ position: 'absolute' }}>
          <Defs>
            <LinearGradient id="grad_days" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={GRADIENT[0]} />
              <Stop offset="0.5" stopColor={GRADIENT[1]} />
              <Stop offset="1" stopColor={GRADIENT[2]} />
            </LinearGradient>
            <LinearGradient id="grad_xp" x1="1" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={GRADIENT[2]} />
              <Stop offset="0.5" stopColor={GRADIENT[1]} />
              <Stop offset="1" stopColor={GRADIENT[0]} />
            </LinearGradient>
          </Defs>
          {/* Outer track + progress (days) */}
          <Circle cx={CX} cy={CY} r={OUTER_R} stroke={Colors.bg.tertiary} strokeWidth={OUTER_STROKE} fill="none" />
          <AnimatedCircle cx={CX} cy={CY} r={OUTER_R} stroke="url(#grad_days)" strokeWidth={OUTER_STROKE} fill="none"
            strokeDasharray={OUTER_CIRC} animatedProps={daysAnimProps} strokeLinecap="round" rotation="-90" origin={`${CX}, ${CY}`} />
          {/* Inner track + progress (XP) */}
          <Circle cx={CX} cy={CY} r={INNER_R} stroke={Colors.bg.tertiary} strokeWidth={INNER_STROKE} fill="none" />
          <AnimatedCircle cx={CX} cy={CY} r={INNER_R} stroke="url(#grad_xp)" strokeWidth={INNER_STROKE} fill="none"
            strokeDasharray={INNER_CIRC} animatedProps={xpAnimProps} strokeLinecap="round" rotation="-90" origin={`${CX}, ${CY}`} />
        </Svg>

        {/* Center content */}
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: Colors.text.primary, fontSize: 42, fontWeight: '800', lineHeight: 46 }}>
            {currentLevel}
          </Text>
          <Text style={{ color: Colors.accent.primary, fontSize: 10, fontWeight: '700', letterSpacing: 2 }}>
            LEVEL
          </Text>
        </View>
      </View>

      {/* XP / Days labels */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24, marginTop: 12 }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: Colors.accent.xp, fontSize: 16, fontWeight: '700' }}>{xpEarned} / 100</Text>
          <Text style={{ color: Colors.text.muted, fontSize: 10, fontWeight: '600', letterSpacing: 1.5 }}>XP</Text>
        </View>
        <View style={{ width: 1, height: 28, backgroundColor: Colors.border.subtle }} />
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: Colors.accent.primary, fontSize: 16, fontWeight: '700' }}>{daysLeft}</Text>
          <Text style={{ color: Colors.text.muted, fontSize: 10, fontWeight: '600', letterSpacing: 1.5 }}>DAYS LEFT</Text>
        </View>
      </View>

      {/* Level title */}
      <Text style={{ color: Colors.text.primary, fontSize: 18, fontWeight: '700', marginTop: 12 }} numberOfLines={1}>
        {levelTitle}
      </Text>
      <Text style={{ color: Colors.text.secondary, fontSize: 13, marginTop: 4 }}>
        {completedMinutes} / {requiredMinutes} min studied
      </Text>
    </View>
  );
}
