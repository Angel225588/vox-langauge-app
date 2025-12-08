import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';

interface AnalyzingScreenProps {
  progress: number; // 0-100
  stage: 'uploading' | 'transcribing' | 'analyzing';
}

const STAGE_CONFIG = {
  uploading: {
    title: 'Uploading audio...',
    emoji: '=ä',
    message: 'Preparing your recording',
  },
  transcribing: {
    title: 'Transcribing speech...',
    emoji: '<™',
    message: 'Converting your voice to text',
  },
  analyzing: {
    title: 'Analyzing articulation...',
    emoji: '>à',
    message: 'Evaluating clarity and fluency',
  },
};

export function AnalyzingScreen({ progress, stage }: AnalyzingScreenProps) {
  const stageInfo = STAGE_CONFIG[stage];

  // Pulsing animation for emoji
  const pulseScale = useSharedValue(1);

  // Waveform animation
  const wave1 = useSharedValue(0);
  const wave2 = useSharedValue(0);
  const wave3 = useSharedValue(0);
  const wave4 = useSharedValue(0);

  useEffect(() => {
    // Pulse animation
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Waveform animations with staggered timing
    wave1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    wave2.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 200 }),
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    wave3.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 300 }),
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    wave4.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 100 }),
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const wave1Style = useAnimatedStyle(() => ({
    height: `${20 + wave1.value * 60}%`,
  }));

  const wave2Style = useAnimatedStyle(() => ({
    height: `${20 + wave2.value * 80}%`,
  }));

  const wave3Style = useAnimatedStyle(() => ({
    height: `${20 + wave3.value * 70}%`,
  }));

  const wave4Style = useAnimatedStyle(() => ({
    height: `${20 + wave4.value * 50}%`,
  }));

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary]}
        style={StyleSheet.absoluteFill}
      />

      {/* Main content */}
      <View style={styles.content}>
        {/* Animated emoji */}
        <Animated.View
          entering={FadeIn.duration(400)}
          style={[styles.emojiContainer, pulseStyle]}
        >
          <Text style={styles.emoji}>{stageInfo.emoji}</Text>
          <View style={styles.emojiGlow} />
        </Animated.View>

        {/* Waveform visualization */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(200)}
          style={styles.waveformContainer}
        >
          <Animated.View style={[styles.waveBar, wave1Style]}>
            <LinearGradient
              colors={colors.gradients.primary}
              style={styles.waveGradient}
            />
          </Animated.View>
          <Animated.View style={[styles.waveBar, wave2Style]}>
            <LinearGradient
              colors={colors.gradients.secondary}
              style={styles.waveGradient}
            />
          </Animated.View>
          <Animated.View style={[styles.waveBar, wave3Style]}>
            <LinearGradient
              colors={colors.gradients.primary}
              style={styles.waveGradient}
            />
          </Animated.View>
          <Animated.View style={[styles.waveBar, wave4Style]}>
            <LinearGradient
              colors={colors.gradients.secondary}
              style={styles.waveGradient}
            />
          </Animated.View>
        </Animated.View>

        {/* Stage title */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(300)}
          style={styles.titleContainer}
        >
          <Text style={styles.title}>{stageInfo.title}</Text>
          <Text style={styles.message}>{stageInfo.message}</Text>
        </Animated.View>

        {/* Progress bar */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(400)}
          style={styles.progressContainer}
        >
          <View style={styles.progressTrack}>
            <Animated.View style={styles.progressFill}>
              <LinearGradient
                colors={colors.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressGradient, { width: `${Math.min(progress, 100)}%` }]}
              />
            </Animated.View>
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </Animated.View>

        {/* Encouraging message */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(500)}
          style={styles.encouragementContainer}
        >
          <Text style={styles.encouragement}>
            This won't take long. We're analyzing your performance to give you the best feedback.
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  emojiContainer: {
    position: 'relative',
    marginBottom: spacing['2xl'],
  },
  emoji: {
    fontSize: 80,
    textAlign: 'center',
  },
  emojiGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 100,
    height: 100,
    marginLeft: -50,
    marginTop: -50,
    backgroundColor: colors.glow.primary,
    borderRadius: 50,
    opacity: 0.3,
    shadowColor: colors.glow.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    gap: spacing.sm,
    marginBottom: spacing['2xl'],
  },
  waveBar: {
    width: 8,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  waveGradient: {
    width: '100%',
    height: '100%',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
  },
  progressGradient: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  encouragementContainer: {
    paddingHorizontal: spacing.lg,
  },
  encouragement: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: typography.fontSize.sm * 1.5,
    fontStyle: 'italic',
  },
});
