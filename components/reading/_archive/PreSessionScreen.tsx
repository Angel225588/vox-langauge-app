/**
 * PreSessionScreen Component
 *
 * Premium pre-session motivation screen for the reading teleprompter feature.
 * Appears BEFORE the teleprompter starts, providing encouragement and setting expectations.
 *
 * Features:
 * - Hero section with gradient and passage info chips
 * - Motivational quotes with rotation
 * - "What to expect" philosophy section
 * - Fixed bottom Start button with neomorphic depth
 * - Animated entrance with staggered effects
 * - Haptic feedback
 *
 * @example
 * ```tsx
 * <PreSessionScreen
 *   passage={{
 *     title: "My Trip to Barcelona",
 *     difficulty: "intermediate",
 *     wordCount: 250,
 *     estimatedDuration: 180
 *   }}
 *   onStart={() => startSession()}
 *   onBack={() => navigation.goBack()}
 * />
 * ```
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInUp,
  withRepeat,
  withSequence,
  withTiming,
  useAnimatedStyle,
  useSharedValue,
  Easing,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography, neomorphism } from '@/constants/designSystem';
import { VocabularyHaptics } from '@/lib/utils/haptics';
import { BackButton } from '@/components/ui/BackButton';

export interface PreSessionScreenProps {
  passage: {
    title: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    wordCount: number;
    estimatedDuration: number; // seconds
  };
  onStart: () => void;
  onBack: () => void;
  onChangePassage?: () => void; // Optional: button to change passage selection
  sessionNumber?: number; // Optional: "session X of today"
}

// Motivational quotes array (rotated randomly)
const MOTIVATIONAL_QUOTES = [
  "Every mistake is a step forward. Your courage to try is what matters most.",
  "Progress happens one word at a time. You're already improving by showing up.",
  "Your voice matters. Every practice session makes you stronger.",
  "Confidence grows through practice, not perfection. Let's begin.",
  "The journey of a thousand words begins with a single attempt.",
  "Mistakes are proof you're learning. Embrace them, celebrate them.",
  "Every great speaker started exactly where you are now.",
];

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function PreSessionScreen({
  passage,
  onStart,
  onBack,
  onChangePassage,
  sessionNumber,
}: PreSessionScreenProps) {
  // Random quote selection
  const [quote] = React.useState(
    () => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]
  );

  // Pulse animation for start button
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Get difficulty styling
  const getDifficultyStyles = () => {
    switch (passage.difficulty) {
      case 'beginner':
        return {
          color: colors.success.DEFAULT,
          backgroundColor: `${colors.success.DEFAULT}20`,
          borderColor: `${colors.success.DEFAULT}40`,
          label: 'Beginner',
        };
      case 'intermediate':
        return {
          color: colors.warning.DEFAULT,
          backgroundColor: `${colors.warning.DEFAULT}20`,
          borderColor: `${colors.warning.DEFAULT}40`,
          label: 'Intermediate',
        };
      case 'advanced':
        return {
          color: colors.accent.orange,
          backgroundColor: `${colors.accent.orange}20`,
          borderColor: `${colors.accent.orange}40`,
          label: 'Advanced',
        };
    }
  };

  const difficultyStyle = getDifficultyStyles();

  // Format estimated duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes === 0) return `${secs}s`;
    if (secs === 0) return `${minutes}m`;
    return `${minutes}m`;
  };

  const handleStart = async () => {
    await VocabularyHaptics.fabPressed();
    onStart();
  };

  const handleBack = async () => {
    await VocabularyHaptics.cardPressed();
    onBack();
  };

  const handleChangePassage = async () => {
    await VocabularyHaptics.cardPressed();
    onChangePassage?.();
  };

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary, colors.background.card]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header with Back Button */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <BackButton onPress={handleBack} />
        </Animated.View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section with Gradient + Passage Info */}
          <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.heroSection}>
            <LinearGradient
              colors={['rgba(99, 102, 241, 0.15)', 'rgba(139, 92, 246, 0.25)', 'rgba(236, 72, 153, 0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              {/* Optional decorative elements */}
              <View style={styles.heroDecorative}>
                <View style={[styles.decorCircle, styles.decorCircle1]} />
                <View style={[styles.decorCircle, styles.decorCircle2]} />
              </View>

              {/* Passage Title */}
              <Text style={styles.heroTitle}>{passage.title}</Text>

              {/* Info Chips */}
              <View style={styles.chipsContainer}>
                {/* Difficulty Chip */}
                <View
                  style={[
                    styles.chip,
                    { backgroundColor: difficultyStyle.backgroundColor, borderColor: difficultyStyle.borderColor },
                  ]}
                >
                  <Text style={[styles.chipText, { color: difficultyStyle.color }]}>
                    {difficultyStyle.label}
                  </Text>
                </View>

                {/* Word Count Chip */}
                <View style={styles.chip}>
                  <Text style={styles.chipText}>{passage.wordCount} words</Text>
                </View>

                {/* Duration Chip */}
                <View style={styles.chip}>
                  <Text style={styles.chipText}>~{formatDuration(passage.estimatedDuration)}</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Motivational Quote */}
          <Animated.View entering={FadeInDown.delay(250).springify()} style={styles.quoteSection}>
            <Text style={styles.quote}>"{quote}"</Text>
          </Animated.View>

          {/* What to Expect Section */}
          <Animated.View entering={FadeInUp.delay(350).springify()} style={styles.expectSection}>
            <Text style={styles.sectionTitle}>What to expect:</Text>

            {[
              { icon: '🎯', text: 'No judgment - just practice' },
              { icon: '⭐', text: 'Points for every attempt' },
              { icon: '📈', text: 'Mistakes = Learning = Growth' },
              { icon: '🎉', text: 'Your improvements celebrated' },
            ].map((item, index) => (
              <Animated.View
                key={index}
                entering={FadeInUp.delay(400 + index * 80).springify()}
                style={styles.expectItem}
              >
                <Text style={styles.expectIcon}>{item.icon}</Text>
                <Text style={styles.expectText}>{item.text}</Text>
              </Animated.View>
            ))}
          </Animated.View>

          {/* Change Passage - Secondary Action */}
          {onChangePassage && (
            <Animated.View entering={FadeInUp.delay(700).springify()}>
              <TouchableOpacity
                onPress={handleChangePassage}
                style={styles.changePassageButton}
                activeOpacity={0.7}
              >
                <Text style={styles.changePassageText}>Choose a different passage</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Bottom spacer for fixed footer */}
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Fixed Bottom Footer */}
        <Animated.View entering={FadeInUp.delay(500).springify()} style={styles.footer}>
          {/* Gradient fade at top of footer */}
          <LinearGradient
            colors={['transparent', colors.background.primary]}
            style={styles.footerGradient}
            pointerEvents="none"
          />

          {/* Neomorphic Start Button */}
          <AnimatedTouchable
            style={[styles.startButtonContainer, pulseStyle]}
            onPress={handleStart}
            activeOpacity={0.85}
          >
            <View style={styles.neomorphicButton}>
              <LinearGradient
                colors={colors.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startButtonGradient}
              >
                <Text style={styles.startButtonText}>Start Reading</Text>
                <Text style={styles.startButtonArrow}>→</Text>
              </LinearGradient>
            </View>
          </AnimatedTouchable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },

  // Hero Section
  heroSection: {
    marginBottom: spacing.lg,
  },
  heroGradient: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    paddingVertical: spacing['2xl'],
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  heroDecorative: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.1,
  },
  decorCircle1: {
    width: 200,
    height: 200,
    backgroundColor: colors.primary.DEFAULT,
    top: -80,
    right: -60,
  },
  decorCircle2: {
    width: 150,
    height: 150,
    backgroundColor: colors.accent.purple,
    bottom: -50,
    left: -40,
  },
  heroTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    zIndex: 1,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    zIndex: 1,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  chipText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },

  // Quote Section
  quoteSection: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  quote: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: typography.fontSize.base * 1.6,
  },

  // What to Expect Section
  expectSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  expectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
  },
  expectIcon: {
    fontSize: 20,
    marginRight: spacing.md,
    width: 28,
    textAlign: 'center',
  },
  expectText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
    flex: 1,
  },

  // Change Passage Button
  changePassageButton: {
    alignSelf: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    marginTop: spacing.sm,
  },
  changePassageText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary.light,
    fontWeight: typography.fontWeight.medium,
  },

  // Bottom Spacer
  bottomSpacer: {
    height: 120,
  },

  // Fixed Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  footerGradient: {
    position: 'absolute',
    top: -40,
    left: 0,
    right: 0,
    height: 60,
  },
  startButtonContainer: {
    width: '100%',
  },
  neomorphicButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    // Neomorphic shadow effect
    shadowColor: neomorphism.button.primary.shadowDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  startButtonText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    letterSpacing: 0.3,
  },
  startButtonArrow: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
});
