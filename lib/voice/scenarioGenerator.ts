/**
 * Dynamic Scenario Generator
 *
 * Generates ElevenLabs conversation scenarios from stair content.
 * Replaces hardcoded scenarios with AI-generated ones personalized
 * to user's profession, goals, and current learning path position.
 *
 * Flow: Stair vocabulary + grammar → AI prompt → VoiceScenario
 */

import { generateJSON } from '@/lib/ai/claudeClient';
import { sanitizePromptInput } from '@/lib/ai/sanitize';
import { getStairContent, getStaircaseParams } from '@/lib/db/learningPaths';
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

interface RawScenarioResponse {
  scenarios: Array<{
    id: string;
    title: string;
    description: string;
    context: string;
    aiRole: string;
    objectives: string[];
    keyVocabulary: string[];
    suggestedDuration: number;
  }>;
}

// =============================================================================
// Scenario Generation
// =============================================================================

const SCENARIO_SYSTEM_PROMPT = `You are a conversation scenario designer for a professional language learning app. Create realistic, practical scenarios that professionals would encounter in real life.

Each scenario should:
- Be based on the vocabulary and grammar provided
- Have a clear setting, roles, and objectives
- Be completable in 2-5 minutes of conversation
- Include specific vocabulary the learner should practice
- Be professional and culturally appropriate

IMPORTANT: Respond ONLY with valid JSON. No markdown, no explanation outside the JSON.`;

/**
 * Generate conversation scenarios based on stair content.
 * Returns pre-built scenarios when Claude is unavailable.
 */
export async function generateScenariosForStair(
  input: ScenarioGenerationInput
): Promise<VoiceScenario[]> {
  const count = input.count || 3;

  // Fetch stair content and user params
  const [content, params] = await Promise.all([
    getStairContent(input.stairStepId),
    getStaircaseParams(input.userId),
  ]);

  if (!content || !params) {
    console.warn('[ScenarioGenerator] Missing content or params, using fallbacks');
    return getDefaultScenarios(params?.target_language || 'es', count);
  }

  // Extract vocab words for the prompt
  const vocabWords = (content.vocabulary || [])
    .slice(0, 20)
    .map((v: any) => (typeof v === 'string' ? v : v.word || v.term || ''))
    .filter(Boolean);

  const grammarPoints = (content.grammar_points || []).slice(0, 5);

  const prompt = `Generate ${count} conversation scenarios for a language learner.

## Learner Profile
- Target Language: ${sanitizePromptInput(params.target_language)}
- Native Language: ${sanitizePromptInput(params.native_language)}
- Level: ${sanitizePromptInput(params.proficiency_level)}
- Motivation: ${sanitizePromptInput(params.motivation)}

## Current Vocabulary Focus
${vocabWords.join(', ')}

## Grammar Points
${grammarPoints.join(', ')}

## Requirements
- Create ${count} distinct scenarios that use the vocabulary above
- Each should have a different real-world setting (business, social, daily life, etc.)
- Scenarios should match the learner's proficiency level
- Include 3-5 objectives per scenario
- List key vocabulary words the learner should practice

## Response Format
{
  "scenarios": [
    {
      "id": "scenario_unique_id",
      "title": "Short descriptive title",
      "description": "1-2 sentence description of the scenario",
      "context": "Physical setting and situation details",
      "aiRole": "Role the AI tutor plays (e.g., 'waiter at a restaurant')",
      "objectives": ["objective 1", "objective 2", "objective 3"],
      "keyVocabulary": ["word1", "word2", "word3"],
      "suggestedDuration": 180
    }
  ]
}`;

  try {
    const result = await generateJSON<RawScenarioResponse>(prompt, SCENARIO_SYSTEM_PROMPT);

    if (!result?.scenarios?.length) {
      return getDefaultScenarios(params.target_language, count);
    }

    return result.scenarios.map((s) => ({
      id: s.id || `scenario_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: s.title,
      description: s.description,
      context: s.context,
      aiRole: s.aiRole,
      objectives: s.objectives || [],
      keyVocabulary: s.keyVocabulary || [],
      suggestedDuration: s.suggestedDuration || 180,
      stairStepId: input.stairStepId,
    }));
  } catch (error) {
    console.error('[ScenarioGenerator] Generation failed:', error);
    return getDefaultScenarios(params.target_language, count);
  }
}

// =============================================================================
// Default Scenarios (Fallback)
// =============================================================================

/**
 * Pre-built scenarios when AI generation is unavailable.
 */
function getDefaultScenarios(language: string, count: number): VoiceScenario[] {
  const defaults: VoiceScenario[] = [
    {
      id: 'default_cafe',
      title: 'Ordering at a Café',
      description: 'Practice ordering food and drinks at a café.',
      context: 'You are at a local café and want to order something to drink and eat.',
      aiRole: 'A friendly barista at the café',
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
