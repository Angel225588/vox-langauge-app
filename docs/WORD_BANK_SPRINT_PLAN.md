# Word Bank Sprint Plan

**Created**: 2025-12-04
**Approach**: Foundation Slice + Premium Polish (Hybrid)
**Goal**: Build the central nervous system of Vox Language App

---

## Executive Summary

The Word Bank is the foundation that connects all learning features:
- 14 card types feed words INTO the bank
- AI Conversation pulls context FROM the bank
- Reading Teleprompter adds problem words TO the bank
- Priority Engine decides what to practice NEXT

---

## Phase 1: Foundation (Week 1-2)

### Day 1-2: TypeScript Types

**Files to create:**
- `/lib/word-bank/types.ts` - All interfaces and types

**Types to define:**
```typescript
// Core word structure
interface BankWord { ... }

// Priority calculation
interface PriorityFactors { ... }
interface PriorityWeights { ... }

// CRUD operations
interface AddWordInput { ... }
interface UpdateWordInput { ... }
interface WordFilter { ... }

// Query results
interface WordBankStats { ... }
interface PriorityResult { ... }
```

**Acceptance Criteria:**
- [ ] All types exported from index.ts
- [ ] Types match SQLite schema exactly
- [ ] Priority formula types are mathematically complete
- [ ] No `any` types used

---

### Day 3-4: SQLite Schema

**Files to create:**
- `/lib/word-bank/schema.ts` - Table definitions
- `/lib/word-bank/migrations.ts` - Version migrations

**Schema requirements:**
```sql
-- Main table
CREATE TABLE word_bank (
  id TEXT PRIMARY KEY,
  word TEXT NOT NULL,
  translation TEXT NOT NULL,
  -- ... full schema
);

-- Performance indexes
CREATE INDEX idx_priority ON word_bank(cached_priority DESC);
CREATE INDEX idx_next_review ON word_bank(next_review_date);
CREATE INDEX idx_category ON word_bank(category);
CREATE INDEX idx_cefr ON word_bank(cefr_level);
```

**Acceptance Criteria:**
- [ ] Schema supports all BankWord fields
- [ ] Indexes optimized for priority queries
- [ ] Migration system handles version upgrades
- [ ] Schema creation is idempotent

---

### Day 5-6: Priority Algorithm

**Files to create:**
- `/lib/word-bank/priority.ts` - Core algorithm
- `/lib/word-bank/__tests__/priority.test.ts` - Unit tests

**Algorithm:**
```typescript
priority = (milestoneUrgency * 0.3) +
           (weaknessScore * 0.4) +
           (recencyPenalty * 0.2) +
           (cefrMatch * 0.1)
```

**Test cases:**
- [ ] Edge case: all factors at 0
- [ ] Edge case: all factors at 100
- [ ] Weakness score dominates (40% weight)
- [ ] Recent review reduces priority
- [ ] CEFR mismatch lowers priority
- [ ] Priority stays in 0-10 range

**Acceptance Criteria:**
- [ ] Algorithm matches documented formula
- [ ] All edge cases tested
- [ ] Performance: <1ms for single calculation
- [ ] Batch calculation for 1000+ words <100ms

---

### Day 7-8: Storage Operations

**Files to create:**
- `/lib/word-bank/storage.ts` - SQLite CRUD operations

**Operations:**
```typescript
// CRUD
addWord(input: AddWordInput): Promise<BankWord>
getWord(id: string): Promise<BankWord | null>
updateWord(id: string, input: UpdateWordInput): Promise<BankWord>
deleteWord(id: string): Promise<void>

// Queries
getWords(filter?: WordFilter): Promise<BankWord[]>
getWordsByPriority(limit: number): Promise<BankWord[]>
getWordsDueForReview(): Promise<BankWord[]>
searchWords(query: string): Promise<BankWord[]>

// Stats
getWordBankStats(): Promise<WordBankStats>
```

**Acceptance Criteria:**
- [ ] All CRUD operations working
- [ ] Priority sorting is performant
- [ ] Search uses SQLite FTS or LIKE optimization
- [ ] Batch operations supported

---

### Day 9-10: React Hooks

**Files to create:**
- `/lib/word-bank/hooks.ts` - React hooks
- `/lib/word-bank/index.ts` - Public exports

**Hooks:**
```typescript
// Main hook
useWordBank(): {
  words: BankWord[];
  loading: boolean;
  error: Error | null;
  addWord: (input) => Promise<void>;
  updateWord: (id, input) => Promise<void>;
  deleteWord: (id) => Promise<void>;
  refreshWords: () => Promise<void>;
}

// Priority hook
useWordPriority(options?: { limit?: number; cefrLevel?: string }): {
  priorityWords: BankWord[];
  loading: boolean;
  recalculatePriorities: () => Promise<void>;
}

// Search hook
useWordSearch(): {
  results: BankWord[];
  query: string;
  setQuery: (q: string) => void;
  loading: boolean;
}

// Stats hook
useWordBankStats(): {
  stats: WordBankStats;
  loading: boolean;
}
```

**Acceptance Criteria:**
- [ ] Hooks handle loading/error states
- [ ] Hooks are memoized properly
- [ ] Hooks work offline
- [ ] Hooks integrate with existing app patterns

---

## Phase 2: First Working Slice (Week 3)

### Day 11-12: Basic Vocabulary Screen

**Files to create:**
- `/app/(tabs)/vocabulary.tsx` - Main screen
- `/components/vocabulary/WordList.tsx` - List component

**Features:**
- [ ] Display all words in scrollable list
- [ ] Pull-to-refresh
- [ ] Basic word card (word + translation + priority badge)
- [ ] Floating action button to add word

---

### Day 13-14: Add Word Flow

**Files to create:**
- `/components/vocabulary/AddWordModal.tsx`
- `/components/vocabulary/AddWordForm.tsx`

**Features:**
- [ ] Modal to add new word
- [ ] Required fields: word, translation
- [ ] Optional fields: category, CEFR level, example
- [ ] Validation before save
- [ ] Success feedback with haptics

---

### Day 15: Word Detail Popup

**Files to create:**
- `/components/vocabulary/WordDetailPopup.tsx`

**Features:**
- [ ] Tap word to see full details
- [ ] Show all word metadata
- [ ] Edit button
- [ ] Delete button with confirmation
- [ ] Close with swipe down

---

### Day 16-17: Priority Integration

**Features:**
- [ ] Priority badge shows on each word card
- [ ] Sort by priority toggle
- [ ] Recalculate priority on word update
- [ ] Visual priority indicator (color gradient)

---

## Phase 3: Premium Polish (Week 4-5)

### Day 18-20: Glassmorphic Design

**Features:**
- [ ] Glassmorphic card backgrounds
- [ ] Blur effects on modals
- [ ] Gradient borders
- [ ] Glow effects on priority indicators
- [ ] Dark mode optimization

---

### Day 21-23: Micro-interactions

**Features:**
- [ ] Button press scale animations
- [ ] Card swipe gestures
- [ ] Pull-to-refresh custom animation
- [ ] Success/error haptic feedback
- [ ] Loading skeleton animations

---

### Day 24-25: Animation System

**Features:**
- [ ] Entry animations (FadeIn, SlideUp)
- [ ] Exit animations (FadeOut, SlideDown)
- [ ] Shared element transitions
- [ ] Spring physics on interactions
- [ ] Staggered list animations

---

### Day 26-27: Empty/Loading/Error States

**Features:**
- [ ] Premium empty state with illustration
- [ ] Skeleton loading placeholders
- [ ] Error states with retry
- [ ] Offline indicator
- [ ] Success celebrations (confetti on milestones)

---

## Phase 4: Expand Integrations (Week 6+)

### Card Selection Integration
- [ ] Cards pull words from Word Bank
- [ ] Card completion updates word stats
- [ ] Wrong answers increase weakness score

### AI Conversation Integration
- [ ] AI uses word context for conversations
- [ ] New words from AI added to bank
- [ ] Conversation history linked to words

### Reading Teleprompter Integration
- [ ] Problem words auto-add to bank
- [ ] Tap-to-add from reading
- [ ] Source tracking (reading session ID)

---

## File Structure

```
/lib/word-bank/
├── types.ts           # TypeScript interfaces
├── schema.ts          # SQLite schema
├── migrations.ts      # Schema migrations
├── storage.ts         # CRUD operations
├── priority.ts        # Priority algorithm
├── hooks.ts           # React hooks
├── index.ts           # Public exports
└── __tests__/
    ├── priority.test.ts
    ├── storage.test.ts
    └── hooks.test.ts

/components/vocabulary/
├── WordList.tsx
├── WordCard.tsx
├── WordDetailPopup.tsx
├── AddWordModal.tsx
├── AddWordForm.tsx
├── PriorityBadge.tsx
├── WordSearch.tsx
└── EmptyState.tsx

/app/(tabs)/
└── vocabulary.tsx
```

---

## Success Metrics

### Phase 1 Complete When:
- [ ] All types defined and exported
- [ ] SQLite schema created with indexes
- [ ] Priority algorithm tested (100% coverage)
- [ ] All hooks working with mock data

### Phase 2 Complete When:
- [ ] Can add a word manually
- [ ] Can see all words in list
- [ ] Can tap word for details
- [ ] Priority updates correctly

### Phase 3 Complete When:
- [ ] UI looks premium (glassmorphism, animations)
- [ ] Haptic feedback on all interactions
- [ ] Loading states feel polished
- [ ] Dark mode is beautiful

### Phase 4 Complete When:
- [ ] Cards use Word Bank for selection
- [ ] AI Conversation integrates with bank
- [ ] Reading adds words to bank
- [ ] All integrations tested

---

**Let's build this!**
