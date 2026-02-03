/**
 * Test Cards Screen - Shows 3 samples of the selected card type
 *
 * Allows testing each individual card component with sample data
 */

import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  QuizCard,
  AudioCard,
  TextInputCard,
  SpeakingCard,
  FillInBlankCard,
  SentenceScrambleCard,
  RolePlayCard,
  ComparisonCard,
  // Vocabulary Cards (Premium)
  IntroductionCard,
  IntroductionCardV2,
  VocabListeningCard,
  VocabTypingCard,
  VocabSpeakingCard,
  VocabAudioQuizCard,
  VocabularyCardFlow,
} from '@/components/cards';
import type { VocabularyItem, VocabCardResult } from '@/components/cards';
import { CalibrationFlow } from '@/components/calibration';
import type { CalibrationResult } from '@/components/calibration';
import { colors, spacing, typography } from '@/constants/designSystem';

// Placeholder images
const IMAGES = {
  apple: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600',
  coffee: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600',
  book: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600',
  car: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600',
  dog: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600',
  cat: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600',
  house: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600',
  flower: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600',
  water: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600',
  mountain: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=600',
  tree: 'https://images.unsplash.com/photo-1536932450882-f3768d184762?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // New image for tree
  fruit: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=2836&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // New image for fruit
  forest: 'https://images.unsplash.com/photo-1510784750430-8041535492d5?q=80&w=2835&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // New image for forest
  castle: 'https://images.unsplash.com/photo-1577782352161-5916327660c1?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // New image for castle
  river: 'https://images.unsplash.com/photo-1549877452-9c387954fbc2?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // New image for river
};

// Sample data for each card type (3 samples each)
const CARD_SAMPLES = {
  // Unified Quiz Card - supports both 'image' and 'translation' modes
  quiz: [
    {
      mode: 'image' as const,
      word: 'dog',
      translation: 'perro',
      image_url: IMAGES.dog,
      options: ['dog', 'cat', 'house', 'car'],
      correct_answer: 0,
      explanation: 'The image shows a dog (perro in Spanish). Remember the furry tail and friendly face!',
    },
    {
      mode: 'translation' as const,
      word: 'book',
      translation: 'libro',
      image_url: IMAGES.book,
      options: ['phone', 'book', 'coffee', 'apple'],
      correct_answer: 1,
      explanation: '"Libro" means book in Spanish. "Teléfono" (phone), "café" (coffee), and "manzana" (apple) are incorrect.',
    },
    {
      mode: 'image' as const,
      word: 'coffee',
      image_url: IMAGES.coffee,
      options: ['water', 'coffee', 'flower', 'apple'],
      correct_answer: 1,
      explanation: 'Look for the coffee cup (café). Coffee is usually served in a mug or cup.',
    },
    {
      mode: 'translation' as const,
      word: 'tree',
      translation: 'árbol',
      image_url: IMAGES.tree,
      options: ['flower', 'house', 'tree', 'water'],
      correct_answer: 2,
      explanation: '"Árbol" is Spanish for tree. "Flor" (flower), "casa" (house), and "agua" (water) are different vocabulary words.',
    },
    {
      mode: 'image' as const,
      word: 'house',
      image_url: IMAGES.house,
      options: ['car', 'tree', 'house', 'book'],
      correct_answer: 2,
      explanation: 'This is a house (casa), a building where people live. Notice the roof and walls.',
    },
  ],
  'audio-to-image': [
    // Short word example
    {
      word: 'apple',
      translation: 'manzana',
      options: ['apple', 'coffee', 'water', 'flower'],
      correct_answer: 0,
      explanation: 'Listen carefully to the "a" sound at the beginning. Apple starts with /æ/ as in "app".'
    },
    // Medium phrase example
    {
      word: 'good morning',
      translation: 'buenos días',
      options: ['good night', 'good morning', 'good evening', 'goodbye'],
      correct_answer: 1,
      explanation: '"Good morning" is a common greeting used in the early part of the day. Listen for the "mor-ning" sound.'
    },
    // Long phrase example - tests adaptive layout
    {
      word: 'Where is the nearest train station?',
      translation: '¿Dónde está la estación de tren más cercana?',
      options: ['Where is the bus stop?', 'Where is the airport?', 'Where is the nearest train station?', 'Where is the taxi stand?'],
      correct_answer: 2,
      explanation: 'This is a common travel phrase. Listen for "train station" at the end. The key words are "nearest" and "train".'
    },
    // Another long phrase
    {
      word: 'I would like to make a reservation for two people',
      translation: 'Me gustaría hacer una reservación para dos personas',
      options: ['I need a table', 'I would like to make a reservation for two people', 'Can I have the menu?', 'The bill please'],
      correct_answer: 1,
      explanation: 'This is a restaurant phrase. Key words: "reservation" and "two people". Listen for the formal "would like" structure.'
    },
    // Travel phrase
    {
      word: 'Excuse me, could you help me find my way?',
      translation: 'Disculpe, ¿podría ayudarme a encontrar mi camino?',
      options: ['Where is the hotel?', 'How much does it cost?', 'Excuse me, could you help me find my way?', 'Can I have directions?'],
      correct_answer: 2,
      explanation: 'A polite way to ask for directions. Listen for "excuse me" at the start and "find my way" at the end.'
    },
  ],
  'text-input': [
    {
      word: 'flower',
      translation: 'flor',
      correct_answer: 'flower',
      image_url: IMAGES.flower,
      explanation: 'Remember: "flow" + "er" = flower. The "ow" sounds like "oh".'
    },
    {
      word: 'coffee',
      translation: 'café',
      correct_answer: 'coffee',
      image_url: IMAGES.coffee,
      explanation: 'Coffee has double "f" and double "e". Think: "cof-fee" with two syllables.'
    },
    {
      word: 'water',
      translation: 'agua',
      correct_answer: 'water',
      image_url: IMAGES.water,
      explanation: 'Water ends with "-ter" not "-tor". The "a" is pronounced like "awe".'
    },
  ],
  speaking: [
    { question: 'How do you say "apple" in Spanish?', targetWord: 'apple', phonetic: '/ˈæp.əl/' },
    { question: 'Can you pronounce "house"?', targetWord: 'house', phonetic: '/haʊs/' },
    { question: 'Please say "flower".', targetWord: 'flower', phonetic: '/ˈflaʊ.ər/' },
  ],
  'sentence-scramble': [
    { words: ['is', 'a', 'This', 'sentence'], correctOrder: ['This', 'is', 'a', 'sentence'], targetSentence: 'This is a sentence', hint: 'Starts with a capital letter.', difficulty: 'easy' },
    { words: ['language', 'learning', 'is', 'fun'], correctOrder: ['learning', 'language', 'is', 'fun'], targetSentence: 'learning language is fun', hint: 'Think about the subject.', difficulty: 'medium' },
    { words: ['a', 'good', 'This', 'is', 'example'], correctOrder: ['This', 'is', 'a', 'good', 'example'], targetSentence: 'This is a good example', hint: 'Group the adjectives.', difficulty: 'hard' },
  ],
  'role-play': [
    { scenario: { title: 'Ordering at a Restaurant', role: 'waiter', goal: 'Order a meal', difficulty: 'easy' }, userRole: 'customer', scriptId: 'restaurant_order', maxTurns: 5 },
    { scenario: { title: 'Asking for Directions', role: 'stranger', goal: 'Find the museum', difficulty: 'medium' }, userRole: 'tourist', scriptId: 'directions', maxTurns: 7 },
    { scenario: { title: 'Shopping for Groceries', role: 'clerk', goal: 'Buy groceries', difficulty: 'hard' }, userRole: 'shopper', scriptId: 'restaurant_order', maxTurns: 6 }, // Using restaurant_order for now, as a placeholder
  ],
  'fill-in-blank': [
    {
      sentence: 'I [BLANK] to the store yesterday.',
      options: ['go', 'went', 'going', 'goes'],
      correct_answer: 1,
    },
    {
      sentence: 'She [BLANK] coffee every morning.',
      options: ['drink', 'drinks', 'drinking', 'drank'],
      correct_answer: 1,
    },
    {
      sentence: 'They [BLANK] studying English for two years.',
      options: ['are', 'have been', 'was', 'were'],
      correct_answer: 1,
    },
  ],
  // ComparisonCardV2 - For comparing similar-sounding or similar-looking words
  // RULE: MAX 2 ITEMS per card! Split into sequences if needed.
  // NOT for direct translations! Use this for: verb tenses, homophones, synonyms, etc.
  comparison: [
    // Example 1: Verb Tenses - Go vs Went (Present/Past)
    {
      type: 'verb-tense' as const,
      items: [
        {
          label: 'Present',
          word: 'go',
          phonetic: '/ɡoʊ/',
          nativeApprox: 'góu',
          definition: 'Base form - action happening now or regularly',
          example: { text: 'I go to the gym every morning.', translation: 'Voy al gimnasio cada mañana.' },
        },
        {
          label: 'Past',
          word: 'went',
          phonetic: '/wɛnt/',
          nativeApprox: 'uent',
          definition: 'Irregular past - action completed in the past',
          example: { text: 'Yesterday, I went to the beach.', translation: 'Ayer, fui a la playa.' },
        },
      ],
      onComplete: (quality: 'again' | 'got-it') => console.log('Verb tense rated:', quality),
    },
    // Example 2: Verb Tenses - Went vs Gone (Past/Past Participle) - Continuation
    {
      type: 'verb-tense' as const,
      items: [
        {
          label: 'Past',
          word: 'went',
          phonetic: '/wɛnt/',
          nativeApprox: 'uent',
          definition: 'Irregular past - action completed in the past',
          example: { text: 'Yesterday, I went to the beach.', translation: 'Ayer, fui a la playa.' },
        },
        {
          label: 'Past Participle',
          word: 'gone',
          phonetic: '/ɡɔːn/',
          nativeApprox: 'gon',
          definition: 'Used with have/has for perfect tenses',
          example: { text: 'She has gone home already.', translation: 'Ella ya se ha ido a casa.' },
        },
      ],
      onComplete: (quality: 'again' | 'got-it') => console.log('Verb tense rated:', quality),
    },
    // Example 3: Homophones - There vs Their
    {
      type: 'homophone' as const,
      items: [
        {
          label: 'Place',
          word: 'there',
          phonetic: '/ðɛr/',
          nativeApprox: 'der',
          definition: 'Indicates a location or position',
          example: { text: 'The book is over there on the table.', translation: 'El libro está allí sobre la mesa.' },
        },
        {
          label: 'Possession',
          word: 'their',
          phonetic: '/ðɛr/',
          nativeApprox: 'der',
          definition: 'Shows something belongs to them',
          example: { text: 'Their car is parked outside.', translation: 'Su carro está estacionado afuera.' },
        },
      ],
      onComplete: (quality: 'again' | 'got-it') => console.log('Homophone rated:', quality),
    },
    // Example 4: Homophones - Their vs They're (Continuation)
    {
      type: 'homophone' as const,
      items: [
        {
          label: 'Possession',
          word: 'their',
          phonetic: '/ðɛr/',
          nativeApprox: 'der',
          definition: 'Shows something belongs to them',
          example: { text: 'Their car is parked outside.', translation: 'Su carro está estacionado afuera.' },
        },
        {
          label: 'They + Are',
          word: "they're",
          phonetic: '/ðɛr/',
          nativeApprox: 'der',
          definition: 'Contraction of "they are"',
          example: { text: "They're coming to the party tonight.", translation: 'Ellos vienen a la fiesta esta noche.' },
        },
      ],
      onComplete: (quality: 'again' | 'got-it') => console.log('Homophone rated:', quality),
    },
    // Example 5: Similar Words - Affect vs Effect
    {
      type: 'similar-words' as const,
      items: [
        {
          label: 'Verb',
          word: 'affect',
          phonetic: '/əˈfɛkt/',
          nativeApprox: 'a-FECT',
          definition: 'To influence or cause change (action word)',
          example: { text: 'The rain will affect our outdoor plans.', translation: 'La lluvia afectará nuestros planes.' },
        },
        {
          label: 'Noun',
          word: 'effect',
          phonetic: '/ɪˈfɛkt/',
          nativeApprox: 'i-FECT',
          definition: 'The result or outcome of a change',
          example: { text: 'The effect of exercise is better health.', translation: 'El efecto del ejercicio es mejor salud.' },
        },
      ],
      onComplete: (quality: 'again' | 'got-it') => console.log('Similar words rated:', quality),
    },
  ],
  // NEW: Vocabulary Cards (Premium)
  'vocab-introduction': [
    {
      id: 'vocab-1',
      word: 'Wait and see',
      translation: 'Attendre et voir',
      phonetic: 'weɪt ænd siː',
      category: 'Expressions',
      cefrLevel: 'B1',
      partOfSpeech: 'phrase',
      masteryScore: 0,
      priority: 5,
      timesCorrect: 0,
      timesIncorrect: 0,
      source: 'lesson',
      exampleSentences: [],
      addedAt: new Date().toISOString(),
      nextReviewDate: new Date().toISOString(),
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      cardVariantsCompleted: { introduction: false, listening: false, typing: false, speaking: false, audioQuiz: false },
      lastVariantShown: null,
      imageUrl: IMAGES.mountain, // Hero image for visual context
      examples: [
        { text: "Let's wait and see what happens.", translation: 'Attendons et voyons ce qui se passe.' },
        { text: 'We should wait and see the results.', translation: 'Nous devrions attendre et voir les résultats.' },
      ],
    },
    {
      id: 'vocab-2',
      word: 'Hello',
      translation: 'Bonjour',
      phonetic: 'həˈloʊ',
      category: 'Greeting',
      cefrLevel: 'A1',
      partOfSpeech: 'interjection',
      masteryScore: 0,
      priority: 5,
      timesCorrect: 0,
      timesIncorrect: 0,
      source: 'lesson',
      exampleSentences: [],
      addedAt: new Date().toISOString(),
      nextReviewDate: new Date().toISOString(),
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      cardVariantsCompleted: { introduction: false, listening: false, typing: false, speaking: false, audioQuiz: false },
      lastVariantShown: null,
      imageUrl: IMAGES.coffee, // Hero image for visual context
      examples: [
        { text: 'Hello, how are you?', translation: 'Bonjour, comment allez-vous?' },
        { text: 'Hello there!', translation: 'Bonjour!' },
      ],
    },
    {
      id: 'vocab-3',
      word: 'Beautiful',
      translation: 'Beau / Belle',
      phonetic: 'ˈbjuː.tɪ.fəl',
      category: 'Adjectives',
      cefrLevel: 'A2',
      partOfSpeech: 'adjective',
      masteryScore: 0,
      priority: 5,
      timesCorrect: 0,
      timesIncorrect: 0,
      source: 'lesson',
      exampleSentences: [],
      addedAt: new Date().toISOString(),
      nextReviewDate: new Date().toISOString(),
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      cardVariantsCompleted: { introduction: false, listening: false, typing: false, speaking: false, audioQuiz: false },
      lastVariantShown: null,
      imageUrl: IMAGES.flower, // Hero image for visual context
      examples: [
        { text: 'What a beautiful day!', translation: 'Quelle belle journée!' },
        { text: 'She has a beautiful smile.', translation: 'Elle a un beau sourire.' },
      ],
    },
  ],
  // NEW: IntroductionCardV2 with flip animation
  'vocab-introduction-v2': [
    {
      id: 'vocab-v2-1',
      word: 'Serendipity',
      translation: 'Casualidad afortunada',
      phonetic: 'ˌserənˈdɪpəti',
      category: 'Abstract',
      cefrLevel: 'C1',
      partOfSpeech: 'noun',
      masteryScore: 0,
      priority: 5,
      timesCorrect: 0,
      timesIncorrect: 0,
      source: 'lesson',
      exampleSentences: [],
      addedAt: new Date().toISOString(),
      nextReviewDate: new Date().toISOString(),
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      cardVariantsCompleted: { introduction: false, listening: false, typing: false, speaking: false, audioQuiz: false },
      lastVariantShown: null,
      imageUrl: IMAGES.flower,
      examples: [
        { text: 'Finding that book was pure serendipity.', translation: 'Encontrar ese libro fue pura casualidad.' },
      ],
    },
    {
      id: 'vocab-v2-2',
      word: 'Resilience',
      translation: 'Resiliencia',
      phonetic: 'rɪˈzɪliəns',
      category: 'Character',
      cefrLevel: 'B2',
      partOfSpeech: 'noun',
      masteryScore: 0,
      priority: 5,
      timesCorrect: 0,
      timesIncorrect: 0,
      source: 'lesson',
      exampleSentences: [],
      addedAt: new Date().toISOString(),
      nextReviewDate: new Date().toISOString(),
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      cardVariantsCompleted: { introduction: false, listening: false, typing: false, speaking: false, audioQuiz: false },
      lastVariantShown: null,
      imageUrl: IMAGES.mountain,
      examples: [
        { text: 'Her resilience helped her overcome the challenge.', translation: 'Su resiliencia la ayudó a superar el desafío.' },
      ],
    },
    {
      id: 'vocab-v2-3',
      word: 'Wanderlust',
      translation: 'Pasión por viajar',
      phonetic: 'ˈwɒndəlʌst',
      category: 'Emotions',
      cefrLevel: 'B2',
      partOfSpeech: 'noun',
      masteryScore: 0,
      priority: 5,
      timesCorrect: 0,
      timesIncorrect: 0,
      source: 'lesson',
      exampleSentences: [],
      addedAt: new Date().toISOString(),
      nextReviewDate: new Date().toISOString(),
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      cardVariantsCompleted: { introduction: false, listening: false, typing: false, speaking: false, audioQuiz: false },
      lastVariantShown: null,
      imageUrl: IMAGES.forest,
      examples: [
        { text: 'My wanderlust takes me to new places every year.', translation: 'Mi pasión por viajar me lleva a nuevos lugares cada año.' },
      ],
    },
  ],
  'vocab-listening': [
    {
      id: 'vocab-listen-1',
      word: 'Apple',
      translation: 'Pomme',
      phonetic: 'ˈæp.əl',
      category: 'Food',
      cefrLevel: 'A1',
      partOfSpeech: 'noun',
      masteryScore: 30,
      priority: 5,
      timesCorrect: 2,
      timesIncorrect: 1,
      source: 'lesson',
      exampleSentences: [],
      addedAt: new Date().toISOString(),
      nextReviewDate: new Date().toISOString(),
      easeFactor: 2.5,
      interval: 1,
      repetitions: 1,
      cardVariantsCompleted: { introduction: true, listening: false, typing: false, speaking: false, audioQuiz: false },
      lastVariantShown: 'introduction',
      examples: [],
    },
    {
      id: 'vocab-listen-2',
      word: 'Coffee',
      translation: 'Café',
      phonetic: 'ˈkɒf.i',
      category: 'Drinks',
      cefrLevel: 'A1',
      partOfSpeech: 'noun',
      masteryScore: 40,
      priority: 5,
      timesCorrect: 3,
      timesIncorrect: 1,
      source: 'lesson',
      exampleSentences: [],
      addedAt: new Date().toISOString(),
      nextReviewDate: new Date().toISOString(),
      easeFactor: 2.5,
      interval: 2,
      repetitions: 2,
      cardVariantsCompleted: { introduction: true, listening: false, typing: false, speaking: false, audioQuiz: false },
      lastVariantShown: 'introduction',
      examples: [],
    },
    {
      id: 'vocab-listen-3',
      word: 'Book',
      translation: 'Livre',
      phonetic: 'bʊk',
      category: 'Objects',
      cefrLevel: 'A1',
      partOfSpeech: 'noun',
      masteryScore: 50,
      priority: 5,
      timesCorrect: 4,
      timesIncorrect: 1,
      source: 'lesson',
      exampleSentences: [],
      addedAt: new Date().toISOString(),
      nextReviewDate: new Date().toISOString(),
      easeFactor: 2.5,
      interval: 3,
      repetitions: 3,
      cardVariantsCompleted: { introduction: true, listening: false, typing: false, speaking: false, audioQuiz: false },
      lastVariantShown: 'introduction',
      examples: [],
    },
  ],
  'vocab-typing': [
    {
      id: 'vocab-type-1',
      word: 'Water',
      translation: 'Eau',
      phonetic: 'ˈwɔː.tər',
      category: 'Drinks',
      cefrLevel: 'A1',
      partOfSpeech: 'noun',
      masteryScore: 60,
      priority: 5,
      timesCorrect: 5,
      timesIncorrect: 1,
      source: 'lesson',
      exampleSentences: [],
      addedAt: new Date().toISOString(),
      nextReviewDate: new Date().toISOString(),
      easeFactor: 2.5,
      interval: 5,
      repetitions: 4,
      cardVariantsCompleted: { introduction: true, listening: true, typing: false, speaking: false, audioQuiz: false },
      lastVariantShown: 'listening',
      examples: [],
    },
    {
      id: 'vocab-type-2',
      word: 'House',
      translation: 'Maison',
      phonetic: 'haʊs',
      category: 'Places',
      cefrLevel: 'A1',
      partOfSpeech: 'noun',
      masteryScore: 55,
      priority: 5,
      timesCorrect: 4,
      timesIncorrect: 2,
      source: 'lesson',
      exampleSentences: [],
      addedAt: new Date().toISOString(),
      nextReviewDate: new Date().toISOString(),
      easeFactor: 2.5,
      interval: 4,
      repetitions: 3,
      cardVariantsCompleted: { introduction: true, listening: true, typing: false, speaking: false, audioQuiz: false },
      lastVariantShown: 'listening',
      examples: [],
    },
    {
      id: 'vocab-type-3',
      word: 'Flower',
      translation: 'Fleur',
      phonetic: 'ˈflaʊ.ər',
      category: 'Nature',
      cefrLevel: 'A2',
      partOfSpeech: 'noun',
      masteryScore: 45,
      priority: 5,
      timesCorrect: 3,
      timesIncorrect: 2,
      source: 'lesson',
      exampleSentences: [],
      addedAt: new Date().toISOString(),
      nextReviewDate: new Date().toISOString(),
      easeFactor: 2.5,
      interval: 3,
      repetitions: 2,
      cardVariantsCompleted: { introduction: true, listening: true, typing: false, speaking: false, audioQuiz: false },
      lastVariantShown: 'listening',
      examples: [],
    },
  ],
  // NEW: Speaking Card (Listen & Speak)
  'vocab-speaking': [
    {
      id: 'vocab-speak-1',
      word: 'Mountain',
      translation: 'Montagne',
      phonetic: 'ˈmaʊn.tɪn',
      category: 'Nature',
      cefrLevel: 'A2',
      partOfSpeech: 'noun',
      masteryScore: 70,
      priority: 5,
      timesCorrect: 6,
      timesIncorrect: 1,
      source: 'lesson',
      exampleSentences: [],
      addedAt: new Date().toISOString(),
      nextReviewDate: new Date().toISOString(),
      easeFactor: 2.5,
      interval: 7,
      repetitions: 5,
      cardVariantsCompleted: { introduction: true, listening: true, typing: true, speaking: false, audioQuiz: true },
      lastVariantShown: 'typing',
      examples: [],
    },
    {
      id: 'vocab-speak-2',
      word: 'River',
      translation: 'Rivière',
      phonetic: 'ˈrɪv.ər',
      category: 'Nature',
      cefrLevel: 'A2',
      partOfSpeech: 'noun',
      masteryScore: 65,
      priority: 5,
      timesCorrect: 5,
      timesIncorrect: 2,
      source: 'lesson',
      exampleSentences: [],
      addedAt: new Date().toISOString(),
      nextReviewDate: new Date().toISOString(),
      easeFactor: 2.5,
      interval: 5,
      repetitions: 4,
      cardVariantsCompleted: { introduction: true, listening: true, typing: true, speaking: false, audioQuiz: true },
      lastVariantShown: 'audioQuiz',
      examples: [],
    },
    {
      id: 'vocab-speak-3',
      word: 'Forest',
      translation: 'Forêt',
      phonetic: 'ˈfɒr.ɪst',
      category: 'Nature',
      cefrLevel: 'A2',
      partOfSpeech: 'noun',
      masteryScore: 60,
      priority: 5,
      timesCorrect: 4,
      timesIncorrect: 2,
      source: 'lesson',
      exampleSentences: [],
      addedAt: new Date().toISOString(),
      nextReviewDate: new Date().toISOString(),
      easeFactor: 2.5,
      interval: 4,
      repetitions: 3,
      cardVariantsCompleted: { introduction: true, listening: true, typing: true, speaking: false, audioQuiz: true },
      lastVariantShown: 'typing',
      examples: [],
    },
  ],
  // NEW: Audio Quiz Card (Listen & Select)
  'vocab-audio-quiz': [
    {
      id: 'vocab-quiz-1',
      word: 'Cat',
      translation: 'Chat',
      phonetic: 'kæt',
      category: 'Animals',
      cefrLevel: 'A1',
      partOfSpeech: 'noun',
      masteryScore: 20,
      priority: 5,
      timesCorrect: 1,
      timesIncorrect: 1,
      source: 'lesson',
      exampleSentences: [],
      addedAt: new Date().toISOString(),
      nextReviewDate: new Date().toISOString(),
      easeFactor: 2.5,
      interval: 1,
      repetitions: 1,
      cardVariantsCompleted: { introduction: true, listening: false, typing: false, speaking: false, audioQuiz: false },
      lastVariantShown: 'introduction',
      examples: [],
    },
    {
      id: 'vocab-quiz-2',
      word: 'Dog',
      translation: 'Chien',
      phonetic: 'dɒɡ',
      category: 'Animals',
      cefrLevel: 'A1',
      partOfSpeech: 'noun',
      masteryScore: 25,
      priority: 5,
      timesCorrect: 2,
      timesIncorrect: 1,
      source: 'lesson',
      exampleSentences: [],
      addedAt: new Date().toISOString(),
      nextReviewDate: new Date().toISOString(),
      easeFactor: 2.5,
      interval: 1,
      repetitions: 1,
      cardVariantsCompleted: { introduction: true, listening: false, typing: false, speaking: false, audioQuiz: false },
      lastVariantShown: 'introduction',
      examples: [],
    },
    {
      id: 'vocab-quiz-3',
      word: 'Bird',
      translation: 'Oiseau',
      phonetic: 'bɜːd',
      category: 'Animals',
      cefrLevel: 'A1',
      partOfSpeech: 'noun',
      masteryScore: 15,
      priority: 5,
      timesCorrect: 1,
      timesIncorrect: 2,
      source: 'lesson',
      exampleSentences: [],
      addedAt: new Date().toISOString(),
      nextReviewDate: new Date().toISOString(),
      easeFactor: 2.5,
      interval: 1,
      repetitions: 1,
      cardVariantsCompleted: { introduction: true, listening: false, typing: false, speaking: false, audioQuiz: false },
      lastVariantShown: 'introduction',
      examples: [],
    },
  ],
  // NEW: Vocabulary Card Flow (Full sequence test)
  'vocab-flow': [
    {
      id: 'vocab-flow-1',
      word: 'Adventure',
      translation: 'Aventure',
      phonetic: 'ædˈven.tʃər',
      category: 'Abstract',
      cefrLevel: 'B1',
      partOfSpeech: 'noun',
      masteryScore: 0,
      priority: 5,
      timesCorrect: 0,
      timesIncorrect: 0,
      source: 'lesson',
      exampleSentences: [],
      addedAt: new Date().toISOString(),
      nextReviewDate: new Date().toISOString(),
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      cardVariantsCompleted: { introduction: false, listening: false, typing: false, speaking: false, audioQuiz: false },
      lastVariantShown: null,
      imageUrl: IMAGES.mountain,
      examples: [
        { text: 'Life is an adventure.', translation: 'La vie est une aventure.' },
        { text: 'She loves adventure sports.', translation: 'Elle aime les sports d\'aventure.' },
      ],
    },
  ],
  // Calibration Flow (Level Calibrator)
  'calibration': [{ placeholder: true }],
};

export default function TestCardsScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);

  const cardType = type || 'single-vocab';
  const samples = CARD_SAMPLES[cardType as keyof typeof CARD_SAMPLES] || [];
  const currentSample = samples[currentIndex];

  const handleNext = (result?: any) => {
    console.log('handleNext called with:', result);
    if (currentIndex < samples.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // router.back();
    }
  };

  const renderCard = () => {
    if (!currentSample) {
      return <View style={styles.errorCard}><Text style={styles.errorText}>No samples for "{cardType}"</Text></View>;
    }

    switch (cardType) {
      case 'quiz': {
        const sample = currentSample as any;
        return (
          <QuizCard
            mode={sample.mode || 'image'}
            word={sample.word || ''}
            translation={sample.translation}
            image_url={sample.image_url}
            options={sample.options || []}
            correct_answer={sample.correct_answer as number}
            explanation={sample.explanation}
            onComplete={(correct) => handleNext(correct)}
          />
        );
      }
      case 'audio-to-image': {
        const audioSample = currentSample as {
          word: string;
          translation: string;
          options: string[];
          correct_answer: number;
          explanation: string;
        };
        return <AudioCard {...audioSample} onNext={handleNext} />;
      }
      case 'text-input': return <TextInputCard {...currentSample} onNext={handleNext} />;
      case 'speaking': return <SpeakingCard {...currentSample} onComplete={handleNext} />;
      case 'fill-in-blank': return <FillInBlankCard {...currentSample} onNext={handleNext} />;
      case 'sentence-scramble': return <SentenceScrambleCard {...currentSample} onComplete={handleNext} />;
      case 'role-play': return <RolePlayCard {...currentSample} onComplete={handleNext} />;
      case 'comparison': {
        const compSample = currentSample as any;
        return (
          <ComparisonCard
            type={compSample.type}
            items={compSample.items}
            onComplete={(quality) => {
              console.log('Comparison card completed:', quality);
              handleNext(quality);
            }}
          />
        );
      }
      // NEW: Vocabulary Cards (Premium)
      case 'vocab-introduction':
        return (
          <IntroductionCardV2
            item={currentSample as VocabularyItem}
            onComplete={(result: VocabCardResult) => handleNext(result)}
            onSkip={() => handleNext()}
          />
        );
      case 'vocab-introduction-v2':
        return (
          <IntroductionCardV2
            item={currentSample as VocabularyItem}
            onComplete={(result: VocabCardResult) => handleNext(result)}
            onSkip={() => handleNext()}
          />
        );
      case 'vocab-listening':
        return (
          <VocabListeningCard
            item={currentSample as VocabularyItem}
            onComplete={(result: VocabCardResult) => handleNext(result)}
            mode="type"
          />
        );
      case 'vocab-typing':
        return (
          <VocabTypingCard
            item={currentSample as VocabularyItem}
            onComplete={(result: VocabCardResult) => handleNext(result)}
            onSkip={() => handleNext()}
          />
        );
      case 'vocab-speaking':
        return (
          <VocabSpeakingCard
            item={currentSample as VocabularyItem}
            onComplete={(result: VocabCardResult) => handleNext(result)}
            onSkip={() => handleNext()}
          />
        );
      case 'vocab-audio-quiz':
        return (
          <VocabAudioQuizCard
            item={currentSample as VocabularyItem}
            onComplete={(result: VocabCardResult) => handleNext(result)}
          />
        );
      case 'vocab-flow':
        return (
          <VocabularyCardFlow
            item={currentSample as VocabularyItem}
            onComplete={(results: VocabCardResult[]) => {
              console.log('Flow completed with results:', results);
              handleNext(results);
            }}
            onExit={() => router.back()}
          />
        );
      case 'calibration':
        return (
          <CalibrationFlow
            onComplete={(result: CalibrationResult) => {
              console.log('Calibration completed:', result);
              router.back();
            }}
            onExit={() => router.back()}
          />
        );
      default:
        return (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>Card type "{cardType}" not implemented</Text>
            <Text style={styles.errorSubtext}>Placeholder for new Gemini cards</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Minimal close button - floating top left with safe area */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={[styles.closeButton, { top: insets.top + spacing.sm }]}
      >
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      {/* Fullscreen card content - cards handle their own bottom safe area */}
      <View style={[styles.cardContainer, { paddingTop: insets.top + spacing['2xl'] }]}>
        {renderCard()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  closeButton: {
    position: 'absolute',
    left: spacing.md,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.background.elevated,
    zIndex: 10,
  },
  closeText: {
    fontSize: 20,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
  },
  cardContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  errorCard: {
    backgroundColor: colors.background.card,
    padding: spacing['2xl'],
    borderRadius: 16,
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 2,
    borderColor: colors.warning.DEFAULT,
  },
  errorText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
