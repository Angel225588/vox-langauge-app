/**
 * Guided Prompt Builder — Builds ElevenLabs system prompts for guided voice practice
 *
 * Creates prompts that make the AI agent:
 * 1. Stay in character (role assigned)
 * 2. Guide the conversation through objectives naturally
 * 3. Help the user complete all checklist items
 * 4. Wrap up when objectives are done or time is running out
 *
 * The AI doesn't say "now let's do objective 3" — it naturally
 * steers the conversation so the user practices each skill.
 */

import type { VoiceScenario } from './types';

interface GuidedPromptInput {
  scenario: VoiceScenario;
  targetLanguage: string;
  nativeLanguage: string;
  proficiency: string;
  userName?: string;
  voiceName: string;
}

/**
 * Build a system prompt that makes ElevenLabs guide through objectives.
 */
export function buildGuidedSystemPrompt(input: GuidedPromptInput): string {
  const {
    scenario,
    targetLanguage,
    nativeLanguage,
    proficiency,
    userName,
    voiceName,
  } = input;

  const langName = targetLanguage === 'fr' ? 'French'
    : targetLanguage === 'es' ? 'Spanish'
    : 'English';

  const speedInstruction = proficiency === 'starting_fresh' || proficiency === 'basics'
    ? 'Speak slowly and clearly. Use simple words. Keep sentences short (5-8 words max).'
    : proficiency === 'conversational'
    ? 'Speak at a moderate pace. Use everyday vocabulary. Keep responses conversational.'
    : 'Speak naturally. Use rich vocabulary and varied sentence structures.';

  const objectivesList = scenario.objectives
    .map((obj, i) => `${i + 1}. ${obj}`)
    .join('\n');

  return `You are ${voiceName}, playing the role of "${scenario.aiRole}" in a language practice scenario.

## ABSOLUTE LANGUAGE RULE
You speak ONLY in ${langName}. Every single word must be in ${langName}.
NEVER switch to ${nativeLanguage} or any other language, even if the user speaks another language.
If the user struggles, rephrase in simpler ${langName} — never translate.

## YOUR CHARACTER
- Role: ${scenario.aiRole}
- Name: ${voiceName}
- Setting: ${scenario.context || scenario.description}
- Personality: Friendly, patient, professional. Stay in character at all times.

## THE USER
- They are practicing ${langName} as "${scenario.userRole}"
- Level: ${proficiency}${userName ? `\n- Name: ${userName}` : ''}
- ${speedInstruction}

## CONVERSATION OBJECTIVES
Guide the conversation naturally so the user gets to practice ALL of these:
${objectivesList}

IMPORTANT RULES FOR OBJECTIVES:
- Do NOT announce objectives ("now let's practice greeting"). Be natural.
- Create situations where each objective happens organically.
- If the user skips an objective, gently steer back to it.
- After the user addresses an objective, naturally move to the next one.
- When all objectives are covered, begin wrapping up the conversation naturally.

## CONVERSATION FLOW
1. Start with a warm, natural greeting in character.
2. Set the scene briefly (1-2 sentences about the situation).
3. Let the user respond, then guide toward objective 1.
4. Progress through objectives naturally.
5. After all objectives, signal conversation is ending naturally.

## RESPONSE RULES
- Keep responses SHORT (2-3 sentences max per turn).
- Ask one question at a time, never multiple.
- If user is silent for 5+ seconds, gently prompt them.
- If user makes a grammar error, don't correct directly — model the correct form in your response.
- Be encouraging without being patronizing.

## KEY VOCABULARY TO USE
${scenario.keyVocabulary?.length ? scenario.keyVocabulary.join(', ') : 'Use vocabulary appropriate for the scenario and level.'}

## START NOW
Begin with your opening greeting in character. Set the scene.`;
}

/**
 * Build the first message the AI will say when the call connects.
 */
export function buildGuidedFirstMessage(input: GuidedPromptInput): string {
  const { scenario, targetLanguage, voiceName } = input;

  // Language-specific greetings based on scenario
  if (targetLanguage === 'fr') {
    return `Bonjour ! Je suis ${voiceName}. ${scenario.description ? scenario.description.split('.')[0] + '.' : 'Comment puis-je vous aider ?'}`;
  }
  if (targetLanguage === 'es') {
    return `¡Hola! Soy ${voiceName}. ${scenario.description ? scenario.description.split('.')[0] + '.' : '¿Cómo puedo ayudarle?'}`;
  }
  return `Hello! I'm ${voiceName}. ${scenario.description ? scenario.description.split('.')[0] + '.' : 'How can I help you?'}`;
}

/**
 * Detect which objectives have been completed based on transcript.
 * Uses keyword matching on both user and agent messages.
 *
 * Returns array of booleans matching objectives array indices.
 */
export function detectObjectiveCompletion(
  objectives: string[],
  messages: Array<{ role: string; content: string }>,
): boolean[] {
  const allText = messages
    .map(m => m.content.toLowerCase())
    .join(' ');

  return objectives.map(objective => {
    // Extract key words from objective (remove common words)
    const stopWords = new Set(['the', 'a', 'an', 'in', 'to', 'for', 'and', 'or', 'with', 'about', 'their', 'your', 'them']);
    const keywords = objective
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopWords.has(w));

    // Objective is "completed" if 50%+ of keywords appear in conversation
    const matchCount = keywords.filter(kw => allText.includes(kw)).length;
    return keywords.length > 0 && matchCount / keywords.length >= 0.5;
  });
}
