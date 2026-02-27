/**
 * Screen 7: First Lesson (Magic Moment) — Discovery Lesson Preview
 * Shows a dynamic activity overview based on the user's proficiency level.
 * The activity list mirrors what the lesson engine will generate.
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
import { getLevelGroup, getLessonTemplate, getActivityColor } from '@/lib/lesson';
import { colors, spacing, typography, glass, borderRadius } from '@/constants/designSystem';

const LANG_DISPLAY: Record<string, string> = {
  english: 'English',
  french: 'French',
  spanish: 'Spanish',
};

export default function FirstLessonScreen() {
  const insets = useSafeAreaInsets();
  const data = useOnboardingV3();

  const langDisplay = LANG_DISPLAY[data.target_language || 'english'] || 'English';

  // Get the lesson template matching the user's proficiency
  const levelGroup = getLevelGroup(data.proficiency_level || null);
  const template = getLessonTemplate(levelGroup, true);

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

                <View style={styles.divider} />

                {/* Discovery session header with duration */}
                <View style={styles.discoveryHeader}>
                  <Text style={styles.discoveryTitle}>Your discovery session</Text>
                  <View style={styles.durationBadge}>
                    <Ionicons name="time-outline" size={12} color={colors.text.primary} />
                    <Text style={styles.durationText}>~{template.estimated_minutes} min</Text>
                  </View>
                </View>

                {/* Activity timeline */}
                <View style={styles.timeline}>
                  {template.activities.map((activity, index) => {
                    const activityColor = getActivityColor(activity.type);
                    const isLast = index === template.activities.length - 1;
                    const minutes = Math.ceil(activity.estimated_seconds / 60);

                    return (
                      <View key={activity.type + index} style={styles.timelineStep}>
                        {/* Connector line (not on last item) */}
                        {!isLast && (
                          <View style={styles.connectorLine} />
                        )}

                        {/* Icon circle */}
                        <View style={[styles.activityIcon, { backgroundColor: activityColor }]}>
                          <Ionicons
                            name={activity.icon as any}
                            size={18}
                            color="#FFFFFF"
                          />
                        </View>

                        {/* Text content */}
                        <View style={styles.activityTextContainer}>
                          <View style={styles.activityTitleRow}>
                            <Text style={styles.activityTitle}>{activity.title}</Text>
                            <Text style={styles.activityDuration}>{minutes} min</Text>
                          </View>
                          <Text style={styles.activityDescription}>{activity.description}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>

                {/* Scenario chips */}
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

  // Discovery session header
  discoveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  discoveryTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  durationText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },

  // Activity timeline
  timeline: {
    gap: 0,
    marginBottom: spacing.lg,
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingBottom: spacing.lg,
    position: 'relative' as const,
  },
  connectorLine: {
    position: 'absolute' as const,
    left: 18,
    top: 36,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  activityTextContainer: {
    flex: 1,
    paddingTop: 2,
  },
  activityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  activityTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  activityDuration: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
  },
  activityDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.xs * 1.4,
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
