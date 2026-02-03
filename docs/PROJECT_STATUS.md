# Vox Language App - Project Status

**Last Updated**: 2025-01-02
**Current Phase**: Phase 1 ✅ Complete | AI Path Generation ✅ Complete | Voice AI MVP ✅ Complete | i18n Expansion ✅ Complete | Phase 3 🚧 In Progress
**Version**: 1.0.0

---

## 🏗️ Core Architecture: Scenario-Based Learning (Jan 2, 2025)

**Documents**:
- [SCENARIO_BASED_LEARNING_ARCHITECTURE.md](./SCENARIO_BASED_LEARNING_ARCHITECTURE.md) - Core philosophy
- [STAIRCASE_SCENARIO_MAPPING.md](./features/STAIRCASE_SCENARIO_MAPPING.md) - Complete system design

**Core Insight**: Fluency comes from scenarios. Every word, phrase, and question exists to prepare users for real-world situations.

### The Blended Learning Model

Users learn universal vocabulary WHILE specializing - not before.

```
EVERY STAIR INCLUDES BOTH:
├── 60% Universal: Top 2000 words, everyday situations, survival phrases
└── 40% Field-Specific: Goal-related vocabulary and scenarios

PROGRESSION BY TIER:
├── Steps 1-2: Core 100 words + basic field vocabulary
├── Steps 3-4: Essential 500 words + intermediate field vocabulary
├── Steps 5-6: Fluent 1000 words + advanced field vocabulary
└── Steps 7-8: Advanced 2000 words + specialized field vocabulary

OUTCOME: Handle BOTH everyday AND specialized situations from day one
```

### Vocabulary Tiers

| Tier | Words | Coverage | Steps |
|------|-------|----------|-------|
| Core | 1-100 | 50% | 1-2 |
| Essential | 101-500 | 75% | 3-4 |
| Fluent | 501-1000 | 85% | 5-6 |
| Advanced | 1001-2000 | 92% | 7-8 |
| Specialist | 2001+ | Domain | 9-12+ |

### The Three Pillars

| Pillar | Purpose | Key Elements |
|--------|---------|--------------|
| **1. Vocabulary Preparation** | Words you NEED for situations | Scenario bundles, street phrases, survival expressions |
| **2. Question Mastery** | Tools to navigate conversations | "Do you?", "Did you?", "Have you?" patterns + field-specific questions |
| **3. Real-World Practice** | Apply skills with partners | AI conversations (now) + Human partners (future) |

### Every Staircase Step Contains

```
┌─────────────────────────────────────────────────┐
│ VOCABULARY BLOCK                                 │
│ └─ Essential words + Street phrases             │
│ └─ Survival expressions ("I didn't catch that") │
├─────────────────────────────────────────────────┤
│ QUESTION MASTERY BLOCK                           │
│ └─ Question patterns for this step              │
│ └─ Field-specific questions (career/travel/etc) │
├─────────────────────────────────────────────────┤
│ PRACTICE BLOCK                                   │
│ └─ AI Conversation scenario                     │
│ └─ Reading/Writing exercises                    │
└─────────────────────────────────────────────────┘
```

### Alignment Rule

> All features must answer: "What scenario does this prepare the user for?"

### Future: Personalization Tasks

| Feature | Personalization Needed | Status |
|---------|----------------------|--------|
| **Voice Conversations** | Use user's current stair vocabulary, survival phrases, and question patterns | 🔜 Planned |
| **Flashcards** | Connect to scenario-specific vocabulary bundles | 🔜 Planned |
| **Reading Practice** | Match content to user's stair level and field | 🔜 Planned |

---

## 🎯 Strategic Decision: Day-One Premium Value (Dec 24, 2025)

**Expert Roundtable Result**: 4/4 consensus on "Premium Victory by Level with Honest Scope"

### Level-Gated Launch Strategy

| Level | Day One Experience | Status |
|-------|-------------------|--------|
| **A1** | 10-word showcase + "Full program coming" | ⚠️ To Build |
| **A2** | 10 words + 1 game + "Voice unlocks at B1" | ⚠️ To Build |
| **B1** | Voice scenario (simplified) + feedback | ✅ Ready |
| **B2+** | Full voice experience + accents | ✅ Ready |

### Implementation Timeline

| Week | Focus | Deliverable |
|------|-------|-------------|
| **1** | B1+ Launch | Voice AI + 5 scenarios + celebrations |
| **2** | Beginner Path | 20-word showcase + 2 games + victory |
| **3-4** | Depth | Flashcards + grammar + full A1-A2 path |

### Key Insight
> "Premium = immediate value matched to actual capability. Don't pretend we serve everyone equally when we don't."

Full roundtable: `Roundtables/2025-12-24-day-one-premium-value/` in Obsidian

---

## 🎯 Project Vision

Create a **scenario-based language learning app** where users:
- Prepare for **real-world situations** they'll actually face
- Learn vocabulary **connected to scenarios** (not isolated words)
- Master **question patterns** to navigate any conversation
- Practice with **AI and human partners** until confident
- Use **survival phrases** when conversations get difficult

### Core Philosophy
> "Fluency comes from scenarios. The words you need, the questions you ask, the phrases that save you—all connected to situations you'll actually face."

### The Learning Flow
```
Vocabulary → Questions → AI Practice → Human Practice → Real World
(Preparation)  (Tools)    (Safe Space)   (Authentic)     (Goal)
```

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

## ✅ Voice Conversation MVP (COMPLETE - Dec 19, 2025)

**Status**: ✅ Complete
**Completion Date**: 2025-12-19

### What We Built

#### 1️⃣ Gemini Live API Integration ✅
- WebSocket connection to Gemini Live API
- Audio recording and streaming (expo-av)
- Audio playback with WAV header generation
- Binary message handling (ArrayBuffer → UTF-8 → JSON)

#### 2️⃣ Voice & Accent System ✅
- 8 Gemini voices (Kore, Puck, Charon, Fenrir, Aoede, Leda, Orus, Zephyr)
- 9 regional accents via system prompt:
  - Spanish: Latin American (🇲🇽), Spain (🇪🇸)
  - French: France (🇫🇷), Canada (🇨🇦)
  - English: American (🇺🇸), British (🇬🇧), Australian (🇦🇺)
  - Portuguese: Brazil (🇧🇷), Portugal (🇵🇹)

#### 3️⃣ Phone-Call Style UI ✅
- `VoiceCallScreen` component with:
  - Large animated avatar (120px)
  - Pulsing/scaling animations based on state
  - Real-time transcription (last 4 messages)
  - Push-to-talk button (88px)
  - End call button
  - Session timer

#### 4️⃣ Post-Call Feedback Screen ✅
- `PostCallFeedbackScreen` component with:
  - Animated points display with counting animation
  - Conversation stats (duration, turns, words/turn)
  - AI-generated feedback on performance
  - Collapsible transcript viewer
  - Practice Again / Done buttons
  - Points calculation: 10pts/turn + bonuses

#### 5️⃣ Accent Selector UI ✅
- Dropdown selector in scenario selection
- Shows flag + accent name
- Only visible in "Live Mode"

### Key Files
- `lib/voice/geminiLive.ts` - Gemini Live API client
- `lib/voice/types.ts` - Voice/accent types and constants
- `hooks/useVoiceConversation.ts` - Voice conversation hook
- `components/cards/VoiceCallScreen.tsx` - Phone-call UI
- `components/cards/PostCallFeedbackScreen.tsx` - Feedback screen
- `app/voice-conversation.tsx` - Main screen with accent selector

### Points System
| Action | Points |
|--------|--------|
| Per conversation turn | 10 pts |
| 5+ turns bonus | +25 pts |
| 5+ words/turn bonus | +15 pts |
| 2+ minutes bonus | +20 pts |

### Documentation
- `docs/daily-reports/2025-12-19-voice-call-ui.md` - Full implementation details

---

## 🎯 NEW: Habit-Forming System & Voice Call Redesign (Jan 4, 2026)

**Status**: 📋 Planning
**Priority**: P1 (Critical for user retention and premium feel)

### 1. Habit-Forming Onboarding & Practice System

**Goal**: Get users addicted to good habits by helping them visualize their future commitment.

**Key Research Insight**: Users who set specific practice times are 3x more likely to maintain streaks.

#### Onboarding Enhancements

| Feature | Description | Status |
|---------|-------------|--------|
| **Specific Time Selection** | "What time will you practice?" (not just "how often") | 📋 Planned |
| **Duration Min/Max** | "10-20 minutes" lets users see achievable commitment | 📋 Planned |
| **Rest Day Selection** | Choose 1-2 rest days/week (sustainable habits) | 📋 Planned |
| **Visualization** | "In 30 days, you'll know 500 words" type projections | 📋 Planned |

#### Daily Practice System

| Feature | Description | Status |
|---------|-------------|--------|
| **Practice Reminders** | Push notification at user's chosen time | 📋 Planned |
| **Rest Day Indicator** | Visual calendar showing rest vs practice days | 📋 Planned |
| **Streak Protection** | Rest days don't break streaks | 📋 Planned |

### 2. Voice Call Screen Redesign (Apple-Style Phone Call UI)

**Goal**: Make the voice call experience feel premium, like a real phone call with a native speaker.

**Current Issues**:
- Particle/dots animation looks "beginner level"
- Button glow/shadow looks off
- No character identity (just abstract visuals)

#### Design Direction: Apple Phone Call Style

| Element | Current | New Design |
|---------|---------|------------|
| **Avatar Area** | Particle sphere animation | Character photo + name |
| **Character Identity** | Generic "AI Tutor" | Named characters (Maria, Carlos, etc.) |
| **Buttons** | Glow with odd shadows | Clean iOS-style buttons |
| **Background** | Dark gradient | Subtle blur or solid dark |

#### Character System

| Component | Technology | Status |
|-----------|------------|--------|
| **Avatar Images** | Gemini 3 Pro (image generation) | 🔬 Research |
| **Voice** | ElevenLabs (Spanish beta) | 📋 Planned |
| **Brain/Conversation** | Claude or Gemini | 📋 Planned |

**Characters Needed** (per language):
- 1 Male character
- 1 Female character
- Realistic faces with human imperfections (pores, texture, scars)

#### Avatar Generation Strategy (Gemini 3 Pro)

**Research Task**: Determine best approach for generating consistent, realistic character avatars.

**Requirements**:
- Hyper-realistic faces
- Human imperfections (pores, skin texture, minor scars)
- Consistent character across multiple expressions
- Diverse ethnicities per language (Spanish: Latin American, Spanish)

### 3. Motion Design Skill (Future)

**Insight**: "What would this look like if a million users would love it?"

**Inspiration**: Most addictive gaming phone apps - what animations/micro-interactions make them engaging?

**Areas to Enhance**:
- Lesson completion celebrations
- Points/XP animations
- Streak maintenance rewards
- Level-up transitions
- Button press feedback

---

## 🔧 Voice Conversation Flow Fixes (IN PROGRESS - Jan 2, 2026)

**Status**: 🚧 In Progress
**Priority**: P0 (Critical Bug Fixes)

### Issues Identified

| Priority | Issue | Root Cause | Status |
|----------|-------|------------|--------|
| **P0** | Conversation stops after ~3 exchanges | State machine race condition in `useVoiceConversation.ts` | 🚧 Fixing |
| **P1** | Users must press mute for AI to process | Missing Voice Activity Detection (no silence detection) | 📅 Next |
| **P2** | Generic error alerts instead of feedback screen | Error state not propagated to completion callback | 📅 Planned |

### P0: State Machine Race Condition

**Problem**: The `onTurnComplete` and `onPlaybackEnd` callbacks race, causing state to get stuck in 'playing' instead of returning to 'connected'. This prevents auto-record from triggering.

**Solution**: Coordinated dual-flag system with `turnCompletedRef` and `playbackPendingRef` to ensure state only transitions to 'connected' when both conditions are met.

**Files**:
- `hooks/useVoiceConversation.ts`

### P1: Voice Activity Detection (Silence Detection)

**Problem**: Recording starts automatically but only stops on mute press or 30s timeout. Users expect auto-stop when they finish speaking.

**Solution**: Add silence detection in `AudioRecorder` - detect 1.5s of silence (audio level < 8%) with minimum 0.5s speech duration.

**Files**:
- `lib/voice/audioRecorder.ts`
- `hooks/useVoiceConversation.ts`

### P2: Error Propagation

**Problem**: When conversation ends due to error, app shows generic `Alert.alert()` instead of designed `PostCallFeedbackScreen`.

**Solution**: Enhanced completion callback with `endReason: 'user_ended' | 'error' | 'timeout'` to distinguish error vs normal completion.

**Files**:
- `components/cards/VoiceCallScreen.tsx`
- `app/voice-conversation.tsx`

---

## 📝 Current Work (Updated 2025-12-19)

### ✅ Completed Sprint: Voice Conversation System (Phase 1 MVP)

**Status**: COMPLETE

#### Voice AI Implementation Tasks:
1. **Sprint 1: Core Infrastructure** ✅
   - [x] Audio Recording System (`lib/voice/audioRecorder.ts`)
   - [x] Audio Playback System (`lib/voice/audioPlayer.ts`)
   - [x] Gemini Live API Client (`lib/voice/geminiLive.ts`)
   - [x] Hybrid Conversation Manager (`lib/voice/hybridConversation.ts`)

2. **Sprint 2: React Hooks & UI** ✅
   - [x] Voice Conversation Hook (`hooks/useVoiceConversation.ts`)
   - [x] Push-to-Talk Button Component
   - [x] Real-time Transcription Display
   - [x] Voice Waveform Visualization
   - [x] VoiceCallScreen (phone-call style UI)
   - [x] PostCallFeedbackScreen

3. **Sprint 3: Scenarios & Polish** ✅
   - [x] Scenario System (cafe, directions, shopping, etc.)
   - [x] Character System (5+ characters with voices)
   - [x] Scenario Selection Screen
   - [x] Accent Selector (9 regional accents)
   - [x] Error Handling & Edge Cases

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
