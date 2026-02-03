/**
 * ElevenLabs Voice Types
 *
 * Type definitions for the ElevenLabs Conversational AI integration.
 * Used for live voice conversations in the Vox Language App.
 */

import { SupportedLanguage, AccentType } from './types';

// =============================================================================
// Connection & Session Types
// =============================================================================

export type ElevenLabsConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'disconnecting';

export type DisconnectReason = 'user' | 'agent' | 'error';

export interface ElevenLabsMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  /** Word count for analytics */
  wordCount?: number;
}

export interface ConversationSession {
  id: string;
  startTime: number;
  endTime?: number;
  messages: ElevenLabsMessage[];
  scenario: string;
  accent: AccentType;
  voiceId: string;
  /** Total points earned in session */
  pointsEarned: number;
  /** Duration in seconds */
  duration: number;
  /** Number of conversation turns */
  turnCount: number;
  /** Average words per turn */
  avgWordsPerTurn: number;
}

// =============================================================================
// Agent Configuration
// =============================================================================

export interface ElevenLabsAgentOverrides {
  /** Voice ID from ElevenLabs voice library */
  voice?: string;
  /** Speech speed (0.7 to 1.2, default 1.0) */
  speed?: number;
  /** Custom system prompt */
  systemPrompt?: string;
  /** First message the agent will say */
  firstMessage?: string;
}

export interface ElevenLabsAgentConfig {
  /** Agent ID from ElevenLabs dashboard */
  agentId: string;
  /** Optional overrides for this session */
  overrides?: ElevenLabsAgentOverrides;
}

// =============================================================================
// Callback Types
// =============================================================================

export interface ConversationCallbacks {
  onConnect?: () => void;
  onDisconnect?: (reason: DisconnectReason) => void;
  onMessage?: (message: ElevenLabsMessage) => void;
  onError?: (error: Error) => void;
  onStatusChange?: (status: ElevenLabsConnectionStatus) => void;
  /** Called when AI starts speaking */
  onAgentSpeakingStart?: () => void;
  /** Called when AI stops speaking */
  onAgentSpeakingEnd?: () => void;
}

// =============================================================================
// Voice Configuration
// =============================================================================

export interface ElevenLabsVoiceConfig {
  /** Unique identifier for this voice configuration */
  id: string;
  /** Display name (e.g., "Marie") */
  name: string;
  /** Target language code */
  language: SupportedLanguage;
  /** Accent type */
  accent: AccentType;
  /** Country flag emoji */
  flag: string;
  /** ElevenLabs voice ID from their library */
  elevenLabsVoiceId: string;
  /** Description for UI */
  description: string;
  /** Voice gender for filtering */
  gender: 'male' | 'female' | 'neutral';
  /** Suitable proficiency levels */
  proficiencyLevels: ProficiencyLevel[];
  /** Tags for categorization */
  tags?: string[];
}

export type ProficiencyLevel = 'beginner' | 'elementary' | 'intermediate' | 'advanced' | 'native';

// =============================================================================
// Speed & Emotion Control
// =============================================================================

export interface SpeedConfig {
  level: ProficiencyLevel;
  speed: number;
  description: string;
}

export const SPEED_BY_PROFICIENCY: SpeedConfig[] = [
  { level: 'beginner', speed: 0.8, description: '20% slower - clear pronunciation' },
  { level: 'elementary', speed: 0.85, description: '15% slower - comfortable pace' },
  { level: 'intermediate', speed: 0.95, description: '5% slower - near natural' },
  { level: 'advanced', speed: 1.0, description: 'Natural speed' },
  { level: 'native', speed: 1.1, description: '10% faster - challenge mode' },
];

export type EmotionType =
  | 'friendly'
  | 'professional'
  | 'urgent'
  | 'relaxed'
  | 'expressive'
  | 'patient'
  | 'encouraging';

export interface ScenarioEmotion {
  scenarioId: string;
  emotion: EmotionType;
  promptInstruction: string;
}

export const SCENARIO_EMOTIONS: ScenarioEmotion[] = [
  {
    scenarioId: 'cafe_ordering',
    emotion: 'friendly',
    promptInstruction: 'Speak warmly like a welcoming barista. Be patient and helpful.',
  },
  {
    scenarioId: 'job_interview',
    emotion: 'professional',
    promptInstruction: 'Speak formally and clearly. Be professional but encouraging.',
  },
  {
    scenarioId: 'emergency',
    emotion: 'urgent',
    promptInstruction: 'Speak with appropriate urgency. Be clear and direct.',
  },
  {
    scenarioId: 'casual_chat',
    emotion: 'relaxed',
    promptInstruction: 'Speak naturally like talking to a friend. Be warm and casual.',
  },
  {
    scenarioId: 'story_time',
    emotion: 'expressive',
    promptInstruction: 'Use full emotional range for the story. Be animated and engaging.',
  },
  {
    scenarioId: 'directions',
    emotion: 'patient',
    promptInstruction: 'Be patient and repeat if needed. Speak clearly with landmarks.',
  },
  {
    scenarioId: 'shopping',
    emotion: 'encouraging',
    promptInstruction: 'Be helpful and encouraging. Guide through the transaction.',
  },
];

// =============================================================================
// Points System
// =============================================================================

export interface PointsCalculation {
  baseTurnPoints: number;
  turnsBonus: { threshold: number; points: number };
  wordsPerTurnBonus: { threshold: number; points: number };
  durationBonus: { thresholdSeconds: number; points: number }[];
}

export const POINTS_CONFIG: PointsCalculation = {
  baseTurnPoints: 10,
  turnsBonus: { threshold: 5, points: 25 },
  wordsPerTurnBonus: { threshold: 5, points: 15 },
  durationBonus: [
    { thresholdSeconds: 120, points: 20 },  // 2+ minutes
    { thresholdSeconds: 300, points: 30 },  // 5+ minutes
    { thresholdSeconds: 600, points: 50 },  // 10+ minutes
  ],
};

/**
 * Calculate points for a conversation session
 */
export function calculateSessionPoints(session: Partial<ConversationSession>): number {
  const messages = session.messages || [];
  const userMessages = messages.filter(m => m.role === 'user');
  const turns = userMessages.length;
  const duration = session.duration || 0;

  // Calculate average words per turn
  const totalWords = userMessages.reduce((acc, m) => acc + (m.content.split(' ').length), 0);
  const avgWordsPerTurn = turns > 0 ? totalWords / turns : 0;

  let points = 0;

  // Base points per turn
  points += turns * POINTS_CONFIG.baseTurnPoints;

  // Bonus for 5+ turns
  if (turns >= POINTS_CONFIG.turnsBonus.threshold) {
    points += POINTS_CONFIG.turnsBonus.points;
  }

  // Bonus for 5+ words per turn average
  if (avgWordsPerTurn >= POINTS_CONFIG.wordsPerTurnBonus.threshold) {
    points += POINTS_CONFIG.wordsPerTurnBonus.points;
  }

  // Duration bonuses (cumulative)
  for (const bonus of POINTS_CONFIG.durationBonus) {
    if (duration >= bonus.thresholdSeconds) {
      points += bonus.points;
    }
  }

  return points;
}

// =============================================================================
// Error Types
// =============================================================================

export type ElevenLabsErrorCode =
  | 'connection_failed'
  | 'agent_not_found'
  | 'rate_limited'
  | 'credits_exhausted'
  | 'audio_permission_denied'
  | 'network_error'
  | 'unknown_error';

export interface ElevenLabsError extends Error {
  code: ElevenLabsErrorCode;
  details?: Record<string, unknown>;
}

export function createElevenLabsError(
  code: ElevenLabsErrorCode,
  message: string,
  details?: Record<string, unknown>
): ElevenLabsError {
  const error = new Error(message) as ElevenLabsError;
  error.code = code;
  error.details = details;
  return error;
}

// =============================================================================
// Analytics Types
// =============================================================================

export interface ConversationAnalytics {
  sessionId: string;
  userId: string;
  startTime: number;
  endTime: number;
  durationMinutes: number;
  turnCount: number;
  scenario: string;
  accent: AccentType;
  voiceId: string;
  proficiency: ProficiencyLevel;
  pointsEarned: number;
  provider: 'elevenlabs';
}
