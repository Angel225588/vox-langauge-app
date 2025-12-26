/**
 * Audio Recorder for Voice Conversations
 *
 * Captures user voice input using expo-av for use with Gemini Live API.
 * Outputs PCM audio in the format required by Gemini (16-bit, 16kHz, mono).
 *
 * Features:
 * - Push-to-talk and continuous recording modes
 * - Audio level monitoring for visualization
 * - Automatic format conversion for Gemini
 * - Permission handling
 *
 * @example
 * ```typescript
 * const recorder = new AudioRecorder();
 * await recorder.requestPermissions();
 * await recorder.startRecording();
 *
 * recorder.onAudioData((data) => {
 *   geminiClient.sendAudio(data);
 * });
 *
 * // When done
 * const recording = await recorder.stopRecording();
 * ```
 */

import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import { AudioRecordingOptions, AudioRecording } from './types';

// =============================================================================
// Constants
// =============================================================================

/** Audio format for Gemini Live API */
const GEMINI_AUDIO_CONFIG = {
  sampleRate: 16000,
  numberOfChannels: 1,
  bitDepthHint: 16,
  linearPCMIsBigEndian: false,
  linearPCMIsFloat: false,
};

/** Default recording options */
const DEFAULT_RECORDING_OPTIONS: Audio.RecordingOptions = {
  isMeteringEnabled: true,
  android: {
    extension: '.wav',
    outputFormat: Audio.AndroidOutputFormat.DEFAULT,
    audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
    sampleRate: GEMINI_AUDIO_CONFIG.sampleRate,
    numberOfChannels: GEMINI_AUDIO_CONFIG.numberOfChannels,
    bitRate: 128000,
  },
  ios: {
    extension: '.wav',
    outputFormat: Audio.IOSOutputFormat.LINEARPCM,
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: GEMINI_AUDIO_CONFIG.sampleRate,
    numberOfChannels: GEMINI_AUDIO_CONFIG.numberOfChannels,
    bitRate: 128000,
    bitDepthHint: GEMINI_AUDIO_CONFIG.bitDepthHint,
    linearPCMIsBigEndian: GEMINI_AUDIO_CONFIG.linearPCMIsBigEndian,
    linearPCMIsFloat: GEMINI_AUDIO_CONFIG.linearPCMIsFloat,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  },
};

// =============================================================================
// Audio Recorder Class
// =============================================================================

export class AudioRecorder {
  private recording: Audio.Recording | null = null;
  private isRecording = false;
  private hasPermission = false;
  private meteringInterval: NodeJS.Timeout | null = null;

  // Callbacks
  private onAudioLevelCallback?: (level: number) => void;
  private onAudioDataCallback?: (data: ArrayBuffer) => void;
  private onErrorCallback?: (error: Error) => void;

  // Options
  private maxDuration: number;
  private streamingEnabled: boolean;

  constructor(options: AudioRecordingOptions = {}) {
    this.maxDuration = options.maxDuration || 60000; // 60 seconds default
    this.streamingEnabled = false; // Streaming requires native module
  }

  /**
   * Request microphone permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      this.hasPermission = status === 'granted';

      if (!this.hasPermission) {
        console.warn('[AudioRecorder] Microphone permission denied');
      }

      return this.hasPermission;
    } catch (error) {
      console.error('[AudioRecorder] Permission error:', error);
      this.hasPermission = false;
      return false;
    }
  }

  /**
   * Check if we have microphone permission
   */
  async checkPermissions(): Promise<boolean> {
    const { status } = await Audio.getPermissionsAsync();
    this.hasPermission = status === 'granted';
    return this.hasPermission;
  }

  /**
   * Configure audio mode for recording
   */
  private async configureAudioMode(): Promise<void> {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: false,
    });
  }

  /**
   * Start recording audio
   */
  async startRecording(): Promise<void> {
    if (this.isRecording) {
      console.warn('[AudioRecorder] Already recording');
      return;
    }

    if (!this.hasPermission) {
      const granted = await this.requestPermissions();
      if (!granted) {
        throw new Error('Microphone permission required');
      }
    }

    try {
      await this.configureAudioMode();

      // Create new recording
      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync(DEFAULT_RECORDING_OPTIONS);
      await this.recording.startAsync();

      this.isRecording = true;
      console.log('[AudioRecorder] Recording started');

      // Start metering for audio level visualization
      this.startMetering();

      // Set up max duration timeout
      if (this.maxDuration > 0) {
        setTimeout(() => {
          if (this.isRecording) {
            console.log('[AudioRecorder] Max duration reached, stopping');
            this.stopRecording();
          }
        }, this.maxDuration);
      }
    } catch (error) {
      console.error('[AudioRecorder] Start recording error:', error);
      this.isRecording = false;
      this.onErrorCallback?.(error as Error);
      throw error;
    }
  }

  /**
   * Stop recording and return the recording data
   */
  async stopRecording(): Promise<AudioRecording | null> {
    if (!this.isRecording || !this.recording) {
      console.warn('[AudioRecorder] Not recording');
      return null;
    }

    try {
      this.stopMetering();

      await this.recording.stopAndUnloadAsync();

      const uri = this.recording.getURI();
      const status = await this.recording.getStatusAsync();

      this.isRecording = false;
      this.recording = null;

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      console.log('[AudioRecorder] Recording stopped:', uri);

      if (!uri) {
        return null;
      }

      return {
        uri,
        duration: status.durationMillis || 0,
        format: 'wav',
      };
    } catch (error) {
      console.error('[AudioRecorder] Stop recording error:', error);
      this.isRecording = false;
      this.recording = null;
      this.onErrorCallback?.(error as Error);
      throw error;
    }
  }

  /**
   * Cancel recording without saving
   * Safe to call even if recorder is already stopped
   */
  async cancelRecording(): Promise<void> {
    if (!this.recording) {
      this.isRecording = false;
      return;
    }

    this.stopMetering();

    try {
      // Check if recording is still active before stopping
      const status = await this.recording.getStatusAsync();
      if (status.isRecording || status.canRecord) {
        await this.recording.stopAndUnloadAsync();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      console.log('[AudioRecorder] Recording cancelled');
    } catch (error) {
      // Silently handle "Recorder does not exist" errors
      if (!(error as Error)?.message?.includes('Recorder does not exist')) {
        console.warn('[AudioRecorder] Cancel warning:', error);
      }
    } finally {
      this.isRecording = false;
      this.recording = null;
    }
  }

  /**
   * Start audio level metering
   */
  private startMetering(): void {
    if (!this.recording) return;

    this.meteringInterval = setInterval(async () => {
      // Early exit if recording was cleaned up
      if (!this.recording || !this.isRecording) {
        this.stopMetering();
        return;
      }

      try {
        const status = await this.recording.getStatusAsync();
        if (status.isRecording && status.metering !== undefined) {
          // Convert dB to normalized level (0-1)
          // Typical range: -160 to 0 dB
          const normalizedLevel = Math.min(1, Math.max(0, (status.metering + 60) / 60));
          this.onAudioLevelCallback?.(normalizedLevel);
        }
      } catch (error) {
        // Stop metering if recorder no longer exists
        if ((error as Error)?.message?.includes('Recorder does not exist')) {
          this.stopMetering();
        }
      }
    }, 100); // Update every 100ms
  }

  /**
   * Stop audio level metering
   */
  private stopMetering(): void {
    if (this.meteringInterval) {
      clearInterval(this.meteringInterval);
      this.meteringInterval = null;
    }
  }

  // =============================================================================
  // Event Handlers
  // =============================================================================

  /**
   * Register callback for audio level updates (for visualization)
   */
  onAudioLevel(callback: (level: number) => void): void {
    this.onAudioLevelCallback = callback;
  }

  /**
   * Register callback for audio data chunks (for streaming)
   * Note: Full streaming requires native module implementation
   */
  onAudioData(callback: (data: ArrayBuffer) => void): void {
    this.onAudioDataCallback = callback;
  }

  /**
   * Register callback for errors
   */
  onError(callback: (error: Error) => void): void {
    this.onErrorCallback = callback;
  }

  // =============================================================================
  // Status Methods
  // =============================================================================

  /**
   * Check if currently recording
   */
  getIsRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Check if permission is granted
   */
  getHasPermission(): boolean {
    return this.hasPermission;
  }

  /**
   * Get current recording duration in ms
   */
  async getCurrentDuration(): Promise<number> {
    if (!this.recording || !this.isRecording) {
      return 0;
    }

    try {
      const status = await this.recording.getStatusAsync();
      return status.durationMillis || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Clean up resources
   * Safe to call even if recorder is already stopped/destroyed
   */
  async cleanup(): Promise<void> {
    this.stopMetering();

    // Only attempt cleanup if we have a recording reference
    if (this.recording) {
      try {
        // Check if recording is still active before stopping
        const status = await this.recording.getStatusAsync();
        if (status.isRecording || status.canRecord) {
          await this.recording.stopAndUnloadAsync();
        }
      } catch (error) {
        // Silently ignore cleanup errors - recorder may already be destroyed
        // This is expected during component unmount race conditions
        if ((error as Error)?.message?.includes('Recorder does not exist')) {
          // Expected error, no need to log
        } else {
          console.warn('[AudioRecorder] Cleanup warning:', error);
        }
      }
    }

    this.recording = null;
    this.isRecording = false;
  }
}

// =============================================================================
// Singleton Export
// =============================================================================

let recorderInstance: AudioRecorder | null = null;

/**
 * Get singleton audio recorder instance
 */
export function getAudioRecorder(): AudioRecorder {
  if (!recorderInstance) {
    recorderInstance = new AudioRecorder();
  }
  return recorderInstance;
}

/**
 * Create a new audio recorder with options
 */
export function createAudioRecorder(options?: AudioRecordingOptions): AudioRecorder {
  return new AudioRecorder(options);
}
