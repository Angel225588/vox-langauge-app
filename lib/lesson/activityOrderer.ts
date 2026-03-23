/**
 * Activity Orderer — AI-Driven Lesson Activity Prioritization
 *
 * Reorders lesson activities based on user weakness data so lessons
 * target what the user needs most. No Gemini call needed — uses
 * existing competency scores for a $0, instant, deterministic reorder.
 *
 * Constraints:
 * - Discovery lessons keep static order (calibration, not practice)
 * - Beginners always start with vocabulary (it feeds other activities)
 * - "Keep Going" provides additional activities after lesson completion
 */

import { getAllScores, type PracticeScore } from '@/lib/db/competencyMetrics';
import { computeByType } from '@/lib/metrics/competencyEngine';
import type { ActivityTemplate, ActivityType, LevelGroup } from './lessonTemplates';

// ─── Activity Type to PracticeType Mapping ──────────

/**
 * Maps lesson ActivityType to competency PracticeType for score lookup.
 * voice_call → conversation, vocabulary → (no direct score, uses overall)
 */
const ACTIVITY_TO_PRACTICE: Record<ActivityType, string> = {
  listening: 'listening',
  reading: 'reading',
  writing: 'writing',
  voice_call: 'conversation',
  vocabulary: 'vocabulary', // no direct PracticeType — uses fallback
};

// Default order when no scores exist
const DEFAULT_ORDER: ActivityType[] = [
  'vocabulary',
  'listening',
  'reading',
  'voice_call',
  'writing',
];

// ─── Weakness Order ─────────────────────────────────

/**
 * Get activity types sorted by weakness (lowest scores first).
 *
 * Fetches all user scores, breaks them down by practice type,
 * and returns activity types ordered from weakest to strongest.
 * Falls back to default template order if no scores exist.
 */
export async function getWeaknessOrder(userId: string): Promise<ActivityType[]> {
  try {
    const allScores = await getAllScores(userId);
    if (allScores.length === 0) return DEFAULT_ORDER;

    const byType = computeByType(allScores);

    // Build score map: ActivityType → average score
    const scoreMap: { type: ActivityType; score: number }[] = [
      { type: 'listening', score: byType.listening?.avg ?? 0 },
      { type: 'reading', score: byType.reading?.avg ?? 0 },
      { type: 'writing', score: byType.writing?.avg ?? 0 },
      { type: 'voice_call', score: byType.conversation?.avg ?? 0 },
      { type: 'vocabulary', score: byType.reading?.avg ?? 50 }, // vocab has no direct score, approximate
    ];

    // Sort by score ascending (weakest first)
    // For ties, prefer the type with fewer sessions (less practiced)
    scoreMap.sort((a, b) => {
      if (a.score !== b.score) return a.score - b.score;
      // Break ties: less practiced types come first
      const aCount = byType[ACTIVITY_TO_PRACTICE[a.type] as keyof typeof byType]?.count ?? 0;
      const bCount = byType[ACTIVITY_TO_PRACTICE[b.type] as keyof typeof byType]?.count ?? 0;
      return aCount - bCount;
    });

    return scoreMap.map((s) => s.type);
  } catch (err) {
    console.warn('[ActivityOrderer] Failed to get weakness order, using defaults:', err);
    return DEFAULT_ORDER;
  }
}

// ─── Reorder Activities ─────────────────────────────

/**
 * Reorder lesson activities based on weakness priority.
 *
 * - Discovery lessons → unchanged (calibration, not practice)
 * - Beginners → vocabulary stays first, rest reordered by weakness
 * - Others → full reorder by weakness priority
 *
 * Preserves all activity config/metadata — only changes array position.
 */
export function reorderActivities(
  activities: ActivityTemplate[],
  weaknessOrder: ActivityType[],
  isDiscovery: boolean,
  levelGroup: LevelGroup,
): ActivityTemplate[] {
  // Discovery lessons keep static order (they're calibration)
  if (isDiscovery) return activities;

  // No weakness data → keep template order
  if (weaknessOrder.length === 0) return activities;

  // Build a priority map: type → position (lower = higher priority)
  const priorityMap = new Map<ActivityType, number>();
  weaknessOrder.forEach((type, index) => {
    priorityMap.set(type, index);
  });

  if (levelGroup === 'beginner') {
    // Beginners: vocabulary stays first, reorder the rest
    const vocabActivities = activities.filter((a) => a.type === 'vocabulary');
    const nonVocab = activities.filter((a) => a.type !== 'vocabulary');

    const sortedNonVocab = [...nonVocab].sort((a, b) => {
      const aPriority = priorityMap.get(a.type) ?? 99;
      const bPriority = priorityMap.get(b.type) ?? 99;
      return aPriority - bPriority;
    });

    return [...vocabActivities, ...sortedNonVocab];
  }

  // Intermediate/Advanced: full reorder by weakness
  return [...activities].sort((a, b) => {
    const aPriority = priorityMap.get(a.type) ?? 99;
    const bPriority = priorityMap.get(b.type) ?? 99;
    return aPriority - bPriority;
  });
}

// ─── Keep Going Activities ──────────────────────────

/**
 * Default activity configs by level group for generating "Keep Going" activities.
 */
const KEEP_GOING_CONFIGS: Record<ActivityType, Record<LevelGroup, ActivityTemplate>> = {
  vocabulary: {
    beginner: {
      type: 'vocabulary', title: 'Extra Vocabulary', description: 'Learn more essential words',
      icon: 'book-outline', estimated_seconds: 180,
      config: { type: 'vocabulary', word_count: 5, show_translations: true },
    },
    intermediate: {
      type: 'vocabulary', title: 'Vocabulary Boost', description: 'Expand your word bank',
      icon: 'book-outline', estimated_seconds: 150,
      config: { type: 'vocabulary', word_count: 5, show_translations: false },
    },
    advanced: {
      type: 'vocabulary', title: 'Advanced Vocabulary', description: 'Master nuanced terms',
      icon: 'book-outline', estimated_seconds: 150,
      config: { type: 'vocabulary', word_count: 5, show_translations: false },
    },
  },
  listening: {
    beginner: {
      type: 'listening', title: 'Extra Listening', description: 'Practice understanding more sentences',
      icon: 'headset-outline', estimated_seconds: 120,
      config: { type: 'listening', sentence_count: 5, speed: 'slow' },
    },
    intermediate: {
      type: 'listening', title: 'Listening Practice', description: 'Comprehend a new dialogue',
      icon: 'headset-outline', estimated_seconds: 150,
      config: { type: 'listening', sentence_count: 8, speed: 'normal' },
    },
    advanced: {
      type: 'listening', title: 'Advanced Listening', description: 'Process complex professional content',
      icon: 'headset-outline', estimated_seconds: 180,
      config: { type: 'listening', sentence_count: 10, speed: 'fast' },
    },
  },
  reading: {
    beginner: {
      type: 'reading', title: 'Extra Reading', description: 'Read a short passage',
      icon: 'reader-outline', estimated_seconds: 150,
      config: { type: 'reading', word_count: 100, question_count: 2 },
    },
    intermediate: {
      type: 'reading', title: 'Reading Practice', description: 'Read and analyze a passage',
      icon: 'reader-outline', estimated_seconds: 180,
      config: { type: 'reading', word_count: 200, question_count: 3 },
    },
    advanced: {
      type: 'reading', title: 'Advanced Reading', description: 'Analyze complex professional text',
      icon: 'reader-outline', estimated_seconds: 200,
      config: { type: 'reading', word_count: 300, question_count: 4 },
    },
  },
  voice_call: {
    beginner: {
      type: 'voice_call', title: 'Extra Conversation', description: 'Practice speaking more',
      icon: 'mic-outline', estimated_seconds: 45,
      config: { type: 'voice_call', duration_seconds: 45, is_discovery: false },
    },
    intermediate: {
      type: 'voice_call', title: 'Conversation Practice', description: 'Hold another conversation',
      icon: 'mic-outline', estimated_seconds: 60,
      config: { type: 'voice_call', duration_seconds: 60, is_discovery: false },
    },
    advanced: {
      type: 'voice_call', title: 'Extended Conversation', description: 'Navigate a complex scenario',
      icon: 'mic-outline', estimated_seconds: 90,
      config: { type: 'voice_call', duration_seconds: 90, is_discovery: false },
    },
  },
  writing: {
    beginner: {
      type: 'writing', title: 'Extra Writing', description: 'Practice expressing your thoughts',
      icon: 'create-outline', estimated_seconds: 120,
      config: { type: 'writing', prompt_type: 'response', word_target: 30 },
    },
    intermediate: {
      type: 'writing', title: 'Writing Practice', description: 'Write a thoughtful response',
      icon: 'create-outline', estimated_seconds: 150,
      config: { type: 'writing', prompt_type: 'response', word_target: 60 },
    },
    advanced: {
      type: 'writing', title: 'Professional Writing', description: 'Draft a professional response',
      icon: 'create-outline', estimated_seconds: 180,
      config: { type: 'writing', prompt_type: 'free_form', word_target: 100 },
    },
  },
};

/**
 * Get additional "Keep Going" activities for extending a lesson.
 *
 * Picks activity types the user hasn't done yet this round (from weaknessOrder),
 * cycling back to weakest types if all have been covered.
 *
 * @param completedTypes - Activity types already completed in this lesson
 * @param weaknessOrder - Types sorted by weakness (weakest first)
 * @param levelGroup - User's level group for config selection
 * @param count - Number of activities to generate (usually 2)
 */
export function getKeepGoingActivities(
  completedTypes: ActivityType[],
  weaknessOrder: ActivityType[],
  levelGroup: LevelGroup,
  count: number = 2,
): ActivityTemplate[] {
  const completedSet = new Set(completedTypes);
  const result: ActivityTemplate[] = [];

  // First pass: types not yet done this round, ordered by weakness
  const order = weaknessOrder.length > 0 ? weaknessOrder : DEFAULT_ORDER;
  for (const type of order) {
    if (result.length >= count) break;
    if (!completedSet.has(type)) {
      const config = KEEP_GOING_CONFIGS[type]?.[levelGroup];
      if (config) result.push(config);
    }
  }

  // Second pass: if all types exhausted, cycle back to weakest
  if (result.length < count) {
    for (const type of order) {
      if (result.length >= count) break;
      const config = KEEP_GOING_CONFIGS[type]?.[levelGroup];
      if (config && !result.some((r) => r.type === type)) {
        result.push(config);
      }
    }
  }

  // Third pass: if still short (shouldn't happen), fill with weakest
  while (result.length < count) {
    const type = order[result.length % order.length];
    const config = KEEP_GOING_CONFIGS[type]?.[levelGroup];
    if (config) result.push({ ...config });
    else break;
  }

  return result;
}
