import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Animated, { FadeIn, FadeOut, withTiming, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { BaseCard } from './BaseCard';
import { colors, borderRadius, spacing, shadows, typography } from '@/constants/designSystem';
import LottieSuccess from '../animations/LottieSuccess';
import LottieError from '../animations/LottieError';

interface DescribeImageCardProps {
  imageUrl: string;
  keywords: string[];
  minWords?: number;
  minLength?: number; // New prop for minimum character length
  difficulty: 'easy' | 'medium' | 'hard';
  onComplete: (result: { correct: boolean; audioUri?: string; description?: string }) => void;
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

    let isCorrect = false;
    if (audioUri) {
        // If audio is recorded, we assume it's the primary input.
        // A simple check for MVP could be duration.
        isCorrect = recordingDuration > 2; // e.g., must be longer than 2 seconds
    } else {
        // Text-based evaluation
        isCorrect = validation.hasMinLength && validation.hasVerb && validation.detectedKeywords.length > 0;
    }

    if (isCorrect) {
      setShowResultAnimation('success');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setShowResultAnimation('error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    
    setTimeout(() => {
      onComplete({ correct: isCorrect, audioUri: audioUri ?? undefined, description });
      setIsSubmitting(false);
      setShowResultAnimation(null);
    }, 1500);
  };

  const canSubmit = !isSubmitting && (description.length > 0 || audioUri !== null);

  return (
    <BaseCard {...baseCardProps} style={styles.cardContainer}>
      {showResultAnimation && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.lottieOverlay}>
          {showResultAnimation === 'success' ? <LottieSuccess /> : <LottieError />}
        </Animated.View>
      )}

      <Text style={styles.instructionText}>Describe what you see in the image.</Text>
      <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />

      {/* Switch between text input and audio recorder */}
      {true ? (
        <TextInput
          style={styles.textInput}
          placeholder={`Type your description...`}
          placeholderTextColor={colors.text.tertiary}
          multiline
          value={description}
          onChangeText={setDescription}
          editable={!isRecording && !isSubmitting}
        />
      ) : (
        <View style={styles.audioFeedbackContainer}>
            <Text>Recording...</Text>
        </View>
      )}

      {/* Validation Feedback */}
      <View style={styles.feedbackContainer}>
          <Text style={[styles.feedbackItem, validation.hasMinLength && styles.feedbackItemValid]}>
              {description.length}/{minLength} chars
          </Text>
          <Text style={[styles.feedbackItem, validation.hasVerb && styles.feedbackItemValid]}>
              Verb
          </Text>
          <Text style={[styles.feedbackItem, validation.detectedKeywords.length > 0 && styles.feedbackItemValid]}>
              {validation.detectedKeywords.length}/{keywords.length} keywords
          </Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.audioButton, isRecording && styles.audioButtonRecording]}
          onPress={handleRecordToggle}
          disabled={isSubmitting}
        >
          {isRecording ? (
            <Text style={styles.timerText}>{recordingDuration}s</Text>
          ) : (
            <Ionicons name="mic-outline" size={typography.fontSize.xl} color={colors.text.primary} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          {isSubmitting ? <ActivityIndicator color={colors.text.primary} /> : <Text style={styles.submitButtonText}>Submit</Text>}
        </TouchableOpacity>
      </View>
    </BaseCard>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    padding: spacing.lg,
    justifyContent: 'space-between',
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
  textInput: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.border.medium,
    marginBottom: spacing.md,
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
  controls: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  audioButton: {
    width: 55,
    height: 55,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  audioButtonRecording: {
    backgroundColor: colors.error.DEFAULT,
    ...shadows.glow.error,
  },
  timerText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
    fontWeight: 'bold',
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
