/**
 * Voice System - Main Exports
 *
 * Unified voice system for Vox Language App including:
 * - TTS (Text-to-Speech) for cards and UI - FREE via expo-speech
 * - Character voices for roleplay scenarios
 * - Voice conversation system (Gemini Live API)
 * - Audio recording and playback utilities
 *
 * @example
 * ```typescript
 * import { tts, speak, speakSlow, getCharacter } from '@/lib/voice';
 *
 * // Simple TTS
 * await speak({ text: 'Hola!', language: 'es' });
 *
 * // Slow for learners
 * await speakSlow({ text: 'Buenos días', language: 'es' });
 *
 * // With character voice
 * const maria = getCharacter('maria');
 * await tts.speak({ text: 'Bienvenido!', character: maria });
 * ```
 */

// Types
export * from './types';

// TTS Service (free, uses device voices)
export {
  tts,
  speak,
  speakSlow,
  speakNormal,
  speakAsCharacter,
  stopSpeaking,
  isSpeaking,
  getCharacter,
  getCharactersForLanguage,
} from './tts';

// Google Cloud TTS (high-quality neural voices with expo-speech fallback)
export {
  googleTTS,
  speakWithGoogle,
  speakSlowWithGoogle,
  stopGoogleTTS,
  isGoogleTTSAvailable,
  type GoogleTTSOptions,
} from './googleTTS';

// TTS Audio Cache (hybrid local + cloud caching)
export {
  ttsCache,
  getCachedAudio,
  saveToCache,
  preloadWords,
  clearTTSCache,
  getTTSCacheStats,
  generateCacheKey,
  detectContentType,
  type CacheEntry,
  type CacheStats,
  type ContentType,
} from './ttsCache';

// Re-export default characters and voice/accent configs for convenience
export {
  DEFAULT_CHARACTERS,
  LANGUAGE_CONFIGS,
  GEMINI_VOICES,
  ACCENT_OPTIONS,
  getAccentsForLanguage,
  getDefaultAccent,
  type GeminiVoiceName,
  type GeminiVoiceInfo,
  type AccentType,
  type AccentInfo,
} from './types';

// Scenarios for roleplay conversations
export {
  SPANISH_SCENARIOS,
  ENGLISH_SCENARIOS,
  ALL_SCENARIOS,
  getScenariosForLanguage,
  getScenariosByDifficulty,
  getScenariosByCategory,
  getScenarioById,
  getCategoriesForLanguage,
  generateSystemPrompt,
} from './scenarios';

// Gemini Live API Client (real-time voice conversations)
export {
  GeminiLiveClient,
  createGeminiLiveClient,
  createSimpleConversationClient,
  type GeminiVoice,
  type GeminiLiveConfig,
} from './geminiLive';

// Audio Recording (for voice input)
export {
  AudioRecorder,
  getAudioRecorder,
  createAudioRecorder,
} from './audioRecorder';

// Audio Playback (for AI responses)
export {
  AudioPlayer,
  getAudioPlayer,
  createAudioPlayer,
  type AudioPlaybackOptions,
} from './audioPlayer';

// Hybrid Voice Conversation (cost-effective: Whisper + Gemini Text + TTS)
export {
  HybridVoiceConversation,
  createHybridConversation,
  createSimpleConversation,
  createMockConversation,
  type ConversationMode,
  type ConversationStatus,
  type HybridConversationConfig,
  type ProcessAudioResult,
} from './hybridConversation';

// Seed Vocabulary for TTS Cache Pre-population
export {
  SEED_VOCABULARY,
  getSeedContent,
  getSeedWordCount,
  getSeedPhraseCount,
  getTotalSeedCount,
  type SeedVocabulary,
} from './seedVocabulary';
