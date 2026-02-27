/**
 * Hybrid Voice Conversation Service
 *
 * Cost-effective voice conversation using:
 * - Whisper API (or self-hosted) for speech-to-text
 * - Gemini Text API for conversation (much cheaper than Live API)
 * - expo-speech for TTS (free)
 *
 * This approach is:
 * - 10-50x cheaper than Gemini Live API
 * - More reliable (no WebSocket connection issues)
 * - Works offline for TTS
 * - Supports fallback to mock mode for testing
 *
 * @example
 * ```typescript
 * const conversation = new HybridVoiceConversation({
 *   systemPrompt: 'You are a Spanish tutor...',
 *   language: 'es',
 * });
 *
 * await conversation.initialize();
 *
 * // User speaks -> transcribe -> AI response -> TTS
 * const response = await conversation.processUserAudio(audioUri);
 * // response.userText = what user said
 * // response.aiText = AI response
 * // response.audioPlaying = true (TTS is playing)
 * ```
 */

import * as Speech from 'expo-speech';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { transcribeAudio, isWhisperAvailable, getWhisperProviderInfo } from '@/lib/reading/speechToText';
import type { TranscriptionResult } from '@/lib/reading/speechToText';
import type { VoiceScenario, ConversationMessage, SupportedLanguage } from './types';
import { generateSystemPrompt } from './scenarios';

// =============================================================================
// Types
// =============================================================================

export type ConversationMode = 'hybrid' | 'gemini-live' | 'text-only' | 'mock';

export interface HybridConversationConfig {
  /** System prompt for AI personality */
  systemPrompt?: string;
  /** Pre-defined scenario (alternative to systemPrompt) */
  scenario?: VoiceScenario;
  /** Target language code */
  language?: SupportedLanguage;
  /** User's name for personalization */
  userName?: string;
  /** TTS voice (expo-speech voice identifier) */
  ttsVoice?: string;
  /** TTS speech rate (0.5 to 2.0) */
  ttsRate?: number;
  /** TTS pitch (0.5 to 2.0) */
  ttsPitch?: number;
  /** Enable mock mode for testing without APIs */
  mockMode?: boolean;
  /** Max conversation history to maintain */
  maxHistoryLength?: number;
}

export interface ConversationTurn {
  userText: string;
  aiText: string;
  userAudioUri?: string;
  timestamp: number;
  processingTimeMs: number;
}

export interface ProcessAudioResult {
  userText: string;
  aiText: string;
  transcriptionResult?: TranscriptionResult;
  processingTimeMs: number;
  isPlaying: boolean;
}

export interface ConversationStatus {
  mode: ConversationMode;
  isInitialized: boolean;
  whisperAvailable: boolean;
  whisperProvider: 'openai' | 'self-hosted' | 'none';
  geminiAvailable: boolean;
  ttsAvailable: boolean;
  turnCount: number;
  totalProcessingTimeMs: number;
}

// =============================================================================
// TTS Language Mapping
// =============================================================================

const TTS_LANGUAGE_MAP: Record<SupportedLanguage, string> = {
  es: 'es-ES',
  en: 'en-US',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
  pt: 'pt-BR',
};

// =============================================================================
// Hybrid Voice Conversation Class
// =============================================================================

export class HybridVoiceConversation {
  private config: Required<HybridConversationConfig>;
  private geminiClient: GoogleGenerativeAI | null = null;
  private conversationHistory: ConversationMessage[] = [];
  private turns: ConversationTurn[] = [];
  private isInitialized = false;
  private isSpeaking = false;
  private mode: ConversationMode = 'hybrid';

  // Callbacks
  private onUserTranscript?: (text: string) => void;
  private onAiResponse?: (text: string) => void;
  private onTtsStart?: () => void;
  private onTtsEnd?: () => void;
  private onError?: (error: Error) => void;

  constructor(config: HybridConversationConfig = {}) {
    this.config = {
      systemPrompt: config.systemPrompt || this.getDefaultPrompt(config.language || 'es'),
      scenario: config.scenario as VoiceScenario,
      language: config.language || 'es',
      userName: config.userName || '',
      ttsVoice: config.ttsVoice || '',
      ttsRate: config.ttsRate || 0.9,
      ttsPitch: config.ttsPitch || 1.0,
      mockMode: config.mockMode || false,
      maxHistoryLength: config.maxHistoryLength || 20,
    };

    // If scenario provided, generate system prompt from it
    if (config.scenario) {
      this.config.systemPrompt = generateSystemPrompt(config.scenario, config.userName);
    }
  }

  private getDefaultPrompt(language: SupportedLanguage): string {
    const prompts: Record<SupportedLanguage, string> = {
      es: `Eres un tutor amigable de español. Habla de forma clara y natural.
           Corrige errores gentilmente con sugerencias como "También podrías decir...".
           Mantén respuestas cortas (1-2 oraciones). Sé paciente y alentador.`,
      en: `You are a friendly English tutor. Speak clearly and naturally.
           Correct mistakes gently with suggestions like "You could also say...".
           Keep responses short (1-2 sentences). Be patient and encouraging.`,
      fr: `Tu es un tuteur de français amical. Parle clairement et naturellement.
           Corrige les erreurs gentiment. Garde les réponses courtes (1-2 phrases).`,
      de: `Du bist ein freundlicher Deutschlehrer. Sprich klar und natürlich.
           Korrigiere Fehler sanft. Halte Antworten kurz (1-2 Sätze).`,
      it: `Sei un tutor di italiano amichevole. Parla in modo chiaro e naturale.
           Correggi gli errori gentilmente. Mantieni le risposte brevi (1-2 frasi).`,
      pt: `Você é um tutor amigável de português. Fale de forma clara e natural.
           Corrija erros gentilmente. Mantenha as respostas curtas (1-2 frases).`,
    };
    return prompts[language] || prompts.en;
  }

  // ===========================================================================
  // Initialization
  // ===========================================================================

  async initialize(): Promise<ConversationStatus> {
    console.log('[HybridConversation] Initializing...');

    const status: ConversationStatus = {
      mode: 'hybrid',
      isInitialized: false,
      whisperAvailable: false,
      whisperProvider: 'none',
      geminiAvailable: false,
      ttsAvailable: false,
      turnCount: 0,
      totalProcessingTimeMs: 0,
    };

    // Check Whisper availability
    if (!this.config.mockMode) {
      status.whisperAvailable = await isWhisperAvailable();
      const providerInfo = getWhisperProviderInfo();
      status.whisperProvider = providerInfo.provider;
      console.log('[HybridConversation] Whisper:', status.whisperProvider, status.whisperAvailable);
    }

    // Initialize Gemini
    const geminiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (geminiKey && !this.config.mockMode) {
      try {
        this.geminiClient = new GoogleGenerativeAI(geminiKey);
        status.geminiAvailable = true;
        console.log('[HybridConversation] Gemini: available');
      } catch (error) {
        console.error('[HybridConversation] Gemini init error:', error);
      }
    }

    // Check TTS availability
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      status.ttsAvailable = voices.length > 0;
      console.log('[HybridConversation] TTS voices:', voices.length);
    } catch (error) {
      console.warn('[HybridConversation] TTS check error:', error);
    }

    // Determine mode based on availability
    if (this.config.mockMode) {
      this.mode = 'mock';
    } else if (status.whisperAvailable && status.geminiAvailable && status.ttsAvailable) {
      this.mode = 'hybrid';
    } else if (status.geminiAvailable) {
      this.mode = 'text-only';
    } else {
      this.mode = 'mock';
    }

    status.mode = this.mode;
    this.isInitialized = true;
    status.isInitialized = true;

    console.log('[HybridConversation] Mode:', this.mode);
    return status;
  }

  // ===========================================================================
  // Main Processing
  // ===========================================================================

  /**
   * Process user audio: transcribe -> AI response -> TTS
   */
  async processUserAudio(audioUri: string): Promise<ProcessAudioResult> {
    const startTime = Date.now();

    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Step 1: Transcribe user audio
      console.log('[HybridConversation] Transcribing audio...');
      const transcription = await this.transcribeAudio(audioUri);
      const userText = transcription.text.trim();

      if (!userText) {
        throw new Error('No speech detected in audio');
      }

      // User speech content not logged for privacy (GDPR)
      this.onUserTranscript?.(userText);

      // Add to history
      this.addMessage('user', userText);

      // Step 2: Get AI response
      console.log('[HybridConversation] Getting AI response...');
      const aiText = await this.getAiResponse(userText);
      console.log('[HybridConversation] AI response:', aiText);
      this.onAiResponse?.(aiText);

      // Add to history
      this.addMessage('assistant', aiText);

      // Step 3: Speak response
      console.log('[HybridConversation] Speaking response...');
      await this.speakText(aiText);

      const processingTimeMs = Date.now() - startTime;

      // Record turn
      this.turns.push({
        userText,
        aiText,
        userAudioUri: audioUri,
        timestamp: Date.now(),
        processingTimeMs,
      });

      return {
        userText,
        aiText,
        transcriptionResult: transcription,
        processingTimeMs,
        isPlaying: this.isSpeaking,
      };
    } catch (error) {
      console.error('[HybridConversation] Process error:', error);
      this.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Process text input directly (skip transcription)
   */
  async processUserText(userText: string): Promise<ProcessAudioResult> {
    const startTime = Date.now();

    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      this.onUserTranscript?.(userText);
      this.addMessage('user', userText);

      const aiText = await this.getAiResponse(userText);
      this.onAiResponse?.(aiText);
      this.addMessage('assistant', aiText);

      await this.speakText(aiText);

      const processingTimeMs = Date.now() - startTime;

      this.turns.push({
        userText,
        aiText,
        timestamp: Date.now(),
        processingTimeMs,
      });

      return {
        userText,
        aiText,
        processingTimeMs,
        isPlaying: this.isSpeaking,
      };
    } catch (error) {
      console.error('[HybridConversation] Process text error:', error);
      this.onError?.(error as Error);
      throw error;
    }
  }

  // ===========================================================================
  // Speech-to-Text (Whisper)
  // ===========================================================================

  private async transcribeAudio(audioUri: string): Promise<TranscriptionResult> {
    if (this.mode === 'mock') {
      // Mock transcription for testing
      return this.mockTranscribe();
    }

    return transcribeAudio(audioUri, {
      language: this.config.language,
      temperature: 0.2,
    });
  }

  private async mockTranscribe(): Promise<TranscriptionResult> {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockPhrases = [
      'Hola, ¿cómo estás?',
      'Me gustaría un café, por favor.',
      '¿Cuánto cuesta?',
      'Gracias, hasta luego.',
      'No entiendo, ¿puedes repetir?',
    ];

    const text = mockPhrases[Math.floor(Math.random() * mockPhrases.length)];

    return {
      text,
      segments: [{ id: 0, start: 0, end: 2, text }],
      words: text.split(' ').map((word, i) => ({
        word,
        start: i * 0.3,
        end: (i + 1) * 0.3,
      })),
      language: this.config.language,
      duration: 2,
    };
  }

  // ===========================================================================
  // AI Response (Gemini Text)
  // ===========================================================================

  private async getAiResponse(userText: string): Promise<string> {
    if (this.mode === 'mock' || !this.geminiClient) {
      return this.mockAiResponse(userText);
    }

    try {
      const model = this.geminiClient.getGenerativeModel({
        model: 'gemini-2.0-flash',
      });

      // Build conversation context
      const conversationContext = this.buildConversationContext();

      const prompt = `${this.config.systemPrompt}

Previous conversation:
${conversationContext}

User: ${userText}

Respond naturally in ${this.getLanguageName()}. Keep it conversational and brief (1-2 sentences).`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      return response.trim();
    } catch (error) {
      console.error('[HybridConversation] Gemini error:', error);
      // Fallback to mock on error
      return this.mockAiResponse(userText);
    }
  }

  private mockAiResponse(userText: string): string {
    const responses: Record<SupportedLanguage, string[]> = {
      es: [
        '¡Muy bien! Tu pronunciación está mejorando.',
        'Excelente pregunta. Déjame explicarte...',
        '¡Perfecto! Sigamos practicando.',
        'Entiendo. ¿Quieres que repita más lento?',
      ],
      en: [
        'Great job! Your pronunciation is improving.',
        'Excellent question. Let me explain...',
        'Perfect! Let\'s keep practicing.',
        'I understand. Would you like me to repeat slower?',
      ],
      fr: ['Très bien! Continue comme ça.'],
      de: ['Sehr gut! Weiter so.'],
      it: ['Molto bene! Continua così.'],
      pt: ['Muito bem! Continue assim.'],
    };

    const langResponses = responses[this.config.language] || responses.en;
    return langResponses[Math.floor(Math.random() * langResponses.length)];
  }

  private buildConversationContext(): string {
    const recentHistory = this.conversationHistory.slice(-6); // Last 3 exchanges
    return recentHistory
      .map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`)
      .join('\n');
  }

  private getLanguageName(): string {
    const names: Record<SupportedLanguage, string> = {
      es: 'Spanish',
      en: 'English',
      fr: 'French',
      de: 'German',
      it: 'Italian',
      pt: 'Portuguese',
    };
    return names[this.config.language] || 'the target language';
  }

  // ===========================================================================
  // Text-to-Speech (expo-speech)
  // ===========================================================================

  async speakText(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.isSpeaking = true;
      this.onTtsStart?.();

      const ttsLanguage = TTS_LANGUAGE_MAP[this.config.language] || 'en-US';

      Speech.speak(text, {
        language: ttsLanguage,
        rate: this.config.ttsRate,
        pitch: this.config.ttsPitch,
        voice: this.config.ttsVoice || undefined,
        onStart: () => {
          console.log('[HybridConversation] TTS started');
        },
        onDone: () => {
          console.log('[HybridConversation] TTS done');
          this.isSpeaking = false;
          this.onTtsEnd?.();
          resolve();
        },
        onError: (error) => {
          console.error('[HybridConversation] TTS error:', error);
          this.isSpeaking = false;
          this.onTtsEnd?.();
          reject(new Error('TTS failed'));
        },
      });
    });
  }

  stopSpeaking(): void {
    Speech.stop();
    this.isSpeaking = false;
    this.onTtsEnd?.();
  }

  // ===========================================================================
  // History Management
  // ===========================================================================

  private addMessage(role: 'user' | 'assistant', content: string): void {
    this.conversationHistory.push({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: Date.now(),
    });

    // Trim history if too long
    if (this.conversationHistory.length > this.config.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(-this.config.maxHistoryLength);
    }
  }

  getHistory(): ConversationMessage[] {
    return [...this.conversationHistory];
  }

  getTurns(): ConversationTurn[] {
    return [...this.turns];
  }

  clearHistory(): void {
    this.conversationHistory = [];
    this.turns = [];
  }

  // ===========================================================================
  // Event Handlers
  // ===========================================================================

  onUserTranscriptCallback(callback: (text: string) => void): void {
    this.onUserTranscript = callback;
  }

  onAiResponseCallback(callback: (text: string) => void): void {
    this.onAiResponse = callback;
  }

  onTtsStartCallback(callback: () => void): void {
    this.onTtsStart = callback;
  }

  onTtsEndCallback(callback: () => void): void {
    this.onTtsEnd = callback;
  }

  onErrorCallback(callback: (error: Error) => void): void {
    this.onError = callback;
  }

  // ===========================================================================
  // Status
  // ===========================================================================

  getStatus(): ConversationStatus {
    return {
      mode: this.mode,
      isInitialized: this.isInitialized,
      whisperAvailable: this.mode !== 'mock' && this.mode !== 'text-only',
      whisperProvider: getWhisperProviderInfo().provider,
      geminiAvailable: !!this.geminiClient,
      ttsAvailable: true,
      turnCount: this.turns.length,
      totalProcessingTimeMs: this.turns.reduce((sum, t) => sum + t.processingTimeMs, 0),
    };
  }

  getMode(): ConversationMode {
    return this.mode;
  }

  isSpeakingNow(): boolean {
    return this.isSpeaking;
  }

  // ===========================================================================
  // Cleanup
  // ===========================================================================

  cleanup(): void {
    this.stopSpeaking();
    this.clearHistory();
    this.isInitialized = false;
  }
}

// =============================================================================
// Factory Functions
// =============================================================================

/**
 * Create a hybrid conversation for a scenario
 */
export function createHybridConversation(
  scenario: VoiceScenario,
  userName?: string
): HybridVoiceConversation {
  return new HybridVoiceConversation({
    scenario,
    userName,
    language: scenario.language,
  });
}

/**
 * Create a simple conversation with custom prompt
 */
export function createSimpleConversation(
  language: SupportedLanguage = 'es',
  systemPrompt?: string
): HybridVoiceConversation {
  return new HybridVoiceConversation({
    language,
    systemPrompt,
  });
}

/**
 * Create a mock conversation for testing
 */
export function createMockConversation(
  language: SupportedLanguage = 'es'
): HybridVoiceConversation {
  return new HybridVoiceConversation({
    language,
    mockMode: true,
  });
}
