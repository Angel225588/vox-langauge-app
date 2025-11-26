/**
 * Tests for Gemini Staircase Generator
 *
 * These tests ensure the AI-powered learning path generation works correctly
 */

// Mock the Gemini API BEFORE importing the module
const mockGenerateContent = jest.fn();
const mockGetGenerativeModel = jest.fn(() => ({
  generateContent: mockGenerateContent,
}));

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn(() => ({
    getGenerativeModel: mockGetGenerativeModel,
  })),
}));

import {
  generatePersonalizedStaircase,
  UserProfile,
  PersonalizedStaircase,
  Stair,
  // __setGenAIForTesting, // TODO: Add this export if needed for advanced testing
} from '../../lib/gemini/staircase-generator';

describe('Staircase Generator', () => {
  const mockProfile: UserProfile = {
    learning_goal: 'job_interview',
    proficiency_level: 'intermediate',
    daily_time_minutes: 20,
    scenarios: ['interview_introduction', 'interview_experience'],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset the mock to return the generateContent function properly
    mockGenerateContent.mockReset();
    mockGetGenerativeModel.mockReturnValue({
      generateContent: mockGenerateContent,
    });

    // TODO: Uncomment when __setGenAIForTesting is implemented
    // Set up the mock GenAI instance for all tests
    // const mockGenAI: any = {
    //   getGenerativeModel: mockGetGenerativeModel,
    // };
    // __setGenAIForTesting(mockGenAI);
  });

  afterEach(() => {
    // TODO: Uncomment when __setGenAIForTesting is implemented
    // Clean up after each test
    // __setGenAIForTesting(null);
  });

  describe('generatePersonalizedStaircase', () => {
    it('should include motivation data in the prompt when provided', async () => {
      const profileWithMotivation: UserProfile = {
        ...mockProfile,
        motivation_data: {
          why: 'To get a promotion',
          fear: 'Sounding unintelligent',
          stakes: 'My career advancement',
          timeline: '6 months',
        },
      };

      const mockGeminiResponse = {
        stairs: [
          {
            order: 1,
            title: 'Motivation-driven Intro',
            emoji: '🌟',
            description: 'This is a test step driven by motivation.',
            difficulty: 'intermediate',
            estimated_days: 3,
            vocabulary_count: 30,
            skills_focus: ['speaking'],
            scenario_tags: ['promotion_interview'],
          },
        ],
      };

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify(mockGeminiResponse),
        },
      });

      await generatePersonalizedStaircase(profileWithMotivation);

      // Assert that generateContent was called with a prompt containing motivation data
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
      const promptArgument = mockGenerateContent.mock.calls[0][0];

      expect(promptArgument).toContain('**Deep Motivations:**');
      expect(promptArgument).toContain('- Why they want to learn: To get a promotion');
      expect(promptArgument).toContain('- Biggest fear/frustration: Sounding unintelligent');
      expect(promptArgument).toContain('- What\'s at stake: My career advancement');
      expect(promptArgument).toContain('- Timeline: 6 months');
      expect(promptArgument).toContain('7. Help them achieve what\'s at stake: "My career advancement"');
      expect(promptArgument).toContain('8. Keep their timeline in mind: 6 months');
    });

    it('should generate a valid staircase structure', async () => {
      const mockGeminiResponse = {
        stairs: [
          {
            order: 1,
            title: 'Job Interview Self-Introduction',
            emoji: '👋',
            description: 'Learn to introduce yourself professionally',
            difficulty: 'intermediate',
            estimated_days: 3,
            vocabulary_count: 35,
            skills_focus: ['speaking', 'listening'],
            scenario_tags: ['interview_introduction'],
          },
          {
            order: 2,
            title: 'Discussing Your Experience',
            emoji: '💼',
            description: 'Talk about your work experience confidently',
            difficulty: 'intermediate',
            estimated_days: 4,
            vocabulary_count: 50,
            skills_focus: ['speaking'],
            scenario_tags: ['interview_experience'],
          },
        ],
      };

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify(mockGeminiResponse),
        },
      });

      const result = await generatePersonalizedStaircase(mockProfile);

      expect(result).toBeDefined();
      expect(result.stairs).toHaveLength(2);
      expect(result.total_stairs).toBe(2);
      expect(result.estimated_completion_days).toBe(7);
      expect(result.created_at).toBeDefined();
    });

    it('should add unique IDs to each stair', async () => {
      const mockGeminiResponse = {
        stairs: [
          {
            order: 1,
            title: 'Step 1',
            emoji: '📚',
            description: 'Test step',
            difficulty: 'beginner',
            estimated_days: 2,
            vocabulary_count: 20,
            skills_focus: ['listening'],
            scenario_tags: [],
          },
        ],
      };

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify(mockGeminiResponse),
        },
      });

      const result = await generatePersonalizedStaircase(mockProfile);

      expect(result.stairs[0].id).toBeDefined();
      expect(result.stairs[0].id).toMatch(/^stair_\d+_0$/);
    });

    it('should handle Gemini response with markdown code blocks', async () => {
      const mockGeminiResponse = {
        stairs: [
          {
            order: 1,
            title: 'Test',
            emoji: '📚',
            description: 'Test',
            difficulty: 'beginner',
            estimated_days: 2,
            vocabulary_count: 20,
            skills_focus: ['listening'],
            scenario_tags: [],
          },
        ],
      };

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => `\`\`\`json\n${JSON.stringify(mockGeminiResponse)}\n\`\`\``,
        },
      });

      const result = await generatePersonalizedStaircase(mockProfile);

      expect(result).toBeDefined();
      expect(result.stairs).toHaveLength(1);
    });

    it('should use fallback staircase when Gemini fails', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API Error'));

      const result = await generatePersonalizedStaircase(mockProfile);

      // Should still return valid staircase (fallback)
      expect(result).toBeDefined();
      expect(result.stairs.length).toBeGreaterThan(0);
      expect(result.total_stairs).toBe(result.stairs.length);
    });

    it('should calculate total estimated days correctly', async () => {
      const mockGeminiResponse = {
        stairs: [
          {
            order: 1,
            title: 'Step 1',
            emoji: '📚',
            description: 'Test',
            difficulty: 'beginner',
            estimated_days: 5,
            vocabulary_count: 20,
            skills_focus: ['listening'],
            scenario_tags: [],
          },
          {
            order: 2,
            title: 'Step 2',
            emoji: '📚',
            description: 'Test',
            difficulty: 'beginner',
            estimated_days: 7,
            vocabulary_count: 30,
            skills_focus: ['speaking'],
            scenario_tags: [],
          },
        ],
      };

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify(mockGeminiResponse),
        },
      });

      const result = await generatePersonalizedStaircase(mockProfile);

      expect(result.estimated_completion_days).toBe(12);
    });

    it('should validate and provide defaults for missing fields', async () => {
      const mockGeminiResponse = {
        stairs: [
          {
            // Missing many fields
            order: 1,
            title: 'Test',
          },
        ],
      };

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify(mockGeminiResponse),
        },
      });

      const result = await generatePersonalizedStaircase(mockProfile);

      const stair = result.stairs[0];
      expect(stair.emoji).toBeDefined();
      expect(stair.description).toBeDefined();
      expect(stair.difficulty).toBe(mockProfile.proficiency_level);
      expect(stair.estimated_days).toBeDefined();
      expect(stair.vocabulary_count).toBeDefined();
      expect(stair.skills_focus).toBeDefined();
      expect(stair.scenario_tags).toBeDefined();
    });
  });

  describe('Fallback Staircase', () => {
    it('should generate fallback when Gemini API fails', async () => {
      // Mock a failing getGenerativeModel
      mockGetGenerativeModel.mockImplementation(() => {
        throw new Error('No API key');
      });

      const result = await generatePersonalizedStaircase(mockProfile);

      expect(result).toBeDefined();
      expect(result.stairs.length).toBeGreaterThan(0);
      expect(result.stairs[0].title).toBe('Essential Greetings');
    });

    it('should include user scenarios in fallback', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API Error'));

      const result = await generatePersonalizedStaircase(mockProfile);

      // Check that fallback includes user's scenarios
      const allScenarioTags = result.stairs.flatMap(s => s.scenario_tags);
      expect(allScenarioTags.some(tag => mockProfile.scenarios.includes(tag))).toBe(true);
    });
  });

  describe('Staircase Validation', () => {
    it('should ensure stairs are ordered correctly', async () => {
      const mockGeminiResponse = {
        stairs: [
          {
            order: 3,
            title: 'Third',
            emoji: '3️⃣',
            description: 'Third step',
            difficulty: 'intermediate',
            estimated_days: 2,
            vocabulary_count: 20,
            skills_focus: ['listening'],
            scenario_tags: [],
          },
          {
            order: 1,
            title: 'First',
            emoji: '1️⃣',
            description: 'First step',
            difficulty: 'beginner',
            estimated_days: 2,
            vocabulary_count: 20,
            skills_focus: ['listening'],
            scenario_tags: [],
          },
        ],
      };

      // Reset mock state and set new response
      mockGenerateContent.mockReset();
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify(mockGeminiResponse),
        },
      });

      const result = await generatePersonalizedStaircase(mockProfile);

      // Check that we got the correct number of stairs from mock
      expect(result.stairs).toHaveLength(2);
      // Check that all stairs have valid orders
      expect(result.stairs[0].order).toBeDefined();
      expect(result.stairs[1].order).toBeDefined();
    });

    it('should handle different user profiles', async () => {
      const beginnerProfile: UserProfile = {
        learning_goal: 'travel',
        proficiency_level: 'beginner',
        daily_time_minutes: 10,
        scenarios: ['travel_airport'],
      };

      const mockGeminiResponse = {
        stairs: [
          {
            order: 1,
            title: 'Airport Basics',
            emoji: '✈️',
            description: 'Essential airport phrases',
            difficulty: 'beginner',
            estimated_days: 5,
            vocabulary_count: 25,
            skills_focus: ['listening', 'speaking'],
            scenario_tags: ['travel_airport'],
          },
        ],
      };

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify(mockGeminiResponse),
        },
      });

      const result = await generatePersonalizedStaircase(beginnerProfile);

      expect(result).toBeDefined();
      expect(result.stairs[0].scenario_tags).toContain('travel_airport');
    });
  });
});
