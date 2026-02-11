/**
 * Voice System Types
 *
 * Core type definitions for the Vox voice system including:
 * - TTS (Text-to-Speech) for cards and UI
 * - STT (Speech-to-Text) for user input
 * - Voice Conversations (Gemini Live API)
 */

// =============================================================================
// Language & Voice Configuration
// =============================================================================

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt';

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  /** BCP 47 locale for TTS (e.g., 'es-ES', 'es-MX') */
  ttsLocale: string;
  /** Alternative locales to try if primary not available */
  fallbackLocales: string[];
}

export const LANGUAGE_CONFIGS: Record<SupportedLanguage, LanguageConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    ttsLocale: 'en-US',
    fallbackLocales: ['en-GB', 'en-AU', 'en'],
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    ttsLocale: 'es-ES',
    fallbackLocales: ['es-MX', 'es-419', 'es'],
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    ttsLocale: 'fr-FR',
    fallbackLocales: ['fr-CA', 'fr'],
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    ttsLocale: 'de-DE',
    fallbackLocales: ['de-AT', 'de'],
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    ttsLocale: 'it-IT',
    fallbackLocales: ['it'],
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    ttsLocale: 'pt-BR',
    fallbackLocales: ['pt-PT', 'pt'],
  },
};

// =============================================================================
// Character Voice System
// =============================================================================

export interface CharacterVoice {
  id: string;
  name: string;
  description: string;
  language: SupportedLanguage;
  /** Voice personality traits for AI prompts */
  personality: string[];
  /** TTS settings */
  tts: {
    /** Speech rate (0.5 = slow, 1.0 = normal, 1.5 = fast) */
    rate: number;
    /** Pitch adjustment (0.5 = low, 1.0 = normal, 1.5 = high) */
    pitch: number;
    /** Preferred voice identifier (platform-specific) */
    preferredVoice?: string;
  };
  /** Avatar/image for UI */
  avatarEmoji?: string;
  /** Gemini Live voice name */
  geminiVoice?: GeminiVoiceName;
  /** Accent for the voice */
  accent?: AccentType;
}

// =============================================================================
// Gemini Live Voice & Accent System
// =============================================================================

/** All 8 available Gemini Live voices */
export type GeminiVoiceName =
  | 'Puck'    // Male, casual
  | 'Charon'  // Male, deep
  | 'Kore'    // Female, warm
  | 'Fenrir'  // Male, energetic
  | 'Aoede'   // Female, professional
  | 'Leda'    // Female, friendly
  | 'Orus'    // Male, calm
  | 'Zephyr'; // Neutral, light

export interface GeminiVoiceInfo {
  id: GeminiVoiceName;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  style: string;
  description: string;
}

export const GEMINI_VOICES: GeminiVoiceInfo[] = [
  { id: 'Kore', name: 'Kore', gender: 'female', style: 'warm', description: 'Warm and encouraging' },
  { id: 'Aoede', name: 'Aoede', gender: 'female', style: 'professional', description: 'Clear and professional' },
  { id: 'Leda', name: 'Leda', gender: 'female', style: 'friendly', description: 'Friendly and approachable' },
  { id: 'Puck', name: 'Puck', gender: 'male', style: 'casual', description: 'Casual and relaxed' },
  { id: 'Charon', name: 'Charon', gender: 'male', style: 'deep', description: 'Deep and authoritative' },
  { id: 'Fenrir', name: 'Fenrir', gender: 'male', style: 'energetic', description: 'Energetic and dynamic' },
  { id: 'Orus', name: 'Orus', gender: 'male', style: 'calm', description: 'Calm and patient' },
  { id: 'Zephyr', name: 'Zephyr', gender: 'neutral', style: 'light', description: 'Light and adaptable' },
];

/** Supported accent types */
export type AccentType =
  | 'es-latam'   // Spanish - Latin America (Mexico, Colombia, etc.)
  | 'es-spain'   // Spanish - Spain (Castilian)
  | 'fr-france'  // French - France
  | 'fr-canada'  // French - Canada (Québécois)
  | 'en-british' // English - British (RP)
  | 'en-american' // English - American (General)
  | 'en-australian' // English - Australian
  | 'pt-brazil'  // Portuguese - Brazil
  | 'pt-portugal'; // Portuguese - Portugal

export interface AccentInfo {
  id: AccentType;
  name: string;
  flag: string;
  language: SupportedLanguage;
  promptInstruction: string;
}

export const ACCENT_OPTIONS: AccentInfo[] = [
  {
    id: 'es-latam',
    name: 'Latin American Spanish',
    flag: '🇲🇽',
    language: 'es',
    promptInstruction: `Speak Spanish with a clear Latin American accent, similar to Mexican or Colombian Spanish. Use "ustedes" instead of "vosotros". Be warm and expressive.`,
  },
  {
    id: 'es-spain',
    name: 'Spanish (Spain)',
    flag: '🇪🇸',
    language: 'es',
    promptInstruction: `Speak Spanish with a Castilian accent from Spain. Use "vosotros" and the distinción (pronounce "c" before "e/i" as "th"). Be energetic and direct.`,
  },
  {
    id: 'fr-france',
    name: 'French (France)',
    flag: '🇫🇷',
    language: 'fr',
    promptInstruction: `Speak French with a Parisian accent. Use formal French pronunciation with proper liaison. Be elegant and precise.`,
  },
  {
    id: 'fr-canada',
    name: 'French (Canada)',
    flag: '🇨🇦',
    language: 'fr',
    promptInstruction: `Speak French with a Québécois accent. Use Canadian French expressions and pronunciation. Be friendly and casual.`,
  },
  {
    id: 'en-british',
    name: 'British English',
    flag: '🇬🇧',
    language: 'en',
    promptInstruction: `Speak English with a British RP (Received Pronunciation) accent. Use British vocabulary (lift, flat, rubbish) and expressions. Be polite and articulate.`,
  },
  {
    id: 'en-american',
    name: 'American English',
    flag: '🇺🇸',
    language: 'en',
    promptInstruction: `Speak English with a General American accent. Use American vocabulary (elevator, apartment, trash) and expressions. Be friendly and clear.`,
  },
  {
    id: 'en-australian',
    name: 'Australian English',
    flag: '🇦🇺',
    language: 'en',
    promptInstruction: `Speak English with an Australian accent. Use Australian slang occasionally (mate, no worries, arvo). Be laid-back and friendly.`,
  },
  {
    id: 'pt-brazil',
    name: 'Brazilian Portuguese',
    flag: '🇧🇷',
    language: 'pt',
    promptInstruction: `Speak Portuguese with a Brazilian accent. Use Brazilian vocabulary and expressions. Be warm and animated.`,
  },
  {
    id: 'pt-portugal',
    name: 'European Portuguese',
    flag: '🇵🇹',
    language: 'pt',
    promptInstruction: `Speak Portuguese with a European Portuguese accent. Use Portuguese vocabulary from Portugal. Be clear and formal.`,
  },
];

/** Get accent options for a specific language */
export function getAccentsForLanguage(language: SupportedLanguage): AccentInfo[] {
  return ACCENT_OPTIONS.filter(a => a.language === language);
}

/** Get default accent for a language */
export function getDefaultAccent(language: SupportedLanguage): AccentType {
  const defaults: Record<SupportedLanguage, AccentType> = {
    es: 'es-latam',
    fr: 'fr-france',
    en: 'en-american',
    pt: 'pt-brazil',
    de: 'en-american', // No German accent yet, fallback
    it: 'en-american', // No Italian accent yet, fallback
  };
  return defaults[language];
}

// Default character voices for scenarios
// Names match ElevenLabs voice IDs for consistency
export const DEFAULT_CHARACTERS: CharacterVoice[] = [
  // ==========================================================================
  // Spanish Characters (Mexican voices)
  // ==========================================================================
  {
    id: 'camila',
    name: 'Camila',
    description: 'Warm and inviting - perfect for café, restaurant, and social scenarios',
    language: 'es',
    personality: ['warm', 'inviting', 'patient', 'encouraging'],
    tts: { rate: 0.9, pitch: 1.1 },
    avatarEmoji: '👩🏽',
    accent: 'es-latam',
  },
  {
    id: 'enrique',
    name: 'Enrique',
    description: 'Elegant and dynamic - great for professional and formal scenarios',
    language: 'es',
    personality: ['elegant', 'dynamic', 'professional', 'articulate'],
    tts: { rate: 0.95, pitch: 0.9 },
    avatarEmoji: '👨🏻',
    accent: 'es-latam',
  },

  // ==========================================================================
  // English Characters (American voices)
  // ==========================================================================
  {
    id: 'ava',
    name: 'Ava',
    description: 'Eager and helpful - natural conversational style for all scenarios',
    language: 'en',
    personality: ['helpful', 'understanding', 'clear', 'encouraging'],
    tts: { rate: 0.95, pitch: 1.05 },
    avatarEmoji: '👩🏼',
    accent: 'en-american',
  },
  {
    id: 'ivanna',
    name: 'Ivanna',
    description: 'Expressive and articulate - casual "girl next door" for social scenarios',
    language: 'en',
    personality: ['expressive', 'bold', 'friendly', 'casual'],
    tts: { rate: 1.0, pitch: 1.0 },
    avatarEmoji: '👩🏻',
    accent: 'en-american',
  },

  // ==========================================================================
  // French Characters (Parisian voices)
  // ==========================================================================
  {
    id: 'jeanne',
    name: 'Jeanne',
    description: 'Professional narrator - clear Parisian French for all skill levels',
    language: 'fr',
    personality: ['professional', 'clear', 'patient', 'articulate'],
    tts: { rate: 0.9, pitch: 1.0 },
    avatarEmoji: '👩🏻',
    accent: 'fr-france',
  },
  {
    id: 'jade',
    name: 'Jade',
    description: 'Elegant and sophisticated - perfect for formal French practice',
    language: 'fr',
    personality: ['elegant', 'sophisticated', 'refined', 'charming'],
    tts: { rate: 0.85, pitch: 1.05 },
    avatarEmoji: '👩🏽',
    accent: 'fr-france',
  },
];

// =============================================================================
// TTS (Text-to-Speech) Types
// =============================================================================

export interface TTSOptions {
  /** Text to speak */
  text: string;
  /** Language code */
  language?: SupportedLanguage;
  /** Speech rate (0.1 to 2.0, default 1.0) */
  rate?: number;
  /** Pitch (0.5 to 2.0, default 1.0) */
  pitch?: number;
  /** Volume (0.0 to 1.0, default 1.0) */
  volume?: number;
  /** Character voice preset */
  character?: CharacterVoice;
  /** Callback when speech starts */
  onStart?: () => void;
  /** Callback when speech completes */
  onDone?: () => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

export interface TTSVoice {
  identifier: string;
  name: string;
  language: string;
  quality: 'default' | 'enhanced';
}

// =============================================================================
// Voice Conversation Types (Gemini Live)
// =============================================================================

export interface VoiceScenario {
  id: string;
  title: string;
  description: string;
  /** Context for the AI */
  context: string;
  /** AI's role description */
  aiRole: string;
  /** Learning objectives */
  objectives: string[];
  // Optional fields (used by specific providers or generated scenarios)
  language?: SupportedLanguage;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  category?: 'travel' | 'food' | 'shopping' | 'social' | 'professional' | 'emergency';
  /** Character for this scenario (Gemini path) */
  characterId?: string;
  /** User's role description */
  userRole?: string;
  /** Suggested phrases to use */
  suggestedPhrases?: string[];
  /** System prompt template for AI (Gemini path) */
  systemPromptTemplate?: string;
  /** Key vocabulary for this scenario (from scenario generator) */
  keyVocabulary?: string[];
  /** Suggested duration in seconds */
  suggestedDuration?: number;
  /** Stair step this scenario was generated for */
  stairStepId?: string;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  /** Unix timestamp in milliseconds */
  timestamp: number;
  /** Audio data if voice message */
  audioData?: string;
  /** Transcript if from speech */
  transcript?: string;
}

export interface ConversationState {
  status: 'idle' | 'connecting' | 'listening' | 'processing' | 'speaking' | 'error';
  messages: ConversationMessage[];
  currentScenario?: VoiceScenario;
  currentCharacter?: CharacterVoice;
  sessionDuration: number;
  turnCount: number;
  latencyMs?: number;
  error?: string;
}

export interface ConversationResult {
  scenario: VoiceScenario;
  messages: ConversationMessage[];
  duration: number;
  turnCount: number;
  objectivesCompleted: string[];
  feedback?: string;
}

// =============================================================================
// Audio Recording Types
// =============================================================================

export interface AudioRecordingOptions {
  /** Sample rate in Hz (default 16000 for Gemini) */
  sampleRate?: number;
  /** Number of channels (1 = mono, 2 = stereo) */
  channels?: number;
  /** Bit depth (default 16) */
  bitDepth?: number;
  /** Max recording duration in ms */
  maxDuration?: number;
  /** Callback with audio level (0-1) for visualization */
  onAudioLevel?: (level: number) => void;
}

export interface AudioRecording {
  uri: string;
  duration: number;
  format: string;
}

// =============================================================================
// Voice Provider Interface (for swapping implementations)
// =============================================================================

export interface VoiceProvider {
  name: 'expo-speech' | 'gemini-live' | 'elevenlabs';

  // TTS
  speak(options: TTSOptions): Promise<void>;
  stop(): Promise<void>;
  isSpeaking(): Promise<boolean>;
  getAvailableVoices(language?: SupportedLanguage): Promise<TTSVoice[]>;

  // STT (optional - not all providers support)
  startListening?(): Promise<void>;
  stopListening?(): Promise<string>;

  // Conversation (optional - only Gemini Live)
  startConversation?(scenario: VoiceScenario): Promise<void>;
  endConversation?(): Promise<ConversationResult>;
  sendAudio?(audioData: ArrayBuffer): void;
  onMessage?(callback: (message: ConversationMessage) => void): void;
}
