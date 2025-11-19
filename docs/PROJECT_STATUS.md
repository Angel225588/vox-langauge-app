# Vox Language App - Project Status

**Last Updated**: 2025-11-19
**Current Phase**: Phase 0 ✅ Complete | Phase 1 🚧 Ready to Start
**Version**: 1.0.0

---

## 🎯 Project Vision

Create a **self-directed language learning app** where users:
- Choose topics they care about (categories-first approach)
- Learn through **immediate practice** (not passive studying)
- Build confidence through **trials, not perfection**
- See **results from day one**

### Core Philosophy
> "Jump in, practice immediately, learn what you need, when you need it"

---

## ✅ Phase 0: Foundation (COMPLETE)

**Status**: ✅ All tasks complete
**Commit**: `6d61da0`
**Completion Date**: 2025-11-19

### What We Built
- ✅ Expo React Native + TypeScript project
- ✅ Expo Router (file-based navigation)
- ✅ NativeWind (Tailwind CSS) styling
- ✅ Supabase + SQLite (offline-first database)
- ✅ Complete project structure (app/, components/, lib/, docs/)
- ✅ Comprehensive documentation (5 files, 78KB)
- ✅ Environment setup (.env configured)
- ✅ Git repository initialized

### Documentation Created
1. **claude.md** (16KB) - Main project reference
2. **database-schema.sql** (14KB) - Complete Supabase schema
3. **user-journey.md** (18KB) - User flows
4. **offline-architecture.md** (17KB) - Offline strategy
5. **future-features.md** (13KB) - Future roadmap

---

## 🚧 Phase 1: Authentication & Onboarding (IN PROGRESS)

**Status**: 🎯 Ready to Start
**Priority**: HIGH
**Goal**: Get users onboarded and into their first lesson within 5-10 minutes

### Screens to Build (In Order)

#### 1️⃣ Login Screen
- [ ] Email/password form
- [ ] Supabase authentication
- [ ] "Forgot password" link
- [ ] "Sign up" navigation
- [ ] Loading states & error handling

#### 2️⃣ Signup Screen
- [ ] Email/password registration
- [ ] Password confirmation
- [ ] Email validation
- [ ] Terms acceptance (optional)
- [ ] Auto-login after signup

#### 3️⃣ Onboarding Flow

**Step 1: Welcome**
- [ ] Welcome screen with app value proposition
- [ ] "Get Started" button
- [ ] Skip option (save progress to continue later)

**Step 2: Language Selection**
- [ ] Choose target language (English/French/Spanish)
- [ ] Native language selection (for translations)
- [ ] Visual, appealing UI

**Step 3: Level Assessment** (5-10 minutes max)
- [ ] Hybrid approach (B + C):
  - Quick visual test (10-15 images: "Select words you know")
  - Audio test (3-5 words: "Type what you hear")
  - Speaking test (1-2 sentences: "Repeat after me")
- [ ] AI calculates level (beginner/intermediate/advanced)
- [ ] Show progress during assessment
- [ ] Save results to profile

**Step 4: Interests & Context Selection**
- [ ] "What topics interest you?" (travel, food, business, sports, movies, etc.)
- [ ] "What's your goal?" (casual conversation, job interviews, travel, etc.)
- [ ] "What's your context?" (work, hobbies, daily life)
- [ ] Multi-select UI with visual icons
- [ ] These determine personalized content (phrasal verbs, expressions, vocabulary)

**Step 5: Pre-Download & Processing**
- [ ] "Preparing your first lesson..." loading screen
- [ ] Download first 5 lessons + media (background)
- [ ] AI generates first personalized story
- [ ] Initialize local database
- [ ] Create user profile in Supabase

#### 4️⃣ First Lesson Launch
- [ ] **Option A Implementation**: Jump straight into 10-minute lesson
- [ ] Show quick tutorial overlay (optional skip)
- [ ] Launch lesson flow immediately
- [ ] Track as "onboarding lesson" (special handling)

### Key Decisions Made

✅ **First Experience**: Users start learning immediately (Option A)
✅ **Assessment**: Thorough but fast (5-10 min, hybrid approach)
✅ **Gamification**: Points shown after first lesson completion
✅ **Main Path**: Categories-first, self-directed learning

---

## 📋 Phase 2: Home Screen & Category System (NEXT)

**Status**: 📅 Planned
**Priority**: HIGH
**Dependencies**: Phase 1 complete

### Goals
1. Build category-browsing interface
2. Show personalized recommendations
3. Display progress & stats (after first lesson)

### Screens to Build

#### Home/Dashboard Screen
- [ ] Browse categories (main focus)
- [ ] Personalized recommendations
- [ ] "Continue where you left off" section
- [ ] Streak counter (after 1st lesson)
- [ ] Total points (after 1st lesson)
- [ ] Quick access to exercises

#### Category Detail Screen
- [ ] Show all content in category (Verbs, Objects, Expressions, etc.)
- [ ] Filter by difficulty
- [ ] Track progress per category
- [ ] Launch lessons from category

---

## 📋 Phase 3: Lesson Flow Engine (CORE FEATURE)

**Status**: 📅 Planned
**Priority**: CRITICAL
**Dependencies**: Phase 1 & 2 complete

### Build Order (Based on Priority)

#### 1. Flashcards (3-Card Cycle) - FOUNDATION
- [ ] **Learning Card**: Image + Text + Phonetics + Audio
- [ ] **Listening Card**: Play audio → User types → Validate
- [ ] **Speaking Card**: Show word → User records → AI feedback
- [ ] SM-2 spaced repetition algorithm
- [ ] Quality rating (Forgot/Remembered/Easy)
- [ ] Works 100% offline

#### 2. Games - REINFORCEMENT
- [ ] **Tap-to-Match**: Link images to words
- [ ] **Multiple Choice**: Hear word, select correct image
- [ ] Immediate feedback (visual + audio)
- [ ] Points awarded for attempts
- [ ] Works offline with pre-downloaded content

#### 3. Reading Practice - COMPREHENSION
- [ ] **Teleprompter view** with highlighted vocabulary
- [ ] Click word → definition (offline)
- [ ] Double-click → phrase meaning
- [ ] Record audio while reading
- [ ] AI-generated stories (personalized)
- [ ] Pre-download stories for offline use

#### 4. Speaking/Recording - PRODUCTION
- [ ] Record practice (expo-av)
- [ ] Playback review
- [ ] AI pronunciation feedback (when online)
- [ ] Save recordings (private by default)
- [ ] Option to publish to community

#### 5. AI Agent Conversation - INTERACTION
- [ ] 2-3 minute chat at end of lesson
- [ ] Uses vocabulary just learned
- [ ] Gemini AI integration
- [ ] Voice or text input
- [ ] Gentle corrections
- [ ] Requires internet connection

### Lesson Flow Builder
- [ ] Time selector: [10 min] [20 min]
- [ ] Dynamic flow generator based on time
- [ ] Adaptive content based on previous lesson feedback
- [ ] Progress tracking
- [ ] Session summary at end

---

## 📋 Phase 4: Exercises Area (Standalone Practice)

**Status**: 📅 Planned
**Priority**: MEDIUM

- [ ] Dedicated tab for games/exercises
- [ ] Play anytime (not part of lesson flow)
- [ ] Browse by type or category
- [ ] Track high scores
- [ ] Build confidence after lessons

---

## 📋 Phase 5: Community Features

**Status**: 📅 Planned
**Priority**: MEDIUM
**Dependencies**: Recording feature from Phase 3

- [ ] Browse public recordings
- [ ] Leave feedback on recordings
- [ ] Leaderboard (ranked by practice attempts)
- [ ] Like/comment system

---

## 🎯 Current Priorities (Value-First Order)

### Must Have for MVP (Phases 1-3)
1. **Onboarding** → Get users in fast (5-10 min)
2. **Category browsing** → Self-directed learning
3. **Flashcards** → Core learning mechanic
4. **Games** → Immediate practice
5. **Lesson flow** → Complete learning cycle

### Nice to Have (Phase 4-5)
6. Reading practice with teleprompter
7. Speaking/recording features
8. AI agent conversation
9. Community features
10. Advanced exercises

### Future (Documented)
- Video/audio practice sessions (Livekit)
- Podcasting & user-generated content
- "Better to Say" vocabulary game
- Advanced adaptive learning

---

## 📊 Key Metrics to Track

### User Engagement
- [ ] Onboarding completion rate (target: >80%)
- [ ] First lesson completion (target: >70%)
- [ ] Day 2 retention (target: >50%)
- [ ] Day 7 retention (target: >40%)

### Learning Effectiveness
- [ ] Average flashcards reviewed per session
- [ ] Practice time per day
- [ ] Streak length
- [ ] Category completion rate

### Technical Performance
- [ ] App load time (target: <2s)
- [ ] Lesson load time (target: <1s offline)
- [ ] Sync success rate (target: >95%)
- [ ] Crash-free sessions (target: >99%)

---

## 🔧 Technical Decisions Log

### Database Strategy
- **Primary**: SQLite (local, offline-first)
- **Backup/Sync**: Supabase (when online)
- **Conflict Resolution**: Last-write-wins

### Lesson Adaptation
- Each lesson provides feedback to influence next lesson
- AI adjusts difficulty and content based on:
  - Words user struggled with
  - Time taken on exercises
  - User's explicit preferences
  - Success rate on games

### Offline Support
**Always Offline:**
- Flashcard reviews
- Games with pre-downloaded content
- Progress tracking (syncs later)
- Reading practice (if stories pre-downloaded)
- Audio recording (uploads later)

**Requires Online:**
- AI agent conversation
- New lesson generation
- Leaderboard
- Community features

---

## 📝 Next 3 Immediate Tasks

1. **Build Login Screen**
   - Supabase auth integration
   - Form validation
   - Error handling
   - Navigation to signup/home

2. **Build Signup Screen**
   - User registration
   - Email validation
   - Auto-login after signup

3. **Build Onboarding Flow**
   - Welcome screen
   - Language selection
   - Level assessment (5-10 min)
   - Interests/context selection
   - Launch first lesson

---

## 🎨 Design Principles

1. **Simple & Clear**: No clutter, focus on current task
2. **Immediate Feedback**: Visual + audio confirmation for all actions
3. **Progress Visible**: Always show where user is in flow
4. **Forgiving**: Easy to go back, change answers, skip
5. **Motivating**: Celebrate small wins, encourage trials

---

## 🔄 Update Frequency

This document is updated:
- ✅ At the end of each phase
- ✅ When priorities change
- ✅ When new decisions are made
- ✅ Weekly during active development

---

**Last Updated By**: Claude Code
**Next Review**: Start of Phase 2
