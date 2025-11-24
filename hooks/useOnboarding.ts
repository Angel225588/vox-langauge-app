/**
 * Onboarding Hook
 *
 * Manages onboarding data collection across multiple screens
 */

import { create } from 'zustand';

export interface MotivationData {
  why: string;
  fear: string;
  stakes: string;
  timeline: string;
}

export interface OnboardingData {
  learning_goal: string | null;
  proficiency_level: string | null;
  daily_time_minutes: number | null;
  scenarios: string[];
  motivation_data?: MotivationData;
}

interface OnboardingStore {
  onboardingData: OnboardingData;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
  resetOnboardingData: () => void;
}

const initialOnboardingData: OnboardingData = {
  learning_goal: null,
  proficiency_level: null,
  daily_time_minutes: null,
  scenarios: [],
  motivation_data: undefined,
};

export const useOnboarding = create<OnboardingStore>((set) => ({
  onboardingData: initialOnboardingData,
  updateOnboardingData: (data) =>
    set((state) => ({
      onboardingData: { ...state.onboardingData, ...data },
    })),
  resetOnboardingData: () =>
    set({
      onboardingData: initialOnboardingData,
    }),
}));
