/**
 * Voice Assignment Engine
 *
 * Claude-based intelligent voice selection for ElevenLabs conversations.
 * Considers user preferences, pedagogical goals, and variety for comprehension.
 *
 * Assignment Logic:
 * - 80% primary accent (user's preference)
 * - 20% variety (other accents for comprehension training)
 *
 * Claude decides based on:
 * - User's primary accent preference
 * - Scenario context (casual vs formal)
 * - User's proficiency level
 * - Voice exposure history (ensure variety)
 * - Pedagogical benefit
 */

import { AccentType, SupportedLanguage } from './types';
import {
  ElevenLabsVoiceConfig,
  ProficiencyLevel,
} from './elevenLabsTypes';
import {
  ELEVENLABS_VOICES,
  getVoicesForAccent,
  getVoicesForLanguage,
} from './elevenLabsConfig';

// =============================================================================
// Types
// =============================================================================

/** Purpose of voice variety selection */
export type VarietyPurpose =
  | 'primary_practice'      // User's preferred accent
  | 'comprehension_training' // Exposure to different accents
  | 'cultural_exposure'     // Understanding regional variations
  | 'scenario_appropriate'; // Voice matches scenario context

/** Voice assignment decision from Claude */
export interface VoiceAssignment {
  voice: ElevenLabsVoiceConfig;
  reason: string;
  varietyPurpose: VarietyPurpose;
  isVarietySelection: boolean;
}

/** Scenario voice context */
export interface ScenarioVoiceContext {
  scenarioId: string;
  scenarioType: ScenarioType;
  formality: 'casual' | 'formal' | 'mixed';
  suggestedGender?: 'male' | 'female' | 'any';
}

/** Scenario types with voice recommendations */
export type ScenarioType =
  | 'cafe_ordering'
  | 'directions'
  | 'shopping'
  | 'job_interview'
  | 'casual_chat'
  | 'restaurant'
  | 'hotel'
  | 'doctor'
  | 'phone_call'
  | 'meeting'
  | 'custom';

/** User voice preference context */
export interface UserVoiceContext {
  targetLanguage: SupportedLanguage;
  primaryAccent: AccentType;
  proficiencyLevel: ProficiencyLevel;
  enableVariety: boolean;
  voiceExposureHistory?: VoiceExposureRecord[];
}

/** Voice exposure tracking */
export interface VoiceExposureRecord {
  voiceId: string;
  accent: AccentType;
  exposureCount: number;
  totalDurationSeconds: number;
  lastUsedAt: Date;
}

// =============================================================================
// Scenario-Voice Mapping
// =============================================================================

/**
 * Scenario voice recommendations
 * Maps scenario types to recommended voice characteristics
 */
export const SCENARIO_VOICE_TAGS: Record<ScenarioType, {
  formality: 'casual' | 'formal' | 'mixed';
  preferredTags: string[];
  suggestedGender?: 'male' | 'female' | 'any';
  description: string;
}> = {
  cafe_ordering: {
    formality: 'casual',
    preferredTags: ['friendly', 'casual', 'warm'],
    description: 'Casual café interaction',
  },
  directions: {
    formality: 'casual',
    preferredTags: ['helpful', 'clear', 'friendly'],
    description: 'Asking for directions',
  },
  shopping: {
    formality: 'casual',
    preferredTags: ['helpful', 'friendly'],
    description: 'Shopping interaction',
  },
  job_interview: {
    formality: 'formal',
    preferredTags: ['professional', 'clear', 'firm'],
    suggestedGender: 'any',
    description: 'Professional job interview',
  },
  casual_chat: {
    formality: 'casual',
    preferredTags: ['friendly', 'casual', 'warm'],
    description: 'Casual conversation practice',
  },
  restaurant: {
    formality: 'mixed',
    preferredTags: ['friendly', 'clear'],
    description: 'Restaurant ordering',
  },
  hotel: {
    formality: 'formal',
    preferredTags: ['professional', 'helpful', 'clear'],
    description: 'Hotel check-in/service',
  },
  doctor: {
    formality: 'formal',
    preferredTags: ['professional', 'clear', 'patient'],
    description: 'Medical consultation',
  },
  phone_call: {
    formality: 'mixed',
    preferredTags: ['clear', 'professional'],
    description: 'Phone conversation',
  },
  meeting: {
    formality: 'formal',
    preferredTags: ['professional', 'clear', 'firm'],
    description: 'Business meeting',
  },
  custom: {
    formality: 'mixed',
    preferredTags: ['default', 'clear'],
    description: 'Custom scenario',
  },
};

// =============================================================================
// Variety Decision Logic
// =============================================================================

/**
 * Determine if this session should use variety (non-preferred accent)
 *
 * Rules:
 * - 80% chance of primary accent
 * - 20% chance of variety
 * - Beginners: No variety until elementary level
 * - Track exposure to ensure balanced variety
 */
export function shouldUseVariety(context: UserVoiceContext): boolean {
  // Disable variety if user opted out
  if (!context.enableVariety) {
    return false;
  }

  // No variety for absolute beginners - build confidence first
  if (context.proficiencyLevel === 'beginner') {
    return false;
  }

  // 20% chance of variety for other levels
  return Math.random() < 0.2;
}

/**
 * Get alternate accents for variety selection
 */
export function getAlternateAccents(
  language: SupportedLanguage,
  primaryAccent: AccentType
): AccentType[] {
  const accentsByLanguage: Record<SupportedLanguage, AccentType[]> = {
    es: ['es-latam', 'es-spain'],
    en: ['en-american', 'en-british', 'en-australian'],
    fr: ['fr-france', 'fr-canada'],
    pt: ['pt-brazil', 'pt-portugal'],
    de: [], // No alternate accents yet
    it: [], // No alternate accents yet
  };

  const accents = accentsByLanguage[language] || [];
  return accents.filter(a => a !== primaryAccent);
}

// =============================================================================
// Voice Selection Algorithm
// =============================================================================

/**
 * Select the best voice for a conversation session
 *
 * This is the main entry point for voice assignment.
 * It considers user preferences, scenario context, and pedagogical goals.
 */
export function assignVoice(
  userContext: UserVoiceContext,
  scenarioContext?: ScenarioVoiceContext
): VoiceAssignment {
  const useVariety = shouldUseVariety(userContext);

  if (useVariety) {
    return selectVarietyVoice(userContext, scenarioContext);
  }

  return selectPrimaryVoice(userContext, scenarioContext);
}

/**
 * Select a voice matching user's primary accent preference
 */
function selectPrimaryVoice(
  userContext: UserVoiceContext,
  scenarioContext?: ScenarioVoiceContext
): VoiceAssignment {
  const { primaryAccent, proficiencyLevel } = userContext;

  // Get voices for primary accent
  const accentVoices = getVoicesForAccent(primaryAccent);

  if (accentVoices.length === 0) {
    // Fallback to language-level default
    return selectFallbackVoice(userContext, scenarioContext);
  }

  // Filter by proficiency level
  let suitableVoices = accentVoices.filter(v =>
    v.proficiencyLevels.includes(proficiencyLevel)
  );

  // If no suitable voices, use all accent voices
  if (suitableVoices.length === 0) {
    suitableVoices = accentVoices;
  }

  // Score voices based on scenario fit
  const scoredVoices = scoreVoicesForScenario(suitableVoices, scenarioContext);

  // Select best voice
  const selectedVoice = scoredVoices[0].voice;

  return {
    voice: selectedVoice,
    reason: buildSelectionReason(selectedVoice, userContext, scenarioContext, false),
    varietyPurpose: 'primary_practice',
    isVarietySelection: false,
  };
}

/**
 * Select a variety voice (different from primary accent)
 * Used for comprehension training
 */
function selectVarietyVoice(
  userContext: UserVoiceContext,
  scenarioContext?: ScenarioVoiceContext
): VoiceAssignment {
  const { targetLanguage, primaryAccent, proficiencyLevel, voiceExposureHistory } = userContext;

  // Get alternate accents
  const alternateAccents = getAlternateAccents(targetLanguage, primaryAccent);

  if (alternateAccents.length === 0) {
    // No variety available, use primary
    return selectPrimaryVoice(userContext, scenarioContext);
  }

  // Select least-exposed accent for variety
  const selectedAccent = selectLeastExposedAccent(alternateAccents, voiceExposureHistory);

  // Get voices for selected accent
  const accentVoices = getVoicesForAccent(selectedAccent);

  if (accentVoices.length === 0) {
    // Fallback to primary
    return selectPrimaryVoice(userContext, scenarioContext);
  }

  // Filter by proficiency
  let suitableVoices = accentVoices.filter(v =>
    v.proficiencyLevels.includes(proficiencyLevel)
  );

  if (suitableVoices.length === 0) {
    suitableVoices = accentVoices;
  }

  // Score and select
  const scoredVoices = scoreVoicesForScenario(suitableVoices, scenarioContext);
  const selectedVoice = scoredVoices[0].voice;

  // Determine variety purpose
  const varietyPurpose = determineVarietyPurpose(selectedAccent, primaryAccent, scenarioContext);

  return {
    voice: selectedVoice,
    reason: buildSelectionReason(selectedVoice, userContext, scenarioContext, true),
    varietyPurpose,
    isVarietySelection: true,
  };
}

/**
 * Fallback voice selection when no accent-specific voices available
 */
function selectFallbackVoice(
  userContext: UserVoiceContext,
  scenarioContext?: ScenarioVoiceContext
): VoiceAssignment {
  const { targetLanguage, proficiencyLevel } = userContext;

  // Get all voices for language
  const languageVoices = getVoicesForLanguage(targetLanguage);

  if (languageVoices.length === 0) {
    // Ultimate fallback - first available voice
    const fallback = ELEVENLABS_VOICES[0];
    return {
      voice: fallback,
      reason: 'Fallback voice selected - no voices available for target language',
      varietyPurpose: 'primary_practice',
      isVarietySelection: false,
    };
  }

  // Filter by proficiency
  let suitableVoices = languageVoices.filter(v =>
    v.proficiencyLevels.includes(proficiencyLevel)
  );

  if (suitableVoices.length === 0) {
    suitableVoices = languageVoices;
  }

  // Prefer voices with 'default' tag
  const defaultVoice = suitableVoices.find(v => v.tags?.includes('default'));
  const selectedVoice = defaultVoice || suitableVoices[0];

  return {
    voice: selectedVoice,
    reason: `Default ${targetLanguage} voice selected`,
    varietyPurpose: 'primary_practice',
    isVarietySelection: false,
  };
}

// =============================================================================
// Scoring & Selection Helpers
// =============================================================================

interface ScoredVoice {
  voice: ElevenLabsVoiceConfig;
  score: number;
}

/**
 * Score voices based on scenario fit
 */
function scoreVoicesForScenario(
  voices: ElevenLabsVoiceConfig[],
  scenarioContext?: ScenarioVoiceContext
): ScoredVoice[] {
  const scoredVoices: ScoredVoice[] = voices.map(voice => {
    let score = 50; // Base score

    if (!scenarioContext) {
      // No scenario context - prefer default voices
      if (voice.tags?.includes('default')) {
        score += 30;
      }
      return { voice, score };
    }

    const scenarioTags = SCENARIO_VOICE_TAGS[scenarioContext.scenarioType];

    // Match formality
    if (scenarioTags.formality === 'formal') {
      if (voice.tags?.includes('professional') || voice.tags?.includes('firm')) {
        score += 20;
      }
      if (voice.tags?.includes('casual')) {
        score -= 10;
      }
    } else if (scenarioTags.formality === 'casual') {
      if (voice.tags?.includes('friendly') || voice.tags?.includes('casual') || voice.tags?.includes('warm')) {
        score += 20;
      }
      if (voice.tags?.includes('firm')) {
        score -= 10;
      }
    }

    // Match preferred tags
    for (const tag of scenarioTags.preferredTags) {
      if (voice.tags?.includes(tag)) {
        score += 10;
      }
    }

    // Match suggested gender
    if (scenarioTags.suggestedGender && scenarioTags.suggestedGender !== 'any') {
      if (voice.gender === scenarioTags.suggestedGender) {
        score += 10;
      }
    }

    // Prefer default voices as tiebreaker
    if (voice.tags?.includes('default')) {
      score += 5;
    }

    return { voice, score };
  });

  // Sort by score descending
  return scoredVoices.sort((a, b) => b.score - a.score);
}

/**
 * Select accent with least exposure for balanced variety
 */
function selectLeastExposedAccent(
  accents: AccentType[],
  exposureHistory?: VoiceExposureRecord[]
): AccentType {
  if (!exposureHistory || exposureHistory.length === 0) {
    // No history - random selection
    return accents[Math.floor(Math.random() * accents.length)];
  }

  // Calculate exposure per accent
  const exposureCounts: Record<AccentType, number> = {} as Record<AccentType, number>;
  for (const accent of accents) {
    exposureCounts[accent] = 0;
  }

  for (const record of exposureHistory) {
    if (accents.includes(record.accent)) {
      exposureCounts[record.accent] = (exposureCounts[record.accent] || 0) + record.exposureCount;
    }
  }

  // Find accent with minimum exposure
  let minExposure = Infinity;
  let selectedAccent = accents[0];

  for (const accent of accents) {
    if (exposureCounts[accent] < minExposure) {
      minExposure = exposureCounts[accent];
      selectedAccent = accent;
    }
  }

  return selectedAccent;
}

/**
 * Determine the pedagogical purpose of variety selection
 */
function determineVarietyPurpose(
  selectedAccent: AccentType,
  primaryAccent: AccentType,
  scenarioContext?: ScenarioVoiceContext
): VarietyPurpose {
  // Check if scenario context suggests this accent
  if (scenarioContext) {
    const scenarioTags = SCENARIO_VOICE_TAGS[scenarioContext.scenarioType];

    // Formal scenarios with Spain Spanish for professional context
    if (scenarioTags.formality === 'formal' && selectedAccent === 'es-spain') {
      return 'scenario_appropriate';
    }

    // British English for formal scenarios
    if (scenarioTags.formality === 'formal' && selectedAccent === 'en-british') {
      return 'scenario_appropriate';
    }
  }

  // Same language, different region = comprehension training
  const primaryLanguage = primaryAccent.split('-')[0];
  const selectedLanguage = selectedAccent.split('-')[0];

  if (primaryLanguage === selectedLanguage) {
    return 'comprehension_training';
  }

  // Different language altogether = cultural exposure
  return 'cultural_exposure';
}

/**
 * Build human-readable reason for voice selection
 */
function buildSelectionReason(
  voice: ElevenLabsVoiceConfig,
  userContext: UserVoiceContext,
  scenarioContext: ScenarioVoiceContext | undefined,
  isVariety: boolean
): string {
  const parts: string[] = [];

  if (isVariety) {
    parts.push(`Variety selection for comprehension training.`);
    parts.push(`Introducing ${voice.accent} accent to build listening skills.`);
  } else {
    parts.push(`Primary accent voice selected.`);
  }

  parts.push(`Voice: ${voice.name} (${voice.accent}).`);

  if (scenarioContext) {
    const scenarioTags = SCENARIO_VOICE_TAGS[scenarioContext.scenarioType];
    parts.push(`Scenario: ${scenarioTags.description} (${scenarioTags.formality}).`);
  }

  parts.push(`User level: ${userContext.proficiencyLevel}.`);

  return parts.join(' ');
}

// =============================================================================
// Convenience Functions
// =============================================================================

/**
 * Quick voice assignment for simple cases
 */
export function getVoiceForUser(
  targetLanguage: SupportedLanguage,
  primaryAccent: AccentType,
  proficiencyLevel: ProficiencyLevel = 'intermediate',
  scenarioType: ScenarioType = 'casual_chat'
): VoiceAssignment {
  const userContext: UserVoiceContext = {
    targetLanguage,
    primaryAccent,
    proficiencyLevel,
    enableVariety: true,
  };

  const scenarioContext: ScenarioVoiceContext = {
    scenarioId: scenarioType,
    scenarioType,
    formality: SCENARIO_VOICE_TAGS[scenarioType].formality,
  };

  return assignVoice(userContext, scenarioContext);
}

/**
 * Get default voice for accent (no variety logic)
 */
export function getDefaultVoiceForAccent(accent: AccentType): ElevenLabsVoiceConfig | undefined {
  const voices = getVoicesForAccent(accent);

  // Prefer voice with 'default' tag
  const defaultVoice = voices.find(v => v.tags?.includes('default'));
  return defaultVoice || voices[0];
}

// =============================================================================
// Export
// =============================================================================

export {
  ELEVENLABS_VOICES,
  getVoicesForAccent,
  getVoicesForLanguage,
} from './elevenLabsConfig';
