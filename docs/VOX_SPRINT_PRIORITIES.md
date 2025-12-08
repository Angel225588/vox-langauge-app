# VOX SPRINT PRIORITIES - Master Execution Plan

**Created**: 2025-12-02 (Monday)
**Hard Deadline**: 2025-12-08 (Sunday) - MVP Launch Ready
**Owner**: Angel Polanco
**Last Updated**: 2025-12-02 10:00 AM

---

## 🎯 MISSION: Ship MVP by December 8th

### What "Done" Looks Like
A user can:
1. ✅ Complete onboarding (already done)
2. ✅ See personalized staircase (already done)
3. 🔴 Complete a lesson with polished cards
4. 🔴 See their Word Bank (all learned vocabulary)
5. 🔴 Have AI conversation practice (Loora-style)
6. 🔴 Experience smooth, connected flow between features

---

## 📊 CURRENT STATE AUDIT (Dec 2)

### ✅ DONE (Don't Touch Unless Broken)
| Feature | Status | Notes |
|---------|--------|-------|
| Project Setup | ✅ 100% | Expo, TypeScript, SQLite, Supabase |
| Authentication | ✅ 100% | Login, Signup, Session management |
| Onboarding Flow | ✅ 100% | 5 steps, motivation tracking |
| Staircase System | ✅ 100% | Gemini AI generates personalized path |
| SM-2 Algorithm | ✅ 100% | Spaced repetition logic |
| Database Architecture | ✅ 100% | Offline-first with sync |

### 🚧 PARTIALLY DONE (Needs Completion)
| Feature | Progress | What's Missing |
|---------|----------|----------------|
| Card Components | 80% | Polish, unified design, testing |
| Lesson Flow | 60% | Connection layer, smart sequencing |
| Points System | 40% | Display, tracking, rewards |
| Games | 30% | TapToMatch, MultipleChoice scaffolded |

### 🔴 NOT STARTED (Must Build)
| Feature | Priority | Your Idea Connection |
|---------|----------|---------------------|
| Word Bank System | P0 | Idea #4C - Central repository |
| Connection Layer | P0 | Idea #4D - Smooth flow |
| AI Conversation | P1 | Idea #2 - Loora-style agent |
| Word Detail Popups | P1 | Idea #3b - Tap for meaning |
| Reading Features | P2 | Idea #3 - Teleprompter |
| "Better to Say" Game | P3 | Idea #1 - Synonym finder |

---

## 🗓️ SESSION-BY-SESSION EXECUTION PLAN

### Legend
- 🎯 = Primary Goal (MUST complete)
- 🔧 = Secondary Goal (If time permits)
- ⏱️ = Estimated Duration
- 📍 = Where to Start (first file to open)

---

## SESSION 1: Foundation Polish
**Date**: December 2, 2025 (Today)
**Duration**: 3-4 hours
**Theme**: "Make what we have WORK perfectly"

### 🎯 Primary Goals

#### 1.1 Test Current State (30 min)
```
📍 Start: Run the app
⏱️ 30 minutes

Tasks:
- [ ] Run `npm start` in vox-language-app
- [ ] Complete full user flow: Signup → Onboarding → Staircase → Lesson
- [ ] Document ALL bugs found in BUGS.md
- [ ] Take screenshots of broken UI
- [ ] Note any crashes or errors

Success: Full flow works without crashes
```

#### 1.2 Card Polish - Unified Design (90 min)
```
📍 Start: /components/flashcards/
⏱️ 90 minutes

Tasks:
- [ ] Audit all 14 card components for consistency
- [ ] Create shared styles (colors, spacing, typography)
- [ ] Fix any broken animations
- [ ] Ensure dark mode works on all cards
- [ ] Test each card type individually

Files to touch:
- /components/flashcards/*.tsx
- /components/games/*.tsx
- /lib/theme/ (create if needed)

Success: All cards look like they belong to same app
```

#### 1.3 Create BUGS.md Tracker (15 min)
```
📍 Start: Create /docs/BUGS.md
⏱️ 15 minutes

Template:
| Bug ID | Description | Severity | Status | Found Date |
|--------|-------------|----------|--------|------------|
| BUG-001 | Example bug | High | Open | 2025-12-02 |

Success: All known issues documented
```

### 🔧 Secondary Goals (If Time Permits)
- [ ] Fix any P0 bugs found during testing
- [ ] Update this document with session notes

### Session 1 Exit Criteria
- [ ] App runs without crashes
- [ ] All cards render correctly
- [ ] Bugs documented
- [ ] Ready for Session 2

---

## SESSION 2: Connection Layer
**Date**: December 3, 2025
**Duration**: 3-4 hours
**Theme**: "Make features FLOW together"

### 🎯 Primary Goals

#### 2.1 Word Bank System - Core (120 min)
```
📍 Start: Create /lib/word-bank/
⏱️ 120 minutes

Your Idea #4C: "Central repository for all user's learning words"

Architecture:
/lib/word-bank/
  ├── types.ts         # Word interface with priority, mastery, errors
  ├── storage.ts       # SQLite operations
  ├── hooks.ts         # useWordBank hook
  └── utils.ts         # Priority calculation

Word Schema:
{
  id: string
  word: string
  translation: string
  priority: number        // 1-10 (milestone urgency + weakness + errors)
  masteryScore: number    // 0-100
  errorHistory: string[]  // List of error types
  source: 'lesson' | 'reading' | 'manual' | 'error'
  milestoneTags: string[] // Which goals this word serves
  lastReviewed: Date
  nextReview: Date
  timesCorrect: number
  timesIncorrect: number
}

Success: Can add/retrieve/update words in Word Bank
```

#### 2.2 Smart Card Sequencing (60 min)
```
📍 Start: /lib/lesson-engine/
⏱️ 60 minutes

Your Idea #4D: "Smart card sequencing based on priority words"

Tasks:
- [ ] Create card selection algorithm
- [ ] Priority formula: urgency × weakness × recency
- [ ] Mix card types for variety
- [ ] Ensure offline operation

Success: Lessons pull from Word Bank with smart ordering
```

### 🔧 Secondary Goals
- [ ] Connect Word Bank to existing flashcard components
- [ ] Add "Add to Word Bank" button on cards

### Session 2 Exit Criteria
- [ ] Word Bank stores/retrieves data
- [ ] Smart sequencing works
- [ ] Lessons feel personalized

---

## SESSION 3: AI Conversation
**Date**: December 4, 2025
**Duration**: 3-4 hours
**Theme**: "Add the killer feature"

### 🎯 Primary Goals

#### 3.1 Loora-Style AI Agent (150 min)
```
📍 Start: /lib/ai-conversation/
⏱️ 150 minutes

Your Idea #2: "AI agent with credits + progress bar"

Architecture:
/lib/ai-conversation/
  ├── gemini-client.ts   # API wrapper
  ├── conversation.ts    # Chat logic
  ├── credits.ts         # Usage tracking (10 min free/day)
  └── prompts.ts         # System prompts

/components/ai/
  ├── ConversationScreen.tsx
  ├── CreditDisplay.tsx
  ├── MessageBubble.tsx
  └── VoiceInput.tsx

Key Features:
- 5-10 second delay before hints (research-backed)
- Credit system with progress bar
- Voice OR text input
- Gentle corrections ("try saying..." not "wrong!")
- Uses vocabulary from user's Word Bank

Success: Can have 2-minute conversation with AI
```

#### 3.2 Credit System (30 min)
```
📍 Start: /lib/ai-conversation/credits.ts
⏱️ 30 minutes

- 10 minutes free per day
- Visual progress bar
- Clear "X minutes remaining" display
- Resets at midnight local time

Success: Credits track and display correctly
```

### 🔧 Secondary Goals
- [ ] Add conversation history
- [ ] Speech-to-text input option

### Session 3 Exit Criteria
- [ ] AI responds appropriately
- [ ] Credits system works
- [ ] Feels like Loora (judgment-free)

---

## SESSION 4: Word Details & Reading Prep
**Date**: December 5, 2025
**Duration**: 3-4 hours
**Theme**: "Deep vocabulary understanding"

### 🎯 Primary Goals

#### 4.1 Word Detail Popups (90 min)
```
📍 Start: /components/vocabulary/WordDetailPopup.tsx
⏱️ 90 minutes

Your Idea #3b: "Single tap = see meaning instantly"

Features:
- Tap any word → popup appears
- Shows: definition, pronunciation, examples
- "Add to Word Bank" button
- Works offline

Success: Tap any word in app → see full details
```

#### 4.2 Vocabulary Dashboard (90 min)
```
📍 Start: /app/(tabs)/vocabulary.tsx
⏱️ 90 minutes

Research Need: "Duolingo hides vocabulary lists"

Features:
- See ALL learned words
- Filter by: category, CEFR level, mastery
- Search words
- Tap word → WordDetailPopup

Success: User can browse all their vocabulary
```

### 🔧 Secondary Goals
- [ ] Export vocabulary to CSV
- [ ] Word strength indicators

### Session 4 Exit Criteria
- [ ] Word popups work everywhere
- [ ] Vocabulary dashboard shows all words
- [ ] User feels "I can see my progress"

---

## SESSION 5: Integration & Testing
**Date**: December 6, 2025
**Duration**: 3-4 hours
**Theme**: "Make it all work together"

### 🎯 Primary Goals

#### 5.1 Full Flow Testing (60 min)
```
📍 Start: Fresh app install simulation
⏱️ 60 minutes

Test Path:
1. New user signup
2. Complete onboarding
3. View staircase
4. Start first lesson
5. Complete 5 cards
6. View Word Bank
7. Start AI conversation
8. Check vocabulary dashboard

Document all issues in BUGS.md
```

#### 5.2 Bug Fixes (120 min)
```
📍 Start: BUGS.md - sort by severity
⏱️ 120 minutes

Fix order:
1. Crashes (P0)
2. Broken features (P0)
3. UI issues (P1)
4. Polish (P2)

Success: No P0 bugs remaining
```

### 🔧 Secondary Goals
- [ ] Performance optimization
- [ ] Loading states everywhere
- [ ] Error handling

### Session 5 Exit Criteria
- [ ] Full flow works end-to-end
- [ ] No crashes
- [ ] Ready for final polish

---

## SESSION 6: Final Polish
**Date**: December 7, 2025
**Duration**: 3-4 hours
**Theme**: "Make it beautiful"

### 🎯 Primary Goals

#### 6.1 UI Polish Pass (90 min)
```
Tasks:
- [ ] Consistent colors/fonts everywhere
- [ ] Smooth transitions
- [ ] Loading indicators
- [ ] Empty states
- [ ] Error messages user-friendly
```

#### 6.2 Onboarding Refinement (60 min)
```
Tasks:
- [ ] First lesson launches smoothly
- [ ] User understands what to do
- [ ] No confusion points
```

#### 6.3 Final Testing (60 min)
```
Tasks:
- [ ] Test on iOS simulator
- [ ] Test on Android emulator
- [ ] Test offline mode
- [ ] Test edge cases
```

### Session 6 Exit Criteria
- [ ] App feels polished
- [ ] No obvious bugs
- [ ] Ready for Dec 8

---

## SESSION 7: Launch Prep
**Date**: December 8, 2025
**Duration**: 2-3 hours
**Theme**: "Ship it!"

### 🎯 Primary Goals

#### 7.1 Documentation Update (30 min)
```
- [ ] Update README.md
- [ ] Update PROJECT_STATUS.md
- [ ] Create CHANGELOG.md for v1.0
```

#### 7.2 Git Cleanup (30 min)
```
- [ ] Review all commits
- [ ] Create release tag v1.0.0
- [ ] Push to main branch
```

#### 7.3 Celebration & Next Steps (30 min)
```
- [ ] Document what was shipped
- [ ] Plan post-launch priorities
- [ ] Take a break! 🎉
```

---

## 📋 PRIORITY REFERENCE QUICK GUIDE

### P0 - MUST HAVE (Dec 8)
| # | Feature | Session | Your Idea |
|---|---------|---------|-----------|
| 1 | Card Polish | Session 1 | #4A Design System |
| 2 | Word Bank System | Session 2 | #4C Central Repository |
| 3 | Connection Layer | Session 2 | #4D Smart Sequencing |
| 4 | AI Conversation | Session 3 | #2 Loora-style Agent |
| 5 | Word Detail Popups | Session 4 | #3b Tap for Meaning |
| 6 | Full Integration | Session 5 | - |

### P1 - SHOULD HAVE (Dec 15)
| # | Feature | Notes |
|---|---------|-------|
| 1 | Grammar Popups | Research: #1 user complaint |
| 2 | Reading Teleprompter | Your Idea #3 |
| 3 | Speech-to-Text Feedback | Your Idea #3 |
| 4 | Points System Polish | Gamification |

### P2 - NICE TO HAVE (Dec 22)
| # | Feature | Notes |
|---|---------|-------|
| 1 | "Better to Say" Game | Your Idea #1 |
| 2 | Passive Reading Mode | Your Idea #3b |
| 3 | Export Vocabulary | User request |
| 4 | Historical Progress Graphs | Analytics |

### P3 - FUTURE (Jan+)
| # | Feature | Notes |
|---|---------|-------|
| 1 | Video/Audio Practice | LiveKit |
| 2 | Community Features | Social |
| 3 | Native Speaker Videos | Content |
| 4 | Mentorship Program | Community |

---

## 📝 SESSION LOG

### Session 1 - December 2, 2025
**Started**: ___:___ AM/PM
**Ended**: ___:___ AM/PM
**Duration**: ___ hours

**Completed**:
- [ ]

**Blocked By**:
- [ ]

**Notes**:


**Next Session Focus**:


---

### Session 2 - December 3, 2025
**Started**: ___:___ AM/PM
**Ended**: ___:___ AM/PM
**Duration**: ___ hours

**Completed**:
- [ ]

**Blocked By**:
- [ ]

**Notes**:


---

### Session 3 - December 4, 2025
**Started**: ___:___ AM/PM
**Ended**: ___:___ AM/PM
**Duration**: ___ hours

**Completed**:
- [ ]

**Notes**:


---

### Session 4 - December 5, 2025
**Started**: ___:___ AM/PM
**Ended**: ___:___ AM/PM
**Duration**: ___ hours

**Completed**:
- [ ]

**Notes**:


---

### Session 5 - December 6, 2025
**Started**: ___:___ AM/PM
**Ended**: ___:___ AM/PM
**Duration**: ___ hours

**Completed**:
- [ ]

**Notes**:


---

### Session 6 - December 7, 2025
**Started**: ___:___ AM/PM
**Ended**: ___:___ AM/PM
**Duration**: ___ hours

**Completed**:
- [ ]

**Notes**:


---

### Session 7 - December 8, 2025 (LAUNCH DAY)
**Started**: ___:___ AM/PM
**Ended**: ___:___ AM/PM
**Duration**: ___ hours

**SHIPPED**:
- [ ]

**Deferred to v1.1**:
- [ ]

---

## 🎯 SUCCESS METRICS

### Dec 8 MVP Must Pass
- [ ] New user can complete signup → onboarding → first lesson
- [ ] Word Bank stores and displays vocabulary
- [ ] AI conversation works (with credits)
- [ ] Word tapping shows details
- [ ] No P0 bugs
- [ ] Works offline for core features

### Quality Bar
- [ ] All cards visually consistent
- [ ] Animations smooth (60fps)
- [ ] Loading states everywhere
- [ ] Errors handled gracefully
- [ ] Feels like one unified app

---

## 📞 QUICK COMMANDS

```bash
# Start development
cd vox-language-app && npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Check TypeScript
npm run typecheck

# Run tests
npm test
```

---

## 🔗 KEY FILE LOCATIONS

| Purpose | Path |
|---------|------|
| Cards | `/components/flashcards/`, `/components/games/` |
| Word Bank | `/lib/word-bank/` (create) |
| AI Chat | `/lib/ai-conversation/` (create) |
| Lesson Engine | `/lib/lesson-engine/` (create) |
| Database | `/lib/db/` |
| Hooks | `/hooks/` |
| Screens | `/app/` |
| Docs | `/docs/` |

---

**This document is the SINGLE SOURCE OF TRUTH for sprint execution.**

**When in doubt, check here first.**

---

*Created by Claude Code with Angel Polanco*
*Last Updated: 2025-12-02 10:00 AM*
