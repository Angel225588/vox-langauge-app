import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing } from '@/constants/designSystem';

interface AudioControlsProps {
  text: string;
  language?: string;
  variant?: 'horizontal' | 'vertical';
  size?: 'small' | 'medium' | 'large';
}

export function AudioControls({
  text,
  language = 'en-US',
  variant = 'horizontal',
  size = 'medium',
}: AudioControlsProps) {
  const [isPlayingNormal, setIsPlayingNormal] = useState(false);
  const [isPlayingSlow, setIsPlayingSlow] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const buttonSizes = {
    small: 40,
    medium: 56,
    large: 72,
  };

  const iconSizes = {
    small: 20,
    medium: 28,
    large: 36,
  };

  const playAudio = async (speed: 'normal' | 'slow') => {
    try {
      // Haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const isNormal = speed === 'normal';
      const setIsPlaying = isNormal ? setIsPlayingNormal : setIsPlayingSlow;

      setIsPlaying(true);

      // Stop any currently playing sound
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      // Use Google Cloud TTS API
      // For now, using a placeholder - you'll need to integrate Google Cloud TTS
      const rate = speed === 'normal' ? 1.0 : 0.75;

      // TODO: Integrate Google Cloud Text-to-Speech API for production
      // Current: Using expo-speech as temporary solution (works offline but limited voices)
      // Future: Implement getGoogleTTS(text, language, rate) for better quality voices
      // const audioUrl = await getGoogleTTS(text, language, rate);
      await Speech.speak(text, {
        language,
        rate: speed === 'normal' ? 1.0 : 0.7,
        onDone: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });

    } catch (error) {
      console.error('Error playing audio:', error);
      const setIsPlaying = speed === 'normal' ? setIsPlayingNormal : setIsPlayingSlow;
      setIsPlaying(false);
    }
  };

  const AudioButton = ({
    speed,
    isPlaying,
    label
  }: {
    speed: 'normal' | 'slow';
    isPlaying: boolean;
    label: string;
  }) => {
    const gradient = speed === 'normal'
      ? colors.gradients.secondary
      : colors.gradients.primary;

    return (
      <TouchableOpacity
        onPress={() => playAudio(speed)}
        disabled={isPlaying}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.button,
            {
              width: buttonSizes[size],
              height: buttonSizes[size],
              borderRadius: borderRadius.md,
              backgroundColor: speed === 'normal' ? colors.secondary.DEFAULT : colors.primary.DEFAULT
            },
          ]}
        >
          {isPlaying ? (
            <ActivityIndicator color={colors.text.primary} size="small" />
          ) : (
            <Ionicons
              name={speed === 'normal' ? 'play' : 'play-forward'}
              size={iconSizes[size]}
              color={colors.text.primary}
            />
          )}
        </View>
        {/* Optional: Add speed label below
        <Text style={styles.label}>{label}</Text>
        */}
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.container,
        variant === 'vertical' ? styles.vertical : styles.horizontal,
      ]}
    >
      <AudioButton speed="slow" isPlaying={isPlayingSlow} label="0.7x" />
      <AudioButton speed="normal" isPlaying={isPlayingNormal} label="1.0x" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  horizontal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vertical: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.glow.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  label: {
    marginTop: spacing.xs,
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: '600',
  },
});
