/**
 * useTranscription Hook
 *
 * React hook for managing speech-to-text transcription.
 * Provides state management, error handling, and progress tracking
 * for audio transcription using OpenAI Whisper API.
 *
 * @example
 * ```tsx
 * import { useTranscription } from '@/lib/reading/useTranscription';
 *
 * function RecordingScreen() {
 *   const { transcribe, isTranscribing, transcription, error, isApiConfigured } = useTranscription({
 *     language: 'en',
 *   });
 *
 *   const handleTranscribe = async (audioUri: string) => {
 *     const result = await transcribe(audioUri, expectedText);
 *     if (result) {
 *       console.log('Transcription:', result.text);
 *     }
 *   };
 *
 *   if (!isApiConfigured) {
 *     return <Text>OpenAI API key not configured</Text>;
 *   }
 *
 *   return (
 *     <View>
 *       {isTranscribing && <Text>Transcribing... {progress}%</Text>}
 *       {error && <Text>Error: {error}</Text>}
 *       {transcription && <Text>{transcription.text}</Text>}
 *     </View>
 *   );
 * }
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  transcribeAudio,
  transcribeWithHint,
  isWhisperAvailable,
  mockTranscribe,
  TranscriptionResult,
  TranscriptionOptions,
} from './speechToText';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Hook return interface
 */
export interface UseTranscriptionReturn {
  // State
  /** Whether transcription is currently in progress */
  isTranscribing: boolean;
  /** Latest transcription result */
  transcription: TranscriptionResult | null;
  /** Error message if transcription failed */
  error: string | null;
  /** Progress percentage (0-100) */
  progress: number;

  // Actions
  /**
   * Transcribe an audio file
   * @param audioUri - URI to the audio file
   * @param expectedText - Optional expected text for better accuracy
   * @returns Transcription result or null if failed
   */
  transcribe: (audioUri: string, expectedText?: string) => Promise<TranscriptionResult | null>;

  /**
   * Reset all state
   */
  reset: () => void;

  // Config
  /** Whether OpenAI API is properly configured */
  isApiConfigured: boolean;
}

/**
 * Hook options
 */
export interface UseTranscriptionOptions extends TranscriptionOptions {
  /**
   * Use mock transcription for testing (default: false when API key is available)
   */
  useMock?: boolean;

  /**
   * Auto-reset error after this many milliseconds (default: 5000)
   */
  errorResetDelay?: number;

  /**
   * Callback when transcription completes successfully
   */
  onSuccess?: (result: TranscriptionResult) => void;

  /**
   * Callback when transcription fails
   */
  onError?: (error: Error) => void;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for managing audio transcription
 *
 * Handles all aspects of speech-to-text transcription including:
 * - API calls to OpenAI Whisper
 * - Loading states and progress
 * - Error handling with auto-reset
 * - Mock mode for testing
 * - Cleanup on unmount
 *
 * @param options - Configuration options for transcription
 */
export function useTranscription(options?: UseTranscriptionOptions): UseTranscriptionReturn {
  // State
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isApiConfigured, setIsApiConfigured] = useState(false);

  // Refs
  const isMountedRef = useRef(true);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Options with defaults
  const errorResetDelay = options?.errorResetDelay ?? 5000;
  const useMock = options?.useMock ?? false;

  // Check API configuration on mount
  useEffect(() => {
    checkApiConfiguration();

    return () => {
      isMountedRef.current = false;
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Check if Whisper API is available
   */
  const checkApiConfiguration = async () => {
    try {
      const available = await isWhisperAvailable();
      if (isMountedRef.current) {
        setIsApiConfigured(available);
      }
    } catch (error) {
      console.error('Error checking API configuration:', error);
      if (isMountedRef.current) {
        setIsApiConfigured(false);
      }
    }
  };

  /**
   * Simulate progress during transcription
   * Real progress is not available from API, so we simulate it
   */
  const startProgressSimulation = useCallback((estimatedDuration: number = 10000) => {
    // Clear any existing timer
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }

    let currentProgress = 0;
    const incrementInterval = 100; // Update every 100ms
    const totalIncrements = estimatedDuration / incrementInterval;
    const progressPerIncrement = 95 / totalIncrements; // Max 95%, reserve 5% for completion

    progressTimerRef.current = setInterval(() => {
      currentProgress += progressPerIncrement;

      if (currentProgress >= 95) {
        currentProgress = 95; // Cap at 95% until actual completion
        if (progressTimerRef.current) {
          clearInterval(progressTimerRef.current);
        }
      }

      if (isMountedRef.current) {
        setProgress(Math.round(currentProgress));
      }
    }, incrementInterval);
  }, []);

  /**
   * Stop progress simulation
   */
  const stopProgressSimulation = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  /**
   * Set error with auto-reset
   */
  const setErrorWithReset = useCallback(
    (errorMessage: string) => {
      if (!isMountedRef.current) return;

      setError(errorMessage);

      // Clear existing timeout
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }

      // Auto-reset after delay
      if (errorResetDelay > 0) {
        errorTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            setError(null);
          }
        }, errorResetDelay);
      }
    },
    [errorResetDelay]
  );

  /**
   * Main transcription function
   */
  const transcribe = useCallback(
    async (audioUri: string, expectedText?: string): Promise<TranscriptionResult | null> => {
      if (!isMountedRef.current) return null;

      // Check if already transcribing
      if (isTranscribing) {
        console.warn('Transcription already in progress');
        return null;
      }

      try {
        // Reset state
        setIsTranscribing(true);
        setError(null);
        setProgress(0);
        setTranscription(null);

        // Start progress simulation (estimate ~10 seconds for transcription)
        startProgressSimulation(10000);

        let result: TranscriptionResult;

        if (useMock || !isApiConfigured) {
          // Use mock transcription for testing
          if (!expectedText) {
            throw new Error('Expected text required for mock transcription');
          }
          console.log('Using mock transcription...');
          // Estimate duration based on text length (assume ~150 words per minute)
          const wordCount = expectedText.split(/\s+/).length;
          const estimatedDuration = (wordCount / 150) * 60;
          result = await mockTranscribe(expectedText, estimatedDuration);
        } else {
          // Use real Whisper API
          if (expectedText) {
            // Use hint-based transcription for better accuracy
            result = await transcribeWithHint(audioUri, expectedText, options?.language);
          } else {
            // Standard transcription
            result = await transcribeAudio(audioUri, options);
          }
        }

        if (!isMountedRef.current) return null;

        // Complete progress
        stopProgressSimulation();
        setProgress(100);

        // Update state
        setTranscription(result);
        setIsTranscribing(false);

        // Call success callback
        if (options?.onSuccess) {
          options.onSuccess(result);
        }

        return result;
      } catch (err: any) {
        console.error('Transcription error:', err);

        if (!isMountedRef.current) return null;

        // Stop progress
        stopProgressSimulation();
        setProgress(0);

        // Handle error
        const errorMessage = err.message || 'Transcription failed';
        setErrorWithReset(errorMessage);
        setIsTranscribing(false);

        // Call error callback
        if (options?.onError) {
          options.onError(err);
        }

        return null;
      }
    },
    [
      isTranscribing,
      isApiConfigured,
      useMock,
      options,
      startProgressSimulation,
      stopProgressSimulation,
      setErrorWithReset,
    ]
  );

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    if (!isMountedRef.current) return;

    stopProgressSimulation();

    setIsTranscribing(false);
    setTranscription(null);
    setError(null);
    setProgress(0);

    // Clear error timeout
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
  }, [stopProgressSimulation]);

  return {
    // State
    isTranscribing,
    transcription,
    error,
    progress,

    // Actions
    transcribe,
    reset,

    // Config
    isApiConfigured,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { TranscriptionResult, TranscriptionWord, TranscriptionSegment } from './speechToText';
