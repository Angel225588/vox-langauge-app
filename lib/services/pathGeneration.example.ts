/**
 * Example Usage: Path Generation Service
 *
 * This file demonstrates how to use the pathGeneration service
 * in your application.
 */

import { createPersonalizedPath } from './pathGeneration';
import type { OnboardingData } from './pathGeneration';

// ============================================================================
// EXAMPLE 1: Basic Usage After Onboarding
// ============================================================================

/**
 * Example: Create path after user completes onboarding
 */
async function exampleBasicUsage() {
  // This data would come from useOnboardingV2 hook
  const onboardingData: OnboardingData = {
    native_language: 'English',
    target_language: 'Spanish',
    motivation: 'travel',
    motivation_custom: null,
    why_now: 'Planning a trip to Spain next summer',
    proficiency_level: 'beginner',
    previous_attempts: 'Used Duolingo for a few weeks',
    timeline: '3-6_months',
    commitment_stakes: 'I want to confidently order food and ask for directions during my trip',
  };

  const userId = 'user_123';

  const result = await createPersonalizedPath(userId, onboardingData);

  if (result.success) {
    console.log('Success! Path created:', result.pathId);
    // Navigate to home screen
    // router.push('/home');
  } else {
    console.error('Failed to create path:', result.error);
    // Show error to user
    // Alert.alert('Error', result.error);
  }
}

// ============================================================================
// EXAMPLE 2: In an Expo Router Screen
// ============================================================================

/**
 * Example: Using in the final onboarding screen (e.g., app/(auth)/onboarding/ready.tsx)
 */
/*
import { useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingV2 } from '@/hooks/useOnboardingV2';
import { useAuth } from '@/hooks/useAuth';
import { createPersonalizedPath } from '@/lib/services/pathGeneration';
import { Button } from '@/components/ui/Button';

export default function ReadyScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: onboardingData } = useOnboardingV2();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetStarted = async () => {
    if (!user) {
      setError('Please log in first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createPersonalizedPath(user.id, onboardingData);

      if (result.success) {
        // Success! Navigate to home
        router.replace('/(tabs)/home');
      } else {
        setError(result.error || 'Failed to create learning path');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text>Your personalized path is ready!</Text>

      {error && <Text style={{ color: 'red' }}>{error}</Text>}

      <Button
        onPress={handleGetStarted}
        disabled={loading}
      >
        {loading ? <ActivityIndicator /> : 'Get Started'}
      </Button>
    </View>
  );
}
*/

// ============================================================================
// EXAMPLE 3: Career Motivation Path
// ============================================================================

async function exampleCareerPath() {
  const onboardingData: OnboardingData = {
    native_language: 'English',
    target_language: 'French',
    motivation: 'career',
    motivation_custom: 'Need to communicate with French clients',
    why_now: 'Got promoted to account manager for European clients',
    proficiency_level: 'elementary',
    previous_attempts: 'Took high school French 5 years ago',
    timeline: '1-3_months',
    commitment_stakes: 'My job depends on building relationships with French-speaking clients',
  };

  const result = await createPersonalizedPath('user_456', onboardingData);
  console.log('Career path result:', result);
}

// ============================================================================
// EXAMPLE 4: Relationship Motivation Path
// ============================================================================

async function exampleRelationshipPath() {
  const onboardingData: OnboardingData = {
    native_language: 'English',
    target_language: 'Spanish',
    motivation: 'love',
    motivation_custom: "Want to speak my partner's native language",
    why_now: 'Meeting their family for the first time in 2 months',
    proficiency_level: 'beginner',
    previous_attempts: null,
    timeline: '3-6_months',
    commitment_stakes: "I want to show my partner's family that I care by trying to speak their language",
  };

  const result = await createPersonalizedPath('user_789', onboardingData);
  console.log('Relationship path result:', result);
}

// ============================================================================
// EXAMPLE 5: Handling Errors
// ============================================================================

async function exampleErrorHandling() {
  // Invalid data - missing required fields
  const invalidData: OnboardingData = {
    native_language: null,
    target_language: 'Spanish',
    motivation: null,
    motivation_custom: null,
    why_now: null,
    proficiency_level: null,
    previous_attempts: null,
    timeline: null,
    commitment_stakes: null,
  };

  const result = await createPersonalizedPath('user_999', invalidData);

  if (!result.success) {
    // Will get validation error: "Native language is required"
    console.log('Expected error:', result.error);

    // Show user-friendly message
    switch (result.error) {
      case 'Native language is required':
        console.log('Please select your native language');
        break;
      case 'Target language is required':
        console.log('Please select the language you want to learn');
        break;
      case 'Motivation is required':
        console.log('Please tell us why you want to learn');
        break;
      default:
        console.log('Something went wrong. Please try again.');
    }
  }
}

// ============================================================================
// EXAMPLE 6: Advanced - Custom Motivation
// ============================================================================

async function exampleCustomMotivation() {
  const onboardingData: OnboardingData = {
    native_language: 'English',
    target_language: 'Japanese',
    motivation: 'challenge', // Generic motivation
    motivation_custom: 'I want to read manga in its original language', // Specific custom goal
    why_now: 'Just finished reading a translation and want to experience the real thing',
    proficiency_level: 'beginner',
    previous_attempts: 'Tried learning hiragana online',
    timeline: '6-12_months',
    commitment_stakes: 'I have a shelf of untranslated manga waiting for me to read them',
  };

  const result = await createPersonalizedPath('user_manga', onboardingData);

  // The AI will use the custom motivation to create a path focused on reading skills
  console.log('Custom motivation path:', result);
}

// ============================================================================
// EXAMPLE 7: Integration with React Query
// ============================================================================

/**
 * Example: Using with React Query for better state management
 */
/*
import { useMutation } from '@tanstack/react-query';
import { createPersonalizedPath } from '@/lib/services/pathGeneration';

function useCreatePath() {
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: OnboardingData }) =>
      createPersonalizedPath(userId, data),
    onSuccess: (result) => {
      if (result.success) {
        console.log('Path created:', result.pathId);
        // Invalidate queries, navigate, etc.
      } else {
        console.error('Path creation failed:', result.error);
      }
    },
    onError: (error) => {
      console.error('Mutation error:', error);
    },
  });
}

// In your component:
function OnboardingCompleteScreen() {
  const { user } = useAuth();
  const { data: onboardingData } = useOnboardingV2();
  const createPath = useCreatePath();

  const handleSubmit = () => {
    if (user) {
      createPath.mutate({
        userId: user.id,
        data: onboardingData,
      });
    }
  };

  return (
    <Button
      onPress={handleSubmit}
      loading={createPath.isPending}
      disabled={createPath.isPending}
    >
      Create My Path
    </Button>
  );
}
*/

// ============================================================================
// EXAMPLE 8: What Gets Created
// ============================================================================

/**
 * When you call createPersonalizedPath, here's what happens:
 *
 * 1. DATA VALIDATION
 *    - Checks that all required fields are present
 *    - Returns early with error if validation fails
 *
 * 2. DATA TRANSFORMATION
 *    - Converts onboarding data to PathGenerationInput format
 *    - Maps proficiency levels (e.g., "upper_intermediate" -> "intermediate")
 *    - Maps timelines (e.g., "3-6_months" -> "3_months")
 *
 * 3. AI GENERATION (or Fallback)
 *    - Calls Gemini AI with detailed prompt
 *    - Generates 5-7 stairs with vocabulary, scenarios, grammar points
 *    - If AI fails, uses template-based generation
 *
 * 4. DATABASE STORAGE (stubbed for now)
 *    - Creates learning_path record
 *    - Creates first section record (section 1)
 *    - Creates individual stair records (5-7 stairs)
 *    - Stores vocabulary, scenarios, and skills for each stair
 *
 * 5. USER AI MEMORY INITIALIZATION
 *    - Creates UserAIMemory record
 *    - Stores initial profile data
 *    - Sets up for future personalization
 *
 * 6. RETURN RESULT
 *    - Returns { success: true, pathId: "..." } on success
 *    - Returns { success: false, error: "..." } on failure
 */

// ============================================================================
// Run examples (commented out - uncomment to test)
// ============================================================================

// exampleBasicUsage();
// exampleCareerPath();
// exampleRelationshipPath();
// exampleErrorHandling();
// exampleCustomMotivation();
