/**
 * Lesson Screen for Staircase Steps
 *
 * Integrates the card components (SingleVocabCard, ImageMultipleChoiceCard, etc.)
 * with the staircase system. Displays vocabulary for a specific stair step
 * and tracks progress.
 */

import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeOut, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/constants/designSystem';
import { updateStepProgress, completeStep } from '@/lib/api/staircases';

// Import card components from index
import {
  SingleVocabCard,
  MultipleChoiceCard,
  ImageQuizCard,
  TextInputCard,
  SpeakingCard,
  AudioCard,
} from '@/components/cards';

interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  phonetic?: string;
  image_url?: string;
  audio_url?: string;
  example_sentence?: string;
}

type CardType = 'vocab' | 'image-choice' | 'text-input' | 'speaking' | 'comparison' | 'audio-to-image';

interface LessonCard {
  id: string;
  type: CardType;
  vocabulary: VocabularyItem;
  // For multiple choice cards
  options?: string[];
  correctAnswer?: string;
}

export default function LessonScreen() {
  const router = useRouter();
  const { stepId } = useLocalSearchParams<{ stepId: string }>();
  const { user } = useAuth();

  const [lessonCards, setLessonCards] = useState<LessonCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [cardsReviewed, setCardsReviewed] = useState(0);
  const [vocabularyLearned, setVocabularyLearned] = useState(0);
  const [practiceMinutes, setPracticeMinutes] = useState(0);
  const [startTime] = useState(Date.now());

  // Load lesson vocabulary
  useEffect(() => {
    loadLessonData();
  }, [stepId]);

  // Track practice time
  useEffect(() => {
    const interval = setInterval(() => {
      const minutes = Math.floor((Date.now() - startTime) / 60000);
      setPracticeMinutes(minutes);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [startTime]);

  const loadLessonData = async () => {
    try {
      setIsLoading(true);

      // TODO: Fetch vocabulary for this step from database
      // For now, using mock data
      const mockVocabulary: VocabularyItem[] = [
        {
          id: '1',
          word: 'Professional',
          translation: 'Profesional',
          phonetic: '/prəˈfeʃ.ən.əl/',
          image_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
          audio_url: 'https://ssl.gstatic.com/dictionary/static/sounds/20220808/professional--_us_1.mp3',
          example_sentence: 'She is very professional in her work.',
        },
        {
          id: '2',
          word: 'Interview',
          translation: 'Entrevista',
          phonetic: '/ˈɪn.tɚ.vjuː/',
          image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
          audio_url: 'https://ssl.gstatic.com/dictionary/static/sounds/20220808/interview--_us_1.mp3',
          example_sentence: 'I have a job interview tomorrow.',
        },
        {
          id: '3',
          word: 'Confident',
          translation: 'Seguro/a de sí mismo/a',
          phonetic: '/ˈkɑːn.fə.dənt/',
          image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
          audio_url: 'https://ssl.gstatic.com/dictionary/static/sounds/20220808/confident--_us_1.mp3',
          example_sentence: 'Be confident during the interview.',
        },
      ];

      // Generate lesson cards with variety
      const cards: LessonCard[] = [];

      mockVocabulary.forEach((vocab, index) => {
        // Card 1: Vocabulary introduction
        cards.push({
          id: `${vocab.id}-vocab`,
          type: 'vocab',
          vocabulary: vocab,
        });

        // Card 2: Image multiple choice
        if (vocab.image_url) {
          cards.push({
            id: `${vocab.id}-choice`,
            type: 'image-choice',
            vocabulary: vocab,
            options: [
              vocab.word,
              index === 0 ? 'Manager' : index === 1 ? 'Meeting' : 'Happy',
              index === 0 ? 'Employee' : index === 1 ? 'Application' : 'Nervous',
              index === 0 ? 'Business' : index === 1 ? 'Resume' : 'Excited',
            ].sort(() => Math.random() - 0.5),
            correctAnswer: vocab.word,
          });
        }

        // Card 3: Speaking practice
        if (vocab.audio_url) {
          cards.push({
            id: `${vocab.id}-speaking`,
            type: 'speaking',
            vocabulary: vocab,
          });
        }
      });

      setLessonCards(cards);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading lesson:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to load lesson. Please try again.');
    }
  };

  const handleCardComplete = async (wasCorrect: boolean = true) => {
    await Haptics.notificationAsync(
      wasCorrect
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning
    );

    const newCardsReviewed = cardsReviewed + 1;
    setCardsReviewed(newCardsReviewed);

    // Track vocabulary learned (unique words)
    const currentCard = lessonCards[currentCardIndex];
    const uniqueVocabIds = new Set<string>();
    lessonCards.slice(0, currentCardIndex + 1).forEach(card => {
      uniqueVocabIds.add(card.vocabulary.id);
    });
    const newVocabLearned = uniqueVocabIds.size;
    setVocabularyLearned(newVocabLearned);

    // Update progress in database
    if (user?.id && stepId) {
      await updateStepProgress(user.id, stepId, {
        vocabulary_learned: newVocabLearned,
        cards_reviewed: newCardsReviewed,
        practice_minutes: practiceMinutes,
      });
    }

    // Move to next card or complete lesson
    if (currentCardIndex < lessonCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      handleLessonComplete();
    }
  };

  const handleLessonComplete = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Complete the step
    if (user?.id && stepId) {
      const result = await completeStep(user.id, stepId);

      if (result.success) {
        Alert.alert(
          'Lesson Complete! 🎉',
          `You learned ${vocabularyLearned} new words and reviewed ${cardsReviewed} cards!\n\n${
            result.nextStepUnlocked
              ? '🔓 Next step unlocked!'
              : result.staircaseCompleted
              ? '🏆 Staircase completed! Amazing job!'
              : ''
          }`,
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/(tabs)/staircase'),
            },
          ]
        );
      }
    } else {
      router.replace('/(tabs)/staircase');
    }
  };

  if (isLoading) {
    return (
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary, '#1A1F3A']}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        <ActivityIndicator size="large" color={colors.accent.primary} />
        <Text style={{ fontSize: 18, color: colors.text.secondary, marginTop: 16 }}>
          Loading lesson...
        </Text>
      </LinearGradient>
    );
  }

  if (lessonCards.length === 0) {
    return (
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary, '#1A1F3A']}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}
      >
        <Text style={{ fontSize: 32, marginBottom: 16 }}>📚</Text>
        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: colors.text.primary,
          marginBottom: 8
        }}>
          No Content Available
        </Text>
        <Text style={{
          fontSize: 16,
          color: colors.text.secondary,
          textAlign: 'center',
          marginBottom: 24
        }}>
          This lesson doesn't have any cards yet.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: colors.text.primary, fontWeight: 'bold' }}>
              Go Back
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const currentCard = lessonCards[currentCardIndex];
  const progressPercentage = ((currentCardIndex + 1) / lessonCards.length) * 100;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary, '#1A1F3A']}
        style={{ flex: 1 }}
      >
        {/* Header with Progress */}
        <Animated.View
          entering={FadeIn.duration(300)}
          style={{
            paddingHorizontal: 24,
            paddingTop: 60,
            paddingBottom: 16,
          }}
        >
          {/* Progress Bar */}
          <View style={{ marginBottom: 16 }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8
            }}>
              <Text style={{ fontSize: 14, color: colors.text.secondary }}>
                Card {currentCardIndex + 1} of {lessonCards.length}
              </Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.accent.secondary }}>
                  📝 {vocabularyLearned}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.accent.primary }}>
                  ⏱️ {practiceMinutes}m
                </Text>
              </View>
            </View>
            <View style={{
              width: '100%',
              height: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 9999,
              overflow: 'hidden'
            }}>
              <LinearGradient
                colors={colors.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  height: '100%',
                  borderRadius: 9999,
                  width: `${progressPercentage}%`,
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
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                borderWidth: 1,
                borderColor: colors.accent.primary,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.accent.primary }}>
                {currentCard.type === 'vocab' && '📖 Learn'}
                {currentCard.type === 'image-choice' && '🎯 Practice'}
                {currentCard.type === 'speaking' && '🎤 Speak'}
                {currentCard.type === 'text-input' && '✍️ Write'}
                {currentCard.type === 'comparison' && '⚖️ Compare'}
                {currentCard.type === 'audio-to-image' && '🎧 Listen'}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Card Content */}
        <View style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 32 }}>
          {currentCard.type === 'vocab' && (
            <Animated.View
              key={`vocab-${currentCard.id}`}
              entering={FadeIn.duration(400)}
              exiting={FadeOut.duration(200)}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <SingleVocabCard
                word={currentCard.vocabulary.word}
                phonetic={currentCard.vocabulary.phonetic}
                translation={currentCard.vocabulary.translation}
                imageUrl={currentCard.vocabulary.image_url}
                variant="primary"
                showTranslation={true}
              />
            </Animated.View>
          )}

          {currentCard.type === 'image-choice' && (
            <Animated.View
              key={`choice-${currentCard.id}`}
              entering={FadeIn.duration(400)}
              exiting={FadeOut.duration(200)}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <ImageMultipleChoiceCard
                question="What is this?"
                imageUrl={currentCard.vocabulary.image_url!}
                options={currentCard.options!}
                correctAnswer={currentCard.correctAnswer!}
                onAnswer={(isCorrect) => {
                  setTimeout(() => handleCardComplete(isCorrect), 1500);
                }}
              />
            </Animated.View>
          )}

          {currentCard.type === 'speaking' && (
            <Animated.View
              key={`speaking-${currentCard.id}`}
              entering={FadeIn.duration(400)}
              exiting={FadeOut.duration(200)}
              style={{ flex: 1 }}
            >
              <SpeakingCard
                word={currentCard.vocabulary.word}
                phonetic={currentCard.vocabulary.phonetic}
                translation={currentCard.vocabulary.translation}
                exampleAudioUrl={currentCard.vocabulary.audio_url}
                onComplete={() => handleCardComplete(true)}
              />
            </Animated.View>
          )}
        </View>

        {/* Continue Button (for vocab cards) */}
        {currentCard.type === 'vocab' && (
          <Animated.View
            entering={FadeInDown.duration(400).delay(200)}
            style={{
              paddingHorizontal: 24,
              paddingBottom: 40,
            }}
          >
            <TouchableOpacity
              onPress={() => handleCardComplete(true)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={colors.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  shadowColor: colors.glow.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Text style={{
                  color: colors.text.primary,
                  fontWeight: 'bold',
                  fontSize: 16
                }}>
                  Continue →
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}
      </LinearGradient>
    </GestureHandlerRootView>
  );
}
