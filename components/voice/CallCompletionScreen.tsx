/**
 * Call Completion Screen — Professional celebration after voice practice
 *
 * From verified design:
 * - Subtle gold/blue confetti (not cartoon)
 * - "Tour Guiding Complete" (no exclamation, no "mastered" for <90%)
 * - Stats row: objectives/points/duration
 * - CTAs: "Continue Practicing" + "Back to scenarios"
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, borderRadius } from '@/constants/designSystem';
import { fonts } from '@/constants/fonts';

interface CallCompletionScreenProps {
  scenarioTitle: string;
  objectivesCompleted: number;
  objectivesTotal: number;
  pointsEarned: number;
  callDuration: number; // seconds
  overallScore: number;
  onContinuePracticing: () => void;
  onBackToScenarios: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function CallCompletionScreen({
  scenarioTitle,
  objectivesCompleted,
  objectivesTotal,
  pointsEarned,
  callDuration,
  overallScore,
  onContinuePracticing,
  onBackToScenarios,
}: CallCompletionScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, damping: 15, stiffness: 120, useNativeDriver: true }),
    ]).start();
  }, []);

  // Dynamic copy based on score (from verification: "completed" for <90%, "mastered" for 90+)
  const completionLabel = overallScore >= 90
    ? `You've mastered this scenario`
    : `You've completed this scenario`;

  return (
    <LinearGradient
      colors={['#0A0E1A', '#0D1B2A', '#101D30']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          {/* Checkmark icon */}
          <Animated.View style={[styles.iconSection, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.checkCircle}>
              <Ionicons name="checkmark" size={40} color="#FFFFFF" />
            </View>
          </Animated.View>

          {/* Title — no exclamation mark (professional tone) */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.title}>{scenarioTitle} Complete</Text>
            <Text style={styles.subtitle}>{completionLabel}</Text>
          </Animated.View>

          {/* Stats row */}
          <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{objectivesCompleted}/{objectivesTotal}</Text>
              <Text style={styles.statLabel}>objectives</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>+{pointsEarned}</Text>
              <Text style={styles.statLabel}>pts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatDuration(callDuration)}</Text>
              <Text style={styles.statLabel}>call</Text>
            </View>
          </Animated.View>
        </View>

        {/* CTAs */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={onContinuePracticing}
            activeOpacity={0.8}
          >
            <Text style={styles.continueText}>Continue Practicing</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backLink}
            onPress={onBackToScenarios}
          >
            <Text style={styles.backLinkText}>Back to scenarios</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },

  // Icon
  iconSection: {
    marginBottom: spacing.xl,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 10,
  },

  // Text
  title: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: fonts.display.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.body.regular,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontFamily: fonts.display.bold,
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: fonts.body.regular,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // Footer
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  continueButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
  },
  continueText: {
    fontSize: typography.fontSize.lg,
    fontFamily: fonts.display.bold,
    color: '#FFFFFF',
  },
  backLink: {
    paddingVertical: spacing.sm,
  },
  backLinkText: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.body.medium,
    color: colors.text.tertiary,
  },
});
