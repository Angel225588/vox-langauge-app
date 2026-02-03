/**
 * Your Stakes Screen (Onboarding V2 - Step 5 of 6)
 *
 * Captures user's vision of success: "What's waiting for you on the other side?"
 * Positive framing to create emotional investment without fear.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { CometBackground } from '@/components/ui/CometBackground';
import { BackButton } from '@/components/ui/BackButton';
import { useOnboardingV2, STAKES_OPTIONS } from '@/hooks/useOnboardingV2';
import { colors, spacing, borderRadius, shadows, typography } from '@/constants/designSystem';

export default function YourStakesScreen() {
  const router = useRouter();
  const { data, updateData, nextStep } = useOnboardingV2();

  const [selectedStake, setSelectedStake] = useState<string | null>(data.stakes);

  const handleStakeSelect = (stakeId: string) => {
    setSelectedStake(stakeId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleContinue = () => {
    if (selectedStake) {
      updateData({ stakes: selectedStake });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      nextStep();
      router.push('/(auth)/onboarding-v2/ready');
    }
  };

  const canContinue = !!selectedStake;

  return (
    <CometBackground intensity="medium">
      <View style={styles.container}>
        {/* Back Button */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={styles.backButtonContainer}
        >
          <BackButton onPress={() => router.back()} />
        </Animated.View>

        {/* Header */}
        <Animated.View
          entering={FadeInDown.duration(600).springify()}
          style={styles.header}
        >
          <Text style={styles.title}>What's waiting for you</Text>
          <Text style={styles.titleHighlight}>on the other side?</Text>
          <Text style={styles.subtitle}>
            Visualize your success. This helps us personalize your journey.
          </Text>
        </Animated.View>

        {/* Stakes Options */}
        <View style={styles.optionsContainer}>
          {STAKES_OPTIONS.map((stake, index) => {
            const isSelected = selectedStake === stake.id;

            return (
              <Animated.View
                key={stake.id}
                entering={FadeInDown.duration(400).delay(200 + index * 100).springify()}
              >
                <TouchableOpacity
                  style={[
                    styles.stakeCard,
                    isSelected && styles.stakeCardSelected,
                  ]}
                  onPress={() => handleStakeSelect(stake.id)}
                  activeOpacity={0.8}
                >
                  {isSelected && (
                    <LinearGradient
                      colors={['rgba(99, 102, 241, 0.15)', 'rgba(139, 92, 246, 0.1)']}
                      style={StyleSheet.absoluteFill}
                    />
                  )}

                  <View style={styles.stakeCardContent}>
                    <Text style={styles.stakeEmoji}>{stake.emoji}</Text>
                    <View style={styles.stakeTextContainer}>
                      <Text
                        style={[
                          styles.stakeLabel,
                          isSelected && styles.stakeLabelSelected,
                        ]}
                      >
                        {stake.label}
                      </Text>
                      <Text style={styles.stakeSubtext}>
                        {stake.subtext}
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

        {/* Fixed Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Progress Indicator - Dots */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(600).springify()}
            style={styles.progressContainer}
          >
            <View style={styles.dotsContainer}>
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <View
                  key={step}
                  style={[
                    styles.dot,
                    step === 5 && styles.dotActive,
                    step < 5 && styles.dotCompleted,
                  ]}
                />
              ))}
            </View>
          </Animated.View>

          {/* Continue Button */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(700).springify()}
            style={styles.buttonContainer}
          >
            <TouchableOpacity
              style={[styles.continueButton, !canContinue && styles.continueButtonDisabled]}
              onPress={handleContinue}
              disabled={!canContinue}
              activeOpacity={0.8}
            >
              {canContinue ? (
                <LinearGradient
                  colors={colors.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.continueButtonText}>Continue</Text>
                </LinearGradient>
              ) : (
                <View style={styles.buttonDisabled}>
                  <Text style={styles.continueButtonTextDisabled}>Select your vision</Text>
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
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  titleHighlight: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.light,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.base * 1.5,
  },
  optionsContainer: {
    flex: 1,
    gap: spacing.md,
  },
  stakeCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border.light,
    overflow: 'hidden',
  },
  stakeCardSelected: {
    borderColor: colors.primary.DEFAULT,
  },
  stakeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  stakeEmoji: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  stakeTextContainer: {
    flex: 1,
  },
  stakeLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  stakeLabelSelected: {
    color: colors.primary.light,
  },
  stakeSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    lineHeight: typography.fontSize.sm * 1.4,
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
  bottomSection: {
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
  buttonContainer: {
    width: '100%',
  },
  continueButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  continueButtonDisabled: {
    opacity: 1,
  },
  buttonGradient: {
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
