/**
 * Content Update Service
 *
 * Rebuilds the user's learning path based on:
 * 1. Onboarding profile (language, profession, scenarios, level)
 * 2. Competency metrics (weak skills, strong skills)
 * 3. Word bank stats (words mastered, words struggling)
 * 4. Conversation history (topics practiced)
 *
 * Called from the profile "Update Learning Content" button.
 * Preserves vocabulary progress but regenerates stairs and scenarios.
 */

import { generatePreviewStairs, storePreviewStairs, loadPreviewStairs } from '@/lib/services/previewStairs';
import { generateInitialVocabulary } from '@/lib/word-bank/initialVocabGenerator';
import { getWordBankStats, getWordsByPriority, recalculateAllPriorities } from '@/lib/word-bank/storage';
import { getAllScores } from '@/lib/db/competencyMetrics';
import { computeByType, computeAverages } from '@/lib/metrics/competencyEngine';
import { invalidateIfProfileChanged } from '@/lib/utils/profileFingerprint';
import { getRecentSessions } from '@/lib/db/conversations';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// TYPES
// ============================================================================

export interface ContentUpdateInput {
  /** From onboarding V3 store */
  target_language: string;
  native_language: string;
  proficiency_level: string;
  profession?: string;
  scenarios: string[];
  custom_scenarios?: string[];
  /** User ID (for competency lookup) */
  userId?: string;
}

export interface ContentUpdateResult {
  success: boolean;
  stairsGenerated: number;
  vocabRefreshed: boolean;
  weakAreas: string[];
  strongAreas: string[];
  message: string;
}

// ============================================================================
// MAIN UPDATE FUNCTION
// ============================================================================

/**
 * Full content update — rebuilds learning path from profile + feedback.
 *
 * Steps:
 * 1. Analyze competency data → find weak/strong areas
 * 2. Analyze word bank → find struggling categories
 * 3. Rebuild staircase with emphasis on weak areas
 * 4. Refresh vocabulary priorities
 * 5. Clear content caches
 */
export async function updateLearningContent(
  input: ContentUpdateInput
): Promise<ContentUpdateResult> {
  console.log('[ContentUpdate] Starting full content update...');

  const weakAreas: string[] = [];
  const strongAreas: string[] = [];

  // ── Step 1: Analyze competency data ──
  try {
    const userId = input.userId || 'anonymous';
    const scores = await getAllScores(userId);

    if (scores.length > 0) {
      const byType = computeByType(scores);
      const averages = computeAverages(scores);

      // Find weak and strong skills
      const skills = Object.entries(byType) as [string, { avg: number; count: number }][];
      for (const [skill, data] of skills) {
        if (data.count > 0) {
          if (data.avg < 50) weakAreas.push(skill);
          else if (data.avg >= 75) strongAreas.push(skill);
        }
      }

      console.log('[ContentUpdate] Competency analysis:', {
        overall: averages.overall,
        weak: weakAreas,
        strong: strongAreas,
        totalSessions: scores.length,
      });
    }
  } catch (err) {
    console.warn('[ContentUpdate] Competency analysis failed:', err);
  }

  // ── Step 2: Analyze word bank ──
  try {
    const stats = await getWordBankStats();
    console.log('[ContentUpdate] Word bank:', {
      total: stats.totalWords,
      needReview: stats.wordsNeedingReview,
      avgMastery: stats.averageMastery,
    });

    // Recalculate all word priorities based on latest data
    await recalculateAllPriorities();
    console.log('[ContentUpdate] Word priorities recalculated');
  } catch (err) {
    console.warn('[ContentUpdate] Word bank analysis failed:', err);
  }

  // ── Step 3: Check recent conversations for topic gaps ──
  let recentTopics: string[] = [];
  try {
    const userId = input.userId || 'anonymous';
    const sessions = await getRecentSessions(userId, 10);
    recentTopics = sessions.map(s => s.scenario || '').filter(Boolean);
    console.log('[ContentUpdate] Recent conversation topics:', recentTopics);
  } catch (err) {
    console.warn('[ContentUpdate] Conversation history check failed:', err);
  }

  // ── Step 4: Rebuild staircase ──
  let stairsGenerated = 0;
  try {
    // Adjust scenarios based on weaknesses
    let scenarios = [...input.scenarios];

    // If speaking is weak, prioritize conversation-heavy scenarios
    if (weakAreas.includes('conversation') || weakAreas.includes('speaking')) {
      // Ensure we have scenarios that require verbal interaction
      if (!scenarios.some(s => s.toLowerCase().includes('meeting') || s.toLowerCase().includes('call'))) {
        scenarios.push('team meeting');
      }
    }

    // If listening is weak, add listening-focused scenarios
    if (weakAreas.includes('listening')) {
      if (!scenarios.some(s => s.toLowerCase().includes('presentation') || s.toLowerCase().includes('lecture'))) {
        scenarios.push('business presentation');
      }
    }

    // Remove already-practiced topics to keep content fresh
    const practicedSet = new Set(recentTopics.map(t => t.toLowerCase()));
    const freshScenarios = scenarios.filter(s => !practicedSet.has(s.toLowerCase()));
    const finalScenarios = freshScenarios.length >= 3 ? freshScenarios : scenarios;

    // Generate new stairs
    const newStairs = generatePreviewStairs({
      scenarios: finalScenarios,
      target_language: input.target_language,
      profession: input.profession,
      proficiency_level: input.proficiency_level,
    });

    // Preserve completion status from existing stairs
    const existingStairs = await loadPreviewStairs();
    if (existingStairs) {
      const completedIds = new Set(
        existingStairs.filter(s => s.status === 'completed').map(s => s.id)
      );
      // Mark equivalent stairs as completed
      newStairs.forEach((stair, i) => {
        if (existingStairs[i]?.status === 'completed') {
          stair.status = 'completed';
        }
      });
      // First non-completed stair is current
      const firstIncomplete = newStairs.find(s => s.status !== 'completed');
      if (firstIncomplete) firstIncomplete.status = 'current';
    }

    await storePreviewStairs(newStairs);
    stairsGenerated = newStairs.length;
    console.log('[ContentUpdate] Staircase rebuilt:', stairsGenerated, 'stairs');
  } catch (err) {
    console.error('[ContentUpdate] Staircase generation failed:', err);
  }

  // ── Step 5: Refresh vocabulary for new scenarios ──
  let vocabRefreshed = false;
  try {
    // Don't clear existing words — just add new ones for new scenarios
    await generateInitialVocabulary({
      target_language: input.target_language,
      native_language: input.native_language,
      proficiency_level: input.proficiency_level,
      profession: input.profession,
    });
    vocabRefreshed = true;
    console.log('[ContentUpdate] Vocabulary refreshed');
  } catch (err) {
    console.warn('[ContentUpdate] Vocabulary refresh failed:', err);
  }

  // ── Step 6: Invalidate content caches ──
  try {
    await invalidateIfProfileChanged({
      target_language: input.target_language,
      native_language: input.native_language,
      proficiency_level: input.proficiency_level,
      scenarios: [...input.scenarios, ...(input.custom_scenarios || [])],
      profession: input.profession,
    });

    // Clear lesson plan cache
    await AsyncStorage.removeItem('vox-active-lesson-plan');
    console.log('[ContentUpdate] Caches invalidated');
  } catch (err) {
    console.warn('[ContentUpdate] Cache invalidation failed:', err);
  }

  // ── Build result message ──
  const parts: string[] = [];
  if (stairsGenerated > 0) parts.push(`${stairsGenerated} new lessons`);
  if (vocabRefreshed) parts.push('vocabulary refreshed');
  if (weakAreas.length > 0) parts.push(`focusing on: ${weakAreas.join(', ')}`);

  const message = parts.length > 0
    ? `Updated: ${parts.join(' • ')}`
    : 'Learning path refreshed';

  console.log('[ContentUpdate] Complete:', message);

  return {
    success: true,
    stairsGenerated,
    vocabRefreshed,
    weakAreas,
    strongAreas,
    message,
  };
}
