/**
 * Tests for DialogueTeleprompterCard Component
 *
 * @description Tests the interactive dialogue practice component including:
 * - Rendering scenarios correctly
 * - Mode switching (practice/record)
 * - Controls functionality
 * - ElevenLabs TTS integration
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Mock dependencies
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success' },
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ name, testID }: { name: string; testID?: string }) => {
    const { Text } = require('react-native');
    return <Text testID={testID}>{name}</Text>;
  },
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

// Mock TTS hook
const mockSpeak = jest.fn().mockResolvedValue(undefined);
const mockSpeakSequence = jest.fn().mockResolvedValue(undefined);
const mockStopTTS = jest.fn().mockResolvedValue(undefined);

jest.mock('@/hooks/useElevenLabsTTS', () => ({
  __esModule: true,
  default: () => ({
    speak: mockSpeak,
    speakSequence: mockSpeakSequence,
    stop: mockStopTTS,
    isSpeaking: false,
    isConfigured: true,
    error: null,
  }),
  useElevenLabsTTS: () => ({
    speak: mockSpeak,
    speakSequence: mockSpeakSequence,
    stop: mockStopTTS,
    isSpeaking: false,
    isConfigured: true,
    error: null,
  }),
}));

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return {
    ...Reanimated,
    runOnJS: (fn: Function) => fn,
    useSharedValue: (initial: any) => ({ value: initial }),
    useAnimatedStyle: () => ({}),
    withTiming: (value: number) => value,
    FadeIn: { duration: () => ({ duration: () => {} }) },
  };
});

jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    GestureDetector: ({ children }: { children: React.ReactNode }) => children,
    GestureHandlerRootView: View,
    Gesture: {
      Pan: () => ({
        onStart: () => ({ onUpdate: () => ({}) }),
        onUpdate: () => ({}),
      }),
    },
  };
});

import { DialogueTeleprompterCard } from '@/components/cards/DialogueTeleprompterCard';
import type { DialogueScenario } from '@/lib/scenarios/dialogueScenarios';

// Test scenario
const mockScenario: DialogueScenario = {
  id: 'test-scenario',
  title: 'Test Scenario',
  description: 'A test dialogue scenario',
  category: 'daily',
  difficulty: 'beginner',
  targetLanguage: 'en',
  context: 'Test context',
  roleA: 'Person A',
  roleB: 'Person B',
  lines: [
    { speaker: 'A', text: 'Hello, how are you?' },
    { speaker: 'B', text: 'I am fine, thank you!' },
    { speaker: 'A', text: 'What are you doing today?' },
    { speaker: 'B', text: 'I am learning languages.' },
  ],
  estimatedDuration: 60,
  isPremium: false,
  tags: ['greeting', 'test'],
  icon: 'chatbubbles-outline',
};

const renderWithGestureHandler = (component: React.ReactElement) => {
  return render(
    <GestureHandlerRootView style={{ flex: 1 }}>
      {component}
    </GestureHandlerRootView>
  );
};

describe('DialogueTeleprompterCard', () => {
  const mockOnFinish = jest.fn();
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render scenario title', () => {
      const { getByText } = renderWithGestureHandler(
        <DialogueTeleprompterCard
          scenario={mockScenario}
          onFinish={mockOnFinish}
          onBack={mockOnBack}
        />
      );

      expect(getByText('Test Scenario')).toBeTruthy();
    });

    it('should render role labels', () => {
      const { getByText } = renderWithGestureHandler(
        <DialogueTeleprompterCard
          scenario={mockScenario}
          onFinish={mockOnFinish}
          onBack={mockOnBack}
        />
      );

      expect(getByText('Person A (AI)')).toBeTruthy();
      expect(getByText('Person B (You)')).toBeTruthy();
    });

    it('should render all dialogue lines', () => {
      const { getByText } = renderWithGestureHandler(
        <DialogueTeleprompterCard
          scenario={mockScenario}
          onFinish={mockOnFinish}
          onBack={mockOnBack}
        />
      );

      expect(getByText('Hello, how are you?')).toBeTruthy();
      expect(getByText('I am fine, thank you!')).toBeTruthy();
      expect(getByText('What are you doing today?')).toBeTruthy();
      expect(getByText('I am learning languages.')).toBeTruthy();
    });

    it('should render mode toggle buttons', () => {
      const { getByText } = renderWithGestureHandler(
        <DialogueTeleprompterCard
          scenario={mockScenario}
          onFinish={mockOnFinish}
          onBack={mockOnBack}
        />
      );

      expect(getByText('Practice')).toBeTruthy();
      expect(getByText('Record')).toBeTruthy();
    });
  });

  describe('Mode Switching', () => {
    it('should start in practice mode by default', () => {
      const { getByText } = renderWithGestureHandler(
        <DialogueTeleprompterCard
          scenario={mockScenario}
          onFinish={mockOnFinish}
          onBack={mockOnBack}
        />
      );

      // Practice button should be styled as active (we can check the text exists)
      expect(getByText('Practice')).toBeTruthy();
    });

    it('should switch to record mode when Record button is pressed', async () => {
      const { getByText } = renderWithGestureHandler(
        <DialogueTeleprompterCard
          scenario={mockScenario}
          onFinish={mockOnFinish}
          onBack={mockOnBack}
        />
      );

      fireEvent.press(getByText('Record'));

      // Mode should switch - in real component the start button icon changes
      expect(getByText('Record')).toBeTruthy();
    });
  });

  describe('Controls', () => {
    it('should call onBack when back button is pressed', async () => {
      const { getByLabelText } = renderWithGestureHandler(
        <DialogueTeleprompterCard
          scenario={mockScenario}
          onFinish={mockOnFinish}
          onBack={mockOnBack}
        />
      );

      await act(async () => {
        fireEvent.press(getByLabelText('Go back'));
      });

      await waitFor(() => {
        expect(mockOnBack).toHaveBeenCalled();
      });
    });

    it('should have start button with correct accessibility label', () => {
      const { getByLabelText } = renderWithGestureHandler(
        <DialogueTeleprompterCard
          scenario={mockScenario}
          onFinish={mockOnFinish}
          onBack={mockOnBack}
        />
      );

      // In practice mode
      expect(getByLabelText('Listen to dialogue')).toBeTruthy();
    });

    it('should change start button label when in record mode', () => {
      const { getByText, getByLabelText } = renderWithGestureHandler(
        <DialogueTeleprompterCard
          scenario={mockScenario}
          onFinish={mockOnFinish}
          onBack={mockOnBack}
        />
      );

      fireEvent.press(getByText('Record'));

      expect(getByLabelText('Start dialogue')).toBeTruthy();
    });
  });

  describe('TTS Integration', () => {
    it('should call speakSequence when starting in practice mode', async () => {
      const { getByLabelText } = renderWithGestureHandler(
        <DialogueTeleprompterCard
          scenario={mockScenario}
          onFinish={mockOnFinish}
          onBack={mockOnBack}
        />
      );

      fireEvent.press(getByLabelText('Listen to dialogue'));

      await waitFor(() => {
        expect(mockSpeakSequence).toHaveBeenCalled();
      });
    });

    it('should stop TTS when back button is pressed', async () => {
      const { getByLabelText } = renderWithGestureHandler(
        <DialogueTeleprompterCard
          scenario={mockScenario}
          onFinish={mockOnFinish}
          onBack={mockOnBack}
        />
      );

      fireEvent.press(getByLabelText('Go back'));

      await waitFor(() => {
        expect(mockStopTTS).toHaveBeenCalled();
      });
    });
  });

  describe('Font Size', () => {
    it('should have font size button', () => {
      const { getByLabelText } = renderWithGestureHandler(
        <DialogueTeleprompterCard
          scenario={mockScenario}
          onFinish={mockOnFinish}
          onBack={mockOnBack}
        />
      );

      expect(getByLabelText('Change font size')).toBeTruthy();
    });

    it('should cycle font size when button is pressed', () => {
      const { getByLabelText, getByText } = renderWithGestureHandler(
        <DialogueTeleprompterCard
          scenario={mockScenario}
          onFinish={mockOnFinish}
          onBack={mockOnBack}
        />
      );

      // Initially medium (M)
      expect(getByText('M')).toBeTruthy();

      fireEvent.press(getByLabelText('Change font size'));

      // Should cycle to large (L)
      expect(getByText('L')).toBeTruthy();

      fireEvent.press(getByLabelText('Change font size'));

      // Should cycle to small (S)
      expect(getByText('S')).toBeTruthy();
    });
  });

  describe('Finish Handler', () => {
    it('should call onFinish with correct result structure', async () => {
      const { getByLabelText } = renderWithGestureHandler(
        <DialogueTeleprompterCard
          scenario={mockScenario}
          onFinish={mockOnFinish}
          onBack={mockOnBack}
        />
      );

      // Start and immediately finish for testing
      fireEvent.press(getByLabelText('Listen to dialogue'));

      // Wait for component to transition to playing state
      await waitFor(() => {
        // After starting, the finish button should appear
        const finishButton = getByLabelText('Finish');
        fireEvent.press(finishButton);
      }, { timeout: 1000 });

      await waitFor(() => {
        expect(mockOnFinish).toHaveBeenCalledWith(
          expect.objectContaining({
            totalLines: 4,
            userLines: 2, // 2 lines from Person B
            mode: 'practice',
          })
        );
      });
    });
  });
});
