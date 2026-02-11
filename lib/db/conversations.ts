/**
 * Conversation Session Persistence Layer
 *
 * Saves and retrieves ElevenLabs voice conversation sessions to Supabase.
 * Used by: post-call feedback, conversation history, vocab-conversation loop.
 */

import { supabase } from '@/lib/db/supabase';
import type { ElevenLabsMessage, ConversationSession } from '@/lib/voice/elevenLabsTypes';

// =============================================================================
// Types
// =============================================================================

export interface ConversationFeedback {
  /** Articulation score 0-100: Can they pronounce clearly? */
  articulation: number;
  /** Fluency score 0-100: Can they speak without excessive pausing? */
  fluency: number;
  /** Communication score 0-100: Can they express their meaning? */
  communication: number;
  /** Scenario score 0-100: Can they handle the real-world situation? */
  scenario: number;
  /** Overall summary text */
  summary: string;
  /** Specific strengths observed */
  strengths: string[];
  /** Areas for improvement */
  improvements: string[];
  /** New vocabulary learned during conversation */
  newVocabulary: string[];
}

export interface SaveSessionInput {
  userId: string;
  elevenLabsConversationId?: string;
  scenario: string;
  scenarioDescription?: string;
  voiceId?: string;
  accent?: string;
  proficiency: string;
  targetLanguage: string;
  startedAt: number;
  endedAt?: number;
  durationSeconds: number;
  turnCount: number;
  userWordCount: number;
  avgWordsPerTurn: number;
  pointsEarned: number;
  messages: ElevenLabsMessage[];
  stairStepId?: string;
  vocabPrepWords?: string[];
}

export interface StoredSession {
  id: string;
  userId: string;
  scenario: string;
  scenarioDescription?: string;
  voiceId?: string;
  accent?: string;
  proficiency: string;
  targetLanguage: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  turnCount: number;
  userWordCount: number;
  avgWordsPerTurn: number;
  pointsEarned: number;
  feedback?: ConversationFeedback;
  vocabPrepWords: string[];
  vocabUsedWords: string[];
  vocabMissedWords: string[];
  stairStepId?: string;
  createdAt: string;
}

export interface StoredMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  wordCount: number;
  timestampMs: number;
}

// =============================================================================
// Save Operations
// =============================================================================

/**
 * Save a completed conversation session and its messages.
 * Returns the session ID for subsequent feedback updates.
 */
export async function saveConversationSession(
  input: SaveSessionInput
): Promise<string | null> {
  try {
    // 1. Insert session
    const { data: session, error: sessionError } = await supabase
      .from('conversation_sessions')
      .insert({
        user_id: input.userId,
        elevenlabs_conversation_id: input.elevenLabsConversationId || null,
        scenario: input.scenario,
        scenario_description: input.scenarioDescription || null,
        voice_id: input.voiceId || null,
        accent: input.accent || null,
        proficiency: input.proficiency,
        target_language: input.targetLanguage,
        started_at: new Date(input.startedAt).toISOString(),
        ended_at: input.endedAt ? new Date(input.endedAt).toISOString() : new Date().toISOString(),
        duration_seconds: input.durationSeconds,
        turn_count: input.turnCount,
        user_word_count: input.userWordCount,
        avg_words_per_turn: input.avgWordsPerTurn,
        points_earned: input.pointsEarned,
        vocab_prep_words: input.vocabPrepWords || [],
        stair_step_id: input.stairStepId || null,
      })
      .select('id')
      .single();

    if (sessionError || !session) {
      console.error('[Conversations] Error saving session:', sessionError);
      return null;
    }

    // 2. Insert messages
    if (input.messages.length > 0) {
      const messagesData = input.messages.map((msg) => ({
        session_id: session.id,
        role: msg.role,
        content: msg.content,
        word_count: msg.wordCount || msg.content.split(' ').length,
        timestamp_ms: msg.timestamp,
      }));

      const { error: messagesError } = await supabase
        .from('conversation_messages')
        .insert(messagesData);

      if (messagesError) {
        console.error('[Conversations] Error saving messages:', messagesError);
        // Session was saved, messages failed — not fatal
      }
    }

    console.log(`[Conversations] Saved session ${session.id} (${input.messages.length} messages)`);
    return session.id;
  } catch (error) {
    console.error('[Conversations] Exception saving session:', error);
    return null;
  }
}

/**
 * Update a session with AI-generated feedback.
 */
export async function updateSessionFeedback(
  sessionId: string,
  feedback: ConversationFeedback
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('conversation_sessions')
      .update({ feedback })
      .eq('id', sessionId);

    if (error) {
      console.error('[Conversations] Error updating feedback:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Conversations] Exception updating feedback:', error);
    return false;
  }
}

/**
 * Update vocab loop results after post-call analysis.
 */
export async function updateSessionVocabResults(
  sessionId: string,
  vocabUsed: string[],
  vocabMissed: string[]
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('conversation_sessions')
      .update({
        vocab_used_words: vocabUsed,
        vocab_missed_words: vocabMissed,
      })
      .eq('id', sessionId);

    if (error) {
      console.error('[Conversations] Error updating vocab results:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Conversations] Exception updating vocab results:', error);
    return false;
  }
}

// =============================================================================
// Query Operations
// =============================================================================

/**
 * Get recent conversation sessions for a user (for history UI).
 */
export async function getRecentSessions(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<StoredSession[]> {
  try {
    const { data, error } = await supabase
      .from('conversation_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[Conversations] Error fetching sessions:', error);
      return [];
    }

    return (data || []).map(rowToStoredSession);
  } catch (error) {
    console.error('[Conversations] Exception fetching sessions:', error);
    return [];
  }
}

/**
 * Get a single session by ID.
 */
export async function getSession(sessionId: string): Promise<StoredSession | null> {
  try {
    const { data, error } = await supabase
      .from('conversation_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error || !data) {
      console.error('[Conversations] Error fetching session:', error);
      return null;
    }

    return rowToStoredSession(data);
  } catch (error) {
    console.error('[Conversations] Exception fetching session:', error);
    return null;
  }
}

/**
 * Get messages for a session (for transcript view).
 */
export async function getSessionMessages(sessionId: string): Promise<StoredMessage[]> {
  try {
    const { data, error } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp_ms', { ascending: true });

    if (error) {
      console.error('[Conversations] Error fetching messages:', error);
      return [];
    }

    return (data || []).map(rowToStoredMessage);
  } catch (error) {
    console.error('[Conversations] Exception fetching messages:', error);
    return [];
  }
}

/**
 * Get sessions for a specific stair step (for scenario completion tracking).
 */
export async function getSessionsForStair(
  userId: string,
  stairStepId: string
): Promise<StoredSession[]> {
  try {
    const { data, error } = await supabase
      .from('conversation_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('stair_step_id', stairStepId)
      .order('started_at', { ascending: false });

    if (error) {
      console.error('[Conversations] Error fetching stair sessions:', error);
      return [];
    }

    return (data || []).map(rowToStoredSession);
  } catch (error) {
    console.error('[Conversations] Exception fetching stair sessions:', error);
    return [];
  }
}

/**
 * Get aggregate stats for a user's conversations.
 */
export async function getConversationStats(userId: string): Promise<{
  totalSessions: number;
  totalMinutes: number;
  totalTurns: number;
  avgArticulation: number;
  avgFluency: number;
  avgCommunication: number;
  avgScenario: number;
} | null> {
  try {
    const { data, error } = await supabase
      .from('conversation_sessions')
      .select('duration_seconds, turn_count, feedback')
      .eq('user_id', userId);

    if (error || !data) {
      console.error('[Conversations] Error fetching stats:', error);
      return null;
    }

    const sessions = data;
    const withFeedback = sessions.filter((s: any) => s.feedback?.articulation != null);

    return {
      totalSessions: sessions.length,
      totalMinutes: Math.round(sessions.reduce((sum: number, s: any) => sum + (s.duration_seconds || 0), 0) / 60),
      totalTurns: sessions.reduce((sum: number, s: any) => sum + (s.turn_count || 0), 0),
      avgArticulation: withFeedback.length > 0
        ? Math.round(withFeedback.reduce((sum: number, s: any) => sum + s.feedback.articulation, 0) / withFeedback.length)
        : 0,
      avgFluency: withFeedback.length > 0
        ? Math.round(withFeedback.reduce((sum: number, s: any) => sum + s.feedback.fluency, 0) / withFeedback.length)
        : 0,
      avgCommunication: withFeedback.length > 0
        ? Math.round(withFeedback.reduce((sum: number, s: any) => sum + s.feedback.communication, 0) / withFeedback.length)
        : 0,
      avgScenario: withFeedback.length > 0
        ? Math.round(withFeedback.reduce((sum: number, s: any) => sum + s.feedback.scenario, 0) / withFeedback.length)
        : 0,
    };
  } catch (error) {
    console.error('[Conversations] Exception fetching stats:', error);
    return null;
  }
}

// =============================================================================
// Row Mappers
// =============================================================================

function rowToStoredSession(row: any): StoredSession {
  return {
    id: row.id,
    userId: row.user_id,
    scenario: row.scenario,
    scenarioDescription: row.scenario_description,
    voiceId: row.voice_id,
    accent: row.accent,
    proficiency: row.proficiency,
    targetLanguage: row.target_language,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    durationSeconds: row.duration_seconds,
    turnCount: row.turn_count,
    userWordCount: row.user_word_count,
    avgWordsPerTurn: row.avg_words_per_turn,
    pointsEarned: row.points_earned,
    feedback: row.feedback || undefined,
    vocabPrepWords: row.vocab_prep_words || [],
    vocabUsedWords: row.vocab_used_words || [],
    vocabMissedWords: row.vocab_missed_words || [],
    stairStepId: row.stair_step_id,
    createdAt: row.created_at,
  };
}

function rowToStoredMessage(row: any): StoredMessage {
  return {
    id: row.id,
    sessionId: row.session_id,
    role: row.role,
    content: row.content,
    wordCount: row.word_count,
    timestampMs: row.timestamp_ms,
  };
}
