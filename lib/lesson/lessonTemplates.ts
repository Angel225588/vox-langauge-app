/**
 * Lesson Templates — Level-Adaptive Lesson Structures
 *
 * Defines what activities a lesson contains based on the user's
 * proficiency level. First lesson = discovery (calibration).
 *
 * Beginner:     Vocabulary → Listening → Voice Call (30s)
 * Intermediate: Listening → Reading → Voice Call (60s)
 * Advanced:     Listening → Voice Call (90s) → Writing
 *
 * Regular lessons (non-discovery) follow similar patterns
 * but with adjusted content focus.
 */

import type { ProficiencyLevel } from '@/hooks/useOnboardingV3';

// ─── Activity Types ────────────────────────────────

export type ActivityType =
  | 'vocabulary'
  | 'listening'
  | 'reading'
  | 'voice_call'
  | 'writing';

export type ActivityStatus = 'locked' | 'current' | 'completed';

// ─── Activity Configs ──────────────────────────────

export interface VocabularyConfig {
  type: 'vocabulary';
  word_count: number;
  show_translations: boolean;
}

export interface ListeningConfig {
  type: 'listening';
  sentence_count: number;
  speed: 'slow' | 'normal' | 'fast';
}

export interface ReadingConfig {
  type: 'reading';
  word_count: number;
  question_count: number;
}

export interface VoiceCallConfig {
  type: 'voice_call';
  duration_seconds: number;
  is_discovery: boolean;
}

export interface WritingConfig {
  type: 'writing';
  prompt_type: 'response' | 'free_form' | 'correction';
  word_target: number;
}

export type ActivityConfig =
  | VocabularyConfig
  | ListeningConfig
  | ReadingConfig
  | VoiceCallConfig
  | WritingConfig;

// ─── Activity Template ─────────────────────────────

export interface ActivityTemplate {
  type: ActivityType;
  title: string;
  description: string;
  icon: string;
  estimated_seconds: number;
  config: ActivityConfig;
}

// ─── Lesson Template ───────────────────────────────

export interface LessonTemplate {
  id: string;
  level_group: 'beginner' | 'intermediate' | 'advanced';
  is_discovery: boolean;
  activities: ActivityTemplate[];
  estimated_minutes: number;
}

// ─── Level Grouping ────────────────────────────────

export type LevelGroup = 'beginner' | 'intermediate' | 'advanced';

const LEVEL_MAP: Record<string, LevelGroup> = {
  starting_fresh: 'beginner',
  basics: 'beginner',
  conversational: 'intermediate',
  confident: 'advanced',
  near_fluent: 'advanced',
};

export function getLevelGroup(proficiency: ProficiencyLevel | string | null): LevelGroup {
  if (!proficiency) return 'beginner';
  return LEVEL_MAP[proficiency] || 'beginner';
}

// ─── Discovery Templates (First Lesson) ────────────

/**
 * Beginner Discovery — 4 activities, ~8 min
 * Goal: Teach core words, verify listening, calibrate speaking
 */
const BEGINNER_DISCOVERY: ActivityTemplate[] = [
  {
    type: 'vocabulary',
    title: 'Core Vocabulary',
    description: 'Learn the essential words and phrases',
    icon: 'book-outline',
    estimated_seconds: 180, // 3 min
    config: {
      type: 'vocabulary',
      word_count: 5,
      show_translations: true,
    },
  },
  {
    type: 'listening',
    title: 'Hear It in Context',
    description: 'Listen to a short dialogue using your new words',
    icon: 'headset-outline',
    estimated_seconds: 120, // 2 min
    config: {
      type: 'listening',
      sentence_count: 5,
      speed: 'slow',
    },
  },
  {
    type: 'voice_call',
    title: 'Quick Conversation',
    description: 'A short call to see where you stand',
    icon: 'mic-outline',
    estimated_seconds: 30,
    config: {
      type: 'voice_call',
      duration_seconds: 30,
      is_discovery: true,
    },
  },
];

/**
 * Intermediate Discovery — 4 activities, ~10 min
 * Goal: Test comprehension, assess conversation level
 */
const INTERMEDIATE_DISCOVERY: ActivityTemplate[] = [
  {
    type: 'listening',
    title: 'Immersion Dialogue',
    description: 'Listen to a real-world conversation',
    icon: 'headset-outline',
    estimated_seconds: 150, // 2.5 min
    config: {
      type: 'listening',
      sentence_count: 8,
      speed: 'normal',
    },
  },
  {
    type: 'reading',
    title: 'Comprehension Check',
    description: 'Read and understand a professional passage',
    icon: 'reader-outline',
    estimated_seconds: 180, // 3 min
    config: {
      type: 'reading',
      word_count: 150,
      question_count: 3,
    },
  },
  {
    type: 'voice_call',
    title: 'Scenario Conversation',
    description: 'A conversation based on your profession',
    icon: 'mic-outline',
    estimated_seconds: 60,
    config: {
      type: 'voice_call',
      duration_seconds: 60,
      is_discovery: true,
    },
  },
];

/**
 * Advanced Discovery — 4 activities, ~12 min
 * Goal: Test fluency, nuanced comprehension, written articulation
 */
const ADVANCED_DISCOVERY: ActivityTemplate[] = [
  {
    type: 'listening',
    title: 'Complex Dialogue',
    description: 'Understand nuanced professional conversation',
    icon: 'headset-outline',
    estimated_seconds: 180, // 3 min
    config: {
      type: 'listening',
      sentence_count: 10,
      speed: 'fast',
    },
  },
  {
    type: 'voice_call',
    title: 'Full Scenario',
    description: 'Navigate a complete professional situation',
    icon: 'mic-outline',
    estimated_seconds: 90,
    config: {
      type: 'voice_call',
      duration_seconds: 90,
      is_discovery: true,
    },
  },
  {
    type: 'writing',
    title: 'Written Response',
    description: 'Articulate your thoughts in writing',
    icon: 'create-outline',
    estimated_seconds: 180, // 3 min
    config: {
      type: 'writing',
      prompt_type: 'response',
      word_target: 80,
    },
  },
];

// ─── Regular Lesson Templates ──────────────────────

/**
 * Beginner Regular — 5 activities, vocabulary-heavy with all skills
 */
const BEGINNER_REGULAR: ActivityTemplate[] = [
  {
    type: 'vocabulary',
    title: 'New Vocabulary',
    description: 'Learn new words for this scenario',
    icon: 'book-outline',
    estimated_seconds: 180,
    config: {
      type: 'vocabulary',
      word_count: 5,
      show_translations: true,
    },
  },
  {
    type: 'listening',
    title: 'Listen & Understand',
    description: 'Hear your new words in real sentences',
    icon: 'headset-outline',
    estimated_seconds: 120,
    config: {
      type: 'listening',
      sentence_count: 5,
      speed: 'slow',
    },
  },
  {
    type: 'reading',
    title: 'Read & Comprehend',
    description: 'Read a short passage using your new words',
    icon: 'reader-outline',
    estimated_seconds: 150,
    config: {
      type: 'reading',
      word_count: 100,
      question_count: 2,
    },
  },
  {
    type: 'voice_call',
    title: 'Practice Conversation',
    description: 'Use what you learned in a conversation',
    icon: 'mic-outline',
    estimated_seconds: 45,
    config: {
      type: 'voice_call',
      duration_seconds: 45,
      is_discovery: false,
    },
  },
  {
    type: 'writing',
    title: 'Write It Out',
    description: 'Practice writing with your new vocabulary',
    icon: 'create-outline',
    estimated_seconds: 120,
    config: {
      type: 'writing',
      prompt_type: 'response',
      word_target: 30,
    },
  },
];

/**
 * Intermediate Regular — 5 activities, balanced skills
 */
const INTERMEDIATE_REGULAR: ActivityTemplate[] = [
  {
    type: 'vocabulary',
    title: 'Vocabulary Boost',
    description: 'Expand your word bank for this topic',
    icon: 'book-outline',
    estimated_seconds: 150,
    config: {
      type: 'vocabulary',
      word_count: 5,
      show_translations: false,
    },
  },
  {
    type: 'listening',
    title: 'Listen & Analyze',
    description: 'Comprehend a professional dialogue',
    icon: 'headset-outline',
    estimated_seconds: 150,
    config: {
      type: 'listening',
      sentence_count: 8,
      speed: 'normal',
    },
  },
  {
    type: 'reading',
    title: 'Read & Respond',
    description: 'Read a passage and test your understanding',
    icon: 'reader-outline',
    estimated_seconds: 180,
    config: {
      type: 'reading',
      word_count: 200,
      question_count: 3,
    },
  },
  {
    type: 'voice_call',
    title: 'Scenario Practice',
    description: 'Hold a conversation on this topic',
    icon: 'mic-outline',
    estimated_seconds: 60,
    config: {
      type: 'voice_call',
      duration_seconds: 60,
      is_discovery: false,
    },
  },
  {
    type: 'writing',
    title: 'Write Your Thoughts',
    description: 'Express yourself in writing',
    icon: 'create-outline',
    estimated_seconds: 150,
    config: {
      type: 'writing',
      prompt_type: 'response',
      word_target: 60,
    },
  },
];

/**
 * Advanced Regular — 5 activities, fluency-focused
 */
const ADVANCED_REGULAR: ActivityTemplate[] = [
  {
    type: 'listening',
    title: 'Advanced Listening',
    description: 'Process complex professional content',
    icon: 'headset-outline',
    estimated_seconds: 180,
    config: {
      type: 'listening',
      sentence_count: 10,
      speed: 'fast',
    },
  },
  {
    type: 'reading',
    title: 'Critical Reading',
    description: 'Analyze a professional article',
    icon: 'reader-outline',
    estimated_seconds: 200,
    config: {
      type: 'reading',
      word_count: 300,
      question_count: 4,
    },
  },
  {
    type: 'voice_call',
    title: 'Extended Conversation',
    description: 'Navigate a complex professional scenario',
    icon: 'mic-outline',
    estimated_seconds: 90,
    config: {
      type: 'voice_call',
      duration_seconds: 90,
      is_discovery: false,
    },
  },
  {
    type: 'writing',
    title: 'Professional Writing',
    description: 'Draft a professional response',
    icon: 'create-outline',
    estimated_seconds: 180,
    config: {
      type: 'writing',
      prompt_type: 'free_form',
      word_target: 100,
    },
  },
  {
    type: 'vocabulary',
    title: 'Vocabulary Review',
    description: 'Reinforce advanced terminology',
    icon: 'book-outline',
    estimated_seconds: 150,
    config: {
      type: 'vocabulary',
      word_count: 5,
      show_translations: false,
    },
  },
];

// ─── Template Registry ─────────────────────────────

const DISCOVERY_TEMPLATES: Record<LevelGroup, ActivityTemplate[]> = {
  beginner: BEGINNER_DISCOVERY,
  intermediate: INTERMEDIATE_DISCOVERY,
  advanced: ADVANCED_DISCOVERY,
};

const REGULAR_TEMPLATES: Record<LevelGroup, ActivityTemplate[]> = {
  beginner: BEGINNER_REGULAR,
  intermediate: INTERMEDIATE_REGULAR,
  advanced: ADVANCED_REGULAR,
};

// ─── Public API ────────────────────────────────────

/**
 * Get the lesson template for a given level and lesson type.
 *
 * @param levelGroup - beginner | intermediate | advanced
 * @param isFirstLesson - true for discovery lesson (lesson 1)
 */
export function getLessonTemplate(
  levelGroup: LevelGroup,
  isFirstLesson: boolean,
): LessonTemplate {
  const activities = isFirstLesson
    ? DISCOVERY_TEMPLATES[levelGroup]
    : REGULAR_TEMPLATES[levelGroup];

  const totalSeconds = activities.reduce((sum, a) => sum + a.estimated_seconds, 0);

  return {
    id: `${levelGroup}-${isFirstLesson ? 'discovery' : 'regular'}`,
    level_group: levelGroup,
    is_discovery: isFirstLesson,
    activities,
    estimated_minutes: Math.ceil(totalSeconds / 60),
  };
}

/**
 * Get activity icon color by type (for UI rendering).
 */
export function getActivityColor(type: ActivityType): string {
  switch (type) {
    case 'vocabulary': return '#3D6BFF'; // Blue
    case 'listening': return '#06D6A0';  // Teal
    case 'reading': return '#F59E0B';    // Amber
    case 'voice_call': return '#8B5CF6'; // Purple
    case 'writing': return '#EF4444';    // Red/coral
  }
}

/**
 * Get human-readable label for activity type.
 */
export function getActivityLabel(type: ActivityType): string {
  switch (type) {
    case 'vocabulary': return 'Vocab';
    case 'listening': return 'Listen';
    case 'reading': return 'Read';
    case 'voice_call': return 'Speak';
    case 'writing': return 'Write';
  }
}
