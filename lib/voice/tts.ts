/**
 * Text-to-Speech Service
 *
 * Free TTS using expo-speech (device native voices).
 * Works offline, no API costs, supports multiple languages.
 *
 * Features:
 * - Character voice presets (rate, pitch adjustments)
 * - Multi-language support (Spanish, English, etc.)
 * - Queue management for sequential speech
 * - Voice availability detection
 *
 * @example
 * ```typescript
 * import { tts } from '@/lib/voice';
 *
 * // Simple usage
 * await tts.speak({ text: 'Hola, ¿cómo estás?', language: 'es' });
 *
 * // With character voice
 * await tts.speak({
 *   text: 'Buenos días!',
 *   character: DEFAULT_CHARACTERS.find(c => c.id === 'maria'),
 * });
 *
 * // Slow speed for learning
 * await tts.speakSlow({ text: 'La estación de tren', language: 'es' });
 * ```
 */

import * as Speech from 'expo-speech';
import {
  TTSOptions,
  TTSVoice,
  SupportedLanguage,
  CharacterVoice,
  LANGUAGE_CONFIGS,
  DEFAULT_CHARACTERS,
} from './types';

// =============================================================================
// TTS Service Class
// =============================================================================

class TTSService {
  private isSpeakingFlag = false;
  private speechQueue: TTSOptions[] = [];
  private isProcessingQueue = false;
  private availableVoices: Map<string, TTSVoice[]> = new Map();

  constructor() {
    // Pre-fetch available voices on init
    this.loadAvailableVoices();
  }

  /**
   * Load available voices from the device
   */
  private async loadAvailableVoices(): Promise<void> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();

      // Group by language
      for (const voice of voices) {
        const langCode = voice.language.split('-')[0].toLowerCase();
        const existing = this.availableVoices.get(langCode) || [];
        existing.push({
          identifier: voice.identifier,
          name: voice.name,
          language: voice.language,
          quality: voice.quality === Speech.VoiceQuality.Enhanced ? 'enhanced' : 'default',
        });
        this.availableVoices.set(langCode, existing);
      }
    } catch (error) {
      console.warn('[TTS] Failed to load available voices:', error);
    }
  }

  /**
   * Get available voices for a language
   */
  async getAvailableVoices(language?: SupportedLanguage): Promise<TTSVoice[]> {
    if (this.availableVoices.size === 0) {
      await this.loadAvailableVoices();
    }

    if (language) {
      return this.availableVoices.get(language) || [];
    }

    // Return all voices
    const allVoices: TTSVoice[] = [];
    this.availableVoices.forEach(voices => allVoices.push(...voices));
    return allVoices;
  }

  /**
   * Get the best voice for a language
   */
  private async getBestVoice(language: SupportedLanguage): Promise<string | undefined> {
    const config = LANGUAGE_CONFIGS[language];
    if (!config) return undefined;

    const voices = await this.getAvailableVoices(language);
    if (voices.length === 0) return undefined;

    // Prefer enhanced quality voices
    const enhanced = voices.find(v => v.quality === 'enhanced');
    if (enhanced) return enhanced.identifier;

    // Try to match preferred locale
    const localeMatch = voices.find(v =>
      v.language.toLowerCase() === config.ttsLocale.toLowerCase()
    );
    if (localeMatch) return localeMatch.identifier;

    // Fallback to any voice for this language
    return voices[0]?.identifier;
  }

  /**
   * Speak text with options
   */
  async speak(options: TTSOptions): Promise<void> {
    const {
      text,
      language = 'es',
      rate = 1.0,
      pitch = 1.0,
      volume = 1.0,
      character,
      onStart,
      onDone,
      onError,
    } = options;

    if (!text || text.trim().length === 0) {
      onDone?.();
      return;
    }

    // Apply character voice settings if provided
    let finalRate = rate;
    let finalPitch = pitch;
    let finalLanguage = language;

    if (character) {
      finalRate = character.tts.rate * rate;
      finalPitch = character.tts.pitch * pitch;
      finalLanguage = character.language;
    }

    // Clamp values to valid ranges
    finalRate = Math.max(0.1, Math.min(2.0, finalRate));
    finalPitch = Math.max(0.5, Math.min(2.0, finalPitch));

    // Get language config
    const langConfig = LANGUAGE_CONFIGS[finalLanguage];
    const locale = langConfig?.ttsLocale || `${finalLanguage}-${finalLanguage.toUpperCase()}`;

    return new Promise<void>((resolve, reject) => {
      this.isSpeakingFlag = true;
      onStart?.();

      Speech.speak(text, {
        language: locale,
        rate: finalRate,
        pitch: finalPitch,
        volume,
        voice: character?.tts.preferredVoice,
        onStart: () => {
          this.isSpeakingFlag = true;
        },
        onDone: () => {
          this.isSpeakingFlag = false;
          onDone?.();
          resolve();
        },
        onError: (error) => {
          this.isSpeakingFlag = false;
          const err = new Error(`TTS Error: ${error.message || 'Unknown error'}`);
          onError?.(err);
          reject(err);
        },
        onStopped: () => {
          this.isSpeakingFlag = false;
          resolve();
        },
      });
    });
  }

  /**
   * Speak text at slow speed (0.5x) - great for learners
   */
  async speakSlow(options: Omit<TTSOptions, 'rate'>): Promise<void> {
    return this.speak({ ...options, rate: 0.5 });
  }

  /**
   * Speak text at normal speed
   */
  async speakNormal(options: Omit<TTSOptions, 'rate'>): Promise<void> {
    return this.speak({ ...options, rate: 1.0 });
  }

  /**
   * Speak with a specific character voice
   */
  async speakAsCharacter(text: string, characterId: string): Promise<void> {
    const character = DEFAULT_CHARACTERS.find(c => c.id === characterId);
    if (!character) {
      console.warn(`[TTS] Character not found: ${characterId}`);
      return this.speak({ text });
    }
    return this.speak({ text, character });
  }

  /**
   * Stop all speech
   */
  async stop(): Promise<void> {
    this.speechQueue = [];
    this.isSpeakingFlag = false;
    await Speech.stop();
  }

  /**
   * Check if currently speaking
   */
  async isSpeaking(): Promise<boolean> {
    const speaking = await Speech.isSpeakingAsync();
    this.isSpeakingFlag = speaking;
    return speaking;
  }

  /**
   * Queue speech for sequential playback
   */
  queueSpeak(options: TTSOptions): void {
    this.speechQueue.push(options);
    this.processQueue();
  }

  /**
   * Process the speech queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;

    while (this.speechQueue.length > 0) {
      const options = this.speechQueue.shift();
      if (options) {
        try {
          await this.speak(options);
        } catch (error) {
          console.error('[TTS] Queue item failed:', error);
        }
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Speak a word with its translation (useful for vocabulary cards)
   */
  async speakWordAndTranslation(
    word: string,
    wordLanguage: SupportedLanguage,
    translation: string,
    translationLanguage: SupportedLanguage,
    delayMs = 500
  ): Promise<void> {
    // Speak the word
    await this.speak({ text: word, language: wordLanguage });

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, delayMs));

    // Speak the translation
    await this.speak({ text: translation, language: translationLanguage });
  }

  /**
   * Get a character by ID
   */
  getCharacter(characterId: string): CharacterVoice | undefined {
    return DEFAULT_CHARACTERS.find(c => c.id === characterId);
  }

  /**
   * Get all characters for a language
   */
  getCharactersForLanguage(language: SupportedLanguage): CharacterVoice[] {
    return DEFAULT_CHARACTERS.filter(c => c.language === language);
  }
}

// =============================================================================
// Singleton Export
// =============================================================================

export const tts = new TTSService();

// Also export individual functions for convenience
export const speak = tts.speak.bind(tts);
export const speakSlow = tts.speakSlow.bind(tts);
export const speakNormal = tts.speakNormal.bind(tts);
export const speakAsCharacter = tts.speakAsCharacter.bind(tts);
export const stopSpeaking = tts.stop.bind(tts);
export const isSpeaking = tts.isSpeaking.bind(tts);
export const getCharacter = tts.getCharacter.bind(tts);
export const getCharactersForLanguage = tts.getCharactersForLanguage.bind(tts);
