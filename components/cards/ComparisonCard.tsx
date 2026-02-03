import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';

export interface ExampleSentence {
  text: string;
  translation: string;
  audioUrl?: string;
  highlightWord?: boolean;
}

export interface ComparisonItem {
  label: string;        // "Present", "Past", "Future"
  word: string;         // "go", "went", "will go"
  phonetic?: string;
  examples?: ExampleSentence[];
  tagColor?: readonly string[];  // Gradient colors for label
}

export interface ComparisonCardProps {
  title?: string;       // "Verb Tenses: To Go"
  items: ComparisonItem[]; // 2-4 items
  type: 'verb-tense' | 'homophone' | 'formal-informal' | 'regional';
  onComplete: (quality: 'forgot' | 'remembered' | 'easy') => void;
  showExamples?: boolean;
  language?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_PADDING = spacing.lg;
const GRID_GAP = spacing.md;
// Calculate card width properly for side-by-side layout
const CARD_WIDTH = (SCREEN_WIDTH - CARD_PADDING * 2 - GRID_GAP) / 2;

export function ComparisonCard({
  items,
  type,
  onComplete,
  language = 'en-US',
  title,
  showExamples = false,
}: ComparisonCardProps) {
  const insets = useSafeAreaInsets();
  const [examplesRevealed, setExamplesRevealed] = useState(showExamples);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  const playAudio = async (text: string, itemWord: string) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPlayingAudio(itemWord);

      // TODO: Replace with Google TTS
      await Speech.speak(text, {
        language,
        rate: 0.9,
      });

      setPlayingAudio(null);
    } catch (error) {
      console.error('Error playing audio:', error);
      setPlayingAudio(null);
    }
  };

  const handleRevealExamples = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setExamplesRevealed(!examplesRevealed);
  };

  const handleComplete = (quality: 'forgot' | 'remembered' | 'easy') => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete(quality);
  };

  const getDefaultTagColor = (index: number): readonly string[] => {
    const gradients = [
      colors.gradients.primary,
      colors.gradients.secondary,
      colors.gradients.accent,
      colors.gradients.warning,
    ];
    return gradients[index % gradients.length];
  };

  const ComparisonItemCard = ({ item, index }: { item: ComparisonItem; index: number }) => (
    <View style={styles.itemContainer}>
      {/* Label Tag */}
      <LinearGradient
        colors={item.tagColor || getDefaultTagColor(index) as any}
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
        <Text style={styles.word} numberOfLines={2} adjustsFontSizeToFit>
          {item.word}
        </Text>
        {item.phonetic && <Text style={styles.phonetic}>{item.phonetic}</Text>}

        {/* Audio Button */}
        <TouchableOpacity
          onPress={() => playAudio(item.word, item.word)}
          style={styles.audioButton}
        >
          <LinearGradient
            colors={colors.gradients.success}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.audioButtonGradient}
          >
            <Ionicons
              name={playingAudio === item.word ? "pause" : "play"}
              size={20}
              color={colors.text.primary}
            />
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      {/* Examples Section (Revealed) */}
      {examplesRevealed && item.examples && item.examples.length > 0 && (
        <View style={styles.examplesContainer}>
          {item.examples.map((example, exIdx) => (
            <View key={exIdx} style={styles.exampleCard}>
              <View style={styles.exampleTextContainer}>
                <Text style={styles.exampleText}>{example.text}</Text>
                <Text style={styles.exampleTranslation}>{example.translation}</Text>
              </View>
              <TouchableOpacity
                onPress={() => playAudio(example.text, `${item.word}-ex-${exIdx}`)}
                style={styles.exampleAudioButton}
              >
                <Ionicons
                  name={playingAudio === `${item.word}-ex-${exIdx}` ? "pause-circle" : "play-circle"}
                  size={24}
                  color={colors.accent.cyan}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 140 }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        {title && <Text style={styles.title}>{title}</Text>}

        {/* Comparison Grid - Side by Side Layout */}
        <View style={styles.comparisonGrid}>
          {items.map((item, index) => (
            <View
              key={index}
              style={[
                styles.gridItem,
                {
                  width: CARD_WIDTH,
                },
              ]}
            >
              <ComparisonItemCard item={item} index={index} />
            </View>
          ))}
        </View>

        {/* Reveal Examples Button */}
        {items.some(item => item.examples && item.examples.length > 0) && (
          <TouchableOpacity onPress={handleRevealExamples} style={styles.revealButton}>
            <LinearGradient
              colors={colors.gradients.secondary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.revealButtonGradient}
            >
              <Ionicons
                name={examplesRevealed ? "eye-off" : "eye"}
                size={20}
                color={colors.text.primary}
              />
              <Text style={styles.revealButtonText}>
                {examplesRevealed ? "Hide Examples" : "Reveal Examples"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Spacer for fixed buttons */}
        <View style={{ height: spacing.xl }} />
      </ScrollView>

      {/* Fixed Bottom Buttons (Spaced Repetition) */}
      <View style={[styles.bottomButtons, { bottom: insets.bottom + spacing.md }]}>
        <TouchableOpacity
          onPress={() => handleComplete('forgot')}
          style={styles.bottomButton}
        >
          <LinearGradient
            colors={colors.gradients.error}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bottomButtonGradient}
          >
            <Ionicons name="close-circle" size={24} color={colors.text.primary} />
            <Text style={styles.bottomButtonText}>Need Practice</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleComplete('remembered')}
          style={styles.bottomButton}
        >
          <LinearGradient
            colors={colors.gradients.success}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bottomButtonGradient}
          >
            <Ionicons name="checkmark-circle" size={24} color={colors.text.primary} />
            <Text style={styles.bottomButtonText}>Got it</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleComplete('easy')}
          style={styles.bottomButton}
        >
          <LinearGradient
            colors={colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bottomButtonGradient}
          >
            <Ionicons name="flash" size={24} color={colors.text.primary} />
            <Text style={styles.bottomButtonText}>Easy</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: CARD_PADDING,
    paddingTop: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  comparisonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  gridItem: {
    // Width is set inline; gap-based spacing handled by parent container
  },
  itemContainer: {
    position: 'relative',
    paddingTop: spacing.md,
  },
  label: {
    position: 'absolute',
    top: 0,
    left: spacing.md,
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
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  wordCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    minHeight: 140,
    justifyContent: 'center',
  },
  word: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  phonetic: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  audioButton: {
    borderRadius: borderRadius.md,
    marginTop: spacing.xs,
  },
  audioButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.glow.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  examplesContainer: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  exampleCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  exampleTextContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  exampleText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  exampleTranslation: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.secondary,
  },
  exampleAudioButton: {
    padding: spacing.xs,
  },
  revealButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  revealButtonGradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    shadowColor: colors.glow.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  revealButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  bottomButtons: {
    position: 'absolute',
    left: CARD_PADDING,
    right: CARD_PADDING,
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.background.primary,
    paddingTop: spacing.md,
  },
  bottomButton: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  bottomButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bottomButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
});
