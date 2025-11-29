/**
 * Single Vocabulary Card Component - Redesigned 2025
 *
 * First impression card for introducing new vocabulary with:
 * - Progressive disclosure (reduce cognitive load)
 * - Interactive phonetic bar (tap = normal, long press = slow)
 * - Swipe-to-flip gesture for examples
 * - Micro-celebrations and delightful animations
 * - 3D flip animation
 * - Clear visual hierarchy
 *
 * Design Philosophy:
 * - Single focus per screen (avoid button overload)
 * - Guide user through learning journey
 * - Playful and encouraging (Duolingo-inspired)
 * - Multi-sensory encoding (visual, auditory, textual)
 *
 * UX Research:
 * - Progressive disclosure reduces friction: https://medium.com/@prajapatisuketu/modern-flashcard-app-ui-ux-design-2025-4545294a17b4
 * - Multi-sensory encoding strengthens memory: https://medium.com/@lugaozhu/ux-case-study-creative-cards-a-vocabulary-learning-app-design-f218715ada2c
 * - Playful aesthetics reduce intimidation: https://blog.duolingo.com/shape-language-duolingos-art-style/
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Pressable, PanResponder } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeIn,
  FadeOut,
  ZoomIn,
  BounceIn,
  SlideInRight,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  useSharedValue,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';

interface CardProps {
  onNext: (answer?: any) => void;
}

interface SingleVocabCardProps extends CardProps {
  word?: string;
  translation?: string;
  phonetic?: string;
  image_url?: string;
  audio_url?: string;
  example_sentence?: string;
  example_sentences?: string[]; // Multiple examples
}

export function SingleVocabCard({
  word,
  translation,
  phonetic,
  image_url,
  audio_url,
  example_sentence,
  example_sentences,
  onNext,
}: SingleVocabCardProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [hasRevealed, setHasRevealed] = useState(false); // Track if translation revealed
  const [isFlipped, setIsFlipped] = useState(false); // Track card flip state
  const [showConfetti, setShowConfetti] = useState(false); // Celebration state

  // Animation values
  const buttonScale = useSharedValue(1);
  const phoneticScale = useSharedValue(1);
  const flipRotation = useSharedValue(0);
  const confettiOpacity = useSharedValue(0);
  const translationY = useSharedValue(20);
  const translationOpacity = useSharedValue(0);

  // Combine all example sentences
  const allExamples = example_sentences || (example_sentence ? [example_sentence] : []);

  // Auto-play audio on mount
  useEffect(() => {
    const autoPlay = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await handlePlayAudio('normal');
    };

    autoPlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onNext();
  };

  const handlePlayAudio = async (speed: 'slow' | 'normal') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const playbackRate = speed === 'slow' ? 0.7 : 1.0;

    // Animate phonetic bar
    phoneticScale.value = withSequence(
      withSpring(0.95),
      withSpring(1)
    );

    // If already playing, stop it first
    if (isPlayingAudio && sound) {
      await sound.stopAsync();
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);

    // If audio_url is provided, use expo-av
    if (audio_url) {
      try {
        if (sound) {
          await sound.unloadAsync();
        }

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audio_url },
          { shouldPlay: true, rate: playbackRate, shouldCorrectPitch: true },
          (status) => {
            if (status.isLoaded && status.didJustFinish) {
              setIsPlayingAudio(false);
            }
          }
        );

        setSound(newSound);
      } catch (error) {
        console.error('Error playing audio:', error);
        setIsPlayingAudio(false);

        // Fallback to TTS
        if (word) {
          Speech.speak(word, {
            rate: playbackRate,
            onDone: () => setIsPlayingAudio(false),
            onError: () => setIsPlayingAudio(false),
          });
        }
      }
    } else if (word) {
      // Fallback to expo-speech
      Speech.speak(word, {
        rate: playbackRate,
        onDone: () => setIsPlayingAudio(false),
        onError: () => setIsPlayingAudio(false),
      });
    } else {
      setIsPlayingAudio(false);
    }
  };

  const handleRevealTranslation = () => {
    if (!hasRevealed) {
      setHasRevealed(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Animate translation appearance
      translationY.value = withSpring(0);
      translationOpacity.value = withTiming(1, { duration: 400 });

      // Show confetti celebration
      setShowConfetti(true);
      confettiOpacity.value = withSequence(
        withTiming(1, { duration: 300 }),
        withDelay(1500, withTiming(0, { duration: 300 }))
      );

      setTimeout(() => setShowConfetti(false), 2000);
    }
  };

  const handleFlip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsFlipped(!isFlipped);
    flipRotation.value = withSpring(isFlipped ? 0 : 180, {
      damping: 15,
      stiffness: 80,
    });
  };

  // Swipe gesture handler
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx < -50 && allExamples.length > 0) {
          // Swipe left - flip to examples
          handleFlip();
        } else if (gestureState.dx > 50 && isFlipped) {
          // Swipe right - flip back
          handleFlip();
        }
      },
    })
  ).current;

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const phoneticAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: phoneticScale.value }],
    };
  });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = `${flipRotation.value}deg`;
    return {
      transform: [{ perspective: 1000 }, { rotateY }],
      backfaceVisibility: 'hidden',
    };
  });

  const backCardAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = `${flipRotation.value - 180}deg`;
    return {
      transform: [{ perspective: 1000 }, { rotateY }],
      backfaceVisibility: 'hidden',
    };
  });

  const confettiAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: confettiOpacity.value,
    };
  });

  const translationAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: translationOpacity.value,
      transform: [{ translateY: translationY.value }],
    };
  });

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: spacing['2xl'] }} {...panResponder.panHandlers}>
      {/* Confetti Celebration */}
      {showConfetti && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: '30%',
              left: 0,
              right: 0,
              alignItems: 'center',
              zIndex: 100,
            },
            confettiAnimatedStyle,
          ]}
        >
          <Text style={{ fontSize: 60 }}>🎉</Text>
        </Animated.View>
      )}

      {/* Front Card */}
      <Animated.View
        entering={BounceIn.duration(600).springify()}
        style={[
          {
            width: '100%',
            padding: spacing['2xl'],
            borderRadius: borderRadius['2xl'],
            alignItems: 'center',
            backgroundColor: colors.background.card,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.35,
            shadowRadius: 20,
            elevation: 10,
            position: 'relative',
          },
          cardAnimatedStyle,
          isFlipped && { position: 'absolute', opacity: 0 },
        ]}
      >
        {/* Swipe Hint (subtle visual affordance) */}
        {allExamples.length > 0 && !hasRevealed && (
          <Animated.View
            entering={FadeIn.duration(600).delay(1500)}
            style={{
              position: 'absolute',
              top: spacing.md,
              right: spacing.md,
              backgroundColor: colors.accent.purple + '20',
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs,
              borderRadius: borderRadius.full,
            }}
          >
            <Text style={{ fontSize: typography.fontSize.xs, color: colors.accent.purple }}>
              ← Swipe for examples
            </Text>
          </Animated.View>
        )}

        {/* Hero Image */}
        {image_url && (
          <Animated.View
            entering={ZoomIn.duration(600).delay(200)}
            style={{
              borderRadius: borderRadius['2xl'],
              overflow: 'hidden',
              marginTop: spacing.lg,
              marginBottom: spacing.xl,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Image
              source={{ uri: image_url }}
              style={{
                width: 280,
                height: 280,
                borderRadius: borderRadius.xl,
              }}
              resizeMode="cover"
            />
          </Animated.View>
        )}

        {/* Word */}
        <Animated.Text
          entering={SlideInRight.duration(500).delay(400)}
          style={{
            fontSize: 52,
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            marginBottom: spacing.lg,
            textAlign: 'center',
          }}
        >
          {word}
        </Animated.Text>

        {/* Interactive Phonetic Bar */}
        {phonetic && (
          <Animated.View
            entering={FadeIn.duration(500).delay(600)}
            style={[phoneticAnimatedStyle, { marginBottom: spacing.xl }]}
          >
            <Pressable
              onPress={() => handlePlayAudio('normal')}
              onLongPress={() => handlePlayAudio('slow')}
              delayLongPress={500}
            >
              <LinearGradient
                colors={[colors.accent.purple + 'DD', colors.accent.primary + 'DD']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingHorizontal: spacing.xl,
                  paddingVertical: spacing.md,
                  borderRadius: borderRadius.xl,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                  shadowColor: colors.accent.purple,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.6,
                  shadowRadius: 12,
                  elevation: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: typography.fontSize['2xl'],
                    color: colors.text.primary,
                    fontWeight: typography.fontWeight.medium,
                  }}
                >
                  {phonetic}
                </Text>
                <Text style={{ fontSize: 28 }}>{isPlayingAudio ? '🔊' : '🔉'}</Text>
              </LinearGradient>
            </Pressable>
            <Text
              style={{
                fontSize: typography.fontSize.xs,
                color: colors.text.tertiary,
                textAlign: 'center',
                marginTop: spacing.xs,
              }}
            >
              Tap to hear • Long press for slow
            </Text>
          </Animated.View>
        )}

        {/* Progressive Disclosure - Translation */}
        {translation && (
          <Animated.View
            entering={FadeIn.duration(500).delay(800)}
            style={{
              alignItems: 'center',
              marginBottom: spacing.lg,
            }}
          >
            {!hasRevealed ? (
              // Reveal Button (Primary CTA)
              <TouchableOpacity
                onPress={handleRevealTranslation}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={colors.gradients.success}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingHorizontal: spacing['2xl'],
                    paddingVertical: spacing.lg,
                    borderRadius: borderRadius.xl,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.sm,
                    shadowColor: colors.accent.primary,
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.5,
                    shadowRadius: 12,
                    elevation: 8,
                  }}
                >
                  <Text style={{ fontSize: 24 }}>💡</Text>
                  <Text
                    style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.bold,
                      color: colors.text.primary,
                    }}
                  >
                    Tap to reveal meaning
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              // Revealed Translation with celebration
              <Animated.View style={translationAnimatedStyle}>
                <View
                  style={{
                    backgroundColor: colors.accent.primary + '15',
                    paddingHorizontal: spacing.xl,
                    paddingVertical: spacing.lg,
                    borderRadius: borderRadius.xl,
                    borderWidth: 2,
                    borderColor: colors.accent.primary + '40',
                  }}
                >
                  <Text
                    style={{
                      fontSize: typography.fontSize['2xl'],
                      fontWeight: typography.fontWeight.bold,
                      color: colors.text.primary,
                      textAlign: 'center',
                      marginBottom: spacing.xs,
                    }}
                  >
                    {translation}
                  </Text>
                  <Text
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.accent.primary,
                      textAlign: 'center',
                      fontWeight: typography.fontWeight.medium,
                    }}
                  >
                    Great! Keep going! 🌟
                  </Text>
                </View>
              </Animated.View>
            )}
          </Animated.View>
        )}

        {/* Secondary Tools (appear after reveal) */}
        {hasRevealed && allExamples.length > 0 && (
          <Animated.View
            entering={FadeIn.duration(400).delay(300)}
            style={{ marginTop: spacing.md }}
          >
            <TouchableOpacity
              onPress={handleFlip}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.xs,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderRadius: borderRadius.full,
                backgroundColor: colors.background.elevated,
                borderWidth: 1,
                borderColor: colors.border.light,
              }}
            >
              <Text style={{ fontSize: 18 }}>📚</Text>
              <Text
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary,
                  fontWeight: typography.fontWeight.medium,
                }}
              >
                See {allExamples.length} example{allExamples.length > 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>

      {/* Back Card - Examples */}
      {isFlipped && (
        <Animated.View
          entering={FadeIn.duration(300)}
          style={[
            {
              width: '100%',
              padding: spacing['2xl'],
              borderRadius: borderRadius['2xl'],
              backgroundColor: colors.background.card,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.35,
              shadowRadius: 20,
              elevation: 10,
              minHeight: 400,
            },
            backCardAnimatedStyle,
          ]}
        >
          <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
            <Text
              style={{
                fontSize: typography.fontSize['3xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
                marginBottom: spacing.xs,
              }}
            >
              📚 Usage Examples
            </Text>
            <Text
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.tertiary,
              }}
            >
              See how "{word}" is used
            </Text>
          </View>

          {/* Example Sentences */}
          <View style={{ gap: spacing.lg, marginBottom: spacing.xl }}>
            {allExamples.map((example, index) => (
              <Animated.View
                key={index}
                entering={FadeIn.duration(400).delay(index * 100)}
                style={{
                  backgroundColor: colors.background.elevated,
                  padding: spacing.lg,
                  borderRadius: borderRadius.xl,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.accent.primary,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
                  <Text style={{ fontSize: typography.fontSize.lg, color: colors.accent.purple }}>
                    {index + 1}.
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: typography.fontSize.lg,
                      color: colors.text.secondary,
                      fontStyle: 'italic',
                      lineHeight: 26,
                    }}
                  >
                    "{example}"
                  </Text>
                </View>
              </Animated.View>
            ))}
          </View>

          {/* Flip Back Button */}
          <TouchableOpacity
            onPress={handleFlip}
            activeOpacity={0.7}
            style={{
              alignSelf: 'center',
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.xs,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              borderRadius: borderRadius.full,
              backgroundColor: colors.accent.purple,
              shadowColor: colors.accent.purple,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <Text style={{ fontSize: 20 }}>🔄</Text>
            <Text
              style={{
                fontSize: typography.fontSize.md,
                color: colors.text.primary,
                fontWeight: typography.fontWeight.bold,
              }}
            >
              Back to word
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Continue Button */}
      <Animated.View
        entering={FadeInDown.duration(500).delay(1000)}
        style={{ width: '100%', marginTop: spacing.xl }}
      >
        <Animated.View style={buttonAnimatedStyle}>
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
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.5,
              shadowRadius: 12,
              elevation: 8,
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
              Continue →
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
}
