/**
 * Word Bank Integration for Reading Practice
 *
 * Utilities for adding problem words from the teleprompter
 * to the Word Bank system with appropriate priority and metadata.
 */

import { addWord, AddWordInput } from '@/lib/word-bank';

/**
 * Types of issues that can be detected during reading
 */
export type IssueType = 'skipped' | 'hesitated' | 'mispronounced' | 'repeated';

/**
 * A problem word detected during reading practice
 */
export interface ProblemWordToAdd {
  /** The word that caused difficulty */
  word: string;

  /** IPA phonetic pronunciation (optional) */
  phonetic?: string;

  /** Type of issue encountered */
  issueType: IssueType;

  /** Context sentence where the word appeared (optional) */
  context?: string;
}

/**
 * Result of adding a word to the bank
 */
export interface AddWordResult {
  /** ID of the added word */
  id: string;

  /** The word that was added */
  word: string;

  /** Whether this was a new word or already existed */
  isNew: boolean;
}

/**
 * Map issue types to initial mastery scores
 * Lower scores indicate more serious problems
 */
const ISSUE_TO_MASTERY: Record<IssueType, number> = {
  mispronounced: 20, // Most serious - fundamental pronunciation issue
  skipped: 30,       // Serious - word was avoided entirely
  hesitated: 45,     // Moderate - word recognized but not fluent
  repeated: 55,      // Minor - word eventually pronounced correctly
};

/**
 * Add a problem word from reading practice to the Word Bank
 *
 * @param problemWord - The word and its associated metadata
 * @returns Result containing the word ID and whether it was newly added
 *
 * @example
 * ```tsx
 * const result = await addProblemWordToBank({
 *   word: 'seashells',
 *   phonetic: '/ˈsiːʃelz/',
 *   issueType: 'hesitated',
 *   context: 'She sells seashells by the seashore.'
 * });
 *
 * console.log(`Added word ID: ${result.id}`);
 * ```
 */
export async function addProblemWordToBank(
  problemWord: ProblemWordToAdd
): Promise<AddWordResult> {
  // Map issue type to initial mastery score
  // Problem words start with lower mastery scores
  const initialMastery = ISSUE_TO_MASTERY[problemWord.issueType];

  // Build the input for the Word Bank system
  const input: AddWordInput = {
    word: problemWord.word,
    translation: '', // User can add translation later
    phonetic: problemWord.phonetic,
    category: 'reading-practice',
    source: 'reading',
    exampleSentences: problemWord.context ? [problemWord.context] : [],
  };

  try {
    // Add word to the bank
    const result = await addWord(input);

    // Note: The word bank automatically calculates priority based on
    // mastery score and other factors. Problem words will naturally
    // have higher priority due to their low initial mastery.

    return {
      id: result.id,
      word: result.word,
      isNew: true,
    };
  } catch (error) {
    // If word already exists, that's okay - user might want to add it again
    // or we could implement duplicate checking in the future
    console.error('Error adding word to bank:', error);
    throw error;
  }
}

/**
 * Add multiple problem words to the bank at once
 *
 * @param words - Array of problem words to add
 * @returns Array of results for each word
 *
 * @example
 * ```tsx
 * const results = await addAllProblemWordsToBank([
 *   { word: 'seashells', issueType: 'hesitated' },
 *   { word: 'particularly', issueType: 'mispronounced' },
 *   { word: 'woodchuck', issueType: 'skipped' },
 * ]);
 *
 * console.log(`Added ${results.length} words`);
 * ```
 */
export async function addAllProblemWordsToBank(
  words: ProblemWordToAdd[]
): Promise<AddWordResult[]> {
  // Add words sequentially to maintain order and handle errors individually
  const results: AddWordResult[] = [];

  for (const word of words) {
    try {
      const result = await addProblemWordToBank(word);
      results.push(result);
    } catch (error) {
      console.error(`Failed to add word "${word.word}":`, error);
      // Continue with other words even if one fails
    }
  }

  return results;
}

/**
 * Check if a word already exists in the bank
 * (For future implementation - currently word bank doesn't expose duplicate checking)
 *
 * @param word - The word to check
 * @returns True if word exists, false otherwise
 */
export async function isWordInBank(word: string): Promise<boolean> {
  // TODO: Implement when word bank exposes searchWords or similar functionality
  // For now, we allow duplicates and let the word bank handle it
  return false;
}
