import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
} from 'react-native';
import { Audio } from 'expo-av';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/designSystem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface WordAnalysis {
  word: string;
  startTime: number;
  endTime: number;
  status: 'correct' | 'hesitation' | 'mispronounced' | 'skipped';
}

interface RecordingPlaybackProps {
  passageText: string;
  recordingUri: string;
  wordAnalysis: WordAnalysis[];
  onAddToWordBank?: (word: string) => void;
  onClose?: () => void;
}

const STATUS_COLORS = {
  correct: colors.success.DEFAULT,
  hesitation: colors.warning.DEFAULT,
  mispronounced: colors.accent.orange,
  skipped: colors.error.DEFAULT,
  unreached: colors.text.disabled,
};

const STATUS_GLOWS = {
  correct: colors.glow.success,
  hesitation: 'rgba(245, 158, 11, 0.5)',
  mispronounced: 'rgba(249, 115, 22, 0.5)',
  skipped: colors.glow.error,
  unreached: 'rgba(107, 114, 128, 0.3)',
};

export type { RecordingPlaybackProps };

export function RecordingPlayback({
  passageText,
  recordingUri,
  wordAnalysis,
  onAddToWordBank,
  onClose,
}: RecordingPlaybackProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
  const [showWordPopover, setShowWordPopover] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  // Parse passage into words with their analysis data
  const words = useMemo(() => {
    const passageWords = passageText.split(/(\s+)/);
    let analysisIndex = 0;

    return passageWords.map((word, index) => {
      if (word.trim() === '') {
        return { word, isSpace: true };
      }

      const analysis = wordAnalysis[analysisIndex];
      analysisIndex++;

      return {
        word,
        isSpace: false,
        analysis,
      };
    });
  }, [passageText, wordAnalysis]);

  // Find current word index based on playback time
  const currentWordIndex = useMemo(() => {
    for (let i = 0; i < wordAnalysis.length; i++) {
      if (currentTime >= wordAnalysis[i].startTime && currentTime < wordAnalysis[i].endTime) {
        return i;
      }
    }
    return -1;
  }, [currentTime, wordAnalysis]);

  // Load audio on mount
  useEffect(() => {
    loadAudio();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [recordingUri]);

  const loadAudio = async () => {
    try {
      const { sound: audioSound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      setSound(audioSound);

      const status = await audioSound.getStatusAsync();
      if (status.isLoaded) {
        setDuration(status.durationMillis || 0);
      }
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setCurrentTime(status.positionMillis);
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish) {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    }
  };

  const togglePlayPause = async () => {
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const changeSpeed = async (speed: number) => {
    if (!sound) return;

    try {
      await sound.setRateAsync(speed, true);
      setPlaybackSpeed(speed);
    } catch (error) {
      console.error('Error changing speed:', error);
    }
  };

  const seekToPosition = async (position: number) => {
    if (!sound) return;

    try {
      await sound.setPositionAsync(position);
      setCurrentTime(position);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const handleWordPress = (index: number, analysis: WordAnalysis) => {
    setSelectedWordIndex(index);
    setShowWordPopover(true);
    seekToPosition(analysis.startTime);
  };

  const handleHearPronunciation = () => {
    if (selectedWordIndex !== null) {
      const analysis = wordAnalysis[selectedWordIndex];
      seekToPosition(analysis.startTime);
      setShowWordPopover(false);
    }
  };

  const handleAddToWordBank = () => {
    if (selectedWordIndex !== null && onAddToWordBank) {
      const analysis = wordAnalysis[selectedWordIndex];
      onAddToWordBank(analysis.word);
      setShowWordPopover(false);
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recording Playback</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Timeline Visualization */}
      <View style={styles.timeline}>
        {wordAnalysis.map((analysis, index) => {
          const widthPercent = ((analysis.endTime - analysis.startTime) / duration) * 100;
          return (
            <View
              key={index}
              style={[
                styles.timelineSegment,
                {
                  width: `${widthPercent}%`,
                  backgroundColor: STATUS_COLORS[analysis.status],
                },
              ]}
            />
          );
        })}
      </View>

      {/* Passage Text with Words */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.textContainer}
        contentContainerStyle={styles.textContent}
      >
        <View style={styles.wordsWrapper}>
          {words.map((item, index) => {
            if (item.isSpace) {
              return <Text key={index} style={styles.space}>{item.word}</Text>;
            }

            const analysisIndex = words.slice(0, index).filter(w => !w.isSpace).length;
            const isCurrent = analysisIndex === currentWordIndex;
            const isPast = analysisIndex < currentWordIndex;

            if (!item.analysis) return null;

            return (
              <WordComponent
                key={index}
                word={item.word}
                analysis={item.analysis}
                isCurrent={isCurrent}
                isPast={isPast}
                onPress={() => handleWordPress(analysisIndex, item.analysis!)}
              />
            );
          })}
        </View>
      </ScrollView>

      {/* Playback Controls */}
      <View style={styles.controls}>
        <LinearGradient
          colors={[colors.background.card, colors.background.elevated]}
          style={styles.controlsGradient}
        >
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(currentTime / duration) * 100}%` },
                ]}
              />
              <TouchableOpacity
                style={[
                  styles.progressThumb,
                  { left: `${(currentTime / duration) * 100}%` },
                ]}
                activeOpacity={0.8}
              />
            </View>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>

          {/* Control Buttons */}
          <View style={styles.buttonRow}>
            {/* Speed Control */}
            <View style={styles.speedControl}>
              {[0.5, 1.0, 1.5].map((speed) => (
                <TouchableOpacity
                  key={speed}
                  onPress={() => changeSpeed(speed)}
                  style={[
                    styles.speedButton,
                    playbackSpeed === speed && styles.speedButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.speedText,
                      playbackSpeed === speed && styles.speedTextActive,
                    ]}
                  >
                    {speed}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Play/Pause Button */}
            <TouchableOpacity
              onPress={togglePlayPause}
              style={styles.playButton}
            >
              <LinearGradient
                colors={colors.gradients.primary}
                style={styles.playButtonGradient}
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={32}
                  color={colors.text.primary}
                />
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.spacer} />
          </View>
        </LinearGradient>
      </View>

      {/* Word Popover Modal */}
      <Modal
        visible={showWordPopover}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWordPopover(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowWordPopover(false)}
        >
          <View style={styles.popover}>
            <LinearGradient
              colors={[colors.background.elevated, colors.background.card]}
              style={styles.popoverGradient}
            >
              {selectedWordIndex !== null && (
                <>
                  <Text style={styles.popoverWord}>
                    {wordAnalysis[selectedWordIndex].word}
                  </Text>

                  <TouchableOpacity
                    style={styles.popoverButton}
                    onPress={handleHearPronunciation}
                  >
                    <Ionicons name="volume-high" size={20} color={colors.primary.DEFAULT} />
                    <Text style={styles.popoverButtonText}>Hear correct pronunciation</Text>
                  </TouchableOpacity>

                  {onAddToWordBank && (
                    <TouchableOpacity
                      style={styles.popoverButton}
                      onPress={handleAddToWordBank}
                    >
                      <Ionicons name="bookmark-outline" size={20} color={colors.secondary.DEFAULT} />
                      <Text style={styles.popoverButtonText}>Add to Word Bank</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// Animated Word Component
interface WordComponentProps {
  word: string;
  analysis: WordAnalysis;
  isCurrent: boolean;
  isPast: boolean;
  onPress: () => void;
}

function WordComponent({ word, analysis, isCurrent, isPast, onPress }: WordComponentProps) {
  const pulseAnim = useSharedValue(0);

  useEffect(() => {
    if (isCurrent) {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 600, easing: Easing.ease }),
          withTiming(0, { duration: 600, easing: Easing.ease })
        ),
        -1,
        false
      );
    } else {
      pulseAnim.value = withTiming(0, { duration: 200 });
    }
  }, [isCurrent]);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulseAnim.value, [0, 1], [1, 1.05]);
    const glowOpacity = interpolate(pulseAnim.value, [0, 1], [0.3, 0.8]);

    return {
      transform: [{ scale }],
      shadowOpacity: isCurrent ? glowOpacity : 0,
    };
  });

  const wordColor = isPast || isCurrent
    ? STATUS_COLORS[analysis.status]
    : STATUS_COLORS.unreached;

  const shadowColor = STATUS_GLOWS[analysis.status];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Animated.View
        style={[
          styles.word,
          animatedStyle,
          {
            shadowColor: isCurrent ? shadowColor : 'transparent',
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 8,
            elevation: isCurrent ? 4 : 0,
          },
        ]}
      >
        <Text
          style={[
            styles.wordText,
            {
              color: wordColor,
              fontWeight: isCurrent ? typography.fontWeight.bold : typography.fontWeight.normal,
            },
          ]}
        >
          {word}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeline: {
    flexDirection: 'row',
    height: 8,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    backgroundColor: colors.background.card,
  },
  timelineSegment: {
    height: '100%',
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  textContent: {
    paddingBottom: spacing['2xl'],
  },
  wordsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  word: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    marginHorizontal: 2,
    marginVertical: 2,
    borderRadius: borderRadius.sm,
  },
  wordText: {
    fontSize: typography.fontSize.lg,
    lineHeight: typography.fontSize.lg * 1.5,
  },
  space: {
    fontSize: typography.fontSize.lg,
  },
  controls: {
    borderTopWidth: 1,
    borderTopColor: colors.border.dark,
  },
  controlsGradient: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xl,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  timeText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.medium,
    minWidth: 40,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.full,
    marginHorizontal: spacing.md,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: borderRadius.full,
  },
  progressThumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.DEFAULT,
    top: -6,
    marginLeft: -8,
    ...shadows.md,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  speedControl: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  speedButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.card,
  },
  speedButtonActive: {
    backgroundColor: colors.primary.DEFAULT,
  },
  speedText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.tertiary,
  },
  speedTextActive: {
    color: colors.text.primary,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    ...shadows.lg,
  },
  playButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacer: {
    width: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popover: {
    width: SCREEN_WIDTH - spacing['2xl'] * 2,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  popoverGradient: {
    padding: spacing.lg,
  },
  popoverWord: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  popoverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.card,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  popoverButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    flex: 1,
  },
});
