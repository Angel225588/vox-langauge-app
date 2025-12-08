# Empty States - Quick Start Guide

Get up and running with empty state components in 5 minutes.

## 1. Import

```tsx
import {
  EmptyWordBank,
  EmptySearchResults,
  EmptyCategoryWords,
  EmptyDueForReview,
} from '@/components/vocabulary';
```

## 2. Basic Usage

### Scenario 1: No Words in Vocabulary

```tsx
function VocabularyScreen() {
  const [words, setWords] = useState([]);

  if (words.length === 0) {
    return (
      <EmptyWordBank
        onAction={() => console.log('Add word')}
        actionLabel="Add Your First Word"
      />
    );
  }

  return <WordList words={words} />;
}
```

### Scenario 2: Search Returns Nothing

```tsx
function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredWords = words.filter(w =>
    w.word.includes(searchQuery)
  );

  if (searchQuery && filteredWords.length === 0) {
    return (
      <EmptySearchResults
        onAction={() => setSearchQuery('')}
        actionLabel="Clear Search"
      />
    );
  }

  return <WordList words={filteredWords} />;
}
```

### Scenario 3: Empty Category

```tsx
function CategoryScreen({ category }) {
  const categoryWords = words.filter(w =>
    w.category === category
  );

  if (categoryWords.length === 0) {
    return (
      <EmptyCategoryWords
        onAction={openAddWordModal}
        actionLabel="Add Words"
      />
    );
  }

  return <WordList words={categoryWords} />;
}
```

### Scenario 4: All Reviews Complete

```tsx
function ReviewScreen() {
  const dueWords = words.filter(w =>
    w.nextReview <= Date.now()
  );

  if (dueWords.length === 0) {
    return (
      <EmptyDueForReview
        onAction={() => navigation.navigate('Vocabulary')}
        actionLabel="Browse Vocabulary"
      />
    );
  }

  return <ReviewSession words={dueWords} />;
}
```

## 3. Without Action Button

Simply omit the `onAction` prop:

```tsx
<EmptySearchResults />
```

## 4. Custom Empty State

```tsx
import { EmptyState } from '@/components/vocabulary';

<EmptyState
  emoji="🎯"
  title="No Favorites"
  description="Mark words as favorites to see them here"
  onAction={handleBrowse}
  actionLabel="Browse Words"
  variant="secondary"
/>
```

## Common Patterns

### Pattern 1: Conditional Rendering

```tsx
const renderContent = () => {
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;
  if (words.length === 0) return <EmptyWordBank onAction={addWord} />;
  return <WordList words={words} />;
};
```

### Pattern 2: Nested Conditions

```tsx
if (words.length === 0) {
  return <EmptyWordBank onAction={addWord} />;
}

if (searchQuery && filteredWords.length === 0) {
  return <EmptySearchResults onAction={clearSearch} />;
}

return <WordList words={filteredWords} />;
```

## Props Reference

| Prop | Type | Required | Default |
|------|------|----------|---------|
| `onAction` | `() => void` | No | - |
| `actionLabel` | `string` | No | Component-specific |

For `EmptyState` (generic):

| Prop | Type | Required | Default |
|------|------|----------|---------|
| `emoji` | `string` | Yes | - |
| `title` | `string` | Yes | - |
| `description` | `string` | Yes | - |
| `onAction` | `() => void` | No | - |
| `actionLabel` | `string` | No | `"Take Action"` |
| `variant` | `'primary' \| 'secondary' \| 'success' \| 'outline'` | No | `'primary'` |

## Features

- ✅ Smooth entrance animations
- ✅ Gradient action buttons
- ✅ Premium design
- ✅ TypeScript support
- ✅ Fully customizable
- ✅ Accessibility built-in

## Next Steps

- See `EmptyStates.example.tsx` for detailed examples
- Read `EmptyStates.README.md` for full documentation
- Check design system at `/constants/designSystem.ts`

## Troubleshooting

**Q: Animation not working?**
A: Ensure `react-native-reanimated` is installed and configured.

**Q: Button not showing?**
A: Make sure you're passing the `onAction` prop.

**Q: Custom styling needed?**
A: Use the generic `EmptyState` component with `variant` prop.

---

That's it! You're ready to use empty states in your Vox Language App. 🚀
