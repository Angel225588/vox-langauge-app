/**
 * CategoryGrid Example Usage
 *
 * This file demonstrates how to use the CategoryGrid component
 * in your Vox language learning app.
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { CategoryGrid } from './CategoryGrid';
import { colors } from '@/constants/designSystem';

export function CategoryGridExample() {
  // Example category data
  const mockCategories = [
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
      // emoji is optional - will use default mapping
    },
    {
      name: 'Travel',
      wordCount: 18,
      averageMastery: 45,
    },
    {
      name: 'Business',
      wordCount: 56,
      averageMastery: 78,
    },
    {
      name: 'Family',
      wordCount: 15,
      averageMastery: 92,
    },
    {
      name: 'Weather',
      wordCount: 12,
      averageMastery: 38,
    },
  ];

  const handleCategoryPress = (categoryName: string) => {
    console.log(`Category pressed: ${categoryName}`);
    // Navigate to category detail screen or filter vocabulary by category
    // Example: router.push(`/vocabulary/category/${categoryName}`);
  };

  return (
    <ScrollView style={styles.container}>
      <CategoryGrid
        categories={mockCategories}
        onCategoryPress={handleCategoryPress}
        loading={false}
      />
    </ScrollView>
  );
}

// Example: Fetching categories from Supabase
export function CategoryGridWithDataExample() {
  const [categories, setCategories] = React.useState<Array<{
    name: string;
    wordCount: number;
    averageMastery: number;
    emoji?: string;
  }>>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);

      // Example: Fetch from your API/Supabase
      // This would aggregate your vocabulary words by category
      // const { data, error } = await supabase
      //   .from('vocabulary_words')
      //   .select('category, mastery_score')

      // Process the data to create category summaries
      // const categoryMap = new Map();
      // data?.forEach(word => {
      //   if (!categoryMap.has(word.category)) {
      //     categoryMap.set(word.category, {
      //       name: word.category,
      //       wordCount: 0,
      //       totalMastery: 0,
      //     });
      //   }
      //   const cat = categoryMap.get(word.category);
      //   cat.wordCount++;
      //   cat.totalMastery += word.mastery_score;
      // });

      // const categories = Array.from(categoryMap.values()).map(cat => ({
      //   name: cat.name,
      //   wordCount: cat.wordCount,
      //   averageMastery: cat.totalMastery / cat.wordCount,
      // }));

      // setCategories(categories);

      // Mock data for demonstration
      setTimeout(() => {
        setCategories([
          { name: 'General', wordCount: 30, averageMastery: 75 },
          { name: 'Travel', wordCount: 25, averageMastery: 60 },
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setLoading(false);
    }
  };

  const handleCategoryPress = (categoryName: string) => {
    // Navigate to filtered vocabulary view
    console.log(`Viewing category: ${categoryName}`);
  };

  return (
    <View style={styles.container}>
      <CategoryGrid
        categories={categories}
        onCategoryPress={handleCategoryPress}
        loading={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
});

// Example integration with Expo Router
// In your app/(tabs)/vocabulary/categories.tsx file:
/*
import { CategoryGrid } from '@/components/vocabulary/CategoryGrid';
import { useVocabularyCategories } from '@/lib/hooks/useVocabularyCategories';

export default function CategoriesScreen() {
  const { categories, loading } = useVocabularyCategories();
  const router = useRouter();

  const handleCategoryPress = (categoryName: string) => {
    router.push({
      pathname: '/vocabulary',
      params: { category: categoryName }
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <CategoryGrid
        categories={categories}
        onCategoryPress={handleCategoryPress}
        loading={loading}
      />
    </View>
  );
}
*/
