/**
 * ListeningProbe - Usage Example
 *
 * This file demonstrates how to use the ListeningProbe component
 * in the calibration flow.
 */

import React from 'react';
import { View } from 'react-native';
import { ListeningProbe } from './ListeningProbe';
import type { ListeningProbeItem, ProbeResponse } from '@/types/calibration';

// Example probe items at different difficulty levels

const exampleProbeA1: ListeningProbeItem = {
  id: 'listen-a1-greeting',
  audioText: 'Hello, how are you?',
  // audioUrl: 'https://example.com/audio/hello.mp3', // Optional pre-recorded audio
  options: [
    'A greeting asking about wellbeing',
    'A question about location',
    'A farewell statement',
    'An introduction',
  ],
  correctIndex: 0,
  difficulty: 'A1',
  context: 'greeting',
};

const exampleProbeA2: ListeningProbeItem = {
  id: 'listen-a2-shopping',
  audioText: 'Can I have a cup of coffee, please?',
  options: [
    'Asking for directions',
    'Ordering a beverage',
    'Requesting information',
    'Making a complaint',
  ],
  correctIndex: 1,
  difficulty: 'A2',
  context: 'shopping',
};

const exampleProbeB1: ListeningProbeItem = {
  id: 'listen-b1-travel',
  audioText: 'Excuse me, could you tell me how to get to the nearest train station?',
  options: [
    'Asking about train schedules',
    'Requesting directions to a station',
    'Buying a train ticket',
    'Reporting a lost item',
  ],
  correctIndex: 1,
  difficulty: 'B1',
  context: 'travel',
};

const exampleProbeB2: ListeningProbeItem = {
  id: 'listen-b2-work',
  audioText: 'I wanted to discuss the project timeline with you. Would you be available for a meeting tomorrow?',
  options: [
    'Canceling a scheduled meeting',
    'Requesting a meeting to discuss a project',
    'Providing project updates',
    'Asking for project documentation',
  ],
  correctIndex: 1,
  difficulty: 'B2',
  context: 'work',
};

// Example usage in a calibration flow
export function ListeningProbeExample() {
  const handleComplete = (response: Omit<ProbeResponse, 'probeType' | 'timestamp'>) => {
    console.log('Probe completed:', {
      ...response,
      probeType: 'listening',
      timestamp: Date.now(),
    });

    // In a real calibration flow, you would:
    // 1. Add the response to the calibration state
    // 2. Award points for completion (not accuracy)
    // 3. Move to the next probe or complete calibration
    // 4. Send responses to AI for level assessment
  };

  const handleSkip = () => {
    console.log('Probe skipped');
    // Move to next probe or allow retry
  };

  return (
    <View style={{ flex: 1 }}>
      <ListeningProbe
        item={exampleProbeA1}
        onComplete={handleComplete}
        onSkip={handleSkip}
        showHints={true}
        nativeLanguage="es" // Optional: user's native language
      />
    </View>
  );
}

/**
 * Integration Notes:
 *
 * 1. Audio Sources:
 *    - If `audioUrl` is provided, it uses pre-recorded audio via expo-av
 *    - Otherwise, it uses TTS via expo-speech with the `audioText`
 *    - TTS is language-aware (can be configured per target language)
 *
 * 2. Tracking Data:
 *    - `timeSpent`: Total time from first play to answer selection
 *    - `audioReplays`: Number of times audio was replayed (first play doesn't count)
 *    - `selectedOption`: The text of the selected option
 *    - `difficulty`: CEFR level of the item
 *
 * 3. Speed Control:
 *    - Normal speed: 1.0x rate
 *    - Slow speed: 0.7x rate
 *    - Works with both pre-recorded audio and TTS
 *
 * 4. Calibration Philosophy:
 *    - Points awarded for COMPLETION, not accuracy
 *    - No penalties for wrong answers or replays
 *    - AI analyzes behavior patterns (time spent, replays, confidence)
 *    - Focus is on assessment, not testing
 *
 * 5. Animations:
 *    - Play button pulses during audio playback
 *    - Options animate in with staggered delays
 *    - Visual feedback on selection (correct/incorrect colors)
 *    - Brief feedback period before completion
 *
 * 6. Accessibility:
 *    - Haptic feedback for all interactions
 *    - Clear visual states (idle, loading, playing)
 *    - Option to replay audio unlimited times
 *    - Speed control for comprehension support
 */
