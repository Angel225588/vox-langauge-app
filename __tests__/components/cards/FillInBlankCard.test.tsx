// @ts-nocheck
/**
 * FillInBlankCard Component Tests
 *
 * Tests rendering, user input, answer validation, hint display, and TypeBadge.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock dependencies before imports
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, style }: any) => {
    const { View } = require('react-native');
    return <View style={style}>{children}</View>;
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
    withTiming: (val: number) => val,
    FadeInDown: { duration: () => ({ delay: () => ({ springify: () => ({}) }), springify: () => ({}) }) },
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('@/components/ui', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return {
    DarkOverlay: ({ visible }: any) =>
      visible ? <View testID="dark-overlay" /> : null,
    AnswerOption: ({ text, onPress, disabled, state }: any) => (
      <TouchableOpacity
        testID={`option-${text}`}
        onPress={onPress}
        disabled={disabled}
        accessibilityState={{ disabled }}
      >
        <Text>{text}</Text>
        {state === 'selected' && <Text testID={`selected-${text}`}>selected</Text>}
        {state === 'correct' && <Text testID={`correct-${text}`}>correct</Text>}
        {state === 'wrong' && <Text testID={`wrong-${text}`}>wrong</Text>}
      </TouchableOpacity>
    ),
    AnswerFeedbackOverlay: ({ visible, explanation, correctAnswer, onContinue }: any) =>
      visible ? (
        <View testID="feedback-overlay">
          <Text testID="explanation-text">{explanation}</Text>
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

import { FillInBlankCard } from '@/components/cards/FillInBlankCard';

// ============================================================================
// Test Data
// ============================================================================

const defaultProps = {
  sentence: 'She [BLANK] to the store yesterday.',
  options: ['go', 'went', 'goes', 'going'],
  correct_answer: 1,
  explanation: '"Went" is the past tense of "go"',
  onNext: jest.fn(),
};

// ============================================================================
// Tests
// ============================================================================

describe('FillInBlankCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render the header text', () => {
      const { getByText } = render(<FillInBlankCard {...defaultProps} />);

      expect(getByText('Fill in the blank')).toBeTruthy();
    });

    it('should render sentence parts around the blank', () => {
      const { getByText } = render(<FillInBlankCard {...defaultProps} />);

      // The sentence is split by [BLANK], text rendering combines parts
      // "She " + blank + " to the store yesterday."
      expect(getByText(/She/)).toBeTruthy();
      expect(getByText(/store yesterday/)).toBeTruthy();
    });

    it('should render blank placeholder when no option selected', () => {
      const { getByText } = render(<FillInBlankCard {...defaultProps} />);

      expect(getByText('_______')).toBeTruthy();
    });

    it('should render all answer options', () => {
      const { getByText } = render(<FillInBlankCard {...defaultProps} />);

      expect(getByText('go')).toBeTruthy();
      expect(getByText('went')).toBeTruthy();
      expect(getByText('goes')).toBeTruthy();
      expect(getByText('going')).toBeTruthy();
    });

    it('should render options label', () => {
      const { getByText } = render(<FillInBlankCard {...defaultProps} />);

      expect(getByText('Choose the correct word:')).toBeTruthy();
    });

    it('should render TypeBadge with grammar variant', () => {
      const { getByTestId } = render(<FillInBlankCard {...defaultProps} />);

      const badge = getByTestId('type-badge');
      expect(badge).toBeTruthy();

      const variant = getByTestId('type-badge-variant');
      expect(variant.props.children).toBe('grammar');
    });

    it('should render confirm button', () => {
      const { getByText } = render(<FillInBlankCard {...defaultProps} />);

      expect(getByText('Confirm')).toBeTruthy();
    });
  });

  describe('User Input', () => {
    it('should show selected word in sentence when option is tapped', () => {
      const { getByTestId, getAllByText, queryByText } = render(
        <FillInBlankCard {...defaultProps} />
      );

      fireEvent.press(getByTestId('option-went'));

      // "went" appears both in the sentence and in the option list
      expect(getAllByText('went').length).toBeGreaterThanOrEqual(1);
      // Blank placeholder should no longer be visible
      expect(queryByText('_______')).toBeNull();
    });

    it('should highlight selected option', () => {
      const { getByTestId } = render(<FillInBlankCard {...defaultProps} />);

      fireEvent.press(getByTestId('option-goes'));

      expect(getByTestId('selected-goes')).toBeTruthy();
    });

    it('should allow changing selection before confirming', () => {
      const { getByTestId } = render(<FillInBlankCard {...defaultProps} />);

      // Select first option
      fireEvent.press(getByTestId('option-go'));
      expect(getByTestId('selected-go')).toBeTruthy();

      // Change selection
      fireEvent.press(getByTestId('option-went'));
      expect(getByTestId('selected-went')).toBeTruthy();
    });
  });

  describe('Validation', () => {
    it('should call onNext with correct:true when correct answer is confirmed', () => {
      const onNext = jest.fn();
      const { getByTestId, getByText } = render(
        <FillInBlankCard {...defaultProps} onNext={onNext} />
      );

      // Select correct answer
      fireEvent.press(getByTestId('option-went'));
      // Confirm
      fireEvent.press(getByText('Confirm'));

      // Auto-advance after delay
      jest.advanceTimersByTime(1500);

      expect(onNext).toHaveBeenCalledWith({ correct: true, points: 15 });
    });

    it('should show feedback overlay when incorrect answer is confirmed', () => {
      const { getByTestId, getByText, queryByTestId } = render(
        <FillInBlankCard {...defaultProps} />
      );

      expect(queryByTestId('feedback-overlay')).toBeNull();

      // Select wrong answer and confirm
      fireEvent.press(getByTestId('option-go'));
      fireEvent.press(getByText('Confirm'));

      expect(getByTestId('feedback-overlay')).toBeTruthy();
    });

    it('should show explanation in feedback when wrong answer confirmed', () => {
      const { getByTestId, getByText } = render(
        <FillInBlankCard {...defaultProps} />
      );

      fireEvent.press(getByTestId('option-going'));
      fireEvent.press(getByText('Confirm'));

      expect(getByTestId('explanation-text').props.children).toBe(
        '"Went" is the past tense of "go"'
      );
    });

    it('should show correct answer in feedback overlay', () => {
      const { getByTestId, getByText } = render(
        <FillInBlankCard {...defaultProps} />
      );

      fireEvent.press(getByTestId('option-go'));
      fireEvent.press(getByText('Confirm'));

      expect(getByTestId('correct-answer-text').props.children).toBe('went');
    });

    it('should call onNext with correct:false when continue after wrong answer', () => {
      const onNext = jest.fn();
      const { getByTestId, getByText } = render(
        <FillInBlankCard {...defaultProps} onNext={onNext} />
      );

      fireEvent.press(getByTestId('option-go'));
      fireEvent.press(getByText('Confirm'));
      fireEvent.press(getByTestId('continue-button'));

      expect(onNext).toHaveBeenCalledWith({ correct: false, points: 5 });
    });

    it('should not confirm when no option is selected', () => {
      const onNext = jest.fn();
      const { getByText } = render(
        <FillInBlankCard {...defaultProps} onNext={onNext} />
      );

      // Try to confirm without selecting
      fireEvent.press(getByText('Confirm'));

      expect(onNext).not.toHaveBeenCalled();
    });
  });

  describe('Default Explanation', () => {
    it('should show default explanation when none provided', () => {
      const propsNoExplanation = {
        ...defaultProps,
        explanation: undefined,
      };

      const { getByTestId, getByText } = render(
        <FillInBlankCard {...propsNoExplanation} />
      );

      fireEvent.press(getByTestId('option-go'));
      fireEvent.press(getByText('Confirm'));

      // Should show default: 'The correct answer is "went"'
      expect(getByTestId('explanation-text').props.children).toBe(
        'The correct answer is "went"'
      );
    });
  });
});
