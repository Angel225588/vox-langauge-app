/**
 * Vocabulary Types
 *
 * Defines the data structures for the vocabulary bank system.
 */

export interface BankWord {
  id: string;
  word: string;
  translation: string;
  phonetic?: string;
  category: string;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  partOfSpeech: string;
  masteryScore: number;      // 0-100
  priority: number;          // 0-10
  timesCorrect: number;
  timesIncorrect: number;
  source: string;
  exampleSentences: string[];
  addedAt: string;
  nextReviewDate: string;
}

/**
 * Category summary for CategoryGrid component
 */
export interface VocabularyCategory {
  name: string;
  wordCount: number;
  averageMastery: number;
  emoji?: string;
}

/**
 * Extended vocabulary item for premium card system
 * Used by IntroductionCard, ListeningCard, and TypingCard
 */
export interface VocabularyItem extends BankWord {
  // Audio
  audioUrl?: string;           // URL to audio file
  audioSlowUrl?: string;       // Slower pronunciation

  // Rich Content
  imageUrl?: string;           // Context image
  contextVideoUrl?: string;    // Short usage video (future)

  // Examples with translations
  examples: ExampleSentence[];

  // Spaced Repetition (SM-2)
  easeFactor: number;          // SM-2 ease factor (default 2.5)
  interval: number;            // Days until next review
  repetitions: number;         // Number of successful reviews

  // Learning State
  cardVariantsCompleted: {
    introduction: boolean;
    listening: boolean;
    typing: boolean;
    speaking: boolean;
    audioQuiz: boolean;
  };
  lastVariantShown: VocabCardVariant | null;
}

/**
 * Example sentence with translation and audio
 */
export interface ExampleSentence {
  text: string;
  translation: string;
  audioUrl?: string;
  highlightWord?: boolean;  // Highlight target word in sentence
}

/**
 * Card variant types for vocabulary practice
 */
export type VocabCardVariant =
  | 'introduction'  // First encounter: see word, translation, examples
  | 'listening'     // Listen & write (text input)
  | 'typing'        // Active recall: see translation, type word
  | 'speaking'      // Listen & speak (record pronunciation)
  | 'audioQuiz';    // Listen & select (multiple choice)

/**
 * Result from completing a vocabulary card
 */
export interface VocabCardResult {
  variant: VocabCardVariant;
  correct: boolean;
  timeSpent: number;          // ms
  audioReplays: number;       // Number of times audio was replayed
  hintUsed: boolean;
  userInput?: string;         // For typing card
}

/**
 * Props shared by all vocabulary cards
 */
export interface VocabCardProps {
  item: VocabularyItem;
  onComplete: (result: VocabCardResult) => void;
  onSkip?: () => void;
}

/**
 * Default values for creating a new VocabularyItem
 */
export const DEFAULT_VOCABULARY_ITEM: Partial<VocabularyItem> = {
  masteryScore: 0,
  priority: 5,
  timesCorrect: 0,
  timesIncorrect: 0,
  easeFactor: 2.5,
  interval: 0,
  repetitions: 0,
  cardVariantsCompleted: {
    introduction: false,
    listening: false,
    typing: false,
    speaking: false,
    audioQuiz: false,
  },
  lastVariantShown: null,
  examples: [],
};
