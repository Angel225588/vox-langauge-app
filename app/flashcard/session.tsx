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

  // Navigate to summary when session ends
  useEffect(() => {
    if (sessionSummary) {
      // TODO: Navigate to summary screen
      console.log('Session ended, showing summary:', sessionSummary);
      Alert.alert(
        'Session Complete! 🎉',
        `You reviewed ${sessionSummary.flashcards_reviewed} flashcards and earned ${sessionSummary.points_earned} points!\n\nAccuracy: ${sessionSummary.accuracy}%`,
        [
          {
            text: 'Done',
            onPress: () => router.back(),
          },
        ]
      );
    }
  }, [sessionSummary, router]);

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
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2196F3" />
        <Text className="text-lg text-gray-600 mt-4">Loading session...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-2xl mb-4">😕</Text>
        <Text className="text-xl font-bold text-gray-900 mb-2">Oops!</Text>
        <Text className="text-base text-gray-600 text-center mb-6">{error}</Text>
        <TouchableOpacity
          className="bg-primary px-6 py-3 rounded-xl"
          onPress={() => router.back()}
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // No active session or no current card
  if (!isSessionActive || !currentCard) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-2xl mb-4">🎉</Text>
        <Text className="text-xl font-bold text-gray-900 mb-2">
          No Cards to Review
        </Text>
        <Text className="text-base text-gray-600 text-center mb-6">
          Great job! You've reviewed all your flashcards for today.
        </Text>
        <TouchableOpacity
          className="bg-primary px-6 py-3 rounded-xl"
          onPress={() => router.back()}
        >
          <Text className="text-white font-bold">Done</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { flashcard, cardType } = currentCard;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 bg-gray-50">
      {/* Header with progress */}
      <Animated.View
        entering={FadeIn.duration(300)}
        className="bg-white px-6 py-4 shadow-sm"
      >
        {/* Progress Bar */}
        <View className="mb-3">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm text-gray-600">
              Card {currentCardNumber} of {totalCards}
            </Text>
            <Text className="text-sm font-bold text-primary">
              {pointsEarned} pts
            </Text>
          </View>
          <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <View
              className="h-full bg-primary rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </View>
        </View>

        {/* Card Type Indicator */}
        <View className="flex-row items-center justify-center">
          <View
            className={`px-4 py-2 rounded-full ${
              cardType === 'learning'
                ? 'bg-blue-100'
                : cardType === 'listening'
                ? 'bg-green-100'
                : 'bg-purple-100'
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                cardType === 'learning'
                  ? 'text-blue-700'
                  : cardType === 'listening'
                  ? 'text-green-700'
                  : 'text-purple-700'
              }`}
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
      <View className="flex-1 px-6 py-8">
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
        className="bg-white px-6 py-6 shadow-lg"
      >
        <Text className="text-center text-sm text-gray-600 mb-4">
          How well did you know this?
        </Text>

        <View className="flex-row justify-between gap-3">
          {/* Forgot */}
          <TouchableOpacity
            className="flex-1 bg-red-500 py-4 rounded-xl items-center active:bg-red-600"
            onPress={() => handleQualityRating('forgot')}
            disabled={isLoading}
          >
            <Text className="text-white font-bold text-base">😕</Text>
            <Text className="text-white font-semibold text-sm mt-1">Forgot</Text>
          </TouchableOpacity>

          {/* Remembered */}
          <TouchableOpacity
            className="flex-1 bg-yellow-500 py-4 rounded-xl items-center active:bg-yellow-600"
            onPress={() => handleQualityRating('remembered')}
            disabled={isLoading}
          >
            <Text className="text-white font-bold text-base">🤔</Text>
            <Text className="text-white font-semibold text-sm mt-1">
              Remembered
            </Text>
          </TouchableOpacity>

          {/* Easy */}
          <TouchableOpacity
            className="flex-1 bg-green-500 py-4 rounded-xl items-center active:bg-green-600"
            onPress={() => handleQualityRating('easy')}
            disabled={isLoading}
          >
            <Text className="text-white font-bold text-base">😄</Text>
            <Text className="text-white font-semibold text-sm mt-1">Easy</Text>
          </TouchableOpacity>
        </View>

        {/* Skip Button */}
        <TouchableOpacity
          className="mt-4 py-3 items-center"
          onPress={handleSkip}
          disabled={isLoading}
        >
          <Text className="text-gray-500 font-medium">Skip →</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Loading Overlay */}
      {isLoading && (
        <View className="absolute inset-0 bg-black/20 items-center justify-center">
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      )}
      </View>
    </GestureHandlerRootView>
  );
}
