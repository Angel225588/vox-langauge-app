/**
 * Onboarding V2 - Ready/Summary Screen
 * Final step showing user's choices and creating personalized path
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated as RNAnimated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { CometBackground } from '@/components/ui/CometBackground';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/designSystem';

export default function ReadyScreen() {
  const router = useRouter();
  const [isBuilding, setIsBuilding] = useState(false);
  const [progress, setProgress] = useState(0);

  // Mock user data - in production, this would come from state/context
  const userData = {
    target_language: 'Spanish',
    motivation: 'Travel & Culture',
    proficiency_level: 'Beginner',
    timeline: '15 min/day',
  };

  useEffect(() => {
    if (isBuilding) {
      // Simulate progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            // Navigate to home after completion
            setTimeout(() => {
              router.replace('/(tabs)/home');
            }, 500);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [isBuilding]);

  const handleCreatePath = () => {
    setIsBuilding(true);
  };

  return (
    <CometBackground intensity="high">
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.content}>
          {/* Progress Indicator */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(200)}
            style={styles.progressContainer}
          >
            <Text style={styles.progressText}>
              {isBuilding ? 'Complete! ✨' : 'Step 5 of 5'}
            </Text>
          </Animated.View>

          {/* Title */}
          <Animated.View
            entering={FadeInUp.duration(800).delay(400)}
            style={styles.titleContainer}
          >
            <Text style={styles.emoji}>🎯</Text>
            <Text style={styles.title}>Your Learning Path Awaits</Text>
            <Text style={styles.subtitle}>
              Here's what we're building for you
            </Text>
          </Animated.View>

          {/* Summary Cards */}
          <Animated.View
            entering={FadeInUp.duration(800).delay(600)}
            style={styles.summaryContainer}
          >
            <SummaryCard
              icon="🌍"
              label="Language"
              value={userData.target_language}
              delay={0}
            />
            <SummaryCard
              icon="💡"
              label="Why"
              value={userData.motivation}
              delay={100}
            />
            <SummaryCard
              icon="📊"
              label="Level"
              value={userData.proficiency_level}
              delay={200}
            />
            <SummaryCard
              icon="⏱️"
              label="Timeline"
              value={userData.timeline}
              delay={300}
            />
          </Animated.View>

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* Loading State or CTA */}
          <Animated.View
            entering={FadeInUp.duration(800).delay(800)}
            style={styles.ctaContainer}
          >
            {isBuilding ? (
              <View style={styles.loadingContainer}>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.loadingText}>
                  Building your staircase... {progress}%
                </Text>
                <Text style={styles.loadingSubtext}>
                  Creating personalized lessons just for you
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
                    Create My Personalized Path
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>
      </SafeAreaView>
    </CometBackground>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  delay,
}: {
  icon: string;
  label: string;
  value: string;
  delay: number;
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
        styles.summaryCard,
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
      <View style={styles.summaryCardIcon}>
        <Text style={styles.summaryCardEmoji}>{icon}</Text>
      </View>
      <View style={styles.summaryCardContent}>
        <Text style={styles.summaryCardLabel}>{label}</Text>
        <Text style={styles.summaryCardValue}>{value}</Text>
      </View>
    </RNAnimated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.light,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
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
  ctaContainer: {
    marginTop: spacing.xl,
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
