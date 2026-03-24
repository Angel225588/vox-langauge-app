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
 *
 * Uses multiple signals:
 * 1. Keyword matching from objective text
 * 2. Conversation progression (early objectives more likely done)
 * 3. User turn count (more turns = more objectives covered)
 * 4. Agent responses that indicate topic was addressed
 *
 * Returns array of booleans matching objectives array indices.
 */
export function detectObjectiveCompletion(
  objectives: string[],
  messages: Array<{ role: string; content: string }>,
): boolean[] {
  if (messages.length === 0) return objectives.map(() => false);

  const userMessages = messages.filter(m => m.role === 'user');
  const allText = messages.map(m => m.content.toLowerCase()).join(' ');
  const userText = userMessages.map(m => m.content.toLowerCase()).join(' ');

  // Common stop words to filter out
  const stopWords = new Set([
    'the', 'a', 'an', 'in', 'to', 'for', 'and', 'or', 'with', 'about',
    'their', 'your', 'them', 'this', 'that', 'have', 'has', 'had', 'been',
    'will', 'would', 'could', 'should', 'can', 'may', 'might', 'must',
    'from', 'they', 'what', 'when', 'where', 'which', 'who', 'how',
  ]);

  // Objective-specific keyword synonyms for common actions
  const actionSynonyms: Record<string, string[]> = {
    greet: ['hello', 'hi', 'bonjour', 'bonsoir', 'hola', 'buenos', 'salut', 'welcome', 'bienvenue'],
    introduce: ['name', 'je suis', 'me llamo', 'i am', 'my name', 'je m\'appelle', 'soy'],
    ask: ['question', 'what', 'how', 'pourquoi', 'comment', 'quoi', 'donde', 'como', 'qué'],
    describe: ['explain', 'tell', 'show', 'this is', 'voici', 'c\'est', 'esto es', 'look'],
    recommend: ['suggest', 'try', 'best', 'favorite', 'recommande', 'conseil', 'essayer', 'mejor'],
    order: ['would like', 'want', 'voudrais', 'quiero', 'please', 's\'il vous plait', 'por favor'],
    end: ['goodbye', 'bye', 'au revoir', 'merci', 'thank', 'adios', 'gracias', 'à bientôt'],
    directions: ['where', 'left', 'right', 'straight', 'gauche', 'droite', 'tout droit', 'izquierda', 'derecha'],
  };

  return objectives.map((objective, index) => {
    const objLower = objective.toLowerCase();

    // Extract meaningful keywords from objective
    const keywords = objLower
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));

    // Check for keyword matches in full conversation
    const keywordMatches = keywords.filter(kw => allText.includes(kw)).length;
    const keywordScore = keywords.length > 0 ? keywordMatches / keywords.length : 0;

    // Check for action synonym matches
    let synonymScore = 0;
    for (const [action, synonyms] of Object.entries(actionSynonyms)) {
      if (objLower.includes(action)) {
        const found = synonyms.some(syn => allText.includes(syn));
        if (found) synonymScore = 0.5;
        // Extra credit if USER said it (not just agent)
        const userSaid = synonyms.some(syn => userText.includes(syn));
        if (userSaid) synonymScore = 0.8;
      }
    }

    // Progression bonus: earlier objectives are more likely done
    // If we have 6+ user turns and this is an early objective, likely covered
    const progressionBonus = (userMessages.length >= 2 * (index + 1)) ? 0.3 : 0;

    // Combined score
    const totalScore = Math.max(keywordScore, synonymScore) + progressionBonus;

    // Threshold: 0.4+ = completed (generous to avoid false negatives)
    return totalScore >= 0.4;
  });
}
