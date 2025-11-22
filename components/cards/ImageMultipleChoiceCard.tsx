import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { BaseCard } from './BaseCard';
import { colors, typography, spacing, borderRadius, animation } from '@/constants/designSystem';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = width * 0.6;

interface ImageMultipleChoiceCardProps {
  question: string;
  imageUrl: string;
  options: string[];
  correctAnswer: string;
  onAnswer?: (isCorrect: boolean) => void;
}

export function ImageMultipleChoiceCard({
  question,
  imageUrl,
  options,
  correctAnswer,
  onAnswer,
}: ImageMultipleChoiceCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleOptionPress = async (option: string) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === correctAnswer;

    // Haptic feedback
    if (isCorrect) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    // Callback
    onAnswer?.(isCorrect);
  };

  const OptionButton = ({ option }: { option: string }) => {
    const isSelected = selectedOption === option;
    const isCorrect = option === correctAnswer;
    const showResult = isAnswered && (isSelected || isCorrect);

    const scale = useSharedValue(1);
    const translateX = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { scale: scale.value },
        { translateX: translateX.value },
      ],
    }));

    // Animate on selection
    React.useEffect(() => {
      if (isSelected) {
        if (isCorrect) {
          scale.value = withSpring(1.05, animation.spring.bouncy);
        } else {
          // Shake animation for wrong answer
          translateX.value = withSequence(
            withSpring(-10, { damping: 2, stiffness: 200 }),
            withSpring(10, { damping: 2, stiffness: 200 }),
            withSpring(-10, { damping: 2, stiffness: 200 }),
            withSpring(0, { damping: 2, stiffness: 200 })
          );
        }
      }
    }, [isSelected]);

    const getGradient = () => {
      if (!showResult) return colors.gradients.dark;
      return isCorrect ? colors.gradients.success : colors.gradients.error;
    };

    return (
      <Animated.View style={[animatedStyle]}>
        <TouchableOpacity
          onPress={() => handleOptionPress(option)}
          disabled={isAnswered}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={getGradient()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.optionButton}
          >
            <Text style={styles.optionText}>{option}</Text>
            {showResult && (
              <Ionicons
                name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                size={24}
                color={colors.text.primary}
              />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>

      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <OptionButton key={option} option={option} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.lg,
  },
  question: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  imageContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.background.elevated,
    shadowColor: colors.glow.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  optionsContainer: {
    width: '100%',
    gap: spacing.md,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  optionText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
});
