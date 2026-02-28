/**
 * LyricsSubtitleDisplay — Spotify-style auto-highlighting subtitle display
 *
 * Active line = bright white + larger font.
 * Past lines = dimmed. Future lines = very faint.
 * Inline translation below each line (toggleable).
 * Auto-scrolls to the active line.
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  LayoutChangeEvent,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LISTENING } from './theme';

export interface LyricsDialogueLine {
  speaker: string;
  text: string;
  translation: string;
}

interface LyricsSubtitleDisplayProps {
  dialogueLines: LyricsDialogueLine[];
  currentLineIndex: number;
  /** Audio progress 0-1 */
  audioProgress: number;
  /** Total duration in seconds */
  audioDuration: number;
  /** Current time in seconds */
  audioCurrentTime: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function LyricsSubtitleDisplay({
  dialogueLines,
  currentLineIndex,
  audioProgress,
  audioDuration,
  audioCurrentTime,
}: LyricsSubtitleDisplayProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [translationVisible, setTranslationVisible] = useState(true);
  const linePositions = useRef<Record<number, number>>({});

  const toggleTranslation = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTranslationVisible(prev => !prev);
  }, []);

  // Auto-scroll to active line
  useEffect(() => {
    const yPos = linePositions.current[currentLineIndex];
    if (yPos !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({ y: Math.max(0, yPos - 80), animated: true });
    }
  }, [currentLineIndex]);

  const handleLineLayout = useCallback((index: number, event: LayoutChangeEvent) => {
    linePositions.current[index] = event.nativeEvent.layout.y;
  }, []);

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      {/* Translation toggle */}
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>
          Translation{' '}
          <Text style={translationVisible ? styles.toggleOn : styles.toggleOff}>
            {translationVisible ? 'ON' : 'OFF'}
          </Text>
        </Text>
        <TouchableOpacity
          onPress={toggleTranslation}
          activeOpacity={0.7}
          accessibilityLabel={`Translation ${translationVisible ? 'on' : 'off'}. Tap to toggle.`}
          accessibilityRole="switch"
          accessibilityState={{ checked: translationVisible }}
        >
          <View
            style={[
              styles.toggleTrack,
              translationVisible && styles.toggleTrackOn,
            ]}
          >
            <View
              style={[
                styles.toggleThumb,
                translationVisible && styles.toggleThumbOn,
              ]}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={styles.progressRow}>
        <Text style={styles.progressTime}>{formatTime(audioCurrentTime)}</Text>
        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${audioProgress * 100}%` }]}
          />
        </View>
        <Text style={styles.progressTime}>{formatTime(audioDuration)}</Text>
      </View>

      {/* Lyrics */}
      <ScrollView
        ref={scrollRef}
        style={styles.lyricsScroll}
        contentContainerStyle={styles.lyricsContent}
        showsVerticalScrollIndicator={false}
      >
        {dialogueLines.map((line, index) => {
          const isActive = index === currentLineIndex;
          const isPast = index < currentLineIndex;
          const isFuture = index > currentLineIndex;

          return (
            <View
              key={index}
              style={styles.lyricLine}
              onLayout={(e) => handleLineLayout(index, e)}
            >
              <Text
                style={[
                  styles.speaker,
                  isActive && styles.speakerActive,
                  isPast && styles.speakerPast,
                ]}
              >
                {line.speaker}
              </Text>
              <Text
                style={[
                  styles.targetText,
                  isActive && styles.targetTextActive,
                  isPast && styles.targetTextPast,
                  isFuture && styles.targetTextFuture,
                ]}
              >
                {line.text}
              </Text>
              {translationVisible && (
                <Text
                  style={[
                    styles.nativeText,
                    isActive && styles.nativeTextActive,
                    isPast && styles.nativeTextPast,
                  ]}
                >
                  {line.translation}
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Toggle
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    marginBottom: 4,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: LISTENING.textTertiary,
  },
  toggleOn: {
    color: LISTENING.teal,
  },
  toggleOff: {
    color: LISTENING.textDisabled,
  },
  toggleTrack: {
    width: 42,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleTrackOn: {
    backgroundColor: 'rgba(6, 214, 160, 0.25)',
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: LISTENING.textDisabled,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbOn: {
    backgroundColor: LISTENING.teal,
    alignSelf: 'flex-end',
  },

  // Progress bar
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  progressTime: {
    fontSize: 11,
    fontWeight: '600',
    color: LISTENING.textDisabled,
    fontVariant: ['tabular-nums'],
    minWidth: 32,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: LISTENING.teal,
    borderRadius: 2,
  },

  // Lyrics
  lyricsScroll: {
    flex: 1,
  },
  lyricsContent: {
    paddingHorizontal: 4,
    paddingBottom: 16,
  },
  lyricLine: {
    paddingVertical: 10,
  },

  // Speaker tag
  speaker: {
    fontSize: 10,
    fontWeight: '700',
    color: LISTENING.teal,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
    opacity: 0.5,
  },
  speakerActive: {
    opacity: 1,
  },
  speakerPast: {
    opacity: 0.4,
  },

  // Target language text
  targetText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.18)',
    lineHeight: 25,
  },
  targetTextActive: {
    color: '#F9FAFB',
    fontSize: 20,
  },
  targetTextPast: {
    color: 'rgba(255, 255, 255, 0.40)',
  },
  targetTextFuture: {
    color: 'rgba(255, 255, 255, 0.18)',
  },

  // Native translation
  nativeText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.0)',
    lineHeight: 18,
    marginTop: 3,
  },
  nativeTextActive: {
    color: 'rgba(6, 214, 160, 0.60)',
  },
  nativeTextPast: {
    color: 'rgba(6, 214, 160, 0.30)',
  },
});
