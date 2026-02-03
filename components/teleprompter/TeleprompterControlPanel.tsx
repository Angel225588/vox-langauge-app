/**
 * TeleprompterControlPanel
 *
 * Bottom control bar with:
 * - Font size toggle (TT)
 * - Previous section (|<)
 * - Play/Pause (>||)
 * - Next section (>|)
 * - Settings (gear)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type FontSize = 'small' | 'medium' | 'large';

export interface ControlPanelProps {
  // Playback
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;

  // Font Size
  fontSize: FontSize;
  onFontSizeChange: (size: FontSize) => void;

  // Settings
  onSettings: () => void;

  // State
  disabled?: boolean;
}

const FONT_SIZE_CYCLE: FontSize[] = ['small', 'medium', 'large'];

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function TeleprompterControlPanel({
  isPlaying,
  onPlayPause,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  fontSize,
  onFontSizeChange,
  onSettings,
  disabled = false,
}: ControlPanelProps) {
  const playScale = useSharedValue(1);

  const handlePlayPause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    playScale.value = withSpring(0.9, {}, () => {
      playScale.value = withSpring(1);
    });
    onPlayPause();
  };

  const handleFontSizeToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const currentIndex = FONT_SIZE_CYCLE.indexOf(fontSize);
    const nextIndex = (currentIndex + 1) % FONT_SIZE_CYCLE.length;
    onFontSizeChange(FONT_SIZE_CYCLE[nextIndex]);
  };

  const handlePrevious = () => {
    if (!canGoPrevious) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPrevious();
  };

  const handleNext = () => {
    if (!canGoNext) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNext();
  };

  const handleSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSettings();
  };

  const playButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playScale.value }],
  }));

  const getFontSizeIndicator = () => {
    switch (fontSize) {
      case 'small': return 'S';
      case 'medium': return 'M';
      case 'large': return 'L';
    }
  };

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <BlurView intensity={60} tint="dark" style={styles.blur}>
        <View style={styles.controls}>
          {/* Font Size Toggle */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleFontSizeToggle}
            disabled={disabled}
          >
            <View style={styles.fontSizeButton}>
              <Text style={styles.fontSizeIcon}>TT</Text>
              <View style={styles.fontSizeIndicator}>
                <Text style={styles.fontSizeIndicatorText}>{getFontSizeIndicator()}</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Previous */}
          <TouchableOpacity
            style={[styles.controlButton, !canGoPrevious && styles.controlButtonDisabled]}
            onPress={handlePrevious}
            disabled={disabled || !canGoPrevious}
          >
            <Ionicons
              name="play-skip-back"
              size={22}
              color={canGoPrevious ? colors.text.primary : colors.text.disabled}
            />
          </TouchableOpacity>

          {/* Play/Pause - Main button */}
          <AnimatedTouchable
            style={[styles.playButton, playButtonStyle]}
            onPress={handlePlayPause}
            disabled={disabled}
            activeOpacity={0.8}
          >
            <View style={styles.playButtonInner}>
              {isPlaying ? (
                <View style={styles.pauseIcon}>
                  <View style={styles.pauseBar} />
                  <View style={styles.pauseBar} />
                </View>
              ) : (
                <Ionicons name="play" size={28} color={colors.text.primary} style={styles.playIcon} />
              )}
            </View>
          </AnimatedTouchable>

          {/* Next */}
          <TouchableOpacity
            style={[styles.controlButton, !canGoNext && styles.controlButtonDisabled]}
            onPress={handleNext}
            disabled={disabled || !canGoNext}
          >
            <Ionicons
              name="play-skip-forward"
              size={22}
              color={canGoNext ? colors.text.primary : colors.text.disabled}
            />
          </TouchableOpacity>

          {/* Settings */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleSettings}
            disabled={disabled}
          >
            <Ionicons name="settings-outline" size={22} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginHorizontal: spacing.md,
  },
  disabled: {
    opacity: 0.5,
  },
  blur: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Control Button (generic)
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonDisabled: {
    opacity: 0.4,
  },

  // Font Size Button
  fontSizeButton: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontSizeIcon: {
    fontSize: 18,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  fontSizeIndicator: {
    position: 'absolute',
    bottom: -4,
    right: -8,
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
  },
  fontSizeIndicatorText: {
    fontSize: 9,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },

  // Play/Pause Button (larger, center)
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.glow.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  playButtonInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    marginLeft: 4, // Visual centering for play triangle
  },
  pauseIcon: {
    flexDirection: 'row',
    gap: 6,
  },
  pauseBar: {
    width: 5,
    height: 22,
    backgroundColor: colors.text.primary,
    borderRadius: 2,
  },
});

export default TeleprompterControlPanel;
