# Gemini API Client Documentation

## Overview

The Gemini API client provides a robust, production-ready interface to Google's Generative AI API for the Vox Language App. It includes automatic retry logic, error handling, and type-safe JSON parsing.

## Features

- **Automatic Retry Logic**: Exponential backoff for transient failures
- **Rate Limit Handling**: Smart detection and extended delays for rate limits
- **Type-Safe JSON Parsing**: Automatic extraction and parsing of JSON responses
- **Error Classification**: Distinguishes between retryable and non-retryable errors
- **Validation**: Built-in validation for generated learning paths
- **Legacy Support**: Backward compatible with existing code

## Installation

The `@google/generative-ai` package is already installed. Ensure your `.env` file contains:

```env
EXPO_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
```

## Core Functions

### `generateWithGemini(prompt: string): Promise<string>`

Sends a prompt to Gemini and returns the raw text response.

**Features:**
- 3 retry attempts with exponential backoff
- Automatic handling of network errors and rate limits
- Throws `GeminiError` on failure

**Example:**
```typescript
import { generateWithGemini } from '@/lib/ai';

const response = await generateWithGemini('Translate "Hello" to Spanish');
console.log(response); // "Hola"
```

---

### `generateJSON<T>(prompt: string): Promise<T>`

Generates content and parses the response as JSON.

**Features:**
- Automatically strips markdown code blocks (```json ... ```)
- One automatic retry for invalid JSON
- Type-safe return value
- Throws `GeminiError` if JSON parsing fails

**Example:**
```typescript
interface Greeting {
  spanish: string;
  english: string;
}

const result = await generateJSON<Greeting[]>(`
  Return an array of 3 Spanish greetings with English translations.
  Format: [{"spanish": "Hola", "english": "Hello"}]
`);

result.forEach(g => console.log(`${g.spanish} = ${g.english}`));
```

---

### `generateLearningPath(input: PathGenerationInput, userMemory?: UserAIMemory): Promise<GeneratedPath>`

Generates a complete personalized learning path.

**Features:**
- Uses structured prompts from `pathGeneration.ts`
- Validates the generated path structure
- Optionally personalizes based on user's AI memory
- Returns a fully typed `GeneratedPath` object

**Example:**
```typescript
const input: PathGenerationInput = {
  user_id: 'user_123',
  target_language: 'Spanish',
  native_language: 'English',
  motivation: 'travel',
  proficiency_level: 'beginner',
  timeline: '3_months',
  commitment_stakes: 'Trip to Spain in 3 months',
};

const path = await generateLearningPath(input);

console.log(path.path_title);        // "Your Spanish Travel Journey"
console.log(path.total_stairs);      // 6
console.log(path.stairs[0].title);   // "Basic Greetings"
```

With user memory:
```typescript
const userMemory = await getUserMemory(userId);
const adaptedPath = await generateLearningPath(input, userMemory);
// Path will be tailored to user's strengths, weaknesses, and progress
```

## Error Handling

### `GeminiError`

Custom error class with three properties:
- `message: string` - Human-readable error description
- `code: string` - Machine-readable error code
- `retryable: boolean` - Whether the error can be retried

**Error Codes:**

| Code | Description | Retryable |
|------|-------------|-----------|
| `MISSING_API_KEY` | API key not configured | No |
| `NETWORK_ERROR` | Network connectivity issue | Yes |
| `RATE_LIMIT` | API rate limit exceeded | Yes |
| `TIMEOUT` | Request timed out | Yes |
| `EMPTY_RESPONSE` | Gemini returned empty text | Yes |
| `INVALID_JSON` | JSON parsing failed | Partial* |
| `PATH_GENERATION_FAILED` | Path validation failed | No |
| `UNKNOWN_ERROR` | Unclassified error | Depends |

*One automatic retry is attempted for `INVALID_JSON`

**Usage:**
```typescript
try {
  const path = await generateLearningPath(input);
} catch (error) {
  if (error instanceof GeminiError) {
    console.error(`Error: ${error.message}`);
    console.error(`Code: ${error.code}`);

    if (error.retryable) {
      // Could implement manual retry logic
      console.log('This error is retryable');
    }
  }
}
```

## Configuration

### Model Settings

Located in `gemini.ts`:

```typescript
const GEMINI_CONFIG = {
  temperature: 0.7,    // Creativity level (0.0-1.0)
  topK: 40,            // Top-K sampling
  topP: 0.95,          // Nucleus sampling
  maxOutputTokens: 8192, // Max response length
};
```

**Model:** `gemini-1.5-flash` (fast and cost-effective)

To upgrade to `gemini-1.5-pro` for better quality, change:
```typescript
const MODEL_NAME = 'gemini-1.5-pro';
```

### Retry Configuration

```typescript
const RETRY_CONFIG = {
  maxAttempts: 3,       // Total retry attempts
  baseDelayMs: 1000,    // Base delay (1 second)
  maxDelayMs: 10000,    // Max delay cap (10 seconds)
};
```

**Backoff Formula:**
- Normal errors: `delay = min(baseDelay * 2^attempt + jitter, maxDelay)`
- Rate limits: `delay = min(baseDelay * 3 * 2^attempt + jitter, maxDelay)`

## Integration Examples

### In an Onboarding Flow

```typescript
import { generateLearningPath, GeminiError } from '@/lib/ai';
import { useState } from 'react';

export function OnboardingComplete() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createPath(data: PathGenerationInput) {
    setLoading(true);
    setError(null);

    try {
      const path = await generateLearningPath(data);

      // Save to database
      await saveLearningPath(userId, path);

      // Navigate to path overview
      router.push(`/path/${path.id}`);
    } catch (err) {
      if (err instanceof GeminiError) {
        if (err.code === 'RATE_LIMIT') {
          setError('Too many requests. Please try again in a minute.');
        } else if (err.retryable) {
          setError('Temporary error. Please try again.');
        } else {
          setError('Failed to create your learning path. Please contact support.');
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onPress={() => createPath(formData)} disabled={loading}>
      {loading ? 'Creating your path...' : 'Start Learning'}
    </Button>
  );
}
```

### With Loading States

```typescript
import { generateLearningPath } from '@/lib/ai';
import { Toast } from '@/components/ui';

async function handleGenerate() {
  const toast = Toast.show('Generating your personalized path...', {
    duration: 0, // Keep open
  });

  try {
    const path = await generateLearningPath(input);
    Toast.hide(toast);
    Toast.success('Path created successfully!');
    return path;
  } catch (error) {
    Toast.hide(toast);
    if (error instanceof GeminiError && error.retryable) {
      Toast.error('Connection issue. Please try again.');
    } else {
      Toast.error('Failed to create path. Please contact support.');
    }
    throw error;
  }
}
```

### Background Processing

```typescript
// For long-running path generation, consider background processing
import { generateLearningPath } from '@/lib/ai';

async function generateInBackground(userId: string, input: PathGenerationInput) {
  // Mark as processing
  await updateUserStatus(userId, 'generating_path');

  try {
    const path = await generateLearningPath(input);

    // Save to database
    await saveLearningPath(userId, path);

    // Send notification
    await sendNotification(userId, {
      title: 'Your learning path is ready!',
      body: `Start your journey with "${path.path_title}"`,
    });

    await updateUserStatus(userId, 'path_ready');
  } catch (error) {
    console.error('Background path generation failed:', error);
    await updateUserStatus(userId, 'path_generation_failed');

    // Notify user of failure
    await sendNotification(userId, {
      title: 'Path generation failed',
      body: 'Please try again or contact support.',
    });
  }
}
```

## Testing

### Unit Tests

```typescript
import { GeminiError } from '@/lib/ai';

describe('GeminiError', () => {
  it('should create an error with code and retryable flag', () => {
    const error = new GeminiError('Test error', 'TEST_CODE', true);

    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_CODE');
    expect(error.retryable).toBe(true);
  });
});
```

### Integration Tests

Tests are in `__tests__/gemini.test.ts`. They're skipped by default to avoid API costs:

```bash
# Run with API key set
EXPO_PUBLIC_GEMINI_API_KEY=your_key npm test -- gemini.test.ts
```

### Mocking in Tests

```typescript
jest.mock('@/lib/ai/gemini', () => ({
  generateLearningPath: jest.fn().mockResolvedValue({
    path_title: 'Mock Path',
    path_description: 'Test path',
    total_stairs: 5,
    estimated_completion: '3 months',
    stairs: [/* mock stairs */],
  }),
  GeminiError: class MockGeminiError extends Error {
    constructor(
      message: string,
      public code: string,
      public retryable: boolean
    ) {
      super(message);
    }
  },
}));
```

## Best Practices

### 1. Always Handle Errors

```typescript
// ❌ Bad
const path = await generateLearningPath(input);

// ✅ Good
try {
  const path = await generateLearningPath(input);
  // Use path
} catch (error) {
  if (error instanceof GeminiError) {
    // Handle gracefully
  }
}
```

### 2. Provide User Feedback

```typescript
// ✅ Show loading states
setLoading(true);
try {
  const path = await generateLearningPath(input);
} finally {
  setLoading(false);
}
```

### 3. Check Retryable Errors

```typescript
catch (error) {
  if (error instanceof GeminiError && error.retryable) {
    // Offer retry button
    showRetryButton();
  } else {
    // Show error message and contact support
    showErrorMessage();
  }
}
```

### 4. Use Type Guards

```typescript
if (error instanceof GeminiError) {
  // TypeScript knows error.code and error.retryable exist
  switch (error.code) {
    case 'RATE_LIMIT':
      // Handle rate limit
      break;
    // ...
  }
}
```

### 5. Monitor for Production

```typescript
try {
  const path = await generateLearningPath(input);
} catch (error) {
  // Log to monitoring service
  logger.error('Path generation failed', {
    userId: input.user_id,
    error: error instanceof GeminiError ? error.code : 'unknown',
    retryable: error instanceof GeminiError ? error.retryable : false,
  });

  throw error;
}
```

## Performance Considerations

### Response Times

- **Simple prompts**: 1-3 seconds
- **Learning path generation**: 10-30 seconds
- **Complex paths with memory**: 15-45 seconds

### Cost Optimization

Using `gemini-1.5-flash`:
- Input: ~$0.075 per 1M tokens
- Output: ~$0.30 per 1M tokens

Average learning path generation:
- Input tokens: ~1,500
- Output tokens: ~5,000
- **Cost per path**: ~$0.002 (very affordable!)

To reduce costs further:
1. Cache user memory locally
2. Regenerate only failed stairs instead of entire paths
3. Use batch processing during off-peak hours

## Migration Guide

### From Mock Data

```typescript
// Old code
import { MOCK_LEARNING_PLAN } from '@/lib/db/mock-data';
const plan = MOCK_LEARNING_PLAN;

// New code
import { generateLearningPath } from '@/lib/ai';
const plan = await generateLearningPath(input);
```

### From Legacy `generateLearningPlan`

```typescript
// Old code (still works, but deprecated)
import { generateLearningPlan } from '@/lib/ai/gemini';
const plan = await generateLearningPlan(onboardingData);

// New code (recommended)
import { generateLearningPath } from '@/lib/ai';
const plan = await generateLearningPath(pathInput);
```

## Troubleshooting

### "API key is missing"

**Solution:** Ensure `.env` contains:
```
EXPO_PUBLIC_GEMINI_API_KEY=your_actual_key
```

Restart the development server after adding the key.

### "Invalid JSON response"

**Cause:** Gemini sometimes returns JSON wrapped in markdown or with extra text.

**Solution:** The client automatically strips markdown. If it persists, check the prompt to ensure it asks for "ONLY valid JSON, no other text."

### Rate Limiting

**Cause:** Too many requests in a short time.

**Solution:** The client automatically retries with longer delays. For production, implement request queuing or use background jobs.

### Empty Responses

**Cause:** Gemini safety filters or malformed prompts.

**Solution:** Review the prompt for potentially flagged content. Ensure prompts are clear and specific.

## API Reference

See [`gemini.ts`](./gemini.ts) for full implementation details.

See [`gemini.examples.ts`](./gemini.examples.ts) for comprehensive usage examples.

See [`__tests__/gemini.test.ts`](./__tests__/gemini.test.ts) for test examples.
