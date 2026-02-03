/**
 * CreatingYourPlanScreen - Premium stair loading experience for plan generation
 *
 * Shows animated stairs appearing one by one with typewriter text effect.
 * Features smooth animations, haptic feedback, and motivational messages.
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  interpolate,
  FadeIn,
  FadeInDown,
  FadeOut,
  SlideInLeft,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  animation,
} from '@/constants/designSystem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CreatingYourPlanScreenProps {
  /** Called when loading completes */
  onComplete: () => void;
  /** Duration in seconds (default: 10) */
  duration?: number;
}

// Sample stair titles (these would come from AI generation in real use)
const SAMPLE_STAIRS = [
  { title: 'Foundation Basics', emoji: '🌱' },
  { title: 'Essential Vocabulary', emoji: '📚' },
  { title: 'Everyday Conversations', emoji: '💬' },
  { title: 'Grammar Patterns', emoji: '🧩' },
  { title: 'Real-World Practice', emoji: '🌍' },
];

// Motivational messages that rotate during loading
const MOTIVATIONAL_MESSAGES = [
  { text: 'Analyzing your goals...', emoji: '🎯' },
  { text: 'Understanding your level...', emoji: '📊' },
  { text: 'Customizing your lessons...', emoji: '✨' },
  { text: 'Building your vocabulary path...', emoji: '📚' },
  { text: 'Optimizing for your schedule...', emoji: '⏰' },
  { text: 'Adding speaking exercises...', emoji: '🎤' },
  { text: 'Preparing immersive content...', emoji: '🌍' },
  { text: 'Almost there...', emoji: '🚀' },
];

// Typewriter text component
interface TypewriterTextProps {
  text: string;
  delay?: number;
  speed?: number;
  onComplete?: () => void;
  style?: object;
}

function TypewriterText({ text, delay = 0, speed = 50, onComplete, style }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let currentIndex = 0;
    let timeoutId: NodeJS.Timeout;

    const startTyping = () => {
      timeoutId = setTimeout(() => {
        const typeNextChar = () => {
          if (currentIndex <= text.length) {
            setDisplayedText(text.slice(0, currentIndex));
            currentIndex++;
            if (currentIndex <= text.length) {
              timeoutId = setTimeout(typeNextChar, speed);
            } else {
              setIsComplete(true);
              onComplete?.();
            }
          }
        };
        typeNextChar();
      }, delay);
    };

    startTyping();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [text, delay, speed, onComplete]);

  return (
    <Text style={style}>
      {displayedText}
      {!isComplete && <Text style={styles.cursor}>|</Text>}
    </Text>
  );
}

// Individual stair component
interface StairItemProps {
  index: number;
  title: string;
  emoji: string;
  isVisible: boolean;
  isActive: boolean;
  delay: number;
}

function StairItem({ index, title, emoji, isVisible, isActive, delay }: StairItemProps) {
  const scaleValue = useSharedValue(0.8);
  const opacityValue = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      opacityValue.value = withDelay(delay, withTiming(1, { duration: 300 }));
      scaleValue.value = withDelay(delay, withSpring(1, animation.spring.default));
    }
  }, [isVisible, delay]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacityValue.value,
    transform: [{ scale: scaleValue.value }],
  }));

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.stairItem, containerStyle]}>
      <LinearGradient
        colors={isActive
          ? ['rgba(99, 102, 241, 0.2)', 'rgba(139, 92, 246, 0.1)']
          : ['rgba(26, 31, 58, 0.8)', 'rgba(26, 31, 58, 0.6)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.stairGradient}
      >
        {/* Step number badge */}
        <View style={[styles.stepBadge, isActive && styles.stepBadgeActive]}>
          <Text style={styles.stepNumber}>{index + 1}</Text>
        </View>

        {/* Emoji */}
        <Text style={styles.stairEmoji}>{emoji}</Text>

        {/* Title with typewriter effect */}
        <View style={styles.stairTitleContainer}>
          {isActive ? (
            <TypewriterText
              text={title}
              delay={200}
              speed={40}
              style={[styles.stairTitle, styles.stairTitleActive]}
            />
          ) : (
            <Text style={styles.stairTitle}>{title}</Text>
          )}
        </View>

        {/* Active indicator glow */}
        {isActive && <View style={styles.activeGlow} />}
      </LinearGradient>
    </Animated.View>
  );
}

export function CreatingYourPlanScreen({
  onComplete,
  duration = 10,
}: CreatingYourPlanScreenProps) {
  const [visibleStairs, setVisibleStairs] = useState<number>(0);
  const [activeStair, setActiveStair] = useState<number>(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const hasCompleted = useRef(false);

  // Animation values
  const progressWidth = useSharedValue(0);
  const glowPulse = useSharedValue(0);

  // Calculate timing
  const stairCount = SAMPLE_STAIRS.length;
  const stairInterval = (duration * 1000) / (stairCount + 1); // +1 for final completion

  // Trigger haptic feedback
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy') => {
    const feedbackStyle = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy,
    };
    Haptics.impactAsync(feedbackStyle[type]);
  }, []);

  // Glow animation
  useEffect(() => {
    glowPulse.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  // Stair reveal animation
  useEffect(() => {
    const revealStairs = () => {
      let currentStair = 0;

      const revealNext = () => {
        if (currentStair < stairCount) {
          setVisibleStairs(currentStair + 1);
          setActiveStair(currentStair);
          triggerHaptic('light');

          // Update progress
          const progress = ((currentStair + 1) / stairCount) * 100;
          progressWidth.value = withTiming(progress, {
            duration: stairInterval * 0.8,
            easing: Easing.out(Easing.ease),
          });

          currentStair++;

          if (currentStair < stairCount) {
            setTimeout(revealNext, stairInterval);
          } else {
            // All stairs revealed, complete after a short delay
            setTimeout(() => {
              if (!hasCompleted.current) {
                hasCompleted.current = true;
                triggerHaptic('heavy');
                setTimeout(onComplete, 500);
              }
            }, stairInterval);
          }
        }
      };

      // Start revealing after initial delay
      setTimeout(revealNext, 800);
    };

    revealStairs();
  }, [stairCount, stairInterval, triggerHaptic, onComplete]);

  // Rotate messages
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MOTIVATIONAL_MESSAGES.length);
    }, Math.max(1200, stairInterval));

    return () => clearInterval(messageInterval);
  }, [stairInterval]);

  // Animated styles
  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowPulse.value, [0, 1], [0.3, 0.6]),
    transform: [{ scale: interpolate(glowPulse.value, [0, 1], [1, 1.1]) }],
  }));

  const currentMessage = MOTIVATIONAL_MESSAGES[messageIndex];

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary, colors.background.primary]}
      locations={[0, 0.5, 1]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Header with icon */}
          <View style={styles.headerSection}>
            <View style={styles.iconContainer}>
              <Animated.View style={[styles.iconGlow, glowAnimatedStyle]} />
              <Text style={styles.iconText}>🏗️</Text>
            </View>

            <Animated.Text
              entering={FadeInDown.duration(600).delay(200)}
              style={styles.title}
            >
              Building Your Learning Path
            </Animated.Text>

            <Animated.Text
              entering={FadeInDown.duration(600).delay(400)}
              style={styles.subtitle}
            >
              Personalized just for you
            </Animated.Text>
          </View>

          {/* Stairs container */}
          <View style={styles.stairsContainer}>
            {SAMPLE_STAIRS.map((stair, index) => (
              <StairItem
                key={index}
                index={index}
                title={stair.title}
                emoji={stair.emoji}
                isVisible={index < visibleStairs}
                isActive={index === activeStair}
                delay={0}
              />
            ))}
          </View>

          {/* Bottom section */}
          <View style={styles.bottomSection}>
            {/* Progress bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressFill, progressAnimatedStyle]}>
                  <LinearGradient
                    colors={colors.gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.progressGradient}
                  />
                </Animated.View>
              </View>
            </View>

            {/* Motivational message */}
            <Animated.View
              key={messageIndex}
              entering={FadeIn.duration(400)}
              exiting={FadeOut.duration(200)}
              style={styles.messageContainer}
            >
              <Text style={styles.messageEmoji}>{currentMessage.emoji}</Text>
              <Text style={styles.messageText}>{currentMessage.text}</Text>
            </Animated.View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  iconGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.glow.primary,
  },
  iconText: {
    fontSize: 48,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  stairsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  stairItem: {
    width: '100%',
  },
  stairGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    position: 'relative',
    overflow: 'hidden',
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  stepBadgeActive: {
    backgroundColor: colors.primary.DEFAULT,
  },
  stepNumber: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  stairEmoji: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  stairTitleContainer: {
    flex: 1,
  },
  stairTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  stairTitleActive: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  cursor: {
    color: colors.primary.DEFAULT,
    fontWeight: typography.fontWeight.bold,
  },
  activeGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary.DEFAULT,
    shadowColor: colors.glow.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  bottomSection: {
    paddingBottom: spacing['2xl'],
  },
  progressContainer: {
    marginBottom: spacing.lg,
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressGradient: {
    flex: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 32,
  },
  messageEmoji: {
    fontSize: 20,
  },
  messageText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
});

export default CreatingYourPlanScreen;
