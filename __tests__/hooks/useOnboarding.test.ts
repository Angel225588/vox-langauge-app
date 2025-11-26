/**
 * Tests for Onboarding State Management Hook
 *
 * Tests the Zustand store that manages onboarding data across screens
 */

import { renderHook, act } from '@testing-library/react-native';
import { useOnboarding, OnboardingData, MotivationData } from '../../hooks/useOnboarding';

describe('useOnboarding Hook', () => {
  beforeEach(() => {
    // Reset the store before each test
    const { result } = renderHook(() => useOnboarding());
    act(() => {
      result.current.resetOnboardingData();
    });
  });

  describe('Initial State', () => {
    it('should have correct initial values', () => {
      const { result } = renderHook(() => useOnboarding());

      expect(result.current.onboardingData).toEqual({
        learning_goal: null,
        proficiency_level: null,
        daily_time_minutes: null,
        scenarios: [],
        motivation_data: undefined,
      });
    });
  });

  describe('updateOnboardingData', () => {
    it('should update learning goal', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.updateOnboardingData({ learning_goal: 'job_interview' });
      });

      expect(result.current.onboardingData.learning_goal).toBe('job_interview');
    });

    it('should update proficiency level', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.updateOnboardingData({ proficiency_level: 'intermediate' });
      });

      expect(result.current.onboardingData.proficiency_level).toBe('intermediate');
    });

    it('should update daily time commitment', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.updateOnboardingData({ daily_time_minutes: 20 });
      });

      expect(result.current.onboardingData.daily_time_minutes).toBe(20);
    });

    it('should update scenarios array', () => {
      const { result } = renderHook(() => useOnboarding());

      const scenarios = ['interview_introduction', 'interview_experience'];

      act(() => {
        result.current.updateOnboardingData({ scenarios });
      });

      expect(result.current.onboardingData.scenarios).toEqual(scenarios);
    });

    it('should update motivation data', () => {
      const { result } = renderHook(() => useOnboarding());

      const motivationData: MotivationData = {
        why: 'I want to get a job abroad',
        fear: 'I freeze up when speaking',
        stakes: 'I\'ll miss career opportunities',
        timeline: '3 months',
      };

      act(() => {
        result.current.updateOnboardingData({ motivation_data: motivationData });
      });

      expect(result.current.onboardingData.motivation_data).toEqual(motivationData);
    });

    it('should merge updates with existing data', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.updateOnboardingData({ learning_goal: 'travel' });
      });

      act(() => {
        result.current.updateOnboardingData({ proficiency_level: 'beginner' });
      });

      expect(result.current.onboardingData).toEqual({
        learning_goal: 'travel',
        proficiency_level: 'beginner',
        daily_time_minutes: null,
        scenarios: [],
        motivation_data: undefined,
      });
    });

    it('should handle multiple field updates at once', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.updateOnboardingData({
          learning_goal: 'business',
          proficiency_level: 'advanced',
          daily_time_minutes: 45,
          scenarios: ['business_meetings', 'business_presentations'],
        });
      });

      expect(result.current.onboardingData).toEqual({
        learning_goal: 'business',
        proficiency_level: 'advanced',
        daily_time_minutes: 45,
        scenarios: ['business_meetings', 'business_presentations'],
        motivation_data: undefined,
      });
    });
  });

  describe('resetOnboardingData', () => {
    it('should reset all data to initial state', () => {
      const { result } = renderHook(() => useOnboarding());

      // First, populate with data
      act(() => {
        result.current.updateOnboardingData({
          learning_goal: 'job_interview',
          proficiency_level: 'intermediate',
          daily_time_minutes: 20,
          scenarios: ['interview_introduction'],
          motivation_data: {
            why: 'Test',
            fear: 'Test',
            stakes: 'Test',
            timeline: 'Test',
          },
        });
      });

      // Then reset
      act(() => {
        result.current.resetOnboardingData();
      });

      expect(result.current.onboardingData).toEqual({
        learning_goal: null,
        proficiency_level: null,
        daily_time_minutes: null,
        scenarios: [],
        motivation_data: undefined,
      });
    });
  });

  describe('Complete Onboarding Flow', () => {
    it('should handle full onboarding flow step by step', () => {
      const { result } = renderHook(() => useOnboarding());

      // Step 1: Goal Selection
      act(() => {
        result.current.updateOnboardingData({ learning_goal: 'job_interview' });
      });
      expect(result.current.onboardingData.learning_goal).toBe('job_interview');

      // Step 2: Level Assessment
      act(() => {
        result.current.updateOnboardingData({ proficiency_level: 'intermediate' });
      });
      expect(result.current.onboardingData.proficiency_level).toBe('intermediate');

      // Step 3: Time Commitment
      act(() => {
        result.current.updateOnboardingData({ daily_time_minutes: 20 });
      });
      expect(result.current.onboardingData.daily_time_minutes).toBe(20);

      // Step 4: Motivation
      act(() => {
        result.current.updateOnboardingData({
          motivation_data: {
            why: 'Career advancement',
            fear: 'Speaking in meetings',
            stakes: 'Job opportunities',
            timeline: '6 months',
          },
        });
      });
      expect(result.current.onboardingData.motivation_data).toBeDefined();

      // Step 5: Scenarios
      act(() => {
        result.current.updateOnboardingData({
          scenarios: ['interview_introduction', 'interview_experience', 'interview_salary'],
        });
      });
      expect(result.current.onboardingData.scenarios).toHaveLength(3);

      // Verify complete data
      expect(result.current.onboardingData).toEqual({
        learning_goal: 'job_interview',
        proficiency_level: 'intermediate',
        daily_time_minutes: 20,
        scenarios: ['interview_introduction', 'interview_experience', 'interview_salary'],
        motivation_data: {
          why: 'Career advancement',
          fear: 'Speaking in meetings',
          stakes: 'Job opportunities',
          timeline: '6 months',
        },
      });
    });

    it('should handle skipped motivation step', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.updateOnboardingData({
          learning_goal: 'travel',
          proficiency_level: 'beginner',
          daily_time_minutes: 10,
          scenarios: ['travel_airport'],
        });
      });

      // Motivation skipped - should be undefined
      expect(result.current.onboardingData.motivation_data).toBeUndefined();
    });

    it('should handle custom scenario in scenarios array', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.updateOnboardingData({
          scenarios: ['travel_hotel', 'custom_Negotiating rent prices'],
        });
      });

      expect(result.current.onboardingData.scenarios).toContain('custom_Negotiating rent prices');
      expect(result.current.onboardingData.scenarios).toHaveLength(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty scenarios array', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.updateOnboardingData({ scenarios: [] });
      });

      expect(result.current.onboardingData.scenarios).toEqual([]);
    });

    it('should handle updating scenario list multiple times', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.updateOnboardingData({ scenarios: ['scenario_1'] });
      });

      act(() => {
        result.current.updateOnboardingData({ scenarios: ['scenario_1', 'scenario_2'] });
      });

      expect(result.current.onboardingData.scenarios).toEqual(['scenario_1', 'scenario_2']);
    });

    it('should handle null values correctly', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.updateOnboardingData({
          learning_goal: 'business',
        });
      });

      act(() => {
        result.current.updateOnboardingData({
          learning_goal: null,
        });
      });

      expect(result.current.onboardingData.learning_goal).toBeNull();
    });

    it('should handle partial motivation data updates', () => {
      const { result } = renderHook(() => useOnboarding());

      const initialMotivation: MotivationData = {
        why: 'Initial why',
        fear: 'Initial fear',
        stakes: 'Initial stakes',
        timeline: 'Initial timeline',
      };

      act(() => {
        result.current.updateOnboardingData({ motivation_data: initialMotivation });
      });

      // Update with new motivation data (full replacement)
      const updatedMotivation: MotivationData = {
        why: 'Updated why',
        fear: 'Updated fear',
        stakes: 'Updated stakes',
        timeline: 'Updated timeline',
      };

      act(() => {
        result.current.updateOnboardingData({ motivation_data: updatedMotivation });
      });

      expect(result.current.onboardingData.motivation_data).toEqual(updatedMotivation);
    });
  });

  describe('Data Validation', () => {
    it('should accept all valid learning goals', () => {
      const { result } = renderHook(() => useOnboarding());

      const validGoals = [
        'job_interview',
        'travel',
        'business',
        'daily_conversation',
        'academic',
        'making_friends',
      ];

      validGoals.forEach((goal) => {
        act(() => {
          result.current.updateOnboardingData({ learning_goal: goal });
        });

        expect(result.current.onboardingData.learning_goal).toBe(goal);
      });
    });

    it('should accept all valid proficiency levels', () => {
      const { result } = renderHook(() => useOnboarding());

      const validLevels = [
        'beginner',
        'elementary',
        'intermediate',
        'upper_intermediate',
        'advanced',
      ];

      validLevels.forEach((level) => {
        act(() => {
          result.current.updateOnboardingData({ proficiency_level: level });
        });

        expect(result.current.onboardingData.proficiency_level).toBe(level);
      });
    });

    it('should accept all valid time commitments', () => {
      const { result } = renderHook(() => useOnboarding());

      const validTimes = [10, 20, 30, 45];

      validTimes.forEach((time) => {
        act(() => {
          result.current.updateOnboardingData({ daily_time_minutes: time });
        });

        expect(result.current.onboardingData.daily_time_minutes).toBe(time);
      });
    });
  });
});
