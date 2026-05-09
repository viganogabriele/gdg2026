/**
 * Daily Objectives — scrollable card list with source refs and completion
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';
import type { DailyObjective } from '@/types';

interface DailyObjectivesProps {
  objectives: DailyObjective[];
  onComplete: (id: string) => void;
  onPress: (objective: DailyObjective) => void;
}

export function DailyObjectives({
  objectives,
  onComplete,
  onPress,
}: DailyObjectivesProps) {
  const typeIcons: Record<string, string> = {
    study: '📖',
    review: '🔄',
    quiz: '❓',
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Today's Objectives</Text>
      {objectives.map((obj) => (
        <TouchableOpacity key={obj.id} onPress={() => onPress(obj)} activeOpacity={0.7}>
          <Card style={[styles.card, obj.completed && styles.completedCard]}>
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.checkbox, obj.completed && styles.checkedBox]}
                onPress={() => onComplete(obj.id)}
              >
                {obj.completed && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
              <View style={styles.content}>
                <View style={styles.titleRow}>
                  <Text style={styles.icon}>{typeIcons[obj.type]}</Text>
                  <Text
                    style={[styles.title, obj.completed && styles.completedText]}
                    numberOfLines={1}
                  >
                    {obj.title}
                  </Text>
                </View>
                <Text style={styles.description} numberOfLines={2}>
                  {obj.description}
                </Text>
                <View style={styles.meta}>
                  <Text style={styles.time}>⏱ {obj.estimatedMinutes} min</Text>
                  {obj.sourceRefs.length > 0 && (
                    <Text style={styles.source} numberOfLines={1}>
                      📎 {obj.sourceRefs[0].label}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      ))}
      {objectives.length === 0 && (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>🎉 All done for today!</Text>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    color: Colors.text.primary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs,
  },
  card: {
    marginBottom: Spacing.xs,
  },
  completedCard: {
    opacity: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkedBox: {
    backgroundColor: Colors.accent.primary,
  },
  checkmark: {
    color: Colors.text.primary,
    fontSize: 14,
    fontWeight: FontWeight.bold,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  icon: {
    fontSize: 16,
  },
  title: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: Colors.text.muted,
  },
  description: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
    lineHeight: 18,
  },
  meta: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  time: {
    color: Colors.text.muted,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  source: {
    color: Colors.accent.secondary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    flex: 1,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    color: Colors.text.secondary,
    fontSize: FontSize.md,
  },
});
