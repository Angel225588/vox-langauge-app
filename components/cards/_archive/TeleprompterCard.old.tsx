import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
  FadeIn,
  FadeInDown,
  runOnJS,
  useAnimatedReaction,
  cancelAnimation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography, neomorphism } from '@/constants/designSystem';
import { VocabularyHaptics } from '@/lib/utils/haptics';
import { WordPopover } from '@/components/ui/WordPopover';
import { TeleprompterControls } from '@/components/ui/TeleprompterControls';
import { TeleprompterSettings } from '@/components/ui/TeleprompterSettings';
import { useAudioRecording, type Passage } from '@/lib/reading';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Reading zone position - TEXT SCROLLS UP, highlighted line stays near TOP
const READING_ZONE_TOP = 180; // Adjusted for top tabs
const READING_ZONE_HEIGHT = 100;

export type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';
export type TeleprompterMode = 'practice' | 'record';
export type FontSize = 'small' | 'medium' | 'large';
export type ScrollSpeed = 'slow' | 'medium' | 'fast';

// Speed slider constants
const SPEED_SLIDER_HEIGHT = 200;
const SPEED_LEVELS = [
  { label: '🐢', wpm: 80, name: 'very slow' },
  { label: '🐌', wpm: 100, name: 'slow' },
  { label: '🚶', wpm: 130, name: 'steady' },
  { label: '🏃', wpm: 160, name: 'normal' },
  { label: '🚀', wpm: 200, name: 'fast' },
  { label: '⚡', wpm: 250, name: 'very fast' },
];

interface WordPosition {
  word: string;
  x: number;
  y: number;
  width: number;
  height: number;
  lineIndex: number;
  wordIndex: number;
}

interface TeleprompterCardProps {
  passage: Passage;
  onFinish: (results: TeleprompterResults) => void;
  onBack?: () => void;
}

export interface TeleprompterResults {
  duration: number;
  totalWords: number;
  linesRead: number;
  recordingUri?: string;
}

// WPM-based scroll speeds (words per minute)
const WPM_CONFIG: Record<ScrollSpeed, number> = {
  slow: 100,    // Beginner
  medium: 150,  // Comfortable
  fast: 220,    // Advanced
};

export function TeleprompterCard({ passage, onFinish, onBack }: TeleprompterCardProps) {
  const insets = useSafeAreaInsets();

  // Audio recording hook
  const {
    isRecording,
    isPaused: isRecordingPaused,
    duration: recordingDuration,
    recordingUri,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    formatDuration,
  } = useAudioRecording();

  // State
  const [mode, setMode] = useState<TeleprompterMode>('record');
  const [fontSize, setFontSize] = useState<FontSize>('medium');
  const [scrollSpeed, setScrollSpeed] = useState<ScrollSpeed>('medium');
  const [customWpm, setCustomWpm] = useState(160); // Default to 'normal' speed
  const [speedLevelIndex, setSpeedLevelIndex] = useState(3); // Index into SPEED_LEVELS
  const [autoScroll, setAutoScroll] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedWord, setSelectedWord] = useState<WordPosition | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  // Refs
  const scrollAnimationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Reanimated shared values for smooth scroll
  const scrollY = useSharedValue(0);
  const isScrollingShared = useSharedValue(false);

  // Parse passage text into lines
  const lines = useMemo(() =>
    passage.text.split(/\n+/).filter(line => line.trim().length > 0),
    [passage.text]
  );
  const totalLines = lines.length;
  const totalWords = useMemo(() =>
    passage.text.split(/\s+/).filter(w => w.trim().length > 0).length,
    [passage.text]
  );

  // Font size mapping
  const fontSizeMap: Record<FontSize, number> = {
    small: 20,
    medium: 28,
    large: 38,
  };

  // Line height based on font size (generous spacing for readability)
  const lineHeight = fontSizeMap[fontSize] * 2.2;
  const lineSpacing = spacing.md;
  const totalLineHeight = lineHeight + lineSpacing;

  // Calculate total content height
  const totalContentHeight = totalLines * totalLineHeight;

  // Calculate scroll speed in pixels per second based on custom WPM
  const getScrollSpeed = useCallback(() => {
    const wpm = customWpm;
    const wordsPerSecond = wpm / 60;
    const avgWordsPerLine = Math.max(1, totalWords / totalLines);
    const linesPerSecond = wordsPerSecond / avgWordsPerLine;
    return linesPerSecond * totalLineHeight;
  }, [customWpm, totalWords, totalLines, totalLineHeight]);

  // Handle speed slider change
  const handleSpeedSliderChange = useCallback((index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSpeedLevelIndex(index);
    setCustomWpm(SPEED_LEVELS[index].wpm);
  }, []);

  // Pulse animation for recording indicator
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (isRecording && !isRecordingPaused) {
      pulseScale.value = withRepeat(
        withTiming(1.15, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 200 });
    }
  }, [isRecording, isRecordingPaused]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Smooth continuous scroll animation using requestAnimationFrame
  const startSmoothScroll = useCallback(() => {
    if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current);
    }

    // Calculate max scroll - we want to scroll until the last line reaches the reading zone
    const maxScroll = Math.max(0, totalContentHeight - READING_ZONE_HEIGHT);
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      if (!isScrollingShared.value) return;

      const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
      lastTime = currentTime;

      // Get current speed (allows dynamic speed changes)
      const pixelsPerSecond = getScrollSpeed();
      const newScrollY = scrollY.value + (pixelsPerSecond * deltaTime);

      if (newScrollY >= maxScroll) {
        // Reached end
        scrollY.value = maxScroll;
        isScrollingShared.value = false;
        runOnJS(setIsScrolling)(false);
        return;
      }

      scrollY.value = newScrollY;
      scrollAnimationRef.current = requestAnimationFrame(animate);
    };

    scrollAnimationRef.current = requestAnimationFrame(animate);
  }, [getScrollSpeed, totalContentHeight]);

  const stopSmoothScroll = useCallback(() => {
    if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current);
      scrollAnimationRef.current = null;
    }
  }, []);

  // Track current line based on scroll position
  useAnimatedReaction(
    () => scrollY.value,
    (currentScroll) => {
      const lineIndex = Math.floor(currentScroll / totalLineHeight);
      const clampedIndex = Math.max(0, Math.min(lineIndex, totalLines - 1));
      runOnJS(setCurrentLineIndex)(clampedIndex);
    },
    [totalLineHeight, totalLines]
  );

  // Start/stop scrolling based on state
  useEffect(() => {
    if (isScrolling && autoScroll) {
      isScrollingShared.value = true;
      startSmoothScroll();
    } else {
      isScrollingShared.value = false;
      stopSmoothScroll();
    }

    return () => stopSmoothScroll();
  }, [isScrolling, autoScroll, startSmoothScroll, stopSmoothScroll]);

  // Animated style for the content (moves up as we scroll)
  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -scrollY.value }],
  }));

  // Handle word tap - IMPORTANT: Extract event values BEFORE any async operations
  const handleWordTap = useCallback((word: string, lineIndex: number, wordIndex: number, event: any) => {
    // Extract position IMMEDIATELY before any async operations (synthetic event pooling)
    const pageX = event.nativeEvent?.pageX ?? SCREEN_WIDTH / 2;
    const pageY = event.nativeEvent?.pageY ?? READING_ZONE_TOP;

    // Now we can safely do async operations
    (async () => {
      await VocabularyHaptics.cardPressed();

      // Pause scrolling
      setIsScrolling(false);

      // Pause recording if active
      if (isRecording && !isRecordingPaused) {
        await pauseRecording();
      }

      setSelectedWord({
        word: word.replace(/[.,!?;:'"]/g, ''),
        x: pageX,
        y: pageY,
        width: 100,
        height: 40,
        lineIndex,
        wordIndex,
      });
    })();
  }, [isRecording, isRecordingPaused, pauseRecording]);

  // Close popover
  const handleClosePopover = useCallback(async () => {
    setSelectedWord(null);
  }, []);

  // Resume after popover
  const handleResumeAfterPopover = useCallback(async () => {
    setSelectedWord(null);

    // Small delay before resuming
    setTimeout(async () => {
      if (mode === 'record' && isRecording && isRecordingPaused) {
        await resumeRecording();
      }
      setIsScrolling(true);
    }, 300);
  }, [mode, isRecording, isRecordingPaused, resumeRecording]);

  // Play word pronunciation
  const handlePlayWord = useCallback((word: string, slow: boolean = false) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Speech.speak(word, {
      language: 'es-ES', // Spanish
      rate: slow ? 0.5 : 0.9,
    });
  }, []);

  // Play current line
  const handlePlayCurrentLine = useCallback(async () => {
    await VocabularyHaptics.cardPressed();
    const currentLine = lines[currentLineIndex];
    Speech.speak(currentLine, {
      language: 'es-ES',
      rate: 0.85,
    });
  }, [currentLineIndex, lines]);

  // Toggle font size
  const handleToggleFontSize = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFontSize(prev => {
      if (prev === 'small') return 'medium';
      if (prev === 'medium') return 'large';
      return 'small';
    });
  }, []);

  // Handle start (both practice and record modes)
  const handleStart = useCallback(async () => {
    await VocabularyHaptics.fabPressed();

    if (mode === 'record') {
      await startRecording();
    }

    startTimeRef.current = Date.now();
    setIsScrolling(true);
  }, [mode, startRecording]);

  // Handle pause/play toggle
  const handlePausePlay = useCallback(async () => {
    await VocabularyHaptics.cardPressed();

    if (isScrolling) {
      // Pause
      setIsScrolling(false);
      if (mode === 'record' && isRecording && !isRecordingPaused) {
        await pauseRecording();
      }
    } else {
      // Resume
      setIsScrolling(true);
      if (mode === 'record' && isRecording && isRecordingPaused) {
        await resumeRecording();
      }
    }
  }, [isScrolling, mode, isRecording, isRecordingPaused, pauseRecording, resumeRecording]);

  // Handle stop
  const handleStop = useCallback(async () => {
    await VocabularyHaptics.wordAdded();
    setIsScrolling(false);

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
  }, [mode, isRecording, stopRecording, totalWords, currentLineIndex, onFinish]);

  // Handle mode toggle
  const handleModeToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMode(prev => prev === 'practice' ? 'record' : 'practice');
  }, []);

  // Handle settings apply
  const handleApplySettings = useCallback((newFontSize: FontSize, newSpeed: ScrollSpeed, newAutoScroll: boolean, newSpeedLevelIndex?: number) => {
    setFontSize(newFontSize);
    setScrollSpeed(newSpeed);
    setAutoScroll(newAutoScroll);
    if (newSpeedLevelIndex !== undefined) {
      setSpeedLevelIndex(newSpeedLevelIndex);
      setCustomWpm(SPEED_LEVELS[newSpeedLevelIndex].wpm);
    }
    setShowSettings(false);
  }, []);

  // Render a single line with tappable words
  // The highlight logic needs to handle the ACTIVE line in the reading zone
  const renderLine = useCallback((line: string, lineIndex: number) => {
    const words = line.split(/\s+/);

    // Calculate if this line is in/near the reading zone
    // A line is "current" when it's the one being read (in the reading zone)
    const isCurrentLine = lineIndex === currentLineIndex;
    const isPastLine = lineIndex < currentLineIndex;
    const isNearCurrent = Math.abs(lineIndex - currentLineIndex) <= 1;

    return (
      <View
        key={lineIndex}
        style={[
          styles.lineContainer,
          { minHeight: totalLineHeight },
          isCurrentLine && styles.currentLineContainer,
        ]}
      >
        <View style={styles.lineContent}>
          {words.map((word, wordIndex) => (
            <TouchableOpacity
              key={`${lineIndex}-${wordIndex}`}
              onPress={(e) => handleWordTap(word, lineIndex, wordIndex, e)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.word,
                  {
                    fontSize: fontSizeMap[fontSize],
                    lineHeight: lineHeight,
                    // Clear opacity hierarchy: past < future < near < current
                    opacity: isPastLine ? 0.3 : isCurrentLine ? 1 : isNearCurrent ? 0.7 : 0.5,
                  },
                  isCurrentLine && styles.currentWord,
                ]}
              >
                {word}{' '}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }, [currentLineIndex, fontSize, lineHeight, totalLineHeight, handleWordTap, fontSizeMap]);


  // Determine recording state for controls
  const getRecordingState = (): RecordingState => {
    if (mode === 'practice') {
      return isScrolling ? 'recording' : 'idle';
    }
    if (!isRecording) return 'idle';
    if (isRecordingPaused) return 'paused';
    return 'recording';
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* TOP BAR - Mode tabs + Settings (neomorphic design) */}
      <View style={styles.topBarContainer}>
        {/* Mode toggle tabs - now at TOP */}
        <View style={styles.topModeToggle}>
          <TouchableOpacity
            onPress={handleModeToggle}
            style={[
              styles.topModeButton,
              mode === 'practice' && styles.topModeButtonActive,
            ]}
            disabled={isScrolling || isRecording}
          >
            <Text style={styles.topModeIcon}>📖</Text>
            <Text style={[
              styles.topModeText,
              mode === 'practice' && styles.topModeTextActive,
            ]}>Practice</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleModeToggle}
            style={[
              styles.topModeButton,
              mode === 'record' && styles.topModeButtonActive,
            ]}
            disabled={isScrolling || isRecording}
          >
            <Text style={styles.topModeIcon}>🎤</Text>
            <Text style={[
              styles.topModeText,
              mode === 'record' && styles.topModeTextActive,
            ]}>Record</Text>
          </TouchableOpacity>
        </View>

        {/* Settings button */}
        <TouchableOpacity
          onPress={() => setShowSettings(true)}
          style={styles.settingsButton}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Recording indicator - below top bar */}
      {mode === 'record' && isRecording && (
        <Animated.View
          entering={FadeIn.duration(300)}
          style={styles.recordingIndicator}
        >
          {!isRecordingPaused ? (
            <>
              <Animated.View style={[styles.recordingDot, pulseStyle]} />
              <Text style={styles.recordingText}>REC {formatDuration(recordingDuration)}</Text>
            </>
          ) : (
            <Text style={styles.pausedText}>⏸ PAUSED {formatDuration(recordingDuration)}</Text>
          )}
        </Animated.View>
      )}

      {/* Teleprompter Area - THE KEY CHANGE */}
      <View style={styles.teleprompterContainer}>
        {/* Subtle dim overlay - no guide lines */}
        <View style={styles.readingZoneOverlay} pointerEvents="none">
          <View style={styles.dimTop} />
          <View style={styles.readingZone} />
          <View style={styles.dimBottom} />
        </View>

        {/* Scrolling content - text moves UP through the reading zone */}
        <View style={styles.textContainer}>
          <Animated.View style={[styles.textContent, contentAnimatedStyle]}>
            {/* Top padding so first line starts in reading zone */}
            <View style={{ height: READING_ZONE_TOP }} />

            {lines.map((line, index) => renderLine(line, index))}

            {/* Bottom padding so last line can reach reading zone */}
            <View style={{ height: SCREEN_HEIGHT - READING_ZONE_TOP }} />
          </Animated.View>
        </View>

        {/* Volume-style Speed Slider - Right Side */}
        <View style={styles.volumeSliderContainer}>
          {/* Fast icon at top */}
          <Text style={styles.volumeIcon}>🐰</Text>

          {/* Vertical track */}
          <View style={styles.volumeTrack}>
            {/* Fill from bottom based on speed */}
            <View
              style={[
                styles.volumeFill,
                { height: `${(speedLevelIndex / (SPEED_LEVELS.length - 1)) * 100}%` }
              ]}
            />

            {/* Thumb indicator */}
            <View
              style={[
                styles.volumeThumb,
                { bottom: `${(speedLevelIndex / (SPEED_LEVELS.length - 1)) * 100}%` }
              ]}
            />
          </View>

          {/* Slow icon at bottom */}
          <Text style={styles.volumeIcon}>🐢</Text>

          {/* Tap zones for adjustment */}
          <View style={styles.volumeTapZones}>
            {SPEED_LEVELS.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={styles.volumeTapZone}
                onPress={() => handleSpeedSliderChange(SPEED_LEVELS.length - 1 - index)}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Word Popover */}
      {selectedWord && (
        <WordPopover
          word={selectedWord.word}
          x={selectedWord.x}
          y={selectedWord.y}
          onClose={handleClosePopover}
          onPlay={() => handlePlayWord(selectedWord.word, false)}
          onPlaySlow={() => handlePlayWord(selectedWord.word, true)}
          onResume={handleResumeAfterPopover}
        />
      )}

      {/* Bottom Control Bar - Simplified (mode tabs moved to top) */}
      <View style={[styles.controlBarContainer, { paddingBottom: insets.bottom + spacing.md }]}>
        {/* Main controls only - neomorphic style */}
        <View style={styles.mainControls}>
          {!isScrolling && !isRecording ? (
            // Start button - neomorphic primary style
            <TouchableOpacity
              onPress={handleStart}
              style={styles.neoStartButton}
              activeOpacity={0.9}
            >
              <Text style={styles.neoStartButtonText}>
                {mode === 'record' ? '⏺ START RECORDING' : '▶ START READING'}
              </Text>
            </TouchableOpacity>
          ) : (
            // Active controls - neomorphic style
            <View style={styles.activeControls}>
              <TouchableOpacity
                onPress={handlePausePlay}
                style={styles.neoControlButton}
              >
                <Text style={styles.neoControlIcon}>
                  {isScrolling && !isRecordingPaused ? '⏸' : '▶'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleStop}
                style={[styles.neoControlButton, styles.neoStopButton]}
              >
                <Text style={styles.neoControlIcon}>⏹</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handlePlayCurrentLine}
                style={styles.neoControlButton}
              >
                <Text style={styles.neoControlIcon}>🔊</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Settings Panel */}
      <TeleprompterSettings
        visible={showSettings}
        fontSize={fontSize}
        scrollSpeed={scrollSpeed}
        speedLevelIndex={speedLevelIndex}
        autoScroll={autoScroll}
        onClose={() => setShowSettings(false)}
        onApply={handleApplySettings}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: neomorphism.background,
  },

  // NEW: Top bar container with tabs and settings
  topBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: neomorphism.background,
  },

  // Mode toggle at TOP (neomorphic)
  topModeToggle: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  topModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    backgroundColor: neomorphism.button.pressed.backgroundColor,
    borderWidth: 2,
    borderColor: neomorphism.button.pressed.borderColor,
    gap: spacing.xs,
  },
  topModeButtonActive: {
    backgroundColor: neomorphism.button.primary.backgroundColor,
    borderColor: neomorphism.button.primary.backgroundColor,
    shadowColor: neomorphism.button.primary.shadowDark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  topModeIcon: {
    fontSize: 16,
  },
  topModeText: {
    color: neomorphism.text.inactive,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  topModeTextActive: {
    color: neomorphism.button.primary.textColor,
    fontWeight: typography.fontWeight.bold,
  },

  // Settings button (neomorphic)
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: neomorphism.button.secondary.backgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: neomorphism.button.secondary.shadowDark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(61, 69, 89, 0.3)',
  },
  settingsIcon: {
    fontSize: 18,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error.DEFAULT,
  },
  recordingText: {
    color: colors.error.light,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1,
  },
  pausedText: {
    color: colors.warning.DEFAULT,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  teleprompterContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  textContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  textContent: {
    paddingHorizontal: spacing.xl,
  },
  lineContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  currentLineContainer: {
    backgroundColor: 'rgba(62, 207, 178, 0.15)',
  },
  lineContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  word: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.normal,
  },
  currentWord: {
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
    textShadowColor: neomorphism.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  // Reading zone overlay
  readingZoneOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  dimTop: {
    height: READING_ZONE_TOP - 10,
    backgroundColor: 'rgba(45, 53, 72, 0.7)',
  },
  readingZone: {
    height: READING_ZONE_HEIGHT,
    backgroundColor: 'transparent',
  },
  dimBottom: {
    flex: 1,
    backgroundColor: 'rgba(45, 53, 72, 0.7)',
  },
  // Volume-style Speed Slider (Right side - neomorphic)
  volumeSliderContainer: {
    position: 'absolute',
    right: spacing.md,
    top: '40%',
    transform: [{ translateY: -80 }],
    alignItems: 'center',
    zIndex: 20,
    backgroundColor: neomorphism.button.secondary.backgroundColor,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(61, 69, 89, 0.3)',
    shadowColor: neomorphism.button.secondary.shadowDark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  volumeIcon: {
    fontSize: 20,
    marginVertical: spacing.xs,
  },
  volumeTrack: {
    width: 8,
    height: 140,
    backgroundColor: neomorphism.slider.track,
    borderRadius: 4,
    marginVertical: spacing.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  volumeFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: neomorphism.slider.fill,
    borderRadius: 4,
  },
  volumeThumb: {
    position: 'absolute',
    left: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: neomorphism.slider.thumb,
    borderWidth: 3,
    borderColor: neomorphism.slider.thumbBorder,
    shadowColor: neomorphism.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: -10,
  },
  volumeTapZones: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: -10,
    right: -10,
    flexDirection: 'column',
  },
  volumeTapZone: {
    flex: 1,
  },
  // Control bar (neomorphic - simplified, no mode toggle)
  controlBarContainer: {
    backgroundColor: neomorphism.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  mainControls: {
    alignItems: 'center',
  },

  // Neomorphic start button (primary teal)
  neoStartButton: {
    width: '100%',
    borderRadius: borderRadius.xl,
    backgroundColor: neomorphism.button.primary.backgroundColor,
    paddingVertical: spacing.md + 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: neomorphism.button.primary.shadowDark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  neoStartButtonText: {
    color: neomorphism.button.primary.textColor,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1,
  },

  // Active controls (neomorphic)
  activeControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  neoControlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: neomorphism.button.secondary.backgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: neomorphism.button.secondary.shadowDark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(61, 69, 89, 0.3)',
  },
  neoStopButton: {
    backgroundColor: '#DC2626',
    borderColor: '#EF4444',
    shadowColor: 'rgba(239, 68, 68, 0.5)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 8,
  },
  neoControlIcon: {
    fontSize: 24,
    color: neomorphism.text.primary,
  },
});
