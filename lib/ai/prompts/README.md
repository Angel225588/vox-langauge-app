# AI Prompt Generation System

This directory contains all AI prompt generators for creating personalized learning paths in the Vox Language App.

## Overview

The prompt generation system uses Google Gemini AI to create dynamic, personalized language learning content. Each prompt is designed to return structured JSON that can be parsed and stored in the database.

## Files

- **`pathGeneration.ts`** - Main prompt generators for learning paths

## Core Prompt Generators

### 1. Main Path Generation

```typescript
import { generatePathPrompt } from '@/lib/ai/prompts/pathGeneration';

const prompt = generatePathPrompt(userOnboardingData, existingUserMemory);
// Send to Gemini, parse JSON response
```

**Purpose**: Creates a complete personalized learning path with 5-7 stairs based on user's motivation, proficiency, and goals.

**Output**: `GeneratedPath` with stairs, vocabulary, scenarios, and progression logic.

### 2. Stair Content Generation

```typescript
import { generateStairContentPrompt } from '@/lib/ai/prompts/pathGeneration';

const prompt = generateStairContentPrompt(stair, userMemory, previousStairs);
// Send to Gemini for detailed stair content
```

**Purpose**: Expands a single stair with 30-50 vocabulary items, grammar points, and practice scenarios.

**Output**: Detailed vocabulary, grammar explanations, scenarios, and mini-lesson structure.

### 3. Mini-Lesson Prompts

#### Vocabulary Lesson
```typescript
import { generateVocabularyLessonPrompt } from '@/lib/ai/prompts/pathGeneration';

const prompt = generateVocabularyLessonPrompt(vocabularyItems, "Shopping at the market");
```

Creates an engaging introduction to new vocabulary with memory tips and examples.

#### Flashcards Lesson
```typescript
import { generateFlashcardsLessonPrompt } from '@/lib/ai/prompts/pathGeneration';

const prompt = generateFlashcardsLessonPrompt(vocabularyItems);
```

Generates 20-30 flashcards for spaced repetition practice.

#### Writing Lesson
```typescript
import { generateWritingLessonPrompt } from '@/lib/ai/prompts/pathGeneration';

const prompt = generateWritingLessonPrompt(
  "Describe your daily routine",
  vocabularyItems,
  userMemory.current_level
);
```

Creates writing prompts with evaluation criteria adjusted for CEFR level.

#### Reading Lesson
```typescript
import { generateReadingLessonPrompt } from '@/lib/ai/prompts/pathGeneration';

const prompt = generateReadingLessonPrompt(
  "A day at the beach",
  vocabularyItems,
  userMemory.current_level
);
```

Generates reading passages with comprehension questions at appropriate difficulty.

#### Conversation Lesson
```typescript
import { generateConversationLessonPrompt } from '@/lib/ai/prompts/pathGeneration';

const prompt = generateConversationLessonPrompt(scenario, userMemory);
```

Creates AI conversation scenarios with personas, objectives, and success criteria.

### 4. Calibrator Generation

```typescript
import { generateCalibratorPrompt } from '@/lib/ai/prompts/pathGeneration';

const prompt = generateCalibratorPrompt(
  completedSection,
  userMemory,
  recentLessonHistory
);
```

**Purpose**: Creates a calibration assessment (not a test!) to gauge user progress and adapt future content.

**Output**: Listening, speaking, and comprehension tasks with points for participation.

### 5. Path Adaptation

```typescript
import { generateAdaptedPathPrompt } from '@/lib/ai/prompts/pathGeneration';

const prompt = generateAdaptedPathPrompt(
  originalPath,
  calibratorResults,
  updatedUserMemory
);
```

**Purpose**: Adapts the next section based on calibration results and identified strengths/weaknesses.

**Output**: A new section (5-7 stairs) tailored to user's current level and needs.

## PATH_TEMPLATES

Pre-defined stair progressions for different motivations:

- **`career`** - Professional/business language
- **`travel`** - Survival phrases and cultural interactions
- **`relationship`** - Casual conversation and emotions
- **`academic`** - Grammar, reading, writing, formal register
- **`heritage`** - Family vocabulary and cultural traditions

```typescript
import { PATH_TEMPLATES } from '@/lib/ai/prompts/pathGeneration';

const template = PATH_TEMPLATES.career;
// {
//   focus: ['formal language', 'professional vocabulary', 'business phrases'],
//   stairProgression: ['Professional Greetings', 'Self Introduction', ...]
// }
```

## Helper Functions

### Extract JSON from AI Response

```typescript
import { extractJSON } from '@/lib/ai/prompts/pathGeneration';

const aiResponse = "```json\n{...}\n```";
const data = extractJSON<GeneratedPath>(aiResponse);
```

Safely parses JSON even if wrapped in markdown code blocks.

### Validate Generated Path

```typescript
import { validateGeneratedPath } from '@/lib/ai/prompts/pathGeneration';

const isValid = validateGeneratedPath(generatedPath);
// Throws error if invalid structure
```

Ensures the AI response has all required fields and minimum content.

### Get Lesson Type Emoji

```typescript
import { getLessonTypeEmoji } from '@/lib/ai/prompts/pathGeneration';

const emoji = getLessonTypeEmoji('vocabulary'); // "📚"
```

## Usage Flow

### Creating a New Learning Path

1. **Collect onboarding data** during user sign-up
2. **Generate main path** using `generatePathPrompt()`
3. **Send to Gemini AI** and get JSON response
4. **Validate and parse** using `extractJSON()` and `validateGeneratedPath()`
5. **Store in database** (learning_paths, sections, stairs tables)

### Generating Lesson Content

1. **User starts a stair**
2. **Generate detailed content** using `generateStairContentPrompt()`
3. **For each mini-lesson**, use specific prompt generator:
   - Lesson 1: `generateVocabularyLessonPrompt()`
   - Lesson 2: `generateFlashcardsLessonPrompt()`
   - Lesson 3: `generateWritingLessonPrompt()`
   - Lesson 4: `generateReadingLessonPrompt()`
   - Lesson 5: `generateConversationLessonPrompt()`
4. **Store content** in `mini_lessons.content` as JSONB

### Running Calibration

1. **User completes a section** (5-7 stairs)
2. **Generate calibrator** using `generateCalibratorPrompt()`
3. **User completes calibration** (earns points, no penalties)
4. **Analyze results** and identify strengths/weaknesses
5. **Update user memory** with insights
6. **Adapt next section** using `generateAdaptedPathPrompt()`

## Best Practices

### Prompt Engineering

- **Be specific**: Include user context, level, and goals in every prompt
- **Request JSON**: Always specify the exact JSON structure needed
- **Provide examples**: Show the AI what good output looks like
- **Set constraints**: Define minimum vocabulary counts, question counts, etc.

### AI Response Handling

- **Always validate**: Use `validateGeneratedPath()` before storing
- **Handle errors gracefully**: AI may return malformed JSON occasionally
- **Log for review**: Keep prompts and responses for debugging
- **Iterate**: Refine prompts based on quality of AI output

### Personalization

- **Use UserAIMemory**: Pass user's strengths, weaknesses, and preferences
- **Build on history**: Reference previously learned vocabulary
- **Adapt difficulty**: Adjust based on CEFR level and calibration results
- **Maintain motivation**: Connect content to user's original motivation

## Example: Complete Flow

```typescript
// 1. User completes onboarding
const onboardingData: PathGenerationInput = {
  user_id: userId,
  target_language: 'Spanish',
  native_language: 'English',
  motivation: 'travel',
  proficiency_level: 'beginner',
  timeline: '3_months',
  commitment_stakes: 'Trip to Barcelona in 3 months',
};

// 2. Generate learning path
const pathPrompt = generatePathPrompt(onboardingData);
const aiResponse = await geminiClient.generateText(pathPrompt);
const generatedPath = extractJSON<GeneratedPath>(aiResponse);
validateGeneratedPath(generatedPath);

// 3. Store in database
await db.createLearningPath(userId, generatedPath);

// 4. When user starts first stair
const stair = generatedPath.stairs[0];
const contentPrompt = generateStairContentPrompt(stair, userMemory, []);
const stairContent = await geminiClient.generateText(contentPrompt);

// 5. Generate first mini-lesson (vocabulary)
const vocabPrompt = generateVocabularyLessonPrompt(
  stair.vocabulary.slice(0, 10),
  stair.description
);
const vocabLesson = await geminiClient.generateText(vocabPrompt);

// 6. Store lesson content
await db.createMiniLesson(stair.id, {
  order: 1,
  type: 'vocabulary',
  content: extractJSON(vocabLesson),
});
```

## Testing Prompts

Use the Gemini API playground or a simple test script:

```typescript
import { generateVocabularyLessonPrompt } from '@/lib/ai/prompts/pathGeneration';
import { geminiClient } from '@/lib/ai/gemini';

const testVocab = [
  { word: 'hola', translation: 'hello', part_of_speech: 'interjection' },
  { word: 'adiós', translation: 'goodbye', part_of_speech: 'interjection' },
];

const prompt = generateVocabularyLessonPrompt(testVocab, 'Basic greetings');
console.log('PROMPT:', prompt);

const response = await geminiClient.generateText(prompt);
console.log('RESPONSE:', response);

const parsed = extractJSON(response);
console.log('PARSED:', JSON.stringify(parsed, null, 2));
```

## Troubleshooting

### AI returns invalid JSON

- Check prompt formatting
- Ensure you're using `extractJSON()` to handle markdown
- Add more explicit JSON examples to the prompt

### Content quality is poor

- Add more context about the user
- Include example outputs in the prompt
- Specify evaluation criteria more clearly
- Increase temperature for more creativity (or decrease for consistency)

### Vocabulary is inappropriate for level

- Pass `userMemory.current_level` explicitly
- Reference CEFR standards in the prompt
- Provide vocabulary examples at the target level

## Future Improvements

- [ ] Add prompt versioning for A/B testing
- [ ] Cache commonly generated lessons
- [ ] Implement prompt templates for consistency
- [ ] Add multi-language support for native language instructions
- [ ] Create prompt analytics dashboard
