# Vocabulary Components

Components for managing vocabulary in the Vox Language App.

## AddWordModal

Modal wrapper component for adding new words to the vocabulary bank.

### Features
- Slide-up animation with smooth transitions
- Dark semi-transparent backdrop
- Rounded top corners with drag handle
- Close button and swipe-down gesture support
- Haptic feedback on interactions

### Usage

```tsx
import { AddWordModal } from '@/components/vocabulary';
import { BankWord } from '@/lib/word-bank';

function MyComponent() {
  const [modalVisible, setModalVisible] = useState(false);

  const handleWordAdded = (word: BankWord) => {
    console.log('New word added:', word);
    // Update your local state, refresh list, etc.
  };

  return (
    <>
      <Button onPress={() => setModalVisible(true)}>
        Add Word
      </Button>

      <AddWordModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onWordAdded={handleWordAdded}
      />
    </>
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `visible` | `boolean` | Yes | Controls modal visibility |
| `onClose` | `() => void` | Yes | Called when modal should close |
| `onWordAdded` | `(word: BankWord) => void` | No | Called when word is successfully added |

## AddWordForm

Form component for adding new words with all necessary fields.

### Features
- Required fields: word, translation
- Optional fields: category, CEFR level, part of speech, example sentence
- CEFR level horizontal selector (A1-C2)
- Part of speech selector (noun, verb, adjective, etc.)
- Validation with error messages
- Gradient submit button with loading state
- Haptic feedback on success/error

### Usage

```tsx
import { AddWordForm } from '@/components/vocabulary';
import { AddWordInput } from '@/lib/word-bank';

function MyComponent() {
  const handleSubmit = async (input: AddWordInput) => {
    // Handle word submission
    const { addWord } = await import('@/lib/word-bank');
    const newWord = await addWord(input);
    console.log('Word added:', newWord);
  };

  const handleCancel = () => {
    console.log('Form cancelled');
  };

  return (
    <AddWordForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      loading={false}
    />
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onSubmit` | `(input: AddWordInput) => Promise<void>` | Yes | Called when form is submitted |
| `onCancel` | `() => void` | Yes | Called when cancel button is pressed |
| `loading` | `boolean` | No | Shows loading state on submit button |

### Form Fields

1. **Word** (required)
   - Target language word
   - TextInput with validation

2. **Translation** (required)
   - Native language translation
   - TextInput with validation

3. **Category** (optional)
   - Custom category for grouping (e.g., "food", "travel")
   - TextInput

4. **CEFR Level** (optional)
   - Horizontal selector with buttons: A1, A2, B1, B2, C1, C2
   - Visual feedback on selection

5. **Part of Speech** (optional)
   - Selector buttons: Noun, Verb, Adjective, Adverb, Phrase, Other
   - Defaults to "Other"

6. **Example Sentence** (optional)
   - Multiline TextInput
   - 3 lines minimum height

### Validation

The form validates:
- Word field is not empty
- Translation field is not empty
- Shows error message at top of form
- Triggers error haptic feedback

## Design System

Both components use the Vox Language App design system:

### Colors
- Background: `#0F1729` (secondary)
- Card: `#1A1F3A`
- Primary: `#6366F1` (Indigo)
- Text: `#F9FAFB` (primary), `#D1D5DB` (secondary)
- Border: `#374151`

### Typography
- Title: 24px, bold
- Labels: 16px, medium
- Input: 16px, regular

### Spacing
- Container padding: 32px
- Field spacing: 24px
- Button padding: 16px vertical

## Example: Complete Integration

```tsx
import React, { useState } from 'react';
import { View, Button } from 'react-native';
import { AddWordModal } from '@/components/vocabulary';
import { BankWord, useWordBank } from '@/lib/word-bank';

function VocabularyScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const { words, refresh } = useWordBank();

  const handleWordAdded = async (word: BankWord) => {
    console.log('New word added:', word);
    // Refresh word list
    await refresh();
  };

  return (
    <View>
      <Button
        title="Add New Word"
        onPress={() => setModalVisible(true)}
      />

      <AddWordModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onWordAdded={handleWordAdded}
      />

      {/* Rest of your vocabulary screen */}
    </View>
  );
}
```

## PriorityBadge

Visual indicator component showing word priority with color coding.

### Features
- Priority 8-10: Red/urgent (needs practice!)
- Priority 5-7: Yellow/medium
- Priority 0-4: Green/low (mastered)
- Three sizes: sm, md, lg
- Glowing dot indicator
- Numeric priority display

### Usage

```tsx
import { PriorityBadge } from '@/components/vocabulary';

function MyComponent() {
  return (
    <>
      <PriorityBadge priority={9} size="sm" />
      <PriorityBadge priority={6} size="md" />
      <PriorityBadge priority={2} size="lg" />
    </>
  );
}
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `priority` | `number` | Yes | - | Priority level (0-10) |
| `size` | `'sm' \| 'md' \| 'lg'` | No | `'md'` | Badge size |

### Priority Colors

- **0-4 (Low)**: Green (#10B981) - Word is mastered
- **5-7 (Medium)**: Yellow (#F59E0B) - Needs review
- **8-10 (Urgent)**: Red (#EF4444) - Needs practice!

## WordCard

Card component for displaying a word in a list view.

### Features
- Priority badge indicator
- Word and translation display
- CEFR level badge
- Mastery emoji indicator (🏆💪👍📚🌱)
- Category and mastery percentage
- Subtle glow effect for high priority words (priority >= 8)
- Touch feedback with press animation

### Usage

```tsx
import { WordCard } from '@/components/vocabulary';
import { BankWord } from '@/types/vocabulary';

function MyComponent() {
  const word: BankWord = {
    id: '1',
    word: 'bonjour',
    translation: 'hello',
    category: 'Greetings',
    cefrLevel: 'A1',
    partOfSpeech: 'phrase',
    masteryScore: 85,
    priority: 3,
    timesCorrect: 12,
    timesIncorrect: 2,
    source: 'Manual Entry',
    exampleSentences: ['Bonjour, comment ça va?'],
    addedAt: '2025-12-01T10:00:00Z',
    nextReviewDate: '2025-12-05T10:00:00Z',
  };

  return (
    <WordCard
      word={word}
      onPress={() => console.log('Card pressed')}
    />
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `word` | `BankWord` | Yes | Word data object |
| `onPress` | `() => void` | Yes | Called when card is pressed |

### Layout Structure

```
┌─────────────────────────────────────────┐
│ [●8] bonjour                 [A1] 💪   │
│      hello                              │
│      Greetings · 85% mastery            │
└─────────────────────────────────────────┘
```

## WordDetailPopup

Full-screen modal showing comprehensive word details.

### Features
- Dark backdrop with transparency
- Scrollable content area
- Close button with X icon
- Phonetic pronunciation with audio icon
- Priority badge display
- CEFR level and category info
- Part of speech display
- Learning stats section with:
  - Mastery progress bar (color-coded)
  - Correct/incorrect counts
  - Next review date
- Example sentences with styled cards
- Source attribution
- Edit and Delete action buttons
- Responsive date formatting (Today, Tomorrow, or date)

### Usage

```tsx
import { useState } from 'react';
import { WordDetailPopup } from '@/components/vocabulary';
import { BankWord } from '@/types/vocabulary';

function MyComponent() {
  const [selectedWord, setSelectedWord] = useState<BankWord | null>(null);
  const [popupVisible, setPopupVisible] = useState(false);

  const handleDelete = (id: string) => {
    console.log('Delete word:', id);
    // Perform delete operation
    setPopupVisible(false);
  };

  const handleEdit = (word: BankWord) => {
    console.log('Edit word:', word);
    // Open edit form
    setPopupVisible(false);
  };

  return (
    <>
      {/* Your word list or cards */}
      <WordCard
        word={someWord}
        onPress={() => {
          setSelectedWord(someWord);
          setPopupVisible(true);
        }}
      />

      <WordDetailPopup
        word={selectedWord}
        visible={popupVisible}
        onClose={() => setPopupVisible(false)}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    </>
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `word` | `BankWord \| null` | Yes | Word data to display |
| `visible` | `boolean` | Yes | Controls modal visibility |
| `onClose` | `() => void` | Yes | Called when modal should close |
| `onDelete` | `(id: string) => void` | No | Called when delete button is pressed |
| `onEdit` | `(word: BankWord) => void` | No | Called when edit button is pressed |

### Layout Structure

```
┌─────────────────────────────────────────┐
│                                    [X]  │
│                                         │
│           bonjour                       │
│           /bɔ̃.ʒuʁ/  🔊                 │
│                                         │
│           "hello"                       │
│                                         │
├─────────────────────────────────────────┤
│ Level: A1        Category: Greetings    │
│ Part of Speech: phrase                  │
├─────────────────────────────────────────┤
│ 📊 Learning Stats                       │
│ ┌─────────────────────────────────────┐ │
│ │ Mastery: ████████░░ 85%             │ │
│ │ Correct: 12  Incorrect: 2           │ │
│ │ Next Review: Tomorrow               │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ 📝 Example                              │
│ "Bonjour, comment ça va?"              │
├─────────────────────────────────────────┤
│ [Edit]                    [Delete]      │
└─────────────────────────────────────────┘
```

## BankWord Type

All vocabulary components use the `BankWord` type:

```typescript
interface BankWord {
  id: string;
  word: string;
  translation: string;
  phonetic?: string;
  category: string;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  partOfSpeech: string;
  masteryScore: number;      // 0-100
  priority: number;          // 0-10
  timesCorrect: number;
  timesIncorrect: number;
  source: string;
  exampleSentences: string[];
  addedAt: string;
  nextReviewDate: string;
}
```

## Complete Example: Vocabulary List with Details

```tsx
import React, { useState } from 'react';
import { View, FlatList } from 'react-native';
import { WordCard, WordDetailPopup } from '@/components/vocabulary';
import { BankWord } from '@/types/vocabulary';

function VocabularyListScreen() {
  const [words, setWords] = useState<BankWord[]>([]);
  const [selectedWord, setSelectedWord] = useState<BankWord | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const handleCardPress = (word: BankWord) => {
    setSelectedWord(word);
    setDetailVisible(true);
  };

  const handleDelete = async (id: string) => {
    // Delete word from database
    setWords(words.filter(w => w.id !== id));
    setDetailVisible(false);
  };

  const handleEdit = (word: BankWord) => {
    // Open edit modal
    console.log('Edit:', word);
    setDetailVisible(false);
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={words}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <WordCard
            word={item}
            onPress={() => handleCardPress(item)}
          />
        )}
      />

      <WordDetailPopup
        word={selectedWord}
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    </View>
  );
}
```

## Dependencies

- `react-native`: Core UI components
- `react-native-reanimated`: Animations
- `expo-linear-gradient`: Gradient buttons
- `expo-haptics`: Haptic feedback
- `@/lib/word-bank`: Word bank system
- `@/constants/designSystem`: Design tokens
- `@/types/vocabulary`: BankWord type definition
