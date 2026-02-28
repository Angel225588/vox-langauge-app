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
  QuizCard,
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
        // TODO: Implement with new card system
        return (
          <View style={{
            backgroundColor: 'rgba(0, 54, 255, 0.1)',
            padding: spacing.xl,
            borderRadius: borderRadius.lg,
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: 48, marginBottom: spacing.md, color: colors.text.primary }}>
              {currentCard.content.word}
            </Text>
            <Text style={{ fontSize: 18, color: colors.text.secondary, marginBottom: spacing.sm }}>
              {currentCard.content.phonetic}
            </Text>
            <Text style={{ fontSize: 24, color: colors.accent.primary }}>
              {currentCard.content.translation}
            </Text>
            <TouchableOpacity
              onPress={() => handleNext()}
              style={{ marginTop: spacing.xl, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, backgroundColor: colors.accent.primary, borderRadius: borderRadius.md }}
            >
              <Text style={{ color: colors.text.primary, fontWeight: 'bold' }}>Continue</Text>
            </TouchableOpacity>
          </View>
        );
      case 'multiple-choice':
        return (
          <QuizCard
            word={currentCard.content.word || ''}
            translation={currentCard.content.translation}
            image_url={currentCard.content.image_url}
            options={currentCard.content.options || []}
            correct_answer={typeof currentCard.content.correct_answer === 'number'
              ? currentCard.content.correct_answer
              : currentCard.content.options?.indexOf(currentCard.content.correct_answer || '') || 0}
            mode="translation"
            onComplete={(correct) => handleNext(correct)}
          />
        );
      case 'image-quiz':
        return (
          <QuizCard
            word={currentCard.content.word || ''}
            translation={currentCard.content.translation}
            image_url={currentCard.content.image_url}
            options={currentCard.content.options || []}
            correct_answer={typeof currentCard.content.correct_answer === 'number'
              ? currentCard.content.correct_answer
              : currentCard.content.options?.indexOf(currentCard.content.correct_answer || '') || 0}
            mode="image"
            onComplete={(correct) => handleNext(correct)}
          />
        );
      case 'audio':
        return (
          <AudioCard
            word={currentCard.content.word}
            translation={currentCard.content.translation}
            audio_url={currentCard.content.audio_url}
            options={currentCard.content.options}
            correct_answer={typeof currentCard.content.correct_answer === 'number'
              ? currentCard.content.correct_answer
              : currentCard.content.options?.indexOf(currentCard.content.correct_answer || '') || 0}
            explanation={(currentCard.content as any).explanation}
            onNext={handleNext}
          />
        );
      case 'text-input':
        return (
          <TextInputCard
            {...currentCard.content}
            correct_answer={String(currentCard.content.correct_answer ?? '')}
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
              <Text style={{ fontSize: 24, color: colors.text.primary }}>{'<'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ fontSize: 24, color: colors.text.secondary }}>{'×'}</Text>
            </TouchableOpacity>
          </View>

          {/* Progress bar */}
          <View
            style={{
              width: '100%',
              height: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: borderRadius.full,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: colors.success.DEFAULT,
              }}
            />
          </View>

          {/* Card counter */}
          <Text
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.secondary,
              marginTop: spacing.sm,
              textAlign: 'center',
            }}
          >
            {currentCardIndex + 1} / {cards.length}
          </Text>
        </View>

        {/* Card Content */}
        <View style={{ flex: 1, paddingHorizontal: spacing.xl }}>
          {renderCard()}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
