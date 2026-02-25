/**
 * Dynamic Scenario Generator
 *
 * Generates ElevenLabs conversation scenarios from:
 * 1. Stair content (learning path context)
 * 2. Onboarding data (profession, scenarios, proficiency, goal)
 *
 * Uses Gemini for AI generation with AsyncStorage caching.
 * All scenarios include systemPromptTemplate for ElevenLabs.
 *
 * Three-tier waterfall:
 * Tier 1: Rich stair DB scenarios (already have systemPromptTemplate)
 * Tier 2: Thin stair scenarios -> enrich via Gemini
 * Tier 3: No stair -> generate from onboarding data via Gemini
 * Tier 4: All fails -> hardcoded library fallback
 */

import { generateJSON } from '@/lib/ai/gemini';
import { sanitizePromptInput } from '@/lib/ai/sanitize';
import { getStairContent, getStaircaseParams } from '@/lib/db/learningPaths';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { VoiceScenario } from '@/lib/voice/types';

// =============================================================================
// Types
// =============================================================================

interface ScenarioGenerationInput {
  /** User ID for fetching staircase params */
  userId: string;
  /** Stair step ID to generate scenario for */
  stairStepId: string;
  /** Number of scenarios to generate */
  count?: number;
}

export interface OnboardingScenarioInput {
  first_name: string;
  target_language: string;
  native_language: string;
  proficiency_level: string;
  goal: string;
  profession: string;
  scenarios: string[];
}

interface GeneratedScenarioResponse {
  scenarios: Array<{
    id: string;
    title: string;
    description: string;
    context: string;
    aiRole: string;
    userRole: string;
    objectives: string[];
    systemPromptTemplate: string;
    language: string;
    difficulty: string;
    category: string;
    suggestedPhrases: string[];
    keyVocabulary: string[];
    suggestedDuration: number;
  }>;
}

interface EnrichmentResponse {
  scenarios: Array<{
    index: number;
    aiRole: string;
    userRole: string;
    objectives: string[];
    systemPromptTemplate: string;
    suggestedPhrases: string[];
  }>;
}

// =============================================================================
// Cache
// =============================================================================

const CACHE_PREFIX = 'vox-voice-scenarios-';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getCacheKey(parts: string[]): string {
  const joined = parts.filter(Boolean).sort().join('|').toLowerCase();
  let hash = 0;
  for (let i = 0; i < joined.length; i++) {
    const char = joined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `${CACHE_PREFIX}${Math.abs(hash).toString(36)}`;
}

async function getCachedScenarios(key: string): Promise<VoiceScenario[] | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;

    const cached = JSON.parse(raw);
    if (!cached.timestamp || !cached.scenarios) return null;

    if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
      await AsyncStorage.removeItem(key);
      return null;
    }

    return cached.scenarios;
  } catch {
    return null;
  }
}

async function setCachedScenarios(key: string, scenarios: VoiceScenario[]): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify({
      timestamp: Date.now(),
      scenarios,
    }));
  } catch (err) {
    console.warn('[ScenarioGenerator] Cache write failed:', err);
  }
}

// =============================================================================
// Proficiency Mapping
// =============================================================================

const PROFICIENCY_LANGUAGE_GUIDANCE: Record<string, string> = {
  // V3 levels
  starting_fresh: 'Use very simple vocabulary and short sentences. Speak slowly. Mix in some native language words when needed. Keep responses to 1-2 sentences.',
  basics: 'Use basic vocabulary and simple sentence structures. Speak clearly and somewhat slowly. Keep responses to 1-2 sentences.',
  conversational: 'Use natural conversational language at a moderate pace. Include some idiomatic expressions. Responses can be 2-3 sentences.',
  confident: 'Speak naturally with complex sentences, idioms, and colloquialisms. Maintain a normal conversational pace.',
  near_fluent: 'Speak at native speed with complex vocabulary, slang, and cultural references. Challenge the learner.',
  // Legacy V2 levels
  beginner: 'Use very simple vocabulary and short sentences. Speak slowly. Keep responses to 1-2 sentences.',
  elementary: 'Use basic vocabulary and simple sentences. Speak clearly. Keep responses to 1-2 sentences.',
  intermediate: 'Use natural conversational language at a moderate pace. Responses can be 2-3 sentences.',
  upper_intermediate: 'Speak naturally with complex sentences and idioms. Normal conversational pace.',
  advanced: 'Speak at native speed with complex vocabulary and cultural references.',
};

const PROFICIENCY_TO_DIFFICULTY: Record<string, VoiceScenario['difficulty']> = {
  starting_fresh: 'beginner',
  basics: 'beginner',
  conversational: 'intermediate',
  confident: 'advanced',
  near_fluent: 'advanced',
  beginner: 'beginner',
  elementary: 'beginner',
  intermediate: 'intermediate',
  upper_intermediate: 'advanced',
  advanced: 'advanced',
};

/** Map full language names (V3) to ISO codes */
const LANG_NAME_TO_CODE: Record<string, string> = {
  english: 'en',
  french: 'fr',
  spanish: 'es',
};

// =============================================================================
// Tier 3: Generate from Onboarding Data
// =============================================================================

/**
 * Generate 3 rich voice scenarios from the user's V3 onboarding data.
 * Each scenario includes a full systemPromptTemplate for ElevenLabs.
 * Results are cached for 24 hours.
 */
export async function generateScenariosFromOnboarding(
  input: OnboardingScenarioInput,
  count: number = 3
): Promise<VoiceScenario[]> {
  const cacheKey = getCacheKey([
    input.target_language,
    input.profession,
    ...input.scenarios,
    input.proficiency_level,
  ]);

  const cached = await getCachedScenarios(cacheKey);
  if (cached) {
    console.log('[ScenarioGenerator] Using cached onboarding scenarios');
    return cached;
  }

  const languageGuidance = PROFICIENCY_LANGUAGE_GUIDANCE[input.proficiency_level] || PROFICIENCY_LANGUAGE_GUIDANCE.intermediate;
  const difficulty = PROFICIENCY_TO_DIFFICULTY[input.proficiency_level] || 'intermediate';
  const langCode = LANG_NAME_TO_CODE[input.target_language] || input.target_language;

  const prompt = `You are a conversation scenario designer for a professional language learning app.
Generate ${count} voice conversation scenarios for a language learner.

## Learner Profile
- Name: ${sanitizePromptInput(input.first_name)}
- Target Language: ${sanitizePromptInput(input.target_language)}
- Native Language: ${sanitizePromptInput(input.native_language)}
- Proficiency: ${sanitizePromptInput(input.proficiency_level)}
- Goal: ${sanitizePromptInput(input.goal)}
- Profession: ${sanitizePromptInput(input.profession)}
- Selected Practice Scenarios: ${input.scenarios.map(s => sanitizePromptInput(s)).join(', ')}

## Requirements
- Each scenario must be a realistic situation this professional would encounter
- Scenarios should be distinct — different settings, characters, and objectives
- Each must include a systemPromptTemplate that defines a character persona
- The AI character should speak ${sanitizePromptInput(input.target_language)} following these guidelines: ${languageGuidance}
- Include 3-5 suggested phrases in ${sanitizePromptInput(input.target_language)} the learner can use
- Include 3-5 key vocabulary words in ${sanitizePromptInput(input.target_language)}
- Each scenario should be completable in 2-5 minutes

## systemPromptTemplate Format
Each systemPromptTemplate MUST follow this exact structure:

You are [Name], a [role] at [location].

PERSONALITY: [2-3 traits]
LANGUAGE: [specific language level instructions]
BEHAVIOR:
- [behavior rule 1]
- [behavior rule 2]
- [behavior rule 3]
- [behavior rule 4]

START: "[opening line in target language]"

## Response Format (JSON only, no markdown)
{
  "scenarios": [
    {
      "id": "unique_scenario_id",
      "title": "Short descriptive title",
      "description": "1-2 sentence description",
      "context": "Physical setting and situation details",
      "aiRole": "The AI character's role description",
      "userRole": "The user's role in the scenario",
      "objectives": ["objective 1", "objective 2", "objective 3"],
      "systemPromptTemplate": "Full system prompt following the format above",
      "language": "${langCode}",
      "difficulty": "${difficulty}",
      "category": "travel|food|shopping|social|professional|emergency",
      "suggestedPhrases": ["phrase 1", "phrase 2", "phrase 3"],
      "keyVocabulary": ["word1", "word2", "word3"],
      "suggestedDuration": 180
    }
  ]
}`;

  try {
    const result = await generateJSON<GeneratedScenarioResponse>(prompt);

    if (!result?.scenarios?.length) {
      console.warn('[ScenarioGenerator] Empty response from Gemini');
      return [];
    }

    const scenarios: VoiceScenario[] = result.scenarios.map((s, i) => ({
      id: s.id || `gen_onboarding_${Date.now()}_${i}`,
      title: s.title,
      description: s.description,
      context: s.context,
      aiRole: s.aiRole,
      userRole: s.userRole,
      objectives: s.objectives || [],
      systemPromptTemplate: s.systemPromptTemplate,
      language: (s.language || langCode) as any,
      difficulty: (s.difficulty || difficulty) as VoiceScenario['difficulty'],
      category: s.category as VoiceScenario['category'],
      suggestedPhrases: s.suggestedPhrases || [],
      keyVocabulary: s.keyVocabulary || [],
      suggestedDuration: s.suggestedDuration || 180,
    }));

    await setCachedScenarios(cacheKey, scenarios);
    console.log('[ScenarioGenerator] Generated and cached', scenarios.length, 'onboarding scenarios');

    return scenarios;
  } catch (error) {
    console.error('[ScenarioGenerator] Onboarding generation failed:', error);
    return [];
  }
}

// =============================================================================
// Tier 2: Enrich Thin Stair Scenarios
// =============================================================================

/**
 * Takes thin stair DB scenarios (missing systemPromptTemplate) and enriches
 * them with full AI persona data via a single Gemini call.
 */
export async function enrichStairScenarios(
  scenarios: VoiceScenario[],
  targetLanguage: string,
  proficiencyLevel: string
): Promise<VoiceScenario[]> {
  if (scenarios.length === 0) return [];

  const cacheKey = getCacheKey([
    'enrich',
    targetLanguage,
    proficiencyLevel,
    ...scenarios.map(s => s.id),
  ]);

  const cached = await getCachedScenarios(cacheKey);
  if (cached) {
    console.log('[ScenarioGenerator] Using cached enriched scenarios');
    return cached;
  }

  const languageGuidance = PROFICIENCY_LANGUAGE_GUIDANCE[proficiencyLevel] || PROFICIENCY_LANGUAGE_GUIDANCE.intermediate;

  const scenarioSummaries = scenarios.map((s, i) =>
    `${i + 1}. Title: "${s.title}" | Description: "${s.description}" | Context: "${s.context}" | AI Role: "${s.aiRole || 'Not set'}"`
  ).join('\n');

  const prompt = `You are a conversation scenario designer for a professional language learning app.
Enrich the following ${scenarios.length} voice conversation scenarios with detailed AI character data.

## Existing Scenarios
${scenarioSummaries}

## Learner Context
- Target Language: ${sanitizePromptInput(targetLanguage)}
- Proficiency: ${sanitizePromptInput(proficiencyLevel)}
- Language guidance: ${languageGuidance}

## Requirements
For each scenario, generate:
- A detailed systemPromptTemplate with character name, personality, language level, behavior rules, and opening line in ${sanitizePromptInput(targetLanguage)}
- A clear aiRole and userRole
- 3-5 objectives
- 3-5 suggested phrases in ${sanitizePromptInput(targetLanguage)}

## systemPromptTemplate Format
Each systemPromptTemplate MUST follow this structure:

You are [Name], a [role] at [location].

PERSONALITY: [2-3 traits]
LANGUAGE: [specific language level instructions]
BEHAVIOR:
- [rule 1]
- [rule 2]
- [rule 3]

START: "[opening line in target language]"

## Response Format (JSON only, no markdown)
{
  "scenarios": [
    {
      "index": 0,
      "aiRole": "Detailed AI role",
      "userRole": "User's role",
      "objectives": ["obj1", "obj2", "obj3"],
      "systemPromptTemplate": "Full system prompt",
      "suggestedPhrases": ["phrase1", "phrase2", "phrase3"]
    }
  ]
}`;

  try {
    const result = await generateJSON<EnrichmentResponse>(prompt);

    if (!result?.scenarios?.length) return scenarios;

    const enriched = scenarios.map((original, i) => {
      const enrichment = result.scenarios.find(s => s.index === i) || result.scenarios[i];
      if (!enrichment) return original;

      return {
        ...original,
        aiRole: enrichment.aiRole || original.aiRole,
        userRole: enrichment.userRole || original.userRole,
        objectives: enrichment.objectives?.length ? enrichment.objectives : original.objectives,
        systemPromptTemplate: enrichment.systemPromptTemplate || original.systemPromptTemplate,
        suggestedPhrases: enrichment.suggestedPhrases?.length ? enrichment.suggestedPhrases : original.suggestedPhrases,
      };
    });

    await setCachedScenarios(cacheKey, enriched);
    console.log('[ScenarioGenerator] Enriched and cached', enriched.length, 'stair scenarios');

    return enriched;
  } catch (error) {
    console.error('[ScenarioGenerator] Enrichment failed:', error);
    return scenarios; // Return originals on failure
  }
}

// =============================================================================
// Stair-Based Generation (Gemini)
// =============================================================================

/**
 * Generate conversation scenarios based on stair content.
 * Returns pre-built scenarios when Gemini is unavailable.
 */
export async function generateScenariosForStair(
  input: ScenarioGenerationInput
): Promise<VoiceScenario[]> {
  const count = input.count || 3;

  const [content, params] = await Promise.all([
    getStairContent(input.stairStepId),
    getStaircaseParams(input.userId),
  ]);

  if (!content || !params) {
    console.warn('[ScenarioGenerator] Missing content or params, using fallbacks');
    return getDefaultScenarios(params?.target_language || 'es', count);
  }

  const cacheKey = getCacheKey([
    'stair',
    input.stairStepId,
    params.target_language,
    params.proficiency_level,
  ]);

  const cached = await getCachedScenarios(cacheKey);
  if (cached) {
    console.log('[ScenarioGenerator] Using cached stair scenarios');
    return cached;
  }

  const vocabWords = (content.vocabulary || [])
    .slice(0, 20)
    .map((v: any) => (typeof v === 'string' ? v : v.word || v.term || ''))
    .filter(Boolean);

  const grammarPoints = (content.grammar_points || []).slice(0, 5);
  const languageGuidance = PROFICIENCY_LANGUAGE_GUIDANCE[params.proficiency_level] || PROFICIENCY_LANGUAGE_GUIDANCE.intermediate;
  const difficulty = PROFICIENCY_TO_DIFFICULTY[params.proficiency_level] || 'intermediate';

  const prompt = `You are a conversation scenario designer for a professional language learning app. Create realistic, practical scenarios that professionals would encounter in real life.

Generate ${count} conversation scenarios for a language learner.

## Learner Profile
- Target Language: ${sanitizePromptInput(params.target_language)}
- Native Language: ${sanitizePromptInput(params.native_language)}
- Level: ${sanitizePromptInput(params.proficiency_level)}
- Motivation: ${sanitizePromptInput(params.motivation)}
- Language guidance: ${languageGuidance}

## Current Vocabulary Focus
${vocabWords.join(', ')}

## Grammar Points
${grammarPoints.join(', ')}

## Requirements
- Create ${count} distinct scenarios that use the vocabulary above
- Each should have a different real-world setting
- Include a systemPromptTemplate with character name, personality, language instructions, behavior rules, and opening line
- Scenarios should match the learner's proficiency level

## systemPromptTemplate Format
You are [Name], a [role] at [location].

PERSONALITY: [2-3 traits]
LANGUAGE: [specific language level instructions]
BEHAVIOR:
- [rule 1]
- [rule 2]
- [rule 3]

START: "[opening line in target language]"

## Response Format (JSON only, no markdown)
{
  "scenarios": [
    {
      "id": "scenario_unique_id",
      "title": "Short descriptive title",
      "description": "1-2 sentence description of the scenario",
      "context": "Physical setting and situation details",
      "aiRole": "Role the AI tutor plays",
      "userRole": "Role the user plays",
      "objectives": ["objective 1", "objective 2", "objective 3"],
      "systemPromptTemplate": "Full system prompt",
      "keyVocabulary": ["word1", "word2", "word3"],
      "suggestedPhrases": ["phrase1", "phrase2"],
      "suggestedDuration": 180
    }
  ]
}`;

  try {
    const result = await generateJSON<GeneratedScenarioResponse>(prompt);

    if (!result?.scenarios?.length) {
      return getDefaultScenarios(params.target_language, count);
    }

    const scenarios: VoiceScenario[] = result.scenarios.map((s) => ({
      id: s.id || `scenario_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: s.title,
      description: s.description,
      context: s.context,
      aiRole: s.aiRole,
      userRole: s.userRole,
      objectives: s.objectives || [],
      systemPromptTemplate: s.systemPromptTemplate,
      keyVocabulary: s.keyVocabulary || [],
      suggestedPhrases: s.suggestedPhrases || [],
      suggestedDuration: s.suggestedDuration || 180,
      stairStepId: input.stairStepId,
      difficulty,
    }));

    await setCachedScenarios(cacheKey, scenarios);
    return scenarios;
  } catch (error) {
    console.error('[ScenarioGenerator] Generation failed:', error);
    return getDefaultScenarios(params.target_language, count);
  }
}

// =============================================================================
// Default Scenarios (Fallback — Tier 4)
// =============================================================================

/**
 * Pre-built scenarios when AI generation is unavailable.
 */
function getDefaultScenarios(language: string, count: number): VoiceScenario[] {
  const defaults: VoiceScenario[] = [
    {
      id: 'default_cafe',
      title: 'Ordering at a Cafe',
      description: 'Practice ordering food and drinks at a cafe.',
      context: 'You are at a local cafe and want to order something to drink and eat.',
      aiRole: 'A friendly barista at the cafe',
      objectives: [
        'Greet the barista appropriately',
        'Order a drink and a snack',
        'Ask about menu items',
        'Pay and say goodbye',
      ],
      keyVocabulary: [],
      suggestedDuration: 180,
    },
    {
      id: 'default_directions',
      title: 'Asking for Directions',
      description: 'Practice asking and understanding directions.',
      context: 'You are lost in a new city and need to find a specific location.',
      aiRole: 'A helpful local who knows the area well',
      objectives: [
        'Ask for directions politely',
        'Understand basic direction words',
        'Confirm you understood correctly',
        'Thank the person',
      ],
      keyVocabulary: [],
      suggestedDuration: 180,
    },
    {
      id: 'default_meeting',
      title: 'Business Meeting Introduction',
      description: 'Practice introducing yourself in a professional setting.',
      context: 'You are meeting a new colleague at your company for the first time.',
      aiRole: 'A new colleague at your company',
      objectives: [
        'Introduce yourself professionally',
        'Ask about their role',
        'Discuss a current project briefly',
        'Exchange contact information',
      ],
      keyVocabulary: [],
      suggestedDuration: 240,
    },
    {
      id: 'default_shopping',
      title: 'Shopping for Clothes',
      description: 'Practice shopping interactions.',
      context: 'You are at a clothing store looking for a specific item.',
      aiRole: 'A store clerk at a clothing shop',
      objectives: [
        'Ask for help finding an item',
        'Discuss sizes and colors',
        'Ask about prices',
        'Make a purchase decision',
      ],
      keyVocabulary: [],
      suggestedDuration: 180,
    },
    {
      id: 'default_casual',
      title: 'Casual Conversation',
      description: 'Practice everyday small talk.',
      context: 'You are chatting with someone at a social event.',
      aiRole: 'A friendly person at a social gathering',
      objectives: [
        'Start a conversation naturally',
        'Talk about hobbies and interests',
        'Ask follow-up questions',
        'Keep the conversation flowing',
      ],
      keyVocabulary: [],
      suggestedDuration: 240,
    },
  ];

  return defaults.slice(0, count);
}
