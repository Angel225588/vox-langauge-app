/**
 * Audio Player for Voice Conversations
 *
 * Plays audio responses from Gemini Live API and other audio sources.
 * Handles streaming audio chunks and provides playback controls.
 *
 * Features:
 * - Play audio from ArrayBuffer (Gemini responses)
 * - Play audio from URI (recorded audio)
 * - Queue management for sequential playback
 * - Volume and playback rate control
 * - Audio level monitoring for visualization
 *
 * @example
 * ```typescript
 * const player = new AudioPlayer();
 *
 * // Play Gemini audio response
 * geminiClient.onAudioResponse((audioData) => {
 *   player.playBuffer(audioData);
 * });
 *
 * // Play recorded audio
 * await player.playUri(recording.uri);
 * ```
 */

import { Audio, AVPlaybackStatus, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';

// =============================================================================
// Types
// =============================================================================

export interface AudioPlaybackOptions {
  /** Playback rate (0.5 = half speed, 2.0 = double speed) */
  rate?: number;
  /** Volume (0.0 to 1.0) */
  volume?: number;
  /** Should correct pitch when changing rate */
  shouldCorrectPitch?: boolean;
  /** Loop audio */
  isLooping?: boolean;
}

interface QueuedAudio {
  type: 'buffer' | 'uri';
  data: ArrayBuffer | string;
  options?: AudioPlaybackOptions;
}

// =============================================================================
// Audio Player Class
// =============================================================================

export class AudioPlayer {
  private sound: Audio.Sound | null = null;
  private isPlaying = false;
  private audioQueue: QueuedAudio[] = [];
  private isProcessingQueue = false;

  // Streaming audio buffer for accumulating chunks
  private streamBuffer: Uint8Array[] = [];
  private streamBufferSize = 0;
  private streamFlushTimeout: NodeJS.Timeout | null = null;
  private readonly STREAM_FLUSH_DELAY = 300; // ms to wait before flushing buffer
  private readonly MIN_BUFFER_SIZE = 8000; // minimum bytes before playing

  // Callbacks
  private onPlaybackStartCallback?: () => void;
  private onPlaybackEndCallback?: () => void;
  private onPlaybackErrorCallback?: (error: Error) => void;
  private onAudioLevelCallback?: (level: number) => void;

  // Default options
  private defaultOptions: Required<AudioPlaybackOptions> = {
    rate: 1.0,
    volume: 1.0,
    shouldCorrectPitch: true,
    isLooping: false,
  };

  constructor() {
    this.configureAudioMode();
  }

  /**
   * Configure audio mode for playback
   */
  private async configureAudioMode(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DuckOthers,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });
    } catch (error) {
      console.error('[AudioPlayer] Configure audio mode error:', error);
    }
  }

  /**
   * Play audio from ArrayBuffer (e.g., Gemini response)
   * Gemini Live API returns raw PCM audio at 24kHz, 16-bit, mono
   */
  async playBuffer(
    audioData: ArrayBuffer,
    options?: AudioPlaybackOptions
  ): Promise<void> {
    try {
      // Wrap raw PCM in WAV header
      const wavBuffer = this.createWavFromPcm(audioData);
      const base64 = this.arrayBufferToBase64(wavBuffer);
      const tempUri = FileSystem.cacheDirectory + `audio_${Date.now()}.wav`;

      await FileSystem.writeAsStringAsync(tempUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Play the temporary file
      await this.playUri(tempUri, options);

      // Clean up temp file after playback
      // Note: This is handled in onPlaybackStatusUpdate
    } catch (error) {
      console.error('[AudioPlayer] Play buffer error:', error);
      this.onPlaybackErrorCallback?.(error as Error);
      throw error;
    }
  }

  /**
   * Create a WAV file from raw PCM data
   * Gemini Live API returns: 24kHz, 16-bit, mono PCM
   */
  private createWavFromPcm(pcmData: ArrayBuffer): ArrayBuffer {
    const sampleRate = 24000; // Gemini uses 24kHz
    const numChannels = 1;    // Mono
    const bitsPerSample = 16; // 16-bit
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const dataSize = pcmData.byteLength;

    // WAV header is 44 bytes
    const headerSize = 44;
    const totalSize = headerSize + dataSize;
    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, totalSize - 8, true); // File size - 8 bytes
    this.writeString(view, 8, 'WAVE');

    // fmt sub-chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);           // Sub-chunk size (16 for PCM)
    view.setUint16(20, 1, true);            // Audio format (1 = PCM)
    view.setUint16(22, numChannels, true);  // Number of channels
    view.setUint32(24, sampleRate, true);   // Sample rate
    view.setUint32(28, byteRate, true);     // Byte rate
    view.setUint16(32, blockAlign, true);   // Block align
    view.setUint16(34, bitsPerSample, true); // Bits per sample

    // data sub-chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);     // Data size

    // Copy PCM data after header
    const pcmArray = new Uint8Array(pcmData);
    const wavArray = new Uint8Array(buffer);
    wavArray.set(pcmArray, headerSize);

    return buffer;
  }

  /**
   * Write a string to a DataView at the specified offset
   */
  private writeString(view: DataView, offset: number, str: string): void {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  /**
   * Play audio from URI
   */
  async playUri(uri: string, options?: AudioPlaybackOptions): Promise<void> {
    const opts = { ...this.defaultOptions, ...options };

    try {
      // Stop any current playback
      await this.stop();

      // Create and configure new sound
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        {
          shouldPlay: true,
          rate: opts.rate,
          volume: opts.volume,
          shouldCorrectPitch: opts.shouldCorrectPitch,
          isLooping: opts.isLooping,
        },
        this.onPlaybackStatusUpdate.bind(this)
      );

      this.sound = sound;
      this.isPlaying = true;
      this.onPlaybackStartCallback?.();

      console.log('[AudioPlayer] Playing:', uri);
    } catch (error) {
      console.error('[AudioPlayer] Play URI error:', error);
      this.isPlaying = false;
      this.onPlaybackErrorCallback?.(error as Error);
      throw error;
    }
  }

  /**
   * Queue audio for sequential playback
   */
  queueBuffer(audioData: ArrayBuffer, options?: AudioPlaybackOptions): void {
    // Use streaming buffer for better audio quality
    this.addToStreamBuffer(audioData);
  }

  /**
   * Add audio chunk to streaming buffer
   * Automatically flushes when enough data is buffered or after a delay
   */
  addToStreamBuffer(audioData: ArrayBuffer): void {
    const chunk = new Uint8Array(audioData);
    this.streamBuffer.push(chunk);
    this.streamBufferSize += chunk.length;

    console.log('[AudioPlayer] Added to buffer:', chunk.length, 'bytes, total:', this.streamBufferSize);

    // Clear existing timeout
    if (this.streamFlushTimeout) {
      clearTimeout(this.streamFlushTimeout);
    }

    // Set a timeout to flush the buffer after a delay (handles end of stream)
    this.streamFlushTimeout = setTimeout(() => {
      if (this.streamBufferSize > 0) {
        console.log('[AudioPlayer] Auto-flushing buffer after delay');
        this.flushStreamBuffer();
      }
    }, this.STREAM_FLUSH_DELAY);
  }

  /**
   * Flush the streaming buffer and play accumulated audio
   */
  async flushStreamBuffer(): Promise<void> {
    // Clear the timeout
    if (this.streamFlushTimeout) {
      clearTimeout(this.streamFlushTimeout);
      this.streamFlushTimeout = null;
    }

    // Check if there's anything to flush
    if (this.streamBuffer.length === 0 || this.streamBufferSize === 0) {
      console.log('[AudioPlayer] Nothing to flush');
      return;
    }

    console.log('[AudioPlayer] Flushing buffer:', this.streamBufferSize, 'bytes from', this.streamBuffer.length, 'chunks');

    // Combine all chunks into a single buffer
    const combined = new Uint8Array(this.streamBufferSize);
    let offset = 0;
    for (const chunk of this.streamBuffer) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }

    // Clear the buffer
    this.streamBuffer = [];
    this.streamBufferSize = 0;

    // Play the combined audio
    try {
      await this.playBuffer(combined.buffer);
    } catch (error) {
      console.error('[AudioPlayer] Flush playback error:', error);
    }
  }

  /**
   * Clear the streaming buffer without playing
   */
  clearStreamBuffer(): void {
    if (this.streamFlushTimeout) {
      clearTimeout(this.streamFlushTimeout);
      this.streamFlushTimeout = null;
    }
    this.streamBuffer = [];
    this.streamBufferSize = 0;
  }

  /**
   * Queue URI for sequential playback
   */
  queueUri(uri: string, options?: AudioPlaybackOptions): void {
    this.audioQueue.push({
      type: 'uri',
      data: uri,
      options,
    });
    this.processQueue();
  }

  /**
   * Process audio queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.isPlaying) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.audioQueue.length > 0) {
      const item = this.audioQueue.shift();
      if (!item) continue;

      try {
        if (item.type === 'buffer') {
          await this.playBuffer(item.data as ArrayBuffer, item.options);
        } else {
          await this.playUri(item.data as string, item.options);
        }

        // Wait for playback to complete
        await this.waitForPlaybackEnd();
      } catch (error) {
        console.error('[AudioPlayer] Queue item error:', error);
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Wait for current playback to end
   */
  private waitForPlaybackEnd(): Promise<void> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!this.isPlaying) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }

  /**
   * Handle playback status updates
   */
  private onPlaybackStatusUpdate(status: AVPlaybackStatus): void {
    if (!status.isLoaded) {
      if (status.error) {
        console.error('[AudioPlayer] Playback error:', status.error);
        this.onPlaybackErrorCallback?.(new Error(status.error));
      }
      return;
    }

    // Playback finished
    if (status.didJustFinish && !status.isLooping) {
      this.isPlaying = false;
      this.onPlaybackEndCallback?.();

      // Unload sound
      this.sound?.unloadAsync().catch(console.error);
      this.sound = null;
    }

    // Update audio level for visualization
    // Note: expo-av doesn't provide real-time audio levels during playback
    // This would require a custom native module
  }

  /**
   * Stop playback
   */
  async stop(): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
      } catch (error) {
        console.error('[AudioPlayer] Stop error:', error);
      }
      this.sound = null;
    }
    this.isPlaying = false;
  }

  /**
   * Pause playback
   */
  async pause(): Promise<void> {
    if (this.sound && this.isPlaying) {
      try {
        await this.sound.pauseAsync();
        this.isPlaying = false;
      } catch (error) {
        console.error('[AudioPlayer] Pause error:', error);
      }
    }
  }

  /**
   * Resume playback
   */
  async resume(): Promise<void> {
    if (this.sound && !this.isPlaying) {
      try {
        await this.sound.playAsync();
        this.isPlaying = true;
      } catch (error) {
        console.error('[AudioPlayer] Resume error:', error);
      }
    }
  }

  /**
   * Set playback rate
   */
  async setRate(rate: number): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.setRateAsync(rate, true);
      } catch (error) {
        console.error('[AudioPlayer] Set rate error:', error);
      }
    }
  }

  /**
   * Set volume
   */
  async setVolume(volume: number): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
      } catch (error) {
        console.error('[AudioPlayer] Set volume error:', error);
      }
    }
  }

  /**
   * Clear the audio queue
   */
  clearQueue(): void {
    this.audioQueue = [];
  }

  // =============================================================================
  // Event Handlers
  // =============================================================================

  /**
   * Register callback for playback start
   */
  onPlaybackStart(callback: () => void): void {
    this.onPlaybackStartCallback = callback;
  }

  /**
   * Register callback for playback end
   */
  onPlaybackEnd(callback: () => void): void {
    this.onPlaybackEndCallback = callback;
  }

  /**
   * Register callback for playback error
   */
  onPlaybackError(callback: (error: Error) => void): void {
    this.onPlaybackErrorCallback = callback;
  }

  /**
   * Register callback for audio level updates
   */
  onAudioLevel(callback: (level: number) => void): void {
    this.onAudioLevelCallback = callback;
  }

  // =============================================================================
  // Status Methods
  // =============================================================================

  /**
   * Check if currently playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Get queue length
   */
  getQueueLength(): number {
    return this.audioQueue.length;
  }

  /**
   * Get current playback position
   */
  async getPosition(): Promise<number> {
    if (!this.sound) return 0;

    try {
      const status = await this.sound.getStatusAsync();
      if (status.isLoaded) {
        return status.positionMillis;
      }
    } catch {
      // Ignore
    }
    return 0;
  }

  /**
   * Get total duration
   */
  async getDuration(): Promise<number> {
    if (!this.sound) return 0;

    try {
      const status = await this.sound.getStatusAsync();
      if (status.isLoaded && status.durationMillis) {
        return status.durationMillis;
      }
    } catch {
      // Ignore
    }
    return 0;
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    this.clearQueue();
    this.clearStreamBuffer();
    await this.stop();
  }

  // =============================================================================
  // Private Helpers
  // =============================================================================

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}

// =============================================================================
// Singleton Export
// =============================================================================

let playerInstance: AudioPlayer | null = null;

/**
 * Get singleton audio player instance
 */
export function getAudioPlayer(): AudioPlayer {
  if (!playerInstance) {
    playerInstance = new AudioPlayer();
  }
  return playerInstance;
}

/**
 * Create a new audio player instance
 */
export function createAudioPlayer(): AudioPlayer {
  return new AudioPlayer();
}
