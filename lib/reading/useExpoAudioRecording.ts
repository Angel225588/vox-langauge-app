/**
 * useExpoAudioRecording Hook
 *
 * React hook for audio recording using expo-audio (SDK 53+).
 * This is the migration path from expo-av.
 *
 * expo-audio uses a hook-based API, so recording must be managed
 * within React components (not utility functions).
 *
 * @example
 * ```tsx
 * import { useExpoAudioRecording } from '@/lib/reading/useExpoAudioRecording';
 *
 * function RecordingComponent() {
 *   const {
 *     isRecording,
 *     isPaused,
 *     duration,
 *     startRecording,
 *     stopRecording,
 *     pauseRecording,
 *     resumeRecording,
 *   } = useExpoAudioRecording();
 *
 *   return (
 *     <Button onPress={isRecording ? stopRecording : startRecording}>
 *       {isRecording ? 'Stop' : 'Record'}
 *     </Button>
 *   );
 * }
 * ```
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  AudioModule,
  AudioQuality,
  IOSOutputFormat,
} from 'expo-audio';
import type { AudioRecorder, RecordingOptions } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';

// ============================================================================
// Types
// ============================================================================

export interface RecordingResult {
  /** File system URI of the recording */
  uri: string;
  /** Total duration in seconds */
  duration: number;
  /** File size in bytes */
  fileSize: number;
}

export interface UseExpoAudioRecordingOptions {
  /** Recording preset (default: HIGH_QUALITY) */
  preset?: RecordingOptions;

  /** Callback when recording stops */
  onRecordingComplete?: (result: RecordingResult) => void;

  /** Callback on error */
  onError?: (error: Error) => void;
}

export interface UseExpoAudioRecordingReturn {
  /** Whether recording is in progress */
  isRecording: boolean;

  /** Whether recording is paused */
  isPaused: boolean;

  /** Current recording duration in seconds */
  duration: number;

  /** Recording URI (available after recording starts) */
  uri: string | null;

  /** Whether permissions are granted */
  hasPermission: boolean;

  /** Request microphone permission */
  requestPermission: () => Promise<boolean>;

  /** Start recording */
  startRecording: () => Promise<void>;

  /** Stop recording and get result */
  stopRecording: () => Promise<RecordingResult | null>;

  /** Pause recording */
  pauseRecording: () => void;

  /** Resume recording */
  resumeRecording: () => void;

  /** Error if any */
  error: Error | null;
}

// ============================================================================
// Custom Recording Options (Whisper-optimized)
// ============================================================================

/**
 * Recording options optimized for Whisper API
 * - 16kHz sample rate
 * - Mono audio
 * - M4A/AAC format
 */
export const WHISPER_RECORDING_OPTIONS: RecordingOptions = {
  extension: '.m4a',
  sampleRate: 16000,
  numberOfChannels: 1,
  bitRate: 128000,
  ios: {
    outputFormat: IOSOutputFormat.MPEG4AAC,
    audioQuality: AudioQuality.HIGH,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  android: {
    outputFormat: 'mpeg4',
    audioEncoder: 'aac',
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  },
};

// ============================================================================
// Hook Implementation
// ============================================================================

export function useExpoAudioRecording(
  options: UseExpoAudioRecordingOptions = {}
): UseExpoAudioRecordingReturn {
  const {
    preset = WHISPER_RECORDING_OPTIONS,
    onRecordingComplete,
    onError,
  } = options;

  // State
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const startTimeRef = useRef<number>(0);

  // Use expo-audio hooks
  const recorder = useAudioRecorder(preset);
  const recorderState = useAudioRecorderState(recorder);

  // Check permissions on mount
  useEffect(() => {
    checkPermission();
  }, []);

  // Request permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      setHasPermission(status.granted);
      return status.granted;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Permission request failed');
      setError(error);
      onError?.(error);
      return false;
    }
  }, [onError]);

  // Check permission
  const checkPermission = useCallback(async (): Promise<boolean> => {
    try {
      const status = await AudioModule.getRecordingPermissionsAsync();
      setHasPermission(status.granted);
      return status.granted;
    } catch {
      return false;
    }
  }, []);

  // Start recording
  const startRecording = useCallback(async (): Promise<void> => {
    try {
      setError(null);

      // Ensure permission
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          throw new Error('Microphone permission not granted');
        }
      }

      // Configure audio mode
      await AudioModule.setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });

      // Prepare and start
      await recorder.prepareToRecordAsync();
      recorder.record();
      startTimeRef.current = Date.now();

      console.log('[useExpoAudioRecording] Recording started');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start recording');
      setError(error);
      onError?.(error);
      throw error;
    }
  }, [hasPermission, recorder, requestPermission, onError]);

  // Stop recording
  const stopRecording = useCallback(async (): Promise<RecordingResult | null> => {
    try {
      if (!recorderState.isRecording && !recorder.uri) {
        return null;
      }

      // Stop recording
      await recorder.stop();

      // Reset audio mode
      await AudioModule.setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
      });

      const uri = recorder.uri;
      if (!uri) {
        throw new Error('Recording URI is null');
      }

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(uri);
      const fileSize = fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0;

      const result: RecordingResult = {
        uri,
        duration: recorderState.durationMillis / 1000, // Convert ms to seconds
        fileSize,
      };

      console.log('[useExpoAudioRecording] Recording stopped:', result);
      onRecordingComplete?.(result);

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to stop recording');
      setError(error);
      onError?.(error);
      return null;
    }
  }, [recorder, recorderState, onRecordingComplete, onError]);

  // Pause recording
  const pauseRecording = useCallback((): void => {
    try {
      recorder.pause();
      console.log('[useExpoAudioRecording] Recording paused');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to pause recording');
      setError(error);
      onError?.(error);
    }
  }, [recorder, onError]);

  // Resume recording
  const resumeRecording = useCallback((): void => {
    try {
      recorder.record();
      console.log('[useExpoAudioRecording] Recording resumed');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to resume recording');
      setError(error);
      onError?.(error);
    }
  }, [recorder, onError]);

  return {
    isRecording: recorderState.isRecording,
    isPaused: !recorderState.isRecording && recorder.uri !== null,
    duration: recorderState.durationMillis / 1000, // Convert ms to seconds
    uri: recorder.uri,
    hasPermission,
    requestPermission,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    error,
  };
}

// ============================================================================
// Utility Functions (work outside React)
// ============================================================================

/**
 * Move recording to permanent storage
 */
export async function moveRecordingToPermanentStorage(
  tempUri: string
): Promise<string> {
  const recordingsDir = `${FileSystem.documentDirectory}recordings/`;

  // Ensure directory exists
  const dirInfo = await FileSystem.getInfoAsync(recordingsDir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(recordingsDir, { intermediates: true });
  }

  // Create unique filename
  const timestamp = Date.now();
  const filename = `vox_recording_${timestamp}.m4a`;
  const permanentUri = `${recordingsDir}${filename}`;

  // Move file
  await FileSystem.moveAsync({
    from: tempUri,
    to: permanentUri,
  });

  return permanentUri;
}

/**
 * Delete a recording file
 */
export async function deleteRecordingFile(uri: string): Promise<void> {
  const fileInfo = await FileSystem.getInfoAsync(uri);
  if (fileInfo.exists) {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  }
}

/**
 * Get recording file info
 */
export async function getRecordingInfo(
  uri: string
): Promise<{ exists: boolean; size: number }> {
  const fileInfo = await FileSystem.getInfoAsync(uri);
  return {
    exists: fileInfo.exists,
    size: fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0,
  };
}

/**
 * Convert recording to base64
 */
export async function getRecordingBase64(uri: string): Promise<string> {
  return FileSystem.readAsStringAsync(uri, {
    encoding: 'base64' as const,
  });
}
