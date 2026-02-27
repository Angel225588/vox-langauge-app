/**
 * Bundled Default Vocabulary — Barrel Export
 *
 * Provides instant ($0, <100ms) vocabulary loading for onboarding.
 * Each file contains 85 curated words per language+level combination.
 *
 * The initialVocabGenerator imports this module dynamically:
 *   const { getDefaultVocabulary } = await import('./defaults');
 */

import type { AddWordInput } from '@/lib/word-bank/types';
import { ENGLISH_BEGINNER } from './english-beginner';
import { ENGLISH_INTERMEDIATE } from './english-intermediate';
import { FRENCH_BEGINNER } from './french-beginner';
import { FRENCH_INTERMEDIATE } from './french-intermediate';
import { SPANISH_BEGINNER } from './spanish-beginner';
import { SPANISH_INTERMEDIATE } from './spanish-intermediate';

// ─── Registry ────────────────────────────────────────

type LangLevelKey = string; // e.g. "english_beginner"

const REGISTRY: Record<LangLevelKey, AddWordInput[]> = {
  // English
  english_beginner: ENGLISH_BEGINNER,
  english_intermediate: ENGLISH_INTERMEDIATE,
  // French
  french_beginner: FRENCH_BEGINNER,
  french_intermediate: FRENCH_INTERMEDIATE,
  // Spanish
  spanish_beginner: SPANISH_BEGINNER,
  spanish_intermediate: SPANISH_INTERMEDIATE,
};

// ─── Level Mapping ───────────────────────────────────

/**
 * Map proficiency_level from onboarding to our level bucket.
 * starting_fresh/basics → beginner
 * conversational/confident/near_fluent → intermediate
 */
function getLevelBucket(proficiencyLevel: string): string {
  switch (proficiencyLevel) {
    case 'starting_fresh':
    case 'basics':
      return 'beginner';
    case 'conversational':
    case 'confident':
    case 'near_fluent':
      return 'intermediate';
    default:
      return 'beginner';
  }
}

// ─── Public API ──────────────────────────────────────

/**
 * Get bundled default vocabulary for a language + proficiency level.
 * Returns an empty array if no defaults exist for the combo.
 */
export function getDefaultVocabulary(
  targetLanguage: string,
  proficiencyLevel: string,
): AddWordInput[] {
  const lang = targetLanguage.toLowerCase().trim();
  const level = getLevelBucket(proficiencyLevel);
  const key = `${lang}_${level}`;

  return REGISTRY[key] || [];
}

/**
 * Check if bundled defaults exist for a language + level.
 */
export function hasDefaultVocabulary(
  targetLanguage: string,
  proficiencyLevel: string,
): boolean {
  const lang = targetLanguage.toLowerCase().trim();
  const level = getLevelBucket(proficiencyLevel);
  return `${lang}_${level}` in REGISTRY;
}
