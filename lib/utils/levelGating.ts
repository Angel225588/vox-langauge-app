/**
 * Level Gating Utility
 *
 * Determines which features are available based on user's proficiency level.
 *
 * Level Mapping:
 * - A1 (beginner): Basic vocabulary, flashcards only
 * - A2 (elementary): Vocabulary + simple games
 * - B1 (intermediate): UNLOCKS voice conversations
 * - B2 (upper_intermediate): Full voice + advanced scenarios
 * - C1+ (advanced): Full immersion mode
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key
const LEVEL_STORAGE_KEY = 'user_proficiency_level';

// Proficiency level IDs from onboarding
export type ProficiencyLevel =
  | 'beginner'        // A1
  | 'elementary'      // A2
  | 'intermediate'    // B1
  | 'upper_intermediate' // B2
  | 'advanced';       // C1+

// CEFR mapping
export const CEFR_MAPPING: Record<ProficiencyLevel, string> = {
  beginner: 'A1',
  elementary: 'A2',
  intermediate: 'B1',
  upper_intermediate: 'B2',
  advanced: 'C1+',
};

// Levels that unlock voice conversations (B1+)
const VOICE_ENABLED_LEVELS: ProficiencyLevel[] = [
  'intermediate',
  'upper_intermediate',
  'advanced',
];

// Levels that are beginners (A1-A2)
const BEGINNER_LEVELS: ProficiencyLevel[] = [
  'beginner',
  'elementary',
];

/**
 * Check if user's level allows voice conversations
 */
export function isVoiceEnabled(level: ProficiencyLevel | string | null): boolean {
  if (!level) return false;
  return VOICE_ENABLED_LEVELS.includes(level as ProficiencyLevel);
}

/**
 * Check if user is at beginner level (A1-A2)
 */
export function isBeginner(level: ProficiencyLevel | string | null): boolean {
  if (!level) return true; // Default to beginner if no level
  return BEGINNER_LEVELS.includes(level as ProficiencyLevel);
}

/**
 * Get CEFR level string
 */
export function getCEFRLevel(level: ProficiencyLevel | string | null): string {
  if (!level) return 'A1';
  return CEFR_MAPPING[level as ProficiencyLevel] || 'A1';
}

/**
 * Store user's proficiency level
 */
export async function storeUserLevel(level: ProficiencyLevel | string): Promise<void> {
  await AsyncStorage.setItem(LEVEL_STORAGE_KEY, level);
}

/**
 * Get stored user proficiency level
 */
export async function getStoredLevel(): Promise<ProficiencyLevel | null> {
  const level = await AsyncStorage.getItem(LEVEL_STORAGE_KEY);
  return level as ProficiencyLevel | null;
}

/**
 * Clear stored level (for logout/reset)
 */
export async function clearStoredLevel(): Promise<void> {
  await AsyncStorage.removeItem(LEVEL_STORAGE_KEY);
}

/**
 * Get feature availability based on level
 */
export function getFeatureAccess(level: ProficiencyLevel | string | null) {
  const isB1Plus = isVoiceEnabled(level);
  const isA1A2 = isBeginner(level);

  return {
    // Core features
    flashcards: true,           // All levels
    simpleGames: true,          // All levels
    basicAudio: true,           // All levels

    // Voice features (B1+)
    voiceConversation: isB1Plus,
    scenarioRoleplay: isB1Plus,
    accentSelection: isB1Plus,

    // Advanced features (B2+)
    advancedScenarios: level === 'upper_intermediate' || level === 'advanced',
    fullImmersion: level === 'advanced',

    // Display helpers
    showVoiceTeaser: isA1A2,    // Show "Unlock at B1" for beginners
    showVoiceCTA: isB1Plus,     // Show "Try Voice" for B1+

    // Level info
    cefr: getCEFRLevel(level),
    isB1Plus,
    isA1A2,
  };
}

/**
 * Get unlock message for beginners
 */
export function getVoiceUnlockMessage(level: ProficiencyLevel | string | null): string {
  if (isVoiceEnabled(level)) {
    return 'Voice conversations are ready for you!';
  }

  if (level === 'elementary') {
    return 'Voice conversations unlock at B1. You\'re almost there!';
  }

  return 'Voice conversations unlock when you reach B1 level. Keep learning!';
}
