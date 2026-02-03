/**
 * useStairContent Hook
 *
 * Manages loading and caching of stair content (vocabulary, scenarios, grammar).
 * Handles on-demand AI content generation for skeleton stairs.
 *
 * Flow:
 * 1. Check DB for existing content (getStairContent)
 * 2. If content_loaded = true, return cached content
 * 3. If content_loaded = false, generate with AI (loadStairContentOnDemand)
 * 4. Store generated content in DB (updateStairContent)
 * 5. Transform VocabItem[] to VocabularyItem[] for lesson consumption
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getStairContent,
  getStairSkeleton,
  getStaircaseParams,
  updateStairContent,
} from '@/lib/db/learningPaths';
import { loadStairContentOnDemand } from '@/lib/services/pathGeneration';
import type { VocabularyItem, ExampleSentence, DEFAULT_VOCABULARY_ITEM } from '@/types/vocabulary';
import type { VocabItem, Scenario } from '@/types/learning';
import type { PathGenerationInput } from '@/lib/services/pathGeneration';

// ============================================================================
// TYPES
// ============================================================================

export interface StairContentData {
  vocabulary: VocabularyItem[];
  scenarios: Scenario[];
  grammarPoints: string[];
}

export interface UseStairContentReturn {
  /** Content data (vocabulary, scenarios, grammar) */
  data: StairContentData | null;
  /** Loading state */
  isLoading: boolean;
  /** Error message if loading failed */
  error: string | null;
  /** Whether content was generated (vs cached) */
  wasGenerated: boolean;
  /** Refresh content (force regeneration) */
  refresh: () => Promise<void>;
}

// ============================================================================
// TRANSFORM FUNCTIONS
// ============================================================================

/**
 * Transform AI VocabItem to lesson VocabularyItem format.
 * Adds required fields for the vocabulary card system.
 */
function transformVocabItem(item: VocabItem, index: number): VocabularyItem {
  // Map difficulty to CEFR level
  const difficultyToCEFR: Record<string, 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'> = {
    easy: 'A1',
    medium: 'B1',
    hard: 'B2',
  };

  // Create example sentences array
  const examples: ExampleSentence[] = [];
  if (item.example_sentence) {
    examples.push({
      text: item.example_sentence,
      translation: item.example_translation || '',
      highlightWord: true,
    });
  }

  return {
    // Core fields
    id: `vocab-${index}-${Date.now()}`,
    word: item.word,
    translation: item.translation,
    phonetic: item.pronunciation || undefined,
    category: 'stair-content',
    cefrLevel: difficultyToCEFR[item.difficulty] || 'A1',
    partOfSpeech: item.part_of_speech || 'unknown',

    // Learning state - new word
    masteryScore: 0,
    priority: 5,
    timesCorrect: 0,
    timesIncorrect: 0,
    source: 'ai-generated',
    exampleSentences: item.example_sentence ? [item.example_sentence] : [],
    addedAt: new Date().toISOString(),
    nextReviewDate: new Date().toISOString(),

    // Extended content
    examples,

    // SM-2 defaults
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,

    // Card variants - all incomplete
    cardVariantsCompleted: {
      introduction: false,
      listening: false,
      typing: false,
      speaking: false,
      audioQuiz: false,
    },
    lastVariantShown: null,
  };
}

/**
 * Transform array of AI VocabItems to VocabularyItems.
 */
function transformVocabulary(items: VocabItem[]): VocabularyItem[] {
  return items.map((item, index) => transformVocabItem(item, index));
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Hook for loading and managing stair content.
 *
 * @param stepId - The stair step's UUID
 * @param userId - The user's UUID (needed for staircase params)
 * @returns Content data, loading state, and refresh function
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useStairContent(stepId, userId);
 *
 * if (isLoading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage message={error} />;
 *
 * // Use data.vocabulary for lessons
 * const lessonVocab = data.vocabulary.slice(0, 5);
 * ```
 */
export function useStairContent(
  stepId: string | undefined,
  userId: string | undefined
): UseStairContentReturn {
  const [data, setData] = useState<StairContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wasGenerated, setWasGenerated] = useState(false);

  const loadContent = useCallback(async () => {
    if (!stepId || !userId) {
      setError('Missing stepId or userId');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setWasGenerated(false);

    try {
      // Step 1: Check DB for existing content
      const existingContent = await getStairContent(stepId);

      if (existingContent?.content_loaded && existingContent.vocabulary.length > 0) {
        // Content is cached - transform and return
        console.log('[useStairContent] Using cached content for step:', stepId);
        setData({
          vocabulary: transformVocabulary(existingContent.vocabulary as VocabItem[]),
          scenarios: existingContent.scenarios as Scenario[],
          grammarPoints: existingContent.grammar_points,
        });
        setIsLoading(false);
        return;
      }

      // Step 2: Content not loaded - need to generate
      console.log('[useStairContent] Generating content for step:', stepId);

      // Get stair skeleton for AI prompt
      const skeleton = await getStairSkeleton(stepId);
      if (!skeleton) {
        throw new Error('Could not load stair skeleton');
      }

      // Get staircase params for AI prompt
      const params = await getStaircaseParams(userId);
      if (!params) {
        throw new Error('Could not load staircase parameters');
      }

      // Build PathGenerationInput for AI
      const pathInput: PathGenerationInput = {
        user_id: userId,
        target_language: params.target_language,
        native_language: params.native_language,
        target_accent: params.target_accent,
        motivation: params.motivation,
        motivation_custom: params.motivation_custom,
        proficiency_level: mapProficiencyLevel(params.proficiency_level),
        timeline: '3_months', // Default, content generation doesn't need exact timeline
        commitment_stakes: params.commitment_stakes || '',
      };

      // Step 3: Generate content with AI
      const generatedContent = await loadStairContentOnDemand(skeleton, pathInput);

      // Step 4: Store in DB for future use
      await updateStairContent(stepId, {
        vocabulary: generatedContent.vocabulary,
        scenarios: generatedContent.scenarios,
        grammar_points: generatedContent.grammar_points,
      });

      // Step 5: Transform and return
      setData({
        vocabulary: transformVocabulary(generatedContent.vocabulary as unknown as VocabItem[]),
        scenarios: generatedContent.scenarios as Scenario[],
        grammarPoints: generatedContent.grammar_points,
      });
      setWasGenerated(true);
      console.log('[useStairContent] Generated and stored content:', generatedContent.vocabulary.length, 'words');
    } catch (err) {
      console.error('[useStairContent] Error loading content:', err);
      setError(err instanceof Error ? err.message : 'Failed to load stair content');
    } finally {
      setIsLoading(false);
    }
  }, [stepId, userId]);

  // Load content on mount and when stepId changes
  useEffect(() => {
    loadContent();
  }, [loadContent]);

  return {
    data,
    isLoading,
    error,
    wasGenerated,
    refresh: loadContent,
  };
}

/**
 * Map proficiency level string to PathGenerationInput format.
 */
function mapProficiencyLevel(level: string): 'beginner' | 'elementary' | 'intermediate' | 'advanced' {
  const map: Record<string, 'beginner' | 'elementary' | 'intermediate' | 'advanced'> = {
    A1: 'beginner',
    A2: 'elementary',
    B1: 'intermediate',
    B2: 'intermediate',
    C1: 'advanced',
    C2: 'advanced',
    beginner: 'beginner',
    elementary: 'elementary',
    intermediate: 'intermediate',
    upper_intermediate: 'intermediate',
    advanced: 'advanced',
  };
  return map[level] || 'beginner';
}

// ============================================================================
// PRE-LOAD HELPER
// ============================================================================

/**
 * Pre-load content for the next stair (call at ~80% progress).
 * Fire-and-forget - doesn't block the UI.
 *
 * @param nextStepId - The next stair's UUID
 * @param userId - The user's UUID
 */
export async function preloadNextStairContent(
  nextStepId: string,
  userId: string
): Promise<void> {
  try {
    // Check if content already loaded
    const existingContent = await getStairContent(nextStepId);
    if (existingContent?.content_loaded) {
      console.log('[preloadNextStairContent] Content already loaded for:', nextStepId);
      return;
    }

    console.log('[preloadNextStairContent] Pre-loading content for:', nextStepId);

    // Get skeleton and params
    const skeleton = await getStairSkeleton(nextStepId);
    const params = await getStaircaseParams(userId);

    if (!skeleton || !params) {
      console.warn('[preloadNextStairContent] Missing skeleton or params');
      return;
    }

    // Build input
    const pathInput: PathGenerationInput = {
      user_id: userId,
      target_language: params.target_language,
      native_language: params.native_language,
      target_accent: params.target_accent,
      motivation: params.motivation,
      motivation_custom: params.motivation_custom,
      proficiency_level: mapProficiencyLevel(params.proficiency_level),
      timeline: '3_months',
      commitment_stakes: params.commitment_stakes || '',
    };

    // Generate and store
    const generatedContent = await loadStairContentOnDemand(skeleton, pathInput);
    await updateStairContent(nextStepId, {
      vocabulary: generatedContent.vocabulary,
      scenarios: generatedContent.scenarios,
      grammar_points: generatedContent.grammar_points,
    });

    console.log('[preloadNextStairContent] Successfully pre-loaded:', generatedContent.vocabulary.length, 'words');
  } catch (error) {
    // Fire-and-forget - log but don't throw
    console.error('[preloadNextStairContent] Error pre-loading:', error);
  }
}

export default useStairContent;
