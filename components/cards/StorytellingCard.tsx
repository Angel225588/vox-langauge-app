import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { BaseCard } from './BaseCard';
import { colors, borderRadius, spacing, shadows, typography } from '@/constants/designSystem';
import LottieSuccess from '../animations/LottieSuccess';
import LottieError from '../animations/LottieError';

interface StoryImage {
  id: string;
  url: string;
  label: string;
}

interface StorytellingCardProps {
  images: StoryImage[];          // Array of 3-5 image objects with labels
  storyPrompt?: string;      // Optional starting prompt
  minWords?: number;         // Minimum words required (default 50)
  timeLimit?: number;        // Optional: 5 minutes (not implemented in MVP)
  difficulty: 'easy' | 'medium' | 'hard';
  onComplete: (story: string, score: number) => void;
  // Inherited from BaseCardProps
  [key: string]: any;
}

export const StorytellingCard: React.FC<StorytellingCardProps> = ({
  images,
  storyPrompt,
  minWords = 50,
  difficulty,
  onComplete,
  ...baseCardProps
}) => {
  const [story, setStory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [showResultAnimation, setShowResultAnimation] = useState<'success' | 'error' | null>(null);
  const [evaluationFeedback, setEvaluationFeedback] = useState<string[]>([]);

  useEffect(() => {
    const words = story.split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [story]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    let currentScore = 0;
    const feedback: string[] = [];

    // 1. Word Count Check
    if (wordCount >= minWords) {
      currentScore += 30; // Base points for meeting word count
      feedback.push('Good word count!');
    } else {
      feedback.push(`Needs more words (min ${minWords}, current ${wordCount}).`);
    }

    // 2. Image Keyword Relevance
    const storyLower = story.toLowerCase();
    let keywordsFound = 0;
    images.forEach(image => {
      if (storyLower.includes(image.label.toLowerCase())) {
        keywordsFound++;
        currentScore += 15; // Bonus for each relevant keyword
      }
    });
    if (keywordsFound > 0) {
      feedback.push(`Used ${keywordsFound} image keywords.`);
    } else {
      feedback.push('Try to include words related to the images.');
    }

    // 3. Simplified Sentence Structure (e.g., more than one sentence)
    const sentences = story.split(/[.!?\n]\s*/).filter(s => s.trim().length > 0);
    if (sentences.length >= 3) {
      currentScore += 20; // Bonus for good structure
      feedback.push('Well-structured with multiple sentences.');
    } else if (sentences.length >= 1) {
      currentScore += 10;
      feedback.push('Consider adding more sentences for a richer story.');
    } else {
      feedback.push('Needs at least one complete sentence.');
    }

    setEvaluationFeedback(feedback);

    const isSuccess = currentScore > 50; // Simple success threshold for MVP
    onComplete(story, currentScore);

    if (isSuccess) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackStyle.Success);
      setShowResultAnimation('success');
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackStyle.Error);
      setShowResultAnimation('error');
    }

    setIsSubmitting(false);
    setTimeout(() => {
      setShowResultAnimation(null);
    }, 2000);
  };

  return (
    <BaseCard {...baseCardProps} style={styles.cardContainer}>
      {showResultAnimation && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.lottieOverlay}>
          {showResultAnimation === 'success' ? <LottieSuccess /> : <LottieError />}
        </Animated.View>
      )}

      <View style={styles.header}>
        <Text style={styles.difficultyText}>Difficulty: {difficulty}</Text>
        {storyPrompt && <Text style={styles.promptText}>{storyPrompt}</Text>}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageCarousel}>
        {images.map((img, index) => (
          <View key={img.id} style={styles.imageWrapper}>
            <Image source={{ uri: img.url }} style={styles.carouselImage} />
            <Text style={styles.imageLabel}>{img.label}</Text>
          </View>
        ))}
      </ScrollView>

      <TextInput
        style={styles.textInput}
        placeholder={`Write your story (min ${minWords} words)...`}
        placeholderTextColor={colors.text.tertiary}
        multiline
        value={story}
        onChangeText={setStory}
        editable={!isSubmitting}
      />

      <View style={styles.feedbackContainer}>
        <Text style={styles.countText}>Words: {wordCount}/{minWords}</Text>
        <Text style={styles.countText}>Sentences: {story.split(/[.!?\n]\s*/).filter(s => s.trim().length > 0).length}</Text>
      </View>

      {evaluationFeedback.length > 0 && showResultAnimation && (
        <View style={styles.evaluationBox}>
          {evaluationFeedback.map((line, index) => (
            <Text key={index} style={styles.evaluationText}>- {line}</Text>
          ))}
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isSubmitting || wordCount < minWords}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.text.primary} />
          ) : (
            <Text style={styles.submitButtonText}>Submit Story</Text>
          )}
        </TouchableOpacity>
      </View>
    </BaseCard>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    padding: spacing.lg,
    minHeight: 450,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: spacing.md,
  },
  difficultyText: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  promptText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  imageCarousel: {
    maxHeight: 180,
    marginBottom: spacing.md,
  },
  imageWrapper: {
    alignItems: 'center',
    marginRight: spacing.sm,
    width: 140, // Increased width for better display of image and label
  },
  carouselImage: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
  },
  imageLabel: {
    marginTop: spacing.xs,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  feedbackContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  countText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
  },
  evaluationBox: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.DEFAULT,
  },
  evaluationText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs / 2,
  },
  controls: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  submitButton: {
    flex: 1,
    backgroundColor: colors.secondary.DEFAULT,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  submitButtonText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  lottieOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    borderRadius: borderRadius.xl,
  },
});
