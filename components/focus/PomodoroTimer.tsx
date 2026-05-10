/**
 * Pomodoro Timer — circular countdown with pause/resume
 */
import { Button } from '@/components/ui/Button';
import { NucleoIcon } from '@/components/ui/NucleoIcon';
import { ProgressCircle } from '@/components/ui/ProgressCircle';
import { PomodoroDefaults } from '@/constants/gamification';
import { Colors } from '@/constants/theme';
import { useStudyStore } from '@/hooks/useStudyStore';
import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';

interface PomodoroTimerProps {
  onSessionComplete: (durationMinutes: number) => void;
  targetSessions?: number;
}

export function PomodoroTimer({ onSessionComplete, targetSessions }: PomodoroTimerProps) {
  const sessionFocusTime = useStudyStore((s) => s.sessionFocusTime);
  const incrementSessionFocusTime = useStudyStore((s) => s.incrementSessionFocusTime);

  const [isRunning, setIsRunning] = useState(true);
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
        incrementSessionFocusTime();
      }, 1000);
    } else if (secondsLeft <= 0) {
      if (!isBreak) {
        const newCompleted = sessionsCompleted + 1;
        totalStudied.current += PomodoroDefaults.WORK_MINUTES;
        setSessionsCompleted(newCompleted);

        if (targetSessions && newCompleted >= targetSessions) {
          setIsRunning(false);
          onSessionComplete(totalStudied.current);
          return;
        }

        const breakMins = newCompleted % PomodoroDefaults.SESSIONS_BEFORE_LONG_BREAK === 0
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
  }, [isRunning, secondsLeft, isBreak, sessionsCompleted, incrementSessionFocusTime, targetSessions, onSessionComplete]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = 1 - secondsLeft / totalSeconds;

  const handleComplete = () => {
    setIsRunning(false);
    const elapsed = PomodoroDefaults.WORK_MINUTES - Math.ceil(secondsLeft / 60);
    onSessionComplete(totalStudied.current + (isBreak ? 0 : Math.max(elapsed, 0)));
  };

  const formatTotalTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  return (
    <View className="flex-1 items-center justify-center w-full h-full p-3xl">
      <View className="flex-row items-center gap-xs mb-md">
        <NucleoIcon
          name={isBreak ? 'star' : 'book-open'}
          size={20}
        />
        <Text className="text-xl text-text-primary font-semibold">
          {isBreak ? 'Break Time' : 'Focus Time'}
        </Text>
      </View>

      <View className="items-center justify-center w-[200px] h-[200px] mb-lg">
        <ProgressCircle
          progress={progress}
          size={200}
          strokeWidth={10}
          color={isBreak ? Colors.accent.success : Colors.accent.primary}
          showPercentage={false}
        />
        <View className="absolute items-center">
          <Text className="text-display text-text-primary font-extrabold" style={{ fontVariant: ['tabular-nums'], fontSize: 48 }}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </Text>
          <Text className="text-text-muted text-sm mt-xs">
            Session {sessionsCompleted + 1}{targetSessions ? ` of ${targetSessions}` : ''}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-md w-full justify-center px-xl">
        <View className="flex-1">
          <Button
            title={isRunning ? 'Pause' : 'Start'}
            onPress={() => setIsRunning(!isRunning)}
            variant={isRunning ? 'secondary' : 'primary'}
            fullWidth
          />
        </View>
        {isBreak ? (
          <View className="flex-1">
            <Button title="Skip Break" variant="ghost" onPress={() => {
              setIsBreak(false);
              setSecondsLeft(PomodoroDefaults.WORK_MINUTES * 60);
            }} fullWidth />
          </View>
        ) : (
          <View className="flex-1">
            <Button title="Complete" variant="success" onPress={handleComplete} fullWidth />
          </View>
        )}
      </View>

      <Text className="text-accent-secondary font-bold text-sm mt-xl uppercase tracking-widest">
        Total Session Time: {formatTotalTime(sessionFocusTime)}
      </Text>
    </View>
  );
}
