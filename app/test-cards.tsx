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
} from '@/components/cards';
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
    { word: 'apple', phonetic: '/ˈæp.əl/', translation: 'manzana', image_url: IMAGES.apple },
    { word: 'coffee', phonetic: '/ˈkɒf.i/', translation: 'café', image_url: IMAGES.coffee },
    { word: 'flower', phonetic: '/ˈflaʊ.ər/', translation: 'flor', image_url: IMAGES.flower },
  ],
  'multiple-choice': [
    {
      word: 'dog',
      translation: 'perro',
      options: ['dog', 'cat', 'house', 'car'],
      correct_answer: 0,
    },
    {
      word: 'book',
      translation: 'libro',
      options: ['phone', 'book', 'coffee', 'apple'],
      correct_answer: 1,
    },
    {
      word: 'tree',
      translation: 'árbol',
      options: ['flower', 'house', 'tree', 'water'],
      correct_answer: 2,
    },
  ],
  'image-quiz': [
    { word: 'dog', image_url: IMAGES.dog, options: ['dog', 'cat', 'house', 'car'], correct_answer: 0 },
    { word: 'coffee', image_url: IMAGES.coffee, options: ['water', 'coffee', 'flower', 'apple'], correct_answer: 1 },
    { word: 'house', image_url: IMAGES.house, options: ['car', 'tree', 'house', 'book'], correct_answer: 2 },
  ],
  'audio-to-image': [
    { word: 'apple', translation: 'manzana', options: ['apple', 'coffee', 'water', 'flower'], correct_answer: 0 },
    { word: 'cat', translation: 'gato', options: ['dog', 'cat', 'house', 'tree'], correct_answer: 1 },
    { word: 'car', translation: 'coche', options: ['house', 'book', 'car', 'dog'], correct_answer: 2 },
  ],
  'text-input': [
    { word: 'flower', translation: 'flor', correct_answer: 'flower' },
    { word: 'coffee', translation: 'café', correct_answer: 'coffee' },
    { word: 'water', translation: 'agua', correct_answer: 'water' },
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
    { imageUrl: IMAGES.beach, keywords: ['beach', 'water', 'sky'], minLength: 25, difficulty: 'easy' },
    { imageUrl: IMAGES.mountain, keywords: ['mountain', 'snow', 'sky'], minLength: 30, difficulty: 'medium' },
    { imageUrl: IMAGES.cat, keywords: ['cat', 'animal', 'looking'], minLength: 20, difficulty: 'hard' },
  ],
  'question-game': [
    { secretWord: 'apple', category: 'fruit', difficulty: 'easy', maxQuestions: 5 },
    { secretWord: 'dog', category: 'animal', difficulty: 'medium', maxQuestions: 7 },
    { secretWord: 'car', category: 'vehicle', difficulty: 'hard', maxQuestions: 10 },
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}><Text style={styles.backText}>✕</Text></TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{cardType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</Text>
          <Text style={styles.subtitle}>Sample {currentIndex + 1} of {samples.length}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.progressContainer}>
        {samples.map((_, index) => (
          <View key={index} style={[styles.progressDot, index === currentIndex && styles.progressDotActive, index < currentIndex && styles.progressDotCompleted]} />
        ))}
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {renderCard()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border.dark },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: colors.background.elevated },
  backText: { fontSize: 24, color: colors.text.primary, fontWeight: typography.fontWeight.bold },
  headerInfo: { flex: 1, alignItems: 'center', gap: spacing.xs },
  title: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.text.primary, textAlign: 'center' },
  subtitle: { fontSize: typography.fontSize.sm, color: colors.text.tertiary },
  progressContainer: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border.light },
  progressDotActive: { width: 24, backgroundColor: colors.primary.DEFAULT },
  progressDotCompleted: { backgroundColor: colors.success.DEFAULT },
  scrollView: { flex: 1 },
  content: { padding: spacing.lg, flexGrow: 1 },
  errorCard: { backgroundColor: colors.background.card, padding: spacing.xxl, borderRadius: 16, alignItems: 'center', gap: spacing.md, borderWidth: 2, borderColor: colors.warning.DEFAULT },
  errorText: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: colors.text.primary, textAlign: 'center' },
  errorSubtext: { fontSize: typography.fontSize.base, color: colors.text.tertiary, textAlign: 'center' },
});
