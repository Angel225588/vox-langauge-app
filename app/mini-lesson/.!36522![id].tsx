/**
 * Mini-Lesson Flow Screen
 *
 * Card-by-card navigation through a mini-lesson
 * Displays cards one at a time with progress indicator
 * Navigates to completion screen when finished
 */

import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';
import { getCardsForMiniLesson, MOCK_MINI_LESSONS } from '@/lib/db/mock-mini-lessons';
import { MiniLessonCard } from '@/lib/types/mini-lesson';
import {
  SingleVocabCard,
  MultipleChoiceCard,
  ImageQuizCard,
  AudioCard,
  TextInputCard,
  SpeakingCard,
} from '@/components/cards';

const { width } = Dimensions.get('window');

export default function MiniLessonFlowScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [startTime] = useState(Date.now());

  // Get mini-lesson and cards
  const miniLesson = MOCK_MINI_LESSONS.find(ml => ml.id === id);
  const cards = getCardsForMiniLesson(id);

  if (!miniLesson || cards.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.text.primary }}>Mini-lesson not found</Text>
      </SafeAreaView>
    );
  }

  const currentCard = cards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / cards.length) * 100;

  const handleNext = (answer?: any) => {
    // Save answer
    if (answer !== undefined) {
      setAnswers(prev => ({
        ...prev,
        [currentCard.id]: answer,
      }));
    }

    // Check if last card
    if (currentCardIndex === cards.length - 1) {
      // Calculate stats and navigate to completion
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const correctAnswers = Object.keys(answers).filter(cardId => {
        // In real app, verify if answer was correct
        return true; // For now, assume all correct
      }).length + 1; // +1 for current card

      const accuracy = Math.round((correctAnswers / cards.length) * 100);
      const xpEarned = correctAnswers * 3;

      router.push({
        pathname: '/completion',
        params: {
          miniLessonId: id,
          xp: xpEarned,
          time: timeSpent,
          accuracy: accuracy,
          cardsCompleted: cards.length,
          cardsTotal: cards.length,
        },
      });
    } else {
      // Next card
      setCurrentCardIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
    } else {
      router.back();
    }
  };

  const renderCard = () => {
    switch (currentCard.type) {
      case 'single-vocab':
        return (
          <SingleVocabCard
            {...currentCard.content}
            onNext={handleNext}
          />
        );
      case 'multiple-choice':
        return (
          <MultipleChoiceCard
            {...currentCard.content}
            onNext={handleNext}
          />
        );
      case 'image-quiz':
        return (
          <ImageQuizCard
            {...currentCard.content}
            onNext={handleNext}
          />
        );
      case 'audio':
        return (
          <AudioCard
            {...currentCard.content}
            onNext={handleNext}
          />
        );
      case 'text-input':
        return (
          <TextInputCard
            {...currentCard.content}
            onNext={handleNext}
          />
        );
      case 'speaking':
        return (
          <SpeakingCard
            {...currentCard.content}
            onNext={handleNext}
          />
        );
      default:
        return (
          <View style={{ padding: spacing.xl }}>
            <Text style={{ color: colors.text.primary }}>
              Unknown card type: {currentCard.type}
            </Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary]}
        style={{ flex: 1 }}
      >
        {/* Header with progress */}
        <View
          style={{
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.md,
            paddingBottom: spacing.lg,
          }}
        >
          {/* Top row: Back button and close */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing.md,
            }}
          >
            <TouchableOpacity onPress={handleBack}>
