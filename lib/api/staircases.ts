/**
 * Staircase API Functions
 *
 * Backend functions to manage user staircases, progress, and medals
 */

import { supabase } from '@/lib/supabase';
import { generatePersonalizedStaircase, PersonalizedStaircase } from '@/lib/gemini/staircase-generator';

export interface OnboardingProfile {
  learning_goal: string;
  proficiency_level: string;
  daily_time_minutes: number;
  scenarios: string[];
}

export interface StaircaseWithSteps {
  id: string;
  user_id: string;
  version: number;
  is_active: boolean;
  total_stairs: number;
  estimated_completion_days: number;
  started_at: string;
  completed_at: string | null;
  steps: StaircaseStep[];
}

export interface StaircaseStep {
  id: string;
  staircase_id: string;
  step_order: number;
  title: string;
  emoji: string;
  description: string;
  difficulty: string;
  estimated_days: number;
  vocabulary_count: number;
  skills_focus: string[];
  scenario_tags: string[];
}

export interface StairProgress {
  id: string;
  user_id: string;
  step_id: string;
  status: 'locked' | 'current' | 'completed';
  vocabulary_learned: number;
  cards_reviewed: number;
  practice_minutes: number;
  started_at: string | null;
  completed_at: string | null;
  last_activity_at: string;
}

/**
 * Complete onboarding and generate personalized staircase
 */
export async function completeOnboarding(
  userId: string,
  profile: OnboardingProfile
): Promise<{ success: boolean; staircase?: StaircaseWithSteps; error?: string }> {
  try {
    // 1. Save onboarding profile
    const { error: profileError } = await supabase
      .from('user_onboarding_profiles')
      .upsert({
        user_id: userId,
        learning_goal: profile.learning_goal,
        proficiency_level: profile.proficiency_level,
        daily_time_minutes: profile.daily_time_minutes,
        scenarios: profile.scenarios,
      });

    if (profileError) {
      console.error('Error saving onboarding profile:', profileError);
      return { success: false, error: profileError.message };
    }

    // 2. Generate staircase with Gemini
    const geminiStaircase = await generatePersonalizedStaircase(profile);

    // 3. Save staircase to database
    const { data: staircaseData, error: staircaseError } = await supabase
      .from('user_staircases')
      .insert({
        user_id: userId,
        version: 1,
        is_active: true,
        generation_parameters: {
          learning_goal: profile.learning_goal,
          proficiency_level: profile.proficiency_level,
          daily_time_minutes: profile.daily_time_minutes,
          scenarios: profile.scenarios,
          gemini_model: 'gemini-2.0-flash-exp',
        },
        total_stairs: geminiStaircase.stairs.length,
        estimated_completion_days: geminiStaircase.estimated_completion_days,
      })
      .select()
      .single();

    if (staircaseError || !staircaseData) {
      console.error('Error saving staircase:', staircaseError);
      return { success: false, error: staircaseError?.message || 'Failed to save staircase' };
    }

    // 4. Save staircase steps
    const stepsToInsert = geminiStaircase.stairs.map((stair) => ({
      staircase_id: staircaseData.id,
      step_order: stair.order,
      title: stair.title,
      emoji: stair.emoji,
      description: stair.description,
      difficulty: stair.difficulty,
      estimated_days: stair.estimated_days,
      vocabulary_count: stair.vocabulary_count,
      skills_focus: stair.skills_focus,
      scenario_tags: stair.scenario_tags,
    }));

    const { data: stepsData, error: stepsError } = await supabase
      .from('staircase_steps')
      .insert(stepsToInsert)
      .select();

    if (stepsError || !stepsData) {
      console.error('Error saving staircase steps:', stepsError);
      return { success: false, error: stepsError?.message || 'Failed to save steps' };
    }

    // 5. Initialize progress for all steps
    const progressToInsert = stepsData.map((step, index) => ({
      user_id: userId,
      step_id: step.id,
      status: index === 0 ? 'current' : 'locked', // First step is current
    }));

    const { error: progressError } = await supabase
      .from('user_stair_progress')
      .insert(progressToInsert);

    if (progressError) {
      console.error('Error initializing progress:', progressError);
      return { success: false, error: progressError.message };
    }

    // Return complete staircase with steps
    return {
      success: true,
      staircase: {
        ...staircaseData,
        steps: stepsData,
      },
    };
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get user's current staircase with progress
 */
export async function getUserStaircaseProgress(
  userId: string
): Promise<{
  staircase: StaircaseWithSteps | null;
  progress: StairProgress[];
  currentStep: (StaircaseStep & StairProgress) | null;
}> {
  try {
    // 1. Get active staircase
    const { data: staircase, error: staircaseError } = await supabase
      .from('user_staircases')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (staircaseError || !staircase) {
      return { staircase: null, progress: [], currentStep: null };
    }

    // 2. Get all steps for this staircase
    const { data: steps, error: stepsError } = await supabase
      .from('staircase_steps')
      .select('*')
      .eq('staircase_id', staircase.id)
      .order('step_order', { ascending: true });

    if (stepsError || !steps) {
      return { staircase: null, progress: [], currentStep: null };
    }

    // 3. Get progress for all steps
    const { data: progress, error: progressError } = await supabase
      .from('user_stair_progress')
      .select('*')
      .eq('user_id', userId)
      .in(
        'step_id',
        steps.map((s) => s.id)
      );

    if (progressError || !progress) {
      return { staircase: { ...staircase, steps }, progress: [], currentStep: null };
    }

    // 4. Find current step
    const currentProgress = progress.find((p) => p.status === 'current');
    const currentStepData = currentProgress
      ? steps.find((s) => s.id === currentProgress.step_id)
      : null;

    const currentStep = currentStepData && currentProgress
      ? { ...currentStepData, ...currentProgress }
      : null;

    return {
      staircase: { ...staircase, steps },
      progress,
      currentStep,
    };
  } catch (error) {
    console.error('Error fetching staircase progress:', error);
    return { staircase: null, progress: [], currentStep: null };
  }
}

/**
 * Complete current step and unlock next one
 */
export async function completeStep(
  userId: string,
  stepId: string
): Promise<{ success: boolean; nextStepUnlocked?: boolean; staircaseCompleted?: boolean }> {
  try {
    // 1. Mark current step as completed
    const { error: updateError } = await supabase
      .from('user_stair_progress')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('step_id', stepId)
      .eq('status', 'current');

    if (updateError) {
      console.error('Error completing step:', updateError);
      return { success: false };
    }

    // 2. Get the staircase and find next step
    const { staircase, progress } = await getUserStaircaseProgress(userId);

    if (!staircase) {
      return { success: true, nextStepUnlocked: false };
    }

    // Find completed step order
    const completedStep = staircase.steps.find((s) => s.id === stepId);
    if (!completedStep) {
      return { success: true, nextStepUnlocked: false };
    }

    // 3. Find and unlock next step
    const nextStep = staircase.steps.find((s) => s.step_order === completedStep.step_order + 1);

    if (nextStep) {
      const { error: unlockError } = await supabase
        .from('user_stair_progress')
        .update({
          status: 'current',
          started_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('step_id', nextStep.id);

      if (unlockError) {
        console.error('Error unlocking next step:', unlockError);
        return { success: true, nextStepUnlocked: false };
      }

      return { success: true, nextStepUnlocked: true, staircaseCompleted: false };
    } else {
      // No more steps - staircase completed!
      const { error: completeStaircaseError } = await supabase
        .from('user_staircases')
        .update({
          is_active: false,
          completed_at: new Date().toISOString(),
        })
        .eq('id', staircase.id);

      if (completeStaircaseError) {
        console.error('Error completing staircase:', completeStaircaseError);
      }

      return { success: true, nextStepUnlocked: false, staircaseCompleted: true };
    }
  } catch (error) {
    console.error('Error in completeStep:', error);
    return { success: false };
  }
}

/**
 * Update step progress (vocabulary learned, cards reviewed, practice minutes)
 */
export async function updateStepProgress(
  userId: string,
  stepId: string,
  updates: {
    vocabulary_learned?: number;
    cards_reviewed?: number;
    practice_minutes?: number;
  }
): Promise<{ success: boolean }> {
  try {
    const { error } = await supabase
      .from('user_stair_progress')
      .update({
        ...updates,
        last_activity_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('step_id', stepId);

    if (error) {
      console.error('Error updating step progress:', error);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateStepProgress:', error);
    return { success: false };
  }
}

/**
 * Get user's medals
 */
export async function getUserMedals(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_medals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_earned', true)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Error fetching medals:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserMedals:', error);
    return [];
  }
}
