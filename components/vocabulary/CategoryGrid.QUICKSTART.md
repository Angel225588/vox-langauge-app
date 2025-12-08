# CategoryGrid Quick Start Guide

Get started with the CategoryGrid component in 5 minutes.

## Step 1: Import the Component

```tsx
import { CategoryGrid } from '@/components/vocabulary/CategoryGrid';
import { VocabularyCategory } from '@/types/vocabulary';
```

## Step 2: Prepare Your Data

Your categories should match the `VocabularyCategory` interface:

```tsx
const categories: VocabularyCategory[] = [
  {
    name: 'Greetings',      // Category name
    wordCount: 24,          // Number of words in category
    averageMastery: 85,     // Average mastery score (0-100)
    emoji: '👋',           // Optional custom emoji
  },
  {
    name: 'Food',
    wordCount: 42,
    averageMastery: 62,
    // emoji omitted - will use default 🍽️
  },
];
```

## Step 3: Add the Component

```tsx
function VocabularyScreen() {
  const handleCategoryPress = (categoryName: string) => {
    // Navigate to category detail
    console.log(`Category selected: ${categoryName}`);
  };

  return (
    <CategoryGrid
      categories={categories}
      onCategoryPress={handleCategoryPress}
    />
  );
}
```

## Step 4: Fetch Data from Supabase (Optional)

```tsx
import { aggregateWordsIntoCategories } from '@/lib/utils/categoryUtils';

function VocabularyScreen() {
  const [categories, setCategories] = useState<VocabularyCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      // Fetch all vocabulary words
      const { data: words } = await supabase
        .from('vocabulary_words')
        .select('*');

      // Aggregate into categories
      const cats = aggregateWordsIntoCategories(words || []);
      setCategories(cats);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (categoryName: string) => {
    // Navigate to filtered view
    router.push(`/vocabulary?category=${categoryName}`);
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

## That's It!

You now have a beautiful, animated category grid displaying your vocabulary categories.

## Common Customizations

### Add Pull-to-Refresh

```tsx
<ScrollView
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={colors.primary.DEFAULT}
    />
  }
>
  <CategoryGrid
    categories={categories}
    onCategoryPress={handleCategoryPress}
  />
</ScrollView>
```

### Filter Categories

```tsx
const filteredCategories = categories.filter(cat =>
  cat.name.toLowerCase().includes(searchQuery.toLowerCase())
);

<CategoryGrid
  categories={filteredCategories}
  onCategoryPress={handleCategoryPress}
/>
```

### Custom Emoji Mapping

```tsx
const categoriesWithCustomEmojis = categories.map(cat => ({
  ...cat,
  emoji: myCustomEmojiMap[cat.name] || cat.emoji,
}));
```

## Files Overview

- **Component**: `components/vocabulary/CategoryGrid.tsx`
- **Types**: `types/vocabulary.ts`
- **Utilities**: `lib/utils/categoryUtils.ts`
- **Documentation**: `components/vocabulary/CategoryGrid.README.md`
- **Examples**: `components/vocabulary/CategoryGrid.example.tsx`
- **Integration**: `components/vocabulary/CategoryGrid.integration.example.tsx`
- **Tests**: `components/vocabulary/CategoryGrid.test.tsx`

## Need Help?

Check the full documentation in `CategoryGrid.README.md` or the integration examples in `CategoryGrid.integration.example.tsx`.
