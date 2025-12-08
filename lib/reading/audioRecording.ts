/**
 * Audio Recording Utilities
 *
 * Comprehensive audio recording system for the Vox language learning app's
 * teleprompter feature. Optimized for speech recognition with Whisper API.
 *
 * Features:
 * - Audio recording with pause/resume
 * - Optimized settings for speech recognition (16kHz, mono)
 * - Playback functionality
 * - File management (delete, info, base64 conversion)
 * - Cross-platform support (iOS, Android, Web)
 *
 * @example
 * ```typescript
 * import { startRecording, stopRecording, playRecording } from '@/lib/reading/audioRecording';
 *
 * // Start recording
 * const recording = await startRecording();
 *
 * // Stop and get result
 * const result = await stopRecording(recording);
 * console.log('Recording URI:', result.uri);
 * console.log('Duration:', result.duration);
 *
 * // Play back
 * const sound = await playRecording(result.uri);
 * ```
 */

import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Current state of a recording session
 */
export interface RecordingState {
  /** Whether recording is currently in progress */
  isRecording: boolean;
  /** Whether recording is paused */
  isPaused: boolean;
  /** Current duration in milliseconds */
  duration: number;
  /** URI of the recording file (null if not yet saved) */
  uri: string | null;
}

/**
 * Result from a completed recording
 */
export interface RecordingResult {
  /** File system URI of the recording */
  uri: string;
  /** Total duration in milliseconds */
  duration: number;
  /** File size in bytes */
  fileSize: number;
}

/**
 * File information for a recording
 */
export interface RecordingFileInfo {
  /** File size in bytes */
  size: number;
  /** Whether the file exists */
  exists: boolean;
}

// ============================================================================
// RECORDING CONFIGURATION
// ============================================================================

/**
 * Recording configuration optimized for speech recognition
 *
 * Settings are tuned for Whisper API which works best with:
 * - 16kHz sample rate
 * - Mono audio (1 channel)
 * - High quality encoding
 */
const RECORDING_OPTIONS: Audio.RecordingOptions = {
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 16000, // Whisper works best with 16kHz
    numberOfChannels: 1, // Mono for speech
    bitRate: 128000,
  },
  ios: {
    extension: '.m4a',
    outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  },
};

// ============================================================================
// PERMISSION MANAGEMENT
// ============================================================================

/**
 * Request audio recording permissions from the user
 *
 * @returns Promise resolving to true if permission granted, false otherwise
 *
 * @example
 * ```typescript
 * const hasPermission = await requestAudioPermissions();
 * if (!hasPermission) {
 *   Alert.alert('Permission Required', 'Please allow microphone access');
 * }
 * ```
 */
export async function requestAudioPermissions(): Promise<boolean> {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting audio permissions:', error);
    return false;
  }
}

/**
 * Check if audio recording permissions are already granted
 *
 * @returns Promise resolving to true if permission granted, false otherwise
 */
export async function checkAudioPermissions(): Promise<boolean> {
  try {
    const { status } = await Audio.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking audio permissions:', error);
    return false;
  }
}

// ============================================================================
// RECORDING OPERATIONS
// ============================================================================

/**
 * Start a new audio recording
 *
 * Automatically sets up audio mode for recording and creates a new
 * Recording instance with optimized settings.
 *
 * @returns Promise resolving to the Recording instance
 * @throws Error if permissions not granted or recording fails to start
 *
 * @example
 * ```typescript
 * try {
 *   const recording = await startRecording();
 *   console.log('Recording started');
 * } catch (error) {
 *   console.error('Failed to start recording:', error);
 * }
 * ```
 */
export async function startRecording(): Promise<Audio.Recording> {
  try {
    // Check permissions first
    const hasPermission = await checkAudioPermissions();
    if (!hasPermission) {
      const granted = await requestAudioPermissions();
      if (!granted) {
        throw new Error('Audio recording permission not granted');
      }
    }

    // Set audio mode for recording
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    // Create and start recording
    const { recording } = await Audio.Recording.createAsync(
      RECORDING_OPTIONS,
      undefined,
      100 // Update interval in ms for status updates
    );

    return recording;
  } catch (error) {
    console.error('Error starting recording:', error);
    throw error;
  }
}

/**
 * Pause an active recording
 *
 * @param recording - The Recording instance to pause
 * @throws Error if recording is not in a pausable state
 *
 * @example
 * ```typescript
 * await pauseRecording(recording);
 * console.log('Recording paused');
 * ```
 */
export async function pauseRecording(recording: Audio.Recording): Promise<void> {
  try {
    const status = await recording.getStatusAsync();
    if (status.isRecording) {
      await recording.pauseAsync();
    }
  } catch (error) {
    console.error('Error pausing recording:', error);
    throw error;
  }
}

/**
 * Resume a paused recording
 *
 * @param recording - The Recording instance to resume
 * @throws Error if recording is not in a resumable state
 *
 * @example
 * ```typescript
 * await resumeRecording(recording);
 * console.log('Recording resumed');
 * ```
 */
export async function resumeRecording(recording: Audio.Recording): Promise<void> {
  try {
    const status = await recording.getStatusAsync();
    if (!status.isRecording && status.isDoneRecording === false) {
      await recording.startAsync();
    }
  } catch (error) {
    console.error('Error resuming recording:', error);
    throw error;
  }
}

/**
 * Stop recording and get the result
 *
 * Finalizes the recording, saves to file system, and returns
 * metadata including URI, duration, and file size.
 *
 * @param recording - The Recording instance to stop
 * @returns Promise resolving to RecordingResult with file details
 * @throws Error if recording fails to stop or file info cannot be retrieved
 *
 * @example
 * ```typescript
 * const result = await stopRecording(recording);
 * console.log('Saved to:', result.uri);
 * console.log('Duration:', result.duration, 'ms');
 * console.log('Size:', result.fileSize, 'bytes');
 * ```
 */
export async function stopRecording(
  recording: Audio.Recording
): Promise<RecordingResult> {
  try {
    // Stop the recording
    await recording.stopAndUnloadAsync();

    // Reset audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: false,
    });

    // Get recording URI and status
    const uri = recording.getURI();
    if (!uri) {
      throw new Error('Recording URI is null');
    }

    const status = await recording.getStatusAsync();
    const duration = status.durationMillis || 0;

    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(uri);
    const fileSize = fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0;

    return {
      uri,
      duration,
      fileSize,
    };
  } catch (error) {
    console.error('Error stopping recording:', error);
    throw error;
  }
}

/**
 * Get current recording status
 *
 * Returns detailed information about the recording state including
 * duration, whether it's recording, and other metadata.
 *
 * @param recording - The Recording instance to check
 * @returns Promise resolving to RecordingStatus
 *
 * @example
 * ```typescript
 * const status = await getRecordingStatus(recording);
 * console.log('Duration:', status.durationMillis);
 * console.log('Is recording:', status.isRecording);
 * ```
 */
export async function getRecordingStatus(
  recording: Audio.Recording
): Promise<Audio.RecordingStatus> {
  try {
    return await recording.getStatusAsync();
  } catch (error) {
    console.error('Error getting recording status:', error);
    throw error;
  }
}

// ============================================================================
// PLAYBACK OPERATIONS
// ============================================================================

/**
 * Play back a recording from a URI
 *
 * Creates a Sound instance and starts playback. Remember to unload
 * the sound when finished to free resources.
 *
 * @param uri - File system URI of the recording to play
 * @returns Promise resolving to the Sound instance
 * @throws Error if sound fails to load or play
 *
 * @example
 * ```typescript
 * const sound = await playRecording(recordingUri);
 *
 * // When done, unload the sound
 * await sound.unloadAsync();
 * ```
 */
export async function playRecording(uri: string): Promise<Audio.Sound> {
  try {
    // Set audio mode for playback
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });

    // Create and load sound
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true }
    );

    return sound;
  } catch (error) {
    console.error('Error playing recording:', error);
    throw error;
  }
}

/**
 * Stop playback of a sound
 *
 * @param sound - The Sound instance to stop
 *
 * @example
 * ```typescript
 * await stopPlayback(sound);
 * await sound.unloadAsync();
 * ```
 */
export async function stopPlayback(sound: Audio.Sound): Promise<void> {
  try {
    await sound.stopAsync();
  } catch (error) {
    console.error('Error stopping playback:', error);
    throw error;
  }
}

/**
 * Unload a sound to free resources
 *
 * Always call this when done with a sound to prevent memory leaks.
 *
 * @param sound - The Sound instance to unload
 *
 * @example
 * ```typescript
 * await unloadSound(sound);
 * ```
 */
export async function unloadSound(sound: Audio.Sound): Promise<void> {
  try {
    await sound.unloadAsync();
  } catch (error) {
    console.error('Error unloading sound:', error);
    throw error;
  }
}

// ============================================================================
// FILE MANAGEMENT
// ============================================================================

/**
 * Delete a recording file
 *
 * Permanently removes the recording from the file system.
 *
 * @param uri - File system URI of the recording to delete
 * @throws Error if file deletion fails
 *
 * @example
 * ```typescript
 * await deleteRecording(recordingUri);
 * console.log('Recording deleted');
 * ```
 */
export async function deleteRecording(uri: string): Promise<void> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  } catch (error) {
    console.error('Error deleting recording:', error);
    throw error;
  }
}

/**
 * Get file information for a recording
 *
 * @param uri - File system URI of the recording
 * @returns Promise resolving to file info (size and existence)
 *
 * @example
 * ```typescript
 * const info = await getRecordingInfo(recordingUri);
 * console.log('File exists:', info.exists);
 * console.log('File size:', info.size, 'bytes');
 * ```
 */
export async function getRecordingInfo(uri: string): Promise<RecordingFileInfo> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);

    return {
      size: fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0,
      exists: fileInfo.exists,
    };
  } catch (error) {
    console.error('Error getting recording info:', error);
    throw error;
  }
}

/**
 * Convert a recording to base64 encoding
 *
 * Useful for uploading to APIs that accept base64-encoded audio.
 *
 * @param uri - File system URI of the recording
 * @returns Promise resolving to base64-encoded string
 * @throws Error if file cannot be read or encoded
 *
 * @example
 * ```typescript
 * const base64 = await getRecordingBase64(recordingUri);
 * // Upload to API
 * await fetch('https://api.example.com/transcribe', {
 *   method: 'POST',
 *   body: JSON.stringify({ audio: base64 }),
 * });
 * ```
 */
export async function getRecordingBase64(uri: string): Promise<string> {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error('Error converting recording to base64:', error);
    throw error;
  }
}

/**
 * Move a recording to a permanent location
 *
 * Recordings are initially saved to a temporary directory. Use this
 * to move them to a permanent location for long-term storage.
 *
 * @param sourceUri - Current URI of the recording
 * @param destinationUri - Destination URI for the recording
 * @throws Error if file move fails
 *
 * @example
 * ```typescript
 * const tempUri = recording.getURI();
 * const permanentUri = `${FileSystem.documentDirectory}recordings/session_123.m4a`;
 * await moveRecording(tempUri, permanentUri);
 * ```
 */
export async function moveRecording(
  sourceUri: string,
  destinationUri: string
): Promise<void> {
  try {
    await FileSystem.moveAsync({
      from: sourceUri,
      to: destinationUri,
    });
  } catch (error) {
    console.error('Error moving recording:', error);
    throw error;
  }
}

/**
 * Move a recording from temporary storage to permanent storage
 *
 * expo-av saves recordings to a temporary cache directory by default.
 * This function automatically moves the recording to the app's document
 * directory to ensure it persists and isn't deleted by the system.
 *
 * @param tempUri - Temporary URI from recording.getURI()
 * @returns Promise resolving to the permanent URI
 * @throws Error if file move fails
 *
 * @example
 * ```typescript
 * const result = await stopRecording(recording);
 * const permanentUri = await moveRecordingToPermanentStorage(result.uri);
 * console.log('Recording saved to:', permanentUri);
 * ```
 */
export async function moveRecordingToPermanentStorage(
  tempUri: string
): Promise<string> {
  try {
    // Generate a unique filename with timestamp
    const filename = generateRecordingFilename('vox_recording');

    // Ensure the recordings directory exists
    const recordingsDir = `${FileSystem.documentDirectory}recordings/`;
    const dirInfo = await FileSystem.getInfoAsync(recordingsDir);

    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(recordingsDir, { intermediates: true });
    }

    // Create permanent URI
    const permanentUri = `${recordingsDir}${filename}`;

    // Move the file from temp to permanent location
    await FileSystem.moveAsync({
      from: tempUri,
      to: permanentUri,
    });

    console.log(`Recording moved from ${tempUri} to ${permanentUri}`);

    return permanentUri;
  } catch (error) {
    console.error('Error moving recording to permanent storage:', error);
    throw error;
  }
}

/**
 * Copy a recording to a new location
 *
 * Creates a copy of the recording at the specified destination.
 *
 * @param sourceUri - Current URI of the recording
 * @param destinationUri - Destination URI for the copy
 * @throws Error if file copy fails
 *
 * @example
 * ```typescript
 * const originalUri = recording.getURI();
 * const backupUri = `${FileSystem.documentDirectory}backups/recording_backup.m4a`;
 * await copyRecording(originalUri, backupUri);
 * ```
 */
export async function copyRecording(
  sourceUri: string,
  destinationUri: string
): Promise<void> {
  try {
    await FileSystem.copyAsync({
      from: sourceUri,
      to: destinationUri,
    });
  } catch (error) {
    console.error('Error copying recording:', error);
    throw error;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format duration in milliseconds to readable string
 *
 * @param durationMs - Duration in milliseconds
 * @returns Formatted string (e.g., "0:42", "2:15")
 *
 * @example
 * ```typescript
 * formatDuration(42000);  // "0:42"
 * formatDuration(135000); // "2:15"
 * formatDuration(3661000); // "61:01"
 * ```
 */
export function formatDuration(durationMs: number): string {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Validate that a recording URI is valid and accessible
 *
 * @param uri - File system URI to validate
 * @returns Promise resolving to true if valid, false otherwise
 *
 * @example
 * ```typescript
 * const isValid = await isValidRecordingUri(uri);
 * if (!isValid) {
 *   console.error('Invalid recording URI');
 * }
 * ```
 */
export async function isValidRecordingUri(uri: string): Promise<boolean> {
  try {
    if (!uri) return false;

    const fileInfo = await FileSystem.getInfoAsync(uri);
    return fileInfo.exists;
  } catch (error) {
    console.error('Error validating recording URI:', error);
    return false;
  }
}

/**
 * Get the file extension from a recording URI
 *
 * @param uri - File system URI
 * @returns File extension (e.g., ".m4a", ".webm")
 *
 * @example
 * ```typescript
 * const ext = getRecordingExtension(uri); // ".m4a"
 * ```
 */
export function getRecordingExtension(uri: string): string {
  const parts = uri.split('.');
  return parts.length > 1 ? `.${parts[parts.length - 1]}` : '';
}

/**
 * Generate a unique filename for a recording
 *
 * @param prefix - Optional prefix for the filename (default: "recording")
 * @returns Filename with timestamp and extension
 *
 * @example
 * ```typescript
 * const filename = generateRecordingFilename("session");
 * // "session_1701234567890.m4a"
 * ```
 */
export function generateRecordingFilename(prefix: string = 'recording'): string {
  const timestamp = Date.now();
  const extension = '.m4a'; // Default extension
  return `${prefix}_${timestamp}${extension}`;
}
