/**
 * Timeline View — vertical timeline connector for roadmap levels
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LevelCard } from './LevelCard';
import { Colors, Spacing, FontSize, FontWeight } from '@/constants/theme';
import type { StudyLevel } from '@/types';

interface TimelineViewProps {
  levels: StudyLevel[];
  onLevelPress: (level: StudyLevel) => void;
  onTakeQuiz: (level: StudyLevel) => void;
}

export function TimelineView({ levels, onLevelPress, onTakeQuiz }: TimelineViewProps) {
  const completedCount = levels.filter((l) => l.status === 'completed').length;
  const totalCount = levels.length;
  const overallProgress = totalCount > 0 ? completedCount / totalCount : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Overall Progress Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Study Roadmap</Text>
        <Text style={styles.headerProgress}>
          {completedCount} / {totalCount} levels completed
        </Text>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${overallProgress * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* Timeline */}
      {levels.map((level, index) => (
        <View key={level.id} style={styles.timelineItem}>
          {/* Timeline connector line */}
          <View style={styles.connector}>
            {index > 0 && (
              <View
                style={[
                  styles.lineTop,
                  {
                    backgroundColor:
                      level.status === 'completed' || levels[index - 1]?.status === 'completed'
                        ? Colors.accent.success
                        : Colors.border.subtle,
                  },
                ]}
              />
            )}
            <View
              style={[
                styles.dot,
                {
                  backgroundColor:
                    level.status === 'completed'
                      ? Colors.accent.success
                      : level.status === 'active'
                      ? Colors.accent.primary
                      : Colors.bg.tertiary,
                  borderColor:
                    level.status === 'completed'
                      ? Colors.accent.success
                      : level.status === 'active'
                      ? Colors.accent.primary
                      : Colors.border.medium,
                },
              ]}
            />
            {index < levels.length - 1 && (
              <View
                style={[
                  styles.lineBottom,
                  {
                    backgroundColor:
                      level.status === 'completed'
                        ? Colors.accent.success
                        : Colors.border.subtle,
                  },
                ]}
              />
            )}
          </View>

          {/* Level Card */}
          <View style={styles.cardWrapper}>
            <LevelCard
              level={level}
              onPress={() => onLevelPress(level)}
              onTakeQuiz={() => onTakeQuiz(level)}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.huge,
  },
  header: {
    marginBottom: Spacing.xxl,
    paddingTop: Spacing.lg,
  },
  headerTitle: {
    color: Colors.text.primary,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
  },
  headerProgress: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.bg.tertiary,
    borderRadius: 2,
    marginTop: Spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent.success,
    borderRadius: 2,
  },
  timelineItem: {
    flexDirection: 'row',
  },
  connector: {
    width: 24,
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  lineTop: {
    width: 2,
    flex: 1,
    minHeight: 12,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  lineBottom: {
    width: 2,
    flex: 1,
    minHeight: 12,
  },
  cardWrapper: {
    flex: 1,
  },
});
