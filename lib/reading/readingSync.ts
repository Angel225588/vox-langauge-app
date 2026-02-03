/**
 * Reading Session Sync
 *
 * Syncs reading sessions and recordings to Supabase.
 *
 * Architecture:
 * 1. Sessions stored locally first (SQLite) for offline-first
 * 2. Recordings uploaded to Supabase Storage (optional, user consent)
 * 3. Session metadata synced to Supabase table
 *
 * Storage bucket: 'recordings'
 * Path structure: ${userId}/reading/${sessionId}.m4a
 */

import { supabase } from '@/lib/db/supabase';
import * as FileSystem from 'expo-file-system';
import * as Network from 'expo-network';
import { ReadingSession } from './types';

// ============================================================================
// Types
// ============================================================================

export interface SyncResult {
  success: boolean;
  sessionId: string;
  recordingUrl?: string;
  error?: string;
}

export interface SyncOptions {
  /** Upload recording to cloud (requires user consent) */
  uploadRecording?: boolean;

  /** Force sync even if already synced */
  force?: boolean;
}

export interface ReadingSessionSupabase {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  source_type: string;
  source_id: string | null;
  title: string | null;
  text: string;
  difficulty: string;
  recording_url: string | null;
  recording_duration_ms: number | null;
  transcription: string | null;
  words_expected: number;
  words_spoken: number;
  articulation_score: number | null;
  fluency_score: number | null;
  overall_score: number | null;
  comprehension_score: number | null;
  problem_words: string | null; // JSON
  feedback: string | null; // JSON
  is_public: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_BUCKET = 'recordings';
const READING_FOLDER = 'reading';

// ============================================================================
// Network Check
// ============================================================================

async function isOnline(): Promise<boolean> {
  try {
    const state = await Network.getNetworkStateAsync();
    return !!(state.isConnected && state.isInternetReachable);
  } catch {
    return false;
  }
}

// ============================================================================
// Recording Upload
// ============================================================================

/**
 * Upload a recording to Supabase Storage
 *
 * @param localUri - Local file URI (file://...)
 * @param userId - User's Supabase ID
 * @param sessionId - Reading session ID
 * @returns Public URL of uploaded file, or null if failed
 */
export async function uploadRecording(
  localUri: string,
  userId: string,
  sessionId: string
): Promise<string | null> {
  try {
    // Verify file exists
    const fileInfo = await FileSystem.getInfoAsync(localUri);
    if (!fileInfo.exists) {
      console.error('[ReadingSync] Recording file not found:', localUri);
      return null;
    }

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: 'base64' as const,
    });

    // Convert base64 to ArrayBuffer for Supabase
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Build storage path
    const storagePath = `${userId}/${READING_FOLDER}/${sessionId}.m4a`;

    console.log('[ReadingSync] Uploading recording to:', storagePath);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, bytes.buffer, {
        contentType: 'audio/mp4',
        upsert: true, // Overwrite if exists
      });

    if (error) {
      console.error('[ReadingSync] Upload error:', error.message);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    console.log('[ReadingSync] Recording uploaded:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error('[ReadingSync] Upload failed:', error);
    return null;
  }
}

/**
 * Delete a recording from Supabase Storage
 */
export async function deleteRecording(
  userId: string,
  sessionId: string
): Promise<boolean> {
  try {
    const storagePath = `${userId}/${READING_FOLDER}/${sessionId}.m4a`;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([storagePath]);

    if (error) {
      console.error('[ReadingSync] Delete error:', error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[ReadingSync] Delete failed:', error);
    return false;
  }
}

// ============================================================================
// Session Sync
// ============================================================================

/**
 * Sync a reading session to Supabase
 *
 * @param session - Local reading session
 * @param userId - User's Supabase ID
 * @param options - Sync options
 * @returns Sync result with success status
 */
export async function syncReadingSession(
  session: ReadingSession,
  userId: string,
  options: SyncOptions = {}
): Promise<SyncResult> {
  const { uploadRecording: shouldUpload = false } = options;

  try {
    // Check network
    if (!(await isOnline())) {
      return {
        success: false,
        sessionId: session.id,
        error: 'No network connection',
      };
    }

    let recordingUrl: string | null = null;

    // Upload recording if requested and available
    if (shouldUpload && session.recordingUri) {
      recordingUrl = await uploadRecording(
        session.recordingUri,
        userId,
        session.id
      );
    }

    // Convert session to Supabase format
    const supabaseSession: ReadingSessionSupabase = {
      id: session.id,
      user_id: userId,
      created_at: session.createdAt,
      updated_at: session.updatedAt,
      source_type: session.sourceType,
      source_id: session.sourceId || null,
      title: session.title || null,
      text: session.text,
      difficulty: session.difficulty,
      recording_url: recordingUrl,
      recording_duration_ms: session.recordingDurationMs || null,
      transcription: session.transcription || null,
      words_expected: session.wordsExpected,
      words_spoken: session.wordsSpoken,
      articulation_score: session.articulationScore || null,
      fluency_score: session.fluencyScore || null,
      overall_score: session.overallScore || null,
      comprehension_score: (session as any).comprehensionScore || null,
      problem_words: session.problemWords ? JSON.stringify(session.problemWords) : null,
      feedback: session.feedback ? JSON.stringify(session.feedback) : null,
      is_public: session.isPublic || false,
    };

    // Upsert to Supabase
    const { error } = await supabase
      .from('reading_sessions')
      .upsert(supabaseSession, { onConflict: 'id' });

    if (error) {
      console.error('[ReadingSync] Sync error:', error.message);
      return {
        success: false,
        sessionId: session.id,
        error: error.message,
      };
    }

    console.log('[ReadingSync] Session synced:', session.id);
    return {
      success: true,
      sessionId: session.id,
      recordingUrl: recordingUrl || undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[ReadingSync] Sync failed:', message);
    return {
      success: false,
      sessionId: session.id,
      error: message,
    };
  }
}

/**
 * Sync multiple reading sessions
 */
export async function syncReadingSessions(
  sessions: ReadingSession[],
  userId: string,
  options: SyncOptions = {}
): Promise<SyncResult[]> {
  const results: SyncResult[] = [];

  for (const session of sessions) {
    const result = await syncReadingSession(session, userId, options);
    results.push(result);
  }

  return results;
}

/**
 * Fetch reading sessions from Supabase
 */
export async function fetchCloudSessions(
  userId: string,
  limit = 50
): Promise<ReadingSession[]> {
  try {
    if (!(await isOnline())) {
      return [];
    }

    const { data, error } = await supabase
      .from('reading_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[ReadingSync] Fetch error:', error.message);
      return [];
    }

    // Convert to local format
    return (data || []).map(convertFromSupabase);
  } catch (error) {
    console.error('[ReadingSync] Fetch failed:', error);
    return [];
  }
}

/**
 * Convert Supabase session to local format
 */
function convertFromSupabase(row: ReadingSessionSupabase): ReadingSession {
  return {
    id: row.id,
    userId: row.user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    sourceType: row.source_type as any,
    sourceId: row.source_id || undefined,
    title: row.title || undefined,
    text: row.text,
    difficulty: row.difficulty as any,
    recordingUri: row.recording_url || undefined, // Cloud URL instead of local
    recordingDurationMs: row.recording_duration_ms ?? 0,
    transcription: row.transcription || undefined,
    wordsExpected: row.words_expected ?? 0,
    wordsSpoken: row.words_spoken ?? 0,
    articulationScore: row.articulation_score ?? 0,
    fluencyScore: row.fluency_score ?? 0,
    overallScore: row.overall_score ?? 0,
    problemWords: row.problem_words ? JSON.parse(row.problem_words) : [],
    feedback: row.feedback ? JSON.parse(row.feedback) : undefined,
    isPublic: row.is_public,
    isDeleted: false,
  };
}

/**
 * Delete a session from Supabase
 */
export async function deleteCloudSession(
  sessionId: string,
  userId: string,
  deleteRecordingToo = true
): Promise<boolean> {
  try {
    if (!(await isOnline())) {
      return false;
    }

    // Delete recording first
    if (deleteRecordingToo) {
      await deleteRecording(userId, sessionId);
    }

    // Delete session record
    const { error } = await supabase
      .from('reading_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', userId);

    if (error) {
      console.error('[ReadingSync] Delete error:', error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[ReadingSync] Delete failed:', error);
    return false;
  }
}

// ============================================================================
// Batch Operations
// ============================================================================

/**
 * Get sessions that need syncing (have local recording but no cloud URL)
 */
export async function getSessionsNeedingSync(
  userId: string
): Promise<{ sessionId: string; hasRecording: boolean }[]> {
  try {
    const { data, error } = await supabase
      .from('reading_sessions')
      .select('id, recording_url')
      .eq('user_id', userId)
      .is('recording_url', null);

    if (error) {
      console.error('[ReadingSync] Query error:', error.message);
      return [];
    }

    return (data || []).map(row => ({
      sessionId: row.id,
      hasRecording: false,
    }));
  } catch (error) {
    console.error('[ReadingSync] Query failed:', error);
    return [];
  }
}

// ============================================================================
// Exports
// ============================================================================

export const readingSync = {
  uploadRecording,
  deleteRecording,
  syncReadingSession,
  syncReadingSessions,
  fetchCloudSessions,
  deleteCloudSession,
  getSessionsNeedingSync,
  isOnline,
};
