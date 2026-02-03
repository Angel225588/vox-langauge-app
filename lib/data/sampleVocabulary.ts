/**
 * Sample Vocabulary Data
 *
 * Pre-built vocabulary items for testing and development.
 * These demonstrate the full VocabularyItem structure.
 */

import type { VocabularyItem } from '@/types/vocabulary';
import { DEFAULT_VOCABULARY_ITEM } from '@/types/vocabulary';

/**
 * Sample vocabulary items for job interview scenario
 */
export const SAMPLE_VOCABULARY: VocabularyItem[] = [
  {
    ...DEFAULT_VOCABULARY_ITEM,
    id: 'vocab-1',
    word: 'Professional',
    translation: 'Profesional',
    phonetic: '/prəˈfeʃ.ən.əl/',
    category: 'Job Interview',
    cefrLevel: 'A2',
    partOfSpeech: 'adjective',
    source: 'sample',
    addedAt: new Date().toISOString(),
    nextReviewDate: new Date().toISOString(),
    exampleSentences: [
      'She always maintains a professional attitude.',
      'The interview requires professional attire.',
    ],
    audioUrl: 'https://ssl.gstatic.com/dictionary/static/sounds/20220808/professional--_us_1.mp3',
    imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
    examples: [
      {
        text: 'She always maintains a professional attitude.',
        translation: 'Ella siempre mantiene una actitud profesional.',
        highlightWord: true,
      },
      {
        text: 'The interview requires professional attire.',
        translation: 'La entrevista requiere vestimenta profesional.',
        highlightWord: true,
      },
    ],
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    masteryScore: 0,
    priority: 8,
    timesCorrect: 0,
    timesIncorrect: 0,
    cardVariantsCompleted: {
      introduction: false,
      listening: false,
      typing: false,
      speaking: false,
      audioQuiz: false,
    },
    lastVariantShown: null,
  } as VocabularyItem,
  {
    ...DEFAULT_VOCABULARY_ITEM,
    id: 'vocab-2',
    word: 'Interview',
    translation: 'Entrevista',
    phonetic: '/ˈɪn.tɚ.vjuː/',
    category: 'Job Interview',
    cefrLevel: 'A2',
    partOfSpeech: 'noun',
    source: 'sample',
    addedAt: new Date().toISOString(),
    nextReviewDate: new Date().toISOString(),
    exampleSentences: [
      'I have a job interview tomorrow.',
      'The interview lasted about an hour.',
    ],
    audioUrl: 'https://ssl.gstatic.com/dictionary/static/sounds/20220808/interview--_us_1.mp3',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    examples: [
      {
        text: 'I have a job interview tomorrow.',
        translation: 'Tengo una entrevista de trabajo mañana.',
        highlightWord: true,
      },
      {
        text: 'The interview lasted about an hour.',
        translation: 'La entrevista duró aproximadamente una hora.',
        highlightWord: true,
      },
    ],
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    masteryScore: 0,
    priority: 9,
    timesCorrect: 0,
    timesIncorrect: 0,
    cardVariantsCompleted: {
      introduction: false,
      listening: false,
      typing: false,
      speaking: false,
      audioQuiz: false,
    },
    lastVariantShown: null,
  } as VocabularyItem,
  {
    ...DEFAULT_VOCABULARY_ITEM,
    id: 'vocab-3',
    word: 'Confident',
    translation: 'Seguro/a',
    phonetic: '/ˈkɑːn.fə.dənt/',
    category: 'Job Interview',
    cefrLevel: 'A2',
    partOfSpeech: 'adjective',
    source: 'sample',
    addedAt: new Date().toISOString(),
    nextReviewDate: new Date().toISOString(),
    exampleSentences: [
      'Be confident during the interview.',
      'She felt confident about her answers.',
    ],
    audioUrl: 'https://ssl.gstatic.com/dictionary/static/sounds/20220808/confident--_us_1.mp3',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    examples: [
      {
        text: 'Be confident during the interview.',
        translation: 'Sé seguro/a durante la entrevista.',
        highlightWord: true,
      },
      {
        text: 'She felt confident about her answers.',
        translation: 'Ella se sentía segura de sus respuestas.',
        highlightWord: true,
      },
    ],
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    masteryScore: 0,
    priority: 7,
    timesCorrect: 0,
    timesIncorrect: 0,
    cardVariantsCompleted: {
      introduction: false,
      listening: false,
      typing: false,
      speaking: false,
      audioQuiz: false,
    },
    lastVariantShown: null,
  } as VocabularyItem,
  {
    ...DEFAULT_VOCABULARY_ITEM,
    id: 'vocab-4',
    word: 'Experience',
    translation: 'Experiencia',
    phonetic: '/ɪkˈspɪr.i.əns/',
    category: 'Job Interview',
    cefrLevel: 'A2',
    partOfSpeech: 'noun',
    source: 'sample',
    addedAt: new Date().toISOString(),
    nextReviewDate: new Date().toISOString(),
    exampleSentences: [
      'Tell me about your work experience.',
      'I have five years of experience.',
    ],
    audioUrl: 'https://ssl.gstatic.com/dictionary/static/sounds/20220808/experience--_us_1.mp3',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
    examples: [
      {
        text: 'Tell me about your work experience.',
        translation: 'Cuéntame sobre tu experiencia laboral.',
        highlightWord: true,
      },
      {
        text: 'I have five years of experience.',
        translation: 'Tengo cinco años de experiencia.',
        highlightWord: true,
      },
    ],
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    masteryScore: 0,
    priority: 9,
    timesCorrect: 0,
    timesIncorrect: 0,
    cardVariantsCompleted: {
      introduction: false,
      listening: false,
      typing: false,
      speaking: false,
      audioQuiz: false,
    },
    lastVariantShown: null,
  } as VocabularyItem,
  {
    ...DEFAULT_VOCABULARY_ITEM,
    id: 'vocab-5',
    word: 'Salary',
    translation: 'Salario',
    phonetic: '/ˈsæl.ər.i/',
    category: 'Job Interview',
    cefrLevel: 'B1',
    partOfSpeech: 'noun',
    source: 'sample',
    addedAt: new Date().toISOString(),
    nextReviewDate: new Date().toISOString(),
    exampleSentences: [
      'What are your salary expectations?',
      'The salary is negotiable.',
    ],
    audioUrl: 'https://ssl.gstatic.com/dictionary/static/sounds/20220808/salary--_us_1.mp3',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
    examples: [
      {
        text: 'What are your salary expectations?',
        translation: '¿Cuáles son tus expectativas salariales?',
        highlightWord: true,
      },
      {
        text: 'The salary is negotiable.',
        translation: 'El salario es negociable.',
        highlightWord: true,
      },
    ],
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    masteryScore: 0,
    priority: 7,
    timesCorrect: 0,
    timesIncorrect: 0,
    cardVariantsCompleted: {
      introduction: false,
      listening: false,
      typing: false,
      speaking: false,
      audioQuiz: false,
    },
    lastVariantShown: null,
  } as VocabularyItem,
];

/**
 * Get vocabulary items by category
 */
export function getVocabularyByCategory(category: string): VocabularyItem[] {
  return SAMPLE_VOCABULARY.filter(v => v.category === category);
}

/**
 * Get vocabulary items by CEFR level
 */
export function getVocabularyByLevel(level: VocabularyItem['cefrLevel']): VocabularyItem[] {
  return SAMPLE_VOCABULARY.filter(v => v.cefrLevel === level);
}

/**
 * Get a random vocabulary item for quick practice
 */
export function getRandomVocabularyItem(): VocabularyItem {
  const index = Math.floor(Math.random() * SAMPLE_VOCABULARY.length);
  return SAMPLE_VOCABULARY[index];
}

/**
 * Get vocabulary items due for review (mock - returns all for now)
 */
export function getVocabularyDueForReview(): VocabularyItem[] {
  // In a real app, this would filter by nextReviewDate
  return SAMPLE_VOCABULARY;
}
