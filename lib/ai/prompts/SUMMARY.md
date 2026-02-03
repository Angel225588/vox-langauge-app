# AI Prompt Generation System - Summary

## What Was Created

A comprehensive AI prompt generation system for creating personalized language learning paths in the Vox Language App.

### Files Created

1. **`/lib/ai/prompts/pathGeneration.ts`** (823 lines)
   - Main prompt generator functions
   - PATH_TEMPLATES for different motivations
   - Helper functions for JSON parsing and validation

2. **`/lib/ai/prompts/README.md`**
   - Complete documentation
   - Usage examples
   - Best practices
   - Troubleshooting guide

3. **`/lib/ai/prompts/examples.ts`**
   - Practical usage examples
   - Mock data for testing
   - Complete integration flow demonstrations

## Key Features

### 1. Main Path Generation
```typescript
generatePathPrompt(input: PathGenerationInput, userMemory?: UserAIMemory): string
```
- Creates 5-7 stairs based on user's motivation and proficiency
- Uses PATH_TEMPLATES for motivation-specific focus areas
- Adjusts for timeline and user's specific goals
- Returns structured JSON prompt for AI

### 2. Stair Content Generation
```typescript
generateStairContentPrompt(stair, userMemory, previousStairs): string
```
- Expands stairs with 30-50 vocabulary items
- Includes grammar points and practice scenarios
- Builds on previously learned vocabulary
- Structures content for 5 mini-lessons per stair

### 3. Mini-Lesson Prompts

Five specialized prompt generators:

- **Vocabulary Lesson**: Introduction with memory tips and examples
- **Flashcards Lesson**: 20-30 cards for spaced repetition
- **Writing Lesson**: Prompts with evaluation criteria (CEFR-adjusted)
- **Reading Lesson**: Passages with comprehension questions
- **Conversation Lesson**: AI roleplay scenarios with objectives

### 4. Calibration System
```typescript
generateCalibratorPrompt(completedSection, userMemory, lessonHistory): string
```
- Creates calibration assessments (NOT tests!)
- Points for participation, no penalties
- Tests listening, speaking, and comprehension
- Identifies strengths and weaknesses for adaptation

### 5. Path Adaptation
```typescript
generateAdaptedPathPrompt(originalPath, calibratorResult, userMemory): string
```
- Adapts next section based on calibration results
- Increases/decreases difficulty appropriately
- Focuses on identified weaknesses
- Maintains user motivation

## PATH_TEMPLATES

Pre-defined stair progressions for 5 motivations:

| Motivation | Focus Areas | Example Stairs |
|------------|-------------|----------------|
| **career** | Formal language, professional vocabulary | Professional Greetings → Salary Negotiation |
| **travel** | Survival phrases, navigation, social interactions | Basic Greetings → Making Friends |
| **relationship** | Casual conversation, emotions, daily life | Getting to Know Someone → Deeper Conversations |
| **academic** | Grammar, reading, writing, formal register | Grammar Foundations → Presentations |
| **heritage** | Family vocabulary, cultural expressions | Family Terms → Connecting Generations |

## Usage Pattern

### Standard Flow

1. **Onboarding** → Collect PathGenerationInput
2. **Generate Path** → Use `generatePathPrompt()`
3. **Send to Gemini** → Get JSON response
4. **Parse & Validate** → Use `extractJSON()` and `validateGeneratedPath()`
5. **Store in DB** → Save to learning_paths, sections, stairs tables

### Lesson Generation

1. **User starts stair** → Generate content with `generateStairContentPrompt()`
2. **Create 5 mini-lessons**:
   - Lesson 1: `generateVocabularyLessonPrompt()`
   - Lesson 2: `generateFlashcardsLessonPrompt()`
   - Lesson 3: `generateWritingLessonPrompt()`
   - Lesson 4: `generateReadingLessonPrompt()`
   - Lesson 5: `generateConversationLessonPrompt()`
3. **Store in mini_lessons.content** as JSONB

### Calibration & Adaptation

1. **User completes section** → Generate calibrator
2. **User takes calibration** → Earn points, get assessed
3. **Update user memory** → Add strengths/weaknesses
4. **Adapt path** → Use `generateAdaptedPathPrompt()` for next section

## Helper Functions

- **`extractJSON<T>(response: string): T`** - Parse JSON from AI response
- **`validateGeneratedPath(path): boolean`** - Validate path structure
- **`getLessonTypeEmoji(type): string`** - Get emoji for lesson type

## Integration Points

### With Gemini API
```typescript
import { geminiClient } from '@/lib/ai/gemini';
import { generatePathPrompt, extractJSON } from '@/lib/ai/prompts/pathGeneration';

const prompt = generatePathPrompt(onboardingData);
const response = await geminiClient.generateText(prompt);
const path = extractJSON<GeneratedPath>(response);
```

### With Database
```typescript
import { db } from '@/lib/db';
import type { LearningPathInsert } from '@/lib/db/schemas/learning';

// After generating and validating path
await db.createLearningPath(userId, generatedPath);
```

### With Type System
```typescript
import type {
  PathGenerationInput,
  GeneratedPath,
  UserAIMemory,
  CEFRLevel,
} from '@/types/learning';
```

## Prompt Engineering Principles

All prompts follow these principles:

1. **Clear Structure**: Separate user context, guidelines, and output format
2. **Examples**: Show the AI what good output looks like
3. **Constraints**: Define minimums (vocabulary count, question count)
4. **JSON Output**: Always request structured JSON for parsing
5. **Personalization**: Include user's level, strengths, weaknesses
6. **Progressive Building**: Reference previous content, build skills logically

## Quality Assurance

Each prompt includes:

- ✅ User context (language, level, motivation)
- ✅ Clear task description
- ✅ Specific output format (JSON schema)
- ✅ Examples of expected output
- ✅ Constraints and requirements
- ✅ CEFR level consideration
- ✅ Instruction to return ONLY valid JSON

## Customization

### Adding New Motivation Templates

```typescript
// In pathGeneration.ts
export const PATH_TEMPLATES = {
  // ... existing templates
  business: {
    focus: ['negotiations', 'presentations', 'networking'],
    stairProgression: [
      'Business Introductions',
      'Email Writing',
      'Meeting Participation',
      // ...
    ],
  },
};
```

### Adjusting CEFR Difficulty

Each prompt that takes a `CEFRLevel` parameter automatically adjusts:
- Vocabulary complexity
- Sentence length
- Grammar concepts
- Expected output length

Example in `generateWritingLessonPrompt()`:
```typescript
const wordCountMap: Record<string, string> = {
  A1: '3-5 sentences',
  A2: '5-8 sentences',
  B1: '8-12 sentences (1-2 paragraphs)',
  // ...
};
```

## Testing Recommendations

1. **Unit Test Prompts**: Verify prompt structure and content
2. **Integration Test**: Send real prompts to Gemini (development API key)
3. **Validate Responses**: Test `extractJSON()` with various AI responses
4. **Quality Check**: Review generated content for appropriateness
5. **A/B Test**: Try different prompt variations for quality

## Future Enhancements

Potential improvements:

- [ ] Add prompt versioning for A/B testing
- [ ] Cache commonly generated lessons (reduce API calls)
- [ ] Multi-language support for native language instructions
- [ ] Difficulty adjustment based on user's actual performance
- [ ] Context-aware prompts (time of day, user mood indicators)
- [ ] Image/audio generation prompts for vocabulary
- [ ] Cultural notes and context in lessons
- [ ] Gamification elements in prompts

## Performance Considerations

- **Token Usage**: Prompts range from 500-2000 tokens
- **Response Size**: Expect 1000-3000 tokens from AI
- **Caching**: Consider caching generated content for common paths
- **Rate Limiting**: Handle Gemini API rate limits gracefully

## Error Handling

All prompts should be wrapped with error handling:

```typescript
try {
  const prompt = generatePathPrompt(input);
  const response = await geminiClient.generateText(prompt);
  const path = extractJSON<GeneratedPath>(response);
  validateGeneratedPath(path);
  return path;
} catch (error) {
  if (error instanceof SyntaxError) {
    // AI returned invalid JSON
    console.error('Invalid JSON from AI', error);
  } else {
    // Validation failed
    console.error('Invalid path structure', error);
  }
  // Fallback or retry logic
}
```

## Documentation

For detailed usage, see:
- **README.md** - Complete documentation with examples
- **examples.ts** - Runnable code examples
- **pathGeneration.ts** - Inline JSDoc comments

## Support

For questions or issues:
1. Check the README.md for usage examples
2. Review examples.ts for integration patterns
3. Verify types are imported correctly from `@/types/learning`
4. Test prompts with mock data before sending to AI
