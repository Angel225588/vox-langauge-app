# Claude + Gemini AI Orchestration Architecture

**Status**: ✅ **IMPLEMENTED** (Phase 1 Complete)
**Last Updated**: 2026-01-05

## Overview

A dual-AI system where **Claude acts as supervisor** (strategic planning, validation, quality control) and **Gemini Flash acts as worker** (bulk content generation). This architecture optimizes cost while maintaining quality.

## Implementation Status

| Component | Status | File |
|-----------|--------|------|
| Claude API Client | ✅ Complete | `lib/ai/claudeClient.ts` |
| Gemini API Client | ✅ Complete | `lib/ai/gemini.ts` |
| AI Orchestrator | ✅ Complete | `lib/ai/orchestrator.ts` |
| Path Generation Integration | ✅ Complete | `lib/services/pathGeneration.ts` |
| Progress Streaming | ✅ Complete | `OrchestrationProgress` events |
| Early Reveal (50% threshold) | ✅ Complete | `onEarlyRevealReady` callback |
| Claude Validation Layer | ⏳ Pending | Phase 2 |

## Quick Start

```typescript
import { createPersonalizedPath } from '@/lib/services/pathGeneration';

// With progress tracking
const result = await createPersonalizedPath(userId, onboardingData, {
  onProgress: (progress) => {
    console.log(`${progress.progress}% - ${progress.message}`);
  },
  onEarlyRevealReady: (partialStairs) => {
    // Can start showing stairs when 50% complete
    showStaircaseAnimation(partialStairs);
  },
});
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER COMPLETES ONBOARDING                   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLAUDE (SUPERVISOR)                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  1. Analyze user profile (native lang, target, level)   │   │
│  │  2. Generate strategic learning path structure          │   │
│  │  3. Create content briefs for each stair                │   │
│  │  4. Define CEFR constraints and quality criteria        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           ~500-800 tokens output                │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ Content Briefs
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GEMINI FLASH (WORKER)                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  For each stair brief:                                  │   │
│  │  1. Generate vocabulary (5-10 words per theme)          │   │
│  │  2. Create example sentences                            │   │
│  │  3. Build quiz questions                                │   │
│  │  4. Create conversation scenarios                       │   │
│  │  ────────────────────────────────────────────────────   │   │
│  │  Stream results to UI as each stair completes           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           ~2000-3000 tokens per stair           │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ Generated Content (streaming)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VALIDATION LAYER (Phase 2)                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Claude validates each stair against brief:             │   │
│  │  - CEFR level appropriateness                           │   │
│  │  - Word frequency bands                                 │   │
│  │  - Grammar pattern correctness                          │   │
│  │  - Cultural appropriateness                             │   │
│  │  ────────────────────────────────────────────────────   │   │
│  │  If invalid: Regenerate with feedback                   │   │
│  │  If valid: Proceed to UI                                │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ Validated Content
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CREATION THEATER UI                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  • Skeleton cards with shimmer animation                │   │
│  │  • Reveal starts at 50% generation (min 3 stairs)       │   │
│  │  • Sequential reveal: 200ms stagger, spring animation   │   │
│  │  • Celebration at completion: confetti + haptics        │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation Phases

### Phase 0: Validation Test (Week 1)
**Goal**: Validate assumption that Gemini needs Claude supervision

**Tasks**:
1. Create test harness with 50 diverse user profiles
2. Generate staircases with Gemini-only (current approach)
3. Generate staircases with Claude supervision
4. Have linguist evaluate both sets ($250 budget)
5. Document quality delta

**Success Criteria**:
- If Claude-supervised quality is >15% better → proceed to Phase 1
- If quality is similar → optimize Gemini prompts instead

**Files to Create**:
- `lib/ai/__tests__/orchestration-test.ts`
- `scripts/run-linguist-test.ts`

---

### Phase 1: Core Orchestration (Weeks 2-3)
**Goal**: Build the supervisor-worker architecture

#### 1.1 Claude Client (`lib/ai/claudeClient.ts`)

```typescript
// Types
export interface UserLearningProfile {
  nativeLanguage: string;
  targetLanguage: string;
  currentLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  learningGoals: string[];
  interests: string[];
  dailyTimeMinutes: number;
}

export interface StairBrief {
  id: string;
  position: number;
  theme: string;
  cefrLevel: string;
  vocabularyFocus: string[];
  grammarPatterns: string[];
  communicativeGoals: string[];
  constraints: {
    wordFrequencyBand: [number, number]; // e.g., [1, 3000]
    maxSentenceLength: number;
    avoidTopics: string[];
  };
}

export interface LearningPathPlan {
  userId: string;
  totalStairs: number;
  estimatedDuration: string;
  stairs: StairBrief[];
  progressionLogic: string;
}

// Implementation
export async function generateLearningPathPlan(
  profile: UserLearningProfile
): Promise<LearningPathPlan> {
  // Call Claude API with strategic prompt
  // Return structured plan with briefs for each stair
}
```

#### 1.2 Orchestrator (`lib/ai/orchestrator.ts`)

```typescript
import { generateLearningPathPlan } from './claudeClient';
import { generateStairContent } from './gemini';
import { EventEmitter } from 'events';

export interface GenerationProgress {
  phase: 'planning' | 'generating' | 'validating' | 'complete';
  currentStair: number;
  totalStairs: number;
  completedStairs: StairContent[];
}

export class StaircaseOrchestrator extends EventEmitter {
  async generateStaircase(profile: UserLearningProfile): Promise<void> {
    // Phase 1: Claude creates the plan
    this.emit('progress', { phase: 'planning', currentStair: 0, totalStairs: 0 });
    const plan = await generateLearningPathPlan(profile);

    // Phase 2: Gemini generates content for each stair
    const completedStairs: StairContent[] = [];

    for (const brief of plan.stairs) {
      this.emit('progress', {
        phase: 'generating',
        currentStair: brief.position,
        totalStairs: plan.totalStairs,
        completedStairs,
      });

      const content = await generateStairContent(brief);
      completedStairs.push(content);

      // Emit stair completion for streaming UI
      this.emit('stairComplete', {
        stair: content,
        position: brief.position,
        totalCompleted: completedStairs.length,
        totalStairs: plan.totalStairs,
      });
    }

    this.emit('progress', { phase: 'complete', completedStairs });
  }
}
```

#### 1.3 Streaming Integration

```typescript
// In the staircase screen
const orchestrator = new StaircaseOrchestrator();

orchestrator.on('stairComplete', ({ stair, totalCompleted, totalStairs }) => {
  // Add to local state
  setStairs(prev => [...prev, stair]);

  // Check 50% threshold for reveal trigger
  if (totalCompleted >= Math.ceil(totalStairs / 2) && !revealStarted) {
    startRevealAnimation();
  }
});
```

---

### Phase 2: Validation Loop (Week 4+)
**Goal**: Add Claude validation of Gemini output (contingent on Phase 0 results)

#### 2.1 Validator (`lib/ai/validator.ts`)

```typescript
export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  suggestions: string[];
}

export interface ValidationIssue {
  type: 'cefr_mismatch' | 'word_frequency' | 'grammar_error' | 'cultural' | 'hallucination';
  severity: 'error' | 'warning';
  location: string;
  description: string;
}

export async function validateStairContent(
  brief: StairBrief,
  content: StairContent
): Promise<ValidationResult> {
  // Claude validates against brief constraints
  // Returns structured validation result
}
```

#### 2.2 Retry Logic

```typescript
const MAX_RETRIES = 2;

async function generateWithValidation(brief: StairBrief): Promise<StairContent> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const content = await generateStairContent(brief);
    const validation = await validateStairContent(brief, content);

    if (validation.isValid) {
      return content;
    }

    if (attempt < MAX_RETRIES) {
      // Regenerate with feedback
      brief = enrichBriefWithFeedback(brief, validation);
    }
  }

  // Fallback to template
  return getTemplateContent(brief);
}
```

---

## Cost Analysis

### Per-User Generation Cost

| Component | Tokens | Cost (Approx) |
|-----------|--------|---------------|
| Claude Planning | 2,000 input + 800 output | $0.009 |
| Gemini Generation (8 stairs) | 16,000 output | $0.003 |
| Claude Validation (Phase 2) | 8,000 input + 800 output | $0.026 |
| **Total Phase 1** | | **~$0.012/user** |
| **Total Phase 2** | | **~$0.038/user** |

### Tiered Quality Strategy

```typescript
export function getGenerationStrategy(userTier: UserTier): GenerationConfig {
  switch (userTier) {
    case 'free':
      return {
        useClaude: false,
        useValidation: false,
        fallbackToTemplate: true,
        // Cost: ~$0.003/user
      };
    case 'trial':
      return {
        useClaude: true,
        useValidation: false,
        fallbackToTemplate: true,
        // Cost: ~$0.012/user
      };
    case 'premium':
      return {
        useClaude: true,
        useValidation: true,
        fallbackToTemplate: false,
        // Cost: ~$0.038/user
      };
  }
}
```

---

## Fallback System

### Tiered Fallbacks

```
Level 1: Claude + Gemini + Validation (Premium)
    │ If rate limited or error
    ▼
Level 2: Claude + Gemini (Trial)
    │ If rate limited or error
    ▼
Level 3: Gemini Only (Free)
    │ If rate limited or error
    ▼
Level 4: Template Content (Emergency)
    │ Pre-generated, covers all CEFR levels
    ▼
Level 5: Generic Starter (Last Resort)
    │ "Getting started with [language]"
```

### Template Library

```typescript
// lib/data/templateStaircases.ts
export const TEMPLATE_STAIRCASES: Record<string, Record<string, Staircase>> = {
  'es-ES': {
    'A1': { /* 8 pre-built stairs for Spanish A1 */ },
    'A2': { /* ... */ },
    // ...
  },
  'fr-FR': {
    'A1': { /* ... */ },
    // ...
  },
};
```

---

## Database Schema

### New Tables

```sql
-- Generation metadata
CREATE TABLE staircase_generations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  generation_strategy VARCHAR(20), -- 'claude_gemini', 'gemini_only', 'template'
  claude_tokens_used INTEGER,
  gemini_tokens_used INTEGER,
  validation_passed BOOLEAN,
  retry_count INTEGER DEFAULT 0,
  generation_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Quality tracking
CREATE TABLE content_quality_logs (
  id UUID PRIMARY KEY,
  staircase_id UUID REFERENCES staircases(id),
  stair_position INTEGER,
  validation_issues JSONB,
  was_regenerated BOOLEAN,
  final_quality_score FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## File Structure

```
lib/ai/
├── orchestrator.ts        # Main orchestration logic
├── claudeClient.ts        # Claude API wrapper
├── gemini.ts              # Existing Gemini client (update)
├── validator.ts           # Content validation (Phase 2)
├── types.ts               # Shared types
├── fallbacks.ts           # Fallback logic
└── __tests__/
    ├── orchestrator.test.ts
    └── orchestration-test.ts  # Linguist test harness

lib/data/
└── templateStaircases.ts  # Pre-built fallback content
```

---

## Environment Variables

```env
# Claude API (new)
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-3-haiku-20240307  # Start with Haiku for cost

# Existing Gemini
EXPO_PUBLIC_GEMINI_API_KEY=...

# Feature flags
EXPO_PUBLIC_USE_CLAUDE_ORCHESTRATION=true
EXPO_PUBLIC_USE_VALIDATION=false  # Enable after Phase 0
```

---

## Success Metrics

### Phase 0 Success
- [ ] Linguist rates Claude-supervised content >15% higher
- [ ] Test completed within $250 budget
- [ ] Clear documentation of quality differences

### Phase 1 Success
- [ ] End-to-end generation works for all CEFR levels
- [ ] Streaming UI updates correctly
- [ ] Fallback system handles errors gracefully
- [ ] Cost per user < $0.02

### Phase 2 Success
- [ ] Validation catches >80% of quality issues
- [ ] Retry logic improves content when needed
- [ ] No increase in user-facing latency >500ms

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Anthropic rate limits | Request limit increase, implement queue |
| Claude latency spikes | Timeout + fallback to Gemini-only |
| Gemini hallucinations | Validation layer + template fallback |
| Cost overruns | Tiered strategy + daily spend caps |
| Test shows no quality delta | Optimize Gemini prompts instead |

---

## Implementation Checklist

### Week 1: Validation Test
- [ ] Create test harness with 50 user profiles
- [ ] Generate comparison sets
- [ ] Coordinate linguist evaluation
- [ ] Document results
- [ ] Request Anthropic rate limit increase
- [ ] Build template fallbacks

### Week 2: Core Integration
- [ ] Create `claudeClient.ts`
- [ ] Create `orchestrator.ts`
- [ ] Update Gemini prompts with brief format
- [ ] Implement streaming events
- [ ] Connect to Creation Theater UI

### Week 3: Testing & Polish
- [ ] End-to-end testing all CEFR levels
- [ ] Error handling for all failure modes
- [ ] Performance optimization
- [ ] Cost monitoring dashboard

### Week 4+: Validation (Contingent)
- [ ] Implement `validator.ts`
- [ ] Add retry logic
- [ ] A/B test validated vs non-validated
- [ ] Measure quality improvement

---

## Expert Roundtable Verdict

**Unanimous Decision (4/4)**: Proceed with phased approach

**Key Agreements**:
1. Linguist test validates assumption before engineering investment
2. Phase 1 delivers value even if Phase 2 is deferred
3. Creation Theater UX transforms wait into engagement
4. Tiered quality justifies premium pricing
5. Streaming architecture enables 50% threshold reveal

**Accepted Trade-offs**:
- Higher latency vs quality
- Higher cost for premium users vs better outcomes
- Complexity vs maintainability (worth it for differentiation)

**Confidence Level**: HIGH
