/**
 * Flashcard Types
 *
 * Defines the data structures for the flashcard system with spaced repetition.
 */

export type FlashcardCategory =
  | 'food'
  | 'travel'
  | 'verbs'
  | 'objects'
  | 'conversation'
  | 'grammar';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type LanguageCode = 'en' | 'es' | 'fr';

/**
 * Base flashcard data
 * Contains the word/phrase and its translations
 */
export interface Flashcard {
  id: string;
  word: string; // The word in target language
  translation: string; // Translation in user's native language
  phonetic?: string; // IPA phonetic pronunciation
  image_url?: string; // URL to image (can be local or remote)
  audio_url?: string; // URL to audio file (can be local or remote)
  example_sentence?: string; // Example sentence using the word
  example_translation?: string; // Translation of example sentence
  category: FlashcardCategory;
  difficulty: DifficultyLevel;
  target_language: LanguageCode;
  native_language: LanguageCode;
  created_at: string;
  updated_at: string;
}

/**
 * User's progress on a specific flashcard
 * Tracks spaced repetition data (SM-2 legacy + FSRS).
 * New cards use FSRS; existing SM-2 cards migrate on next review.
 */
export interface UserFlashcardProgress {
  id: string;
  user_id: string;
  flashcard_id: string;

  // SM-2 Algorithm fields (legacy, kept for backward compat)
  ease_factor: number; // Default: 2.5, min: 1.3
  interval: number; // Days until next review
  repetitions: number; // Number of successful reviews in a row
  next_review: string; // ISO date string for next review

  // FSRS fields (new — preferred algorithm)
  algorithm: 'sm2' | 'fsrs'; // Which algorithm is active
  fsrs_stability?: number; // Memory stability
  fsrs_difficulty?: number; // Card difficulty
  fsrs_elapsed_days?: number; // Days since last review
  fsrs_scheduled_days?: number; // Days until next scheduled review
  fsrs_reps?: number; // Total FSRS review count
  fsrs_lapses?: number; // Times forgotten
  fsrs_state?: number; // 0=New, 1=Learning, 2=Review, 3=Relearning
  fsrs_last_review?: string | null; // ISO date of last FSRS review

  // Tracking fields
  total_reviews: number; // Total number of times reviewed
  correct_count: number; // Number of correct answers
  incorrect_count: number; // Number of incorrect answers
  last_reviewed_at?: string; // Last review timestamp

  created_at: string;
  updated_at: string;
}

/**
 * Quality rating for SM-2 algorithm
 * Used after reviewing a flashcard
 */
export enum ReviewQuality {
  FORGOT = 1, // Complete blackout - forgot everything
  HARD = 2, // Incorrect but remembered after seeing answer
  GOOD = 3, // Correct with serious difficulty
  EASY = 4, // Correct with hesitation
  PERFECT = 5, // Perfect response, instant recall
}

/**
 * Simplified quality for UI
 */
export type SimpleQuality = 'forgot' | 'remembered' | 'easy';

/**
 * Review session data
 * Tracks a single flashcard review session
 */
export interface ReviewSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  flashcards_reviewed: number;
  points_earned: number;
  total_time_seconds?: number;
}

/**
 * Individual review record
 */
export interface FlashcardReview {
  id: string;
  session_id: string;
  flashcard_id: string;
  user_id: string;
  quality: ReviewQuality;
  time_spent_seconds: number;
  card_type: 'learning' | 'listening' | 'speaking';
  reviewed_at: string;
}

/**
 * Flashcard with user progress data combined
 */
export interface FlashcardWithProgress extends Flashcard {
  progress?: UserFlashcardProgress;
  isDue: boolean; // Calculated: is this card due for review?
}

/**
 * Session summary data
 */
export interface SessionSummary {
  flashcards_reviewed: number;
  points_earned: number;
  time_spent_seconds: number;
  accuracy: number; // Percentage (0-100)
  cards_by_quality: {
    forgot: number;
    hard: number;
    good: number;
    easy: number;
    perfect: number;
  };
}
