import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  FadeIn,
  FadeOut,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { BaseCard } from './BaseCard';
import { AudioControls } from './AudioControls';
import {
  colors,
  borderRadius,
  spacing,
  shadows,
  typography,
  animation,
} from '@/constants/designSystem';
import LottieSuccess from '../animations/LottieSuccess';

// --- CONSTANTS ---
const WORD_SPACING = spacing.sm;
const WORD_HEIGHT = 45; // Approximate height for layout calculation
const SENTENCE_MIN_HEIGHT = 80;

// --- TYPES ---
interface SentenceScrambleCardProps {
  words: string[];
  correctOrder: string[];
  targetSentence: string;
  hint?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  onComplete: (isCorrect: boolean) => void;
  // Inherited from BaseCardProps
  [key: string]: any; // To allow for other BaseCard props
}

interface WordPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AnimatedPosition {
  x: Animated.SharedValue<number>;
  y: Animated.SharedValue<number>;
}

// --- HOOKS ---
function useWordPositions(words: string[]) {
  const [wordLayouts, setWordLayouts] = useState<WordPosition[]>([]);
  const containerWidth = useSharedValue(0);

  const calculateLayout = useCallback((_containerWidth: number) => {
    if (_containerWidth === 0 || words.length === 0) return [];

    const layouts: WordPosition[] = [];
    let currentX = 0;
    let currentY = 0;
    const MOCK_WIDTH_ESTIMATE_FACTOR = 12; // Simple estimation factor

    words.forEach(word => {
      const estimatedWidth = word.length * MOCK_WIDTH_ESTIMATE_FACTOR + spacing.md * 2;
      if (currentX + estimatedWidth > _containerWidth) {
        currentX = 0;
        currentY += WORD_HEIGHT + WORD_SPACING;
      }
      layouts.push({
        x: currentX,
        y: currentY,
        width: estimatedWidth,
        height: WORD_HEIGHT,
      });
      currentX += estimatedWidth + WORD_SPACING;
    });

    return layouts;
  }, [words]);

  useEffect(() => {
    // This effect is mainly for initial calculation if width is known
    if (containerWidth.value > 0) {
      setWordLayouts(calculateLayout(containerWidth.value));
    }
  }, [words, containerWidth.value, calculateLayout]);

  const onContainerLayout = (event: any) => {
    const newWidth = event.nativeEvent.layout.width;
    if (newWidth !== containerWidth.value) {
      containerWidth.value = newWidth;
      setWordLayouts(calculateLayout(newWidth));
    }
  };

  return { wordLayouts, onContainerLayout };
}

// --- DRAGGABLE WORD COMPONENT ---
interface DraggableWordProps {
  word: string;
  positions: AnimatedPosition[];
  index: number;
  onDragEnd: (from: number, to: number) => void;
  wordLayouts: WordPosition[];
  isDragging: Animated.SharedValue<boolean>;
  draggedIndex: Animated.SharedValue<number>;
}

const DraggableWord: React.FC<DraggableWordProps> = ({
  word,
  positions,
  index,
  onDragEnd,
  wordLayouts,
  isDragging,
  draggedIndex,
}) => {
  const position = positions[index];
  const isBeingDragged = useSharedValue(false);

  const gesture = Gesture.Pan()
    .onStart(() => {
      isBeingDragged.value = true;
      isDragging.value = true;
      draggedIndex.value = index;
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    })
    .onUpdate(e => {
      position.x.value = e.translationX;
      position.y.value = e.translationY;
    })
    .onEnd(() => {
      const currentX = position.x.value + wordLayouts[index].x;
      const currentY = position.y.value + wordLayouts[index].y;

      let newIndex = -1;
      for (let i = 0; i < wordLayouts.length; i++) {
        const layout = wordLayouts[i];
        if (
          currentX >= layout.x &&
          currentX <= layout.x + layout.width &&
          currentY >= layout.y &&
          currentY <= layout.y + layout.height
        ) {
          newIndex = i;
          break;
        }
      }

      if (newIndex !== -1 && newIndex !== index) {
        runOnJS(onDragEnd)(index, newIndex);
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        position.x.value = withSpring(0, animation.spring.bouncy);
        position.y.value = withSpring(0, animation.spring.bouncy);
      }
    })
    .onFinalize(() => {
      isBeingDragged.value = false;
      isDragging.value = false;
      draggedIndex.value = -1;
    });

  const animatedStyle = useAnimatedStyle(() => {
    const zIndex = isBeingDragged.value ? 100 : 1;
    const scale = withSpring(isBeingDragged.value ? 1.1 : 1);
    const layout = wordLayouts[index];
    const initialX = layout ? layout.x : 0;
    const initialY = layout ? layout.y : 0;

    return {
      position: 'absolute',
      top: initialY,
      left: initialX,
      zIndex,
      transform: [
        { translateX: position.x.value },
        { translateY: position.y.value },
        { scale },
      ],
    };
  }, [wordLayouts]);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.wordTile, animatedStyle]}>
        <Text style={styles.wordText}>{word}</Text>
      </Animated.View>
    </GestureDetector>
  );
};

// --- MAIN CARD COMPONENT ---
export const SentenceScrambleCard: React.FC<SentenceScrambleCardProps> = ({
  words: initialWords,
  correctOrder,
  targetSentence,
  hint,
  difficulty,
  onComplete,
  ...baseCardProps
}) => {
  const [currentWords, setCurrentWords] = useState<string[]>(initialWords);
  const { wordLayouts, onContainerLayout } = useWordPositions(currentWords);

  const animatedPositions = currentWords.map(() => ({
    x: useSharedValue(0),
    y: useSharedValue(0),
  }));

  useAnimatedReaction(
    () => wordLayouts,
    (layouts, prevLayouts) => {
      if (layouts && prevLayouts && layouts.length === prevLayouts.length) {
        for (let i = 0; i < animatedPositions.length; i++) {
          animatedPositions[i].x.value = withSpring(0, animation.spring.default);
          animatedPositions[i].y.value = withSpring(0, animation.spring.default);
        }
      }
    },
    [wordLayouts]
  );

  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const isDragging = useSharedValue(false);
  const draggedIndex = useSharedValue(-1);

  useEffect(() => {
    const shuffled = [...initialWords].sort(() => Math.random() - 0.5);
    setCurrentWords(shuffled);
  }, [initialWords]);

  const handleDragEnd = useCallback((fromIndex: number, toIndex: number) => {
    const newWords = [...currentWords];
    const [movedWord] = newWords.splice(fromIndex, 1);
    newWords.splice(toIndex, 0, movedWord);
    setCurrentWords(newWords);
  }, [currentWords]);

  const handleSubmit = async () => {
    if (isCorrect) return; // Prevent multiple submissions
    const userAnswer = currentWords.join(' ');
    const correct = userAnswer === targetSentence;
    setIsCorrect(correct);

    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowSuccess(true);
      Speech.speak(targetSentence, { language: 'en-US' });
      setTimeout(() => onComplete(true), 1500);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <BaseCard {...baseCardProps} style={styles.cardContainer}>
      {showSuccess && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.lottieOverlay}>
          <LottieSuccess />
        </Animated.View>
      )}
      <View style={styles.header}>
        <Text style={styles.difficultyText}>Difficulty: {difficulty}</Text>
        {hint && <Text style={styles.hintText}>{hint}</Text>}
      </View>

      <View style={styles.sentenceContainer} onLayout={onContainerLayout}>
        {wordLayouts.length > 0 &&
          currentWords.map((word, index) => (
            <DraggableWord
              key={`${word}-${index}`}
              word={word}
              positions={animatedPositions}
              index={index}
              onDragEnd={handleDragEnd}
              wordLayouts={wordLayouts}
              isDragging={isDragging}
              draggedIndex={draggedIndex}
            />
          ))}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          onPress={handleSubmit}
          style={[
            styles.submitButton,
            isCorrect === true && styles.submitButtonCorrect,
            isCorrect === false && styles.submitButtonIncorrect,
          ]}
        >
          <Text style={styles.submitButtonText}>Check Answer</Text>
        </TouchableOpacity>
        <AudioControls text={targetSentence} />
      </View>
    </BaseCard>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  cardContainer: {
    padding: spacing.lg,
    minHeight: 250,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: spacing.md,
  },
  difficultyText: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  hintText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.base,
    fontStyle: 'italic',
  },
  sentenceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    minHeight: SENTENCE_MIN_HEIGHT,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: '100%',
  },
  wordTile: {
    height: WORD_HEIGHT,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    ...shadows.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
  },
  controls: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  submitButton: {
    flex: 1,
    backgroundColor: colors.primary.DEFAULT,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  submitButtonCorrect: {
    backgroundColor: colors.success.DEFAULT,
    ...shadows.glow.success,
  },
  submitButtonIncorrect: {
    backgroundColor: colors.error.DEFAULT,
    ...shadows.glow.error,
  },
  submitButtonText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  lottieOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    borderRadius: borderRadius.xl,
  },
});
