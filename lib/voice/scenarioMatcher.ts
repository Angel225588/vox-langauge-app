/**
 * Scenario Matcher
 *
 * Matches user onboarding data to relevant voice conversation scenarios.
 * Uses motivation, proficiency level, and target language to personalize
 * the scenario selection for each user.
 */

import { VoiceScenario, SupportedLanguage } from './types';
import { getScenariosForLanguage, getScenariosByDifficulty } from './scenarios';

// =============================================================================
// Types
// =============================================================================

export type MotivationType =
  | 'travel'
  | 'career'
  | 'education'
  | 'love'
  | 'relocation'
  | 'challenge';

export type ProficiencyType =
  | 'beginner'
  | 'elementary'
  | 'intermediate'
  | 'upper_intermediate'
  | 'advanced';

export interface UserProfile {
  targetLanguage: SupportedLanguage;
  motivation: MotivationType | null;
  proficiencyLevel: ProficiencyType | null;
}

export interface MatchedScenario extends VoiceScenario {
  /** Relevance score (0-100) based on user profile */
  relevanceScore: number;
  /** Why this scenario was recommended */
  matchReason: string;
}

// =============================================================================
// Mapping Constants
// =============================================================================

/**
 * Maps user motivation to relevant scenario categories
 * Categories: 'travel' | 'food' | 'shopping' | 'social' | 'professional' | 'emergency'
 */
const MOTIVATION_TO_CATEGORIES: Record<MotivationType, VoiceScenario['category'][]> = {
  travel: ['travel', 'food', 'shopping', 'social'],
  career: ['professional', 'social'],
  education: ['professional', 'social'],
  love: ['social', 'food'],
  relocation: ['travel', 'shopping', 'social', 'food'],
  challenge: ['travel', 'food', 'shopping', 'social', 'professional'], // All categories
};

/**
 * Maps proficiency level to appropriate scenario difficulties
 * Difficulties: 'beginner' | 'intermediate' | 'advanced'
 */
const PROFICIENCY_TO_DIFFICULTY: Record<ProficiencyType, VoiceScenario['difficulty'][]> = {
  beginner: ['beginner'],
  elementary: ['beginner'],
  intermediate: ['beginner', 'intermediate'],
  upper_intermediate: ['intermediate', 'advanced'],
  advanced: ['intermediate', 'advanced'],
};

/**
 * Descriptions for match reasons based on motivation
 */
const MOTIVATION_DESCRIPTIONS: Record<MotivationType, string> = {
  travel: 'Perfect for travelers',
  career: 'Great for professional growth',
  education: 'Helpful for academic settings',
  love: 'Ideal for building connections',
  relocation: 'Essential for daily life abroad',
  challenge: 'A fun challenge to try',
};

// =============================================================================
// Matching Functions
// =============================================================================

/**
 * Get personalized scenarios for a user based on their profile
 *
 * @param profile - User's onboarding data
 * @returns Sorted list of scenarios with relevance scores
 */
export function getScenariosForUser(profile: UserProfile): MatchedScenario[] {
  const { targetLanguage, motivation, proficiencyLevel } = profile;

  // Get all scenarios for the target language
  const allScenarios = getScenariosForLanguage(targetLanguage);

  if (allScenarios.length === 0) {
    return [];
  }

  // Score each scenario based on user profile
  const matchedScenarios: MatchedScenario[] = allScenarios.map((scenario) => {
    let score = 50; // Base score
    let reason = 'General practice';

    // Score based on difficulty match
    if (proficiencyLevel) {
      const appropriateDifficulties = PROFICIENCY_TO_DIFFICULTY[proficiencyLevel];
      if (appropriateDifficulties.includes(scenario.difficulty)) {
        score += 25;
        reason = `Matches your ${proficiencyLevel} level`;
      } else {
        score -= 20;
      }
    }

    // Score based on category match with motivation
    if (motivation) {
      const preferredCategories = MOTIVATION_TO_CATEGORIES[motivation];
      if (preferredCategories.includes(scenario.category)) {
        score += 25;
        reason = MOTIVATION_DESCRIPTIONS[motivation];
      } else {
        score -= 10;
      }
    }

    // Bonus for scenarios that match both difficulty AND motivation
    if (proficiencyLevel && motivation) {
      const appropriateDifficulties = PROFICIENCY_TO_DIFFICULTY[proficiencyLevel];
      const preferredCategories = MOTIVATION_TO_CATEGORIES[motivation];

      if (
        appropriateDifficulties.includes(scenario.difficulty) &&
        preferredCategories.includes(scenario.category)
      ) {
        score += 15; // Extra bonus for double match
        reason = `${MOTIVATION_DESCRIPTIONS[motivation]} at your level`;
      }
    }

    // Ensure score is within bounds
    const normalizedScore = Math.max(0, Math.min(100, score));

    return {
      ...scenario,
      relevanceScore: normalizedScore,
      matchReason: reason,
    };
  });

  // Sort by relevance score (highest first)
  return matchedScenarios.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Get top N recommended scenarios for a user
 *
 * @param profile - User's onboarding data
 * @param count - Number of scenarios to return (default: 5)
 * @returns Top N most relevant scenarios
 */
export function getTopScenarios(profile: UserProfile, count: number = 5): MatchedScenario[] {
  return getScenariosForUser(profile).slice(0, count);
}

/**
 * Get the single best scenario recommendation for a user
 *
 * @param profile - User's onboarding data
 * @returns The most relevant scenario, or undefined if none available
 */
export function getBestScenario(profile: UserProfile): MatchedScenario | undefined {
  return getScenariosForUser(profile)[0];
}

/**
 * Get scenarios filtered by a specific category for a user
 *
 * @param profile - User's onboarding data
 * @param category - Category to filter by
 * @returns Scenarios in that category, sorted by relevance
 */
export function getScenariosByUserCategory(
  profile: UserProfile,
  category: VoiceScenario['category']
): MatchedScenario[] {
  return getScenariosForUser(profile).filter((s) => s.category === category);
}

/**
 * Check if a user has scenarios available for their profile
 *
 * @param profile - User's onboarding data
 * @returns True if there are matching scenarios
 */
export function hasAvailableScenarios(profile: UserProfile): boolean {
  return getScenariosForLanguage(profile.targetLanguage).length > 0;
}

/**
 * Get all unique categories available for a user's language
 *
 * @param language - Target language
 * @returns Array of available categories
 */
export function getAvailableCategories(language: SupportedLanguage): VoiceScenario['category'][] {
  const scenarios = getScenariosForLanguage(language);
  const categories = new Set<VoiceScenario['category']>();

  scenarios.forEach((s) => categories.add(s.category));

  return Array.from(categories);
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Convert onboarding data format to UserProfile
 * Used when reading from the useOnboardingV2 hook
 */
export function createUserProfile(
  targetLanguage: string | null,
  motivation: string | null,
  proficiencyLevel: string | null
): UserProfile {
  return {
    targetLanguage: (targetLanguage as SupportedLanguage) || 'es',
    motivation: (motivation as MotivationType) || null,
    proficiencyLevel: (proficiencyLevel as ProficiencyType) || null,
  };
}

// =============================================================================
// Stair-Aware Scenario Matching
// =============================================================================

/**
 * Stair context for scenario matching
 */
export interface StairContext {
  skillsFocus: string[];
  scenarioTags: string[];
  difficulty: string;
}

/**
 * Get scenarios that match a specific stair's focus and tags.
 * Scores scenarios based on:
 * - Base score: 50
 * - Difficulty match: +25
 * - Skills focus match: +25
 * - Both difficulty AND skills match: +15 bonus
 *
 * @param stairContext - Skills focus and scenario tags from the stair
 * @param profile - User's profile (language, motivation, proficiency)
 * @returns Sorted list of relevant scenarios
 */
export function getScenariosForStair(
  stairContext: StairContext,
  profile: UserProfile
): MatchedScenario[] {
  const { targetLanguage, proficiencyLevel } = profile;
  const { skillsFocus, scenarioTags, difficulty } = stairContext;

  // Get all scenarios for the target language
  const allScenarios = getScenariosForLanguage(targetLanguage);

  if (allScenarios.length === 0) {
    return [];
  }

  // Create lookup sets for fast matching
  const skillsSet = new Set(skillsFocus.map(s => s.toLowerCase()));
  const tagsSet = new Set(scenarioTags.map(t => t.toLowerCase()));

  // Map stair difficulty to scenario difficulty
  const difficultyMap: Record<string, VoiceScenario['difficulty'][]> = {
    beginner: ['beginner'],
    elementary: ['beginner'],
    intermediate: ['beginner', 'intermediate'],
    upper_intermediate: ['intermediate', 'advanced'],
    advanced: ['intermediate', 'advanced'],
  };
  const appropriateDifficulties = difficultyMap[difficulty || proficiencyLevel || 'beginner'] || ['beginner'];

  // Score each scenario
  const matchedScenarios: MatchedScenario[] = allScenarios.map((scenario) => {
    let score = 50; // Base score
    let reason = 'General practice';
    let difficultyMatched = false;
    let skillsMatched = false;

    // Score based on difficulty match (+25)
    if (appropriateDifficulties.includes(scenario.difficulty)) {
      score += 25;
      reason = `Matches your ${difficulty || proficiencyLevel || 'beginner'} level`;
      difficultyMatched = true;
    } else {
      score -= 20;
    }

    // Score based on skills focus match (+25)
    // Check if scenario category or tags match stair's skills focus
    const scenarioCategory = scenario.category.toLowerCase();
    const scenarioKeywords = [
      scenarioCategory,
      ...(scenario.tags || []).map(t => t.toLowerCase()),
    ];

    const hasSkillsMatch = scenarioKeywords.some(
      keyword => skillsSet.has(keyword) || tagsSet.has(keyword)
    );

    if (hasSkillsMatch) {
      score += 25;
      reason = `Practices ${skillsFocus.slice(0, 2).join(' and ')}`;
      skillsMatched = true;
    } else if (tagsSet.has(scenarioCategory)) {
      score += 15;
      reason = `Related to your current focus`;
      skillsMatched = true;
    }

    // Bonus for matching BOTH difficulty AND skills (+15)
    if (difficultyMatched && skillsMatched) {
      score += 15;
      reason = `Perfect match for your current stair`;
    }

    // Ensure score is within bounds
    const normalizedScore = Math.max(0, Math.min(100, score));

    return {
      ...scenario,
      relevanceScore: normalizedScore,
      matchReason: reason,
    };
  });

  // Sort by relevance score (highest first)
  return matchedScenarios.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Get top N scenarios for a stair
 *
 * @param stairContext - Stair's skills and scenario tags
 * @param profile - User's profile
 * @param count - Number of scenarios to return (default: 3)
 * @returns Top N most relevant scenarios for the stair
 */
export function getTopScenariosForStair(
  stairContext: StairContext,
  profile: UserProfile,
  count: number = 3
): MatchedScenario[] {
  return getScenariosForStair(stairContext, profile).slice(0, count);
}
