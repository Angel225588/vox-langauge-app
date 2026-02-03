/**
 * useImmersion Hook
 *
 * Provides progressive immersion functionality that gradually transitions
 * UI elements from native to target language based on user's CEFR level.
 *
 * Now uses real user data from:
 * - useOnboardingV2: For initial language settings and proficiency
 * - useLearningPath: For progress-based level advancement
 */

import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CEFRLevel,
  ImmersionTier,
  ImmersionConfig,
  ImmersionSettings,
  IMMERSION_MAP,
  DEFAULT_IMMERSION_SETTINGS,
  getEffectiveLevel,
} from './types';
import { useOnboardingV2 } from '@/hooks/useOnboardingV2';

/**
 * Map proficiency level string to CEFR level.
 */
const proficiencyToCEFR: Record<string, CEFRLevel> = {
  beginner: 'A1',
  elementary: 'A2',
  intermediate: 'B1',
  upper_intermediate: 'B2',
  advanced: 'C1',
};

/**
 * Calculate effective CEFR level based on completed stairs.
 * Each 2 completed stairs advances CEFR by 1 step.
 *
 * @param baseCEFR - User's initial CEFR from onboarding
 * @param completedStairs - Number of completed staircase steps
 * @returns Effective CEFR level (capped at C2)
 */
function calculateProgressCEFR(baseCEFR: CEFRLevel, completedStairs: number): CEFRLevel {
  const cefrOrder: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const baseIndex = cefrOrder.indexOf(baseCEFR);

  // Each 2 completed stairs advances by 1 CEFR level
  const advancement = Math.floor(completedStairs / 2);
  const newIndex = Math.min(baseIndex + advancement, cefrOrder.length - 1);

  return cefrOrder[newIndex];
}

interface UserProfile {
  userLevel: CEFRLevel;
  targetLanguage: string;
  nativeLanguage: string;
}

/**
 * Hook to get real user profile from onboarding data.
 * Includes progress-based level advancement.
 *
 * @param completedStairs - Number of completed stairs (from useLearningPath)
 */
const useRealUserProfile = (completedStairs: number = 0): UserProfile => {
  const { data } = useOnboardingV2();

  return useMemo(() => {
    // Get base CEFR from onboarding proficiency
    const baseCEFR = proficiencyToCEFR[data.proficiency_level || 'beginner'] || 'A1';

    // Calculate progress-based effective level
    const effectiveLevel = calculateProgressCEFR(baseCEFR, completedStairs);

    return {
      userLevel: effectiveLevel,
      targetLanguage: data.target_language || 'es',
      nativeLanguage: data.native_language || 'en',
    };
  }, [data.proficiency_level, data.target_language, data.native_language, completedStairs]);
};

interface UseImmersionOptions {
  // Override user settings (for testing/preview)
  settingsOverride?: Partial<ImmersionSettings>;
  // Number of completed stairs (for progress-based level advancement)
  completedStairs?: number;
}

interface UseImmersionReturn {
  // Current immersion configuration
  config: ImmersionConfig;

  // User's current CEFR level
  currentLevel: CEFRLevel;

  // Effective level after applying offset
  effectiveLevel: CEFRLevel;

  // Current immersion percentage (0-100)
  immersionPercentage: number;

  // Whether we're at full immersion (90%+)
  isFullImmersion: boolean;

  // Check if a specific tier should use target language
  shouldUseTargetLanguage: (tier: ImmersionTier) => boolean;

  // Get text based on tier and current immersion level
  getImmersiveText: (
    nativeText: string,
    targetText: string,
    tier?: ImmersionTier
  ) => string;

  // Get translation key resolved for current immersion
  getImmersiveTranslation: (
    key: string,
    tier: ImmersionTier,
    namespace?: string
  ) => string;

  // Target and native language codes
  targetLanguage: string;
  nativeLanguage: string;
}

export function useImmersion(
  options: UseImmersionOptions = {}
): UseImmersionReturn {
  const { settingsOverride, completedStairs = 0 } = options;
  const { i18n, t } = useTranslation();

  // Get real user profile with progress-based level advancement
  const { userLevel, targetLanguage, nativeLanguage } = useRealUserProfile(completedStairs);

  // Merge default settings with any overrides
  const settings: ImmersionSettings = useMemo(() => ({
    ...DEFAULT_IMMERSION_SETTINGS,
    ...settingsOverride,
  }), [settingsOverride]);

  // Calculate effective level (applying offset if auto-immersion is on)
  const effectiveLevel = useMemo(() => {
    if (settings.forceFullImmersion) {
      return 'C2';
    }
    if (!settings.autoImmersion) {
      return userLevel;
    }
    return getEffectiveLevel(userLevel, settings.immersionOffset);
  }, [userLevel, settings.autoImmersion, settings.immersionOffset, settings.forceFullImmersion]);

  // Get immersion config for effective level
  const config = useMemo(() => {
    return IMMERSION_MAP[effectiveLevel];
  }, [effectiveLevel]);

  // Check if a tier should use target language
  const shouldUseTargetLanguage = useCallback((tier: ImmersionTier): boolean => {
    return config.tiers[tier];
  }, [config]);

  // Get text based on tier and current immersion level
  const getImmersiveText = useCallback((
    nativeText: string,
    targetText: string,
    tier: ImmersionTier = 'tier1'
  ): string => {
    const useTarget = shouldUseTargetLanguage(tier);
    return useTarget ? targetText : nativeText;
  }, [shouldUseTargetLanguage]);

  // Get translation from i18n based on tier
  const getImmersiveTranslation = useCallback((
    key: string,
    tier: ImmersionTier,
    namespace: string = 'common'
  ): string => {
    const useTarget = shouldUseTargetLanguage(tier);
    const langCode = useTarget ? targetLanguage : nativeLanguage;

    // Try to get translation from the appropriate language
    const translation = i18n.getResource(langCode, namespace, key);

    if (translation && typeof translation === 'string') {
      return translation;
    }

    // Fallback to current language
    return t(`${namespace}:${key}`, { defaultValue: key });
  }, [shouldUseTargetLanguage, targetLanguage, nativeLanguage, i18n, t]);

  return {
    config,
    currentLevel: userLevel,
    effectiveLevel,
    immersionPercentage: config.percentage,
    isFullImmersion: config.percentage >= 90,
    shouldUseTargetLanguage,
    getImmersiveText,
    getImmersiveTranslation,
    targetLanguage,
    nativeLanguage,
  };
}

export default useImmersion;
