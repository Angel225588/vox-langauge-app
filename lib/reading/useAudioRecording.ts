/**
 * Audio Recording React Hook
 *
 * Custom hook for managing audio recording state in React components.
 * Provides a complete interface for recording audio with play/pause,
 * duration tracking, playback, and error handling.
 *
 * Features:
 * - Automatic permission handling
 * - Real-time duration updates
 * - Recording state management
 * - Playback controls
 * - Cleanup on unmount
 * - Error handling with user-friendly messages
 *
 * @example
 * ```tsx
 * import { useAudioRecording } from '@/lib/reading';
 *
 * function RecordingScreen() {
 *   const {
 *     isRecording,
 *     isPaused,
 *     duration,
 *     startRecording,
 *     pauseRecording,
 *     stopRecording,
 *     formatDuration,
 *   } = useAudioRecording();
 *
 *   return (
 *     <View>
 *       <Text>{formatDuration(duration)}</Text>
 *       <Button onPress={startRecording}>Start</Button>
 *       {isRecording && (
 *         <>
 *           <Button onPress={pauseRecording}>
 *             {isPaused ? 'Resume' : 'Pause'}
 *           </Button>
 *           <Button onPress={stopRecording}>Stop</Button>
 *         </>
 *       )}
 *     </View>
 *   );
 * }
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Audio } from 'expo-av';
import * as audioRecording from './audioRecording';
import type { RecordingResult } from './audioRecording';

// ============================================================================
// HOOK INTERFACE
// ============================================================================

/**
 * Return type for useAudioRecording hook
 */
export interface UseAudioRecordingReturn {
  // ===== State =====
  /** Whether recording is currently active */
  isRecording: boolean;
  /** Whether recording is paused */
  isPaused: boolean;
  /** Current recording duration in milliseconds */
  duration: number;
  /** URI of the last completed recording */
  recordingUri: string | null;
  /** Current error message, if any */
  error: string | null;

  // ===== Permissions =====
  /** Whether audio recording permission is granted */
  hasPermission: boolean;
  /** Request audio recording permission */
  requestPermission: () => Promise<boolean>;

  // ===== Recording Controls =====
  /** Start a new recording session */
  startRecording: () => Promise<void>;
  /** Pause the current recording */
  pauseRecording: () => Promise<void>;
  /** Resume a paused recording */
  resumeRecording: () => Promise<void>;
  /** Stop recording and get the result */
  stopRecording: () => Promise<RecordingResult | null>;
  /** Cancel the current recording without saving */
  cancelRecording: () => Promise<void>;

  // ===== Playback =====
  /** Play back the last recording */
  playRecording: () => Promise<void>;
  /** Stop playback */
  stopPlayback: () => Promise<void>;
  /** Whether playback is active */
  isPlaying: boolean;

  // ===== Utilities =====
  /** Format duration in ms to "M:SS" format */
  formatDuration: (ms: number) => string;
  /** Reset all state to initial values */
  reset: () => void;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Custom hook for managing audio recording
 *
 * Handles the complete lifecycle of audio recording including:
 * - Permission requests
 * - Recording start/stop/pause/resume
 * - Duration tracking with automatic updates
 * - Playback of recordings
 * - Error handling
 * - Resource cleanup
 *
 * @returns UseAudioRecordingReturn interface with state and controls
 *
 * @example
 * ```tsx
 * const {
 *   isRecording,
 *   duration,
 *   startRecording,
 *   stopRecording,
 *   error,
 * } = useAudioRecording();
 *
 * // Handle errors
 * useEffect(() => {
 *   if (error) {
 *     Alert.alert('Recording Error', error);
 *   }
 * }, [error]);
 * ```
 */
export function useAudioRecording(): UseAudioRecordingReturn {
  // ===== State =====
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // ===== Refs =====
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ===== Permission Management =====

  /**
   * Check and request permissions on mount
   */
  useEffect(() => {
    checkPermissions();
  }, []);

  /**
   * Check if permissions are already granted
   */
  const checkPermissions = async () => {
    try {
      const granted = await audioRecording.checkAudioPermissions();
      setHasPermission(granted);
    } catch (err) {
      console.error('Error checking permissions:', err);
      setHasPermission(false);
    }
  };

  /**
   * Request audio recording permission
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const granted = await audioRecording.requestAudioPermissions();
      setHasPermission(granted);

      if (!granted) {
        setError('Microphone permission is required for recording');
      }

      return granted;
    } catch (err) {
      const errorMessage = 'Failed to request microphone permission';
      console.error(errorMessage, err);
      setError(errorMessage);
      return false;
    }
  }, []);

  // ===== Duration Tracking =====

  /**
   * Start tracking duration updates
   */
  const startDurationTracking = useCallback(() => {
    // Clear any existing interval
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }

    // Update duration every 100ms
    durationIntervalRef.current = setInterval(async () => {
      if (recordingRef.current) {
        try {
          const status = await audioRecording.getRecordingStatus(
            recordingRef.current
          );
          setDuration(status.durationMillis || 0);
        } catch (err) {
          console.error('Error getting recording status:', err);
        }
      }
    }, 100);
  }, []);

  /**
   * Stop tracking duration updates
   */
  const stopDurationTracking = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, []);

  // ===== Recording Controls =====

  /**
   * Start a new recording
   */
  const startRecording = useCallback(async () => {
    try {
      setError(null);

      // Check permissions
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          return;
        }
      }

      // Stop any existing playback
      if (soundRef.current) {
        await audioRecording.stopPlayback(soundRef.current);
        await audioRecording.unloadSound(soundRef.current);
        soundRef.current = null;
        setIsPlaying(false);
      }

      // Start recording
      const recording = await audioRecording.startRecording();
      recordingRef.current = recording;
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      setRecordingUri(null);

      // Start duration tracking
      startDurationTracking();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to start recording';
      console.error('Error starting recording:', err);
      setError(errorMessage);
      setIsRecording(false);
    }
  }, [hasPermission, requestPermission, startDurationTracking]);

  /**
   * Pause the current recording
   */
  const pauseRecording = useCallback(async () => {
    if (!recordingRef.current || !isRecording || isPaused) return;

    try {
      setError(null);
      await audioRecording.pauseRecording(recordingRef.current);
      setIsPaused(true);
      stopDurationTracking();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to pause recording';
      console.error('Error pausing recording:', err);
      setError(errorMessage);
    }
  }, [isRecording, isPaused, stopDurationTracking]);

  /**
   * Resume a paused recording
   */
  const resumeRecording = useCallback(async () => {
    if (!recordingRef.current || !isRecording || !isPaused) return;

    try {
      setError(null);
      await audioRecording.resumeRecording(recordingRef.current);
      setIsPaused(false);
      startDurationTracking();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to resume recording';
      console.error('Error resuming recording:', err);
      setError(errorMessage);
    }
  }, [isRecording, isPaused, startDurationTracking]);

  /**
   * Stop recording and get the result
   */
  const stopRecording = useCallback(async (): Promise<RecordingResult | null> => {
    if (!recordingRef.current || !isRecording) return null;

    try {
      setError(null);
      stopDurationTracking();

      const result = await audioRecording.stopRecording(recordingRef.current);

      // CRITICAL FIX: Move recording from temporary location to permanent storage
      // expo-av saves recordings to a temporary directory by default
      // We need to move it to documentDirectory to prevent it from being deleted
      const permanentUri = await audioRecording.moveRecordingToPermanentStorage(result.uri);

      recordingRef.current = null;
      setIsRecording(false);
      setIsPaused(false);
      setRecordingUri(permanentUri);
      setDuration(result.duration);

      return {
        ...result,
        uri: permanentUri,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to stop recording';
      console.error('Error stopping recording:', err);
      setError(errorMessage);
      return null;
    }
  }, [isRecording, stopDurationTracking]);

  /**
   * Cancel the current recording
   */
  const cancelRecording = useCallback(async () => {
    if (!recordingRef.current) return;

    try {
      setError(null);
      stopDurationTracking();

      // Stop and get the URI
      const result = await audioRecording.stopRecording(recordingRef.current);

      // Delete the recording file
      if (result.uri) {
        await audioRecording.deleteRecording(result.uri);
      }

      recordingRef.current = null;
      setIsRecording(false);
      setIsPaused(false);
      setDuration(0);
      setRecordingUri(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to cancel recording';
      console.error('Error canceling recording:', err);
      setError(errorMessage);
    }
  }, [stopDurationTracking]);

  // ===== Playback Controls =====

  /**
   * Play back the last recording
   */
  const playRecording = useCallback(async () => {
    if (!recordingUri) {
      setError('No recording available to play');
      return;
    }

    try {
      setError(null);

      // Stop existing playback if any
      if (soundRef.current) {
        await audioRecording.stopPlayback(soundRef.current);
        await audioRecording.unloadSound(soundRef.current);
        soundRef.current = null;
      }

      // Start playback
      const sound = await audioRecording.playRecording(recordingUri);
      soundRef.current = sound;
      setIsPlaying(true);

      // Set up playback completion handler
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to play recording';
      console.error('Error playing recording:', err);
      setError(errorMessage);
      setIsPlaying(false);
    }
  }, [recordingUri]);

  /**
   * Stop playback
   */
  const stopPlayback = useCallback(async () => {
    if (!soundRef.current) return;

    try {
      setError(null);
      await audioRecording.stopPlayback(soundRef.current);
      await audioRecording.unloadSound(soundRef.current);
      soundRef.current = null;
      setIsPlaying(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to stop playback';
      console.error('Error stopping playback:', err);
      setError(errorMessage);
    }
  }, []);

  // ===== Utilities =====

  /**
   * Format duration in milliseconds to "M:SS" format
   */
  const formatDuration = useCallback((ms: number): string => {
    return audioRecording.formatDuration(ms);
  }, []);

  /**
   * Reset all state to initial values
   */
  const reset = useCallback(() => {
    stopDurationTracking();
    recordingRef.current = null;
    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
    setRecordingUri(null);
    setError(null);
    setIsPlaying(false);
  }, [stopDurationTracking]);

  // ===== Cleanup =====

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Stop duration tracking
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }

      // Clean up recording
      // Note: If stopRecording was called successfully, recordingRef.current
      // will be null, so this won't run. This is only for cleanup when
      // component unmounts while still recording (edge case)
      if (recordingRef.current) {
        recordingRef.current
          .stopAndUnloadAsync()
          .catch((err) => console.error('Error cleaning up recording:', err));
      }

      // Clean up playback
      if (soundRef.current) {
        soundRef.current
          .unloadAsync()
          .catch((err) => console.error('Error cleaning up sound:', err));
      }
    };
  }, []);

  // ===== Return =====

  return {
    // State
    isRecording,
    isPaused,
    duration,
    recordingUri,
    error,

    // Permissions
    hasPermission,
    requestPermission,

    // Recording controls
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,

    // Playback
    playRecording,
    stopPlayback,
    isPlaying,

    // Utilities
    formatDuration,
    reset,
  };
}
