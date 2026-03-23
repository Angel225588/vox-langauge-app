/**
 * TeleprompterCard - Reading Practice Teleprompter
 *
 * Features:
 * - Plain text auto-scrolling
 * - Gradient fade overlays for reading focus
 * - Speed slider (visible before AND during playback)
 * - Font size toggle (S/M/L)
 * - Practice and Record modes
 * - Listen button (ElevenLabs TTS) - hear text read aloud with auto-cleanup on finish/back
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Modal,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';

import { useAudioRecording, type Passage } from '@/lib/reading';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useElevenLabsTTS } from '@/hooks/useElevenLabsTTS';

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
  small: { fontSize: typography.fontSize['2xl'], lineHeight: typography.fontSize['2xl'] * 1.6 },
  medium: { fontSize: typography.fontSize['3xl'], lineHeight: typography.fontSize['3xl'] * 1.6 },
  large: { fontSize: typography.fontSize['4xl'] + 4, lineHeight: (typography.fontSize['4xl'] + 4) * 1.6 },
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

  // TTS for listen mode
  const { speakSequence, stop: stopTTS, isSpeaking: isTTSSpeaking } = useElevenLabsTTS();

  // State
  const [mode, setMode] = useState<TeleprompterMode>('practice');
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [speedNormalized, setSpeedNormalized] = useState(0.5);
  const [fontSizeOption, setFontSizeOption] = useState<FontSizeOption>('medium');
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  // Refs - using ref for isPlaying to avoid stale closure in animation
  const isPlayingRef = useRef(false);
  const scrollAnimationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const handleFinishRef = useRef<(() => Promise<void>) | null>(null);
  const modeRef = useRef<TeleprompterMode>('practice');

  // Keep refs in sync with state
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Reanimated values
  const scrollY = useSharedValue(0);
  const progressWidth = useSharedValue(0);

  // Typography from selected font size
  const { fontSize, lineHeight } = FONT_SIZES[fontSizeOption];

  // Calculate current WPM
  const currentWpm = useMemo(() => {
    return Math.round(MIN_WPM + speedNormalized * (MAX_WPM - MIN_WPM));
  }, [speedNormalized]);

  const handleListenToggle = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isTTSSpeaking) {
      await stopTTS();
    } else {
      const paragraphs = passage.text.split('\n\n').filter(p => p.trim());
      const items = paragraphs.map(p => ({ text: p.trim() }));
      // Match TTS speed to scroll speed: 60 WPM → 0.5x, 150 WPM → 1.0x, 300 WPM → 2.0x
      const rate = Math.max(0.5, Math.min(2.0, currentWpm / 150));

      // Pre-compute character proportions for scroll sync
      const totalChars = paragraphs.reduce((sum, p) => sum + p.length, 0);

      // Scroll sync: when TTS starts a paragraph, scroll proportionally
      const onParagraphStart = (index: number) => {
        if (totalChars === 0 || maxScroll <= 0) return;

        // Calculate proportion of text before this paragraph
        let charsBefore = 0;
        for (let i = 0; i < index; i++) {
          charsBefore += paragraphs[i].length;
        }
        const proportion = charsBefore / totalChars;
        const targetY = Math.min(Math.round(proportion * maxScroll), maxScroll);

        scrollY.value = withTiming(targetY, { duration: 500 });
        progressWidth.value = withTiming(Math.min(100, proportion * 100), { duration: 500 });
      };

      try {
        // Pause manual auto-scroll while TTS drives position
        setIsPlaying(false);
        await speakSequence(items, onParagraphStart, rate);
      } catch {
        // TTS error — handled by hook
      }
    }
  }, [isTTSSpeaking, stopTTS, speakSequence, passage.text, currentWpm, maxScroll, scrollY, progressWidth]);

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
        isPlayingRef.current = false;
        if (modeRef.current === 'practice') {
          // Practice mode done — show switch-to-record modal
          setTimeout(() => {
            setIsPlaying(false);
            setShowSwitchModal(true);
          }, 800);
        } else {
          // Record mode done — finish and get results
          setTimeout(() => {
            handleFinishRef.current?.();
          }, 1500);
        }
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
    await stopTTS();

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

  // Keep handleFinishRef in sync to avoid stale closures in scroll animation
  useEffect(() => {
    handleFinishRef.current = handleFinish;
  });

  // Switch from practice to record mode
  const handleSwitchToRecord = useCallback(async () => {
    setShowSwitchModal(false);
    await stopTTS();

    // Reset scroll to beginning
    scrollY.value = 0;
    progressWidth.value = 0;
    setMode('record');

    // Brief pause for mode to update, then start recording
    setTimeout(async () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await startRecording();
      startTimeRef.current = Date.now();
      setHasStarted(true);
      setIsPlaying(true);
    }, 500);
  }, [scrollY, progressWidth, startRecording, stopTTS]);

  const handleKeepPracticing = useCallback(() => {
    setShowSwitchModal(false);
    // Reset scroll to beginning so user can practice again
    scrollY.value = 0;
    progressWidth.value = 0;
    setHasStarted(false);
    setIsPlaying(false);
  }, [scrollY, progressWidth]);

  const handleBack = () => {
    if (isRecording) {
      stopRecording();
    }
    stopSmoothScroll();
    stopTTS();
    onBack?.();
  };

  const cycleFontSize = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const sizes: FontSizeOption[] = ['small', 'medium', 'large'];
    const currentIndex = sizes.indexOf(fontSizeOption);
    const nextIndex = (currentIndex + 1) % sizes.length;
    setFontSizeOption(sizes[nextIndex]);
  };

  // Draggable speed slider with haptic ticks every 5 WPM
  const lastTickWpm = useRef(currentWpm);
  const speedTrackWidth = useRef(0);
  const speedPanStartX = useRef(0);
  const speedPanStartNormalized = useRef(0);

  const onSpeedTouchStart = useCallback((e: any) => {
    speedPanStartX.current = e.nativeEvent.pageX;
    speedPanStartNormalized.current = speedNormalized;
  }, [speedNormalized]);

  const onSpeedTouchMove = useCallback((e: any) => {
    if (speedTrackWidth.current <= 0) return;
    const dx = e.nativeEvent.pageX - speedPanStartX.current;
    const delta = dx / speedTrackWidth.current;
    const newNormalized = Math.max(0, Math.min(1, speedPanStartNormalized.current + delta));
    const newWpm = Math.round(MIN_WPM + newNormalized * (MAX_WPM - MIN_WPM));

    // Haptic tick every 5 WPM
    const lastStep = Math.floor(lastTickWpm.current / 5);
    const newStep = Math.floor(newWpm / 5);
    if (newStep !== lastStep) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      lastTickWpm.current = newWpm;
    }

    setSpeedNormalized(newNormalized);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" hidden={hasStarted} />

      {/* Back Button - Top Left (always visible) */}
      <TouchableOpacity
        onPress={handleBack}
        style={[styles.topCornerButton, styles.topLeftButton, { top: insets.top + spacing.sm }]}
        accessibilityLabel="Go back"
      >
        <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
      </TouchableOpacity>

      {/* Listen Button - Top Right below tag (always visible) */}
      <TouchableOpacity
        onPress={handleListenToggle}
        style={[
          styles.topCornerButton,
          styles.topRightButton,
          { top: insets.top + spacing.sm },
          isTTSSpeaking && styles.listenButtonActive,
        ]}
        accessibilityLabel={isTTSSpeaking ? 'Stop listening' : 'Listen to text'}
      >
        <Ionicons
          name={isTTSSpeaking ? 'volume-high' : 'volume-medium-outline'}
          size={18}
          color={isTTSSpeaking ? colors.secondary.DEFAULT : colors.text.primary}
        />
      </TouchableOpacity>

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
            colors={[colors.background.primary, 'transparent']}
            style={[styles.fadeOverlay, styles.fadeTop, { height: READING_ZONE_TOP * 0.7 }]}
            pointerEvents="none"
          />
          <LinearGradient
            colors={['transparent', colors.background.primary]}
            style={[styles.fadeOverlay, styles.fadeBottom]}
            pointerEvents="none"
          />
        </View>
      </GestureDetector>

      {/* Controls Container */}
      <View style={[styles.controlsContainer, { paddingBottom: insets.bottom + spacing.lg }]}>

        {/* Speed Slider - Draggable with haptic ticks */}
        <View style={styles.speedSliderContainer}>
          <View style={styles.speedIconButton}>
            <Ionicons name="walk-outline" size={22} color={colors.text.secondary} />
          </View>

          <View
            style={styles.speedTrackContainer}
            onLayout={(e) => { speedTrackWidth.current = e.nativeEvent.layout.width; }}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderGrant={onSpeedTouchStart}
            onResponderMove={onSpeedTouchMove}
          >
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

          <View style={styles.speedIconButton}>
            <Ionicons name="walk" size={22} color={colors.text.secondary} />
          </View>
        </View>

        {/* WPM Display */}
        <View style={styles.wpmDisplay}>
          <Text style={styles.wpmValue}>{currentWpm}</Text>
          <Text style={styles.wpmLabel}> WPM</Text>
        </View>

        {/* Control Buttons Row */}
        <View style={styles.controlsRow}>
          {/* Mode Toggle - Always Visible */}
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

          {!hasStarted ? (
            // Pre-start controls
            <>
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

              {/* Start Button */}
              <TouchableOpacity
                onPress={handleStart}
                style={[styles.startButton, mode === 'record' && styles.startButtonRecord]}
                accessibilityLabel={mode === 'record' ? 'Start recording' : 'Start practice'}
              >
                <Ionicons
                  name={mode === 'record' ? 'mic' : 'play'}
                  size={26}
                  color={colors.text.primary}
                />
              </TouchableOpacity>
            </>
          ) : (
            // During playback controls: Mode | Aa | Play/Pause | Stop (record only)
            <>
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
                  color={colors.text.primary}
                />
              </TouchableOpacity>

              {/* Stop/Finish - Only in record mode */}
              {mode === 'record' && (
                <TouchableOpacity
                  onPress={handleFinish}
                  style={[styles.controlButton, styles.stopButtonSmall]}
                  accessibilityLabel="Finish"
                >
                  <Ionicons name="stop" size={22} color={colors.error.DEFAULT} />
                </TouchableOpacity>
              )}
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

      {/* Switch to Record Modal */}
      <Modal
        visible={showSwitchModal}
        transparent
        animationType="fade"
        onRequestClose={handleKeepPracticing}
      >
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeIn.duration(300)} style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <Ionicons name="mic" size={28} color={colors.text.primary} />
            </View>
            <Text style={styles.modalTitle}>Nice practice run!</Text>
            <Text style={styles.modalSubtitle}>
              Now record your reading to get pronunciation feedback.
            </Text>

            <TouchableOpacity
              onPress={handleSwitchToRecord}
              activeOpacity={0.85}
              style={styles.modalPrimaryButton}
            >
              <LinearGradient
                colors={[colors.error.DEFAULT, '#FF6B6B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalPrimaryGradient}
              >
                <Ionicons name="mic" size={18} color={colors.text.primary} />
                <Text style={styles.modalPrimaryText}>Start Recording</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleKeepPracticing}
              style={styles.modalSecondaryButton}
            >
              <Text style={styles.modalSecondaryText}>Keep Practicing</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    position: 'relative',
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
    borderRadius: 2,  // Intentionally tiny for thin progress bar
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: 2,  // Intentionally tiny for thin progress bar
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
    color: colors.text.primary,
    fontWeight: typography.fontWeight.normal,
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
    backgroundColor: colors.background.elevated + 'F2', // 95% opacity
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
    paddingHorizontal: spacing.sm,
  },
  tick: {
    width: 1,
    height: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 1, // Intentionally tiny for 1px tick marks
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
    width: spacing.xs,
    height: 22,
    backgroundColor: colors.accent.orange,
    borderRadius: 2, // Intentionally tiny for narrow knob
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
    backgroundColor: colors.background.card + 'E6', // 90% opacity
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Font size button
  fontSizeButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  fontSizeBadge: {
    position: 'absolute',
    bottom: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: borderRadius.sm,
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontSizeBadgeText: {
    fontSize: 8, // Intentionally tiny for badge inside 14x14 container
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },

  // Mode toggle
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.background.card + 'E6', // 90% opacity
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
    fontWeight: typography.fontWeight.medium,
  },
  modeTextActive: {
    color: colors.text.primary,
  },

  // Start button
  startButton: {
    width: 56,
    height: 56,
    borderRadius: borderRadius['2xl'],
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
    backgroundColor: colors.error.DEFAULT,
    shadowColor: colors.error.DEFAULT,
  },

  // Play/Pause button (during playback)
  playPauseButton: {
    width: 56,
    height: 56,
    borderRadius: borderRadius['2xl'],
    backgroundColor: colors.background.elevated + 'E6', // 90% opacity
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: colors.primary.DEFAULT,
  },

  // Listen button active state
  listenButtonActive: {
    backgroundColor: colors.secondary.DEFAULT + '25',
    borderWidth: 1,
    borderColor: colors.secondary.DEFAULT + '50',
  },

  // Stop button small
  stopButtonSmall: {
    borderWidth: 1,
    borderColor: colors.error.DEFAULT + '4D', // 30% opacity
  },

  // Top corner buttons (Back + Listen)
  topCornerButton: {
    position: 'absolute',
    zIndex: 101,
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.card + 'CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topLeftButton: {
    left: spacing.lg,
  },
  topRightButton: {
    right: spacing.lg,
  },

  // Switch modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  modalCard: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    maxWidth: 320,
  },
  modalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.base * 1.5,
    marginBottom: spacing.xl,
  },
  modalPrimaryButton: {
    width: '100%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  modalPrimaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  modalPrimaryText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  modalSecondaryButton: {
    paddingVertical: spacing.md,
  },
  modalSecondaryText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.medium,
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
    borderRadius: borderRadius.full,
    backgroundColor: colors.error.DEFAULT,
  },
  recordingText: {
    fontSize: typography.fontSize.base,
    color: colors.error.DEFAULT,
    fontWeight: typography.fontWeight.semibold,
    fontVariant: ['tabular-nums'],
  },
});

export default TeleprompterCard;
