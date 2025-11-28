/**
 * Performance Tracking System
 *
 * Tracks user performance across different skills and identifies weak areas
 * for AI-driven lesson personalization.
 *
 * Strategy: Analyze BOTH last 7 days AND last 50 attempts (whichever gives more data)
 * - Take last 7 days of activity
 * - If less than 50 attempts in 7 days, extend window to get 50 attempts
 * - If more than 50 attempts in 7 days, use the 50 most recent
 *
 * Cost: FREE - All calculations happen locally in database queries
 */

import { supabase } from './supabase';
import type { SkillType, WeakAreaType } from '@/lib/registry/card-registry';

// ============================================================================
// Type Definitions
// ============================================================================

export interface CardResult {
  cardId: string;
  cardType: string;
  correct: boolean;
  accuracy: number;          // 0-100
  timeSpent: number;         // seconds
  skillsPracticed: SkillType[];
  weakAreasAddressed: WeakAreaType[];
  timestamp: Date;
}

export interface PerformanceMetrics {
  totalAttempts: number;
  overallAccuracy: number;   // 0-100
  skillAccuracy: {
    [skill in SkillType]: number;
  };
  weakAreaAccuracy: {
    [area in WeakAreaType]: number;
  };
  identifiedWeakAreas: WeakAreaType[];  // Areas with <70% accuracy
  timeRange: {
    start: Date;
    end: Date;
    days: number;
  };
}

export interface UserLessonContext {
  userId: string;
  proficiencyLevel: string;
  learningGoal: string;
  motivationData?: {
    why?: string;
    fear?: string;
    stakes?: string;
    timeline?: string;
  };
  recentPerformance: PerformanceMetrics;
  weakAreas: WeakAreaType[];
}

// ============================================================================
// Performance Data Retrieval
// ============================================================================

/**
 * Get user's card results for performance analysis
 * Strategy: Last 7 days OR last 50 attempts (whichever provides more data)
 */
export async function getUserCardResults(userId: string): Promise<CardResult[]> {
  // Get last 7 days of results
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: recentResults, error: recentError } = await supabase
    .from('card_results')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false });

  if (recentError) {
    console.error('[Performance] Error fetching recent results:', recentError);
    return [];
  }

  // If we have 50+ results in last 7 days, use the 50 most recent
  if (recentResults && recentResults.length >= 50) {
    return recentResults.slice(0, 50).map(mapDbResultToCardResult);
  }

  // If less than 50 results in 7 days, get additional results to reach 50
  const { data: allResults, error: allError } = await supabase
    .from('card_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (allError) {
    console.error('[Performance] Error fetching all results:', allError);
    return recentResults?.map(mapDbResultToCardResult) || [];
  }

  return allResults?.map(mapDbResultToCardResult) || [];
}

/**
 * Map database result to CardResult type
 */
function mapDbResultToCardResult(dbResult: any): CardResult {
  return {
    cardId: dbResult.card_id,
    cardType: dbResult.card_type,
    correct: dbResult.correct,
    accuracy: dbResult.accuracy,
    timeSpent: dbResult.time_spent,
    skillsPracticed: dbResult.skills_practiced || [],
    weakAreasAddressed: dbResult.weak_areas_addressed || [],
    timestamp: new Date(dbResult.created_at),
  };
}

// ============================================================================
// Performance Metrics Calculation
// ============================================================================

/**
 * Calculate overall performance metrics from card results
 */
export function calculatePerformanceMetrics(results: CardResult[]): PerformanceMetrics {
  if (results.length === 0) {
    return {
      totalAttempts: 0,
      overallAccuracy: 0,
      skillAccuracy: {
        listening: 0,
        speaking: 0,
        reading: 0,
        writing: 0,
        grammar: 0,
      },
      weakAreaAccuracy: {
        vocabulary: 0,
        pronunciation: 0,
        grammar: 0,
        comprehension: 0,
        confidence: 0,
      },
      identifiedWeakAreas: [],
      timeRange: {
        start: new Date(),
        end: new Date(),
        days: 0,
      },
    };
  }

  // Calculate time range
  const timestamps = results.map(r => r.timestamp.getTime());
  const start = new Date(Math.min(...timestamps));
  const end = new Date(Math.max(...timestamps));
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate overall accuracy
  const totalAccuracy = results.reduce((sum, r) => sum + r.accuracy, 0);
  const overallAccuracy = totalAccuracy / results.length;

  // Calculate accuracy by skill
  const skillAccuracy = calculateSkillAccuracy(results);

  // Calculate accuracy by weak area
  const weakAreaAccuracy = calculateWeakAreaAccuracy(results);

  // Identify weak areas (<70% accuracy)
  const identifiedWeakAreas = (Object.entries(weakAreaAccuracy) as [WeakAreaType, number][])
    .filter(([_, accuracy]) => accuracy < 70)
    .map(([area, _]) => area);

  return {
    totalAttempts: results.length,
    overallAccuracy: Math.round(overallAccuracy),
    skillAccuracy,
    weakAreaAccuracy,
    identifiedWeakAreas,
    timeRange: {
      start,
      end,
      days,
    },
  };
}

/**
 * Calculate accuracy by skill type
 */
function calculateSkillAccuracy(results: CardResult[]): PerformanceMetrics['skillAccuracy'] {
  const skills: SkillType[] = ['listening', 'speaking', 'reading', 'writing', 'grammar'];
  const skillAccuracy: any = {};

  for (const skill of skills) {
    const skillResults = results.filter(r => r.skillsPracticed.includes(skill));
    if (skillResults.length === 0) {
      skillAccuracy[skill] = 0;
    } else {
      const totalAccuracy = skillResults.reduce((sum, r) => sum + r.accuracy, 0);
      skillAccuracy[skill] = Math.round(totalAccuracy / skillResults.length);
    }
  }

  return skillAccuracy;
}

/**
 * Calculate accuracy by weak area type
 */
function calculateWeakAreaAccuracy(results: CardResult[]): PerformanceMetrics['weakAreaAccuracy'] {
  const weakAreas: WeakAreaType[] = ['vocabulary', 'pronunciation', 'grammar', 'comprehension', 'confidence'];
  const weakAreaAccuracy: any = {};

  for (const area of weakAreas) {
    const areaResults = results.filter(r => r.weakAreasAddressed.includes(area));
    if (areaResults.length === 0) {
      weakAreaAccuracy[area] = 0;
    } else {
      const totalAccuracy = areaResults.reduce((sum, r) => sum + r.accuracy, 0);
      weakAreaAccuracy[area] = Math.round(totalAccuracy / areaResults.length);
    }
  }

  return weakAreaAccuracy;
}

// ============================================================================
// Weak Area Identification
// ============================================================================

/**
 * Get user's weak areas (accuracy <70%)
 */
export async function getUserWeakAreas(userId: string): Promise<WeakAreaType[]> {
  const results = await getUserCardResults(userId);
  const metrics = calculatePerformanceMetrics(results);
  return metrics.identifiedWeakAreas;
}

/**
 * Get accuracy for a specific skill
 */
export async function getSkillAccuracy(userId: string, skill: SkillType): Promise<number> {
  const results = await getUserCardResults(userId);
  const metrics = calculatePerformanceMetrics(results);
  return metrics.skillAccuracy[skill];
}

/**
 * Get accuracy for a specific weak area
 */
export async function getWeakAreaAccuracy(userId: string, weakArea: WeakAreaType): Promise<number> {
  const results = await getUserCardResults(userId);
  const metrics = calculatePerformanceMetrics(results);
  return metrics.weakAreaAccuracy[weakArea];
}

// ============================================================================
// Recording Results
// ============================================================================

/**
 * Record a card result for performance tracking
 */
export async function recordCardResult(
  userId: string,
  result: Omit<CardResult, 'timestamp'>
): Promise<void> {
  const { error } = await supabase.from('card_results').insert({
    user_id: userId,
    card_id: result.cardId,
    card_type: result.cardType,
    correct: result.correct,
    accuracy: result.accuracy,
    time_spent: result.timeSpent,
    skills_practiced: result.skillsPracticed,
    weak_areas_addressed: result.weakAreasAddressed,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error('[Performance] Error recording card result:', error);
    throw error;
  }
}

// ============================================================================
// User Lesson Context Builder
// ============================================================================

/**
 * Build complete user context for lesson composer
 * Includes profile, motivation, and performance data
 */
export async function buildUserLessonContext(userId: string): Promise<UserLessonContext> {
  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('[Performance] Error fetching user profile:', profileError);
    throw new Error('Could not fetch user profile');
  }

  // Fetch performance data
  const results = await getUserCardResults(userId);
  const performance = calculatePerformanceMetrics(results);

  // Build context
  return {
    userId,
    proficiencyLevel: profile.proficiency_level || 'beginner',
    learningGoal: profile.learning_goal || 'general',
    motivationData: profile.motivation_data,
    recentPerformance: performance,
    weakAreas: performance.identifiedWeakAreas,
  };
}

// ============================================================================
// Progress Tracking Helpers
// ============================================================================

/**
 * Get user's practice streak (consecutive days)
 */
export async function getUserStreak(userId: string): Promise<number> {
  const { data: results, error } = await supabase
    .from('card_results')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !results || results.length === 0) {
    return 0;
  }

  // Check consecutive days
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const practiceDates = new Set(
    results.map(r => {
      const date = new Date(r.created_at);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    })
  );

  // Count consecutive days backwards from today
  while (practiceDates.has(currentDate.getTime())) {
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}

/**
 * Get total XP earned by user
 */
export async function getUserTotalXP(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('total_xp')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return 0;
  }

  return data.total_xp || 0;
}

/**
 * Update user's XP after completing cards
 */
export async function updateUserXP(userId: string, xpToAdd: number): Promise<void> {
  const currentXP = await getUserTotalXP(userId);
  const newXP = currentXP + xpToAdd;

  const { error } = await supabase
    .from('user_profiles')
    .update({ total_xp: newXP })
    .eq('id', userId);

  if (error) {
    console.error('[Performance] Error updating user XP:', error);
    throw error;
  }
}

// ============================================================================
// Analytics & Insights
// ============================================================================

/**
 * Get performance summary for display in UI
 */
export async function getPerformanceSummary(userId: string): Promise<{
  streak: number;
  totalXP: number;
  weeklyAccuracy: number;
  cardsCompleted: number;
  weakAreas: WeakAreaType[];
  strongAreas: string[];
}> {
  const [streak, totalXP, results] = await Promise.all([
    getUserStreak(userId),
    getUserTotalXP(userId),
    getUserCardResults(userId),
  ]);

  const metrics = calculatePerformanceMetrics(results);

  // Identify strong areas (>85% accuracy)
  const strongSkills = (Object.entries(metrics.skillAccuracy) as [string, number][])
    .filter(([_, accuracy]) => accuracy >= 85)
    .map(([skill, _]) => skill);

  return {
    streak,
    totalXP,
    weeklyAccuracy: metrics.overallAccuracy,
    cardsCompleted: metrics.totalAttempts,
    weakAreas: metrics.identifiedWeakAreas,
    strongAreas: strongSkills,
  };
}

/**
 * Check if user needs encouragement (struggling pattern detected)
 */
export async function needsEncouragement(userId: string): Promise<boolean> {
  const results = await getUserCardResults(userId);
  if (results.length < 5) {
    return false; // Not enough data
  }

  // Check last 5 attempts
  const lastFive = results.slice(0, 5);
  const avgAccuracy = lastFive.reduce((sum, r) => sum + r.accuracy, 0) / 5;

  // If accuracy dropped below 60% in last 5 attempts, needs encouragement
  return avgAccuracy < 60;
}

/**
 * Get personalized encouragement message based on performance
 */
export async function getEncouragementMessage(userId: string): Promise<string> {
  const needs = await needsEncouragement(userId);
  if (!needs) {
    return "You're doing great! Keep practicing!";
  }

  const weakAreas = await getUserWeakAreas(userId);

  if (weakAreas.length === 0) {
    return "Don't worry about mistakes - they're how we learn! Keep going!";
  }

  const areaMessages: Record<WeakAreaType, string> = {
    vocabulary: "Building vocabulary takes time. Every word you practice is progress!",
    pronunciation: "Pronunciation improves with practice. Don't be afraid to make sounds!",
    grammar: "Grammar patterns take repetition. You're building muscle memory!",
    comprehension: "Understanding takes time. Slow down and focus on meaning!",
    confidence: "Confidence grows with every attempt. You're braver than you think!",
  };

  return areaMessages[weakAreas[0]] || "Keep practicing - you're making progress!";
}
