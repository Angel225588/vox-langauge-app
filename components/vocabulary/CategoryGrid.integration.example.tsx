/**
 * CategoryGrid Integration Example
 *
 * Complete example showing how to integrate CategoryGrid
 * into a real vocabulary management screen with Supabase.
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { CategoryGrid } from './CategoryGrid';
import { VocabularyCategory, BankWord } from '@/types/vocabulary';
import { colors, spacing, typography } from '@/constants/designSystem';
import { aggregateWordsIntoCategories } from '@/lib/utils/categoryUtils';

/**
 * EXAMPLE 1: Using with Supabase
 */
export function VocabularyCategoriesScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<VocabularyCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all vocabulary words from Supabase
      // const { data: words, error: supabaseError } = await supabase
      //   .from('vocabulary_words')
      //   .select('*')
      //   .order('category', { ascending: true });

      // if (supabaseError) throw supabaseError;

      // Aggregate words into categories
      // const aggregatedCategories = aggregateWordsIntoCategories(words || []);
      // setCategories(aggregatedCategories);

      // Mock data for demonstration
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCategories([
        { name: 'Greetings', wordCount: 24, averageMastery: 85, emoji: '👋' },
        { name: 'Food', wordCount: 42, averageMastery: 62, emoji: '🍽️' },
        { name: 'Travel', wordCount: 18, averageMastery: 45, emoji: '✈️' },
        { name: 'Business', wordCount: 56, averageMastery: 78, emoji: '💼' },
      ]);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (categoryName: string) => {
    // Navigate to vocabulary list filtered by category
    router.push({
      pathname: '/vocabulary/words',
      params: { category: categoryName }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vocabulary Categories</Text>
        <Text style={styles.subtitle}>Browse words by category</Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <CategoryGrid
            categories={categories}
            onCategoryPress={handleCategoryPress}
            loading={loading}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

/**
 * EXAMPLE 2: Using with React Context
 */
interface VocabularyContextType {
  words: BankWord[];
  categories: VocabularyCategory[];
  loading: boolean;
  refreshWords: () => Promise<void>;
}

// Assume you have a VocabularyContext provider
// const VocabularyContext = createContext<VocabularyContextType | null>(null);

export function CategoriesScreenWithContext() {
  const router = useRouter();
  // const { categories, loading } = useContext(VocabularyContext)!;

  // Mock data for demonstration
  const categories: VocabularyCategory[] = [
    { name: 'General', wordCount: 30, averageMastery: 75 },
  ];
  const loading = false;

  const handleCategoryPress = (categoryName: string) => {
    router.push({
      pathname: '/vocabulary/words',
      params: { category: categoryName }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <CategoryGrid
        categories={categories}
        onCategoryPress={handleCategoryPress}
        loading={loading}
      />
    </SafeAreaView>
  );
}

/**
 * EXAMPLE 3: Using with Custom Hook
 */
function useVocabularyCategories() {
  const [categories, setCategories] = useState<VocabularyCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      // Fetch and aggregate data
      // const words = await fetchVocabularyWords();
      // const cats = aggregateWordsIntoCategories(words);
      // setCategories(cats);

      // Mock data
      setCategories([
        { name: 'Travel', wordCount: 25, averageMastery: 60 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const refreshCategories = () => {
    return loadCategories();
  };

  return { categories, loading, refreshCategories };
}

export function CategoriesScreenWithHook() {
  const router = useRouter();
  const { categories, loading, refreshCategories } = useVocabularyCategories();

  const handleCategoryPress = (categoryName: string) => {
    router.push({
      pathname: '/vocabulary/words',
      params: { category: categoryName }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <CategoryGrid
        categories={categories}
        onCategoryPress={handleCategoryPress}
        loading={loading}
      />
    </SafeAreaView>
  );
}

/**
 * EXAMPLE 4: Using with Pull-to-Refresh
 */
import { RefreshControl } from 'react-native';

export function CategoriesScreenWithRefresh() {
  const router = useRouter();
  const [categories, setCategories] = useState<VocabularyCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      // Load data...
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCategories([
        { name: 'Food', wordCount: 42, averageMastery: 62 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  };

  const handleCategoryPress = (categoryName: string) => {
    router.push({
      pathname: '/vocabulary/words',
      params: { category: categoryName }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
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
          loading={loading}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * EXAMPLE 5: Using with Search/Filter
 */
export function CategoriesScreenWithFilter() {
  const router = useRouter();
  const [allCategories, setAllCategories] = useState<VocabularyCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<VocabularyCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [searchQuery, allCategories]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      // Load data...
      const cats: VocabularyCategory[] = [
        { name: 'Greetings', wordCount: 24, averageMastery: 85 },
        { name: 'Food', wordCount: 42, averageMastery: 62 },
        { name: 'Travel', wordCount: 18, averageMastery: 45 },
      ];
      setAllCategories(cats);
      setFilteredCategories(cats);
    } finally {
      setLoading(false);
    }
  };

  const filterCategories = () => {
    if (!searchQuery.trim()) {
      setFilteredCategories(allCategories);
      return;
    }

    const filtered = allCategories.filter(cat =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCategories(filtered);
  };

  const handleCategoryPress = (categoryName: string) => {
    router.push({
      pathname: '/vocabulary/words',
      params: { category: categoryName }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Add your search input component here */}
      <CategoryGrid
        categories={filteredCategories}
        onCategoryPress={handleCategoryPress}
        loading={loading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.error.DEFAULT,
    textAlign: 'center',
  },
});
