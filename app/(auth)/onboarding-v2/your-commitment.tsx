/**
 * Your Commitment Screen
 * Step 4 of 5: Set timeline and define stakes
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { CometBackground } from '@/components/ui/CometBackground';
import { useOnboardingV2, TIMELINES } from '@/hooks/useOnboardingV2';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';

export default function YourCommitmentScreen() {
  const { data, updateData, nextStep, isStepComplete } = useOnboardingV2();
  const [selectedTimeline, setSelectedTimeline] = useState<string | null>(data.timeline);
  const [commitmentStakes, setCommitmentStakes] = useState<string>(data.commitment_stakes || '');

  const isValid = selectedTimeline && commitmentStakes.trim().length >= 20;

  const handleContinue = () => {
    if (isValid) {
      updateData({
        timeline: selectedTimeline,
        commitment_stakes: commitmentStakes.trim(),
      });
      nextStep();
      router.push('/(auth)/onboarding-v2/your-plan');
    }
  };

  const characterCount = commitmentStakes.trim().length;
  const isMinimumMet = characterCount >= 20;

  return (
    <CometBackground intensity="medium">
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.stepIndicator}>Step 4 of 5</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '80%' }]} />
              </View>
            </View>

            {/* Question 1: Timeline */}
            <View style={styles.sectionContainer}>
              <Text style={styles.question}>
                When do you want to{'\n'}achieve your goal?
              </Text>

              <View style={styles.timelinesContainer}>
                {TIMELINES.map((timeline) => (
                  <Pressable
                    key={timeline.id}
                    onPress={() => setSelectedTimeline(timeline.id)}
                    style={[
                      styles.timelineCard,
                      selectedTimeline === timeline.id && styles.timelineCardSelected,
                    ]}
                  >
                    {selectedTimeline === timeline.id && (
                      <LinearGradient
                        colors={colors.gradients.primary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                      />
                    )}
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineEmoji}>{timeline.emoji}</Text>
                      <View style={styles.timelineTextContainer}>
                        <Text style={[
                          styles.timelineLabel,
                          selectedTimeline === timeline.id && styles.timelineLabelSelected
                        ]}>
                          {timeline.label}
                        </Text>
                        <Text style={[
                          styles.timelineDescription,
                          selectedTimeline === timeline.id && styles.timelineDescriptionSelected
                        ]}>
                          {timeline.description}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Question 2: Stakes */}
            <View style={styles.sectionContainer}>
              <Text style={styles.question}>
                What happens if you{'\n'}
                <Text style={styles.emphasisText}>don't</Text> succeed?
              </Text>
              <Text style={styles.subtext}>
                This is where commitment begins. Be honest with yourself.
              </Text>

              <View style={[
                styles.stakesInputContainer,
                commitmentStakes.length > 0 && !isMinimumMet && styles.stakesInputContainerError,
                isMinimumMet && styles.stakesInputContainerSuccess,
              ]}>
                <TextInput
                  style={styles.stakesInput}
                  placeholder="Think about what's at stake..."
                  placeholderTextColor={colors.text.tertiary}
                  value={commitmentStakes}
                  onChangeText={setCommitmentStakes}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Character Count */}
              <View style={styles.characterCountContainer}>
                <Text style={[
                  styles.characterCount,
                  isMinimumMet && styles.characterCountSuccess
                ]}>
                  {characterCount} / 20 characters minimum
                </Text>
                {isMinimumMet && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>

              {/* Helper Text */}
              {commitmentStakes.length === 0 && (
                <View style={styles.helperContainer}>
                  <Text style={styles.helperTitle}>Why this matters:</Text>
                  <Text style={styles.helperText}>
                    • Research shows accountability increases success by 65%{'\n'}
                    • Knowing your "why" keeps you going when it gets hard{'\n'}
                    • This is for you. We're here to support your journey.
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Continue Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleContinue}
              disabled={!isValid}
              style={[
                styles.continueButton,
                !isValid && styles.continueButtonDisabled
              ]}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isValid ? colors.gradients.primary : ['#374151', '#374151']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.continueButtonGradient}
              >
                <Text style={[
                  styles.continueButtonText,
                  !isValid && styles.continueButtonTextDisabled
                ]}>
                  Continue
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </CometBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  stepIndicator: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: borderRadius.full,
  },
  sectionContainer: {
    marginBottom: spacing['2xl'],
  },
  question: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    lineHeight: 38,
    marginBottom: spacing.lg,
  },
  emphasisText: {
    color: colors.accent.pink,
  },
  subtext: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  timelinesContainer: {
    gap: spacing.md,
  },
  timelineCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.background.elevated,
    borderWidth: 2,
    borderColor: 'transparent',
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
    color: colors.text.primary,
  },
  timelineDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  timelineDescriptionSelected: {
    color: colors.text.secondary,
  },
  stakesInputContainer: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border.light,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  stakesInputContainerError: {
    borderColor: colors.error.DEFAULT,
  },
  stakesInputContainerSuccess: {
    borderColor: colors.success.DEFAULT,
  },
  stakesInput: {
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    minHeight: 120,
  },
  characterCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  characterCount: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  characterCountSuccess: {
    color: colors.success.DEFAULT,
  },
  checkmark: {
    fontSize: typography.fontSize.lg,
    color: colors.success.DEFAULT,
  },
  helperContainer: {
    backgroundColor: colors.background.elevated,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.DEFAULT,
  },
  helperTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  helperText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing.sm : spacing.lg,
    backgroundColor: colors.background.primary,
  },
  continueButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonGradient: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  continueButtonTextDisabled: {
    color: colors.text.disabled,
  },
});
