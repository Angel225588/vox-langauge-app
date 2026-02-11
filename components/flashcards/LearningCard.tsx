/**
 * LearningCard — Flip-card for vocabulary learning
 *
 * Front: Word + phonetic + image (translation hidden)
 * Back: Translation + example + audio
 *
 * Design system: dark neomorphic theme, TypeBadge, CardActions
 */

import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useAudioPlayer } from 'expo-audio';
import {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
} from '@/constants/designSystem';
import { TypeBadge } from '@/components/ui/TypeBadge';

interface LearningCardProps {
  word: string;
  translation: string;
  phonetic?: string;
  imageUrl?: string;
  audioUrl?: string;
  exampleSentence?: string;
  onFlip?: () => void;
  badgeVariant?: 'vocabulary' | 'grammar';
  badgeLabel?: string;
}

const LearningCard: React.FC<LearningCardProps> = ({
  word,
  translation,
  phonetic,
  imageUrl,
  audioUrl,
  exampleSentence,
  onFlip,
  badgeVariant = 'vocabulary',
  badgeLabel,
}) => {
  const rotateY = useSharedValue(0);
  const player = useAudioPlayer(audioUrl || '');

  const tap = Gesture.Tap().onEnd(() => {
    rotateY.value = withTiming(rotateY.value === 0 ? 180 : 0, { duration: 500 });
    onFlip?.();
  });

  function playSound() {
    if (audioUrl && player) {
      player.play();
    }
  }

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const frontRotate = interpolate(
      rotateY.value,
      [0, 180],
      [0, 180],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ rotateY: `${frontRotate}deg` }],
      backfaceVisibility: 'hidden' as const,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const backRotate = interpolate(
      rotateY.value,
      [0, 180],
      [180, 360],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ rotateY: `${backRotate}deg` }],
      backfaceVisibility: 'hidden' as const,
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    };
  });

  return (
    <GestureDetector gesture={tap}>
      <View style={styles.container}>
        <View style={styles.cardWrapper}>
          {/* Front — word side */}
          <Animated.View style={[styles.cardFace, frontAnimatedStyle]}>
            <View style={styles.card}>
              <TypeBadge variant={badgeVariant} label={badgeLabel} />

              <Text style={styles.word}>{word}</Text>

              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image-outline" size={48} color={colors.text.tertiary} />
                </View>
              )}

              {phonetic && <Text style={styles.phonetic}>{phonetic}</Text>}
              <Text style={styles.hint}>Tap to reveal translation</Text>
            </View>
          </Animated.View>

          {/* Back — translation side */}
          <Animated.View style={[styles.cardFace, backAnimatedStyle]}>
            <View style={styles.card}>
              <TypeBadge variant={badgeVariant} label={badgeLabel} />

              <Text style={styles.word}>{translation}</Text>

              {exampleSentence && (
                <Text style={styles.example}>{exampleSentence}</Text>
              )}

              {audioUrl && (
                <Pressable onPress={playSound} style={styles.audioButton}>
                  <Ionicons name="play-circle" size={56} color={colors.primary.DEFAULT} />
                </Pressable>
              )}

              <Text style={styles.hint}>Tap to flip back</Text>
            </View>
          </Animated.View>
        </View>
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  cardWrapper: {
    width: '100%',
    aspectRatio: 3 / 4,
    maxWidth: 360,
    // @ts-ignore — perspective is valid on iOS/Android
    perspective: 1000,
  },
  cardFace: {
    width: '100%',
    height: '100%',
  },
  card: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing.lg,
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.md,
  },
  word: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  phonetic: {
    fontSize: typography.fontSize.lg,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
  },
  image: {
    width: 180,
    height: 180,
    marginVertical: spacing.md,
  },
  imagePlaceholder: {
    width: 180,
    height: 180,
    marginVertical: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.lg,
  },
  example: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  audioButton: {
    marginVertical: spacing.md,
    padding: spacing.sm,
  },
  hint: {
    fontSize: typography.fontSize.base,
    color: colors.primary.light,
    marginBottom: spacing.sm,
  },
});

export default LearningCard;
