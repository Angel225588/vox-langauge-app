# Feature: Word Bank System

**Created**: 2025-12-02
**Last Updated**: 2025-12-02 10:30 AM
**Owner**: Angel Polanco
**Priority**: P0
**Status**: Planned

---

## Overview

### What It Does
Central repository for ALL words a user is learning. Every word has priority scores, mastery levels, error history, and milestone tags. This powers smart card selection and personalized learning.

### Why It Matters
- Research: "Duolingo hides vocabulary lists" - top user complaint
- Research: Metacognitive awareness (seeing your progress) improves learning
- Research: Frequency-based vocabulary is most effective

### Your Idea Connection
**From project-ideas.txt (#4C)**:
> "Word Bank System - Central repository for all user's learning words. Sources: Reading (tap to add), Speaking feedback, wrong answers. Each word has: priority level, milestone tags, mastery score, error history. Feeds into card selection algorithm."

---

## User Stories

1. As a learner, I want to see ALL words I've learned in one place
2. As a learner, I want to know which words need more practice
3. As a learner, I want to add new words when I encounter them (reading, etc.)
4. As a learner, I want words automatically prioritized based on my goals
5. As a learner, I want to search my vocabulary

---

## Technical Specification

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    WORD BANK SYSTEM                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐            │
│  │  Lesson  │   │ Reading  │   │  Error   │            │
│  │  Cards   │──▶│   Tap    │──▶│ Feedback │──┐         │
│  └──────────┘   └──────────┘   └──────────┘  │         │
│                                               ▼         │
│                                    ┌──────────────┐     │
│                                    │  WORD BANK   │     │
│                                    │   (SQLite)   │     │
│                                    └──────┬───────┘     │
│                                           │             │
│              ┌────────────────────────────┼─────────┐   │
│              ▼                            ▼         ▼   │
│    ┌──────────────┐              ┌─────────────┐  ┌───┐ │
│    │ Priority     │              │ Vocabulary  │  │API│ │
│    │ Calculator   │              │ Dashboard   │  │   │ │
│    └──────────────┘              └─────────────┘  └───┘ │
│              │                                          │
│              ▼                                          │
│    ┌──────────────┐                                     │
│    │ Card         │                                     │
│    │ Selector     │──▶ Lessons use prioritized words    │
│    └──────────────┘                                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Data Model

```typescript
// /lib/word-bank/types.ts

interface BankWord {
  id: string;
  word: string;                    // Target language word
  translation: string;             // Native language translation
  phonetic?: string;               // IPA pronunciation
  audioUrl?: string;               // Audio file path
  imageUrl?: string;               // Associated image

  // Categorization
  category: string;                // 'food', 'travel', 'verbs', etc.
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'other';

  // Learning State
  masteryScore: number;            // 0-100, calculated from SM-2
  priority: number;                // 1-10, calculated from formula

  // SM-2 Fields
  easeFactor: number;              // Default 2.5
  interval: number;                // Days until next review
  repetitions: number;             // Consecutive correct answers
  nextReviewDate: string;          // ISO date string
  lastReviewDate?: string;         // ISO date string

  // History
  timesCorrect: number;
  timesIncorrect: number;
  errorTypes: string[];            // 'spelling', 'pronunciation', 'meaning'

  // Source & Context
  source: 'lesson' | 'reading' | 'manual' | 'error' | 'ai_conversation';
  milestoneTags: string[];         // User's goal milestones this word serves
  exampleSentences: string[];      // Context sentences

  // Timestamps
  addedAt: string;                 // When word entered bank
  updatedAt: string;               // Last modification
}

// Priority calculation
interface PriorityFactors {
  milestoneUrgency: number;        // 0-1: How close is the relevant milestone?
  weaknessScore: number;           // 0-1: How often user gets this wrong
  recencyPenalty: number;          // 0-1: Recently reviewed = lower priority
  cefrMatch: number;               // 0-1: Matches user's current level?
}

// Priority formula:
// priority = (milestoneUrgency * 0.3) + (weaknessScore * 0.4) +
//            (recencyPenalty * 0.2) + (cefrMatch * 0.1)
```

### Components

| Component | Path | Description |
|-----------|------|-------------|
| VocabularyDashboard | `/app/(tabs)/vocabulary.tsx` | Main vocab browsing screen |
| WordCard | `/components/vocabulary/WordCard.tsx` | Single word display in list |
| WordDetailPopup | `/components/vocabulary/WordDetailPopup.tsx` | Full word details modal |
| WordSearch | `/components/vocabulary/WordSearch.tsx` | Search/filter bar |
| PriorityBadge | `/components/vocabulary/PriorityBadge.tsx` | Visual priority indicator |

### Hooks

| Hook | Path | Description |
|------|------|-------------|
| useWordBank | `/hooks/useWordBank.ts` | CRUD operations for words |
| useWordPriority | `/hooks/useWordPriority.ts` | Priority calculation |
| useWordSearch | `/hooks/useWordSearch.ts` | Search/filter logic |

### Database

**SQLite Table: word_bank**
```sql
CREATE TABLE IF NOT EXISTS word_bank (
  id TEXT PRIMARY KEY,
  word TEXT NOT NULL,
  translation TEXT NOT NULL,
  phonetic TEXT,
  audio_url TEXT,
  image_url TEXT,
  category TEXT NOT NULL,
  cefr_level TEXT NOT NULL,
  part_of_speech TEXT,
  mastery_score REAL DEFAULT 0,
  priority REAL DEFAULT 5,
  ease_factor REAL DEFAULT 2.5,
  interval INTEGER DEFAULT 0,
  repetitions INTEGER DEFAULT 0,
  next_review_date TEXT,
  last_review_date TEXT,
  times_correct INTEGER DEFAULT 0,
  times_incorrect INTEGER DEFAULT 0,
  error_types TEXT,           -- JSON array
  source TEXT NOT NULL,
  milestone_tags TEXT,        -- JSON array
  example_sentences TEXT,     -- JSON array
  added_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_word_bank_priority ON word_bank(priority DESC);
CREATE INDEX idx_word_bank_next_review ON word_bank(next_review_date);
CREATE INDEX idx_word_bank_category ON word_bank(category);
```

---

## Files

### Core Files (To Create)
- `/lib/word-bank/types.ts` - TypeScript interfaces
- `/lib/word-bank/storage.ts` - SQLite operations
- `/lib/word-bank/priority.ts` - Priority calculation
- `/lib/word-bank/hooks.ts` - React hooks
- `/lib/word-bank/index.ts` - Exports

### Components (To Create)
- `/components/vocabulary/WordCard.tsx`
- `/components/vocabulary/WordDetailPopup.tsx`
- `/components/vocabulary/WordSearch.tsx`
- `/components/vocabulary/PriorityBadge.tsx`

### Screens (To Create)
- `/app/(tabs)/vocabulary.tsx` - Main dashboard

### Related Files (Existing)
- `/lib/db/flashcards.ts` - Has some word data logic
- `/lib/spaced-repetition/sm2.ts` - Algorithm to reuse
- `/hooks/useSpacedRepetition.ts` - Pattern to follow

---

## Implementation Status

### Done
- [x] Concept defined
- [x] Data model designed
- [x] Documentation created

### In Progress
- [ ] Nothing yet

### TODO
- [ ] Create `/lib/word-bank/types.ts`
- [ ] Create `/lib/word-bank/storage.ts`
- [ ] Create `/lib/word-bank/priority.ts`
- [ ] Create `/lib/word-bank/hooks.ts`
- [ ] Create vocabulary dashboard screen
- [ ] Create WordCard component
- [ ] Create WordDetailPopup component
- [ ] Connect to existing card components (auto-add words)
- [ ] Add "Add to Bank" button throughout app
- [ ] Test priority calculation
- [ ] Test search/filter

---

## Dependencies

### Requires
- [x] SQLite database (already set up)
- [x] SM-2 algorithm (already implemented)
- [ ] Milestone/Goals system (for priority calculation)

### Required By
- [ ] Lesson Flow (uses prioritized words)
- [ ] AI Conversation (context from user's words)
- [ ] Reading Mode (tap to add words)

---

## Testing

### Manual Test Steps
1. Add a word manually
2. Complete a lesson (words should auto-add)
3. View vocabulary dashboard
4. Search for a word
5. Tap word to see details
6. Check priority updates after review

### Automated Tests
- [ ] Unit tests for priority calculation
- [ ] Integration tests for CRUD operations

---

## Changelog

### 2025-12-02
- Initial documentation created
- Data model designed
- Architecture defined
