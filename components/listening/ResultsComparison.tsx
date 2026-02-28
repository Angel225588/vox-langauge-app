/**
 * ResultsComparison v2 — Redesigned results screen
 *
 * Score comparison card with improvement bar,
 * session summary (words, points, time, streak),
 * motivational message, and action buttons.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LISTENING } from './theme';

interface ResultsComparisonProps {
  beforeScore: number;
  afterScore: number;
  totalQuestions: number;
  points: number;
  wordsLearned?: number;
  timeSpent?: number;
  streak?: number;
  lessonTitle?: string;
  onNewExercise: () => void;
  onContinue: () => void;
  continueLabel: string;
}

function getResultMessage(before: number, after: number, total: number): string {
  const delta = after - before;
  const pctAfter = after / total;
  const pctBefore = before / total;

  if (pctAfter === 1 && pctBefore === 1) return 'Mastery from the start.';
  if (pctAfter === 1) return `From ${before} to ${after} — perfect.`;
  if (delta > total * 0.5) return `From ${before} to ${after} — real improvement.`;
  if (delta > 0) return `From ${before} to ${after} — getting sharper.`;
  if (delta === 0 && pctAfter >= 0.5) return 'Solid and consistent.';
  return 'Your ear is adapting. Keep going.';
}

function getSubMessage(before: number, after: number, total: number): string {
  const delta = after - before;
  if (delta > 0) {
    return 'The scaffolding loop is working. Your ear is adapting to the rhythm and vocabulary.';
  }
  if (delta === 0 && after === total) {
    return 'You nailed every question both times. Strong comprehension.';
  }
  if (delta === 0) {
    return 'Consistency is progress. Try replaying at slower speed next time.';
  }
  return 'Comprehension builds with repetition. Each listen strengthens your ear.';
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export default function ResultsComparison({
  beforeScore,
  afterScore,
  totalQuestions,
  points,
  wordsLearned = 0,
  timeSpent = 0,
  streak = 0,
  lessonTitle,
  onNewExercise,
  onContinue,
  continueLabel,
}: ResultsComparisonProps) {
  const delta = afterScore - beforeScore;
  const pctBefore = totalQuestions > 0 ? Math.round((beforeScore / totalQuestions) * 100) : 0;
  const pctAfter = totalQuestions > 0 ? Math.round((afterScore / totalQuestions) * 100) : 0;

  return (
    <Animated.View
      entering={FadeIn.duration(500)}
      style={styles.container}
    >
      {/* ═══ Celebration Header ═══ */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(400)}
        style={styles.header}
      >
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark-circle-outline" size={28} color={LISTENING.teal} />
        </View>
        <Text style={styles.title}>Listening Complete</Text>
        {lessonTitle && <Text style={styles.subtitle}>{lessonTitle}</Text>}
      </Animated.View>

      {/* ═══ Score Comparison Card ═══ */}
      <Animated.View
        entering={FadeInDown.delay(250).duration(400)}
        style={styles.scoreCard}
      >
        <Text style={styles.scoreCardTitle}>COMPREHENSION</Text>

        <View style={styles.scoreRow}>
          {/* Before */}
          <View style={styles.scoreBlock}>
            <Text style={styles.scoreLabel}>BEFORE</Text>
            <View style={styles.ringBefore}>
              <Text style={styles.ringNumBefore}>{beforeScore}</Text>
              <Text style={styles.ringDenom}>of {totalQuestions}</Text>
              <Text style={styles.ringPctBefore}>{pctBefore}%</Text>
            </View>
          </View>

          {/* Arrow + Delta */}
          <View style={styles.arrowBlock}>
            <Text style={styles.arrowIcon}>→</Text>
            <View
              style={[
                styles.deltaPill,
                delta === 0 && styles.deltaPillNeutral,
                delta < 0 && styles.deltaPillNeutral,
              ]}
            >
              <Text
                style={[
                  styles.deltaText,
                  delta === 0 && styles.deltaTextNeutral,
                  delta < 0 && styles.deltaTextNeutral,
                ]}
              >
                {delta > 0 ? `+${delta}` : delta === 0 ? '=' : `${delta}`}
              </Text>
            </View>
          </View>

          {/* After */}
          <View style={styles.scoreBlock}>
            <Text style={styles.scoreLabel}>AFTER</Text>
            <View style={styles.ringAfter}>
              <Text style={styles.ringNumAfter}>{afterScore}</Text>
              <Text style={styles.ringDenom}>of {totalQuestions}</Text>
              <Text style={styles.ringPctAfter}>{pctAfter}%</Text>
            </View>
          </View>
        </View>

        {/* Improvement bar */}
        <View style={styles.barSection}>
          <View style={styles.barHeader}>
            <Text style={styles.barLabel}>Improvement</Text>
            <Text style={styles.barValue}>{pctBefore}% → {pctAfter}%</Text>
          </View>
          <View style={styles.barTrack}>
            <View style={[styles.barBefore, { width: `${pctBefore}%` }]} />
            <View style={[styles.barAfter, { width: `${pctAfter}%` }]} />
          </View>
        </View>
      </Animated.View>

      {/* ═══ Session Summary Card ═══ */}
      <Animated.View
        entering={FadeInDown.delay(400).duration(400)}
        style={styles.summaryCard}
      >
        {wordsLearned > 0 && (
          <View style={styles.summaryRow}>
            <View style={styles.summaryLeft}>
              <View style={[styles.summaryIcon, styles.summaryIconWords]}>
                <Ionicons name="book-outline" size={18} color={LISTENING.teal} />
              </View>
              <Text style={styles.summaryText}>Words learned</Text>
            </View>
            <Text style={[styles.summaryValue, styles.summaryValueWords]}>
              {wordsLearned} new
            </Text>
          </View>
        )}

        <View style={[styles.summaryRow, wordsLearned > 0 && styles.summaryRowBorder]}>
          <View style={styles.summaryLeft}>
            <View style={[styles.summaryIcon, styles.summaryIconPoints]}>
              <Ionicons name="star-outline" size={18} color="#3D6BFF" />
            </View>
            <Text style={styles.summaryText}>Points earned</Text>
          </View>
          <Text style={[styles.summaryValue, styles.summaryValuePoints]}>
            +{points}
          </Text>
        </View>

        {timeSpent > 0 && (
          <View style={[styles.summaryRow, styles.summaryRowBorder]}>
            <View style={styles.summaryLeft}>
              <View style={[styles.summaryIcon, styles.summaryIconTime]}>
                <Ionicons name="time-outline" size={18} color="#A78BFA" />
              </View>
              <Text style={styles.summaryText}>Time spent</Text>
            </View>
            <Text style={[styles.summaryValue, styles.summaryValueTime]}>
              {formatTime(timeSpent)}
            </Text>
          </View>
        )}

        {streak > 0 && (
          <View style={[styles.summaryRow, styles.summaryRowBorder]}>
            <View style={styles.summaryLeft}>
              <View style={[styles.summaryIcon, styles.summaryIconStreak]}>
                <Ionicons name="flame-outline" size={18} color="#FBBF24" />
              </View>
              <Text style={styles.summaryText}>Day streak</Text>
            </View>
            <Text style={[styles.summaryValue, styles.summaryValueStreak]}>
              {streak} day{streak !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </Animated.View>

      {/* ═══ Message ═══ */}
      <Animated.View
        entering={FadeInDown.delay(550).duration(300)}
        style={styles.messageContainer}
      >
        <Text style={styles.messageMain}>
          {getResultMessage(beforeScore, afterScore, totalQuestions)}
        </Text>
        <Text style={styles.messageSub}>
          {getSubMessage(beforeScore, afterScore, totalQuestions)}
        </Text>
      </Animated.View>

      {/* ═══ Action Buttons ═══ */}
      <Animated.View
        entering={FadeInDown.delay(700).duration(300)}
        style={styles.buttons}
      >
        <TouchableOpacity onPress={onNewExercise} activeOpacity={0.8}>
          <LinearGradient
            colors={LISTENING.tealGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryBtn}
          >
            <Ionicons name="refresh" size={18} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>New Exercise</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onContinue}
          style={styles.secondaryBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryBtnText}>{continueLabel}</Text>
          <Ionicons name="arrow-forward" size={16} color={LISTENING.textSecondary} />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LISTENING.bg,
    paddingHorizontal: 20,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(6, 214, 160, 0.10)',
    borderWidth: 1.5,
    borderColor: 'rgba(6, 214, 160, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: LISTENING.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: LISTENING.textTertiary,
  },

  // Score Card
  scoreCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
  },
  scoreCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: LISTENING.textDisabled,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  scoreBlock: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: LISTENING.textDisabled,
  },

  // Rings
  ringBefore: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringAfter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2.5,
    borderColor: LISTENING.teal,
    backgroundColor: 'rgba(6, 214, 160, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: LISTENING.tealGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  ringNumBefore: {
    fontSize: 30,
    fontWeight: '800',
    color: LISTENING.textDisabled,
    letterSpacing: -0.5,
  },
  ringNumAfter: {
    fontSize: 30,
    fontWeight: '800',
    color: LISTENING.teal,
    letterSpacing: -0.5,
  },
  ringDenom: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: -2,
  },
  ringPctBefore: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
    marginTop: 2,
  },
  ringPctAfter: {
    fontSize: 11,
    fontWeight: '700',
    color: LISTENING.teal,
    marginTop: 2,
  },

  // Arrow + Delta
  arrowBlock: {
    alignItems: 'center',
    gap: 4,
  },
  arrowIcon: {
    color: 'rgba(255, 255, 255, 0.15)',
    fontSize: 18,
  },
  deltaPill: {
    backgroundColor: 'rgba(6, 214, 160, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(6, 214, 160, 0.25)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  deltaPillNeutral: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  deltaText: {
    fontSize: 14,
    fontWeight: '800',
    color: LISTENING.teal,
  },
  deltaTextNeutral: {
    color: LISTENING.textTertiary,
  },

  // Improvement bar
  barSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 12,
  },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: LISTENING.textTertiary,
  },
  barValue: {
    fontSize: 12,
    fontWeight: '700',
    color: LISTENING.teal,
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  barBefore: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 3,
  },
  barAfter: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: LISTENING.teal,
    borderRadius: 3,
    zIndex: 1,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 4,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  summaryRowBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIconWords: { backgroundColor: 'rgba(6, 214, 160, 0.10)' },
  summaryIconPoints: { backgroundColor: 'rgba(0, 54, 255, 0.10)' },
  summaryIconTime: { backgroundColor: 'rgba(139, 92, 246, 0.10)' },
  summaryIconStreak: { backgroundColor: 'rgba(245, 158, 11, 0.10)' },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: LISTENING.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  summaryValueWords: { color: LISTENING.teal },
  summaryValuePoints: { color: '#3D6BFF' },
  summaryValueTime: { color: '#A78BFA' },
  summaryValueStreak: { color: '#FBBF24' },

  // Message
  messageContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  messageMain: {
    fontSize: 17,
    fontWeight: '700',
    color: LISTENING.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 22,
  },
  messageSub: {
    fontSize: 13,
    fontWeight: '500',
    color: LISTENING.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Buttons
  buttons: {
    gap: 10,
    marginTop: 'auto',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 16,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: LISTENING.textSecondary,
  },
});
