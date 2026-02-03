/**
 * Progressive Immersion System Types
 *
 * This system gradually transitions UI elements from the user's native language
 * to their target language as they advance through CEFR proficiency levels.
 */

// CEFR Proficiency Levels
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

// UI Element Difficulty Tiers
export type ImmersionTier = 'tier1' | 'tier2' | 'tier3';

/**
 * Tier Definitions:
 *
 * tier1 (Easy) - First to switch to target language
 *   - Navigation labels (Home, Profile, Practice)
 *   - Button text (Continue, Back, Next)
 *   - Simple labels (Level, Language, Time)
 *
 * tier2 (Medium) - Switch at intermediate levels
 *   - Section headers
 *   - Short instructions
 *   - Feedback messages (Correct!, Try again)
 *
 * tier3 (Hard) - Switch at advanced levels
 *   - Error messages and explanations
 *   - Grammar explanations
 *   - Tips and complex instructions
 */

export interface ImmersionConfig {
  level: CEFRLevel;
  percentage: number;
  tiers: {
    tier1: boolean; // Easy elements (buttons, nav)
    tier2: boolean; // Medium elements (headers, feedback)
    tier3: boolean; // Hard elements (explanations, errors)
  };
  description: string;
}

export interface ImmersionSettings {
  // Auto-adjust based on level (default: true)
  autoImmersion: boolean;

  // Manual override: -2 to +2 levels from current
  // Negative = less immersion, Positive = more immersion
  immersionOffset: number;

  // Force full target language regardless of level
  forceFullImmersion: boolean;

  // Elements that should never switch (for accessibility)
  neverSwitchElements: string[];
}

export interface UserImmersionState {
  currentLevel: CEFRLevel;
  settings: ImmersionSettings;
  effectiveConfig: ImmersionConfig;
}

// Level progression descriptions for UI
export const LEVEL_DESCRIPTIONS: Record<CEFRLevel, string> = {
  A1: 'Breakthrough - Basic phrases and simple interactions',
  A2: 'Waystage - Routine tasks and direct exchanges',
  B1: 'Threshold - Main points and simple connected text',
  B2: 'Vantage - Complex text and spontaneous interaction',
  C1: 'Effective Operational - Wide range and implicit meaning',
  C2: 'Mastery - Near-native fluency',
};

// Immersion configuration for each CEFR level
export const IMMERSION_MAP: Record<CEFRLevel, ImmersionConfig> = {
  A1: {
    level: 'A1',
    percentage: 10,
    tiers: { tier1: false, tier2: false, tier3: false },
    description: 'All UI in native language - focus on lesson content',
  },
  A2: {
    level: 'A2',
    percentage: 30,
    tiers: { tier1: true, tier2: false, tier3: false },
    description: 'Basic buttons and navigation in target language',
  },
  B1: {
    level: 'B1',
    percentage: 50,
    tiers: { tier1: true, tier2: true, tier3: false },
    description: 'Most UI elements in target language',
  },
  B2: {
    level: 'B2',
    percentage: 70,
    tiers: { tier1: true, tier2: true, tier3: false },
    description: 'Feedback and instructions in target language',
  },
  C1: {
    level: 'C1',
    percentage: 90,
    tiers: { tier1: true, tier2: true, tier3: true },
    description: 'Full immersion with explanations in target language',
  },
  C2: {
    level: 'C2',
    percentage: 100,
    tiers: { tier1: true, tier2: true, tier3: true },
    description: 'Complete immersion - native speaker experience',
  },
};

// Default settings for new users
export const DEFAULT_IMMERSION_SETTINGS: ImmersionSettings = {
  autoImmersion: true,
  immersionOffset: 0,
  forceFullImmersion: false,
  neverSwitchElements: [],
};

// Ordered levels for offset calculations
export const CEFR_LEVELS_ORDERED: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/**
 * Get the effective level after applying offset
 */
export function getEffectiveLevel(
  currentLevel: CEFRLevel,
  offset: number
): CEFRLevel {
  const currentIndex = CEFR_LEVELS_ORDERED.indexOf(currentLevel);
  const newIndex = Math.max(0, Math.min(CEFR_LEVELS_ORDERED.length - 1, currentIndex + offset));
  return CEFR_LEVELS_ORDERED[newIndex];
}
