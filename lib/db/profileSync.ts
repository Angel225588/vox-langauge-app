/**
 * Profile Sync — Bridges onboarding data to Supabase
 *
 * Solves the critical disconnect: V3 onboarding saves to AsyncStorage only,
 * so profile data vanishes on app restart. This module syncs it to Supabase
 * for persistence, and loads it back into Zustand on app launch.
 *
 * Data flow:
 *   Onboarding complete → syncProfileToSupabase() → user_onboarding_profiles
 *   App launch → loadProfileFromSupabase() → Zustand store
 */

import { supabase } from './supabase';
import { useOnboardingV3, type OnboardingV3Data } from '@/hooks/useOnboardingV3';

// ─── Sync: Zustand → Supabase ────────────────────────

/**
 * Save the V3 onboarding data to Supabase after onboarding completes.
 * Called from creating-path.tsx when user is authenticated.
 */
export async function syncProfileToSupabase(
  userId: string,
  data: OnboardingV3Data,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('user_onboarding_profiles')
      .upsert({
        user_id: userId,
        first_name: data.first_name,
        target_language: data.target_language,
        native_language: data.native_language,
        proficiency_level: data.proficiency_level,
        learning_goal: data.goal,
        goal_custom: data.goal_custom,
        profession: data.profession,
        profession_custom: data.profession_custom,
        scenarios: data.scenarios,
        custom_scenarios: data.custom_scenarios,
        schedule_time: data.schedule_time,
        schedule_days: data.schedule_days,
        completed: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      console.error('[ProfileSync] Failed to sync profile to Supabase:', error.message);
      return { success: false, error: error.message };
    }

    console.log('[ProfileSync] Profile synced to Supabase for user:', userId);
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[ProfileSync] Sync failed:', msg);
    return { success: false, error: msg };
  }
}

// ─── Load: Supabase → Zustand ────────────────────────

/**
 * Load the user's onboarding profile from Supabase and hydrate Zustand.
 * Called on app launch for authenticated users.
 * Returns true if profile was loaded, false if not found or error.
 */
export async function loadProfileFromSupabase(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_onboarding_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      // No profile in Supabase — user may not have completed onboarding
      console.log('[ProfileSync] No Supabase profile found for user:', userId);
      return false;
    }

    // Hydrate the Zustand store with Supabase data
    const store = useOnboardingV3.getState();

    // Only hydrate if the Zustand store is empty (avoids overwriting in-progress onboarding)
    if (store.target_language && store.completed) {
      console.log('[ProfileSync] Zustand already has complete profile, skipping hydration');
      return true;
    }

    store.setField('first_name', data.first_name || '');
    store.setField('target_language', data.target_language || null);
    store.setField('native_language', data.native_language || 'english');
    store.setField('proficiency_level', data.proficiency_level || null);
    store.setField('goal', data.learning_goal || '');
    store.setField('goal_custom', data.goal_custom || '');
    store.setField('profession', data.profession || '');
    store.setField('profession_custom', data.profession_custom || '');
    if (data.scenarios) store.setField('scenarios', data.scenarios);
    if (data.custom_scenarios) store.setField('custom_scenarios', data.custom_scenarios);
    store.setField('schedule_time', data.schedule_time || null);
    store.setField('schedule_days', data.schedule_days || null);
    store.setField('completed', true);

    console.log('[ProfileSync] Profile loaded from Supabase into Zustand:', {
      name: data.first_name,
      language: data.target_language,
      level: data.proficiency_level,
    });

    return true;
  } catch (err) {
    console.error('[ProfileSync] Load failed:', err);
    return false;
  }
}

/**
 * Update a single profile field in both Zustand and Supabase.
 * Used by edit-profile.tsx for real-time persistence.
 */
export async function updateProfileField(
  userId: string,
  field: string,
  value: any,
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_onboarding_profiles')
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) {
      console.error(`[ProfileSync] Failed to update ${field}:`, error.message);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
