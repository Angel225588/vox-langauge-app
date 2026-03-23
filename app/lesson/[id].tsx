/**
 * Lesson Screen — Two-Zone Carousel Layout
 *
 * Premium dark glassmorphic lesson screen with:
 * - TOP ZONE: Session Info Hero Card (~30% screen) with badges, meta, quote
 * - Natural flex space
 * - BOTTOM ZONE: 3D activity carousel + page dots + START button
 *
 * Flow: stair ID from route → load stair data → generateLessonPlan → display
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  colors,
  typography,
  spacing,
  borderRadius,
} from '@/constants/designSystem';
import {
  generateLessonPlan,
  getLessonQuote,
  getLevelGroup,
  generateDiscoveryLessonContent,
  generateStairLessonContent,
  type LessonPlan,
  type LessonActivity,
} from '@/lib/lesson';
import { useOnboardingV3 } from '@/hooks/useOnboardingV3';
import { useAuth } from '@/hooks/useAuth';
import { useLearningPath, type StairForDisplay } from '@/hooks/useLearningPath';
import { loadPreviewStairs } from '@/lib/services/previewStairs';
import { storeActiveLessonPlan } from '@/app/lesson-session';

// ─── Responsive Dimensions ─────────────────────────

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SIDE_PADDING = spacing.lg; // 24pt

// Card sizing: ~2 cards visible, slightly larger
const CARD_GAP = spacing.md; // 16pt
const CARD_WIDTH = Math.round((SCREEN_WIDTH - SIDE_PADDING * 2 - CARD_GAP) / 1.85);
const CARD_HEIGHT = Math.round(CARD_WIDTH * 1.25); // tall portrait cards
const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;

// ─── Activity Theme Config ─────────────────────────

interface ActivityTheme {
  color: string;
  blobColor: string;
  iconBg: string;
  icon: keyof typeof Ionicons.glyphMap;
  subtitle: string;
}

const ACTIVITY_THEMES: Record<string, ActivityTheme> = {
  vocabulary: {
    color: '#3D6BFF',
    blobColor: 'rgba(61, 107, 255, 0.14)',
    iconBg: 'rgba(61, 107, 255, 0.18)',
    icon: 'book-outline',
    subtitle: '5 Words',
  },
  listening: {
    color: '#06D6A0',
    blobColor: 'rgba(6, 214, 160, 0.14)',
    iconBg: 'rgba(6, 214, 160, 0.18)',
    icon: 'headset-outline',
    subtitle: '1 Dialogue',
  },
  reading: {
    color: '#F59E0B',
    blobColor: 'rgba(245, 158, 11, 0.14)',
    iconBg: 'rgba(245, 158, 11, 0.18)',
    icon: 'reader-outline',
    subtitle: '1 Passage',
  },
  voice_call: {
    color: '#8B5CF6',
    blobColor: 'rgba(139, 92, 246, 0.14)',
    iconBg: 'rgba(139, 92, 246, 0.18)',
    icon: 'mic-outline',
    subtitle: '30s Call',
  },
  writing: {
    color: '#EC4899',
    blobColor: 'rgba(236, 72, 153, 0.14)',
    iconBg: 'rgba(236, 72, 153, 0.18)',
    icon: 'create-outline',
    subtitle: '1 Prompt',
  },
};

const LOCKED_THEME: ActivityTheme = {
  color: '#4A5068',
  blobColor: 'rgba(74, 80, 104, 0.08)',
  iconBg: 'rgba(74, 80, 104, 0.15)',
  icon: 'ellipse-outline',
  subtitle: '',
};

function getTheme(type: string, isLocked: boolean): ActivityTheme {
  if (isLocked) {
    const base = ACTIVITY_THEMES[type] || LOCKED_THEME;
    return { ...LOCKED_THEME, icon: base.icon, subtitle: base.subtitle };
  }
  return ACTIVITY_THEMES[type] || LOCKED_THEME;
}

// ─── Main Screen ────────────────────────────────────

export default function LessonScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { proficiency_level } = useOnboardingV3();
  const { user } = useAuth();
  const { stairs: pathStairs } = useLearningPath(user?.id ?? null);
  const insets = useSafeAreaInsets();

  const [stair, setStair] = useState<StairForDisplay | null>(null);
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  // Load stair data and generate lesson plan
  useEffect(() => {
    async function load() {
      setIsLoading(true);

      // Try to find the stair from the learning path first
      let foundStair = pathStairs.find((s) => s.id === id) || null;

      // If not found in path, try preview stairs
      if (!foundStair) {
        const previewStairs = await loadPreviewStairs();
        if (previewStairs) {
          foundStair = previewStairs.find((s) => s.id === id) || null;
        }
      }

      // Fallback: construct a minimal stair from the ID
      if (!foundStair) {
        foundStair = {
          id: id || 'unknown',
          order: 1,
          title: 'Lesson',
          emoji: 'chatbubble-outline',
          description: 'Practice and improve your skills',
          status: 'current',
          vocabulary_count: 5,
          estimated_days: 1,
        };
      }

      setStair(foundStair);

      // Generate lesson plan (async — reorders by weakness)
      const isFirstLesson = foundStair.order === 1;
      const plan = await generateLessonPlan(
        foundStair,
        proficiency_level,
        isFirstLesson,
        undefined,
        user?.id,
      );
      setLessonPlan(plan);
      setIsLoading(false);
    }

    load();
  }, [id, pathStairs, proficiency_level, user?.id]);

  const levelGroup = getLevelGroup(proficiency_level);
  const isDiscovery = stair?.order === 1;
  const quote = getLessonQuote(levelGroup, isDiscovery || false);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleStart = useCallback(async () => {
    if (!lessonPlan) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await storeActiveLessonPlan(lessonPlan);

    // Pre-generate content in background (fire-and-forget)
    // This warms the AsyncStorage cache so lesson-session picks it up instantly
    const preGenFn = lessonPlan.is_discovery
      ? generateDiscoveryLessonContent
      : generateStairLessonContent;
    preGenFn(lessonPlan, user?.id || 'anonymous').catch((err) =>
      console.warn('[LessonScreen] Content pre-gen failed:', err)
    );

    router.push('/lesson-session');
  }, [lessonPlan, user, router]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / SNAP_INTERVAL);
      const activities = lessonPlan?.activities || [];
      setActiveCardIndex(Math.max(0, Math.min(index, activities.length - 1)));
    },
    [lessonPlan],
  );

  const handleDotPress = useCallback((index: number) => {
    scrollRef.current?.scrollTo({ x: index * SNAP_INTERVAL, animated: true });
    setActiveCardIndex(index);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // ─── Loading State ──────────────────────────────────

  if (isLoading || !stair || !lessonPlan) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.light} />
        <Text style={styles.loadingText}>Preparing your lesson...</Text>
      </View>
    );
  }

  const activities = lessonPlan.activities;
  const levelLabel = levelGroup.charAt(0).toUpperCase() + levelGroup.slice(1);

  return (
    <View style={styles.root}>
      {/* ─── Back Button ─────────────────────────── */}
      <View style={[styles.backRow, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* ─── TOP ZONE: Session Info Hero ──────────── */}
      <Animated.View
        entering={FadeIn.duration(600)}
        style={styles.sessionCardContainer}
      >
        <LinearGradient
          colors={['#1B3A5C', '#163350', '#0F2740', '#0A1E33']}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={styles.sessionCard}
        >
          {/* Decorative depth shapes */}
          <View style={styles.decor1} />
          <View style={styles.decor2} />

          {/* 3D top-edge highlight */}
          <View style={styles.cardHighlight} />

          {/* Badge row */}
          <Animated.View
            entering={FadeInDown.duration(400).delay(150)}
            style={styles.badgeRow}
          >
            <View style={styles.badge}>
              <Text style={styles.badgeText}>SESSION</Text>
            </View>
            {isDiscovery && (
              <View style={[styles.badge, styles.discoveryBadge]}>
                <Ionicons name="compass-outline" size={10} color={colors.primary.light} />
                <Text style={[styles.badgeText, { color: colors.primary.light }]}>
                  DISCOVERY
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Title */}
          <Animated.View entering={FadeInDown.duration(500).delay(250)}>
            <Text style={styles.sessionTitle} numberOfLines={2}>
              {stair.title}
            </Text>
          </Animated.View>

          {/* Meta row: time + activity count + level */}
          <Animated.View
            entering={FadeInDown.duration(400).delay(350)}
            style={styles.metaRow}
          >
            <View style={styles.metaPill}>
              <Ionicons name="time-outline" size={13} color="rgba(255,255,255,0.5)" />
              <Text style={styles.metaText}>{lessonPlan.estimated_minutes} min</Text>
            </View>
            <View style={styles.metaDot} />
            <View style={styles.metaPill}>
              <Ionicons name="layers-outline" size={13} color="rgba(255,255,255,0.5)" />
              <Text style={styles.metaText}>{activities.length} activities</Text>
            </View>
            <View style={styles.metaDot} />
            <View style={styles.metaPill}>
              <Ionicons name="school-outline" size={13} color="rgba(255,255,255,0.5)" />
              <Text style={styles.metaText}>{levelLabel}</Text>
            </View>
          </Animated.View>

          {/* Quote footer */}
          <Animated.View entering={FadeInDown.duration(400).delay(450)}>
            <Text style={styles.quoteFooter} numberOfLines={2}>
              {quote}
            </Text>
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      {/* ─── FLEX SPACE (natural gap between zones) ─── */}
      <View style={{ flex: 1 }} />

      {/* ─── BOTTOM ZONE: Carousel + Dots + START ──── */}
      <View>
        {/* Section Title */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(400)}
          style={styles.sectionHeader}
        >
          <Text style={styles.sectionTitle}>Your Activities</Text>
        </Animated.View>

        {/* Activity Carousel */}
        <Animated.View entering={FadeInDown.duration(450).delay(500)}>
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={SNAP_INTERVAL}
            snapToAlignment="start"
            contentContainerStyle={styles.carouselContent}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {activities.map((activity, index) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                index={index}
              />
            ))}
          </ScrollView>
        </Animated.View>

        {/* Page Indicator Dots */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(600)}
          style={styles.dotsContainer}
        >
          {activities.map((act, index) => {
            const isActive = index === activeCardIndex;
            const dotColor = isActive
              ? getTheme(act.type, act.status === 'locked').color
              : 'rgba(255,255,255,0.12)';
            return (
              <TouchableOpacity
                key={`dot-${index}`}
                onPress={() => handleDotPress(index)}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
              >
                <View
                  style={[
                    styles.dot,
                    isActive && styles.dotActive,
                    { backgroundColor: dotColor },
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        {/* START Button */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(700)}
          style={[styles.startContainer, { paddingBottom: Math.max(insets.bottom + spacing.sm, spacing.lg) }]}
        >
          <TouchableOpacity
            onPress={handleStart}
            activeOpacity={0.85}
            style={styles.startTouchable}
          >
            <LinearGradient
              colors={colors.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startGradient}
            >
              <Text style={styles.startText}>START</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

// ─── 3D Activity Card ─────────────────────────────────

function ActivityCard({
  activity,
  index,
}: {
  activity: LessonActivity;
  index: number;
}) {
  const isCurrent = activity.status === 'current';
  const isCompleted = activity.status === 'completed';
  const isLocked = activity.status === 'locked';

  const theme = getTheme(activity.type, isLocked);

  // 3D illumination gradient
  const surfaceTop = isCurrent ? 'rgba(35,42,72,0.98)' : 'rgba(28,33,58,0.95)';
  const surfaceBottom = isCurrent ? 'rgba(18,22,46,0.98)' : 'rgba(14,18,38,0.95)';

  // Progress
  const progressWidth = isCompleted ? '100%' : isCurrent ? '0%' : '0%';
  const progressColor = isCompleted ? colors.success.DEFAULT : theme.color;

  return (
    <Animated.View
      entering={FadeInDown.duration(450).delay(530 + index * 120).springify()}
      style={[styles.cardOuter, { marginRight: CARD_GAP }]}
    >
      <LinearGradient
        colors={[surfaceTop, surfaceBottom]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.cardSurface}
      >
        {/* 3D top-edge highlight */}
        <View style={styles.cardTopEdge} />

        {/* Organic blob — top-right */}
        <View
          style={[
            styles.blob,
            { backgroundColor: isLocked ? 'rgba(74,80,104,0.06)' : theme.blobColor },
          ]}
        />
        {/* Secondary blob — bottom-left */}
        <View
          style={[
            styles.blobSmall,
            { backgroundColor: isLocked ? 'rgba(74,80,104,0.04)' : theme.blobColor },
          ]}
        />

        {/* Icon circle */}
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: isLocked ? 'rgba(74,80,104,0.15)' : theme.iconBg,
              borderColor: isLocked ? 'rgba(74,80,104,0.20)' : theme.color + '25',
            },
          ]}
        >
          <Ionicons
            name={theme.icon as any}
            size={28}
            color={isLocked ? '#4A5068' : isCompleted ? colors.success.DEFAULT : theme.color}
          />
        </View>

        {/* Activity name */}
        <Text
          style={[
            styles.cardLabel,
            isLocked && { color: '#4A5068' },
            isCompleted && { color: colors.success.light },
          ]}
          numberOfLines={1}
        >
          {activity.label}
        </Text>

        {/* Subtitle */}
        <Text
          style={[
            styles.cardSubtitle,
            isLocked && { color: '#3A3F55' },
          ]}
        >
          {theme.subtitle}
        </Text>

        {/* Progress bar — full width at bottom */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: progressWidth as any,
                backgroundColor: isLocked ? '#2A2F45' : progressColor,
              },
            ]}
          />
        </View>

        {/* Current glow ring */}
        {isCurrent && (
          <View style={[styles.currentGlow, { borderColor: theme.color + '40' }]} />
        )}

        {/* Completed check */}
        {isCompleted && (
          <View style={styles.completedCheck}>
            <Ionicons name="checkmark-circle" size={22} color={colors.success.DEFAULT} />
          </View>
        )}

        {/* Order badge — top-left */}
        <View
          style={[
            styles.orderBadge,
            {
              backgroundColor: isCurrent
                ? theme.color + '30'
                : isCompleted
                  ? colors.success.DEFAULT + '20'
                  : 'rgba(255,255,255,0.06)',
            },
          ]}
        >
          {isCompleted ? (
            <Ionicons name="checkmark" size={12} color={colors.success.DEFAULT} />
          ) : (
            <Text
              style={[
                styles.orderNumber,
                isCurrent && { color: theme.color },
              ]}
            >
              {activity.order}
            </Text>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

// ─── Styles ─────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },

  // ─── Back Button ──────────────────────────────
  backRow: {
    paddingHorizontal: SIDE_PADDING,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── Session Info Card (Hero — 30-35% of screen) ──
  sessionCardContainer: {
    paddingHorizontal: SIDE_PADDING,
    marginTop: spacing.md,
  },
  sessionCard: {
    borderRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    overflow: 'hidden',
    position: 'relative',
    minHeight: Math.round(SCREEN_HEIGHT * 0.28),
    justifyContent: 'center',
  },
  decor1: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.025)',
  },
  decor2: {
    position: 'absolute',
    bottom: -15,
    left: -25,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(100,180,255,0.03)',
  },
  cardHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  // Badge row
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm + 2,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: 5,
  },
  discoveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 54, 255, 0.12)',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.2,
  },

  // Title
  sessionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F0F2F8',
    lineHeight: 30,
    letterSpacing: -0.3,
    marginBottom: spacing.md,
  },

  // Meta row
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    flexWrap: 'wrap',
    gap: 6,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.45)',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  // Quote footer
  quoteFooter: {
    fontSize: 12,
    fontWeight: '400',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.28)',
    letterSpacing: 0.1,
  },

  // ─── Section Header ──────────────────────────
  sectionHeader: {
    paddingHorizontal: SIDE_PADDING,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -0.3,
  },

  // ─── Carousel ─────────────────────────────────
  carouselContent: {
    paddingLeft: SIDE_PADDING,
    paddingRight: SIDE_PADDING,
  },

  // ─── 3D Activity Card ─────────────────────────
  cardOuter: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    // 3D shadow — soft depth, no visible line
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 6,
  },
  cardSurface: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    padding: spacing.md + 2,
    paddingTop: spacing.xl + spacing.md,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  cardTopEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },

  // Organic blobs
  blob: {
    position: 'absolute',
    top: -20,
    right: -15,
    width: CARD_WIDTH * 0.6,
    height: CARD_WIDTH * 0.6,
    borderRadius: CARD_WIDTH * 0.3,
  },
  blobSmall: {
    position: 'absolute',
    bottom: -10,
    left: -10,
    width: CARD_WIDTH * 0.3,
    height: CARD_WIDTH * 0.3,
    borderRadius: CARD_WIDTH * 0.15,
  },

  // Icon
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: spacing.sm + 2,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E8EAF0',
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: spacing.md,
  },

  // Progress bar
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Current glow
  currentGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    borderWidth: 1.5,
  },

  // Order badge (top-left)
  orderBadge: {
    position: 'absolute',
    top: spacing.sm + 2,
    left: spacing.sm + 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
  },

  // Completed check
  completedCheck: {
    position: 'absolute',
    top: spacing.sm + 2,
    right: spacing.sm + 2,
  },

  // ─── Page Indicator Dots ──────────────────────
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm + 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    height: 8,
    borderRadius: 4,
  },

  // ─── START Button ─────────────────────────────
  startContainer: {
    paddingHorizontal: SIDE_PADDING,
    paddingTop: spacing.md,
  },
  startTouchable: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  startGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + 2,
    gap: spacing.sm,
  },
  startText: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
});
