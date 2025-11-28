/**
 * Learning Card Components
 *
 * Collection of card types for mini-lessons
 */

import { View, Text, TouchableOpacity, Image, TextInput as RNTextInput } from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';
import { useState } from 'react';
import Animated, {
  FadeInDown,
  FadeIn,
  ZoomIn,
  SlideInRight,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

// Working new card
export { FillInBlankCard } from './FillInBlankCard';

// TODO: Fix these cards - they import deleted BaseCard component
// export { SentenceScrambleCard } from './SentenceScrambleCard';
// export { DescribeImageCard } from './DescribeImageCard';
// export { StorytellingCard } from './StorytellingCard';
// export { QuestionGameCard } from './QuestionGameCard';
// export { RolePlayCard } from './RolePlayCard';

interface CardProps {
  onNext: (answer?: any) => void;
}

// Single Vocabulary Card - Display word with image and audio
export function SingleVocabCard({
  word,
  translation,
  phonetic,
  image_url,
  audio_url,
  example_sentence,
  onNext,
}: {
  word?: string;
  translation?: string;
  phonetic?: string;
  image_url?: string;
  audio_url?: string;
  example_sentence?: string;
} & CardProps) {
  const buttonScale = useSharedValue(1);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onNext();
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Animated.View
        entering={FadeInDown.duration(400).springify()}
        style={{
          width: '100%',
          padding: spacing['2xl'],
          borderRadius: borderRadius['2xl'],
          alignItems: 'center',
          backgroundColor: colors.background.card,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        {image_url && (
          <Animated.View entering={ZoomIn.duration(500).delay(200)}>
            <Image
              source={{ uri: image_url }}
              style={{
                width: 200,
                height: 200,
                borderRadius: borderRadius.xl,
                marginBottom: spacing.xl,
              }}
            />
          </Animated.View>
        )}

        <Animated.Text
          entering={SlideInRight.duration(400).delay(300)}
          style={{
            fontSize: 48,
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            marginBottom: spacing.md,
          }}
        >
          {word}
        </Animated.Text>

        {phonetic && (
          <Animated.Text
            entering={FadeIn.duration(400).delay(400)}
            style={{
              fontSize: typography.fontSize.md,
              color: colors.accent.purple,
              marginBottom: spacing.sm,
            }}
          >
            {phonetic}
          </Animated.Text>
        )}

        {translation && (
          <Animated.Text
            entering={FadeIn.duration(400).delay(500)}
            style={{
              fontSize: typography.fontSize.lg,
              color: colors.text.secondary,
              marginBottom: spacing.xl,
            }}
          >
            {translation}
          </Animated.Text>
        )}

        {example_sentence && (
          <Animated.Text
            entering={FadeIn.duration(400).delay(600)}
            style={{
              fontSize: typography.fontSize.md,
              color: colors.text.tertiary,
              textAlign: 'center',
              fontStyle: 'italic',
              paddingHorizontal: spacing.md,
            }}
          >
            "{example_sentence}"
          </Animated.Text>
        )}
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(400).delay(700)}
        style={[buttonAnimatedStyle, { width: '100%', marginTop: spacing.xl }]}
      >
        <TouchableOpacity
          onPress={handleContinue}
          onPressIn={() => {
            buttonScale.value = withSpring(0.95);
          }}
          onPressOut={() => {
            buttonScale.value = withSpring(1);
          }}
          style={{
            backgroundColor: colors.accent.primary,
            paddingHorizontal: spacing['2xl'],
            paddingVertical: spacing.lg,
            borderRadius: borderRadius.xl,
            width: '100%',
            shadowColor: colors.accent.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Text
            style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              textAlign: 'center',
            }}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// Multiple Choice Card
export function MultipleChoiceCard({
  word,
  translation,
  options,
  correct_answer,
  onNext,
}: {
  word?: string;
  translation?: string;
  options?: string[];
  correct_answer?: number;
} & CardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (index: number) => {
    const isCorrect = correct_answer === index;

    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setSelectedIndex(index);
    setShowResult(true);

    setTimeout(() => {
      onNext(index);
      setSelectedIndex(null);
      setShowResult(false);
    }, 1500);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <Animated.Text
        entering={FadeInDown.duration(400)}
        style={{
          fontSize: typography.fontSize['2xl'],
          fontWeight: typography.fontWeight.bold,
          color: colors.text.primary,
          textAlign: 'center',
          marginBottom: spacing['2xl'],
        }}
      >
        Which word means "{translation}"?
      </Animated.Text>

      {options?.map((option, index) => {
        const isSelected = selectedIndex === index;
        const isCorrect = correct_answer === index;
        const showAsCorrect = showResult && isCorrect;
        const showAsWrong = showResult && isSelected && !isCorrect;

        return (
          <Animated.View
            key={index}
            entering={FadeInDown.duration(400).delay(100 * (index + 1)).springify()}
          >
            <TouchableOpacity
              onPress={() => !showResult && handleSelect(index)}
              disabled={showResult}
              activeOpacity={0.8}
              style={{
                backgroundColor: showAsCorrect
                  ? colors.accent.success
                  : showAsWrong
                    ? colors.accent.error
                    : colors.background.card,
                paddingVertical: spacing.lg,
                paddingHorizontal: spacing.xl,
                borderRadius: borderRadius.xl,
                marginBottom: spacing.md,
                borderWidth: 2,
                borderColor: showAsCorrect || showAsWrong
                  ? 'transparent'
                  : colors.border.light,
                shadowColor: showAsCorrect
                  ? colors.accent.success
                  : showAsWrong
                    ? colors.accent.error
                    : '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: showAsCorrect || showAsWrong ? 0.4 : 0.1,
                shadowRadius: 4,
                elevation: showAsCorrect || showAsWrong ? 4 : 2,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm }}>
                {showAsCorrect && <Text style={{ fontSize: 20 }}>✓</Text>}
                {showAsWrong && <Text style={{ fontSize: 20 }}>✗</Text>}
                <Text
                  style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    textAlign: 'center',
                  }}
                >
                  {option}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
}

// Image Quiz Card
export function ImageQuizCard({
  word,
  options,
  correct_answer,
  image_url,
  onNext,
}: {
  word?: string;
  options?: string[];
  correct_answer?: number;
  image_url?: string;
} & CardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (index: number) => {
    const isCorrect = correct_answer === index;

    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setSelectedIndex(index);
    setShowResult(true);

    setTimeout(() => {
      onNext(index);
      setSelectedIndex(null);
      setShowResult(false);
    }, 1500);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      {image_url && (
        <Animated.View entering={ZoomIn.duration(500)}>
          <Image
            source={{ uri: image_url }}
            style={{
              width: '100%',
              height: 250,
              borderRadius: borderRadius.xl,
              marginBottom: spacing.xl,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            }}
          />
        </Animated.View>
      )}

      <Animated.Text
        entering={FadeIn.duration(400).delay(300)}
        style={{
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.bold,
          color: colors.text.primary,
          textAlign: 'center',
          marginBottom: spacing.xl,
        }}
      >
        What is this?
      </Animated.Text>

      {options?.map((option, index) => {
        const isSelected = selectedIndex === index;
        const isCorrect = correct_answer === index;
        const showAsCorrect = showResult && isCorrect;
        const showAsWrong = showResult && isSelected && !isCorrect;

        return (
          <Animated.View
            key={index}
            entering={FadeInDown.duration(400).delay(100 * (index + 1) + 400).springify()}
          >
            <TouchableOpacity
              onPress={() => !showResult && handleSelect(index)}
              disabled={showResult}
              activeOpacity={0.8}
              style={{
                backgroundColor: showAsCorrect
                  ? colors.accent.success
                  : showAsWrong
                    ? colors.accent.error
                    : colors.background.card,
                paddingVertical: spacing.lg,
                paddingHorizontal: spacing.xl,
                borderRadius: borderRadius.xl,
                marginBottom: spacing.md,
                borderWidth: 2,
                borderColor: showAsCorrect || showAsWrong
                  ? 'transparent'
                  : colors.border.light,
                shadowColor: showAsCorrect
                  ? colors.accent.success
                  : showAsWrong
                    ? colors.accent.error
                    : '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: showAsCorrect || showAsWrong ? 0.4 : 0.1,
                shadowRadius: 4,
                elevation: showAsCorrect || showAsWrong ? 4 : 2,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm }}>
                {showAsCorrect && <Text style={{ fontSize: 20 }}>✓</Text>}
                {showAsWrong && <Text style={{ fontSize: 20 }}>✗</Text>}
                <Text
                  style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    textAlign: 'center',
                  }}
                >
                  {option}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
}

// Audio Card
export function AudioCard({
  word,
  translation,
  audio_url,
  options,
  correct_answer,
  onNext,
}: {
  word?: string;
  translation?: string;
  audio_url?: string;
  options?: string[];
  correct_answer?: number;
} & CardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const audioButtonScale = useSharedValue(1);

  const handleSelect = (index: number) => {
    const isCorrect = correct_answer === index;

    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setSelectedIndex(index);
    setShowResult(true);

    setTimeout(() => {
      onNext(index);
      setSelectedIndex(null);
      setShowResult(false);
    }, 1500);
  };

  const handlePlayAudio = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    audioButtonScale.value = withSpring(0.9, {}, () => {
      audioButtonScale.value = withSpring(1);
    });
  };

  const audioButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: audioButtonScale.value }],
    };
  });

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <Animated.View
        entering={ZoomIn.duration(500).springify()}
        style={[
          audioButtonStyle,
          {
            alignSelf: 'center',
            marginBottom: spacing['2xl'],
          },
        ]}
      >
        <TouchableOpacity
          onPress={handlePlayAudio}
          activeOpacity={0.8}
          style={{
            width: 120,
            height: 120,
            borderRadius: borderRadius.full,
            backgroundColor: colors.accent.primary,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: colors.accent.primary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <Text style={{ fontSize: 48 }}>🔊</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.Text
        entering={FadeIn.duration(400).delay(300)}
        style={{
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.bold,
          color: colors.text.primary,
          textAlign: 'center',
          marginBottom: spacing.xl,
        }}
      >
        What did you hear?
      </Animated.Text>

      {options?.map((option, index) => {
        const isSelected = selectedIndex === index;
        const isCorrect = correct_answer === index;
        const showAsCorrect = showResult && isCorrect;
        const showAsWrong = showResult && isSelected && !isCorrect;

        return (
          <Animated.View
            key={index}
            entering={FadeInDown.duration(400).delay(100 * (index + 1) + 400).springify()}
          >
            <TouchableOpacity
              onPress={() => !showResult && handleSelect(index)}
              disabled={showResult}
              activeOpacity={0.8}
              style={{
                backgroundColor: showAsCorrect
                  ? colors.accent.success
                  : showAsWrong
                    ? colors.accent.error
                    : colors.background.card,
                paddingVertical: spacing.lg,
                paddingHorizontal: spacing.xl,
                borderRadius: borderRadius.xl,
                marginBottom: spacing.md,
                borderWidth: 2,
                borderColor: showAsCorrect || showAsWrong
                  ? 'transparent'
                  : colors.border.light,
                shadowColor: showAsCorrect
                  ? colors.accent.success
                  : showAsWrong
                    ? colors.accent.error
                    : '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: showAsCorrect || showAsWrong ? 0.4 : 0.1,
                shadowRadius: 4,
                elevation: showAsCorrect || showAsWrong ? 4 : 2,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm }}>
                {showAsCorrect && <Text style={{ fontSize: 20 }}>✓</Text>}
                {showAsWrong && <Text style={{ fontSize: 20 }}>✗</Text>}
                <Text
                  style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    textAlign: 'center',
                  }}
                >
                  {option}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
}

// Text Input Card
export function TextInputCard({
  word,
  translation,
  correct_answer,
  onNext,
}: {
  word?: string;
  translation?: string;
  correct_answer?: string;
} & CardProps) {
  const [input, setInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const inputScale = useSharedValue(1);

  const handleSubmit = () => {
    const correct = input.toLowerCase().trim() === correct_answer?.toLowerCase().trim();
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setTimeout(() => {
      onNext(input);
      setInput('');
      setShowResult(false);
      setIsCorrect(false);
    }, 1500);
  };

  const inputAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: inputScale.value }],
    };
  });

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <Animated.Text
        entering={FadeInDown.duration(400)}
        style={{
          fontSize: typography.fontSize['2xl'],
          fontWeight: typography.fontWeight.bold,
          color: colors.text.primary,
          textAlign: 'center',
          marginBottom: spacing.md,
        }}
      >
        Type the word in English
      </Animated.Text>

      {translation && (
        <Animated.Text
          entering={FadeIn.duration(400).delay(200)}
          style={{
            fontSize: typography.fontSize.xl,
            color: colors.accent.purple,
            textAlign: 'center',
            marginBottom: spacing['2xl'],
          }}
        >
          {translation}
        </Animated.Text>
      )}

      <Animated.View
        entering={FadeInDown.duration(400).delay(300)}
        style={inputAnimatedStyle}
      >
        <RNTextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type here..."
          placeholderTextColor={colors.text.tertiary}
          autoCapitalize="none"
          autoCorrect={false}
          style={{
            backgroundColor: colors.background.card,
            paddingVertical: spacing.lg,
            paddingHorizontal: spacing.xl,
            borderRadius: borderRadius.xl,
            fontSize: typography.fontSize.lg,
            color: colors.text.primary,
            marginBottom: spacing.xl,
            borderWidth: 2,
            borderColor: showResult
              ? isCorrect
                ? colors.accent.success
                : colors.accent.error
              : colors.border.light,
            shadowColor: showResult
              ? isCorrect
                ? colors.accent.success
                : colors.accent.error
              : '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: showResult ? 0.4 : 0.1,
            shadowRadius: 4,
            elevation: showResult ? 4 : 2,
          }}
          editable={!showResult}
          onFocus={() => {
            inputScale.value = withSpring(1.02);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          onBlur={() => {
            inputScale.value = withSpring(1);
          }}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(400)}>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!input || showResult}
          activeOpacity={0.8}
          style={{
            backgroundColor: !input || showResult
              ? colors.background.elevated
              : colors.accent.primary,
            paddingVertical: spacing.lg,
            paddingHorizontal: spacing['2xl'],
            borderRadius: borderRadius.xl,
            shadowColor: !input || showResult ? '#000' : colors.accent.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: !input || showResult ? 0.1 : 0.4,
            shadowRadius: 8,
            elevation: !input || showResult ? 2 : 4,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm }}>
            {showResult && (
              <Text style={{ fontSize: 20 }}>
                {isCorrect ? '✓' : '✗'}
              </Text>
            )}
            <Text
              style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
                textAlign: 'center',
              }}
            >
              {showResult ? (isCorrect ? 'Correct!' : 'Incorrect') : 'Check'}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {showResult && !isCorrect && correct_answer && (
        <Animated.Text
          entering={FadeIn.duration(400)}
          style={{
            fontSize: typography.fontSize.md,
            color: colors.text.tertiary,
            textAlign: 'center',
            marginTop: spacing.md,
          }}
        >
          Correct answer: {correct_answer}
        </Animated.Text>
      )}
    </View>
  );
}

// Speaking Card
export function SpeakingCard({
  word,
  translation,
  phonetic,
  audio_url,
  example_sentence,
  onNext,
}: {
  word?: string;
  translation?: string;
  phonetic?: string;
  audio_url?: string;
  example_sentence?: string;
} & CardProps) {
  const [isRecording, setIsRecording] = useState(false);
  const recordButtonScale = useSharedValue(1);
  const recordButtonRotation = useSharedValue(0);

  const handleRecord = () => {
    if (!isRecording) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsRecording(true);
      recordButtonRotation.value = withTiming(360, { duration: 500 });
      recordButtonScale.value = withSpring(1.1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsRecording(false);
      recordButtonRotation.value = withTiming(0, { duration: 300 });
      recordButtonScale.value = withSpring(1);

      setTimeout(() => {
        onNext();
      }, 500);
    }
  };

  const recordButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: recordButtonScale.value },
        { rotate: `${recordButtonRotation.value}deg` },
      ],
    };
  });

  const pulseStyle = useAnimatedStyle(() => {
    if (!isRecording) return { opacity: 0 };

    return {
      opacity: withTiming(0.3, { duration: 1000 }),
      transform: [
        { scale: withTiming(1.3, { duration: 1000 }) },
      ],
    };
  });

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Animated.Text
        entering={FadeInDown.duration(400)}
        style={{
          fontSize: typography.fontSize['2xl'],
          fontWeight: typography.fontWeight.bold,
          color: colors.text.primary,
          textAlign: 'center',
          marginBottom: spacing.md,
        }}
      >
        Say this word
      </Animated.Text>

      <Animated.Text
        entering={ZoomIn.duration(500).delay(200)}
        style={{
          fontSize: 56,
          fontWeight: typography.fontWeight.bold,
          color: colors.text.primary,
          marginBottom: spacing.sm,
        }}
      >
        {word}
      </Animated.Text>

      {phonetic && (
        <Animated.Text
          entering={FadeIn.duration(400).delay(300)}
          style={{
            fontSize: typography.fontSize.lg,
            color: colors.accent.purple,
            marginBottom: spacing.xl,
          }}
        >
          {phonetic}
        </Animated.Text>
      )}

      {example_sentence && (
        <Animated.Text
          entering={FadeIn.duration(400).delay(400)}
          style={{
            fontSize: typography.fontSize.md,
            color: colors.text.tertiary,
            textAlign: 'center',
            fontStyle: 'italic',
            marginBottom: spacing['2xl'],
            paddingHorizontal: spacing.lg,
          }}
        >
          "{example_sentence}"
        </Animated.Text>
      )}

      <View style={{ position: 'relative', marginTop: spacing.xl }}>
        {isRecording && (
          <>
            <Animated.View
              style={[
                pulseStyle,
                {
                  position: 'absolute',
                  width: 140,
                  height: 140,
                  borderRadius: 70,
                  backgroundColor: colors.accent.error,
                  top: -10,
                  left: -10,
                },
              ]}
            />
            <Animated.View
              style={[
                pulseStyle,
                {
                  position: 'absolute',
                  width: 160,
                  height: 160,
                  borderRadius: 80,
                  backgroundColor: colors.accent.error,
                  top: -20,
                  left: -20,
                },
              ]}
            />
          </>
        )}

        <Animated.View
          entering={ZoomIn.duration(500).delay(500).springify()}
          style={recordButtonStyle}
        >
          <TouchableOpacity
            onPress={handleRecord}
            activeOpacity={0.8}
            style={{
              width: 120,
              height: 120,
              borderRadius: borderRadius.full,
              backgroundColor: isRecording ? colors.accent.error : colors.accent.primary,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: isRecording ? colors.accent.error : colors.accent.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.5,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <Text style={{ fontSize: 48 }}>{isRecording ? '⏹️' : '🎤'}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <Animated.Text
        entering={FadeIn.duration(400).delay(600)}
        style={{
          fontSize: typography.fontSize.md,
          color: isRecording ? colors.accent.error : colors.text.secondary,
          marginTop: spacing.lg,
          fontWeight: isRecording ? typography.fontWeight.semibold : typography.fontWeight.normal,
        }}
      >
        {isRecording ? '🔴 Recording... Tap to stop' : 'Tap to record'}
      </Animated.Text>
    </View>
  );
}
