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
 * Voice IDs from user's ElevenLabs Voice Library - updated January 2026
 */
export const ELEVENLABS_VOICES: ElevenLabsVoiceConfig[] = [
  // ==========================================================================
  // English Voices (American)
  // ==========================================================================
  {
    id: 'en-US-daniel',
    name: 'Daniel',
    language: 'en',
    accent: 'en-american',
    flag: '🇺🇸',
    elevenLabsVoiceId: 'd6dMXDDMQ9zlhV3hOfx0',
    description: 'Clear American English voice - Male',
    gender: 'male',
    proficiencyLevels: ['beginner', 'elementary', 'intermediate', 'advanced'],
    tags: ['default', 'american', 'clear', 'male'],
  },
  {
    id: 'en-US-josh',
    name: 'Josh',
    language: 'en',
    accent: 'en-american',
    flag: '🇺🇸',
    elevenLabsVoiceId: 'Rsz5u2Huh1hPlPr0oxRQ',
    description: 'Friendly American English voice - Male',
    gender: 'male',
    proficiencyLevels: ['intermediate', 'advanced'],
    tags: ['american', 'friendly', 'male'],
  },
  {
    id: 'en-GB-bradley',
    name: 'Bradley',
    language: 'en',
    accent: 'en-british',
    flag: '🇬🇧',
    elevenLabsVoiceId: 'tczmcUWPAdiP3gKQPrv7',
    description: 'British English voice - Male',
    gender: 'male',
    proficiencyLevels: ['intermediate', 'advanced'],
    tags: ['british', 'male'],
  },
  {
    id: 'en-GB-british',
    name: 'British Voice',
    language: 'en',
    accent: 'en-british',
    flag: '🇬🇧',
    elevenLabsVoiceId: 'lcMyyd2HUfFzxdCaC4Ta',
    description: 'British English voice',
    gender: 'male',
    proficiencyLevels: ['beginner', 'elementary', 'intermediate', 'advanced'],
    tags: ['british'],
  },

  // ==========================================================================
  // Spanish Voices (Latin America)
  // ==========================================================================
  {
    id: 'es-LATAM-daniel',
    name: 'Daniel',
    language: 'es',
    accent: 'es-latam',
    flag: '🇲🇽',
    elevenLabsVoiceId: 'T7BErSAR6r6NDaGdTLKB',
    description: 'Spanish American voice - Male',
    gender: 'male',
    proficiencyLevels: ['beginner', 'elementary', 'intermediate', 'advanced'],
    tags: ['default', 'latam', 'male'],
  },
  {
    id: 'es-LATAM-lucas',
    name: 'Lucas',
    language: 'es',
    accent: 'es-latam',
    flag: '🇲🇽',
    elevenLabsVoiceId: 'YX5i6O5LlgNrFlUpGn1d',
    description: 'Spanish Latino voice - Male',
    gender: 'male',
    proficiencyLevels: ['intermediate', 'advanced'],
    tags: ['latam', 'latino', 'male'],
  },
  {
    id: 'es-LATAM-voice',
    name: 'Latino Voice',
    language: 'es',
    accent: 'es-latam',
    flag: '🇲🇽',
    elevenLabsVoiceId: 'zl7szWVBXnpgrJmAalgz',
    description: 'Spanish Latino voice',
    gender: 'male',
    proficiencyLevels: ['beginner', 'elementary', 'intermediate', 'advanced'],
    tags: ['latam', 'latino'],
  },

  // ==========================================================================
  // Spanish Voices (Spain)
  // ==========================================================================
  {
    id: 'es-ES-jesus',
    name: 'Jesús',
    language: 'es',
    accent: 'es-spain',
    flag: '🇪🇸',
    elevenLabsVoiceId: 'w0bwoKPMZRfwi8VMJpEx',
    description: 'Spanish (Spain) voice - Male',
    gender: 'male',
    proficiencyLevels: ['intermediate', 'advanced'],
    tags: ['spain', 'castilian', 'male'],
  },
  {
    id: 'es-ES-jesus-firm',
    name: 'Jesús (Firm)',
    language: 'es',
    accent: 'es-spain',
    flag: '🇪🇸',
    elevenLabsVoiceId: '5IDdqnXnlsZ1FCxoOFYg',
    description: 'Spanish (Spain) firm voice - Male',
    gender: 'male',
    proficiencyLevels: ['advanced'],
    tags: ['spain', 'firm', 'male'],
  },

  // ==========================================================================
  // French Voices
  // ==========================================================================
  {
    id: 'fr-FR-voice1',
    name: 'French Voice 1',
    language: 'fr',
    accent: 'fr-france',
    flag: '🇫🇷',
    elevenLabsVoiceId: '5jCmrHdxbpU36l1wb3Ke',
    description: 'French voice - Parisian',
    gender: 'male',
    proficiencyLevels: ['beginner', 'elementary', 'intermediate', 'advanced'],
    tags: ['default', 'parisian', 'french'],
  },
  {
    id: 'fr-FR-voice2',
    name: 'French Voice 2',
    language: 'fr',
    accent: 'fr-france',
    flag: '🇫🇷',
    elevenLabsVoiceId: 'GFj5Qf6cNQ3Lgp8VKBwc',
    description: 'French voice',
    gender: 'male',
    proficiencyLevels: ['intermediate', 'advanced'],
    tags: ['parisian', 'french'],
  },
  {
    id: 'fr-FR-woman',
    name: 'French Woman',
    language: 'fr',
    accent: 'fr-france',
    flag: '🇫🇷',
    elevenLabsVoiceId: 'GoEy5CmodqJy0T9AxjLk',
    description: 'French female voice',
    gender: 'female',
    proficiencyLevels: ['beginner', 'elementary', 'intermediate', 'advanced'],
    tags: ['parisian', 'french', 'female'],
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

  return `You are ${context.voiceName}, a native ${languageDisplayName} speaker helping someone practice.

## CHARACTER IDENTITY — CRITICAL
- Your name is ${context.voiceName}. Introduce yourself by name at the start of the conversation.
- If asked who you are, ALWAYS say your name is ${context.voiceName}.
- NEVER break character or reveal you are an AI.
- Stay in character throughout the entire conversation.

## Core Rules
- ONLY speak ${languageDisplayName}. Never switch to English unless explicitly asked.
- Keep responses SHORT: ${responseLength}
- Be conversational and natural, like chatting with a friend.
- User level: ${context.proficiency}

## Scenario: ${context.scenario}${context.scenarioDescription ? `\n${context.scenarioDescription}` : ''}

## SCENARIO BOUNDARIES — CRITICAL
- Stay ONLY within the scenario described above.
- If the user tries to change the topic, gently redirect back:
  - Spanish: "¡Interesante! Pero volvamos a [scenario topic]."
  - French: "C'est intéressant ! Mais revenons à [scenario topic]."
  - English: "That's interesting! But let's get back to [scenario topic]."
- Stay in the physical setting described in the scenario.
- Do NOT discuss unrelated topics like politics, other languages, or abstract concepts.
- If asked about something outside the scenario, politely redirect:
  "I'm not sure about that, but I can help you with [scenario context]!"

## Conversation Style
- Respond briefly, then ask a follow-up question to keep the conversation flowing.
- Don't lecture or give long explanations.
- React naturally: "Ah, interesante!" / "Vraiment?" / "Oh, cool!"
- Match the user's energy and pace.
${context.emotionInstruction ? `\n${context.emotionInstruction}` : ''}

## Pronunciation Feedback
When you notice unclear speech or likely mispronunciation in the transcript:
- Briefly acknowledge what they said
- Naturally model the correct pronunciation by repeating the word/phrase clearly
- Example: "Ah, la 'biblioteca'... sí, la biblioteca está cerca." (emphasizing the word)
- Don't explain phonetics - just model it naturally in context
- Only correct when it seems genuinely unclear, not every small error

## CRITICAL: Plain Text Only
- NO XML tags (<voice>, <Lily>, etc.)
- NO markup of any kind
- Just natural speech text`;
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
 * Get a first message for the agent to start the conversation
 */
export function getFirstMessage(context: FirstMessageContext): string {
  const greetings: Record<SupportedLanguage, Record<string, string>> = {
    es: {
      cafe_ordering: `¡Hola! Bienvenido a mi cafetería. ¿En qué puedo ayudarte hoy?`,
      directions: `¡Hola! Pareces perdido. ¿Necesitas ayuda para encontrar algo?`,
      shopping: `¡Buenos días! Bienvenido a la tienda. ¿Buscas algo en especial?`,
      job_interview: `Buenos días. Por favor, siéntate. Cuéntame un poco sobre ti.`,
      casual_chat: `¡Hola! ¿Qué tal? ¿Cómo está yendo tu día?`,
      default: `¡Hola! Soy ${context.voiceName}. ¿En qué puedo ayudarte?`,
    },
    fr: {
      cafe_ordering: `Bonjour ! Bienvenue dans mon café. Qu'est-ce que je vous sers ?`,
      directions: `Bonjour ! Vous avez l'air perdu. Je peux vous aider ?`,
      shopping: `Bonjour ! Bienvenue dans notre boutique. Vous cherchez quelque chose ?`,
      job_interview: `Bonjour. Installez-vous. Parlez-moi un peu de vous.`,
      casual_chat: `Salut ! Ça va ? Comment se passe ta journée ?`,
      default: `Bonjour ! Je suis ${context.voiceName}. Comment puis-je vous aider ?`,
    },
    pt: {
      cafe_ordering: `Olá! Bem-vindo ao meu café. O que posso servir para você?`,
      directions: `Oi! Você parece perdido. Posso ajudar a encontrar algo?`,
      shopping: `Bom dia! Bem-vindo à loja. Está procurando algo específico?`,
      job_interview: `Bom dia. Por favor, sente-se. Me conte um pouco sobre você.`,
      casual_chat: `Oi! Tudo bem? Como está sendo seu dia?`,
      default: `Olá! Sou ${context.voiceName}. Como posso ajudá-lo?`,
    },
    en: {
      cafe_ordering: `Hi there! Welcome to my café. What can I get for you today?`,
      directions: `Hello! You look a bit lost. Can I help you find something?`,
      shopping: `Good morning! Welcome to our store. Looking for anything in particular?`,
      job_interview: `Good morning. Please, have a seat. Tell me a bit about yourself.`,
      casual_chat: `Hey! How's it going? How's your day been?`,
      default: `Hi! I'm ${context.voiceName}. How can I help you?`,
    },
    de: {
      default: `Hallo! Ich bin ${context.voiceName}. Wie kann ich Ihnen helfen?`,
    },
    it: {
      default: `Ciao! Sono ${context.voiceName}. Come posso aiutarti?`,
    },
  };

  const languageGreetings = greetings[context.language] || greetings.en;
  return languageGreetings[context.scenario] || languageGreetings.default;
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
