# Scenario-Staircase Connection Architecture

**Created**: 2026-01-24
**Status**: Approved by Expert Roundtable
**Author**: PM Agent Session

---

## Executive Summary

This document defines the architecture for connecting voice conversation scenarios and reading content to the staircase learning path system. The goal is to create a seamless, personalized learning experience where scenarios progressively unlock based on user progress.

---

## Current State Analysis

### What Exists Today

| Component | Status | Location |
|-----------|--------|----------|
| Voice Scenarios | 20+ scenarios | `lib/voice/scenarios.ts`, `lib/scenarios/dialogueScenarios.ts` |
| Scenario Matcher | Functional | `lib/voice/scenarioMatcher.ts` |
| Reading Passages | 15 curated | `lib/reading/curatedPassages.ts` |
| Staircase System | Functional | `lib/db/learningPaths.ts`, `hooks/useLearningPath.ts` |
| User Progress | Tracking works | `user_stair_progress` table |

### The Gap

**CRITICAL**: Scenarios and reading content are **completely disconnected** from the staircase system.

- User completes Stair 2 → Nothing unlocks
- No scenario recommendations based on current level
- No vocabulary alignment between stairs and content
- No completion tracking for scenarios

---

## Proposed Architecture

### 1. Database Schema Additions

```sql
-- Table: staircase_scenario_assignments
-- Links stairs to recommended scenarios
CREATE TABLE staircase_scenario_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID NOT NULL REFERENCES staircase_steps(id) ON DELETE CASCADE,
  scenario_id TEXT NOT NULL,  -- References scenario ID from scenarios.ts
  scenario_type TEXT NOT NULL CHECK (scenario_type IN ('voice', 'dialogue', 'reading')),
  order_in_stair INT NOT NULL DEFAULT 1,
  is_required BOOLEAN DEFAULT false,  -- Must complete before stair is done
  unlock_threshold INT DEFAULT 0,  -- % of stair vocabulary to unlock (0 = immediate)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: user_scenario_progress
-- Tracks user's scenario completion and performance
CREATE TABLE user_scenario_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_id TEXT NOT NULL,
  scenario_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('locked', 'available', 'in_progress', 'completed')),
  attempts INT DEFAULT 0,
  best_score INT DEFAULT 0,  -- 0-100
  fluency_score INT DEFAULT 0,
  comprehension_score INT DEFAULT 0,
  vocab_usage_rate DECIMAL(3,2) DEFAULT 0.00,  -- % of target vocab used
  total_time_seconds INT DEFAULT 0,
  first_attempt_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, scenario_id)
);

-- Table: passage_vocabulary_links
-- Connects reading passages to stair vocabulary
CREATE TABLE passage_vocabulary_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passage_id TEXT NOT NULL,  -- References passage ID from curatedPassages.ts
  word TEXT NOT NULL,
  step_id UUID REFERENCES staircase_steps(id) ON DELETE SET NULL,
  frequency INT DEFAULT 1,  -- How many times word appears in passage
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_scenario_assignments_step ON staircase_scenario_assignments(step_id);
CREATE INDEX idx_scenario_progress_user ON user_scenario_progress(user_id);
CREATE INDEX idx_scenario_progress_status ON user_scenario_progress(user_id, status);
CREATE INDEX idx_passage_vocab_step ON passage_vocabulary_links(step_id);
```

### 2. Scenario Assignment Matrix

Each stair gets 2-4 recommended scenarios based on:
- Difficulty level matching
- Vocabulary alignment
- Skill focus alignment

```typescript
// lib/scenarios/staircaseMapping.ts

export interface StairScenarioMapping {
  stairOrder: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  recommendedScenarios: {
    voiceScenarios: string[];   // IDs from scenarios.ts
    dialogueScenarios: string[]; // IDs from dialogueScenarios.ts
    readingPassages: string[];   // IDs from curatedPassages.ts
  };
  vocabularyAlignment: string[]; // Key vocabulary for this stair
}

// Example mapping for a Spanish learning path
export const SPANISH_STAIR_SCENARIO_MAP: StairScenarioMapping[] = [
  {
    stairOrder: 1,
    difficulty: 'beginner',
    recommendedScenarios: {
      voiceScenarios: ['greeting-basic', 'cafe-order'],
      dialogueScenarios: ['essential-greetings', 'essential-food'],
      readingPassages: ['mi-dia-perfecto', 'en-el-mercado'],
    },
    vocabularyAlignment: ['hola', 'gracias', 'por favor', 'buenos días'],
  },
  {
    stairOrder: 2,
    difficulty: 'beginner',
    recommendedScenarios: {
      voiceScenarios: ['directions-basic', 'shopping-market'],
      dialogueScenarios: ['essential-travel', 'essential-shopping'],
      readingPassages: ['en-el-mercado', 'preparacion-entrevista'],
    },
    vocabularyAlignment: ['dónde', 'cuánto', 'izquierda', 'derecha'],
  },
  // ... continue for all 8 stairs
];
```

### 3. Progressive Unlock System

```typescript
// lib/scenarios/unlockEngine.ts

export interface UnlockCondition {
  type: 'stair_completion' | 'vocab_threshold' | 'scenario_chain';
  value: number | string;
}

export async function checkScenarioUnlock(
  userId: string,
  scenarioId: string
): Promise<{ unlocked: boolean; reason?: string }> {
  // 1. Check if user's current stair allows this scenario
  // 2. Check vocabulary threshold (e.g., 50% of stair vocab learned)
  // 3. Check prerequisite scenarios completed
  // 4. Return unlock status with reason
}

export async function getAvailableScenarios(
  userId: string
): Promise<ScenarioWithStatus[]> {
  // Returns all scenarios with their current status for this user
  // Used by VoiceConversationScreen to show available options
}

export async function unlockNextScenarios(
  userId: string,
  completedStairId: string
): Promise<string[]> {
  // Called when user completes a stair
  // Returns IDs of newly unlocked scenarios
}
```

### 4. Integration Points

#### A. Staircase Completion Hook

```typescript
// hooks/useLearningPath.ts - ADD

export async function onStairCompleted(userId: string, stairId: string) {
  // 1. Mark stair as completed
  await updateStairStatus(stairId, 'completed');

  // 2. Unlock next stair
  await unlockNextStair(userId, stairId);

  // 3. Unlock corresponding scenarios
  const newScenarios = await unlockNextScenarios(userId, stairId);

  // 4. Show celebration with new content preview
  return {
    unlockedScenarios: newScenarios,
    celebrationMessage: `You unlocked ${newScenarios.length} new practice scenarios!`,
  };
}
```

#### B. Voice Conversation Screen Update

```typescript
// app/voice-conversation.tsx - MODIFY

// Replace static scenario list with dynamic fetch
const { data: scenarios, isLoading } = useQuery({
  queryKey: ['available-scenarios', userId],
  queryFn: () => getAvailableScenarios(userId),
});

// Show locked scenarios with unlock requirements
<ScenarioCard
  scenario={scenario}
  status={scenario.status}
  unlockRequirement={scenario.status === 'locked' ? scenario.unlockMessage : undefined}
/>
```

#### C. Reading Practice Screen Update

```typescript
// Similar update for reading - filter passages by user's current stair
const { data: passages } = useQuery({
  queryKey: ['available-passages', userId, currentStairId],
  queryFn: () => getPassagesForStair(currentStairId),
});
```

### 5. Gemini Analysis After Stair 2

Per the roundtable decision, after completing Stair 2:

```typescript
// lib/ai/pathRefinement.ts

export async function analyzeAndRefinePathAfterStair2(
  userId: string,
  stair1Performance: StairPerformance,
  stair2Performance: StairPerformance
): Promise<PathRefinement> {
  // Collect metrics
  const metrics = {
    vocab_retention: calculateRetentionRate(stair1Performance, stair2Performance),
    time_per_lesson: calculateAverageTime(stair1Performance, stair2Performance),
    scenario_scores: getScenarioScores(userId),
    problem_words: getProblemWords(userId),
  };

  // Call Gemini to analyze and suggest refinements
  const refinement = await gemini.analyze({
    prompt: generateRefinementPrompt(metrics),
  });

  // Return suggestions for stairs 3-8
  return {
    difficultyAdjustment: refinement.difficulty,
    focusAreas: refinement.focus,
    scenarioRecommendations: refinement.scenarios,
    vocabularyPriority: refinement.vocabulary,
    paywallMessage: "Your personalized path to fluency is ready!",
  };
}
```

---

## Implementation Plan

### Phase 1: Database & Core Logic (3 days)

| Task | Owner | Status |
|------|-------|--------|
| Create database migration for new tables | TBD | Pending |
| Implement `staircaseMapping.ts` with initial mappings | TBD | Pending |
| Implement `unlockEngine.ts` core functions | TBD | Pending |
| Add `onStairCompleted` hook | TBD | Pending |

### Phase 2: UI Integration (2 days)

| Task | Owner | Status |
|------|-------|--------|
| Update VoiceConversationScreen with dynamic scenarios | TBD | Pending |
| Add scenario status indicators (locked/available/completed) | TBD | Pending |
| Create unlock celebration modal | TBD | Pending |
| Update reading practice with passage filtering | TBD | Pending |

### Phase 3: AI Refinement (2 days)

| Task | Owner | Status |
|------|-------|--------|
| Implement `pathRefinement.ts` | TBD | Pending |
| Create Stair 2 completion trigger | TBD | Pending |
| Design paywall UI for "personalized path ready" | TBD | Pending |
| A/B test refinement suggestions | TBD | Pending |

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Scenario attempt rate | >60% of users try 1+ scenario | Analytics |
| Stair-to-scenario correlation | >80% scenarios attempted match stair level | DB query |
| Unlock excitement | >50% tap "preview" when scenarios unlock | Analytics |
| Freemium conversion at Stair 2 | >8% | Analytics |

---

## Open Questions

1. **How many scenarios per stair?** Current proposal: 2-4 (2 voice, 1-2 reading)
2. **Should scenarios be required or optional for stair completion?** Current: Optional
3. **How to handle users who skip scenarios?** Allow skip, but show "recommended practice" reminder

---

## Related Documents

- [STAIRCASE_SCENARIO_MAPPING.md](./STAIRCASE_SCENARIO_MAPPING.md) - Detailed scenario mappings
- [VOICE_CONVERSATION_SYSTEM.md](./VOICE_CONVERSATION_SYSTEM.md) - Voice implementation
- [PROJECT_STATUS.md](../PROJECT_STATUS.md) - Overall project status

---

**Document Version**: 1.0
**Last Updated**: 2026-01-24
**Next Review**: After Phase 1 implementation
