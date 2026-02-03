/**
 * AI Memory System for Vox Language App
 *
 * Like a claude.md file but for each user - stores important information
 * that the AI remembers about them to personalize learning experiences.
 *
 * This system tracks:
 * - User profile and learning goals
 * - Calibration results and skill levels
 * - Learning patterns and progress
 * - AI-generated insights and observations
 * - Personalized recommendations
 */

import type {
  CEFRLevel,
  CalibrationResult,
  ProbeType,
  DeclaredLevel,
  SkillAssessment,
} from '../../types/calibration';
import type { MiniLessonCategory } from '../types/mini-lesson';

// ============================================================================
// Types
// ============================================================================

export type LessonType = MiniLessonCategory | 'conversation' | 'roleplay';

export interface LessonProgress {
  lesson_id: string;
  lesson_type: LessonType;
  cards_good: number;
  cards_total: number;
  accuracy: number;
  time_spent: number; // seconds
  vocab_learned: string[];
  completed_at: string;
  conversation_messages?: number;
}

export interface SkillScores {
  vocabulary: number; // 0-100
  grammar: number;
  speaking: number;
  listening: number;
  reading?: number;
  writing?: number;
}

export interface LearningInsights {
  strengths: string[]; // e.g., ["vocabulary", "reading comprehension"]
  weaknesses: string[]; // e.g., ["speaking fluency", "verb conjugation"]
  preferred_topics: string[]; // e.g., ["business", "technology", "travel"]
  preferred_lesson_types: LessonType[]; // Based on completion rates
  struggle_areas: string[]; // Specific grammar/vocab areas
  learning_velocity: 'slow' | 'moderate' | 'fast'; // Based on progress rate
}

export interface AIObservations {
  observations: string[]; // e.g., ["Struggles with past tense verbs", "Quick learner for vocabulary"]
  patterns: string[]; // e.g., ["Better performance in morning sessions", "Prefers visual learning"]
  blockers: string[]; // e.g., ["Pronunciation of 'th' sound", "Sentence structure in complex tenses"]
  wins: string[]; // Recent achievements/breakthroughs
  last_updated: string;
}

export interface PersonalizedRecommendations {
  focus_areas: string[]; // What to work on next
  suggested_lesson_types: LessonType[];
  topics_to_explore: string[];
  next_milestone: string; // e.g., "Reach B2 level in speaking"
  estimated_time_to_next_level: string; // e.g., "2-3 months"
  practice_frequency: string; // e.g., "15 min/day"
}

export interface UserAIMemory {
  user_id: string;

  // Profile
  native_language: string;
  target_language: string;
  motivation: string;
  motivation_custom?: string;
  commitment_stakes: string;

  // Current Level
  current_cefr_level: CEFRLevel;
  declared_level: DeclaredLevel;
  skill_scores: SkillScores;

  // Learning History
  total_lessons_completed: number;
  total_time_spent: number; // seconds
  total_vocab_learned: number;
  current_streak: number; // days
  longest_streak: number; // days
  last_lesson_date: string | null;

  // Calibration
  last_calibration_date: string | null;
  calibration_history: CalibrationResult[];

  // Insights
  insights: LearningInsights;
  ai_observations: AIObservations;
  recommendations: PersonalizedRecommendations;

  // Metadata
  created_at: string;
  updated_at: string;
  version: number; // For future schema migrations
}

export interface LessonResult {
  lesson_type: LessonType;
  cards_good: number;
  cards_total: number;
  vocab_learned: string[];
  time_spent: number; // seconds
  conversation_messages?: number;
}

// ============================================================================
// In-Memory Store (TODO: Replace with Supabase)
// ============================================================================

const memoryStore = new Map<string, UserAIMemory>();

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Initialize user memory after onboarding completion
 */
export async function initializeUserMemory(input: {
  user_id: string;
  native_language: string;
  target_language: string;
  motivation: string;
  motivation_custom?: string;
  proficiency_level: string;
  commitment_stakes: string;
}): Promise<UserAIMemory> {
  const now = new Date().toISOString();

  // Map proficiency_level to CEFR and DeclaredLevel
  const { cefrLevel, declaredLevel } = mapProficiencyToLevels(
    input.proficiency_level
  );

  const memory: UserAIMemory = {
    user_id: input.user_id,

    // Profile
    native_language: input.native_language,
    target_language: input.target_language,
    motivation: input.motivation,
    motivation_custom: input.motivation_custom,
    commitment_stakes: input.commitment_stakes,

    // Current Level
    current_cefr_level: cefrLevel,
    declared_level: declaredLevel,
    skill_scores: {
      vocabulary: 0,
      grammar: 0,
      speaking: 0,
      listening: 0,
    },

    // Learning History
    total_lessons_completed: 0,
    total_time_spent: 0,
    total_vocab_learned: 0,
    current_streak: 0,
    longest_streak: 0,
    last_lesson_date: null,

    // Calibration
    last_calibration_date: null,
    calibration_history: [],

    // Insights
    insights: {
      strengths: [],
      weaknesses: [],
      preferred_topics: [],
      preferred_lesson_types: [],
      struggle_areas: [],
      learning_velocity: 'moderate',
    },
    ai_observations: {
      observations: [
        `Learning ${input.target_language} for: ${input.motivation}`,
      ],
      patterns: [],
      blockers: [],
      wins: [],
      last_updated: now,
    },
    recommendations: {
      focus_areas: ['Complete initial calibration test'],
      suggested_lesson_types: ['vocabulary', 'listening'],
      topics_to_explore: [],
      next_milestone: 'Complete level calibration',
      estimated_time_to_next_level: 'TBD after calibration',
      practice_frequency: '15-20 min/day',
    },

    // Metadata
    created_at: now,
    updated_at: now,
    version: 1,
  };

  // TODO: Save to Supabase
  memoryStore.set(input.user_id, memory);

  return memory;
}

/**
 * Get user's AI memory
 */
export async function getUserMemory(
  user_id: string
): Promise<UserAIMemory | null> {
  // TODO: Fetch from Supabase
  const memory = memoryStore.get(user_id);
  return memory || null;
}

/**
 * Update specific fields in user memory
 */
export async function updateUserMemory(
  user_id: string,
  updates: Partial<UserAIMemory>
): Promise<UserAIMemory> {
  const existing = await getUserMemory(user_id);

  if (!existing) {
    throw new Error(`User memory not found for user_id: ${user_id}`);
  }

  const updated: UserAIMemory = {
    ...existing,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  // TODO: Update in Supabase
  memoryStore.set(user_id, updated);

  return updated;
}

/**
 * Update memory after lesson completion
 */
export async function updateMemoryAfterLesson(
  user_id: string,
  lesson_result: LessonResult
): Promise<void> {
  const memory = await getUserMemory(user_id);

  if (!memory) {
    throw new Error(`User memory not found for user_id: ${user_id}`);
  }

  const now = new Date().toISOString();
  const accuracy = lesson_result.cards_total > 0
    ? (lesson_result.cards_good / lesson_result.cards_total) * 100
    : 0;

  // Update learning history
  const total_lessons_completed = memory.total_lessons_completed + 1;
  const total_time_spent = memory.total_time_spent + lesson_result.time_spent;
  const total_vocab_learned =
    memory.total_vocab_learned + lesson_result.vocab_learned.length;

  // Update streak
  const { current_streak, longest_streak } = calculateStreak(
    memory.last_lesson_date,
    memory.current_streak,
    memory.longest_streak
  );

  // Update skill scores based on lesson type
  const skill_scores = updateSkillScores(
    memory.skill_scores,
    lesson_result.lesson_type,
    accuracy
  );

  // Track lesson type preferences
  const preferred_lesson_types = updateLessonTypePreferences(
    memory.insights.preferred_lesson_types,
    lesson_result.lesson_type,
    accuracy
  );

  // Generate AI observations
  const new_observations = generateLessonObservations(lesson_result, accuracy);
  const ai_observations: AIObservations = {
    observations: [
      ...memory.ai_observations.observations,
      ...new_observations,
    ].slice(-20), // Keep last 20
    patterns: memory.ai_observations.patterns,
    blockers: memory.ai_observations.blockers,
    wins:
      accuracy >= 90
        ? [
            ...memory.ai_observations.wins,
            `${accuracy.toFixed(0)}% accuracy in ${lesson_result.lesson_type} lesson`,
          ].slice(-10)
        : memory.ai_observations.wins,
    last_updated: now,
  };

  // Update insights
  const insights: LearningInsights = {
    ...memory.insights,
    preferred_lesson_types,
    learning_velocity: calculateLearningVelocity(
      total_lessons_completed,
      total_time_spent,
      memory.created_at
    ),
  };

  await updateUserMemory(user_id, {
    total_lessons_completed,
    total_time_spent,
    total_vocab_learned,
    current_streak,
    longest_streak,
    last_lesson_date: now,
    skill_scores,
    insights,
    ai_observations,
  });
}

/**
 * Update memory after calibration test completion
 */
export async function updateMemoryAfterCalibrator(
  user_id: string,
  calibrator_result: CalibrationResult
): Promise<UserAIMemory> {
  const memory = await getUserMemory(user_id);

  if (!memory) {
    throw new Error(`User memory not found for user_id: ${user_id}`);
  }

  const now = new Date().toISOString();

  // Extract skill scores from calibration
  const skill_scores: SkillScores = {
    vocabulary: cefrToScore(
      calibrator_result.skills.vocabulary.estimatedLevel
    ),
    grammar: cefrToScore(calibrator_result.calibratedLevel), // Use overall for grammar estimate
    speaking: cefrToScore(calibrator_result.skills.speaking.estimatedLevel),
    listening: cefrToScore(calibrator_result.skills.listening.estimatedLevel),
    reading: undefined,
    writing: calibrator_result.skills.writing
      ? cefrToScore(calibrator_result.skills.writing.estimatedLevel)
      : undefined,
  };

  // Extract insights from calibration
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const struggle_areas: string[] = [];

  Object.entries(calibrator_result.skills).forEach(([skill, assessment]) => {
    const skillAssessment = assessment as SkillAssessment;
    if (skillAssessment.insights.strengths.length > 0) {
      strengths.push(skill);
    }
    if (skillAssessment.insights.areasToExplore.length > 0) {
      weaknesses.push(skill);
      struggle_areas.push(...skillAssessment.insights.areasToExplore);
    }
  });

  const insights: LearningInsights = {
    ...memory.insights,
    strengths,
    weaknesses,
    struggle_areas,
  };

  // Generate AI observations from calibration
  const observations: string[] = [
    `Calibration completed: ${calibrator_result.declaredLevel} → ${calibrator_result.calibratedLevel}`,
    `Strengths: ${strengths.join(', ')}`,
    `Areas to explore: ${weaknesses.join(', ')}`,
  ];

  const ai_observations: AIObservations = {
    observations: [...memory.ai_observations.observations, ...observations],
    patterns: memory.ai_observations.patterns,
    blockers: struggle_areas,
    wins: memory.ai_observations.wins,
    last_updated: now,
  };

  // Update recommendations
  const recommendations: PersonalizedRecommendations = {
    focus_areas: calibrator_result.recommendations.focusAreas,
    suggested_lesson_types: calibrator_result.recommendations
      .contentTypes as LessonType[],
    topics_to_explore: [],
    next_milestone: `Reach ${getNextCEFRLevel(calibrator_result.calibratedLevel)} level`,
    estimated_time_to_next_level:
      calibrator_result.recommendations.estimatedTimeToNextLevel,
    practice_frequency: '15-20 min/day',
  };

  // Add calibration to history
  const calibration_history = [
    ...memory.calibration_history,
    calibrator_result,
  ];

  return await updateUserMemory(user_id, {
    current_cefr_level: calibrator_result.calibratedLevel,
    declared_level: calibrator_result.declaredLevel,
    skill_scores,
    last_calibration_date: now,
    calibration_history,
    insights,
    ai_observations,
    recommendations,
  });
}

/**
 * Generate memory summary for AI prompts (like claude.md format)
 */
export function generateMemorySummary(memory: UserAIMemory): string {
  const sections: string[] = [];

  // User Profile
  sections.push('## User Profile');
  sections.push(`- Native Language: ${memory.native_language}`);
  sections.push(`- Learning: ${memory.target_language}`);
  sections.push(`- Current Level: ${memory.current_cefr_level}`);
  sections.push(`- Motivation: ${memory.motivation}`);
  if (memory.motivation_custom) {
    sections.push(`- Specific Goal: ${memory.motivation_custom}`);
  }
  sections.push('');

  // Learning Stats
  sections.push('## Learning Progress');
  sections.push(`- Lessons Completed: ${memory.total_lessons_completed}`);
  sections.push(
    `- Total Study Time: ${formatSeconds(memory.total_time_spent)}`
  );
  sections.push(`- Vocabulary Learned: ${memory.total_vocab_learned} words`);
  sections.push(`- Current Streak: ${memory.current_streak} days`);
  sections.push(`- Longest Streak: ${memory.longest_streak} days`);
  sections.push('');

  // Skill Levels
  sections.push('## Skill Levels');
  sections.push(`- Vocabulary: ${memory.skill_scores.vocabulary}/100`);
  sections.push(`- Grammar: ${memory.skill_scores.grammar}/100`);
  sections.push(`- Speaking: ${memory.skill_scores.speaking}/100`);
  sections.push(`- Listening: ${memory.skill_scores.listening}/100`);
  if (memory.skill_scores.reading !== undefined) {
    sections.push(`- Reading: ${memory.skill_scores.reading}/100`);
  }
  if (memory.skill_scores.writing !== undefined) {
    sections.push(`- Writing: ${memory.skill_scores.writing}/100`);
  }
  sections.push('');

  // Learning Insights
  sections.push('## Learning Insights');
  if (memory.insights.strengths.length > 0) {
    sections.push(`- Strengths: ${memory.insights.strengths.join(', ')}`);
  }
  if (memory.insights.weaknesses.length > 0) {
    sections.push(`- Weaknesses: ${memory.insights.weaknesses.join(', ')}`);
  }
  if (memory.insights.preferred_topics.length > 0) {
    sections.push(
      `- Preferred Topics: ${memory.insights.preferred_topics.join(', ')}`
    );
  }
  if (memory.insights.preferred_lesson_types.length > 0) {
    sections.push(
      `- Preferred Lesson Types: ${memory.insights.preferred_lesson_types.join(', ')}`
    );
  }
  if (memory.insights.struggle_areas.length > 0) {
    sections.push(
      `- Struggle Areas: ${memory.insights.struggle_areas.join(', ')}`
    );
  }
  sections.push(`- Learning Velocity: ${memory.insights.learning_velocity}`);
  sections.push('');

  // AI Observations
  sections.push('## AI Observations');
  if (memory.ai_observations.observations.length > 0) {
    memory.ai_observations.observations.slice(-5).forEach((obs) => {
      sections.push(`- ${obs}`);
    });
  } else {
    sections.push('- No observations yet');
  }
  sections.push('');

  // Patterns
  if (memory.ai_observations.patterns.length > 0) {
    sections.push('## Behavioral Patterns');
    memory.ai_observations.patterns.forEach((pattern) => {
      sections.push(`- ${pattern}`);
    });
    sections.push('');
  }

  // Current Blockers
  if (memory.ai_observations.blockers.length > 0) {
    sections.push('## Current Blockers');
    memory.ai_observations.blockers.forEach((blocker) => {
      sections.push(`- ${blocker}`);
    });
    sections.push('');
  }

  // Recent Wins
  if (memory.ai_observations.wins.length > 0) {
    sections.push('## Recent Wins');
    memory.ai_observations.wins.slice(-5).forEach((win) => {
      sections.push(`- ${win}`);
    });
    sections.push('');
  }

  // Recommendations
  sections.push('## Recommendations');
  if (memory.recommendations.focus_areas.length > 0) {
    sections.push('### Focus Areas:');
    memory.recommendations.focus_areas.forEach((area) => {
      sections.push(`- ${area}`);
    });
  }
  if (memory.recommendations.suggested_lesson_types.length > 0) {
    sections.push('### Suggested Lesson Types:');
    sections.push(
      `- ${memory.recommendations.suggested_lesson_types.join(', ')}`
    );
  }
  if (memory.recommendations.topics_to_explore.length > 0) {
    sections.push('### Topics to Explore:');
    sections.push(
      `- ${memory.recommendations.topics_to_explore.join(', ')}`
    );
  }
  sections.push('### Next Milestone:');
  sections.push(`- ${memory.recommendations.next_milestone}`);
  sections.push(
    `- Estimated Time: ${memory.recommendations.estimated_time_to_next_level}`
  );
  sections.push(
    `- Recommended Practice: ${memory.recommendations.practice_frequency}`
  );

  return sections.join('\n');
}

/**
 * Analyze patterns from lesson history
 */
export function analyzePatterns(lessonHistory: LessonProgress[]): {
  strengths: string[];
  weaknesses: string[];
  observations: string[];
} {
  if (lessonHistory.length === 0) {
    return { strengths: [], weaknesses: [], observations: [] };
  }

  // Group by lesson type
  const byType = new Map<LessonType, LessonProgress[]>();
  lessonHistory.forEach((lesson) => {
    const existing = byType.get(lesson.lesson_type) || [];
    byType.set(lesson.lesson_type, [...existing, lesson]);
  });

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const observations: string[] = [];

  // Analyze each type
  byType.forEach((lessons, type) => {
    const avgAccuracy =
      lessons.reduce((sum, l) => sum + l.accuracy, 0) / lessons.length;

    if (avgAccuracy >= 85) {
      strengths.push(type);
    } else if (avgAccuracy < 60) {
      weaknesses.push(type);
    }

    observations.push(
      `${type}: ${avgAccuracy.toFixed(0)}% avg accuracy (${lessons.length} lessons)`
    );
  });

  // Time of day analysis (if we have timestamps)
  const completionTimes = lessonHistory.map((l) =>
    new Date(l.completed_at).getHours()
  );
  const avgHour =
    completionTimes.reduce((sum, h) => sum + h, 0) / completionTimes.length;

  if (avgHour < 12) {
    observations.push('Tends to study in the morning');
  } else if (avgHour >= 12 && avgHour < 18) {
    observations.push('Tends to study in the afternoon');
  } else {
    observations.push('Tends to study in the evening');
  }

  return { strengths, weaknesses, observations };
}

/**
 * Calculate CEFR level from skill scores
 */
export function calculateCEFRLevel(scores: {
  vocabulary: number;
  grammar: number;
  speaking: number;
  listening: number;
}): CEFRLevel {
  const avg =
    (scores.vocabulary + scores.grammar + scores.speaking + scores.listening) /
    4;

  if (avg < 20) return 'A0';
  if (avg < 40) return 'A1';
  if (avg < 55) return 'A2';
  if (avg < 70) return 'B1';
  if (avg < 85) return 'B2';
  if (avg < 95) return 'C1';
  return 'C2';
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Map proficiency level string to CEFR and DeclaredLevel
 */
function mapProficiencyToLevels(proficiency: string): {
  cefrLevel: CEFRLevel;
  declaredLevel: DeclaredLevel;
} {
  const normalized = proficiency.toLowerCase();

  if (normalized.includes('beginner') || normalized.includes('a0')) {
    return { cefrLevel: 'A0', declaredLevel: 'beginner' };
  }
  if (normalized.includes('basic') || normalized.includes('a1')) {
    return { cefrLevel: 'A1', declaredLevel: 'basics' };
  }
  if (normalized.includes('a2')) {
    return { cefrLevel: 'A2', declaredLevel: 'basics' };
  }
  if (normalized.includes('intermediate') || normalized.includes('b1')) {
    return { cefrLevel: 'B1', declaredLevel: 'intermediate' };
  }
  if (normalized.includes('b2')) {
    return { cefrLevel: 'B2', declaredLevel: 'intermediate' };
  }
  if (normalized.includes('advanced') || normalized.includes('c1')) {
    return { cefrLevel: 'C1', declaredLevel: 'advanced' };
  }
  if (normalized.includes('c2')) {
    return { cefrLevel: 'C2', declaredLevel: 'advanced' };
  }

  // Default to beginner
  return { cefrLevel: 'A0', declaredLevel: 'beginner' };
}

/**
 * Convert CEFR level to score (0-100)
 */
function cefrToScore(level: CEFRLevel): number {
  const scoreMap: Record<CEFRLevel, number> = {
    A0: 10,
    A1: 30,
    A2: 50,
    B1: 65,
    B2: 80,
    C1: 90,
    C2: 100,
  };
  return scoreMap[level] || 0;
}

/**
 * Get next CEFR level
 */
function getNextCEFRLevel(current: CEFRLevel): CEFRLevel {
  const levels: CEFRLevel[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const currentIndex = levels.indexOf(current);
  return currentIndex < levels.length - 1
    ? levels[currentIndex + 1]
    : current;
}

/**
 * Calculate streak based on last lesson date
 */
function calculateStreak(
  last_lesson_date: string | null,
  current_streak: number,
  longest_streak: number
): { current_streak: number; longest_streak: number } {
  if (!last_lesson_date) {
    return { current_streak: 1, longest_streak: Math.max(1, longest_streak) };
  }

  const lastDate = new Date(last_lesson_date);
  const today = new Date();

  // Reset time to midnight for comparison
  lastDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor(
    (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysDiff === 0) {
    // Same day - streak continues
    return { current_streak, longest_streak };
  } else if (daysDiff === 1) {
    // Next day - increment streak
    const newStreak = current_streak + 1;
    return {
      current_streak: newStreak,
      longest_streak: Math.max(newStreak, longest_streak),
    };
  } else {
    // Streak broken - reset to 1
    return { current_streak: 1, longest_streak };
  }
}

/**
 * Update skill scores based on lesson performance
 */
function updateSkillScores(
  current_scores: SkillScores,
  lesson_type: LessonType,
  accuracy: number
): SkillScores {
  const updated = { ...current_scores };

  // Map lesson type to skill
  const skillMap: Partial<Record<LessonType, keyof SkillScores>> = {
    vocabulary: 'vocabulary',
    grammar: 'grammar',
    speaking: 'speaking',
    listening: 'listening',
    reading: 'reading',
    conversation: 'speaking',
    roleplay: 'speaking',
  };

  const skill = skillMap[lesson_type];
  if (skill && updated[skill] !== undefined) {
    // Weighted average: 70% current, 30% new
    const current = updated[skill] as number;
    updated[skill] = Math.round(current * 0.7 + accuracy * 0.3);
  }

  return updated;
}

/**
 * Update lesson type preferences based on performance
 */
function updateLessonTypePreferences(
  current_preferences: LessonType[],
  lesson_type: LessonType,
  accuracy: number
): LessonType[] {
  // Add to preferences if high accuracy and not already included
  if (accuracy >= 80 && !current_preferences.includes(lesson_type)) {
    return [...current_preferences, lesson_type].slice(-5); // Keep top 5
  }
  return current_preferences;
}

/**
 * Generate observations from lesson result
 */
function generateLessonObservations(
  lesson_result: LessonResult,
  accuracy: number
): string[] {
  const observations: string[] = [];

  if (accuracy >= 90) {
    observations.push(
      `Excellent performance in ${lesson_result.lesson_type} (${accuracy.toFixed(0)}%)`
    );
  } else if (accuracy < 50) {
    observations.push(
      `Struggled with ${lesson_result.lesson_type} (${accuracy.toFixed(0)}%)`
    );
  }

  if (lesson_result.vocab_learned.length > 0) {
    observations.push(
      `Learned ${lesson_result.vocab_learned.length} new words`
    );
  }

  return observations;
}

/**
 * Calculate learning velocity based on progress rate
 */
function calculateLearningVelocity(
  total_lessons: number,
  total_time: number,
  created_at: string
): 'slow' | 'moderate' | 'fast' {
  const accountAge =
    (new Date().getTime() - new Date(created_at).getTime()) /
    (1000 * 60 * 60 * 24); // days

  if (accountAge < 1) return 'moderate'; // Not enough data

  const lessonsPerDay = total_lessons / accountAge;

  if (lessonsPerDay >= 3) return 'fast';
  if (lessonsPerDay >= 1) return 'moderate';
  return 'slow';
}

/**
 * Format seconds to human-readable time
 */
function formatSeconds(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
