/**
 * useOnboardingV3 — Zustand store collecting onboarding data across screens.
 * Persists to AsyncStorage so data survives app restart during onboarding.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

// ─── Types ───────────────────────────────────────────

export type TargetLanguage = 'english' | 'french' | 'spanish';

export type ProficiencyLevel =
  | 'starting_fresh'
  | 'basics'
  | 'conversational'
  | 'confident'
  | 'near_fluent';

export interface OnboardingV3Data {
  // Screen 0: Auto-detected
  native_language: string;
  onboarding_locale: string;

  // Screen 1: Name
  first_name: string;

  // Screen 2: Target Language
  target_language: TargetLanguage | null;

  // Screen 3: Goal
  goal: string;
  goal_custom: string;

  // Screen 4: Profession
  profession: string;
  profession_custom: string;

  // Screen 5: Scenarios
  scenarios: string[];
  custom_scenarios: string[];

  // Screen 6: Level
  proficiency_level: ProficiencyLevel | null;

  // Screen 9: Schedule (post-signup)
  schedule_time: number | null;
  schedule_days: number | null;

  // Flow control
  current_step: number;
  completed: boolean;
}

interface OnboardingV3Store extends OnboardingV3Data {
  // Actions
  setField: <K extends keyof OnboardingV3Data>(key: K, value: OnboardingV3Data[K]) => void;
  setStep: (step: number) => void;
  addScenario: (scenario: string) => void;
  removeScenario: (scenario: string) => void;
  addCustomScenario: (scenario: string) => void;
  reset: () => void;
  getOnboardingData: () => OnboardingV3Data;
}

// ─── Detect device language ──────────────────────────

function detectNativeLanguage(): string {
  const locales = Localization.getLocales();
  if (locales.length > 0) {
    const lang = locales[0].languageCode;
    // Map common locale codes to full names
    const langMap: Record<string, string> = {
      en: 'english',
      es: 'spanish',
      fr: 'french',
      pt: 'portuguese',
      de: 'german',
      it: 'italian',
      zh: 'chinese',
      ja: 'japanese',
      ko: 'korean',
      ar: 'arabic',
      hi: 'hindi',
      ru: 'russian',
    };
    return langMap[lang || ''] || lang || 'english';
  }
  return 'english';
}

function detectLocale(): string {
  const locales = Localization.getLocales();
  return locales.length > 0 ? (locales[0].languageCode || 'en') : 'en';
}

// ─── Initial state ───────────────────────────────────

const initialState: OnboardingV3Data = {
  native_language: detectNativeLanguage(),
  onboarding_locale: detectLocale(),
  first_name: '',
  target_language: null,
  goal: '',
  goal_custom: '',
  profession: '',
  profession_custom: '',
  scenarios: [],
  custom_scenarios: [],
  proficiency_level: null,
  schedule_time: null,
  schedule_days: null,
  current_step: 0,
  completed: false,
};

// ─── Store ───────────────────────────────────────────

export const useOnboardingV3 = create<OnboardingV3Store>()(
  persist(
    (set, get) => ({
      ...initialState,

      setField: (key, value) => set({ [key]: value }),

      setStep: (step) => set({ current_step: step }),

      addScenario: (scenario) =>
        set((state) => {
          if (state.scenarios.length >= 5) return state;
          if (state.scenarios.includes(scenario)) return state;
          return { scenarios: [...state.scenarios, scenario] };
        }),

      removeScenario: (scenario) =>
        set((state) => ({
          scenarios: state.scenarios.filter((s) => s !== scenario),
        })),

      addCustomScenario: (scenario) =>
        set((state) => {
          if (state.custom_scenarios.includes(scenario)) return state;
          return {
            custom_scenarios: [...state.custom_scenarios, scenario],
            scenarios: state.scenarios.length < 5
              ? [...state.scenarios, scenario]
              : state.scenarios,
          };
        }),

      reset: () => set(initialState),

      getOnboardingData: () => {
        const state = get();
        return {
          native_language: state.native_language,
          onboarding_locale: state.onboarding_locale,
          first_name: state.first_name,
          target_language: state.target_language,
          goal: state.goal,
          goal_custom: state.goal_custom,
          profession: state.profession,
          profession_custom: state.profession_custom,
          scenarios: state.scenarios,
          custom_scenarios: state.custom_scenarios,
          proficiency_level: state.proficiency_level,
          schedule_time: state.schedule_time,
          schedule_days: state.schedule_days,
          current_step: state.current_step,
          completed: state.completed,
        };
      },
    }),
    {
      name: 'vox-onboarding-v3',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
