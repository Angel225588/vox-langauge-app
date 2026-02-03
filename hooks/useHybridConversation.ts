/**
 * useHybridConversation Hook
 *
 * React hook for cost-effective voice conversations.
 * Uses Whisper + Gemini Text + expo-speech instead of expensive Gemini Live API.
 *
 * @example
 * ```typescript
 * const {
 *   state,
 *   messages,
 *   startRecording,
 *   stopRecording,
 *   sendText,
 * } = useHybridConversation({
 *   scenario: myScenario,
 * });
 * ```
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  HybridVoiceConversation,
  createHybridConversation,
  createSimpleConversation,
  createMockConversation,
  type ConversationMode,
  type ConversationStatus,
  type ProcessAudioResult,
} from '@/lib/voice/hybridConversation';
import { AudioRecorder } from '@/lib/voice/audioRecorder';
import type { VoiceScenario, ConversationMessage, SupportedLanguage } from '@/lib/voice/types';

// =============================================================================
// Types
// =============================================================================

export type HybridConversationState =
  | 'idle'
  | 'initializing'
  | 'ready'
  | 'recording'
  | 'transcribing'
  | 'thinking'
  | 'speaking'
  | 'error';

export interface UseHybridConversationOptions {
  /** Pre-defined scenario */
  scenario?: VoiceScenario;
  /** Custom system prompt (alternative to scenario) */
  systemPrompt?: string;
  /** Target language */
  language?: SupportedLanguage;
  /** User's name for personalization */
  userName?: string;
  /** Force mock mode for testing */
  mockMode?: boolean;
  /** Auto-initialize on mount */
  autoInit?: boolean;
  /** Max recording duration in ms */
  maxRecordingDuration?: number;
  /** Callbacks */
  onUserTranscript?: (text: string) => void;
  onAiResponse?: (text: string) => void;
  onError?: (error: Error) => void;
  onStateChange?: (state: HybridConversationState) => void;
}

export interface UseHybridConversationReturn {
  // State
  state: HybridConversationState;
  status: ConversationStatus | null;
  messages: ConversationMessage[];
  error: Error | null;
  audioLevel: number;

  // Actions
  initialize: () => Promise<ConversationStatus>;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<ProcessAudioResult | null>;
  cancelRecording: () => Promise<void>;
  sendText: (text: string) => Promise<ProcessAudioResult | null>;
  stopSpeaking: () => void;
  clearHistory: () => void;
  cleanup: () => void;

  // Computed
  isRecording: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  canRecord: boolean;
  mode: ConversationMode;
}

// =============================================================================
// Hook Implementation
// =============================================================================

export function useHybridConversation(
  options: UseHybridConversationOptions = {}
): UseHybridConversationReturn {
  const {
    scenario,
    systemPrompt,
    language = 'es',
    userName,
    mockMode = false,
    autoInit = true,
    maxRecordingDuration = 30000,
    onUserTranscript,
    onAiResponse,
    onError,
    onStateChange,
  } = options;

  // State
  const [state, setState] = useState<HybridConversationState>('idle');
  const [status, setStatus] = useState<ConversationStatus | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  // Refs
  const conversationRef = useRef<HybridVoiceConversation | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update state and notify
  const updateState = useCallback((newState: HybridConversationState) => {
    setState(newState);
    onStateChange?.(newState);
  }, [onStateChange]);

  // Handle errors
  const handleError = useCallback((err: Error) => {
    console.error('[useHybridConversation] Error:', err);
    setError(err);
    updateState('error');
    onError?.(err);
  }, [updateState, onError]);

  // ===========================================================================
  // Initialization
  // ===========================================================================

  const initialize = useCallback(async (): Promise<ConversationStatus> => {
    updateState('initializing');
    setError(null);

    try {
      // Create conversation instance
      let conversation: HybridVoiceConversation;

      if (mockMode) {
        conversation = createMockConversation(language);
      } else if (scenario) {
        conversation = createHybridConversation(scenario, userName);
      } else {
        conversation = createSimpleConversation(language, systemPrompt);
      }

      // Set up callbacks
      conversation.onUserTranscriptCallback((text) => {
        setMessages(prev => [...prev, {
          id: `user-${Date.now()}`,
          role: 'user',
          content: text,
          timestamp: Date.now(),
        }]);
        onUserTranscript?.(text);
      });

      conversation.onAiResponseCallback((text) => {
        setMessages(prev => [...prev, {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: text,
          timestamp: Date.now(),
        }]);
        onAiResponse?.(text);
      });

      conversation.onTtsStartCallback(() => {
        updateState('speaking');
      });

      conversation.onTtsEndCallback(() => {
        if (state !== 'error') {
          updateState('ready');
        }
      });

      conversation.onErrorCallback(handleError);

      // Initialize
      const convStatus = await conversation.initialize();
      conversationRef.current = conversation;
      setStatus(convStatus);

      // Initialize recorder
      const recorder = new AudioRecorder({ maxDuration: maxRecordingDuration });
      const hasPermission = await recorder.requestPermissions();

      if (!hasPermission) {
        throw new Error('Microphone permission required');
      }

      recorder.onAudioLevel(setAudioLevel);
      recorderRef.current = recorder;

      updateState('ready');
      return convStatus;
    } catch (err) {
      handleError(err as Error);
      throw err;
    }
  }, [
    scenario,
    systemPrompt,
    language,
    userName,
    mockMode,
    maxRecordingDuration,
    updateState,
    handleError,
    onUserTranscript,
    onAiResponse,
    state,
  ]);

  // ===========================================================================
  // Recording
  // ===========================================================================

  const startRecording = useCallback(async () => {
    if (state !== 'ready' || !recorderRef.current) {
      console.warn('[useHybridConversation] Cannot start recording in state:', state);
      return;
    }

    try {
      // Stop any current speech
      conversationRef.current?.stopSpeaking();

      await recorderRef.current.startRecording();
      updateState('recording');

      // Auto-stop after max duration
      recordingTimeoutRef.current = setTimeout(() => {
        stopRecording();
      }, maxRecordingDuration);
    } catch (err) {
      handleError(err as Error);
    }
  }, [state, maxRecordingDuration, updateState, handleError]);

  const stopRecording = useCallback(async (): Promise<ProcessAudioResult | null> => {
    if (state !== 'recording' || !recorderRef.current || !conversationRef.current) {
      return null;
    }

    // Clear timeout
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }

    try {
      updateState('transcribing');

      const recording = await recorderRef.current.stopRecording();

      if (!recording?.uri) {
        updateState('ready');
        return null;
      }

      updateState('thinking');

      const result = await conversationRef.current.processUserAudio(recording.uri);

      // State will be updated to 'speaking' by TTS callback

      return result;
    } catch (err) {
      handleError(err as Error);
      return null;
    }
  }, [state, updateState, handleError]);

  const cancelRecording = useCallback(async () => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }

    await recorderRef.current?.cancelRecording();
    updateState('ready');
  }, [updateState]);

  // ===========================================================================
  // Text Input
  // ===========================================================================

  const sendText = useCallback(async (text: string): Promise<ProcessAudioResult | null> => {
    if (!conversationRef.current) {
      console.warn('[useHybridConversation] Not initialized');
      return null;
    }

    try {
      updateState('thinking');

      const result = await conversationRef.current.processUserText(text);

      return result;
    } catch (err) {
      handleError(err as Error);
      return null;
    }
  }, [updateState, handleError]);

  // ===========================================================================
  // TTS Control
  // ===========================================================================

  const stopSpeaking = useCallback(() => {
    conversationRef.current?.stopSpeaking();
    updateState('ready');
  }, [updateState]);

  // ===========================================================================
  // History
  // ===========================================================================

  const clearHistory = useCallback(() => {
    conversationRef.current?.clearHistory();
    setMessages([]);
  }, []);

  // ===========================================================================
  // Cleanup
  // ===========================================================================

  const cleanup = useCallback(() => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
    }

    recorderRef.current?.cleanup();
    conversationRef.current?.cleanup();

    recorderRef.current = null;
    conversationRef.current = null;

    setMessages([]);
    setStatus(null);
    setError(null);
    updateState('idle');
  }, [updateState]);

  // ===========================================================================
  // Auto-init and cleanup
  // ===========================================================================

  useEffect(() => {
    if (autoInit) {
      initialize().catch(console.error);
    }

    return () => {
      cleanup();
    };
  }, []); // Only on mount/unmount

  // ===========================================================================
  // Computed values
  // ===========================================================================

  const isRecording = state === 'recording';
  const isSpeaking = state === 'speaking';
  const isProcessing = state === 'transcribing' || state === 'thinking';
  const canRecord = state === 'ready';
  const mode = status?.mode || 'mock';

  return {
    // State
    state,
    status,
    messages,
    error,
    audioLevel,

    // Actions
    initialize,
    startRecording,
    stopRecording,
    cancelRecording,
    sendText,
    stopSpeaking,
    clearHistory,
    cleanup,

    // Computed
    isRecording,
    isSpeaking,
    isProcessing,
    canRecord,
    mode,
  };
}

export default useHybridConversation;
