/**
 * Feedback Detail Screen
 *
 * Post-session detailed feedback with 3 glass container sections:
 *   1. What You Did Well (green) — specific skill-referenced strengths
 *   2. What to Work On (amber) — prioritized improvements with examples
 *   3. Your Progress (purple) — trend data vs previous sessions
 *
 * Flows INTO lesson-complete screen.
 * Professional tone — Ionicons only, no emojis.
 */

import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Types ───────────────────────────────────────────────────

interface DetailedStrength {
  text: string;
  skill: string;
}

interface DetailedImprovement {
  area: string;
  suggestion: string;
  priority: 'focus' | 'practice' | 'polish';
  example?: {
    incorrect?: string;
    correct?: string;
    tip?: string;
  };
}

interface ProgressMetric {
  name: string;
  previous: number;
  current: number;
  color: string;
  trend: 'up' | 'stable' | 'down';
}

// ─── Mock Data (dev tools) ───────────────────────────────────

const MOCK_STRENGTHS: DetailedStrength[] = [
  { text: 'Accurate conditional tense in negotiation phrases.', skill: 'Grammar' },
  { text: 'Natural intonation on questions — confident tone.', skill: 'Pronunc.' },
  { text: 'Good vocabulary for agreement and concessions.', skill: 'Vocab' },
  { text: 'Smooth transitions between points without pauses.', skill: 'Fluency' },
];

const MOCK_IMPROVEMENTS: DetailedImprovement[] = [
  {
    area: 'Subjunctive mood',
    suggestion: 'Practice subjunctive clauses in hypothetical formal settings.',
    priority: 'focus',
    example: {
      incorrect: '"Si tendría más tiempo..."',
      correct: '"Si tuviera más tiempo..."',
    },
  },
  {
    area: 'Filler words',
    suggestion: 'Used "este" 6 times. Try pausing silently instead.',
    priority: 'practice',
  },
];

const MOCK_PROGRESS: ProgressMetric[] = [
  { name: 'Articulation', previous: 62, current: 71, color: '#00A3FF', trend: 'up' },
  { name: 'Fluency', previous: 78, current: 78, color: '#06D6A0', trend: 'stable' },
  { name: 'Communication', previous: 80, current: 85, color: '#8B5CF6', trend: 'up' },
];

// ─── Section Colors ──────────────────────────────────────────

const SECTION = {
  green: {
    gradient: ['rgba(16,185,129,0.10)', 'rgba(16,185,129,0.03)'] as const,
    border: 'rgba(16,185,129,0.18)',
    iconBg: 'rgba(16,185,129,0.15)',
    chipBg: 'rgba(16,185,129,0.06)',
    chipBorder: 'rgba(16,185,129,0.10)',
    accent: '#10B981',
    accentLight: '#34D399',
    countBg: 'rgba(16,185,129,0.18)',
    countColor: '#34D399',
  },
  amber: {
    gradient: ['rgba(245,158,11,0.10)', 'rgba(245,158,11,0.03)'] as const,
    border: 'rgba(245,158,11,0.18)',
    iconBg: 'rgba(245,158,11,0.15)',
    chipBg: 'rgba(245,158,11,0.05)',
    chipBorder: 'rgba(245,158,11,0.10)',
    accent: '#F59E0B',
    accentLight: '#FBBF24',
    countBg: 'rgba(245,158,11,0.18)',
    countColor: '#FBBF24',
  },
  purple: {
    gradient: ['rgba(139,92,246,0.10)', 'rgba(139,92,246,0.03)'] as const,
    border: 'rgba(139,92,246,0.18)',
    iconBg: 'rgba(139,92,246,0.15)',
    chipBg: 'rgba(139,92,246,0.05)',
    chipBorder: 'rgba(139,92,246,0.10)',
    accent: '#8B5CF6',
    accentLight: '#A78BFA',
    countBg: 'rgba(139,92,246,0.18)',
    countColor: '#A78BFA',
  },
};

// ─── Score Ring ──────────────────────────────────────────────

const RING_SIZE = 44;
const RING_STROKE = 3.5;
const RING_R = (RING_SIZE - RING_STROKE) / 2;
const RING_C = 2 * Math.PI * RING_R;

function OverallScoreRing({ score }: { score: number }) {
  const offset = RING_C * (1 - score / 100);
  return (
    <View style={styles.ovRing}>
      <Svg width={RING_SIZE} height={RING_SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_R}
          stroke="rgba(16,185,129,0.12)" strokeWidth={RING_STROKE} fill="transparent"
        />
        <Circle
          cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_R}
          stroke="#10B981" strokeWidth={RING_STROKE} fill="transparent"
          strokeLinecap="round" strokeDasharray={RING_C} strokeDashoffset={offset}
        />
      </Svg>
      <Text style={styles.ovNum}>{score}</Text>
    </View>
  );
}

// ─── Strength Chip ───────────────────────────────────────────

function StrengthChip({ item }: { item: DetailedStrength }) {
  return (
    <View style={[styles.strChip, { backgroundColor: SECTION.green.chipBg, borderColor: SECTION.green.chipBorder }]}>
      <View style={styles.strDot}>
        <Ionicons name="checkmark" size={12} color={SECTION.green.accent} />
      </View>
      <Text style={styles.strText}>{item.text}</Text>
      <View style={styles.strTag}>
        <Text style={styles.strTagText}>{item.skill}</Text>
      </View>
    </View>
  );
}

// ─── Improvement Chip ────────────────────────────────────────

function ImprovementChip({ item }: { item: DetailedImprovement }) {
  return (
    <View style={[styles.impChip, { backgroundColor: SECTION.amber.chipBg, borderColor: SECTION.amber.chipBorder }]}>
      <View style={styles.impTop}>
        <Text style={styles.impArea}>{item.area}</Text>
        <View style={[
          styles.impPri,
          item.priority === 'focus'
            ? { backgroundColor: 'rgba(245,158,11,0.18)' }
            : { backgroundColor: 'rgba(245,158,11,0.10)' },
        ]}>
          <Text style={[
            styles.impPriText,
            item.priority === 'focus'
              ? { color: '#FBBF24' }
              : { color: 'rgba(245,158,11,0.7)' },
          ]}>
            {item.priority === 'focus' ? 'Focus' : item.priority === 'practice' ? 'Practice' : 'Polish'}
          </Text>
        </View>
      </View>
      <Text style={styles.impSug}>{item.suggestion}</Text>
      {item.example && (item.example.incorrect || item.example.correct) && (
        <View style={styles.impEx}>
          {item.example.incorrect && (
            <Text style={styles.impExWrong}>{item.example.incorrect}</Text>
          )}
          {item.example.correct && (
            <Text style={styles.impExRight}>{item.example.correct}</Text>
          )}
        </View>
      )}
      {item.example?.tip && (
        <View style={styles.impEx}>
          <Text style={styles.impExRight}>{item.example.tip}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Progress Chip ───────────────────────────────────────────

function ProgressChip({ item }: { item: ProgressMetric }) {
  const fillPercent = (item.current / 100) * 100;
  return (
    <View style={[styles.progChip, { backgroundColor: SECTION.purple.chipBg, borderColor: SECTION.purple.chipBorder }]}>
      <View style={styles.progInfo}>
        <Text style={styles.progName}>{item.name}</Text>
        <View style={styles.progBar}>
          <View style={[styles.progFill, { width: `${fillPercent}%`, backgroundColor: item.color }]} />
        </View>
      </View>
      <View style={styles.progRight}>
        <Text style={styles.progVals}>
          <Text style={styles.progValBold}>{item.previous}</Text>
          {' \u2192 '}
          <Text style={styles.progValBold}>{item.current}</Text>
        </Text>
        <View style={[
          styles.progTrend,
          item.trend === 'up'
            ? { backgroundColor: 'rgba(16,185,129,0.15)' }
            : { backgroundColor: 'rgba(245,158,11,0.12)' },
        ]}>
          <Text style={{
            fontSize: 12, fontWeight: '700',
            color: item.trend === 'up' ? '#10B981' : '#F59E0B',
          }}>
            {item.trend === 'up' ? '\u2191' : '\u2500'}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────

export default function FeedbackDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    scores?: string;
    stairTitle?: string;
    stairId?: string;
    isDiscovery?: string;
    scenario?: string;
  }>();

  const scenario = params.scenario || 'Business Meeting \u2014 Negotiation';
  const overallScore = 85;
  const overallMessage = 'You handled this scenario well. A few areas to refine.';

  // In production, these come from AI feedback. For dev tools, use mock data.
  const strengths = MOCK_STRENGTHS;
  const improvements = MOCK_IMPROVEMENTS;
  const progress = MOCK_PROGRESS;

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Pass scores forward to lesson-complete
    const scores = params.scores || JSON.stringify({
      articulation: 78, fluency: 65, communication: 72, scenario: 81,
      wordsLearned: 12, pointsEarned: 85, timeSpent: 360, cefrLevel: 'B1',
    });
    router.push({
      pathname: '/lesson-complete',
      params: {
        scores,
        stairTitle: params.stairTitle || 'Client meetings: Core Skills',
        stairId: params.stairId || 'dev-test',
        isDiscovery: params.isDiscovery || 'true',
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        bounces
      >
        {/* ═══ Header ═══ */}
        <Animated.View entering={FadeInDown.duration(400).delay(50)} style={styles.header}>
          <Text style={styles.headerTag}>Session Review</Text>
          <Text style={styles.headerTitle}>Your Feedback</Text>
          <Text style={styles.headerCtx}>{scenario}</Text>
        </Animated.View>

        {/* ═══ Overall Score ═══ */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <LinearGradient
            colors={['rgba(16,185,129,0.08)', 'rgba(16,185,129,0.02)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.overall}
          >
            <OverallScoreRing score={overallScore} />
            <View style={styles.ovText}>
              <Text style={styles.ovTitle}>Solid performance</Text>
              <Text style={styles.ovDesc}>{overallMessage}</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ═══ GLASS BOX 1: What You Did Well ═══ */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <LinearGradient
            colors={SECTION.green.gradient}
            start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }}
            style={[styles.glassBox, { borderColor: SECTION.green.border }]}
          >
            <View style={styles.gxHead}>
              <View style={[styles.gxIcon, { backgroundColor: SECTION.green.iconBg }]}>
                <Ionicons name="checkmark" size={16} color={SECTION.green.accent} />
              </View>
              <Text style={styles.gxTitle}>What You Did Well</Text>
              <View style={[styles.gxCount, { backgroundColor: SECTION.green.countBg }]}>
                <Text style={[styles.gxCountText, { color: SECTION.green.countColor }]}>
                  {strengths.length}
                </Text>
              </View>
            </View>
            {strengths.map((item, i) => (
              <StrengthChip key={`str-${i}`} item={item} />
            ))}
          </LinearGradient>
        </Animated.View>

        {/* ═══ GLASS BOX 2: What to Work On ═══ */}
        <Animated.View entering={FadeInDown.duration(400).delay(350)}>
          <LinearGradient
            colors={SECTION.amber.gradient}
            start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }}
            style={[styles.glassBox, { borderColor: SECTION.amber.border }]}
          >
            <View style={styles.gxHead}>
              <View style={[styles.gxIcon, { backgroundColor: SECTION.amber.iconBg }]}>
                <Ionicons name="alert-circle-outline" size={16} color={SECTION.amber.accentLight} />
              </View>
              <Text style={styles.gxTitle}>What to Work On</Text>
              <View style={[styles.gxCount, { backgroundColor: SECTION.amber.countBg }]}>
                <Text style={[styles.gxCountText, { color: SECTION.amber.countColor }]}>
                  {improvements.length}
                </Text>
              </View>
            </View>
            {improvements.map((item, i) => (
              <ImprovementChip key={`imp-${i}`} item={item} />
            ))}
          </LinearGradient>
        </Animated.View>

        {/* ═══ GLASS BOX 3: Your Progress ═══ */}
        <Animated.View entering={FadeInDown.duration(400).delay(500)}>
          <LinearGradient
            colors={SECTION.purple.gradient}
            start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }}
            style={[styles.glassBox, { borderColor: SECTION.purple.border }]}
          >
            <View style={styles.gxHead}>
              <View style={[styles.gxIcon, { backgroundColor: SECTION.purple.iconBg }]}>
                <Ionicons name="pulse-outline" size={16} color={SECTION.purple.accentLight} />
              </View>
              <Text style={styles.gxTitle}>Your Progress</Text>
            </View>
            {progress.map((item, i) => (
              <ProgressChip key={`prog-${i}`} item={item} />
            ))}
          </LinearGradient>
        </Animated.View>

        {/* ═══ Continue ═══ */}
        <Animated.View entering={FadeInDown.duration(400).delay(650)}>
          <TouchableOpacity onPress={handleContinue} activeOpacity={0.85}>
            <LinearGradient
              colors={colors.gradients.success}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.ctaBtn}
            >
              <Text style={styles.ctaText}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.text.primary} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scroll: {
    paddingHorizontal: spacing.lg - 4,
    paddingBottom: spacing.xl,
  },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerTag: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: colors.text.tertiary,
    marginBottom: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  headerCtx: {
    fontSize: 12,
    color: colors.text.disabled,
  },

  // Overall
  overall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.15)',
    marginBottom: spacing.md,
  },
  ovRing: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ovNum: {
    position: 'absolute',
    fontSize: 15,
    fontWeight: '800',
    color: colors.text.primary,
  },
  ovText: {
    flex: 1,
  },
  ovTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  ovDesc: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 1,
  },

  // Glass box
  glassBox: {
    borderRadius: 20,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: 14,
  },

  // Glass header
  gxHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  gxIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gxTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
    flex: 1,
  },
  gxCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  gxCountText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // Strength chip
  strChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 6,
    minHeight: 46,
  },
  strDot: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  strText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '500',
    color: '#E5E7EB',
    lineHeight: 17,
  },
  strTag: {
    backgroundColor: 'rgba(16,185,129,0.10)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  strTagText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: '#10B981',
    opacity: 0.8,
  },

  // Improvement chip
  impChip: {
    padding: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 6,
  },
  impTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  impArea: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },
  impPri: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  impPriText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  impSug: {
    fontSize: 12,
    color: colors.text.tertiary,
    lineHeight: 16,
  },
  impEx: {
    marginTop: 6,
    padding: 8,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 8,
  },
  impExWrong: {
    fontSize: 11,
    color: '#FCA5A5',
    textDecorationLine: 'line-through',
    opacity: 0.7,
    lineHeight: 16,
  },
  impExRight: {
    fontSize: 11,
    color: '#34D399',
    lineHeight: 16,
  },

  // Progress chip
  progChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 6,
    minHeight: 44,
  },
  progInfo: {
    flex: 1,
  },
  progName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  progBar: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 2,
    marginTop: 5,
    overflow: 'hidden',
  },
  progFill: {
    height: '100%',
    borderRadius: 2,
  },
  progRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progVals: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
  },
  progValBold: {
    color: colors.text.primary,
    fontWeight: '700',
  },
  progTrend: {
    width: 24,
    height: 24,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // CTA
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 6,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
  },
});
