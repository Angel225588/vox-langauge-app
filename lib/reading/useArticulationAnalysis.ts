/**
 * React Hook for Articulation Analysis
 *
 * Provides a simple interface for analyzing speech articulation in React components.
 * Manages loading states, error handling, and analysis results.
 *
 * @example
 * ```tsx
 * function ReadingComponent() {
 *   const { analyze, isAnalyzing, result, error } = useArticulationAnalysis();
 *
 *   const handleAnalyze = async () => {
 *     const analysisResult = await analyze(
 *       "Hello world, how are you?",
 *       transcriptionResult,
 *       2000
 *     );
 *
 *     if (analysisResult) {
 *       console.log('Score:', analysisResult.overallScore);
 *       console.log('Feedback:', analysisResult.feedback.summary);
 *     }
 *   };
 *
 *   return (
 *     <View>
 *       <Button onPress={handleAnalyze} disabled={isAnalyzing}>
 *         Analyze Speech
 *       </Button>
 *       {result && (
 *         <Text>Score: {result.overallScore}/100</Text>
 *       )}
 *     </View>
 *   );
 * }
 * ```
 */

import { useState, useCallback } from 'react';
import { analyzeArticulation, AnalysisResult } from './articulationEngine';
import { TranscriptionResult } from './speechToText';

/**
 * Return type for useArticulationAnalysis hook
 */
export interface UseArticulationAnalysisReturn {
  /**
   * Whether analysis is currently in progress
   */
  isAnalyzing: boolean;

  /**
   * Most recent analysis result (null if no analysis yet)
   */
  result: AnalysisResult | null;

  /**
   * Error message if analysis failed (null if no error)
   */
  error: string | null;

  /**
   * Analyze articulation from transcribed speech
   *
   * @param expectedText - What the user was supposed to read
   * @param transcription - Transcription result from speech-to-text
   * @param audioDuration - Total duration of audio in milliseconds
   * @returns Analysis result or null if failed
   *
   * @example
   * ```typescript
   * const result = await analyze(
   *   "The quick brown fox",
   *   whisperTranscription,
   *   2500
   * );
   * ```
   */
  analyze: (
    expectedText: string,
    transcription: TranscriptionResult,
    audioDuration: number
  ) => Promise<AnalysisResult | null>;

  /**
   * Reset analysis state (clear result and error)
   */
  reset: () => void;
}

/**
 * Hook for analyzing speech articulation
 *
 * Provides state management for articulation analysis including:
 * - Loading states
 * - Error handling
 * - Result caching
 * - Reset functionality
 *
 * @returns Analysis hook interface
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { analyze, isAnalyzing, result, error, reset } = useArticulationAnalysis();
 *
 *   const handleNewRecording = () => {
 *     reset(); // Clear previous results
 *   };
 *
 *   const handleAnalyze = async (text, transcription, duration) => {
 *     const result = await analyze(text, transcription, duration);
 *     if (result) {
 *       // Handle success
 *       console.log('Analysis complete:', result);
 *     } else if (error) {
 *       // Handle error
 *       console.error('Analysis failed:', error);
 *     }
 *   };
 *
 *   return (
 *     <View>
 *       {isAnalyzing && <ActivityIndicator />}
 *       {error && <Text style={{ color: 'red' }}>{error}</Text>}
 *       {result && (
 *         <View>
 *           <Text>Score: {result.overallScore}/100</Text>
 *           <Text>{result.feedback.summary}</Text>
 *         </View>
 *       )}
 *     </View>
 *   );
 * }
 * ```
 */
export function useArticulationAnalysis(): UseArticulationAnalysisReturn {
  // State management
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Perform articulation analysis
   */
  const analyze = useCallback(
    async (
      expectedText: string,
      transcription: TranscriptionResult,
      audioDuration: number
    ): Promise<AnalysisResult | null> => {
      // Validate inputs
      if (!expectedText || expectedText.trim().length === 0) {
        const errorMsg = 'Expected text is required';
        setError(errorMsg);
        return null;
      }

      if (!transcription || !transcription.text) {
        const errorMsg = 'Valid transcription result is required';
        setError(errorMsg);
        return null;
      }

      if (audioDuration <= 0) {
        const errorMsg = 'Audio duration must be greater than 0';
        setError(errorMsg);
        return null;
      }

      // Reset state
      setIsAnalyzing(true);
      setError(null);

      try {
        // Perform analysis
        const analysisResult = await analyzeArticulation({
          expectedText,
          transcription,
          audioDuration,
        });

        // Update state with result
        setResult(analysisResult);
        setIsAnalyzing(false);

        return analysisResult;
      } catch (err) {
        // Handle errors
        const errorMessage = err instanceof Error
          ? err.message
          : 'An unexpected error occurred during analysis';

        console.error('Articulation analysis error:', err);
        setError(errorMessage);
        setResult(null);
        setIsAnalyzing(false);

        return null;
      }
    },
    []
  );

  /**
   * Reset analysis state
   */
  const reset = useCallback(() => {
    setIsAnalyzing(false);
    setResult(null);
    setError(null);
  }, []);

  return {
    isAnalyzing,
    result,
    error,
    analyze,
    reset,
  };
}

/**
 * Unit test examples
 *
 * @example
 * ```typescript
 * import { renderHook, act } from '@testing-library/react-hooks';
 * import { useArticulationAnalysis } from './useArticulationAnalysis';
 *
 * describe('useArticulationAnalysis', () => {
 *   it('should analyze speech successfully', async () => {
 *     const { result } = renderHook(() => useArticulationAnalysis());
 *
 *     const transcription = {
 *       text: 'hello world',
 *       words: [
 *         { word: 'hello', start: 0, end: 500, confidence: 0.95 },
 *         { word: 'world', start: 500, end: 1000, confidence: 0.98 },
 *       ],
 *       confidence: 0.96,
 *       language: 'en',
 *       duration: 1000,
 *     };
 *
 *     await act(async () => {
 *       const analysisResult = await result.current.analyze(
 *         'hello world',
 *         transcription,
 *         1000
 *       );
 *
 *       expect(analysisResult).toBeTruthy();
 *       expect(analysisResult?.overallScore).toBeGreaterThan(0);
 *     });
 *
 *     expect(result.current.error).toBeNull();
 *   });
 *
 *   it('should handle missing expected text', async () => {
 *     const { result } = renderHook(() => useArticulationAnalysis());
 *
 *     const transcription = {
 *       text: 'hello',
 *       words: [{ word: 'hello', start: 0, end: 500, confidence: 0.95 }],
 *       confidence: 0.95,
 *       language: 'en',
 *       duration: 500,
 *     };
 *
 *     await act(async () => {
 *       const analysisResult = await result.current.analyze(
 *         '',
 *         transcription,
 *         500
 *       );
 *
 *       expect(analysisResult).toBeNull();
 *     });
 *
 *     expect(result.current.error).toBe('Expected text is required');
 *   });
 *
 *   it('should reset state correctly', async () => {
 *     const { result } = renderHook(() => useArticulationAnalysis());
 *
 *     const transcription = {
 *       text: 'test',
 *       words: [{ word: 'test', start: 0, end: 500, confidence: 0.9 }],
 *       confidence: 0.9,
 *       language: 'en',
 *       duration: 500,
 *     };
 *
 *     // Perform analysis
 *     await act(async () => {
 *       await result.current.analyze('test', transcription, 500);
 *     });
 *
 *     expect(result.current.result).toBeTruthy();
 *
 *     // Reset
 *     act(() => {
 *       result.current.reset();
 *     });
 *
 *     expect(result.current.result).toBeNull();
 *     expect(result.current.error).toBeNull();
 *     expect(result.current.isAnalyzing).toBe(false);
 *   });
 * });
 * ```
 */
