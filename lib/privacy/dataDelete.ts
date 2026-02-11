/**
 * Data Deletion Module
 *
 * Cascade-deletes all user data from Supabase, AsyncStorage, and SQLite.
 * GDPR Article 17 — Right to Erasure.
 */

import { supabase } from '@/lib/db/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { revokeAllConsents } from './consentManager';

// =============================================================================
// Types
// =============================================================================

export interface DeletionResult {
  success: boolean;
  deletedFrom: string[];
  errors: string[];
  timestamp: string;
}

// =============================================================================
// Main Deletion
// =============================================================================

/**
 * Delete ALL user data from everywhere.
 * This is irreversible. Call only after user confirmation.
 */
export async function deleteAllUserData(userId: string): Promise<DeletionResult> {
  const deletedFrom: string[] = [];
  const errors: string[] = [];

  // 1. Delete cloud data (Supabase)
  const cloudResult = await deleteCloudData(userId);
  deletedFrom.push(...cloudResult.deleted);
  errors.push(...cloudResult.errors);

  // 2. Delete local data (AsyncStorage)
  const localResult = await deleteLocalData(userId);
  deletedFrom.push(...localResult.deleted);
  errors.push(...localResult.errors);

  // 3. Delete SQLite data
  const sqliteResult = await deleteSQLiteData();
  deletedFrom.push(...sqliteResult.deleted);
  errors.push(...sqliteResult.errors);

  // 4. Revoke all consents
  try {
    await revokeAllConsents();
    deletedFrom.push('consent_records');
  } catch (err) {
    errors.push('consent_records');
  }

  return {
    success: errors.length === 0,
    deletedFrom,
    errors,
    timestamp: new Date().toISOString(),
  };
}

// =============================================================================
// Cloud Data Deletion
// =============================================================================

/**
 * Delete all user data from Supabase.
 */
async function deleteCloudData(userId: string): Promise<{ deleted: string[]; errors: string[] }> {
  const deleted: string[] = [];
  const errors: string[] = [];

  // Tables to delete from (order matters — messages before sessions due to FK)
  const deletions: Array<{ table: string; column: string }> = [
    { table: 'conversation_messages', column: 'session_id' }, // special — needs session IDs first
    { table: 'conversation_sessions', column: 'user_id' },
    { table: 'user_ai_memory', column: 'user_id' },
    { table: 'user_accent_preferences', column: 'user_id' },
    { table: 'conversation_feedback', column: 'user_id' },
  ];

  // First, get session IDs to delete messages
  try {
    const { data: sessions } = await supabase
      .from('conversation_sessions')
      .select('id')
      .eq('user_id', userId);

    if (sessions && sessions.length > 0) {
      const sessionIds = sessions.map((s: any) => s.id);
      const { error: msgError } = await supabase
        .from('conversation_messages')
        .delete()
        .in('session_id', sessionIds);

      if (msgError) {
        errors.push('conversation_messages');
      } else {
        deleted.push('conversation_messages');
      }
    }
  } catch {
    errors.push('conversation_messages');
  }

  // Delete from remaining tables
  for (const { table, column } of deletions) {
    if (table === 'conversation_messages') continue; // Already handled
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq(column, userId);

      if (error) {
        errors.push(table);
        console.warn(`[DataDelete] Failed to delete from ${table}:`, error.message);
      } else {
        deleted.push(table);
      }
    } catch {
      errors.push(table);
    }
  }

  return { deleted, errors };
}

// =============================================================================
// Local Data Deletion
// =============================================================================

/**
 * Delete all user data from AsyncStorage.
 */
async function deleteLocalData(userId: string): Promise<{ deleted: string[]; errors: string[] }> {
  const deleted: string[] = [];
  const errors: string[] = [];

  // Keys to remove
  const keysToRemove = [
    `vox_practice_scores_${userId}`,
    `vox_practice_content_${userId}`,
    `vox_consent_voice_recording`,
    `vox_consent_privacy_policy`,
    `vox_consent_terms_of_service`,
  ];

  // Also find any other vox_ keys for this user
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const userKeys = allKeys.filter(
      k => k.includes(userId) || k.startsWith('vox_')
    );
    const allKeysToRemove = [...new Set([...keysToRemove, ...userKeys])];

    await AsyncStorage.multiRemove(allKeysToRemove);
    deleted.push('async_storage');
  } catch {
    errors.push('async_storage');
  }

  return { deleted, errors };
}

/**
 * Delete SQLite local data.
 */
async function deleteSQLiteData(): Promise<{ deleted: string[]; errors: string[] }> {
  const deleted: string[] = [];
  const errors: string[] = [];

  try {
    // Lazy import to avoid circular deps
    const { dbManager } = require('@/lib/db/database');
    const db = await dbManager.initialize();
    await db.execAsync('DELETE FROM flashcards');
    await db.execAsync('DELETE FROM word_bank');
    await db.execAsync('DELETE FROM reading_sessions');
    deleted.push('sqlite_flashcards', 'sqlite_word_bank', 'sqlite_reading_sessions');
  } catch {
    errors.push('sqlite');
  }

  return { deleted, errors };
}
