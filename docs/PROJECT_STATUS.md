# Vox Language App - Project Status

**Last Updated**: 2025-12-17
**Current Phase**: Phase 1 ✅ Complete | AI Path Generation ✅ Complete | Voice AI Planning ✅ Complete | i18n Expansion ✅ Complete | Phase 3 🚧 In Progress
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

## ✅ Phase 1: Authentication & Onboarding (COMPLETE)

**Status**: ✅ Complete
**Completion Date**: 2025-11-30
**Commit**: `eb96f08`
**Priority**: HIGH
**Goal**: Get users onboarded and into their first lesson within 5-10 minutes

### What We Built

#### 1️⃣ Authentication System ✅
- ✅ Login screen with email/password
- ✅ Signup screen with validation
- ✅ Supabase authentication integration
- ✅ useAuth hook with session management
- ✅ Beautiful animations with Reanimated

#### 2️⃣ 5-Step Onboarding Flow ✅
- ✅ **Step 1: Goal Selection** - 6 learning goals (Job Interview, Travel, Business, etc.)
- ✅ **Step 2: Level Assessment** - 5 proficiency levels (Beginner → Advanced)
- ✅ **Step 3: Time Commitment** - Daily practice duration (10-45+ minutes)
- ✅ **Step 4: Motivation** - Deep "why" questions for AI personalization
- ✅ **Step 5: Scenarios** - Multi-select specific scenarios based on goal

#### 3️⃣ Staircase System ✅
- ✅ Gemini AI generates personalized 8-12 step learning staircases
- ✅ Vertical scrolling staircase homepage with 3 states (Completed/Current/Locked)
- ✅ Database integration (7 Supabase tables with RLS)
- ✅ Medal system for achievements

#### 4️⃣ Lesson Flow ✅
- ✅ Card components integrated (Vocab, Multiple Choice, Speaking)
- ✅ Progress tracking during lessons
- ✅ Auto-completion and next step unlock
- ✅ "I can speak this" skip option on SpeakingCard

#### 5️⃣ UI Polish ✅
- ✅ Fixed Continue buttons at bottom of all screens
- ✅ Progress indicators showing 5 steps
- ✅ iOS safe areas (notch/Dynamic Island)
- ✅ Android system UI handling
- ✅ Consistent design system with gradients

### Key Files
- `/app/(auth)/onboarding/*.tsx` - 6 onboarding screens
- `/app/(tabs)/staircase.tsx` - Vertical staircase homepage
- `/app/lesson/[stepId].tsx` - Lesson flow with cards
- `/lib/api/staircases.ts` - 6 API functions
- `/lib/gemini/staircase-generator.ts` - AI integration
- `/hooks/useOnboarding.ts` - Zustand store

### Documentation
- `/docs/STAIRCASE_DOCUMENTATION_INDEX.md` - Complete docs index
- `/docs/HOW_TO_TEST_PHASE_1.md` - Testing guide
- `/docs/SESSION_HANDOFF_NOV_22.md` - Handoff notes

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

## 📋 Phase 3: Core Learning Mechanics (CURRENT FOCUS) 🚧

**Status**: 🚧 IN PROGRESS (Started 2025-11-20)
**Priority**: CRITICAL
**Dependencies**: None (Building in parallel with Phase 1)

**STRATEGIC DECISION**: Build core mechanics FIRST before completing onboarding. This gives us something concrete to test and build around.

### Build Order (Based on Priority)

#### 1. Flashcards (3-Card Cycle) - FOUNDATION 🚧 IN PROGRESS
- [ ] Database schema for flashcards (SQLite + Supabase)
- [ ] Sample vocabulary data (beginner level, multiple categories)
- [ ] **Learning Card Component**: Image + Text + Phonetics + Audio button
- [ ] **Listening Card Component**: Play audio → User types → Validate
- [ ] **Speaking Card Component**: Show word → User records → Basic feedback
- [ ] SM-2 spaced repetition algorithm implementation
- [ ] Quality rating UI (Forgot/Remembered/Easy)
- [ ] Flashcard session flow (cycle through cards)
- [ ] Works 100% offline
- [ ] Points tracking per review

#### 2. Games - REINFORCEMENT (NEXT)
- [ ] **Tap-to-Match Game**: Link images to words
- [ ] **Multiple Choice Game**: Hear word, select correct image
- [ ] Immediate feedback (visual + audio)
- [ ] Points awarded for attempts (not accuracy)
- [ ] Works offline with pre-downloaded content
- [ ] Game session tracking

#### 3. Lesson Flow Engine (AFTER GAMES)
- [ ] Time selector UI: [10 min] [20 min]
- [ ] Dynamic flow generator (mix flashcards + games based on time)
- [ ] Progress tracking during session
- [ ] Session summary at end (cards reviewed, games played, points earned)
- [ ] Save progress to local database
- [ ] Sync to Supabase when online

#### 4. Reading Practice - COMPREHENSION (FUTURE)
- [ ] **Teleprompter view** with highlighted vocabulary
- [ ] Click word → definition (offline)
- [ ] Double-click → phrase meaning
- [ ] Record audio while reading
- [ ] AI-generated stories (personalized)
- [ ] Pre-download stories for offline use

#### 5. Speaking/Recording - PRODUCTION (FUTURE)
- [ ] Record practice (expo-av)
- [ ] Playback review
- [ ] AI pronunciation feedback (when online)
- [ ] Save recordings (private by default)
- [ ] Option to publish to community

#### 6. AI Agent Conversation - INTERACTION (FUTURE)
- [ ] 2-3 minute chat at end of lesson
- [ ] Uses vocabulary just learned
- [ ] Gemini AI integration
- [ ] Voice or text input
- [ ] Gentle corrections
- [ ] Requires internet connection

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

## ✅ AI Path Generation System (COMPLETE - Dec 14, 2025)

**Status**: ✅ Complete
**Completion Date**: 2025-12-14

### What We Built

#### 1️⃣ Onboarding V2 Flow ✅
- 5-step onboarding with progress dots
- Language selection, motivation, proficiency, timeline, commitment
- Zustand store for onboarding state (useOnboardingV2)

#### 2️⃣ AI Path Generation ✅
- Gemini AI integration (`lib/services/pathGeneration.ts`)
- Personalized learning path generation based on onboarding data
- Fallback to template-based paths when AI fails
- 5 template categories: career, travel, relationship, academic, heritage

#### 3️⃣ Database Integration ✅
- `lib/db/learningPaths.ts` - Uses existing schema:
  - `user_staircases` table for learning paths
  - `staircase_steps` table for individual stairs
  - `user_stair_progress` table for status tracking
- Batch insert for stairs with progress records

#### 4️⃣ Home Screen Integration ✅
- `useLearningPath` hook fetches real stairs from database
- Falls back to mock data if no path exists
- Real-time status updates (locked/current/completed)

#### 5️⃣ AI Memory System ✅
- `lib/ai/userMemory.ts` - Personalized AI memory per user
- Stores strengths, weaknesses, learning patterns
- Generates memory summaries for AI prompts (like claude.md)

### Key Files
- `/lib/services/pathGeneration.ts` - Main orchestration
- `/lib/db/learningPaths.ts` - Database operations
- `/hooks/useLearningPath.ts` - React hook for home screen
- `/lib/ai/userMemory.ts` - AI memory system
- `/app/(auth)/onboarding-v2/ready.tsx` - Triggers path creation

### Architecture Flow
```
Onboarding V2 → createPersonalizedPath() → Gemini AI/Template
                                              ↓
                                    user_staircases (DB)
                                              ↓
                                    staircase_steps (DB)
                                              ↓
                                    user_stair_progress (DB)
                                              ↓
                                    Home Screen (useLearningPath)
```

---

## ✅ Voice Conversation System Planning (COMPLETE - Dec 16, 2025)

**Status**: ✅ Planning Complete | Ready for Implementation
**Completion Date**: 2025-12-16
**Priority Score**: 9.5/10 (Highest P1 feature)

### What We Planned

#### 1️⃣ Comprehensive Research ✅
- Evaluated 10+ voice AI solutions (Gemini Live, ElevenLabs, open-source)
- User feedback analysis from Reddit, GitHub, production deployments
- Cost analysis at scale (free tier → enterprise)
- React Native / Expo compatibility assessment
- Full documentation: `docs/research/VOICE_AI_OPTIONS_2025.md`

#### 2️⃣ Three-Phase Migration Strategy ✅

| Phase | Solution | Purpose | Cost |
|-------|----------|---------|------|
| **Phase 1** | Gemini Live API | MVP Validation | Free tier |
| **Phase 2** | ElevenLabs + Gemini Flash | Production Quality | $99-1,320/mo |
| **Phase 3** | Self-hosted Chatterbox | Scale Optimization | Infrastructure |

#### 3️⃣ Technical Specification ✅
- Full architecture diagrams for all 3 phases
- Database schema for conversations
- Component hierarchy (VoiceConversation, VoiceButton, etc.)
- Hook design (useVoiceConversation)
- Scenario system for roleplay/stories
- Character voice system

#### 4️⃣ Implementation Plan ✅
- 17 tasks broken into 3 sprints
- Estimated effort: 14.5 days
- Clear acceptance criteria per task
- Testing requirements defined

### Key Decision: Why This Approach

1. **User Demand**: #1 requested feature (75% of feature discussions)
2. **Competitive Gap**: No app does judgment-free AI conversations well
3. **Technical Fit**: Gemini already integrated, free tier for validation
4. **Risk Mitigation**: Graduate from free → paid → self-hosted as scale demands

### Key Files
- `/docs/research/VOICE_AI_OPTIONS_2025.md` - Full research (600+ lines)
- `/docs/features/VOICE_CONVERSATION_SYSTEM.md` - Technical spec
- `/docs/features/VOICE_CONVERSATION_IMPLEMENTATION_PLAN.md` - Sprint plan

### Use Cases Supported
1. **Character Conversations**: Voice chats with AI characters in stories
2. **Scenario Roleplay**: Practice real situations (cafe, directions, interview)
3. **Multi-Character Dialogues**: Listen to distinct voices in conversations

---

## ✅ i18n Language Expansion (COMPLETE - Dec 17, 2025)

**Status**: ✅ Complete
**Completion Date**: 2025-12-17
**Commit**: `3199ad8`

### What We Built

#### 1️⃣ New Language Translations ✅
- **French (fr)**: 7 translation files (common, onboarding, home, settings, practice, errors, rewards)
- **Portuguese (pt)**: 7 translation files (Brazilian Portuguese)
- **Arabic (ar)**: 7 translation files (RTL-ready)

#### 2️⃣ i18n Infrastructure ✅
- `i18n/index.ts` - Main config with all 5 language resources
- `i18n/types.ts` - Type definitions + LANGUAGES_WITH_TRANSLATIONS
- `i18n/hooks/useLanguage.ts` - Language switching hook
- `i18n/hooks/useRTL.ts` - RTL layout support
- `i18n/utils/rtl.ts` - RTL utilities for Arabic/Hebrew
- `lib/storage/languageStorage.ts` - Persist language preferences

#### 3️⃣ Features ✅
- Auto-switch app language when user selects native language in onboarding
- Language picker in Profile tab with all 5 languages
- Full RTL support for Arabic

### Languages Now Supported
| Code | Language | RTL | Status |
|------|----------|-----|--------|
| en | English | No | ✅ Complete |
| es | Spanish | No | ✅ Complete |
| fr | French | No | ✅ Complete |
| pt | Portuguese | No | ✅ Complete |
| ar | Arabic | Yes | ✅ Complete |

---

## 📝 Current Work (Updated 2025-12-17)

### Active Sprint: Voice Conversation System (Phase 1 MVP)

**Current Focus**: Implementing Gemini Live API integration for voice conversations

#### Voice AI Implementation Tasks:
1. **Sprint 1: Core Infrastructure** (Days 1-4)
   - [ ] Audio Recording System (`lib/voice/audioRecorder.ts`)
   - [ ] Audio Playback System (`lib/voice/audioPlayer.ts`)
   - [ ] Gemini Live API Client (`lib/voice/geminiLive.ts`)
   - [ ] Conversation Manager (`lib/voice/conversationManager.ts`)

2. **Sprint 2: React Hooks & UI** (Days 5-8)
   - [ ] Voice Conversation Hook (`hooks/useVoiceConversation.ts`)
   - [ ] Voice Button Component
   - [ ] Conversation Bubble Component
   - [ ] Voice Waveform Visualization
   - [ ] Main Voice Conversation Screen

3. **Sprint 3: Scenarios & Polish** (Days 9-13)
   - [ ] Scenario System (greeting, cafe, directions, shopping)
   - [ ] Character System (4+ characters with voices)
   - [ ] Scenario Selection Screen
   - [ ] Conversation Results Screen
   - [ ] Error Handling & Edge Cases
   - [ ] Analytics & Testing

### Parallel Track: Core Learning Mechanics

**Secondary Focus**: Building Flashcard System (Phase 3.1)

#### Task Breakdown:
1. **Database Layer**
   - Create flashcard schema (SQLite + Supabase)
   - Implement spaced repetition data model
   - Add sample vocabulary (50+ words, multiple categories)

2. **Flashcard Components**
   - Learning Card UI (front: image, back: word + phonetics + audio)
   - Listening Card UI (audio player + text input + validation)
   - Speaking Card UI (word display + record button + playback)

3. **SM-2 Algorithm**
   - Implement spaced repetition calculations
   - Quality rating system (Forgot/Remembered/Easy)
   - Next review date calculations
   - All works offline

4. **Session Flow**
   - Flashcard review session screen
   - Card cycling logic (3-card cycle per word)
   - Progress indicator
   - Points tracking
   - Session summary

#### Next After Flashcards:
5. **Games** (Tap-to-Match + Multiple Choice)
6. **Lesson Flow Engine** (combine flashcards + games)
7. **Complete Onboarding** (Welcome → Language → Interests → First Lesson)

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
