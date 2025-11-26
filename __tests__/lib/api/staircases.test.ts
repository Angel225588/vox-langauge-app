import { completeOnboarding, OnboardingProfile } from '@/lib/api/staircases';
import { supabase } from '@/lib/db/supabase';
import { generatePersonalizedStaircase } from '@/lib/gemini/staircase-generator';

// Mock supabase client
const mockUpsert = jest.fn();
const mockStaircaseInsert = jest.fn();
const mockStepsInsert = jest.fn();
const mockProgressInsert = jest.fn();
const mockSelect = jest.fn();
const mockSingle = jest.fn();

jest.mock('@/lib/db/supabase', () => ({
  supabase: {
    from: jest.fn((table: string) => {
      if (table === 'user_onboarding_profiles') {
        return {
          upsert: mockUpsert,
        };
      }
      if (table === 'user_staircases') {
        return {
          insert: mockStaircaseInsert,
        };
      }
      if (table === 'staircase_steps') {
        return {
          insert: mockStepsInsert,
        };
      }
      if (table === 'user_stair_progress') {
        return {
          insert: mockProgressInsert,
        };
      }
      return {};
    }),
  },
}));

// Mock staircase-generator
jest.mock('@/lib/gemini/staircase-generator', () => ({
  generatePersonalizedStaircase: jest.fn(),
}));

describe('completeOnboarding', () => {
  const mockSupabase = supabase as jest.Mocked<typeof supabase>;
  const mockGeneratePersonalizedStaircase = generatePersonalizedStaircase as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock for generatePersonalizedStaircase
    mockGeneratePersonalizedStaircase.mockResolvedValue({
      stairs: [],
      total_stairs: 0,
      estimated_completion_days: 0,
    });

    // Set up mock chains
    mockUpsert.mockResolvedValue({ error: null });
    mockSingle.mockResolvedValue({ data: { id: 'staircase_id' }, error: null });
    mockSelect.mockReturnValue({ single: mockSingle });
    mockStaircaseInsert.mockReturnValue({ select: mockSelect });
    mockStepsInsert.mockReturnValue({ select: jest.fn().mockResolvedValue({ data: [], error: null }) });
    mockProgressInsert.mockResolvedValue({ error: null });
  });

  it('should save motivation_data correctly to user_onboarding_profiles', async () => {
    // Arrange
    const userId = 'test_user_id';
    const profileWithMotivation: OnboardingProfile = {
      learning_goal: 'learn Spanish',
      proficiency_level: 'beginner',
      daily_time_minutes: 30,
      scenarios: ['travel'],
      motivation_data: {
        why: 'To travel the world',
        fear: 'Getting lost',
        stakes: 'Missing out on experiences',
        timeline: '1 year',
      },
    };

    // Act
    const { success, error } = await completeOnboarding(userId, profileWithMotivation);

    // Debug logging
    if (!success) {
      console.log('Test failed with error:', error);
    }

    // Assert
    expect(success).toBe(true);
    expect(error).toBeUndefined();
    expect(mockSupabase.from('user_onboarding_profiles').upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: userId,
        learning_goal: profileWithMotivation.learning_goal,
        motivation_data: profileWithMotivation.motivation_data,
      })
    );
  });
});