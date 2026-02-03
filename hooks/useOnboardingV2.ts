/**
 * Onboarding V2 Hook
 *
 * New streamlined onboarding data collection with deep motivation questions.
 * Data is persisted to AsyncStorage so it survives app restarts.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OnboardingV2Data {
  // Screen 1: Languages
  native_language: string | null;
  target_language: string | null;
  target_accent: string | null;  // e.g., 'es-latam', 'es-spain', 'en-american', 'en-british', 'fr-france', 'fr-canada'

  // Screen 2: Your Why
  motivation: string | null;
  motivation_custom: string | null;
  why_now: string | null;

  // Screen 3: Your Level
  proficiency_level: string | null;
  previous_attempts: string | null;

  // Screen 4: Your Commitment (timeline)
  timeline: string | null;

  // Screen 5: Your Stakes (what's waiting on the other side)
  stakes: string | null;
  commitment_stakes: string | null; // Legacy - kept for backwards compatibility
}

interface OnboardingV2Store {
  data: OnboardingV2Data;
  currentStep: number;
  totalSteps: number;

  // Actions
  updateData: (updates: Partial<OnboardingV2Data>) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;

  // Computed
  isStepComplete: (step: number) => boolean;
  getProgress: () => number;
}

const initialData: OnboardingV2Data = {
  native_language: null,
  target_language: null,
  target_accent: null,
  motivation: null,
  motivation_custom: null,
  why_now: null,
  proficiency_level: null,
  previous_attempts: null,
  timeline: null,
  stakes: null,
  commitment_stakes: null, // Legacy
};

export const useOnboardingV2 = create<OnboardingV2Store>()(
  persist(
    (set, get) => ({
      data: initialData,
      currentStep: 1,
      totalSteps: 6, // Languages, Why, Level, Commitment, Stakes, Ready

      updateData: (updates) =>
        set((state) => ({
          data: { ...state.data, ...updates },
        })),

      setStep: (step) =>
        set({ currentStep: Math.min(Math.max(1, step), get().totalSteps) }),

      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, state.totalSteps),
        })),

      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 1),
        })),

      reset: () =>
        set({
          data: initialData,
          currentStep: 1,
        }),

      isStepComplete: (step) => {
        const { data } = get();
        switch (step) {
          case 1: // Languages + Accent
            return !!data.native_language && !!data.target_language && !!data.target_accent;
          case 2: // Your Why
            return !!data.motivation || !!data.motivation_custom;
          case 3: // Your Level
            return !!data.proficiency_level;
          case 4: // Your Commitment (Timeline)
            return !!data.timeline;
          case 5: // Your Stakes (What's waiting)
            return !!data.stakes;
          case 6: // Ready (always complete if we get here)
            return true;
          default:
            return false;
        }
      },

      getProgress: () => {
        const { currentStep, totalSteps } = get();
        return (currentStep / totalSteps) * 100;
      },
    }),
    {
      name: 'vox-onboarding-v2',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the data, not the step (users should restart onboarding flow)
      partialize: (state) => ({ data: state.data }),
    }
  )
);

// Language options
export const NATIVE_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', label: 'French', flag: '🇫🇷' },
  { code: 'de', label: 'German', flag: '🇩🇪' },
  { code: 'pt', label: 'Portuguese', flag: '🇧🇷' },
  { code: 'it', label: 'Italian', flag: '🇮🇹' },
  { code: 'zh', label: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', label: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', label: 'Korean', flag: '🇰🇷' },
  { code: 'ar', label: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
  { code: 'ru', label: 'Russian', flag: '🇷🇺' },
  { code: 'other', label: 'Other', flag: '🌍' },
];

export const TARGET_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸', description: 'The global language' },
  { code: 'fr', label: 'French', flag: '🇫🇷', description: 'The language of love' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸', description: 'Connect with 500M+ people' },
];

export const MOTIVATIONS = [
  { id: 'travel', label: 'Travel & Adventure', emoji: '🌍', description: 'Explore the world with confidence' },
  { id: 'career', label: 'Career & Business', emoji: '💼', description: 'Unlock professional opportunities' },
  { id: 'education', label: 'Education & Study', emoji: '🎓', description: 'Academic goals and exams' },
  { id: 'love', label: 'Love & Relationships', emoji: '💕', description: 'Connect with someone special' },
  { id: 'relocation', label: 'Living Abroad', emoji: '🏠', description: 'Moving to a new country' },
  { id: 'challenge', label: 'Personal Challenge', emoji: '🎯', description: 'Because you can' },
];

export const PROFICIENCY_LEVELS = [
  { id: 'beginner', label: 'Complete Beginner', emoji: '🌱', description: 'I know almost nothing' },
  { id: 'elementary', label: 'Elementary', emoji: '📚', description: 'I know basic words and phrases' },
  { id: 'intermediate', label: 'Intermediate', emoji: '💬', description: 'I can have simple conversations' },
  { id: 'upper_intermediate', label: 'Upper Intermediate', emoji: '🗣️', description: "I'm comfortable but want to improve" },
  { id: 'advanced', label: 'Advanced', emoji: '⭐', description: 'I want to perfect my fluency' },
];

export const TIMELINES = [
  { id: '1-3_months', label: '1-3 months', emoji: '⚡', description: 'Intensive learning' },
  { id: '3-6_months', label: '3-6 months', emoji: '📅', description: 'Steady progress' },
  { id: '6-12_months', label: '6-12 months', emoji: '🎯', description: 'Long-term journey' },
  { id: 'no_deadline', label: 'No deadline', emoji: '🌟', description: 'Learning for life' },
];

// "What's waiting for you on the other side?" options
export const STAKES_OPTIONS = [
  { id: 'connection', label: 'A deeper connection', emoji: '💗', subtext: 'With someone who matters' },
  { id: 'career', label: 'A career breakthrough', emoji: '🚀', subtext: 'The role, the raise, the respect' },
  { id: 'travel', label: 'A richer travel experience', emoji: '🌍', subtext: 'Actually living the culture, not just visiting' },
  { id: 'confidence', label: 'A more confident me', emoji: '✨', subtext: 'No more "sorry, I don\'t speak..."' },
];

// Accent options by target language
// Users select their preferred accent for voice conversations
export const ACCENT_OPTIONS: Record<string, Array<{
  id: string;
  label: string;
  flag: string;
  description: string;
  region: string;
}>> = {
  // Spanish accents
  es: [
    {
      id: 'es-latam',
      label: 'Latin American',
      flag: '🇲🇽',
      description: 'Mexican & Latin American Spanish',
      region: 'Americas',
    },
    {
      id: 'es-spain',
      label: 'Castilian',
      flag: '🇪🇸',
      description: 'European Spanish from Spain',
      region: 'Europe',
    },
  ],
  // English accents
  en: [
    {
      id: 'en-american',
      label: 'American',
      flag: '🇺🇸',
      description: 'Standard American English',
      region: 'North America',
    },
    {
      id: 'en-british',
      label: 'British',
      flag: '🇬🇧',
      description: 'British English from UK',
      region: 'Europe',
    },
  ],
  // French accents
  fr: [
    {
      id: 'fr-france',
      label: 'Parisian',
      flag: '🇫🇷',
      description: 'Standard French from France',
      region: 'Europe',
    },
    {
      id: 'fr-canada',
      label: 'Québécois',
      flag: '🇨🇦',
      description: 'Canadian French from Quebec',
      region: 'North America',
    },
  ],
};

// Helper to get accents for a language
export function getAccentsForLanguage(languageCode: string) {
  return ACCENT_OPTIONS[languageCode] || [];
}
