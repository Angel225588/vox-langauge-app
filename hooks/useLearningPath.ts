/**
 * Learning Path Hook
 *
 * Manages fetching and operations for user's learning path including stairs,
 * progress tracking, and path generation.
 *
 * Uses existing schema tables:
 * - user_staircases: User's personalized learning paths
 * - staircase_steps: Individual steps within each staircase
 * - user_stair_progress: Tracks user position and completion status
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/db/supabase';
import { preloadNextStairContent } from '@/hooks/useStairContent';
import { getNextStairId, getStairContent } from '@/lib/db/learningPaths';

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
  /** Pre-load content for the next stair (call at ~80% progress) */
  preloadNextContent: (currentStairId: string) => Promise<void>;
}

/**
 * Hook to fetch and manage user's learning path
 *
 * @param userId - The user's ID (null if not authenticated)
 * @returns Learning path data and operations
 */
export function useLearningPath(userId: string | null): UseLearningPathReturn {
  const [stairs, setStairs] = useState<StairForDisplay[]>([]);
  const [currentStair, setCurrentStair] = useState<StairForDisplay | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPath, setHasPath] = useState(false);

  /**
   * Fetch stairs for the current user's active staircase
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

      // 1. Get user's active staircase
      const { data: staircase, error: staircaseError } = await supabase
        .from('user_staircases')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (staircaseError || !staircase) {
        // No active staircase - user hasn't completed onboarding
        setStairs([]);
        setCurrentStair(null);
        setHasPath(false);
        setIsLoading(false);
        return;
      }

      setHasPath(true);

      // 2. Get all steps for this staircase with their progress
      const { data: steps, error: stepsError } = await supabase
        .from('staircase_steps')
        .select(`
          id,
          step_order,
          title,
          emoji,
          description,
          vocabulary_count,
          estimated_days
        `)
        .eq('staircase_id', staircase.id)
        .order('step_order', { ascending: true });

      if (stepsError) {
        throw new Error('Failed to load steps');
      }

      // 3. Get progress for all steps
      const stepIds = (steps || []).map(s => s.id);
      const { data: progressData, error: progressError } = await supabase
        .from('user_stair_progress')
        .select('step_id, status, completed_at')
        .eq('user_id', userId)
        .in('step_id', stepIds);

      if (progressError) {
        console.error('Error fetching progress:', progressError);
      }

      // Create a map for quick progress lookup
      const progressMap = new Map<string, { status: string; completed_at: string | null }>();
      (progressData || []).forEach(p => {
        progressMap.set(p.step_id, { status: p.status, completed_at: p.completed_at });
      });

      // 4. Transform to display format
      const displayStairs: StairForDisplay[] = (steps || []).map((step, index) => {
        const progress = progressMap.get(step.id);
        // Default: first step is current, rest are locked
        const defaultStatus = index === 0 ? 'current' : 'locked';

        return {
          id: step.id,
          order: step.step_order,
          title: step.title,
          emoji: step.emoji,
          description: step.description,
          status: (progress?.status || defaultStatus) as 'locked' | 'current' | 'completed',
          vocabulary_count: step.vocabulary_count,
          estimated_days: step.estimated_days,
        };
      });

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

        // 1. Mark step as completed
        const { error: updateError } = await supabase
          .from('user_stair_progress')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            last_activity_at: new Date().toISOString(),
          })
          .eq('step_id', stairId)
          .eq('user_id', userId);

        if (updateError) {
          throw new Error('Failed to complete step');
        }

        // 2. Find next step
        const currentStairIndex = stairs.findIndex((s) => s.id === stairId);
        if (currentStairIndex === -1) {
          throw new Error('Step not found');
        }

        const nextStair = stairs[currentStairIndex + 1];

        // 3. If there's a next step, unlock it and pre-load content
        if (nextStair) {
          const { error: unlockError } = await supabase
            .from('user_stair_progress')
            .update({
              status: 'current',
              started_at: new Date().toISOString(),
              last_activity_at: new Date().toISOString(),
            })
            .eq('step_id', nextStair.id)
            .eq('user_id', userId);

          if (unlockError) {
            throw new Error('Failed to unlock next step');
          }

          // Pre-load content for the next stair (fire-and-forget)
          preloadNextStairContent(nextStair.id, userId).catch((err) => {
            console.warn('[useLearningPath] Background pre-load failed:', err);
          });
        }

        // 4. Refresh the data
        await refreshPath();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to complete step';
        console.error('Error completing step:', err);
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
          throw new Error('Step not found');
        }

        // Don't allow starting locked stairs
        if (stair.status === 'locked') {
          setError('This step is locked. Complete previous steps first.');
          return;
        }

        // If already current or completed, no update needed
        if (stair.status === 'current' || stair.status === 'completed') {
          return;
        }

        // Set as current
        const { error: updateError } = await supabase
          .from('user_stair_progress')
          .update({
            status: 'current',
            started_at: new Date().toISOString(),
            last_activity_at: new Date().toISOString(),
          })
          .eq('step_id', stairId)
          .eq('user_id', userId);

        if (updateError) {
          throw new Error('Failed to start step');
        }

        // Refresh the data
        await refreshPath();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to start step';
        console.error('Error starting step:', err);
        setError(errorMessage);
      }
    },
    [userId, stairs, refreshPath]
  );

  /**
   * Pre-load content for the next stair (call at ~80% lesson progress)
   * This enables instant navigation to the next stair.
   */
  const preloadNextContent = useCallback(
    async (currentStairId: string) => {
      if (!userId) return;

      try {
        // Find the next stair's ID
        const nextStairId = await getNextStairId(currentStairId);
        if (!nextStairId) {
          console.log('[useLearningPath] No next stair to pre-load');
          return;
        }

        // Check if content already loaded
        const content = await getStairContent(nextStairId);
        if (content?.content_loaded) {
          console.log('[useLearningPath] Next stair content already loaded');
          return;
        }

        // Pre-load in background (fire-and-forget)
        console.log('[useLearningPath] Pre-loading next stair content:', nextStairId);
        preloadNextStairContent(nextStairId, userId).catch((err) => {
          console.warn('[useLearningPath] Pre-load failed:', err);
        });
      } catch (err) {
        console.warn('[useLearningPath] Error checking next stair:', err);
      }
    },
    [userId]
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
    preloadNextContent,
  };
}
