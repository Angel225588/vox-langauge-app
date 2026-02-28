/**
 * Writing History — AsyncStorage persistence for writing practice sessions.
 *
 * Stores the user's text, the AI feedback (strengths, improvements, corrected text),
 * and the original prompt so users can review past writing exercises.
 *
 * Capped at 50 entries to prevent storage bloat.
 * Can migrate to Supabase later by swapping the storage backend.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ───────────────────────────────────────────────────

export interface WritingHistoryEntry {
  id: string;
  timestamp: number;
  prompt: {
    title: string;
    scenario: string;
    prompt: string;
  };
  userText: string;
  feedback: {
    score: number;
    summary: string;
    strengths: string[];
    improvements: string[];
    correctedText?: string;
  };
  stairStepId?: string;
}

// ─── Constants ───────────────────────────────────────────────

const WRITING_HISTORY_KEY = 'vox_writing_history';
const MAX_ENTRIES = 50;

// ─── Public API ──────────────────────────────────────────────

/**
 * Save a writing session entry. Prepends to the list (newest first)
 * and caps at MAX_ENTRIES.
 */
export async function saveWritingHistoryEntry(
  entry: WritingHistoryEntry,
): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(WRITING_HISTORY_KEY);
    const history: WritingHistoryEntry[] = raw ? JSON.parse(raw) : [];
    history.unshift(entry);
    await AsyncStorage.setItem(
      WRITING_HISTORY_KEY,
      JSON.stringify(history.slice(0, MAX_ENTRIES)),
    );
  } catch (err) {
    console.error('[WritingHistory] Failed to save entry:', err);
  }
}

/**
 * Load all writing history entries (newest first).
 * Returns an empty array on error or if no history exists.
 */
export async function loadWritingHistory(): Promise<WritingHistoryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(WRITING_HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as WritingHistoryEntry[];
  } catch (err) {
    console.error('[WritingHistory] Failed to load history:', err);
    return [];
  }
}

/**
 * Clear all writing history. Useful for data deletion / GDPR flows.
 */
export async function clearWritingHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(WRITING_HISTORY_KEY);
  } catch (err) {
    console.error('[WritingHistory] Failed to clear history:', err);
  }
}
