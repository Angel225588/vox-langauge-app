/**
 * TeleprompterCard - Premium Redesign
 *
 * An immersive, distraction-free reading experience inspired by:
 * - Spotify Karaoke (elegant word highlighting, minimal controls)
 * - Claude/Perplexity (clean, spacious, premium feel)
 * - Your design system (dark neomorphic, indigo accents)
 *
 * Key Design Decisions:
 * - Full-screen immersive text (no headers/tabs during reading)
 * - Subtle progress bar at top
 * - Tap anywhere to show/hide controls
 * - Elegant word-by-word or line highlighting
 * - Floating minimal controls
 * - No emojis - clean icons only
 *
 * @example
 * ```tsx
 * <TeleprompterCard
 *   passage={selectedPassage}
 *   onFinish={(results) => handleFinish(results)}
 *   onBack={() => router.back()}
 * />
 * ```
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  LayoutChangeEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeIn,
  FadeInUp,
  SlideInDown,
  runOnJS,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';
import { useAudioRecording, type Passage } from '@/lib/reading';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '@/components/ui/BackButton';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Reading zone - centered vertically for optimal reading
const READING_ZONE_TOP = SCREEN_HEIGHT * 0.35;

export type TeleprompterMode = 'practice' | 'record';

// Types used by TeleprompterControls and TeleprompterSettings
export type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';
export type FontSize = 'small' | 'medium' | 'large';
export type ScrollSpeed = 'slow' | 'medium' | 'fast';

export interface TeleprompterResults {
  duration: number;
  totalWords: number;
  linesRead: number;
  recordingUri?: string;
}

interface TeleprompterCardProps {
  passage: Passage;
  onFinish: (results: TeleprompterResults) => void;
  onBack?: () => void;
}

// Speed configurations (no emojis)
const SPEED_CONFIGS = [
  { label: '0.5x', wpm: 80 },
  { label: '0.75x', wpm: 110 },
  { label: '1x', wpm: 140 },
  { label: '1.25x', wpm: 175 },
  { label: '1.5x', wpm: 210 },
  { label: '2x', wpm: 280 },
];

export function TeleprompterCard({ passage, onFinish, onBack }: TeleprompterCardProps) {
  const insets = useSafeAreaInsets();

  // Audio recording
  const {
    isRecording,
    isPaused: isRecordingPaused,
    duration: recordingDuration,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    formatDuration,
  } = useAudioRecording();

  // State
  const [mode, setMode] = useState<TeleprompterMode>('record');
  const [speedIndex, setSpeedIndex] = useState(2); // Default 1x
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  // Actual measured content height (updated after layout)
  const [actualContentHeight, setActualContentHeight] = useState(0);

  // Refs
  const scrollAnimationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const finishDelayRef = useRef<NodeJS.Timeout | null>(null);
  const hasReachedEnd = useRef(false);

  // Reanimated values
  const scrollY = useSharedValue(0);
  const manualScrollOffset = useSharedValue(0);
  const controlsOpacity = useSharedValue(1);
  const progressWidth = useSharedValue(0);
  const isManualScrolling = useSharedValue(false);
  const maxScrollShared = useSharedValue(0);

  // Typography
  const fontSize = 28;
  const lineHeight = fontSize * 2.0;
  const totalLineHeight = lineHeight + spacing.lg;

  // Split text into paragraphs/lines (let text wrap naturally)
  const lines = useMemo(() => {
    return passage.text.split(/\n+/).filter(line => line.trim().length > 0);
  }, [passage.text]);

  const totalLines = lines.length;
  const totalWords = useMemo(() =>
    passage.text.split(/\s+/).filter(w => w.trim().length > 0).length,
    [passage.text]
  );

  // Estimate total content height (paragraphs * estimated height per paragraph)
  // We estimate each paragraph may wrap to ~2 lines on average
  const estimatedContentHeight = useMemo(() => {
    // Estimate chars per visual line based on screen width and font size
    const charsPerLine = Math.floor(SCREEN_WIDTH / (fontSize * 0.55));
    let totalHeight = 0;

    lines.forEach(line => {
      // Estimate how many visual lines this paragraph will wrap to
      const visualLines = Math.max(1, Math.ceil(line.length / charsPerLine));
      // First line gets full spacing, additional wrapped lines just get lineHeight
      totalHeight += totalLineHeight + (visualLines - 1) * lineHeight;
    });

    return totalHeight;
  }, [lines, fontSize, totalLineHeight, lineHeight]);

  // Use actual measured height if available, otherwise use estimate
  const totalContentHeight = actualContentHeight > 0 ? actualContentHeight : estimatedContentHeight;

  // Handle content layout to get actual height
  const handleContentLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0 && Math.abs(height - actualContentHeight) > 10) {
      setActualContentHeight(height);
    }
  }, [actualContentHeight]);

  // Calculate max scroll - allow scrolling until last line reaches reading zone
  const maxScroll = useMemo(() => {
    // maxScroll = total content height - one line height (so last line reaches top)
    return Math.max(0, totalContentHeight - totalLineHeight);
  }, [totalContentHeight, totalLineHeight]);

  // Sync maxScroll to shared value for worklet access
  useEffect(() => {
    maxScrollShared.value = maxScroll;
  }, [maxScroll]);

  // Calculate scroll speed based on WPM
  const getScrollSpeed = useCallback(() => {
    const wpm = SPEED_CONFIGS[speedIndex].wpm;
    const wordsPerSecond = wpm / 60;
    const avgWordsPerLine = Math.max(1, totalWords / totalLines);
    const linesPerSecond = wordsPerSecond / avgWordsPerLine;
    return linesPerSecond * totalLineHeight;
  }, [speedIndex, totalWords, totalLines, totalLineHeight]);

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying && hasStarted) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        controlsOpacity.value = withTiming(0, { duration: 300 });
      }, 3000);
    }
  }, [isPlaying, hasStarted, controlsOpacity]);

  // Toggle controls visibility
  const toggleControls = useCallback(() => {
    if (!hasStarted) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newValue = !showControls;
    setShowControls(newValue);
    controlsOpacity.value = withTiming(newValue ? 1 : 0, { duration: 200 });

    if (newValue) {
      resetControlsTimeout();
    }
  }, [showControls, hasStarted, controlsOpacity, resetControlsTimeout]);

  // Smooth scroll animation
  const startSmoothScroll = useCallback(() => {
    if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current);
    }

    const targetMaxScroll = maxScroll;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      if (!isPlaying) return;

      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const pixelsPerSecond = getScrollSpeed();
      const newScrollY = scrollY.value + (pixelsPerSecond * deltaTime);

      // Update progress - handle division by zero
      const progress = targetMaxScroll > 0 ? (newScrollY / targetMaxScroll) * 100 : 0;
      progressWidth.value = Math.min(100, progress);

      if (newScrollY >= targetMaxScroll) {
        scrollY.value = targetMaxScroll;
        progressWidth.value = 100;

        // Add delay before finishing to let user read the last line
        if (!hasReachedEnd.current) {
          hasReachedEnd.current = true;
          const lastLineWords = lines[lines.length - 1]?.split(/\s+/).length || 5;
          const wpm = SPEED_CONFIGS[speedIndex].wpm;
          const readingTime = (lastLineWords / wpm) * 60 * 1000;
          const finishDelay = Math.min(Math.max(readingTime + 1500, 3000), 6000);

          finishDelayRef.current = setTimeout(() => {
            runOnJS(handleFinish)();
          }, finishDelay);
        }
        return;
      }

      scrollY.value = newScrollY;
      manualScrollOffset.value = newScrollY;
      scrollAnimationRef.current = requestAnimationFrame(animate);
    };

    scrollAnimationRef.current = requestAnimationFrame(animate);
  }, [getScrollSpeed, maxScroll, isPlaying, scrollY, progressWidth, manualScrollOffset, lines, speedIndex]);

  const stopSmoothScroll = useCallback(() => {
    if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current);
      scrollAnimationRef.current = null;
    }
  }, []);

  // Track current line based on scroll position
  const updateCurrentLine = useCallback((scroll: number) => {
    // Simple calculation: which paragraph are we at based on scroll position
    // This is an approximation since paragraphs have variable heights
    const lineIndex = Math.floor(scroll / totalLineHeight);
    const clampedIndex = Math.max(0, Math.min(lineIndex, totalLines - 1));
    setCurrentLineIndex(clampedIndex);
  }, [totalLineHeight, totalLines]);

  // Track current line using animated reaction
  useAnimatedReaction(
    () => scrollY.value,
    (currentScroll) => {
      runOnJS(updateCurrentLine)(currentScroll);
    },
    []
  );

  // Handle play/pause/start
  useEffect(() => {
    if (isPlaying) {
      startSmoothScroll();
      resetControlsTimeout();
    } else {
      stopSmoothScroll();
    }

    return () => stopSmoothScroll();
  }, [isPlaying, startSmoothScroll, stopSmoothScroll, resetControlsTimeout]);

  // Restart scroll when speed changes during playback
  useEffect(() => {
    if (isPlaying && hasStarted) {
      stopSmoothScroll();
      startSmoothScroll();
    }
  }, [speedIndex]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (finishDelayRef.current) {
        clearTimeout(finishDelayRef.current);
      }
    };
  }, []);

  // Pan gesture for manual scrolling
  const panStartOffset = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      isManualScrolling.value = true;
      panStartOffset.value = scrollY.value;
    })
    .onUpdate((event) => {
      'worklet';
      const newOffset = panStartOffset.value - event.translationY;
      manualScrollOffset.value = Math.max(0, Math.min(maxScrollShared.value, newOffset));
    })
    .onEnd(() => {
      'worklet';
      isManualScrolling.value = false;
      scrollY.value = manualScrollOffset.value;
    });

  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      'worklet';
      runOnJS(toggleControls)();
    });

  const composedGesture = Gesture.Simultaneous(panGesture, tapGesture);

  // Animated styles
  const contentAnimatedStyle = useAnimatedStyle(() => {
    const currentScroll = isManualScrolling.value ? manualScrollOffset.value : scrollY.value;
    return {
      transform: [{ translateY: -currentScroll }],
    };
  });

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const controlsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: controlsOpacity.value,
    pointerEvents: controlsOpacity.value > 0.5 ? 'auto' : 'none',
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
    resetControlsTimeout();
  };

  const handlePlayPause = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isPlaying) {
      setIsPlaying(false);
      if (mode === 'record' && isRecording && !isRecordingPaused) {
        await pauseRecording();
      }
    } else {
      setIsPlaying(true);
      if (mode === 'record' && isRecording && isRecordingPaused) {
        await resumeRecording();
      }
    }
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
      linesRead: currentLineIndex + 1,
      recordingUri: result?.uri,
    });
  };

  const handleStop = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await handleFinish();
  };

  const handleBack = () => {
    if (isRecording) {
      stopRecording();
    }
    stopSmoothScroll();
    onBack?.();
  };

  const handleSpeedChange = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSpeedIndex(index);
  };

  const handleModeChange = (newMode: TeleprompterMode) => {
    if (hasStarted) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMode(newMode);
  };

  // Render line with highlighting - Professional teleprompter style
  const renderLine = useCallback((line: string, lineIndex: number) => {
    const isCurrentLine = lineIndex === currentLineIndex;
    const isPastLine = lineIndex < currentLineIndex;
    const isFutureLine = lineIndex > currentLineIndex;
    const distance = Math.abs(lineIndex - currentLineIndex);

    // Professional teleprompter opacity:
    // - Current line: full brightness (reading zone)
    // - Past lines (above): moderate visibility for reference
    // - Future lines (below): progressive fade for "upcoming" effect
    let opacity = 1;
    if (isCurrentLine) {
      opacity = 1;
    } else if (isPastLine) {
      opacity = distance === 1 ? 0.5 : 0.35;
    } else if (isFutureLine) {
      if (distance === 1) {
        opacity = 0.6;
      } else if (distance === 2) {
        opacity = 0.4;
      } else if (distance === 3) {
        opacity = 0.25;
      } else {
        opacity = 0.15;
      }
    }

    return (
      <View
        key={lineIndex}
        style={[
          styles.lineContainer,
          { minHeight: totalLineHeight },
        ]}
      >
        <Text
          style={[
            styles.lineText,
            {
              fontSize,
              lineHeight,
              opacity,
              color: isCurrentLine ? colors.text.primary : colors.text.secondary,
              fontWeight: isCurrentLine ? '600' : '400',
            },
          ]}
        >
          {line}
        </Text>
        {/* Subtle glow for current line */}
        {isCurrentLine && (
          <LinearGradient
            colors={['transparent', 'rgba(99, 102, 241, 0.08)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.lineGlow}
          />
        )}
      </View>
    );
  }, [currentLineIndex, fontSize, lineHeight, totalLineHeight]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" hidden={hasStarted && !showControls} />

      {/* Background */}
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary, '#0D1220']}
        style={StyleSheet.absoluteFill}
      />

      {/* Progress Bar (top) */}
      {hasStarted && (
        <Animated.View
          entering={FadeIn.duration(300)}
          style={[styles.progressContainer, { top: insets.top }]}
        >
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, progressBarStyle]} />
          </View>
        </Animated.View>
      )}

      {/* Recording Indicator */}
      {mode === 'record' && isRecording && (
        <Animated.View
          entering={FadeIn.duration(200)}
          style={[styles.recordingIndicator, { top: insets.top + spacing.lg }]}
        >
          <View style={styles.recordingDot} />
          <Text style={styles.recordingTime}>{formatDuration(recordingDuration)}</Text>
        </Animated.View>
      )}

      {/* Main Content - Gesture for manual scroll + tap to toggle controls */}
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={styles.contentArea}>
          {/* Scrolling Text */}
          <View style={styles.textContainer}>
            <Animated.View style={[styles.textContent, contentAnimatedStyle]}>
              {/* Top padding */}
              <View style={{ height: READING_ZONE_TOP }} />

              {/* Content wrapper for measuring actual height */}
              <View onLayout={handleContentLayout}>
                {lines.map((line, index) => renderLine(line, index))}
              </View>

              {/* Bottom padding - extra space to allow last line to scroll to reading zone */}
              <View style={{ height: SCREEN_HEIGHT }} />
            </Animated.View>
          </View>

          {/* Gradient overlays for fade effect */}
          <LinearGradient
            colors={[colors.background.primary, 'transparent']}
            style={[styles.fadeOverlay, styles.fadeTop, { height: READING_ZONE_TOP * 0.6 }]}
            pointerEvents="none"
          />
          <LinearGradient
            colors={['transparent', colors.background.primary]}
            style={[styles.fadeOverlay, styles.fadeBottom]}
            pointerEvents="none"
          />
        </Animated.View>
      </GestureDetector>

      {/* Controls Overlay */}
      <Animated.View style={[styles.controlsOverlay, controlsAnimatedStyle]} pointerEvents="box-none">
        {/* Top Bar - Back button and settings */}
        <View style={[styles.topBar, { paddingTop: insets.top + spacing.md }]}>
          <BackButton onPress={handleBack} variant="blur" />

          {/* Mode Toggle (only before starting) */}
          {!hasStarted && (
            <Animated.View entering={FadeIn} style={styles.modeToggle}>
              <TouchableOpacity
                onPress={() => handleModeChange('practice')}
                style={[styles.modeButton, mode === 'practice' && styles.modeButtonActive]}
              >
                <Text style={[styles.modeText, mode === 'practice' && styles.modeTextActive]}>
                  Practice
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleModeChange('record')}
                style={[styles.modeButton, mode === 'record' && styles.modeButtonActive]}
              >
                <Text style={[styles.modeText, mode === 'record' && styles.modeTextActive]}>
                  Record
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        {/* Bottom Controls */}
        <Animated.View
          style={[styles.bottomControls, { paddingBottom: insets.bottom + spacing.lg }]}
        >
          {!hasStarted ? (
            // Start Button
            <Animated.View entering={FadeInUp.delay(200)} style={styles.startContainer}>
              {/* Speed selector */}
              <View style={styles.speedSelector}>
                {SPEED_CONFIGS.map((config, index) => (
                  <TouchableOpacity
                    key={config.label}
                    onPress={() => handleSpeedChange(index)}
                    style={[
                      styles.speedButton,
                      speedIndex === index && styles.speedButtonActive,
                    ]}
                  >
                    <Text style={[
                      styles.speedText,
                      speedIndex === index && styles.speedTextActive,
                    ]}>
                      {config.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Start Button */}
              <TouchableOpacity
                onPress={handleStart}
                activeOpacity={0.9}
                style={styles.startButton}
              >
                <LinearGradient
                  colors={mode === 'record' ? ['#EF4444', '#DC2626'] : colors.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.startButtonGradient}
                >
                  <View style={styles.startButtonIcon}>
                    {mode === 'record' ? (
                      <View style={styles.recordIcon} />
                    ) : (
                      <View style={styles.playIcon} />
                    )}
                  </View>
                  <Text style={styles.startButtonText}>
                    {mode === 'record' ? 'Start Recording' : 'Start Reading'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            // Active Controls
            <Animated.View entering={SlideInDown} style={styles.activeControls}>
              {/* Play/Pause */}
              <TouchableOpacity
                onPress={handlePlayPause}
                style={styles.controlButton}
              >
                <BlurView intensity={40} tint="dark" style={styles.controlButtonBlur}>
                  {isPlaying ? (
                    <View style={styles.pauseIcon}>
                      <View style={styles.pauseBar} />
                      <View style={styles.pauseBar} />
                    </View>
                  ) : (
                    <View style={styles.playIconSmall} />
                  )}
                </BlurView>
              </TouchableOpacity>

              {/* Stop / Complete */}
              <TouchableOpacity
                onPress={handleStop}
                style={[styles.controlButton, mode === 'practice' ? styles.completeButton : styles.stopButton]}
              >
                {mode === 'practice' ? (
                  <View style={styles.checkmarkIcon}>
                    <View style={styles.checkmarkShort} />
                    <View style={styles.checkmarkLong} />
                  </View>
                ) : (
                  <View style={styles.stopIcon} />
                )}
              </TouchableOpacity>

              {/* Speed control - tap to cycle through speeds */}
              <TouchableOpacity
                onPress={() => {
                  const nextIndex = (speedIndex + 1) % SPEED_CONFIGS.length;
                  handleSpeedChange(nextIndex);
                }}
                style={styles.speedIndicator}
              >
                <Text style={styles.speedIndicatorText}>{SPEED_CONFIGS[speedIndex].label}</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  // Progress Bar
  progressContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    zIndex: 100,
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: 2,
  },

  // Recording Indicator
  recordingIndicator: {
    position: 'absolute',
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    zIndex: 100,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  recordingTime: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    fontVariant: ['tabular-nums'],
  },

  // Content Area
  contentArea: {
    flex: 1,
  },
  textContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  textContent: {
    paddingHorizontal: spacing.xl,
  },

  // Lines
  lineContainer: {
    justifyContent: 'center',
    position: 'relative',
  },
  lineText: {
    textAlign: 'left',
  },
  lineGlow: {
    position: 'absolute',
    left: -spacing.lg,
    right: -spacing.lg,
    top: 0,
    bottom: 0,
  },

  // Fade Overlays
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
    height: SCREEN_HEIGHT * 0.3,
  },

  // Controls Overlay
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },

  // Mode Toggle
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: borderRadius.full,
    padding: 4,
  },
  modeButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  modeButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  modeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
  },
  modeTextActive: {
    color: colors.text.primary,
  },

  // Bottom Controls
  bottomControls: {
    paddingHorizontal: spacing.lg,
  },

  // Start Container
  startContainer: {
    gap: spacing.lg,
  },

  // Speed Selector
  speedSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  speedButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  speedButtonActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  speedText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
  },
  speedTextActive: {
    color: colors.text.primary,
  },

  // Start Button
  startButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: colors.glow.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  startButtonIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.text.primary,
  },
  playIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: colors.text.primary,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 2,
  },
  startButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },

  // Active Controls
  activeControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
  },
  controlButtonBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 32,
  },
  stopButton: {
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: colors.success.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkIcon: {
    width: 20,
    height: 16,
    position: 'relative',
  },
  checkmarkShort: {
    position: 'absolute',
    bottom: 2,
    left: 0,
    width: 8,
    height: 3,
    backgroundColor: colors.text.primary,
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
  checkmarkLong: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    width: 16,
    height: 3,
    backgroundColor: colors.text.primary,
    borderRadius: 2,
    transform: [{ rotate: '-45deg' }],
  },
  pauseIcon: {
    flexDirection: 'row',
    gap: 4,
  },
  pauseBar: {
    width: 4,
    height: 18,
    backgroundColor: colors.text.primary,
    borderRadius: 2,
  },
  playIconSmall: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderTopWidth: 7,
    borderBottomWidth: 7,
    borderLeftColor: colors.text.primary,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 3,
  },
  stopIcon: {
    width: 18,
    height: 18,
    backgroundColor: colors.text.primary,
    borderRadius: 3,
  },
  speedIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  speedIndicatorText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
});

export default TeleprompterCard;
