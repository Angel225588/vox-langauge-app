/**
 * Learning Card Components
 *
 * Collection of card types for mini-lessons
 */

import { View, Text, TouchableOpacity, Image, TextInput as RNTextInput } from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';
import { useState } from 'react';

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
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: '100%',
          padding: spacing['2xl'],
          borderRadius: borderRadius['2xl'],
          alignItems: 'center',
          backgroundColor: colors.primary.DEFAULT
        }}
      >
        {image_url && (
          <Image
            source={{ uri: image_url }}
            style={{
              width: 200,
              height: 200,
              borderRadius: borderRadius.xl,
              marginBottom: spacing.xl,
            }}
          />
        )}

        <Text
          style={{
            fontSize: 48,
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            marginBottom: spacing.md,
          }}
        >
          {word}
        </Text>

        {phonetic && (
          <Text
            style={{
              fontSize: typography.fontSize.md,
              color: colors.text.secondary,
              marginBottom: spacing.sm,
            }}
          >
            {phonetic}
          </Text>
        )}

        {translation && (
          <Text
            style={{
              fontSize: typography.fontSize.lg,
              color: colors.text.secondary,
              marginBottom: spacing.xl,
            }}
          >
            {translation}
          </Text>
        )}

        {example_sentence && (
          <Text
            style={{
              fontSize: typography.fontSize.md,
              color: colors.text.secondary,
              textAlign: 'center',
              fontStyle: 'italic',
            }}
          >
            "{example_sentence}"
          </Text>
        )}
      </View>

      <TouchableOpacity
        onPress={() => onNext()}
        style={{
          marginTop: spacing.xl,
          backgroundColor: colors.accent.primary,
          paddingHorizontal: spacing['2xl'],
          paddingVertical: spacing.lg,
          borderRadius: borderRadius.xl,
          width: '100%',
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
      <Text
        style={{
          fontSize: typography.fontSize['2xl'],
          fontWeight: typography.fontWeight.bold,
          color: colors.text.primary,
          textAlign: 'center',
          marginBottom: spacing['2xl'],
        }}
      >
        Which word means "{translation}"?
      </Text>

      {options?.map((option, index) => {
        const isSelected = selectedIndex === index;
        const isCorrect = correct_answer === index;
        const showAsCorrect = showResult && isCorrect;
        const showAsWrong = showResult && isSelected && !isCorrect;

        return (
          <TouchableOpacity
            key={index}
            onPress={() => !showResult && handleSelect(index)}
            disabled={showResult}
            style={{
              backgroundColor: showAsCorrect
                ? colors.accent.success
                : showAsWrong
                  ? colors.accent.error
                  : 'rgba(255, 255, 255, 0.1)',
              paddingVertical: spacing.lg,
              paddingHorizontal: spacing.xl,
              borderRadius: borderRadius.xl,
              marginBottom: spacing.md,
              borderWidth: 2,
              borderColor: showAsCorrect || showAsWrong
                ? 'transparent'
                : 'rgba(255, 255, 255, 0.2)',
            }}
          >
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
          </TouchableOpacity>
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
        <Image
          source={{ uri: image_url }}
          style={{
            width: '100%',
            height: 250,
            borderRadius: borderRadius.xl,
            marginBottom: spacing.xl,
          }}
        />
      )}

      <Text
        style={{
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.bold,
          color: colors.text.primary,
          textAlign: 'center',
          marginBottom: spacing.xl,
        }}
      >
        What is this?
      </Text>

      {options?.map((option, index) => {
        const isSelected = selectedIndex === index;
        const isCorrect = correct_answer === index;
        const showAsCorrect = showResult && isCorrect;
        const showAsWrong = showResult && isSelected && !isCorrect;

        return (
          <TouchableOpacity
            key={index}
            onPress={() => !showResult && handleSelect(index)}
            disabled={showResult}
            style={{
              backgroundColor: showAsCorrect
                ? colors.accent.success
                : showAsWrong
                  ? colors.accent.error
                  : 'rgba(255, 255, 255, 0.1)',
              paddingVertical: spacing.lg,
              paddingHorizontal: spacing.xl,
              borderRadius: borderRadius.xl,
              marginBottom: spacing.md,
              borderWidth: 2,
              borderColor: showAsCorrect || showAsWrong
                ? 'transparent'
                : 'rgba(255, 255, 255, 0.2)',
            }}
          >
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
          </TouchableOpacity>
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

  const handleSelect = (index: number) => {
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
      <TouchableOpacity
        style={{
          width: 120,
          height: 120,
          borderRadius: borderRadius.full,
          backgroundColor: colors.accent.primary,
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'center',
          marginBottom: spacing['2xl'],
        }}
      >
        <Text style={{ fontSize: 48 }}>🔊</Text>
      </TouchableOpacity>

      <Text
        style={{
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.bold,
          color: colors.text.primary,
          textAlign: 'center',
          marginBottom: spacing.xl,
        }}
      >
        What did you hear?
      </Text>

      {options?.map((option, index) => {
        const isSelected = selectedIndex === index;
        const isCorrect = correct_answer === index;
        const showAsCorrect = showResult && isCorrect;
        const showAsWrong = showResult && isSelected && !isCorrect;

        return (
          <TouchableOpacity
            key={index}
            onPress={() => !showResult && handleSelect(index)}
            disabled={showResult}
            style={{
              backgroundColor: showAsCorrect
                ? colors.accent.success
                : showAsWrong
                  ? colors.accent.error
                  : 'rgba(255, 255, 255, 0.1)',
              paddingVertical: spacing.lg,
              paddingHorizontal: spacing.xl,
              borderRadius: borderRadius.xl,
              marginBottom: spacing.md,
              borderWidth: 2,
              borderColor: showAsCorrect || showAsWrong
                ? 'transparent'
                : 'rgba(255, 255, 255, 0.2)',
            }}
          >
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
          </TouchableOpacity>
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

  const handleSubmit = () => {
    const correct = input.toLowerCase().trim() === correct_answer?.toLowerCase().trim();
    setIsCorrect(correct);
    setShowResult(true);

    setTimeout(() => {
      onNext(input);
      setInput('');
      setShowResult(false);
    }, 1500);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <Text
        style={{
          fontSize: typography.fontSize['2xl'],
          fontWeight: typography.fontWeight.bold,
          color: colors.text.primary,
          textAlign: 'center',
          marginBottom: spacing.md,
        }}
      >
        Type the word in English
      </Text>

      {translation && (
        <Text
          style={{
            fontSize: typography.fontSize.xl,
            color: colors.text.secondary,
            textAlign: 'center',
            marginBottom: spacing['2xl'],
          }}
        >
          {translation}
        </Text>
      )}

      <RNTextInput
        value={input}
        onChangeText={setInput}
        placeholder="Type here..."
        placeholderTextColor={colors.text.tertiary}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
            : 'rgba(255, 255, 255, 0.2)',
        }}
        editable={!showResult}
      />

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={!input || showResult}
        style={{
          backgroundColor: !input || showResult
            ? 'rgba(255, 255, 255, 0.2)'
            : colors.accent.primary,
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing['2xl'],
          borderRadius: borderRadius.xl,
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
          Check
        </Text>
      </TouchableOpacity>
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

  const handleRecord = () => {
    setIsRecording(!isRecording);
    if (isRecording) {
      // Stop recording and process
      setTimeout(() => {
        onNext();
      }, 500);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text
        style={{
          fontSize: typography.fontSize['2xl'],
          fontWeight: typography.fontWeight.bold,
          color: colors.text.primary,
          textAlign: 'center',
          marginBottom: spacing.md,
        }}
      >
        Say this word
      </Text>

      <Text
        style={{
          fontSize: 56,
          fontWeight: typography.fontWeight.bold,
          color: colors.text.primary,
          marginBottom: spacing.sm,
        }}
      >
        {word}
      </Text>

      {phonetic && (
        <Text
          style={{
            fontSize: typography.fontSize.lg,
            color: colors.text.secondary,
            marginBottom: spacing.xl,
          }}
        >
          {phonetic}
        </Text>
      )}

      {example_sentence && (
        <Text
          style={{
            fontSize: typography.fontSize.md,
            color: colors.text.secondary,
            textAlign: 'center',
            fontStyle: 'italic',
            marginBottom: spacing['2xl'],
          }}
        >
          "{example_sentence}"
        </Text>
      )}

      <TouchableOpacity
        onPress={handleRecord}
        style={{
          width: 120,
          height: 120,
          borderRadius: borderRadius.full,
          backgroundColor: isRecording ? colors.accent.error : colors.accent.primary,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: spacing.xl,
        }}
      >
        <Text style={{ fontSize: 48 }}>{isRecording ? '⏹️' : '🎤'}</Text>
      </TouchableOpacity>

      <Text
        style={{
          fontSize: typography.fontSize.md,
          color: colors.text.secondary,
          marginTop: spacing.lg,
        }}
      >
        {isRecording ? 'Tap to stop' : 'Tap to record'}
      </Text>
    </View>
  );
}
