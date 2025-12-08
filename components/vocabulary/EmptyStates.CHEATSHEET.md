# EmptyStates - Quick Reference Cheatsheet

One-page reference for all empty state components.

---

## Import

```tsx
import {
  EmptyWordBank,
  EmptySearchResults,
  EmptyCategoryWords,
  EmptyDueForReview,
  EmptyState,
} from '@/components/vocabulary';
```

---

## Components Quick Reference

### 1. EmptyWordBank
```tsx
<EmptyWordBank
  onAction={() => openAddModal()}
  actionLabel="Add Your First Word" // optional
/>
```
- **Emoji:** 📚
- **Use:** No words in vocabulary
- **Button:** Primary gradient

### 2. EmptySearchResults
```tsx
<EmptySearchResults
  onAction={() => setSearchQuery('')}
  actionLabel="Clear Search" // optional
/>
```
- **Emoji:** 🔍
- **Use:** Search returns nothing
- **Button:** Outline

### 3. EmptyCategoryWords
```tsx
<EmptyCategoryWords
  onAction={() => openAddModal()}
  actionLabel="Add Words" // optional
/>
```
- **Emoji:** 📂
- **Use:** Category is empty
- **Button:** Secondary gradient

### 4. EmptyDueForReview
```tsx
<EmptyDueForReview
  onAction={() => navigate('Vocabulary')}
  actionLabel="Browse Vocabulary" // optional
/>
```
- **Emoji:** 🎉
- **Use:** All reviews complete
- **Button:** Outline
- **Special:** Gradient title + success badge

### 5. EmptyState (Generic)
```tsx
<EmptyState
  emoji="🎯"
  title="Custom Title"
  description="Custom description"
  onAction={() => doSomething()}
  actionLabel="Take Action" // optional
  variant="primary" // 'primary' | 'secondary' | 'success' | 'outline'
/>
```
- **Use:** Any custom scenario
- **Fully customizable**

---

## Props

| Prop | Type | Required | Default |
|------|------|----------|---------|
| `onAction` | `() => void` | No | - |
| `actionLabel` | `string` | No | Component-specific |

**EmptyState only:**
| Prop | Type | Required | Default |
|------|------|----------|---------|
| `emoji` | `string` | Yes | - |
| `title` | `string` | Yes | - |
| `description` | `string` | Yes | - |
| `variant` | `'primary' \| 'secondary' \| 'success' \| 'outline'` | No | `'primary'` |

---

## Common Patterns

### Pattern 1: Basic Conditional
```tsx
{words.length === 0 && (
  <EmptyWordBank onAction={addWord} />
)}
```

### Pattern 2: Multiple Conditions
```tsx
if (words.length === 0) {
  return <EmptyWordBank onAction={addWord} />;
}
if (searchQuery && filteredWords.length === 0) {
  return <EmptySearchResults onAction={clearSearch} />;
}
return <WordList words={filteredWords} />;
```

### Pattern 3: Without Action
```tsx
<EmptySearchResults />
// Just omit onAction prop
```

---

## Button Variants

| Variant | Colors | Use For |
|---------|--------|---------|
| `primary` | Indigo → Purple | Primary actions |
| `secondary` | Teal → Turquoise | Secondary actions |
| `success` | Green | Success states |
| `outline` | Transparent + border | Optional actions |

---

## When to Use Each

| Component | Scenario |
|-----------|----------|
| EmptyWordBank | User has zero words |
| EmptySearchResults | Search finds nothing |
| EmptyCategoryWords | Category has no words |
| EmptyDueForReview | No reviews needed |
| EmptyState | Any other case |

---

## Features

- ✅ Smooth FadeInUp animation
- ✅ Spring bounce effect
- ✅ Gradient buttons
- ✅ Large emoji (72px)
- ✅ TypeScript support
- ✅ Optional action buttons
- ✅ Fully responsive
- ✅ WCAG accessible

---

## Files

```
EmptyStates.tsx                      Component code
EmptyStates.README.md                Full docs
EmptyStates.QUICKSTART.md            Quick start
EmptyStates.VISUAL_REFERENCE.md      Visual guide
EmptyStates.example.tsx              Examples
EmptyStates.IMPLEMENTATION_SUMMARY.md Summary
EmptyStates.CHEATSHEET.md            This file
```

---

## Quick Test

```tsx
// Test all components
function TestScreen() {
  return (
    <ScrollView>
      <EmptyWordBank onAction={() => console.log('1')} />
      <EmptySearchResults onAction={() => console.log('2')} />
      <EmptyCategoryWords onAction={() => console.log('3')} />
      <EmptyDueForReview onAction={() => console.log('4')} />
      <EmptyState
        emoji="🌟"
        title="Custom"
        description="Test custom empty state"
        variant="success"
      />
    </ScrollView>
  );
}
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No animation | Check react-native-reanimated installed |
| No gradient | Install expo-linear-gradient |
| Button not working | Verify onAction is a function |
| TypeScript error | Check prop types match interface |

---

**Keep this file handy for quick reference!**

Last Updated: December 2024
