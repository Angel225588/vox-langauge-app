/**
 * Audio Playback React Hook
 *
 * Custom hook for managing audio playback with word-level synchronization.
 * Provides playback controls, position tracking, and automatic highlighting
 * of words based on playback position.
 *
 * Features:
 * - Audio playback with play/pause/stop controls
 * - Position tracking with millisecond precision
 * - Word-level synchronization with timestamps
 * - Playback speed adjustment (0.5x, 1x, 1.5x)
 * - Automatic word highlighting during playback
 * - Seek functionality
 * - Cleanup on unmount
 *
 * @example
 * ```tsx
 * import { useAudioPlayback } from '@/lib/reading';
 *
 * function PlaybackScreen() {
 *   const {
 *     isPlaying,
 *     currentPosition,
 *     duration,
 *     currentWordIndex,
 *     play,
 *     pause,
 *     stop,
 *     seek,
 *   } = useAudioPlayback({
 *     uri: recordingUri,
 *     words: transcriptionWords,
 *     onWordChange: (index) => console.log('Current word:', index),
 *   });
 *
 *   return (
 *     <View>
 *       <Text>Word {currentWordIndex + 1}</Text>
 *       <Button onPress={play}>Play</Button>
 *       <Button onPress={pause}>Pause</Button>
 *       <Button onPress={stop}>Stop</Button>
 *     </View>
 *   );
 * }
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Audio } from 'expo-av';

// ============================================================================
// HOOK INTERFACE
// ============================================================================

/**
 * Word with timestamp information from Whisper transcription
 */
export interface WordWithTimestamp {
  word: string;
  startTime: number; // ms
  endTime: number; // ms
  status: 'correct' | 'hesitation' | 'mispronounced' | 'skipped';
}

/**
 * Options for useAudioPlayback hook
 */
export interface UseAudioPlaybackOptions {
  /** URI of the audio file to play */
  uri: string;
  /** Array of words with timestamp information */
  words: WordWithTimestamp[];
  /** Callback when the active word changes */
  onWordChange?: (index: number) => void;
  /** Callback when playback completes */
  onComplete?: () => void;
}

/**
 * Return type for useAudioPlayback hook
 */
export interface UseAudioPlaybackReturn {
  // ===== State =====
  /** Whether audio is currently playing */
  isPlaying: boolean;
  /** Whether audio is paused */
  isPaused: boolean;
  /** Current playback position in milliseconds */
  currentPosition: number;
  /** Total duration in milliseconds */
  duration: number;
  /** Index of the currently active word */
  currentWordIndex: number;
  /** Current playback speed (0.5, 1.0, 1.5) */
  playbackSpeed: number;

  // ===== Controls =====
  /** Start or resume playback */
  play: () => Promise<void>;
  /** Pause playback */
  pause: () => Promise<void>;
  /** Stop playback and reset position */
  stop: () => Promise<void>;
  /** Seek to a specific position in milliseconds */
  seek: (position: number) => Promise<void>;
  /** Set playback speed */
  setSpeed: (speed: number) => void;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Custom hook for managing audio playback with word-level synchronization
 *
 * Handles the complete lifecycle of audio playback including:
 * - Loading and unloading audio
 * - Play/pause/stop controls
 * - Position tracking with automatic updates
 * - Word-level synchronization based on timestamps
 * - Playback speed adjustment
 * - Resource cleanup
 *
 * @param options - Configuration options
 * @returns UseAudioPlaybackReturn interface with state and controls
 *
 * @example
 * ```tsx
 * const {
 *   isPlaying,
 *   currentWordIndex,
 *   play,
 *   pause,
 * } = useAudioPlayback({
 *   uri: audioUri,
 *   words: transcriptionWords,
 *   onWordChange: (index) => {
 *     scrollToWord(index);
 *   },
 * });
 * ```
 */
export function useAudioPlayback({
  uri,
  words,
  onWordChange,
  onComplete,
}: UseAudioPlaybackOptions): UseAudioPlaybackReturn {
  // ===== State =====
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  // ===== Refs =====
  const soundRef = useRef<Audio.Sound | null>(null);
  const positionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousWordIndexRef = useRef<number>(-1);

  // ===== Audio Setup =====

  /**
   * Load the audio file
   */
  const loadAudio = useCallback(async () => {
    try {
      // Unload any existing sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Set audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Create and load the sound
      const { sound, status } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false, rate: playbackSpeed },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;

      // Get duration if loaded
      if (status.isLoaded) {
        setDuration(status.durationMillis || 0);
      }
    } catch (error) {
      console.error('Error loading audio:', error);
      throw error;
    }
  }, [uri, playbackSpeed]);

  /**
   * Initialize audio on mount or when URI changes
   */
  useEffect(() => {
    loadAudio();

    return () => {
      // Cleanup on unmount
      if (soundRef.current) {
        soundRef.current
          .unloadAsync()
          .catch((err) => console.error('Error unloading sound:', err));
      }
    };
  }, [loadAudio]);

  // ===== Position Tracking =====

  /**
   * Start tracking playback position
   */
  const startPositionTracking = useCallback(() => {
    // Clear any existing interval
    if (positionIntervalRef.current) {
      clearInterval(positionIntervalRef.current);
    }

    // Update position every 50ms for smooth tracking
    positionIntervalRef.current = setInterval(async () => {
      if (soundRef.current) {
        try {
          const status = await soundRef.current.getStatusAsync();
          if (status.isLoaded && status.isPlaying) {
            setCurrentPosition(status.positionMillis || 0);
          }
        } catch (err) {
          console.error('Error getting playback position:', err);
        }
      }
    }, 50);
  }, []);

  /**
   * Stop tracking playback position
   */
  const stopPositionTracking = useCallback(() => {
    if (positionIntervalRef.current) {
      clearInterval(positionIntervalRef.current);
      positionIntervalRef.current = null;
    }
  }, []);

  /**
   * Cleanup interval on unmount
   */
  useEffect(() => {
    return () => {
      if (positionIntervalRef.current) {
        clearInterval(positionIntervalRef.current);
      }
    };
  }, []);

  // ===== Word Synchronization =====

  /**
   * Find the current word index based on playback position
   */
  const findCurrentWordIndex = useCallback(
    (position: number): number => {
      if (words.length === 0) return -1;

      // Find the word that contains the current position
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (position >= word.startTime && position <= word.endTime) {
          return i;
        }
      }

      // If position is before all words, return -1
      if (position < words[0].startTime) {
        return -1;
      }

      // If position is after all words, return the last word
      if (position > words[words.length - 1].endTime) {
        return words.length - 1;
      }

      // Find the closest word (in case of gaps between words)
      let closestIndex = -1;
      let closestDistance = Infinity;

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const distance = Math.min(
          Math.abs(position - word.startTime),
          Math.abs(position - word.endTime)
        );

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      }

      return closestIndex;
    },
    [words]
  );

  /**
   * Update current word index based on position
   */
  useEffect(() => {
    const newWordIndex = findCurrentWordIndex(currentPosition);

    if (newWordIndex !== previousWordIndexRef.current) {
      setCurrentWordIndex(newWordIndex);
      previousWordIndexRef.current = newWordIndex;

      // Call onWordChange callback
      if (onWordChange && newWordIndex !== -1) {
        onWordChange(newWordIndex);
      }
    }
  }, [currentPosition, findCurrentWordIndex, onWordChange]);

  // ===== Playback Status Handler =====

  /**
   * Handle playback status updates from expo-av
   */
  const onPlaybackStatusUpdate = useCallback(
    (status: any) => {
      if (!status.isLoaded) {
        // Handle errors
        if (status.error) {
          console.error('Playback error:', status.error);
        }
        return;
      }

      // Update duration
      if (status.durationMillis) {
        setDuration(status.durationMillis);
      }

      // Update position
      if (status.positionMillis !== undefined) {
        setCurrentPosition(status.positionMillis);
      }

      // Handle playback completion
      if (status.didJustFinish) {
        setIsPlaying(false);
        setIsPaused(false);
        stopPositionTracking();

        if (onComplete) {
          onComplete();
        }
      }
    },
    [onComplete, stopPositionTracking]
  );

  // ===== Playback Controls =====

  /**
   * Start or resume playback
   */
  const play = useCallback(async () => {
    if (!soundRef.current) {
      await loadAudio();
      if (!soundRef.current) return;
    }

    try {
      await soundRef.current.playAsync();
      setIsPlaying(true);
      setIsPaused(false);
      startPositionTracking();
    } catch (error) {
      console.error('Error playing audio:', error);
      throw error;
    }
  }, [loadAudio, startPositionTracking]);

  /**
   * Pause playback
   */
  const pause = useCallback(async () => {
    if (!soundRef.current || !isPlaying) return;

    try {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
      setIsPaused(true);
      stopPositionTracking();
    } catch (error) {
      console.error('Error pausing audio:', error);
      throw error;
    }
  }, [isPlaying, stopPositionTracking]);

  /**
   * Stop playback and reset position
   */
  const stop = useCallback(async () => {
    if (!soundRef.current) return;

    try {
      await soundRef.current.stopAsync();
      await soundRef.current.setPositionAsync(0);
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentPosition(0);
      setCurrentWordIndex(-1);
      previousWordIndexRef.current = -1;
      stopPositionTracking();
    } catch (error) {
      console.error('Error stopping audio:', error);
      throw error;
    }
  }, [stopPositionTracking]);

  /**
   * Seek to a specific position in milliseconds
   */
  const seek = useCallback(
    async (position: number) => {
      if (!soundRef.current) return;

      try {
        // Clamp position to valid range
        const clampedPosition = Math.max(0, Math.min(position, duration));

        await soundRef.current.setPositionAsync(clampedPosition);
        setCurrentPosition(clampedPosition);

        // Update word index immediately after seeking
        const newWordIndex = findCurrentWordIndex(clampedPosition);
        if (newWordIndex !== previousWordIndexRef.current) {
          setCurrentWordIndex(newWordIndex);
          previousWordIndexRef.current = newWordIndex;

          if (onWordChange && newWordIndex !== -1) {
            onWordChange(newWordIndex);
          }
        }
      } catch (error) {
        console.error('Error seeking audio:', error);
        throw error;
      }
    },
    [duration, findCurrentWordIndex, onWordChange]
  );

  /**
   * Set playback speed
   */
  const setSpeed = useCallback(
    async (speed: number) => {
      // Validate speed (0.5x, 1x, 1.5x are common values)
      const validSpeed = Math.max(0.5, Math.min(speed, 2.0));

      if (!soundRef.current) {
        setPlaybackSpeed(validSpeed);
        return;
      }

      try {
        await soundRef.current.setRateAsync(validSpeed, true);
        setPlaybackSpeed(validSpeed);
      } catch (error) {
        console.error('Error setting playback speed:', error);
        throw error;
      }
    },
    []
  );

  // ===== Return =====

  return {
    // State
    isPlaying,
    isPaused,
    currentPosition,
    duration,
    currentWordIndex,
    playbackSpeed,

    // Controls
    play,
    pause,
    stop,
    seek,
    setSpeed,
  };
}
