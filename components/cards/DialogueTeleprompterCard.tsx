/**
 * DialogueTeleprompterCard - Interactive Dialogue Practice
 *
 * Features:
 * - Color-coded speakers (Person A = teal, Person B = purple)
 * - Practice mode: ElevenLabs speaks ALL lines (listen & learn)
 * - Record mode: ElevenLabs speaks Person A, user speaks Person B
 * - Auto-scrolling teleprompter style
 * - Speed control and font size options
 *
 * Based on TeleprompterCard pattern
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { DialogueScenario, DialogueLine } from '@/lib/scenarios/dialogueScenarios';
import useElevenLabsTTS from '@/hooks/useElevenLabsTTS';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Reading zone position
const READING_ZONE_TOP = SCREEN_HEIGHT * 0.22;

// Speaker colors
const SPEAKER_COLORS = {
  A: colors.secondary.DEFAULT, // Teal for AI/Person A
  B: colors.primary.light,     // Purple for User/Person B
};

// Voice IDs for different speakers (ElevenLabs)
const SPEAKER_VOICES = {
  A: 'en-US-daniel',   // Daniel - American English (Person A / AI)
  B: 'en-GB-bradley',  // Bradley - British English (Person B / User in Practice mode)
};

export type DialogueMode = 'practice' | 'record';
export type FontSizeOption = 'small' | 'medium' | 'large';

export interface DialogueResults {
  duration: number;
  totalLines: number;
  userLines: number;
  mode: DialogueMode;
}

interface DialogueTeleprompterCardProps {
  scenario: DialogueScenario;
  onFinish: (results: DialogueResults) => void;
  onBack?: () => void;
}

// Font size configurations
const FONT_SIZES: Record<FontSizeOption, { fontSize: number; lineHeight: number }> = {
  small: { fontSize: 22, lineHeight: 36 },
  medium: { fontSize: 28, lineHeight: 46 },
  large: { fontSize: 34, lineHeight: 56 },
};

// WPM range
const MIN_WPM = 60;
const MAX_WPM = 200;

export function DialogueTeleprompterCard({
  scenario,
  onFinish,
  onBack,
}: DialogueTeleprompterCardProps) {
  const insets = useSafeAreaInsets();

  // ElevenLabs TTS
  const {
    speak,
    speakSequence,
    stop: stopTTS,
    isSpeaking,
    isConfigured: isTTSConfigured,
  } = useElevenLabsTTS();

  // State
  const [mode, setMode] = useState<DialogueMode>('practice');
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [speedNormalized, setSpeedNormalized] = useState(0.4); // Slower default for dialogue
  const [fontSizeOption, setFontSizeOption] = useState<FontSizeOption>('medium');
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isTTSSpeaking, setIsTTSSpeaking] = useState(false);

  // Refs
  const isPlayingRef = useRef(false);
  const scrollAnimationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const ttsAbortedRef = useRef(false);

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

  // Build formatted text with speaker labels
  const formattedDialogue = useMemo(() => {
    return scenario.lines.map((line, index) => ({
      ...line,
      index,
      displayText: line.text,
    }));
  }, [scenario.lines]);

  // Total words estimate
  const totalWords = useMemo(() =>
    scenario.lines.reduce((acc, line) => acc + line.text.split(/\s+/).length, 0),
    [scenario.lines]
  );

  // Estimate content height - account for spacing between lines
  const lineSpacing = spacing.xl;
  const estimatedLineHeight = lineHeight * 2.5 + lineSpacing; // Each dialogue line takes ~2.5 visual lines
  const contentHeight = scenario.lines.length * estimatedLineHeight;

  // Max scroll
  const maxScroll = Math.max(0, contentHeight - SCREEN_HEIGHT * 0.3);

  // Calculate scroll speed based on WPM
  const getScrollSpeed = useCallback(() => {
    const wordsPerSecond = currentWpm / 60;
    // Roughly 10 words per dialogue line average
    const linesPerSecond = wordsPerSecond / 10;
    return linesPerSecond * estimatedLineHeight;
  }, [currentWpm, estimatedLineHeight]);

  // Smooth scroll animation
  const startSmoothScroll = useCallback(() => {
    if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current);
    }

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      if (!isPlayingRef.current) return;

      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const pixelsPerSecond = getScrollSpeed();
      const newScrollY = scrollY.value + (pixelsPerSecond * deltaTime);

      // Update progress
      const progress = maxScroll > 0 ? (newScrollY / maxScroll) * 100 : 0;
      progressWidth.value = Math.min(100, progress);

      // Update current line index based on scroll position
      const estimatedLine = Math.floor(newScrollY / estimatedLineHeight);
      if (estimatedLine !== currentLineIndex && estimatedLine < scenario.lines.length) {
        runOnJS(setCurrentLineIndex)(estimatedLine);
      }

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
  }, [getScrollSpeed, maxScroll, scrollY, progressWidth, estimatedLineHeight, currentLineIndex, scenario.lines.length]);

  const stopSmoothScroll = useCallback(() => {
    if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current);
      scrollAnimationRef.current = null;
    }
  }, []);

  // Handle play/pause - only auto-scroll if TTS is not controlling
  useEffect(() => {
    // When TTS is configured, scrolling is controlled by TTS callbacks
    // Only use auto-scroll as fallback when TTS is not available
    if (!isTTSConfigured) {
      if (isPlaying) {
        startSmoothScroll();
      } else {
        stopSmoothScroll();
      }
    }
    return () => stopSmoothScroll();
  }, [isPlaying, startSmoothScroll, stopSmoothScroll, isTTSConfigured]);

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

  // Build TTS sequence items from dialogue lines
  const buildTTSSequence = useCallback((linesToSpeak: DialogueLine[]) => {
    return linesToSpeak.map((line, idx) => ({
      text: line.text,
      voiceId: SPEAKER_VOICES[line.speaker],
      delayBefore: idx === 0 ? 500 : 800, // Initial delay + pause between lines
    }));
  }, []);

  // Scroll to a specific line
  const scrollToLine = useCallback((lineIndex: number) => {
    const targetScroll = lineIndex * estimatedLineHeight;
    scrollY.value = withTiming(Math.min(maxScroll, targetScroll), { duration: 400 });

    // Update progress
    const progress = maxScroll > 0 ? (targetScroll / maxScroll) * 100 : 0;
    progressWidth.value = withTiming(Math.min(100, progress), { duration: 400 });
  }, [estimatedLineHeight, maxScroll, scrollY, progressWidth]);

  // Handle TTS line start - sync scrolling with speech
  const handleTTSLineStart = useCallback((lineIndex: number) => {
    if (ttsAbortedRef.current) return;
    setCurrentLineIndex(lineIndex);
    scrollToLine(lineIndex);
  }, [scrollToLine]);

  // Handlers
  const handleStart = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    startTimeRef.current = Date.now();
    ttsAbortedRef.current = false;
    setHasStarted(true);
    setIsPlaying(true);
    setCurrentLineIndex(0);
    setIsTTSSpeaking(true);

    // Start ElevenLabs TTS based on mode
    if (isTTSConfigured) {
      try {
        if (mode === 'practice') {
          // Practice mode: Speak ALL lines (both speakers)
          const sequence = buildTTSSequence(scenario.lines);
          await speakSequence(sequence, handleTTSLineStart);
        } else {
          // Record mode: Only speak Person A lines (user speaks Person B)
          const personALines = scenario.lines
            .map((line, idx) => ({ ...line, originalIndex: idx }))
            .filter(line => line.speaker === 'A');

          for (const line of personALines) {
            if (ttsAbortedRef.current) break;

            // Scroll to this line
            handleTTSLineStart(line.originalIndex);

            // Speak Person A's line
            await speak(line.text, SPEAKER_VOICES.A);

            // Wait a bit for user to respond (in future, this will be speech recognition)
            // For now, just pause before next line
            if (!ttsAbortedRef.current) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
        }

        // TTS completed, finish the dialogue
        if (!ttsAbortedRef.current) {
          setIsTTSSpeaking(false);
          setTimeout(() => handleFinish(), 1000);
        }
      } catch (error) {
        console.error('[DialogueTeleprompter] TTS Error:', error);
        setIsTTSSpeaking(false);
      }
    } else {
      // Fallback: No TTS, just scroll automatically
      console.warn('[DialogueTeleprompter] ElevenLabs not configured, using auto-scroll only');
    }
  };

  const handlePlayPause = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isPlaying) {
      // Pausing - stop TTS
      ttsAbortedRef.current = true;
      await stopTTS();
      setIsTTSSpeaking(false);
    }

    setIsPlaying(!isPlaying);
  };

  const handleFinish = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    ttsAbortedRef.current = true;
    await stopTTS();
    setIsPlaying(false);
    setIsTTSSpeaking(false);

    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const userLines = scenario.lines.filter(l => l.speaker === 'B').length;

    onFinish({
      duration,
      totalLines: scenario.lines.length,
      userLines,
      mode,
    });
  };

  const handleBack = async () => {
    ttsAbortedRef.current = true;
    await stopTTS();
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

  // Render a single dialogue line
  const renderDialogueLine = (line: DialogueLine, index: number) => {
    const speakerColor = SPEAKER_COLORS[line.speaker];
    const speakerLabel = line.speaker === 'A' ? scenario.roleA : scenario.roleB;
    const isUserLine = line.speaker === 'B';

    return (
      <View key={index} style={styles.dialogueLine}>
        {/* Speaker label */}
        <View style={[styles.speakerLabelContainer, { borderLeftColor: speakerColor }]}>
          <Text style={[styles.speakerLabel, { color: speakerColor }]}>
            {speakerLabel}
          </Text>
          {isUserLine && mode === 'record' && (
            <View style={styles.yourTurnBadge}>
              <Ionicons name="mic" size={10} color="#FFF" />
            </View>
          )}
        </View>

        {/* Line text */}
        <Text style={[styles.dialogueText, { fontSize, lineHeight, color: speakerColor }]}>
          {line.text}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" hidden={hasStarted} />

      {/* Header - Scenario info (pre-start only) */}
      {!hasStarted && (
        <Animated.View
          entering={FadeIn.duration(300)}
          style={[styles.headerContainer, { paddingTop: insets.top + spacing.md }]}
        >
          <Text style={styles.scenarioTitle}>{scenario.title}</Text>
          <View style={styles.rolesContainer}>
            <View style={styles.roleChip}>
              <View style={[styles.roleDot, { backgroundColor: SPEAKER_COLORS.A }]} />
              <Text style={styles.roleText}>{scenario.roleA} (AI)</Text>
            </View>
            <View style={styles.roleChip}>
              <View style={[styles.roleDot, { backgroundColor: SPEAKER_COLORS.B }]} />
              <Text style={styles.roleText}>{scenario.roleB} (You)</Text>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Progress Bar (top) - only during playback */}
      {hasStarted && (
        <Animated.View
          entering={FadeIn.duration(300)}
          style={[styles.progressContainer, { top: insets.top + spacing.sm }]}
        >
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, progressBarStyle]} />
          </View>
          {/* Current line indicator */}
          <Text style={styles.lineIndicator}>
            Line {currentLineIndex + 1} / {scenario.lines.length}
          </Text>
        </Animated.View>
      )}

      {/* Main Content - Scrolling Dialogue */}
      <GestureDetector gesture={panGesture}>
        <View style={styles.contentArea}>
          <Animated.View style={[styles.textContent, contentAnimatedStyle]}>
            <View style={{ height: READING_ZONE_TOP }} />
            {formattedDialogue.map((line, index) => renderDialogueLine(line, index))}
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
                accessibilityLabel={mode === 'record' ? 'Start dialogue' : 'Listen to dialogue'}
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
                  scrollY.value = Math.max(0, scrollY.value - estimatedLineHeight);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={styles.controlButton}
                accessibilityLabel="Previous line"
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
                  scrollY.value = Math.min(maxScroll, scrollY.value + estimatedLineHeight);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={styles.controlButton}
                accessibilityLabel="Next line"
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

        {/* Mode indicator during playback */}
        {hasStarted && (
          <View style={styles.modeIndicator}>
            <View style={[
              styles.modeIndicatorDot,
              { backgroundColor: mode === 'record' ? '#EF4444' : colors.primary.DEFAULT },
              isTTSSpeaking && styles.modeIndicatorDotPulsing,
            ]} />
            <Text style={styles.modeIndicatorText}>
              {isTTSSpeaking
                ? `Speaking line ${currentLineIndex + 1}...`
                : mode === 'record' ? 'Interactive Mode' : 'Listen Mode'}
            </Text>
          </View>
        )}

        {/* TTS not configured warning */}
        {!hasStarted && !isTTSConfigured && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning-outline" size={16} color={colors.warning.DEFAULT} />
            <Text style={styles.warningText}>
              ElevenLabs not configured - audio will not play
            </Text>
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

  // Header
  headerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 50,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  scenarioTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  rolesContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(40, 40, 40, 0.9)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  roleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  roleText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
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
  lineIndicator: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },

  // Content
  contentArea: {
    flex: 1,
    overflow: 'hidden',
  },
  textContent: {
    paddingHorizontal: spacing.lg,
  },

  // Dialogue line
  dialogueLine: {
    marginBottom: spacing.xl,
  },
  speakerLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    borderLeftWidth: 3,
    paddingLeft: spacing.sm,
    gap: spacing.xs,
  },
  speakerLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  yourTurnBadge: {
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: borderRadius.sm,
    padding: 2,
  },
  dialogueText: {
    fontWeight: '400',
    paddingLeft: spacing.sm + 3, // Align with border
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

  // Mode indicator
  modeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  modeIndicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  modeIndicatorDotPulsing: {
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  modeIndicatorText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: '500',
  },

  // Warning banner
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: borderRadius.md,
  },
  warningText: {
    fontSize: typography.fontSize.xs,
    color: colors.warning.DEFAULT,
  },
});

export default DialogueTeleprompterCard;
