/**
 * VocabularyPreScreen — Vocabulary checkpoint before listening
 *
 * Shows all vocabulary words the user will hear in the dialogue.
 * Users tap words they already know → marked as learned in FSRS.
 * Unknown words → added as new cards for future review.
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LISTENING } from './theme';

export interface VocabWord {
  word: string;
  phonetic?: string;
  translation: string;
}

interface VocabularyPreScreenProps {
  vocabulary: VocabWord[];
  onComplete: (knownWords: string[]) => void;
}

export default function VocabularyPreScreen({
  vocabulary,
  onComplete,
}: VocabularyPreScreenProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleWord = useCallback((word: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(word)) {
        next.delete(word);
      } else {
        next.add(word);
      }
      return next;
    });
  }, []);

  const handleContinue = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onComplete(Array.from(selected));
  }, [selected, onComplete]);

  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Words You'll Hear</Text>
        <Text style={styles.subtitle}>
          Select the words you already know.{'\n'}
          Unknown words will be added to your word bank.
        </Text>
      </View>

      {/* Counter */}
      <Text style={styles.counter}>
        <Text style={styles.counterHighlight}>{selected.size}</Text>
        {' '}of {vocabulary.length} selected
      </Text>

      {/* Word list */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {vocabulary.map((v, index) => {
          const isSelected = selected.has(v.word);
          return (
            <Animated.View
              key={v.word}
              entering={FadeInDown.delay(index * 50).duration(300)}
            >
              <TouchableOpacity
                style={[styles.wordCard, isSelected && styles.wordCardSelected]}
                onPress={() => toggleWord(v.word)}
                activeOpacity={0.7}
                accessibilityLabel={`${v.word}: ${v.translation}. ${isSelected ? 'Selected as known' : 'Tap if you know this word'}`}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
              >
                <View style={styles.wordLeft}>
                  <Text style={styles.wordText}>{v.word}</Text>
                  {v.phonetic && (
                    <Text style={styles.phonetic}>{v.phonetic}</Text>
                  )}
                  <Text style={styles.translation}>{v.translation}</Text>
                </View>
                <View
                  style={[
                    styles.checkbox,
                    isSelected && styles.checkboxSelected,
                  ]}
                >
                  {isSelected && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>

      {/* What you'll do — 3 icon+text pairs, 16 words total */}
      <View style={styles.purposeSection}>
        <View style={styles.purposeRow}>
          <Ionicons name="ear-outline" size={16} color={LISTENING.teal} />
          <Text style={styles.purposeText}>Listen to a short conversation</Text>
        </View>
        <View style={styles.purposeRow}>
          <Ionicons name="help-circle-outline" size={16} color={LISTENING.teal} />
          <Text style={styles.purposeText}>Answer questions about what you hear</Text>
        </View>
        <View style={styles.purposeRow}>
          <Ionicons name="trending-up-outline" size={16} color={LISTENING.teal} />
          <Text style={styles.purposeText}>Track your comprehension over time</Text>
        </View>
      </View>

      {/* CTA */}
      <View style={styles.ctaBar}>
        <TouchableOpacity onPress={handleContinue} activeOpacity={0.8}>
          <LinearGradient
            colors={LISTENING.tealGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaBtn}
          >
            <Text style={styles.ctaText}>Start Listening</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: LISTENING.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: LISTENING.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  counter: {
    fontSize: 13,
    fontWeight: '600',
    color: LISTENING.textTertiary,
    textAlign: 'center',
    marginBottom: 12,
  },
  counterHighlight: {
    color: LISTENING.teal,
    fontWeight: '700',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    gap: 8,
    paddingBottom: 8,
  },
  wordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    backgroundColor: LISTENING.glassBg,
    borderWidth: 1.5,
    borderColor: LISTENING.glassBorder,
  },
  wordCardSelected: {
    backgroundColor: 'rgba(6, 214, 160, 0.08)',
    borderColor: 'rgba(6, 214, 160, 0.30)',
  },
  wordLeft: {
    flex: 1,
    gap: 2,
  },
  wordText: {
    fontSize: 17,
    fontWeight: '700',
    color: LISTENING.textPrimary,
  },
  phonetic: {
    fontSize: 12,
    fontWeight: '500',
    color: LISTENING.teal,
  },
  translation: {
    fontSize: 12,
    fontWeight: '500',
    color: LISTENING.textDisabled,
    marginTop: 1,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: LISTENING.teal,
    borderColor: LISTENING.teal,
  },
  purposeSection: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 4,
    borderRadius: 12,
    backgroundColor: LISTENING.glassBg,
    borderWidth: 1,
    borderColor: LISTENING.glassBorder,
    gap: 8,
  },
  purposeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  purposeText: {
    fontSize: 13,
    fontWeight: '500',
    color: LISTENING.textTertiary,
    flex: 1,
  },
  ctaBar: {
    paddingTop: 12,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 16,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
