/**
 * Language Character Data
 *
 * Defines conversation partner characters for each supported language.
 * Each character has:
 * - Unique avatar (generated with Gemini/Imagen)
 * - ElevenLabs voice ID for speech synthesis
 * - Personality traits for AI conversation context
 */

export type SupportedLanguage = 'spanish' | 'french' | 'german' | 'italian' | 'portuguese';

export interface LanguageCharacter {
  id: string;
  name: string;
  language: SupportedLanguage;
  gender: 'male' | 'female';
  // Avatar will be a require() path or URI
  avatarPlaceholder: string; // Color placeholder until real avatars generated
  // ElevenLabs voice ID (to be configured)
  voiceId?: string;
  // Personality for AI context
  personality: string;
  greeting: string;
}

// =============================================================================
// Spanish Characters
// =============================================================================

const SPANISH_CHARACTERS: LanguageCharacter[] = [
  {
    id: 'spanish-female',
    name: 'Sofía',
    language: 'spanish',
    gender: 'female',
    avatarPlaceholder: '#E8B4B8', // Warm rose
    voiceId: undefined, // TODO: Add ElevenLabs voice ID
    personality:
      'Warm and encouraging teacher from Madrid. Patient with beginners, celebrates every small victory.',
    greeting: '¡Hola! Soy Sofía, tu compañera de conversación. ¿Cómo estás hoy?',
  },
  {
    id: 'spanish-male',
    name: 'Carlos',
    language: 'spanish',
    gender: 'male',
    avatarPlaceholder: '#B4C7E8', // Cool blue
    voiceId: undefined,
    personality:
      'Friendly café owner from Mexico City. Uses lots of everyday expressions and slang.',
    greeting: '¡Qué onda! Soy Carlos. Vamos a platicar un rato, ¿va?',
  },
];

// =============================================================================
// French Characters
// =============================================================================

const FRENCH_CHARACTERS: LanguageCharacter[] = [
  {
    id: 'french-female',
    name: 'Amélie',
    language: 'french',
    gender: 'female',
    avatarPlaceholder: '#E8D4B4', // Warm beige
    voiceId: undefined,
    personality:
      'Parisian art student. Cultured and sophisticated, loves discussing food, art, and travel.',
    greeting: 'Bonjour ! Je suis Amélie. Ravie de faire ta connaissance !',
  },
  {
    id: 'french-male',
    name: 'Pierre',
    language: 'french',
    gender: 'male',
    avatarPlaceholder: '#B4E8D4', // Sage green
    voiceId: undefined,
    personality:
      'Wine sommelier from Bordeaux. Passionate about French culture and traditions.',
    greeting: 'Salut ! Moi c\'est Pierre. Comment allez-vous ?',
  },
];

// =============================================================================
// German Characters
// =============================================================================

const GERMAN_CHARACTERS: LanguageCharacter[] = [
  {
    id: 'german-female',
    name: 'Anna',
    language: 'german',
    gender: 'female',
    avatarPlaceholder: '#E8E4B4', // Soft yellow
    voiceId: undefined,
    personality:
      'Engineering student from Munich. Direct and efficient, but with a warm heart.',
    greeting: 'Hallo! Ich bin Anna. Freut mich, dich kennenzulernen!',
  },
  {
    id: 'german-male',
    name: 'Markus',
    language: 'german',
    gender: 'male',
    avatarPlaceholder: '#D4B4E8', // Soft purple
    voiceId: undefined,
    personality:
      'Music producer from Berlin. Creative and open-minded, loves discussing music and technology.',
    greeting: 'Hey! Ich bin Markus. Lass uns quatschen!',
  },
];

// =============================================================================
// Italian Characters
// =============================================================================

const ITALIAN_CHARACTERS: LanguageCharacter[] = [
  {
    id: 'italian-female',
    name: 'Giulia',
    language: 'italian',
    gender: 'female',
    avatarPlaceholder: '#E8B4D4', // Soft pink
    voiceId: undefined,
    personality:
      'Fashion designer from Milan. Expressive and animated, uses lots of hand gestures (virtually!).',
    greeting: 'Ciao bella! Sono Giulia. Come stai oggi?',
  },
  {
    id: 'italian-male',
    name: 'Marco',
    language: 'italian',
    gender: 'male',
    avatarPlaceholder: '#B4D4E8', // Sky blue
    voiceId: undefined,
    personality:
      'Chef from Rome. Passionate about food and family, loves sharing recipes and stories.',
    greeting: 'Ciao! Mi chiamo Marco. Piacere di conoscerti!',
  },
];

// =============================================================================
// Portuguese Characters
// =============================================================================

const PORTUGUESE_CHARACTERS: LanguageCharacter[] = [
  {
    id: 'portuguese-female',
    name: 'Lúcia',
    language: 'portuguese',
    gender: 'female',
    avatarPlaceholder: '#E8D4C4', // Warm peach
    voiceId: undefined,
    personality:
      'Dance instructor from Rio de Janeiro. Energetic and fun, brings Brazilian warmth to every conversation.',
    greeting: 'Oi! Eu sou a Lúcia. Tudo bem com você?',
  },
  {
    id: 'portuguese-male',
    name: 'Rafael',
    language: 'portuguese',
    gender: 'male',
    avatarPlaceholder: '#C4E8D4', // Mint green
    voiceId: undefined,
    personality:
      'Surf instructor from Lisbon. Laid-back and philosophical, loves talking about nature and adventure.',
    greeting: 'E aí! Sou o Rafael. Vamos bater um papo?',
  },
];

// =============================================================================
// Combined Character Map
// =============================================================================

export const LANGUAGE_CHARACTERS: Record<SupportedLanguage, LanguageCharacter[]> = {
  spanish: SPANISH_CHARACTERS,
  french: FRENCH_CHARACTERS,
  german: GERMAN_CHARACTERS,
  italian: ITALIAN_CHARACTERS,
  portuguese: PORTUGUESE_CHARACTERS,
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get all characters for a language
 */
export function getCharactersForLanguage(
  language: SupportedLanguage
): LanguageCharacter[] {
  return LANGUAGE_CHARACTERS[language] || [];
}

/**
 * Get a specific character by ID
 */
export function getCharacterById(characterId: string): LanguageCharacter | undefined {
  for (const characters of Object.values(LANGUAGE_CHARACTERS)) {
    const found = characters.find((c) => c.id === characterId);
    if (found) return found;
  }
  return undefined;
}

/**
 * Get default character for a language (first female character)
 */
export function getDefaultCharacter(
  language: SupportedLanguage
): LanguageCharacter | undefined {
  const characters = LANGUAGE_CHARACTERS[language];
  return characters?.find((c) => c.gender === 'female') || characters?.[0];
}

/**
 * Get all supported languages
 */
export function getSupportedLanguages(): SupportedLanguage[] {
  return Object.keys(LANGUAGE_CHARACTERS) as SupportedLanguage[];
}

/**
 * Get all characters across all languages
 */
export function getAllCharacters(): LanguageCharacter[] {
  return Object.values(LANGUAGE_CHARACTERS).flat();
}
