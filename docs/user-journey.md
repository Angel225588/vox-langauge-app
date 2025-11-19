# Vox Language App - User Journey

This document maps out the complete user experience through different flows in the app.

## 1. New User Journey (First Time)

```
┌─────────────┐
│   Install   │
│     App     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Splash    │
│   Screen    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Welcome   │   "Learn languages through practice,
│   Screen    │    not perfection"
└──────┬──────┘   [Get Started]
       │
       ▼
┌─────────────┐
│   Signup    │   Email + Password
│   Screen    │   OR Social Login (Google, Apple)
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ Onboarding Step 1│   "Which language do you want to learn?"
│ Language Select  │   [English] [French] [Spanish]
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Onboarding Step 2│   Quick Level Assessment
│ Level Assessment │   - Show 10 images
└────────┬─────────┘   - User selects words they know
         │             - AI calculates level
         ▼
┌──────────────────┐
│ Onboarding Step 3│   "What topics interest you?"
│ Interests Select │   [Travel] [Food] [Business]
└────────┬─────────┘   [Sports] [Movies] [Other...]
         │
         ▼
┌──────────────────┐
│   Processing     │   "Preparing your personalized
│  & Pre-download  │    lessons..."
└────────┬─────────┘   - Download first 5 lessons
         │             - Generate first AI story
         ▼
┌──────────────────┐
│   Home Screen    │   🎉 "Welcome! Your first lesson
│   (Dashboard)    │       is ready!"
└──────────────────┘   - Show Next Lesson card
                        - Streak: 0 days
                        - Points: 0
```

## 2. Returning User Journey (Daily Practice)

```
┌─────────────┐
│  Open App   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Check     │   - Restore session
│  Auth State │   - Load offline data
└──────┬──────┘   - Sync if online
       │
       ▼
┌──────────────────┐
│   Home Screen    │   ┌──────────────────────┐
│                  │   │ 👤  🔥 7 Days  ⭐ 245 │
│  ┌────────────┐  │   └──────────────────────┘
│  │NEXT LESSON │  │
│  │Food Vocab  │  │   📚 YOUR NEXT LESSON
│  │Progress:40%│  │   ┌──────────────────────┐
│  │5 words•3   │  │   │ 🍎 Food & Dining     │
│  │games       │  │   │ Progress: ████░░ 40% │
│  │[Continue→] │  │   │ 5 new words • 3 games│
│  └────────────┘  │   │ [Continue Lesson →]  │
│                  │   └──────────────────────┘
│  📊 Today:       │
│  • 0 cards       │   📊 Your Progress Today
│  • 0 games       │   📈 Quick Practice
└──────┬───────────┘   📖 Recent Stories
       │
       │ [User taps "Continue"]
       ▼
┌──────────────────┐
│  Flashcard       │   Card 1: Learning
│  Session         │   ┌──────────────────────┐
│                  │   │ 🍎 Image of apple    │
│  3-Card Cycle:   │   │ "Apple"              │
│  1. Learning     │   │ /ˈæp.əl/            │
│  2. Listening    │   │ 🔊 [Play Audio]      │
│  3. Speaking     │   └──────────────────────┘
└──────┬───────────┘   [Show Answer]
       │
       │ [After reviewing 10 cards]
       ▼
┌──────────────────┐
│  Session         │   🎉 Great job!
│  Complete        │
│                  │   ✓ 10 flashcards reviewed
│  +100 Points!    │   ✓ +100 points earned
│  Streak: 8 Days  │   ✓ 8-day streak maintained!
└──────┬───────────┘
       │              [Continue] [View Progress]
       ▼
┌──────────────────┐
│  Home Screen     │   Points updated: 345
│  (Updated)       │   Streak: 🔥 8 Days
└──────────────────┘
```

## 3. Flashcard Review Flow (Detailed)

```
┌────────────────────┐
│  Start Flashcard   │
│    Session         │
└─────────┬──────────┘
          │
          ▼
    ┌──────────┐
    │  Card 1  │  Learning Card
    │ (Front)  │  ┌─────────────────────┐
    └────┬─────┘  │ 🍎 Image            │
         │        │ "Apple"             │
         │        │ /ˈæp.əl/           │
         │        │ 🔊 [Audio]          │
         │        └─────────────────────┘
         │        [Show Answer ↓]
         ▼
    ┌──────────┐
    │  Card 1  │  Learning Card (Back)
    │  (Back)  │  ┌─────────────────────┐
    └────┬─────┘  │ Examples:           │
         │        │ • "I ate an apple"  │
         │        │ • "Red apple"       │
         │        └─────────────────────┘
         │        [Next →]
         ▼
    ┌──────────┐
    │  Card 2  │  Listening Card
    │(Listening│  ┌─────────────────────┐
    └────┬─────┘  │ 🔊 [Play]           │
         │        │                     │
         │        │ Type what you hear: │
         │        │ [_____________]     │
         │        └─────────────────────┘
         │        [Check Answer]
         │
         │ ┌─ Correct → [Great! +10pts]
         │ └─ Wrong → [Try Again]
         ▼
    ┌──────────┐
    │  Card 3  │  Speaking Card
    │(Speaking)│  ┌─────────────────────┐
    └────┬─────┘  │ Say this word:      │
         │        │                     │
         │        │ 🍎 Apple            │
         │        │                     │
         │        │ 🎤 [Record]         │
         │        └─────────────────────┘
         │        [Submit Recording]
         │
         │ AI analyzes pronunciation
         ▼
    ┌──────────┐
    │ Quality  │  How well did you remember?
    │  Rating  │  ┌─────────────────────┐
    └────┬─────┘  │ [Forgot]            │
         │        │ [Remembered]        │
         │        │ [Easy]              │
         │        └─────────────────────┘
         │
         │ SM-2 algorithm calculates next review
         │ Update: ease_factor, interval, next_review
         ▼
    ┌──────────┐
    │  Next    │  Repeat for remaining cards
    │  Card    │  or
    └────┬─────┘  [Session Complete]
         │
         ▼
    [Session Complete Screen]
```

## 4. Game Play Flow

```
┌─────────────┐
│ Home Screen │
└──────┬──────┘
       │ [User taps "Quick Practice" → "Match Game"]
       ▼
┌─────────────────┐
│  Game: Tap to   │   Instructions shown
│  Match          │   "Tap image, then tap word"
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Game Screen    │   ┌─────────┬─────────┐
│                 │   │ 🍎      │ 🥖     │  Images
│  8 Items        │   │ Apple   │ Bread  │
│  (4 pairs)      │   └─────────┴─────────┘
└────────┬────────┘   ┌─────────┬─────────┐
         │            │ Water   │ Apple  │  Words
         │            │ Bread   │ Coffee │  (shuffled)
         │            └─────────┴─────────┘
         │
         │ User taps image → word
         │
         │ ┌─ Match! → Green highlight + sound
         │ └─ Wrong → Red flash, try again
         ▼
┌─────────────────┐
│  All Matched!   │   🎉 Perfect!
│                 │
│  +25 Points     │   Time: 45 seconds
│  Time: 45s      │   +25 points
└────────┬────────┘
         │            [Play Again] [Home]
         ▼
    [Back to Home or Play Again]
```

## 5. Reading Practice Flow

```
┌─────────────┐
│ Home Screen │
└──────┬──────┘
       │ [User taps "Recent Stories"]
       ▼
┌─────────────────┐
│  Stories List   │   ┌──────────────────┐
│                 │   │ 📖 My Weekend    │
│  - My stories   │   │    (Beginner)    │
│  - AI stories   │   ├──────────────────┤
│  - Community    │   │ 📖 At Restaurant │
└────────┬────────┘   │    (Intermediate)│
         │            └──────────────────┘
         │ [User selects story]
         ▼
┌─────────────────┐
│ Difficulty      │   Same story, 3 levels:
│ Selection       │
│                 │   [📗 Easy]
└────────┬────────┘   [📙 Medium]
         │            [📕 Advanced]
         │
         │ [User selects difficulty]
         ▼
┌─────────────────────┐
│  Teleprompter       │   ┌────────────────────┐
│  Reading View       │   │ Last weekend, I    │
│                     │   │ went to the park.  │
│  Features:          │   │ I saw many people  │
│  - Highlighted      │   │ playing sports.    │
│  - Click word→def   │   │                    │
│  - Record button    │   │ [🎤 Record]        │
└─────────┬───────────┘   └────────────────────┘
          │
          │ [User taps 🎤 Record]
          ▼
┌─────────────────────┐
│  Recording...       │   🔴 REC 00:15
│                     │
│  User reads aloud   │   [Stop Recording]
└─────────┬───────────┘
          │
          │ [Recording complete]
          ▼
┌─────────────────────┐
│  Review Recording   │   ┌────────────────────┐
│                     │   │ 🔊 [Play Back]     │
│  AI Feedback:       │   ├────────────────────┤
│  ✓ Good fluency     │   │ Feedback:          │
│  ⚠ Practice "park"  │   │ • Great pace!      │
│                     │   │ • Work on "park"   │
└─────────┬───────────┘   └────────────────────┘
          │
          │               [Re-record] [Save]
          ▼                [Publish to Community]
┌─────────────────────┐
│  Save Options       │   [✓ Keep Private]
│                     │   [ ] Publish Public
│  +15 Points         │
└─────────────────────┘   [Save] → +15 points
```

## 6. Community Flow

```
┌─────────────┐
│ Home Screen │
└──────┬──────┘
       │ [User taps "Community" tab]
       ▼
┌─────────────────┐
│  Community      │   ┌──────────────────┐
│  Feed           │   │ 🎤 Sarah         │
│                 │   │ "My Weekend"     │
│  - Public       │   │ ⭐⭐⭐⭐⭐       │
│    recordings   │   │ 2 min • English  │
│  - Leaderboard  │   ├──────────────────┤
└────────┬────────┘   │ 🎤 Alex          │
         │            │ "At Restaurant"  │
         │            └──────────────────┘
         │
         │ [User taps recording]
         ▼
┌─────────────────────┐
│  Listen to          │   🎤 Sarah
│  Recording          │   "My Weekend"
│                     │
│  🔊 [Play]          │   ⭐⭐⭐⭐⭐
│                     │
│  Leave feedback:    │   Comments (3):
│  ⭐⭐⭐⭐⭐         │   "Great pronunciation!"
│                     │   "Nice pace"
│  [💬 Comment]       │
└─────────────────────┘
                          [❤️ Like] [Share]
```

## 7. Leaderboard Flow

```
┌─────────────┐
│ Community   │
│    Tab      │
└──────┬──────┘
       │ [User taps "Leaderboard"]
       ▼
┌──────────────────────┐
│  Leaderboard         │   [Weekly ▼] [Monthly] [All Time]
│                      │
│  Ranked by:          │   ┌────────────────────┐
│  Practice Attempts   │   │ 1. 🥇 Sarah - 156  │
│                      │   │    (1,245 pts)     │
│  Top 10:             │   ├────────────────────┤
│  1. Sarah - 156      │   │ 2. 🥈 Alex - 142   │
│  2. Alex - 142       │   │    (1,180 pts)     │
│  3. Mike - 138       │   ├────────────────────┤
│  ...                 │   │ 3. 🥉 Mike - 138   │
│  15. You - 89        │   │    (1,050 pts)     │
└──────────────────────┘   ├────────────────────┤
                           │ ...                │
   Your Rank: #15          │ 15. You - 89 ⭐    │
   Keep practicing!        │     (645 pts)      │
                           └────────────────────┘
```

## Key User Needs Per Screen

### Home Screen
**User Needs:**
- Quick view of progress (streak, points)
- Clear next action (Continue Lesson)
- Motivation to practice daily
- Easy access to different activities

**Data Required:**
- Current streak count
- Total points
- Next lesson info
- Today's progress summary

### Flashcard Session
**User Needs:**
- Clear, easy-to-understand cards
- Immediate audio playback
- Progress indicator
- No pressure, safe to make mistakes

**Data Required:**
- Due flashcards (from spaced repetition)
- Media files (images, audio)
- Review history

### Games
**User Needs:**
- Fun, engaging experience
- Instant feedback
- Points for motivation
- Variety of game types

**Data Required:**
- Category content
- Media assets
- User's known vocabulary

### Reading Practice
**User Needs:**
- Personalized content
- Help with unfamiliar words
- Ability to practice pronunciation
- Option to share or keep private

**Data Required:**
- AI-generated stories
- User vocabulary level
- Recording storage

### Community
**User Needs:**
- Inspiration from others
- Friendly feedback
- Sense of belonging
- Leaderboard motivation

**Data Required:**
- Public recordings
- User profiles
- Feedback and comments
- Leaderboard rankings

## Offline Behavior Per Flow

| Flow | Offline Capability |
|------|-------------------|
| **Login** | ❌ Requires internet (first time) <br> ✅ Auto-login with cached session |
| **Home Screen** | ✅ Shows cached data <br> ✅ Streak/points from local DB |
| **Flashcard Review** | ✅ Fully functional offline <br> ✅ Syncs when online |
| **Games** | ✅ Works with pre-downloaded content |
| **Reading** | ✅ Pre-downloaded stories work <br> ❌ New AI stories need internet |
| **Recording** | ✅ Can record offline <br> ❌ Publishing needs internet |
| **Community** | ❌ Requires internet |
| **Leaderboard** | ❌ Requires internet |

---

**Last Updated**: 2025-11-19
**Related Docs**: `claude.md`, `offline-architecture.md`
