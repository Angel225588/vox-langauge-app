// @ts-nocheck
/**
 * QuizCard Component Tests
 *
 * Tests rendering, answer selection, feedback, and TypeBadge for both image and translation modes.
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

// Mock dependencies before imports
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, testID }: any) => {
    const { View } = require('react-native');
    return <View testID={testID}>{children}</View>;
  },
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ name }: { name: string }) => {
    const { Text } = require('react-native');
    return <Text>{name}</Text>;
  },
}));

jest.mock('react-native-reanimated', () => {
  const RN = require('react-native');
  const React = require('react');

  // Create proper animated components that forward props and children
  const createMockAnimatedComponent = (Component: any) => {
    return React.forwardRef((props: any, ref: any) => {
      const { entering, exiting, style, ...rest } = props;
      return React.createElement(Component, { ...rest, style, ref });
    });
  };

  const AnimatedView = createMockAnimatedComponent(RN.View);
  const AnimatedText = createMockAnimatedComponent(RN.Text);

  const Animated = {
    View: AnimatedView,
    Text: AnimatedText,
    createAnimatedComponent: (comp: any) => createMockAnimatedComponent(comp),
    call: () => {},
  };

  return {
    __esModule: true,
    default: Animated,
    useSharedValue: (initial: any) => ({ value: initial }),
    useAnimatedStyle: () => ({}),
    withSpring: (val: number) => val,
    withSequence: (...args: any[]) => args[0],
    withTiming: (val: number) => val,
    runOnJS: (fn: Function) => fn,
    FadeIn: { duration: () => ({ delay: () => ({ springify: () => ({}) }), springify: () => ({}) }) },
    FadeInDown: { duration: () => ({ delay: () => ({ springify: () => ({}) }), springify: () => ({}) }) },
    FadeInUp: { duration: () => ({ delay: () => ({ springify: () => ({}) }), springify: () => ({}) }) },
    ZoomIn: { duration: () => ({ delay: () => ({ springify: () => ({}) }), springify: () => ({}) }) },
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

// Mock shared UI components
jest.mock('@/components/ui', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return {
    DarkOverlay: ({ visible }: any) =>
      visible ? <View testID="dark-overlay" /> : null,
    AnswerOption: ({ text, onPress, disabled, state, testID }: any) => (
      <TouchableOpacity
        testID={testID || `option-${text}`}
        onPress={onPress}
        disabled={disabled}
        accessibilityState={{ disabled }}
      >
        <Text>{text}</Text>
        {state === 'correct' && <Text testID="correct-indicator">correct</Text>}
        {state === 'wrong' && <Text testID="wrong-indicator">wrong</Text>}
      </TouchableOpacity>
    ),
    AnswerFeedbackOverlay: ({ visible, correctAnswer, onContinue }: any) =>
      visible ? (
        <View testID="feedback-overlay">
          <Text testID="correct-answer-text">{correctAnswer}</Text>
          <TouchableOpacity testID="continue-button" onPress={onContinue}>
            <Text>Continue</Text>
          </TouchableOpacity>
        </View>
      ) : null,
  };
});

jest.mock('@/components/ui/TypeBadge', () => {
  const { View, Text } = require('react-native');
  return {
    TypeBadge: ({ variant }: any) => (
      <View testID="type-badge">
        <Text testID="type-badge-variant">{variant}</Text>
      </View>
    ),
  };
});

jest.mock('@/hooks/useHaptics', () => ({
  useHaptics: () => ({
    light: jest.fn(),
    medium: jest.fn(),
    heavy: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
    doubleError: jest.fn(),
    selection: jest.fn(),
  }),
}));

import { QuizCard } from '@/components/cards/QuizCard';

// ============================================================================
// Test Data
// ============================================================================

const defaultProps = {
  mode: 'translation' as const,
  word: 'gato',
  translation: 'cat',
  options: ['dog', 'cat', 'house', 'car'],
  correct_answer: 1,
  explanation: 'Gato means cat in Spanish',
  onComplete: jest.fn(),
};

const imageProps = {
  ...defaultProps,
  mode: 'image' as const,
  image_url: 'https://example.com/cat.jpg',
};

// ============================================================================
// Tests
// ============================================================================

describe('QuizCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render the question text for translation mode', () => {
      const { getByText } = render(<QuizCard {...defaultProps} />);

      expect(getByText('Which word means "cat"?')).toBeTruthy();
    });

    it('should render the question text for image mode', () => {
      const { getByText } = render(<QuizCard {...imageProps} />);

      expect(getByText('What is this?')).toBeTruthy();
    });

    it('should render all answer options', () => {
      const { getByText } = render(<QuizCard {...defaultProps} />);

      expect(getByText('dog')).toBeTruthy();
      expect(getByText('cat')).toBeTruthy();
      expect(getByText('house')).toBeTruthy();
      expect(getByText('car')).toBeTruthy();
    });

    it('should render TypeBadge with quiz variant', () => {
      const { getByTestId } = render(<QuizCard {...defaultProps} />);

      const badge = getByTestId('type-badge');
      expect(badge).toBeTruthy();

      const variant = getByTestId('type-badge-variant');
      expect(variant.props.children).toBe('quiz');
    });
  });

  describe('Answer Selection', () => {
    it('should call onComplete with true when correct answer is selected', () => {
      const onComplete = jest.fn();
      const { getByTestId } = render(
        <QuizCard {...defaultProps} onComplete={onComplete} />
      );

      fireEvent.press(getByTestId('quiz-option-1'));

      // Auto-advance after delay
      jest.advanceTimersByTime(2000);

      expect(onComplete).toHaveBeenCalledWith(true);
    });

    it('should show feedback overlay when wrong answer is selected', () => {
      const { getByTestId, queryByTestId } = render(<QuizCard {...defaultProps} />);

      // Initially no feedback overlay
      expect(queryByTestId('feedback-overlay')).toBeNull();

      // Select wrong answer
      fireEvent.press(getByTestId('quiz-option-0'));

      // Feedback overlay should be visible
      expect(getByTestId('feedback-overlay')).toBeTruthy();
    });

    it('should show the correct answer in feedback overlay', () => {
      const { getByTestId } = render(<QuizCard {...defaultProps} />);

      fireEvent.press(getByTestId('quiz-option-3')); // Wrong answer

      expect(getByTestId('correct-answer-text').props.children).toBe('cat');
    });

    it('should call onComplete with false when continue is pressed after wrong answer', () => {
      const onComplete = jest.fn();
      const { getByTestId } = render(
        <QuizCard {...defaultProps} onComplete={onComplete} />
      );

      // Select wrong answer
      fireEvent.press(getByTestId('quiz-option-0'));

      // Press continue
      fireEvent.press(getByTestId('continue-button'));

      expect(onComplete).toHaveBeenCalledWith(false);
    });

    it('should disable options after selection is made', () => {
      const { getByTestId } = render(<QuizCard {...defaultProps} />);

      fireEvent.press(getByTestId('quiz-option-0'));

      // All options should be disabled after selection
      expect(getByTestId('quiz-option-0').props.accessibilityState.disabled).toBe(true);
      expect(getByTestId('quiz-option-1').props.accessibilityState.disabled).toBe(true);
      expect(getByTestId('quiz-option-2').props.accessibilityState.disabled).toBe(true);
      expect(getByTestId('quiz-option-3').props.accessibilityState.disabled).toBe(true);
    });
  });

  describe('Correct/Incorrect Feedback', () => {
    it('should show DarkOverlay when wrong answer is selected', () => {
      const { getByTestId, queryByTestId } = render(<QuizCard {...defaultProps} />);

      expect(queryByTestId('dark-overlay')).toBeNull();

      fireEvent.press(getByTestId('quiz-option-3')); // Wrong

      expect(getByTestId('dark-overlay')).toBeTruthy();
    });

    it('should not show DarkOverlay when correct answer is selected', () => {
      const { getByTestId, queryByTestId } = render(<QuizCard {...defaultProps} />);

      fireEvent.press(getByTestId('quiz-option-1')); // Correct

      expect(queryByTestId('dark-overlay')).toBeNull();
    });
  });

  describe('Translation Mode', () => {
    it('should render translation in question when in translation mode', () => {
      const { getByText } = render(
        <QuizCard {...defaultProps} translation="house" />
      );

      expect(getByText('Which word means "house"?')).toBeTruthy();
    });

    it('should handle empty translation gracefully', () => {
      const { getByText } = render(
        <QuizCard {...defaultProps} translation="" />
      );

      expect(getByText('Which word means ""?')).toBeTruthy();
    });
  });
});
