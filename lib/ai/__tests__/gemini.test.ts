/**
 * Tests for Gemini API Client
 *
 * Note: These tests require EXPO_PUBLIC_GEMINI_API_KEY to be set.
 * Most tests are skipped by default to avoid API calls during CI.
 */

import {
  generateWithGemini,
  generateJSON,
  generateLearningPath,
  GeminiError,
} from '../gemini';
import type { PathGenerationInput } from '@/types/learning';

// Skip tests by default to avoid API calls
const describeIfApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY
  ? describe
  : describe.skip;

describe('GeminiError', () => {
  it('should create an error with code and retryable flag', () => {
    const error = new GeminiError('Test error', 'TEST_CODE', true);

    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_CODE');
    expect(error.retryable).toBe(true);
    expect(error.name).toBe('GeminiError');
  });
});

describe('Gemini API Client - Unit Tests', () => {
  it('should throw GeminiError if API key is missing', async () => {
    const originalKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    delete process.env.EXPO_PUBLIC_GEMINI_API_KEY;

    await expect(generateWithGemini('test prompt')).rejects.toThrow(GeminiError);
    await expect(generateWithGemini('test prompt')).rejects.toThrow(
      'Gemini API key is missing'
    );

    // Restore
    if (originalKey) {
      process.env.EXPO_PUBLIC_GEMINI_API_KEY = originalKey;
    }
  });
});

describeIfApiKey('Gemini API Client - Integration Tests', () => {
  // These tests make actual API calls, so they're slow and cost money

  it('should generate text with generateWithGemini', async () => {
    const prompt = 'Say "Hello, World!" in exactly those words.';
    const response = await generateWithGemini(prompt);

    expect(response).toBeTruthy();
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
  }, 15000); // 15 second timeout

  it('should generate and parse JSON with generateJSON', async () => {
    const prompt = `Return a JSON object with this exact structure:
    {
      "name": "Test",
      "value": 42,
      "active": true
    }

    Return ONLY the JSON object, no other text.`;

    const result = await generateJSON<{
      name: string;
      value: number;
      active: boolean;
    }>(prompt);

    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('value');
    expect(result).toHaveProperty('active');
    expect(typeof result.name).toBe('string');
    expect(typeof result.value).toBe('number');
    expect(typeof result.active).toBe('boolean');
  }, 15000);

  it('should generate a learning path', async () => {
    const input: PathGenerationInput = {
      user_id: 'test-user',
      target_language: 'Spanish',
      native_language: 'English',
      motivation: 'travel',
      proficiency_level: 'beginner',
      timeline: '3_months',
      commitment_stakes: 'I have a trip to Spain in 3 months',
    };

    const path = await generateLearningPath(input);

    // Validate structure
    expect(path).toHaveProperty('path_title');
    expect(path).toHaveProperty('path_description');
    expect(path).toHaveProperty('stairs');
    expect(Array.isArray(path.stairs)).toBe(true);
    expect(path.stairs.length).toBeGreaterThanOrEqual(5);

    // Validate first stair
    const firstStair = path.stairs[0];
    expect(firstStair).toHaveProperty('title');
    expect(firstStair).toHaveProperty('description');
    expect(firstStair).toHaveProperty('vocabulary');
    expect(firstStair).toHaveProperty('scenarios');
    expect(Array.isArray(firstStair.vocabulary)).toBe(true);
    expect(firstStair.vocabulary.length).toBeGreaterThanOrEqual(15);
  }, 30000); // 30 second timeout for path generation
});

describe('Error Handling', () => {
  it('should wrap errors in GeminiError', async () => {
    // We can't easily test retry logic without mocking, but we can verify
    // that errors are properly wrapped
    const originalKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    delete process.env.EXPO_PUBLIC_GEMINI_API_KEY;

    try {
      await generateWithGemini('test');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeInstanceOf(GeminiError);
      expect((error as GeminiError).code).toBe('MISSING_API_KEY');
      expect((error as GeminiError).retryable).toBe(false);
    }

    // Restore
    if (originalKey) {
      process.env.EXPO_PUBLIC_GEMINI_API_KEY = originalKey;
    }
  });
});
