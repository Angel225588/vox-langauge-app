/**
 * Word Bank System
 *
 * Central vocabulary repository for Vox Language App.
 * Manages all user vocabulary with spaced repetition (SM-2)
 * and priority-based learning.
 *
 * @example
 * ```tsx
 * import {
 *   useWordBank,
 *   useWordPriority,
 *   useReviewSession,
 *   addWord,
 *   BankWord,
 * } from '@/lib/word-bank';
 *
 * // In a component
 * const { words, addWord, loading } = useWordBank();
 * const { priorityWords } = useWordPriority({ limit: 10 });
 * ```
 */

// Types
export type {
  BankWord,
  AddWordInput,
  UpdateWordInput,
  WordFilter,
  WordBankStats,
  PriorityFactors,
  PriorityWeights,
  PriorityResult,
  ReviewResult,
  ReviewSession,
  ReviewSessionConfig,
  CEFRLevel,
  PartOfSpeech,
  WordSource,
  ErrorType,
  BankWordRow,
  WordSortField,
  SortDirection,
  SortConfig,
  BulkImportResult,
  ExportOptions,
} from './types';

// Schema
export {
  WORD_BANK_TABLE,
  WordBankColumns,
  CREATE_WORD_BANK_TABLE,
  CREATE_INDEXES,
  initializeWordBankTable,
  tableExists,
  getRowCount,
  dropWordBankTable,
} from './schema';

// Migrations
export {
  initializeWordBankDatabase,
  runMigrations,
  needsMigration,
  getMigrationStatus,
} from './migrations';

// Storage operations
export {
  addWord,
  getWord,
  updateWord,
  deleteWord,
  getWords,
  getWordsByPriority,
  getWordsDueForReview,
  searchWords,
  getWordBankStats,
  recordReview,
  recalculateAllPriorities,
  getWordCount,
  // Duplicate handling & reinforcement
  findWordByText,
  addOrReinforceWord,
  getWordEncounterCount,
  getReinforcedWords,
} from './storage';

// Storage types
export type { AddOrReinforceResult } from './storage';

// Priority algorithm
export {
  PRIORITY_WEIGHTS,
  calculatePriority,
  calculateWeaknessScore,
  calculateRecencyPenalty,
  calculateCefrMatch,
  calculateMilestoneUrgency,
  calculatePrioritiesForWords,
  sortByPriority,
  getTopPriorityWords,
} from './priority';

// React hooks
export {
  useWordBank,
  useWordPriority,
  useWordSearch,
  useWordBankStats,
  useWord,
  useReviewSession,
} from './hooks';

// Hook types
export type {
  UseWordBankOptions,
  UseWordBankReturn,
  UseWordPriorityOptions,
  UseWordPriorityReturn,
  UseWordSearchReturn,
  UseWordBankStatsReturn,
  UseWordReturn,
  UseReviewSessionOptions,
  UseReviewSessionReturn,
} from './hooks';
