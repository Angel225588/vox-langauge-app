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
  generateDiscoveryLessonContent,
  generateSingleActivityContent,
  generateRemainingActivities,
  type LessonPlan,
  type LessonActivity,
  type DiscoveryLessonContent,
  type VocabularyContent,
  type ListeningContent,
  type ReadingContent,
  type WritingContent,
  type VoiceCallContent,
} from '@/lib/lesson';

// Lazy imports for practice screens
import { VocabularyPracticeScreen } from '@/components/cards/vocabulary/VocabularyPracticeScreen';
import { useStairContent } from '@/hooks/useStairContent';
import { useAuth } from '@/hooks/useAuth';
import { useWordPriority } from '@/lib/word-bank';
import { bankWordToVocabularyItem } from '@/lib/word-bank/adapter';

const LESSON_PLAN_KEY = 'vox-active-lesson-plan';
const ACTIVITY_COMPLETE_KEY = 'vox-activity-completion';

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

// ─── Session Screen ────────────────────────────────

export default function LessonSessionScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [plan, setPlan] = useState<LessonPlan | null>(null);
  const [discoveryContent, setDiscoveryContent] = useState<DiscoveryLessonContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load the active lesson plan, check for pending activity completion, load discovery content
  useEffect(() => {
    const userId = user?.id || 'anonymous';

    loadActiveLessonPlan().then(async (loaded) => {
      if (!loaded) {
        router.replace('/(tabs)/home');
        setIsLoading(false);
        return;
      }

      // Check if a practice screen signaled completion before navigating here
      let activePlan = loaded;
      const completion = await loadActivityCompletion();
      if (completion) {
        await clearActivityCompletion();
        console.log(`[LessonSession] Processing completion: ${completion.activityId} score=${completion.score}`);
        activePlan = advanceActivity(activePlan, completion.score);
        await storeActiveLessonPlan(activePlan);
      }

      setPlan(activePlan);

      // If all activities done after processing completion, go to feedback
      if (activePlan.completed) {
        const scores = calculateLessonScores(activePlan);
        await clearActiveLessonPlan();
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

      // Load discovery content for discovery lessons
      if (activePlan.is_discovery) {
        try {
          const cachedContent = await generateDiscoveryLessonContent(
            activePlan,
            userId,
          );
          setDiscoveryContent(cachedContent);

          // Generate remaining activities in background while user does current activity
          generateRemainingActivities(activePlan, userId)
            .then(fullContent => {
              console.log('[LessonSession] Background content generation complete');
              setDiscoveryContent(fullContent);
            })
            .catch(err =>
              console.warn('[LessonSession] Background gen error:', err),
            );
        } catch (err) {
          console.warn('[LessonSession] Discovery content load failed:', err);
        }
      }

      setIsLoading(false);
    });
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

  // Handle activity completion with score
  const handleActivityComplete = useCallback(async (score?: number) => {
    if (!plan) return;

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const updatedPlan = advanceActivity(plan, score || 70);
    setPlan(updatedPlan);

    // Persist updated plan
    await storeActiveLessonPlan(updatedPlan);

    // If lesson is complete, navigate to feedback → then lesson-complete
    if (updatedPlan.completed) {
      const scores = calculateLessonScores(updatedPlan);
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
          stairTitle: updatedPlan.stair_title,
          stairId: updatedPlan.stair_id,
          isDiscovery: updatedPlan.is_discovery ? 'true' : 'false',
          scenario: updatedPlan.stair_title,
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
      // 3-tier waterfall: Discovery content → Stair content → Word bank
      const WORDS_PER_LESSON = currentActivity.config.type === 'vocabulary'
        ? currentActivity.config.word_count
        : 5;

      // Tier 0: Discovery content (pre-generated, already has word bank words)
      const discoveryVocab = discoveryContent?.activities[currentActivity.id] as VocabularyContent | undefined;
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

    case 'listening': {
      // Pass discovery content if available (pre-generated dialogue + questions)
      const listeningContent = discoveryContent?.activities[currentActivity.id] as ListeningContent | undefined;
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
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        </View>
      );
    }

    case 'reading': {
      const readingContent = discoveryContent?.activities[currentActivity.id] as ReadingContent | undefined;
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
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        </View>
      );
    }

    case 'voice_call': {
      const voiceContent = discoveryContent?.activities[currentActivity.id] as VoiceCallContent | undefined;
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
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        </View>
      );
    }

    case 'writing': {
      const writingContent = discoveryContent?.activities[currentActivity.id] as WritingContent | undefined;
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
