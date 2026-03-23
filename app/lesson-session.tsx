/**
 * Lesson Session Orchestrator
 *
 * Sequences through lesson activities one by one:
 * vocabulary → listening → reading → voice_call → writing → complete
 *
 * Receives the full lesson plan via route params, tracks which
 * activity is current, collects scores, and navigates to
 * lesson-complete when all activities are done.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/designSystem';
import {
  advanceActivity,
  calculateLessonScores,
  generateDiscoveryLessonContent,
  generateSingleActivityContent,
  generateRemainingActivities,
  generateStairLessonContent,
  generateRemainingStairActivities,
  generateLessonPlan,
  getLevelGroup,
  type LessonPlan,
  type LessonActivity,
  type DiscoveryLessonContent,
  type ActivityType,
  type LevelGroup,
  type VocabularyContent,
  type ListeningContent,
  type ReadingContent,
  type WritingContent,
  type VoiceCallContent,
} from '@/lib/lesson';
import { getKeepGoingActivities, getWeaknessOrder } from '@/lib/lesson/activityOrderer';
import { getActivityColor, getActivityLabel } from '@/lib/lesson/lessonTemplates';

// Lazy imports for practice screens
import { VocabularyPracticeScreen } from '@/components/cards/vocabulary/VocabularyPracticeScreen';
import { useStairContent } from '@/hooks/useStairContent';
import { useAuth } from '@/hooks/useAuth';
import { useWordPriority } from '@/lib/word-bank';
import { bankWordToVocabularyItem } from '@/lib/word-bank/adapter';
import { updateStreakData } from '@/lib/db/sqlite';
import { loadPreviewStairs } from '@/lib/services/previewStairs';
import { useOnboardingV3 } from '@/hooks/useOnboardingV3';

const LESSON_PLAN_KEY = 'vox-active-lesson-plan';
const ACTIVITY_COMPLETE_KEY = 'vox-activity-completion';
const STAIRCASE_COUNT_PREFIX = 'vox_staircase_activity_count_';
const MAX_STAIRCASE_ACTIVITIES = 20;

// ─── Timeout Constants ────────────────────────────
const DISCOVERY_CONTENT_TIMEOUT_MS = 10_000; // 10s for primary content generation
const BACKGROUND_GEN_TIMEOUT_MS = 15_000;    // 15s for background remaining activities
const LOADING_UX_TIMEOUT_MS = 12_000;         // 12s before showing "taking longer" message

/** Race a promise against a timeout. Returns null if the timeout fires first. */
function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) =>
      setTimeout(() => {
        console.warn(`[LessonSession] ${label} timed out after ${ms}ms`);
        resolve(null);
      }, ms),
    ),
  ]);
}

// ─── Storage Helpers ───────────────────────────────

export async function storeActiveLessonPlan(plan: LessonPlan): Promise<void> {
  await AsyncStorage.setItem(LESSON_PLAN_KEY, JSON.stringify(plan));
}

export async function loadActiveLessonPlan(): Promise<LessonPlan | null> {
  try {
    const json = await AsyncStorage.getItem(LESSON_PLAN_KEY);
    if (!json) return null;
    return JSON.parse(json);
  } catch {
    // Corrupt data — clear and return null
    await AsyncStorage.removeItem(LESSON_PLAN_KEY).catch(() => {});
    return null;
  }
}

export async function clearActiveLessonPlan(): Promise<void> {
  await AsyncStorage.removeItem(LESSON_PLAN_KEY);
}

// ─── Activity Completion Signal ───────────────────
// Practice screens write this before navigating back to lesson-session.
// Lesson-session reads + clears it on mount to advance the plan.

interface ActivityCompletion {
  activityId: string;
  score: number;
}

export async function storeActivityCompletion(
  activityId: string,
  score: number,
): Promise<void> {
  await AsyncStorage.setItem(
    ACTIVITY_COMPLETE_KEY,
    JSON.stringify({ activityId, score }),
  );
}

async function loadActivityCompletion(): Promise<ActivityCompletion | null> {
  const json = await AsyncStorage.getItem(ACTIVITY_COMPLETE_KEY);
  if (!json) return null;
  return JSON.parse(json);
}

async function clearActivityCompletion(): Promise<void> {
  await AsyncStorage.removeItem(ACTIVITY_COMPLETE_KEY);
}

// ─── Staircase Activity Count Tracking ──────────────

async function getStaircaseActivityCount(stairId: string): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(`${STAIRCASE_COUNT_PREFIX}${stairId}`);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

async function incrementStaircaseActivityCount(stairId: string, count: number = 1): Promise<number> {
  const current = await getStaircaseActivityCount(stairId);
  const updated = current + count;
  await AsyncStorage.setItem(`${STAIRCASE_COUNT_PREFIX}${stairId}`, String(updated));
  return updated;
}

// ─── 80% Pre-Generation Trigger ──────────────────

/**
 * When a user reaches 80% completion of their current stair's activities,
 * pre-generate content for the next stair in the background.
 * This prevents wait time when they start the next lesson.
 */
async function maybePreGenerateNextStair(
  plan: LessonPlan,
  userId: string,
): Promise<void> {
  const completed = plan.activities.filter((a) => a.status === 'completed').length;
  const total = plan.activities.length;
  const ratio = completed / total;

  if (ratio < 0.8) return; // Not at 80% yet

  console.log(`[LessonSession] 80% threshold reached (${completed}/${total}). Pre-generating next stair content.`);

  try {
    // Find the next stair from preview stairs (AsyncStorage)
    const stairs = await loadPreviewStairs();
    if (!stairs || stairs.length === 0) return;

    const currentIndex = stairs.findIndex((s) => s.id === plan.stair_id);
    if (currentIndex === -1 || currentIndex + 1 >= stairs.length) return;

    const nextStair = stairs[currentIndex + 1];
    if (nextStair.status !== 'locked') return; // Already unlocked/completed

    // Generate a lesson plan for the next stair
    const proficiency = useOnboardingV3.getState().proficiency_level;
    const nextPlan = await generateLessonPlan(nextStair, proficiency, false, undefined, userId);

    // Pre-generate content (fire-and-forget, this is background work)
    generateStairLessonContent(nextPlan, userId).then(() => {
      console.log(`[LessonSession] Pre-generated content for next stair: ${nextStair.title}`);
    }).catch((err) => {
      console.warn('[LessonSession] Pre-generation for next stair failed (non-critical):', err);
    });
  } catch (err) {
    console.warn('[LessonSession] maybePreGenerateNextStair error:', err);
  }
}

// ─── Calm Transition Messages ─────────────────────

const CALM_TRANSITION_MS = 3000; // 3 seconds auto-advance

interface CalmConfig {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  title: string;
  subtitle: string;
}

const CALM_CONFIGS: Record<ActivityType, CalmConfig> = {
  listening: {
    icon: 'headset-outline',
    color: '#06D6A0',
    title: 'Time to listen',
    subtitle: 'Focus on understanding the conversation',
  },
  reading: {
    icon: 'reader-outline',
    color: '#F59E0B',
    title: 'Time to read',
    subtitle: 'Pay attention to key vocabulary',
  },
  writing: {
    icon: 'create-outline',
    color: '#EC4899',
    title: 'Time to write',
    subtitle: 'Express your ideas',
  },
  voice_call: {
    icon: 'mic-outline',
    color: '#8B5CF6',
    title: 'Time to speak',
    subtitle: 'Practice real conversation',
  },
  vocabulary: {
    icon: 'book-outline',
    color: '#3D6BFF',
    title: 'Vocabulary check',
    subtitle: 'Review the words you have learned',
  },
};

function CalmTransitionScreen({
  activityType,
  activityIndex,
  totalActivities,
  onSkip,
}: {
  activityType: ActivityType;
  activityIndex: number;
  totalActivities: number;
  onSkip: () => void;
}) {
  const config = CALM_CONFIGS[activityType];

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      exiting={FadeOut.duration(300)}
      style={calmStyles.container}
    >
      {/* Progress indicator */}
      <View style={calmStyles.progressRow}>
        {Array.from({ length: totalActivities }).map((_, i) => (
          <View
            key={i}
            style={[
              calmStyles.progressDot,
              {
                backgroundColor:
                  i < activityIndex
                    ? colors.success.DEFAULT
                    : i === activityIndex
                      ? config.color
                      : 'rgba(255,255,255,0.12)',
              },
            ]}
          />
        ))}
      </View>

      {/* Icon */}
      <View style={[calmStyles.iconCircle, { backgroundColor: config.color + '20' }]}>
        <Ionicons name={config.icon as any} size={40} color={config.color} />
      </View>

      {/* Title */}
      <Text style={calmStyles.title}>{config.title}</Text>

      {/* Subtitle */}
      <Text style={calmStyles.subtitle}>{config.subtitle}</Text>

      {/* Step counter */}
      <Text style={calmStyles.stepText}>
        Activity {activityIndex + 1} of {totalActivities}
      </Text>

      {/* Tap to skip */}
      <TouchableOpacity
        style={calmStyles.skipArea}
        onPress={onSkip}
        activeOpacity={0.7}
      >
        <Text style={calmStyles.skipText}>Tap to continue</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Keep Going Prompt ──────────────────────────────

function KeepGoingPrompt({
  activityCount,
  maxActivities,
  onKeepGoing,
  onFinish,
  isLoading,
}: {
  activityCount: number;
  maxActivities: number;
  onKeepGoing: () => void;
  onFinish: () => void;
  isLoading: boolean;
}) {
  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={keepGoingStyles.container}
    >
      <View style={keepGoingStyles.iconCircle}>
        <Ionicons name="checkmark-done" size={40} color={colors.success.DEFAULT} />
      </View>

      <Text style={keepGoingStyles.title}>You completed all activities!</Text>

      <View style={keepGoingStyles.countBadge}>
        <Text style={keepGoingStyles.countText}>
          {activityCount}/{maxActivities} activities this staircase
        </Text>
      </View>

      <Text style={keepGoingStyles.subtitle}>
        Want to keep practicing? We'll add 2 more activities targeting your weakest areas.
      </Text>

      <View style={keepGoingStyles.buttonRow}>
        <TouchableOpacity
          style={keepGoingStyles.finishButton}
          onPress={onFinish}
          activeOpacity={0.7}
          disabled={isLoading}
        >
          <Text style={keepGoingStyles.finishText}>Finish Lesson</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={keepGoingStyles.keepGoingButton}
          onPress={onKeepGoing}
          activeOpacity={0.7}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              <Text style={keepGoingStyles.keepGoingText}>Keep Going</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// ─── Session Screen ────────────────────────────────

export default function LessonSessionScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [plan, setPlan] = useState<LessonPlan | null>(null);
  const [discoveryContent, setDiscoveryContent] = useState<DiscoveryLessonContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingSlow, setLoadingSlow] = useState(false);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Calm transition state — shown between activities
  const [showCalmTransition, setShowCalmTransition] = useState(false);
  const calmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track whether this is the first activity (skip calm for the very first one)
  const hasCompletedFirstActivity = useRef(false);

  // Keep Going state
  const [showKeepGoing, setShowKeepGoing] = useState(false);
  const [keepGoingLoading, setKeepGoingLoading] = useState(false);
  const [staircaseActivityCount, setStaircaseActivityCount] = useState(0);

  // Load the active lesson plan, check for pending activity completion, load discovery content
  useEffect(() => {
    const userId = user?.id || 'anonymous';

    // Start the UX loading timer — shows "taking longer" message if loading exceeds threshold
    loadingTimerRef.current = setTimeout(() => {
      setLoadingSlow(true);
    }, LOADING_UX_TIMEOUT_MS);

    loadActiveLessonPlan().then(async (loaded) => {
      if (!loaded) {
        router.replace('/(tabs)/home');
        if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
        setIsLoading(false);
        return;
      }

      // Check if a practice screen signaled completion before navigating here
      let activePlan = loaded;
      let didAdvance = false;
      const completion = await loadActivityCompletion();
      if (completion) {
        await clearActivityCompletion();
        const currentAct = activePlan.activities.find(a => a.status === 'current');
        if (currentAct && completion.activityId === currentAct.id) {
          console.log(`[LessonSession] Processing completion: ${completion.activityId} score=${completion.score}`);
          activePlan = advanceActivity(activePlan, completion.score);
          await storeActiveLessonPlan(activePlan);
          didAdvance = true;
          hasCompletedFirstActivity.current = true;
        } else {
          console.warn('[LessonSession] Stale completion signal cleared:', completion.activityId, '(expected:', currentAct?.id, ')');
        }
      }

      setPlan(activePlan);

      // Check if we should pre-generate next stair (80% threshold)
      if (didAdvance) {
        maybePreGenerateNextStair(activePlan, userId).catch(() => {});
      }

      // Track staircase activity count if we advanced
      if (didAdvance) {
        const newCount = await incrementStaircaseActivityCount(activePlan.stair_id);
        setStaircaseActivityCount(newCount);
        activePlan.staircaseActivityCount = newCount;
      }

      // If all activities done after processing completion
      if (activePlan.completed) {
        // Show Keep Going if eligible
        if (activePlan.keepGoingAvailable) {
          const currentCount = await getStaircaseActivityCount(activePlan.stair_id);
          if (currentCount < MAX_STAIRCASE_ACTIVITIES) {
            setPlan(activePlan);
            setShowKeepGoing(true);
            if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
            setIsLoading(false);
            return;
          }
        }

        // Otherwise go to feedback
        const scores = calculateLessonScores(activePlan);
        await clearActiveLessonPlan();
        if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
        router.replace({
          pathname: '/feedback-detail',
          params: {
            scores: JSON.stringify({
              articulation: scores.articulation,
              fluency: scores.fluency,
              communication: scores.communication,
              scenario: scores.scenario,
              wordsLearned: scores.words_learned,
              pointsEarned: scores.points_earned,
              timeSpent: scores.practice_minutes * 60,
              cefrLevel: scores.cefr_level,
            }),
            stairTitle: activePlan.stair_title,
            stairId: activePlan.stair_id,
            isDiscovery: activePlan.is_discovery ? 'true' : 'false',
            scenario: activePlan.stair_title,
          },
        });
        setIsLoading(false);
        return;
      }

      // Load AI content for ALL lessons (discovery and non-discovery)
      try {
        const generateFn = activePlan.is_discovery
          ? generateDiscoveryLessonContent
          : generateStairLessonContent;
        const bgGenerateFn = activePlan.is_discovery
          ? generateRemainingActivities
          : generateRemainingStairActivities;
        const label = activePlan.is_discovery ? 'Discovery' : 'Stair';

        const contentOrNull = await withTimeout(
          generateFn(activePlan, userId),
          DISCOVERY_CONTENT_TIMEOUT_MS,
          `${label} content generation`,
        );

        if (contentOrNull) {
          setDiscoveryContent(contentOrNull);
        } else {
          console.warn(`[LessonSession] ${label} content timed out — proceeding without AI content (practice screens have fallbacks)`);
        }

        // Generate remaining activities in background (with timeout)
        withTimeout(
          bgGenerateFn(activePlan, userId),
          BACKGROUND_GEN_TIMEOUT_MS,
          `Background remaining activities (${label})`,
        )
          .then(fullContent => {
            if (fullContent) {
              console.log(`[LessonSession] Background content generation complete (${label})`);
              setDiscoveryContent(fullContent);
            }
          })
          .catch(err =>
            console.warn(`[LessonSession] Background gen error (${label}):`, err),
          );
      } catch (err) {
        console.warn('[LessonSession] Content load failed:', err);
      }

      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);

      // Show calm transition if we just advanced from an external activity
      if (didAdvance && !activePlan.completed) {
        setShowCalmTransition(true);
        calmTimerRef.current = setTimeout(() => {
          setShowCalmTransition(false);
        }, CALM_TRANSITION_MS);
      }

      setIsLoading(false);
    });

    return () => {
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
      if (calmTimerRef.current) clearTimeout(calmTimerRef.current);
    };
  }, []);

  // Load stair content for vocabulary activities (Tier 1: Supabase stairs)
  const {
    data: stairContent,
    isLoading: contentLoading,
  } = useStairContent(plan?.stair_id || '', user?.id);

  // Tier 2 fallback: Word bank vocabulary (populated by initialVocabGenerator)
  const vocabActivity = plan?.activities.find(a => a.type === 'vocabulary');
  const vocabWordCount = vocabActivity?.config.type === 'vocabulary'
    ? vocabActivity.config.word_count
    : 5;
  const { priorityWords: wordBankWords, loading: wordBankLoading } = useWordPriority({
    limit: vocabWordCount,
  });

  // Get current activity
  const currentActivity = plan?.activities.find(a => a.status === 'current');

  // Navigate to feedback-detail with scores
  const navigateToFeedback = useCallback(async (completedPlan: LessonPlan) => {
    const scores = calculateLessonScores(completedPlan);
    await clearActiveLessonPlan();

    const scoreParams = JSON.stringify({
      articulation: scores.articulation,
      fluency: scores.fluency,
      communication: scores.communication,
      scenario: scores.scenario,
      wordsLearned: scores.words_learned,
      pointsEarned: scores.points_earned,
      timeSpent: scores.practice_minutes * 60,
      cefrLevel: scores.cefr_level,
    });

    router.replace({
      pathname: '/feedback-detail',
      params: {
        scores: scoreParams,
        stairTitle: completedPlan.stair_title,
        stairId: completedPlan.stair_id,
        isDiscovery: completedPlan.is_discovery ? 'true' : 'false',
        scenario: completedPlan.stair_title,
      },
    });
  }, [router]);

  // Handle activity completion with score
  const handleActivityComplete = useCallback(async (score?: number) => {
    if (!plan) return;

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const updatedPlan = advanceActivity(plan, score || 70);

    // Track staircase activity count
    const newCount = await incrementStaircaseActivityCount(updatedPlan.stair_id);
    setStaircaseActivityCount(newCount);
    updatedPlan.staircaseActivityCount = newCount;

    setPlan(updatedPlan);

    // Persist updated plan
    await storeActiveLessonPlan(updatedPlan);

    // Check if we should pre-generate next stair content (80% threshold)
    const userId = user?.id || 'anonymous';
    maybePreGenerateNextStair(updatedPlan, userId).catch(() => {});

    // If lesson is complete
    if (updatedPlan.completed) {
      // Show Keep Going prompt if eligible (not discovery, under 20-cap)
      if (updatedPlan.keepGoingAvailable && newCount < MAX_STAIRCASE_ACTIVITIES) {
        setShowKeepGoing(true);
        return;
      }

      // Otherwise go straight to feedback
      await navigateToFeedback(updatedPlan);
      return;
    }

    // Show calm transition before the next activity (skip for the very first activity)
    if (hasCompletedFirstActivity.current) {
      setShowCalmTransition(true);
      calmTimerRef.current = setTimeout(() => {
        setShowCalmTransition(false);
      }, CALM_TRANSITION_MS);
    }
    hasCompletedFirstActivity.current = true;
  }, [plan, router, navigateToFeedback, user]);

  // ─── Navigate to external practice screens via useEffect (not during render) ───
  useEffect(() => {
    if (isLoading || !plan || !currentActivity || showCalmTransition) return;

    const type = currentActivity.type;
    if (type === 'vocabulary') return; // rendered inline, no navigation needed

    if (type === 'listening') {
      const raw = discoveryContent?.activities[currentActivity.id];
      const listeningContent = raw?.type === 'listening' ? raw as ListeningContent : undefined;
      router.replace({
        pathname: '/practice-listening',
        params: {
          stairStepId: plan.stair_id,
          returnToSession: 'true',
          planId: plan.id,
          activityId: currentActivity.id,
          ...(listeningContent ? { discoveryContent: JSON.stringify(listeningContent) } : {}),
        },
      });
    } else if (type === 'reading') {
      const raw = discoveryContent?.activities[currentActivity.id];
      const readingContent = raw?.type === 'reading' ? raw as ReadingContent : undefined;
      router.replace({
        pathname: '/practice-reading',
        params: {
          stairStepId: plan.stair_id,
          returnToSession: 'true',
          planId: plan.id,
          activityId: currentActivity.id,
          ...(readingContent ? { discoveryContent: JSON.stringify(readingContent) } : {}),
        },
      });
    } else if (type === 'voice_call') {
      const rawVoice = discoveryContent?.activities[currentActivity.id];
      const voiceContent = rawVoice?.type === 'voice_call' ? rawVoice as VoiceCallContent : undefined;
      router.replace({
        pathname: '/voice-conversation',
        params: {
          stairStepId: plan.stair_id,
          returnToSession: 'true',
          planId: plan.id,
          activityId: currentActivity.id,
          maxDuration: String(
            currentActivity.config.type === 'voice_call'
              ? currentActivity.config.duration_seconds
              : 60
          ),
          ...(voiceContent ? {
            scenarioTitle: voiceContent.scenarioTitle,
            scenarioDescription: voiceContent.scenarioDescription,
          } : {}),
        },
      });
    } else if (type === 'writing') {
      const rawWriting = discoveryContent?.activities[currentActivity.id];
      const writingContent = rawWriting?.type === 'writing' ? rawWriting as WritingContent : undefined;
      router.replace({
        pathname: '/practice-writing',
        params: {
          stairStepId: plan.stair_id,
          returnToSession: 'true',
          planId: plan.id,
          activityId: currentActivity.id,
          ...(writingContent ? { discoveryContent: JSON.stringify(writingContent) } : {}),
        },
      });
    }
  }, [currentActivity?.id, currentActivity?.type, isLoading, plan, discoveryContent, router, showCalmTransition]);

  // Handle calm transition skip
  const handleCalmSkip = useCallback(() => {
    if (calmTimerRef.current) clearTimeout(calmTimerRef.current);
    setShowCalmTransition(false);
  }, []);

  // Clean up calm timer on unmount
  useEffect(() => {
    return () => {
      if (calmTimerRef.current) clearTimeout(calmTimerRef.current);
    };
  }, []);

  // Handle "Skip" when loading is slow — proceed without AI content
  const handleSkipLoading = useCallback(() => {
    console.warn('[LessonSession] User skipped slow content loading');
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    setLoadingSlow(false);
    setIsLoading(false);
  }, []);

  // Handle early exit
  const handleExit = useCallback(async () => {
    await clearActiveLessonPlan();
    router.replace('/(tabs)/home');
  }, [router]);

  // Handle "Keep Going" — append 2 more activities
  const handleKeepGoing = useCallback(async () => {
    if (!plan) return;
    setKeepGoingLoading(true);

    try {
      const userId = user?.id || 'anonymous';
      const weaknessOrder = await getWeaknessOrder(userId);
      const completedTypes = plan.activities
        .filter((a) => a.status === 'completed')
        .map((a) => a.type);

      const newTemplates = getKeepGoingActivities(
        completedTypes,
        weaknessOrder,
        plan.level_group as LevelGroup,
        2,
      );

      // Build new LessonActivity entries
      const startIndex = plan.activities.length;
      const newActivities = newTemplates.map((tmpl, i) => ({
        id: `${plan.stair_id}-activity-${startIndex + i + 1}`,
        type: tmpl.type,
        order: startIndex + i + 1,
        title: tmpl.title,
        description: tmpl.description,
        icon: tmpl.icon,
        color: getActivityColor(tmpl.type),
        label: getActivityLabel(tmpl.type),
        estimated_seconds: tmpl.estimated_seconds,
        config: tmpl.config,
        status: (i === 0 ? 'current' : 'locked') as 'current' | 'locked',
      }));

      const extendedPlan: LessonPlan = {
        ...plan,
        activities: [...plan.activities, ...newActivities],
        current_activity_index: startIndex,
        completed: false,
        staircaseActivityCount: staircaseActivityCount,
      };

      setPlan(extendedPlan);
      await storeActiveLessonPlan(extendedPlan);

      // Generate content for new activities in background
      generateStairLessonContent(extendedPlan, userId).catch((err) =>
        console.warn('[LessonSession] Keep Going content gen failed:', err),
      );

      setShowKeepGoing(false);
    } catch (err) {
      console.warn('[LessonSession] Keep Going failed:', err);
    } finally {
      setKeepGoingLoading(false);
    }
  }, [plan, user, staircaseActivityCount]);

  // Handle "Finish Lesson" from Keep Going prompt
  const handleFinishLesson = useCallback(async () => {
    if (!plan) return;
    await navigateToFeedback(plan);
  }, [plan, navigateToFeedback]);

  // Handle vocabulary word completion
  const handleWordComplete = useCallback(async () => {
    // Word completed in vocabulary practice — advance to next activity
    await handleActivityComplete(75);
  }, [handleActivityComplete]);

  // Handle points earned (from vocabulary practice) — persist to SQLite
  const handlePointsEarned = useCallback((points: number) => {
    const userId = user?.id;
    if (userId && points > 0) {
      updateStreakData(userId, points).catch(() => {});
    }
  }, [user?.id]);

  // ─── Loading ─────────────────────────────────────

  if (isLoading || !plan) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        <Text style={styles.loadingText}>
          {loadingSlow ? 'Taking longer than expected...' : 'Loading lesson...'}
        </Text>
        {loadingSlow && (
          <Pressable
            style={styles.skipButton}
            onPress={handleSkipLoading}
            accessibilityRole="button"
            accessibilityLabel="Skip content loading and continue"
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </Pressable>
        )}
      </View>
    );
  }

  if (!currentActivity) {
    // All activities completed — should have navigated already
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </View>
    );
  }

  // ─── Keep Going Prompt ─────────────────────────
  if (showKeepGoing) {
    return (
      <KeepGoingPrompt
        activityCount={staircaseActivityCount}
        maxActivities={MAX_STAIRCASE_ACTIVITIES}
        onKeepGoing={handleKeepGoing}
        onFinish={handleFinishLesson}
        isLoading={keepGoingLoading}
      />
    );
  }

  // ─── Calm Transition Screen ─────────────────────
  if (showCalmTransition) {
    return (
      <CalmTransitionScreen
        activityType={currentActivity.type}
        activityIndex={currentActivity.order - 1}
        totalActivities={plan.activities.length}
        onSkip={handleCalmSkip}
      />
    );
  }

  // ─── Activity Router ─────────────────────────────

  switch (currentActivity.type) {
    case 'vocabulary': {
      // 3-tier waterfall: Discovery content → Stair content → Word bank
      const WORDS_PER_LESSON = currentActivity.config.type === 'vocabulary'
        ? currentActivity.config.word_count
        : 5;

      // Tier 0: Discovery content (pre-generated, already has word bank words)
      const rawVocab = discoveryContent?.activities[currentActivity.id];
      const discoveryVocab = rawVocab?.type === 'vocabulary' ? rawVocab as VocabularyContent : undefined;
      let lessonVocab: any[] = [];

      if (discoveryVocab?.words?.length) {
        // Convert discovery VocabWords to VocabularyItem-compatible shape
        lessonVocab = discoveryVocab.words.slice(0, WORDS_PER_LESSON).map((w) => ({
          id: w.id,
          word: w.word,
          translation: w.translation,
          phonetic: w.phonetic,
          partOfSpeech: w.partOfSpeech,
          category: w.category,
          exampleSentences: w.exampleSentence ? [w.exampleSentence] : [],
          examples: w.exampleSentence
            ? [{ text: w.exampleSentence, translation: '', highlightWord: true }]
            : [],
          cefrLevel: 'A1',
          masteryScore: 0,
          priority: 1,
          easeFactor: 2.5,
          interval: 0,
          repetitions: 0,
          cardVariantsCompleted: { introduction: false, listening: false, typing: false, speaking: false, audioQuiz: false },
          lastVariantShown: null,
        }));
      }

      // Tier 1: Stair content (Supabase)
      if (lessonVocab.length === 0) {
        const stairVocab = stairContent?.vocabulary || [];
        lessonVocab = stairVocab.slice(0, WORDS_PER_LESSON);
      }

      // Tier 2: Word bank (SQLite, populated by initialVocabGenerator)
      if (lessonVocab.length === 0 && wordBankWords.length > 0) {
        lessonVocab = wordBankWords.slice(0, WORDS_PER_LESSON).map(bankWordToVocabularyItem);
      }

      const isVocabLoading = contentLoading || (lessonVocab.length === 0 && wordBankLoading);

      if (isVocabLoading || lessonVocab.length === 0) {
        return (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
            <Text style={styles.loadingText}>Loading vocabulary...</Text>
          </View>
        );
      }

      return (
        <VocabularyPracticeScreen
          item={lessonVocab[0]}
          userId={user?.id || 'anonymous'}
          onComplete={handleWordComplete}
          onExit={handleExit}
          onPointsEarned={handlePointsEarned}
          fullFlow={true}
        />
      );
    }

    case 'listening':
    case 'reading':
    case 'voice_call':
    case 'writing': {
      // Navigation handled by useEffect above — just show loading spinner
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        </View>
      );
    }

    default:
      return (
        <View style={styles.center}>
          <Text style={styles.loadingText}>Unknown activity type</Text>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.lg,
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
  },
  skipButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.text.secondary,
  },
  skipButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: '600' as const,
  },
});

// ─── Calm Transition Styles ──────────────────────────

const calmStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    padding: spacing.xl,
  },
  progressRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing['3xl'],
  },
  progressDot: {
    width: 28,
    height: 4,
    borderRadius: 2,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text.primary,
    letterSpacing: -0.3,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  stepText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xl,
  },
  skipArea: {
    position: 'absolute',
    bottom: 60,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  skipText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontWeight: '500' as const,
  },
});

// ─── Keep Going Styles ───────────────────────────────

const keepGoingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    padding: spacing.xl,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.success.DEFAULT + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text.primary,
    letterSpacing: -0.3,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  countText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600' as const,
    color: colors.text.secondary,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
    marginBottom: spacing['3xl'],
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
    paddingHorizontal: spacing.md,
  },
  finishButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishText: {
    fontSize: typography.fontSize.base,
    fontWeight: '600' as const,
    color: colors.text.secondary,
  },
  keepGoingButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  keepGoingText: {
    fontSize: typography.fontSize.base,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
