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
// Enhanced User Profile (uses full onboarding data)
// =============================================================================

export interface EnhancedUserProfile extends UserProfile {
  profession: string | null;
  selectedScenarios: string[];  // from onboarding scenarios[]
  motivations: string[];        // all motivations, not just primary
  practiceTimeMinutes: { min: number; max: number } | null;
}

/**
 * Maps professions to scenario categories they're likely interested in
 */
const PROFESSION_TO_CATEGORIES: Record<string, VoiceScenario['category'][]> = {
  tech: ['professional'],
  finance: ['professional'],
  marketing: ['professional', 'social'],
  sales: ['professional', 'social'],
  healthcare: ['professional', 'emergency'],
  legal: ['professional'],
  education: ['professional', 'social'],
  hospitality: ['food', 'social', 'travel'],
  consulting: ['professional', 'social'],
  engineering: ['professional'],
  design: ['professional', 'social'],
  real_estate: ['professional', 'social'],
  government: ['professional'],
  nonprofit: ['professional', 'social'],
};

/**
 * Maps onboarding scenario tags to scenario categories
 */
const ONBOARDING_SCENARIO_TO_CATEGORY: Record<string, VoiceScenario['category'][]> = {
  ordering_food: ['food'],
  asking_directions: ['travel'],
  job_interview: ['professional'],
  small_talk: ['social'],
  shopping: ['shopping'],
  medical: ['emergency'],
  business_meeting: ['professional'],
  travel: ['travel'],
  daily_life: ['food', 'shopping', 'social'],
  dating: ['social'],
  phone_calls: ['professional', 'social'],
  presentations: ['professional'],
};

/**
 * Create an enhanced user profile from full onboarding data.
 * Uses profession, all motivations, selected scenarios, and practice time.
 */
export function createEnhancedUserProfile(onboardingData: {
  target_language: string | null;
  motivation: string | null;
  motivations: string[] | null;
  proficiency_level: string | null;
  profession: string | null;
  scenarios: string[] | null;
  min_practice_time: number | null;
  max_practice_time: number | null;
}): EnhancedUserProfile {
  return {
    targetLanguage: (onboardingData.target_language as SupportedLanguage) || 'es',
    motivation: (onboardingData.motivation as MotivationType) || null,
    proficiencyLevel: (onboardingData.proficiency_level as ProficiencyType) || null,
    profession: onboardingData.profession || null,
    selectedScenarios: onboardingData.scenarios || [],
    motivations: (onboardingData.motivations || []) as string[],
    practiceTimeMinutes: onboardingData.min_practice_time && onboardingData.max_practice_time
      ? { min: onboardingData.min_practice_time, max: onboardingData.max_practice_time }
      : null,
  };
}

/**
 * Get personalized scenarios using the enhanced profile with full onboarding data.
 * Adds scoring for profession match and onboarding scenario selections.
 */
export function getEnhancedScenariosForUser(profile: EnhancedUserProfile): MatchedScenario[] {
  const { targetLanguage, motivation, proficiencyLevel, profession, selectedScenarios } = profile;

  const allScenarios = getScenariosForLanguage(targetLanguage);
  if (allScenarios.length === 0) return [];

  const matchedScenarios: MatchedScenario[] = allScenarios.map((scenario) => {
    let score = 50;
    let reason = 'General practice';

    // Score based on difficulty match (+25)
    if (proficiencyLevel) {
      const appropriateDifficulties = PROFICIENCY_TO_DIFFICULTY[proficiencyLevel];
      if (appropriateDifficulties.includes(scenario.difficulty)) {
        score += 25;
        reason = `Matches your ${proficiencyLevel} level`;
      } else {
        score -= 20;
      }
    }

    // Score based on category match with motivation (+25)
    if (motivation) {
      const preferredCategories = MOTIVATION_TO_CATEGORIES[motivation];
      if (preferredCategories.includes(scenario.category)) {
        score += 25;
        reason = MOTIVATION_DESCRIPTIONS[motivation];
      } else {
        score -= 10;
      }
    }

    // Bonus for matching both difficulty AND motivation (+15)
    if (proficiencyLevel && motivation) {
      const appropriateDifficulties = PROFICIENCY_TO_DIFFICULTY[proficiencyLevel];
      const preferredCategories = MOTIVATION_TO_CATEGORIES[motivation];
      if (
        appropriateDifficulties.includes(scenario.difficulty) &&
        preferredCategories.includes(scenario.category)
      ) {
        score += 15;
        reason = `${MOTIVATION_DESCRIPTIONS[motivation]} at your level`;
      }
    }

    // ENHANCED: Score based on profession match (+20)
    if (profession && scenario.category) {
      const professionKey = profession.toLowerCase().replace(/\s+/g, '_');
      const professionCategories = PROFESSION_TO_CATEGORIES[professionKey] || [];
      if (professionCategories.includes(scenario.category)) {
        score += 20;
        reason = `Relevant to your profession`;
      }
    }

    // ENHANCED: Score based on onboarding scenario selections (+15)
    if (selectedScenarios.length > 0 && scenario.category) {
      const matchedCategories = selectedScenarios.flatMap(
        tag => ONBOARDING_SCENARIO_TO_CATEGORY[tag] || []
      );
      if (matchedCategories.includes(scenario.category)) {
        score += 15;
        reason = `Matches your conversation priorities`;
      }
    }

    const normalizedScore = Math.max(0, Math.min(100, score));
    return { ...scenario, relevanceScore: normalizedScore, matchReason: reason };
  });

  return matchedScenarios.sort((a, b) => b.relevanceScore - a.relevanceScore);
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
    const scenarioCategory = (scenario.category || '').toLowerCase();
    const scenarioKeywords = [scenarioCategory];

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
