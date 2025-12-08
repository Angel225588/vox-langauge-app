/**
 * About Lecture Screen
 *
 * Simplified, premium pre-session screen showing:
 * - Hero banner image with dark gradient overlay
 * - Title and metadata
 * - Elegant quote with visual line indicator
 * - What to expect section
 * - Secondary button for vocabulary preview
 *
 * Design: Minimalist, premium feel (Claude/Perplexity/Revolut inspired)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';
import { BackButton } from '@/components/ui/BackButton';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BANNER_HEIGHT = SCREEN_HEIGHT * 0.38;

// Motivational quotes for reading practice
const QUOTES = [
  { text: "Every word you speak is a step toward fluency.", author: "Language Learning" },
  { text: "Your voice has power. Let it be heard.", author: "Confidence" },
  { text: "Progress, not perfection.", author: "Growth Mindset" },
  { text: "Mistakes are proof you're learning.", author: "Learning" },
  { text: "The journey of a thousand words begins with one.", author: "Beginning" },
  { text: "Confidence grows with every practice.", author: "Practice" },
];

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function AboutLectureScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id: string;
    title: string;
    subtitle: string;
    category: string;
    difficulty: string;
    duration: string;
    wordCount: string;
    imageUrl: string;
  }>();

  // Random quote
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  // Pulse animation for start button
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleBack = () => {
    router.back();
  };

  const handleStart = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push({
      pathname: '/teleprompter',
      params: {
        storyId: params.id,
        title: params.title,
      },
    });
  };

  const handleViewVocabulary = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to vocabulary preview screen
    console.log('View vocabulary - coming soon');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return colors.success.DEFAULT;
      case 'intermediate': return colors.warning.DEFAULT;
      case 'advanced': return colors.accent.orange;
      default: return colors.text.tertiary;
    }
  };

  const difficultyColor = getDifficultyColor(params.difficulty || 'beginner');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Hero Banner Image */}
      <Animated.View entering={FadeIn.duration(600)} style={styles.bannerContainer}>
        <Image
          source={{ uri: params.imageUrl }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        {/* Gradient overlay for readability */}
        <LinearGradient
          colors={[
            'rgba(10, 14, 26, 0.2)',
            'rgba(10, 14, 26, 0.5)',
            'rgba(10, 14, 26, 0.9)',
            colors.background.primary,
          ]}
          locations={[0, 0.3, 0.7, 1]}
          style={styles.bannerGradient}
        />

        {/* Back Button (absolute positioned on banner) */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={[styles.backButtonContainer, { top: insets.top + spacing.md }]}
        >
          <BackButton onPress={handleBack} variant="blur" />
        </Animated.View>

        {/* Banner Content */}
        <View style={styles.bannerContent}>
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <View style={styles.badgeRow}>
              <View style={[styles.categoryBadge]}>
                <Text style={styles.categoryText}>{params.category}</Text>
              </View>
              <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor + '25' }]}>
                <Text style={[styles.difficultyText, { color: difficultyColor }]}>
                  {params.difficulty}
                </Text>
              </View>
            </View>
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.delay(400).duration(400)}
            style={styles.bannerTitle}
          >
            {params.title}
          </Animated.Text>

          <Animated.Text
            entering={FadeInDown.delay(450).duration(400)}
            style={styles.bannerSubtitle}
          >
            {params.subtitle}
          </Animated.Text>

          <Animated.View
            entering={FadeInDown.delay(500).duration(400)}
            style={styles.metaRow}
          >
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>{params.duration}</Text>
              <Text style={styles.metaLabel}>duration</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>{params.wordCount}</Text>
              <Text style={styles.metaLabel}>words</Text>
            </View>
          </Animated.View>
        </View>
      </Animated.View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Inspirational Quote with Line */}
        <Animated.View
          entering={FadeInUp.delay(550).duration(400)}
          style={styles.quoteSection}
        >
          <View style={styles.quoteContainer}>
            <View style={styles.quoteLine} />
            <View style={styles.quoteContent}>
              <Text style={styles.quoteText}>"{quote.text}"</Text>
            </View>
          </View>
        </Animated.View>

        {/* What to Expect */}
        <Animated.View
          entering={FadeInUp.delay(600).duration(400)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>What to Expect</Text>
          <View style={styles.expectList}>
            {[
              { icon: '🎯', text: 'Read at your own pace with auto-scrolling' },
              { icon: '🎤', text: 'Record your voice for pronunciation feedback' },
              { icon: '⭐', text: 'Track your progress and earn points' },
            ].map((item, index) => (
              <Animated.View
                key={index}
                entering={FadeInUp.delay(650 + index * 50).duration(300)}
                style={styles.expectItem}
              >
                <Text style={styles.expectIcon}>{item.icon}</Text>
                <Text style={styles.expectText}>{item.text}</Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Spacer for bottom buttons */}
        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Fixed Bottom Buttons */}
      <Animated.View
        entering={FadeInUp.delay(700).duration(400)}
        style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}
      >
        <LinearGradient
          colors={['transparent', colors.background.primary]}
          style={styles.footerGradient}
          pointerEvents="none"
        />

        {/* Secondary Button - View Vocabulary */}
        <TouchableOpacity
          onPress={handleViewVocabulary}
          activeOpacity={0.8}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>Preview Vocabulary</Text>
        </TouchableOpacity>

        {/* Primary Button - Start Reading */}
        <AnimatedTouchable
          onPress={handleStart}
          activeOpacity={0.9}
          style={[styles.startButton, pulseStyle]}
        >
          <LinearGradient
            colors={colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.startButtonGradient}
          >
            <Text style={styles.startButtonText}>Start Reading</Text>
            <Text style={styles.startButtonArrow}>→</Text>
          </LinearGradient>
        </AnimatedTouchable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  // Banner
  bannerContainer: {
    height: BANNER_HEIGHT,
    position: 'relative',
  },
  bannerImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  bannerGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  backButtonContainer: {
    position: 'absolute',
    left: spacing.lg,
    zIndex: 10,
  },
  bannerContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  difficultyText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'capitalize',
  },
  bannerTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  bannerSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    alignItems: 'center',
  },
  metaValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  metaLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: spacing.xl,
  },

  // Scroll Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },

  // Quote Section with Line
  quoteSection: {
    paddingVertical: spacing.xl,
  },
  quoteContainer: {
    flexDirection: 'row',
  },
  quoteLine: {
    width: 3,
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: 2,
    marginRight: spacing.md,
  },
  quoteContent: {
    flex: 1,
  },
  quoteText: {
    fontSize: typography.fontSize.lg,
    fontStyle: 'italic',
    color: colors.text.secondary,
    lineHeight: typography.fontSize.lg * 1.6,
  },

  // Sections
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },

  // Expect List
  expectList: {
    gap: spacing.md,
  },
  expectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  expectIcon: {
    fontSize: 20,
    width: 32,
    textAlign: 'center',
  },
  expectText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  footerGradient: {
    position: 'absolute',
    top: -80,
    left: 0,
    right: 0,
    height: 100,
  },

  // Secondary Button
  secondaryButton: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'transparent',
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },

  // Primary Button
  startButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: colors.glow.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  startButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  startButtonArrow: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
});
