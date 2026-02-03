/**
 * TeleprompterCard - Reading Practice Teleprompter
 *
 * Features:
 * - Plain text auto-scrolling
 * - Gradient fade overlays for reading focus
 * - Speed slider (visible before AND during playback)
 * - Font size toggle (S/M/L)
 * - Practice and Record modes
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';
import { useAudioRecording, type Passage } from '@/lib/reading';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Reading zone position
const READING_ZONE_TOP = SCREEN_HEIGHT * 0.22;

export type TeleprompterMode = 'practice' | 'record';
export type FontSizeOption = 'small' | 'medium' | 'large';

export interface TeleprompterResults {
  duration: number;
  totalWords: number;
  recordingUri?: string;
}

interface TeleprompterCardProps {
  passage: Passage;
  onFinish: (results: TeleprompterResults) => void;
  onBack?: () => void;
}

// Font size configurations
const FONT_SIZES: Record<FontSizeOption, { fontSize: number; lineHeight: number }> = {
  small: { fontSize: 24, lineHeight: 38 },
  medium: { fontSize: 32, lineHeight: 51 },
  large: { fontSize: 40, lineHeight: 64 },
};

// WPM range
const MIN_WPM = 60;
const MAX_WPM = 300;

export function TeleprompterCard({ passage, onFinish, onBack }: TeleprompterCardProps) {
  const insets = useSafeAreaInsets();

  // Audio recording
  const {
    isRecording,
    duration: recordingDuration,
    startRecording,
    stopRecording,
    formatDuration,
  } = useAudioRecording();

  // State
  const [mode, setMode] = useState<TeleprompterMode>('practice');
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [speedNormalized, setSpeedNormalized] = useState(0.5);
  const [fontSizeOption, setFontSizeOption] = useState<FontSizeOption>('medium');

  // Refs - using ref for isPlaying to avoid stale closure in animation
  const isPlayingRef = useRef(false);
  const scrollAnimationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Keep ref in sync with state
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Reanimated values
  const scrollY = useSharedValue(0);
  const progressWidth = useSharedValue(0);

  // Typography from selected font size
  const { fontSize, lineHeight } = FONT_SIZES[fontSizeOption];

  // Calculate current WPM
  const currentWpm = useMemo(() => {
    return Math.round(MIN_WPM + speedNormalized * (MAX_WPM - MIN_WPM));
  }, [speedNormalized]);

  // Total words
  const totalWords = useMemo(() =>
    passage.text.split(/\s+/).filter(w => w.trim().length > 0).length,
    [passage.text]
  );

  // Estimate content height
  const charsPerLine = Math.floor((SCREEN_WIDTH - spacing.xl * 2) / (fontSize * 0.55));
  const estimatedLines = Math.ceil(passage.text.length / charsPerLine);
  const contentHeight = estimatedLines * lineHeight;

  // Max scroll
  const maxScroll = Math.max(0, contentHeight - SCREEN_HEIGHT * 0.3);

  // Calculate scroll speed based on WPM
  const getScrollSpeed = useCallback(() => {
    const wordsPerSecond = currentWpm / 60;
    const avgCharsPerWord = 5;
    const charsPerSecond = wordsPerSecond * avgCharsPerWord;
    const linesPerSecond = charsPerSecond / charsPerLine;
    return linesPerSecond * lineHeight;
  }, [currentWpm, charsPerLine, lineHeight]);

  // Smooth scroll animation - using ref to check playing state
  const startSmoothScroll = useCallback(() => {
    if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current);
    }

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      // Check ref instead of state to avoid stale closure
      if (!isPlayingRef.current) return;

      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const pixelsPerSecond = getScrollSpeed();
      const newScrollY = scrollY.value + (pixelsPerSecond * deltaTime);

      // Update progress
      const progress = maxScroll > 0 ? (newScrollY / maxScroll) * 100 : 0;
      progressWidth.value = Math.min(100, progress);

      if (newScrollY >= maxScroll) {
        scrollY.value = maxScroll;
        progressWidth.value = 100;
        setTimeout(() => {
          runOnJS(handleFinish)();
        }, 1500);
        return;
      }

      scrollY.value = newScrollY;
      scrollAnimationRef.current = requestAnimationFrame(animate);
    };

    scrollAnimationRef.current = requestAnimationFrame(animate);
  }, [getScrollSpeed, maxScroll, scrollY, progressWidth]);

  const stopSmoothScroll = useCallback(() => {
    if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current);
      scrollAnimationRef.current = null;
    }
  }, []);

  // Handle play/pause
  useEffect(() => {
    if (isPlaying) {
      startSmoothScroll();
    } else {
      stopSmoothScroll();
    }
    return () => stopSmoothScroll();
  }, [isPlaying, startSmoothScroll, stopSmoothScroll]);

  // Restart scroll when speed changes during playback
  useEffect(() => {
    if (isPlaying && hasStarted) {
      stopSmoothScroll();
      startSmoothScroll();
    }
  }, [currentWpm]);

  // Pan gesture for manual scroll
  const panStartOffset = useSharedValue(0);
  const panGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      panStartOffset.value = scrollY.value;
    })
    .onUpdate((event) => {
      'worklet';
      const newOffset = panStartOffset.value - event.translationY;
      scrollY.value = Math.max(0, Math.min(maxScroll, newOffset));
    });

  // Animated styles
  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -scrollY.value }],
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  // Handlers
  const handleStart = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    if (mode === 'record') {
      await startRecording();
    }

    startTimeRef.current = Date.now();
    setHasStarted(true);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsPlaying(!isPlaying);
  };

  const handleFinish = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsPlaying(false);

    let result = null;
    if (mode === 'record' && isRecording) {
      result = await stopRecording();
    }

    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);

    onFinish({
      duration: result ? Math.floor(result.duration / 1000) : duration,
      totalWords,
      recordingUri: result?.uri,
    });
  };

  const handleBack = () => {
    if (isRecording) {
      stopRecording();
    }
    stopSmoothScroll();
    onBack?.();
  };

  const cycleFontSize = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const sizes: FontSizeOption[] = ['small', 'medium', 'large'];
    const currentIndex = sizes.indexOf(fontSizeOption);
    const nextIndex = (currentIndex + 1) % sizes.length;
    setFontSizeOption(sizes[nextIndex]);
  };

  const handleSpeedChange = (delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSpeedNormalized(prev => Math.max(0, Math.min(1, prev + delta)));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" hidden={hasStarted} />

      {/* Progress Bar (top) - only during playback */}
      {hasStarted && (
        <Animated.View
          entering={FadeIn.duration(300)}
          style={[styles.progressContainer, { top: insets.top + spacing.sm }]}
        >
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, progressBarStyle]} />
          </View>
        </Animated.View>
      )}

      {/* Main Content - Scrolling Text */}
      <GestureDetector gesture={panGesture}>
        <View style={styles.contentArea}>
          <Animated.View style={[styles.textContent, contentAnimatedStyle]}>
            <View style={{ height: READING_ZONE_TOP }} />
            <Text style={[styles.text, { fontSize, lineHeight }]}>
              {passage.text}
            </Text>
            <View style={{ height: SCREEN_HEIGHT }} />
          </Animated.View>

          {/* Gradient overlays */}
          <LinearGradient
            colors={['#000000', 'transparent']}
            style={[styles.fadeOverlay, styles.fadeTop, { height: READING_ZONE_TOP * 0.7 }]}
            pointerEvents="none"
          />
          <LinearGradient
            colors={['transparent', '#000000']}
            style={[styles.fadeOverlay, styles.fadeBottom]}
            pointerEvents="none"
          />
        </View>
      </GestureDetector>

      {/* Controls Container */}
      <View style={[styles.controlsContainer, { paddingBottom: insets.bottom + spacing.lg }]}>

        {/* Speed Slider - Always visible */}
        <View style={styles.speedSliderContainer}>
          <TouchableOpacity
            onPress={() => handleSpeedChange(-0.1)}
            style={styles.speedIconButton}
          >
            <Ionicons name="walk-outline" size={22} color={colors.text.secondary} />
          </TouchableOpacity>

          <View style={styles.speedTrackContainer}>
            <View style={styles.speedTrack}>
              {/* Tick marks */}
              {Array.from({ length: 21 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.tick,
                    i === 10 && styles.tickCenter,
                    (i === 5 || i === 15) && styles.tickQuarter,
                  ]}
                />
              ))}
            </View>
            {/* Knob */}
            <View
              style={[
                styles.speedKnob,
                { left: `${speedNormalized * 100}%` },
              ]}
            />
          </View>

          <TouchableOpacity
            onPress={() => handleSpeedChange(0.1)}
            style={styles.speedIconButton}
          >
            <Ionicons name="walk" size={22} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* WPM Display */}
        <View style={styles.wpmDisplay}>
          <Text style={styles.wpmValue}>{currentWpm}</Text>
          <Text style={styles.wpmLabel}> WPM</Text>
        </View>

        {/* Control Buttons Row */}
        <View style={styles.controlsRow}>
          {!hasStarted ? (
            // Pre-start controls
            <>
              {/* Back Button */}
              <TouchableOpacity
                onPress={handleBack}
                style={styles.controlButton}
                accessibilityLabel="Go back"
              >
                <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
              </TouchableOpacity>

              {/* Font Size Button */}
              <TouchableOpacity
                onPress={cycleFontSize}
                style={styles.controlButton}
                accessibilityLabel="Change font size"
              >
                <Text style={styles.fontSizeButtonText}>Aa</Text>
                <View style={styles.fontSizeBadge}>
                  <Text style={styles.fontSizeBadgeText}>
                    {fontSizeOption === 'small' ? 'S' : fontSizeOption === 'medium' ? 'M' : 'L'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Mode Toggle */}
              <View style={styles.modeToggle}>
                <TouchableOpacity
                  onPress={() => { setMode('practice'); Haptics.selectionAsync(); }}
                  style={[styles.modeButton, mode === 'practice' && styles.modeButtonActive]}
                >
                  <Text style={[styles.modeText, mode === 'practice' && styles.modeTextActive]}>
                    Practice
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => { setMode('record'); Haptics.selectionAsync(); }}
                  style={[styles.modeButton, mode === 'record' && styles.modeButtonActive]}
                >
                  <Text style={[styles.modeText, mode === 'record' && styles.modeTextActive]}>
                    Record
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Start Button */}
              <TouchableOpacity
                onPress={handleStart}
                style={[styles.startButton, mode === 'record' && styles.startButtonRecord]}
                accessibilityLabel={mode === 'record' ? 'Start recording' : 'Start practice'}
              >
                <Ionicons
                  name={mode === 'record' ? 'mic' : 'play'}
                  size={26}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </>
          ) : (
            // During playback controls
            <>
              {/* Rewind */}
              <TouchableOpacity
                onPress={() => {
                  scrollY.value = Math.max(0, scrollY.value - 150);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={styles.controlButton}
                accessibilityLabel="Rewind"
              >
                <Ionicons name="play-skip-back" size={22} color={colors.text.primary} />
              </TouchableOpacity>

              {/* Font Size */}
              <TouchableOpacity
                onPress={cycleFontSize}
                style={styles.controlButton}
                accessibilityLabel="Change font size"
              >
                <Text style={styles.fontSizeButtonText}>Aa</Text>
                <View style={styles.fontSizeBadge}>
                  <Text style={styles.fontSizeBadgeText}>
                    {fontSizeOption === 'small' ? 'S' : fontSizeOption === 'medium' ? 'M' : 'L'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Play/Pause - Larger center button */}
              <TouchableOpacity
                onPress={handlePlayPause}
                style={[styles.playPauseButton, !isPlaying && styles.playButton]}
                accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={28}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              {/* Forward */}
              <TouchableOpacity
                onPress={() => {
                  scrollY.value = Math.min(maxScroll, scrollY.value + 150);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={styles.controlButton}
                accessibilityLabel="Forward"
              >
                <Ionicons name="play-skip-forward" size={22} color={colors.text.primary} />
              </TouchableOpacity>

              {/* Stop/Finish */}
              <TouchableOpacity
                onPress={handleFinish}
                style={[styles.controlButton, styles.stopButtonSmall]}
                accessibilityLabel="Finish"
              >
                <Ionicons name="stop" size={22} color="#EF4444" />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Recording indicator */}
        {hasStarted && mode === 'record' && isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>{formatDuration(recordingDuration)}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  // Progress Bar
  progressContainer: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 100,
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: 2,
  },

  // Content
  contentArea: {
    flex: 1,
    overflow: 'hidden',
  },
  textContent: {
    paddingHorizontal: spacing.lg,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '400',
  },

  // Fade overlays
  fadeOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  fadeTop: {
    top: 0,
  },
  fadeBottom: {
    bottom: 0,
    height: SCREEN_HEIGHT * 0.4,
  },

  // Controls container
  controlsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },

  // Speed Slider
  speedSliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(40, 40, 40, 0.95)',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  speedIconButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedTrackContainer: {
    flex: 1,
    height: 28,
    justifyContent: 'center',
    position: 'relative',
  },
  speedTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 28,
    paddingHorizontal: 8,
  },
  tick: {
    width: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 0.5,
  },
  tickCenter: {
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  tickQuarter: {
    height: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  speedKnob: {
    position: 'absolute',
    width: 4,
    height: 22,
    backgroundColor: '#FF9500',
    borderRadius: 2,
    marginLeft: -2,
    top: 3,
  },

  // WPM Display
  wpmDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  wpmValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  wpmLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },

  // Controls Row
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(60, 60, 60, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Font size button
  fontSizeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  fontSizeBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: 6,
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontSizeBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Mode toggle
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(60, 60, 60, 0.9)',
    borderRadius: borderRadius.full,
    padding: 3,
  },
  modeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
  },
  modeButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  modeText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  modeTextActive: {
    color: colors.text.primary,
  },

  // Start button
  startButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  startButtonRecord: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },

  // Play/Pause button (during playback)
  playPauseButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(100, 100, 100, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: colors.primary.DEFAULT,
  },

  // Stop button small
  stopButtonSmall: {
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },

  // Recording indicator
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  recordingText: {
    fontSize: typography.fontSize.base,
    color: '#EF4444',
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});

export default TeleprompterCard;
