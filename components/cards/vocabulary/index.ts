/**
 * Vocabulary Card Components
 *
 * Premium vocabulary learning cards inspired by Revolut, Claude, and Perplexity.
 * Three card variants from single vocabulary data:
 *
 * - IntroductionCard: First encounter with a word (word + phonetic + translation reveal)
 * - ListeningCard: Audio recognition (listen & select or type)
 * - TypingCard: Active recall (see translation, type the word)
 *
 * Design principles:
 * - Progressive reveal (tap to show translation, not flip)
 * - Hybrid spaced repetition (swipe rating + AI behavior analysis)
 * - Premium feel with depth, animations, and haptics
 */

export { VocabCardBase } from './VocabCardBase';
export { IntroductionCard } from './IntroductionCard';
export { ListeningCard } from './ListeningCard';
export { TypingCard } from './TypingCard';

// Hooks
export { useVocabCard } from './hooks/useVocabCard';

// Re-export types
export type {
  VocabularyItem,
  VocabCardVariant,
  VocabCardResult,
  VocabCardProps,
  ExampleSentence,
} from '@/types/vocabulary';
