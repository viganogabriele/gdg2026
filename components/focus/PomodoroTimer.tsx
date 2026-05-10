/**
 * Pomodoro Timer — circular countdown with pause/resume
 */
import { IconSymbol } from '@/components/ui/icon-symbol';
import { NucleoIcon } from '@/components/ui/NucleoIcon';
import { ProgressCircle } from '@/components/ui/ProgressCircle';
import { PomodoroDefaults } from '@/constants/gamification';
import { Colors } from '@/constants/theme';
import { useStudyStore } from '@/hooks/useStudyStore';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

interface PomodoroTimerProps {
  onSessionComplete: (durationMinutes: number) => void;
  targetSessions?: number;
}

export function PomodoroTimer({ onSessionComplete, targetSessions }: PomodoroTimerProps) {
  const router = useRouter();
  const sessionFocusTime = useStudyStore((s) => s.sessionFocusTime);
  const incrementSessionFocusTime = useStudyStore((s) => s.incrementSessionFocusTime);
  const { isDesktop, isWide } = useResponsiveLayout();
  const timerSize = isDesktop ? 250 : isWide ? 220 : 200;
  const btnSize = isDesktop ? 80 : 72;

  const [isRunning, setIsRunning] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(PomodoroDefaults.WORK_MINUTES * 60 - (sessionFocusTime % (PomodoroDefaults.WORK_MINUTES * 60)));
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
          setSessionComplete(true);
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
          name={isBreak ? 'star-xp' : 'book-open'}
          size={20}
        />
        <Text className="text-xl text-text-primary font-semibold">
          {isBreak ? 'Break Time' : 'Focus Time'}
        </Text>
      </View>

      <View className="items-center justify-center mb-lg" style={{ width: timerSize, height: timerSize }}>
        <ProgressCircle
          progress={progress}
          size={timerSize}
          strokeWidth={isDesktop ? 12 : 10}
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

      <View className="flex-row gap-xl w-full justify-center px-xl items-center">
        {!sessionComplete && (
          <TouchableOpacity
            onPress={() => router.back()}
            className="rounded-full items-center justify-center border-2"
            style={{
              width: btnSize,
              height: btnSize,
              borderColor: Colors.accent.danger,
              backgroundColor: Colors.accent.danger
            }}
            activeOpacity={0.7}
          >
            <IconSymbol
              name="xmark"
              size={28}
              color={Colors.text.primary}
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => setIsRunning(!isRunning)}
          className="rounded-full items-center justify-center"
          style={{
            width: btnSize,
            height: btnSize,
            backgroundColor: isRunning ? Colors.bg.tertiary : Colors.accent.primary,
            shadowColor: isRunning ? '#000' : Colors.accent.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 8
          }}
          activeOpacity={0.8}
        >
          <IconSymbol
            name={isRunning ? 'pause' : 'play.fill'}
            size={36}
            color={Colors.text.primary}
          />
        </TouchableOpacity>

        {isBreak ? (
          <TouchableOpacity
            onPress={() => {
              setIsBreak(false);
              setSecondsLeft(PomodoroDefaults.WORK_MINUTES * 60);
            }}
            className="rounded-full items-center justify-center border-2 border-dashed"
            style={{
              width: btnSize,
              height: btnSize,
              borderColor: Colors.border.subtle,
              backgroundColor: 'transparent'
            }}
            activeOpacity={0.7}
          >
            <IconSymbol
              name="forward.fill"
              size={28}
              color={Colors.text.primary}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleComplete}
            className="rounded-full items-center justify-center"
            style={{
              width: btnSize,
              height: btnSize,
              backgroundColor: Colors.accent.success,
              shadowColor: Colors.accent.success,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 10,
              elevation: 8
            }}
            activeOpacity={0.8}
          >
            <IconSymbol
              name="checkmark"
              size={36}
              color={Colors.text.primary}
            />
          </TouchableOpacity>
        )}
      </View>

      <Text className="text-accent-secondary font-bold text-sm mt-xl uppercase tracking-widest">
        Total Session Time: {formatTotalTime(sessionFocusTime)}
      </Text>
    </View>
  );
}
