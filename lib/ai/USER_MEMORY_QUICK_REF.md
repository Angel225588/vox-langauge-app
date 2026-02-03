# AI Memory System - Quick Reference

## Import

```typescript
import {
  initializeUserMemory,
  getUserMemory,
  updateUserMemory,
  updateMemoryAfterLesson,
  updateMemoryAfterCalibrator,
  generateMemorySummary,
  analyzePatterns,
  calculateCEFRLevel,
} from '@/lib/ai/userMemory';
```

## Common Use Cases

### 1. After Onboarding

```typescript
const memory = await initializeUserMemory({
  user_id: 'user_123',
  native_language: 'Spanish',
  target_language: 'English',
  motivation: 'Job interviews',
  proficiency_level: 'intermediate',
  commitment_stakes: 'Career advancement',
});
```

### 2. After Lesson Completion

```typescript
await updateMemoryAfterLesson(user_id, {
  lesson_type: 'vocabulary',
  cards_good: 8,
  cards_total: 10,
  vocab_learned: ['word1', 'word2'],
  time_spent: 300, // seconds
});
```

### 3. After Calibration

```typescript
await updateMemoryAfterCalibrator(user_id, calibrationResult);
```

### 4. For AI Prompts

```typescript
const memory = await getUserMemory(user_id);
const context = generateMemorySummary(memory);

const prompt = `${context}\n\nCreate a lesson for this user...`;
```

### 5. Display User Stats

```typescript
const memory = await getUserMemory(user_id);

console.log(`Level: ${memory.current_cefr_level}`);
console.log(`Streak: ${memory.current_streak} days`);
console.log(`Vocab: ${memory.total_vocab_learned} words`);
```

## CEFR Level Mapping

| Level | Score Range | Description |
|-------|-------------|-------------|
| A0 | 0-20 | Complete beginner |
| A1 | 20-40 | Basic phrases |
| A2 | 40-55 | Simple conversations |
| B1 | 55-70 | Independent user |
| B2 | 70-85 | Fluent conversations |
| C1 | 85-95 | Professional level |
| C2 | 95-100 | Native-like |

## Memory Structure

```typescript
interface UserAIMemory {
  // Profile
  native_language: string;
  target_language: string;
  motivation: string;

  // Level
  current_cefr_level: CEFRLevel;
  skill_scores: {
    vocabulary: number;
    grammar: number;
    speaking: number;
    listening: number;
  };

  // Progress
  total_lessons_completed: number;
  total_vocab_learned: number;
  current_streak: number;

  // Insights
  insights: {
    strengths: string[];
    weaknesses: string[];
    preferred_topics: string[];
    learning_velocity: 'slow' | 'moderate' | 'fast';
  };

  // AI Observations
  ai_observations: {
    observations: string[];
    patterns: string[];
    blockers: string[];
    wins: string[];
  };

  // Recommendations
  recommendations: {
    focus_areas: string[];
    next_milestone: string;
    estimated_time_to_next_level: string;
  };
}
```

## Example Memory Summary Output

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

## Skill Levels
- Vocabulary: 75/100
- Grammar: 68/100
- Speaking: 55/100
- Listening: 70/100

## AI Observations
- Struggles with past tense verbs
- Quick learner for vocabulary
- Needs more speaking practice

## Recommendations
- Focus on speaking fluency
- Practice pronunciation
- Review irregular verbs
```

## TODO Comments for Database Integration

```typescript
// TODO: Replace with Supabase query
const { data } = await supabase
  .from('user_ai_memory')
  .select('*')
  .eq('user_id', user_id)
  .single();
```

All database operations currently use an in-memory Map. Search for `TODO: ` comments to find where Supabase integration is needed.
