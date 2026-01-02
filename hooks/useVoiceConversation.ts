/**
 * Voice Conversation Hook
 *
 * Combines Gemini Live API, audio recording, and playback into a single
 * easy-to-use hook for real-time voice conversations.
 *
 * Features:
 * - Push-to-talk and continuous recording modes
 * - Real-time AI responses with audio playback
 * - Conversation history tracking
 * - Audio level visualization
 * - Connection state management
 *
 * @example
 * ```typescript
 * const conversation = useVoiceConversation({
 *   scenario: getScenarioById('cafe-order'),
 *   onTranscript: (text, role) => console.log(`${role}: ${text}`),
 * });
 *
 * // Start conversation
 * await conversation.connect();
 *
 * // Push-to-talk
 * conversation.startRecording();
 * // ... user speaks ...
 * conversation.stopRecording();
 *
 * // End conversation
 * conversation.disconnect();
 * ```
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
import {
  GeminiLiveClient,
  AudioRecorder,
  AudioPlayer,
  VoiceScenario,
  CharacterVoice,
  ConversationMessage,
  generateSystemPrompt,
  getCharacter,
  getDefaultAccent,
  type GeminiVoice,
  type GeminiVoiceName,
  type SupportedLanguage,
  type AccentType,
} from '@/lib/voice';

// =============================================================================
// Types
// =============================================================================

export type ConversationState =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'recording'
  | 'processing'
  | 'playing'
  | 'error'
  | 'disconnected';

export interface UseVoiceConversationOptions {
  /** Pre-defined scenario for the conversation */
  scenario?: VoiceScenario;
  /** Custom system prompt (overrides scenario) */
  systemPrompt?: string;
  /** Character for the AI voice */
  character?: CharacterVoice;
  /** Gemini voice preset */
  voice?: GeminiVoiceName;
  /** Accent for the AI voice (e.g., 'es-latam', 'es-spain', 'en-british') */
  accent?: AccentType;
  /** Target language */
  language?: SupportedLanguage;
  /** User's name (for personalization) */
  userName?: string;
  /** Maximum recording duration in ms */
  maxRecordingDuration?: number;
  /** Auto-play AI responses */
  autoPlayResponses?: boolean;
  /** Callback for transcript updates */
  onTranscript?: (text: string, role: 'user' | 'assistant') => void;
  /** Callback for conversation state changes */
  onStateChange?: (state: ConversationState) => void;
  /** Callback for errors */
  onError?: (error: Error) => void;
  /** Callback when conversation ends */
  onConversationEnd?: (messages: ConversationMessage[]) => void;
}

export interface UseVoiceConversationReturn {
  // State
  state: ConversationState;
  isConnected: boolean;
  isRecording: boolean;
  isPlaying: boolean;
  messages: ConversationMessage[];
  audioLevel: number;
  error: Error | null;

  // Connection
  connect: () => Promise<void>;
  disconnect: () => void;

  // Recording
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  cancelRecording: () => Promise<void>;

  // Playback
  stopPlayback: () => Promise<void>;

  // Text input (for hybrid mode)
  sendText: (text: string) => void;

  // Utilities
  clearMessages: () => void;
  getSessionDuration: () => number;
}

// =============================================================================
// Hook Implementation
// =============================================================================

export function useVoiceConversation(
  options: UseVoiceConversationOptions = {}
): UseVoiceConversationReturn {
  const {
    scenario,
    systemPrompt,
    character,
    voice = 'Kore',
    accent,
    language = 'es',
    userName,
    maxRecordingDuration = 30000,
    autoPlayResponses = true,
    onTranscript,
    onStateChange,
    onError,
    onConversationEnd,
  } = options;

  // State
  const [state, setState] = useState<ConversationState>('idle');
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  // Refs for instances
  const clientRef = useRef<GeminiLiveClient | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stateRef = useRef<ConversationState>(state);

  // P0 Fix: Coordination refs for state machine race condition
  // These track both completion events independently to prevent deadlock
  const turnCompletedRef = useRef(false);
  const playbackPendingRef = useRef(false);

  // P1 Fix: Ref for stopRecording to use in silence detection callback
  // Declared here so it's available in connect(), updated after stopRecording is defined
  const stopRecordingRef = useRef<(() => Promise<void>) | null>(null);

  // Derived state
  const isConnected = state === 'connected' || state === 'recording' || state === 'processing' || state === 'playing';
  const isRecording = state === 'recording';
  const isPlaying = state === 'playing';

  // Update state and notify
  const updateState = useCallback((newState: ConversationState) => {
    setState(newState);
    stateRef.current = newState;
    onStateChange?.(newState);
  }, [onStateChange]);

  // Handle errors
  const handleError = useCallback((err: Error) => {
    console.error('[VoiceConversation] Error:', err);
    setError(err);
    updateState('error');
    onError?.(err);
  }, [updateState, onError]);

  // P0 Fix: Helper to safely transition to 'connected' state
  // Only transitions when BOTH conditions are met:
  // 1. Turn is complete (Gemini finished responding)
  // 2. Playback is not pending (audio finished playing)
  const tryTransitionToConnected = useCallback(() => {
    if (
      turnCompletedRef.current &&
      !playbackPendingRef.current &&
      stateRef.current !== 'disconnected' &&
      stateRef.current !== 'error'
    ) {
      console.log('[VoiceConversation] Both conditions met, transitioning to connected');
      updateState('connected');
    } else {
      console.log('[VoiceConversation] Waiting for conditions:', {
        turnComplete: turnCompletedRef.current,
        playbackPending: playbackPendingRef.current,
        currentState: stateRef.current,
      });
    }
  }, [updateState]);

  // Add message to history
  const addMessage = useCallback((text: string, role: 'user' | 'assistant') => {
    const message: ConversationMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role,
      content: text,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, message]);
    onTranscript?.(text, role);
  }, [onTranscript]);

  // Build system prompt
  const buildSystemPrompt = useCallback(() => {
    if (systemPrompt) return systemPrompt;
    if (scenario) return generateSystemPrompt(scenario, userName);

    // Default prompt
    return language === 'es'
      ? `Eres un tutor amigable de español. Habla de forma clara y natural.
         Corrige errores gentilmente. Mantén respuestas cortas (1-2 oraciones).`
      : `You are a friendly language tutor. Speak clearly and naturally.
         Correct mistakes gently. Keep responses short (1-2 sentences).`;
  }, [systemPrompt, scenario, userName, language]);

  // Connect to Gemini Live
  const connect = useCallback(async () => {
    if (isConnected) {
      console.warn('[VoiceConversation] Already connected');
      return;
    }

    updateState('connecting');
    setError(null);

    try {
      // Get API key
      const apiKey = Constants.expoConfig?.extra?.geminiApiKey || process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key not configured');
      }

      // Initialize recorder
      const recorder = new AudioRecorder({ maxDuration: maxRecordingDuration });
      recorderRef.current = recorder;

      const hasPermission = await recorder.requestPermissions();
      if (!hasPermission) {
        recorderRef.current = null;
        throw new Error('Microphone permission required');
      }

      // Set up audio level callback (use local variable to avoid null check issues)
      recorder.onAudioLevel(setAudioLevel);

      // P1 Fix: Set up silence detection callback for auto-stop recording
      recorder.onSilenceDetected(() => {
        if (stateRef.current === 'recording') {
          console.log('[VoiceConversation] Silence detected, auto-stopping recording');
          // Use stopRecordingRef to get the current stopRecording function
          stopRecordingRef.current?.();
        }
      });

      // Initialize player
      const player = new AudioPlayer();
      playerRef.current = player;

      // P0 Fix: Track playback state with ref for coordination
      player.onPlaybackStart(() => {
        playbackPendingRef.current = true;
        updateState('playing');
      });
      player.onPlaybackEnd(() => {
        playbackPendingRef.current = false;
        console.log('[VoiceConversation] Playback ended');
        tryTransitionToConnected();
      });
      player.onPlaybackError(handleError);

      // Determine voice
      const selectedVoice = character?.geminiVoice || voice;

      // Determine accent (from character, options, or default for language)
      const selectedAccent = character?.accent || accent || getDefaultAccent(language);

      // Initialize Gemini client
      const client = new GeminiLiveClient({
        apiKey,
        systemPrompt: buildSystemPrompt(),
        voice: selectedVoice,
        accent: selectedAccent,
        language,
      });
      clientRef.current = client;

      // Set up client callbacks
      client.onAudioResponse((audioData) => {
        if (autoPlayResponses && playerRef.current) {
          playerRef.current.queueBuffer(audioData);
        }
      });

      client.onTranscript((text, role) => {
        addMessage(text, role);
      });

      // P0 Fix: Use coordinated flag system for turn completion
      client.onTurnComplete(() => {
        console.log('[VoiceConversation] Turn complete, flushing audio buffer');
        turnCompletedRef.current = true;
        // Flush any remaining audio in the buffer
        playerRef.current?.flushStreamBuffer();
        // Try to transition - will only succeed if playback is also done
        tryTransitionToConnected();
      });

      client.onError(handleError);

      client.onDisconnected(() => {
        console.log('[VoiceConversation] Disconnected callback triggered');
        updateState('disconnected');
        // Only trigger conversation end if we actually had a conversation
        // (Don't trigger on initial connection failure)
      });

      // Connect
      await client.connect();
      updateState('connected');

    } catch (err) {
      handleError(err as Error);
    }
  }, [
    isConnected,
    maxRecordingDuration,
    character,
    voice,
    accent,
    language,
    autoPlayResponses,
    buildSystemPrompt,
    updateState,
    handleError,
    addMessage,
    onConversationEnd,
    messages,
    state,
    tryTransitionToConnected,
  ]);

  // Disconnect
  const disconnect = useCallback(() => {
    console.log('[VoiceConversation] Disconnect called');

    // Clear recording timeout
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }

    // Stop recording if active
    if (recorderRef.current?.getIsRecording()) {
      recorderRef.current.cancelRecording();
    }

    // Stop playback
    playerRef.current?.stop();

    // Disconnect client
    clientRef.current?.disconnect();

    // Cleanup
    recorderRef.current?.cleanup();
    playerRef.current?.cleanup();

    recorderRef.current = null;
    playerRef.current = null;
    clientRef.current = null;

    updateState('disconnected');
    // Note: onConversationEnd should be called by the component, not here
  }, [updateState]);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!isConnected || isRecording) return;

    try {
      // Stop any playback
      await playerRef.current?.stop();

      // Start recording
      await recorderRef.current?.startRecording();
      updateState('recording');

      // Auto-stop after max duration
      recordingTimeoutRef.current = setTimeout(() => {
        stopRecording();
      }, maxRecordingDuration);

    } catch (err) {
      handleError(err as Error);
    }
  }, [isConnected, isRecording, maxRecordingDuration, updateState, handleError]);

  // Stop recording and send to Gemini
  const stopRecording = useCallback(async () => {
    if (!isRecording || !recorderRef.current) return;

    try {
      // Clear timeout
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
      }

      // P0 Fix: Reset coordination flags for new turn
      turnCompletedRef.current = false;
      playbackPendingRef.current = false;

      updateState('processing');

      // Stop recording
      const recording = await recorderRef.current.stopRecording();

      if (recording && clientRef.current) {
        // Read audio file as base64 using expo-file-system (React Native compatible)
        const base64Audio = await FileSystem.readAsStringAsync(recording.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Convert base64 to ArrayBuffer
        const audioBuffer = base64ToArrayBuffer(base64Audio);

        // Send audio with WAV mime type (clientContent format with turnComplete: true)
        // No need to call endAudioInput() since turnComplete signals end of input
        clientRef.current.sendAudio(audioBuffer, 'audio/wav');

        console.log('[VoiceConversation] Audio sent, size:', audioBuffer.byteLength, 'bytes');

        // P0 Fix: Safety timeout - if no response in 30s, return to connected
        setTimeout(() => {
          if (stateRef.current === 'processing') {
            console.warn('[VoiceConversation] Response timeout, forcing return to connected');
            turnCompletedRef.current = true;
            tryTransitionToConnected();
          }
        }, 30000);
      }

    } catch (err) {
      handleError(err as Error);
    }
  }, [isRecording, updateState, handleError, tryTransitionToConnected]);

  // Cancel recording
  const cancelRecording = useCallback(async () => {
    if (!isRecording || !recorderRef.current) return;

    // Clear timeout
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }

    await recorderRef.current.cancelRecording();
    updateState('connected');
  }, [isRecording, updateState]);

  // Stop playback
  const stopPlayback = useCallback(async () => {
    if (!isPlaying || !playerRef.current) return;
    await playerRef.current.stop();
    updateState('connected');
  }, [isPlaying, updateState]);

  // Send text message (hybrid mode)
  const sendText = useCallback((text: string) => {
    if (!clientRef.current?.getIsConnected()) {
      console.warn('[VoiceConversation] Not connected');
      return;
    }

    addMessage(text, 'user');
    clientRef.current.sendText(text);
    updateState('processing');
  }, [addMessage, updateState]);

  // Clear message history
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Get session duration
  const getSessionDuration = useCallback(() => {
    return clientRef.current?.getSessionDuration() || 0;
  }, []);

  // Cleanup on unmount - use ref to avoid recreating cleanup on disconnect changes
  const disconnectRef = useRef(disconnect);
  disconnectRef.current = disconnect;

  // P1 Fix: Update stopRecording ref after it's defined
  stopRecordingRef.current = stopRecording;

  useEffect(() => {
    return () => {
      console.log('[VoiceConversation] Hook unmounting - calling disconnect');
      disconnectRef.current();
    };
  }, []); // Empty deps - only runs on true unmount

  return {
    // State
    state,
    isConnected,
    isRecording,
    isPlaying,
    messages,
    audioLevel,
    error,

    // Connection
    connect,
    disconnect,

    // Recording
    startRecording,
    stopRecording,
    cancelRecording,

    // Playback
    stopPlayback,

    // Text input
    sendText,

    // Utilities
    clearMessages,
    getSessionDuration,
  };
}

export default useVoiceConversation;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Convert base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
