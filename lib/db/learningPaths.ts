/**
 * Supabase database operations for learning paths in Vox Language App.
 *
 * Uses existing schema tables:
 * - user_staircases: User's personalized learning paths
 * - staircase_steps: Individual steps within each staircase
 * - user_stair_progress: Tracks user position and completion status
 * - user_onboarding_profiles: User goals and preferences
 */

import { supabase } from '@/lib/db/supabase';
import { GeneratedStair } from '@/types/learning';

// ============================================================================
// RESPONSE TYPES
// ============================================================================

/**
 * Stair record from database query.
 */
export interface StairRecord {
  id: string;
  order: number;
  title: string;
  emoji: string;
  description: string;
  status: 'locked' | 'current' | 'completed';
  vocabulary_count: number;
  estimated_days: number;
  skills_focus: string[];
  created_at: string;
  completed_at?: string;
}

/**
 * Formatted stair for home screen display (matching MOCK_STAIRS structure).
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

// ============================================================================
// LEARNING PATH OPERATIONS (using user_staircases table)
// ============================================================================

/**
 * Create a new learning path (staircase) for a user.
 *
 * @param userId - The user's UUID
 * @param pathData - Learning path data from onboarding
 * @returns The created staircase's ID, or null on error
 */
export async function createLearningPath(
  userId: string,
  pathData: {
    title: string;
    description: string;
    target_language: string;
    native_language: string;
    target_accent?: string;  // User's preferred accent for voice conversations
    motivation: string;
    proficiency_level: string;
    timeline: string;
  }
): Promise<{ id: string } | null> {
  try {
    // First, deactivate any existing active staircases for this user
    await supabase
      .from('user_staircases')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('is_active', true);

    // Create the new staircase
    // NOTE: Database constraint requires total_stairs BETWEEN 8 AND 12
    const { data, error } = await supabase
      .from('user_staircases')
      .insert({
        user_id: userId,
        is_active: true,
        version: 1,
        total_stairs: 8, // Minimum required by database constraint (8-12)
        estimated_completion_days: 56, // ~8 weeks default
        generation_parameters: {
          title: pathData.title,
          description: pathData.description,
          target_language: pathData.target_language,
          native_language: pathData.native_language,
          target_accent: pathData.target_accent || null,  // Persist accent for voice features
          motivation: pathData.motivation,
          proficiency_level: pathData.proficiency_level,
          timeline: pathData.timeline,
        },
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating staircase:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('User ID:', userId);
      console.error('Path data:', JSON.stringify(pathData, null, 2));
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception creating staircase:', error);
    return null;
  }
}

/**
 * Create a section - in the existing schema, sections don't exist as separate entities.
 * Steps belong directly to staircases. This function creates the staircase's steps.
 *
 * For compatibility with the path generation flow, this returns a mock section ID
 * that is actually the staircase ID.
 */
export async function createSection(
  staircaseId: string,
  _sectionData: {
    order: number;
    title: string;
    description: string;
  }
): Promise<{ id: string } | null> {
  // In the existing schema, steps belong directly to staircases (no sections table)
  // Return the staircase ID as the "section" ID for compatibility
  return { id: staircaseId };
}

// ============================================================================
// STAIR OPERATIONS (using staircase_steps table)
// ============================================================================

/**
 * Batch create multiple stairs (steps) for a staircase.
 *
 * @param staircaseId - The staircase's UUID (passed as "sectionId" for compatibility)
 * @param stairs - Array of generated stairs from AI
 * @returns True if successful, false on error
 */
export async function createStairsForSection(
  staircaseId: string,
  stairs: GeneratedStair[]
): Promise<boolean> {
  try {
    // Get user_id from staircase for progress records
    const { data: staircase, error: staircaseError } = await supabase
      .from('user_staircases')
      .select('user_id')
      .eq('id', staircaseId)
      .single();

    if (staircaseError || !staircase) {
      console.error('Error fetching staircase:', staircaseError);
      return false;
    }

    // Insert steps into staircase_steps table
    const stepsData = stairs.map((stair, index) => ({
      staircase_id: staircaseId,
      step_order: stair.order,
      title: stair.title,
      emoji: stair.emoji,
      description: stair.description,
      difficulty: mapProficiencyToDifficulty(index, stairs.length),
      estimated_days: stair.estimated_days,
      vocabulary_count: stair.vocabulary?.length || 30,
      skills_focus: stair.skills_unlocked || ['speaking', 'listening'],
      scenario_tags: stair.skills_required || [],
    }));

    const { data: insertedSteps, error: stepsError } = await supabase
      .from('staircase_steps')
      .insert(stepsData)
      .select('id, step_order');

    if (stepsError) {
      console.error('Error creating steps:', stepsError);
      return false;
    }

    // Create progress records for each step
    if (insertedSteps && insertedSteps.length > 0) {
      const progressData = insertedSteps.map((step, index) => ({
        user_id: staircase.user_id,
        step_id: step.id,
        status: index === 0 ? 'current' : 'locked',
        vocabulary_learned: 0,
        cards_reviewed: 0,
        practice_minutes: 0,
      }));

      const { error: progressError } = await supabase
        .from('user_stair_progress')
        .insert(progressData);

      if (progressError) {
        console.error('Error creating progress records:', progressError);
        // Don't fail the whole operation, steps were created
      }
    }

    // Update staircase with actual stair count
    const { error: updateError } = await supabase
      .from('user_staircases')
      .update({
        total_stairs: stairs.length,
        estimated_completion_days: stairs.reduce((sum, s) => sum + s.estimated_days, 0)
      })
      .eq('id', staircaseId);

    if (updateError) {
      console.error('Error updating staircase count:', updateError);
    }

    return true;
  } catch (error) {
    console.error('Exception creating stairs:', error);
    return false;
  }
}

/**
 * Map stair index to difficulty level based on position in staircase.
 */
function mapProficiencyToDifficulty(index: number, total: number): string {
  const ratio = index / total;
  if (ratio < 0.2) return 'beginner';
  if (ratio < 0.4) return 'elementary';
  if (ratio < 0.6) return 'intermediate';
  if (ratio < 0.8) return 'upper_intermediate';
  return 'advanced';
}

/**
 * Update a stair's status (locked, current, completed).
 *
 * @param stepId - The step's UUID
 * @param status - New status for the step
 * @returns True if successful, false on error
 */
export async function updateStairStatus(
  stepId: string,
  status: 'locked' | 'current' | 'completed'
): Promise<boolean> {
  try {
    const updateData: Record<string, any> = {
      status,
      last_activity_at: new Date().toISOString(),
    };

    if (status === 'current' && !updateData.started_at) {
      updateData.started_at = new Date().toISOString();
    }

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('user_stair_progress')
      .update(updateData)
      .eq('step_id', stepId);

    if (error) {
      console.error('Error updating step status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception updating step status:', error);
    return false;
  }
}

/**
 * Get stairs formatted for the home screen display.
 * Returns stairs from the user's active staircase.
 *
 * @param userId - The user's UUID
 * @returns Array of stairs formatted for display, or empty array on error
 */
export async function getStairsForHome(userId: string): Promise<StairForDisplay[]> {
  try {
    // Get user's active staircase
    const { data: staircase, error: staircaseError } = await supabase
      .from('user_staircases')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (staircaseError || !staircase) {
      // No active staircase - user hasn't completed onboarding
      console.log('No active staircase found for user');
      return [];
    }

    // Get all steps for this staircase with their progress
    const { data: steps, error: stepsError } = await supabase
      .from('staircase_steps')
      .select(`
        id,
        step_order,
        title,
        emoji,
        description,
        vocabulary_count,
        estimated_days,
        user_stair_progress!inner (
          status,
          completed_at
        )
      `)
      .eq('staircase_id', staircase.id)
      .eq('user_stair_progress.user_id', userId)
      .order('step_order', { ascending: true });

    if (stepsError) {
      console.error('Error fetching steps:', stepsError);
      return [];
    }

    // Format steps for display
    return (steps || []).map(step => {
      const progress = Array.isArray(step.user_stair_progress)
        ? step.user_stair_progress[0]
        : step.user_stair_progress;

      return {
        id: step.id,
        order: step.step_order,
        title: step.title,
        emoji: step.emoji,
        description: step.description,
        status: (progress?.status || 'locked') as 'locked' | 'current' | 'completed',
        vocabulary_count: step.vocabulary_count,
        estimated_days: step.estimated_days,
      };
    });
  } catch (error) {
    console.error('Exception fetching stairs for home:', error);
    return [];
  }
}

/**
 * Check if user has an active learning path.
 */
export async function hasActiveLearningPath(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_staircases')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    return !error && !!data;
  } catch {
    return false;
  }
}
