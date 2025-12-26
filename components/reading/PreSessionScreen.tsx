/**
 * PreSessionScreen Component
 *
 * Reusable pre-session briefing screen for both reading and voice scenarios.
 * Features:
 * - Hero banner with gradient overlay (optional)
 * - Title and metadata
 * - What to expect section
 * - Motivational quote
 * - Primary and secondary CTAs
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
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';
import { BackButton } from '@/components/ui/BackButton';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BANNER_HEIGHT = SCREEN_HEIGHT * 0.38;

// =============================================================================
// Types
// =============================================================================

export interface PreSessionScreenProps {
  // Content
  title: string;
  subtitle?: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  imageUrl?: string;
  icon?: keyof typeof Ionicons.glyphMap;

  // Metadata
  duration?: string;
  metaLabel1?: string;
  metaValue1?: string;
  metaLabel2?: string;
  metaValue2?: string;

  // What to expect
  expectations?: Array<{ icon: string; text: string }>;

  // Quote (optional - random if not provided)
  quote?: string;

  // Actions
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryPress: () => void;
  onSecondaryPress?: () => void;
  onBack: () => void;
}

// =============================================================================
// Default Quotes
// =============================================================================

const DEFAULT_QUOTES = [
  { text: "Every word you speak is a step toward fluency.", author: "Language Learning" },
  { text: "Your voice has power. Let it be heard.", author: "Confidence" },
  { text: "Progress, not perfection.", author: "Growth Mindset" },
  { text: "Mistakes are proof you're learning.", author: "Learning" },
  { text: "The journey of a thousand words begins with one.", author: "Beginning" },
  { text: "Confidence grows with every practice.", author: "Practice" },
];

// =============================================================================
// Component
// =============================================================================

export const PreSessionScreen: React.FC<PreSessionScreenProps> = ({
  title,
  subtitle,
  category,
  difficulty = 'beginner',
  imageUrl,
  icon = 'chatbubbles-outline',
  duration,
  metaLabel1,
  metaValue1,
  metaLabel2,
  metaValue2,
  expectations = [
    { icon: '🎯', text: 'Practice at your own pace' },
    { icon: '🎤', text: 'Get feedback on your performance' },
    { icon: '⭐', text: 'Track your progress and earn points' },
  ],
  quote,
  primaryButtonText = 'Start',
  secondaryButtonText,
  onPrimaryPress,
  onSecondaryPress,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedQuote] = useState(() =>
    quote || DEFAULT_QUOTES[Math.floor(Math.random() * DEFAULT_QUOTES.length)].text
  );

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

  const handlePrimaryPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onPrimaryPress();
  };

  const handleSecondaryPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSecondaryPress?.();
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'beginner': return colors.success.DEFAULT;
      case 'intermediate': return colors.warning.DEFAULT;
      case 'advanced': return colors.accent.orange || colors.error.DEFAULT;
      default: return colors.text.tertiary;
    }
  };

  const difficultyColor = getDifficultyColor();
  const hasImage = !!imageUrl;

  const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Hero Banner (with or without image) */}
      <Animated.View
        entering={FadeIn.duration(600)}
        style={[styles.bannerContainer, !hasImage && styles.bannerNoImage]}
      >
        {hasImage ? (
          <>
            <Image
              source={{ uri: imageUrl }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
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
          </>
        ) : (
          <View style={[styles.bannerIconContainer, { paddingTop: insets.top + spacing.xl + 44 }]}>
            <View style={styles.iconCircle}>
              <Ionicons name={icon} size={48} color={colors.primary.DEFAULT} />
            </View>
          </View>
        )}

        {/* Back Button */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={[styles.backButtonContainer, { top: insets.top + spacing.md }]}
        >
          <BackButton onPress={onBack} variant={hasImage ? 'blur' : 'default'} />
        </Animated.View>

        {/* Banner Content */}
        <View style={[styles.bannerContent, !hasImage && styles.bannerContentNoImage]}>
          {category && (
            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
              <View style={styles.badgeRow}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{category}</Text>
                </View>
                <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor + '25' }]}>
                  <Text style={[styles.difficultyText, { color: difficultyColor }]}>
                    {difficulty}
                  </Text>
                </View>
              </View>
            </Animated.View>
          )}

          <Animated.Text
            entering={FadeInDown.delay(400).duration(400)}
            style={styles.bannerTitle}
          >
            {title}
          </Animated.Text>

          {subtitle && (
            <Animated.Text
              entering={FadeInDown.delay(450).duration(400)}
              style={styles.bannerSubtitle}
            >
              {subtitle}
            </Animated.Text>
          )}

          {(metaValue1 || metaValue2) && (
            <Animated.View
              entering={FadeInDown.delay(500).duration(400)}
              style={styles.metaRow}
            >
              {metaValue1 && (
                <View style={styles.metaItem}>
                  <Text style={styles.metaValue}>{metaValue1}</Text>
                  <Text style={styles.metaLabel}>{metaLabel1 || 'duration'}</Text>
                </View>
              )}
              {metaValue1 && metaValue2 && <View style={styles.metaDivider} />}
              {metaValue2 && (
                <View style={styles.metaItem}>
                  <Text style={styles.metaValue}>{metaValue2}</Text>
                  <Text style={styles.metaLabel}>{metaLabel2 || 'items'}</Text>
                </View>
              )}
            </Animated.View>
          )}
        </View>
      </Animated.View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Inspirational Quote - Emphasized */}
        <Animated.View
          entering={FadeInUp.delay(550).duration(400)}
          style={styles.quoteSection}
        >
          <View style={styles.quoteContainer}>
            <View style={styles.quoteLine} />
            <View style={styles.quoteContent}>
              <Text style={styles.quoteText}>"{selectedQuote}"</Text>
            </View>
          </View>
        </Animated.View>

        {/* Divider */}
        <View style={styles.sectionDivider} />

        {/* What to Expect */}
        <Animated.View
          entering={FadeInUp.delay(650).duration(400)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>What to Expect</Text>
          <View style={styles.expectList}>
            {expectations.map((item, index) => (
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

        {/* Secondary Button */}
        {secondaryButtonText && onSecondaryPress && (
          <TouchableOpacity
            onPress={handleSecondaryPress}
            activeOpacity={0.8}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>{secondaryButtonText}</Text>
          </TouchableOpacity>
        )}

        {/* Primary Button */}
        <AnimatedTouchable
          onPress={handlePrimaryPress}
          activeOpacity={0.9}
          style={[styles.startButton, pulseStyle]}
        >
          <LinearGradient
            colors={colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.startButtonGradient}
          >
            <Text style={styles.startButtonText}>{primaryButtonText}</Text>
            <Text style={styles.startButtonArrow}>→</Text>
          </LinearGradient>
        </AnimatedTouchable>
      </Animated.View>
    </View>
  );
};

// =============================================================================
// Styles
// =============================================================================

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
  bannerNoImage: {
    height: SCREEN_HEIGHT * 0.42,
    justifyContent: 'flex-end',
  },
  bannerImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  bannerGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  bannerIconContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 32,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary.DEFAULT + '30',
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
  bannerContentNoImage: {
    position: 'relative',
    alignItems: 'center',
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

  // Quote Section - Emphasized
  quoteSection: {
    paddingVertical: spacing['2xl'],
  },
  quoteContainer: {
    flexDirection: 'row',
  },
  quoteLine: {
    width: 4,
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: 2,
    marginRight: spacing.md,
  },
  quoteContent: {
    flex: 1,
  },
  quoteText: {
    fontSize: typography.fontSize.xl,
    fontStyle: 'italic',
    color: colors.text.primary,
    lineHeight: typography.fontSize.xl * 1.5,
  },

  // Divider
  sectionDivider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginBottom: spacing.xl,
    opacity: 0.5,
  },

  // Sections
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
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

export default PreSessionScreen;
