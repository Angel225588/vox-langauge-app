/**
 * useTTS Hook - Text-to-Speech for React Components
 *
 * Easy-to-use hook for TTS in any component. Uses free device voices
 * via expo-speech with character voice support.
 *
 * @example
 * ```tsx
 * function VocabCard({ word, translation }) {
 *   const { speak, speakSlow, isSpeaking, stop } = useTTS();
 *
 *   return (
 *     <View>
 *       <Text>{word}</Text>
 *       <Button
 *         title={isSpeaking ? "Stop" : "Play"}
 *         onPress={() => isSpeaking ? stop() : speak(word, 'es')}
 *       />
 *       <Button title="Slow" onPress={() => speakSlow(word, 'es')} />
 *     </View>
 *   );
 * }
 * ```
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  tts,
  SupportedLanguage,
  CharacterVoice,
  DEFAULT_CHARACTERS,
} from '@/lib/voice';

interface UseTTSOptions {
  /** Default language for speech */
  defaultLanguage?: SupportedLanguage;
  /** Default character voice */
  defaultCharacter?: CharacterVoice | string;
  /** Auto-stop when component unmounts */
  autoStopOnUnmount?: boolean;
}

interface UseTTSReturn {
  /** Current speaking state */
  isSpeaking: boolean;
  /** Speak text at normal speed */
  speak: (text: string, language?: SupportedLanguage) => Promise<void>;
  /** Speak text at slow speed (0.5x) */
  speakSlow: (text: string, language?: SupportedLanguage) => Promise<void>;
  /** Speak with a specific character voice */
  speakAs: (text: string, characterId: string) => Promise<void>;
  /** Stop all speech */
  stop: () => Promise<void>;
  /** Get a character by ID */
  getCharacter: (id: string) => CharacterVoice | undefined;
  /** All available characters */
  characters: CharacterVoice[];
}

export function useTTS(options: UseTTSOptions = {}): UseTTSReturn {
  const {
    defaultLanguage = 'es',
    defaultCharacter,
    autoStopOnUnmount = true,
  } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const mountedRef = useRef(true);

  // Resolve default character if string ID provided
  const resolvedDefaultCharacter = typeof defaultCharacter === 'string'
    ? DEFAULT_CHARACTERS.find(c => c.id === defaultCharacter)
    : defaultCharacter;

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (autoStopOnUnmount) {
        tts.stop();
      }
    };
  }, [autoStopOnUnmount]);

  // Update speaking state
  const updateSpeakingState = useCallback(async () => {
    if (mountedRef.current) {
      const speaking = await tts.isSpeaking();
      setIsSpeaking(speaking);
    }
  }, []);

  // Speak at normal speed
  const speak = useCallback(async (
    text: string,
    language: SupportedLanguage = defaultLanguage
  ) => {
    setIsSpeaking(true);
    try {
      await tts.speak({
        text,
        language,
        character: resolvedDefaultCharacter,
        onDone: () => {
          if (mountedRef.current) setIsSpeaking(false);
        },
        onError: () => {
          if (mountedRef.current) setIsSpeaking(false);
        },
      });
    } catch (error) {
      if (mountedRef.current) setIsSpeaking(false);
      throw error;
    }
  }, [defaultLanguage, resolvedDefaultCharacter]);

  // Speak at slow speed
  const speakSlow = useCallback(async (
    text: string,
    language: SupportedLanguage = defaultLanguage
  ) => {
    setIsSpeaking(true);
    try {
      await tts.speakSlow({
        text,
        language,
        character: resolvedDefaultCharacter,
        onDone: () => {
          if (mountedRef.current) setIsSpeaking(false);
        },
        onError: () => {
          if (mountedRef.current) setIsSpeaking(false);
        },
      });
    } catch (error) {
      if (mountedRef.current) setIsSpeaking(false);
      throw error;
    }
  }, [defaultLanguage, resolvedDefaultCharacter]);

  // Speak with a specific character
  const speakAs = useCallback(async (text: string, characterId: string) => {
    const character = DEFAULT_CHARACTERS.find(c => c.id === characterId);
    if (!character) {
      console.warn(`[useTTS] Character not found: ${characterId}`);
      return speak(text);
    }

    setIsSpeaking(true);
    try {
      await tts.speak({
        text,
        character,
        onDone: () => {
          if (mountedRef.current) setIsSpeaking(false);
        },
        onError: () => {
          if (mountedRef.current) setIsSpeaking(false);
        },
      });
    } catch (error) {
      if (mountedRef.current) setIsSpeaking(false);
      throw error;
    }
  }, [speak]);

  // Stop speech
  const stop = useCallback(async () => {
    await tts.stop();
    if (mountedRef.current) setIsSpeaking(false);
  }, []);

  // Get character by ID
  const getCharacter = useCallback((id: string) => {
    return DEFAULT_CHARACTERS.find(c => c.id === id);
  }, []);

  return {
    isSpeaking,
    speak,
    speakSlow,
    speakAs,
    stop,
    getCharacter,
    characters: DEFAULT_CHARACTERS,
  };
}

export default useTTS;
