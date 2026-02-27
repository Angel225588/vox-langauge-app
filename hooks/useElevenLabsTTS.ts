/**
 * useElevenLabsTTS Hook - Text-to-Speech using ElevenLabs API
 *
 * Speaks individual text lines using ElevenLabs TTS API.
 * Perfect for dialogue practice where you need high-quality voices.
 *
 * @example
 * ```tsx
 * const { speak, isSpeaking, stop, speakSequence } = useElevenLabsTTS();
 *
 * // Speak a single line
 * await speak('Hello, how are you?', 'en-US-daniel');
 *
 * // Speak multiple lines in sequence
 * await speakSequence([
 *   { text: 'Good morning!', voiceId: 'voice1' },
 *   { text: 'How can I help?', voiceId: 'voice2' },
 * ]);
 * ```
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { getElevenLabsApiKey, ELEVENLABS_VOICES, getVoiceById } from '@/lib/voice/elevenLabsConfig';

// =============================================================================
// Types
// =============================================================================

interface SpeakOptions {
  /** Text to speak */
  text: string;
  /** Voice config ID (from ELEVENLABS_VOICES) or ElevenLabs voice ID directly */
  voiceId?: string;
  /** Speaking rate (0.5 to 2.0, default 1.0) */
  rate?: number;
  /** Callback when done speaking */
  onDone?: () => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

interface SequenceItem {
  text: string;
  voiceId?: string;
  /** Delay in ms before speaking this line */
  delayBefore?: number;
}

interface UseElevenLabsTTSReturn {
  /** Speak a single line */
  speak: (text: string, voiceId?: string, rate?: number) => Promise<void>;
  /** Speak with full options */
  speakWithOptions: (options: SpeakOptions) => Promise<void>;
  /** Speak multiple lines in sequence */
  speakSequence: (items: SequenceItem[], onLineStart?: (index: number) => void) => Promise<void>;
  /** Stop current speech */
  stop: () => Promise<void>;
  /** Is currently speaking */
  isSpeaking: boolean;
  /** Current error if any */
  error: Error | null;
  /** Is ElevenLabs configured */
  isConfigured: boolean;
}

// =============================================================================
// Constants
// =============================================================================

const ELEVENLABS_TTS_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
const DEFAULT_VOICE_ID = 'd6dMXDDMQ9zlhV3hOfx0'; // Daniel (American English)

// Model optimized for low latency
const TTS_MODEL = 'eleven_turbo_v2_5';

// =============================================================================
// Hook Implementation
// =============================================================================

export function useElevenLabsTTS(): UseElevenLabsTTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const soundRef = useRef<Audio.Sound | null>(null);
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const apiKey = getElevenLabsApiKey();
  const isConfigured = Boolean(apiKey);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      stopInternal();
    };
  }, []);

  // Internal stop function
  const stopInternal = async () => {
    // Abort any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Unload sound
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (e) {
        // Ignore errors during cleanup
      }
      soundRef.current = null;
    }
  };

  // Resolve voice ID - could be our config ID or ElevenLabs ID directly
  const resolveVoiceId = useCallback((voiceIdOrConfigId?: string): string => {
    if (!voiceIdOrConfigId) return DEFAULT_VOICE_ID;

    // Try to find by our config ID first
    const voiceConfig = getVoiceById(voiceIdOrConfigId);
    if (voiceConfig) {
      return voiceConfig.elevenLabsVoiceId;
    }

    // Try finding by elevenlabs voice ID
    const byElevenLabsId = ELEVENLABS_VOICES.find(v => v.elevenLabsVoiceId === voiceIdOrConfigId);
    if (byElevenLabsId) {
      return byElevenLabsId.elevenLabsVoiceId;
    }

    // Assume it's a direct ElevenLabs ID
    return voiceIdOrConfigId;
  }, []);

  // Speak with full options
  const speakWithOptions = useCallback(async (options: SpeakOptions): Promise<void> => {
    const { text, voiceId, rate = 1.0, onDone, onError } = options;

    if (!text || text.trim().length === 0) {
      onDone?.();
      return;
    }

    if (!apiKey) {
      const err = new Error('ElevenLabs API key not configured');
      setError(err);
      onError?.(err);
      throw err;
    }

    // Stop any current speech
    await stopInternal();

    const resolvedVoiceId = resolveVoiceId(voiceId);

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    setIsSpeaking(true);
    setError(null);

    try {
      // Call ElevenLabs TTS API
      const response = await fetch(`${ELEVENLABS_TTS_URL}/${resolvedVoiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: TTS_MODEL,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs TTS error: ${response.status} - ${errorText}`);
      }

      // Get audio data as arraybuffer and write to temp file
      const arrayBuffer = await response.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64Audio = btoa(binary);

      const tempFile = `${FileSystem.cacheDirectory}elevenlabs_tts_${Date.now()}.mp3`;
      await FileSystem.writeAsStringAsync(tempFile, base64Audio, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Create and play sound from temp file
      const { sound } = await Audio.Sound.createAsync(
        { uri: tempFile },
        { shouldPlay: true, rate },
        (status) => {
          if (status.isLoaded && status.didJustFinish) {
            if (isMountedRef.current) {
              setIsSpeaking(false);
            }
            onDone?.();
            // Cleanup
            sound.unloadAsync();
            soundRef.current = null;
            // Remove temp file
            FileSystem.deleteAsync(tempFile, { idempotent: true }).catch(() => {});
          }
        }
      );

      soundRef.current = sound;

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was aborted, not an error
        if (isMountedRef.current) {
          setIsSpeaking(false);
        }
        return;
      }

      const error = err instanceof Error ? err : new Error(String(err));
      console.error('[ElevenLabsTTS] Error:', error);

      if (isMountedRef.current) {
        setError(error);
        setIsSpeaking(false);
      }
      onError?.(error);
      throw error;
    }
  }, [apiKey, resolveVoiceId]);

  // Simple speak function
  const speak = useCallback(async (
    text: string,
    voiceId?: string,
    rate?: number
  ): Promise<void> => {
    return speakWithOptions({ text, voiceId, rate });
  }, [speakWithOptions]);

  // Speak sequence of lines
  const speakSequence = useCallback(async (
    items: SequenceItem[],
    onLineStart?: (index: number) => void
  ): Promise<void> => {
    for (let i = 0; i < items.length; i++) {
      if (!isMountedRef.current) break;

      const item = items[i];

      // Delay before speaking
      if (item.delayBefore && item.delayBefore > 0) {
        await new Promise(resolve => setTimeout(resolve, item.delayBefore));
      }

      // Notify line start
      onLineStart?.(i);

      // Speak and wait for completion
      await new Promise<void>((resolve, reject) => {
        speakWithOptions({
          text: item.text,
          voiceId: item.voiceId,
          onDone: resolve,
          onError: reject,
        }).catch(reject);
      });

      // Small pause between lines
      if (i < items.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
  }, [speakWithOptions]);

  // Stop speech
  const stop = useCallback(async (): Promise<void> => {
    await stopInternal();
    if (isMountedRef.current) {
      setIsSpeaking(false);
    }
  }, []);

  return {
    speak,
    speakWithOptions,
    speakSequence,
    stop,
    isSpeaking,
    error,
    isConfigured,
  };
}

export default useElevenLabsTTS;
