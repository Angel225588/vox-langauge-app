# Word Bank Feature Analysis

**Date:** 2026-01-21
**Analyst:** Claude (Research/Analysis Only)
**Feature:** Vocabulary/Words Tab (`app/(tabs)/vocabulary.tsx`)

---

## 1. Current State

### Location and Entry Point
- **Tab Position:** Tab 2 (labeled "Words" with emoji icon)
- **Main File:** `/app/(tabs)/vocabulary.tsx`
- **Core Library:** `/lib/word-bank/`

### UI/UX Patterns Implemented

#### Header Section
- Title: "My Vocabulary"
- Subtitle: Shows total word count (e.g., "42 words")
- **ViewToggle** component for switching between Grid and List views

#### Stats Bar (Top)
Three gradient stat cards showing:
1. **Total Words** - Primary gradient (indigo/purple)
2. **Due for Review** - Warning gradient (amber)
3. **Avg Mastery** - Success gradient (green)

Animated entry using `FadeInDown` from react-native-reanimated.

#### View Modes

**Grid View (Default)**
- Uses `CategoryGrid` component
- Words aggregated into categories
- Each category card shows:
  - Emoji (mapped from category name)
  - Category name
  - Word count
  - Progress bar (average mastery)
  - Colored gradient background (rotates through 8 color schemes)
- Tapping a category switches to List view filtered by that category

**List View**
- Uses `WordList` component with FlatList
- Search bar at top
- Category filter badge (when filtering)
- Each word item displays:
  - Word and translation (left side)
  - Category label
  - Priority badge (High/Med/Low with gradient colors)
  - Mastery percentage with progress bar
- Long-press to delete with confirmation
- Pull-to-refresh support

#### Modals
1. **Add Word Modal** (FAB button)
   - Fields: Word, Translation, Category
   - Source auto-set to 'manual'
   - Basic validation (requires word and translation)

2. **Word Detail Modal** (tap on word)
   - Shows word and translation
   - Stats grid: Mastery %, Accuracy %, Category, CEFR Level
   - Example sentences (if any)
   - Close button

#### Floating Action Button (FAB)
- Position: Bottom-right corner
- Gradient purple/indigo
- Opens Add Word Modal

### Data Sources

#### Primary Storage: SQLite (Offline-First)
- Table: `word_bank` (defined in `/lib/word-bank/schema.ts`)
- Full CRUD operations in `/lib/word-bank/storage.ts`
- Database managed via expo-sqlite through `dbManager`

#### Word Sources (Where vocabulary comes from):
1. **Manual Entry** - Users add words via FAB button
2. **Reading Practice** - Problem words detected during teleprompter exercises (`lib/reading/wordBankIntegration.ts`)
3. **Lessons** - Words from completed lessons
4. **AI Conversations** - Words from voice practice sessions
5. **Error Recovery** - Words from mistakes in exercises

#### Data Model (BankWord)
Key fields per word:
- `id`, `word`, `translation`, `phonetic`
- `category`, `cefrLevel`, `partOfSpeech`
- `masteryScore` (0-100), `priority` (0-10)
- SM-2 fields: `easeFactor`, `interval`, `repetitions`, `nextReviewDate`
- Performance: `timesCorrect`, `timesIncorrect`, `errorTypes`
- Metadata: `source`, `milestoneTags`, `exampleSentences`, `audioUrl`, `imageUrl`

### SM-2 Integration (Technical Details)

#### Algorithm Implementation
Location: `/lib/word-bank/storage.ts` (recordReview function)

**Quality Ratings (SM-2 Standard):**
- 0 = Complete blackout
- 1 = Incorrect but recognized answer
- 2 = Incorrect but seemed easy
- 3 = Correct with difficulty
- 4 = Correct with hesitation
- 5 = Perfect response

**Interval Calculation:**
```
if correct:
  if repetitions == 0: interval = 1 day
  if repetitions == 1: interval = 6 days
  else: interval = previous_interval * easeFactor
  repetitions++
else:
  repetitions = 0
  interval = 1 day
```

**Ease Factor Update:**
```
EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
EF = max(1.3, EF')
```

#### Priority Algorithm
Location: `/lib/word-bank/priority.ts`

**Formula:**
```
Priority = (milestoneUrgency * 0.3) + (weaknessScore * 0.4) +
           (recencyPenalty * 0.2) + (cefrMatch * 0.1)
```

**Factor Weights:**
- Weakness Score: 40% (highest - focuses on problem words)
- Milestone Urgency: 30% (relevance to user goals)
- Recency Penalty: 20% (time since last review)
- CEFR Match: 10% (appropriate difficulty level)

### React Hooks Available
- `useWordBank()` - Main CRUD operations
- `useWordPriority()` - Priority-sorted word lists
- `useWordSearch()` - Debounced search (300ms)
- `useWordBankStats()` - Aggregate statistics
- `useWord(id)` - Single word operations
- `useReviewSession()` - Practice session management

---

## 2. UX Gaps

### Critical Missing Features

1. **No "Start Practice" Button from Word Bank**
   - Users see words but cannot initiate practice directly
   - Must navigate to Practice tab separately
   - The `VocabularyPracticeScreen` exists but is not connected

2. **Translation Always Visible**
   - Violates CLAUDE.md design rule: "Translations should NEVER be shown automatically"
   - Word items show translation immediately in list view
   - Should require tap to reveal for immersion

3. **No Audio Playback in Word Bank**
   - Words may have `audioUrl` but no play button visible
   - CLAUDE.md states: "Audio buttons should be visible without expanding"

4. **No Bulk Import/Export**
   - Cannot import word lists from external sources
   - No way to share vocabulary between devices
   - Types exist (`BulkImportResult`, `ExportOptions`) but not implemented

5. **Empty Example Sentences for Manual Words**
   - Manual add only captures word + translation + category
   - No option to add example sentences during creation
   - Modal is too basic compared to data model richness

### Medium Priority Gaps

6. **No Sorting Options**
   - Cannot sort by: added date, mastery, next review, alphabetical
   - Always sorted by priority descending

7. **No CEFR Level Filter**
   - Cannot filter words by difficulty level
   - Filter exists in hook but not exposed in UI

8. **Category Management Missing**
   - Cannot rename categories
   - Cannot merge categories
   - Cannot delete empty categories
   - No category suggestions or autocomplete

9. **No Word Edit Functionality**
   - Can only view word details, not edit
   - Must delete and re-add to fix typos

10. **Limited Search Scope**
    - Only searches word and translation
    - Cannot search by category, example sentences, or tags

### Minor Gaps

11. **No Phonetic Display in List**
    - Phonetic data stored but not shown in word list
    - Only visible in detail modal (and even then, missing from detail view)

12. **No "Added From" Indicator**
    - Source field exists but not displayed
    - Users cannot see where they learned a word

13. **No Progress Trends**
    - No charts showing mastery improvement over time
    - No weekly/monthly learning statistics

14. **No Favorites/Pin Feature**
    - Cannot mark important words for quick access

---

## 3. Recommendations (Priority Order)

### 1. Add "Practice Now" Button (High Impact)
**Implementation:**
- Add a prominent "Practice" button to vocabulary screen
- Button appears when `wordsNeedingReview > 0`
- Routes to `/vocab-practice/[id]` or new review session screen
- Use existing `useReviewSession` hook

**UX Flow:**
```
Word Bank Screen
  └── "Practice 5 Words Due" button (bottom, above FAB)
        └── Opens VocabularyPracticeScreen with due words
```

### 2. Implement Tap-to-Reveal Translations (Design Compliance)
**Current:** Translation visible by default in `WordItem`
**Proposed:**
- Show "Tap to reveal" placeholder
- Tap toggles translation visibility
- Persist preference in settings
- Follows CLAUDE.md immersion-first design

### 3. Add Audio Controls to Word List
**Implementation:**
- Add small audio play button to each word item
- Use existing `AudioButton` component from `components/ui/`
- Play audio directly from `word.audioUrl` if available
- Show "No audio" state gracefully

### 4. Enhanced Add Word Modal
**Current fields:** Word, Translation, Category
**Add:**
- CEFR Level dropdown (A1-C2)
- Part of speech picker
- Example sentence input (optional)
- Audio URL input (for power users)
- Category autocomplete from existing categories

### 5. Sort and Filter Bar
**Add controls for:**
- Sort by: Priority, Mastery, Added Date, Alphabetical, Next Review
- Filter by: CEFR Level, Source, Category (multi-select)
- "Due Today" quick filter toggle

---

## 4. Technical Notes

### SM-2 Connection Points

| Hook | SM-2 Fields Used | Purpose |
|------|------------------|---------|
| `useReviewSession` | `nextReviewDate`, `priority` | Selects words for practice |
| `recordReview()` | All SM-2 fields | Updates spaced repetition state |
| `useWordBankStats` | `masteryScore`, `nextReviewDate` | Aggregate learning metrics |

### Priority Recalculation
- Triggered by: `recordReview()`, `recalculateAllPriorities()`
- Uses user's CEFR level for relevance scoring
- Milestone tags boost priority for goal-related words

### Data Flow for New Word
```
Manual Add → addWord() → SQLite storage
                       ↓
              Priority calculated (default 5)
                       ↓
              Appears in word list sorted by priority
```

### Data Flow for Practice
```
User taps "Practice" → useReviewSession(onlyDueWords: true)
                                        ↓
                     getWordsDueForReview() - queries SQLite
                                        ↓
                     Returns words where nextReviewDate <= now
                                        ↓
                     VocabularyCardFlow (5 card variants)
                                        ↓
                     recordReview() - updates SM-2 state
```

### Key Files Reference
| File | Purpose |
|------|---------|
| `/app/(tabs)/vocabulary.tsx` | Main screen component |
| `/lib/word-bank/hooks.ts` | React hooks for data access |
| `/lib/word-bank/storage.ts` | SQLite CRUD + SM-2 logic |
| `/lib/word-bank/priority.ts` | Priority calculation algorithm |
| `/lib/word-bank/types.ts` | TypeScript interfaces |
| `/components/vocabulary/WordList.tsx` | List view component |
| `/components/vocabulary/CategoryGrid.tsx` | Grid view component |
| `/components/vocabulary/EmptyStates.tsx` | Empty state components |

---

## Summary

The Word Bank feature has a solid foundation with:
- Full SM-2 spaced repetition implementation
- Dual view modes (Grid/List)
- Comprehensive data model
- Priority-based learning system

**Critical gaps to address:**
1. No practice initiation from Word Bank (users must navigate away)
2. Translations violate immersion-first design principle
3. No audio playback despite data model support
4. Basic add modal doesn't leverage full data model

**Recommended first fix:** Add "Practice Now" button to connect the Word Bank to the existing VocabularyPracticeScreen, completing the learning loop.
