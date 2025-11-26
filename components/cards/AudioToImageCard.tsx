import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import * as Speech from 'expo-speech';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, animation } from '@/constants/designSystem';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = (width - spacing.xl * 3) / 2;

interface ImageOption {
  id: string;
  url: string;
  label: string;
}

interface AudioToImageCardProps {
  question: string;
  audioText: string;
  language?: string;
  images: ImageOption[];
  correctImageId: string;
  onAnswer?: (isCorrect: boolean) => void;
}

export function AudioToImageCard({
  question,
  audioText,
  language = 'en-US',
  images,
  correctImageId,
  onAnswer,
}: AudioToImageCardProps) {
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = async () => {
    try {
      setIsPlaying(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // TODO: Integrate Google Cloud TTS for better voice quality (see AudioControls.tsx)
      await Speech.speak(audioText, {
        language,
        rate: 1.0,
        onDone: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    }
  };

  const handleImagePress = async (imageId: string) => {
    if (isAnswered) return;

    setSelectedImageId(imageId);
    setIsAnswered(true);

    const isCorrect = imageId === correctImageId;

    // Haptic feedback
    if (isCorrect) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    // Callback
    onAnswer?.(isCorrect);
  };

  const ImageOptionButton = ({ image }: { image: ImageOption }) => {
    const isSelected = selectedImageId === image.id;
    const isCorrect = image.id === correctImageId;
    const showResult = isAnswered && (isSelected || isCorrect);

    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    // Animate on selection
    React.useEffect(() => {
      if (isSelected) {
        if (isCorrect) {
          scale.value = withSpring(1.05, animation.spring.bouncy);
        } else {
          scale.value = withSpring(0.95, animation.spring.default);
        }
      }
    }, [isSelected]);

    const getBorderColor = () => {
      if (!showResult) return colors.border.light;
      return isCorrect ? colors.success.DEFAULT : colors.error.DEFAULT;
    };

    return (
      <Animated.View style={[styles.imageOptionContainer, animatedStyle]}>
        <TouchableOpacity
          onPress={() => handleImagePress(image.id)}
          disabled={isAnswered}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.imageOption,
              {
                borderColor: getBorderColor(),
                borderWidth: showResult ? 3 : 1,
              },
            ]}
          >
            <Image
              source={{ uri: image.url }}
              style={styles.optionImage}
              resizeMode="cover"
            />
            {showResult && (
              <View
                style={[
                  styles.resultOverlay,
                  { backgroundColor: isCorrect ? colors.success.DEFAULT : colors.error.DEFAULT }
                ]}
              >
                <Ionicons
                  name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                  size={40}
                  color={colors.text.primary}
                />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>

      {/* Audio Player */}
      <TouchableOpacity
        onPress={playAudio}
        disabled={isPlaying}
        activeOpacity={0.8}
        style={styles.audioButtonContainer}
      >
        <View
          style={[
            styles.audioButton,
            { backgroundColor: colors.primary.DEFAULT }
          ]}
        >
          <Ionicons
            name={isPlaying ? 'volume-high' : 'play'}
            size={48}
            color={colors.text.primary}
          />
          <Text style={styles.audioButtonText}>
            {isPlaying ? 'Playing...' : 'Tap to listen'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Image Options Grid */}
      <View style={styles.imagesGrid}>
        {images.map((image) => (
          <ImageOptionButton key={image.id} image={image} />
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
  audioButtonContainer: {
    width: '100%',
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    shadowColor: colors.glow.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  audioButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
    width: '100%',
  },
  imageOptionContainer: {
    width: IMAGE_SIZE,
  },
  imageOption: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.background.elevated,
    position: 'relative',
  },
  optionImage: {
    width: '100%',
    height: '100%',
  },
  resultOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
});
