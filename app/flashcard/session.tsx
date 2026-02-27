/**
 * Flashcard Session Screen
 *
 * Main screen for reviewing flashcards with the 3-card cycle.
 * Displays Learning → Listening → Speaking cards sequentially.
 */

import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useFlashcardSession } from '@/hooks/useFlashcard';
import { useAuth } from '@/hooks/useAuth';
import { SimpleQuality } from '@/types/flashcard';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';
import { updateStreakData } from '@/lib/db/sqlite';

// Import card components
import LearningCard from '@/components/flashcards/LearningCard';
import ListeningCard from '@/components/flashcards/ListeningCard';
import SpeakingCard from '@/components/flashcards/SpeakingCard';

export default function FlashcardSessionScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const {
    currentCard,
    isSessionActive,
    isLoading,
    error,
    currentCardNumber,
    totalCards,
    progressPercentage,
    pointsEarned,
    startSession,
    submitReview,
    skipCard,
    sessionSummary,
  } = useFlashcardSession({
    userId: user?.id || '',
    limit: 5, // Start with 5 flashcards for testing
  });

  // Start session on mount
  useEffect(() => {
    if (user?.id) {
      startSession();
    }
  }, [user?.id, startSession]);

  // Persist points + show summary when session ends
  useEffect(() => {
    if (sessionSummary) {
      console.log('Session ended, showing summary:', sessionSummary);

      // Persist points to SQLite (single source of truth)
      if (user?.id && sessionSummary.points_earned > 0) {
        updateStreakData(user.id, sessionSummary.points_earned).catch(() => {});
      }

      Alert.alert(
        'Session Complete!',
        `You reviewed ${sessionSummary.flashcards_reviewed} flashcards and earned ${sessionSummary.points_earned} points!\n\nAccuracy: ${sessionSummary.accuracy}%`,
        [
          {
            text: 'Done',
            onPress: () => router.back(),
          },
        ]
      );
    }
  }, [sessionSummary, router, user?.id]);

  /**
   * Handle quality rating
   */
  const handleQualityRating = async (quality: SimpleQuality) => {
    await submitReview(quality);
  };

  /**
   * Handle skip
   */
  const handleSkip = () => {
    Alert.alert('Skip Card?', 'Are you sure you want to skip this card?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Skip', style: 'destructive', onPress: skipCard },
    ]);
  };

  // Loading state
  if (isLoading && !currentCard) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background.primary }}>
        <ActivityIndicator size="large" color={colors.accent.blue} />
        <Text style={{ fontSize: typography.fontSize.lg, color: colors.text.disabled, marginTop: spacing.md }}>Loading session...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background.primary, paddingHorizontal: spacing.lg }}>
        <Text style={{ fontSize: typography.fontSize['2xl'], marginBottom: spacing.md }}>😕</Text>
        <Text style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.text.primary, marginBottom: spacing.sm }}>Oops!</Text>
        <Text style={{ fontSize: typography.fontSize.base, color: colors.text.disabled, textAlign: 'center', marginBottom: spacing.lg }}>{error}</Text>
        <TouchableOpacity
          style={{
            backgroundColor: colors.accent.blue,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            borderRadius: borderRadius.md
          }}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: typography.fontWeight.bold }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // No active session or no current card
  if (!isSessionActive || !currentCard) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background.primary, paddingHorizontal: spacing.lg }}>
        <Text style={{ fontSize: typography.fontSize['2xl'], marginBottom: spacing.md }}>🎉</Text>
        <Text style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.text.primary, marginBottom: spacing.sm }}>
          No Cards to Review
        </Text>
        <Text style={{ fontSize: typography.fontSize.base, color: colors.text.disabled, textAlign: 'center', marginBottom: spacing.lg }}>
          Great job! You've reviewed all your flashcards for today.
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: colors.accent.blue,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            borderRadius: borderRadius.md
          }}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: typography.fontWeight.bold }}>Done</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { flashcard, cardType } = currentCard;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      {/* Header with progress */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={{
          backgroundColor: colors.background.card,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        {/* Progress Bar */}
        <View style={{ marginBottom: spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
            <Text style={{ fontSize: typography.fontSize.sm, color: colors.text.disabled }}>
              Card {currentCardNumber} of {totalCards}
            </Text>
            <Text style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold, color: colors.accent.blue }}>
              {pointsEarned} pts
            </Text>
          </View>
          <View style={{ width: '100%', height: spacing.sm, backgroundColor: colors.border.light, borderRadius: borderRadius.full, overflow: 'hidden' }}>
            <View
              style={{
                height: '100%',
                backgroundColor: colors.accent.blue,
                borderRadius: borderRadius.full,
                width: `${progressPercentage}%`
              }}
            />
          </View>
        </View>

        {/* Card Type Indicator */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              borderRadius: borderRadius.full,
              backgroundColor:
                cardType === 'learning' ? `${colors.accent.blue}20` :
                cardType === 'listening' ? `${colors.success.DEFAULT}20` :
                `${colors.accent.purple}20`
            }}
          >
            <Text
              style={{
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.semibold,
                color:
                  cardType === 'learning' ? colors.accent.blue :
                  cardType === 'listening' ? colors.success.DEFAULT :
                  colors.accent.purple
              }}
            >
              {cardType === 'learning'
                ? '📖 Learning'
                : cardType === 'listening'
                ? '🎧 Listening'
                : '🎤 Speaking'}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Card Content */}
      <View style={{ flex: 1, paddingHorizontal: spacing.lg, paddingVertical: spacing.xl }}>
        {cardType === 'learning' && (
          <Animated.View
            key={`learning-${flashcard.id}`}
            entering={FadeIn.duration(400)}
            exiting={FadeOut.duration(200)}
            className="flex-1"
          >
            <LearningCard
              word={flashcard.word}
              translation={flashcard.translation}
              phonetic={flashcard.phonetic}
              imageUrl={flashcard.image_url}
              audioUrl={flashcard.audio_url}
              exampleSentence={flashcard.example_sentence}
            />
          </Animated.View>
        )}

        {cardType === 'listening' && (
          <Animated.View
            key={`listening-${flashcard.id}`}
            entering={FadeIn.duration(400)}
            exiting={FadeOut.duration(200)}
            className="flex-1"
          >
            <ListeningCard
              word={flashcard.word}
              audioUrl={flashcard.audio_url || ''}
              onCorrect={() => handleQualityRating('easy')}
              onIncorrect={() => handleQualityRating('forgot')}
              onSkip={handleSkip}
            />
          </Animated.View>
        )}

        {cardType === 'speaking' && (
          <Animated.View
            key={`speaking-${flashcard.id}`}
            entering={FadeIn.duration(400)}
            exiting={FadeOut.duration(200)}
            className="flex-1"
          >
            <SpeakingCard
              word={flashcard.word}
              phonetic={flashcard.phonetic}
              exampleAudioUrl={flashcard.audio_url}
              onComplete={(audioUri) => {
                console.log('Recording completed:', audioUri);
                handleQualityRating('easy'); // Auto-rate as easy after recording
              }}
              onSkip={handleSkip}
            />
          </Animated.View>
        )}
      </View>

      {/* Quality Rating Buttons */}
      <Animated.View
        entering={FadeIn.duration(400).delay(200)}
        style={{
          backgroundColor: colors.background.card,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.lg,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: spacing.sm,
          elevation: 5,
        }}
      >
        <Text style={{ textAlign: 'center', fontSize: typography.fontSize.sm, color: colors.text.disabled, marginBottom: spacing.md }}>
          How well did you know this?
        </Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
          {/* Forgot */}
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: colors.error.DEFAULT,
              paddingVertical: spacing.md,
              borderRadius: borderRadius.md,
              alignItems: 'center',
            }}
            activeOpacity={0.8}
            onPress={() => handleQualityRating('forgot')}
            disabled={isLoading}
          >
            <Text style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold }}>😕</Text>
            <Text style={{ color: '#FFFFFF', fontWeight: typography.fontWeight.semibold, fontSize: typography.fontSize.sm, marginTop: spacing.xs }}>
              Forgot
            </Text>
          </TouchableOpacity>

          {/* Remembered */}
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: colors.warning.DEFAULT,
              paddingVertical: spacing.md,
              borderRadius: borderRadius.md,
              alignItems: 'center',
            }}
            activeOpacity={0.8}
            onPress={() => handleQualityRating('remembered')}
            disabled={isLoading}
          >
            <Text style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold }}>🤔</Text>
            <Text style={{ color: '#FFFFFF', fontWeight: typography.fontWeight.semibold, fontSize: typography.fontSize.sm, marginTop: spacing.xs }}>
              Remembered
            </Text>
          </TouchableOpacity>

          {/* Easy */}
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: colors.success.DEFAULT,
              paddingVertical: spacing.md,
              borderRadius: borderRadius.md,
              alignItems: 'center',
            }}
            activeOpacity={0.8}
            onPress={() => handleQualityRating('easy')}
            disabled={isLoading}
          >
            <Text style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold }}>😄</Text>
            <Text style={{ color: '#FFFFFF', fontWeight: typography.fontWeight.semibold, fontSize: typography.fontSize.sm, marginTop: spacing.xs }}>
              Easy
            </Text>
          </TouchableOpacity>
        </View>

        {/* Skip Button */}
        <TouchableOpacity
          style={{ marginTop: spacing.md, paddingVertical: spacing.md, alignItems: 'center' }}
          onPress={handleSkip}
          disabled={isLoading}
          activeOpacity={0.6}
        >
          <Text style={{ color: colors.text.disabled, fontWeight: typography.fontWeight.medium }}>Skip →</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ActivityIndicator size="large" color={colors.accent.blue} />
        </View>
      )}
      </View>
    </GestureHandlerRootView>
  );
}
