/**
 * Profile Fingerprint — Cache Invalidation on Re-Onboarding
 *
 * Computes a fingerprint from onboarding selections (language, level,
 * scenarios, profession). When a user re-onboards with different
 * choices, the fingerprint changes and all content caches are nuked
 * so the app regenerates fresh, level-appropriate content.
 *
 * This solves the "advanced user gets beginner vocabulary" bug that
 * occurs when stale cached content survives a re-onboarding.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearPreviewStairs } from '@/lib/services/previewStairs';
import { clearInitialVocabCache } from '@/lib/word-bank/initialVocabGenerator';
import { clearDiscoveryCache } from '@/lib/lesson/discoveryGenerator';
import { clearAllWords } from '@/lib/word-bank/storage';

// ─── Types ───────────────────────────────────────────

interface ProfileData {
  target_language: string;
  native_language: string;
  proficiency_level: string;
  scenarios: string[];
  profession?: string;
}

// ─── Constants ───────────────────────────────────────

const FINGERPRINT_KEY = 'vox-profile-fingerprint';
const LESSON_PLAN_KEY = 'vox-active-lesson-plan';
const ACTIVITY_COMPLETE_KEY = 'vox-activity-completion';

// ─── Core ────────────────────────────────────────────

/**
 * Compute a deterministic fingerprint from profile selections.
 * Sorted scenarios ensure order doesn't matter.
 */
function computeFingerprint(profile: ProfileData): string {
  const parts = [
    profile.target_language.toLowerCase().trim(),
    profile.native_language.toLowerCase().trim(),
    profile.proficiency_level.toLowerCase().trim(),
    [...profile.scenarios].sort().join(',').toLowerCase(),
    (profile.profession || '').toLowerCase().trim(),
  ];
  return parts.join('|');
}

/**
 * Check if onboarding profile changed since last generation.
 * If changed, nuke ALL content caches and word bank, then store new fingerprint.
 *
 * Call this BEFORE any content generation in creating-path.tsx.
 *
 * @returns true if caches were invalidated (profile changed), false if same profile
 */
export async function invalidateIfProfileChanged(
  profile: ProfileData,
): Promise<boolean> {
  const newFingerprint = computeFingerprint(profile);

  // Load previous fingerprint
  let oldFingerprint: string | null = null;
  try {
    oldFingerprint = await AsyncStorage.getItem(FINGERPRINT_KEY);
  } catch {
    // First time — no fingerprint stored
  }

  // Same profile — no invalidation needed
  if (oldFingerprint === newFingerprint) {
    console.log('[ProfileFingerprint] Same profile, caches valid');
    return false;
  }

  console.log('[ProfileFingerprint] Profile changed! Invalidating all content caches');
  if (oldFingerprint) {
    console.log(`[ProfileFingerprint] Old: ${oldFingerprint}`);
  }
  console.log(`[ProfileFingerprint] New: ${newFingerprint}`);

  // ── Nuke all content caches ──────────────────────────

  const errors: string[] = [];

  // 1. Clear word bank (SQLite) — old vocabulary doesn't match new level
  try {
    await clearAllWords();
    console.log('[ProfileFingerprint] Word bank cleared');
  } catch (e) {
    errors.push(`Word bank: ${e}`);
  }

  // 2. Clear initial vocab generation flag (for ALL previous combos)
  //    We clear both old and new keys to be safe
  try {
    // Clear flag for the new profile (so it regenerates)
    await clearInitialVocabCache({
      target_language: profile.target_language,
      native_language: profile.native_language,
      proficiency_level: profile.proficiency_level,
    });
    // Also brute-clear any old flags by removing all matching keys
    const allKeys = await AsyncStorage.getAllKeys();
    const vocabKeys = allKeys.filter(k => k.startsWith('vox_initial_vocab_generated_'));
    if (vocabKeys.length > 0) {
      await AsyncStorage.multiRemove(vocabKeys);
      console.log(`[ProfileFingerprint] Cleared ${vocabKeys.length} vocab cache flags`);
    }
  } catch (e) {
    errors.push(`Vocab cache: ${e}`);
  }

  // 3. Clear preview stairs
  try {
    await clearPreviewStairs();
    console.log('[ProfileFingerprint] Preview stairs cleared');
  } catch (e) {
    errors.push(`Stairs: ${e}`);
  }

  // 4. Clear all discovery content caches
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const discoveryKeys = allKeys.filter(k => k.startsWith('vox_discovery_content_'));
    if (discoveryKeys.length > 0) {
      await AsyncStorage.multiRemove(discoveryKeys);
      console.log(`[ProfileFingerprint] Cleared ${discoveryKeys.length} discovery caches`);
    }
  } catch (e) {
    errors.push(`Discovery: ${e}`);
  }

  // 5. Clear active lesson plan + activity completion signals
  try {
    await AsyncStorage.multiRemove([LESSON_PLAN_KEY, ACTIVITY_COMPLETE_KEY]);
    console.log('[ProfileFingerprint] Lesson plan + completion signals cleared');
  } catch (e) {
    errors.push(`Lesson plan: ${e}`);
  }

  // 6. Clear practice content cache
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const practiceKeys = allKeys.filter(k => k.startsWith('vox_practice_content_'));
    if (practiceKeys.length > 0) {
      await AsyncStorage.multiRemove(practiceKeys);
      console.log(`[ProfileFingerprint] Cleared ${practiceKeys.length} practice caches`);
    }
  } catch (e) {
    errors.push(`Practice: ${e}`);
  }

  if (errors.length > 0) {
    console.warn('[ProfileFingerprint] Some clears failed:', errors);
  }

  // ── Store new fingerprint ────────────────────────────
  try {
    await AsyncStorage.setItem(FINGERPRINT_KEY, newFingerprint);
  } catch {
    // Critical — but non-blocking
  }

  console.log('[ProfileFingerprint] Invalidation complete, ready for fresh generation');
  return true;
}
