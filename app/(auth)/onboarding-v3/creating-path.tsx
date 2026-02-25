/**
 * V3 Creating Path — Simple waiting screen + path generation.
 *
 * Shows an inspirational phrase for ~3 seconds while generating
 * the personalized learning path in the background.
 * No countdown — clean, minimal, patient.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { GlassBackground } from '@/components/ui/glass/GlassBackground';
import { useOnboardingV3 } from '@/hooks/useOnboardingV3';
import { supabase } from '@/lib/db/supabase';
import { createPersonalizedPath } from '@/lib/services/pathGeneration';
import { adaptV3ToOnboardingData, validateV3Data } from '@/lib/services/v3DataAdapter';
import { storeUserLevel } from '@/lib/utils/levelGating';
import { generatePreviewStairs, storePreviewStairs, clearPreviewStairs } from '@/lib/services/previewStairs';
import { colors, spacing, typography } from '@/constants/designSystem';

const ONBOARDING_COMPLETED_KEY = 'vox-onboarding-completed';

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

// ─── Screen ─────────────────────────────────────────

export default function CreatingPathRoute() {
  const v3Store = useOnboardingV3();
  const hasStarted = useRef(false);
  const [phrase] = useState(() => getPhrase(v3Store.first_name));
  const hasNavigated = useRef(false);

  const navigateAndCleanup = useCallback(() => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/(tabs)/home');
    // Delay reset so navigation commits first (avoid race condition)
    setTimeout(() => v3Store.reset(), 200);
  }, []);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    // Fire-and-forget path generation — does NOT block navigation
    generatePathInBackground();

    // HARD 3-second cap — navigate regardless of path generation status
    const timer = setTimeout(navigateAndCleanup, 3000);
    return () => clearTimeout(timer);
  }, []);

  const generatePathInBackground = async () => {
    try {
      const v3Data = v3Store.getOnboardingData();

      // Store proficiency level locally (works without auth)
      if (v3Data.proficiency_level) {
        await storeUserLevel(v3Data.proficiency_level);
      }

      // Persist onboarding data so index.tsx can retry if path generation fails
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, JSON.stringify(v3Data));

      // Try to get authenticated user for full path generation
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Authenticated — generate full personalized path in Supabase
        await clearPreviewStairs();
        const validationError = validateV3Data(v3Data);
        if (validationError) {
          console.warn('[CreatingPath] Validation warning:', validationError);
        }

        const adaptedData = adaptV3ToOnboardingData(v3Data);
        const result = await createPersonalizedPath(user.id, adaptedData);

        if (result.success) {
          // Path created — clear the retry flag
          await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
        } else {
          console.warn('[CreatingPath] Path generation failed:', result.error);
          // Keep the flag so index.tsx can retry on next launch
        }
      } else {
        // No auth — generate preview stairs from their scenarios
        const previewStairs = generatePreviewStairs({
          scenarios: v3Data.scenarios,
          target_language: v3Data.target_language || 'english',
          profession: v3Data.profession || undefined,
          proficiency_level: v3Data.proficiency_level || undefined,
        });
        await storePreviewStairs(previewStairs);
        console.log('[CreatingPath] Stored', previewStairs.length, 'preview stairs');
      }

      // If path finishes before 3s, navigate early
      navigateAndCleanup();
    } catch (err) {
      console.warn('[CreatingPath] Error (non-blocking):', err);
      // Timer will handle navigation at 3s regardless
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

        {/* Subtle loader */}
        <Animated.View entering={FadeInUp.duration(400).delay(500)}>
          <ActivityIndicator size="small" color={colors.primary.light} />
        </Animated.View>
      </View>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  phraseSection: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  mainPhrase: {
    fontSize: typography.fontSize['3xl'],
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
});
