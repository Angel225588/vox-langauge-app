/**
 * V3 Creating Path — Progress Checklist Screen
 *
 * Shows a Claude-style live progress checklist with step completion indicators
 * while generating vocabulary, staircase skeleton, and personalized path.
 *
 * Steps:
 * 1. Creating your vocabulary (Gemini → 80-100 core words)
 * 2. Preparing speaking scenarios (staircase skeleton)
 * 3. Setting up your library (placeholder — instant for now)
 * 4. Personalizing your path (Supabase or preview stairs)
 *
 * Visual: pending (○) → in_progress (● pulsing) → done (✓ green) → error (⚠ orange)
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { GlassBackground } from '@/components/ui/glass/GlassBackground';
import { useOnboardingV3 } from '@/hooks/useOnboardingV3';
import { supabase } from '@/lib/db/supabase';
import { syncProfileToSupabase } from '@/lib/db/profileSync';
import { createPersonalizedPath } from '@/lib/services/pathGeneration';
import { adaptV3ToOnboardingData, validateV3Data } from '@/lib/services/v3DataAdapter';
import { storeUserLevel } from '@/lib/utils/levelGating';
import { generatePreviewStairs, storePreviewStairs, clearPreviewStairs, loadPreviewStairs } from '@/lib/services/previewStairs';
import { generateInitialVocabulary } from '@/lib/word-bank/initialVocabGenerator';
import { generateLessonPlan, generateFirstActivityContent } from '@/lib/lesson';
import { storeActiveLessonPlan } from '@/app/lesson-session';
import { colors, spacing, typography, borderRadius } from '@/constants/designSystem';
import { fonts } from '@/constants/fonts';
import { buildLanguageRecommendation, saveAILanguageRecommendation } from '@/lib/storage/languageStorage';
import { getDeviceLanguage } from '@/i18n/utils/languageDetector';
import { invalidateIfProfileChanged } from '@/lib/utils/profileFingerprint';

const ONBOARDING_COMPLETED_KEY = 'vox-onboarding-completed';

// Safety cap — navigate regardless after 20 seconds
const SAFETY_CAP_MS = 20_000;

// Minimum time each step stays visible (ensures animation is seen)
const MIN_STEP_MS = 600;

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

// ─── Step Types ──────────────────────────────────────

type StepStatus = 'pending' | 'in_progress' | 'done' | 'error';

interface ProgressStep {
  label: string;
  status: StepStatus;
}

const INITIAL_STEPS: ProgressStep[] = [
  { label: 'Loading your vocabulary', status: 'pending' },
  { label: 'Building your learning path', status: 'pending' },
];

// ─── Inspirational phrases ──────────────────────────

type Phrase = { main: string; sub: string };

const PHRASES_WITH_NAME: ((name: string) => Phrase)[] = [
  (name) => ({ main: `We're ready, ${name}`, sub: 'Your first lesson is being prepared' }),
  (name) => ({ main: `One moment, ${name}`, sub: 'Building something just for you' }),
  (name) => ({ main: `Almost there, ${name}`, sub: 'Your path is taking shape' }),
];

const PHRASES_WITHOUT_NAME: Phrase[] = [
  { main: 'We\'re ready for you', sub: 'Your first lesson is being prepared' },
  { main: 'One moment', sub: 'Building something just for you' },
  { main: 'Almost there', sub: 'Your path is taking shape' },
];

function getPhrase(firstName?: string): Phrase {
  if (firstName && firstName.trim().length > 0) {
    const pool = PHRASES_WITH_NAME;
    return pool[Math.floor(Math.random() * pool.length)](firstName.trim());
  }
  const pool = PHRASES_WITHOUT_NAME;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── Pulsing Dot Component ─────────────────────────

function PulsingDot() {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 400 }),
        withTiming(0.9, { duration: 400 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.dotInProgress, animatedStyle]} />
  );
}

// ─── Step Row Component ─────────────────────────────

function StepRow({ step, index }: { step: ProgressStep; index: number }) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(20);

  useEffect(() => {
    const delay = 200 + index * 100;
    const timer = setTimeout(() => {
      opacity.value = withTiming(1, { duration: 300 });
      translateX.value = withSpring(0, { damping: 15, stiffness: 120 });
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  // Animate status icon on change
  const iconScale = useSharedValue(1);
  useEffect(() => {
    if (step.status === 'done' || step.status === 'error') {
      iconScale.value = withSequence(
        withTiming(1.4, { duration: 150 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );
    }
  }, [step.status]);

  const rowStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const isActive = step.status === 'in_progress';
  const isDone = step.status === 'done';
  const isError = step.status === 'error';

  return (
    <Animated.View style={[styles.stepRow, rowStyle]}>
      {/* Status indicator */}
      <Animated.View style={[styles.stepIconContainer, iconAnimStyle]}>
        {step.status === 'pending' && (
          <View style={styles.dotPending} />
        )}
        {isActive && <PulsingDot />}
        {isDone && (
          <View style={styles.dotDone}>
            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
          </View>
        )}
        {isError && (
          <View style={styles.dotError}>
            <Ionicons name="warning" size={10} color="#FFFFFF" />
          </View>
        )}
      </Animated.View>

      {/* Label */}
      <Text
        style={[
          styles.stepLabel,
          isActive && styles.stepLabelActive,
          isDone && styles.stepLabelDone,
          isError && styles.stepLabelError,
        ]}
      >
        {step.label}
        {isActive ? '...' : ''}
      </Text>
    </Animated.View>
  );
}

// ─── Progress Bar ───────────────────────────────────

function ProgressBar({ steps }: { steps: ProgressStep[] }) {
  const doneCount = steps.filter(s => s.status === 'done').length;
  const progress = doneCount / steps.length;
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(progress * 100, { duration: 400 });
  }, [progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value}%` as any,
  }));

  return (
    <View style={styles.progressBarTrack}>
      <Animated.View style={[styles.progressBarFill, barStyle]} />
    </View>
  );
}

// ─── Screen ─────────────────────────────────────────

export default function CreatingPathRoute() {
  const v3Store = useOnboardingV3();
  const hasStarted = useRef(false);
  const [phrase] = useState(() => getPhrase(v3Store.first_name));
  const hasNavigated = useRef(false);
  const [steps, setSteps] = useState<ProgressStep[]>([...INITIAL_STEPS]);

  const navigateAndCleanup = useCallback(() => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Go to home — staircase is ready, user taps first stair to begin
    router.replace('/(tabs)/home');
    setTimeout(() => v3Store.reset(), 200);
  }, []);

  const updateStep = useCallback((index: number, status: StepStatus) => {
    setSteps(prev => {
      const next = [...prev];
      next[index] = { ...next[index], status };
      return next;
    });
    // Haptic feedback on step completion
    if (status === 'done') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    runSteps();

    // Safety cap — navigate regardless after 15s
    const safetyTimer = setTimeout(navigateAndCleanup, SAFETY_CAP_MS);
    return () => clearTimeout(safetyTimer);
  }, []);

  /**
   * Ensure a step is visible for at least MIN_STEP_MS.
   * Also yields to the event loop so React renders each transition.
   */
  const ensureMinVisible = async (stepStart: number) => {
    const elapsed = Date.now() - stepStart;
    const remaining = MIN_STEP_MS - elapsed;
    if (remaining > 0) {
      await delay(remaining);
    } else {
      // Always yield at least once so React can paint
      await delay(50);
    }
  };

  const runSteps = async () => {
    try {
      const v3Data = v3Store.getOnboardingData();

      // Store proficiency level locally
      if (v3Data.proficiency_level) {
        await storeUserLevel(v3Data.proficiency_level);
      }

      // Persist onboarding data for retry on failure
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, JSON.stringify(v3Data));

      // ── Profile Fingerprint: invalidate stale caches if selections changed ──
      try {
        const wasInvalidated = await invalidateIfProfileChanged({
          target_language: v3Data.target_language || 'english',
          native_language: v3Data.native_language || 'english',
          proficiency_level: v3Data.proficiency_level || 'starting_fresh',
          scenarios: [...(v3Data.scenarios || []), ...(v3Data.custom_scenarios || [])],
          profession: v3Data.profession || v3Data.profession_custom || undefined,
        });
        if (wasInvalidated) {
          console.log('[CreatingPath] Stale caches cleared — fresh generation ahead');
        }
      } catch (err) {
        console.warn('[CreatingPath] Fingerprint check failed (non-blocking):', err);
      }

      // ── Step 1: Vocabulary ──────────────────────────
      const step1Start = Date.now();
      updateStep(0, 'in_progress');
      try {
        await generateInitialVocabulary({
          target_language: v3Data.target_language || 'english',
          native_language: v3Data.native_language || 'english',
          proficiency_level: v3Data.proficiency_level || 'starting_fresh',
          profession: v3Data.profession || v3Data.profession_custom || undefined,
        });
        updateStep(0, 'done');
      } catch (err) {
        console.warn('[CreatingPath] Vocab generation error (non-blocking):', err);
        updateStep(0, 'error');
      }
      await ensureMinVisible(step1Start);

      // ── Step 2: Build Learning Path (staircase skeleton) ──
      const step2Start = Date.now();
      updateStep(1, 'in_progress');
      try {
        // Validate: scenarios must exist for a meaningful staircase
        const scenarios = v3Data.scenarios.length > 0
          ? v3Data.scenarios
          : v3Data.custom_scenarios.length > 0
            ? v3Data.custom_scenarios
            : ['General conversation', 'Daily life situations']; // Minimal fallback

        const previewStairs = generatePreviewStairs({
          scenarios,
          target_language: v3Data.target_language || 'english',
          profession: v3Data.profession || v3Data.profession_custom || undefined,
          proficiency_level: v3Data.proficiency_level || undefined,
        });

        if (previewStairs.length === 0) {
          console.error('[CreatingPath] Staircase generated 0 stairs — scenarios:', scenarios);
        }

        await storePreviewStairs(previewStairs);
        updateStep(1, 'done');
      } catch (err) {
        console.warn('[CreatingPath] Stairs error (non-blocking):', err);
        updateStep(1, 'error');
      }
      await ensureMinVisible(step2Start);

      // ── Language recommendation (based on proficiency + target) ──
      // If user is conversational+ and we have target-language translations,
      // save a recommendation so next app launch uses target language for immersion.
      if (v3Data.proficiency_level && v3Data.target_language) {
        const deviceLang = getDeviceLanguage();
        const rec = buildLanguageRecommendation(
          v3Data.proficiency_level,
          v3Data.target_language,
          deviceLang,
        );
        await saveAILanguageRecommendation(rec);
        console.log(`[CreatingPath] Language recommendation: ${rec.reason} → ${rec.language}`);
      }

      // ── Navigate: staircase is ready, go to home ──

      // Fire-and-forget: personalize path for authenticated users
      personalizePathInBackground(v3Data);

      // Navigate to lesson — remaining content generates in background
      navigateAndCleanup();
    } catch (err) {
      console.warn('[CreatingPath] Top-level error:', err);
      // Safety timer will handle navigation
    }
  };

  /**
   * Personalize the learning path in Supabase (for authenticated users).
   * Runs as fire-and-forget after navigation — no-op for anonymous users.
   */
  const personalizePathInBackground = async (v3Data: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Sync profile to Supabase so it persists across app restarts
        await syncProfileToSupabase(user.id, v3Data);

        await clearPreviewStairs();
        const validationError = validateV3Data(v3Data);
        if (validationError) {
          console.warn('[CreatingPath] Validation warning:', validationError);
        }
        const adaptedData = adaptV3ToOnboardingData(v3Data);
        const result = await createPersonalizedPath(user.id, adaptedData);
        if (result.success) {
          await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
        }
      }
    } catch (err) {
      console.warn('[CreatingPath] Background personalization error:', err);
    }
  };

  return (
    <GlassBackground intensity="medium">
      <View style={styles.container}>
        {/* Phrase */}
        <Animated.View entering={FadeIn.duration(600).delay(200)} style={styles.phraseSection}>
          <Text style={styles.mainPhrase}>{phrase.main}</Text>
          <Text style={styles.subPhrase}>{phrase.sub}</Text>
        </Animated.View>

        {/* Steps Checklist — FadeIn (no transform) to avoid conflict with children's useAnimatedStyle */}
        <Animated.View entering={FadeIn.duration(400).delay(500)} style={styles.stepsContainer}>
          {steps.map((step, i) => (
            <StepRow key={i} step={step} index={i} />
          ))}
        </Animated.View>

        {/* Progress Bar */}
        <Animated.View entering={FadeIn.duration(400).delay(800)} style={styles.progressBarWrapper}>
          <ProgressBar steps={steps} />
        </Animated.View>
      </View>
    </GlassBackground>
  );
}

// ─── Styles ─────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  phraseSection: {
    alignItems: 'center',
    marginBottom: spacing['2xl'] || 48,
  },
  mainPhrase: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: fonts.display.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subPhrase: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.body.regular,
    color: colors.text.tertiary,
    textAlign: 'center',
  },

  // Steps checklist
  stepsContainer: {
    width: '100%',
    maxWidth: 320,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepIconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Status indicators
  dotPending: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dotInProgress: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary.DEFAULT,
  },
  dotDone: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.success.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotError: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.warning.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Step labels
  stepLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.body.medium,
    color: 'rgba(255, 255, 255, 0.4)',
    flex: 1,
  },
  stepLabelActive: {
    color: colors.text.primary,
    fontFamily: fonts.display.semibold,
  },
  stepLabelDone: {
    color: colors.text.secondary,
  },
  stepLabelError: {
    color: colors.warning.light,
  },

  // Progress bar
  progressBarWrapper: {
    width: '100%',
    maxWidth: 320,
    paddingHorizontal: spacing.md,
  },
  progressBarTrack: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: borderRadius.full,
  },
});
