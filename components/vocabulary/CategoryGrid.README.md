# CategoryGrid Component

A premium, visually appealing grid component for displaying vocabulary categories in the Vox language learning app.

## Features

- **Glassmorphic Design**: Beautiful blur effects with transparency overlays
- **Gradient Backgrounds**: Each category card features unique gradient combinations
- **Animated Entrance**: Staggered FadeInUp animations using react-native-reanimated
- **Progress Indicators**: Visual mastery progress bars with color coding
- **Responsive Grid**: 2-column layout with proper spacing
- **Loading States**: Built-in loading and empty state handling
- **TypeScript**: Full type safety with shared types

## Installation

The component uses the following dependencies (already included in the project):

```bash
npm install react-native-reanimated expo-linear-gradient
```

## Usage

### Basic Example

```tsx
import { CategoryGrid } from '@/components/vocabulary/CategoryGrid';

function VocabularyScreen() {
  const categories = [
    {
      name: 'Greetings',
      wordCount: 24,
      averageMastery: 85,
      emoji: '👋',
    },
    {
      name: 'Food',
      wordCount: 42,
      averageMastery: 62,
    },
  ];

  const handleCategoryPress = (categoryName: string) => {
    // Navigate to category detail or filter vocabulary
    router.push(`/vocabulary?category=${categoryName}`);
  };

  return (
    <CategoryGrid
      categories={categories}
      onCategoryPress={handleCategoryPress}
    />
  );
}
```

### With Loading State

```tsx
function VocabularyScreen() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    // Fetch data...
    setCategories(data);
    setLoading(false);
  };

  return (
    <CategoryGrid
      categories={categories}
      onCategoryPress={handleCategoryPress}
      loading={loading}
    />
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `categories` | `VocabularyCategory[]` | Yes | - | Array of category objects to display |
| `onCategoryPress` | `(categoryName: string) => void` | Yes | - | Callback when a category card is pressed |
| `loading` | `boolean` | No | `false` | Shows loading spinner when true |

### VocabularyCategory Type

```typescript
interface VocabularyCategory {
  name: string;           // Category name (e.g., "Greetings")
  wordCount: number;      // Total words in this category
  averageMastery: number; // Average mastery score (0-100)
  emoji?: string;         // Optional custom emoji (falls back to default mapping)
}
```

## Category Emoji Mapping

The component automatically assigns emojis based on category names:

| Category | Emoji |
|----------|-------|
| general | 📚 |
| greetings | 👋 |
| food | 🍽️ |
| travel | ✈️ |
| business | 💼 |
| family | 👨‍👩‍👧 |
| emotions | 😊 |
| weather | 🌤️ |
| colors | 🎨 |
| numbers | 🔢 |
| animals | 🐾 |
| default | 📖 |

You can override the default emoji by providing a custom `emoji` property in your category data.

## Gradient Colors

The component cycles through 8 different gradient combinations:

1. Indigo to Purple
2. Teal to Turquoise
3. Pink
4. Amber
5. Purple to Pink
6. Cyan to Blue
7. Amber to Orange
8. Green to Teal

Gradients are assigned based on the category's index position, ensuring visual variety.

## Mastery Color Coding

Progress bars are color-coded based on mastery level:

- **80-100%**: Green (Success)
- **60-79%**: Amber (Warning)
- **40-59%**: Orange (Attention)
- **0-39%**: Red (Needs Work)

## Animation

Each category card animates into view with:
- **FadeInUp**: Smooth upward fade transition
- **Staggered Delay**: 100ms delay between each card
- **Spring Physics**: Natural, bouncy animation feel

## Styling

The component uses the Vox design system from `@/constants/designSystem`:

- **Colors**: Premium gradients and semantic colors
- **Spacing**: Consistent spacing tokens
- **Typography**: Type scale and font weights
- **Shadows**: Elevation and depth effects
- **Border Radius**: Smooth, rounded corners

## States

### Loading State
Displays a centered activity indicator while `loading={true}`.

### Empty State
Shows a friendly empty state when `categories` array is empty:
- Large emoji (📚)
- "No categories yet" title
- "Add words to create your first category" subtitle

### Error Handling
The component gracefully handles:
- Missing emoji (uses default mapping)
- Invalid mastery scores (clamps to 0-100%)
- Empty category names (displays with ellipsis)

## Integration Examples

### With Supabase

```tsx
async function fetchCategories() {
  const { data, error } = await supabase
    .from('vocabulary_words')
    .select('category, mastery_score');

  if (error) throw error;

  // Aggregate by category
  const categoryMap = new Map();
  data.forEach(word => {
    if (!categoryMap.has(word.category)) {
      categoryMap.set(word.category, {
        name: word.category,
        wordCount: 0,
        totalMastery: 0,
      });
    }
    const cat = categoryMap.get(word.category);
    cat.wordCount++;
    cat.totalMastery += word.mastery_score;
  });

  return Array.from(categoryMap.values()).map(cat => ({
    name: cat.name,
    wordCount: cat.wordCount,
    averageMastery: cat.totalMastery / cat.wordCount,
  }));
}
```

### With Expo Router

```tsx
import { useRouter } from 'expo-router';

function CategoriesScreen() {
  const router = useRouter();

  const handleCategoryPress = (categoryName: string) => {
    router.push({
      pathname: '/vocabulary',
      params: { category: categoryName }
    });
  };

  return (
    <CategoryGrid
      categories={categories}
      onCategoryPress={handleCategoryPress}
    />
  );
}
```

## Accessibility

- Touchable areas meet minimum size requirements (aspect ratio 1:1)
- Text uses high contrast against gradient backgrounds with text shadows
- Loading and empty states provide clear feedback
- Category names are capitalized for readability

## Performance

- Uses `FlatList`-style rendering (virtual DOM optimizations)
- Memoized gradient calculations
- Lightweight LinearGradient implementation
- Efficient reanimated animations (runs on UI thread)

## Browser/Platform Support

- iOS: Full support
- Android: Full support
- Web: Full support (via react-native-web)

## Files

- **Component**: `/components/vocabulary/CategoryGrid.tsx`
- **Types**: `/types/vocabulary.ts` (VocabularyCategory interface)
- **Examples**: `/components/vocabulary/CategoryGrid.example.tsx`
- **Design System**: `/constants/designSystem.ts`

## Related Components

- `WordCard` - Individual word display
- `WordList` - List of vocabulary words
- `PriorityBadge` - Priority indicator for words

## Contributing

When modifying this component:

1. Maintain TypeScript type safety
2. Follow the Vox design system
3. Test on iOS and Android
4. Ensure animations remain smooth (60fps)
5. Update this README with changes
