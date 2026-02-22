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

import { useState, useCallback, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography } from '@/constants/designSystem';
import {
  advanceActivity,
  calculateLessonScores,
  type LessonPlan,
  type LessonActivity,
} from '@/lib/lesson';

// Lazy imports for practice screens
import { VocabularyPracticeScreen } from '@/components/cards/vocabulary/VocabularyPracticeScreen';
import { useStairContent } from '@/hooks/useStairContent';
import { useAuth } from '@/hooks/useAuth';

const LESSON_PLAN_KEY = 'vox-active-lesson-plan';

// ─── Storage Helpers ───────────────────────────────

export async function storeActiveLessonPlan(plan: LessonPlan): Promise<void> {
  await AsyncStorage.setItem(LESSON_PLAN_KEY, JSON.stringify(plan));
}

export async function loadActiveLessonPlan(): Promise<LessonPlan | null> {
  const json = await AsyncStorage.getItem(LESSON_PLAN_KEY);
  if (!json) return null;
  return JSON.parse(json);
}

export async function clearActiveLessonPlan(): Promise<void> {
  await AsyncStorage.removeItem(LESSON_PLAN_KEY);
}

// ─── Session Screen ────────────────────────────────

export default function LessonSessionScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [plan, setPlan] = useState<LessonPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load the active lesson plan from storage
  useEffect(() => {
    loadActiveLessonPlan().then((loaded) => {
      if (loaded) {
        setPlan(loaded);
      } else {
        // No plan found — go back
        router.back();
      }
      setIsLoading(false);
    });
  }, []);

  // Load stair content for vocabulary activities
  const {
    data: stairContent,
    isLoading: contentLoading,
  } = useStairContent(plan?.stair_id || '', user?.id);

  // Get current activity
  const currentActivity = plan?.activities.find(a => a.status === 'current');

  // Handle activity completion with score
  const handleActivityComplete = useCallback(async (score?: number) => {
    if (!plan) return;

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const updatedPlan = advanceActivity(plan, score || 70);
    setPlan(updatedPlan);

    // Persist updated plan
    await storeActiveLessonPlan(updatedPlan);

    // If lesson is complete, navigate to success screen
    if (updatedPlan.completed) {
      const scores = calculateLessonScores(updatedPlan);
      await clearActiveLessonPlan();

      router.replace({
        pathname: '/lesson-complete',
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
          stairTitle: updatedPlan.stair_title,
          stairId: updatedPlan.stair_id,
          isDiscovery: updatedPlan.is_discovery ? 'true' : 'false',
        },
      });
    }
  }, [plan, router]);

  // Handle early exit
  const handleExit = useCallback(async () => {
    await clearActiveLessonPlan();
    router.replace('/(tabs)/home');
  }, [router]);

  // Handle vocabulary word completion
  const handleWordComplete = useCallback(async () => {
    // Word completed in vocabulary practice — advance to next activity
    await handleActivityComplete(75);
  }, [handleActivityComplete]);

  // Handle points earned (from vocabulary practice)
  const handlePointsEarned = useCallback((points: number) => {
    // Points tracked in the plan's score calculation
  }, []);

  // ─── Loading ─────────────────────────────────────

  if (isLoading || !plan) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        <Text style={styles.loadingText}>Loading lesson...</Text>
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

  // ─── Activity Router ─────────────────────────────

  switch (currentActivity.type) {
    case 'vocabulary': {
      // Get vocabulary from stair content
      const vocabulary = stairContent?.vocabulary || [];
      const WORDS_PER_LESSON = currentActivity.config.type === 'vocabulary'
        ? currentActivity.config.word_count
        : 5;
      const lessonVocab = vocabulary.slice(0, WORDS_PER_LESSON);

      if (contentLoading || lessonVocab.length === 0) {
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

    case 'listening': {
      // Navigate to existing listening practice with stair context
      router.replace({
        pathname: '/practice-listening',
        params: {
          stairStepId: plan.stair_id,
          returnToSession: 'true',
        },
      });
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        </View>
      );
    }

    case 'reading': {
      router.replace({
        pathname: '/practice-reading',
        params: {
          stairStepId: plan.stair_id,
          returnToSession: 'true',
        },
      });
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        </View>
      );
    }

    case 'voice_call': {
      router.replace({
        pathname: '/voice-conversation',
        params: {
          stairStepId: plan.stair_id,
          returnToSession: 'true',
          maxDuration: String(
            currentActivity.config.type === 'voice_call'
              ? currentActivity.config.duration_seconds
              : 60
          ),
        },
      });
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        </View>
      );
    }

    case 'writing': {
      router.replace({
        pathname: '/practice-writing',
        params: {
          stairStepId: plan.stair_id,
          returnToSession: 'true',
        },
      });
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
});
