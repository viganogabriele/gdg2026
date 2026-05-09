/**
 * Onboarding Step 6 — Roadmap Reveal with animated level cascade
 */
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import Animated, {
  FadeInDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { useStudyStore } from '@/hooks/useStudyStore';
import * as api from '@/services/api';
import { Colors } from '@/constants/theme';

export default function RoadmapRevealScreen() {
  const store = useStudyStore();
  const [loading, setLoading] = useState(true);
  const [levels, setLevels] = useState<any[]>([]);

  useEffect(() => {
    async function generateRoadmap() {
      try {
        const subject = {
          id: 'subject_1',
          title: store.onboardingData.subjectTitle,
          sources: store.onboardingData.sources,
          deadline: store.onboardingData.deadline,
          hoursPerWeek: store.onboardingData.hoursPerWeek,
          createdAt: new Date().toISOString(),
          currentLevel: 1,
          totalLevels: 0,
        };

        const result = await api.generateRoadmap(
          subject,
          store.onboardingData.sections,
          store.onboardingData.assessmentScore
        );

        subject.totalLevels = result.levels.length;
        const activeLevel = result.levels.find((l) => l.status === 'active');
        subject.currentLevel = activeLevel?.levelNumber || 1;

        store.completeOnboarding(subject, result.levels, result.dailyObjectives);
        setLevels(result.levels);
      } catch (error) {
        console.error('Roadmap generation error:', error);
      } finally {
        setLoading(false);
      }
    }
    generateRoadmap();
  }, []);

  const handleStart = () => {
    router.replace('/(tabs)');
  };

  const score = Math.round(store.onboardingData.assessmentScore * 100);

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 48 }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(200)} className="items-center">
          <View className="mb-lg">
            <Ionicons name="school-outline" size={64} color={Colors.accent.xp} />
          </View>
          <Text className="text-text-primary text-xxl font-bold text-center">Your Study Plan is Ready!</Text>
          <Text className="text-text-secondary text-md text-center mt-sm mb-xxxl">
            Assessment score: {score}% — {score >= 70 ? 'Great foundation!' : score >= 40 ? 'Good start!' : "We'll build you up!"}
          </Text>
        </Animated.View>

        {/* Level List */}
        <View className="gap-md">
          {levels.map((level, i) => (
            <Animated.View
              key={level.id}
              entering={FadeInDown.delay(400 + i * 150)}
              className={`flex-row items-center bg-bg-secondary rounded-md p-lg border gap-md ${
                level.status === 'active' ? 'border-accent-primary border-[1.5px]' : 'border-border-subtle'
              }`}
            >
              <View className="w-[36px] h-[36px] rounded-[18px] items-center justify-center" style={{
                backgroundColor: level.status === 'completed'
                  ? Colors.accent.success
                  : level.status === 'active'
                  ? Colors.accent.primary
                  : Colors.bg.tertiary,
              }}>
                <Text className="text-text-primary text-sm font-bold">{level.levelNumber}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-text-primary text-md font-semibold">{level.title}</Text>
                <View className="flex-row items-center gap-xs mt-[2px]">
                  <Ionicons
                    name={
                      level.status === 'completed' ? 'checkmark-circle'
                      : level.status === 'active' ? 'book-outline'
                      : 'lock-closed'
                    }
                    size={12}
                    color={Colors.text.muted}
                  />
                  <Text className="text-text-muted text-xs">
                    {level.status === 'completed' ? 'Already known' :
                     level.status === 'active' ? 'Start here' : 'Locked'}
                  </Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeInDown.delay(400 + levels.length * 150)} className="mt-xxxl pb-xxl">
          <Button
            title="Start Studying!"
            icon={<Ionicons name="rocket-outline" size={18} color={Colors.text.primary} />}
            onPress={handleStart}
            fullWidth
            size="lg"
            loading={loading}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
