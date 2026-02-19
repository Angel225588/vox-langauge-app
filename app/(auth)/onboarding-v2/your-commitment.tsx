/**
 * Your Goals Screen (Onboarding V2 - Step 6)
 *
 * Captures the user's learning timeline/goal.
 * Simplified from old commitment screen — only timeline cards remain.
 * Practice time and days moved to Your Routine screen.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { CometBackground } from '@/components/ui/CometBackground';
import { BackButton } from '@/components/ui/BackButton';
import {
  useOnboardingV2,
  TIMELINES,
  flushOnboardingState,
  shouldShowProfession,
  getOnboardingDots,
  getScreenStep,
} from '@/hooks/useOnboardingV2';
import { colors, spacing, borderRadius, shadows, typography } from '@/constants/designSystem';

export default function YourCommitmentScreen() {
  const { data, updateData, nextStep } = useOnboardingV2();
  const { t } = useTranslation('onboarding');
  const [selectedTimeline, setSelectedTimeline] = useState<string | null>(data.timeline);

  const showProfession = shouldShowProfession(data.motivations);
  const dots = getOnboardingDots(showProfession);
  const currentStep = getScreenStep('your-commitment', showProfession);

  const isValid = !!selectedTimeline;

  const handleTimelineSelect = (timelineId: string) => {
    setSelectedTimeline(timelineId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleContinue = async () => {
    if (isValid) {
      updateData({ timeline: selectedTimeline });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      nextStep();
      await flushOnboardingState();
      router.push('/(auth)/onboarding-v2/your-routine');
    }
  };

  return (
    <CometBackground intensity="medium">
      <View style={styles.container}>
        {/* Back Button */}
        <Animated.View entering={FadeInDown.duration(200)} style={styles.backButtonContainer}>
          <BackButton onPress={() => router.back()} />
        </Animated.View>

        {/* Header */}
        <Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
          <Text style={styles.title}>{t('your_commitment.goal_question')}</Text>
          <Text style={styles.subtitle}>{t('your_commitment.subtitle')}</Text>
        </Animated.View>

        {/* Timeline Options */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollAreaContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.timelinesContainer}>
            {TIMELINES.map((timeline, index) => {
              const isSelected = selectedTimeline === timeline.id;

              return (
                <Animated.View
                  key={timeline.id}
                  entering={FadeInDown.duration(200).delay(100 + index * 50)}
                >
                  <TouchableOpacity
                    onPress={() => handleTimelineSelect(timeline.id)}
                    style={[
                      styles.timelineCard,
                      isSelected && styles.timelineCardSelected,
                    ]}
                    activeOpacity={0.8}
                  >
                    {isSelected && (
                      <LinearGradient
                        colors={['rgba(0, 54, 255, 0.15)', 'rgba(0, 163, 255, 0.1)']}
                        style={StyleSheet.absoluteFill}
                      />
                    )}
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineEmoji}>{timeline.emoji}</Text>
                      <View style={styles.timelineTextContainer}>
                        <Text style={[
                          styles.timelineLabel,
                          isSelected && styles.timelineLabelSelected
                        ]}>
                          {timeline.label}
                        </Text>
                        <Text style={[
                          styles.timelineDescription,
                          isSelected && styles.timelineDescriptionSelected
                        ]}>
                          {timeline.description}
                        </Text>
                      </View>
                      {isSelected && (
                        <View style={styles.checkBadge}>
                          <Text style={styles.checkBadgeText}>✓</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </ScrollView>

        {/* Fixed Bottom Section */}
        <View style={styles.footer}>
          {/* Progress Dots */}
          <Animated.View entering={FadeInUp.duration(300).delay(300)} style={styles.progressContainer}>
            <View style={styles.dotsContainer}>
              {dots.map((step) => (
                <View
                  key={step}
                  style={[
                    styles.dot,
                    step === currentStep && styles.dotActive,
                    step < currentStep && styles.dotCompleted,
                  ]}
                />
              ))}
            </View>
          </Animated.View>

          {/* Continue Button */}
          <Animated.View entering={FadeInUp.duration(300).delay(350)}>
            <TouchableOpacity
              onPress={handleContinue}
              disabled={!isValid}
              style={[styles.continueButton, !isValid && styles.continueButtonDisabled]}
              activeOpacity={0.8}
            >
              {isValid ? (
                <LinearGradient
                  colors={colors.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.continueButtonGradient}
                >
                  <Text style={styles.continueButtonText}>{t('your_commitment.continue')}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.buttonDisabled}>
                  <Text style={styles.continueButtonTextDisabled}>{t('your_commitment.select_timeline')}</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </CometBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['3xl'],
  },
  backButtonContainer: {
    marginBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.base * 1.5,
  },
  scrollArea: {
    flex: 1,
  },
  scrollAreaContent: {
    paddingBottom: spacing.lg,
  },
  timelinesContainer: {
    gap: spacing.md,
  },
  timelineCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.background.card,
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  timelineCardSelected: {
    borderColor: colors.primary.DEFAULT,
  },
  timelineContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  timelineEmoji: {
    fontSize: 28,
  },
  timelineTextContainer: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  timelineLabelSelected: {
    color: colors.primary.light,
  },
  timelineDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  timelineDescriptionSelected: {
    color: colors.text.secondary,
  },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadgeText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },

  // Footer
  footer: {
    paddingVertical: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing['2xl'] : spacing.lg,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.background.elevated,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary.DEFAULT,
  },
  dotCompleted: {
    backgroundColor: colors.primary.light,
  },
  continueButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  continueButtonDisabled: {
    opacity: 1,
  },
  continueButtonGradient: {
    paddingVertical: spacing.md + spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.background.elevated,
    paddingVertical: spacing.md + spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  continueButtonTextDisabled: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.disabled,
  },
});
