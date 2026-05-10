/**
 * RoadmapSelector — Dropdown to switch between roadmaps, add new, or delete
 */
import { Colors } from '@/constants/theme';
import { useStudyStore } from '@/hooks/useStudyStore';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

export function RoadmapSelector() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const roadmaps = useStudyStore((s) => s.roadmaps);
  const activeRoadmapId = useStudyStore((s) => s.activeRoadmapId);
  const subjects = useStudyStore((s) => s.subjects);
  const switchRoadmap = useStudyStore((s) => s.switchRoadmap);
  const deleteRoadmap = useStudyStore((s) => s.deleteRoadmap);
  const startNewRoadmapOnboarding = useStudyStore((s) => s.startNewRoadmapOnboarding);

  const activeRoadmap = roadmaps.find((rm) => rm.id === activeRoadmapId);
  const currentTitle = activeRoadmap?.subject?.title || subjects[0]?.title || 'StudyQuest';

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
        className="flex-row items-center gap-xs py-xs px-sm rounded-lg bg-bg-secondary border border-border-subtle"
        onPress={() => setDropdownOpen(!dropdownOpen)}
        activeOpacity={0.7}
        style={{ maxWidth: '70%' }}
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
                  right: 16,
                  backgroundColor: Colors.bg.secondary,
                  borderRadius: 12,
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
                          {isActive && (
                            <View className="bg-accent-primary/20 px-sm py-[2px] rounded-full">
                              <Text className="text-xs font-semibold" style={{ color: Colors.accent.primary }}>
                                Active
                              </Text>
                            </View>
                          )}
                        </TouchableOpacity>

                        {/* Delete button */}
                        <TouchableOpacity
                          className="px-md py-md"
                          onPress={() =>
                            handleDelete(rm.id, rm.subject.title)
                          }
                          activeOpacity={0.5}
                        >
                          <Text style={{ color: Colors.accent.danger, fontSize: 16 }}>✕</Text>
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
                      <View className="bg-accent-primary/20 px-sm py-[2px] rounded-full">
                        <Text className="text-xs font-semibold" style={{ color: Colors.accent.primary }}>
                          Active
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
      >
        <TouchableWithoutFeedback onPress={() => setDeleteCandidate(null)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableWithoutFeedback>
              <View
                style={{
                  width: '85%',
                  backgroundColor: Colors.bg.secondary,
                  borderRadius: 16,
                  padding: 24,
                  alignItems: 'center',
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
                <View className="w-12 h-12 rounded-full items-center justify-center mb-md" style={{ backgroundColor: Colors.accent.danger + '20' }}>
                  <Text style={{ color: Colors.accent.danger, fontSize: 24, fontWeight: 'bold' }}>!</Text>
                </View>
                <Text className="text-text-primary text-xl font-bold mb-xs text-center">
                  Delete Subject?
                </Text>
                <Text className="text-text-secondary text-md text-center mb-xl">
                  Are you sure you want to delete <Text className="font-bold text-text-primary">"{deleteCandidate?.title}"</Text>? All your progress, cards, and levels for this subject will be permanently lost.
                </Text>
                
                <View className="flex-row gap-md w-full">
                  <TouchableOpacity
                    className="flex-1 py-md rounded-lg items-center border border-border-subtle"
                    onPress={() => setDeleteCandidate(null)}
                    activeOpacity={0.7}
                  >
                    <Text className="text-text-primary font-semibold text-md">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 py-md rounded-lg items-center"
                    style={{ backgroundColor: Colors.accent.danger }}
                    onPress={confirmDelete}
                    activeOpacity={0.7}
                  >
                    <Text className="text-white font-semibold text-md">Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}
