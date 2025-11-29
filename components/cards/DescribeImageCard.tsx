import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Animated, { FadeIn, FadeOut, withTiming, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, shadows, typography } from '@/constants/designSystem';
import { LottieSuccess } from '../animations/LottieSuccess';
import { LottieError } from '../animations/LottieError';

interface DescribeImageCardProps {
  imageUrl: string;
  keywords: string[];
  minWords?: number;
  minLength?: number;
  difficulty: 'easy' | 'medium' | 'hard';
  referenceDescription?: string;
  onComplete: (result: { correct: boolean; audioUri?: string; description?: string; score?: number }) => void;
  [key: string]: any;
}

// A simple list of common English verbs to check for sentence structure.
const COMMON_VERBS = [
  'is', 'are', 'was', 'were', 'has', 'have', 'had', 'does', 'do', 'did',
  'see', 'sees', 'saw', 'go', 'goes', 'went', 'make', 'makes', 'made',
  'run', 'runs', 'ran', 'eat', 'eats', 'ate', 'look', 'looks', 'looked',
  'play', 'plays', 'played', 'show', 'shows', 'showed'
];

export const DescribeImageCard: React.FC<DescribeImageCardProps> = ({
  imageUrl,
  keywords,
  minWords = 10,
  minLength = 20,
  difficulty,
  referenceDescription,
  onComplete,
  ...baseCardProps
}) => {
  const [description, setDescription] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUri, setAudioUri] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResultAnimation, setShowResultAnimation] = useState<'success' | 'error' | null>(null);
  const [finalScore, setFinalScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  // Store reference description at submission time to prevent it from changing when parent updates
  const [submittedReference, setSubmittedReference] = useState<string | undefined>(undefined);

  const [validation, setValidation] = useState({
    hasMinLength: false,
    hasVerb: false,
    detectedKeywords: [] as string[],
  });

  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Real-time validation feedback
    const words = description.toLowerCase().split(/\s+/).filter(Boolean);
    const hasMinLength = description.length >= minLength;
    const hasVerb = words.some(word => COMMON_VERBS.includes(word));
    const detectedKeywords = keywords.filter(kw => words.includes(kw.toLowerCase()));
    
    setValidation({ hasMinLength, hasVerb, detectedKeywords });
  }, [description, minLength, keywords]);

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
    setAudioUri(uri); // Save URI for submission
    setRecording(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // For MVP, we don't transcribe. We submit the audio directly.
    // If there was transcription, it would be: setDescription(transcribedText);
  };

  const handleRecordToggle = () => {
    isRecording ? stopRecording() : startRecording();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Store the reference description at submission time
    setSubmittedReference(referenceDescription);

    // Calculate score (0-100)
    let score = 0;

    if (audioUri) {
      // Audio-based scoring
      score = recordingDuration > 2 ? 70 : 40; // Simple duration check
    } else {
      // Text-based scoring
      // 30% for length
      if (validation.hasMinLength) score += 30;

      // 20% for verb usage
      if (validation.hasVerb) score += 20;

      // 50% for keyword usage (10 points per keyword, max 5 keywords)
      const keywordScore = Math.min(validation.detectedKeywords.length * 10, 50);
      score += keywordScore;
    }

    setFinalScore(score);
    setShowFeedback(true);

    const isCorrect = score >= 70; // 70% threshold for success

    if (isCorrect) {
      setShowResultAnimation('success');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setShowResultAnimation('error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setIsSubmitting(false);

    // Show feedback for 5 seconds before completing
    setTimeout(() => {
      setShowResultAnimation(null);
      onComplete({ correct: isCorrect, audioUri: audioUri ?? undefined, description, score });
    }, 5000);
  };

  const canSubmit = !isSubmitting && (description.length > 0 || audioUri !== null);

  return (
    <View style={[styles.cardContainer, baseCardProps.style]}>
      {showResultAnimation && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.lottieOverlay}>
          {showResultAnimation === 'success' ? <LottieSuccess /> : <LottieError />}
        </Animated.View>
      )}

      <Text style={styles.instructionText}>Describe what you see in the image.</Text>
      <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />

      {/* Text Input with Mic Button Inside */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder={`Type your description (min ${minLength} characters)...`}
          placeholderTextColor={colors.text.tertiary}
          multiline
          value={description}
          onChangeText={setDescription}
          editable={!isRecording && !isSubmitting}
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

      {/* Validation Feedback */}
      <View style={styles.feedbackContainer}>
        <Text style={[styles.feedbackItem, validation.hasMinLength && styles.feedbackItemValid]}>
          {description.length}/{minLength} chars
        </Text>
        <Text style={[styles.feedbackItem, validation.hasVerb && styles.feedbackItemValid]}>
          Verb ✓
        </Text>
        <Text style={[styles.feedbackItem, validation.detectedKeywords.length > 0 && styles.feedbackItemValid]}>
          {validation.detectedKeywords.length}/{keywords.length} keywords
        </Text>
      </View>

      {/* Score Display - Shows after submission */}
      {showFeedback && (
        <Animated.View entering={FadeIn} style={styles.scoreBox}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreTitle}>📊 Your Score</Text>
            <Text style={styles.scoreValue}>
              {finalScore}/100 {finalScore >= 80 ? '⭐⭐⭐⭐⭐' : finalScore >= 70 ? '⭐⭐⭐⭐' : finalScore >= 50 ? '⭐⭐⭐' : '⭐⭐'}
            </Text>
          </View>

          <View style={styles.scoreFeedback}>
            <Text style={styles.feedbackLabel}>Your Description:</Text>
            <Text style={styles.feedbackText}>"{description}"</Text>
          </View>

          {submittedReference && finalScore < 80 && (
            <View style={styles.referenceFeedback}>
              <Text style={styles.referenceLabel}>💡 Reference Description:</Text>
              <Text style={styles.referenceText}>{submittedReference}</Text>
              <Text style={styles.improvementTip}>
                {finalScore < 50
                  ? '⚠️ Try to use more keywords and add more detail.'
                  : '✨ Good effort! Try to match the reference more closely.'}
              </Text>
            </View>
          )}

          {finalScore >= 80 && (
            <Text style={styles.perfectText}>🎉 Excellent description! You captured the image perfectly!</Text>
          )}
        </Animated.View>
      )}

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.text.primary} />
        ) : (
          <Text style={styles.submitButtonText}>Submit Description</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    minHeight: 600,
    justifyContent: 'flex-start',
    ...shadows.md,
  },
  instructionText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
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
    minHeight: 100,
    textAlignVertical: 'top',
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
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  feedbackItem: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.elevated,
  },
  feedbackItemValid: {
    color: colors.success.light,
    backgroundColor: colors.success.dark,
  },
  scoreBox: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary.DEFAULT,
    ...shadows.sm,
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
  scoreValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.DEFAULT,
  },
  scoreFeedback: {
    marginBottom: spacing.md,
  },
  feedbackLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  feedbackText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  referenceFeedback: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  referenceLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.accent.purple,
    marginBottom: spacing.xs,
  },
  referenceText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  improvementTip: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  perfectText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.success.DEFAULT,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  submitButton: {
    flex: 1,
    backgroundColor: colors.accent.purple,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  submitButtonDisabled: {
    backgroundColor: colors.background.elevated,
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
