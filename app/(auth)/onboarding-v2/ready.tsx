/**
 * Onboarding V2 - Ready/Summary Screen
 * Final step showing user's choices and creating personalized path
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated as RNAnimated, ScrollView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { CometBackground } from '@/components/ui/CometBackground';
import { BackButton } from '@/components/ui/BackButton';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/designSystem';
import {
  useOnboardingV2,
  TARGET_LANGUAGES,
  MOTIVATIONS,
  PROFICIENCY_LEVELS,
  TIMELINES,
  PROFESSIONS,
  shouldShowProfession,
  getOnboardingDots,
  getScreenStep,
  type OnboardingV2Data,
} from '@/hooks/useOnboardingV2';
import { createPersonalizedPath } from '@/lib/services/pathGeneration';
import { supabase } from '@/lib/db/supabase';
import { storeUserLevel } from '@/lib/utils/levelGating';

/**
 * Returns the route for the first incomplete onboarding screen,
 * or null if all required fields are present.
 */
function getFirstIncompleteScreen(data: OnboardingV2Data): string | null {
  if (!data.native_language || !data.target_language || !data.target_accent) {
    return '/(auth)/onboarding-v2/languages';
  }
  if (!data.motivation && !data.motivation_custom && (!data.motivations || data.motivations.length === 0)) {
    return '/(auth)/onboarding-v2/your-why';
  }
  // Profession is conditional — only check if it should show
  if (shouldShowProfession(data.motivations) && !data.profession) {
    return '/(auth)/onboarding-v2/your-profession';
  }
  if (!data.proficiency_level) {
    return '/(auth)/onboarding-v2/your-level';
  }
  // Why Now is optional — skip check
  if (!data.timeline) {
    return '/(auth)/onboarding-v2/your-commitment';
  }
  // Routine is optional — skip check
  if (!data.stakes && (!data.scenarios || data.scenarios.length === 0)) {
    return '/(auth)/onboarding-v2/your-stakes';
  }
  return null;
}

export default function ReadyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, reset } = useOnboardingV2();
  const { t } = useTranslation('onboarding');
  const [isBuilding, setIsBuilding] = useState(false);
  const [progress, setProgress] = useState(0);
  const hasRedirected = useRef(false);

  // Guard: redirect to the first incomplete screen if required data is missing
  // Skip this guard when path generation is in progress or completed (reset() clears
  // data which would otherwise cause a false redirect back to onboarding).
  useEffect(() => {
    if (hasRedirected.current) return;
    if (isBuilding || pathGenerationStarted.current) return;
    const incompleteRoute = getFirstIncompleteScreen(data);
    if (incompleteRoute) {
      hasRedirected.current = true;
      console.warn('[ReadyScreen] Missing onboarding data, redirecting to:', incompleteRoute);
      router.replace(incompleteRoute);
    }
  }, [data, isBuilding]);

  // Dynamic progress dots
  const showProfession = shouldShowProfession(data.motivations);
  const dots = getOnboardingDots(showProfession);
  const currentStep = getScreenStep('ready', showProfession);

  // Get display values from store data
  const targetLang = TARGET_LANGUAGES.find(l => l.code === data.target_language);
  const level = PROFICIENCY_LEVELS.find(l => l.id === data.proficiency_level);
  const timeline = TIMELINES.find(t => t.id === data.timeline);

  // Build motivation display — handle multi-select
  const motivationLabels = (data.motivations || [])
    .map(id => MOTIVATIONS.find(m => m.id === id)?.label)
    .filter(Boolean);
  const motivationDisplay = motivationLabels.length > 0
    ? motivationLabels.join(', ')
    : data.motivation_custom || data.motivation || 'Not set';

  const userData = {
    target_language: targetLang ? `${targetLang.flag} ${targetLang.label}` : data.target_language || 'Not set',
    motivation: motivationDisplay,
    proficiency_level: level ? level.label : data.proficiency_level || 'Not set',
    timeline: timeline ? timeline.label : data.timeline || 'Not set',
  };

  const [buildingStatus, setBuildingStatus] = useState<string>('');
  const pathGenerationStarted = useRef(false);

  // Handle path generation when isBuilding is true
  useEffect(() => {
    if (isBuilding && !pathGenerationStarted.current) {
      pathGenerationStarted.current = true;
      generatePath();
    }
  }, [isBuilding]);

  const generatePath = async () => {
    try {
      // Step 1: Get current user
      setBuildingStatus(t('ready.loading.preparing'));
      setProgress(10);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // PRODUCTION WARNING: No authenticated user detected
        // This should only happen during development/testing
        console.warn('[PathGeneration] ⚠️ DEMO MODE: No authenticated user found');
        console.warn('[PathGeneration] ⚠️ In production, users must be authenticated before path generation');

        if (__DEV__ === false) {
          // In production, throw error instead of using demo mode
          throw new Error('Authentication required. Please log in to create your learning path.');
        }
      }

      // Generate a proper UUID for demo mode (database requires UUID format)
      // WARNING: This is for development/testing only
      const generateDemoUUID = () => {
        console.warn('[PathGeneration] ⚠️ Generating demo UUID - not for production use');
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      };

      const userId = user?.id || generateDemoUUID();

      // Step 2: Call AI to generate path
      setBuildingStatus(t('ready.loading.ai_crafting'));
      setProgress(30);

      const result = await createPersonalizedPath(userId, data);

      if (!result.success) {
        throw new Error(result.error || 'Failed to create path');
      }

      // Store user's proficiency level for level-gating
      if (data.proficiency_level) {
        await storeUserLevel(data.proficiency_level);
        console.log('Stored user level:', data.proficiency_level);
      }

      // Step 3: Finalizing
      setBuildingStatus(t('ready.loading.finalizing'));
      setProgress(80);

      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));

      setProgress(100);
      setBuildingStatus(t('ready.loading.ready'));

      // Navigate to countdown screen after completion
      // IMPORTANT: Navigate FIRST, then reset onboarding data.
      // If reset() fires before navigation, the useEffect guard sees empty data
      // and redirects back to onboarding (race condition).
      setTimeout(() => {
        router.replace('/(auth)/onboarding-v2/creating-plan');
        // Delay reset slightly so navigation commits first
        setTimeout(() => reset(), 100);
      }, 500);

    } catch (error) {
      console.error('Path generation error:', error);
      setIsBuilding(false);
      pathGenerationStarted.current = false;
      setProgress(0);

      Alert.alert(
        t('ready.alerts.generation_failed_title'),
        t('ready.alerts.generation_failed_message'),
        [{ text: t('common.ok') }]
      );
    }
  };

  const handleCreatePath = () => {
    // Final guard before path generation — prevent starting if data is missing
    const incompleteRoute = getFirstIncompleteScreen(data);
    if (incompleteRoute) {
      console.warn('[ReadyScreen] Cannot create path — missing data. Redirecting to:', incompleteRoute);
      router.replace(incompleteRoute);
      return;
    }
    setIsBuilding(true);
  };

  return (
    <CometBackground intensity="high">
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          {!isBuilding && (
            <Animated.View entering={FadeInDown.duration(200)} style={styles.backButtonContainer}>
              <BackButton onPress={() => router.back()} />
            </Animated.View>
          )}

          {/* Progress Indicator - Dots */}
          <Animated.View
            entering={FadeInDown.duration(300).delay(100)}
            style={styles.progressContainer}
          >
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

          {/* Title */}
          <Animated.View
            entering={FadeInUp.duration(400).delay(200)}
            style={styles.titleContainer}
          >
            <Text style={styles.emoji}>{t('ready.emoji')}</Text>
            <Text style={styles.title}>{t('ready.title')}</Text>
            <Text style={styles.subtitle}>
              {t('ready.subtitle')}
            </Text>
          </Animated.View>

          {/* Summary Cards */}
          <Animated.View
            entering={FadeInUp.duration(400).delay(300)}
            style={styles.summaryContainer}
          >
            <SummaryCard
              icon="globe-outline"
              label={t('ready.summary.language')}
              value={userData.target_language}
              delay={0}
              onPress={() => router.push('/(auth)/onboarding-v2/languages')}
            />
            <SummaryCard
              icon="bulb-outline"
              label={t('ready.summary.why')}
              value={userData.motivation}
              delay={100}
              onPress={() => router.push('/(auth)/onboarding-v2/your-why')}
            />
            <SummaryCard
              icon="bar-chart-outline"
              label={t('ready.summary.level')}
              value={userData.proficiency_level}
              delay={200}
              onPress={() => router.push('/(auth)/onboarding-v2/your-level')}
            />
            <SummaryCard
              icon="time-outline"
              label={t('ready.summary.timeline')}
              value={userData.timeline}
              delay={300}
              onPress={() => router.push('/(auth)/onboarding-v2/your-commitment')}
            />

            {/* Profession card - only if profession was selected */}
            {data.profession && (
              <SummaryCard
                icon="briefcase-outline"
                label={t('ready.summary.profession')}
                value={PROFESSIONS.find(p => p.id === data.profession)?.label || data.profession_custom || 'Professional'}
                delay={350}
                onPress={() => router.push('/(auth)/onboarding-v2/your-profession')}
              />
            )}

            {/* Why Now card - only if set */}
            {data.why_now && (
              <SummaryCard
                icon="flame-outline"
                label={t('ready.summary.why_now')}
                value={data.why_now}
                delay={375}
                onPress={() => router.push('/(auth)/onboarding-v2/why-now')}
              />
            )}

            {/* Practice routine - only if set */}
            {data.min_practice_time && (
              <SummaryCard
                icon="calendar-outline"
                label={t('ready.summary.routine')}
                value={`${data.min_practice_time}-${data.max_practice_time} min${data.days_per_week ? `, ${data.days_per_week} days/week` : ''}`}
                delay={400}
                onPress={() => router.push('/(auth)/onboarding-v2/your-routine')}
              />
            )}

            {/* Scenarios card - only if scenarios were selected */}
            {data.scenarios && data.scenarios.length > 0 && (
              <SummaryCard
                icon="navigate-outline"
                label={t('ready.summary.scenarios')}
                value={data.scenarios.map(s => s.replace(/_/g, ' ')).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}
                delay={450}
                onPress={() => router.push('/(auth)/onboarding-v2/your-stakes')}
              />
            )}
          </Animated.View>
        </ScrollView>

        {/* Fixed Bottom CTA */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(400)}
          style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}
        >
          {isBuilding ? (
            <View style={styles.loadingContainer}>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.loadingText}>
                {buildingStatus || t('ready.loading.preparing')} {progress}%
              </Text>
              <Text style={styles.loadingSubtext}>
                {progress < 30 ? t('ready.loading.preparing_ai') : progress < 80 ? t('ready.loading.generating') : t('ready.loading.almost_ready')}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleCreatePath}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={colors.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.ctaButton, shadows.glow.primary]}
              >
                <Text style={styles.ctaButtonText}>
                  {t('ready.cta_button')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </CometBackground>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  delay,
  onPress,
}: {
  icon: string;
  label: string;
  value: string;
  delay: number;
  onPress?: () => void;
}) {
  const fadeAnim = new RNAnimated.Value(0);

  useEffect(() => {
    RNAnimated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      delay: Math.round(delay / 2),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <RNAnimated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={styles.summaryCard}
      >
        <View style={styles.summaryCardIcon}>
          <Ionicons name={icon as any} size={20} color={colors.primary.light} />
        </View>
        <View style={styles.summaryCardContent}>
          <Text style={styles.summaryCardLabel}>{label}</Text>
          <Text style={styles.summaryCardValue}>{value}</Text>
        </View>
        <View style={styles.summaryCardEditIcon}>
          <Text style={styles.editIconText}>✎</Text>
        </View>
      </TouchableOpacity>
    </RNAnimated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  backButtonContainer: {
    marginBottom: spacing.md,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
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
  titleContainer: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  summaryContainer: {
    gap: spacing.md,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 54, 255, 0.2)',
    ...shadows.sm,
  },
  summaryCardIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(0, 54, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  summaryCardEmoji: {
    fontSize: 28,
  },
  summaryCardContent: {
    flex: 1,
  },
  summaryCardLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
    fontWeight: typography.fontWeight.medium,
  },
  summaryCardValue: {
    fontSize: typography.fontSize.xl,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  summaryCardEditIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(0, 54, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  editIconText: {
    fontSize: 16,
    color: colors.primary.DEFAULT,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.dark,
  },
  ctaButton: {
    height: 56,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: spacing.md,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: borderRadius.full,
  },
  loadingText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
