/**
 * PreSessionScreen - Usage Examples
 *
 * This file demonstrates various ways to use the PreSessionScreen component
 * in different scenarios within the Vox Language app.
 */

import React, { useState } from 'react';
import { View } from 'react-native';
import { PreSessionScreen } from './PreSessionScreen';

// ============================================================================
// Example 1: Basic Usage
// ============================================================================
export function BasicExample() {
  const passage = {
    title: 'My Trip to Barcelona',
    difficulty: 'intermediate' as const,
    wordCount: 250,
    estimatedDuration: 180, // 3 minutes
  };

  return (
    <PreSessionScreen
      passage={passage}
      onStart={() => {
        console.log('Starting reading session...');
        // Navigate to teleprompter screen
      }}
      onBack={() => {
        console.log('Going back...');
        // Navigate back to reading selection
      }}
    />
  );
}

// ============================================================================
// Example 2: With Session Tracking
// ============================================================================
export function SessionTrackingExample() {
  const [currentSession] = useState(3); // 3rd session today

  const passage = {
    title: 'Cooking Italian Pasta',
    difficulty: 'beginner' as const,
    wordCount: 150,
    estimatedDuration: 120, // 2 minutes
  };

  return (
    <PreSessionScreen
      passage={passage}
      sessionNumber={currentSession}
      onStart={() => {
        console.log(`Starting session ${currentSession}...`);
        // Track session start in analytics
        // Navigate to teleprompter
      }}
      onBack={() => {
        console.log('Cancelled session');
      }}
    />
  );
}

// ============================================================================
// Example 3: Advanced Difficulty Passage
// ============================================================================
export function AdvancedPassageExample() {
  const passage = {
    title: 'Climate Change and Global Economics',
    difficulty: 'advanced' as const,
    wordCount: 450,
    estimatedDuration: 300, // 5 minutes
  };

  const handleStart = () => {
    console.log('Starting advanced reading...');
    // Pre-load passage data
    // Start audio recording
    // Navigate to teleprompter
  };

  return (
    <PreSessionScreen
      passage={passage}
      onStart={handleStart}
      onBack={() => console.log('Back to passage selection')}
    />
  );
}

// ============================================================================
// Example 4: Integration with Navigation (Expo Router)
// ============================================================================
export function NavigationExample() {
  // Using Expo Router
  // import { useRouter } from 'expo-router';
  // const router = useRouter();

  const passage = {
    title: 'Daily Conversation Phrases',
    difficulty: 'beginner' as const,
    wordCount: 100,
    estimatedDuration: 90,
  };

  return (
    <PreSessionScreen
      passage={passage}
      onStart={() => {
        // router.push('/reading/session');
        console.log('Navigate to /reading/session');
      }}
      onBack={() => {
        // router.back();
        console.log('Navigate back');
      }}
    />
  );
}

// ============================================================================
// Example 5: With State Management (Loading Passage)
// ============================================================================
export function StateManagementExample() {
  const [passage, setPassage] = useState({
    title: 'Loading...',
    difficulty: 'beginner' as const,
    wordCount: 0,
    estimatedDuration: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading passage data
  React.useEffect(() => {
    const loadPassage = async () => {
      setIsLoading(true);
      // Fetch passage from API or database
      const data = await fetchPassage('passage-id-123');
      setPassage(data);
      setIsLoading(false);
    };

    loadPassage();
  }, []);

  if (isLoading) {
    return <View />; // Show loading state
  }

  return (
    <PreSessionScreen
      passage={passage}
      onStart={() => console.log('Start reading')}
      onBack={() => console.log('Go back')}
    />
  );
}

// Mock API function
async function fetchPassage(id: string) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        title: 'Understanding Technology',
        difficulty: 'intermediate',
        wordCount: 320,
        estimatedDuration: 240,
      });
    }, 1000);
  });
}

// ============================================================================
// Example 6: Full Screen Integration with Complete Flow
// ============================================================================
export function FullFlowExample() {
  const [showPreSession, setShowPreSession] = useState(true);
  const [isReading, setIsReading] = useState(false);

  const passage = {
    title: 'Learning Spanish Through Music',
    difficulty: 'intermediate' as const,
    wordCount: 280,
    estimatedDuration: 210,
  };

  const handleStartReading = () => {
    setShowPreSession(false);
    setIsReading(true);
    // Initialize recording
    // Start teleprompter
    console.log('Teleprompter started');
  };

  const handleBackToSelection = () => {
    setShowPreSession(false);
    // Navigate back to passage selection screen
    console.log('Back to passage selection');
  };

  if (showPreSession) {
    return (
      <PreSessionScreen
        passage={passage}
        sessionNumber={2}
        onStart={handleStartReading}
        onBack={handleBackToSelection}
      />
    );
  }

  if (isReading) {
    return <View>{/* TeleprompterView component would go here */}</View>;
  }

  return <View>{/* Passage selection screen */}</View>;
}

// ============================================================================
// Example 7: Different Difficulty Levels Showcase
// ============================================================================
export function DifficultyShowcase() {
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>(
    'beginner'
  );

  const passages = {
    beginner: {
      title: 'Greetings and Introductions',
      difficulty: 'beginner' as const,
      wordCount: 80,
      estimatedDuration: 60,
    },
    intermediate: {
      title: 'Planning a Vacation',
      difficulty: 'intermediate' as const,
      wordCount: 250,
      estimatedDuration: 180,
    },
    advanced: {
      title: 'Analyzing Global Markets',
      difficulty: 'advanced' as const,
      wordCount: 500,
      estimatedDuration: 360,
    },
  };

  return (
    <PreSessionScreen
      passage={passages[difficulty]}
      onStart={() => console.log(`Starting ${difficulty} passage`)}
      onBack={() => console.log('Back')}
    />
  );
}

// ============================================================================
// Example 8: With Analytics Tracking
// ============================================================================
export function AnalyticsExample() {
  const passage = {
    title: 'Healthy Eating Habits',
    difficulty: 'beginner' as const,
    wordCount: 180,
    estimatedDuration: 140,
  };

  const handleStart = () => {
    // Track analytics
    trackEvent('reading_session_started', {
      passage_title: passage.title,
      difficulty: passage.difficulty,
      word_count: passage.wordCount,
      estimated_duration: passage.estimatedDuration,
      timestamp: new Date().toISOString(),
    });

    console.log('Analytics tracked, starting session');
  };

  const handleBack = () => {
    trackEvent('reading_session_cancelled', {
      passage_title: passage.title,
      timestamp: new Date().toISOString(),
    });

    console.log('Session cancelled');
  };

  return <PreSessionScreen passage={passage} onStart={handleStart} onBack={handleBack} />;
}

// Mock analytics function
function trackEvent(eventName: string, properties: Record<string, any>) {
  console.log('Event tracked:', eventName, properties);
}

// ============================================================================
// Example 9: TypeScript Type Safety Demonstration
// ============================================================================
export function TypeSafetyExample() {
  // This demonstrates proper TypeScript usage

  // ✅ CORRECT - All required fields provided
  const validPassage = {
    title: 'Test Passage',
    difficulty: 'beginner' as const,
    wordCount: 100,
    estimatedDuration: 90,
  };

  // ❌ INCORRECT - Missing required fields (TypeScript will error)
  // const invalidPassage = {
  //   title: 'Test Passage',
  //   // Missing difficulty, wordCount, estimatedDuration
  // };

  // ❌ INCORRECT - Invalid difficulty value (TypeScript will error)
  // const wrongDifficulty = {
  //   title: 'Test Passage',
  //   difficulty: 'expert', // Not in union type
  //   wordCount: 100,
  //   estimatedDuration: 90,
  // };

  return (
    <PreSessionScreen
      passage={validPassage}
      onStart={() => console.log('Start')}
      onBack={() => console.log('Back')}
      sessionNumber={1} // Optional prop
    />
  );
}

// ============================================================================
// Example 10: Accessibility Considerations
// ============================================================================
export function AccessibleExample() {
  const passage = {
    title: 'Introduction to Art History',
    difficulty: 'intermediate' as const,
    wordCount: 220,
    estimatedDuration: 165,
  };

  // Note: The component includes:
  // - Large touch targets (start button)
  // - High contrast text
  // - Clear visual hierarchy
  // - Haptic feedback for actions
  // - Readable font sizes (follows design system)

  return (
    <PreSessionScreen
      passage={passage}
      onStart={() => {
        // Announce to screen reader
        console.log('Starting reading session');
      }}
      onBack={() => {
        console.log('Returning to previous screen');
      }}
    />
  );
}
