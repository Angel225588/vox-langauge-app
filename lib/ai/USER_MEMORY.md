# AI Memory System

The AI Memory System is like a `claude.md` file but for each user - it stores important information that the AI remembers about them to personalize learning experiences.

## Overview

This system tracks and analyzes:
- **User Profile**: Native language, target language, motivation, goals
- **Calibration Results**: Skill assessments, CEFR levels
- **Learning Progress**: Lessons completed, vocabulary learned, streaks
- **AI Insights**: Strengths, weaknesses, patterns, observations
- **Recommendations**: Personalized focus areas and next steps

## Core Functions

### 1. Initialize Memory
Called after onboarding completion to create the user's AI memory.

```typescript
import { initializeUserMemory } from '@/lib/ai/userMemory';

const memory = await initializeUserMemory({
  user_id: 'user_123',
  native_language: 'Spanish',
  target_language: 'English',
  motivation: 'Job interviews',
  motivation_custom: 'Prepare for tech company interviews',
  proficiency_level: 'intermediate', // Maps to B1 CEFR
  commitment_stakes: 'Career advancement',
});
```

### 2. Get Memory
Retrieve a user's AI memory.

```typescript
import { getUserMemory } from '@/lib/ai/userMemory';

const memory = await getUserMemory(user_id);
if (memory) {
  console.log(`Current level: ${memory.current_cefr_level}`);
  console.log(`Lessons completed: ${memory.total_lessons_completed}`);
}
```

### 3. Update Memory
Update specific fields in the memory.

```typescript
import { updateUserMemory } from '@/lib/ai/userMemory';

await updateUserMemory(user_id, {
  current_streak: 10,
  insights: {
    strengths: ['vocabulary', 'reading'],
    weaknesses: ['speaking'],
    preferred_topics: ['business', 'technology'],
    preferred_lesson_types: ['vocabulary', 'listening'],
    struggle_areas: ['past tense verbs'],
    learning_velocity: 'fast',
  },
});
```

### 4. Update After Lesson
Automatically update memory when a lesson is completed.

```typescript
import { updateMemoryAfterLesson } from '@/lib/ai/userMemory';

await updateMemoryAfterLesson(user_id, {
  lesson_type: 'vocabulary',
  cards_good: 8,
  cards_total: 10,
  vocab_learned: ['interview', 'resume', 'portfolio'],
  time_spent: 420, // seconds
});
```

This automatically:
- Increments total lessons completed
- Updates total time spent and vocab learned
- Calculates and updates streaks
- Updates skill scores based on performance
- Generates AI observations
- Updates lesson type preferences

### 5. Update After Calibration
Major update after completing the calibration test.

```typescript
import { updateMemoryAfterCalibrator } from '@/lib/ai/userMemory';

const updatedMemory = await updateMemoryAfterCalibrator(
  user_id,
  calibrationResult
);
```

This extracts and updates:
- CEFR level and skill scores
- Strengths and weaknesses
- Struggle areas
- AI observations from calibration
- Personalized recommendations

### 6. Generate Memory Summary
Create a markdown-formatted summary for AI prompts (like claude.md).

```typescript
import { generateMemorySummary } from '@/lib/ai/userMemory';

const memory = await getUserMemory(user_id);
const summary = generateMemorySummary(memory);

// Use in AI prompt
const prompt = `
${summary}

Based on the user's profile above, create a personalized lesson...
`;
```

**Example Output:**
```markdown
## User Profile
- Native Language: Spanish
- Learning: English
- Current Level: B1
- Motivation: Job interviews

## Learning Progress
- Lessons Completed: 15
- Total Study Time: 2h 30m
- Vocabulary Learned: 120 words
- Current Streak: 7 days
- Longest Streak: 12 days

## Skill Levels
- Vocabulary: 75/100
- Grammar: 68/100
- Speaking: 55/100
- Listening: 70/100

## Learning Insights
- Strengths: vocabulary, reading
- Weaknesses: speaking, pronunciation
- Preferred Topics: business, technology
- Learning Velocity: fast

## AI Observations
- Struggles with past tense verbs
- Quick learner for vocabulary
- Needs more speaking practice

## Recommendations
### Focus Areas:
- Speaking fluency
- Pronunciation practice
- Past tense verb mastery
```

### 7. Analyze Patterns
Identify patterns from lesson history.

```typescript
import { analyzePatterns } from '@/lib/ai/userMemory';

const patterns = analyzePatterns(lessonHistory);

console.log('Strengths:', patterns.strengths);
// ['vocabulary', 'listening']

console.log('Weaknesses:', patterns.weaknesses);
// ['speaking']

console.log('Observations:', patterns.observations);
// ['vocabulary: 90% avg accuracy (5 lessons)', 'Tends to study in the morning']
```

### 8. Calculate CEFR Level
Convert skill scores to CEFR level.

```typescript
import { calculateCEFRLevel } from '@/lib/ai/userMemory';

const level = calculateCEFRLevel({
  vocabulary: 75,
  grammar: 68,
  speaking: 55,
  listening: 70,
});
// Returns: 'B1'
```

## Data Structure

### UserAIMemory

```typescript
interface UserAIMemory {
  user_id: string;

  // Profile
  native_language: string;
  target_language: string;
  motivation: string;
  motivation_custom?: string;
  commitment_stakes: string;

  // Current Level
  current_cefr_level: CEFRLevel; // 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  declared_level: DeclaredLevel; // 'beginner' | 'basics' | 'intermediate' | 'advanced'
  skill_scores: {
    vocabulary: number;    // 0-100
    grammar: number;
    speaking: number;
    listening: number;
    reading?: number;
    writing?: number;
  };

  // Learning History
  total_lessons_completed: number;
  total_time_spent: number;        // seconds
  total_vocab_learned: number;
  current_streak: number;          // days
  longest_streak: number;
  last_lesson_date: string | null;

  // Calibration
  last_calibration_date: string | null;
  calibration_history: CalibrationResult[];

  // Insights
  insights: {
    strengths: string[];
    weaknesses: string[];
    preferred_topics: string[];
    preferred_lesson_types: LessonType[];
    struggle_areas: string[];
    learning_velocity: 'slow' | 'moderate' | 'fast';
  };

  ai_observations: {
    observations: string[];
    patterns: string[];
    blockers: string[];
    wins: string[];
    last_updated: string;
  };

  recommendations: {
    focus_areas: string[];
    suggested_lesson_types: LessonType[];
    topics_to_explore: string[];
    next_milestone: string;
    estimated_time_to_next_level: string;
    practice_frequency: string;
  };

  // Metadata
  created_at: string;
  updated_at: string;
  version: number;
}
```

## Integration Points

### Onboarding Flow
```typescript
// After user completes onboarding
const memory = await initializeUserMemory({
  user_id,
  native_language,
  target_language,
  motivation,
  proficiency_level,
  commitment_stakes,
});
```

### Calibration Flow
```typescript
// After calibration test completion
await updateMemoryAfterCalibrator(user_id, calibrationResult);
```

### Lesson Completion
```typescript
// After each lesson
await updateMemoryAfterLesson(user_id, {
  lesson_type: 'vocabulary',
  cards_good: 8,
  cards_total: 10,
  vocab_learned: ['word1', 'word2'],
  time_spent: 300,
});
```

### AI Lesson Generation
```typescript
// When generating personalized content
const memory = await getUserMemory(user_id);
const context = generateMemorySummary(memory);

const aiPrompt = `
${context}

Create a personalized lesson focusing on their weaknesses...
`;
```

### Progress Dashboard
```typescript
// Display user stats
const memory = await getUserMemory(user_id);

return (
  <View>
    <Text>Current Level: {memory.current_cefr_level}</Text>
    <Text>Streak: {memory.current_streak} days</Text>
    <Text>Vocabulary: {memory.total_vocab_learned} words</Text>
    <Text>Next Milestone: {memory.recommendations.next_milestone}</Text>
  </View>
);
```

## Database Integration

Currently using in-memory storage (Map). To integrate with Supabase:

### 1. Create Table

```sql
CREATE TABLE user_ai_memory (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),

  -- Profile
  native_language TEXT NOT NULL,
  target_language TEXT NOT NULL,
  motivation TEXT NOT NULL,
  motivation_custom TEXT,
  commitment_stakes TEXT NOT NULL,

  -- Current Level
  current_cefr_level TEXT NOT NULL,
  declared_level TEXT NOT NULL,
  skill_scores JSONB NOT NULL,

  -- Learning History
  total_lessons_completed INTEGER DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0,
  total_vocab_learned INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_lesson_date TIMESTAMPTZ,

  -- Calibration
  last_calibration_date TIMESTAMPTZ,
  calibration_history JSONB DEFAULT '[]'::jsonb,

  -- Insights
  insights JSONB NOT NULL,
  ai_observations JSONB NOT NULL,
  recommendations JSONB NOT NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER DEFAULT 1
);

CREATE INDEX idx_user_ai_memory_user_id ON user_ai_memory(user_id);
CREATE INDEX idx_user_ai_memory_updated_at ON user_ai_memory(updated_at);
```

### 2. Update Functions

Replace `memoryStore` Map operations with Supabase queries:

```typescript
// getUserMemory
const { data } = await supabase
  .from('user_ai_memory')
  .select('*')
  .eq('user_id', user_id)
  .single();

// initializeUserMemory
const { data } = await supabase
  .from('user_ai_memory')
  .insert(memory)
  .select()
  .single();

// updateUserMemory
const { data } = await supabase
  .from('user_ai_memory')
  .update({ ...updates, updated_at: new Date().toISOString() })
  .eq('user_id', user_id)
  .select()
  .single();
```

## CEFR Level Mapping

The system maps proficiency levels to CEFR and score ranges:

| Proficiency | CEFR | Score Range | Description |
|------------|------|-------------|-------------|
| Beginner | A0 | 0-20 | Just starting |
| Basics | A1 | 20-40 | Basic phrases |
| Basics | A2 | 40-55 | Simple conversations |
| Intermediate | B1 | 55-70 | Independent user |
| Intermediate | B2 | 70-85 | Fluent conversations |
| Advanced | C1 | 85-95 | Professional level |
| Advanced | C2 | 95-100 | Native-like mastery |

## Learning Velocity Calculation

Based on lessons per day since account creation:
- **Fast**: 3+ lessons/day
- **Moderate**: 1-3 lessons/day
- **Slow**: <1 lesson/day

## Streak Calculation

- Same day completion: Streak continues
- Next day completion: Streak increments
- Gap > 1 day: Streak resets to 1
- Tracks both current and longest streak

## Skill Score Updates

When a lesson is completed:
- Maps lesson type to skill (vocabulary → vocabulary, speaking → speaking, etc.)
- Updates score using weighted average: **70% current + 30% new**
- Prevents wild swings while allowing gradual improvement

## Best Practices

1. **Initialize Early**: Create memory immediately after onboarding
2. **Update Consistently**: Call `updateMemoryAfterLesson()` after every lesson
3. **Calibrate Periodically**: Run calibration test every 2-4 weeks
4. **Use Summaries**: Always include memory context in AI prompts
5. **Monitor Patterns**: Check `ai_observations` for learning blockers
6. **Personalize**: Use `recommendations` to guide lesson selection

## Examples

See `userMemory.example.ts` for comprehensive usage examples including:
- Initialization
- Lesson updates
- Calibration integration
- Pattern analysis
- AI prompt generation
- Custom field updates

## Future Enhancements

- [ ] Supabase integration
- [ ] Real-time sync across devices
- [ ] ML-based pattern recognition
- [ ] Predictive analytics for learning outcomes
- [ ] Multi-language support tracking
- [ ] Social learning insights (anonymized comparisons)
- [ ] Adaptive difficulty recommendations
- [ ] Time-of-day performance optimization

## License

Part of the Vox Language App - Internal use only.
