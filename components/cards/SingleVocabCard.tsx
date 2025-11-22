import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { BaseCard } from './BaseCard';
import { AudioControls } from './AudioControls';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = width * 0.7;

interface SingleVocabCardProps {
  word: string;
  phonetic?: string;
  translation?: string;
  imageUrl?: string;
  language?: string;
  variant?: 'default' | 'primary' | 'secondary';
  showTranslation?: boolean;
  tag?: string;
}

export function SingleVocabCard({
  word,
  phonetic,
  translation,
  imageUrl,
  language = 'en-US',
  variant = 'default',
  showTranslation = false,
  tag,
}: SingleVocabCardProps) {
  return (
    <BaseCard variant={variant} size="large" withGlow tag={tag}>
      <View style={styles.container}>
        {/* Image */}
        {imageUrl && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Word and Phonetic */}
        <View style={styles.textContainer}>
          <Text style={styles.word}>{word}</Text>
          {phonetic && <Text style={styles.phonetic}>{phonetic}</Text>}
          {showTranslation && translation && (
            <Text style={styles.translation}>{translation}</Text>
          )}
        </View>

        {/* Audio Controls */}
        <View style={styles.audioContainer}>
          <AudioControls text={word} language={language} size="large" />
        </View>
      </View>
    </BaseCard>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  imageContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.background.elevated,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  word: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  phonetic: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  translation: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  audioContainer: {
    marginTop: spacing.md,
  },
});
