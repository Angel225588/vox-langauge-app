/**
 * Word Bank Storage Operations
 *
 * SQLite CRUD operations for the Word Bank system.
 * Offline-first with full spaced repetition (SM-2) support.
 */

import * as SQLite from 'expo-sqlite';
import { dbManager } from '../db/database';
import { WORD_BANK_TABLE, WordBankColumns } from './schema';
import {
  BankWord,
  AddWordInput,
  UpdateWordInput,
  WordFilter,
  WordBankStats,
  CEFRLevel,
  ReviewResult,
} from './types';
import { calculatePriority, calculateWeaknessScore, calculateRecencyPenalty, calculateCefrMatch } from './priority';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a unique ID for new words
 */
function generateId(): string {
  return `word_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get current ISO date string
 */
function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Convert database row to BankWord object
 */
function rowToBankWord(row: any): BankWord {
  return {
    id: row.id,
    word: row.word,
    translation: row.translation,
    phonetic: row.phonetic || undefined,
    audioUrl: row.audio_url || undefined,
    imageUrl: row.image_url || undefined,
    category: row.category,
    cefrLevel: row.cefr_level as CEFRLevel,
    partOfSpeech: row.part_of_speech || 'other',
    masteryScore: row.mastery_score || 0,
    priority: row.priority || 5,
    easeFactor: row.ease_factor || 2.5,
    interval: row.interval || 0,
    repetitions: row.repetitions || 0,
    nextReviewDate: row.next_review_date || nowISO(),
    lastReviewDate: row.last_review_date || undefined,
    timesCorrect: row.times_correct || 0,
    timesIncorrect: row.times_incorrect || 0,
    errorTypes: row.error_types ? JSON.parse(row.error_types) : [],
    source: row.source,
    milestoneTags: row.milestone_tags ? JSON.parse(row.milestone_tags) : [],
    exampleSentences: row.example_sentences ? JSON.parse(row.example_sentences) : [],
    addedAt: row.added_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Calculate next review date based on interval
 */
function calculateNextReviewDate(interval: number): string {
  const date = new Date();
  date.setDate(date.getDate() + interval);
  return date.toISOString();
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

/**
 * Add a new word to the Word Bank
 */
export async function addWord(input: AddWordInput): Promise<BankWord> {
  const db = await dbManager.getDatabase();
  const now = nowISO();
  const id = generateId();

  const word: BankWord = {
    id,
    word: input.word,
    translation: input.translation,
    phonetic: input.phonetic,
    audioUrl: input.audioUrl,
    imageUrl: input.imageUrl,
    category: input.category || 'general',
    cefrLevel: input.cefrLevel || 'A1',
    partOfSpeech: input.partOfSpeech || 'other',
    masteryScore: 0,
    priority: 5, // Default mid-priority
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewDate: now, // Due immediately
    lastReviewDate: undefined,
    timesCorrect: 0,
    timesIncorrect: 0,
    errorTypes: [],
    source: input.source,
    milestoneTags: input.milestoneTags || [],
    exampleSentences: input.exampleSentences || [],
    addedAt: now,
    updatedAt: now,
  };

  await db.runAsync(
    `INSERT INTO ${WORD_BANK_TABLE} (
      ${WordBankColumns.ID},
      ${WordBankColumns.WORD},
      ${WordBankColumns.TRANSLATION},
      ${WordBankColumns.PHONETIC},
      ${WordBankColumns.AUDIO_URL},
      ${WordBankColumns.IMAGE_URL},
      ${WordBankColumns.CATEGORY},
      ${WordBankColumns.CEFR_LEVEL},
      ${WordBankColumns.PART_OF_SPEECH},
      ${WordBankColumns.MASTERY_SCORE},
      ${WordBankColumns.PRIORITY},
      ${WordBankColumns.EASE_FACTOR},
      ${WordBankColumns.INTERVAL},
      ${WordBankColumns.REPETITIONS},
      ${WordBankColumns.NEXT_REVIEW_DATE},
      ${WordBankColumns.LAST_REVIEW_DATE},
      ${WordBankColumns.TIMES_CORRECT},
      ${WordBankColumns.TIMES_INCORRECT},
      ${WordBankColumns.ERROR_TYPES},
      ${WordBankColumns.SOURCE},
      ${WordBankColumns.MILESTONE_TAGS},
      ${WordBankColumns.EXAMPLE_SENTENCES},
      ${WordBankColumns.ADDED_AT},
      ${WordBankColumns.UPDATED_AT}
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      word.id,
      word.word,
      word.translation,
      word.phonetic || null,
      word.audioUrl || null,
      word.imageUrl || null,
      word.category,
      word.cefrLevel,
      word.partOfSpeech,
      word.masteryScore,
      word.priority,
      word.easeFactor,
      word.interval,
      word.repetitions,
      word.nextReviewDate,
      word.lastReviewDate || null,
      word.timesCorrect,
      word.timesIncorrect,
      JSON.stringify(word.errorTypes),
      word.source,
      JSON.stringify(word.milestoneTags),
      JSON.stringify(word.exampleSentences),
      word.addedAt,
      word.updatedAt,
    ]
  );

  console.log(`Added word to bank: "${word.word}"`);
  return word;
}

/**
 * Get a single word by ID
 */
export async function getWord(id: string): Promise<BankWord | null> {
  const db = await dbManager.getDatabase();

  const row = await db.getFirstAsync(
    `SELECT * FROM ${WORD_BANK_TABLE} WHERE ${WordBankColumns.ID} = ?`,
    [id]
  );

  if (!row) return null;
  return rowToBankWord(row);
}

/**
 * Update an existing word
 */
export async function updateWord(
  id: string,
  input: UpdateWordInput
): Promise<BankWord | null> {
  const db = await dbManager.getDatabase();
  const now = nowISO();

  // Build dynamic update query
  const updates: string[] = [];
  const values: any[] = [];

  if (input.word !== undefined) {
    updates.push(`${WordBankColumns.WORD} = ?`);
    values.push(input.word);
  }
  if (input.translation !== undefined) {
    updates.push(`${WordBankColumns.TRANSLATION} = ?`);
    values.push(input.translation);
  }
  if (input.phonetic !== undefined) {
    updates.push(`${WordBankColumns.PHONETIC} = ?`);
    values.push(input.phonetic);
  }
  if (input.audioUrl !== undefined) {
    updates.push(`${WordBankColumns.AUDIO_URL} = ?`);
    values.push(input.audioUrl);
  }
  if (input.imageUrl !== undefined) {
    updates.push(`${WordBankColumns.IMAGE_URL} = ?`);
    values.push(input.imageUrl);
  }
  if (input.category !== undefined) {
    updates.push(`${WordBankColumns.CATEGORY} = ?`);
    values.push(input.category);
  }
  if (input.cefrLevel !== undefined) {
    updates.push(`${WordBankColumns.CEFR_LEVEL} = ?`);
    values.push(input.cefrLevel);
  }
  if (input.partOfSpeech !== undefined) {
    updates.push(`${WordBankColumns.PART_OF_SPEECH} = ?`);
    values.push(input.partOfSpeech);
  }
  if (input.masteryScore !== undefined) {
    updates.push(`${WordBankColumns.MASTERY_SCORE} = ?`);
    values.push(input.masteryScore);
  }
  if (input.priority !== undefined) {
    updates.push(`${WordBankColumns.PRIORITY} = ?`);
    values.push(input.priority);
  }
  if (input.easeFactor !== undefined) {
    updates.push(`${WordBankColumns.EASE_FACTOR} = ?`);
    values.push(input.easeFactor);
  }
  if (input.interval !== undefined) {
    updates.push(`${WordBankColumns.INTERVAL} = ?`);
    values.push(input.interval);
  }
  if (input.repetitions !== undefined) {
    updates.push(`${WordBankColumns.REPETITIONS} = ?`);
    values.push(input.repetitions);
  }
  if (input.nextReviewDate !== undefined) {
    updates.push(`${WordBankColumns.NEXT_REVIEW_DATE} = ?`);
    values.push(input.nextReviewDate);
  }
  if (input.lastReviewDate !== undefined) {
    updates.push(`${WordBankColumns.LAST_REVIEW_DATE} = ?`);
    values.push(input.lastReviewDate);
  }
  if (input.timesCorrect !== undefined) {
    updates.push(`${WordBankColumns.TIMES_CORRECT} = ?`);
    values.push(input.timesCorrect);
  }
  if (input.timesIncorrect !== undefined) {
    updates.push(`${WordBankColumns.TIMES_INCORRECT} = ?`);
    values.push(input.timesIncorrect);
  }
  if (input.errorTypes !== undefined) {
    updates.push(`${WordBankColumns.ERROR_TYPES} = ?`);
    values.push(JSON.stringify(input.errorTypes));
  }
  if (input.source !== undefined) {
    updates.push(`${WordBankColumns.SOURCE} = ?`);
    values.push(input.source);
  }
  if (input.milestoneTags !== undefined) {
    updates.push(`${WordBankColumns.MILESTONE_TAGS} = ?`);
    values.push(JSON.stringify(input.milestoneTags));
  }
  if (input.exampleSentences !== undefined) {
    updates.push(`${WordBankColumns.EXAMPLE_SENTENCES} = ?`);
    values.push(JSON.stringify(input.exampleSentences));
  }

  // Always update timestamp
  updates.push(`${WordBankColumns.UPDATED_AT} = ?`);
  values.push(now);

  if (updates.length === 1) {
    // Only updated_at, nothing else
    return getWord(id);
  }

  values.push(id);

  await db.runAsync(
    `UPDATE ${WORD_BANK_TABLE} SET ${updates.join(', ')} WHERE ${WordBankColumns.ID} = ?`,
    values
  );

  return getWord(id);
}

/**
 * Delete a word from the Word Bank
 */
export async function deleteWord(id: string): Promise<boolean> {
  const db = await dbManager.getDatabase();

  const result = await db.runAsync(
    `DELETE FROM ${WORD_BANK_TABLE} WHERE ${WordBankColumns.ID} = ?`,
    [id]
  );

  const deleted = (result.changes ?? 0) > 0;
  if (deleted) {
    console.log(`Deleted word from bank: ${id}`);
  }
  return deleted;
}

// ============================================================================
// QUERY OPERATIONS
// ============================================================================

/**
 * Get all words with optional filtering
 */
export async function getWords(filter?: WordFilter): Promise<BankWord[]> {
  const db = await dbManager.getDatabase();

  let query = `SELECT * FROM ${WORD_BANK_TABLE}`;
  const conditions: string[] = [];
  const values: any[] = [];

  if (filter) {
    if (filter.category) {
      conditions.push(`${WordBankColumns.CATEGORY} = ?`);
      values.push(filter.category);
    }
    if (filter.cefrLevel) {
      conditions.push(`${WordBankColumns.CEFR_LEVEL} = ?`);
      values.push(filter.cefrLevel);
    }
    if (filter.source) {
      conditions.push(`${WordBankColumns.SOURCE} = ?`);
      values.push(filter.source);
    }
    if (filter.minPriority !== undefined) {
      conditions.push(`${WordBankColumns.PRIORITY} >= ?`);
      values.push(filter.minPriority);
    }
    if (filter.maxPriority !== undefined) {
      conditions.push(`${WordBankColumns.PRIORITY} <= ?`);
      values.push(filter.maxPriority);
    }
    if (filter.needsReview) {
      conditions.push(`${WordBankColumns.NEXT_REVIEW_DATE} <= ?`);
      values.push(nowISO());
    }
    if (filter.searchQuery) {
      conditions.push(
        `(${WordBankColumns.WORD} LIKE ? OR ${WordBankColumns.TRANSLATION} LIKE ?)`
      );
      const searchTerm = `%${filter.searchQuery}%`;
      values.push(searchTerm, searchTerm);
    }
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  query += ` ORDER BY ${WordBankColumns.PRIORITY} DESC`;

  if (filter?.limit) {
    query += ` LIMIT ?`;
    values.push(filter.limit);
  }
  if (filter?.offset) {
    query += ` OFFSET ?`;
    values.push(filter.offset);
  }

  const rows = await db.getAllAsync(query, values);
  return rows.map(rowToBankWord);
}

/**
 * Get words sorted by priority (highest first)
 */
export async function getWordsByPriority(limit: number = 20): Promise<BankWord[]> {
  const db = await dbManager.getDatabase();

  const rows = await db.getAllAsync(
    `SELECT * FROM ${WORD_BANK_TABLE}
     ORDER BY ${WordBankColumns.PRIORITY} DESC
     LIMIT ?`,
    [limit]
  );

  return rows.map(rowToBankWord);
}

/**
 * Get words that are due for review
 */
export async function getWordsDueForReview(limit: number = 20): Promise<BankWord[]> {
  const db = await dbManager.getDatabase();

  const rows = await db.getAllAsync(
    `SELECT * FROM ${WORD_BANK_TABLE}
     WHERE ${WordBankColumns.NEXT_REVIEW_DATE} <= ?
     ORDER BY ${WordBankColumns.PRIORITY} DESC
     LIMIT ?`,
    [nowISO(), limit]
  );

  return rows.map(rowToBankWord);
}

/**
 * Search words by word or translation
 */
export async function searchWords(query: string, limit: number = 50): Promise<BankWord[]> {
  const db = await dbManager.getDatabase();
  const searchTerm = `%${query}%`;

  const rows = await db.getAllAsync(
    `SELECT * FROM ${WORD_BANK_TABLE}
     WHERE ${WordBankColumns.WORD} LIKE ? OR ${WordBankColumns.TRANSLATION} LIKE ?
     ORDER BY ${WordBankColumns.PRIORITY} DESC
     LIMIT ?`,
    [searchTerm, searchTerm, limit]
  );

  return rows.map(rowToBankWord);
}

// ============================================================================
// DUPLICATE HANDLING & REINFORCEMENT
// ============================================================================

/**
 * Find a word by its text (case-insensitive exact match)
 *
 * Used to check for duplicates before adding a word
 *
 * @param wordText - The word to search for
 * @returns The matching BankWord or null if not found
 *
 * @example
 * ```typescript
 * const existing = await findWordByText('cathedral');
 * if (existing) {
 *   console.log(`Word already exists with ${existing.timesIncorrect} encounters`);
 * }
 * ```
 */
export async function findWordByText(wordText: string): Promise<BankWord | null> {
  const db = await dbManager.getDatabase();

  // Case-insensitive exact match using LOWER()
  const row = await db.getFirstAsync(
    `SELECT * FROM ${WORD_BANK_TABLE}
     WHERE LOWER(${WordBankColumns.WORD}) = LOWER(?)`,
    [wordText.trim()]
  );

  if (!row) return null;
  return rowToBankWord(row);
}

/**
 * Result of addOrReinforceWord operation
 */
export interface AddOrReinforceResult {
  word: BankWord;
  isNew: boolean;
  encounterCount: number;
}

/**
 * Add a new word OR reinforce an existing word
 *
 * If the word already exists:
 * - Increments timesIncorrect (encounter count)
 * - Recalculates priority (higher encounters = higher importance)
 * - Merges new example sentences
 * - Updates the source if different
 *
 * This creates the "x2, x3, x4..." importance multiplier effect:
 * - 1st encounter: timesIncorrect = 0, weaknessScore = 50%
 * - 2nd encounter: timesIncorrect = 1, weaknessScore = 67%
 * - 3rd encounter: timesIncorrect = 2, weaknessScore = 75%
 * - etc.
 *
 * @param input - Word data to add or reinforce
 * @returns Result with the word, whether it's new, and encounter count
 *
 * @example
 * ```typescript
 * // First time adding "cathedral"
 * const result1 = await addOrReinforceWord({
 *   word: 'cathedral',
 *   translation: 'catedral',
 *   source: 'reading',
 *   exampleSentences: ['I visited the cathedral.']
 * });
 * // result1.isNew = true, result1.encounterCount = 1
 *
 * // Second time (from another reading session)
 * const result2 = await addOrReinforceWord({
 *   word: 'cathedral',
 *   translation: 'catedral',
 *   source: 'reading',
 *   exampleSentences: ['The cathedral was beautiful.']
 * });
 * // result2.isNew = false, result2.encounterCount = 2 (x2 importance!)
 * ```
 */
export async function addOrReinforceWord(
  input: AddWordInput
): Promise<AddOrReinforceResult> {
  // 1. Check if word already exists
  const existingWord = await findWordByText(input.word);

  if (existingWord) {
    // 2. Word exists - REINFORCE it
    const newTimesIncorrect = existingWord.timesIncorrect + 1;
    const encounterCount = newTimesIncorrect + 1; // +1 for the original add

    // Merge example sentences (avoid duplicates)
    const existingSentences = existingWord.exampleSentences || [];
    const newSentences = input.exampleSentences || [];
    const mergedSentences = [
      ...existingSentences,
      ...newSentences.filter(s => !existingSentences.includes(s))
    ];

    // Recalculate priority with increased weakness
    const weaknessScore = calculateWeaknessScore(
      existingWord.timesCorrect,
      newTimesIncorrect
    );
    const recencyPenalty = calculateRecencyPenalty(
      existingWord.lastReviewDate || null,
      existingWord.interval
    );
    const newPriority = calculatePriority({
      milestoneUrgency: 50,
      weaknessScore,
      recencyPenalty,
      cefrMatch: 100,
    });

    // Update the word
    const updatedWord = await updateWord(existingWord.id, {
      timesIncorrect: newTimesIncorrect,
      priority: newPriority,
      exampleSentences: mergedSentences,
      // Reset next review date to now (needs practice!)
      nextReviewDate: nowISO(),
    });

    console.log(
      `Reinforced word "${input.word}" (x${encounterCount} importance, priority: ${newPriority.toFixed(1)})`
    );

    return {
      word: updatedWord!,
      isNew: false,
      encounterCount,
    };
  }

  // 3. New word - add normally
  const newWord = await addWord(input);

  return {
    word: newWord,
    isNew: true,
    encounterCount: 1,
  };
}

/**
 * Get the encounter count for a word
 *
 * @param wordId - ID of the word
 * @returns Encounter count (1 = first time, 2 = x2, etc.)
 */
export async function getWordEncounterCount(wordId: string): Promise<number> {
  const word = await getWord(wordId);
  if (!word) return 0;
  // Encounter count = timesIncorrect + 1 (the original add)
  return word.timesIncorrect + 1;
}

/**
 * Get all words with multiple encounters (reinforced words)
 *
 * @param minEncounters - Minimum encounter count (default: 2)
 * @returns Words with at least minEncounters
 */
export async function getReinforcedWords(minEncounters: number = 2): Promise<BankWord[]> {
  const db = await dbManager.getDatabase();

  // timesIncorrect >= minEncounters - 1 (since encounterCount = timesIncorrect + 1)
  const rows = await db.getAllAsync(
    `SELECT * FROM ${WORD_BANK_TABLE}
     WHERE ${WordBankColumns.TIMES_INCORRECT} >= ?
     ORDER BY ${WordBankColumns.TIMES_INCORRECT} DESC, ${WordBankColumns.PRIORITY} DESC`,
    [minEncounters - 1]
  );

  return rows.map(rowToBankWord);
}

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Get aggregate statistics for the Word Bank
 */
export async function getWordBankStats(): Promise<WordBankStats> {
  const db = await dbManager.getDatabase();

  // Total words
  const totalResult = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM ${WORD_BANK_TABLE}`
  );
  const totalWords = totalResult?.count || 0;

  // Words by level
  const levelRows = await db.getAllAsync<{ cefr_level: string; count: number }>(
    `SELECT ${WordBankColumns.CEFR_LEVEL} as cefr_level, COUNT(*) as count
     FROM ${WORD_BANK_TABLE}
     GROUP BY ${WordBankColumns.CEFR_LEVEL}`
  );
  const wordsByLevel: Record<CEFRLevel, number> = {
    A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0,
  };
  levelRows.forEach((row) => {
    wordsByLevel[row.cefr_level as CEFRLevel] = row.count;
  });

  // Words by category
  const categoryRows = await db.getAllAsync<{ category: string; count: number }>(
    `SELECT ${WordBankColumns.CATEGORY} as category, COUNT(*) as count
     FROM ${WORD_BANK_TABLE}
     GROUP BY ${WordBankColumns.CATEGORY}`
  );
  const wordsByCategory: Record<string, number> = {};
  categoryRows.forEach((row) => {
    wordsByCategory[row.category] = row.count;
  });

  // Words needing review
  const reviewResult = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM ${WORD_BANK_TABLE}
     WHERE ${WordBankColumns.NEXT_REVIEW_DATE} <= ?`,
    [nowISO()]
  );
  const wordsNeedingReview = reviewResult?.count || 0;

  // Average mastery
  const masteryResult = await db.getFirstAsync<{ avg: number }>(
    `SELECT AVG(${WordBankColumns.MASTERY_SCORE}) as avg FROM ${WORD_BANK_TABLE}`
  );
  const averageMastery = Math.round(masteryResult?.avg || 0);

  // Strong words (mastery > 70)
  const strongResult = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM ${WORD_BANK_TABLE}
     WHERE ${WordBankColumns.MASTERY_SCORE} > 70`
  );
  const strongWords = strongResult?.count || 0;

  // Weak words (mastery < 30)
  const weakResult = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM ${WORD_BANK_TABLE}
     WHERE ${WordBankColumns.MASTERY_SCORE} < 30`
  );
  const weakWords = weakResult?.count || 0;

  return {
    totalWords,
    wordsByLevel,
    wordsByCategory,
    wordsNeedingReview,
    averageMastery,
    strongWords,
    weakWords,
  };
}

// ============================================================================
// SM-2 REVIEW OPERATIONS
// ============================================================================

/**
 * Record a review result and update SM-2 state
 *
 * Quality ratings (SM-2):
 * 0 - Complete blackout
 * 1 - Incorrect, but upon seeing correct answer, remembered
 * 2 - Incorrect, but correct answer seemed easy to recall
 * 3 - Correct with serious difficulty
 * 4 - Correct with some hesitation
 * 5 - Perfect response
 */
export async function recordReview(
  wordId: string,
  quality: number,
  errorType?: string
): Promise<BankWord | null> {
  const word = await getWord(wordId);
  if (!word) return null;

  const now = nowISO();
  const correct = quality >= 3;

  // SM-2 Algorithm
  let { easeFactor, interval, repetitions } = word;

  if (correct) {
    // Correct response
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    // Incorrect response
    repetitions = 0;
    interval = 1;
  }

  // Update ease factor
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  // Calculate mastery score (0-100)
  const totalAttempts = word.timesCorrect + word.timesIncorrect + 1;
  const correctAttempts = word.timesCorrect + (correct ? 1 : 0);
  const accuracyScore = (correctAttempts / totalAttempts) * 50;
  const intervalScore = Math.min(interval / 30, 1) * 30;
  const easeScore = ((easeFactor - 1.3) / 1.2) * 20;
  const masteryScore = Math.round(accuracyScore + intervalScore + easeScore);

  // Update error types if incorrect
  let errorTypes = [...word.errorTypes];
  if (!correct && errorType && !errorTypes.includes(errorType as any)) {
    errorTypes.push(errorType as any);
  }

  // Recalculate priority
  const weaknessScore = calculateWeaknessScore(
    word.timesCorrect + (correct ? 1 : 0),
    word.timesIncorrect + (correct ? 0 : 1)
  );
  const recencyPenalty = 0; // Just reviewed
  const priority = calculatePriority({
    milestoneUrgency: 50, // Default for now
    weaknessScore,
    recencyPenalty,
    cefrMatch: 100, // Assume match for now
  });

  return updateWord(wordId, {
    easeFactor,
    interval,
    repetitions,
    masteryScore: Math.min(100, Math.max(0, masteryScore)),
    priority,
    nextReviewDate: calculateNextReviewDate(interval),
    lastReviewDate: now,
    timesCorrect: word.timesCorrect + (correct ? 1 : 0),
    timesIncorrect: word.timesIncorrect + (correct ? 0 : 1),
    errorTypes,
  });
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Recalculate priorities for all words
 */
export async function recalculateAllPriorities(
  userLevel: CEFRLevel = 'A1',
  currentMilestone?: string
): Promise<number> {
  const words = await getWords();
  let updated = 0;

  for (const word of words) {
    const weaknessScore = calculateWeaknessScore(
      word.timesCorrect,
      word.timesIncorrect
    );
    const recencyPenalty = calculateRecencyPenalty(
      word.lastReviewDate || null,
      word.interval
    );
    const cefrMatch = calculateCefrMatch(word.cefrLevel, userLevel);
    const milestoneUrgency = word.milestoneTags.includes(currentMilestone || '')
      ? 100
      : 50;

    const priority = calculatePriority({
      milestoneUrgency,
      weaknessScore,
      recencyPenalty,
      cefrMatch,
    });

    await updateWord(word.id, { priority });
    updated++;
  }

  console.log(`Recalculated priorities for ${updated} words`);
  return updated;
}

/**
 * Get word count
 */
export async function getWordCount(): Promise<number> {
  const db = await dbManager.getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM ${WORD_BANK_TABLE}`
  );
  return result?.count || 0;
}
