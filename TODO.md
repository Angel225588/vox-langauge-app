# Vox Language App - TODO List

**Last Updated**: 2025-11-20
**Current Sprint**: Core Learning Mechanics (Flashcard System)

---

## 🎯 Current Priority: Build Core Learning Mechanics

### Strategic Decision (2025-11-20)
We've decided to build the **core learning mechanics FIRST** (flashcards + games) before completing the full onboarding flow. This approach:
- Gives us something concrete to test and iterate on
- Allows us to build onboarding around working features
- Provides immediate value when users complete simplified onboarding
- Reduces risk of building onboarding for features that don't exist yet

---

## 🚧 Active Tasks - Flashcard System

### Phase 3.1: Flashcard System (IN PROGRESS)

#### 1. Database Layer
- [ ] Create flashcard schema in SQLite
- [ ] Create corresponding Supabase tables
- [ ] Add spaced repetition fields (ease_factor, interval, repetitions, next_review)
- [ ] Create user_flashcard_progress table
- [ ] Add sample vocabulary data (50+ words):
  - Food & Dining (15 words)
  - Travel Essentials (15 words)
  - Common Verbs (10 words)
  - Everyday Objects (10 words)

#### 2. SM-2 Spaced Repetition Algorithm
- [ ] Create `/lib/spaced-repetition/sm2.ts` with algorithm
- [ ] Implement quality rating calculation (1-5 scale)
- [ ] Calculate next review date based on quality
- [ ] Calculate new ease factor
- [ ] Calculate new interval
- [ ] Export functions for use in flashcard components

#### 3. Flashcard Components
- [ ] Create `/components/flashcards/LearningCard.tsx`
  - Front: Image display
  - Back: Word + phonetics + audio button
  - Flip animation with Reanimated
- [ ] Create `/components/flashcards/ListeningCard.tsx`
  - Audio player component
  - Text input field
  - Validation logic
  - Immediate feedback (correct/incorrect)
- [ ] Create `/components/flashcards/SpeakingCard.tsx`
  - Word display
  - Record button (expo-av)
  - Playback button
  - Basic visual feedback

#### 4. Flashcard Session Screen
- [ ] Create `/app/flashcard/[sessionId].tsx`
- [ ] Implement 3-card cycle logic per word
- [ ] Add progress indicator (X of Y cards)
- [ ] Add quality rating buttons (Forgot/Remembered/Easy)
- [ ] Calculate and award points per review (10 pts each)
- [ ] Show session summary at end
- [ ] Save progress to local database
- [ ] Queue sync to Supabase (when online)

#### 5. Hooks & Utilities
- [ ] Create `/hooks/useFlashcard.ts`
  - Fetch flashcards due for review
  - Submit review quality
  - Calculate next review date
  - Track session progress
- [ ] Create `/hooks/useSpacedRepetition.ts`
  - Wrapper around SM-2 algorithm
  - Integrate with local database
- [ ] Create `/lib/db/flashcards.ts`
  - Database queries for flashcards
  - Offline-first data access
  - Sync utilities

---

## 📋 Next Up - After Flashcards Complete

### Phase 3.2: Games (NEXT)
- [ ] Tap-to-Match game component
- [ ] Multiple Choice game component
- [ ] Game session screen
- [ ] Points system integration
- [ ] Offline support

### Phase 3.3: Lesson Flow Engine
- [ ] Time selector UI (10 min / 20 min)
- [ ] Dynamic flow generator (mix flashcards + games)
- [ ] Lesson session screen
- [ ] Progress tracking
- [ ] Session summary with total points

### Phase 1 (Completion): Simplified Onboarding
- [ ] Welcome screen
- [ ] Language selection screen
- [ ] Interests selection screen
- [ ] First lesson launch (using the mechanics we just built!)

---

## ✅ Completed Tasks

### Phase 0: Foundation
- ✅ Project initialization (Expo + TypeScript)
- ✅ Expo Router setup
- ✅ NativeWind configuration
- ✅ Supabase integration
- ✅ SQLite setup
- ✅ Project structure
- ✅ Documentation (5 files)

### Phase 1: Authentication (Partial)
- ✅ Login screen with animations
- ✅ Signup screen with validation
- ✅ useAuth hook with Supabase
- ✅ Session management
- ✅ Password reset functionality
- ✅ Error handling and loading states

---

## 🔮 Backlog (Future Phases)

### Phase 2: Home Screen & Categories
- [ ] Dashboard with streak and points
- [ ] Category browsing interface
- [ ] "Continue where you left off" section
- [ ] Quick practice shortcuts

### Phase 4: Reading Practice
- [ ] Teleprompter view
- [ ] AI-generated stories
- [ ] Vocabulary highlighting

### Phase 5: Community Features
- [ ] Public recordings
- [ ] Leaderboard
- [ ] Feedback system

---

## 📝 Notes & Decisions

### Key Decisions Log

**2025-11-20**:
- ✅ Build core mechanics (flashcards + games) BEFORE completing onboarding
- ✅ Skip formal level assessment - start users at beginner, adjust based on usage
- ✅ Simplified onboarding: Welcome → Language → Interests → First Lesson
- ✅ Focus on value delivery (working features) over perfect user flow

**2025-11-19**:
- ✅ Completed authentication screens
- ✅ Decided to use offline-first architecture (SQLite primary, Supabase backup)
- ✅ Chose SM-2 algorithm for spaced repetition

---

## 🎯 Success Criteria for Current Sprint

Flashcard system is complete when:
- [ ] User can review 10 flashcards in a session
- [ ] All 3 card types work (Learning, Listening, Speaking)
- [ ] SM-2 algorithm correctly schedules next reviews
- [ ] Points are tracked and displayed
- [ ] Everything works offline
- [ ] Session summary shows stats
- [ ] Data syncs to Supabase when online

---

**Owner**: Angel Polanco
**Assistant**: Claude Code
**Next Review**: After flashcard system completion
