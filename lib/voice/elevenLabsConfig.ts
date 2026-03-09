/**
 * ElevenLabs Voice Configuration
 *
 * Voice configurations for ElevenLabs Conversational AI.
 * Voice IDs need to be replaced with actual IDs from your ElevenLabs dashboard.
 *
 * To get voice IDs:
 * 1. Go to https://elevenlabs.io/voice-library
 * 2. Find native speakers for each language/accent
 * 3. Copy the voice ID and replace the placeholders below
 */

import { SupportedLanguage, AccentType } from './types';
import { ElevenLabsVoiceConfig, ProficiencyLevel } from './elevenLabsTypes';

// =============================================================================
// Environment Variables
// =============================================================================

/**
 * Get ElevenLabs API key from environment
 * Must be set in .env as EXPO_PUBLIC_ELEVENLABS_API_KEY
 */
export const getElevenLabsApiKey = (): string => {
  const key = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;
  if (!key) {
    console.warn('[ElevenLabs] API key not configured');
  }
  return key || '';
};

/**
 * Get ElevenLabs Agent ID from environment
 * Must be set in .env as EXPO_PUBLIC_ELEVENLABS_AGENT_ID
 */
export const getElevenLabsAgentId = (): string => {
  const id = process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID;
  if (!id) {
    console.warn('[ElevenLabs] Agent ID not configured');
  }
  return id || '';
};

// =============================================================================
// Voice Library
// =============================================================================

/**
 * ElevenLabs voice configurations
 *
 * Voice IDs from ElevenLabs Voice Library — native speakers per language
 * Updated March 2026
 */
export const ELEVENLABS_VOICES: ElevenLabsVoiceConfig[] = [
  // ==========================================================================
  // French Voices (France) — Native French speakers from ElevenLabs library
  // ==========================================================================
  {
    id: 'fr-FR-andre',
    name: 'André',
    language: 'fr',
    accent: 'fr-france',
    flag: '🇫🇷',
    elevenLabsVoiceId: 'qNc8cbRJLnPqGTjuVcKa',
    description: 'Young conversational French male voice',
    gender: 'male',
    proficiencyLevels: ['beginner', 'elementary', 'intermediate', 'advanced'],
    tags: ['default', 'conversational', 'clear'],
  },
  {
    id: 'fr-FR-vincent',
    name: 'Vincent',
    language: 'fr',
    accent: 'fr-france',
    flag: '🇫🇷',
    elevenLabsVoiceId: 'VqRZ6BFefek5cPzVm5MN',
    description: 'Professional French male voice — chill and natural',
    gender: 'male',
    proficiencyLevels: ['beginner', 'elementary', 'intermediate', 'advanced'],
    tags: ['professional', 'warm'],
  },
  {
    id: 'fr-FR-charlotte',
    name: 'Charlotte',
    language: 'fr',
    accent: 'fr-france',
    flag: '🇫🇷',
    elevenLabsVoiceId: 'XB0fDUnXU5powFXDhCwa',
    description: 'Warm French female voice (multilingual)',
    gender: 'female',
    proficiencyLevels: ['beginner', 'elementary', 'intermediate', 'advanced'],
    tags: ['friendly', 'warm'],
  },
  {
    id: 'fr-FR-matilda',
    name: 'Matilda',
    language: 'fr',
    accent: 'fr-france',
    flag: '🇫🇷',
    elevenLabsVoiceId: 'XrExE9yKIg1WjnnlVkGX',
    description: 'Natural French female voice (multilingual)',
    gender: 'female',
    proficiencyLevels: ['beginner', 'elementary', 'intermediate', 'advanced'],
    tags: ['natural', 'elegant'],
  },

  // ==========================================================================
  // English Voices (American)
  // ==========================================================================
  {
    id: 'en-US-roger',
    name: 'Roger',
    language: 'en',
    accent: 'en-american',
    flag: '🇺🇸',
    elevenLabsVoiceId: 'CwhRBWXzGAHq8TQ4Fs17',
    description: 'Clear American English voice - Male',
    gender: 'male',
    proficiencyLevels: ['beginner', 'elementary', 'intermediate', 'advanced'],
    tags: ['default', 'professional', 'clear'],
  },
  {
    id: 'en-US-adam',
    name: 'Adam',
    language: 'en',
    accent: 'en-american',
    flag: '🇺🇸',
    elevenLabsVoiceId: 'pNInz6obpgDQGcFmaJgB',
    description: 'Professional American English voice - Male',
    gender: 'male',
    proficiencyLevels: ['beginner', 'elementary', 'intermediate', 'advanced'],
    tags: ['professional', 'formal'],
  },
  {
    id: 'en-US-rachel',
    name: 'Rachel',
    language: 'en',
    accent: 'en-american',
    flag: '🇺🇸',
    elevenLabsVoiceId: '21m00Tcm4TlvDq8ikWAM',
    description: 'Warm American English voice - Female',
    gender: 'female',
    proficiencyLevels: ['beginner', 'elementary', 'intermediate', 'advanced'],
    tags: ['warm', 'friendly'],
  },
  {
    id: 'en-US-aria',
    name: 'Aria',
    language: 'en',
    accent: 'en-american',
    flag: '🇺🇸',
    elevenLabsVoiceId: '9BWtsMINqrJLrRacOk9x',
    description: 'Friendly American English voice - Female',
    gender: 'female',
    proficiencyLevels: ['beginner', 'elementary', 'intermediate', 'advanced'],
    tags: ['friendly', 'casual'],
  },

  // ==========================================================================
  // Spanish Voices (Latin America) — Native LatAm speakers
  // ==========================================================================
  {
    id: 'es-LATAM-santiago',
    name: 'Santiago',
    language: 'es',
    accent: 'es-latam',
    flag: '🇲🇽',
    elevenLabsVoiceId: '15bJsujCI3tcDWeoZsQP',
    description: 'Clear, casual Mexican male voice',
    gender: 'male',
    proficiencyLevels: ['beginner', 'elementary', 'intermediate', 'advanced'],
    tags: ['default', 'conversational', 'clear'],
  },
  {
    id: 'es-LATAM-valentina',
    name: 'Valentina',
    language: 'es',
    accent: 'es-latam',
    flag: '🇲🇽',
    elevenLabsVoiceId: 'J4vZAFDEcpenkMp3f3R9',
    description: 'Warm conversational Colombian female voice',
    gender: 'female',
    proficiencyLevels: ['beginner', 'elementary', 'intermediate', 'advanced'],
    tags: ['warm', 'friendly', 'conversational'],
  },

  // ==========================================================================
  // Spanish Voices (Spain / Castilian) — Native Castilian speakers
  // ==========================================================================
  {
    id: 'es-ES-marco',
    name: 'Marco',
    language: 'es',
    accent: 'es-spain',
    flag: '🇪🇸',
    elevenLabsVoiceId: 'XcWPJPVzbTFL09D9rQkl',
    description: 'Confident conversational Castilian male voice',
    gender: 'male',
    proficiencyLevels: ['beginner', 'elementary', 'intermediate', 'advanced'],
    tags: ['default', 'conversational', 'professional'],
  },
  {
    id: 'es-ES-flavia',
    name: 'Flavia',
    language: 'es',
    accent: 'es-spain',
    flag: '🇪🇸',
    elevenLabsVoiceId: 'kvVjNZvtnCv3Sl1Hr70T',
    description: 'Natural pleasant Castilian female voice',
    gender: 'female',
    proficiencyLevels: ['beginner', 'elementary', 'intermediate', 'advanced'],
    tags: ['natural', 'warm', 'conversational'],
  },
];

// =============================================================================
// Voice Lookup Functions
// =============================================================================

/**
 * Get all voices for a specific language
 */
export function getVoicesForLanguage(language: SupportedLanguage): ElevenLabsVoiceConfig[] {
  return ELEVENLABS_VOICES.filter(v => v.language === language);
}

/**
 * Get all voices for a specific accent
 */
export function getVoicesForAccent(accent: AccentType): ElevenLabsVoiceConfig[] {
  return ELEVENLABS_VOICES.filter(v => v.accent === accent);
}

/**
 * Get voice by ID
 */
export function getVoiceById(id: string): ElevenLabsVoiceConfig | undefined {
  return ELEVENLABS_VOICES.find(v => v.id === id);
}

/**
 * Get default voice for a language
 * Returns the first voice marked as 'default' or the first available voice
 */
export function getDefaultVoiceForLanguage(language: SupportedLanguage): ElevenLabsVoiceConfig | undefined {
  const languageVoices = getVoicesForLanguage(language);
  return languageVoices.find(v => v.tags?.includes('default')) || languageVoices[0];
}

/**
 * Get voices for multi-speaker dialogue.
 *
 * Returns up to N distinct voices for the language, alternating
 * male/female for natural-sounding conversations.
 * Prioritizes gender diversity: male first, then female, then remaining.
 *
 * Max speakers per language:
 *   French: 4 (André, Vincent, Charlotte, Matilda)
 *   English: 4 (Roger, Adam, Rachel, Aria)
 *   Spanish LATAM: 2 (Santiago, Valentina)
 *   Spanish ES: 2 (Marco, Flavia)
 */
export function getDialogueVoices(
  language: SupportedLanguage,
  speakerCount: number = 2,
): ElevenLabsVoiceConfig[] {
  const allVoices = getVoicesForLanguage(language);
  if (allVoices.length === 0) return [];

  // Separate by gender for natural alternation
  const males = allVoices.filter(v => v.gender === 'male');
  const females = allVoices.filter(v => v.gender === 'female');

  // Interleave: male, female, male, female...
  const interleaved: ElevenLabsVoiceConfig[] = [];
  const maxLen = Math.max(males.length, females.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < males.length) interleaved.push(males[i]);
    if (i < females.length) interleaved.push(females[i]);
  }

  return interleaved.slice(0, Math.min(speakerCount, interleaved.length));
}

/**
 * Get voices suitable for a proficiency level
 */
export function getVoicesForProficiency(
  language: SupportedLanguage,
  proficiency: ProficiencyLevel
): ElevenLabsVoiceConfig[] {
  return getVoicesForLanguage(language).filter(v =>
    v.proficiencyLevels.includes(proficiency)
  );
}

/**
 * Get speed multiplier for proficiency level
 */
export function getSpeedForProficiency(proficiency: ProficiencyLevel): number {
  const speedMap: Record<ProficiencyLevel, number> = {
    beginner: 0.8,
    elementary: 0.85,
    intermediate: 0.95,
    advanced: 1.0,
    native: 1.1,
  };
  return speedMap[proficiency] || 0.9;
}

// =============================================================================
// Slow Speech Mode
// =============================================================================

/**
 * Slow speech speed settings
 * Used when user requests slow mode or speaks slowly themselves
 */
export const SLOW_SPEECH_SPEEDS = {
  /** Very slow - for beginners needing to hear every syllable (0.5x) */
  verySlow: 0.5,
  /** Slow - for practicing pronunciation (0.65x) */
  slow: 0.65,
  /** Moderate slow - slightly slower than normal (0.8x) */
  moderate: 0.8,
  /** Normal speed (1.0x) */
  normal: 1.0,
} as const;

export type SlowSpeechSpeed = keyof typeof SLOW_SPEECH_SPEEDS;

/**
 * Get the speed value for a slow speech mode
 */
export function getSlowSpeechSpeed(mode: SlowSpeechSpeed): number {
  return SLOW_SPEECH_SPEEDS[mode];
}

// =============================================================================
// System Prompt Builder
// =============================================================================

interface PromptContext {
  voiceName: string;
  accent: string;
  language: string;
  proficiency: ProficiencyLevel;
  scenario: string;
  scenarioDescription?: string;
  emotionInstruction?: string;
  /** Target session duration in seconds for timed lessons */
  targetDurationSeconds?: number;
  /** Key vocabulary words for the scenario */
  keyVocabulary?: string[];
}

/**
 * Build system prompt for ElevenLabs agent
 *
 * IMPORTANT: This prompt is passed as an override to the ElevenLabs agent.
 * The voice is controlled via TTS override (voiceId), not through prompt.
 */
export function buildSystemPrompt(context: PromptContext): string {
  const responseLength = getResponseLengthForProficiency(context.proficiency);
  const languageDisplayName = getLanguageDisplayName(context.language);
  const silenceTimeout = getSilenceTimeoutForProficiency(context.proficiency);

  return `You are ${context.voiceName}, a native ${languageDisplayName} speaker helping someone practice.

## LANGUAGE — ABSOLUTE RULE
- You speak ONLY ${languageDisplayName}. Every single word you say must be in ${languageDisplayName}.
- NEVER switch to English or any other language, even if the user speaks English to you.
- If the user speaks in another language, respond in ${languageDisplayName} and gently guide them back.
- If the user asks you to translate or speak English, stay in ${languageDisplayName} and say you can only speak ${languageDisplayName}.

## CHARACTER IDENTITY
- Your name is ${context.voiceName}. Introduce yourself by name at the start.
- NEVER break character or reveal you are an AI.
- Stay in character throughout the entire conversation.

## Core Rules
- Keep responses SHORT: ${responseLength}
- Be conversational and natural, like chatting with a friend.
- User level: ${context.proficiency}
- Respond QUICKLY after the user finishes speaking. Do not add unnecessary pauses.

## Scenario: ${context.scenario}${context.scenarioDescription ? `\n${context.scenarioDescription}` : ''}

## SCENARIO BOUNDARIES
- Stay within the scenario described above.
- If the user changes topic, gently redirect back to the scenario.
- Stay in the physical setting described in the scenario.
- Do NOT discuss unrelated topics like politics or abstract concepts.

## SILENCE & PACING — CRITICAL
- If the user goes silent for about ${silenceTimeout} seconds, gently encourage them WITHOUT rushing.
- Use warm, supportive phrases in ${languageDisplayName}. Examples:
${getSilencePromptsForLanguage(context.language)}
- NEVER say "are you still there?" in an impatient way.
- Give them space to think — silence is normal when learning a language.
- After encouraging, wait again. Do not repeat encouragement rapidly.
- If they stay silent after 2 gentle prompts, ask a simpler yes/no question to help them re-engage.

## Conversation Flow
- Respond briefly, then ask a follow-up question to keep the conversation flowing.
- Don't lecture or give long explanations.
- React naturally with short affirmations before your response.
- Match the user's energy and pace.
- If the user gives short answers, ask easier questions. If they give long answers, match their level.
${context.emotionInstruction ? `\n${context.emotionInstruction}` : ''}
${context.keyVocabulary && context.keyVocabulary.length > 0 ? `
## KEY VOCABULARY TO PRACTICE
Try to naturally work these words/phrases into the conversation:
${context.keyVocabulary.slice(0, 8).map(w => `- ${w}`).join('\n')}
Do NOT list them out or quiz the user. Weave them naturally into your responses and questions.` : ''}

## Pronunciation Feedback
- When you notice unclear speech, naturally model the correct pronunciation by repeating the word clearly.
- Don't explain phonetics — just model it naturally in context.
- Only correct when genuinely unclear, not every small error.

## CRITICAL: Plain Text Only
- NO XML tags, NO markup of any kind.
- Just natural speech text.${context.targetDurationSeconds ? `

## SESSION TIMING
- This is a timed practice session (~${Math.round(context.targetDurationSeconds / 60)} minutes).
- When the conversation has been going for a while, start naturally wrapping up.
- Use a natural closing appropriate to the scenario.
- Do NOT mention the timer. End the conversation naturally.` : ''}`;
}

/**
 * Get display name for a language code
 */
function getLanguageDisplayName(language: string): string {
  const names: Record<string, string> = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'pt': 'Portuguese',
    'de': 'German',
    'it': 'Italian',
    'English': 'English',
    'Spanish': 'Spanish',
    'French': 'French',
    'Portuguese': 'Portuguese',
    'German': 'German',
    'Italian': 'Italian',
  };
  return names[language] || language;
}

/**
 * Get silence timeout in seconds based on proficiency.
 * Beginners get more thinking time.
 */
function getSilenceTimeoutForProficiency(proficiency: ProficiencyLevel): number {
  const timeouts: Record<ProficiencyLevel, number> = {
    beginner: 10,
    elementary: 9,
    intermediate: 7,
    advanced: 5,
    native: 5,
  };
  return timeouts[proficiency] || 8;
}

/**
 * Get language-specific gentle silence prompts
 */
function getSilencePromptsForLanguage(language: string): string {
  const prompts: Record<string, string> = {
    es: `  - "Tómate tu tiempo, no hay prisa." (Take your time, no rush.)
  - "¿Necesitas un momento para pensar?" (Need a moment to think?)
  - "Tranquilo, estoy aquí." (Relax, I'm here.)`,
    fr: `  - "Prenez votre temps, il n'y a pas de presse." (Take your time, no rush.)
  - "Vous avez besoin d'un moment ?" (Need a moment?)
  - "Je suis là, pas de souci." (I'm here, no worries.)`,
    en: `  - "Take your time, no rush."
  - "Need a moment to think?"
  - "I'm right here, no worries."`,
    pt: `  - "Sem pressa, tome seu tempo." (No rush, take your time.)
  - "Precisa de um momento?" (Need a moment?)
  - "Estou aqui, sem problema." (I'm here, no problem.)`,
    de: `  - "Nehmen Sie sich Zeit." (Take your time.)
  - "Brauchen Sie einen Moment?" (Need a moment?)
  - "Ich bin hier, kein Problem." (I'm here, no problem.)`,
    it: `  - "Prenditi il tuo tempo." (Take your time.)
  - "Hai bisogno di un momento?" (Need a moment?)
  - "Sono qui, nessun problema." (I'm here, no problem.)`,
  };
  return prompts[language] || prompts.en;
}

function getResponseLengthForProficiency(proficiency: ProficiencyLevel): string {
  switch (proficiency) {
    case 'beginner':
      return '1 short sentence max, simple words';
    case 'elementary':
      return '1-2 short sentences, basic vocabulary';
    case 'intermediate':
      return '1-2 sentences, natural but clear';
    case 'advanced':
    case 'native':
      return '2-3 sentences max, natural speech';
    default:
      return '1-2 sentences';
  }
}

// =============================================================================
// First Message Templates
// =============================================================================

interface FirstMessageContext {
  voiceName: string;
  scenario: string;
  language: SupportedLanguage;
}

/**
 * Get a first message for the agent to start the conversation.
 *
 * Matches scenario ID keywords to specific greetings.
 * Falls back to natural conversational openers (NOT "how can I help you"
 * which sounds robotic and doesn't match real-world conversation).
 */
export function getFirstMessage(context: FirstMessageContext): string {
  const greetings: Record<SupportedLanguage, Record<string, string>> = {
    es: {
      cafe: `¡Hola! Bienvenido. ¿Qué te apetece tomar hoy?`,
      direction: `¡Hola! ¿Vas a algún sitio? Conozco bien esta zona.`,
      shopping: `¡Buenos días! Bienvenido a la tienda. ¿Buscas algo en especial?`,
      interview: `Buenos días. Por favor, siéntate. Cuéntame un poco sobre ti.`,
      meeting: `Buenos días a todos. Empecemos con la agenda de hoy.`,
      restaurant: `¡Buenas noches! Bienvenido. ¿Mesa para cuántos?`,
      hotel: `Buenas tardes. Bienvenido al hotel. ¿Tiene reservación?`,
      doctor: `Hola. Pase, por favor. ¿Cómo se siente hoy?`,
      default: `¡Hola! Soy ${context.voiceName}. ¿Qué tal? ¿Cómo estás?`,
    },
    fr: {
      cafe: `Bonjour ! Bienvenue. Qu'est-ce que je vous sers aujourd'hui ?`,
      direction: `Bonjour ! Vous cherchez votre chemin ? Je connais bien le quartier.`,
      shopping: `Bonjour ! Bienvenue dans notre boutique. Vous cherchez quelque chose ?`,
      interview: `Bonjour. Installez-vous, je vous en prie. Parlez-moi un peu de vous.`,
      meeting: `Bonjour à tous. On commence la réunion ?`,
      restaurant: `Bonsoir ! Bienvenue. Vous avez réservé ?`,
      hotel: `Bonjour. Bienvenue à l'hôtel. Vous avez une réservation ?`,
      doctor: `Bonjour. Entrez, je vous en prie. Comment vous sentez-vous ?`,
      default: `Bonjour ! Je suis ${context.voiceName}. Comment allez-vous aujourd'hui ?`,
    },
    pt: {
      cafe: `Olá! Bem-vindo. O que posso servir para você hoje?`,
      direction: `Oi! Procurando algum lugar? Conheço bem a região.`,
      shopping: `Bom dia! Bem-vindo à loja. Está procurando algo específico?`,
      interview: `Bom dia. Por favor, sente-se. Me conte um pouco sobre você.`,
      meeting: `Bom dia a todos. Vamos começar a reunião?`,
      restaurant: `Boa noite! Bem-vindo. Mesa para quantos?`,
      default: `Olá! Sou ${context.voiceName}. Tudo bem com você? Como vai?`,
    },
    en: {
      cafe: `Hi there! Welcome. What can I get you today?`,
      direction: `Hello! Looking for somewhere? I know this area well.`,
      shopping: `Good morning! Welcome to our store. Looking for anything in particular?`,
      interview: `Good morning. Please, have a seat. Tell me a bit about yourself.`,
      meeting: `Good morning everyone. Shall we get started?`,
      restaurant: `Good evening! Welcome. Do you have a reservation?`,
      hotel: `Good afternoon. Welcome to the hotel. Do you have a reservation?`,
      doctor: `Hello. Please come in. How are you feeling today?`,
      default: `Hey! I'm ${context.voiceName}. How are you doing today?`,
    },
    de: {
      default: `Hallo! Ich bin ${context.voiceName}. Wie geht es Ihnen heute?`,
    },
    it: {
      default: `Ciao! Sono ${context.voiceName}. Come stai oggi?`,
    },
  };

  const languageGreetings = greetings[context.language] || greetings.en;

  // Try to match scenario ID keywords to specific greetings
  const scenarioLower = context.scenario.toLowerCase();
  for (const [key, greeting] of Object.entries(languageGreetings)) {
    if (key !== 'default' && scenarioLower.includes(key)) {
      return greeting;
    }
  }

  return languageGreetings.default;
}

// =============================================================================
// Voice Validation
// =============================================================================

/**
 * Check if a voice has a valid ElevenLabs ID configured
 */
export function isVoiceConfigured(voice: ElevenLabsVoiceConfig): boolean {
  return (
    voice.elevenLabsVoiceId !== 'REPLACE_WITH_ACTUAL_ID' &&
    voice.elevenLabsVoiceId.length > 0
  );
}

/**
 * Get all configured voices (with valid ElevenLabs IDs)
 */
export function getConfiguredVoices(): ElevenLabsVoiceConfig[] {
  return ELEVENLABS_VOICES.filter(isVoiceConfigured);
}

/**
 * Check if ElevenLabs is properly configured
 */
export function isElevenLabsConfigured(): boolean {
  const apiKey = getElevenLabsApiKey();
  const agentId = getElevenLabsAgentId();
  const configuredVoices = getConfiguredVoices();

  return Boolean(apiKey && agentId && configuredVoices.length > 0);
}
