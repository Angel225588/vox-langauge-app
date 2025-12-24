/**
 * Onboarding V2 - Ready/Summary Screen
 * Final step showing user's choices and creating personalized path
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated as RNAnimated, ScrollView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { CometBackground } from '@/components/ui/CometBackground';
import { BackButton } from '@/components/ui/BackButton';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/designSystem';
import { useOnboardingV2, TARGET_LANGUAGES, MOTIVATIONS, PROFICIENCY_LEVELS, TIMELINES } from '@/hooks/useOnboardingV2';
import { createPersonalizedPath } from '@/lib/services/pathGeneration';
import { supabase } from '@/lib/db/supabase';
import { storeUserLevel } from '@/lib/utils/levelGating';

export default function ReadyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, reset } = useOnboardingV2();
  const { t } = useTranslation('onboarding');
  const [isBuilding, setIsBuilding] = useState(false);
  const [progress, setProgress] = useState(0);

  // Get display values from store data
  const targetLang = TARGET_LANGUAGES.find(l => l.code === data.target_language);
  const motivation = MOTIVATIONS.find(m => m.id === data.motivation);
  const level = PROFICIENCY_LEVELS.find(l => l.id === data.proficiency_level);
  const timeline = TIMELINES.find(t => t.id === data.timeline);

  const userData = {
    target_language: targetLang ? `${targetLang.flag} ${targetLang.label}` : data.target_language || 'Not set',
    motivation: motivation ? motivation.label : data.motivation_custom || data.motivation || 'Not set',
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
        // For demo/testing without auth, use a mock user ID
        console.log('No authenticated user, using demo mode');
      }

      // Generate a proper UUID for demo mode (database requires UUID format)
      const generateDemoUUID = () => {
        // Simple UUID v4 generator
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

      // Navigate to home after completion
      setTimeout(() => {
        reset();
        router.replace('/(tabs)/home');
      }, 800);

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
            <Animated.View entering={FadeInDown.duration(400)} style={styles.backButtonContainer}>
              <BackButton onPress={() => router.back()} />
            </Animated.View>
          )}

          {/* Progress Indicator - Dots */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(200)}
            style={styles.progressContainer}
          >
            <View style={styles.dotsContainer}>
              {[1, 2, 3, 4, 5].map((step) => (
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

          {/* Title */}
          <Animated.View
            entering={FadeInUp.duration(800).delay(400)}
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
            entering={FadeInUp.duration(800).delay(600)}
            style={styles.summaryContainer}
          >
            <SummaryCard
              icon="🌍"
              label={t('ready.summary.language')}
              value={userData.target_language}
              delay={0}
              onPress={() => router.push('/(auth)/onboarding-v2/languages')}
            />
            <SummaryCard
              icon="💡"
              label={t('ready.summary.why')}
              value={userData.motivation}
              delay={100}
              onPress={() => router.push('/(auth)/onboarding-v2/your-why')}
            />
            <SummaryCard
              icon="📊"
              label={t('ready.summary.level')}
              value={userData.proficiency_level}
              delay={200}
              onPress={() => router.push('/(auth)/onboarding-v2/your-level')}
            />
            <SummaryCard
              icon="⏱️"
              label={t('ready.summary.timeline')}
              value={userData.timeline}
              delay={300}
              onPress={() => router.push('/(auth)/onboarding-v2/your-commitment')}
            />
          </Animated.View>
        </ScrollView>

        {/* Fixed Bottom CTA */}
        <Animated.View
          entering={FadeInUp.duration(800).delay(800)}
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
      duration: 600,
      delay,
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
          <Text style={styles.summaryCardEmoji}>{icon}</Text>
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
    borderColor: 'rgba(99, 102, 241, 0.2)',
    ...shadows.sm,
  },
  summaryCardIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
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
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
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
