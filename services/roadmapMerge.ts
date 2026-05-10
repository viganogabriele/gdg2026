import type { DailyObjective, LevelTopic, StudyLevel } from '@/types';

export function mergeRoadmapLevels(existingLevels: StudyLevel[], regeneratedLevels: StudyLevel[]): StudyLevel[] {
  const mergedLevels = regeneratedLevels.map((nextLevel) => {
    const existingLevel =
      existingLevels.find((level) => level.id === nextLevel.id) ??
      existingLevels.find((level) => level.levelNumber === nextLevel.levelNumber);

    if (!existingLevel) {
      return nextLevel;
    }

    if (existingLevel.status === 'completed') {
      return existingLevel;
    }

    const mergedTopics = mergeLevelTopics(existingLevel.topics, nextLevel.topics);

    return {
      ...nextLevel,
      id: existingLevel.id,
      status:
        existingLevel.status === 'active' || existingLevel.status === 'failed'
          ? existingLevel.status
          : nextLevel.status,
      completedAt: existingLevel.completedAt ?? nextLevel.completedAt,
      quizAttempts: Math.max(existingLevel.quizAttempts, nextLevel.quizAttempts),
      lastQuizScore: existingLevel.lastQuizScore ?? nextLevel.lastQuizScore,
      completedStudyMinutes: Math.max(existingLevel.completedStudyMinutes, nextLevel.completedStudyMinutes),
      topics: mergedTopics,
    };
  });

  for (const existingLevel of existingLevels) {
    const alreadyIncluded = mergedLevels.some(
      (level) => level.id === existingLevel.id || level.levelNumber === existingLevel.levelNumber,
    );

    if (!alreadyIncluded && existingLevel.status === 'completed') {
      mergedLevels.push(existingLevel);
    }
  }

  return mergedLevels.sort((a, b) => a.levelNumber - b.levelNumber);
}

export function mergeDailyObjectives(
  existingObjectives: DailyObjective[],
  regeneratedObjectives: DailyObjective[],
): DailyObjective[] {
  const completedObjectives = existingObjectives.filter((objective) => objective.completed);
  const merged = [...completedObjectives];

  for (const objective of regeneratedObjectives) {
    const duplicate = merged.some((existing) =>
      existing.title === objective.title &&
      existing.levelId === objective.levelId &&
      existing.topicId === objective.topicId
    );

    if (!duplicate) {
      merged.push(objective);
    }
  }

  return merged;
}

function mergeLevelTopics(existingTopics: LevelTopic[], regeneratedTopics: LevelTopic[]): LevelTopic[] {
  const mergedTopics = regeneratedTopics.map((nextTopic, index) => {
    const existingTopic =
      existingTopics.find((topic) => topic.title === nextTopic.title) ??
      existingTopics[index];

    if (!existingTopic) {
      return nextTopic;
    }

    if (existingTopic.completed) {
      return existingTopic;
    }

    return {
      ...nextTopic,
      id: existingTopic.id,
      completed: existingTopic.completed || nextTopic.completed,
    };
  });

  for (const existingTopic of existingTopics) {
    const alreadyIncluded = mergedTopics.some(
      (topic) => topic.id === existingTopic.id || topic.title === existingTopic.title,
    );

    if (!alreadyIncluded && existingTopic.completed) {
      mergedTopics.push(existingTopic);
    }
  }

  return mergedTopics;
}
