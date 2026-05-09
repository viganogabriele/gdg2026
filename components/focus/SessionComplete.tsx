/**
 * Session Complete — overlay showing study session summary
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

interface SessionCompleteProps {
  durationMinutes: number;
  pointsEarned: number;
  streakDay: number;
  onDismiss: () => void;
}

export function SessionComplete({
  durationMinutes, pointsEarned, streakDay, onDismiss,
}: SessionCompleteProps) {
  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.emoji}>🎯</Text>
        <Text style={styles.title}>Session Complete!</Text>

        <View style={styles.stats}>
          <StatItem icon="⏱" label="Time Studied" value={`${durationMinutes} min`} />
          <StatItem icon="⭐" label="XP Earned" value={`+${pointsEarned}`} />
          <StatItem icon="🔥" label="Streak" value={`${streakDay} days`} />
        </View>

        <Button title="Done" onPress={onDismiss} fullWidth size="lg" />
      </View>
    </View>
  );
}

function StatItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: Colors.bg.overlay, justifyContent: 'center', alignItems: 'center', padding: Spacing.xxl },
  card: { backgroundColor: Colors.bg.secondary, borderRadius: BorderRadius.xl, padding: Spacing.xxxl, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: Colors.border.medium },
  emoji: { fontSize: 64, marginBottom: Spacing.lg },
  title: { color: Colors.text.primary, fontSize: FontSize.xxl, fontWeight: FontWeight.bold, marginBottom: Spacing.xxl },
  stats: { width: '100%', gap: Spacing.md, marginBottom: Spacing.xxl },
  statItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg.tertiary, borderRadius: BorderRadius.md, padding: Spacing.lg },
  statIcon: { fontSize: 20, marginRight: Spacing.md },
  statLabel: { color: Colors.text.secondary, fontSize: FontSize.md, flex: 1 },
  statValue: { color: Colors.text.primary, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
});
