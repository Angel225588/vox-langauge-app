# AI Prompts - Quick Reference Card

## Import Statement

```typescript
import {
  generatePathPrompt,
  generateStairContentPrompt,
  generateVocabularyLessonPrompt,
  generateFlashcardsLessonPrompt,
  generateWritingLessonPrompt,
  generateReadingLessonPrompt,
  generateConversationLessonPrompt,
  generateCalibratorPrompt,
  generateAdaptedPathPrompt,
  extractJSON,
  validateGeneratedPath,
  PATH_TEMPLATES,
} from '@/lib/ai/prompts/pathGeneration';
```

## Quick Usage

### 1. Generate Initial Path

```typescript
const prompt = generatePathPrompt(onboardingData, userMemory?);
const response = await gemini.generateText(prompt);
const path = extractJSON<GeneratedPath>(response);
validateGeneratedPath(path);
```

### 2. Generate Stair Content

```typescript
const prompt = generateStairContentPrompt(stair, userMemory, previousStairs);
const response = await gemini.generateText(prompt);
const content = extractJSON(response);
```

### 3. Generate Vocabulary Lesson

```typescript
const prompt = generateVocabularyLessonPrompt(vocabItems, context);
const response = await gemini.generateText(prompt);
const lesson = extractJSON(response);
```

### 4. Generate Flashcards

```typescript
const prompt = generateFlashcardsLessonPrompt(vocabItems);
const response = await gemini.generateText(prompt);
const flashcards = extractJSON(response);
```

### 5. Generate Writing Lesson

```typescript
const prompt = generateWritingLessonPrompt(topic, vocabItems, cefrLevel);
const response = await gemini.generateText(prompt);
const writingLesson = extractJSON(response);
```

### 6. Generate Reading Lesson

```typescript
const prompt = generateReadingLessonPrompt(topic, vocabItems, cefrLevel);
const response = await gemini.generateText(prompt);
const readingLesson = extractJSON(response);
```

### 7. Generate Conversation Lesson

```typescript
const prompt = generateConversationLessonPrompt(scenario, userMemory);
const response = await gemini.generateText(prompt);
const conversation = extractJSON(response);
```

### 8. Generate Calibrator

```typescript
const prompt = generateCalibratorPrompt(section, userMemory, lessonHistory);
const response = await gemini.generateText(prompt);
const calibrator = extractJSON(response);
```

### 9. Adapt Path After Calibration

```typescript
const prompt = generateAdaptedPathPrompt(originalPath, calibratorResult, userMemory);
const response = await gemini.generateText(prompt);
const adaptedSection = extractJSON(response);
```

## PATH_TEMPLATES

```typescript
PATH_TEMPLATES.career      // Professional/business focus
PATH_TEMPLATES.travel      // Survival phrases, navigation
PATH_TEMPLATES.relationship // Casual conversation, emotions
PATH_TEMPLATES.academic    // Grammar, reading, writing
PATH_TEMPLATES.heritage    // Family vocabulary, traditions
```

## Helper Functions

```typescript
// Parse JSON from AI response (handles markdown)
const data = extractJSON<T>(response);

// Validate path structure
validateGeneratedPath(path); // throws if invalid

// Get emoji for lesson type
const emoji = getLessonTypeEmoji('vocabulary'); // "📚"
```

## CEFR Levels

- **A1**: Beginner - Basic phrases, simple sentences
- **A2**: Elementary - Simple daily situations
- **B1**: Intermediate - Main points, familiar topics
- **B2**: Upper Intermediate - Complex text, abstract topics
- **C1**: Advanced - Demanding texts, subtle meanings
- **C2**: Proficiency - Native-like comprehension

## Complete Flow Example

```typescript
// 1. Onboarding
const input: PathGenerationInput = {
  user_id: '123',
  target_language: 'Spanish',
  native_language: 'English',
  motivation: 'travel',
  proficiency_level: 'beginner',
  timeline: '3_months',
  commitment_stakes: 'Trip to Spain',
};

// 2. Generate Path
const pathPrompt = generatePathPrompt(input);
const pathResponse = await gemini.generateText(pathPrompt);
const path = extractJSON<GeneratedPath>(pathResponse);
validateGeneratedPath(path);

// 3. Store in DB
await db.createLearningPath(input.user_id, path);

// 4. Generate First Lesson
const stair = path.stairs[0];
const vocabPrompt = generateVocabularyLessonPrompt(
  stair.vocabulary.slice(0, 10),
  stair.description
);
const vocabResponse = await gemini.generateText(vocabPrompt);
const lesson = extractJSON(vocabResponse);

// 5. Store Lesson
await db.createMiniLesson(stair.id, {
  order: 1,
  type: 'vocabulary',
  content: lesson,
});
```

## Error Handling

```typescript
try {
  const prompt = generatePathPrompt(input);
  const response = await gemini.generateText(prompt);
  const path = extractJSON<GeneratedPath>(response);
  validateGeneratedPath(path);
} catch (error) {
  if (error instanceof SyntaxError) {
    console.error('Invalid JSON from AI');
  } else {
    console.error('Validation failed:', error.message);
  }
}
```

## Type Imports

```typescript
import type {
  PathGenerationInput,
  GeneratedPath,
  GeneratedStair,
  VocabItem,
  Scenario,
  UserAIMemory,
  CEFRLevel,
  CalibratorResult,
  LessonProgress,
  Section,
} from '@/types/learning';
```

## Common Patterns

### Check if user has memory
```typescript
if (userMemory) {
  // Use personalized prompt with memory
  const prompt = generatePathPrompt(input, userMemory);
} else {
  // First-time user, no memory
  const prompt = generatePathPrompt(input);
}
```

### Get motivation template
```typescript
const motivation = input.motivation as keyof typeof PATH_TEMPLATES;
const template = PATH_TEMPLATES[motivation];
if (template) {
  console.log('Focus areas:', template.focus);
  console.log('Stair progression:', template.stairProgression);
}
```

### Build on previous vocabulary
```typescript
const previousVocab = previousStairs
  .flatMap(s => s.vocabulary.map(v => v.word))
  .join(', ');
// Include in prompt context to avoid repetition
```

## Best Practices

1. **Always validate**: Use `validateGeneratedPath()` before storing
2. **Handle errors**: Wrap AI calls in try/catch
3. **Use types**: Import types from `@/types/learning`
4. **Pass context**: Include user memory for personalization
5. **Test prompts**: Verify with mock data before production
6. **Log responses**: Keep AI responses for debugging
7. **Rate limit**: Handle Gemini API limits gracefully

## Quick Debug

```typescript
// Log prompt to verify structure
console.log('PROMPT:', prompt);

// Log response before parsing
console.log('RESPONSE:', response);

// Log parsed data
const data = extractJSON(response);
console.log('PARSED:', JSON.stringify(data, null, 2));

// Validate
try {
  validateGeneratedPath(data);
  console.log('✅ Valid path');
} catch (error) {
  console.log('❌ Invalid:', error.message);
}
```

## Files Location

- **Prompts**: `/lib/ai/prompts/pathGeneration.ts`
- **Examples**: `/lib/ai/prompts/examples.ts`
- **Docs**: `/lib/ai/prompts/README.md`
- **Types**: `/types/learning.ts`
- **DB Schema**: `/lib/db/schemas/learning.ts`
