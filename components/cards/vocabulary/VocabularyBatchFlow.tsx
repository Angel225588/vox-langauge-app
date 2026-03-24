/**
 * VocabularyBatchFlow — Batch-Based Vocabulary Practice
 *
 * Professional flow for busy people:
 *
 * Phase 1: INTRODUCE — See all 5 words (flip cards, audio, translation)
 * Phase 2: SELECT   — Quiz: "What does X mean?" for each word
 * Phase 3: LISTEN   — Hear & type what you heard (each word)
 * Phase 4: SPEAK    — Pronounce each word (record)
 * Phase 5: WRITE    — Type the word from translation (each word)
 * Phase 6: RESULTS  — Mini feedback: score, words to review, time
 *
 * Words are grouped by phase, not by word.
 * Each phase covers ALL words before moving to the next.
 *
 * This replaces VocabularyCardFlow for the stair session
 * while keeping VocabularyCardFlow for single-word practice on the practice tab.
 */

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';

// Real card components for each phase
import { IntroductionCardV2 } from './IntroductionCardV2';
import { AudioQuizCard } from './AudioQuizCard';
import { ListeningCard } from './ListeningCard';
import { SpeakingCard } from '@/components/cards/SpeakingCard';
import { getTargetSpeechLang } from './speechLang';
import { TypingCard } from './TypingCard';
import { ScoreRing, StatsGrid } from '@/components/feedback';
import type { StatItem } from '@/components/feedback';
import type { VocabularyItem, VocabCardResult } from '@/types/vocabulary';

// ============================================================================
// TYPES
// ============================================================================

export type BatchPhase = 'introduce' | 'select' | 'listen' | 'speak' | 'write' | 'results';

const PHASE_ORDER: BatchPhase[] = ['introduce', 'select', 'listen', 'speak', 'write', 'results'];

const PHASE_INFO: Record<BatchPhase, { label: string; icon: string; color: string }> = {
  introduce: { label: 'Learn', icon: 'book-outline', color: '#3D6BFF' },
  select: { label: 'Select', icon: 'checkmark-circle-outline', color: '#06D6A0' },
  listen: { label: 'Listen', icon: 'headset-outline', color: '#F59E0B' },
  speak: { label: 'Speak', icon: 'mic-outline', color: '#8B5CF6' },
  write: { label: 'Write', icon: 'create-outline', color: '#EC4899' },
  results: { label: 'Results', icon: 'bar-chart-outline', color: '#06D6A0' },
};

export interface BatchFlowResult {
  totalWords: number;
  correctByPhase: Record<string, number>;
  totalCorrect: number;
  totalAttempts: number;
  timeSeconds: number;
  wordsToReview: string[];
}

interface VocabularyBatchFlowProps {
  /** Array of vocabulary items (3-7 words) */
  items: VocabularyItem[];
  /** Called when the entire batch flow is complete */
  onComplete: (result: BatchFlowResult) => void;
  /** Called when user exits early */
  onExit: () => void;
  /** Called when user wants detailed feedback — passes scores for the feedback screen */
  onFeedback?: (result: BatchFlowResult) => void;
  /** Skip phases (e.g., skip speaking if can't speak) */
  skipPhases?: BatchPhase[];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function VocabularyBatchFlow({
  items,
  onComplete,
  onExit,
  onFeedback,
  skipPhases = [],
}: VocabularyBatchFlowProps) {
  const insets = useSafeAreaInsets();
  const startTime = useRef(Date.now());

  // Active phases (remove skipped ones, always keep results)
  const phases = useMemo(() => {
    return PHASE_ORDER.filter(p => p === 'results' || !skipPhases.includes(p));
  }, [skipPhases]);

  const speechLang = useMemo(() => getTargetSpeechLang(), []);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [results, setResults] = useState<VocabCardResult[]>([]);
  const [phaseResults, setPhaseResults] = useState<Record<string, number>>({});
  const [wordsToReview, setWordsToReview] = useState<Set<string>>(new Set());

  const currentPhase = phases[phaseIndex];
  const currentItem = items[wordIndex];
  const isLastWord = wordIndex >= items.length - 1;
  const isLastPhase = phaseIndex >= phases.length - 1;

  // Track results per phase
  const recordResult = useCallback((correct: boolean, word: string) => {
    if (!correct) {
      setWordsToReview(prev => new Set(prev).add(word));
    }
    setPhaseResults(prev => ({
      ...prev,
      [currentPhase]: (prev[currentPhase] || 0) + (correct ? 1 : 0),
    }));
  }, [currentPhase]);

  // Handle card completion — advance word or phase
  const handleCardComplete = useCallback((result: VocabCardResult) => {
    // CRITICAL: Stop any playing audio before transitioning
    Speech.stop();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setResults(prev => [...prev, result]);
    recordResult(result.correct, currentItem?.word || '');

    if (isLastWord) {
      // Done with all words in this phase → move to next phase
      setWordIndex(0);
      setPhaseIndex(prev => prev + 1);
    } else {
      // Next word in this phase
      setWordIndex(prev => prev + 1);
    }
  }, [isLastWord, currentItem, recordResult]);

  // Handle skip
  const handleSkip = useCallback(() => {
    handleCardComplete({
      variant: currentPhase === 'introduce' ? 'introduction'
        : currentPhase === 'select' ? 'audioQuiz'
        : currentPhase === 'listen' ? 'listening'
        : currentPhase === 'speak' ? 'speaking'
        : 'typing',
      correct: false,
      timeSpent: 0,
      audioReplays: 0,
      hintUsed: false,
    });
  }, [currentPhase, handleCardComplete]);

  // Handle intro card "Got it" / "Again" — both advance
  const handleIntroComplete = useCallback((result: VocabCardResult) => {
    handleCardComplete(result);
  }, [handleCardComplete]);

  // Speaking card completion
  const handleSpeakingComplete = useCallback(() => {
    handleCardComplete({
      variant: 'speaking',
      correct: true,
      timeSpent: 0,
      audioReplays: 0,
      hintUsed: false,
    });
  }, [handleCardComplete]);

  // Build final results
  const buildFinalResult = useCallback((): BatchFlowResult => {
    const timeSeconds = Math.floor((Date.now() - startTime.current) / 1000);
    const totalCorrect = results.filter(r => r.correct).length;
    return {
      totalWords: items.length,
      correctByPhase: phaseResults,
      totalCorrect,
      totalAttempts: results.length,
      timeSeconds,
      wordsToReview: Array.from(wordsToReview),
    };
  }, [items.length, results, phaseResults, wordsToReview]);

  // ========================================================================
  // RESULTS PHASE
  // ========================================================================
  if (currentPhase === 'results') {
    const finalResult = buildFinalResult();
    const accuracy = finalResult.totalAttempts > 0
      ? Math.round((finalResult.totalCorrect / finalResult.totalAttempts) * 100)
      : 0;
    const points = finalResult.totalCorrect * 10;

    const stats: StatItem[] = [
      { icon: '📚', value: finalResult.totalWords, label: 'Words', color: '#3D6BFF' },
      { icon: '✅', value: `${accuracy}%`, label: 'Accuracy', color: accuracy >= 70 ? '#10B981' : '#F59E0B' },
      { icon: '⭐', value: points, label: 'Points', color: '#F59E0B' },
      { icon: '⏱', value: `${Math.floor(finalResult.timeSeconds / 60)}m`, label: 'Time', color: '#8B5CF6' },
    ];

    return (
      <View style={S.container}>
        <ScrollView style={S.scroll} contentContainerStyle={S.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Congrats header */}
          <Animated.View entering={FadeInDown.delay(100)} style={{ alignItems: 'center', marginBottom: spacing.lg }}>
            <Text style={{ fontSize: 48, marginBottom: spacing.sm }}>
              {accuracy >= 80 ? '🎉' : accuracy >= 50 ? '💪' : '📖'}
            </Text>
            <Text style={{ color: colors.text.primary, fontSize: 24, fontWeight: '800', textAlign: 'center' }}>
              {accuracy >= 80 ? 'Excellent Work!' : accuracy >= 50 ? 'Good Progress!' : 'Keep Practicing!'}
            </Text>
            <Text style={{ color: colors.text.secondary, fontSize: typography.fontSize.base, marginTop: spacing.xs, textAlign: 'center' }}>
              You earned {points} points
            </Text>
          </Animated.View>

          {/* Score Ring */}
          <Animated.View entering={FadeInDown.delay(200)} style={{ alignItems: 'center', marginBottom: spacing.xl }}>
            <ScoreRing score={accuracy} size={140} label="Overall" delay={300} />
          </Animated.View>

          {/* Stats Grid */}
          {/* Stats Grid */}
          <Animated.View entering={FadeInDown.delay(400)} style={{ marginBottom: spacing.lg }}>
            <StatsGrid stats={stats} delay={500} stagger={100} />
          </Animated.View>

          {/* Phase breakdown */}
          <Animated.View entering={FadeInDown.delay(600)} style={S.breakdownCard}>
            <Text style={{ color: colors.text.tertiary, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: spacing.sm }}>BREAKDOWN</Text>
            {Object.entries(PHASE_INFO).filter(([k]) => k !== 'results' && !skipPhases.includes(k as BatchPhase)).map(([phase, info], i) => {
              const correct = phaseResults[phase] || 0;
              const pct = items.length > 0 ? Math.round((correct / items.length) * 100) : 0;
              return (
                <View key={phase} style={S.breakdownRow}>
                  <View style={[S.breakdownDot, { backgroundColor: info.color }]} />
                  <Text style={S.breakdownLabel}>{info.label}</Text>
                  <View style={S.breakdownBar}>
                    <View style={[S.breakdownFill, { width: `${Math.max(pct, 5)}%`, backgroundColor: info.color }]} />
                  </View>
                  <Text style={S.breakdownPct}>{correct}/{items.length}</Text>
                </View>
              );
            })}
          </Animated.View>

          {/* Words to review */}
          {finalResult.wordsToReview.length > 0 && (
            <Animated.View entering={FadeInDown.delay(700)} style={S.reviewCard}>
              <Text style={S.reviewTitle}>Words to review</Text>
              <View style={S.reviewChips}>
                {finalResult.wordsToReview.map((w, i) => (
                  <View key={i} style={S.reviewChip}>
                    <Text style={S.reviewChipText}>{w}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}
        </ScrollView>

        {/* Fixed CTAs — Detailed Feedback + Back to Practice */}
        <View style={[S.fixedBottom, { paddingBottom: insets.bottom + spacing.md }]}>
          {onFeedback && (
            <TouchableOpacity
              onPress={() => onFeedback(finalResult)}
              activeOpacity={0.85}
              style={{ marginBottom: spacing.sm }}
            >
              <View style={S.feedbackBtn}>
                <Ionicons name="analytics-outline" size={18} color={colors.primary.DEFAULT} />
                <Text style={S.feedbackBtnText}>See Detailed Feedback</Text>
              </View>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => onComplete(finalResult)} activeOpacity={0.85}>
            <LinearGradient colors={colors.gradients.success} style={S.ctaBtn}>
              <Text style={S.ctaText}>Back to Practice</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ========================================================================
  // ACTIVE PHASE — Render the appropriate card
  // ========================================================================
  if (!currentItem) return null;

  const phaseInfo = PHASE_INFO[currentPhase];

  return (
    <View style={S.container}>
      {/* Phase indicator bar */}
      <View style={[S.phaseBar, { paddingTop: insets.top + spacing.xs }]}>
        <View style={S.phaseBarInner}>
          {phases.filter(p => p !== 'results').map((p, i) => (
            <View key={p} style={[
              S.phaseDot,
              { backgroundColor: i < phaseIndex ? PHASE_INFO[p].color : i === phaseIndex ? PHASE_INFO[p].color : 'rgba(255,255,255,0.1)' },
              i === phaseIndex && S.phaseDotActive,
            ]} />
          ))}
        </View>
        <Text style={S.phaseLabel}>
          {phaseInfo.label} • {wordIndex + 1}/{items.length}
        </Text>
      </View>

      {/* Card */}
      <Animated.View
        key={`${currentPhase}-${wordIndex}`}
        entering={SlideInRight.duration(250)}
        exiting={SlideOutLeft.duration(200)}
        style={S.cardArea}
      >
        {currentPhase === 'introduce' && (
          <IntroductionCardV2
            item={currentItem}
            onComplete={handleIntroComplete}
            onSkip={handleSkip}
          />
        )}

        {currentPhase === 'select' && (
          <AudioQuizCard
            item={currentItem}
            onComplete={handleCardComplete}
            onSkip={handleSkip}
          />
        )}

        {currentPhase === 'listen' && (
          <ListeningCard
            item={currentItem}
            onComplete={handleCardComplete}
            onSkip={handleSkip}
          />
        )}

        {currentPhase === 'speak' && (
          <SpeakingCard
            word={currentItem.word}
            translation={currentItem.translation}
            phonetic={currentItem.phonetic}
            audio_url={currentItem.audioUrl}
            expressionType={currentItem.partOfSpeech}
            language={speechLang}
            onComplete={handleSpeakingComplete}
            onCantSpeak={handleSkip}
          />
        )}

        {currentPhase === 'write' && (
          <TypingCard
            item={currentItem}
            onComplete={handleCardComplete}
            onSkip={handleSkip}
          />
        )}
      </Animated.View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: 200 },

  // Phase bar
  phaseBar: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  phaseBarInner: { flexDirection: 'row', gap: 4, marginBottom: spacing.xs },
  phaseDot: { flex: 1, height: 3, borderRadius: 2 },
  phaseDotActive: { height: 4 },
  phaseLabel: { color: colors.text.secondary, fontSize: typography.fontSize.xs, textAlign: 'center', fontWeight: '600' },

  // Card area
  cardArea: { flex: 1 },

  // Results
  resultScore: { alignItems: 'center', marginBottom: spacing.xl, marginTop: spacing.xl },
  scoreCircle: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  scoreValue: { color: colors.text.primary, fontSize: 40, fontWeight: '800' },
  scoreLabel: { color: colors.text.primary, fontSize: typography.fontSize.xl, fontWeight: '700', marginBottom: spacing.xs },
  scoreTime: { color: colors.text.secondary, fontSize: typography.fontSize.sm },

  // Breakdown
  breakdownCard: { backgroundColor: colors.background.card, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  breakdownDot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.sm },
  breakdownLabel: { color: colors.text.secondary, fontSize: typography.fontSize.sm, width: 60 },
  breakdownBar: { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, marginHorizontal: spacing.sm, overflow: 'hidden' },
  breakdownFill: { height: '100%', borderRadius: 3 },
  breakdownPct: { color: colors.text.primary, fontSize: typography.fontSize.sm, fontWeight: '600', width: 40, textAlign: 'right' },

  // Review words
  reviewCard: { backgroundColor: colors.background.card, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  reviewTitle: { color: colors.warning.DEFAULT, fontSize: typography.fontSize.base, fontWeight: '700', marginBottom: spacing.sm },
  reviewChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  reviewChip: { backgroundColor: 'rgba(245,158,11,0.12)', paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: borderRadius.md },
  reviewChipText: { color: colors.warning.DEFAULT, fontSize: typography.fontSize.sm, fontWeight: '600' },

  // Fixed bottom CTA
  fixedBottom: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  feedbackBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: 14, borderRadius: borderRadius.lg, borderWidth: 1.5, borderColor: colors.primary.DEFAULT },
  feedbackBtnText: { color: colors.primary.DEFAULT, fontSize: typography.fontSize.base, fontWeight: '700' },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: borderRadius.lg, gap: spacing.sm },
  ctaText: { color: '#fff', fontSize: typography.fontSize.lg, fontWeight: '700' },
});

export default VocabularyBatchFlow;
