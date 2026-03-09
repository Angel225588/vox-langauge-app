/**
 * useElevenLabsConversation Hook
 *
 * Main hook for managing voice conversations with ElevenLabs Conversational AI.
 * Handles connection, audio streaming, message tracking, and points calculation.
 *
 * @example
 * ```tsx
 * const {
 *   status,
 *   messages,
 *   startSession,
 *   endSession,
 *   sessionDuration,
 *   isConnected,
 * } = useElevenLabsConversation({
 *   voice: selectedVoice,
 *   scenario: 'cafe_ordering',
 *   userProficiency: 'intermediate',
 * });
 * ```
 */

import { useCallback, useState, useRef, useEffect } from 'react';

// Conditionally import ElevenLabs - won't work in Expo Go
let useConversation: any = null;
let isElevenLabsAvailable = false;
try {
  const elevenLabs = require('@elevenlabs/react-native');
  useConversation = elevenLabs.useConversation;
  isElevenLabsAvailable = true;
} catch (e) {
  console.log('[ElevenLabs] SDK not available - requires development build');
}

import {
  ElevenLabsConnectionStatus,
  ElevenLabsMessage,
  ConversationSession,
  ElevenLabsVoiceConfig,
  ProficiencyLevel,
  calculateSessionPoints,
  createElevenLabsError,
} from '@/lib/voice/elevenLabsTypes';

import {
  getElevenLabsAgentId,
  getSpeedForProficiency,
  buildSystemPrompt,
  getFirstMessage,
  SlowSpeechSpeed,
  getSlowSpeechSpeed,
} from '@/lib/voice/elevenLabsConfig';

import { AccentType } from '@/lib/voice/types';

// =============================================================================
// Types
// =============================================================================

export interface UseElevenLabsConversationProps {
  /** Agent ID override (defaults to env variable) */
  agentId?: string;
  /** Selected voice configuration */
  voice?: ElevenLabsVoiceConfig;
  /** User's target language code (e.g. 'fr'). Used as authority even if voice is undefined. */
  targetLanguage?: string;
  /** Scenario ID for context */
  scenario?: string;
  /** Scenario description for AI context */
  scenarioDescription?: string;
  /** User's proficiency level */
  userProficiency?: ProficiencyLevel;
  /** Emotion instruction for the AI */
  emotionInstruction?: string;
  /** Key vocabulary words to weave into conversation */
  keyVocabulary?: string[];
  /** Callback when session ends */
  onSessionEnd?: (session: ConversationSession) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
  /**
   * Slow speech mode - reduces TTS speed for better comprehension
   * @default 'normal'
   */
  slowSpeechMode?: SlowSpeechSpeed;
  /**
   * Target session duration in seconds (from onboarding practice time).
   * Used to instruct the AI to naturally wrap up the conversation.
   */
  targetDuration?: number;
  /**
   * Disable all overrides and use agent defaults
   * Use this if overrides cause connection issues
   * @default false
   */
  disableOverrides?: boolean;
  /**
   * Granular override control for testing
   * When disableOverrides is false, these control individual overrides
   */
  overrideOptions?: {
    /** Enable prompt override (agent.prompt) @default true */
    enablePrompt?: boolean;
    /** Enable first message override (agent.firstMessage) @default true */
    enableFirstMessage?: boolean;
    /** Enable language override (agent.language) @default true */
    enableLanguage?: boolean;
    /** Enable voice override (tts.voiceId) @default true */
    enableVoice?: boolean;
  };
}

export interface UseElevenLabsConversationReturn {
  // Connection state
  status: ElevenLabsConnectionStatus;
  isConnected: boolean;
  isConnecting: boolean;

  // Audio state
  isSpeaking: boolean;

  // Messages
  messages: ElevenLabsMessage[];
  lastMessage: ElevenLabsMessage | null;

  // Session data
  currentSession: ConversationSession | null;
  sessionDuration: number;
  turnCount: number;
  /** Target session duration in seconds (from onboarding) */
  targetDuration: number | undefined;

  // Error state
  error: Error | null;

  // Reconnection state
  /** True when connection dropped unexpectedly (not user-initiated) */
  isDisconnected: boolean;
  /** Reason for the unexpected disconnection */
  disconnectReason: string | null;
  /** Number of reconnection attempts made so far */
  reconnectAttempts: number;

  // Actions
  startSession: () => Promise<void>;
  endSession: () => Promise<void>;
  resetError: () => void;
  /** Attempt to reconnect after an unexpected disconnection */
  reconnect: () => Promise<void>;
  /** Finalize session with partial data after unexpected disconnect */
  finalizePartialSession: () => void;
}

// =============================================================================
// Hook Implementation
// =============================================================================

export function useElevenLabsConversation(
  props: UseElevenLabsConversationProps = {}
): UseElevenLabsConversationReturn {
  const {
    agentId = getElevenLabsAgentId(),
    voice,
    targetLanguage,
    scenario = 'casual_chat',
    scenarioDescription,
    userProficiency = 'intermediate',
    emotionInstruction,
    keyVocabulary,
    onSessionEnd,
    onError,
    slowSpeechMode = 'normal',
    targetDuration,
    disableOverrides = false,
    overrideOptions = {},
  } = props;

  // Extract granular override options with defaults
  const {
    enablePrompt = true,
    enableFirstMessage = true,
    enableLanguage = true,
    enableVoice = true,
  } = overrideOptions;

  // If ElevenLabs SDK is not available, return a fallback that shows an error
  if (!isElevenLabsAvailable || !useConversation) {
    const notAvailableError = createElevenLabsError(
      'unknown_error',
      'ElevenLabs SDK requires a development build. Run: npx expo prebuild && npx expo run:ios'
    );

    return {
      status: 'disconnected',
      isConnected: false,
      isConnecting: false,
      isSpeaking: false,
      messages: [],
      lastMessage: null,
      currentSession: null,
      sessionDuration: 0,
      turnCount: 0,
      targetDuration: undefined,
      error: notAvailableError,
      isDisconnected: false,
      disconnectReason: null,
      reconnectAttempts: 0,
      startSession: async () => {
        onError?.(notAvailableError);
        throw notAvailableError;
      },
      endSession: async () => {},
      resetError: () => {},
      reconnect: async () => {},
      finalizePartialSession: () => {},
    };
  }

  // ==========================================================================
  // State
  // ==========================================================================

  const [messages, setMessages] = useState<ElevenLabsMessage[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [currentSession, setCurrentSession] = useState<ConversationSession | null>(null);

  // Reconnection state
  const [isDisconnected, setIsDisconnected] = useState(false);
  const [disconnectReason, setDisconnectReason] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const MAX_RECONNECT_ATTEMPTS = 2;

  // Ref to track if the user intentionally ended the session
  const userEndedSessionRef = useRef(false);

  // Refs for timer management
  const sessionStartRef = useRef<number | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messageIdCounterRef = useRef(0);

  // Refs to avoid stale closures in callbacks
  // See: https://github.com/elevenlabs/elevenlabs-examples/issues/173
  const messagesRef = useRef<ElevenLabsMessage[]>([]);
  const currentSessionRef = useRef<ConversationSession | null>(null);
  const onSessionEndRef = useRef(onSessionEnd);

  // Keep refs in sync with state/props
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    currentSessionRef.current = currentSession;
  }, [currentSession]);

  useEffect(() => {
    onSessionEndRef.current = onSessionEnd;
  }, [onSessionEnd]);

  // ==========================================================================
  // Build Configuration
  // ==========================================================================

  // Resolve language: voice config → explicit targetLanguage → fallback
  const resolvedLanguage = voice?.language || targetLanguage || 'en';

  const systemPrompt = buildSystemPrompt({
    voiceName: voice?.name || 'AI Tutor',
    accent: voice?.accent ? getAccentDisplayName(voice.accent) : 'native',
    language: resolvedLanguage,
    proficiency: userProficiency,
    scenario,
    scenarioDescription,
    emotionInstruction,
    targetDurationSeconds: targetDuration,
    keyVocabulary,
  });

  // Always generate first message in the target language (even without voice config)
  const firstMessage = getFirstMessage({
    voiceName: voice?.name || 'AI Tutor',
    scenario,
    language: resolvedLanguage as any,
  });

  // ==========================================================================
  // ElevenLabs SDK Hook with Callbacks
  // ==========================================================================

  const conversation = useConversation({
    onConnect: ({ conversationId }: { conversationId: string }) => {
      console.log('[ElevenLabs] Connected:', conversationId);

      sessionStartRef.current = Date.now();
      setError(null);

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        if (sessionStartRef.current) {
          setSessionDuration(Math.floor((Date.now() - sessionStartRef.current) / 1000));
        }
      }, 1000);

      // Initialize session
      const newSession: ConversationSession = {
        id: conversationId,
        startTime: Date.now(),
        messages: [],
        scenario,
        accent: voice?.accent || 'en-american',
        voiceId: voice?.elevenLabsVoiceId || 'default',
        pointsEarned: 0,
        duration: 0,
        turnCount: 0,
        avgWordsPerTurn: 0,
      };
      setCurrentSession(newSession);
    },

    onDisconnect: () => {
      console.log('[ElevenLabs] Disconnected, userEnded:', userEndedSessionRef.current);

      // Stop duration timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      if (userEndedSessionRef.current) {
        // User-initiated disconnect: finalize session normally
        const session = currentSessionRef.current;
        const currentMessages = messagesRef.current;

        if (session && sessionStartRef.current) {
          const duration = Math.floor((Date.now() - sessionStartRef.current) / 1000);
          const userMessages = currentMessages.filter(m => m.role === 'user');
          const totalWords = userMessages.reduce((acc, m) => acc + m.content.split(' ').length, 0);

          const finalSession: ConversationSession = {
            ...session,
            endTime: Date.now(),
            messages: currentMessages,
            duration,
            turnCount: userMessages.length,
            avgWordsPerTurn: userMessages.length > 0 ? totalWords / userMessages.length : 0,
            pointsEarned: calculateSessionPoints({
              messages: currentMessages,
              duration,
            }),
          };

          onSessionEndRef.current?.(finalSession);
          setCurrentSession(null);
        }

        sessionStartRef.current = null;
        userEndedSessionRef.current = false;
      } else {
        // Unexpected disconnect: preserve messages, don't finalize
        console.warn('[ElevenLabs] Unexpected disconnection — preserving session for reconnection');
        setIsDisconnected(true);
        setDisconnectReason('Connection lost unexpectedly');
        // Keep sessionStartRef, messages, and currentSession intact for reconnection
      }
    },

    onMessage: (messagePayload: { source: string; message: string }) => {
      const newMessage: ElevenLabsMessage = {
        id: `msg_${++messageIdCounterRef.current}`,
        role: messagePayload.source === 'user' ? 'user' : 'assistant',
        content: messagePayload.message,
        timestamp: Date.now(),
        wordCount: messagePayload.message.split(' ').length,
      };

      setMessages(prev => [...prev, newMessage]);
    },

    onError: (message: string, context: unknown) => {
      console.error('[ElevenLabs] Error:', message, context);

      const elevenLabsError = createElevenLabsError(
        'unknown_error',
        message,
        { context }
      );

      setError(elevenLabsError);
      onError?.(elevenLabsError);
    },

    onStatusChange: ({ status: newStatus }: { status: string }) => {
      console.log('[ElevenLabs] Status changed:', newStatus);
    },
  });

  const { status, isSpeaking, startSession: sdkStartSession, endSession: sdkEndSession } = conversation;

  // Convert SDK status to our status type
  const connectionStatus: ElevenLabsConnectionStatus = status as ElevenLabsConnectionStatus;
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

  // ==========================================================================
  // Cleanup on unmount
  // ==========================================================================

  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  // ==========================================================================
  // Actions
  // ==========================================================================

  /**
   * Start a new conversation session
   *
   * NOTE: Overrides (custom prompt, voice, first message) must be enabled in the
   * ElevenLabs agent dashboard. If overrides fail, we retry without them.
   * See: https://github.com/elevenlabs/packages/issues/87
   */
  const startSession = useCallback(async () => {
    try {
      // Validate configuration
      if (!agentId) {
        throw createElevenLabsError(
          'agent_not_found',
          'ElevenLabs Agent ID not configured. Set EXPO_PUBLIC_ELEVENLABS_AGENT_ID in .env'
        );
      }

      // Reset state
      setError(null);
      setMessages([]);
      setSessionDuration(0);
      setIsDisconnected(false);
      setDisconnectReason(null);
      setReconnectAttempts(0);
      messageIdCounterRef.current = 0;
      userEndedSessionRef.current = false;

      console.log('[ElevenLabs] Starting session with agent:', agentId);

      // Build overrides — ALWAYS send prompt and language to enforce target language.
      // Voice/TTS overrides only apply when voice config is available.
      const shouldUseOverrides = !disableOverrides;

      // Build agent overrides conditionally
      const agentOverrides: Record<string, unknown> = {};
      if (enablePrompt && systemPrompt) {
        agentOverrides.prompt = { prompt: systemPrompt };
      }
      if (enableFirstMessage && firstMessage) {
        agentOverrides.firstMessage = firstMessage;
      }
      if (enableLanguage && resolvedLanguage) {
        agentOverrides.language = resolvedLanguage;
      }

      // Build TTS overrides conditionally
      const ttsOverrides: Record<string, unknown> = {};
      if (enableVoice && voice?.elevenLabsVoiceId) {
        ttsOverrides.voiceId = voice.elevenLabsVoiceId;
      }

      // Add slow speech speed if enabled
      // Note: ElevenLabs TTS override expects 'speed' parameter (0.5 to 2.0)
      if (slowSpeechMode !== 'normal') {
        const speed = getSlowSpeechSpeed(slowSpeechMode);
        ttsOverrides.speed = speed;
        console.log(`[ElevenLabs] Slow speech mode: ${slowSpeechMode} (${speed}x)`);
      }

      // Only include overrides if we have something to override
      const hasAgentOverrides = Object.keys(agentOverrides).length > 0;
      const hasTtsOverrides = Object.keys(ttsOverrides).length > 0;

      const overrides = shouldUseOverrides && (hasAgentOverrides || hasTtsOverrides) ? {
        ...(hasAgentOverrides && { agent: agentOverrides }),
        ...(hasTtsOverrides && { tts: ttsOverrides }),
      } : undefined;

      if (disableOverrides) {
        console.log('[ElevenLabs] Overrides DISABLED - using agent defaults');
      } else if (overrides) {
        console.log('[ElevenLabs] Overrides:', JSON.stringify({
          enablePrompt,
          enableFirstMessage,
          enableLanguage,
          enableVoice,
          agentPromptLength: enablePrompt ? systemPrompt?.length : 'skipped',
          firstMessageLength: enableFirstMessage ? firstMessage?.length : 'skipped',
          language: enableLanguage ? resolvedLanguage : 'skipped',
          voiceId: enableVoice ? voice?.elevenLabsVoiceId : 'skipped',
          slowSpeechMode: slowSpeechMode !== 'normal' ? slowSpeechMode : 'normal (1.0x)',
        }, null, 2));
      }

      try {
        // First attempt: with overrides (if configured)
        if (overrides) {
          console.log('[ElevenLabs] Attempting connection with overrides');
          await sdkStartSession({ agentId, overrides });
        } else {
          console.log('[ElevenLabs] Attempting connection without overrides');
          await sdkStartSession({ agentId });
        }
      } catch (overrideErr) {
        // If overrides failed, retry without them
        // This happens when overrides aren't enabled in the agent dashboard
        console.warn('[ElevenLabs] Override connection failed, retrying without overrides:', overrideErr);

        if (overrides) {
          console.log('[ElevenLabs] Retrying connection without overrides...');
          await sdkStartSession({ agentId });
        } else {
          throw overrideErr; // No overrides to strip, propagate the error
        }
      }

    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('[ElevenLabs] Failed to start session:', error);
      setError(error);
      onError?.(error);
      throw error;
    }
  }, [agentId, sdkStartSession, voice, resolvedLanguage, systemPrompt, firstMessage, userProficiency, slowSpeechMode, onError, disableOverrides, enablePrompt, enableFirstMessage, enableLanguage, enableVoice]);

  /**
   * End the current conversation session (user-initiated)
   */
  const endSession = useCallback(async () => {
    try {
      console.log('[ElevenLabs] Ending session (user-initiated)...');
      // Mark as user-initiated so onDisconnect finalizes normally
      userEndedSessionRef.current = true;
      // SDK endSession takes no arguments per the API
      await sdkEndSession();
    } catch (err) {
      console.error('[ElevenLabs] Error ending session:', err);
      // Don't throw - just log, as the session may already be ended
    }
  }, [sdkEndSession]);

  /**
   * Reset error state
   */
  const resetError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reconnect after an unexpected disconnection.
   * Preserves existing messages and re-establishes the connection
   * with the same system prompt and scenario.
   */
  const reconnect = useCallback(async () => {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.warn('[ElevenLabs] Max reconnect attempts reached');
      setDisconnectReason('Maximum reconnection attempts reached');
      return;
    }

    try {
      console.log(`[ElevenLabs] Reconnecting (attempt ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})...`);
      setReconnectAttempts(prev => prev + 1);
      setIsDisconnected(false);
      setDisconnectReason(null);
      setError(null);

      // NOTE: We do NOT reset messages or messageIdCounterRef here
      // so the conversation transcript is preserved across reconnection.

      // Validate configuration
      if (!agentId) {
        throw createElevenLabsError(
          'agent_not_found',
          'ElevenLabs Agent ID not configured'
        );
      }

      // Build overrides (same logic as startSession)
      const shouldUseOverrides = voice && !disableOverrides;

      const agentOverrides: Record<string, unknown> = {};
      if (enablePrompt && systemPrompt) {
        agentOverrides.prompt = { prompt: systemPrompt };
      }
      if (enableFirstMessage && firstMessage) {
        agentOverrides.firstMessage = firstMessage;
      }
      if (enableLanguage && voice?.language) {
        agentOverrides.language = voice.language;
      }

      const ttsOverrides: Record<string, unknown> = {};
      if (enableVoice && voice?.elevenLabsVoiceId) {
        ttsOverrides.voiceId = voice.elevenLabsVoiceId;
      }
      if (slowSpeechMode !== 'normal') {
        ttsOverrides.speed = getSlowSpeechSpeed(slowSpeechMode);
      }

      const hasAgentOverrides = Object.keys(agentOverrides).length > 0;
      const hasTtsOverrides = Object.keys(ttsOverrides).length > 0;

      const overrides = shouldUseOverrides && (hasAgentOverrides || hasTtsOverrides) ? {
        ...(hasAgentOverrides && { agent: agentOverrides }),
        ...(hasTtsOverrides && { tts: ttsOverrides }),
      } : undefined;

      try {
        if (overrides) {
          await sdkStartSession({ agentId, overrides });
        } else {
          await sdkStartSession({ agentId });
        }
      } catch (overrideErr) {
        if (overrides) {
          console.warn('[ElevenLabs] Reconnect with overrides failed, retrying without:', overrideErr);
          await sdkStartSession({ agentId });
        } else {
          throw overrideErr;
        }
      }

      console.log('[ElevenLabs] Reconnected successfully');
    } catch (err) {
      const reconnectError = err instanceof Error ? err : new Error(String(err));
      console.error('[ElevenLabs] Reconnection failed:', reconnectError);
      setError(reconnectError);
      setIsDisconnected(true);
      setDisconnectReason('Reconnection failed');
      onError?.(reconnectError);
    }
  }, [reconnectAttempts, agentId, sdkStartSession, voice, systemPrompt, firstMessage, slowSpeechMode, onError, disableOverrides, enablePrompt, enableFirstMessage, enableLanguage, enableVoice]);

  /**
   * Finalize a partial session after an unexpected disconnect.
   * Called when the user chooses "End Call" from the reconnection overlay.
   */
  const finalizePartialSession = useCallback(() => {
    console.log('[ElevenLabs] Finalizing partial session after unexpected disconnect');

    const session = currentSessionRef.current;
    const currentMessages = messagesRef.current;

    if (session && sessionStartRef.current) {
      const duration = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      const userMessages = currentMessages.filter(m => m.role === 'user');
      const totalWords = userMessages.reduce((acc, m) => acc + m.content.split(' ').length, 0);

      const finalSession: ConversationSession = {
        ...session,
        endTime: Date.now(),
        messages: currentMessages,
        duration,
        turnCount: userMessages.length,
        avgWordsPerTurn: userMessages.length > 0 ? totalWords / userMessages.length : 0,
        pointsEarned: calculateSessionPoints({
          messages: currentMessages,
          duration,
        }),
      };

      onSessionEndRef.current?.(finalSession);
    }

    // Clean up all state
    setCurrentSession(null);
    setIsDisconnected(false);
    setDisconnectReason(null);
    setReconnectAttempts(0);
    sessionStartRef.current = null;
    userEndedSessionRef.current = false;
  }, []);

  // ==========================================================================
  // Computed Values
  // ==========================================================================

  const turnCount = messages.filter(m => m.role === 'user').length;
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  // ==========================================================================
  // Return
  // ==========================================================================

  return {
    // Connection state
    status: connectionStatus,
    isConnected,
    isConnecting,

    // Audio state
    isSpeaking,

    // Messages
    messages,
    lastMessage,

    // Session data
    currentSession,
    sessionDuration,
    turnCount,
    targetDuration,

    // Error state
    error,

    // Reconnection state
    isDisconnected,
    disconnectReason,
    reconnectAttempts,

    // Actions
    startSession,
    endSession,
    resetError,
    reconnect,
    finalizePartialSession,
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

function getAccentDisplayName(accent: AccentType): string {
  const names: Record<AccentType, string> = {
    'es-latam': 'Latin American',
    'es-spain': 'Castilian Spanish',
    'fr-france': 'Parisian French',
    'fr-canada': 'Québécois French',
    'en-american': 'American English',
    'en-british': 'British English',
    'en-australian': 'Australian English',
    'pt-brazil': 'Brazilian Portuguese',
    'pt-portugal': 'European Portuguese',
  };
  return names[accent] || accent;
}

// =============================================================================
// Export
// =============================================================================

export default useElevenLabsConversation;
