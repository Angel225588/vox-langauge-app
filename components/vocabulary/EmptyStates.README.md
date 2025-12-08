# Empty States Components

Premium empty state components for the Vox Language Learning App vocabulary system.

## Overview

Empty states are crucial for user experience, providing guidance and encouraging action when there's no content to display. These components are designed to be visually appealing, informative, and actionable.

## Components

### 1. EmptyWordBank

Displayed when the user hasn't added any words to their vocabulary bank yet.

**Use case:** Initial state of the vocabulary system

```tsx
import { EmptyWordBank } from '@/components/vocabulary';

<EmptyWordBank
  onAction={handleAddWord}
  actionLabel="Add Your First Word"
/>
```

**Features:**
- 📚 Book emoji illustration
- "Start Your Journey" title
- Encouraging description
- Gradient CTA button (primary gradient)

---

### 2. EmptySearchResults

Displayed when a search query returns no matching words.

**Use case:** Search with no results

```tsx
import { EmptySearchResults } from '@/components/vocabulary';

<EmptySearchResults
  onAction={handleClearSearch}
  actionLabel="Clear Search"
/>
```

**Features:**
- 🔍 Search emoji illustration
- "No Results Found" title
- Helpful suggestion text
- Outline CTA button

---

### 3. EmptyCategoryWords

Displayed when a selected category has no words assigned to it.

**Use case:** Empty category view

```tsx
import { EmptyCategoryWords } from '@/components/vocabulary';

<EmptyCategoryWords
  onAction={handleAddWords}
  actionLabel="Add Words to Category"
/>
```

**Features:**
- 📂 Folder emoji illustration
- "Category Empty" title
- Instructive description
- Gradient CTA button (secondary gradient)

---

### 4. EmptyDueForReview

Displayed when all words have been reviewed and none are currently due.

**Use case:** Review completion state

```tsx
import { EmptyDueForReview } from '@/components/vocabulary';

<EmptyDueForReview
  onAction={handleBrowseVocabulary}
  actionLabel="Browse Vocabulary"
/>
```

**Features:**
- 🎉 Celebration emoji illustration
- "All Caught Up!" gradient title
- Positive reinforcement message
- Success indicator with "You're on track"
- Outline CTA button

---

### 5. EmptyState (Generic)

A flexible component for custom empty state scenarios.

**Use case:** Any custom empty state

```tsx
import { EmptyState } from '@/components/vocabulary';

<EmptyState
  emoji="🌟"
  title="Custom Title"
  description="Custom description text"
  onAction={handleAction}
  actionLabel="Custom Action"
  variant="primary" // 'primary' | 'secondary' | 'success' | 'outline'
/>
```

**Props:**
- `emoji`: Any emoji character
- `title`: Custom title text
- `description`: Custom description text
- `onAction?`: Optional callback function
- `actionLabel?`: Optional button label
- `variant?`: Button style variant

---

## Props Interface

All components share a common props interface:

```typescript
interface EmptyStateProps {
  onAction?: () => void;      // Optional action handler
  actionLabel?: string;        // Optional button label
}
```

For the generic `EmptyState` component:

```typescript
interface GenericEmptyStateProps extends EmptyStateProps {
  emoji: string;              // Emoji illustration
  title: string;              // Title text
  description: string;        // Description text
  variant?: 'primary' | 'secondary' | 'success' | 'outline';
}
```

---

## Design Features

### Visual Design
- **Large emoji illustrations** (72px) for immediate visual recognition
- **Bold, clear titles** (30px) for hierarchy
- **Supportive descriptions** (16px) for context
- **Gradient buttons** for primary actions
- **Outline buttons** for secondary actions
- **Consistent spacing** using design system tokens

### Animations
- **FadeInUp entrance animation** using react-native-reanimated
- **Spring animation** for natural, bouncy feel
- Subtle and non-intrusive

### Color Variants
- **Primary Gradient:** Indigo to Purple (`#6366F1` → `#8B5CF6`)
- **Secondary Gradient:** Teal to Turquoise (`#06D6A0` → `#4ECDC4`)
- **Success Gradient:** Green shades (`#10B981` → `#34D399`)
- **Outline:** Transparent with border

---

## Usage Examples

### Basic Usage

```tsx
import { EmptyWordBank } from '@/components/vocabulary';

function VocabularyScreen() {
  const [words, setWords] = useState([]);

  if (words.length === 0) {
    return (
      <EmptyWordBank
        onAction={() => setModalVisible(true)}
        actionLabel="Add Your First Word"
      />
    );
  }

  return <WordList words={words} />;
}
```

### Conditional Rendering

```tsx
import {
  EmptyWordBank,
  EmptySearchResults,
  EmptyCategoryWords,
} from '@/components/vocabulary';

function VocabularyScreen() {
  const [words, setWords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState(null);

  const renderContent = () => {
    if (words.length === 0 && !searchQuery) {
      return <EmptyWordBank onAction={openAddModal} />;
    }

    if (searchQuery && filteredWords.length === 0) {
      return (
        <EmptySearchResults
          onAction={() => setSearchQuery('')}
        />
      );
    }

    if (category && categoryWords.length === 0) {
      return <EmptyCategoryWords onAction={openAddModal} />;
    }

    return <WordList words={filteredWords} />;
  };

  return renderContent();
}
```

### Without Action Button

```tsx
// Action button is optional - simply omit the onAction prop
<EmptySearchResults />
```

### Custom Empty State

```tsx
<EmptyState
  emoji="🎯"
  title="No Favorite Words"
  description="Mark words as favorites to see them here"
  onAction={handleBrowseAll}
  actionLabel="Browse All Words"
  variant="secondary"
/>
```

---

## Integration Guide

### Step 1: Import

```tsx
import {
  EmptyWordBank,
  EmptySearchResults,
  EmptyCategoryWords,
  EmptyDueForReview,
  EmptyState,
} from '@/components/vocabulary';
```

### Step 2: Add to Component

```tsx
function MyComponent() {
  // Your logic here

  return (
    <View>
      {/* Your condition */}
      {words.length === 0 && (
        <EmptyWordBank
          onAction={handleAddWord}
          actionLabel="Add Word"
        />
      )}
    </View>
  );
}
```

### Step 3: Implement Action Handler

```tsx
const handleAddWord = () => {
  // Open modal, navigate to screen, etc.
  setAddWordModalVisible(true);
};
```

---

## Best Practices

### When to Use Each Component

1. **EmptyWordBank**
   - User's word bank is completely empty
   - First-time user experience
   - After clearing all words

2. **EmptySearchResults**
   - Search query returns no matches
   - Filter produces no results
   - Temporary state, easily reversible

3. **EmptyCategoryWords**
   - User navigates to a category with no words
   - After removing all words from a category
   - Category exists but unused

4. **EmptyDueForReview**
   - All review sessions completed
   - No words meet review criteria
   - Positive, celebratory state

5. **EmptyState (Generic)**
   - Custom scenarios not covered above
   - Specialized features
   - Unique empty states

### Design Principles

1. **Be Helpful:** Explain why the state is empty
2. **Be Encouraging:** Use positive language
3. **Be Actionable:** Provide clear next steps
4. **Be Consistent:** Follow design system patterns
5. **Be Accessible:** Clear text and adequate contrast

### Action Buttons

- **Use gradient buttons** for primary, encouraged actions
- **Use outline buttons** for secondary or optional actions
- **Omit buttons** when no action is needed or available
- **Keep labels short** and action-oriented

---

## Accessibility

- Large, clear text for readability
- High contrast ratios (WCAG AA compliant)
- Descriptive button labels
- Semantic structure
- Touch targets meet minimum size (44x44pt)

---

## Performance

- Lightweight components with minimal re-renders
- Optimized animations using react-native-reanimated
- No heavy computations
- Efficient gradient rendering

---

## Customization

### Changing Button Styles

To customize button appearance, modify the gradient colors in the component:

```tsx
<LinearGradient
  colors={colors.gradients.primary} // Change this
  style={styles.gradientButton}
>
  <Text style={styles.buttonText}>{actionLabel}</Text>
</LinearGradient>
```

### Adjusting Animations

Modify the entrance animation:

```tsx
entering={FadeInUp.delay(200).duration(400).springify()}
```

### Custom Emoji Sizes

Adjust the emoji fontSize in styles:

```tsx
emoji: {
  fontSize: 72, // Change this value
  lineHeight: 80,
}
```

---

## Testing

### Manual Testing Checklist

- [ ] Component renders correctly
- [ ] Animation plays on mount
- [ ] Button press triggers action
- [ ] Button is accessible via keyboard
- [ ] Text is readable in all light conditions
- [ ] Component responds to different screen sizes
- [ ] Action button is optional

### Unit Testing

```tsx
import { render, fireEvent } from '@testing-library/react-native';
import { EmptyWordBank } from './EmptyStates';

test('calls onAction when button pressed', () => {
  const mockAction = jest.fn();
  const { getByText } = render(
    <EmptyWordBank
      onAction={mockAction}
      actionLabel="Add Word"
    />
  );

  fireEvent.press(getByText('Add Word'));
  expect(mockAction).toHaveBeenCalled();
});
```

---

## Troubleshooting

### Animation Not Working

Ensure `react-native-reanimated` is properly configured in your project.

### Gradient Not Rendering

Check that `expo-linear-gradient` is installed:
```bash
npx expo install expo-linear-gradient
```

### Button Not Responding

Verify that `onAction` prop is passed and is a valid function.

---

## Related Components

- **WordCard** - Displays individual vocabulary words
- **CategoryGrid** - Grid view of vocabulary categories
- **WordList** - List view of vocabulary words
- **AddWordModal** - Modal for adding new words

---

## Design System Reference

These components use the Vox Design System tokens from `/constants/designSystem.ts`:

- **Colors:** `colors.gradients`, `colors.text`, `colors.background`
- **Spacing:** `spacing.md`, `spacing.lg`, `spacing.xl`, etc.
- **Typography:** `typography.fontSize`, `typography.fontWeight`
- **Border Radius:** `borderRadius.lg`, `borderRadius.md`
- **Shadows:** `shadows.md`

---

## Version History

### v1.0.0 (Current)
- Initial release
- 4 pre-built empty states
- 1 generic customizable component
- Full animation support
- TypeScript support

---

## Contributing

When adding new empty states:

1. Follow the existing component structure
2. Use design system tokens
3. Include entrance animations
4. Support optional action buttons
5. Add examples to EmptyStates.example.tsx
6. Update this README

---

## Support

For questions or issues:
- Check the example file: `EmptyStates.example.tsx`
- Review existing implementations in the codebase
- Refer to the design system documentation

---

**Last Updated:** December 2024
**Component Path:** `/components/vocabulary/EmptyStates.tsx`
**Design System:** `/constants/designSystem.ts`
