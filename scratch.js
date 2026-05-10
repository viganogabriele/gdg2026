// Mock the store logic to see the bug
let state = {
  roadmaps: [],
  activeRoadmapId: null,
  subjects: [{ id: 'sub1', title: 'Legacy' }],
  isAddingRoadmap: false
};

function uid() { return Math.random().toString(36).substring(2, 11); }

function syncActiveRoadmapToArray(st) {
  let currentRoadmaps = st.roadmaps;
  if (!st.activeRoadmapId && st.subjects.length > 0) {
    // BUG IS HERE: If roadmaps already has the legacy roadmap, but activeRoadmapId is still null, it will duplicate!
    // But wait, if it's already in roadmaps, we shouldn't add it again.
    if (currentRoadmaps.length === 0) {
      const legacyId = uid();
      currentRoadmaps = [...currentRoadmaps, { id: legacyId, subject: st.subjects[0] }];
    }
  }
  const targetId = st.activeRoadmapId || (st.subjects.length > 0 ? currentRoadmaps[currentRoadmaps.length - 1].id : null);
  if (!targetId) return currentRoadmaps;
  return currentRoadmaps.map((rm) => rm.id === targetId ? { ...rm, subject: st.subjects[0] } : rm);
}

// 1. startNewRoadmapOnboarding
let synced = syncActiveRoadmapToArray(state);
state.roadmaps = synced;
state.isAddingRoadmap = true;
console.log("After startNewRoadmapOnboarding:", state.roadmaps.map(r => r.id));

// 2. completeOnboarding
let synced2 = state.isAddingRoadmap ? syncActiveRoadmapToArray(state) : state.roadmaps;
let newRoadmap = { id: 'new1', subject: { id: 'sub2', title: 'New' } };
state.roadmaps = [...synced2, newRoadmap];
state.activeRoadmapId = newRoadmap.id;
state.subjects = [newRoadmap.subject];
state.isAddingRoadmap = false;
console.log("After completeOnboarding:", state.roadmaps.map(r => r.id));
