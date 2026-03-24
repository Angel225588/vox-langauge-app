/**
 * Profile Loader — Hydration-safe user profile reader
 *
 * Single source of truth for reading onboarding data in content generators.
 * Handles the Zustand hydration race condition by falling back to raw
 * AsyncStorage when the store hasn't loaded yet.
 *
 * CRITICAL: This module exists because content generators run early —
 * sometimes before Zustand's persist middleware finishes loading from
 * AsyncStorage. If we only read from Zustand, target_language can be
 * null → content generates in English → professional user sees wrong
 * language. Unacceptable for a premium product.
 */

import { useOnboardingV3 } from '@/hooks/useOnboardingV3';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Must match the key in useOnboardingV3's persist config
const ONBOARDING_STORAGE_KEY = 'vox-onboarding-v3';

// ─── Types ───────────────────────────────────────────

export interface UserProfile {
  targetLanguage: string;
  nativeLanguage: string;
  proficiencyLevel: string;
  goal: string;
  profession: string;
  scenarios: string[];
  firstName: string;
}

// ─── Profile Loader ──────────────────────────────────

/**
 * Load the user's onboarding profile, with hydration-safe fallback.
 *
 * 1. Try Zustand store (fast path — already in memory)
 * 2. If empty, read directly from AsyncStorage (handles hydration race)
 * 3. If both fail, return null (caller must handle gracefully)
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    // Fast path: Zustand store is already hydrated
    const state = useOnboardingV3.getState();
    if (state.target_language) {
      return {
        targetLanguage: state.target_language,
        nativeLanguage: state.native_language || 'english',
        proficiencyLevel: state.proficiency_level || 'starting_fresh',
        goal: state.goal || 'general communication',
        profession: state.profession || state.profession_custom || '',
        scenarios: [...state.scenarios, ...state.custom_scenarios],
        firstName: state.first_name || '',
      };
    }

    // Slow path: Zustand hasn't hydrated yet — read from AsyncStorage directly
    console.warn('[ProfileLoader] Zustand not hydrated, reading from AsyncStorage');
    const raw = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) return null;

    const persisted = JSON.parse(raw);
    const data = persisted?.state;
    if (!data?.target_language) return null;

    return {
      targetLanguage: data.target_language,
      nativeLanguage: data.native_language || 'english',
      proficiencyLevel: data.proficiency_level || 'starting_fresh',
      goal: data.goal || 'general communication',
      profession: data.profession || data.profession_custom || '',
      scenarios: [...(data.scenarios || []), ...(data.custom_scenarios || [])],
      firstName: data.first_name || '',
    };
  } catch (error) {
    console.error('[ProfileLoader] Failed to load user profile:', error);
    return null;
  }
}

/**
 * Build a safe profile for content generation.
 * When profile is null (both stores failed), defaults to English with a
 * CRITICAL log. This is a last resort — the product experience is degraded.
 */
export function getSafeProfile(profile: UserProfile | null, callerTag: string): UserProfile {
  if (profile) return profile;

  console.error(
    `[${callerTag}] CRITICAL: No profile loaded — both Zustand and AsyncStorage failed. ` +
    'Content will generate in English as a last resort. ' +
    'This should never happen in normal operation.',
  );

  return {
    targetLanguage: 'english',
    nativeLanguage: 'english',
    proficiencyLevel: 'starting_fresh',
    goal: 'general communication',
    profession: '',
    scenarios: [],
    firstName: '',
  };
}

/**
 * Build a language-aware cache key.
 * Includes the target language so French and English content never collide.
 */
export function buildCacheKey(planId: string, profile: UserProfile | null): string {
  const lang = profile?.targetLanguage || 'unknown';
  return `${planId}_${lang}`;
}
