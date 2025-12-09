/**
 * Test Cards Screen - Shows 3 samples of the selected card type
 *
 * Allows testing each individual card component with sample data
 */

import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  SingleVocabCard,
  MultipleChoiceCard,
  ImageQuizCard,
  AudioCard,
  TextInputCard,
  SpeakingCard,
  FillInBlankCard,
  SentenceScrambleCard,
  DescribeImageCard,
  StorytellingCard,
  QuestionGameCard,
  RolePlayCard,
  ComparisonCard,
  // NEW: Vocabulary Cards (Premium)
  IntroductionCard,
  VocabListeningCard,
  VocabTypingCard,
  VocabSpeakingCard,
  VocabAudioQuizCard,
  VocabularyCardFlow,
} from '@/components/cards';
import type { VocabularyItem, VocabCardResult } from '@/components/cards';
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
  'single-vocab': [
    {
      word: 'apple',
      phonetic: '/ˈæp.əl/',
      translation: 'manzana',
      image_url: IMAGES.apple,
      example_sentence: 'I eat an apple every day for breakfast.'
    },
    {
      word: 'coffee',
      phonetic: '/ˈkɒf.i/',
      translation: 'café',
      image_url: IMAGES.coffee,
      example_sentence: 'She drinks coffee in the morning.'
    },
    {
      word: 'flower',
      phonetic: '/ˈflaʊ.ər/',
      translation: 'flor',
      image_url: IMAGES.flower,
      example_sentence: 'The flower smells beautiful in the garden.'
    },
  ],
  'multiple-choice': [
    {
      word: 'dog',
      translation: 'perro',
      image_url: IMAGES.dog,
      options: ['dog', 'cat', 'house', 'car'],
      correct_answer: 0,
      explanation: '"Perro" is Spanish for dog, a domestic animal. "Gato" (cat), "casa" (house), and "coche" (car) are different words.',
    },
    {
      word: 'book',
      translation: 'libro',
      image_url: IMAGES.book,
      options: ['phone', 'book', 'coffee', 'apple'],
      correct_answer: 1,
      explanation: '"Libro" means book in Spanish. "Teléfono" (phone), "café" (coffee), and "manzana" (apple) are incorrect.',
    },
    {
      word: 'tree',
      translation: 'árbol',
      image_url: IMAGES.tree,
      options: ['flower', 'house', 'tree', 'water'],
      correct_answer: 2,
      explanation: '"Árbol" is Spanish for tree. "Flor" (flower), "casa" (house), and "agua" (water) are different vocabulary words.',
    },
  ],
  'image-quiz': [
    {
      word: 'dog',
      image_url: IMAGES.dog,
      options: ['dog', 'cat', 'house', 'car'],
      correct_answer: 0,
      explanation: 'The image shows a dog (perro in Spanish). Remember the furry tail and friendly face!'
    },
    {
      word: 'coffee',
      image_url: IMAGES.coffee,
      options: ['water', 'coffee', 'flower', 'apple'],
      correct_answer: 1,
      explanation: 'Look for the coffee cup (café). Coffee is usually served in a mug or cup.'
    },
    {
      word: 'house',
      image_url: IMAGES.house,
      options: ['car', 'tree', 'house', 'book'],
      correct_answer: 2,
      explanation: 'This is a house (casa), a building where people live. Notice the roof and walls.'
    },
  ],
  'audio-to-image': [
    {
      word: 'apple',
      translation: 'manzana',
      options: ['apple', 'coffee', 'water', 'flower'],
      correct_answer: 0,
      explanation: 'Listen carefully to the "a" sound at the beginning. Apple starts with /æ/ as in "app".'
    },
    {
      word: 'cat',
      translation: 'gato',
      options: ['dog', 'cat', 'house', 'tree'],
      correct_answer: 1,
      explanation: 'The word "cat" has a short "a" sound and ends with a "t". Listen for the /æ/ vowel.'
    },
    {
      word: 'car',
      translation: 'coche',
      options: ['house', 'book', 'car', 'dog'],
      correct_answer: 2,
      explanation: 'Car has an "ar" sound like "far" or "star". The /r/ sound is pronounced clearly.'
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
  'describe-image': [
    {
      imageUrl: IMAGES.water,
      keywords: ['water', 'nature', 'sky'],
      minLength: 25,
      difficulty: 'easy',
      referenceDescription: 'A serene body of water reflects the clear blue sky. The calm surface creates a peaceful natural scene with gentle ripples visible across the water.'
    },
    {
      imageUrl: IMAGES.mountain,
      keywords: ['mountain', 'snow', 'sky'],
      minLength: 30,
      difficulty: 'medium',
      referenceDescription: 'A majestic snow-capped mountain peak rises dramatically against a clear blue sky. The white summit contrasts beautifully with the darker rocky slopes below.'
    },
    {
      imageUrl: IMAGES.cat,
      keywords: ['cat', 'animal', 'looking'],
      minLength: 20,
      difficulty: 'hard',
      referenceDescription: 'A curious cat gazes intently with alert eyes. The feline appears focused and attentive, showcasing typical cat behavior and posture.'
    },
  ],
  'question-game': [
    { secretWord: 'pizza', category: 'food', difficulty: 'easy', maxQuestions: 8 },
    { secretWord: 'elephant', category: 'animal', difficulty: 'medium', maxQuestions: 10 },
    { secretWord: 'airplane', category: 'vehicle', difficulty: 'hard', maxQuestions: 12 },
  ],
  'role-play': [
    { scenario: { title: 'Ordering at a Restaurant', role: 'waiter', goal: 'Order a meal', difficulty: 'easy' }, userRole: 'customer', scriptId: 'restaurant_order', maxTurns: 5 },
    { scenario: { title: 'Asking for Directions', role: 'stranger', goal: 'Find the museum', difficulty: 'medium' }, userRole: 'tourist', scriptId: 'directions', maxTurns: 7 },
    { scenario: { title: 'Shopping for Groceries', role: 'clerk', goal: 'Buy groceries', difficulty: 'hard' }, userRole: 'shopper', scriptId: 'restaurant_order', maxTurns: 6 }, // Using restaurant_order for now, as a placeholder
  ],
  'storytelling': [
    {
      images: [
        { id: '1', url: IMAGES.forest, label: 'forest' },
        { id: '2', url: IMAGES.castle, label: 'castle' },
        { id: '3', url: IMAGES.river, label: 'river' },
      ],
      storyPrompt: 'Tell a story about an adventure in a magical forest.',
      minWords: 40,
      difficulty: 'medium',
    },
    {
      images: [
        { id: '1', url: IMAGES.dog, label: 'dog' },
        { id: '2', url: IMAGES.house, label: 'house' },
      ],
      storyPrompt: 'Describe a day in the life of a pet.',
      minWords: 30,
      difficulty: 'easy',
    },
    {
      images: [
        { id: '1', url: IMAGES.mountain, label: 'mountain' },
        { id: '2', url: IMAGES.coffee, label: 'coffee' },
        { id: '3', url: IMAGES.book, label: 'book' },
      ],
      storyPrompt: 'Write a story about a cozy evening in the mountains.',
      minWords: 60,
      difficulty: 'hard',
    },
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
  comparison: [
    {
      items: [
        { label: 'English', word: 'apple', phonetic: '/ˈæp.əl/' },
        { label: 'Spanish', word: 'manzana', phonetic: '/manˈθana/' },
      ],
      title: 'Apple',
      language: 'en-US',
    },
    {
      items: [
        { label: 'English', word: 'water', phonetic: '/ˈwɔː.tər/' },
        { label: 'Spanish', word: 'agua', phonetic: '/ˈa.ɣwa/' },
      ],
      title: 'Water',
      language: 'en-US',
    },
    {
      items: [
        { label: 'English', word: 'coffee', phonetic: '/ˈkɒf.i/' },
        { label: 'Spanish', word: 'café', phonetic: '/kaˈfe/' },
      ],
      title: 'Coffee',
      language: 'en-US',
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
};

export default function TestCardsScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const router = useRouter();
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
      case 'single-vocab': return <SingleVocabCard {...currentSample} onNext={handleNext} />;
      case 'multiple-choice': return <MultipleChoiceCard {...currentSample} onNext={handleNext} />;
      case 'image-quiz': return <ImageQuizCard {...currentSample} onNext={handleNext} />;
      case 'audio-to-image': return <AudioCard {...currentSample} onNext={handleNext} />;
      case 'text-input': return <TextInputCard {...currentSample} onNext={handleNext} />;
      case 'speaking': return <SpeakingCard {...currentSample} onComplete={handleNext} />;
      case 'fill-in-blank': return <FillInBlankCard {...currentSample} onNext={handleNext} />;
      case 'sentence-scramble': return <SentenceScrambleCard {...currentSample} onComplete={handleNext} />;
      case 'describe-image': return <DescribeImageCard {...currentSample} onComplete={handleNext} />;
      case 'question-game': return <QuestionGameCard {...currentSample} onComplete={handleNext} />;
      case 'role-play': return <RolePlayCard {...currentSample} onComplete={handleNext} />;
      case 'storytelling': return <StorytellingCard {...currentSample} onComplete={handleNext} />;
      case 'comparison': return <ComparisonCard {...currentSample} />;
      // NEW: Vocabulary Cards (Premium)
      case 'vocab-introduction':
        return (
          <IntroductionCard
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Minimal close button - floating top left */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.closeButton}
      >
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      {/* Fullscreen card content */}
      <View style={styles.cardContainer}>
        {renderCard()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
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
    paddingTop: spacing.md,
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
