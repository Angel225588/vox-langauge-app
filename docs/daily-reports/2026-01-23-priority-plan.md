# Priority Plan: January 23, 2026

## 🎯 Tomorrow's Focus: Test All Tools Before Connecting

**Goal**: Validate every card type and tool works independently before wiring the full lesson flow.

---

## Phase 1: Component Testing Checklist

### Card Types to Test

| Card Type | File | Status | Test Notes |
|-----------|------|--------|------------|
| **TypingCard** | `components/cards/vocabulary/TypingCard.tsx` | ⏳ | Image display, keyboard, success celebration |
| **SpeakingCard** | `components/cards/vocabulary/SpeakingCard.tsx` | ⏳ | Microphone, speech recognition, feedback |
| **IntroductionCard** | `components/cards/vocabulary/IntroductionCard.tsx` | ⏳ | Audio playback, word reveal |
| **ComparisonCard** | `components/cards/ComparisonCard.tsx` | ⏳ | 3D flip, audio comparison |
| **FillInBlankCard** | `components/cards/FillInBlankCard.tsx` | ⏳ | Gap selection, validation |
| **SentenceScrambleCard** | `components/cards/SentenceScrambleCard.tsx` | ⏳ | Drag & drop, reordering |
| **AudioCard** | `components/cards/AudioCard.tsx` | ⏳ | Audio playback, controls |
| **QuizCard** | `components/cards/QuizCard.tsx` | ⏳ | Multiple choice, scoring |
| **RolePlayCard** | `components/cards/RolePlayCard.tsx` | ⏳ | Dialogue flow |
| **TextInputCard** | `components/cards/TextInputCard.tsx` | ⏳ | Free text entry |

### Tools to Test

| Tool | File | Status | Test Notes |
|------|------|--------|------------|
| **Teleprompter** | `app/teleprompter.tsx` | ⏳ | Scroll speed, word highlighting |
| **Writing Practice** | `app/test-writing-task.tsx` | ⏳ | Editor, AI feedback |
| **Voice Conversation** | `app/voice-conversation.tsx` | ⏳ | ElevenLabs integration |
| **Reading Practice** | `components/cards/TeleprompterCard.tsx` | ⏳ | Speech-to-text, articulation |

### Test Route

Create a test route at `/test-all-cards` that cycles through each card type with sample data.

---

## Phase 2: System Architecture

### The Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                        ONBOARDING                                │
│  (Wow Effect - First Impression)                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Welcome Screen (animated logo, premium feel)                │
│  2. Language Selection (native + target)                        │
│  3. Your Why (goal selection with emojis)                       │
│  4. Your Level (self-assessment A1-C2)                          │
│  5. Your Commitment (time per day)                              │
│  6. Creating Plan (animated loading with AI generation)         │
│  7. Ready Screen (preview first stair, excitement builder)      │
│                                                                  │
│  OUTPUT: User Profile + First Staircase Generated               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     HOME (STAIRCASE VIEW)                        │
│  Shows personalized learning path                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐                                                   │
│  │ Stair 1  │ ← CURRENT (First stair = Level Assessment)       │
│  │ 👋       │   "Professional Greetings"                        │
│  │ 25 words │   Most important - calibrates user level          │
│  └──────────┘                                                   │
│       │                                                         │
│  ┌──────────┐                                                   │
│  │ Stair 2  │ ← LOCKED                                          │
│  │ 💼       │   Generated after Stair 1 completion              │
│  │ 35 words │   Uses performance data from Stair 1              │
│  └──────────┘                                                   │
│       │                                                         │
│  ┌──────────┐                                                   │
│  │ Stair 3  │ ← LOCKED                                          │
│  │ 📊       │                                                   │
│  └──────────┘                                                   │
│                                                                  │
│  [Calibrator Banner] - After each section                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STAIR DETAIL VIEW                             │
│  /lesson/[stairId]                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────┐                    │
│  │ 👋 Professional Greetings              │                    │
│  │                                         │                    │
│  │ Master formal introductions for         │                    │
│  │ job interviews                          │                    │
│  │                                         │                    │
│  │ 📚 25 vocabulary words                  │                    │
│  │ ⏱️ ~15 minutes                          │                    │
│  │ 🎯 Skills: Speaking, Listening          │                    │
│  │                                         │                    │
│  │ What you'll learn:                      │                    │
│  │ • Formal greetings                      │                    │
│  │ • Self-introduction phrases             │                    │
│  │ • Polite expressions                    │                    │
│  │                                         │                    │
│  │        [▶ Start Lesson]                 │                    │
│  └─────────────────────────────────────────┘                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     LESSON FLOW                                  │
│  Sequential card progression                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  INTRO PHASE (5 cards)                                          │
│  ├── IntroductionCard × 5 (new vocabulary with audio)          │
│                                                                  │
│  PRACTICE PHASE (15 cards)                                      │
│  ├── TypingCard × 3 (spell the word)                           │
│  ├── SpeakingCard × 3 (pronounce correctly)                    │
│  ├── ComparisonCard × 2 (similar sounds)                       │
│  ├── FillInBlankCard × 3 (context usage)                       │
│  ├── SentenceScrambleCard × 2 (word order)                     │
│  ├── QuizCard × 2 (comprehension check)                        │
│                                                                  │
│  IMMERSION PHASE (5 cards)                                      │
│  ├── TeleprompterCard × 1 (reading practice)                   │
│  ├── RolePlayCard × 1 (dialogue practice)                      │
│  ├── TextInputCard × 1 (writing practice)                      │
│  ├── VoiceConversation × 1 (speaking practice) [PREMIUM]       │
│  ├── ResultsCard × 1 (performance summary)                     │
│                                                                  │
│  Progress: ████████░░░░░░░░ 12/25 cards                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 3: AI Orchestration

### Claude's Role (Orchestrator & Quality)

```typescript
// Claude handles:
// 1. Complex reasoning and planning
// 2. Content generation with quality control
// 3. Personalization decisions
// 4. Feedback analysis and recommendations

interface ClaudeResponsibilities {
  // Staircase Generation
  generateStaircase: (userProfile: UserProfile) => Promise<Staircase>;

  // Lesson Planning
  planLesson: (stair: Stair, userHistory: LearningHistory) => Promise<LessonPlan>;

  // Feedback Analysis
  analyzePerformance: (lessonResults: LessonResult[]) => Promise<Insights>;

  // Adaptive Difficulty
  adjustDifficulty: (currentLevel: string, performance: number) => Promise<string>;

  // Writing Feedback
  reviewWriting: (text: string, prompt: string) => Promise<WritingFeedback>;
}
```

**When to use Claude:**
- Initial staircase generation (complex, one-time)
- Writing task feedback (detailed, quality-focused)
- Performance analysis (nuanced insights)
- Difficulty calibration (important decisions)
- Premium features

### Gemini's Role (Speed & Volume)

```typescript
// Gemini handles:
// 1. Real-time responses during lessons
// 2. Quick content generation
// 3. High-volume, low-latency tasks
// 4. Conversation practice

interface GeminiResponsibilities {
  // Real-time Lesson Support
  generateHint: (card: Card, userAttempt: string) => Promise<string>;

  // Quick Feedback
  checkAnswer: (expected: string, actual: string) => Promise<AnswerCheck>;

  // Example Generation
  generateExamples: (word: string, count: number) => Promise<string[]>;

  // Conversation (via Gemini Live or ElevenLabs)
  handleConversation: (context: ConversationContext) => Promise<Response>;

  // TTS/STT Support
  transcribeSpeech: (audio: Blob) => Promise<string>;
}
```

**When to use Gemini:**
- During active lessons (speed matters)
- Hint generation (quick, contextual)
- Answer validation (fast feedback)
- Example sentences (volume)
- Freemium features

### Cost Optimization Matrix

| Feature | Freemium | Premium |
|---------|----------|---------|
| Staircase updates | Weekly (Claude) | Daily (Claude) |
| Lesson hints | Gemini | Gemini |
| Writing feedback | Basic (Gemini) | Detailed (Claude) |
| Voice conversation | Limited/None | Unlimited (ElevenLabs) |
| Personalization depth | Standard | Deep (Claude analysis) |

---

## Phase 4: Staircase Generation Logic

### First Stair (Critical - Level Assessment)

```typescript
interface FirstStairConfig {
  // Fixed structure for consistent assessment
  title: "Getting Started";
  purpose: "Assess true level while teaching";

  // Vocabulary selection
  vocabulary: {
    count: 25;
    distribution: {
      A1: 5,  // Basic words everyone should know
      A2: 5,  // Elementary
      B1: 5,  // Intermediate
      B2: 5,  // Upper intermediate
      C1: 5,  // Advanced
    };
  };

  // Card distribution for assessment
  cards: {
    introduction: 5,    // Teach new words
    typing: 4,          // Spelling assessment
    speaking: 4,        // Pronunciation assessment
    listening: 4,       // Comprehension assessment
    context: 4,         // Usage assessment
    immersion: 4,       // Advanced skills check
  };

  // Data collected
  metrics: {
    accuracyByLevel: Record<CEFRLevel, number>;
    speedByCardType: Record<CardType, number>;
    errorsPatterns: ErrorType[];
    strengthAreas: string[];
    weaknessAreas: string[];
  };
}
```

### Subsequent Stairs (Adaptive)

```typescript
async function generateNextStair(
  userId: string,
  previousStairResults: StairResult,
  userProfile: UserProfile
): Promise<Stair> {
  // 1. Analyze performance
  const analysis = await claude.analyzePerformance(previousStairResults);

  // 2. Determine focus areas
  const focusAreas = analysis.weaknessAreas.slice(0, 3);

  // 3. Select vocabulary
  const vocabulary = await selectVocabulary({
    level: analysis.adjustedLevel,
    topic: userProfile.goal,
    focusAreas,
    avoidWords: previousStairResults.masteredWords,
  });

  // 4. Generate stair content
  const stair = await claude.generateStair({
    vocabulary,
    targetSkills: focusAreas,
    difficulty: analysis.recommendedDifficulty,
  });

  return stair;
}
```

### Freemium vs Premium Generation

```typescript
// Freemium: Weekly staircase refresh
const FREEMIUM_REFRESH_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 days

// Premium: Daily staircase refresh
const PREMIUM_REFRESH_INTERVAL = 24 * 60 * 60 * 1000; // 1 day

async function shouldRefreshStaircase(user: User): Promise<boolean> {
  const lastRefresh = user.lastStaircaseRefresh;
  const now = Date.now();

  const interval = user.isPremium
    ? PREMIUM_REFRESH_INTERVAL
    : FREEMIUM_REFRESH_INTERVAL;

  return (now - lastRefresh) >= interval;
}
```

---

## Phase 5: Onboarding "Wow Effect"

### Visual Elements

1. **Animated Logo Reveal**
   - Vox crystal logo with particle effects
   - Smooth scale + fade animation

2. **Language Selection**
   - Flag animations
   - Swipe gestures
   - Sound effects on selection

3. **Goal Selection**
   - Large emoji cards
   - Haptic feedback
   - Gradient backgrounds per goal

4. **Level Assessment**
   - Interactive slider or visual scale
   - Real-time difficulty preview

5. **Creating Plan Screen** (Key Wow Moment)
   ```
   ┌─────────────────────────────────────────┐
   │                                         │
   │     🔮 Creating Your Learning Path      │
   │                                         │
   │     ████████████░░░░░░░ 65%            │
   │                                         │
   │     ✓ Analyzing your goals              │
   │     ✓ Selecting vocabulary              │
   │     ⟳ Crafting your first lesson...     │
   │     ○ Personalizing difficulty          │
   │                                         │
   │     "Learning 'Professional English'    │
   │      for job interviews"                │
   │                                         │
   └─────────────────────────────────────────┘
   ```

6. **Ready Screen** (Excitement Builder)
   - Preview of first stair with animation
   - "Your journey begins" messaging
   - Confetti or celebration animation
   - Big "Start Learning" CTA

---

## Phase 6: Database Schema Updates

### Tables Needed

```sql
-- User learning state
CREATE TABLE user_learning_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users,
  current_stair_id UUID,
  assessed_level TEXT, -- A1, A2, B1, B2, C1, C2
  self_reported_level TEXT,
  total_xp INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_activity_at TIMESTAMP,
  is_premium BOOLEAN DEFAULT FALSE,
  last_staircase_refresh TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Staircase (learning path)
CREATE TABLE staircases (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  stairs JSONB, -- Array of stair objects
  generated_by TEXT, -- 'claude' or 'gemini'
  generated_at TIMESTAMP,
  version INTEGER DEFAULT 1
);

-- Individual lesson results
CREATE TABLE lesson_results (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  stair_id UUID,
  card_results JSONB, -- Array of card results
  total_score INTEGER,
  time_spent_seconds INTEGER,
  errors JSONB,
  completed_at TIMESTAMP
);

-- Performance analytics
CREATE TABLE performance_analytics (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  period_start TIMESTAMP,
  period_end TIMESTAMP,
  metrics JSONB, -- Aggregated metrics
  insights JSONB, -- Claude-generated insights
  created_at TIMESTAMP
);
```

---

## Testing Plan for Tomorrow

### Morning: Card Testing (2 hours)
1. Create test route `/test-all-cards`
2. Test each card type with sample data
3. Fix any bugs found
4. Document any issues

### Midday: Tool Testing (2 hours)
1. Test Teleprompter flow
2. Test Writing Practice with AI feedback
3. Test Voice Conversation
4. Verify audio playback works

### Afternoon: Integration Prep (2 hours)
1. Create lesson flow controller
2. Set up card sequencing logic
3. Prepare AI prompts for Claude/Gemini
4. Define data contracts

### Evening: Documentation (1 hour)
1. Document all test results
2. List blockers
3. Update this plan

---

## Files to Create Tomorrow

```
lib/
├── lesson/
│   ├── LessonController.ts      # Manages card flow
│   ├── CardSequencer.ts         # Orders cards intelligently
│   ├── ProgressTracker.ts       # Tracks user progress
│   └── types.ts                 # Lesson types
├── staircase/
│   ├── StaircaseGenerator.ts    # Creates personalized paths
│   ├── StairAssessor.ts         # Evaluates first stair
│   └── AdaptiveEngine.ts        # Adjusts difficulty
└── ai/
    ├── prompts/
    │   ├── staircaseGeneration.ts
    │   ├── lessonPlanning.ts
    │   ├── feedbackAnalysis.ts
    │   └── writingReview.ts
    └── orchestrator.ts          # Claude/Gemini routing
```

---

## Success Criteria

### First Stair Must:
- [ ] Accurately assess user's true level
- [ ] Feel engaging, not like a test
- [ ] Collect enough data for personalization
- [ ] Complete in ~15 minutes
- [ ] Have clear progress indicators

### System Must:
- [ ] All cards work independently
- [ ] Smooth transitions between cards
- [ ] AI responses are fast (<2s for Gemini, <5s for Claude)
- [ ] Progress is saved correctly
- [ ] Works offline for basic features

---

## Notes for Angel

1. **First stair is CRITICAL** - This is where we learn the user's real level
2. **Don't over-engineer** - Start with hardcoded first stair, then add AI generation
3. **Test on real device** - Simulator doesn't catch all audio/microphone issues
4. **Freemium is viable** - Weekly refresh is still valuable, just less personalized
5. **Claude for quality, Gemini for speed** - Don't mix this up

---

*Created: January 22, 2026*
*Priority: HIGH*
*Status: PLANNING COMPLETE - READY FOR TESTING*
