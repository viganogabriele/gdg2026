/**
 * RoadmapSelector — Dropdown to switch between roadmaps, add new, or delete
 */
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/theme';
import { useStudyStore } from '@/hooks/useStudyStore';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  LayoutChangeEvent,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

export function RoadmapSelector() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [triggerWidth, setTriggerWidth] = useState(0);

  const roadmaps = useStudyStore((s) => s.roadmaps);
  const activeRoadmapId = useStudyStore((s) => s.activeRoadmapId);
  const subjects = useStudyStore((s) => s.subjects);
  const switchRoadmap = useStudyStore((s) => s.switchRoadmap);
  const deleteRoadmap = useStudyStore((s) => s.deleteRoadmap);
  const startNewRoadmapOnboarding = useStudyStore((s) => s.startNewRoadmapOnboarding);

  const activeRoadmap = roadmaps.find((rm) => rm.id === activeRoadmapId);
  const currentTitle = activeRoadmap?.subject?.title || subjects[0]?.title || 'StudyQuest';
  const dropdownWidth = Math.min(Math.max(triggerWidth + 36, 236), 320);

  const handleTriggerLayout = (event: LayoutChangeEvent) => {
    const nextWidth = Math.ceil(event.nativeEvent.layout.width);
    if (nextWidth !== triggerWidth) {
      setTriggerWidth(nextWidth);
    }
  };

  const handleSwitch = (roadmapId: string) => {
    setDropdownOpen(false);
    switchRoadmap(roadmapId);
  };

  const handleAddNew = () => {
    setDropdownOpen(false);
    startNewRoadmapOnboarding();
    // Small delay so state updates before navigation
    setTimeout(() => {
      router.push('/(onboarding)/subject');
    }, 50);
  };

  const [deleteCandidate, setDeleteCandidate] = useState<{ id: string; title: string } | null>(null);

  const handleDelete = (roadmapId: string, title: string) => {
    setDropdownOpen(false);
    setDeleteCandidate({ id: roadmapId, title });
  };

  const confirmDelete = () => {
    if (deleteCandidate) {
      deleteRoadmap(deleteCandidate.id);
      setDeleteCandidate(null);
    }
  };

  if (roadmaps.length <= 0 && subjects.length <= 0) return null;

  return (
    <>
      {/* Trigger Button */}
      <TouchableOpacity
        className="self-start flex-row items-center gap-xs py-xs px-sm rounded-lg bg-bg-secondary border border-border-subtle"
        onPress={() => setDropdownOpen(!dropdownOpen)}
        activeOpacity={0.7}
        onLayout={handleTriggerLayout}
        style={{ maxWidth: '82%' }}
      >
        <Text
          className="text-text-primary text-md font-bold"
          numberOfLines={1}
          style={{ flexShrink: 1 }}
        >
          {currentTitle}
        </Text>
        <Text className="text-text-muted text-xs ml-xs">
          {dropdownOpen ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {/* Dropdown Modal */}
      <Modal
        visible={dropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setDropdownOpen(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <TouchableWithoutFeedback>
              <View
                style={{
                  position: 'absolute',
                  top: Platform.OS === 'ios' ? 100 : 80,
                  left: 16,
                  width: dropdownWidth,
                  backgroundColor: Colors.bg.secondary,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: Colors.border.subtle,
                  overflow: 'hidden',
                  ...Platform.select({
                    ios: {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 12,
                    },
                    android: {
                      elevation: 8,
                    },
                  }),
                }}
              >
                {/* Header */}
                <View className="px-lg pt-lg pb-sm">
                  <Text className="text-text-muted text-xs font-semibold uppercase tracking-wider">
                    Your Subjects
                  </Text>
                </View>

                {/* Roadmap List */}
                {roadmaps.length > 0 ? (
                  roadmaps.map((rm) => {
                    const isActive = rm.id === activeRoadmapId;
                    const completedLevels = rm.levels.filter(
                      (l) => l.status === 'completed'
                    ).length;
                    const totalLevels = rm.levels.length;

                    return (
                      <View
                        key={rm.id}
                        className="flex-row items-center border-b border-border-subtle"
                      >
                        <TouchableOpacity
                        className="flex-1 px-lg py-md flex-row items-center gap-md"
                          onPress={() => handleSwitch(rm.id)}
                          activeOpacity={0.6}
                        >
                          {/* Active dot */}
                          <View
                            className="w-[10px] h-[10px] rounded-[5px]"
                            style={{
                              backgroundColor: isActive
                                ? Colors.accent.primary
                                : Colors.bg.tertiary,
                            }}
                          />
                          <View className="flex-1">
                            <Text
                              className={`text-md font-semibold ${
                                isActive ? 'text-text-primary' : 'text-text-secondary'
                              }`}
                              numberOfLines={1}
                            >
                              {rm.subject.title}
                            </Text>
                            <Text className="text-text-muted text-xs mt-[2px]">
                              {completedLevels}/{totalLevels} levels
                            </Text>
                          </View>
                        </TouchableOpacity>

                        {/* Delete button */}
                        <TouchableOpacity
                          className="px-md py-md items-center justify-center"
                          onPress={() =>
                            handleDelete(rm.id, rm.subject.title)
                          }
                          activeOpacity={0.5}
                        >
                          <IconSymbol name="trash.fill" size={18} color={Colors.accent.danger} />
                        </TouchableOpacity>
                      </View>
                    );
                  })
                ) : subjects.length > 0 && subjects[0] ? (
                  <View className="flex-row items-center border-b border-border-subtle">
                    <View className="flex-1 px-lg py-md flex-row items-center gap-md">
                      <View
                        className="w-[10px] h-[10px] rounded-[5px]"
                        style={{ backgroundColor: Colors.accent.primary }}
                      />
                      <View className="flex-1">
                        <Text className="text-md font-semibold text-text-primary" numberOfLines={1}>
                          {subjects[0].title}
                        </Text>
                        <Text className="text-text-muted text-xs mt-[2px]">
                          Legacy subject
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : null}

                {/* Add New */}
                <TouchableOpacity
                  className="flex-row items-center gap-md px-lg py-lg"
                  onPress={handleAddNew}
                  activeOpacity={0.6}
                >
                  <View
                    className="w-[28px] h-[28px] rounded-[14px] items-center justify-center border border-dashed"
                    style={{ borderColor: Colors.accent.primary }}
                  >
                    <Text
                      className="text-lg font-bold"
                      style={{ color: Colors.accent.primary }}
                    >
                      +
                    </Text>
                  </View>
                  <Text
                    className="text-md font-semibold"
                    style={{ color: Colors.accent.primary }}
                  >
                    Add New Subject
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={!!deleteCandidate}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteCandidate(null)}
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={() => setDeleteCandidate(null)}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.65)',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 24,
            }}
          >
            <TouchableWithoutFeedback>
              <View
                style={{
                  width: '100%',
                  maxWidth: 320,
                  backgroundColor: Colors.bg.overlay,
                  borderRadius: 20,
                  borderWidth: 1.5,
                  borderColor: Colors.border.subtle,
                  padding: 24,
                  ...Platform.select({
                    ios: {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 10 },
                      shadowOpacity: 0.22,
                      shadowRadius: 24,
                    },
                    android: {
                      elevation: 12,
                    },
                  }),
                }}
              >
                <View
                  className="w-[72px] h-[72px] rounded-[18px] items-center justify-center mb-lg self-center"
                  style={{
                    backgroundColor: Colors.bg.secondary,
                    borderWidth: 1.5,
                    borderColor: Colors.accent.danger + '55',
                  }}
                >
                  <IconSymbol name="trash.fill" size={28} color={Colors.accent.danger} />
                </View>

                <View
                  className="self-center px-sm py-[4px] rounded-full mb-md"
                  style={{
                    backgroundColor: Colors.accent.danger + '18',
                    borderWidth: 1,
                    borderColor: Colors.accent.danger + '35',
                  }}
                >
                  <Text
                    className="text-[11px] font-semibold uppercase"
                    style={{ color: Colors.accent.danger, letterSpacing: 0.5 }}
                  >
                    Permanent action
                  </Text>
                </View>

                <Text className="text-text-primary text-xl font-bold mb-xs text-center">
                  Delete Subject?
                </Text>

                <Text className="text-text-secondary text-sm text-center leading-[21px] mb-lg">
                  You’re about to remove{' '}
                  <Text className="font-bold text-text-primary">&quot;{deleteCandidate?.title}&quot;</Text>.
                  {' '}This will permanently delete its roadmap, progress, cards, and study history.
                </Text>

                <View
                  className="rounded-xl border px-md py-md mb-lg"
                  style={{
                    borderColor: Colors.border.subtle,
                    backgroundColor: Colors.bg.secondary,
                  }}
                >
                  <Text className="text-text-muted text-xs uppercase mb-xs">Subject</Text>
                  <Text className="text-text-primary text-md font-semibold">
                    {deleteCandidate?.title}
                  </Text>
                </View>

                <View className="gap-sm">
                  <Button
                    title="Keep Subject"
                    variant="secondary"
                    onPress={() => setDeleteCandidate(null)}
                    fullWidth
                  />
                  <Button
                    title="Delete Permanently"
                    variant="danger"
                    onPress={confirmDelete}
                    fullWidth
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}
