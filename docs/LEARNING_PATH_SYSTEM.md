# Learning Path System - Technical Specification

Last Updated: 2025-12-12
Status: Active Development

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Path Generation Flow](#path-generation-flow)
4. [Staircase Structure](#staircase-structure)
5. [Mini-Lesson Types](#mini-lesson-types)
6. [Calibrator System](#calibrator-system)
7. [AI Memory System](#ai-memory-system)
8. [Adaptive Learning](#adaptive-learning)
9. [Data Models](#data-models)
10. [API Endpoints](#api-endpoints)
11. [UI Components](#ui-components)
12. [Implementation Files](#implementation-files)
13. [Integration Points](#integration-points)

---

## Overview

The Learning Path System is the core personalized learning engine of Vox Language App. It creates adaptive, AI-driven learning journeys that evolve based on user performance, preferences, and goals.

### Key Features

- **AI-Generated Personalization**: Uses Google Gemini to create custom learning paths based on onboarding data
- **Adaptive Progression**: Learning path adjusts dynamically based on performance and calibration results
- **Staircase Metaphor**: Visual progress through "stairs" (milestones) containing 5 mini-lessons each
- **Periodic Calibration**: Assessment system that appears after every 5-7 stairs to refine learning path
- **Persistent AI Memory**: User profile that continuously learns and adapts (similar to claude.md for personalization)
- **Multi-Section Architecture**: Path divided into sections, each tailored based on previous performance

---

## System Architecture

### High-Level Flow

```
Onboarding → Path Generation → Section 1 (5-7 stairs)
                                      ↓
                              Calibrator Banner
                                      ↓
                         Section 2 Generated (5-7 stairs)
                                      ↓
                              Calibrator Banner
                                      ↓
                                   ... continues
```

### Core Components

1. **Path Generator**: AI system that creates initial learning path
2. **Section Manager**: Organizes stairs into sections for calibration cycles
3. **Stair System**: Individual learning milestones with 5 mini-lessons each
4. **Mini-Lesson Engine**: Delivers 5 different types of learning activities
5. **Calibrator**: Assessment tool that measures progress and identifies areas for improvement
6. **AI Memory**: Persistent user profile that powers all AI interactions

---

## Path Generation Flow

### 1. Trigger Points

Path generation occurs at:
- **Initial**: Onboarding completion
- **Periodic**: After each calibration (generates next section)
- **Manual**: User-requested path regeneration

### 2. Input Data

```typescript
interface PathGenerationInput {
  user_id: string;
  target_language: string;      // e.g., "Spanish"
  native_language: string;       // e.g., "English"
  motivation: string;            // e.g., "job_interview"
  motivation_custom?: string;    // Custom motivation text
  why_now?: string;              // Why learning now
  proficiency_level: 'beginner' | 'elementary' | 'intermediate' | 'advanced';
  timeline: '1_month' | '3_months' | '6_months' | '1_year';
  previous_attempts?: string;    // Past learning experience
  commitment_stakes: string;     // What's at stake
}
```

### 3. AI Generation Process

1. **Analyze User Profile**: Process onboarding data and AI memory
2. **Determine Difficulty Range**: Based on proficiency level and calibration history
3. **Generate Stairs**: Create 5-7 stairs with appropriate vocabulary and skills
4. **Validate Content**: Ensure progressive difficulty and skill building
5. **Store Path**: Save to database with user association

### 4. Output Structure

```typescript
interface GeneratedPath {
  path_title: string;              // e.g., "Job Interview Mastery"
  path_description: string;        // Overview of learning goals
  total_stairs: number;            // 5-7 stairs per section
  estimated_completion: string;    // e.g., "6 weeks"
  stairs: GeneratedStair[];        // Array of stair definitions
}
```

---

## Staircase Structure

### Section Organization

```
LEARNING PATH
│
├── SECTION 1 (Initial)
│   ├── Stair 1: [5 mini-lessons] ✓
│   ├── Stair 2: [5 mini-lessons] ✓
│   ├── Stair 3: [5 mini-lessons] 🎯 Current
│   ├── Stair 4: [5 mini-lessons] 🔒 Locked
│   ├── Stair 5: [5 mini-lessons] 🔒 Locked
│   ├── Stair 6: [5 mini-lessons] 🔒 Locked
│   └── Stair 7: [5 mini-lessons] 🔒 Locked
│
│   └─► CALIBRATOR BANNER ◄─ (Triggers Section 2 generation)
│
├── SECTION 2 (Post-Calibration 1)
│   ├── Stair 8: [5 mini-lessons] 🔒 Locked
│   ├── Stair 9: [5 mini-lessons] 🔒 Locked
│   └── ...
│
└── ... continues
```

### Stair States

Each stair can be in one of three states:

#### 1. Completed ✓
- **Visual**: Green gradient (#10B981 → #34D399)
- **Badge**: "Completed"
- **Interaction**: Tappable for review/replay
- **Crown**: No crown indicator

#### 2. Current 🎯
- **Visual**: Purple/Indigo gradient (#6366F1 → #8B5CF6)
- **Badge**: "In Progress"
- **Interaction**: Tappable to continue lessons
- **Crown**: 👑 Crown icon showing user's current position
- **Effect**: Glowing border (3px) with drop shadow

#### 3. Locked 🔒
- **Visual**: Gray/transparent gradient with 50% opacity
- **Badge**: "Locked"
- **Interaction**: Not clickable
- **Icon**: 🔒 Lock icon

### Stair Contents

Each stair contains:

```typescript
interface Stair {
  id: string;
  section_id: string;
  order: number;                    // Position in path
  title: string;                    // e.g., "Professional Greetings"
  emoji: string;                    // Visual identifier
  description: string;              // What user will learn
  vocabulary_count: number;         // Number of new words
  estimated_days: number;           // Time to complete
  skills_required: string[];        // Prerequisites
  skills_unlocked: string[];        // What this enables
  status: 'locked' | 'current' | 'completed';
  lessons_count: 5;                 // Always 5 mini-lessons
  lessons?: MiniLesson[];           // The 5 mini-lessons
}
```

---

## Mini-Lesson Types

Each stair contains exactly **5 mini-lessons**, typically in this order:

### 1. Vocabulary Introduction
**Purpose**: Learn new words and phrases
**Duration**: 5-10 minutes

**Content**:
- New vocabulary with translations
- Phonetic pronunciations
- Example sentences
- Audio for each word

**UI Components**:
- `SingleVocabCard.tsx` - Individual word presentation
- Audio playback controls
- Swipe to next word

### 2. Flashcard Practice
**Purpose**: Spaced repetition memorization
**Duration**: 5-10 minutes

**Content**:
- Cards from vocabulary introduced in Lesson 1
- Two-button feedback: "Good" / "Again"
- SM-2 spaced repetition algorithm

**UI Components**:
- `FlashcardCard.tsx` - Card flip interface
- Progress indicator
- Good/Again buttons

**Good vs Again**:
- **Good**: Marked as successful, informs AI that user is comfortable with this content
- **Again**: Needs more practice, card shown more frequently

### 3. Writing Practice
**Purpose**: Active production and sentence construction
**Duration**: 10-15 minutes

**Types**:
- Sentence completion
- Translation exercises
- Fill-in-the-blank
- Free writing prompts

**UI Components**:
- `TextInputCard.tsx` - Text input with validation
- `FillInBlankCard.tsx` - Interactive blanks

### 4. Reading/Listening Comprehension
**Purpose**: Context-based understanding
**Duration**: 10-15 minutes

**Content**:
- Short passage using learned vocabulary
- Audio narration (optional)
- Comprehension questions
- Interactive word definitions

**UI Components**:
- `ReadingResultsCard.tsx` - Passage display with questions
- `QuestionGameCard.tsx` - Multiple choice comprehension

### 5. AI Conversation
**Purpose**: Real conversation practice with AI
**Duration**: 10-20 minutes

**Content**:
- Scenario-based dialogue
- AI persona tailored to lesson context
- Minimum message requirement (e.g., 5 exchanges)
- Real-time feedback and hints

**UI Components**:
- `RolePlayCard.tsx` - Conversation interface
- `SpeakingCard.tsx` - Voice input option
- AI response with 5-10 second "thinking" delay for realism

**Objectives**:
- Use specific vocabulary from the stair
- Complete conversation goals
- Practice natural flow

---

## Calibrator System

### Purpose

The Calibrator is **NOT a test** - it's a calibration tool designed to:
- Assess current proficiency across skills
- Identify strengths and weaknesses
- Generate adapted next section
- Update user AI memory
- Reward participation (not accuracy)

### Trigger Conditions

Calibrator banner appears:
- After completing 5-7 stairs (end of section)
- Never shown to beginners in first section
- Can be postponed (appears again later)

### Test Structure

```typescript
interface CalibratorTest {
  id: string;
  section_id: string;
  listening_tasks: ListeningTask[];      // 3-5 tasks
  speaking_tasks: SpeakingTask[];        // 2-3 tasks
  comprehension_tasks: ComprehensionTask[]; // 3-5 tasks
}
```

### Three Assessment Areas

#### 1. Listening Comprehension
- Audio clips at appropriate difficulty level
- Multiple choice questions
- Tests: Word recognition, sentence understanding, context comprehension

#### 2. Speaking Production
- Prompts for verbal responses
- Recording and AI analysis
- Tests: Pronunciation, fluency, vocabulary usage

#### 3. Reading Comprehension
- Passages using learned vocabulary
- Comprehension questions
- Tests: Reading speed, understanding, inference

### Scoring and Analysis

```typescript
interface CalibratorResult {
  listening_score: number;          // 0-100
  speaking_score: number;           // 0-100
  comprehension_score: number;      // 0-100
  overall_score: number;            // Average
  strengths_identified: string[];   // What user is good at
  weaknesses_identified: string[];  // Areas needing work
  recommendations: string[];        // AI-generated next steps
}
```

### Post-Calibration Flow

1. **Analyze Results**: AI processes scores and behavior data
2. **Update AI Memory**: Add observations to user profile
3. **Generate Next Section**: Create 5-7 new stairs adapted to results
4. **Show Results**: Display strengths, areas to work on
5. **Award Points**: Give completion points (not accuracy-based)

### Calibrator Banner Component

```typescript
// components/calibration/LevelCheckBanner.tsx
interface LevelCheckBannerProps {
  onStartCalibration: () => void;
  onSkipAsBeginner: () => void;
  dismissed?: boolean;
  onDismiss?: () => void;
}
```

**Banner displays**:
- "Time to check your progress!"
- Points reward for completion
- Estimated time (5-10 minutes)
- Skip/Postpone options

---

## AI Memory System

### Concept

The AI Memory is like a `claude.md` file for each user - a persistent context that informs all AI interactions.

### Structure

```typescript
interface UserAIMemory {
  id: string;
  user_id: string;

  // Background
  native_language: string;
  target_language: string;
  original_motivation: string;
  original_stakes: string;

  // Proficiency Tracking
  current_level: CEFRLevel;        // A1, A2, B1, B2, C1, C2
  strengths: string[];             // e.g., ["pronunciation", "vocabulary retention"]
  weaknesses: string[];            // e.g., ["grammar", "listening speed"]
  preferred_topics: string[];      // e.g., ["business", "travel"]

  // Statistics
  total_vocab_learned: number;
  vocab_mastery_rate: number;      // 0-100%
  conversation_confidence: number; // 0-100

  // AI Insights
  ai_observations: string[];       // Running notes about learning patterns
  recommended_focus: string[];     // What to emphasize next

  // Progress
  calibrations_completed: number;
  sections_completed: number;

  created_at: string;
  updated_at: string;
}
```

### Update Triggers

AI Memory is updated:
- **After each lesson**: Add vocab learned, update mastery
- **After calibration**: Add strengths/weaknesses, update level
- **After conversation**: Add observations about fluency, topics
- **On "Good" feedback**: Note what user is comfortable with
- **On "Again" feedback**: Note what needs more practice

### How It Powers Personalization

1. **Content Generation**: AI uses memory to create relevant scenarios
2. **Difficulty Adjustment**: Adapts based on strengths/weaknesses
3. **Topic Selection**: Prioritizes preferred topics
4. **Encouragement**: References original motivation and stakes
5. **Conversation**: AI persona adapts to user's level and preferences

### Example AI Memory Entry

```json
{
  "user_id": "123",
  "native_language": "English",
  "target_language": "Spanish",
  "original_motivation": "job_interview",
  "original_stakes": "New job opportunity in 3 months",
  "current_level": "B1",
  "strengths": [
    "Strong vocabulary retention",
    "Good pronunciation",
    "Comfortable with present tense"
  ],
  "weaknesses": [
    "Past tense conjugation",
    "Listening at natural speed",
    "Subjunctive mood"
  ],
  "preferred_topics": ["business", "technology", "professional development"],
  "ai_observations": [
    "User responds well to visual aids",
    "Prefers written explanations before speaking practice",
    "Shows improvement in confidence after 3rd calibration"
  ],
  "recommended_focus": [
    "Past tense practice in business contexts",
    "Listening exercises with professional podcasts",
    "Subjunctive mood introduction in upcoming section"
  ]
}
```

---

## Adaptive Learning

### How "Good" Feedback Informs AI

When user marks a card as "Good":
1. Vocabulary added to "comfortable" list in AI memory
2. Difficulty level for that word type noted
3. Similar content can be introduced faster
4. Topic preference noted if applicable

### Struggling Areas Get More Practice

When user marks cards as "Again" repeatedly:
1. Weakness identified and added to AI memory
2. Next section includes more scaffolding
3. Alternative teaching methods tried
4. Extra practice mini-lessons generated

### Pace Adjustment

System monitors:
- **Time per lesson**: If consistently over estimate, slow pace
- **Cards marked "Again"**: If >30%, reduce difficulty
- **Lesson completion rate**: If dropping, add motivational content
- **Calibration scores**: Adjust next section difficulty

### Content Adaptation

Based on AI memory, content adapts:
- **Preferred topics**: More scenarios in those areas
- **Strengths**: Build on them for confidence
- **Weaknesses**: Extra practice, different approaches
- **Learning style**: Visual vs auditory emphasis

---

## Data Models

### Database Schema Overview

The Learning Path System uses 7 core tables in Supabase PostgreSQL:

### 1. user_onboarding_profiles

Stores initial onboarding data used for path generation.

```sql
CREATE TABLE user_onboarding_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_language TEXT NOT NULL,
  native_language TEXT NOT NULL,
  motivation TEXT NOT NULL,
  motivation_custom TEXT,
  why_now TEXT,
  proficiency_level TEXT NOT NULL CHECK (proficiency_level IN ('beginner', 'elementary', 'intermediate', 'advanced')),
  timeline TEXT NOT NULL CHECK (timeline IN ('1_month', '3_months', '6_months', '1_year')),
  previous_attempts TEXT,
  commitment_stakes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_onboarding_user ON user_onboarding_profiles(user_id);
```

### 2. learning_paths

Top-level learning path for each user.

```sql
CREATE TABLE learning_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  total_stairs INTEGER NOT NULL,
  estimated_completion TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, is_active) -- Only one active path per user
);

CREATE INDEX idx_paths_user ON learning_paths(user_id);
CREATE INDEX idx_paths_active ON learning_paths(user_id, is_active) WHERE is_active = TRUE;
```

### 3. sections

Groups of 5-7 stairs between calibrations.

```sql
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  total_stairs INTEGER NOT NULL CHECK (total_stairs BETWEEN 5 AND 7),
  calibration_required BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(path_id, order_index)
);

CREATE INDEX idx_sections_path ON sections(path_id, order_index);
```

### 4. stairs

Individual learning milestones (5 lessons each).

```sql
CREATE TABLE stairs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  title TEXT NOT NULL,
  emoji TEXT NOT NULL,
  description TEXT,
  vocabulary_count INTEGER DEFAULT 0,
  estimated_days INTEGER,
  skills_required TEXT[] DEFAULT '{}',
  skills_unlocked TEXT[] DEFAULT '{}',
  lessons_count INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(section_id, order_index)
);

CREATE INDEX idx_stairs_section ON stairs(section_id, order_index);
```

### 5. mini_lessons

The 5 lessons within each stair.

```sql
CREATE TABLE mini_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stair_id UUID NOT NULL REFERENCES stairs(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL CHECK (order_index BETWEEN 1 AND 5),
  type TEXT NOT NULL CHECK (type IN ('vocabulary', 'flashcards', 'writing', 'reading', 'conversation')),
  title TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL, -- Stores type-specific content
  min_messages INTEGER, -- For conversation type
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(stair_id, order_index)
);

CREATE INDEX idx_lessons_stair ON mini_lessons(stair_id, order_index);
CREATE INDEX idx_lessons_type ON mini_lessons(type);
```

### 6. lesson_progress

Tracks user progress through mini-lessons.

```sql
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mini_lesson_id UUID NOT NULL REFERENCES mini_lessons(id) ON DELETE CASCADE,
  cards_total INTEGER DEFAULT 0,
  cards_completed INTEGER DEFAULT 0,
  cards_good INTEGER DEFAULT 0, -- Marked as "Good"
  cards_again INTEGER DEFAULT 0, -- Marked as "Again"
  messages_sent INTEGER DEFAULT 0, -- For conversation type
  score NUMERIC(5,2) DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, mini_lesson_id)
);

CREATE INDEX idx_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_progress_lesson ON lesson_progress(mini_lesson_id);
CREATE INDEX idx_progress_status ON lesson_progress(user_id, status);
```

### 7. user_ai_memory

Persistent AI context for personalization.

```sql
CREATE TABLE user_ai_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  native_language TEXT NOT NULL,
  target_language TEXT NOT NULL,
  original_motivation TEXT,
  original_stakes TEXT,
  current_level TEXT CHECK (current_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  preferred_topics TEXT[] DEFAULT '{}',
  total_vocab_learned INTEGER DEFAULT 0,
  vocab_mastery_rate NUMERIC(5,2) DEFAULT 0,
  conversation_confidence NUMERIC(5,2) DEFAULT 0,
  ai_observations TEXT[] DEFAULT '{}',
  recommended_focus TEXT[] DEFAULT '{}',
  calibrations_completed INTEGER DEFAULT 0,
  sections_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_ai_memory_user ON user_ai_memory(user_id);
```

### 8. calibrator_results

Stores assessment results from calibrations.

```sql
CREATE TABLE calibrator_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  listening_score NUMERIC(5,2),
  speaking_score NUMERIC(5,2),
  comprehension_score NUMERIC(5,2),
  overall_score NUMERIC(5,2),
  strengths_identified TEXT[] DEFAULT '{}',
  weaknesses_identified TEXT[] DEFAULT '{}',
  recommendations TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, section_id)
);

CREATE INDEX idx_calibrator_user ON calibrator_results(user_id);
CREATE INDEX idx_calibrator_section ON calibrator_results(section_id);
```

### Row-Level Security (RLS)

All tables have RLS policies ensuring users can only access their own data:

```sql
-- Example for learning_paths
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own paths"
  ON learning_paths FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own paths"
  ON learning_paths FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## API Endpoints

### Future Backend Functions

These Supabase Edge Functions will be implemented:

#### POST /api/path/generate
Generate initial learning path from onboarding data.

**Request**:
```typescript
{
  user_id: string;
  onboarding_data: PathGenerationInput;
}
```

**Response**:
```typescript
{
  path_id: string;
  sections_created: number;
  stairs_created: number;
  estimated_completion: string;
}
```

#### GET /api/path/:userId
Get user's current learning path with progress.

**Response**:
```typescript
{
  path: LearningPath;
  current_section: Section;
  current_stair: Stair;
  completed_stairs: number;
  total_stairs: number;
  next_calibration_at: number; // Stairs until next calibration
}
```

#### POST /api/lesson/complete
Mark mini-lesson as complete and update progress.

**Request**:
```typescript
{
  user_id: string;
  mini_lesson_id: string;
  cards_good: number;
  cards_again: number;
  time_spent: number;
  score: number;
}
```

**Response**:
```typescript
{
  lesson_completed: boolean;
  stair_completed: boolean;
  section_completed: boolean;
  points_earned: number;
  next_lesson?: MiniLesson;
}
```

#### POST /api/calibrator/submit
Submit calibration results and trigger next section generation.

**Request**:
```typescript
{
  user_id: string;
  section_id: string;
  results: CalibratorResult;
}
```

**Response**:
```typescript
{
  ai_memory_updated: boolean;
  next_section_generated: boolean;
  new_stairs_count: number;
  recommendations: string[];
}
```

#### POST /api/section/generate
Generate next section of stairs after calibration.

**Request**:
```typescript
{
  user_id: string;
  path_id: string;
  calibrator_result: CalibratorResult;
}
```

**Response**:
```typescript
{
  section_id: string;
  stairs: GeneratedStair[];
  adapted_to: {
    strengths: string[];
    weaknesses: string[];
  };
}
```

---

## UI Components

### Core Components

#### StairCard
**Location**: `/components/learning/StairCard.tsx`
**Purpose**: Display individual stair with status

**Props**:
```typescript
interface StairCardProps {
  stair: Stair;
  status: 'locked' | 'current' | 'completed';
  onPress: () => void;
  isCurrentPosition?: boolean; // Shows crown
}
```

**Visual States**:
- Completed: Green gradient, checkmark
- Current: Purple gradient, glowing border, crown icon
- Locked: Gray, semi-transparent, lock icon

#### CalibratorBanner
**Location**: `/components/calibration/LevelCheckBanner.tsx`
**Purpose**: Prompt user to take calibration test

**Props**:
```typescript
interface LevelCheckBannerProps {
  onStartCalibration: () => void;
  onSkipAsBeginner: () => void;
  dismissed?: boolean;
  onDismiss?: () => void;
}
```

**Display**:
- Eye-catching banner between stairs
- Points reward display
- Time estimate (5-10 min)
- "Start Calibration" CTA

#### CalibrationFlow
**Location**: `/components/calibration/CalibrationFlow.tsx`
**Purpose**: Full calibration test experience

**Includes**:
- DeclaredLevelPicker (select proficiency)
- VocabProbe (vocabulary assessment)
- ListeningProbe (audio comprehension)
- SpeakingProbe (pronunciation recording)
- WritingProbe (text production)
- ResultsCard (show strengths/weaknesses)

#### MiniLessonFlow
**Location**: `/components/learning/MiniLessonFlow.tsx` (to be created)
**Purpose**: Deliver mini-lesson experience

**Routing**:
```typescript
switch (lesson.type) {
  case 'vocabulary':
    return <SingleVocabCard items={content.items} />;
  case 'flashcards':
    return <FlashcardCard cards={content.cards} />;
  case 'writing':
    return <TextInputCard prompts={content.prompts} />;
  case 'reading':
    return <ReadingResultsCard passage={content.passage} />;
  case 'conversation':
    return <RolePlayCard scenario={content.scenario} />;
}
```

#### ProgressIndicator
**Location**: `/components/learning/ProgressIndicator.tsx` (to be created)
**Purpose**: Visual progress through stair

**Shows**:
- Lessons completed (e.g., "3/5")
- Progress bar
- Current lesson highlight
- Time estimate remaining

---

## Implementation Files

### Type Definitions

#### `/types/learning.ts`
Complete TypeScript types for learning path system:
- PathGenerationInput
- GeneratedPath, GeneratedStair
- Stair, MiniLesson
- LessonContent (discriminated union)
- VocabItem, FlashcardItem, WritingPrompt, etc.
- CalibratorTest, CalibratorResult
- UserAIMemory
- LessonProgress, StairProgress

#### `/types/calibration.ts`
Calibration-specific types:
- CEFRLevel, DeclaredLevel
- ProbeType, ProbeResponse
- VocabProbeItem, ListeningProbeItem, SpeakingProbeItem, WritingProbeItem
- SkillAssessment, CalibrationResult
- CalibrationState, CalibrationFlowProps

### Database Schemas

#### `/lib/db/schemas/learning.ts` (to be created)
Supabase schema definitions and helper functions:
- Table creation SQL
- RLS policies
- Database utility functions
- CRUD operations

### AI Integration

#### `/lib/ai/userMemory.ts` (to be created)
User AI memory management:
```typescript
export async function getUserAIMemory(userId: string): Promise<UserAIMemory>
export async function updateAIMemory(userId: string, updates: Partial<UserAIMemory>): Promise<void>
export async function addAIObservation(userId: string, observation: string): Promise<void>
export async function identifyStrengths(userId: string, lessonData: LessonProgress): Promise<string[]>
export async function identifyWeaknesses(userId: string, lessonData: LessonProgress): Promise<string[]>
```

#### `/lib/ai/prompts/pathGeneration.ts` (to be created)
Gemini prompts for path generation:
```typescript
export function generateInitialPathPrompt(input: PathGenerationInput): string
export function generateAdaptedSectionPrompt(
  aiMemory: UserAIMemory,
  calibratorResult: CalibratorResult
): string
export function generateVocabularyPrompt(topic: string, level: CEFRLevel): string
```

#### `/lib/ai/gemini.ts`
Gemini API client (existing, extend with):
```typescript
export async function generateLearningPath(input: PathGenerationInput): Promise<GeneratedPath>
export async function generateNextSection(
  aiMemory: UserAIMemory,
  calibratorResult: CalibratorResult
): Promise<GeneratedStair[]>
```

### Calibration Components

#### `/components/calibration/LevelCheckBanner.tsx` ✅
Banner prompting calibration

#### `/components/calibration/DeclaredLevelPicker.tsx` ✅
Select proficiency level before calibration

#### `/components/calibration/CalibrationFlow.tsx` ✅
Main calibration orchestrator

#### `/components/calibration/probes/VocabProbe.tsx` ✅
Vocabulary assessment probe

#### `/components/calibration/probes/ListeningProbe.tsx` ✅
Listening comprehension probe

#### `/components/calibration/probes/SpeakingProbe.tsx` ✅
Speaking production probe

#### `/components/calibration/probes/WritingProbe.tsx` ✅
Writing production probe (B1+ only)

#### `/components/calibration/ResultsCard.tsx` ✅
Display calibration results with strengths/weaknesses

---

## Integration Points

### With Existing Systems

#### 1. Onboarding Flow
**Location**: `/app/(auth)/onboarding/`

**Integration**:
- Collect PathGenerationInput during onboarding
- On completion, call path generation API
- Navigate to home/staircase screen

**Files to modify**:
- `/app/(auth)/onboarding/scenarios.tsx` - Add path generation call
- `/app/(auth)/onboarding/motivation.tsx` - Collect stakes data

#### 2. Home Screen
**Location**: `/app/(tabs)/home.tsx`

**Integration**:
- Fetch current stair and progress
- Display "Continue Learning" CTA
- Show next lesson to complete
- Display calibration banner when due

**Data needed**:
```typescript
const { currentStair, nextLesson, progressPercent, calibrationDue } =
  useCurrentProgress(userId);
```

#### 3. Staircase Screen
**Location**: `/app/(tabs)/staircase.tsx`

**Integration**:
- Display all stairs in current section
- Show locked/current/completed states
- Render calibration banner between sections
- Navigate to lesson on stair tap

**Existing structure**: Already has stair visualization, needs data binding

#### 4. Card Components
**Location**: `/components/cards/`

**Existing cards to use**:
- `SingleVocabCard.tsx` - For vocabulary lessons
- `FillInBlankCard.tsx` - For writing practice
- `QuestionGameCard.tsx` - For comprehension
- `ReadingResultsCard.tsx` - For reading passages
- `RolePlayCard.tsx` - For AI conversation
- `SpeakingCard.tsx` - For speaking practice
- `TextInputCard.tsx` - For text input
- `SentenceScrambleCard.tsx` - For sentence building
- `DescribeImageCard.tsx` - For description practice
- `StorytellingCard.tsx` - For narrative practice

**Integration pattern**:
```typescript
// In MiniLessonFlow.tsx
const renderLesson = (lesson: MiniLesson) => {
  switch (lesson.content.type) {
    case 'vocabulary':
      return <SingleVocabCard items={lesson.content.items} />;
    case 'flashcards':
      return <FlashcardCard cards={lesson.content.cards} />;
    // ... etc
  }
}
```

#### 5. Spaced Repetition System
**Location**: `/lib/spaced-repetition/` (existing)

**Integration**:
- Feed "Good" vs "Again" feedback to SM-2 algorithm
- Schedule flashcard reviews
- Track vocabulary mastery
- Update AI memory with retention data

**Data flow**:
```
User marks card "Good/Again"
  → Update lesson_progress
  → Update spaced repetition schedule
  → Update user_ai_memory (mastery rate)
  → Inform next section generation
```

#### 6. Points System
**Location**: `/lib/gamification/points.ts` (existing)

**Integration**:
- Award points for lesson completion
- Award points for calibration participation (not accuracy)
- Update weekly points total
- Trigger achievements

**Point values**:
- Vocabulary lesson: 10 pts
- Flashcard practice: 15 pts
- Writing practice: 20 pts
- Reading/Listening: 20 pts
- Conversation: 25 pts
- Calibration completion: 50 pts

---

## Development Roadmap

### Phase 1: Database Setup ✅
- [x] Define TypeScript types (`types/learning.ts`)
- [x] Define calibration types (`types/calibration.ts`)
- [ ] Create database schema SQL
- [ ] Deploy to Supabase
- [ ] Set up RLS policies
- [ ] Test with sample data

### Phase 2: Path Generation
- [ ] Implement Gemini prompt for initial path
- [ ] Create path generation function
- [ ] Integrate with onboarding
- [ ] Test with multiple user profiles
- [ ] Fallback for API failures

### Phase 3: Mini-Lesson System
- [ ] Create MiniLessonFlow component
- [ ] Integrate existing card components
- [ ] Implement lesson progression logic
- [ ] Add progress tracking
- [ ] Test each lesson type

### Phase 4: Calibrator
- [x] Build calibration UI components
- [ ] Implement calibration logic
- [ ] Create result analysis with Gemini
- [ ] Integrate calibrator banner in staircase
- [ ] Test calibration → section generation flow

### Phase 5: AI Memory
- [ ] Create AI memory management functions
- [ ] Implement update triggers
- [ ] Build observation logging
- [ ] Create prompt context from memory
- [ ] Test personalization impact

### Phase 6: Adaptive Learning
- [ ] Implement difficulty adjustment
- [ ] Create pace monitoring
- [ ] Build recommendation engine
- [ ] Test adaptation scenarios
- [ ] Fine-tune algorithms

### Phase 7: UI/UX Polish
- [ ] Staircase visual states
- [ ] Progress animations
- [ ] Calibration banner design
- [ ] Results presentation
- [ ] Empty states and loading

### Phase 8: Testing & Optimization
- [ ] End-to-end user flow testing
- [ ] Performance optimization
- [ ] Error handling
- [ ] Offline support
- [ ] Analytics integration

---

## Success Metrics

### User Engagement
- **Stair Completion Rate**: Target 70%+
- **Days to Complete Section**: Target 14-21 days
- **Calibration Participation**: Target 80%+
- **Lesson Replay Rate**: Track for popular content

### Learning Effectiveness
- **Vocabulary Mastery Rate**: Target 75%+ (words marked "Good")
- **Calibration Score Improvement**: Track score trends over time
- **Conversation Confidence**: Self-reported increase
- **Retention Rate**: Users returning after 7 days

### System Performance
- **Path Generation Time**: < 5 seconds
- **Lesson Load Time**: < 2 seconds
- **Calibration Completion Time**: 5-10 minutes average
- **AI Memory Update Latency**: < 500ms

### Business Metrics
- **Cost per User**: Target < $0.15/month (Gemini API)
- **User Retention**: 60%+ after 30 days
- **Path Completion Rate**: 40%+ complete first section
- **Upgrade Conversion**: Track premium features impact

---

## Troubleshooting

### Common Issues

#### Path Generation Fails
**Symptoms**: Error during onboarding completion
**Causes**:
- Gemini API timeout
- Invalid onboarding data
- Database connection issue

**Solutions**:
1. Implement retry logic (3 attempts)
2. Use fallback default path
3. Log error and alert user gracefully
4. Queue for background retry

#### Stair Unlocking Issues
**Symptoms**: User can't access next stair
**Causes**:
- Progress not marked complete
- Database sync issue
- Missing lesson completion

**Solutions**:
1. Check lesson_progress table for completion
2. Verify stair_progress calculations
3. Manual unlock via admin panel if needed
4. Implement "Force Unlock" debug option

#### Calibrator Not Appearing
**Symptoms**: Banner doesn't show after 5-7 stairs
**Causes**:
- Dismissed and not reset
- Section completion not detected
- Flag incorrectly set

**Solutions**:
1. Check calibration_required flag on section
2. Verify stair completion count
3. Check user preferences for dismissed state
4. Reset banner visibility flag

#### AI Memory Not Updating
**Symptoms**: Personalization not improving
**Causes**:
- Update function not called
- Database write failure
- Observations not being generated

**Solutions**:
1. Add logging to update triggers
2. Verify RLS policies allow updates
3. Check AI observation generation logic
4. Manually trigger update test

---

## Future Enhancements

### Short-term (1-3 months)
- **Learning Streaks**: Track consecutive days completing lessons
- **Stair Themes**: Visual themes for different stair types
- **Social Sharing**: Share stair completion with friends
- **Custom Vocabulary**: Let users add words to practice

### Medium-term (3-6 months)
- **Path Branching**: Multiple path options based on interests
- **Collaborative Stairs**: Practice with other learners
- **Audio Lessons**: Voice-only lesson mode
- **Offline Calibration**: Take calibration without internet

### Long-term (6-12 months)
- **Multi-language Paths**: Learn multiple languages concurrently
- **Expert Mode**: Fast-track for advanced learners
- **Custom Path Builder**: Create your own stair sequence
- **AR Integration**: Augmented reality vocabulary practice

---

## References

### Related Documentation
- `/docs/PHASE_1_ONBOARDING_AND_STAIRCASE.md` - Initial onboarding and staircase UI
- `/docs/STAIRCASE_DOCUMENTATION_INDEX.md` - Comprehensive staircase schema docs
- `/docs/CARD_SYSTEM_DOCUMENTATION.md` - Card component documentation
- `/docs/GEMINI_API_INTEGRATION.md` - AI integration guide
- `/docs/VOX_MASTER_FEATURES.md` - Complete feature inventory
- `/docs/VOX_PRIORITY_MATRIX.md` - Feature prioritization

### Key Files
- `/types/learning.ts` - Learning path type definitions
- `/types/calibration.ts` - Calibration type definitions
- `/components/calibration/` - Calibration UI components
- `/lib/ai/gemini.ts` - Gemini API client
- `/app/(tabs)/staircase.tsx` - Staircase screen

---

**Document Version**: 1.0.0
**Last Updated**: 2025-12-12
**Status**: Complete - Ready for Implementation
**Next Review**: After Phase 1 completion
