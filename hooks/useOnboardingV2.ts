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
  profession: string | null;
  profession_custom: string | null;

  // Screen 3: Your Level
  proficiency_level: string | null;
  previous_attempts: string | null;

  // Screen 4: Your Commitment (timeline)
  timeline: string | null;
  min_practice_time: number | null;
  max_practice_time: number | null;
  days_per_week: number | null;

  // Screen 5: Your Scenarios (was Your Stakes)
  stakes: string | null;
  scenarios: string[] | null;
  commitment_stakes: string | null; // Legacy - kept for backwards compatibility
}

interface OnboardingV2Store {
  data: OnboardingV2Data;
  currentStep: number;
  totalSteps: number;
  _hasHydrated: boolean;

  // Actions
  setHasHydrated: (hydrated: boolean) => void;
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
  profession: null,
  profession_custom: null,
  proficiency_level: null,
  previous_attempts: null,
  timeline: null,
  min_practice_time: null,
  max_practice_time: null,
  days_per_week: null,
  stakes: null,
  scenarios: null,
  commitment_stakes: null, // Legacy
};

export const useOnboardingV2 = create<OnboardingV2Store>()(
  persist(
    (set, get) => ({
      data: initialData,
      currentStep: 1,
      totalSteps: 6, // Languages, Why, Level, Commitment, Stakes, Ready
      _hasHydrated: false,

      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),

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
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

/**
 * Waits for the Zustand persist middleware to flush state to AsyncStorage.
 * Call this after updateData() and before router.push() to prevent data loss
 * from a race condition between in-memory state updates and async persistence.
 *
 * Uses a short delay to allow the persist middleware's subscribe handler to
 * write the new state to AsyncStorage before navigation triggers a remount.
 */
export async function flushOnboardingState(): Promise<void> {
  // Zustand persist middleware subscribes to state changes and writes
  // to AsyncStorage asynchronously. We need to give it time to flush.
  // AsyncStorage.setItem is async — a small delay ensures the write completes.
  await new Promise(resolve => setTimeout(resolve, 50));
}

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

// Profession options
export const PROFESSIONS = [
  { id: 'business', label: 'Business & Management', icon: '💼' },
  { id: 'tech', label: 'Tech & Engineering', icon: '💻' },
  { id: 'healthcare', label: 'Healthcare & Medical', icon: '🏥' },
  { id: 'legal', label: 'Legal & Law', icon: '⚖️' },
  { id: 'education', label: 'Education & Academia', icon: '📚' },
  { id: 'creative', label: 'Creative & Media', icon: '🎨' },
  { id: 'hospitality', label: 'Hospitality & Tourism', icon: '🏨' },
  { id: 'government', label: 'Government & Diplomacy', icon: '🏛️' },
  { id: 'student', label: 'Student', icon: '🎓' },
  { id: 'other', label: 'Other', icon: '🔧' },
];

// Scenarios organized by profession context
export const SCENARIOS_BY_CONTEXT: Record<string, Array<{ id: string; label: string; icon: string; description: string }>> = {
  business: [
    { id: 'pitching_ideas', label: 'Pitching Ideas', icon: '💡', description: 'Present proposals to stakeholders' },
    { id: 'negotiating_deals', label: 'Negotiating Deals', icon: '🤝', description: 'Close deals and reach agreements' },
    { id: 'leading_meetings', label: 'Leading Meetings', icon: '📋', description: 'Run meetings with confidence' },
    { id: 'networking', label: 'Networking Events', icon: '🥂', description: 'Build professional relationships' },
    { id: 'client_calls', label: 'Client Calls', icon: '📞', description: 'Handle calls with international clients' },
    { id: 'email_writing', label: 'Professional Emails', icon: '✉️', description: 'Write clear business communication' },
  ],
  tech: [
    { id: 'code_reviews', label: 'Code Reviews', icon: '🔍', description: 'Discuss technical decisions with teams' },
    { id: 'standups', label: 'Daily Standups', icon: '🗓️', description: 'Share progress and blockers' },
    { id: 'tech_presentations', label: 'Tech Presentations', icon: '📊', description: 'Present technical topics clearly' },
    { id: 'interviews', label: 'Tech Interviews', icon: '💻', description: 'Ace technical interviews' },
    { id: 'client_demos', label: 'Client Demos', icon: '🖥️', description: 'Demo products to stakeholders' },
    { id: 'documentation', label: 'Documentation', icon: '📝', description: 'Write clear technical docs' },
  ],
  healthcare: [
    { id: 'patient_consultations', label: 'Patient Consultations', icon: '🩺', description: 'Communicate diagnoses clearly' },
    { id: 'medical_history', label: 'Taking Medical History', icon: '📋', description: 'Gather patient information' },
    { id: 'colleague_handoffs', label: 'Colleague Handoffs', icon: '🔄', description: 'Transfer care effectively' },
    { id: 'medical_conferences', label: 'Medical Conferences', icon: '🎤', description: 'Present research findings' },
    { id: 'emergency_communication', label: 'Emergency Situations', icon: '🚨', description: 'Communicate under pressure' },
    { id: 'patient_education', label: 'Patient Education', icon: '📖', description: 'Explain treatments simply' },
  ],
  legal: [
    { id: 'client_intake', label: 'Client Intake', icon: '📝', description: 'Gather case details from clients' },
    { id: 'courtroom', label: 'Courtroom Language', icon: '⚖️', description: 'Argue cases with precision' },
    { id: 'contract_review', label: 'Contract Discussion', icon: '📄', description: 'Negotiate contract terms' },
    { id: 'depositions', label: 'Depositions', icon: '🎤', description: 'Conduct formal questioning' },
    { id: 'legal_writing', label: 'Legal Writing', icon: '✍️', description: 'Draft legal documents' },
    { id: 'mediation', label: 'Mediation', icon: '🤝', description: 'Facilitate dispute resolution' },
  ],
  education: [
    { id: 'lecturing', label: 'Giving Lectures', icon: '🎓', description: 'Teach with clarity and engagement' },
    { id: 'student_feedback', label: 'Student Feedback', icon: '💬', description: 'Give constructive feedback' },
    { id: 'academic_writing', label: 'Academic Writing', icon: '📝', description: 'Write papers and proposals' },
    { id: 'conference_talks', label: 'Conference Talks', icon: '🎤', description: 'Present at academic events' },
    { id: 'parent_meetings', label: 'Parent Meetings', icon: '👨‍👩‍👧', description: 'Discuss student progress' },
    { id: 'collaboration', label: 'Research Collaboration', icon: '🔬', description: 'Work with international teams' },
  ],
  creative: [
    { id: 'client_briefs', label: 'Client Briefs', icon: '🎯', description: 'Understand and discuss creative direction' },
    { id: 'pitch_presentations', label: 'Creative Pitches', icon: '💡', description: 'Sell your creative vision' },
    { id: 'feedback_sessions', label: 'Feedback Sessions', icon: '💬', description: 'Give and receive creative critique' },
    { id: 'content_creation', label: 'Content Creation', icon: '📱', description: 'Create multilingual content' },
    { id: 'interviews_media', label: 'Media Interviews', icon: '🎙️', description: 'Handle press and interviews' },
    { id: 'collaboration_creative', label: 'Creative Collaboration', icon: '🤝', description: 'Work with international creatives' },
  ],
  hospitality: [
    { id: 'guest_reception', label: 'Guest Reception', icon: '🏨', description: 'Welcome and assist guests' },
    { id: 'complaint_handling', label: 'Complaint Handling', icon: '🛎️', description: 'Resolve guest issues' },
    { id: 'tour_guiding', label: 'Tour Guiding', icon: '🗺️', description: 'Lead tours in another language' },
    { id: 'restaurant_service', label: 'Restaurant Service', icon: '🍽️', description: 'Menu explanation and service' },
    { id: 'event_coordination', label: 'Event Coordination', icon: '🎉', description: 'Organize multilingual events' },
    { id: 'travel_advice', label: 'Travel Advice', icon: '✈️', description: 'Give local recommendations' },
  ],
  government: [
    { id: 'diplomatic_meetings', label: 'Diplomatic Meetings', icon: '🏛️', description: 'Formal diplomatic discussions' },
    { id: 'public_speaking', label: 'Public Speaking', icon: '🎤', description: 'Address diverse audiences' },
    { id: 'policy_discussion', label: 'Policy Discussion', icon: '📋', description: 'Debate policy in committees' },
    { id: 'constituent_services', label: 'Constituent Services', icon: '🤝', description: 'Help multilingual communities' },
    { id: 'international_relations', label: 'International Relations', icon: '🌐', description: 'Cross-border communication' },
    { id: 'report_writing', label: 'Report Writing', icon: '📝', description: 'Write official documents' },
  ],
  student: [
    { id: 'classroom_participation', label: 'Classroom Participation', icon: '🙋', description: 'Ask questions and join discussions' },
    { id: 'study_groups', label: 'Study Groups', icon: '📚', description: 'Collaborate with classmates' },
    { id: 'presentations', label: 'Class Presentations', icon: '📊', description: 'Present projects and research' },
    { id: 'office_hours', label: 'Office Hours', icon: '🏢', description: 'Discuss work with professors' },
    { id: 'social_campus', label: 'Campus Social Life', icon: '🎒', description: 'Make friends and socialize' },
    { id: 'job_interviews', label: 'Job Interviews', icon: '💼', description: 'Land your first role' },
  ],
  default: [
    { id: 'daily_conversations', label: 'Daily Conversations', icon: '💬', description: 'Chat naturally with anyone' },
    { id: 'travel_situations', label: 'Travel Situations', icon: '✈️', description: 'Navigate airports, hotels, restaurants' },
    { id: 'making_friends', label: 'Making Friends', icon: '🤝', description: 'Build real relationships' },
    { id: 'professional_meetings', label: 'Professional Meetings', icon: '💼', description: 'Meetings and presentations' },
    { id: 'phone_calls', label: 'Phone Calls', icon: '📞', description: 'Handle calls with confidence' },
    { id: 'social_events', label: 'Social Events', icon: '🥂', description: 'Small talk and networking' },
  ],
};

// Practice time options
export const PRACTICE_TIME_OPTIONS = [
  { min: 5, max: 10, label: '5-10 min', description: 'Quick sessions' },
  { min: 10, max: 20, label: '10-20 min', description: 'Focused learning' },
  { min: 20, max: 30, label: '20-30 min', description: 'Deep practice' },
  { min: 30, max: 60, label: '30-60 min', description: 'Intensive study' },
];

// Days per week options
export const DAYS_PER_WEEK_OPTIONS = [
  { days: 3, label: '3', description: 'Light' },
  { days: 4, label: '4', description: 'Moderate' },
  { days: 5, label: '5', description: 'Committed' },
  { days: 6, label: '6', description: 'Intensive' },
  { days: 7, label: '7', description: 'Daily' },
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
