/**
 * Gemini Staircase Generator
 *
 * Uses Gemini AI to generate personalized learning staircases based on user profile
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

if (!GEMINI_API_KEY) {
  console.warn('⚠️  GEMINI_API_KEY not found. Staircase generation will fail.');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export interface UserProfile {
  learning_goal: string;
  proficiency_level: string;
  daily_time_minutes: number;
  scenarios: string[];
  motivation_data?: {
    why?: string;
    fear?: string;
    stakes?: string;
    timeline?: string;
  };
}

export interface Stair {
  id: string;
  order: number;
  title: string;
  emoji: string;
  description: string;
  difficulty: 'beginner' | 'elementary' | 'intermediate' | 'upper_intermediate' | 'advanced';
  estimated_days: number;
  vocabulary_count: number;
  skills_focus: string[]; // e.g., ["listening", "speaking", "reading"]
  scenario_tags: string[]; // e.g., ["interview_introduction", "interview_experience"]
}

export interface PersonalizedStaircase {
  user_id: string | null; // Will be set when saving to database
  stairs: Stair[];
  total_stairs: number;
  estimated_completion_days: number;
  created_at: string;
}

/**
 * Generate personalized staircase using Gemini
 */
export async function generatePersonalizedStaircase(
  profile: UserProfile
): Promise<PersonalizedStaircase> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are an expert language learning curriculum designer. Generate a personalized English learning staircase (progressive steps) for a user with the following profile:

**Learning Goal:** ${profile.learning_goal}
**Current Level:** ${profile.proficiency_level}
**Daily Time:** ${profile.daily_time_minutes} minutes
**Focus Scenarios:** ${profile.scenarios.join(', ')}

Create a JSON staircase with 8-12 progressive stairs (learning steps). Each stair should:
1. Build upon the previous one
2. Focus on the user's specific scenarios
3. Match their proficiency level and goal
4. Be achievable within their daily time commitment
5. Include realistic vocabulary counts and time estimates

Return ONLY valid JSON in this exact format (no markdown, no explanations):

{
  "stairs": [
    {
      "order": 1,
      "title": "Greeting & Basic Introductions",
      "emoji": "👋",
      "description": "Learn essential greetings and how to introduce yourself professionally",
      "difficulty": "beginner",
      "estimated_days": 3,
      "vocabulary_count": 25,
      "skills_focus": ["listening", "speaking"],
      "scenario_tags": ["interview_introduction"]
    }
  ]
}

IMPORTANT:
- Title should be specific to their goal (e.g., "Job Interview Self-Introduction" not "Basic Greetings")
- Difficulty should progress: beginner → elementary → intermediate → upper_intermediate → advanced
- Vocabulary count should increase gradually (25 → 50 → 75 → 100+)
- Estimated days should match daily time (10 min = longer, 45 min = shorter)
- Skills focus should vary (listening, speaking, reading, writing)
- Scenario tags must match their selected scenarios

Generate the staircase now:`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Clean up response (remove markdown code blocks if present)
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse JSON
    const staircaseData = JSON.parse(cleanedText);

    // Validate and add IDs
    const stairs: Stair[] = staircaseData.stairs.map((stair: Partial<Stair>, index: number) => ({
      id: `stair_${Date.now()}_${index}`,
      order: stair.order || index + 1,
      title: stair.title || `Step ${index + 1}`,
      emoji: stair.emoji || '📚',
      description: stair.description || '',
      difficulty: stair.difficulty || profile.proficiency_level,
      estimated_days: stair.estimated_days || 3,
      vocabulary_count: stair.vocabulary_count || 30,
      skills_focus: stair.skills_focus || ['listening', 'speaking'],
      scenario_tags: stair.scenario_tags || [],
    }));

    const totalDays = stairs.reduce((sum, stair) => sum + stair.estimated_days, 0);

    const staircase: PersonalizedStaircase = {
      user_id: null,
      stairs,
      total_stairs: stairs.length,
      estimated_completion_days: totalDays,
      created_at: new Date().toISOString(),
    };

    console.log('✅ Gemini generated staircase:', {
      total_stairs: staircase.total_stairs,
      estimated_days: staircase.estimated_completion_days,
      first_stair: stairs[0]?.title,
      last_stair: stairs[stairs.length - 1]?.title,
    });

    return staircase;
  } catch (error) {
    console.error('❌ Gemini staircase generation failed:', error);

    // Fallback: Generate a basic staircase without Gemini
    return generateFallbackStaircase(profile);
  }
}

/**
 * Fallback staircase generator (in case Gemini fails)
 */
function generateFallbackStaircase(profile: UserProfile): PersonalizedStaircase {
  console.log('⚠️  Using fallback staircase generator');

  const stairs: Stair[] = [
    {
      id: `stair_${Date.now()}_0`,
      order: 1,
      title: 'Essential Greetings',
      emoji: '👋',
      description: 'Learn basic greetings and introductions',
      difficulty: 'beginner',
      estimated_days: 2,
      vocabulary_count: 20,
      skills_focus: ['listening', 'speaking'],
      scenario_tags: profile.scenarios.slice(0, 1),
    },
    {
      id: `stair_${Date.now()}_1`,
      order: 2,
      title: 'Self Introduction',
      emoji: '💬',
      description: 'Practice introducing yourself confidently',
      difficulty: 'beginner',
      estimated_days: 3,
      vocabulary_count: 30,
      skills_focus: ['speaking', 'listening'],
      scenario_tags: profile.scenarios.slice(0, 1),
    },
    {
      id: `stair_${Date.now()}_2`,
      order: 3,
      title: 'Common Questions',
      emoji: '❓',
      description: 'Answer frequently asked questions',
      difficulty: 'elementary',
      estimated_days: 4,
      vocabulary_count: 40,
      skills_focus: ['listening', 'speaking'],
      scenario_tags: profile.scenarios.slice(0, 2),
    },
  ];

  return {
    user_id: null,
    stairs,
    total_stairs: stairs.length,
    estimated_completion_days: stairs.reduce((sum, s) => sum + s.estimated_days, 0),
    created_at: new Date().toISOString(),
  };
}
