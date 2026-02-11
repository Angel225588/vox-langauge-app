/**
 * Your Scenarios Screen (Onboarding V2 - Step 5 of 6)
 *
 * Shows profession-filtered scenarios for the user to pick their top 2.
 * Replaces the old "Your Stakes" screen with actionable real-world situations.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { CometBackground } from '@/components/ui/CometBackground';
import { BackButton } from '@/components/ui/BackButton';
import { useOnboardingV2, SCENARIOS_BY_CONTEXT, flushOnboardingState } from '@/hooks/useOnboardingV2';
import { useTranslation } from 'react-i18next';
import { colors, spacing, borderRadius, shadows, typography } from '@/constants/designSystem';

export default function YourScenariosScreen() {
  const router = useRouter();
  const { t } = useTranslation('onboarding');
  const { data, updateData, nextStep } = useOnboardingV2();

  // Get scenarios based on user's profession
  const profession = data.profession || 'default';
  const scenarioOptions = SCENARIOS_BY_CONTEXT[profession] || SCENARIOS_BY_CONTEXT['default'];

  const [selectedScenarios, setSelectedScenarios] = useState<string[]>(data.scenarios || []);

  const handleScenarioToggle = (scenarioId: string) => {
    setSelectedScenarios(prev => {
      if (prev.includes(scenarioId)) {
        return prev.filter(id => id !== scenarioId);
      }
      if (prev.length >= 2) {
        // Replace the first selected with the new one
        return [prev[1], scenarioId];
      }
      return [...prev, scenarioId];
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleContinue = async () => {
    if (selectedScenarios.length > 0) {
      updateData({ scenarios: selectedScenarios, stakes: selectedScenarios[0] }); // Keep stakes for backwards compat
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      nextStep();
      await flushOnboardingState();
      router.push('/(auth)/onboarding-v2/ready');
    }
  };

  const canContinue = selectedScenarios.length > 0;

  return (
    <CometBackground intensity="medium">
      <View style={styles.container}>
        {/* Back Button */}
        <Animated.View
          entering={FadeInDown.duration(200)}
          style={styles.backButtonContainer}
        >
          <BackButton onPress={() => router.back()} />
        </Animated.View>

        {/* Header */}
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={styles.header}
        >
          <Text style={styles.title}>{t('your_scenarios.title')}</Text>
          <Text style={styles.titleHighlight}>{t('your_scenarios.title_highlight')}</Text>
          <Text style={styles.subtitle}>
            {t('your_scenarios.subtitle')}
          </Text>
        </Animated.View>

        {/* Scenarios Options - Scrollable */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollAreaContent}
          showsVerticalScrollIndicator={false}
        >
          {scenarioOptions.map((scenario, index) => {
            const isSelected = selectedScenarios.includes(scenario.id);

            return (
              <Animated.View
                key={scenario.id}
                entering={FadeInDown.duration(200).delay(100 + index * 50)}
              >
                <TouchableOpacity
                  style={[
                    styles.stakeCard,
                    isSelected && styles.stakeCardSelected,
                  ]}
                  onPress={() => handleScenarioToggle(scenario.id)}
                  activeOpacity={0.8}
                >
                  {isSelected && (
                    <LinearGradient
                      colors={['rgba(0, 54, 255, 0.15)', 'rgba(0, 163, 255, 0.1)']}
                      style={StyleSheet.absoluteFill}
                    />
                  )}

                  <View style={styles.stakeCardContent}>
                    <Text style={styles.stakeEmoji}>{scenario.icon}</Text>
                    <View style={styles.stakeTextContainer}>
                      <Text
                        style={[
                          styles.stakeLabel,
                          isSelected && styles.stakeLabelSelected,
                        ]}
                      >
                        {scenario.label}
                      </Text>
                      <Text style={styles.stakeSubtext}>
                        {scenario.description}
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

          {/* Selection hint */}
          <Text style={styles.selectionHint}>
            {t('your_scenarios.pick_hint', { count: selectedScenarios.length })}
          </Text>
        </ScrollView>

        {/* Fixed Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Progress Indicator - Dots */}
          <Animated.View
            entering={FadeInUp.duration(300).delay(300)}
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
            entering={FadeInUp.duration(300).delay(350)}
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
                  <Text style={styles.continueButtonText}>{t('your_scenarios.continue')}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.buttonDisabled}>
                  <Text style={styles.continueButtonTextDisabled}>{t('your_scenarios.select_scenarios')}</Text>
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
  scrollArea: {
    flex: 1,
  },
  scrollAreaContent: {
    gap: spacing.md,
    paddingBottom: spacing.md,
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
  selectionHint: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.sm,
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
