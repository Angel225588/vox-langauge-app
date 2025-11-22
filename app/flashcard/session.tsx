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
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ fontSize: 18, color: '#6B7280', marginTop: 16 }}>Loading session...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 24 }}>
        <Text style={{ fontSize: 32, marginBottom: 16 }}>😕</Text>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 8 }}>Oops!</Text>
        <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 24 }}>{error}</Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#2196F3',
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12
          }}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // No active session or no current card
  if (!isSessionActive || !currentCard) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 24 }}>
        <Text style={{ fontSize: 32, marginBottom: 16 }}>🎉</Text>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 8 }}>
          No Cards to Review
        </Text>
        <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 24 }}>
          Great job! You've reviewed all your flashcards for today.
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#2196F3',
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12
          }}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Done</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { flashcard, cardType } = currentCard;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Header with progress */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={{
          backgroundColor: '#FFFFFF',
          paddingHorizontal: 24,
          paddingVertical: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        {/* Progress Bar */}
        <View style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 14, color: '#6B7280' }}>
              Card {currentCardNumber} of {totalCards}
            </Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#2196F3' }}>
              {pointsEarned} pts
            </Text>
          </View>
          <View style={{ width: '100%', height: 8, backgroundColor: '#E5E7EB', borderRadius: 9999, overflow: 'hidden' }}>
            <View
              style={{
                height: '100%',
                backgroundColor: '#2196F3',
                borderRadius: 9999,
                width: `${progressPercentage}%`
              }}
            />
          </View>
        </View>

        {/* Card Type Indicator */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 9999,
              backgroundColor:
                cardType === 'learning' ? '#DBEAFE' :
                cardType === 'listening' ? '#D1FAE5' :
                '#E9D5FF'
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color:
                  cardType === 'learning' ? '#1D4ED8' :
                  cardType === 'listening' ? '#047857' :
                  '#7C3AED'
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
      <View style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 32 }}>
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
          backgroundColor: '#FFFFFF',
          paddingHorizontal: 24,
          paddingVertical: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <Text style={{ textAlign: 'center', fontSize: 14, color: '#6B7280', marginBottom: 16 }}>
          How well did you know this?
        </Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
          {/* Forgot */}
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: '#EF4444',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
            }}
            activeOpacity={0.8}
            onPress={() => handleQualityRating('forgot')}
            disabled={isLoading}
          >
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>😕</Text>
            <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 14, marginTop: 4 }}>
              Forgot
            </Text>
          </TouchableOpacity>

          {/* Remembered */}
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: '#F59E0B',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
            }}
            activeOpacity={0.8}
            onPress={() => handleQualityRating('remembered')}
            disabled={isLoading}
          >
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>🤔</Text>
            <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 14, marginTop: 4 }}>
              Remembered
            </Text>
          </TouchableOpacity>

          {/* Easy */}
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: '#10B981',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
            }}
            activeOpacity={0.8}
            onPress={() => handleQualityRating('easy')}
            disabled={isLoading}
          >
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>😄</Text>
            <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 14, marginTop: 4 }}>
              Easy
            </Text>
          </TouchableOpacity>
        </View>

        {/* Skip Button */}
        <TouchableOpacity
          style={{ marginTop: 16, paddingVertical: 12, alignItems: 'center' }}
          onPress={handleSkip}
          disabled={isLoading}
          activeOpacity={0.6}
        >
          <Text style={{ color: '#6B7280', fontWeight: '500' }}>Skip →</Text>
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
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      )}
      </View>
    </GestureHandlerRootView>
  );
}
