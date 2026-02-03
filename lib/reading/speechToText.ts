/**
 * Speech-to-Text Service
 *
 * Uses OpenAI Whisper API for transcription with word-level timestamps.
 * Optimized for language learning with pronunciation feedback.
 *
 * @example
 * ```typescript
 * import { transcribeAudio, transcribeWithHint } from '@/lib/reading/speechToText';
 *
 * // Basic transcription
 * const result = await transcribeAudio('file:///path/to/audio.m4a', {
 *   language: 'en',
 * });
 *
 * // With expected text hint for better accuracy
 * const result = await transcribeWithHint(
 *   'file:///path/to/audio.m4a',
 *   'Hello world, how are you today?',
 *   'en'
 * );
 * ```
 */

import * as FileSystem from 'expo-file-system/legacy';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Individual word with timestamp information
 */
export interface TranscriptionWord {
  /** The transcribed word */
  word: string;
  /** Start time in seconds */
  start: number;
  /** End time in seconds */
  end: number;
  /** Confidence score 0-1 (if available from API) */
  confidence?: number;
}

/**
 * Segment of transcription (typically sentence-level)
 */
export interface TranscriptionSegment {
  /** Segment identifier */
  id: number;
  /** Segment start time in seconds */
  start: number;
  /** Segment end time in seconds */
  end: number;
  /** Segment text */
  text: string;
  /** Words in this segment (if available) */
  words?: TranscriptionWord[];
}

/**
 * Complete transcription result with detailed timing information
 */
export interface TranscriptionResult {
  /** Full transcription text */
  text: string;
  /** Segments with timestamps */
  segments: TranscriptionSegment[];
  /** Flattened word list with timestamps */
  words: TranscriptionWord[];
  /** Detected language code */
  language: string;
  /** Audio duration in seconds */
  duration: number;
}

/**
 * Options for transcription
 */
export interface TranscriptionOptions {
  /** Language code (ISO-639-1), e.g. 'en', 'es', 'fr' */
  language?: string;
  /** Context or expected text to improve accuracy */
  prompt?: string;
  /** Temperature for sampling (0-1), lower = more deterministic */
  temperature?: number;
}

/**
 * OpenAI API response structure (verbose JSON format)
 */
interface WhisperAPIResponse {
  text: string;
  language: string;
  duration: number;
  segments?: Array<{
    id: number;
    seek: number;
    start: number;
    end: number;
    text: string;
    tokens: number[];
    temperature: number;
    avg_logprob: number;
    compression_ratio: number;
    no_speech_prob: number;
    words?: Array<{
      word: string;
      start: number;
      end: number;
    }>;
  }>;
  words?: Array<{
    word: string;
    start: number;
    end: number;
  }>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

// API URLs
const OPENAI_WHISPER_URL = 'https://api.openai.com/v1/audio/transcriptions';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms
const REQUEST_TIMEOUT = 60000; // 60 seconds

/**
 * Get the Whisper API URL (supports self-hosted)
 */
function getWhisperApiUrl(): string {
  const selfHostedUrl = process.env.EXPO_PUBLIC_WHISPER_SERVER_URL;
  if (selfHostedUrl) {
    // Self-hosted server should expose same endpoint
    return `${selfHostedUrl}/v1/audio/transcriptions`;
  }
  return OPENAI_WHISPER_URL;
}

/**
 * Get API key for Whisper (OpenAI or self-hosted)
 */
function getWhisperApiKey(): string | null {
  // Check for self-hosted first
  const selfHostedKey = process.env.EXPO_PUBLIC_WHISPER_SERVER_KEY;
  const selfHostedUrl = process.env.EXPO_PUBLIC_WHISPER_SERVER_URL;

  if (selfHostedUrl) {
    // Self-hosted may not require API key
    return selfHostedKey || 'self-hosted';
  }

  // Fall back to OpenAI
  return getApiKey();
}

/**
 * Languages supported by Whisper API
 * https://platform.openai.com/docs/guides/speech-to-text/supported-languages
 */
const SUPPORTED_LANGUAGES = [
  'af', 'ar', 'hy', 'az', 'be', 'bs', 'bg', 'ca', 'zh', 'hr', 'cs', 'da',
  'nl', 'en', 'et', 'fi', 'fr', 'gl', 'de', 'el', 'he', 'hi', 'hu', 'is',
  'id', 'it', 'ja', 'kn', 'kk', 'ko', 'lv', 'lt', 'mk', 'ms', 'mr', 'mi',
  'ne', 'no', 'fa', 'pl', 'pt', 'ro', 'ru', 'sr', 'sk', 'sl', 'es', 'sw',
  'sv', 'tl', 'ta', 'th', 'tr', 'uk', 'ur', 'vi', 'cy'
];

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Get OpenAI API key from environment
 */
function getApiKey(): string | null {
  // In React Native/Expo, we need to use the ENV constant from our config
  // process.env may not work correctly without proper babel configuration
  try {
    const key = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    if (key && key.trim() !== '') {
      return key;
    }
  } catch (error) {
    console.warn('Error accessing process.env:', error);
  }
  return null;
}

/**
 * Check if Whisper API is configured and available
 * Supports both OpenAI and self-hosted servers
 */
export async function isWhisperAvailable(): Promise<boolean> {
  // Check for self-hosted first
  const selfHostedUrl = process.env.EXPO_PUBLIC_WHISPER_SERVER_URL;
  if (selfHostedUrl) {
    console.log('[Whisper] Self-hosted server configured:', selfHostedUrl);
    return true;
  }

  // Check for OpenAI
  const apiKey = getApiKey();
  if (!apiKey) {
    return false;
  }

  try {
    // Quick test to verify API key format (should start with 'sk-')
    if (!apiKey.startsWith('sk-')) {
      console.warn('OpenAI API key format appears invalid');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error checking Whisper availability:', error);
    return false;
  }
}

/**
 * Get current Whisper provider info
 */
export function getWhisperProviderInfo(): {
  provider: 'openai' | 'self-hosted' | 'none';
  url: string;
  isConfigured: boolean;
} {
  const selfHostedUrl = process.env.EXPO_PUBLIC_WHISPER_SERVER_URL;
  const openaiKey = getApiKey();

  if (selfHostedUrl) {
    return {
      provider: 'self-hosted',
      url: selfHostedUrl,
      isConfigured: true,
    };
  }

  if (openaiKey) {
    return {
      provider: 'openai',
      url: OPENAI_WHISPER_URL,
      isConfigured: true,
    };
  }

  return {
    provider: 'none',
    url: '',
    isConfigured: false,
  };
}

/**
 * Get list of supported language codes
 */
export function getSupportedLanguages(): string[] {
  return [...SUPPORTED_LANGUAGES];
}

/**
 * Transcribe audio file using Whisper API with automatic fallback to mock mode
 * Returns word-level timestamps for articulation analysis
 *
 * @param audioUri - Local file URI (file://) or path to audio file
 * @param options - Transcription options (language, prompt, temperature)
 * @returns Promise resolving to detailed transcription result
 * @throws Error if API key not configured or transcription fails
 */
export async function transcribeAudio(
  audioUri: string,
  options?: TranscriptionOptions
): Promise<TranscriptionResult> {
  const apiKey = getWhisperApiKey();

  if (!apiKey) {
    console.warn('OpenAI API key not configured. Using mock transcription for demo purposes.');

    // If no API key but we have a prompt (expected text), use mock mode
    if (options?.prompt) {
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      if (fileInfo.exists && 'size' in fileInfo) {
        // Estimate duration based on file size (rough estimate: ~10KB per second of audio)
        const estimatedDuration = Math.max(5, (fileInfo.size / 10240) || 10);
        return await mockTranscribe(options.prompt, estimatedDuration);
      }
    }

    throw new Error(
      'OpenAI API key not configured. Please set EXPO_PUBLIC_OPENAI_API_KEY in your .env file, or provide expected text for mock mode.'
    );
  }

  // Validate audio file exists
  const fileInfo = await FileSystem.getInfoAsync(audioUri);
  if (!fileInfo.exists) {
    throw new Error(`Audio file not found: ${audioUri}`);
  }

  let lastError: Error | null = null;

  // Retry logic for transient failures
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await transcribeWithRetry(audioUri, apiKey, options, attempt);
      return result;
    } catch (error) {
      lastError = error as Error;

      // Don't retry on authentication errors
      if (lastError.message.includes('401') || lastError.message.includes('authentication')) {
        console.error('Authentication error with OpenAI API. Check your API key.');
        throw lastError;
      }

      // Don't retry on file errors
      if (lastError.message.includes('file') || lastError.message.includes('format')) {
        throw lastError;
      }

      console.warn(`Transcription attempt ${attempt} failed:`, lastError.message);

      if (attempt < MAX_RETRIES) {
        // Exponential backoff
        const delay = RETRY_DELAY * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // If all retries failed and we have expected text, fallback to mock mode
  if (options?.prompt) {
    console.warn(
      'All transcription attempts failed. Falling back to mock mode for demo purposes.',
      'Last error:',
      lastError?.message
    );

    if ('size' in fileInfo) {
      const estimatedDuration = Math.max(5, (fileInfo.size / 10240) || 10);
      return await mockTranscribe(options.prompt, estimatedDuration);
    }
  }

  throw new Error(
    `Transcription failed after ${MAX_RETRIES} attempts. Last error: ${lastError?.message}`
  );
}

/**
 * Internal function to perform transcription with proper error handling
 * Uses FileSystem.uploadAsync for React Native compatibility
 */
async function transcribeWithRetry(
  audioUri: string,
  apiKey: string,
  options: TranscriptionOptions | undefined,
  attempt: number
): Promise<TranscriptionResult> {
  // Read audio file and append to form data
  const fileInfo = await FileSystem.getInfoAsync(audioUri);
  if (!fileInfo.exists) {
    throw new Error('Audio file not found');
  }

  // Determine file extension and MIME type
  const extension = audioUri.split('.').pop()?.toLowerCase() || 'm4a';
  const mimeType = getMimeType(extension);

  console.log(`[Whisper API] Attempt ${attempt}: Preparing upload...`);
  console.log(`[Whisper API] File: ${audioUri}`);
  console.log(`[Whisper API] Extension: ${extension}, MIME: ${mimeType}`);

  try {
    // Build upload parameters for FileSystem.uploadAsync
    // This is the proper way to upload files in React Native/Expo
    const uploadParams: Record<string, string> = {
      model: 'whisper-1',
      response_format: 'verbose_json',
      'timestamp_granularities[]': 'word',
    };

    if (options?.language) {
      uploadParams.language = options.language;
    }

    if (options?.prompt) {
      uploadParams.prompt = options.prompt;
    }

    if (options?.temperature !== undefined) {
      uploadParams.temperature = options.temperature.toString();
    }

    const whisperUrl = getWhisperApiUrl();
    const isSelfHosted = whisperUrl !== OPENAI_WHISPER_URL;

    console.log(`[Whisper API] Uploading via FileSystem.uploadAsync...`);
    console.log(`[Whisper API] Using ${isSelfHosted ? 'self-hosted' : 'OpenAI'} server`);

    // Use FileSystem.uploadAsync - the proper React Native way
    const uploadResult = await FileSystem.uploadAsync(
      whisperUrl,
      audioUri,
      {
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: 'file',
        mimeType: mimeType,
        parameters: uploadParams,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    console.log(`[Whisper API] Response status: ${uploadResult.status}`);

    if (uploadResult.status !== 200) {
      let errorMessage = `OpenAI API error: ${uploadResult.status}`;

      try {
        const errorJson = JSON.parse(uploadResult.body);
        errorMessage = errorJson.error?.message || errorMessage;
        console.error('[Whisper API] Error details:', errorJson);
      } catch {
        console.error('[Whisper API] Error body:', uploadResult.body);
      }

      throw new Error(errorMessage);
    }

    const data: WhisperAPIResponse = JSON.parse(uploadResult.body);

    console.log('[Whisper API] Transcription successful');
    console.log(`[Whisper API] Transcribed text: "${data.text?.substring(0, 100)}..."`);

    // Transform API response to our TranscriptionResult format
    return transformWhisperResponse(data);
  } catch (error: any) {
    // Log errors with more context
    console.error(`[Whisper API] Upload failed:`, error.message);

    if (error.message.includes('Network request failed') || error.message.includes('network')) {
      console.error('[Whisper API] Network error - check:');
      console.error('  1. Internet connection');
      console.error('  2. OpenAI API key validity');
      console.error('  3. File exists and is readable');
    }

    throw error;
  }
}

/**
 * Transcribe with expected text hint
 * Better accuracy when we know what they're supposed to say
 * Automatically falls back to mock mode if API is unavailable
 *
 * @param audioUri - Local file URI to audio recording
 * @param expectedText - The text the user was supposed to read
 * @param language - Language code (optional, will be detected if not provided)
 */
export async function transcribeWithHint(
  audioUri: string,
  expectedText: string,
  language?: string
): Promise<TranscriptionResult> {
  // Use expected text as prompt to guide transcription
  // Whisper uses the prompt as context to improve accuracy
  // If API fails, will automatically fall back to mock mode using expectedText
  return transcribeAudio(audioUri, {
    language,
    prompt: expectedText,
    temperature: 0.2, // Lower temperature for more deterministic output
  });
}

// ============================================================================
// MOCK TRANSCRIPTION (for testing without API key)
// ============================================================================

/**
 * Mock transcription for testing without API key
 * Creates realistic transcription result with simulated errors
 *
 * @param expectedText - The text that should be transcribed
 * @param duration - Audio duration in seconds
 */
export async function mockTranscribe(
  expectedText: string,
  duration: number
): Promise<TranscriptionResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

  const words = expectedText.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const timePerWord = duration / words.length;

  const transcriptionWords: TranscriptionWord[] = [];
  const segments: TranscriptionSegment[] = [];

  let currentTime = 0;
  let segmentId = 0;
  let segmentWords: TranscriptionWord[] = [];
  let segmentText: string[] = [];
  let segmentStart = 0;

  for (let i = 0; i < words.length; i++) {
    let word = words[i];
    const wordStart = currentTime;

    // Add some random variations to simulate real transcription
    const shouldModify = Math.random() < 0.1; // 10% chance of error

    if (shouldModify) {
      const errorType = Math.random();
      if (errorType < 0.3) {
        // Skip word (30% of errors)
        currentTime += timePerWord * 0.5; // Shorter pause for skipped word
        continue;
      } else if (errorType < 0.6) {
        // Slight hesitation (30% of errors)
        currentTime += timePerWord * 0.3; // Add pause
      } else {
        // Minor misspelling (40% of errors)
        if (word.length > 3) {
          const pos = Math.floor(Math.random() * (word.length - 1));
          word = word.slice(0, pos) + word.slice(pos + 1);
        }
      }
    }

    const wordEnd = currentTime + timePerWord;

    const transcriptionWord: TranscriptionWord = {
      word: word,
      start: wordStart,
      end: wordEnd,
      confidence: 0.85 + Math.random() * 0.15, // 85-100% confidence
    };

    transcriptionWords.push(transcriptionWord);
    segmentWords.push(transcriptionWord);
    segmentText.push(word);

    currentTime = wordEnd;

    // Create segment every ~10 words or at punctuation
    const isEndOfSentence = word.match(/[.!?]$/) || (segmentWords.length >= 10);
    if (isEndOfSentence || i === words.length - 1) {
      segments.push({
        id: segmentId++,
        start: segmentStart,
        end: currentTime,
        text: segmentText.join(' '),
        words: [...segmentWords],
      });

      segmentWords = [];
      segmentText = [];
      segmentStart = currentTime;
    }
  }

  return {
    text: transcriptionWords.map(w => w.word).join(' '),
    segments,
    words: transcriptionWords,
    language: 'en',
    duration,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Transform Whisper API response to our TranscriptionResult format
 */
function transformWhisperResponse(data: WhisperAPIResponse): TranscriptionResult {
  // Extract word-level timestamps
  const words: TranscriptionWord[] = [];

  // Prefer top-level words array if available
  if (data.words && data.words.length > 0) {
    words.push(...data.words.map(w => ({
      word: w.word.trim(),
      start: w.start,
      end: w.end,
    })));
  } else if (data.segments) {
    // Fall back to extracting from segments
    for (const segment of data.segments) {
      if (segment.words) {
        words.push(...segment.words.map(w => ({
          word: w.word.trim(),
          start: w.start,
          end: w.end,
        })));
      }
    }
  }

  // Transform segments
  const segments: TranscriptionSegment[] = data.segments?.map(s => ({
    id: s.id,
    start: s.start,
    end: s.end,
    text: s.text.trim(),
    words: s.words?.map(w => ({
      word: w.word.trim(),
      start: w.start,
      end: w.end,
    })),
  })) || [];

  // If no segments, create one for entire transcription
  if (segments.length === 0) {
    segments.push({
      id: 0,
      start: 0,
      end: data.duration,
      text: data.text,
      words: words.length > 0 ? words : undefined,
    });
  }

  return {
    text: data.text,
    segments,
    words,
    language: data.language,
    duration: data.duration,
  };
}

/**
 * Get MIME type for audio file extension
 */
function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    'm4a': 'audio/m4a',
    'mp3': 'audio/mpeg',
    'mp4': 'audio/mp4',
    'mpeg': 'audio/mpeg',
    'mpga': 'audio/mpeg',
    'wav': 'audio/wav',
    'webm': 'audio/webm',
  };

  return mimeTypes[extension.toLowerCase()] || 'audio/m4a';
}

/**
 * Validate if a language code is supported
 */
export function isLanguageSupported(languageCode: string): boolean {
  return SUPPORTED_LANGUAGES.includes(languageCode.toLowerCase());
}

/**
 * Get language name from code (basic implementation)
 */
export function getLanguageName(languageCode: string): string {
  const languageNames: Record<string, string> = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'nl': 'Dutch',
    'pl': 'Polish',
    'tr': 'Turkish',
    // Add more as needed
  };

  return languageNames[languageCode.toLowerCase()] || languageCode.toUpperCase();
}
