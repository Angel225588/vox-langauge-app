/**
 * Onboarding Hook
 *
 * Manages onboarding data collection across multiple screens
 */

import { create } from 'zustand';

export interface OnboardingData {
  learning_goal: string | null;
  proficiency_level: string | null;
  daily_time_minutes: number | null;
  scenarios: string[];
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
