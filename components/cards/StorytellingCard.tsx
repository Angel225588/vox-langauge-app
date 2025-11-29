import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, shadows, typography } from '@/constants/designSystem';
import { LottieSuccess } from '../animations/LottieSuccess';
import { LottieError } from '../animations/LottieError';

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
  const [finalScore, setFinalScore] = useState(0);

  // Voice recording states
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const words = story.split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [story]);

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'This feature requires microphone access.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      recordingInterval.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Could not start recording.');
    }
  };

  const stopRecording = async () => {
    if (recordingInterval.current) clearInterval(recordingInterval.current);
    if (!recording) return;

    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setRecording(null);

    // Show options for the recorded audio
    Alert.alert(
      '🎙️ Recording Complete',
      `Duration: ${recordingDuration}s\n\nWhat would you like to do?`,
      [
        {
          text: '📝 Add Sample Story',
          onPress: () => {
            // Generate contextual sample based on images
            const imageLabels = images.map(img => img.label).join(', ');
            const sampleText = `Once upon a time, I saw a ${images[0]?.label || 'beautiful scene'}. The adventure continued when I discovered a ${images[1]?.label || 'amazing place'}${images.length > 2 ? `, and finally reached a ${images[2]?.label || 'wonderful destination'}` : ''}. It was an unforgettable experience!`;
            setStory(prev => prev ? `${prev} ${sampleText}` : sampleText);
          }
        },
        {
          text: '✍️ Type Instead',
          style: 'cancel'
        }
      ]
    );

    // TODO: Integrate real speech-to-text
    // Option 1: expo-speech-recognition (recommended for Expo)
    // Option 2: Google Cloud Speech-to-Text API
    // Option 3: OpenAI Whisper API
    // See SPEECH_TO_TEXT_GUIDE.md for implementation details
  };

  const handleRecordToggle = () => {
    isRecording ? stopRecording() : startRecording();
  };

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
    setFinalScore(currentScore);

    const isSuccess = currentScore > 50; // Simple success threshold for MVP

    if (isSuccess) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowResultAnimation('success');
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setShowResultAnimation('error');
    }

    setIsSubmitting(false);

    // Show results for 5 seconds before calling onComplete
    setTimeout(() => {
      setShowResultAnimation(null);
      onComplete(story, currentScore);
    }, 5000);
  };

  return (
    <View style={[styles.cardContainer, baseCardProps.style]}>
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

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder={`Write your story (min ${minWords} words)...`}
          placeholderTextColor={colors.text.tertiary}
          multiline
          value={story}
          onChangeText={setStory}
          editable={!isSubmitting && !isRecording}
        />
        <TouchableOpacity
          style={[styles.micButtonInside, isRecording && styles.micButtonRecording]}
          onPress={handleRecordToggle}
          disabled={isSubmitting}
        >
          {isRecording ? (
            <View style={styles.recordingIndicator}>
              <View style={styles.pulsingDot} />
              <Text style={styles.recordingText}>{recordingDuration}s</Text>
            </View>
          ) : (
            <Ionicons name="mic-outline" size={24} color={colors.text.primary} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.feedbackContainer}>
        <Text style={styles.countText}>Words: {wordCount}/{minWords}</Text>
        <Text style={styles.countText}>Sentences: {story.split(/[.!?\n]\s*/).filter(s => s.trim().length > 0).length}</Text>
      </View>

      {evaluationFeedback.length > 0 && (
        <ScrollView style={styles.evaluationBox}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreTitle}>📊 Story Evaluation</Text>
            <Text style={styles.scoreText}>
              Your Score: {finalScore}/100 {finalScore >= 70 ? '⭐⭐⭐⭐' : finalScore >= 50 ? '⭐⭐⭐' : '⭐⭐'}
            </Text>
          </View>
          {evaluationFeedback.map((line, index) => (
            <Text key={index} style={styles.evaluationText}>
              {line.includes('Good') || line.includes('Used') ? '✅' : '⚠️'} {line}
            </Text>
          ))}
          <Text style={styles.encouragementText}>
            {finalScore >= 70 ? 'Excellent work! Keep writing!' : 'Good effort! Try adding more details next time.'}
          </Text>
        </ScrollView>
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
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    minHeight: 650, // Increased from 450 to 650
    justifyContent: 'flex-start',
    ...shadows.md,
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
  inputContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  textInput: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    paddingRight: 60, // Make room for mic button
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
    minHeight: 120,
    textAlignVertical: 'top',
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  micButtonInside: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  micButtonRecording: {
    backgroundColor: colors.error.DEFAULT,
    ...shadows.glow.error,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text.primary,
  },
  recordingText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
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
    maxHeight: 180,
  },
  scoreHeader: {
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  scoreTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  scoreText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.DEFAULT,
  },
  evaluationText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  encouragementText: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.accent.purple,
    fontStyle: 'italic',
  },
  controls: {
    flexDirection: 'row',
    marginTop: 'auto', // Push to bottom
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  submitButton: {
    flex: 1,
    backgroundColor: colors.secondary.DEFAULT,
    paddingVertical: spacing.lg,
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
