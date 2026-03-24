/**
 * Word Bank → VocabularyItem Adapter
 *
 * Converts BankWord (database/storage type) to VocabularyItem (card system type)
 * for use in VocabularyPracticeScreen and other card components.
 *
 * Used when lesson activities need vocabulary from the word bank
 * (e.g., preview stairs without Supabase stair content).
 */

import type { BankWord } from './types';
import type { VocabularyItem } from '@/types/vocabulary';
import { DEFAULT_VOCABULARY_ITEM } from '@/types/vocabulary';

/**
 * Convert a BankWord from the word bank into a VocabularyItem
 * that VocabularyPracticeScreen can consume.
 */
export function bankWordToVocabularyItem(bw: BankWord): VocabularyItem {
  return {
    // Spread defaults first (card variants, SM-2 defaults, etc.)
    ...DEFAULT_VOCABULARY_ITEM,

    // Core fields from BankWord
    id: bw.id,
    word: bw.word,
    translation: bw.translation,
    phonetic: bw.phonetic || undefined,
    category: bw.category,
    cefrLevel: bw.cefrLevel,
    partOfSpeech: bw.partOfSpeech,

    // Definition — use translation as fallback
    definition: bw.translation || undefined,

    // Learning state
    masteryScore: bw.masteryScore,
    priority: bw.priority,
    timesCorrect: bw.timesCorrect,
    timesIncorrect: bw.timesIncorrect,
    source: bw.source,
    addedAt: bw.addedAt,
    nextReviewDate: bw.nextReviewDate,

    // SM-2 state (use BankWord values if available, else defaults)
    easeFactor: bw.easeFactor ?? 2.5,
    interval: bw.interval ?? 0,
    repetitions: bw.repetitions ?? 0,

    // Convert example sentences to ExampleSentence[]
    exampleSentences: bw.exampleSentences || [],
    examples: (bw.exampleSentences || []).map(text => ({
      text,
      translation: '', // BankWord doesn't store example translations
      highlightWord: true,
    })),

    // Card variants — all incomplete (fresh for lesson)
    cardVariantsCompleted: {
      introduction: false,
      listening: false,
      typing: false,
      speaking: false,
      audioQuiz: false,
    },
    lastVariantShown: null,
  } as VocabularyItem;
}

/**
 * Convert an array of BankWords to VocabularyItems.
 */
export function bankWordsToVocabularyItems(words: BankWord[]): VocabularyItem[] {
  return words.map(bankWordToVocabularyItem);
}
