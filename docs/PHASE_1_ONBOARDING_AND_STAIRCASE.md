# Phase 1: Personalized Onboarding & Staircase System ✅

**Date:** November 22, 2025
**Status:** Completed
**Gemini Integration:** ✅ Active

---

## Overview

This phase introduces a **personalized onboarding flow** that uses **Gemini AI** to generate custom learning staircases based on user goals, proficiency level, daily time commitment, and specific scenarios.

---

## What Was Built

### 1. Immersive Onboarding Flow (4 Screens)

#### Welcome Screen (`/app/(auth)/onboarding/index.tsx`)
- Beautiful immersive intro with gradient background
- Features overview (Personalized Learning, Immersive Practice, AI Feedback, Practice with Others)
- "Get Started" CTA with glow effect
- Skip option for returning users

#### Goal Selection (`/app/(auth)/onboarding/goal-selection.tsx`)
- **6 Learning Goals:**
  1. Job Interviews 💼
  2. Travel ✈️
  3. Business 📊
  4. Daily Conversation 💬
  5. Academic 📚
  6. Making Friends 👋

- Each goal has custom gradient and emoji
- Selected goal highlights with glow border
- Progress indicator (Step 1 of 4)

#### Level Assessment (`/app/(auth)/onboarding/level-assessment.tsx`)
- **5 Proficiency Levels:**
  1. Beginner 🌱
  2. Elementary 🌿
  3. Intermediate 🌳
  4. Upper Intermediate 🎯
  5. Advanced 🚀

- Gradients progress from green → teal → indigo → purple
- Helps Gemini personalize content difficulty

#### Time Commitment (`/app/(auth)/onboarding/time-commitment.tsx`)
- **4 Daily Time Options:**
  1. 10 minutes ⚡ (Quick daily practice)
  2. 20 minutes 🎯 (Recommended - Balanced learning)
  3. 30 minutes 🚀 (Intensive learning)
  4. 45+ minutes 🔥 (Full immersion)

- 20 minutes marked as "Recommended"
- Affects staircase pacing

#### Scenarios Selection (`/app/(auth)/onboarding/scenarios.tsx`)
- **Multi-select** specific scenarios based on chosen goal
- Example for "Job Interview" goal:
  - Self Introduction 👋
  - Discussing Experience 💼
  - Strengths & Weaknesses 💪
  - Salary Negotiation 💰
  - Asking Questions ❓

- Shows loading spinner while Gemini generates staircase
- "Finish & Create My Path" button triggers AI generation

---

### 2. Gemini Staircase Generator (`/lib/gemini/staircase-generator.ts`)

**Uses:** `gemini-2.0-flash-exp` model

#### Input (User Profile):
```typescript
{
  learning_goal: "job_interview",
  proficiency_level: "intermediate",
  daily_time_minutes: 20,
  scenarios: ["interview_introduction", "interview_experience"]
}
```

#### Gemini Prompt Strategy:
- Acts as expert language learning curriculum designer
- Generates 8-12 progressive stairs
- Each stair includes:
  - Title (specific to user's goal)
  - Emoji
  - Description
  - Difficulty level (progressive)
  - Estimated days (based on daily time)
  - Vocabulary count (25 → 50 → 75 → 100+)
  - Skills focus (listening, speaking, reading, writing)
  - Scenario tags (matches user selections)

#### Output (Personalized Staircase):
```typescript
{
  user_id: null,
  stairs: [
    {
      id: "stair_123",
      order: 1,
      title: "Professional Greetings",
      emoji: "👋",
      description: "Master formal introductions for job interviews",
      difficulty: "beginner",
      estimated_days: 2,
      vocabulary_count: 25,
      skills_focus: ["listening", "speaking"],
      scenario_tags: ["interview_introduction"]
    }
    // ... 7-11 more stairs
  ],
  total_stairs: 8,
  estimated_completion_days: 45,
  created_at: "2025-11-22T..."
}
```

#### Fallback System:
- If Gemini API fails, generates basic 3-stair fallback
- Ensures app never crashes during onboarding
- Logs error for debugging

---

### 3. Staircase Homepage (`/app/(tabs)/staircase.tsx`)

Based on the `homepage-stairs.jpg` reference sketch.

#### Header Section:
- **Language Selector** (left): 🇬🇧 English
- **Weekly Points** (right): ⚡ 1000 points
- **Streak Display**: 🔥 8 Day Streak
- **Title**: "Your Learning Path"

#### Medals Section (Latest Achievement):
- Shows **most recent medal** earned by user
- **3D-style medal icon** with gold gradient
- Medal types:
  - 🥇 First Stair Completed
  - 🔥 7 Day Streak
  - 📚 Vocabulary Master
- "NEW!" badge on recently unlocked medals
- "View All →" link to full medals gallery

#### Staircase (Vertical Scrolling):
Each stair card shows:
- **Stair number badge** (top right)
- **Large emoji** (48px)
- **Title** and **description**
- **Stats row**:
  - 📝 Vocabulary count
  - ⏱️ Estimated days
  - Status indicator

**3 Stair States:**

1. **Completed** ✅
   - Green gradient (#10B981 → #34D399)
   - "Completed" badge
   - Unlocked for review

2. **Current** 🎯
   - Purple/Indigo gradient (#6366F1 → #8B5CF6)
   - **Crown icon 👑** (user position)
   - Glowing border (3px)
   - Drop shadow with glow effect
   - "In Progress" badge

3. **Locked** 🔒
   - Gray/transparent gradient
   - Lock icon 🔒
   - 50% opacity
   - Not clickable

---

### 4. Onboarding State Management (`/hooks/useOnboarding.ts`)

Uses **Zustand** for global state:

```typescript
{
  learning_goal: string | null;
  proficiency_level: string | null;
  daily_time_minutes: number | null;
  scenarios: string[];
}
```

Functions:
- `updateOnboardingData()` - Update partial data
- `resetOnboardingData()` - Clear after completion

---

## Gemini Integration Details

### API Configuration:
- **Model:** `gemini-2.0-flash-exp`
- **API Key:** `EXPO_PUBLIC_GEMINI_API_KEY` (from .env)
- **Location:** `/lib/gemini/staircase-generator.ts`

### Why Gemini is Perfect for This:
1. **Personalization:** Generates unique staircases for each user
2. **Context-Aware:** Understands learning goals and scenarios
3. **Progressive Difficulty:** Creates natural learning progression
4. **Cost-Effective:** Flash model is fast and cheap
5. **Flexible Output:** Returns structured JSON

### Example Gemini Generations:

**User 1:** Job Interview (Intermediate, 20 min/day)
```
Stair 1: "Professional Greetings" (25 words, 2 days)
Stair 2: "Self Introduction" (35 words, 3 days)
Stair 3: "Discussing Experience" (45 words, 4 days)
...
```

**User 2:** Travel (Beginner, 10 min/day)
```
Stair 1: "Airport Check-in Basics" (20 words, 3 days)
Stair 2: "Asking for Directions" (30 words, 4 days)
Stair 3: "Ordering Food" (35 words, 5 days)
...
```

**User 3:** Business (Advanced, 45 min/day)
```
Stair 1: "Meeting Etiquette" (50 words, 1 day)
Stair 2: "Presentation Skills" (70 words, 2 days)
Stair 3: "Negotiation Tactics" (90 words, 2 days)
...
```

---

## Design System Consistency

All screens use the **immersive design system** from Phase 0:

### Colors:
- Background: Deep space blue-black (#0A0E1A)
- Primary Gradient: Indigo → Purple (#6366F1 → #8B5CF6)
- Secondary Gradient: Teal → Turquoise (#06D6A0 → #4ECDC4)
- Success Gradient: Green (#10B981 → #34D399)
- Gold Medal Gradient: Gold → Orange (#FFD700 → #FFA500)

### Animations:
- `FadeInDown` with spring physics
- Staggered delays (100-150ms between items)
- Smooth haptic feedback on selections

### Typography:
- Titles: 3xl, bold
- Subtitles: base, secondary color
- Labels: sm, semibold

---

## User Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. Welcome Screen                                          │
│     ↓ Tap "Get Started"                                     │
│                                                             │
│  2. Goal Selection (Choose 1)                              │
│     ↓ Select goal → Continue                                │
│                                                             │
│  3. Level Assessment (Choose 1)                            │
│     ↓ Select level → Continue                               │
│                                                             │
│  4. Time Commitment (Choose 1)                             │
│     ↓ Select time → Continue                                │
│                                                             │
│  5. Scenarios (Multi-select)                               │
│     ↓ Select scenarios → Finish                             │
│                                                             │
│  6. Gemini Generates Staircase (2-5 seconds)               │
│     ↓ "Generating your path..."                             │
│                                                             │
│  7. Navigate to Staircase Homepage                         │
│     ↓ See personalized learning path                        │
│                                                             │
│  8. Tap Current Stair → Start Lesson                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Files Created

### Onboarding Screens:
1. `/app/(auth)/onboarding/index.tsx` - Welcome screen
2. `/app/(auth)/onboarding/goal-selection.tsx` - Goal selection
3. `/app/(auth)/onboarding/level-assessment.tsx` - Level assessment
4. `/app/(auth)/onboarding/time-commitment.tsx` - Time commitment
5. `/app/(auth)/onboarding/scenarios.tsx` - Scenario selection + Gemini call

### Gemini Integration:
6. `/lib/gemini/staircase-generator.ts` - Gemini staircase generator

### Staircase UI:
7. `/app/(tabs)/staircase.tsx` - Staircase homepage with medals

### State Management:
8. `/hooks/useOnboarding.ts` - Zustand onboarding store

### Documentation:
9. `/docs/PHASE_1_ONBOARDING_AND_STAIRCASE.md` - This file

### Modified Files:
10. `/app/(tabs)/_layout.tsx` - Added "Learning Path" tab (staircase screen)

---

## Next Steps

### Phase 2: Database Schema & Data Persistence

**Files to Create:**
- `/lib/db/schema.sql` - Database schema for:
  - `user_profiles` (stores onboarding data)
  - `user_staircases` (stores Gemini-generated staircases)
  - `user_stair_progress` (tracks completion)
  - `user_medals` (achievement system)
- `/lib/db/staircases.ts` - Database CRUD operations
- `/lib/db/medals.ts` - Medal tracking logic

**Tasks:**
1. Save onboarding data to `user_profiles`
2. Save Gemini staircase to `user_staircases`
3. Fetch user's staircase on app launch
4. Track stair completion (completed/current/locked states)
5. Award medals on milestones

### Phase 3: Lesson Flow Integration

**Files to Create:**
- `/app/lesson/[stairId].tsx` - Main lesson screen
- `/lib/lesson/lesson-generator.ts` - Generate lesson from stair data
- Integration with 8 card components from Phase 0

**Tasks:**
1. When user taps current stair → Start lesson
2. Lesson uses vocabulary from stair
3. Lesson includes all 8 card types:
   - SingleVocabCard
   - ComparisonCard
   - ImageMultipleChoiceCard
   - AudioToImageCard
   - TextInputCard
   - SpeakingCard
3. Track lesson progress
4. Award points on completion
5. Unlock next stair

### Phase 4: Spaced Repetition Integration

You already have spaced repetition flashcards with **forgot/remembered/easy** buttons!

**Tasks:**
1. Merge vocabulary from staircase into flashcard system
2. Use existing SM-2 algorithm
3. Show due flashcards in daily review
4. Award points for reviews

---

## Testing Checklist

### Onboarding Flow:
- [ ] Welcome screen loads with animations
- [ ] Goal selection highlights on tap
- [ ] Level selection progresses to next screen
- [ ] Time commitment shows "Recommended" badge
- [ ] Scenarios allow multi-select
- [ ] "Finish" button disabled until at least 1 scenario selected
- [ ] Gemini generates staircase (check console logs)
- [ ] Loading spinner shows during generation
- [ ] Fallback works if Gemini fails

### Staircase Homepage:
- [ ] Weekly points display (1000)
- [ ] Streak display (8 days)
- [ ] Latest medal shows with gold gradient
- [ ] "NEW!" badge appears on recent medals
- [ ] Staircase scrolls vertically
- [ ] Completed stairs show green gradient
- [ ] Current stair shows crown icon and glow
- [ ] Locked stairs are semi-transparent
- [ ] Tapping locked stair does nothing
- [ ] Tapping current stair navigates to lesson (TODO)

### Navigation:
- [ ] "Learning Path" tab appears first
- [ ] Tab bar uses dark theme (#0A0E1A)
- [ ] Active tab highlighted in indigo (#6366F1)

---

## Gemini Usage Stats (Estimated)

**Per User Onboarding:**
- Prompt: ~400 tokens
- Response: ~800 tokens
- **Total: ~1200 tokens per staircase**

**Cost (gemini-2.0-flash-exp):**
- Input: $0.15 per 1M tokens
- Output: $0.60 per 1M tokens
- **Per user: ~$0.0006 (less than a cent!)**

**Monthly Estimates:**
- 1,000 new users: ~$0.60/month
- 10,000 new users: ~$6/month
- 100,000 new users: ~$60/month

**Incredibly cost-effective for personalization!** 🎉

---

## Known Limitations (To Fix Later)

1. **No database persistence yet** - Staircases generated but not saved
2. **Mock data** - Stairs and medals are hardcoded
3. **No lesson flow** - Tapping stair doesn't do anything yet
4. **No vocabulary generation** - Need to create actual word lists
5. **No medal awarding logic** - Medals are static for now

These will be addressed in **Phase 2** and **Phase 3**.

---

## Summary

✅ **Onboarding:** 4-screen immersive flow
✅ **Gemini Integration:** AI-powered personalized staircases
✅ **Staircase UI:** Vertical scrolling with medals and 3 states
✅ **Design System:** Consistent gradients, animations, haptics
✅ **Tab Navigation:** New "Learning Path" screen

**Ready to move to Phase 2: Database Schema & Persistence!** 🚀
