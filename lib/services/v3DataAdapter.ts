/**
 * V3 Data Adapter
 *
 * Maps OnboardingV3Data (Zustand store) → OnboardingData format
 * expected by createPersonalizedPath() in lib/services/pathGeneration.ts.
 */

import type { OnboardingV3Data, ProficiencyLevel } from '@/hooks/useOnboardingV3';
import type { OnboardingData } from '@/lib/services/pathGeneration';

// ─── Proficiency mapping ────────────────────────────

const PROFICIENCY_MAP: Record<ProficiencyLevel, string> = {
  starting_fresh: 'beginner',
  basics: 'elementary',
  conversational: 'intermediate',
  confident: 'upper_intermediate',
  near_fluent: 'advanced',
};

// ─── Adapter ────────────────────────────────────────

/**
 * Adapts V3 onboarding store data to the OnboardingData format
 * used by createPersonalizedPath().
 */
export function adaptV3ToOnboardingData(v3: OnboardingV3Data): OnboardingData {
  return {
    // Direct mappings
    native_language: v3.native_language || null,
    target_language: v3.target_language || null,
    profession: v3.profession || null,
    profession_custom: v3.profession_custom || null,
    scenarios: v3.scenarios.length > 0 ? v3.scenarios : null,

    // Transformed fields
    motivation: v3.goal || null,
    motivations: v3.goal ? [v3.goal] : null,
    motivation_custom: v3.goal_custom || null,
    proficiency_level: v3.proficiency_level
      ? PROFICIENCY_MAP[v3.proficiency_level] || 'beginner'
      : null,

    // Schedule → practice time
    min_practice_time: v3.schedule_time ?? null,
    max_practice_time: v3.schedule_time ? v3.schedule_time + 15 : null,
    days_per_week: v3.schedule_days ?? null,

    // Inferred from V3 data (not hardcoded)
    timeline: v3.schedule_days && v3.schedule_days >= 5 ? '1-3_months' : '3-6_months',
    target_accent: null,
    why_now: v3.goal_custom || null,
    previous_attempts: null,
    commitment_stakes: v3.goal_custom || v3.goal || null,
    stakes: v3.goal_custom || v3.goal || null,
  };
}

// ─── Validation ─────────────────────────────────────

/**
 * Validates V3 data has all required fields for path generation.
 * Returns error message or null if valid.
 */
export function validateV3Data(v3: OnboardingV3Data): string | null {
  const missing: string[] = [];

  if (!v3.target_language) missing.push('target language');
  if (!v3.proficiency_level) missing.push('proficiency level');
  if (!v3.scenarios || v3.scenarios.length === 0) missing.push('at least one scenario');
  if (!v3.native_language) missing.push('native language');

  if (missing.length > 0) {
    return `Onboarding incomplete — missing: ${missing.join(', ')}. Please go back and complete all steps.`;
  }

  return null;
}
