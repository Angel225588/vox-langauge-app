/**
 * Language Storage
 *
 * Three-layer language resolution:
 *   1. Phone language (device locale) — always the starting default
 *   2. User preference — explicit choice in settings
 *   3. AI recommendation — discovery call suggests target-language immersion
 *
 * Resolution order: user_preference > ai_recommendation > device_language
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SupportedLanguageCode } from '@/i18n/types';
import { hasTranslations } from '@/i18n/types';

const LANGUAGE_PREFERENCE_KEY = '@vox_language_preference';
const AI_RECOMMENDATION_KEY = '@vox_language_ai_recommendation';

// ─── User Preference (explicit settings choice) ─────────

/**
 * Save user's explicit language preference (from settings)
 */
export async function saveLanguagePreference(language: SupportedLanguageCode): Promise<void> {
  try {
    await AsyncStorage.setItem(LANGUAGE_PREFERENCE_KEY, language);
  } catch (error) {
    console.error('Error saving language preference:', error);
  }
}

/**
 * Get user's saved language preference
 */
export async function getLanguagePreference(): Promise<SupportedLanguageCode | null> {
  try {
    const language = await AsyncStorage.getItem(LANGUAGE_PREFERENCE_KEY);
    return language as SupportedLanguageCode | null;
  } catch (error) {
    console.error('Error getting language preference:', error);
    return null;
  }
}

/**
 * Clear language preference (reset to device default)
 */
export async function clearLanguagePreference(): Promise<void> {
  try {
    await AsyncStorage.removeItem(LANGUAGE_PREFERENCE_KEY);
    await AsyncStorage.removeItem(AI_RECOMMENDATION_KEY);
  } catch (error) {
    console.error('Error clearing language preference:', error);
  }
}

/**
 * Check if user has a saved language preference
 */
export async function hasLanguagePreference(): Promise<boolean> {
  const preference = await getLanguagePreference();
  return preference !== null;
}

// ─── AI Recommendation (discovery call result) ──────────

interface LanguageRecommendation {
  language: SupportedLanguageCode;
  reason: 'immersion_ready' | 'keep_native';
  confidence: number; // 0-1
}

/**
 * Save AI's language recommendation after discovery call.
 * Does NOT auto-switch — the user must accept or it's used as a soft default.
 */
export async function saveAILanguageRecommendation(
  rec: LanguageRecommendation,
): Promise<void> {
  try {
    await AsyncStorage.setItem(AI_RECOMMENDATION_KEY, JSON.stringify(rec));
  } catch (error) {
    console.error('Error saving AI language recommendation:', error);
  }
}

/**
 * Get AI's language recommendation
 */
export async function getAILanguageRecommendation(): Promise<LanguageRecommendation | null> {
  try {
    const json = await AsyncStorage.getItem(AI_RECOMMENDATION_KEY);
    if (!json) return null;
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// ─── Resolution Logic ───────────────────────────────────

/**
 * Determine if a user's proficiency level qualifies for target-language immersion.
 *
 * conversational+ = ready for immersion (the app UI in their target language)
 */
export function isImmersionReady(
  proficiencyLevel: string | null,
): boolean {
  const immersionLevels = ['conversational', 'confident', 'near_fluent'];
  return proficiencyLevel ? immersionLevels.includes(proficiencyLevel) : false;
}

/**
 * Map a target language name (from onboarding) to an i18n code.
 * Onboarding stores 'english' | 'french' | 'spanish', i18n uses 'en' | 'fr' | 'es'.
 */
export function targetLanguageToCode(targetLanguage: string): SupportedLanguageCode | null {
  const map: Record<string, SupportedLanguageCode> = {
    english: 'en',
    french: 'fr',
    spanish: 'es',
    portuguese: 'pt',
    arabic: 'ar',
    german: 'de',
    chinese: 'zh',
    japanese: 'ja',
    korean: 'ko',
  };
  return map[targetLanguage.toLowerCase()] || null;
}

/**
 * Build an AI language recommendation based on proficiency + target language.
 * Called after discovery call or first lesson assessment.
 *
 * Returns:
 * - immersion_ready + target language code → user can handle app in target language
 * - keep_native + device language → user should stay in their phone language
 */
export function buildLanguageRecommendation(
  proficiencyLevel: string | null,
  targetLanguage: string,
  deviceLanguageCode: SupportedLanguageCode,
): LanguageRecommendation {
  const targetCode = targetLanguageToCode(targetLanguage);
  const ready = isImmersionReady(proficiencyLevel);
  const hasTargetTranslations = targetCode ? hasTranslations(targetCode) : false;

  if (ready && hasTargetTranslations && targetCode) {
    return {
      language: targetCode,
      reason: 'immersion_ready',
      confidence: proficiencyLevel === 'near_fluent' ? 0.9 : proficiencyLevel === 'confident' ? 0.8 : 0.6,
    };
  }

  return {
    language: deviceLanguageCode,
    reason: 'keep_native',
    confidence: 1.0,
  };
}
