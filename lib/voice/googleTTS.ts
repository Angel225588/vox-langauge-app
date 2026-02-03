/**
 * Google Cloud Text-to-Speech Service
 *
 * High-quality neural TTS using Google Cloud API.
 * Falls back to expo-speech (device native) if API fails.
 *
 * Pricing: ~$16/1M characters for Neural voices
 *
 * @example
 * ```typescript
 * import { googleTTS } from '@/lib/voice';
 *
 * // Simple usage
 * await googleTTS.speak({
 *   text: 'Bonjour, comment allez-vous?',
 *   language: 'fr',
 * });
 *
 * // With slow speed for learning
 * await googleTTS.speak({
 *   text: 'La estación de tren',
 *   language: 'es',
 *   rate: 0.7,
 * });
 * ```
 */

import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system/legacy';
import { SupportedLanguage, LANGUAGE_CONFIGS } from './types';
import { ttsCache } from './ttsCache';

// =============================================================================
// Configuration
// =============================================================================

const GOOGLE_TTS_API_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize';

/**
 * Google Cloud TTS voice configuration per language
 * Using Neural2 voices for best quality
 */
interface GoogleVoiceConfig {
  languageCode: string;
  name: string;
  ssmlGender: 'MALE' | 'FEMALE' | 'NEUTRAL';
}

const GOOGLE_VOICE_MAP: Record<SupportedLanguage, GoogleVoiceConfig> = {
  en: {
    languageCode: 'en-US',
    name: 'en-US-Neural2-F', // Female neural voice
    ssmlGender: 'FEMALE',
  },
  es: {
    languageCode: 'es-ES',
    name: 'es-ES-Neural2-A', // Female neural voice
    ssmlGender: 'FEMALE',
  },
  fr: {
    languageCode: 'fr-FR',
    name: 'fr-FR-Neural2-A', // Female neural voice
    ssmlGender: 'FEMALE',
  },
  de: {
    languageCode: 'de-DE',
    name: 'de-DE-Neural2-A', // Female neural voice
    ssmlGender: 'FEMALE',
  },
  it: {
    languageCode: 'it-IT',
    name: 'it-IT-Neural2-A', // Female neural voice
    ssmlGender: 'FEMALE',
  },
  pt: {
    languageCode: 'pt-BR',
    name: 'pt-BR-Neural2-A', // Female neural voice
    ssmlGender: 'FEMALE',
  },
};

// Alternative male voices
const GOOGLE_VOICE_MAP_MALE: Record<SupportedLanguage, GoogleVoiceConfig> = {
  en: { languageCode: 'en-US', name: 'en-US-Neural2-D', ssmlGender: 'MALE' },
  es: { languageCode: 'es-ES', name: 'es-ES-Neural2-B', ssmlGender: 'MALE' },
  fr: { languageCode: 'fr-FR', name: 'fr-FR-Neural2-B', ssmlGender: 'MALE' },
  de: { languageCode: 'de-DE', name: 'de-DE-Neural2-B', ssmlGender: 'MALE' },
  it: { languageCode: 'it-IT', name: 'it-IT-Neural2-C', ssmlGender: 'MALE' },
  pt: { languageCode: 'pt-BR', name: 'pt-BR-Neural2-B', ssmlGender: 'MALE' },
};

// =============================================================================
// Types
// =============================================================================

export interface GoogleTTSOptions {
  /** Text to speak */
  text: string;
  /** Language code (en, es, fr, etc.) */
  language?: SupportedLanguage;
  /** Speech rate (0.5 to 2.0, default 1.0) */
  rate?: number;
  /** Pitch adjustment (-20.0 to 20.0 semitones, default 0) */
  pitch?: number;
  /** Use male voice instead of default female */
  useMaleVoice?: boolean;
  /** Callback when speech starts */
  onStart?: () => void;
  /** Callback when speech completes */
  onDone?: () => void;
  /** Callback on error (before fallback) */
  onError?: (error: Error) => void;
}

// =============================================================================
// Google TTS Service Class
// =============================================================================

class GoogleTTSService {
  private apiKey: string | null = null;
  private currentSound: Audio.Sound | null = null;
  private isSpeakingFlag = false;

  constructor() {
    this.loadApiKey();
  }

  /**
   * Load API key from environment
   */
  private loadApiKey(): void {
    this.apiKey = process.env.EXPO_PUBLIC_GOOGLE_TTS_API_KEY || null;
    if (!this.apiKey) {
      console.warn('[GoogleTTS] No API key found. Will use expo-speech fallback.');
    }
  }

  /**
   * Check if Google TTS is available (has API key)
   */
  isAvailable(): boolean {
    return !!this.apiKey;
  }

  /**
   * Speak text using Google Cloud TTS with caching and expo-speech fallback
   *
   * Flow:
   * 1. Check cache (local then cloud)
   * 2. If cached, play from cache
   * 3. If not cached, generate with Google TTS
   * 4. Save to cache for future use
   * 5. Fall back to expo-speech if all else fails
   */
  async speak(options: GoogleTTSOptions): Promise<void> {
    const {
      text,
      language = 'en',
      rate = 1.0,
      pitch = 0,
      useMaleVoice = false,
      onStart,
      onDone,
      onError,
    } = options;

    if (!text || text.trim().length === 0) {
      onDone?.();
      return;
    }

    // Step 1: Check cache first (only for default rate/pitch)
    // We only cache standard rate audio to avoid explosion of cache entries
    const canUseCache = rate >= 0.9 && rate <= 1.1 && pitch >= -1 && pitch <= 1 && !useMaleVoice;

    if (canUseCache) {
      try {
        const cachedUri = await ttsCache.getCachedAudio(text, language);
        if (cachedUri) {
          console.log(`[GoogleTTS] Playing from cache: ${text.substring(0, 20)}...`);
          await this.playAudioFile(cachedUri, onStart, onDone);
          return;
        }
      } catch (cacheError) {
        console.warn('[GoogleTTS] Cache check failed:', cacheError);
      }
    }

    // Step 2: Try Google TTS if API key available
    if (this.apiKey) {
      try {
        const audioBase64 = await this.generateWithGoogle(text, language, rate, pitch, useMaleVoice);

        // Save to cache if using default settings
        if (canUseCache && audioBase64) {
          ttsCache.saveToCache(audioBase64, text, language).catch((err) =>
            console.warn('[GoogleTTS] Cache save failed:', err)
          );
        }

        // Play the audio
        const tempFile = `${FileSystem.cacheDirectory}google_tts_${Date.now()}.mp3`;
        await FileSystem.writeAsStringAsync(tempFile, audioBase64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        await this.playAudioFile(tempFile, onStart, onDone);

        // Clean up temp file (non-cached)
        if (!canUseCache) {
          FileSystem.deleteAsync(tempFile, { idempotent: true }).catch(() => {});
        }

        return;
      } catch (error) {
        console.warn('[GoogleTTS] API failed, falling back to expo-speech:', error);
        onError?.(error instanceof Error ? error : new Error(String(error)));
      }
    }

    // Step 3: Fallback to expo-speech
    await this.speakWithExpoSpeech(text, language, rate, onStart, onDone, onError);
  }

  /**
   * Play an audio file from URI
   */
  private async playAudioFile(
    uri: string,
    onStart?: () => void,
    onDone?: () => void
  ): Promise<void> {
    onStart?.();
    this.isSpeakingFlag = true;

    try {
      // Unload previous sound if exists
      if (this.currentSound) {
        await this.currentSound.unloadAsync();
        this.currentSound = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      this.currentSound = sound;

      // Wait for playback to finish
      await new Promise<void>((resolve) => {
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            resolve();
          }
        });
      });

      await sound.unloadAsync();
      this.currentSound = null;
      this.isSpeakingFlag = false;
      onDone?.();
    } catch (playError) {
      this.isSpeakingFlag = false;
      this.currentSound = null;
      throw playError;
    }
  }

  /**
   * Generate audio using Google Cloud TTS API (returns base64)
   */
  private async generateWithGoogle(
    text: string,
    language: SupportedLanguage,
    rate: number,
    pitch: number,
    useMaleVoice: boolean
  ): Promise<string> {
    const voiceConfig = useMaleVoice
      ? GOOGLE_VOICE_MAP_MALE[language]
      : GOOGLE_VOICE_MAP[language];

    if (!voiceConfig) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const clampedRate = Math.max(0.25, Math.min(4.0, rate));
    const clampedPitch = Math.max(-20.0, Math.min(20.0, pitch));

    const requestBody = {
      input: { text },
      voice: {
        languageCode: voiceConfig.languageCode,
        name: voiceConfig.name,
        ssmlGender: voiceConfig.ssmlGender,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: clampedRate,
        pitch: clampedPitch,
        volumeGainDb: 0,
        effectsProfileId: ['small-bluetooth-speaker-class-device'],
      },
    };

    const response = await fetch(`${GOOGLE_TTS_API_URL}?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google TTS API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (!data.audioContent) {
      throw new Error('No audio content returned from Google TTS');
    }

    return data.audioContent;
  }

  /**
   * Fallback: Speak using expo-speech (device native TTS)
   */
  private async speakWithExpoSpeech(
    text: string,
    language: SupportedLanguage,
    rate: number,
    onStart?: () => void,
    onDone?: () => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    const config = LANGUAGE_CONFIGS[language];
    const locale = config?.ttsLocale || `${language}-${language.toUpperCase()}`;

    // Clamp rate to expo-speech range (0.1 to 2.0)
    const clampedRate = Math.max(0.1, Math.min(2.0, rate));

    return new Promise<void>((resolve, reject) => {
      this.isSpeakingFlag = true;
      onStart?.();

      Speech.speak(text, {
        language: locale,
        rate: clampedRate,
        pitch: 1.0,
        onDone: () => {
          this.isSpeakingFlag = false;
          onDone?.();
          resolve();
        },
        onError: (error) => {
          this.isSpeakingFlag = false;
          const err = new Error(`Expo Speech Error: ${error.message || 'Unknown error'}`);
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
   * Speak at slow speed (0.7x) - great for language learners
   */
  async speakSlow(options: Omit<GoogleTTSOptions, 'rate'>): Promise<void> {
    return this.speak({ ...options, rate: 0.7 });
  }

  /**
   * Speak at normal speed
   */
  async speakNormal(options: Omit<GoogleTTSOptions, 'rate'>): Promise<void> {
    return this.speak({ ...options, rate: 1.0 });
  }

  /**
   * Stop any current speech
   */
  async stop(): Promise<void> {
    // Stop Google TTS playback
    if (this.currentSound) {
      try {
        await this.currentSound.stopAsync();
        await this.currentSound.unloadAsync();
      } catch (e) {
        console.warn('[GoogleTTS] Error stopping sound:', e);
      }
      this.currentSound = null;
    }

    // Stop expo-speech too
    await Speech.stop();
    this.isSpeakingFlag = false;
  }

  /**
   * Check if currently speaking
   */
  async isSpeaking(): Promise<boolean> {
    if (this.currentSound) {
      const status = await this.currentSound.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        return true;
      }
    }

    // Also check expo-speech
    const expoSpeaking = await Speech.isSpeakingAsync();
    return expoSpeaking || this.isSpeakingFlag;
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): SupportedLanguage[] {
    return Object.keys(GOOGLE_VOICE_MAP) as SupportedLanguage[];
  }

  /**
   * Speak a word with emphasis (useful for vocabulary practice)
   */
  async speakWord(word: string, language: SupportedLanguage): Promise<void> {
    return this.speak({
      text: word,
      language,
      rate: 0.8, // Slightly slower for clarity
    });
  }

  /**
   * Speak a phrase twice - once slow, once normal
   * Great for pronunciation practice
   */
  async speakPhraseForPractice(
    phrase: string,
    language: SupportedLanguage,
    delayMs = 1000
  ): Promise<void> {
    // First: slow
    await this.speak({ text: phrase, language, rate: 0.6 });
    // Wait
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    // Second: normal speed
    await this.speak({ text: phrase, language, rate: 1.0 });
  }
}

// =============================================================================
// Singleton Export
// =============================================================================

export const googleTTS = new GoogleTTSService();

// Convenience exports
export const speakWithGoogle = googleTTS.speak.bind(googleTTS);
export const speakSlowWithGoogle = googleTTS.speakSlow.bind(googleTTS);
export const stopGoogleTTS = googleTTS.stop.bind(googleTTS);
export const isGoogleTTSAvailable = googleTTS.isAvailable.bind(googleTTS);
