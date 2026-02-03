# AI Module

The AI module contains all AI-powered functionality for the Vox Language App, including user memory management, personalized lesson generation, and intelligent learning path creation.

## Contents

### User Memory System (NEW!)

A comprehensive AI memory system that acts like a `claude.md` file for each user, tracking their learning journey and personalizing their experience.

**Quick Start:**
```typescript
import { initializeUserMemory, getUserMemory, updateMemoryAfterLesson } from '@/lib/ai';
```

**Documentation:**
- [`USER_MEMORY.md`](./USER_MEMORY.md) - Complete system documentation
- [`USER_MEMORY_QUICK_REF.md`](./USER_MEMORY_QUICK_REF.md) - Quick reference guide
- [`INTEGRATION_EXAMPLES.md`](./INTEGRATION_EXAMPLES.md) - Real-world usage examples
- [`AI_MEMORY_SYSTEM_SUMMARY.md`](./AI_MEMORY_SYSTEM_SUMMARY.md) - High-level overview

**Files:**
- `userMemory.ts` - Core implementation (871 lines)
- `userMemory.example.ts` - Usage examples
- `__tests__/userMemory.test.ts` - Unit tests
- `index.ts` - Module exports

### Prompt Engineering

AI prompt templates and utilities for generating personalized learning content.

**Documentation:**
- [`prompts/README.md`](./prompts/README.md) - Prompts overview
- [`prompts/SUMMARY.md`](./prompts/SUMMARY.md) - Detailed documentation
- [`prompts/QUICK_REFERENCE.md`](./prompts/QUICK_REFERENCE.md) - Quick reference

**Files:**
- `prompts/pathGeneration.ts` - Learning path generation prompts
- `prompts/examples.ts` - Example prompts

### Gemini Integration

Google Gemini API integration for AI-powered content generation.

**Files:**
- `gemini.ts` - Gemini API client

## Features

### User Memory System

- **Profile Tracking**: Languages, motivation, proficiency level
- **Progress Monitoring**: Lessons, vocabulary, study time, streaks
- **Skill Assessment**: Vocabulary, grammar, speaking, listening scores
- **Learning Insights**: Strengths, weaknesses, patterns, preferences
- **AI Observations**: Behavioral patterns, blockers, wins
- **Recommendations**: Personalized focus areas and next steps
- **Calibration History**: Complete assessment tracking

### Prompt Engineering

- Learning path generation
- Personalized lesson creation
- Conversation scenarios
- Assessment questions

### AI Integration

- Gemini API for content generation
- Context-aware prompting with user memory
- Structured output parsing

## Installation

The AI module is part of the main Vox Language App. No additional installation needed.

## Usage

### Initialize User Memory (After Onboarding)

```typescript
import { initializeUserMemory } from '@/lib/ai';

const memory = await initializeUserMemory({
  user_id: 'user_123',
  native_language: 'Spanish',
  target_language: 'English',
  motivation: 'Job interviews',
  proficiency_level: 'intermediate',
  commitment_stakes: 'Career advancement',
});
```

### Update After Lesson

```typescript
import { updateMemoryAfterLesson } from '@/lib/ai';

await updateMemoryAfterLesson(user_id, {
  lesson_type: 'vocabulary',
  cards_good: 8,
  cards_total: 10,
  vocab_learned: ['word1', 'word2'],
  time_spent: 300, // seconds
});
```

### Generate AI Context

```typescript
import { getUserMemory, generateMemorySummary } from '@/lib/ai';

const memory = await getUserMemory(user_id);
const context = generateMemorySummary(memory);

// Use in AI prompt
const prompt = `${context}\n\nCreate a personalized lesson...`;
```

### Display User Stats

```typescript
import { getUserMemory } from '@/lib/ai';

const memory = await getUserMemory(user_id);

console.log(`Level: ${memory.current_cefr_level}`);
console.log(`Streak: ${memory.current_streak} days`);
console.log(`Vocab: ${memory.total_vocab_learned} words`);
```

## API Reference

### User Memory Functions

#### `initializeUserMemory(input)`
Creates initial memory after onboarding.

**Parameters:**
- `user_id: string` - User ID
- `native_language: string` - User's native language
- `target_language: string` - Language being learned
- `motivation: string` - Learning motivation
- `proficiency_level: string` - Initial proficiency
- `commitment_stakes: string` - User's commitment

**Returns:** `Promise<UserAIMemory>`

#### `getUserMemory(user_id)`
Retrieves user's AI memory.

**Parameters:**
- `user_id: string` - User ID

**Returns:** `Promise<UserAIMemory | null>`

#### `updateUserMemory(user_id, updates)`
Updates specific memory fields.

**Parameters:**
- `user_id: string` - User ID
- `updates: Partial<UserAIMemory>` - Fields to update

**Returns:** `Promise<UserAIMemory>`

#### `updateMemoryAfterLesson(user_id, result)`
Automatically updates memory after lesson completion.

**Parameters:**
- `user_id: string` - User ID
- `result: LessonResult` - Lesson completion data

**Returns:** `Promise<void>`

#### `updateMemoryAfterCalibrator(user_id, result)`
Major update after calibration test.

**Parameters:**
- `user_id: string` - User ID
- `result: CalibrationResult` - Calibration test results

**Returns:** `Promise<UserAIMemory>`

#### `generateMemorySummary(memory)`
Generates markdown summary for AI prompts.

**Parameters:**
- `memory: UserAIMemory` - User memory object

**Returns:** `string` - Markdown-formatted summary

#### `analyzePatterns(history)`
Analyzes lesson history for patterns.

**Parameters:**
- `history: LessonProgress[]` - Lesson history

**Returns:** `{ strengths: string[], weaknesses: string[], observations: string[] }`

#### `calculateCEFRLevel(scores)`
Calculates CEFR level from skill scores.

**Parameters:**
- `scores: { vocabulary, grammar, speaking, listening }` - Skill scores (0-100)

**Returns:** `CEFRLevel` - CEFR level (A0-C2)

## Types

### UserAIMemory

```typescript
interface UserAIMemory {
  user_id: string;
  native_language: string;
  target_language: string;
  motivation: string;
  current_cefr_level: CEFRLevel;
  skill_scores: SkillScores;
  total_lessons_completed: number;
  total_vocab_learned: number;
  current_streak: number;
  insights: LearningInsights;
  ai_observations: AIObservations;
  recommendations: PersonalizedRecommendations;
  // ... more fields
}
```

See [`USER_MEMORY.md`](./USER_MEMORY.md) for complete type definitions.

## Testing

```bash
# Run user memory tests
npm test lib/ai/__tests__/userMemory.test.ts

# Run all AI module tests
npm test lib/ai
```

## Examples

See [`INTEGRATION_EXAMPLES.md`](./INTEGRATION_EXAMPLES.md) for:
- Onboarding flow integration
- Lesson completion handling
- Calibration integration
- AI lesson generation
- Progress dashboard
- Adaptive lesson selection
- Daily reminders
- Weekly reports

## Database Integration

Currently using in-memory storage. To integrate with Supabase:

1. Create `user_ai_memory` table (schema in [`USER_MEMORY.md`](./USER_MEMORY.md))
2. Replace Map operations with Supabase queries
3. Update functions with TODO comments

## Performance

### Current (In-Memory)
- ⚡ Instant reads/writes
- ✅ No network latency
- ❌ Lost on app restart

### Future (Supabase)
- 🔄 ~50-100ms per query
- ✅ Persistent across sessions
- ✅ Real-time sync
- 💡 Consider caching

## Best Practices

1. ✅ Initialize memory right after onboarding
2. ✅ Update memory after every lesson
3. ✅ Always check for null when getting memory
4. ✅ Include memory context in AI prompts
5. ✅ Handle errors gracefully (don't break app flow)
6. ✅ Batch updates when possible
7. ✅ Respect user privacy

## Contributing

When adding new AI features:

1. Update type definitions
2. Implement core functions
3. Add documentation
4. Create usage examples
5. Write unit tests
6. Update this README

## File Structure

```
lib/ai/
├── README.md                           # This file
├── index.ts                            # Module exports
│
├── userMemory.ts                       # User memory implementation
├── userMemory.example.ts               # Usage examples
├── USER_MEMORY.md                      # Complete documentation
├── USER_MEMORY_QUICK_REF.md            # Quick reference
├── INTEGRATION_EXAMPLES.md             # Real-world examples
├── AI_MEMORY_SYSTEM_SUMMARY.md         # System overview
│
├── gemini.ts                           # Gemini API client
│
├── prompts/
│   ├── README.md                       # Prompts overview
│   ├── SUMMARY.md                      # Detailed docs
│   ├── QUICK_REFERENCE.md              # Quick reference
│   ├── pathGeneration.ts               # Path generation prompts
│   └── examples.ts                     # Example prompts
│
└── __tests__/
    └── userMemory.test.ts              # User memory tests
```

## Version History

### v1.0.0 (2025-12-12)
- ✨ Initial user memory system
- ✨ Complete documentation
- ✨ Usage examples
- ✨ Unit tests
- ✨ Integration guides

## License

Part of the Vox Language App - Internal use only.

## Support

For questions or issues:
1. Check the documentation files
2. Review integration examples
3. Run the example code
4. Check unit tests for usage patterns

## Related Files

- `/types/calibration.ts` - Calibration types
- `/lib/types/mini-lesson.ts` - Lesson types
- `/types/learning.ts` - Learning system types
- `/types/vocabulary.ts` - Vocabulary types

---

**Last Updated**: December 12, 2025
**Status**: Production-ready (pending Supabase integration)
