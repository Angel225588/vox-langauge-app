/**
 * Learning Path Hook
 *
 * Manages fetching and operations for user's learning path including stairs,
 * progress tracking, and path generation.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/db/supabase';
import type { Stair } from '@/lib/db/schemas/learning';

/**
 * Stair data formatted for display on home screen
 */
export interface StairForDisplay {
  id: string;
  order: number;
  title: string;
  emoji: string;
  description: string;
  status: 'locked' | 'current' | 'completed';
  vocabulary_count: number;
  estimated_days: number;
}

/**
 * Return type for useLearningPath hook
 */
export interface UseLearningPathReturn {
  // Data
  stairs: StairForDisplay[];
  currentStair: StairForDisplay | null;
  isLoading: boolean;
  error: string | null;
  hasPath: boolean;

  // Operations
  refreshPath: () => Promise<void>;
  completeStair: (stairId: string) => Promise<void>;
  startStair: (stairId: string) => Promise<void>;
}

/**
 * Hook to fetch and manage user's learning path
 *
 * @param userId - The user's ID (null if not authenticated)
 * @returns Learning path data and operations
 *
 * @example
 * ```tsx
 * const { stairs, currentStair, isLoading, refreshPath } = useLearningPath(user?.id);
 *
 * if (isLoading) return <LoadingSpinner />;
 * if (!hasPath) return <CreatePathPrompt />;
 *
 * return (
 *   <StaircaseView
 *     stairs={stairs}
 *     current={currentStair}
 *     onStairPress={(id) => startStair(id)}
 *   />
 * );
 * ```
 */
export function useLearningPath(userId: string | null): UseLearningPathReturn {
  const [stairs, setStairs] = useState<StairForDisplay[]>([]);
  const [currentStair, setCurrentStair] = useState<StairForDisplay | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPath, setHasPath] = useState(false);

  /**
   * Fetch stairs for the current user's active section
   */
  const fetchStairs = useCallback(async () => {
    if (!userId) {
      setStairs([]);
      setCurrentStair(null);
      setHasPath(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 1. Get user's active learning path
      const { data: pathData, error: pathError } = await supabase
        .from('learning_paths')
        .select('id, current_section')
        .eq('user_id', userId)
        .single();

      if (pathError || !pathData) {
        // No path exists yet
        setStairs([]);
        setCurrentStair(null);
        setHasPath(false);
        setIsLoading(false);
        return;
      }

      setHasPath(true);

      // 2. Get active section
      const { data: sectionData, error: sectionError } = await supabase
        .from('sections')
        .select('id')
        .eq('path_id', pathData.id)
        .eq('section_number', pathData.current_section)
        .single();

      if (sectionError || !sectionData) {
        throw new Error('Failed to load current section');
      }

      // 3. Get all stairs for this section
      const { data: stairsData, error: stairsError } = await supabase
        .from('stairs')
        .select('*')
        .eq('section_id', sectionData.id)
        .order('order', { ascending: true });

      if (stairsError) {
        throw new Error('Failed to load stairs');
      }

      // 4. Transform to display format
      const displayStairs: StairForDisplay[] = (stairsData || []).map((stair) => ({
        id: stair.id,
        order: stair.order,
        title: stair.title,
        emoji: stair.emoji,
        description: stair.description,
        status: stair.status as 'locked' | 'current' | 'completed',
        vocabulary_count: stair.vocabulary_count,
        estimated_days: stair.estimated_days,
      }));

      setStairs(displayStairs);

      // 5. Set current stair
      const current = displayStairs.find((s) => s.status === 'current') || null;
      setCurrentStair(current);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load learning path';
      console.error('Error fetching stairs:', err);
      setError(errorMessage);
      setStairs([]);
      setCurrentStair(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  /**
   * Refresh the learning path data
   */
  const refreshPath = useCallback(async () => {
    await fetchStairs();
  }, [fetchStairs]);

  /**
   * Complete a stair and unlock the next one
   */
  const completeStair = useCallback(
    async (stairId: string) => {
      if (!userId) {
        setError('User not authenticated');
        return;
      }

      try {
        setError(null);

        // 1. Mark stair as completed
        const { error: updateError } = await supabase
          .from('stairs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', stairId);

        if (updateError) {
          throw new Error('Failed to complete stair');
        }

        // 2. Find next stair
        const currentStairIndex = stairs.findIndex((s) => s.id === stairId);
        if (currentStairIndex === -1) {
          throw new Error('Stair not found');
        }

        const nextStair = stairs[currentStairIndex + 1];

        // 3. If there's a next stair, unlock it
        if (nextStair) {
          const { error: unlockError } = await supabase
            .from('stairs')
            .update({
              status: 'current',
            })
            .eq('id', nextStair.id);

          if (unlockError) {
            throw new Error('Failed to unlock next stair');
          }
        }

        // 4. Refresh the data
        await refreshPath();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to complete stair';
        console.error('Error completing stair:', err);
        setError(errorMessage);
      }
    },
    [userId, stairs, refreshPath]
  );

  /**
   * Start a stair (set it to current if not locked)
   */
  const startStair = useCallback(
    async (stairId: string) => {
      if (!userId) {
        setError('User not authenticated');
        return;
      }

      try {
        setError(null);

        // Find the stair
        const stair = stairs.find((s) => s.id === stairId);
        if (!stair) {
          throw new Error('Stair not found');
        }

        // Don't allow starting locked stairs
        if (stair.status === 'locked') {
          setError('This stair is locked. Complete previous stairs first.');
          return;
        }

        // If already current or completed, no update needed
        if (stair.status === 'current' || stair.status === 'completed') {
          return;
        }

        // Set as current
        const { error: updateError } = await supabase
          .from('stairs')
          .update({
            status: 'current',
          })
          .eq('id', stairId);

        if (updateError) {
          throw new Error('Failed to start stair');
        }

        // Refresh the data
        await refreshPath();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to start stair';
        console.error('Error starting stair:', err);
        setError(errorMessage);
      }
    },
    [userId, stairs, refreshPath]
  );

  // Fetch stairs when userId changes
  useEffect(() => {
    fetchStairs();
  }, [fetchStairs]);

  return {
    // Data
    stairs,
    currentStair,
    isLoading,
    error,
    hasPath,

    // Operations
    refreshPath,
    completeStair,
    startStair,
  };
}

/**
 * Onboarding data for path generation
 */
export interface OnboardingData {
  user_id: string;
  target_language: string;
  native_language: string;
  motivation: string;
  motivation_custom?: string;
  why_now?: string;
  proficiency_level: 'beginner' | 'elementary' | 'intermediate' | 'advanced';
  timeline: '1_month' | '3_months' | '6_months' | '1_year';
  previous_attempts?: string;
  commitment_stakes: string;
}

/**
 * Return type for usePathGeneration hook
 */
export interface UsePathGenerationReturn {
  isGenerating: boolean;
  progress: number;
  error: string | null;
  generatePath: (userId: string, onboardingData: OnboardingData) => Promise<void>;
}

/**
 * Hook to manage learning path generation
 *
 * @returns Path generation state and operations
 *
 * @example
 * ```tsx
 * const { isGenerating, progress, error, generatePath } = usePathGeneration();
 *
 * const handleComplete = async () => {
 *   await generatePath(user.id, onboardingData);
 *   router.push('/home');
 * };
 *
 * if (isGenerating) {
 *   return <ProgressBar progress={progress} />;
 * }
 * ```
 */
export function usePathGeneration(): UsePathGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generate a personalized learning path
   */
  const generatePath = useCallback(async (userId: string, onboardingData: OnboardingData) => {
    try {
      setIsGenerating(true);
      setProgress(0);
      setError(null);

      // Step 1: Validate input (0-10%)
      if (!userId || !onboardingData.target_language || !onboardingData.native_language) {
        throw new Error('Invalid onboarding data');
      }
      setProgress(10);

      // Step 2: Call AI service to generate path (10-60%)
      setProgress(30);

      // TODO: Implement actual path generation service
      // For now, this is a placeholder
      // const generatedPath = await createPersonalizedPath(onboardingData);

      // Simulate AI generation delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setProgress(60);

      // Step 3: Save to database (60-90%)
      // TODO: Implement database save
      // await saveLearningPath(userId, generatedPath);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      setProgress(90);

      // Step 4: Complete (90-100%)
      setProgress(100);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate learning path';
      console.error('Error generating path:', err);
      setError(errorMessage);
      setProgress(0);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    isGenerating,
    progress,
    error,
    generatePath,
  };
}
