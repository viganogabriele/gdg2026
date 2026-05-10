/**
 * Settings Screen — notifications, tilt to focus, Braynr sync, reset
 */
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { NucleoIcon } from '@/components/ui/NucleoIcon';
import { Colors, Shadow } from '@/constants/theme';
import { useStudyStore } from '@/hooks/useStudyStore';
import * as api from '@/services/api';
import { parseBraynrJson } from '@/services/braynrParser';
import { mergeDailyObjectives, mergeRoadmapLevels } from '@/services/roadmapMerge';
import React, { useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BRAYNR_DATA = require('@/assets/braynr-export.json');

export default function SettingsScreen() {
  const prefs = useStudyStore((s) => s.notificationPrefs);
  const updatePrefs = useStudyStore((s) => s.updateNotificationPrefs);
  const resetStore = useStudyStore((s) => s.resetStore);
  const subjects = useStudyStore((s) => s.subjects);
  const setStudyProfile = useStudyStore((s) => s.setStudyProfile);
  const setLevels = useStudyStore((s) => s.setLevels);
  const setDailyObjectives = useStudyStore((s) => s.setDailyObjectives);
  const currentLevels = useStudyStore((s) => s.levels);
  const currentObjectives = useStudyStore((s) => s.dailyObjectives);
  const braynrLastSyncedAt = useStudyStore((s) => s.braynrLastSyncedAt);
  const onboardingData = useStudyStore((s) => s.onboardingData);
  const onboardingComplete = useStudyStore((s) => s.onboardingComplete);

  const [syncing, setSyncing] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [braynrModalVisible, setBraynrModalVisible] = useState(false);
  const modalScale = useState(() => new Animated.Value(0.92))[0];
  const modalOpacity = useState(() => new Animated.Value(0))[0];
  const backdropOpacity = useState(() => new Animated.Value(0))[0];

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    resetStore();
    setConfirmReset(false);
  };

  const lastSyncLabel = braynrLastSyncedAt
    ? new Date(braynrLastSyncedAt).toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Mai';

  const openBraynrModal = () => {
    modalScale.setValue(0.92);
    modalOpacity.setValue(0);
    backdropOpacity.setValue(0);
    setBraynrModalVisible(true);
    Animated.parallel([
      Animated.spring(modalScale, {
        toValue: 1,
        tension: 70,
        friction: 9,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeBraynrModal = () => {
    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.spring(modalScale, {
        toValue: 0.92,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start(() => setBraynrModalVisible(false));
  };

  const handleBraynrSync = async () => {
    setSyncing(true);
    try {
      const profile = parseBraynrJson(BRAYNR_DATA);
      setStudyProfile(profile);

      if (onboardingComplete && subjects[0]) {
        const result = await api.generateRoadmap(
          subjects[0],
          onboardingData.sections,
          onboardingData.assessmentScore,
          profile,
        );
        const mergedLevels = mergeRoadmapLevels(currentLevels, result.levels);
        const mergedObjectives = mergeDailyObjectives(currentObjectives, result.dailyObjectives);
        setLevels(mergedLevels);
        setDailyObjectives(mergedObjectives);
      }
      closeBraynrModal();
    } catch {
    } finally {
      setSyncing(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        <Text className="text-text-primary text-xxl font-bold mb-xxl">Settings</Text>

        <View className="flex-row items-center gap-sm mb-md">
          <NucleoIcon name="bell" size={18} />
          <Text className="text-text-primary text-lg font-bold">Notifications</Text>
        </View>
        <Card style={{ marginBottom: 24 }}>
          <SettingRow label="Daily Reminder" value={prefs.dailyReminder} onChange={(v) => updatePrefs({ dailyReminder: v })} />
          <SettingRow label="Deadline Warnings" value={prefs.deadlineWarnings} onChange={(v) => updatePrefs({ deadlineWarnings: v })} />
          <SettingRow label="Streak Warnings" value={prefs.streakWarnings} onChange={(v) => updatePrefs({ streakWarnings: v })} />
          <SettingRow label="Challenge Alerts" value={prefs.challengeNotifications} onChange={(v) => updatePrefs({ challengeNotifications: v })} last />
        </Card>

        <View className="flex-row items-center gap-sm mb-md mt-lg">
          <NucleoIcon name="dial" size={18} />
          <Text className="text-text-primary text-lg font-bold">Focus</Text>
        </View>
        <Card style={{ marginBottom: 24 }}>
          <SettingRow
            label="Tilt to Focus"
            description="Open focus mode by rotating your phone on the home screen."
            value={prefs.tiltToFocusEnabled}
            onChange={(v) => updatePrefs({ tiltToFocusEnabled: v })}
            last
          />
        </Card>

        <View className="flex-row items-center gap-sm mb-md mt-lg">
          <NucleoIcon name="book-open" size={18} />
          <Text className="text-text-primary text-lg font-bold">Braynr</Text>
        </View>
        <TouchableOpacity activeOpacity={0.78} onPress={openBraynrModal} disabled={syncing}>
          <Card style={{ marginBottom: 24, opacity: syncing ? 0.5 : 1 }}>
            <View className="flex-row items-center gap-md">
              <View className="flex-1">
                <Text className="text-text-primary text-md font-semibold">Sincronizza con Braynr</Text>
                <Text className="text-text-muted text-xs mt-xs">Last synchronization: {lastSyncLabel}</Text>
              </View>

              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: Colors.accent.primary + '22',
                }}
              >
                <NucleoIcon name="circle-check" size={18} />
              </View>
            </View>
          </Card>
        </TouchableOpacity>

        <View className="mt-lg pb-xxl gap-sm">
          {confirmReset && (
            <View className="flex-row items-center gap-sm bg-bg-secondary rounded-lg px-md py-sm border border-border-subtle">
              <Text className="text-text-muted text-sm flex-1">Sicuro? Tutti i dati verranno eliminati.</Text>
              <TouchableOpacity onPress={() => setConfirmReset(false)}>
                <Text className="text-text-muted text-sm px-sm">Annulla</Text>
              </TouchableOpacity>
            </View>
          )}
          <Button
            title={confirmReset ? 'Conferma Reset' : 'Reset All Data'}
            variant="danger"
            onPress={handleReset}
            fullWidth
          />
        </View>
      </ScrollView>

      <Modal transparent visible={braynrModalVisible} onRequestClose={closeBraynrModal} statusBarTranslucent>
        <Animated.View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.65)',
            opacity: backdropOpacity,
            padding: 24,
          }}
        >
          <Pressable style={{ position: 'absolute', inset: 0 } as any} onPress={closeBraynrModal} />
          <Animated.View
            style={{
              width: '100%',
              maxWidth: 320,
              borderRadius: 20,
              borderWidth: 1.5,
              borderColor: Colors.border.subtle,
              backgroundColor: Colors.bg.overlay,
              padding: 24,
              opacity: modalOpacity,
              transform: [{ scale: modalScale }],
              ...Shadow.lg,
            }}
          >
            <Text className="text-text-primary text-xl font-bold text-center">Sync with Braynr</Text>
            <Text className="text-text-muted text-sm text-center mt-sm">
              Import your Braynr study data to calibrate your roadmap to your real pace.
            </Text>

            <View className="mt-lg rounded-lg border border-border-subtle bg-bg-secondary px-lg py-md">
              <Text className="text-text-muted text-xs uppercase">Last synchronization</Text>
              <Text className="text-text-primary text-md font-semibold mt-xs">{lastSyncLabel}</Text>
            </View>

            <View className="mt-lg gap-sm">
              <Button
                title={syncing ? 'Syncing...' : 'Sync Now'}
                onPress={handleBraynrSync}
                fullWidth
                disabled={syncing}
              />
              <Button title="Close" variant="ghost" onPress={closeBraynrModal} fullWidth />
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}

function SettingRow({
  label,
  description,
  value,
  onChange,
  last,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <View className={`flex-row justify-between items-center py-md ${last ? '' : 'border-b border-border-subtle'}`}>
      <View className="flex-1 pr-md">
        <Text className="text-text-primary text-md">{label}</Text>
        {description ? <Text className="text-text-muted text-xs mt-xs">{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: Colors.bg.tertiary, true: Colors.accent.primary }}
        thumbColor={Colors.text.primary}
      />
    </View>
  );
}
