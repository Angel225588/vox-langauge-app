/**
 * Google Gemini API Client for Vox Language App
 *
 * This module provides a robust interface to Google's Generative AI API,
 * with retry logic, error handling, and typed response parsing for learning
 * path generation.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
  PathGenerationInput,
  GeneratedPath,
  UserAIMemory,
} from '@/types/learning';
import {
  generatePathPrompt,
  extractJSON,
  validateGeneratedPath,
} from '@/lib/ai/prompts/pathGeneration';

// ============================================================================
// CONFIGURATION
// ============================================================================

const GEMINI_CONFIG = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 8192,
};

const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
};

const MODEL_NAME = 'gemini-2.0-flash';

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Custom error class for Gemini API errors.
 * Includes information about whether the error is retryable.
 */
export class GeminiError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean
  ) {
    super(message);
    this.name = 'GeminiError';
  }
}

/**
 * Determines if an error is retryable based on its type.
 */
function isRetryableError(error: any): boolean {
  // Network errors
  if (error.code === 'NETWORK_ERROR' || error.code === 'ENOTFOUND') {
    return true;
  }

  // Rate limiting
  if (error.code === 'RATE_LIMIT' || error.status === 429) {
    return true;
  }

  // Server errors (5xx)
  if (error.status >= 500 && error.status < 600) {
    return true;
  }

  // Timeout errors
  if (error.code === 'ETIMEDOUT' || error.code === 'TIMEOUT') {
    return true;
  }

  return false;
}

/**
 * Calculates exponential backoff delay with jitter.
 */
function calculateDelay(attempt: number, isRateLimit: boolean = false): number {
  const baseDelay = isRateLimit
    ? RETRY_CONFIG.baseDelayMs * 3 // Longer delay for rate limits
    : RETRY_CONFIG.baseDelayMs;

  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 1000; // Add randomness to avoid thundering herd

  return Math.min(exponentialDelay + jitter, RETRY_CONFIG.maxDelayMs);
}

/**
 * Sleep utility for retry delays.
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// CLIENT INITIALIZATION
// ============================================================================

let genAI: GoogleGenerativeAI | null = null;

/**
 * Initializes the Google Generative AI client.
 * Throws immediately if API key is missing.
 */
function getClient(): GoogleGenerativeAI {
  if (genAI) {
    return genAI;
  }

  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    throw new GeminiError(
      'Gemini API key is missing. Please set EXPO_PUBLIC_GEMINI_API_KEY in your environment.',
      'MISSING_API_KEY',
      false
    );
  }

  genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
}

// ============================================================================
// CORE GENERATION FUNCTIONS
// ============================================================================

/**
 * Sends a prompt to Gemini and returns the raw text response.
 * Includes retry logic with exponential backoff for transient failures.
 *
 * @param prompt - The prompt to send to the AI
 * @returns The raw text response from Gemini
 * @throws {GeminiError} If all retry attempts fail or a non-retryable error occurs
 */
export async function generateWithGemini(prompt: string): Promise<string> {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: GEMINI_CONFIG,
  });

  let lastError: any;

  for (let attempt = 0; attempt < RETRY_CONFIG.maxAttempts; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      if (!text || text.trim().length === 0) {
        throw new GeminiError(
          'Gemini returned an empty response',
          'EMPTY_RESPONSE',
          true
        );
      }

      return text;
    } catch (error: any) {
      lastError = error;

      const isRetryable = isRetryableError(error);
      const isRateLimit = error.code === 'RATE_LIMIT' || error.status === 429;

      // If not retryable or last attempt, throw immediately
      if (!isRetryable || attempt === RETRY_CONFIG.maxAttempts - 1) {
        throw new GeminiError(
          `Gemini API error: ${error.message}`,
          error.code || 'UNKNOWN_ERROR',
          isRetryable
        );
      }

      // Calculate delay and retry
      const delay = calculateDelay(attempt, isRateLimit);
      console.warn(
        `Gemini request failed (attempt ${attempt + 1}/${RETRY_CONFIG.maxAttempts}). Retrying in ${delay}ms...`,
        error.message
      );

      await sleep(delay);
    }
  }

  // This should never be reached due to the throw in the loop, but TypeScript needs it
  throw new GeminiError(
    `Failed after ${RETRY_CONFIG.maxAttempts} attempts: ${lastError?.message}`,
    lastError?.code || 'MAX_RETRIES_EXCEEDED',
    false
  );
}

/**
 * Generates content and parses the response as JSON.
 * Automatically extracts JSON from markdown code blocks if present.
 *
 * @param prompt - The prompt to send to the AI
 * @returns Parsed JSON object of type T
 * @throws {GeminiError} If generation fails or JSON parsing fails
 */
export async function generateJSON<T>(prompt: string): Promise<T> {
  let lastError: any;

  // Allow one retry for invalid JSON responses
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const rawResponse = await generateWithGemini(prompt);
      const parsed = extractJSON<T>(rawResponse);
      return parsed;
    } catch (error: any) {
      lastError = error;

      // If it's a JSON parsing error and we haven't retried yet, try again
      if (error.message?.includes('Invalid JSON') && attempt === 0) {
        console.warn('Invalid JSON response from Gemini. Retrying once...');
        await sleep(1000);
        continue;
      }

      // Otherwise, throw
      throw new GeminiError(
        `Failed to generate valid JSON: ${error.message}`,
        'INVALID_JSON',
        attempt === 0
      );
    }
  }

  // Fallback (should never reach here)
  throw new GeminiError(
    `Failed to parse JSON after retries: ${lastError?.message}`,
    'JSON_PARSE_FAILED',
    false
  );
}

// ============================================================================
// LEARNING PATH GENERATION
// ============================================================================

/**
 * Generates a complete personalized learning path based on user input.
 * This is the primary function for creating new learning paths.
 *
 * @param input - User's onboarding data and preferences
 * @param userMemory - Optional existing user AI memory for personalization
 * @returns A validated GeneratedPath object
 * @throws {GeminiError} If generation or validation fails
 */
export async function generateLearningPath(
  input: PathGenerationInput,
  userMemory?: UserAIMemory
): Promise<GeneratedPath> {
  // Generate the prompt
  const prompt = generatePathPrompt(input, userMemory);

  try {
    // Call Gemini and parse the response
    const generatedPath = await generateJSON<GeneratedPath>(prompt);

    // Validate the structure
    validateGeneratedPath(generatedPath);

    return generatedPath;
  } catch (error: any) {
    if (error instanceof GeminiError) {
      throw error;
    }

    throw new GeminiError(
      `Learning path generation failed: ${error.message}`,
      'PATH_GENERATION_FAILED',
      false
    );
  }
}

// ============================================================================
// LEGACY SUPPORT (for backward compatibility)
// ============================================================================

/**
 * Legacy function for generating learning plans.
 * @deprecated Use generateLearningPath instead
 */
export const generateLearningPlan = async (onboardingData: any) => {
  console.warn('generateLearningPlan is deprecated. Use generateLearningPath instead.');

  // Map old format to new PathGenerationInput format
  const input: PathGenerationInput = {
    user_id: onboardingData.user_id || 'unknown',
    target_language: onboardingData.target_language || onboardingData.targetLanguage,
    native_language: onboardingData.native_language || onboardingData.nativeLanguage,
    motivation: onboardingData.motivation,
    motivation_custom: onboardingData.motivation_custom || onboardingData.motivationCustom,
    why_now: onboardingData.why_now || onboardingData.whyNow,
    proficiency_level: onboardingData.proficiency_level || onboardingData.proficiencyLevel || 'beginner',
    timeline: onboardingData.timeline || '3_months',
    previous_attempts: onboardingData.previous_attempts || onboardingData.previousAttempts,
    commitment_stakes: onboardingData.commitment_stakes || onboardingData.commitmentStakes || 'personal',
  };

  return generateLearningPath(input);
};
