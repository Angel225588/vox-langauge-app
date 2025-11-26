# Homepage Component Cards & Exercise Flow Planning Document

**Date:** November 24, 2025
**Status:** Planning Document for Next Session
**Purpose:** Day-one learning experience with 8 interactive card components

---

## 1. Overview

### Vision
Create an immediate, engaging learning experience where users can start practicing from day one with a collection of interactive card-based exercises. Each card represents a different learning activity that works together to provide a comprehensive language learning experience.

### User Flow
```
Homepage (8 Cards) → User Selects Card → Exercise Screen → Completion & Points → Return to Homepage
                                                              ↓
                                           After X Cards: AI Conversation (Free Tier)
```

### Goals
- **Immediate Practice**: Users can start learning within 30 seconds of opening the app
- **Day-one Results**: Complete meaningful exercises and earn points on first session
- **Offline-First**: All exercises work without internet (AI conversation requires online)
- **Gamification**: Points, streaks, and progress tracking motivate continued practice
- **Progressive Complexity**: Start simple, increase difficulty naturally

### Success Metrics
- User completes at least 3 cards on day one (target: 60% of new users)
- Average session time: 10-15 minutes
- Smooth animations running at 60fps consistently
- Works 100% offline (except AI conversation feature)
- Zero crashes during card interactions

---

## 2. The 8 Component Cards

Each card is a self-contained learning activity that leverages the existing card components from `/components/cards/`.

### Card 1: Vocabulary Flashcards
**Icon:** 📚
**Title:** Vocabulary Builder
**Description:** Learn new words with images and audio

**Exercise Type:** Interactive flashcards using `SingleVocabCard`
**Learning Objective:** Introduce 10 new words with visual and audio reinforcement
**Estimated Time:** 3-5 minutes

**Implementation:**
- Shows 10 vocabulary cards in sequence
- Each card displays: image, word, phonetic, audio (normal + slow)
- User can tap to flip and see translation
- Swipe or tap to move to next card
- Progress indicator (1/10, 2/10, etc.)

**Card Component Used:** `SingleVocabCard.tsx`
**Points Earned:** 10 points per card (100 total)

**User Flow:**
```
Homepage → Tap "Vocabulary Builder" → Card 1/10 → Swipe → Card 2/10 → ... → Card 10/10 → Completion Screen (+100 pts) → Back to Homepage
```

---

### Card 2: Listening Comprehension
**Icon:** 🎧
**Title:** Listen & Match
**Description:** Hear the word, select the correct image

**Exercise Type:** Audio-to-image matching using `AudioToImageCard`
**Learning Objective:** Train listening skills and word recognition
**Estimated Time:** 4-6 minutes

**Implementation:**
- 10 audio challenges
- User hears a word/phrase
- Selects from 4 image options
- Instant feedback (green glow for correct, red shake for wrong)
- Shows correct answer if user is wrong

**Card Component Used:** `AudioToImageCard.tsx`
**Points Earned:** 15 points per correct answer, 5 points for attempts (max 150)

**User Flow:**
```
Homepage → Tap "Listen & Match" → Challenge 1/10 (Audio plays) → Select image → Feedback → Challenge 2/10 → ... → Completion (+150 pts)
```

---

### Card 3: Speaking Practice
**Icon:** 🎤
**Title:** Pronunciation Pro
**Description:** Practice speaking out loud

**Exercise Type:** Record and practice pronunciation using `SpeakingCard`
**Learning Objective:** Build confidence in speaking and pronunciation
**Estimated Time:** 5-8 minutes

**Implementation:**
- 8 words/phrases to practice
- User listens to model pronunciation
- Records their own voice
- Can replay their recording
- Save recording for future AI analysis (post-v1)

**Card Component Used:** `SpeakingCard.tsx`
**Points Earned:** 20 points per recording (160 total)

**User Flow:**
```
Homepage → Tap "Pronunciation Pro" → Word 1/8 → Listen to model → Record → Playback → Next → ... → Completion (+160 pts)
```

**Future Enhancement (Phase 5):**
- AI pronunciation feedback via Gemini API
- Accuracy scoring (1-5 stars)
- Specific phoneme recommendations

---

### Card 4: Reading Exercise
**Icon:** 📖
**Title:** Story Time
**Description:** Read a short story in your target language

**Exercise Type:** Interactive reading with vocabulary highlighting
**Learning Objective:** Improve reading comprehension and vocabulary in context
**Estimated Time:** 5-7 minutes

**Implementation:**
- Display a short story (150-250 words)
- Highlight vocabulary words from recent lessons
- Tap word → see definition and pronunciation
- Story difficulty adapts to user level
- Optional: Answer 3 comprehension questions after reading

**Card Component Used:** Custom `StoryReaderCard.tsx` (to be created)
**Points Earned:** 50 points for reading, +10 per correct comprehension question (80 total)

**User Flow:**
```
Homepage → Tap "Story Time" → Read story → Tap highlighted words for definitions → Comprehension questions (3) → Completion (+80 pts)
```

**Story Generation:**
- AI-generated via Gemini (requires online)
- Pre-downloaded stories available offline (5 cached stories)
- Based on user's interests from onboarding

---

### Card 5: Grammar Basics
**Icon:** ✏️
**Title:** Grammar Builder
**Description:** Master essential grammar patterns

**Exercise Type:** Multiple choice and fill-in-the-blank using `ImageMultipleChoiceCard` and `TextInputCard`
**Learning Objective:** Understand and apply basic grammar rules
**Estimated Time:** 4-6 minutes

**Implementation:**
- 10 grammar challenges
- Mix of multiple choice and text input
- Focus areas: verb tenses, articles, prepositions, sentence structure
- Example: "I ___ to school yesterday" (go/went/going/gone)
- Instant feedback with explanations

**Card Components Used:** `ImageMultipleChoiceCard.tsx`, `TextInputCard.tsx`
**Points Earned:** 15 points per correct answer (150 total)

**User Flow:**
```
Homepage → Tap "Grammar Builder" → Question 1/10 → Select/Type answer → Feedback + Explanation → Question 2/10 → ... → Completion (+150 pts)
```

---

### Card 6: Pronunciation Drills
**Icon:** 🗣️
**Title:** Sound It Out
**Description:** Compare similar-sounding words

**Exercise Type:** Comparison and listening using `ComparisonCard`
**Learning Objective:** Distinguish between homophones and similar-sounding words
**Estimated Time:** 3-5 minutes

**Implementation:**
- 10 word pairs (homophones, past/present tense, similar words)
- Show both words side by side with phonetics
- Play audio for each
- User practices saying both to notice differences
- Examples: see/sea, to/two/too, watch/watched

**Card Component Used:** `ComparisonCard.tsx`
**Points Earned:** 10 points per pair practiced (100 total)

**User Flow:**
```
Homepage → Tap "Sound It Out" → Pair 1/10 (see vs sea) → Listen to both → Practice saying both → Next → ... → Completion (+100 pts)
```

---

### Card 7: Quick Quiz
**Icon:** ⚡
**Title:** Speed Challenge
**Description:** Fast-paced vocabulary and grammar quiz

**Exercise Type:** Timed multiple choice using `ImageMultipleChoiceCard`
**Learning Objective:** Quick recall and reinforcement of learned material
**Estimated Time:** 3-4 minutes

**Implementation:**
- 15 rapid-fire questions (20 seconds each)
- Mix of vocabulary and grammar
- Timer visible at top
- Bonus points for speed
- Leaderboard ranking (optional)

**Card Component Used:** `ImageMultipleChoiceCard.tsx` with timer
**Points Earned:** 10 points per correct answer, +2 bonus if answered within 10 seconds (max 180)

**User Flow:**
```
Homepage → Tap "Speed Challenge" → Get Ready countdown (3-2-1) → Question 1/15 (timer starts) → Answer → Question 2/15 → ... → Completion (+180 pts) → Show leaderboard position
```

---

### Card 8: Conversation Starters
**Icon:** 💬
**Title:** Daily Chat
**Description:** Practice common phrases for real conversations

**Exercise Type:** Scenario-based practice using `SingleVocabCard` and `SpeakingCard`
**Learning Objective:** Build practical conversation skills for daily situations
**Estimated Time:** 5-7 minutes

**Implementation:**
- 8 common conversation scenarios
- Examples: greeting, ordering food, asking directions, making introductions
- Each scenario shows: context image, phrase in target language, phonetic, audio
- User practices saying each phrase
- Optional: Record and save for AI feedback (post-v1)

**Card Components Used:** `SingleVocabCard.tsx`, `SpeakingCard.tsx`
**Points Earned:** 15 points per phrase practiced (120 total)

**User Flow:**
```
Homepage → Tap "Daily Chat" → Scenario 1/8 (Greeting) → Learn phrase → Practice speaking → Record → Next → ... → Completion (+120 pts)
```

**Scenarios:**
1. Greetings & Introductions
2. Ordering Food at Restaurant
3. Asking for Directions
4. Shopping & Prices
5. Making Small Talk
6. Asking for Help
7. Phone Conversations
8. Saying Goodbye

---

## 3. Exercise Flow Architecture

### Card Selection
```
┌─────────────────────────────────────────┐
│         Homepage (Home Screen)          │
│                                         │
│  ┌────────┐ ┌────────┐ ┌────────┐     │
│  │ Card 1 │ │ Card 2 │ │ Card 3 │     │
│  │   📚   │ │   🎧   │ │   🎤   │     │
│  │ Vocab  │ │ Listen │ │ Speak  │     │
│  └───┬────┘ └───┬────┘ └───┬────┘     │
│      └──────────┼──────────┘           │
│                 ▼                       │
│  ┌────────┐ ┌────────┐ ┌────────┐     │
│  │ Card 4 │ │ Card 5 │ │ Card 6 │     │
│  │   📖   │ │   ✏️   │ │   🗣️   │     │
│  │ Story  │ │Grammar │ │ Sound  │     │
│  └───┬────┘ └───┬────┘ └───┬────┘     │
│      └──────────┼──────────┘           │
│                 ▼                       │
│  ┌────────┐ ┌────────┐                │
│  │ Card 7 │ │ Card 8 │                │
│  │   ⚡   │ │   💬   │                │
│  │ Quiz   │ │ Chat   │                │
│  └────────┘ └────────┘                │
└─────────────────────────────────────────┘
```

### Exercise Execution Flow
```
User Taps Card
    ↓
Load Exercise Data (from SQLite)
    ↓
Initialize Exercise State
    ↓
Display First Challenge
    ↓
User Interacts (answer, record, read, etc.)
    ↓
Validate & Give Feedback
    ↓
Update Local Progress (SQLite)
    ↓
Next Challenge OR Completion
    ↓
Calculate Points Earned
    ↓
Save to Local DB (sync later if online)
    ↓
Show Completion Screen
    ↓
Return to Homepage (updated stats)
```

### Completion Tracking
Each card completion is saved locally:
```typescript
interface CardCompletion {
  id: string;
  user_id: string;
  card_type: string; // 'vocabulary', 'listening', 'speaking', etc.
  completed_at: string; // ISO timestamp
  points_earned: number;
  accuracy: number; // percentage (0-100)
  time_spent_seconds: number;
  exercises_completed: number;
  synced: boolean; // false until uploaded to Supabase
}
```

### Progress Saving (Offline-First)
1. **During Exercise:**
   - Save progress after each challenge/question
   - Use React state for UI updates
   - Write to SQLite on each completion

2. **On Completion:**
   - Calculate total points
   - Update user's total points in local DB
   - Update streak if it's a new day
   - Mark card as completed for today

3. **When Online:**
   - Background sync to Supabase
   - Upload all unsynced completions
   - Resolve conflicts (latest timestamp wins)

### Reward System

**Points Structure:**
- **Vocabulary Flashcards:** 10 pts/card (100 total)
- **Listening Comprehension:** 15 pts/correct (150 max)
- **Speaking Practice:** 20 pts/recording (160 total)
- **Reading Exercise:** 50 pts + 10 pts/question (80 total)
- **Grammar Basics:** 15 pts/correct (150 total)
- **Pronunciation Drills:** 10 pts/pair (100 total)
- **Quick Quiz:** 10 pts + 2 bonus (180 max)
- **Conversation Starters:** 15 pts/phrase (120 total)

**Total Available Per Day:** 1,040 points

**Streaks:**
- Complete at least 3 cards/day to maintain streak
- Streak counter visible on homepage
- Visual: 🔥 icon with number of days
- Milestone rewards: 7 days, 30 days, 100 days

**Leaderboard:**
- Ranked by: Practice attempts (primary), Total points (secondary), Streak (tertiary)
- Weekly and all-time rankings
- View friends' progress (optional social feature)

---

## 4. AI Conversation Integration

### Trigger Condition
After user completes **3 or more cards** in a session, offer AI conversation practice.

### Free Tier vs Paid Tier
**Free Tier:**
- 1 AI conversation per day (5 minutes max)
- Basic topics related to completed exercises
- Text-based chat only

**Paid Tier:**
- Unlimited AI conversations
- Advanced topics and scenarios
- Voice-to-voice conversation (future)
- Personalized curriculum adjustments

### Gemini API Integration

**Entry Point:**
```
User completes 3rd card → Show "Ready for a conversation?" popup → User accepts → Load AI Chat Screen
```

**Implementation:**
```typescript
// lib/api/gemini-conversation.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ConversationContext {
  user_level: string;
  completed_cards_today: string[];
  vocabulary_learned: string[];
  grammar_topics: string[];
  interests: string[];
}

export async function startAIConversation(context: ConversationContext) {
  const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `
You are a friendly language tutor for a ${context.user_level} English learner.
They just practiced: ${context.completed_cards_today.join(', ')}.
Recent vocabulary: ${context.vocabulary_learned.join(', ')}.
Interests: ${context.interests.join(', ')}.

Start a casual, encouraging 5-minute conversation. Use the vocabulary they just learned.
Keep it simple, friendly, and supportive. Ask open-ended questions about their interests.
If they make mistakes, gently correct them in a positive way.
`;

  const chat = model.startChat({
    history: [],
    generationConfig: {
      maxOutputTokens: 150,
      temperature: 0.7,
    },
  });

  return chat;
}
```

**Conversation Topics (Based on Completed Exercises):**
- If completed Vocabulary: "Let's use those new words in sentences!"
- If completed Grammar: "Let's practice that grammar pattern in conversation"
- If completed Speaking: "Great pronunciation! Let's have a chat using those phrases"
- If completed Reading: "Tell me about the story you read - what did you think?"

**Chat Screen Features:**
- Text input for user messages
- AI responses with TTS (text-to-speech)
- Typing indicator while AI is responding
- Conversation history displayed
- "End Conversation" button
- Save conversation for review (optional)

**Points for AI Conversation:**
- +50 points for participating
- +10 points per message sent
- Max: 150 points per conversation

---

## 5. Technical Requirements

### State Management

**Global State (Zustand):**
```typescript
// stores/useAppStore.ts
interface AppState {
  user: User | null;
  totalPoints: number;
  currentStreak: number;
  cardsCompletedToday: string[];
  lastCompletionDate: string;

  // Actions
  addPoints: (points: number) => void;
  completeCard: (cardType: string) => void;
  updateStreak: () => void;
  resetDailyProgress: () => void;
}
```

**Local State (React State):**
- Current exercise progress
- Current question index
- User's answers
- Timer state (for Quick Quiz)
- Audio playback state

### Database Schema

**New Table: card_completions**
```sql
CREATE TABLE card_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  card_type TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  points_earned INTEGER NOT NULL,
  accuracy DECIMAL(5,2), -- percentage
  time_spent_seconds INTEGER,
  exercises_completed INTEGER,
  synced BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_card_completions_user ON card_completions(user_id);
CREATE INDEX idx_card_completions_date ON card_completions(completed_at);
CREATE INDEX idx_card_completions_synced ON card_completions(synced) WHERE synced = FALSE;
```

**New Table: ai_conversations**
```sql
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  message_count INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  conversation_data JSONB, -- stores full chat history
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_date ON ai_conversations(started_at);
```

**Update users table:**
```sql
ALTER TABLE users ADD COLUMN total_points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN current_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN last_practice_date DATE;
ALTER TABLE users ADD COLUMN cards_completed_today INTEGER DEFAULT 0;
```

### API Endpoints (Supabase Edge Functions)

**1. Complete Card:**
```typescript
// POST /api/complete-card
{
  user_id: string,
  card_type: string,
  points_earned: number,
  accuracy: number,
  time_spent_seconds: number,
  exercises_completed: number
}
// Returns: { success: boolean, new_total_points: number, streak: number }
```

**2. Sync Offline Data:**
```typescript
// POST /api/sync-completions
{
  user_id: string,
  completions: CardCompletion[]
}
// Returns: { synced_count: number, conflicts: [] }
```

**3. Get Leaderboard:**
```typescript
// GET /api/leaderboard?period=weekly
// Returns: { rankings: User[], user_rank: number }
```

**4. Start AI Conversation:**
```typescript
// POST /api/ai-conversation/start
{
  user_id: string,
  context: ConversationContext
}
// Returns: { conversation_id: string, initial_message: string }
```

### Offline Support Requirements

**Pre-cached Data:**
1. Exercise content for all 8 cards (first 3 days worth)
2. Vocabulary words with images and audio
3. Grammar challenges
4. 5 AI-generated stories (pre-downloaded when online)
5. Audio files for all vocabulary

**Local Database (SQLite):**
- User profile and preferences
- Card completion history
- Points and streak data
- Exercise content (synced from Supabase)
- Cached stories

**Sync Strategy:**
1. **On App Open (when online):**
   - Sync unsynced card completions
   - Download new exercise content
   - Update leaderboard cache

2. **Background Sync (iOS/Android):**
   - Periodically sync when device has WiFi
   - Use `expo-background-fetch`

3. **Conflict Resolution:**
   - Use timestamps to determine latest data
   - Never overwrite local data with older remote data

---

## 6. File Structure

### New Files to Create

```
app/
├── (tabs)/
│   ├── home.tsx                          # MAIN HOMEPAGE (update)
│   │                                     # - Grid of 8 cards
│   │                                     # - Streak counter
│   │                                     # - Total points
│   │                                     # - Today's progress summary
│
├── exercises/                            # NEW DIRECTORY
│   ├── vocabulary.tsx                    # Card 1: Vocabulary Flashcards
│   ├── listening.tsx                     # Card 2: Listening Comprehension
│   ├── speaking.tsx                      # Card 3: Speaking Practice
│   ├── reading.tsx                       # Card 4: Reading Exercise
│   ├── grammar.tsx                       # Card 5: Grammar Basics
│   ├── pronunciation.tsx                 # Card 6: Pronunciation Drills
│   ├── quiz.tsx                          # Card 7: Quick Quiz
│   ├── conversation-starters.tsx         # Card 8: Conversation Starters
│   └── completion.tsx                    # Exercise completion screen
│
├── ai-chat/
│   └── index.tsx                         # AI Conversation Screen
│
components/
├── home/                                 # NEW DIRECTORY
│   ├── CardGrid.tsx                      # Grid layout for 8 cards
│   ├── ExerciseCard.tsx                  # Individual card component
│   ├── StreakDisplay.tsx                 # Streak counter with flame icon
│   ├── PointsDisplay.tsx                 # Total points display
│   └── ProgressSummary.tsx               # Today's progress widget
│
├── exercises/                            # NEW DIRECTORY
│   ├── ExerciseContainer.tsx             # Wrapper for all exercises
│   ├── ProgressBar.tsx                   # Progress indicator (1/10, 2/10, etc.)
│   ├── TimerDisplay.tsx                  # Timer for Quick Quiz
│   └── CompletionScreen.tsx              # Exercise completion animation
│
├── ai-chat/                              # NEW DIRECTORY
│   ├── ChatBubble.tsx                    # Message bubble (user/AI)
│   ├── ChatInput.tsx                     # Text input for messages
│   ├── TypingIndicator.tsx               # "AI is typing..." animation
│   └── ConversationHistory.tsx           # Scrollable chat history
│
lib/
├── exercises/                            # NEW DIRECTORY
│   ├── vocabulary-exercises.ts           # Vocabulary exercise data
│   ├── listening-exercises.ts            # Listening exercise data
│   ├── speaking-exercises.ts             # Speaking exercise data
│   ├── reading-exercises.ts              # Story generation & data
│   ├── grammar-exercises.ts              # Grammar challenge data
│   ├── pronunciation-exercises.ts        # Pronunciation pair data
│   ├── quiz-exercises.ts                 # Quiz question data
│   └── conversation-exercises.ts         # Conversation scenario data
│
├── api/
│   ├── gemini-conversation.ts            # AI conversation logic
│   ├── complete-card.ts                  # Card completion API
│   └── sync-offline-data.ts              # Offline sync logic
│
├── db/
│   ├── card-completions.ts               # Card completion CRUD
│   ├── ai-conversations.ts               # AI conversation CRUD
│   └── leaderboard.ts                    # Leaderboard queries
│
hooks/
├── useCardCompletion.ts                  # Hook for completing cards
├── useStreak.ts                          # Hook for streak management (update)
├── useLeaderboard.ts                     # Hook for leaderboard data
├── useAIConversation.ts                  # Hook for AI chat
└── useExerciseProgress.ts                # Hook for tracking exercise progress

stores/
└── useAppStore.ts                        # Global app state (update)

types/
├── exercises.ts                          # Exercise type definitions
├── card-completion.ts                    # Card completion types
└── ai-conversation.ts                    # AI conversation types
```

### Existing Files to Update

```
app/(tabs)/home.tsx
- Replace placeholder UI with card grid
- Add streak display
- Add points display
- Add progress summary

components/cards/
- Keep all existing card components
- Use them in exercise screens

lib/db/database.ts
- Add card_completions table
- Add ai_conversations table
- Update users table

constants/designSystem.ts
- Add new colors/gradients for exercise cards (if needed)
```

---

## 7. Design Specifications

### Homepage Card Dimensions
- **Card Width:** 45% of screen width (2 columns)
- **Card Height:** 140px
- **Card Spacing:** 12px gap between cards
- **Card Padding:** 16px internal padding

### Card Visual Design
Each card follows the existing design system:
```typescript
// Card Structure
{
  icon: string,              // Emoji (48px)
  title: string,             // Bold, 18px
  description: string,       // Regular, 14px, secondary color
  gradient: string[],        // Background gradient
  progress?: number,         // Optional progress bar (0-100)
  badge?: string            // Optional badge (e.g., "NEW", "3/10")
}
```

### Card Gradients
Using existing design system:
- **Vocabulary:** Primary gradient (Indigo → Purple)
- **Listening:** Secondary gradient (Teal → Turquoise)
- **Speaking:** Primary gradient (Indigo → Purple)
- **Reading:** Warm gradient (Orange → Red)
- **Grammar:** Cool gradient (Blue → Indigo)
- **Pronunciation:** Secondary gradient (Teal → Turquoise)
- **Quiz:** Success gradient (Green)
- **Conversation:** Primary gradient (Indigo → Purple)

### Animation Patterns
**Card Entrance (on homepage load):**
```typescript
// Stagger animation
FadeInDown.duration(400).delay(index * 100).springify()
```

**Card Press Animation:**
```typescript
// Scale and glow
onPress: () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  // Animated.spring to scale(0.95) and back to scale(1)
}
```

**Exercise Transitions:**
```typescript
// Slide in from right for next challenge
SlideInRight.duration(300).springify()

// Slide out to left for previous challenge
SlideOutLeft.duration(300).springify()
```

**Completion Animation:**
```typescript
// Confetti + scale up + fade in
ZoomIn.duration(500).springify()
// Show points earned with bounce effect
BounceIn.delay(300)
```

### Spacing and Layout (Dark Theme)
Following existing design system:
- **Container Padding:** 16px (spacing.lg)
- **Section Spacing:** 24px (spacing.xl)
- **Element Spacing:** 12px (spacing.md)
- **Border Radius:** 12px (borderRadius.md)

### Typography
Using existing design system:
- **Card Title:** fontSize.lg (18px), fontWeight.semibold
- **Card Description:** fontSize.sm (14px), color.text.secondary
- **Points Display:** fontSize.2xl (24px), fontWeight.bold
- **Streak Display:** fontSize.xl (20px), fontWeight.semibold

### Color Scheme (Dark Theme)
Using existing colors from `constants/designSystem.ts`:
- **Background:** `colors.background.primary` (#0A0E1A)
- **Card Background:** `rgba(255, 255, 255, 0.05)`
- **Text Primary:** `colors.text.primary` (#FFFFFF)
- **Text Secondary:** `colors.text.secondary` (rgba(255, 255, 255, 0.6))
- **Success:** `colors.gradients.success` (Green)
- **Error:** `colors.gradients.error` (Red)

---

## 8. Success Metrics & KPIs

### Day-One Metrics
**Target: 60% of new users complete at least 3 cards**

Tracking:
```typescript
interface DayOneMetrics {
  user_id: string;
  cards_completed: number;          // Target: >= 3
  total_time_spent_minutes: number; // Target: 10-15
  points_earned: number;            // Target: >= 300
  exercises_completed: number;      // Target: >= 30
  completed_first_session: boolean; // Did they finish?
}
```

### Session Quality Metrics
**Target: 10-15 minute average session time**

Tracking:
- Session start time
- Session end time
- Time spent per card
- Completion rate per card
- Drop-off points (which card do users quit on?)

### Performance Metrics
**Target: 60fps animations, <2s load times**

Tracking:
- Frame rate during animations (use `expo-performance`)
- Card load time (from tap to display)
- Exercise load time
- AI conversation response time
- Memory usage

### Engagement Metrics
**Target: 40% 7-day retention**

Tracking:
- Daily active users (DAU)
- Weekly active users (WAU)
- Streak maintenance rate
- Cards completed per day (average)
- AI conversation participation rate

### Technical Metrics
**Target: 100% offline functionality (except AI chat)**

Tracking:
- Offline completion rate
- Sync success rate
- Sync conflict rate
- Failed API calls
- Error rates by card type

---

## 9. Development Phases

### Phase 1: Foundation (Day 1-2)
**Goal:** Set up homepage and card grid

**Tasks:**
1. Create homepage card grid layout
2. Design and implement 8 ExerciseCard components
3. Add streak display to header
4. Add points display to header
5. Implement card tap navigation
6. Add card entrance animations
7. Test on iOS and Android

**Deliverables:**
- Functional homepage with 8 tappable cards
- Visual design matching specification
- Smooth animations at 60fps

---

### Phase 2: Exercise Screens (Day 3-5)
**Goal:** Build all 8 exercise screens

**Day 3:**
- Card 1: Vocabulary Flashcards screen
- Card 2: Listening Comprehension screen
- Exercise completion screen

**Day 4:**
- Card 3: Speaking Practice screen
- Card 4: Reading Exercise screen
- Card 5: Grammar Basics screen

**Day 5:**
- Card 6: Pronunciation Drills screen
- Card 7: Quick Quiz screen
- Card 8: Conversation Starters screen

**Deliverables:**
- All 8 exercise screens functional
- Points calculation working
- Progress tracking implemented
- Completion animations working

---

### Phase 3: Data & Offline Support (Day 6-7)
**Goal:** Implement database and offline functionality

**Tasks:**
1. Create card_completions table
2. Implement local SQLite storage
3. Add card completion tracking
4. Implement offline sync logic
5. Pre-load exercise content
6. Test offline mode thoroughly

**Deliverables:**
- All exercises work offline
- Data saves locally
- Sync works when online
- No data loss

---

### Phase 4: AI Conversation (Day 8-9)
**Goal:** Add AI conversation feature

**Tasks:**
1. Create AI chat screen UI
2. Integrate Gemini API
3. Implement conversation context
4. Add conversation triggers (after 3 cards)
5. Add free tier limits (1/day)
6. Test conversation quality
7. Save conversation history

**Deliverables:**
- Functional AI chat
- Contextual conversations
- Proper free tier limits
- Smooth UX

---

### Phase 5: Gamification & Polish (Day 10-11)
**Goal:** Add leaderboard, polish UX

**Tasks:**
1. Create leaderboard screen
2. Implement leaderboard API
3. Add milestone achievements
4. Polish all animations
5. Add sound effects (optional)
6. Fix bugs and edge cases
7. Performance optimization

**Deliverables:**
- Leaderboard working
- Achievements visible
- Smooth, polished experience
- All bugs fixed

---

### Phase 6: Testing & Launch (Day 12-14)
**Goal:** Comprehensive testing and release

**Tasks:**
1. User testing with 5-10 beta users
2. Fix reported issues
3. Performance audit
4. Accessibility audit
5. Final QA
6. App store screenshots
7. Launch!

**Deliverables:**
- Production-ready app
- No critical bugs
- Passes all QA tests
- Ready for launch

---

## 10. Risk Assessment & Mitigation

### Risk 1: AI Conversation Response Time
**Issue:** Gemini API may be slow (>3s response time)

**Mitigation:**
- Show "AI is thinking..." animation
- Stream responses (show text as it's generated)
- Implement 10-second timeout with retry
- Cache common responses

---

### Risk 2: Offline Exercise Content Size
**Issue:** Pre-loading 3 days of content may use too much storage

**Mitigation:**
- Compress images (WebP format)
- Use smaller audio files (64kbps)
- Implement smart preloading (download only what's needed)
- Allow users to clear cache

---

### Risk 3: Performance on Older Devices
**Issue:** Animations may lag on older iPhones/Androids

**Mitigation:**
- Test on iPhone 8 / Android equivalent
- Use `useNativeDriver` for all animations
- Reduce animation complexity if needed
- Implement performance monitoring

---

### Risk 4: User Drop-Off After Card 1
**Issue:** Users may not complete multiple cards in first session

**Mitigation:**
- Make Card 1 (Vocabulary) very easy and quick
- Show progress indicator ("2 more cards for bonus!")
- Add motivational prompts
- Implement "quick win" achievements (complete 1 card = +50 bonus points)

---

### Risk 5: Sync Conflicts
**Issue:** Data conflicts when syncing offline completions

**Mitigation:**
- Use timestamps for conflict resolution
- Never overwrite newer data
- Log all conflicts for debugging
- Show user-friendly error messages

---

## 11. Next Steps (Immediate Action Items)

### Tomorrow's Session (Priority Order)

**1. Homepage Card Grid (2-3 hours)**
- Update `/app/(tabs)/home.tsx`
- Create `/components/home/CardGrid.tsx`
- Create `/components/home/ExerciseCard.tsx`
- Add 8 cards with icons, titles, descriptions
- Implement card tap navigation

**2. First Exercise Screen (2-3 hours)**
- Create `/app/exercises/vocabulary.tsx`
- Use existing `SingleVocabCard` component
- Implement 10-card sequence
- Add progress indicator
- Add completion flow

**3. Points & Streak Display (1-2 hours)**
- Create `/components/home/StreakDisplay.tsx`
- Create `/components/home/PointsDisplay.tsx`
- Update global state to track points/streak
- Add to homepage header

**4. Database Schema (1 hour)**
- Update `database-schema.sql` with new tables
- Run migrations on Supabase
- Update SQLite schema locally

**Total Estimated Time:** 6-9 hours (1 full day of development)

---

## 12. Conclusion

This planning document provides a comprehensive roadmap for implementing the homepage card system and exercise flow. The 8-card design leverages existing card components, follows the established design system, and prioritizes offline-first functionality.

### Key Takeaways
1. **Reuse Existing Components:** All exercise screens use cards from `/components/cards/`
2. **Offline-First:** Everything except AI chat works offline
3. **Gamification:** Points, streaks, and leaderboard drive engagement
4. **Incremental Development:** Build one card at a time, test thoroughly
5. **User-Centric:** Focus on immediate value and quick wins

### Success Definition
The feature is successful if:
- 60% of new users complete 3+ cards on day one
- Average session time: 10-15 minutes
- 40% 7-day retention rate
- 60fps animations throughout
- 100% offline functionality (except AI chat)
- Zero crashes during normal use

---

**Ready to Build!** This document serves as a blueprint for tomorrow's development session. Start with the homepage card grid, then build one exercise screen at a time, following the phased approach outlined above.

**Document Version:** 1.0
**Last Updated:** November 24, 2025
**Author:** Claude (AI Assistant)
**Status:** Ready for Implementation
