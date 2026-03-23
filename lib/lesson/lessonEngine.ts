/**
 * Lesson Engine — Generates Concrete Lesson Plans
 *
 * Takes a stair + user context → returns a ready-to-execute lesson plan
 * with ordered activities, each with its own configuration and content hooks.
 *
 * Key responsibilities:
 * - Select the right template based on user level
 * - Determine if this is a discovery lesson (first stair)
 * - Personalize activity titles with scenario context
 * - Track lesson progress (which activity is current)
 * - Calculate scores and CEFR level after completion
 */

import type { StairForDisplay } from '@/hooks/useLearningPath';
import type { ProficiencyLevel } from '@/hooks/useOnboardingV3';
import {
  getLessonTemplate,
  getLevelGroup,
  getActivityColor,
  getActivityLabel,
  type LessonTemplate,
  type ActivityTemplate,
  type ActivityType,
  type ActivityStatus,
  type ActivityConfig,
  type LevelGroup,
} from './lessonTemplates';
import { getWeaknessOrder, reorderActivities } from './activityOrderer';

// ─── Lesson Plan Types ─────────────────────────────

export interface LessonActivity {
  id: string;
  type: ActivityType;
  order: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  label: string;
  estimated_seconds: number;
  config: ActivityConfig;
  status: ActivityStatus;
  score?: number; // 0-100, set after completion
}

export interface LessonPlan {
  id: string;
  stair_id: string;
  stair_title: string;
  stair_emoji: string;
  stair_description: string;
  level_group: LevelGroup;
  is_discovery: boolean;
  activities: LessonActivity[];
  estimated_minutes: number;
  current_activity_index: number;
  completed: boolean;
  /** Whether "Keep Going" can be offered after last activity */
  keepGoingAvailable: boolean;
  /** Total activities completed across this staircase (for 20-cap) */
  staircaseActivityCount: number;
  // Scores (populated after completion)
  scores?: LessonScores;
}

export interface LessonScores {
  articulation: number;
  fluency: number;
  communication: number;
  scenario: number;
  overall: number;
  cefr_level: string;
  points_earned: number;
  words_learned: number;
  practice_minutes: number;
}

// ─── Motivational Quotes ───────────────────────────

const DISCOVERY_QUOTES: Record<LevelGroup, string> = {
  beginner: "Let's discover where you are — no pressure, just practice.",
  intermediate: "Let's see what you can do — your skills are about to level up.",
  advanced: "Let's calibrate your expertise — precision matters at this level.",
};

const REGULAR_QUOTES: Record<LevelGroup, string> = {
  beginner: 'Every word you learn brings you closer to real conversations.',
  intermediate: 'You already have the foundation — time to build on it.',
  advanced: 'Refine the details that separate good from exceptional.',
};

export function getLessonQuote(levelGroup: LevelGroup, isDiscovery: boolean): string {
  return isDiscovery ? DISCOVERY_QUOTES[levelGroup] : REGULAR_QUOTES[levelGroup];
}

// ─── Engine ────────────────────────────────────────

/**
 * Generate a lesson plan for a specific stair.
 *
 * Activities are reordered based on user weakness data so lessons
 * target what they need most. Discovery lessons keep static order.
 *
 * @param stair - The stair being started
 * @param proficiencyLevel - User's proficiency from onboarding
 * @param isFirstLesson - Whether this is the user's very first lesson
 * @param scenario - The scenario context (e.g., "Client meetings")
 * @param userId - User ID for fetching weakness scores
 */
export async function generateLessonPlan(
  stair: StairForDisplay,
  proficiencyLevel: ProficiencyLevel | string | null,
  isFirstLesson: boolean,
  scenario?: string,
  userId?: string,
): Promise<LessonPlan> {
  const levelGroup = getLevelGroup(proficiencyLevel);
  const template = getLessonTemplate(levelGroup, isFirstLesson);

  // Reorder activities based on user weakness data
  let orderedTemplateActivities = template.activities;
  if (userId) {
    try {
      const weaknessOrder = await getWeaknessOrder(userId);
      orderedTemplateActivities = reorderActivities(
        template.activities,
        weaknessOrder,
        isFirstLesson,
        levelGroup,
      );
    } catch (err) {
      console.warn('[LessonEngine] Weakness reorder failed, using template order:', err);
    }
  }

  // Extract scenario name from stair title (e.g., "Client meetings: Essentials" → "Client meetings")
  const scenarioName = scenario || extractScenario(stair.title);

  const activities: LessonActivity[] = orderedTemplateActivities.map((tmpl, index) => ({
    id: `${stair.id}-activity-${index + 1}`,
    type: tmpl.type,
    order: index + 1,
    title: personalizeTitle(tmpl.title, scenarioName),
    description: personalizeTitle(tmpl.description, scenarioName),
    icon: tmpl.icon,
    color: getActivityColor(tmpl.type),
    label: getActivityLabel(tmpl.type),
    estimated_seconds: tmpl.estimated_seconds,
    config: tmpl.config,
    status: index === 0 ? 'current' as const : 'locked' as const,
  }));

  return {
    id: `lesson-${stair.id}`,
    stair_id: stair.id,
    stair_title: stair.title,
    stair_emoji: stair.emoji,
    stair_description: stair.description,
    level_group: levelGroup,
    is_discovery: isFirstLesson,
    activities,
    estimated_minutes: template.estimated_minutes,
    current_activity_index: 0,
    completed: false,
    keepGoingAvailable: !isFirstLesson,
    staircaseActivityCount: 0,
  };
}

/**
 * Advance to the next activity in the lesson plan.
 * Returns the updated plan, or null if the lesson is complete.
 */
export function advanceActivity(
  plan: LessonPlan,
  activityScore?: number,
): LessonPlan {
  const { activities, current_activity_index } = plan;

  // Mark current activity as completed
  const updatedActivities = activities.map((activity, index) => {
    if (index === current_activity_index) {
      return { ...activity, status: 'completed' as const, score: activityScore };
    }
    if (index === current_activity_index + 1) {
      return { ...activity, status: 'current' as const };
    }
    return activity;
  });

  const nextIndex = current_activity_index + 1;
  const isComplete = nextIndex >= activities.length;

  return {
    ...plan,
    activities: updatedActivities,
    current_activity_index: isComplete ? current_activity_index : nextIndex,
    completed: isComplete,
  };
}

/**
 * Calculate lesson scores from individual activity scores.
 */
export function calculateLessonScores(plan: LessonPlan): LessonScores {
  const completedActivities = plan.activities.filter(a => a.status === 'completed');
  const scores = completedActivities
    .map(a => a.score)
    .filter((s): s is number => s !== undefined);

  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
    : 0;

  // Calculate per-dimension scores based on activity types
  const voiceScores = completedActivities
    .filter(a => a.type === 'voice_call')
    .map(a => a.score || 0);
  const vocabScores = completedActivities
    .filter(a => a.type === 'vocabulary')
    .map(a => a.score || 0);
  const listeningScores = completedActivities
    .filter(a => a.type === 'listening')
    .map(a => a.score || 0);
  const writingScores = completedActivities
    .filter(a => a.type === 'writing')
    .map(a => a.score || 0);

  const avg = (arr: number[]) =>
    arr.length > 0 ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : avgScore;

  // Map scores to KPI dimensions
  const articulation = avg([...vocabScores, ...voiceScores]);
  const fluency = avg(voiceScores.length > 0 ? voiceScores : scores);
  const communication = avg([...listeningScores, ...voiceScores]);
  const scenario = avg([...writingScores, ...voiceScores]);
  const overall = Math.round((articulation + fluency + communication + scenario) / 4);

  // CEFR mapping
  const cefrLevel = mapScoreToCEFR(overall);

  // Points: base + per-activity bonus
  const totalSeconds = plan.activities.reduce((sum, a) => sum + a.estimated_seconds, 0);
  const practiceMinutes = Math.ceil(totalSeconds / 60);
  const pointsPerActivity = plan.is_discovery ? 15 : 10;
  const pointsEarned = completedActivities.length * pointsPerActivity + Math.round(overall / 10);

  // Words learned (from vocab activities)
  const wordsLearned = completedActivities
    .filter(a => a.type === 'vocabulary')
    .reduce((sum, a) => {
      if (a.config.type === 'vocabulary') return sum + a.config.word_count;
      return sum;
    }, 0);

  return {
    articulation,
    fluency,
    communication,
    scenario,
    overall,
    cefr_level: cefrLevel,
    points_earned: pointsEarned,
    words_learned: wordsLearned,
    practice_minutes: practiceMinutes,
  };
}

// ─── Helpers ───────────────────────────────────────

function extractScenario(stairTitle: string): string {
  // "Client meetings: Essentials" → "Client meetings"
  const colonIndex = stairTitle.indexOf(':');
  if (colonIndex > 0) return stairTitle.substring(0, colonIndex).trim();
  return stairTitle;
}

function personalizeTitle(template: string, scenario: string): string {
  return template.replace('{scenario}', scenario);
}

function mapScoreToCEFR(score: number): string {
  if (score >= 93) return 'C2';
  if (score >= 80) return 'C1';
  if (score >= 60) return 'B2';
  if (score >= 40) return 'B1';
  if (score >= 20) return 'A2';
  return 'A1';
}

// ─── Re-exports ────────────────────────────────────

export { getLevelGroup, getActivityColor, getActivityLabel } from './lessonTemplates';
export type { LevelGroup, ActivityType, ActivityConfig } from './lessonTemplates';
