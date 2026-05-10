import { NucleoIcon } from '@/components/ui/NucleoIcon';
import { Colors } from '@/constants/theme';
import { LeaderboardEntry } from '@/services/leaderboard';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { MEDAL } from './MedalConfig';

interface PodiumViewProps {
  top3: LeaderboardEntry[];
}

const HEIGHTS = { 1: 180, 2: 140, 3: 110 } as const;
const VISUAL_ORDER: (1 | 2 | 3)[] = [2, 1, 3];
const DELAYS = { 1: 0, 2: 200, 3: 400 };

function FloatingIcon({ rank }: { rank: 1 | 2 | 3 }) {
  const medal = MEDAL[rank];
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      DELAYS[rank],
      withRepeat(
        withSequence(
          withTiming(-6, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  return (
    <Animated.View style={animStyle}>
      <NucleoIcon name={medal.icon} size={32} />
    </Animated.View>
  );
}

export function PodiumView({ top3 }: PodiumViewProps) {
  return (
    <View className="flex-row items-end justify-center gap-md mb-xxl" style={{ height: 220 }}>
      {VISUAL_ORDER.map((rank) => {
        const entry = top3[rank - 1];
        if (!entry) return null;
        const medal = MEDAL[rank];
        return (
          <View key={entry.id} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
            <Text className="text-text-primary font-bold text-sm mb-xs" numberOfLines={1}>
              {entry.name}
            </Text>
            <Text style={{ color: medal.text, fontWeight: '700', fontSize: 12, marginBottom: 4 }}>
              {entry.xp} XP
            </Text>
            <View
              style={{
                width: '100%',
                height: HEIGHTS[rank],
                backgroundColor: medal.bg,
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
                borderWidth: 1.5,
                borderColor: medal.border,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                shadowColor: medal.border,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 12,
                elevation: 10,
              }}
            >
              <FloatingIcon rank={rank} />
              <Text style={{ color: medal.text, fontWeight: '800', fontSize: 18 }}>#{rank}</Text>
              {entry.isMe && (
                <View
                  style={{
                    position: 'absolute', top: 6, right: 6,
                    backgroundColor: Colors.accent.primary,
                    borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2,
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>TU</Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}
