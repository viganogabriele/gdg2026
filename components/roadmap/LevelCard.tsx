/**
 * Level Card — expandable card for roadmap timeline
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing, Shadow } from '@/constants/theme';
import type { StudyLevel } from '@/types';

interface LevelCardProps {
  level: StudyLevel;
  onPress: () => void;
  onTakeQuiz: () => void;
}

export function LevelCard({ level, onPress, onTakeQuiz }: LevelCardProps) {
  const [expanded, setExpanded] = useState(false);
  const expandHeight = useSharedValue(0);

  const toggleExpand = () => {
    setExpanded(!expanded);
    expandHeight.value = withTiming(expanded ? 0 : 1, { duration: 300 });
  };

  const expandStyle = useAnimatedStyle(() => ({
    maxHeight: expandHeight.value * 300,
    opacity: expandHeight.value,
  }));

  const statusConfig = {
    locked: { color: Colors.text.muted, icon: '🔒', label: 'Locked' },
    active: { color: Colors.accent.primary, icon: '📖', label: 'In Progress' },
    completed: { color: Colors.accent.success, icon: '✅', label: 'Completed' },
    failed: { color: Colors.accent.danger, icon: '❌', label: 'Needs Review' },
  }[level.status];

  const progress =
    level.requiredStudyMinutes > 0
      ? level.completedStudyMinutes / level.requiredStudyMinutes
      : 0;

  const deadlineDate = new Date(level.deadline);
  const daysLeft = Math.ceil(
    (deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <TouchableOpacity
      style={[
        styles.container,
        level.status === 'active' && styles.activeContainer,
        level.status === 'completed' && styles.completedContainer,
      ]}
      onPress={toggleExpand}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.levelBadge}>
          <Text style={[styles.levelNumber, { color: statusConfig.color }]}>
            {level.levelNumber}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.title} numberOfLines={1}>
            {level.title}
          </Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusIcon}>{statusConfig.icon}</Text>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
            {level.status !== 'completed' && level.status !== 'locked' && (
              <Text style={styles.deadline}>
                {daysLeft > 0 ? `${daysLeft}d left` : 'Due today'}
              </Text>
            )}
          </View>
        </View>
        <Text style={styles.expandArrow}>{expanded ? '▲' : '▼'}</Text>
      </View>

      {/* Progress Bar */}
      {level.status !== 'locked' && (
        <View style={styles.progressContainer}>
          <ProgressBar
            progress={progress}
            height={6}
            color={statusConfig.color}
            showPercentage={false}
          />
        </View>
      )}

      {/* Expanded Content */}
      <Animated.View style={[styles.expandedContent, expandStyle]}>
        {level.topics.map((topic) => (
          <View key={topic.id} style={styles.topicItem}>
            <Text style={styles.topicBullet}>
              {topic.completed ? '✓' : '○'}
            </Text>
            <View style={styles.topicInfo}>
              <Text
                style={[
                  styles.topicTitle,
                  topic.completed && styles.topicCompleted,
                ]}
              >
                {topic.title}
              </Text>
              {topic.arguments.map((arg, i) => (
                <Text key={i} style={styles.topicArg}>
                  • {arg}
                </Text>
              ))}
              {topic.sourceRefs.map((ref, i) => (
                <Text key={i} style={styles.sourceRef}>
                  📎 {ref.label}
                </Text>
              ))}
            </View>
          </View>
        ))}

        {/* Actions */}
        {(level.status === 'active' || level.status === 'failed') && (
          <TouchableOpacity style={styles.quizBtn} onPress={onTakeQuiz}>
            <Text style={styles.quizBtnText}>
              {level.status === 'failed' ? 'Retry Quiz' : 'Take Level Quiz'}
            </Text>
          </TouchableOpacity>
        )}

        {level.completedAt && (
          <Text style={styles.completedDate}>
            Completed {new Date(level.completedAt).toLocaleDateString()}
          </Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bg.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    marginBottom: Spacing.md,
  },
  activeContainer: {
    borderColor: Colors.accent.primary,
    ...Shadow.sm,
  },
  completedContainer: {
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  levelBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bg.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border.medium,
  },
  levelNumber: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },
  statusIcon: {
    fontSize: 12,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  deadline: {
    color: Colors.text.muted,
    fontSize: FontSize.xs,
    marginLeft: 'auto',
  },
  expandArrow: {
    color: Colors.text.muted,
    fontSize: 10,
  },
  progressContainer: {
    marginTop: Spacing.md,
  },
  expandedContent: {
    overflow: 'hidden',
    marginTop: Spacing.md,
  },
  topicItem: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  topicBullet: {
    color: Colors.accent.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    width: 20,
    textAlign: 'center',
  },
  topicInfo: {
    flex: 1,
  },
  topicTitle: {
    color: Colors.text.primary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginBottom: 4,
  },
  topicCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.text.muted,
  },
  topicArg: {
    color: Colors.text.secondary,
    fontSize: FontSize.xs,
    marginLeft: Spacing.sm,
    marginBottom: 2,
  },
  sourceRef: {
    color: Colors.accent.secondary,
    fontSize: FontSize.xs,
    marginTop: 4,
  },
  quizBtn: {
    backgroundColor: Colors.accent.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  quizBtnText: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  completedDate: {
    color: Colors.text.muted,
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
