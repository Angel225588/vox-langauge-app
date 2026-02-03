/**
 * Gemini API Client - Usage Examples
 *
 * This file demonstrates how to use the Gemini API client in various scenarios.
 * These are examples only - not meant to be run directly.
 */

import {
  generateWithGemini,
  generateJSON,
  generateLearningPath,
  GeminiError,
} from './gemini';
import type { PathGenerationInput, GeneratedPath } from '@/types/learning';

// ============================================================================
// EXAMPLE 1: Basic text generation
// ============================================================================

async function example1_BasicGeneration() {
  try {
    const prompt = 'Explain what a language learning stair is in 2 sentences.';
    const response = await generateWithGemini(prompt);

    console.log('AI Response:', response);
  } catch (error) {
    if (error instanceof GeminiError) {
      console.error('Gemini error:', error.message);
      console.error('Error code:', error.code);
      console.error('Retryable:', error.retryable);
    }
  }
}

// ============================================================================
// EXAMPLE 2: Generating structured JSON
// ============================================================================

async function example2_JSONGeneration() {
  const prompt = `Generate a list of 5 Spanish greetings with translations.
  Return JSON in this format:
  {
    "greetings": [
      {
        "spanish": "Hola",
        "english": "Hello",
        "formal": false
      }
    ]
  }`;

  try {
    const result = await generateJSON<{
      greetings: Array<{
        spanish: string;
        english: string;
        formal: boolean;
      }>;
    }>(prompt);

    console.log('Generated greetings:', result.greetings);

    // Type-safe access
    result.greetings.forEach(greeting => {
      console.log(`${greeting.spanish} = ${greeting.english}`);
    });
  } catch (error) {
    if (error instanceof GeminiError) {
      if (error.code === 'INVALID_JSON') {
        console.error('AI returned invalid JSON, retries exhausted');
      }
    }
  }
}

// ============================================================================
// EXAMPLE 3: Generating a complete learning path
// ============================================================================

async function example3_GenerateLearningPath() {
  const input: PathGenerationInput = {
    user_id: 'user_123',
    target_language: 'Spanish',
    native_language: 'English',
    motivation: 'travel',
    motivation_custom: undefined,
    why_now: 'Planning a trip to Barcelona in 6 months',
    proficiency_level: 'beginner',
    timeline: '6_months',
    previous_attempts: 'Tried Duolingo for 2 weeks, lost motivation',
    commitment_stakes: 'Already booked non-refundable tickets to Spain',
  };

  try {
    const path = await generateLearningPath(input);

    console.log('Generated Path:', path.path_title);
    console.log('Description:', path.path_description);
    console.log('Total Stairs:', path.total_stairs);
    console.log('Estimated Completion:', path.estimated_completion);

    // Access stairs
    path.stairs.forEach((stair, index) => {
      console.log(`\nStair ${index + 1}: ${stair.emoji} ${stair.title}`);
      console.log(`Vocabulary: ${stair.vocabulary.length} words`);
      console.log(`Scenarios: ${stair.scenarios.length}`);
    });
  } catch (error) {
    if (error instanceof GeminiError) {
      if (error.code === 'PATH_GENERATION_FAILED') {
        console.error('Failed to generate path, validation failed');
      } else if (error.retryable) {
        console.error('Temporary error, could retry:', error.message);
      }
    }
  }
}

// ============================================================================
// EXAMPLE 4: Generating path with existing user memory
// ============================================================================

async function example4_PathWithUserMemory() {
  const input: PathGenerationInput = {
    user_id: 'user_456',
    target_language: 'French',
    native_language: 'English',
    motivation: 'relationship',
    proficiency_level: 'elementary',
    timeline: '3_months',
    commitment_stakes: 'Meeting my partner\'s parents soon',
  };

  // Existing user memory (fetched from database)
  const userMemory = {
    id: 'memory_789',
    user_id: 'user_456',
    native_language: 'English',
    target_language: 'French',
    original_motivation: 'relationship',
    original_stakes: 'Meeting partner\'s parents',
    current_level: 'A2' as const,
    strengths: ['pronunciation', 'listening'],
    weaknesses: ['grammar', 'writing'],
    preferred_topics: ['family', 'food', 'daily life'],
    total_vocab_learned: 150,
    vocab_mastery_rate: 75,
    conversation_confidence: 60,
    ai_observations: [
      'User excels at conversational practice',
      'Struggles with verb conjugations',
    ],
    recommended_focus: ['grammar drills', 'writing practice'],
    calibrations_completed: 2,
    sections_completed: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    // Generate path that adapts to user's progress
    const path = await generateLearningPath(input, userMemory);

    console.log('Personalized Path:', path.path_title);
    console.log('Tailored for user with', userMemory.total_vocab_learned, 'words learned');
  } catch (error) {
    console.error('Path generation failed:', error);
  }
}

// ============================================================================
// EXAMPLE 5: Error handling patterns
// ============================================================================

async function example5_ErrorHandling() {
  const input: PathGenerationInput = {
    user_id: 'user_789',
    target_language: 'Japanese',
    native_language: 'English',
    motivation: 'academic',
    proficiency_level: 'beginner',
    timeline: '1_year',
    commitment_stakes: 'Starting university program in Japan',
  };

  try {
    const path = await generateLearningPath(input);
    return path;
  } catch (error) {
    if (error instanceof GeminiError) {
      // Handle different error types
      switch (error.code) {
        case 'MISSING_API_KEY':
          console.error('Configuration error: API key not set');
          // Alert admin
          break;

        case 'RATE_LIMIT':
          console.error('Rate limited, should retry later');
          // Implement backoff strategy
          break;

        case 'NETWORK_ERROR':
          console.error('Network issue, retryable');
          if (error.retryable) {
            // Could implement manual retry
          }
          break;

        case 'INVALID_JSON':
          console.error('AI returned malformed JSON');
          // Fall back to default path or retry with different prompt
          break;

        case 'PATH_GENERATION_FAILED':
          console.error('Generated path failed validation');
          // Could retry or use fallback
          break;

        default:
          console.error('Unknown error:', error.message);
      }
    } else {
      console.error('Unexpected error:', error);
    }

    throw error; // Re-throw or handle gracefully
  }
}

// ============================================================================
// EXAMPLE 6: Using in a React component (pseudo-code)
// ============================================================================

/*
async function ExampleComponent() {
  const [path, setPath] = useState<GeneratedPath | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGeneratePath() {
    setLoading(true);
    setError(null);

    try {
      const input: PathGenerationInput = {
        // ... collect from user onboarding
      };

      const generatedPath = await generateLearningPath(input);
      setPath(generatedPath);
    } catch (err) {
      if (err instanceof GeminiError) {
        if (err.retryable) {
          setError('Temporary error. Please try again.');
        } else {
          setError('Failed to generate learning path. Please contact support.');
        }
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View>
      <Button onPress={handleGeneratePath} disabled={loading}>
        {loading ? 'Generating...' : 'Generate My Path'}
      </Button>
      {error && <Text color="red">{error}</Text>}
      {path && <PathPreview path={path} />}
    </View>
  );
}
*/

// ============================================================================
// EXAMPLE 7: Testing mode (without API calls)
// ============================================================================

async function example7_MockMode() {
  // For testing, you might want to mock the Gemini client
  // You can create a mock implementation in tests:

  /*
  jest.mock('./gemini', () => ({
    generateLearningPath: jest.fn().mockResolvedValue({
      path_title: 'Mock Path',
      path_description: 'A mock learning path for testing',
      total_stairs: 5,
      estimated_completion: '3 months',
      stairs: [
        // ... mock stairs
      ],
    }),
    GeminiError: class MockGeminiError extends Error {
      constructor(message: string, public code: string, public retryable: boolean) {
        super(message);
      }
    },
  }));
  */
}

// Export examples for reference
export const examples = {
  example1_BasicGeneration,
  example2_JSONGeneration,
  example3_GenerateLearningPath,
  example4_PathWithUserMemory,
  example5_ErrorHandling,
  example7_MockMode,
};
