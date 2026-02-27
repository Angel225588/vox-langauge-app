/**
 * Lesson Complete Screen
 *
 * Post-lesson success/completion screen showing KPI scores,
 * CEFR discovery badge, stats, and animated celebrations.
 * Professional tone — Ionicons only, no emojis.
 */

import { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withSpring,
  withDelay,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, glass } from '@/constants/designSystem';
import { advanceStairProgression } from '@/lib/services/previewStairs';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── Types ───────────────────────────────────────────────────
interface LessonScores {
  articulation: number;
  fluency: number;
  communication: number;
  scenario: number;
  wordsLearned?: number;
  pointsEarned?: number;
  timeSpent?: number; // seconds
  cefrLevel?: string;
}

// ─── Constants ───────────────────────────────────────────────
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CEFR_MESSAGES: Record<string, string> = {
  A1: "You're just getting started -- every expert was once a beginner.",
  A2: 'You already understand basic conversations -- let\'s build on that.',
  B1: 'You can handle everyday situations -- time to go deeper.',
  B2: 'Strong foundation -- let\'s refine your professional communication.',
  C1: 'Impressive skills -- let\'s polish the details.',
  C2: 'Near-native level -- let\'s perfect your expertise.',
};

const KPI_CONFIG = [
  {
    key: 'articulation' as const,
    label: 'Articulation',
    icon: 'mic-outline' as const,
    color: '#00A3FF',       // Blue
    bgColor: 'rgba(0, 163, 255, 0.12)',
  },
  {
    key: 'fluency' as const,
    label: 'Fluency',
    icon: 'speedometer-outline' as const,
    color: '#06D6A0',       // Teal
    bgColor: 'rgba(6, 214, 160, 0.12)',
  },
  {
    key: 'communication' as const,
    label: 'Communication',
    icon: 'chatbubbles-outline' as const,
    color: '#8B5CF6',       // Purple
    bgColor: 'rgba(139, 92, 246, 0.12)',
  },
  {
    key: 'scenario' as const,
    label: 'Scenario',
    icon: 'briefcase-outline' as const,
    color: '#F59E0B',       // Amber
    bgColor: 'rgba(245, 158, 11, 0.12)',
  },
];

// ─── Ring size ───────────────────────────────────────────────
const RING_SIZE = 80;
const RING_STROKE = 5;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// ─── Sparkle particle data (pre-computed for confetti) ──────
const SPARKLE_COUNT = 18;
const SPARKLES = Array.from({ length: SPARKLE_COUNT }, (_, i) => ({
  id: i,
  startX: (Math.random() - 0.5) * SCREEN_WIDTH * 0.9,
  startY: -20 - Math.random() * 60,
  endX: (Math.random() - 0.5) * SCREEN_WIDTH * 1.2,
  endY: 200 + Math.random() * 300,
  rotation: Math.random() * 360,
  size: 4 + Math.random() * 6,
  delay: Math.random() * 600,
  color: [
    '#00A3FF', '#06D6A0', '#8B5CF6', '#F59E0B',
    '#0036FF', '#EC4899', '#06B6D4', '#F97316',
  ][Math.floor(Math.random() * 8)],
}));

// ─── Sparkle Particle Component ─────────────────────────────
function SparkleParticle({ config }: { config: typeof SPARKLES[0] }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      config.delay,
      withSequence(
        withTiming(1, { duration: 2500, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 1000, easing: Easing.in(Easing.quad) }),
      ),
    );
  }, []);

  const animStyle = useAnimatedStyle(() => {
    const x = interpolate(progress.value, [0, 1], [config.startX, config.endX]);
    const y = interpolate(progress.value, [0, 1], [config.startY, config.endY]);
    const opacity = progress.value < 0.1 ? progress.value * 10 : progress.value > 0.7 ? (1 - progress.value) / 0.3 : 1;
    const rotate = interpolate(progress.value, [0, 1], [0, config.rotation]);
    const scale = interpolate(progress.value, [0, 0.3, 1], [0.3, 1, 0.5]);
    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { rotate: `${rotate}deg` },
        { scale },
      ],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
          backgroundColor: config.color,
        },
        animStyle,
      ]}
    />
  );
}

// ─── Confetti Container ─────────────────────────────────────
function ConfettiEffect() {
  return (
    <View style={styles.confettiContainer} pointerEvents="none">
      {SPARKLES.map((sparkle) => (
        <SparkleParticle key={sparkle.id} config={sparkle} />
      ))}
    </View>
  );
}

// ─── Animated Score Ring ────────────────────────────────────
function ScoreRing({
  score,
  color,
  bgColor,
  icon,
  label,
  delay,
}: {
  score: number;
  color: string;
  bgColor: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  delay: number;
}) {
  const ringProgress = useSharedValue(0);

  useEffect(() => {
    ringProgress.value = withDelay(
      delay,
      withSpring(score / 100, { damping: 15, stiffness: 150 }),
    );
  }, [score]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - ringProgress.value),
  }));

  const numberOpacity = useSharedValue(0);
  useEffect(() => {
    numberOpacity.value = withDelay(delay + 200, withTiming(1, { duration: 400 }));
  }, []);
  const numberStyle = useAnimatedStyle(() => ({ opacity: numberOpacity.value }));

  return (
    <View style={[styles.scoreRingCard, { backgroundColor: bgColor }]}>
      {/* Ring */}
      <View style={styles.ringOuter}>
        <Svg width={RING_SIZE} height={RING_SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
          {/* Background circle */}
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke={color + '20'}
            strokeWidth={RING_STROKE}
            fill="transparent"
          />
          {/* Animated progress circle */}
          <AnimatedCircle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke={color}
            strokeWidth={RING_STROKE}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            animatedProps={animatedProps}
          />
        </Svg>
        {/* Center content (icon + score) positioned absolutely */}
        <Animated.View style={[styles.ringCenter, numberStyle]}>
          <Ionicons name={icon} size={16} color={color} style={{ marginBottom: 2 }} />
          <Text style={[styles.ringScore, { color }]}>{score}</Text>
        </Animated.View>
      </View>
      <Text style={styles.ringLabel}>{label}</Text>
    </View>
  );
}

// ─── Main Screen ────────────────────────────────────────────
export default function LessonCompleteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    scores: string;
    stairTitle: string;
    stairId: string;
    isDiscovery: string;
  }>();

  // Parse scores
  const scores: LessonScores = useMemo(() => {
    try {
      return JSON.parse(params.scores || '{}');
    } catch {
      return { articulation: 0, fluency: 0, communication: 0, scenario: 0 };
    }
  }, [params.scores]);

  const isDiscovery = params.isDiscovery === 'true';
  const stairTitle = params.stairTitle || 'Lesson';
  const cefrLevel = scores.cefrLevel || 'A2';

  // Trophy glow animation
  const trophyGlow = useSharedValue(0.6);
  useEffect(() => {
    trophyGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);

  const trophyGlowStyle = useAnimatedStyle(() => ({
    opacity: trophyGlow.value,
  }));

  // Stats
  const wordsLearned = scores.wordsLearned ?? 0;
  const pointsEarned = scores.pointsEarned ?? 0;
  const timeSpent = scores.timeSpent ?? 0;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes === 0) return `${secs}s`;
    return `${minutes}m ${secs}s`;
  };

  const handleContinue = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Advance stair progression: completed stair → next stair unlocked
    if (params.stairId) {
      await advanceStairProgression(params.stairId);
    }

    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Confetti */}
        <ConfettiEffect />

        {/* ═══ Celebration Header ═══ */}
        <Animated.View
          entering={FadeIn.duration(600).delay(100)}
          style={styles.headerSection}
        >
          {/* Trophy icon with glow */}
          <View style={styles.trophyContainer}>
            <Animated.View style={[styles.trophyGlow, trophyGlowStyle]} />
            <View style={styles.trophyCircle}>
              <Ionicons name="trophy" size={40} color="#F59E0B" />
            </View>
          </View>

          <Text style={styles.title}>Lesson Complete</Text>
          <Text style={styles.subtitle}>{stairTitle}</Text>
        </Animated.View>

        {/* ═══ CEFR Discovery Badge ═══ */}
        {isDiscovery && (
          <Animated.View
            entering={FadeInDown.duration(500).delay(300)}
            style={styles.cefrSection}
          >
            <LinearGradient
              colors={['rgba(0, 54, 255, 0.12)', 'rgba(0, 163, 255, 0.06)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cefrCard}
            >
              <View style={styles.cefrBadge}>
                <Text style={styles.cefrBadgeText}>{cefrLevel}</Text>
              </View>
              <View style={styles.cefrTextContainer}>
                <Text style={styles.cefrTitle}>Your starting point: {cefrLevel}</Text>
                <Text style={styles.cefrMessage}>
                  {CEFR_MESSAGES[cefrLevel] || CEFR_MESSAGES.A2}
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        {/* ═══ 4 KPI Score Cards (2x2) ═══ */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(isDiscovery ? 500 : 350)}
          style={styles.kpiGrid}
        >
          {KPI_CONFIG.map((kpi, index) => (
            <ScoreRing
              key={kpi.key}
              score={scores[kpi.key] ?? 0}
              color={kpi.color}
              bgColor={kpi.bgColor}
              icon={kpi.icon}
              label={kpi.label}
              delay={600 + index * 150}
            />
          ))}
        </Animated.View>

        {/* ═══ Stats Row ═══ */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(isDiscovery ? 700 : 550)}
          style={styles.statsRow}
        >
          <View style={styles.statItem}>
            <View style={styles.statIconCircle}>
              <Ionicons name="book-outline" size={18} color={colors.text.secondary} />
            </View>
            <Text style={styles.statValue}>{wordsLearned}</Text>
            <Text style={styles.statLabel}>Words</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={styles.statIconCircle}>
              <Ionicons name="star-outline" size={18} color={colors.text.secondary} />
            </View>
            <Text style={styles.statValue}>{pointsEarned}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={styles.statIconCircle}>
              <Ionicons name="time-outline" size={18} color={colors.text.secondary} />
            </View>
            <Text style={styles.statValue}>{formatTime(timeSpent)}</Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>
        </Animated.View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* ═══ Continue Button ═══ */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(isDiscovery ? 900 : 750)}
          style={styles.buttonContainer}
        >
          <TouchableOpacity
            onPress={handleContinue}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={colors.gradients.success}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.continueButton}
            >
              <Text style={styles.continueText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.text.primary} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },

  // Confetti
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 400,
    alignItems: 'center',
    overflow: 'hidden',
    zIndex: 10,
  },

  // Header
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    zIndex: 1,
  },
  trophyContainer: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  trophyGlow: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  trophyCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
    textAlign: 'center',
  },

  // CEFR Discovery
  cefrSection: {
    marginBottom: spacing.lg,
  },
  cefrCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 54, 255, 0.20)',
    gap: spacing.md,
  },
  cefrBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 54, 255, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(0, 54, 255, 0.40)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cefrBadgeText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.extrabold,
    color: '#3D6BFF',
  },
  cefrTextContainer: {
    flex: 1,
  },
  cefrTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  cefrMessage: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.secondary,
    lineHeight: 20,
  },

  // KPI Grid
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  scoreRingCard: {
    width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.sm) / 2,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: glass.border.subtle,
  },

  // Ring
  ringOuter: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    position: 'relative',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringScore: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.extrabold,
  },
  ringLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: glass.surface.light,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: glass.border.subtle,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: glass.surface.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: glass.border.light,
    marginHorizontal: spacing.sm,
  },

  // Continue Button
  buttonContainer: {
    paddingTop: spacing.md,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.lg,
  },
  continueText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
});
