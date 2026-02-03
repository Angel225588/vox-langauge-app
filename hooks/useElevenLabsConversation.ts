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
  /** Scenario ID for context */
  scenario?: string;
  /** Scenario description for AI context */
  scenarioDescription?: string;
  /** User's proficiency level */
  userProficiency?: ProficiencyLevel;
  /** Emotion instruction for the AI */
  emotionInstruction?: string;
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

  // Error state
  error: Error | null;

  // Actions
  startSession: () => Promise<void>;
  endSession: () => Promise<void>;
  resetError: () => void;
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
    scenario = 'casual_chat',
    scenarioDescription,
    userProficiency = 'intermediate',
    emotionInstruction,
    onSessionEnd,
    onError,
    slowSpeechMode = 'normal',
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
      error: notAvailableError,
      startSession: async () => {
        onError?.(notAvailableError);
        throw notAvailableError;
      },
      endSession: async () => {},
      resetError: () => {},
    };
  }

  // ==========================================================================
  // State
  // ==========================================================================

  const [messages, setMessages] = useState<ElevenLabsMessage[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [currentSession, setCurrentSession] = useState<ConversationSession | null>(null);

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

  const systemPrompt = buildSystemPrompt({
    voiceName: voice?.name || 'AI Tutor',
    accent: voice?.accent ? getAccentDisplayName(voice.accent) : 'native',
    language: voice?.language || 'the target language',
    proficiency: userProficiency,
    scenario,
    scenarioDescription,
    emotionInstruction,
  });

  const firstMessage = voice ? getFirstMessage({
    voiceName: voice.name,
    scenario,
    language: voice.language,
  }) : undefined;

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
      console.log('[ElevenLabs] Disconnected');

      // Stop duration timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      // Finalize session using refs to avoid stale closures
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
      messageIdCounterRef.current = 0;

      console.log('[ElevenLabs] Starting session with agent:', agentId);

      // Build overrides based on granular options
      // Note: Some overrides require enabling in the ElevenLabs agent dashboard
      const shouldUseOverrides = voice && !disableOverrides;

      // Build agent overrides conditionally
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
          language: enableLanguage ? voice?.language : 'skipped',
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
  }, [agentId, sdkStartSession, voice, systemPrompt, firstMessage, userProficiency, slowSpeechMode, onError, disableOverrides, enablePrompt, enableFirstMessage, enableLanguage, enableVoice]);

  /**
   * End the current conversation session
   */
  const endSession = useCallback(async () => {
    try {
      console.log('[ElevenLabs] Ending session...');
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

    // Error state
    error,

    // Actions
    startSession,
    endSession,
    resetError,
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
