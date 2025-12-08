# Scenarios & Task-Based Learning (TBLT)

> **Priority**: P0 - CRITICAL
> **Status**: Design Phase
> **Research Base**: 52 studies, meta-analysis (d = 0.93 effect size)
> **Competitive Analysis**: Speak.com, Duolingo Video Call, Busuu Conversations

---

## Executive Summary

Scenario-based learning is **THE** differentiating feature for Vox. Based on Task-Based Language Teaching (TBLT) methodology with a strong effect size (d = 0.93), this feature puts users in real-world situations where they must complete authentic tasks using the target language.

**Key Insight**: "When you practice language in context, your brain doesn't just store vocabulary — it builds neural pathways connecting words to situations, emotions, and outcomes."

---

## Table of Contents

1. [Research Foundation](#research-foundation)
2. [Competitive Analysis](#competitive-analysis)
3. [Vox Scenarios System](#vox-scenarios-system)
4. [Speak/Type Balance System](#speaktype-balance-system)
5. [Technical Implementation](#technical-implementation)
6. [User Experience Flow](#user-experience-flow)

---

## Research Foundation

### Task-Based Language Teaching (TBLT)

TBLT is an empirically-validated pedagogy that emphasizes **interaction during authentic tasks** rather than explicit grammar instruction.

#### Key Research Findings

| Study | Finding | Effect Size |
|-------|---------|-------------|
| Meta-analysis (52 studies) | Strong positive effect for TBLT | d = 0.93 |
| AI Chatbot meta-analysis (28 studies) | Significant positive effect | g = 0.484 |
| AIGC Study (130 students, 18 weeks) | Improved pronunciation, accuracy, communication flow | Significant |

#### Why TBLT Works

1. **Authentic Context**: Language learned IN situations transfers better TO situations
2. **Meaningful Communication**: Focus on completing tasks, not grammar rules
3. **Incidental Learning**: Forms acquired naturally through use
4. **Reduced Anxiety**: Safe environment to practice real scenarios
5. **Higher Engagement**: Tasks relevant to real-life increase motivation

> "N. S. Prabhu noticed that students could learn language just as easily with a non-linguistic problem as when they were concentrating on linguistic questions."
> — [Cambridge Language Teaching Research](https://www.cambridge.org/core/journals/language-teaching/article/research-into-practice-the-taskbased-approach-to-instructed-second-language-acquisition/664FB7A40E0C8424339DA8CF51A59DB3)

#### TBLT vs Traditional Methods

| Traditional (PPP) | TBLT |
|-------------------|------|
| Present → Practice → Produce | Task → Language Need → Acquisition |
| Grammar-focused | Communication-focused |
| Controlled practice | Authentic practice |
| Teacher-centered | Learner-centered |
| Memorization | Discovery |

### AI Conversation Research

Recent studies show AI-powered conversation practice:

- **Creates safe, judgment-free environments** where learners engage in authentic scenarios without fear of social repercussions
- **Reduces Foreign Language Speaking Anxiety (FLSA)** - a critical barrier for many learners
- **Provides unlimited practice opportunities** without scheduling constraints
- **Enables immediate, consistent feedback** (when implemented correctly)

**Source**: [Nature - AI Conversation Bots Study](https://www.nature.com/articles/s41599-025-05550-z)

---

## Competitive Analysis

### Speak.com Analysis

**What They Do Well:**
- Live Roleplays powered by OpenAI Realtime API (GPT-4o)
- Response speed as fast as human conversation
- Scenario selection (Coffee Shop, New Year's Resolutions, etc.)
- 3 specific tasks to complete per scenario
- 4.8 stars, 15M+ downloads

**Their Weaknesses (Opportunities for Vox):**
1. **Speech recognition too lenient** - accepts mispronunciations as correct
2. **Feedback lacks depth** - brief summaries, no pattern tracking
3. **No spaced repetition** - vocabulary not tracked long-term
4. **No accent/voice options** - single voice per language
5. **Repetitive at higher levels** - limited variety
6. **Pricing confusion** - $99/year feels expensive to users
7. **AI ends every response with question** - feels like interrogation

> "While other services just correct awkward sentences, I was surprised that Speak provides detailed feedback on 'why' the expression is awkward"
> — User review (This is what Vox should do BETTER)

**Source**: [Speak App Review - LanguaTalk](https://languatalk.com/blog/speak-app-review/)

### Other Competitors

| App | Scenario Feature | Limitation |
|-----|------------------|------------|
| **Duolingo** | Video Call with Lily | Only 1 AI character, limited scenarios |
| **Busuu** | Conversations (CEFR-leveled) | Topic-focused, less customizable |
| **Talkpal** | AI Roleplays | Generic AI, no personality |
| **ChatGPT** | Free conversation | No learning structure, forgets to correct |

### Vox Competitive Advantage

1. **Custom Scenario Creation** - Users define their own situations
2. **Articulation Focus** - Not accent, clear pronunciation
3. **Points for Trying** - Courage rewarded, not just perfection
4. **Word Bank Integration** - Difficult words automatically tracked
5. **Story → Scenario Pipeline** - Personal stories become practice
6. **Offline First** - Practice without internet
7. **Balanced Mode Enforcement** - Speaking AND typing required

---

## Vox Scenarios System

### Core Philosophy

```
"Real fluency comes from real situations.
 Your courage to try matters more than
 perfect pronunciation."
```

### Scenario Types

#### 1. Pre-Built Scenarios (Library)

Curated scenarios covering common real-world situations:

**Daily Life**
- Ordering at a restaurant
- Asking for directions
- Making phone calls
- Doctor's appointment
- Shopping for clothes

**Professional**
- Job interview
- Business meeting
- Customer service
- Giving presentations
- Negotiating salary

**Social**
- Meeting new people
- Making plans with friends
- Resolving conflicts
- Giving compliments
- Small talk at parties

**Travel**
- Airport/customs
- Hotel check-in
- Booking tours
- Asking for recommendations
- Handling emergencies

**Academic**
- Discussing with professors
- Group project meetings
- Asking questions in class
- Presenting research

#### 2. Custom Scenarios (User-Created)

Users can create personalized scenarios:

```typescript
interface CustomScenario {
  id: string;
  title: string;
  description: string;

  // Scenario setup
  setting: string;         // "Coffee shop in Madrid"
  participants: Participant[];
  userRole: string;        // "Customer ordering for the first time"
  aiRole: string;          // "Friendly barista"

  // Learning objectives
  objectives: string[];    // ["Order a coffee", "Ask about ingredients", "Pay"]
  targetVocabulary: string[];
  grammarFocus?: string[];

  // Constraints
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  maxTurns?: number;
  timeLimit?: number;      // minutes

  // Personalization
  context?: string;        // "User is lactose intolerant"
  tone?: 'formal' | 'casual' | 'professional';

  // Source
  createdFrom?: 'story' | 'manual' | 'suggestion';
  linkedStoryId?: string;
}

interface Participant {
  role: string;
  personality: string;
  speakingStyle: string;
}
```

#### 3. Story-Generated Scenarios

Connected to [Storytelling Flow](./STORYTELLING_FLOW.md):

1. User creates personal story (STAR method)
2. AI extracts key scenarios from story
3. Auto-generates practice scenarios
4. User practices telling THEIR story

**Example Pipeline:**
```
User Story: "I once got lost in Tokyo and had to ask for directions"
     ↓
Generated Scenarios:
  1. "Asking a stranger for directions"
  2. "Explaining where you want to go"
  3. "Understanding directions with landmarks"
  4. "Thanking someone for help"
```

### Scenario Session Structure

#### Pre-Session: Motivation Screen

```
┌─────────────────────────────────────┐
│                                     │
│    "Every attempt builds fluency.   │
│     Your willingness to try is      │
│     what matters most."             │
│                                     │
│         [Start Scenario]            │
│                                     │
│   ○ Speak Mode  ○ Type Mode         │
│   [I can't speak now]               │
│                                     │
└─────────────────────────────────────┘
```

#### During Session: Task Completion

```
┌─────────────────────────────────────┐
│ Scenario: At the Coffee Shop        │
│ Role: Customer                      │
├─────────────────────────────────────┤
│                                     │
│ 🎯 Tasks:                           │
│ ☐ Order a latte                     │
│ ☐ Ask about milk options            │
│ ☐ Complete payment                  │
│                                     │
├─────────────────────────────────────┤
│                                     │
│ BARISTA (Maria):                    │
│ "¡Hola! ¿Qué te puedo servir?"      │
│                                     │
│            [🎤 Speak]               │
│       [💡 Hint] [❓ Help]           │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Switch to typing                │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### Post-Session: Feedback

```
┌─────────────────────────────────────┐
│ 🎉 Scenario Complete!               │
├─────────────────────────────────────┤
│                                     │
│ Tasks Completed: 3/3 ✓              │
│ Time: 4:32                          │
│                                     │
│ 📊 Performance:                     │
│ • Clarity: ████████░░ 80%           │
│ • Vocabulary: ██████████ 100%       │
│ • Task Completion: ██████████ 100%  │
│                                     │
│ 🏆 Points Earned:                   │
│ • Task completion: +50              │
│ • Courage points: +20               │
│ • Improvement bonus: +15            │
│ • Total: +85 points                 │
│                                     │
│ 📝 Words to Practice:               │
│ • "alternativa" → Word Bank         │
│ • "sin azúcar" → Word Bank          │
│                                     │
│ 💡 Feedback:                        │
│ "Great job completing all tasks!    │
│  Your articulation of 'leche' was   │
│  very clear. Consider practicing    │
│  the 'rr' sound in 'azúcar'."       │
│                                     │
│ [Practice Again] [New Scenario]     │
│ [Review Recording]                  │
└─────────────────────────────────────┘
```

---

## Speak/Type Balance System

### Philosophy

**Both skills are essential.** Users cannot become fluent by only typing OR only speaking. The app enforces balanced practice.

### Balance Rules

```typescript
interface BalanceConfig {
  // Thresholds
  maxImbalanceRatio: number;      // 20:1 triggers lock
  warningThreshold: number;       // 10:1 shows warning
  softRecommendThreshold: number; // 5:1 suggests practice

  // Tracking periods
  trackingPeriod: 'weekly' | 'per50cards';

  // Lock behavior
  lockDuration: 'until_balanced' | 'session_only';
}

const DEFAULT_CONFIG: BalanceConfig = {
  maxImbalanceRatio: 20,
  warningThreshold: 10,
  softRecommendThreshold: 5,
  trackingPeriod: 'weekly',
  lockDuration: 'until_balanced'
};
```

### Balance States

#### State 1: Balanced (Ratio ≤ 5:1)
```
✅ All features unlocked
💬 "Great balance! Keep it up."
```

#### State 2: Soft Warning (Ratio 5:1 to 10:1)
```
⚠️ Gentle recommendation shown
💬 "You've been typing a lot! Try some speaking practice."
[Suggest Speaking Scenario]
```

#### State 3: Strong Warning (Ratio 10:1 to 20:1)
```
⚠️ Persistent banner
💬 "Speaking practice recommended! Your speaking is falling behind."
[Speaking scenarios highlighted]
[Typing still available]
```

#### State 4: Mode Locked (Ratio > 20:1)
```
🔒 Overused mode temporarily locked
💬 "To maintain balanced learning, please complete some [speaking/typing] sessions."

Progress bar shows: [██████░░░░] 6 more speaking sessions to unlock typing
```

### Implementation

```typescript
interface UserBalance {
  userId: string;
  periodStart: Date;

  // Session counts
  speakingSessions: number;
  typingSessions: number;

  // Calculated
  ratio: number;
  dominantMode: 'speaking' | 'typing' | 'balanced';
  status: 'balanced' | 'warning' | 'locked';

  // Lock info
  isLocked: boolean;
  lockedMode?: 'speaking' | 'typing';
  sessionsToUnlock?: number;
}

function checkBalance(balance: UserBalance): BalanceAction {
  const ratio = Math.max(
    balance.speakingSessions / Math.max(balance.typingSessions, 1),
    balance.typingSessions / Math.max(balance.speakingSessions, 1)
  );

  if (ratio <= 5) return { status: 'balanced', action: 'none' };
  if (ratio <= 10) return { status: 'warning', action: 'soft_recommend' };
  if (ratio <= 20) return { status: 'warning', action: 'strong_recommend' };

  return {
    status: 'locked',
    action: 'lock_dominant_mode',
    lockedMode: balance.speakingSessions > balance.typingSessions
      ? 'speaking'
      : 'typing',
    sessionsNeeded: Math.ceil(ratio / 2)
  };
}
```

### Quick Toggle UI

```
┌─────────────────────────────────────┐
│     [🔊 Speak]    [⌨️ Type]         │
├─────────────────────────────────────┤
│ Quick switch: "I can't speak now"   │
│ → Switches to typing for session    │
│ → Counts toward typing sessions     │
└─────────────────────────────────────┘
```

### Balance Dashboard

```
┌─────────────────────────────────────┐
│ 📊 Weekly Balance                   │
├─────────────────────────────────────┤
│                                     │
│ Speaking: ████████████░░░░ 12       │
│ Typing:   ██████░░░░░░░░░░ 6        │
│                                     │
│ Ratio: 2:1 ✅ Balanced              │
│                                     │
│ 💡 Great work! You're practicing    │
│    both skills equally.             │
│                                     │
└─────────────────────────────────────┘
```

---

## Technical Implementation

### Database Schema

```sql
-- Scenario templates
CREATE TABLE scenarios (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  difficulty_level TEXT NOT NULL,

  -- Setup
  setting TEXT NOT NULL,
  user_role TEXT NOT NULL,
  ai_role TEXT NOT NULL,
  ai_personality TEXT,

  -- Objectives
  objectives JSON NOT NULL,  -- ["Order coffee", "Ask about milk"]
  target_vocabulary JSON,
  grammar_focus JSON,

  -- Metadata
  is_custom BOOLEAN DEFAULT FALSE,
  created_by TEXT,
  source_type TEXT,  -- 'library', 'story', 'manual'
  source_story_id TEXT,

  -- Stats
  times_completed INTEGER DEFAULT 0,
  avg_rating REAL,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (source_story_id) REFERENCES user_stories(id)
);

-- User scenario sessions
CREATE TABLE scenario_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  scenario_id TEXT NOT NULL,

  -- Mode
  mode TEXT NOT NULL,  -- 'speaking' or 'typing'

  -- Progress
  started_at DATETIME NOT NULL,
  completed_at DATETIME,
  duration_seconds INTEGER,

  -- Tasks
  objectives_total INTEGER NOT NULL,
  objectives_completed INTEGER DEFAULT 0,

  -- Performance
  clarity_score REAL,
  vocabulary_score REAL,
  task_completion_score REAL,

  -- Points
  points_earned INTEGER DEFAULT 0,
  courage_points INTEGER DEFAULT 0,

  -- Conversation
  transcript JSON,  -- Full conversation history

  -- Words flagged
  words_to_practice JSON,  -- Words added to word bank

  -- Recording (if speaking mode)
  recording_url TEXT,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (scenario_id) REFERENCES scenarios(id)
);

-- Mode balance tracking
CREATE TABLE mode_balance (
  user_id TEXT PRIMARY KEY,
  period_start DATE NOT NULL,

  speaking_sessions INTEGER DEFAULT 0,
  typing_sessions INTEGER DEFAULT 0,

  current_ratio REAL DEFAULT 1.0,
  status TEXT DEFAULT 'balanced',

  locked_mode TEXT,
  sessions_to_unlock INTEGER,

  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Scenario ratings
CREATE TABLE scenario_ratings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  scenario_id TEXT NOT NULL,
  session_id TEXT NOT NULL,

  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, session_id)
);
```

### AI Integration

```typescript
interface ScenarioAIConfig {
  // Model selection
  model: 'gemini-1.5-flash' | 'gemini-1.5-pro';

  // Response settings
  responseLanguage: string;      // Target language
  maxResponseLength: number;     // Prevent AI monologues
  speakingSpeed: 'slow' | 'normal' | 'fast';

  // Personality
  personality: string;           // "Friendly, patient barista"
  errorCorrectionStyle: 'gentle' | 'direct';

  // Learning integration
  userProficiencyLevel: string;  // From staircase system
  targetVocabulary: string[];    // Words to use in conversation
  grammarFocus: string[];        // Patterns to reinforce

  // Hints
  hintDelay: number;             // 5-10 seconds (research-backed)
  hintStyle: 'question' | 'partial' | 'translation';
}

const SCENARIO_SYSTEM_PROMPT = `
You are playing the role of {ai_role} in a language learning scenario.

SCENARIO: {setting}
USER'S ROLE: {user_role}
YOUR PERSONALITY: {personality}

OBJECTIVES the user should complete:
{objectives}

RULES:
1. Respond ONLY in {target_language}
2. Keep responses SHORT (1-2 sentences max)
3. Match the user's proficiency level ({proficiency_level})
4. Use vocabulary from this list when possible: {target_vocabulary}
5. Do NOT end every response with a question (vary your responses)
6. Gently guide toward objectives without being obvious
7. If user makes mistakes, respond naturally but model correct usage
8. Be patient and encouraging
9. Track which objectives have been completed

CORRECTION STYLE:
- Never say "That's wrong"
- Instead, naturally use the correct form in your response
- Example: User says "Yo quiero un café con leche de vaca"
- You respond: "¡Perfecto! Un café con leche de vaca. ¿Grande o pequeño?"
- (Naturally uses correct structure without criticizing)

CONVERSATION STATE:
{conversation_history}
Objectives completed: {completed_objectives}
`;
```

### Speech Recognition Integration

```typescript
interface SpeechConfig {
  // Whisper API settings
  model: 'whisper-1';
  language: string;

  // Vox-specific settings
  pronunciationFeedback: boolean;
  articulationAnalysis: boolean;  // NOT accent judgment

  // Timing
  silenceThreshold: number;       // ms before considered "done"
  maxRecordingLength: number;     // seconds

  // Error handling
  retryOnFailure: boolean;
  fallbackToTyping: boolean;
}

interface ArticulationFeedback {
  overallClarity: number;         // 0-100
  wordByWordScores: {
    word: string;
    expected: string;
    heard: string;
    clarity: number;
    suggestion?: string;          // "Try emphasizing the 'rr'"
  }[];

  // What we DON'T do:
  // - Judge accent (Mexican vs Spanish vs etc.)
  // - Compare to "native speaker"
  // - Penalize regional variations

  // What we DO:
  // - Check if sounds are distinguishable
  // - Identify unclear articulation
  // - Suggest mouth/tongue positioning
}
```

---

## User Experience Flow

### First Scenario Experience

```
1. User completes onboarding
     ↓
2. "Ready for your first conversation?"
     ↓
3. Show simple scenario (ordering coffee)
     ↓
4. Pre-scenario motivation screen
     ↓
5. Choice: Speak or Type
     ↓
6. Guided first conversation (extra hints)
     ↓
7. Celebration + feedback
     ↓
8. "Unlock more scenarios by completing lessons"
```

### Regular Use Flow

```
1. User opens Scenarios section
     ↓
2. Browse: Library | My Scenarios | From Stories
     ↓
3. Select scenario
     ↓
4. View objectives and settings
     ↓
5. Choose mode (check balance status)
     ↓
6. Motivation screen
     ↓
7. Complete conversation
     ↓
8. Review feedback
     ↓
9. Words → Word Bank
     ↓
10. Rate scenario (optional)
```

### Scenario Creation Flow

```
1. User taps "Create Scenario"
     ↓
2. Choose: From Scratch | From Story | AI Suggest
     ↓
3a. From Scratch:
    - Enter setting, roles, objectives
    - Preview AI personality
    - Save to My Scenarios
     ↓
3b. From Story:
    - Select existing story
    - AI suggests scenarios
    - User confirms/edits
     ↓
3c. AI Suggest:
    - Answer: "What situation do you want to practice?"
    - AI generates scenario
    - User refines
     ↓
4. Practice immediately or save for later
```

---

## Points & Gamification

### Scenario Points System

| Action | Points | Rationale |
|--------|--------|-----------|
| Complete objective | +15 | Task completion matters |
| Complete ALL objectives | +50 bonus | Encourage thoroughness |
| First attempt at word | +5 | Courage to try |
| Improved articulation | +10 | Progress rewarded |
| Complete scenario | +20 | Finish what you start |
| Create custom scenario | +25 | Personalization |
| Use scenario vocabulary later | +5 | Retention |

### Courage Points (Special)

```typescript
interface CouragePoints {
  // Awarded for TRYING, not perfection
  attemptedDifficultWord: number;    // +5
  spokeWhenNervous: number;          // +10 (first time in session)
  triedWithoutHint: number;          // +3
  recoveredFromMistake: number;      // +5
  completedDespiteErrors: number;    // +15
}
```

### Streaks

- **Scenario Streak**: Complete 1 scenario daily
- **Balance Streak**: Maintain ≤5:1 ratio for a week
- **Courage Streak**: Earn courage points 3 days in a row

---

## Privacy & Data

### What We Store

| Data | Purpose | Retention |
|------|---------|-----------|
| Conversation transcripts | Review & feedback | Until user deletes |
| Audio recordings | User review only | Until user deletes |
| Performance scores | Progress tracking | Account lifetime |
| Mode balance | Balance enforcement | Rolling 7 days |
| Custom scenarios | User's scenarios | Until user deletes |

### What We DON'T Do

- ❌ Share conversation content with third parties
- ❌ Use recordings for AI training without consent
- ❌ Judge or store accent characteristics
- ❌ Compare users to each other
- ❌ Sell performance data

### User Control

- Delete any recording
- Delete conversation history
- Export all scenario data
- Delete account and all data

See [DATA_PRIVACY.md](./DATA_PRIVACY.md) for full privacy architecture.

---

## Implementation Priority

### Phase 1: MVP (Week 1)
- [ ] Pre-built scenario library (10 scenarios)
- [ ] Basic conversation flow with Gemini
- [ ] Speak/Type toggle
- [ ] Simple feedback screen

### Phase 2: Balance System (Week 2)
- [ ] Mode tracking
- [ ] Balance warnings
- [ ] Lock mechanism
- [ ] Balance dashboard

### Phase 3: Custom Scenarios (Week 3)
- [ ] Scenario creation UI
- [ ] Story → Scenario pipeline
- [ ] AI scenario suggestions

### Phase 4: Polish (Week 4)
- [ ] Articulation feedback
- [ ] Courage points
- [ ] Scenario ratings
- [ ] Community scenarios (future)

---

## Success Metrics

| Metric | Target | Rationale |
|--------|--------|-----------|
| Scenario completion rate | >70% | Engaging scenarios |
| Mode balance | <5:1 ratio avg | Balanced learning |
| Return rate | >60% same-day | Users enjoy practice |
| Courage points earned | >0 per session | Users taking risks |
| Custom scenarios created | >1 per user | Personalization working |

---

## Sources

### Research
- [TBLT Meta-Analysis (52 studies)](https://journals.sagepub.com/doi/10.1177/1362168817744389)
- [Cambridge Language Teaching Research](https://www.cambridge.org/core/journals/language-teaching/article/research-into-practice-the-taskbased-approach-to-instructed-second-language-acquisition/664FB7A40E0C8424339DA8CF51A59DB3)
- [AI Conversation Bots Study - Nature](https://www.nature.com/articles/s41599-025-05550-z)
- [3D Scenario-Based Games Research](https://www.tandfonline.com/doi/full/10.1080/2331186X.2025.2560059)
- [AIGC Teaching Study](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2025.1670892/full)

### Competitive Analysis
- [Speak.com Live Roleplays](https://www.speak.com/blog/live-roleplays)
- [Speak App Review - LanguaTalk](https://languatalk.com/blog/speak-app-review/)
- [AI Language Learning Apps - TalkPal](https://talkpal.ai/best-ai-language-learning-app-reddit-users-recommend-for-2024/)

---

*Last Updated: December 2024*
*Document Version: 1.0*
