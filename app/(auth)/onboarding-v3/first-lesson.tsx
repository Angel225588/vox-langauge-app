/**
 * Screen 7: First Lesson (Magic Moment) — Placeholder
 * Shows a summary of collected data and previews what the lesson will be.
 * TODO: Replace with full AI-generated lesson.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { GlassBackground } from '@/components/ui/glass/GlassBackground';
import { GlassCard } from '@/components/ui/glass/GlassCard';
import { GlassButton } from '@/components/ui/glass/GlassButton';
import { GlassBadge } from '@/components/ui/glass/GlassBadge';
import { useOnboardingV3 } from '@/hooks/useOnboardingV3';
import { colors, spacing, typography, glass } from '@/constants/designSystem';

const LANG_DISPLAY: Record<string, string> = {
  english: 'English',
  french: 'French',
  spanish: 'Spanish',
};

export default function FirstLessonScreen() {
  const insets = useSafeAreaInsets();
  const data = useOnboardingV3();

  const langDisplay = LANG_DISPLAY[data.target_language || 'english'] || 'English';

  return (
    <GlassBackground intensity="medium">
      <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Lesson label */}
          <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.labelRow}>
            <Text style={styles.lessonLabel}>Your first lesson</Text>
            {data.scenarios[0] && (
              <GlassBadge label={data.scenarios[0]} selected accent size="sm" showCheck={false} />
            )}
          </Animated.View>

          {/* Lesson card */}
          <Animated.View entering={FadeInUp.duration(500).delay(300)}>
            <GlassCard variant="elevated" style={styles.lessonCard}>
              <View style={styles.lessonContent}>
                {/* Scenario title */}
                <Text style={styles.scenarioTitle}>
                  {data.scenarios[0] || 'Professional Communication'}
                </Text>

                {/* Profile summary */}
                <View style={styles.summarySection}>
                  <View style={styles.summaryRow}>
                    <Ionicons name="language-outline" size={16} color={colors.text.tertiary} />
                    <Text style={styles.summaryText}>Learning {langDisplay}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Ionicons name="briefcase-outline" size={16} color={colors.text.tertiary} />
                    <Text style={styles.summaryText}>{data.profession || 'Professional'}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Ionicons name="bar-chart-outline" size={16} color={colors.text.tertiary} />
                    <Text style={styles.summaryText}>
                      {data.proficiency_level?.replace('_', ' ') || 'Getting started'}
                    </Text>
                  </View>
                </View>

                {/* Placeholder lesson content */}
                <View style={styles.divider} />

                <Text style={styles.comingSoon}>
                  AI-generated lesson coming soon
                </Text>
                <Text style={styles.comingSoonSub}>
                  This screen will generate a personalized mini-lesson with vocabulary, dialogue, and a speaking exercise based on your profile.
                </Text>

                {/* Preview of what they selected */}
                {data.scenarios.length > 0 && (
                  <View style={styles.scenariosPreview}>
                    <Text style={styles.previewLabel}>Your scenarios:</Text>
                    <View style={styles.scenarioChips}>
                      {data.scenarios.map((s) => (
                        <GlassBadge key={s} label={s} selected accent size="sm" showCheck={false} />
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </GlassCard>
          </Animated.View>

          {/* Warm message */}
          <Animated.View entering={FadeInUp.duration(400).delay(600)}>
            <Text style={styles.warmMessage}>
              {data.first_name ? `${data.first_name}, your` : 'Your'} full path will include {data.scenarios.length} scenario{data.scenarios.length !== 1 ? 's' : ''} like this, built for your world.
            </Text>
          </Animated.View>
        </ScrollView>

        {/* CTAs */}
        <Animated.View
          entering={FadeInUp.duration(300).delay(800)}
          style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}
        >
          <GlassButton
            variant="primary"
            onPress={() => {
              router.push('/(auth)/onboarding-v3/creating-path');
            }}
          >
            Let's go
          </GlassButton>
          <GlassButton
            variant="ghost"
            size="md"
            onPress={() => router.push('/(auth)/onboarding-v3/signup')}
          >
            Create an account first
          </GlassButton>
        </Animated.View>
      </View>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  lessonLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
  },

  lessonCard: {
    marginBottom: spacing.xl,
  },
  lessonContent: {
    padding: spacing.xl,
  },
  scenarioTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },

  summarySection: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  summaryText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    textTransform: 'capitalize',
  },

  divider: {
    height: 1,
    backgroundColor: glass.border.subtle,
    marginVertical: spacing.lg,
  },

  comingSoon: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  comingSoonSub: {
    fontSize: typography.fontSize.sm,
    color: colors.text.disabled,
    textAlign: 'center',
    lineHeight: typography.fontSize.sm * 1.5,
    marginBottom: spacing.lg,
  },

  scenariosPreview: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  previewLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scenarioChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  warmMessage: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: typography.fontSize.base * 1.5,
  },

  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
});
