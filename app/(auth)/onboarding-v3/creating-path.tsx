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
import { createPersonalizedPath } from '@/lib/services/pathGeneration';
import { adaptV3ToOnboardingData, validateV3Data } from '@/lib/services/v3DataAdapter';
import { storeUserLevel } from '@/lib/utils/levelGating';
import { generatePreviewStairs, storePreviewStairs, clearPreviewStairs } from '@/lib/services/previewStairs';
import { generateInitialVocabulary } from '@/lib/word-bank/initialVocabGenerator';
import { colors, spacing, typography, borderRadius } from '@/constants/designSystem';

const ONBOARDING_COMPLETED_KEY = 'vox-onboarding-completed';

// Safety cap — navigate regardless after 15 seconds
const SAFETY_CAP_MS = 15_000;
// Early exit — if vocab + stairs done and >5s elapsed, navigate
const EARLY_EXIT_MS = 5_000;

// ─── Step Types ──────────────────────────────────────

type StepStatus = 'pending' | 'in_progress' | 'done' | 'error';

interface ProgressStep {
  label: string;
  status: StepStatus;
}

const INITIAL_STEPS: ProgressStep[] = [
  { label: 'Creating your vocabulary', status: 'pending' },
  { label: 'Preparing speaking scenarios', status: 'pending' },
  { label: 'Setting up your library', status: 'pending' },
  { label: 'Personalizing your path', status: 'pending' },
];

// ─── Inspirational phrases ──────────────────────────

type Phrase = { main: string; sub: string };

const PHRASES_WITH_NAME: ((name: string) => Phrase)[] = [
  (name) => ({ main: `Building your path, ${name}`, sub: 'Tailored to your world' }),
  (name) => ({ main: `Almost there, ${name}`, sub: 'Crafting your first steps' }),
  (name) => ({ main: 'Your journey starts now', sub: 'Personalized for you' }),
];

const PHRASES_WITHOUT_NAME: Phrase[] = [
  { main: 'Your journey starts now', sub: 'Personalized for you' },
  { main: 'Crafting your path', sub: 'Tailored to your world' },
  { main: 'Almost there', sub: 'Preparing your first steps' },
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
  const startTime = useRef(Date.now());
  const [steps, setSteps] = useState<ProgressStep[]>([...INITIAL_STEPS]);

  const navigateAndCleanup = useCallback(() => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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

  const runSteps = async () => {
    try {
      const v3Data = v3Store.getOnboardingData();

      // Store proficiency level locally
      if (v3Data.proficiency_level) {
        await storeUserLevel(v3Data.proficiency_level);
      }

      // Persist onboarding data for retry on failure
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, JSON.stringify(v3Data));

      // ── Step 1: Vocabulary ──────────────────────────
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

      // ── Step 2: Speaking Scenarios (staircase skeleton) ──
      updateStep(1, 'in_progress');
      try {
        const previewStairs = generatePreviewStairs({
          scenarios: v3Data.scenarios,
          target_language: v3Data.target_language || 'english',
          profession: v3Data.profession || undefined,
          proficiency_level: v3Data.proficiency_level || undefined,
        });
        await storePreviewStairs(previewStairs);
        updateStep(1, 'done');
      } catch (err) {
        console.warn('[CreatingPath] Stairs error (non-blocking):', err);
        updateStep(1, 'error');
      }

      // Early exit check: if vocab + stairs done and >5s elapsed
      const elapsed = Date.now() - startTime.current;
      if (elapsed >= EARLY_EXIT_MS) {
        // Steps 3 & 4 can finish in background — navigate now
        finishRemainingInBackground(v3Data);
        navigateAndCleanup();
        return;
      }

      // ── Step 3: Library (placeholder — instant) ──────
      updateStep(2, 'in_progress');
      await new Promise(r => setTimeout(r, 600));
      updateStep(2, 'done');

      // ── Step 4: Personalize Path ─────────────────────
      updateStep(3, 'in_progress');
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
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
        updateStep(3, 'done');
      } catch (err) {
        console.warn('[CreatingPath] Path error (non-blocking):', err);
        updateStep(3, 'error');
      }

      // All done — navigate
      navigateAndCleanup();
    } catch (err) {
      console.warn('[CreatingPath] Top-level error:', err);
      // Safety timer will handle navigation
    }
  };

  /**
   * If we're navigating early (after vocab + stairs), finish remaining steps
   * in the background without blocking navigation.
   */
  const finishRemainingInBackground = async (v3Data: any) => {
    try {
      // Step 3: Library (no-op)
      updateStep(2, 'done');

      // Step 4: Personalize path
      updateStep(3, 'in_progress');
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await clearPreviewStairs();
        const adaptedData = adaptV3ToOnboardingData(v3Data);
        const result = await createPersonalizedPath(user.id, adaptedData);
        if (result.success) {
          await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
        }
      }
      updateStep(3, 'done');
    } catch {
      // Non-blocking
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
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subPhrase: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
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
    fontWeight: typography.fontWeight.medium,
    color: 'rgba(255, 255, 255, 0.4)',
    flex: 1,
  },
  stepLabelActive: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
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
