/**
 * Pomodoro Timer — circular countdown with pause/resume
 */
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';
import { ProgressCircle } from '@/components/ui/ProgressCircle';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { PomodoroDefaults } from '@/constants/gamification';

interface PomodoroTimerProps {
  onSessionComplete: (durationMinutes: number) => void;
}

export function PomodoroTimer({ onSessionComplete }: PomodoroTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(PomodoroDefaults.WORK_MINUTES * 60);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const totalStudied = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = isBreak
    ? (sessionsCompleted % PomodoroDefaults.SESSIONS_BEFORE_LONG_BREAK === 0
        ? PomodoroDefaults.LONG_BREAK_MINUTES
        : PomodoroDefaults.BREAK_MINUTES) * 60
    : PomodoroDefaults.WORK_MINUTES * 60;

  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => s - 1);
      }, 1000);
    } else if (secondsLeft <= 0) {
      if (!isBreak) {
        totalStudied.current += PomodoroDefaults.WORK_MINUTES;
        setSessionsCompleted((s) => s + 1);
        const breakMins = (sessionsCompleted + 1) % PomodoroDefaults.SESSIONS_BEFORE_LONG_BREAK === 0
          ? PomodoroDefaults.LONG_BREAK_MINUTES
          : PomodoroDefaults.BREAK_MINUTES;
        setIsBreak(true);
        setSecondsLeft(breakMins * 60);
      } else {
        setIsBreak(false);
        setSecondsLeft(PomodoroDefaults.WORK_MINUTES * 60);
      }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = 1 - secondsLeft / totalSeconds;

  const handleComplete = () => {
    setIsRunning(false);
    const elapsed = PomodoroDefaults.WORK_MINUTES - Math.ceil(secondsLeft / 60);
    onSessionComplete(totalStudied.current + (isBreak ? 0 : Math.max(elapsed, 0)));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.mode}>{isBreak ? '☕ Break Time' : '📖 Focus Time'}</Text>

      <View style={styles.timerWrapper}>
        <ProgressCircle
          progress={progress}
          size={220}
          strokeWidth={12}
          color={isBreak ? Colors.accent.success : Colors.accent.primary}
          showPercentage={false}
        />
        <View style={styles.timerContent}>
          <Text style={styles.time}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </Text>
          <Text style={styles.sessions}>Session {sessionsCompleted + 1}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title={isRunning ? 'Pause' : 'Start'}
          onPress={() => setIsRunning(!isRunning)}
          variant={isRunning ? 'secondary' : 'primary'}
          size="lg"
          fullWidth
        />
        {isBreak && (
          <Button title="Skip Break" variant="ghost" onPress={() => {
            setIsBreak(false);
            setSecondsLeft(PomodoroDefaults.WORK_MINUTES * 60);
          }} fullWidth />
        )}
        <Button title="Complete Session" variant="success" onPress={handleComplete} fullWidth />
      </View>

      <Text style={styles.totalTime}>
        Total studied: {totalStudied.current} min
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl },
  mode: { fontSize: FontSize.xl, color: Colors.text.primary, fontWeight: FontWeight.semibold, marginBottom: Spacing.xxl },
  timerWrapper: { alignItems: 'center', justifyContent: 'center', width: 220, height: 220, marginBottom: Spacing.xxxl },
  timerContent: { position: 'absolute', alignItems: 'center' },
  time: { fontSize: FontSize.display, color: Colors.text.primary, fontWeight: FontWeight.heavy, fontVariant: ['tabular-nums'] },
  sessions: { color: Colors.text.muted, fontSize: FontSize.sm, marginTop: Spacing.xs },
  actions: { width: '100%', gap: Spacing.md },
  totalTime: { color: Colors.text.muted, fontSize: FontSize.sm, marginTop: Spacing.xxl },
});
