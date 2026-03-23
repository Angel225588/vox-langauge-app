/**
 * AnalyzingScreen — Sound Wave design
 *
 * Premium analyzing experience with:
 * - 20-bar sound wave visualization (blue→teal gradient, staggered bounce)
 * - Floating particles background
 * - Stage chip with blinking dot
 * - Thin gradient progress bar with glowing endpoint
 * - Counter that ticks 1-by-1 from 0→target
 * - Step pills (active/done/pending)
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Types ──────────────────────────────────────────────────
interface AnalyzingScreenProps {
  progress: number; // 0-100
  stage: 'uploading' | 'transcribing' | 'analyzing';
}

// ─── Stage config ───────────────────────────────────────────
const STAGE_CONFIG = {
  uploading: {
    chipLabel: 'Uploading',
    title: 'Preparing your recording',
    subtitle: 'Getting everything ready for analysis',
  },
  transcribing: {
    chipLabel: 'Transcribing',
    title: 'Analyzing your reading',
    subtitle: 'Processing your pronunciation to give you personalized feedback',
  },
  analyzing: {
    chipLabel: 'Analyzing',
    title: 'Evaluating your skills',
    subtitle: 'Measuring clarity, fluency, and articulation',
  },
};

// ─── Wave bar config (20 bars, symmetric bell curve heights) ─
const BAR_COUNT = 20;
const WAVE_BARS = Array.from({ length: BAR_COUNT }, (_, i) => {
  // Bell curve: center bars taller
  const center = (BAR_COUNT - 1) / 2;
  const dist = Math.abs(i - center) / center; // 0 at center, 1 at edges
  const baseHeight = 0.15 + (1 - dist * dist) * 0.85; // quadratic falloff
  // Staggered duration and delay for organic feel
  const duration = 800 + (i % 5) * 120;
  const delay = i * 50;
  // Color: blue edges → teal center
  const t = 1 - dist; // 0 at edges, 1 at center
  return { baseHeight, duration, delay, tealMix: t };
});

// ─── Particle config ────────────────────────────────────────
const PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  left: 10 + Math.random() * 80, // % from left
  duration: 5000 + Math.random() * 4000,
  delay: Math.random() * 3000,
  size: 2 + Math.random() * 2,
  color: ['rgba(0,163,255,0.25)', 'rgba(6,214,160,0.2)', 'rgba(139,92,246,0.2)'][i % 3],
}));

// ─── Floating Particle ─────────────────────────────────────
function FloatingParticle({ config }: { config: typeof PARTICLES[0] }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      config.delay,
      withRepeat(
        withTiming(1, { duration: config.duration, easing: Easing.linear }),
        -1,
        false
      )
    );
  }, []);

  const style = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [0, -600]);
    const opacity = interpolate(progress.value, [0, 0.1, 0.8, 1], [0, 0.8, 0.8, 0]);
    return { transform: [{ translateY }], opacity };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom: 0,
          left: `${config.left}%`,
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
          backgroundColor: config.color,
        },
        style,
      ]}
    />
  );
}

// ─── Wave Bar ───────────────────────────────────────────────
function WaveBar({ config, index }: { config: typeof WAVE_BARS[0]; index: number }) {
  const bounce = useSharedValue(0);

  useEffect(() => {
    bounce.value = withDelay(
      config.delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: config.duration / 2, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: config.duration / 2, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );
  }, []);

  const barStyle = useAnimatedStyle(() => {
    const scaleY = 0.3 + bounce.value * 0.7;
    return { transform: [{ scaleY }] };
  });

  // Gradient from blue (#0036FF) at edges to teal (#06D6A0) at center
  const r = Math.round(0 + config.tealMix * 6);
  const g = Math.round(54 + config.tealMix * (214 - 54));
  const b = Math.round(255 + config.tealMix * (160 - 255));
  const topColor = `rgb(${r},${g},${b})`;
  const bottomColor = `rgba(${r},${g},${b},0.15)`;

  const maxHeight = 130 * config.baseHeight;

  return (
    <Animated.View
      style={[
        {
          width: 4,
          height: maxHeight,
          borderRadius: 4,
          overflow: 'hidden',
        },
        barStyle,
      ]}
    >
      <LinearGradient
        colors={[topColor, bottomColor]}
        style={{ width: '100%', height: '100%' }}
      />
    </Animated.View>
  );
}

// ─── Blinking Dot ───────────────────────────────────────────
function BlinkingDot() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[styles.chipDot, style]} />;
}

// ─── Counting Number (ticks 1-by-1) ────────────────────────
function CountingNumber({ target }: { target: number }) {
  const [display, setDisplay] = useState(0);
  const currentRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) clearInterval(intervalRef.current);

    const targetRounded = Math.round(Math.min(target, 100));

    // If target is ahead, count up; if behind, snap
    if (targetRounded <= currentRef.current) {
      // Don't go backwards — just hold
      return;
    }

    // Tick speed: faster when gap is large, slower when small
    const gap = targetRounded - currentRef.current;
    const tickMs = gap > 20 ? 30 : gap > 5 ? 60 : 80;

    intervalRef.current = setInterval(() => {
      currentRef.current += 1;
      setDisplay(currentRef.current);
      if (currentRef.current >= targetRounded) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, tickMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [target]);

  return (
    <Text style={styles.counterText}>{display}%</Text>
  );
}

// ─── Main Component ─────────────────────────────────────────
export function AnalyzingScreen({ progress, stage }: AnalyzingScreenProps) {
  const stageInfo = STAGE_CONFIG[stage];
  const stageIndex = stage === 'uploading' ? 0 : stage === 'transcribing' ? 1 : 2;

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary]}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating particles */}
      <View style={styles.particlesContainer}>
        {PARTICLES.map(p => (
          <FloatingParticle key={p.id} config={p} />
        ))}
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Sound wave visualization */}
        <Animated.View
          entering={FadeIn.duration(600)}
          style={styles.waveContainer}
        >
          {WAVE_BARS.map((bar, i) => (
            <WaveBar key={i} config={bar} index={i} />
          ))}
          {/* Glow reflection */}
          <View style={styles.waveGlow} />
        </Animated.View>

        {/* Stage chip */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(200)}
          style={styles.stageChip}
        >
          <BlinkingDot />
          <Text style={styles.chipText}>{stageInfo.chipLabel}</Text>
        </Animated.View>

        {/* Title + subtitle */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(300)}
          style={styles.textSection}
        >
          <Text style={styles.title}>{stageInfo.title}</Text>
          <Text style={styles.subtitle}>{stageInfo.subtitle}</Text>
        </Animated.View>

        {/* Progress bar */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(400)}
          style={styles.progressSection}
        >
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]}>
              <LinearGradient
                colors={['#0036FF', '#00A3FF', '#06D6A0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.progressGradient}
              />
              {/* Glowing endpoint dot */}
              <View style={styles.progressDot} />
            </View>
          </View>

          {/* Progress info row */}
          <View style={styles.progressInfo}>
            {/* Step pills */}
            <View style={styles.stepPills}>
              <View style={[
                styles.pill,
                stageIndex >= 1 && styles.pillDone,
                stageIndex === 0 && styles.pillActive,
              ]} />
              <View style={[
                styles.pill,
                stageIndex >= 2 && styles.pillDone,
                stageIndex === 1 && styles.pillActive,
              ]} />
            </View>
            {/* Counter */}
            <CountingNumber target={progress} />
          </View>
        </Animated.View>
      </View>

      {/* Bottom encouragement */}
      <Animated.View
        entering={FadeIn.duration(400).delay(600)}
        style={styles.encouragementContainer}
      >
        <Text style={styles.encouragement}>
          This takes a few seconds. Your detailed feedback is being prepared.
        </Text>
      </Animated.View>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Particles
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },

  // Content
  content: {
    width: '100%',
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },

  // Wave
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 140,
    gap: 3,
    marginBottom: 48,
    position: 'relative',
  },
  waveGlow: {
    position: 'absolute',
    bottom: -16,
    width: 200,
    height: 32,
    left: '50%',
    marginLeft: -100,
    backgroundColor: 'rgba(0,163,255,0.08)',
    borderRadius: 100,
    // blur simulated via shadow on iOS
    shadowColor: '#00A3FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },

  // Stage chip
  stageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(0,163,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,163,255,0.15)',
    borderRadius: borderRadius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00A3FF',
    shadowColor: '#00A3FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  chipText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: '#00A3FF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Text section
  textSection: {
    alignItems: 'center',
    marginBottom: 48,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize['2xl'] + 2,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: typography.fontSize.base * 1.5,
    maxWidth: 280,
  },

  // Progress
  progressSection: {
    width: '100%',
    maxWidth: 300,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 2,
    overflow: 'visible',
    marginBottom: spacing.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    overflow: 'visible',
    position: 'relative',
  },
  progressGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 2,
  },
  progressDot: {
    position: 'absolute',
    right: -5,
    top: -3,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#06D6A0',
    shadowColor: '#06D6A0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepPills: {
    flexDirection: 'row',
    gap: 4,
  },
  pill: {
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  pillActive: {
    width: 32,
    backgroundColor: '#00A3FF',
  },
  pillDone: {
    backgroundColor: colors.success.DEFAULT,
  },
  counterText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    fontVariant: ['tabular-nums'],
  },

  // Encouragement
  encouragementContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl + spacing.lg,
  },
  encouragement: {
    fontSize: typography.fontSize.sm,
    color: colors.text.disabled,
    textAlign: 'center',
    lineHeight: typography.fontSize.sm * 1.5,
  },
});
