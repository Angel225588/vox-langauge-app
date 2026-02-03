# Gemini API Client - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Verify API Key

Check your `.env` file:

```bash
cat .env | grep GEMINI
```

Should show:
```
EXPO_PUBLIC_GEMINI_API_KEY=AIza...
```

### Step 2: Import the Client

```typescript
import { generateLearningPath, GeminiError } from '@/lib/ai';
```

### Step 3: Create a Learning Path

```typescript
const input = {
  user_id: 'user_123',
  target_language: 'Spanish',
  native_language: 'English',
  motivation: 'travel',
  proficiency_level: 'beginner',
  timeline: '3_months',
  commitment_stakes: 'Trip to Spain in 3 months',
};

try {
  const path = await generateLearningPath(input);
  console.log('Success!', path.path_title);
} catch (error) {
  if (error instanceof GeminiError) {
    console.error('Error:', error.message);
  }
}
```

## 📋 Complete Working Example

```typescript
import { useState } from 'react';
import { View, Button, Text } from '@/components/ui';
import { generateLearningPath, GeminiError } from '@/lib/ai';
import type { PathGenerationInput } from '@/types/learning';

export function PathGenerator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  async function handleGenerate() {
    setLoading(true);
    setResult('Generating...');

    const input: PathGenerationInput = {
      user_id: 'demo-user',
      target_language: 'Spanish',
      native_language: 'English',
      motivation: 'travel',
      proficiency_level: 'beginner',
      timeline: '3_months',
      commitment_stakes: 'Vacation to Spain',
    };

    try {
      const path = await generateLearningPath(input);

      setResult(`
        ✓ Generated: ${path.path_title}
        ✓ Stairs: ${path.total_stairs}
        ✓ Vocabulary: ${path.stairs.reduce((sum, s) => sum + s.vocabulary.length, 0)} words
        ✓ Completion: ${path.estimated_completion}
      `);
    } catch (error) {
      if (error instanceof GeminiError) {
        setResult(`✗ Error: ${error.message} (${error.code})`);
      } else {
        setResult('✗ Unexpected error');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View>
      <Button onPress={handleGenerate} disabled={loading}>
        Generate Learning Path
      </Button>
      {result && <Text>{result}</Text>}
    </View>
  );
}
```

## 🧪 Test It Manually

Create a test file: `test-gemini.ts`

```typescript
import { generateWithGemini } from '@/lib/ai';

async function test() {
  console.log('Testing Gemini API...');

  try {
    const response = await generateWithGemini('Say "Hello World"');
    console.log('✓ Success:', response);
  } catch (error) {
    console.error('✗ Failed:', error);
  }
}

test();
```

Run it:
```bash
npx ts-node test-gemini.ts
```

## 📊 Expected Response Time

- Simple text: 1-3 seconds
- JSON generation: 2-5 seconds
- Learning path: 10-30 seconds

## 🔍 Debugging

### Check if API key is loaded

```typescript
console.log('API Key exists:', !!process.env.EXPO_PUBLIC_GEMINI_API_KEY);
```

### Test with minimal prompt

```typescript
const response = await generateWithGemini('Say hi');
console.log(response); // Should return something like "Hi!" or "Hello!"
```

### Test JSON parsing

```typescript
const result = await generateJSON<{ test: boolean }>('Return JSON: {"test": true}');
console.log(result.test); // Should be true
```

## ⚠️ Common Issues

### Issue: "API key is missing"

**Fix:** Restart the dev server after adding the key to `.env`

### Issue: Takes too long

**Normal:** Learning path generation takes 10-30 seconds
**Solution:** Show a loading indicator to the user

### Issue: "Invalid JSON"

**Cause:** Sometimes Gemini wraps JSON in markdown
**Solution:** This is handled automatically, but if it persists, adjust your prompt

### Issue: Rate limiting

**Cause:** Too many requests
**Solution:** The client automatically retries with delays. For high traffic, implement queueing.

## 🎯 Next Steps

1. ✅ Read the full docs: [`GEMINI_CLIENT.md`](./GEMINI_CLIENT.md)
2. ✅ Check usage examples: [`gemini.examples.ts`](./gemini.examples.ts)
3. ✅ Review tests: [`__tests__/gemini.test.ts`](./__tests__/gemini.test.ts)
4. ✅ Integrate into your onboarding flow

## 💡 Pro Tips

- Always show loading states (path generation is slow)
- Handle errors gracefully with user-friendly messages
- Use the `retryable` flag to decide if users should retry
- Consider background processing for better UX
- Monitor error codes in production to catch issues early

---

Need help? Check the full documentation in [`GEMINI_CLIENT.md`](./GEMINI_CLIENT.md)
