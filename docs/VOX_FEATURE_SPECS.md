# Vox Language - Feature Specifications

**Created**: 2025-11-30
**Purpose**: Technical specifications for implementing prioritized features
**Companion Docs**: VOX_MASTER_FEATURES.md, VOX_PRIORITY_MATRIX.md

---

## P1 Feature Specifications

### SPEC-001: Grammar Explanation System

#### Overview
Users can tap any word to see grammar explanations, conjugation tables, and contextual examples. This addresses the #1 user complaint about language apps.

#### User Stories
- As a learner, I want to tap a word and see why it has a specific ending
- As a learner, I want to see all conjugations of a verb in one place
- As a learner, I want example sentences showing proper usage

#### Database Schema

```sql
-- Add to existing flashcards table or create new
CREATE TABLE word_grammar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word_id UUID REFERENCES flashcards(id),
  part_of_speech TEXT NOT NULL, -- 'noun', 'verb', 'adjective', etc.
  gender TEXT, -- 'masculine', 'feminine', 'neutral' (for gendered languages)
  grammar_notes JSONB, -- Array of explanation strings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE conjugation_tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word_id UUID REFERENCES flashcards(id),
  tense TEXT NOT NULL, -- 'present', 'past', 'future', etc.
  conjugations JSONB NOT NULL, -- { "je": "suis", "tu": "es", ... }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE word_examples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word_id UUID REFERENCES flashcards(id),
  sentence TEXT NOT NULL,
  translation TEXT NOT NULL,
  audio_url TEXT,
  difficulty TEXT DEFAULT 'beginner',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### SQLite Schema (Offline)

```sql
CREATE TABLE IF NOT EXISTS word_grammar (
  id TEXT PRIMARY KEY,
  word_id TEXT NOT NULL,
  part_of_speech TEXT NOT NULL,
  gender TEXT,
  grammar_notes TEXT, -- JSON string
  FOREIGN KEY (word_id) REFERENCES flashcards(id)
);

CREATE TABLE IF NOT EXISTS conjugation_tables (
  id TEXT PRIMARY KEY,
  word_id TEXT NOT NULL,
  tense TEXT NOT NULL,
  conjugations TEXT NOT NULL, -- JSON string
  FOREIGN KEY (word_id) REFERENCES flashcards(id)
);

CREATE TABLE IF NOT EXISTS word_examples (
  id TEXT PRIMARY KEY,
  word_id TEXT NOT NULL,
  sentence TEXT NOT NULL,
  translation TEXT NOT NULL,
  audio_url TEXT,
  difficulty TEXT DEFAULT 'beginner',
  FOREIGN KEY (word_id) REFERENCES flashcards(id)
);
```

#### Component: WordDetailPopup

```typescript
// /components/grammar/WordDetailPopup.tsx

interface WordDetailPopupProps {
  wordId: string;
  word: string;
  isVisible: boolean;
  onClose: () => void;
}

interface WordGrammarData {
  partOfSpeech: string;
  gender?: string;
  grammarNotes: string[];
  conjugations?: {
    tense: string;
    forms: Record<string, string>;
  }[];
  examples: {
    sentence: string;
    translation: string;
    audioUrl?: string;
  }[];
}

// Tab Structure:
// [Definition] [Grammar] [Conjugations] [Examples]
```

#### UI Design

```
┌─────────────────────────────────────┐
│ 🍎 Apple (la pomme)          [X]   │
├─────────────────────────────────────┤
│ [Definition] [Grammar] [Conjugations] [Examples] │
├─────────────────────────────────────┤
│ Definition Tab:                      │
│ • Noun (feminine)                    │
│ • /pɔm/ 🔊                          │
│ • A round fruit...                   │
├─────────────────────────────────────┤
│ Grammar Tab:                         │
│ • Feminine noun → use "la" not "le" │
│ • Plural: les pommes                 │
│ • "Une pomme" = a/an apple          │
├─────────────────────────────────────┤
│ [+ Add to Review]                    │
└─────────────────────────────────────┘
```

#### Offline Support
- All grammar data cached in SQLite
- Pre-download with lesson content
- Works 100% offline

---

### SPEC-002: AI Conversation Partner

#### Overview
Users can have voice or text conversations with Gemini AI, practicing speaking in a judgment-free environment with delayed hints and contextual corrections.

#### User Stories
- As a learner, I want to practice speaking without fear of judgment
- As a learner, I want the AI to wait before giving hints (not rush me)
- As a learner, I want corrections that explain "try this instead" not just "wrong"

#### Architecture

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│ User Voice  │───▶│ Speech-to-   │───▶│   Gemini    │
│   Input     │    │    Text      │    │     AI      │
└─────────────┘    └──────────────┘    └──────┬──────┘
                                              │
┌─────────────┐    ┌──────────────┐           │
│   Speaker   │◀───│ Text-to-     │◀──────────┘
│   Output    │    │   Speech     │
└─────────────┘    └──────────────┘
```

#### Gemini Prompt Engineering

```typescript
const conversationSystemPrompt = `
You are a friendly language tutor helping a ${level} learner practice ${targetLanguage}.

CRITICAL RULES:
1. WAIT for the user to finish before responding (never interrupt)
2. DO NOT give hints for at least 5-10 seconds of silence
3. Corrections should be gentle: "You could also say..." not "Wrong"
4. Adapt vocabulary to ${level} level
5. Ask follow-up questions to keep conversation going
6. If user struggles, simplify your language, don't give the answer
7. Celebrate attempts: "Great try! I understood you meant..."
8. Use the vocabulary from their recent lessons: ${recentVocabulary}

SESSION TYPE: ${sessionType}
- casual: Friendly everyday conversation
- interview: Mock job interview practice
- scenario: ${scenarioDescription}

RESPOND IN ${targetLanguage} with occasional ${nativeLanguage} hints if user is stuck.
`;
```

#### Credit System

```typescript
interface AIUsage {
  userId: string;
  date: string; // ISO date
  minutesUsed: number;
  sessionType: 'casual' | 'interview' | 'scenario';
}

// Free tier: 10 minutes/day
// Premium: Unlimited

async function checkCredits(userId: string): Promise<{
  remaining: number;
  used: number;
  limit: number;
}> {
  const today = new Date().toISOString().split('T')[0];
  const usage = await getUsageForDate(userId, today);
  const limit = isPremium(userId) ? Infinity : 10;

  return {
    remaining: Math.max(0, limit - usage),
    used: usage,
    limit
  };
}
```

#### UI Design

```
┌─────────────────────────────────────┐
│ AI Conversation        ⏱️ 8:42      │
│ Credits: 10:00 remaining            │
├─────────────────────────────────────┤
│                                     │
│  🤖 AI: Bonjour! Comment vas-tu    │
│         aujourd'hui?               │
│                                     │
│  👤 You: Je vais... um... bien?    │
│                                     │
│  🤖 AI: Super! "Je vais bien" -    │
│         that's perfect! 👏         │
│         What did you do today?     │
│                                     │
├─────────────────────────────────────┤
│ [🎤 Hold to Speak]                  │
│ OR                                  │
│ [Type your message...]        [📤] │
└─────────────────────────────────────┘
```

#### Key Implementation Details

```typescript
// 5-10 second delay before hints
const HINT_DELAY_MS = 7000;

// Conversation component
function AIConversation() {
  const [silenceTimer, setSilenceTimer] = useState<NodeJS.Timeout | null>(null);
  const [showHintButton, setShowHintButton] = useState(false);

  // Start timer when user stops speaking
  const onSpeechEnd = () => {
    const timer = setTimeout(() => {
      setShowHintButton(true);
    }, HINT_DELAY_MS);
    setSilenceTimer(timer);
  };

  // Clear timer if user speaks again
  const onSpeechStart = () => {
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      setShowHintButton(false);
    }
  };
}
```

#### Offline Behavior
- Requires internet connection
- Shows clear message: "AI conversation requires internet"
- Offers alternative: "Practice with flashcards offline instead"

---

### SPEC-003: Vocabulary Dashboard

#### Overview
Users can view all learned vocabulary, organized by category, level, and strength, with search and export capabilities.

#### User Stories
- As a learner, I want to see all words I've learned
- As a learner, I want to search my vocabulary
- As a learner, I want to export my words to Anki
- As a learner, I want to see which words need review

#### Database Query

```typescript
interface VocabularyWord {
  id: string;
  word: string;
  translation: string;
  category: string;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  lastReviewed: Date | null;
  nextReview: Date;
  strength: number; // 0-100 based on SM-2 ease factor
  timesReviewed: number;
  timesCorrect: number;
}

async function getUserVocabulary(
  userId: string,
  filters?: {
    category?: string;
    level?: string;
    searchQuery?: string;
    needsReview?: boolean;
  }
): Promise<VocabularyWord[]> {
  // Query local SQLite, return filtered results
}
```

#### UI Design

```
┌─────────────────────────────────────┐
│ My Vocabulary              [Export] │
│ 247 words learned                   │
├─────────────────────────────────────┤
│ [🔍 Search words...]                │
├─────────────────────────────────────┤
│ Filter: [All ▼] [A1-C2 ▼] [Due ▼]  │
├─────────────────────────────────────┤
│                                     │
│ 🍎 apple (la pomme)                │
│    A1 · Food · Strong 💪           │
│                                     │
│ 🚗 car (la voiture)                │
│    A1 · Travel · Review Soon ⚠️    │
│                                     │
│ 📚 book (le livre)                 │
│    A1 · Objects · Strong 💪        │
│                                     │
│ [Load More...]                      │
└─────────────────────────────────────┘
```

#### Word Strength Calculation

```typescript
function calculateWordStrength(word: FlashcardProgress): number {
  // Based on SM-2 ease factor (default 2.5)
  // Min: 1.3 (difficult), Max: 2.5+ (easy)

  const easeFactor = word.easeFactor;
  const daysSinceReview = daysBetween(word.lastReviewed, new Date());
  const intervalRatio = word.interval / daysSinceReview;

  // Normalize to 0-100
  let strength = ((easeFactor - 1.3) / 1.2) * 100;

  // Decay if overdue
  if (intervalRatio < 1) {
    strength *= intervalRatio;
  }

  return Math.max(0, Math.min(100, strength));
}

function getStrengthLabel(strength: number): {
  label: string;
  color: string;
  icon: string;
} {
  if (strength >= 70) return { label: 'Strong', color: 'green', icon: '💪' };
  if (strength >= 40) return { label: 'Learning', color: 'yellow', icon: '📖' };
  return { label: 'Review Soon', color: 'red', icon: '⚠️' };
}
```

#### Export Functionality

```typescript
interface ExportFormat {
  csv: string;
  anki: string; // Tab-separated for Anki import
  json: string;
}

function exportVocabulary(
  words: VocabularyWord[],
  format: 'csv' | 'anki' | 'json'
): string {
  switch (format) {
    case 'csv':
      return words.map(w =>
        `"${w.word}","${w.translation}","${w.category}","${w.cefrLevel}"`
      ).join('\n');

    case 'anki':
      // Tab-separated: front, back, tags
      return words.map(w =>
        `${w.word}\t${w.translation}\tvox-language ${w.category}`
      ).join('\n');

    case 'json':
      return JSON.stringify(words, null, 2);
  }
}
```

---

### SPEC-004: Writing Practice Module

#### Overview
Users practice productive writing skills with AI feedback on grammar, style, and vocabulary usage.

#### User Stories
- As a learner, I want writing prompts appropriate to my level
- As a learner, I want AI feedback on my writing
- As a learner, I want to practice translating from my native language

#### Exercise Types

```typescript
type WritingExerciseType =
  | 'prompted'      // Write about a topic
  | 'translation'   // Translate native → target
  | 'fill-blank'    // Complete the sentence
  | 'journal'       // Free writing (daily prompt)
  | 'describe'      // Describe an image

interface WritingExercise {
  id: string;
  type: WritingExerciseType;
  prompt: string;
  promptTranslation?: string;
  targetLength?: number; // Suggested word count
  vocabularyHints?: string[]; // Words to try using
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  category: string;
}
```

#### AI Feedback System

```typescript
const writingFeedbackPrompt = `
Analyze this ${level} learner's writing in ${targetLanguage}:

"${userWriting}"

Provide feedback in this JSON format:
{
  "overallScore": 1-10,
  "grammarErrors": [
    {
      "original": "incorrect phrase",
      "correction": "correct phrase",
      "explanation": "why it's wrong (in ${nativeLanguage})"
    }
  ],
  "vocabularySuggestions": [
    {
      "used": "basic word",
      "better": "more natural word",
      "context": "when to use it"
    }
  ],
  "styleNotes": "general feedback on style and flow",
  "positives": ["what they did well"],
  "nextFocus": "one thing to work on"
}

Be encouraging! This is a safe space for learning.
`;

interface WritingFeedback {
  overallScore: number;
  grammarErrors: {
    original: string;
    correction: string;
    explanation: string;
  }[];
  vocabularySuggestions: {
    used: string;
    better: string;
    context: string;
  }[];
  styleNotes: string;
  positives: string[];
  nextFocus: string;
}
```

#### UI Design

```
┌─────────────────────────────────────┐
│ Writing Practice           [Daily] │
├─────────────────────────────────────┤
│ 📝 Today's Prompt:                  │
│ "Describe your morning routine"     │
│                                     │
│ Suggested words: se lever, prendre, │
│ petit-déjeuner, se brosser          │
├─────────────────────────────────────┤
│                                     │
│ [Write your response here...]       │
│                                     │
│ _____________________________________│
│ |Je me leve a sept heures. Je      |│
│ |prends mon petit dejeuner...      |│
│ |                                  |│
│ |                                  |│
│ |__________________________________|│
│                                     │
│ Words: 15 / ~50 suggested           │
├─────────────────────────────────────┤
│ [Submit for Feedback]               │
└─────────────────────────────────────┘

After Submit:
┌─────────────────────────────────────┐
│ ✨ Great effort! Score: 7/10       │
├─────────────────────────────────────┤
│ 📌 Grammar Notes:                   │
│                                     │
│ • "leve" → "lève" (accent needed)  │
│   The verb "lever" needs an accent │
│   in je form: je me lève           │
│                                     │
│ • "dejeuner" → "déjeuner"          │
│   Don't forget the accent!         │
├─────────────────────────────────────┤
│ 💡 Vocabulary Tips:                 │
│                                     │
│ • Try "quotidien" instead of       │
│   repeating "chaque jour"          │
├─────────────────────────────────────┤
│ 👏 What you did well:               │
│ • Good sentence structure          │
│ • Used reflexive verbs correctly   │
├─────────────────────────────────────┤
│ [Practice Again] [Next Exercise]    │
└─────────────────────────────────────┘
```

---

### SPEC-005: Optional Gamification Toggles

#### Overview
Users can enable/disable gamification features to customize their experience. Research shows 40% of users hate gamification while 60% love it.

#### Settings Structure

```typescript
interface GamificationSettings {
  streakEnabled: boolean;
  streakNotifications: boolean;
  pointsVisible: boolean;
  leaderboardVisible: boolean;
  achievementBadges: boolean;
  dailyGoalReminders: boolean;
  soundEffects: boolean;
  celebrationAnimations: boolean;
  focusMode: boolean; // Disables ALL gamification
}

const defaultSettings: GamificationSettings = {
  streakEnabled: true,
  streakNotifications: true,
  pointsVisible: true,
  leaderboardVisible: true,
  achievementBadges: true,
  dailyGoalReminders: true,
  soundEffects: true,
  celebrationAnimations: true,
  focusMode: false
};
```

#### UI Design

```
┌─────────────────────────────────────┐
│ Settings > Gamification             │
├─────────────────────────────────────┤
│                                     │
│ 🎯 Focus Mode                  [○]  │
│ Disable all gamification for        │
│ distraction-free learning           │
│                                     │
├─────────────────────────────────────┤
│ Streaks                             │
│ ├─ Show streak counter       [●]   │
│ └─ Streak reminders          [●]   │
│                                     │
│ Points & Rewards                    │
│ ├─ Show points               [●]   │
│ └─ Achievement badges        [●]   │
│                                     │
│ Social                              │
│ └─ Show leaderboard          [●]   │
│                                     │
│ Effects                             │
│ ├─ Sound effects             [●]   │
│ └─ Celebration animations    [●]   │
│                                     │
├─────────────────────────────────────┤
│ 💡 Tip: Focus Mode is great for    │
│ serious study sessions              │
└─────────────────────────────────────┘
```

#### Streak Recovery System

```typescript
interface StreakRecovery {
  userId: string;
  streakBrokenDate: string;
  previousStreak: number;
  recoveryDeadline: string; // 48 hours to recover
  recovered: boolean;
}

// Allow streak recovery within 48 hours (free tier: 1x per month)
async function recoverStreak(userId: string): Promise<boolean> {
  const recovery = await getStreakRecovery(userId);

  if (!recovery) return false;

  const now = new Date();
  const deadline = new Date(recovery.recoveryDeadline);

  if (now > deadline) {
    return false; // Too late
  }

  // Check recovery eligibility
  const monthlyRecoveries = await getRecoveriesThisMonth(userId);
  const isPremium = await checkPremium(userId);

  if (!isPremium && monthlyRecoveries >= 1) {
    return false; // Free tier limit
  }

  // Restore streak
  await restoreStreak(userId, recovery.previousStreak);
  return true;
}
```

---

## P2 Feature Specifications (Brief)

### SPEC-006: Native Speaker Videos

**Overview**: Video content showing native speakers' facial expressions and mouth movements for better pronunciation learning.

**Key Requirements**:
- Multiple speakers per word (age, gender, regional diversity)
- Slow-motion playback option
- Regional variants (Spain vs Latin America, etc.)
- Offline download support
- Compressed video format (~500KB per clip)

**Database**:
```sql
CREATE TABLE word_videos (
  id UUID PRIMARY KEY,
  word_id UUID REFERENCES flashcards(id),
  video_url TEXT NOT NULL,
  speaker_region TEXT, -- 'spain', 'mexico', 'france_north', etc.
  speaker_gender TEXT,
  duration_ms INTEGER,
  file_size_kb INTEGER
);
```

---

### SPEC-007: CEFR Level Tracking

**Overview**: Estimate and display user's CEFR level (A1-C2) based on vocabulary and skills mastery.

**Level Requirements** (simplified):
| Level | Vocabulary | Grammar | Skills |
|-------|------------|---------|--------|
| A1 | 500 words | Basic present tense | Simple sentences |
| A2 | 1,500 words | Past/future basics | Daily situations |
| B1 | 3,000 words | All main tenses | Opinions, experiences |
| B2 | 5,000 words | Complex structures | Abstract topics |
| C1 | 8,000 words | Nuanced grammar | Professional contexts |
| C2 | 10,000+ words | Near-native | All contexts |

**Display**:
```
┌─────────────────────────────────────┐
│ Your Level: A2 ████████░░ 78%      │
│ 247 words until B1                  │
│                                     │
│ Skills Breakdown:                   │
│ • Vocabulary: B1 (strong)          │
│ • Grammar: A2 (on track)           │
│ • Listening: A2 (on track)         │
│ • Speaking: A1 (needs practice)    │
│ • Writing: A2 (on track)           │
└─────────────────────────────────────┘
```

---

### SPEC-008: Advanced Games

**Sentence Building**:
- Words presented out of order
- User drags to correct position
- Grammar-focused (word order rules)

**Picture Description**:
- Show image
- User describes in target language
- AI evaluates completeness and accuracy

**Memory/Concentration**:
- Card pairs (word-image, word-translation)
- Timed challenges
- Multiplayer option (future)

---

## Implementation Notes

### Shared Infrastructure

**AI Request Manager**:
```typescript
// Centralized Gemini API management
class AIRequestManager {
  private cache: Map<string, { response: string; timestamp: number }>;
  private rateLimit: number = 60; // requests per minute

  async request(
    prompt: string,
    options: {
      cacheKey?: string;
      cacheDuration?: number;
      priority?: 'high' | 'normal' | 'low';
    }
  ): Promise<string> {
    // Check cache first
    if (options.cacheKey) {
      const cached = this.cache.get(options.cacheKey);
      if (cached && Date.now() - cached.timestamp < (options.cacheDuration || 300000)) {
        return cached.response;
      }
    }

    // Rate limiting
    await this.waitForRateLimit();

    // Make request
    const response = await gemini.generateContent(prompt);

    // Cache response
    if (options.cacheKey) {
      this.cache.set(options.cacheKey, {
        response: response.text(),
        timestamp: Date.now()
      });
    }

    return response.text();
  }
}
```

**Offline Queue**:
```typescript
interface OfflineAction {
  id: string;
  type: 'review' | 'progress' | 'recording';
  payload: any;
  timestamp: number;
  retries: number;
}

// Queue actions when offline, process when online
class OfflineQueue {
  async add(action: Omit<OfflineAction, 'id' | 'retries'>): Promise<void>;
  async processQueue(): Promise<void>;
  async getQueueSize(): Promise<number>;
}
```

---

## Testing Requirements

### Each P1 Feature Must Pass:

- [ ] Works on iOS (iPhone 12+)
- [ ] Works on Android (API 24+)
- [ ] Works 100% offline (where applicable)
- [ ] Handles errors gracefully
- [ ] Loading states implemented
- [ ] Animations are smooth (60fps)
- [ ] Accessible (VoiceOver/TalkBack)
- [ ] Data syncs correctly when online
- [ ] No data loss on app crash
- [ ] Performance: <100ms response for local operations

---

**Document Version**: 1.0
**Last Updated**: 2025-11-30
**Owner**: Angel Polanco
