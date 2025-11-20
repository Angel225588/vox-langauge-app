# Vox Language App - Main Project Reference

## Vision

Vox Language is a mobile language learning application that creates a **safe space for learners to practice through trials, not perfection**. We reward practice attempts and effort rather than accuracy, fostering a supportive community where making mistakes is part of the learning process.

## Core Problems We're Solving

1. **Lack of Quick Communication Skills**: Users want to communicate quickly and effectively, not just "learn" in the traditional sense
2. **No Immediate Results**: Learners quit fast if they don't see progress from day one
3. **Fear of Making Mistakes**: Many learners are paralyzed by fear when practicing with others
4. **Limited Access to Practice Partners**: Lack of serious, patient people to practice with
5. **Poor Offline Support**: Internet connectivity issues prevent consistent learning

## Core Principles

- **Reward effort over perfection** - Points for every attempt, not just correct answers
- **Offline-first architecture** - Core features work without internet
- **Personalized AI-generated content** - Tailored to each user's interests and level
- **Community-driven improvement** - Safe environment for peer feedback
- **Day-one results** - Users see progress immediately
- **Gamification without pressure** - Leaderboard ranks by practice attempts, not accuracy

## Tech Stack

### Frontend
- **React Native** (via Expo SDK 54+)
- **Expo Router** - File-based routing and navigation
- **TypeScript** - Type safety throughout the app
- **Tamagui** - High-performance UI components with optimizing compiler (CHOSEN for speed)
- **NativeWind** - Tailwind CSS for React Native (utility styling, works alongside Tamagui)
- **React Native Reanimated 3** - Smooth 60fps gesture-based animations
- **Lottie** (lottie-react-native) - Lightweight animated graphics and loading screens
- **React Native Gesture Handler** - Touch interactions

**Note**: We chose **Tamagui over Gluestack UI** for significantly better performance benchmarks. Tamagui's optimizing compiler provides substantial speed gains for our animation-heavy language learning interface.

### Backend & Database
- **Supabase** - All-in-one backend solution
  - PostgreSQL database
  - Authentication (email, OAuth)
  - Storage (audio files, images)
  - Real-time subscriptions (leaderboard updates)
  - Row-level security
- **SQLite** (expo-sqlite) - Local offline database for structured data (flashcards, lessons, progress)
- **React Native MMKV** - Ultra-fast key-value storage (30x faster than AsyncStorage) for user prefs and session data
- **React Native Encrypted Storage** - Secure storage for sensitive data (tokens, credentials)
- **Realm by MongoDB** (alternative) - Complex offline-first architecture with automatic syncing (future consideration)

### State Management
- **Zustand** - Lightweight global state
- **React Query** (@tanstack/react-query) - Data fetching with offline support

### Audio & Media
- **expo-av** - Audio recording and playback
- **expo-speech** - Text-to-speech
- **expo-file-system** - Media file management and downloads

### AI Integration
- **Google Gemini AI** (@google/generative-ai) - Comprehensive AI features
  - **Conversational AI Agent**: Chat-based learning assistant with context-aware responses
  - **Content Generation**: Personalized stories, adaptive difficulty, sentence examples
  - **Speech & Pronunciation**: AI-powered pronunciation feedback and accent coaching
  - **Interactive Games**: AI-generated questions and adaptive learning paths
  - **Engagement Features**: Daily prompts, personalized encouragement, streak motivation
  - See `/docs/GEMINI_API_INTEGRATION.md` for comprehensive AI feature roadmap

### Offline Support
- **expo-network** (NetInfo) - Network status detection with smart connectivity monitoring
- **expo-background-fetch** - Download lessons and sync progress in background when online
- **React Query persistence** - Offline-first data layer with automatic cache hydration

## Project Architecture

### Folder Structure

```
vox-language-app/
├── app/                          # Expo Router screens
│   ├── (auth)/                   # Authentication flow
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── onboarding/
│   │       ├── welcome.tsx
│   │       ├── level-assessment.tsx
│   │       └── interests.tsx
│   ├── (tabs)/                   # Main app tabs
│   │   ├── _layout.tsx
│   │   ├── home.tsx              # Dashboard with streak, points, next lesson
│   │   ├── categories.tsx        # Browse categories (verbs, food, etc.)
│   │   ├── practice.tsx          # Games and exercises
│   │   ├── community.tsx         # Public recordings & feedback
│   │   └── profile.tsx
│   ├── flashcard/[id].tsx        # Flashcard review session
│   ├── reading/[storyId].tsx     # Reading practice with teleprompter
│   └── _layout.tsx
│
├── components/
│   ├── flashcards/               # Flashcard components
│   │   ├── FlashcardFront.tsx
│   │   ├── FlashcardBack.tsx
│   │   ├── ListeningCard.tsx
│   │   └── SpeakingCard.tsx
│   ├── games/                    # Game components
│   │   ├── TapToMatch.tsx
│   │   └── MultipleChoice.tsx
│   ├── ui/                       # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   └── shared/                   # Shared components
│       ├── AudioRecorder.tsx
│       └── StreakDisplay.tsx
│
├── lib/
│   ├── db/
│   │   ├── supabase.ts           # Supabase client & types
│   │   └── sqlite.ts             # Local database & offline functions
│   ├── offline/
│   │   ├── preload.ts            # Download lessons in advance
│   │   ├── sync.ts               # Sync local changes when online
│   │   └── network.ts            # Network detection utilities
│   ├── api/
│   │   └── gemini.ts             # AI content generation
│   └── spaced-repetition/
│       └── sm2.ts                # SM-2 algorithm implementation
│
├── hooks/
│   ├── useAuth.ts                # Authentication hook
│   ├── useFlashcard.ts           # Flashcard review logic
│   ├── useSpacedRepetition.ts    # Spaced repetition hook
│   ├── useStreak.ts              # Streak tracking
│   └── useOffline.ts             # Offline status and sync
│
├── constants/
│   ├── categories.ts             # Learning categories
│   ├── levels.ts                 # Language levels (beginner, intermediate, advanced)
│   └── theme.ts                  # Colors and typography
│
├── types/
│   ├── flashcard.ts
│   ├── lesson.ts
│   └── user.ts
│
└── docs/                         # Documentation
    ├── claude.md                 # This file
    ├── database-schema.sql       # Supabase schema
    ├── user-journey.md           # User flows
    ├── offline-architecture.md   # Offline strategy
    └── future-features.md        # Roadmap
```

## Development Phases

### Phase 0: Documentation + Environment Setup ✅
- [x] Initialize Expo project
- [x] Install dependencies
- [x] Configure NativeWind and Reanimated
- [x] Create folder structure
- [x] Set up Supabase and SQLite
- [x] Write documentation

### Phase 1: Authentication & Onboarding
**Screen-by-screen approach:**
1. Login screen
2. Signup screen
3. Onboarding: Welcome
4. Onboarding: Language selection
5. Onboarding: Level assessment (interactive test)
6. Onboarding: Interests selection

**Deliverables:**
- Working auth flow with Supabase
- User profile creation
- Smooth onboarding experience
- Data stored locally and synced

### Phase 2: Home Screen & Dashboard
**Features:**
- Top bar with streak counter 🔥 and total points ⭐
- "Next Lesson" featured card with:
  - Lesson title
  - Progress bar
  - Number of new words and games
  - "Continue" button
- Today's progress summary
- Quick practice shortcuts
- Recent stories section

**Key Implementation:**
- Real-time streak calculation
- Lesson recommendation algorithm
- Offline-first data loading

### Phase 3: Flashcard System with Spaced Repetition
**3-Card Cycle:**
1. **Learning Card**: Image + text + phonetics + audio
2. **Listening Card**: Play audio → user types what they hear
3. **Speaking Card**: Show word → user records pronunciation

**Spaced Repetition:**
- SM-2 algorithm implementation
- All calculations work offline
- Data synced when online
- Due cards calculated locally

**Animations:**
- Card flip with Reanimated
- Smooth transitions
- Success/error feedback

### Phase 4: Games & Gamification
**Games:**
- Tap-to-match (link images to words)
- Multiple choice (hear word, select image)

**Gamification:**
- Points for every attempt:
  - Flashcard: 10 pts
  - Game: 25 pts
  - Reading: 15 pts
  - Speaking: 20 pts
- Streak tracking (consecutive days)
- Leaderboard (ranked by attempts, not accuracy)

### Phase 5: Category System
**Categories:**
- Verbs
- Common Objects
- Food & Dining
- Travel Essentials
- Conversation Starters
- Grammar Basics

**Features:**
- Browse by category
- Track progress per category
- All content downloadable for offline use

### Phase 6: AI Stories & Reading Practice
**AI Story Generation:**
- Gemini AI creates personalized stories
- Based on user interests and level
- 3 difficulty versions (easy/medium/hard)
- Highlights vocabulary being learned

**Teleprompter:**
- Display story with highlighting
- Click word → definition
- Double-click → phrase meaning
- Record audio while reading

**Storage:**
- Stories downloaded and cached
- Recordings saved locally
- Optional: Publish to community

### Phase 7: Community & Social Features
**Features:**
- Share practice recordings (public/private toggle)
- Community feedback on recordings
- Leaderboard (weekly/monthly/all-time)
- View other learners' public content

### Future Phases (Documented, Not Yet Implemented)
See `docs/future-features.md`:
- Video/audio calls with practice partners (Livekit)
- Podcasting and user-generated content
- AI conversation agent (Loora-style)
- "Better to Say" vocabulary enhancement game

## Offline-First Architecture

### Strategy
**Primary Data Source**: Local SQLite database
**Backup/Sync**: Supabase (when online)

### What Works Offline
✅ Flashcard reviews
✅ Spaced repetition calculations
✅ Games (with pre-downloaded content)
✅ Reading practice
✅ Audio recording
✅ Points tracking (synced later)
✅ Streak updates (synced later)

### What Requires Internet
❌ Initial lesson download
❌ AI story generation
❌ Leaderboard updates
❌ Community features
❌ Video calls (future feature)

### Preload System
- On app open (when online): Download next 5 lessons
- Background fetch: Periodically check for new content
- Download includes:
  - Lesson data
  - Flashcard content
  - Images
  - Audio files

### Sync Strategy
- Detect network status with expo-network
- Queue local changes (reviews, progress, recordings)
- Sync automatically when connection restored
- Conflict resolution: Latest timestamp wins

## Screen-by-Screen Development Approach

For each screen:
1. **Design**: Discuss layout, UX, user needs
2. **Define**: What data is needed? What actions can users take?
3. **Implement**: Build the screen with proper state management
4. **Test**: Verify on iOS and Android
5. **Polish**: Animations, accessibility, error states
6. **Commit**: Git commit with clear message
7. **Move to next screen**

This ensures quality and focus, avoiding scattered work across multiple features.

## Key Features Deep Dive

### Spaced Repetition (SM-2 Algorithm)

**How it works:**
- Each flashcard has: ease_factor, interval, repetitions, next_review
- After review, user rates quality (Forgot/Remembered/Easy)
- Algorithm calculates next review date
- Forgotten cards reset to 1-day interval
- Remembered cards increase interval exponentially

**Quality Mapping:**
- Forgot → quality 1 (review tomorrow)
- Remembered → quality 4 (normal interval increase)
- Easy → quality 5 (longer interval)

**Storage:**
- All data in local SQLite
- Synced to Supabase when online
- Works 100% offline

### Home Screen Design

```
┌─────────────────────────────────────┐
│  👤 Profile    🔥 7 Day Streak  ⭐ 245│  ← Streak + Points
├─────────────────────────────────────┤
│                                     │
│  📚 YOUR NEXT LESSON                │  ← Featured Card
│  ┌─────────────────────────────────┐│
│  │  🍎 Food & Dining               ││
│  │  Progress: ████░░░░ 40%         ││
│  │  5 new words • 3 games          ││
│  │                                 ││
│  │  [Continue Lesson →]            ││
│  └─────────────────────────────────┘│
│                                     │
│  📊 Your Progress Today              │
│  • 15 flashcards reviewed           │
│  • 2 games completed                │
│  • 10 min practice time             │
│                                     │
│  🎮 Quick Practice                   │
│  [Match] [Reading] [Listening]     │
│                                     │
└─────────────────────────────────────┘
```

### Gamification Philosophy

**Core Principle**: Reward TRIALS, not perfection

**Why?**
- Reduces fear of mistakes
- Encourages more practice
- Creates safe learning environment
- Aligns with our core values

**Leaderboard Ranking:**
1. Total practice attempts (primary)
2. Total points (secondary)
3. Current streak (tertiary)

This ensures active learners rank higher than perfect but inactive ones.

## Development Guidelines

### Code Style
- TypeScript for all files
- Functional components with hooks
- Descriptive variable names
- Comments for complex logic
- File naming: kebab-case for files, PascalCase for components

### Commit Message Format
```
Phase X: Brief description

- Detailed change 1
- Detailed change 2
- Detailed change 3
```

Example:
```
Phase 1: Implement login screen

- Add login form with email/password validation
- Integrate Supabase authentication
- Add error handling and loading states
- Test on iOS and Android
```

### Testing Checklist (For Each Feature)
- [ ] Works on iOS
- [ ] Works on Android
- [ ] Works offline (if applicable)
- [ ] Handles errors gracefully
- [ ] Loading states implemented
- [ ] Animations are smooth (60fps)
- [ ] Accessible (screen reader friendly)
- [ ] Data syncs correctly when online

## Environment Setup

### Required Accounts
1. **Supabase**: https://supabase.com
   - Create project
   - Run database-schema.sql
   - Get URL and anon key

2. **Google AI Studio**: https://makersuite.google.com
   - Get Gemini API key

### Environment Variables
Copy `.env.example` to `.env` and fill in:
```
EXPO_PUBLIC_SUPABASE_URL=your_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key_here
EXPO_PUBLIC_GEMINI_API_KEY=your_key_here
```

### Running the App

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on iOS
npx expo start --ios

# Run on Android
npx expo start --android

# Clear cache if needed
npx expo start -c
```

## Resources

### Documentation
- Expo Docs: https://docs.expo.dev
- React Native: https://reactnative.dev
- Supabase: https://supabase.com/docs
- NativeWind: https://www.nativewind.dev
- Reanimated: https://docs.swmansion.com/react-native-reanimated

### Project Files
- `docs/database-schema.sql` - Full database schema with RLS
- `docs/user-journey.md` - User flow diagrams
- `docs/offline-architecture.md` - Offline implementation details
- `docs/future-features.md` - Roadmap and future plans

## Success Metrics

### MVP (Phase 1-7) Success Criteria
- ✅ Users can complete onboarding in < 3 minutes
- ✅ Flashcard reviews work 100% offline
- ✅ Lessons pre-download automatically
- ✅ Points and streak track correctly
- ✅ Leaderboard ranks by practice attempts
- ✅ AI generates appropriate-level content
- ✅ App loads in < 2 seconds
- ✅ Animations run at 60fps
- ✅ Works on iOS and Android

### User Engagement Goals
- Daily active users practice 10+ minutes
- 7-day streak retention > 40%
- Average 50+ flashcards reviewed per week
- Leaderboard participation > 60%
- Community content views > 30% of users

## Next Steps

**Current Phase**: Phase 0 (Complete)

**Next**: Phase 1 - Authentication & Onboarding
- Start with Login screen
- Then Signup screen
- Then Onboarding flow (screen-by-screen)

**Approach**:
- One screen at a time
- Design → Implement → Test → Commit
- Focus on quality over speed
- use 3D icons for dinamic
- Keep offline-first in mind for all features

---

**Last Updated**: 2025-11-19
**Current Version**: 1.0.0
**Project Status**: Phase 0 Complete
