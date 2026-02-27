/**
 * Gemini Live API Client
 *
 * Real-time voice conversation client using Google's Gemini 2.0 Flash Live API.
 * Supports bidirectional audio streaming for natural voice conversations.
 *
 * Features:
 * - WebSocket connection management
 * - Audio streaming (send user audio, receive AI audio)
 * - Turn detection (barge-in support)
 * - Multiple voice presets
 * - Session management
 *
 * @see https://ai.google.dev/gemini-api/docs/live
 *
 * @example
 * ```typescript
 * const client = new GeminiLiveClient({
 *   apiKey: process.env.GEMINI_API_KEY,
 *   systemPrompt: 'You are María, a friendly Spanish tutor...',
 *   voice: 'Kore',
 *   language: 'es',
 * });
 *
 * await client.connect();
 * client.onAudioResponse((audioData) => playAudio(audioData));
 * client.sendAudio(userAudioChunk);
 * ```
 */

import {
  ConversationMessage,
  ConversationState,
  VoiceScenario,
  CharacterVoice,
  SupportedLanguage,
  LANGUAGE_CONFIGS,
  AccentType,
  ACCENT_OPTIONS,
  GeminiVoiceName,
} from './types';

// =============================================================================
// Types
// =============================================================================

/** @deprecated Use GeminiVoiceName from types.ts instead */
export type GeminiVoice = GeminiVoiceName;

export interface GeminiLiveConfig {
  /** Gemini API key */
  apiKey: string;
  /** Model to use - gemini-2.0-flash-exp for Live API */
  model?: 'gemini-2.0-flash-exp';
  /** Voice for responses (8 options: Kore, Aoede, Leda, Puck, Charon, Fenrir, Orus, Zephyr) */
  voice?: GeminiVoiceName;
  /** Accent for speech (e.g., 'es-latam', 'es-spain', 'en-british') */
  accent?: AccentType;
  /** System prompt for the conversation */
  systemPrompt?: string;
  /** Language for responses */
  language?: SupportedLanguage;
  /** Enable interruption (barge-in) */
  enableBargeIn?: boolean;
}

interface SetupMessage {
  setup: {
    model: string;
    generationConfig: {
      responseModalities: string[];
      speechConfig?: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: string;
          };
        };
      };
    };
    systemInstruction?: {
      parts: { text: string }[];
    };
  };
}

interface AudioInputMessage {
  realtimeInput: {
    mediaChunks: {
      mimeType: string;
      data: string; // base64
    }[];
  };
}

interface TextInputMessage {
  clientContent: {
    turns: {
      role: string;
      parts: { text: string }[];
    }[];
    turnComplete: boolean;
  };
}

type GeminiEvent = {
  type: 'audio' | 'text' | 'turn_complete' | 'error' | 'connected' | 'disconnected';
  data?: any;
};

// =============================================================================
// Gemini Live Client
// =============================================================================

/** Internal config with required fields (except accent which is optional) */
type InternalConfig = Required<Omit<GeminiLiveConfig, 'accent'>> & { accent?: AccentType };

export class GeminiLiveClient {
  private ws: WebSocket | null = null;
  private config: InternalConfig;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  // Event callbacks
  private onAudioCallback?: (audioData: ArrayBuffer) => void;
  private onTextCallback?: (text: string, isFinal: boolean) => void;
  private onTurnCompleteCallback?: () => void;
  private onErrorCallback?: (error: Error) => void;
  private onConnectedCallback?: () => void;
  private onDisconnectedCallback?: () => void;
  private onTranscriptCallback?: (transcript: string, role: 'user' | 'assistant') => void;

  // Metrics
  private lastLatencyMs = 0;
  private sessionStartTime = 0;

  constructor(config: GeminiLiveConfig) {
    // Build system prompt with accent instructions if specified
    let systemPrompt = config.systemPrompt || '';

    if (config.accent) {
      const accentInfo = ACCENT_OPTIONS.find(a => a.id === config.accent);
      if (accentInfo) {
        // Prepend accent instructions to system prompt
        const accentPreamble = `IMPORTANT ACCENT INSTRUCTION: ${accentInfo.promptInstruction}\n\n`;
        systemPrompt = accentPreamble + systemPrompt;
        console.log('[GeminiLive] Using accent:', config.accent);
      }
    }

    this.config = {
      apiKey: config.apiKey,
      model: config.model || 'gemini-2.0-flash-exp',
      voice: config.voice || 'Kore',
      accent: config.accent,
      systemPrompt,
      language: config.language || 'es',
      enableBargeIn: config.enableBargeIn ?? true,
    };
  }

  /**
   * Connect to Gemini Live API
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      console.warn('[GeminiLive] Already connected');
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        // Build WebSocket URL - v1alpha is required for gemini-2.0-flash-exp
        const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${this.config.apiKey}`;

        this.ws = new WebSocket(wsUrl);
        // Configure WebSocket for binary data in React Native
        (this.ws as any).binaryType = 'arraybuffer';
        this.sessionStartTime = Date.now();

        this.ws.onopen = () => {
          console.log('[GeminiLive] WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;

          // Send setup message
          this.sendSetupMessage();

          this.onConnectedCallback?.();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (event) => {
          console.error('[GeminiLive] WebSocket error:', event);
          const error = new Error('WebSocket connection error');
          this.onErrorCallback?.(error);
          reject(error);
        };

        this.ws.onclose = (event) => {
          console.log('[GeminiLive] WebSocket closed - code:', event.code, 'reason:', event.reason, 'wasClean:', event.wasClean);
          this.isConnected = false;

          // Surface the error reason to the user
          if (event.reason && event.code !== 1000) {
            const errorMessage = event.reason.includes('quota')
              ? 'API quota exceeded. Please wait a few minutes and try again.'
              : event.reason.includes('invalid argument')
              ? 'Invalid API configuration. Please check your setup.'
              : event.reason;
            this.onErrorCallback?.(new Error(errorMessage));
          }

          this.onDisconnectedCallback?.();

          // Only attempt reconnection for recoverable errors (not quota or auth issues)
          const isRecoverable = event.code !== 1000 &&
            !event.reason?.includes('quota') &&
            !event.reason?.includes('invalid') &&
            this.reconnectAttempts < this.maxReconnectAttempts;

          if (isRecoverable) {
            this.reconnectAttempts++;
            console.log(`[GeminiLive] Attempting reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => this.connect(), 1000 * this.reconnectAttempts);
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Send setup message to configure the session
   * Format follows v1alpha API spec for gemini-2.0-flash-exp
   */
  private sendSetupMessage(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const setupMessage = {
      setup: {
        model: `models/${this.config.model}`,
        generationConfig: {
          // AUDIO only - TEXT modality causes issues with some models
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: this.config.voice,
              },
            },
          },
        },
        ...(this.config.systemPrompt && {
          systemInstruction: {
            parts: [{ text: this.config.systemPrompt }],
          },
        }),
      },
    };

    console.log('[GeminiLive] Sending setup message:', JSON.stringify(setupMessage).slice(0, 500));
    this.ws.send(JSON.stringify(setupMessage));
    console.log('[GeminiLive] Setup message sent');
  }

  /**
   * Handle incoming WebSocket messages
   * Gemini Live sends JSON messages (possibly as binary ArrayBuffer)
   * Audio data is base64-encoded inside the JSON, NOT raw binary
   */
  private async handleMessage(data: string | ArrayBuffer | Blob): Promise<void> {
    try {
      let jsonString: string;

      // Handle ArrayBuffer (binary data that's actually UTF-8 JSON)
      if (data instanceof ArrayBuffer) {
        const decoder = new TextDecoder('utf-8');
        jsonString = decoder.decode(data);
        console.log('[GeminiLive] Decoded ArrayBuffer to JSON:', jsonString.substring(0, 100));
      }
      // Handle Blob (React Native may send Blob)
      else if (data instanceof Blob) {
        jsonString = await data.text();
        console.log('[GeminiLive] Decoded Blob to JSON:', jsonString.substring(0, 100));
      }
      // Already a string
      else {
        jsonString = data;
      }

      // Parse JSON
      const message = JSON.parse(jsonString);

      // Log message keys for debugging
      const keys = Object.keys(message);
      console.log('[GeminiLive] Message keys:', keys.join(', '));

      // Server content (audio/text response from AI)
      if (message.serverContent) {
        const content = message.serverContent;
        console.log('[GeminiLive] serverContent keys:', Object.keys(content).join(', '));

        // Model turn with audio/text
        if (content.modelTurn?.parts) {
          console.log('[GeminiLive] Model turn parts count:', content.modelTurn.parts.length);

          for (const part of content.modelTurn.parts) {
            // Audio response (base64 encoded in JSON)
            if (part.inlineData?.mimeType?.startsWith('audio/')) {
              console.log('[GeminiLive] Audio part - mimeType:', part.inlineData.mimeType, 'data length:', part.inlineData.data?.length);
              const audioBase64 = part.inlineData.data;
              const audioBuffer = this.base64ToArrayBuffer(audioBase64);
              this.onAudioCallback?.(audioBuffer);
            }

            // Text response (AI transcript)
            if (part.text) {
              console.log('[GeminiLive] Text part (AI):', part.text.slice(0, 100));
              this.onTextCallback?.(part.text, false);
              this.onTranscriptCallback?.(part.text, 'assistant');
            }
          }
        }

        // Input transcript (user's speech transcribed)
        if (content.inputTranscript) {
          // User speech content not logged for privacy (GDPR)
          this.onTranscriptCallback?.(content.inputTranscript, 'user');
        }

        // Turn complete
        if (content.turnComplete) {
          console.log('[GeminiLive] Turn complete');
          this.lastLatencyMs = Date.now() - this.sessionStartTime;
          this.onTurnCompleteCallback?.();
        }

        // Interrupted (barge-in)
        if (content.interrupted) {
          console.log('[GeminiLive] Response interrupted');
        }
      }

      // Setup complete
      if (message.setupComplete) {
        console.log('[GeminiLive] Setup complete, ready for conversation');
      }

      // Tool calls (for future function calling support)
      if (message.toolCall) {
        console.log('[GeminiLive] Tool call received:', message.toolCall);
      }

      // Error from server
      if (message.error) {
        console.error('[GeminiLive] Server error:', message.error);
        this.onErrorCallback?.(new Error(message.error.message || 'Server error'));
      }

    } catch (error) {
      console.error('[GeminiLive] Error handling message:', error);
      console.error('[GeminiLive] Raw data type:', typeof data);
    }
  }

  /**
   * Send audio data to Gemini
   * Uses clientContent format with inlineData (validated working in test)
   * @param audioData - WAV or PCM audio data
   * @param mimeType - Audio mime type (default: audio/wav)
   */
  sendAudio(audioData: ArrayBuffer, mimeType: string = 'audio/wav'): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[GeminiLive] Cannot send audio: not connected');
      return;
    }

    const base64Audio = this.arrayBufferToBase64(audioData);

    // Use clientContent format (same as text) with inlineData
    // This format was validated working in our test
    const message = {
      clientContent: {
        turns: [{
          role: 'user',
          parts: [{
            inlineData: {
              mimeType,
              data: base64Audio,
            },
          }],
        }],
        turnComplete: true,
      },
    };

    console.log('[GeminiLive] Sending audio:', base64Audio.length, 'chars, mimeType:', mimeType);
    this.ws.send(JSON.stringify(message));
  }

  /**
   * Send audio using realtimeInput format (alternative method)
   * @param audioData - PCM audio data
   */
  sendAudioStream(audioData: ArrayBuffer): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[GeminiLive] Cannot send audio: not connected');
      return;
    }

    const base64Audio = this.arrayBufferToBase64(audioData);

    const message: AudioInputMessage = {
      realtimeInput: {
        mediaChunks: [{
          mimeType: 'audio/pcm;rate=16000',
          data: base64Audio,
        }],
      },
    };

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Send text message (for testing or hybrid mode)
   */
  sendText(text: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[GeminiLive] Cannot send text: not connected');
      return;
    }

    const message: TextInputMessage = {
      clientContent: {
        turns: [{
          role: 'user',
          parts: [{ text }],
        }],
        turnComplete: true,
      },
    };

    this.ws.send(JSON.stringify(message));
    this.onTranscriptCallback?.(text, 'user');
  }

  /**
   * Signal end of user audio input
   */
  endAudioInput(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    // Send empty audio chunk to signal end of input
    const message: AudioInputMessage = {
      realtimeInput: {
        mediaChunks: [],
      },
    };

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Disconnect from Gemini Live API
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.isConnected = false;
  }

  // =============================================================================
  // Event Handlers
  // =============================================================================

  /**
   * Register callback for audio responses
   */
  onAudioResponse(callback: (audioData: ArrayBuffer) => void): void {
    this.onAudioCallback = callback;
  }

  /**
   * Register callback for text responses
   */
  onText(callback: (text: string, isFinal: boolean) => void): void {
    this.onTextCallback = callback;
  }

  /**
   * Register callback for turn completion
   */
  onTurnComplete(callback: () => void): void {
    this.onTurnCompleteCallback = callback;
  }

  /**
   * Register callback for errors
   */
  onError(callback: (error: Error) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * Register callback for connection established
   */
  onConnected(callback: () => void): void {
    this.onConnectedCallback = callback;
  }

  /**
   * Register callback for disconnection
   */
  onDisconnected(callback: () => void): void {
    this.onDisconnectedCallback = callback;
  }

  /**
   * Register callback for transcripts (both user and assistant)
   */
  onTranscript(callback: (transcript: string, role: 'user' | 'assistant') => void): void {
    this.onTranscriptCallback = callback;
  }

  // =============================================================================
  // Utilities
  // =============================================================================

  /**
   * Check if connected
   */
  getIsConnected(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get session duration in seconds
   */
  getSessionDuration(): number {
    if (!this.sessionStartTime) return 0;
    return Math.floor((Date.now() - this.sessionStartTime) / 1000);
  }

  /**
   * Get last measured latency
   */
  getLatencyMs(): number {
    return this.lastLatencyMs;
  }

  /**
   * Update system prompt mid-session
   */
  updateSystemPrompt(prompt: string): void {
    this.config.systemPrompt = prompt;
    // Note: This requires reconnecting to take effect
    if (this.isConnected) {
      console.warn('[GeminiLive] System prompt updated. Reconnect required for changes to take effect.');
    }
  }

  /**
   * Update voice mid-session
   */
  updateVoice(voice: GeminiVoice): void {
    this.config.voice = voice;
    // Note: This requires reconnecting to take effect
    if (this.isConnected) {
      console.warn('[GeminiLive] Voice updated. Reconnect required for changes to take effect.');
    }
  }

  // =============================================================================
  // Private Helpers
  // =============================================================================

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a Gemini Live client configured for a scenario
 */
export function createGeminiLiveClient(
  apiKey: string,
  scenario: VoiceScenario,
  character?: CharacterVoice
): GeminiLiveClient {
  return new GeminiLiveClient({
    apiKey,
    systemPrompt: scenario.systemPromptTemplate,
    voice: character?.geminiVoice || 'Kore',
    language: scenario.language,
  });
}

/**
 * Create a simple conversation client
 */
export function createSimpleConversationClient(
  apiKey: string,
  options: {
    voice?: GeminiVoice;
    language?: SupportedLanguage;
    systemPrompt?: string;
  } = {}
): GeminiLiveClient {
  const defaultPrompt = options.language === 'es'
    ? `Eres un tutor amigable de español. Habla de forma clara y paciente.
       Corrige los errores de forma amable con sugerencias como "También podrías decir...".
       Mantén las respuestas cortas (1-2 oraciones).`
    : `You are a friendly language tutor. Speak clearly and patiently.
       Correct mistakes gently with suggestions like "You could also say...".
       Keep responses short (1-2 sentences).`;

  return new GeminiLiveClient({
    apiKey,
    systemPrompt: options.systemPrompt || defaultPrompt,
    voice: options.voice || 'Kore',
    language: options.language || 'es',
  });
}
