import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';
import { Audio } from 'expo-av';

interface ComparisonItem {
  label: string;
  word: string;
  phonetic?: string;
  tagColor?: string[];
}

interface ComparisonCardProps {
  items: [ComparisonItem, ComparisonItem];
  language?: string;
  title?: string;
}

export function ComparisonCard({
  items,
  language = 'en-US',
  title,
}: ComparisonCardProps) {
  const playAudio = async (text: string, speed: 'normal' | 'slow' = 'normal') => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // TODO: Replace with Google TTS
      await Speech.speak(text, {
        language,
        rate: speed === 'normal' ? 1.0 : 0.7,
      });
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const ComparisonItemCard = ({ item, index }: { item: ComparisonItem; index: number }) => (
    <View style={styles.itemContainer}>
      {/* Label Tag */}
      <LinearGradient
        colors={item.tagColor || (index === 0 ? colors.gradients.primary : colors.gradients.secondary)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.label}
      >
        <Text style={styles.labelText}>{item.label}</Text>
      </LinearGradient>

      {/* Word Card */}
      <LinearGradient
        colors={colors.gradients.dark}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.wordCard}
      >
        <Text style={styles.word}>{item.word}</Text>
        {item.phonetic && <Text style={styles.phonetic}>{item.phonetic}</Text>}

        {/* Audio Controls */}
        <View style={styles.audioRow}>
          <TouchableOpacity
            onPress={() => playAudio(item.word, 'slow')}
            style={styles.audioButton}
          >
            <LinearGradient
              colors={colors.gradients.secondary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.audioButtonGradient}
            >
              <Ionicons name="play-forward" size={24} color={colors.text.primary} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => playAudio(item.word, 'normal')}
            style={styles.audioButton}
          >
            <LinearGradient
              colors={colors.gradients.success}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.audioButtonGradient}
            >
              <Ionicons name="play" size={28} color={colors.text.primary} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}

      <View style={styles.comparisonContainer}>
        <ComparisonItemCard item={items[0]} index={0} />

        {/* Separator with icon */}
        <View style={styles.separator}>
          <View style={styles.separatorLine} />
          <LinearGradient
            colors={colors.gradients.accent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.separatorIcon}
          >
            <Ionicons name="swap-vertical" size={20} color={colors.text.primary} />
          </LinearGradient>
          <View style={styles.separatorLine} />
        </View>

        <ComparisonItemCard item={items[1]} index={1} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  comparisonContainer: {
    gap: spacing.md,
  },
  itemContainer: {
    position: 'relative',
    paddingTop: spacing.md,
  },
  label: {
    position: 'absolute',
    top: 0,
    left: spacing.lg,
    zIndex: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    shadowColor: colors.glow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  labelText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  wordCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  word: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  phonetic: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  audioRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  audioButton: {
    borderRadius: borderRadius.md,
  },
  audioButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.glow.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.light,
  },
  separatorIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
