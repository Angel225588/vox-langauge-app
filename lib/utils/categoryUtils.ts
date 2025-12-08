/**
 * Category Utilities
 *
 * Helper functions for aggregating vocabulary data into categories
 * for use with the CategoryGrid component.
 */

import { BankWord, VocabularyCategory } from '@/types/vocabulary';

/**
 * Aggregates an array of vocabulary words into category summaries
 * @param words - Array of BankWord objects
 * @returns Array of VocabularyCategory objects ready for CategoryGrid
 */
export function aggregateWordsIntoCategories(words: BankWord[]): VocabularyCategory[] {
  // Create a map to track each category
  const categoryMap = new Map<string, {
    name: string;
    wordCount: number;
    totalMastery: number;
  }>();

  // Aggregate words by category
  words.forEach(word => {
    if (!categoryMap.has(word.category)) {
      categoryMap.set(word.category, {
        name: word.category,
        wordCount: 0,
        totalMastery: 0,
      });
    }

    const category = categoryMap.get(word.category)!;
    category.wordCount++;
    category.totalMastery += word.masteryScore;
  });

  // Convert map to array of VocabularyCategory objects
  const categories: VocabularyCategory[] = Array.from(categoryMap.values())
    .map(cat => ({
      name: cat.name,
      wordCount: cat.wordCount,
      averageMastery: cat.wordCount > 0 ? cat.totalMastery / cat.wordCount : 0,
    }))
    .sort((a, b) => b.wordCount - a.wordCount); // Sort by word count descending

  return categories;
}

/**
 * Filters vocabulary words by category name
 * @param words - Array of BankWord objects
 * @param categoryName - Name of the category to filter by
 * @returns Filtered array of words in that category
 */
export function filterWordsByCategory(words: BankWord[], categoryName: string): BankWord[] {
  return words.filter(word =>
    word.category.toLowerCase() === categoryName.toLowerCase()
  );
}

/**
 * Gets statistics for a specific category
 * @param words - Array of BankWord objects
 * @param categoryName - Name of the category
 * @returns Category statistics or null if category not found
 */
export function getCategoryStats(
  words: BankWord[],
  categoryName: string
): VocabularyCategory | null {
  const categoryWords = filterWordsByCategory(words, categoryName);

  if (categoryWords.length === 0) {
    return null;
  }

  const totalMastery = categoryWords.reduce((sum, word) => sum + word.masteryScore, 0);

  return {
    name: categoryName,
    wordCount: categoryWords.length,
    averageMastery: totalMastery / categoryWords.length,
  };
}

/**
 * Gets the top N categories by word count
 * @param words - Array of BankWord objects
 * @param limit - Number of categories to return (default: 10)
 * @returns Array of top categories
 */
export function getTopCategories(words: BankWord[], limit: number = 10): VocabularyCategory[] {
  const categories = aggregateWordsIntoCategories(words);
  return categories.slice(0, limit);
}

/**
 * Gets categories that need review (low mastery)
 * @param words - Array of BankWord objects
 * @param masteryThreshold - Mastery percentage threshold (default: 60)
 * @returns Array of categories below the mastery threshold
 */
export function getCategoriesNeedingReview(
  words: BankWord[],
  masteryThreshold: number = 60
): VocabularyCategory[] {
  const categories = aggregateWordsIntoCategories(words);
  return categories.filter(cat => cat.averageMastery < masteryThreshold);
}

/**
 * Gets all unique category names from vocabulary words
 * @param words - Array of BankWord objects
 * @returns Array of unique category names
 */
export function getAllCategoryNames(words: BankWord[]): string[] {
  const categorySet = new Set(words.map(word => word.category));
  return Array.from(categorySet).sort();
}

/**
 * Calculates overall vocabulary statistics
 * @param words - Array of BankWord objects
 * @returns Overall statistics object
 */
export function getOverallVocabularyStats(words: BankWord[]) {
  if (words.length === 0) {
    return {
      totalWords: 0,
      totalCategories: 0,
      averageMastery: 0,
      highestMastery: 0,
      lowestMastery: 0,
    };
  }

  const categories = aggregateWordsIntoCategories(words);
  const totalMastery = words.reduce((sum, word) => sum + word.masteryScore, 0);
  const masteryScores = words.map(word => word.masteryScore);

  return {
    totalWords: words.length,
    totalCategories: categories.length,
    averageMastery: totalMastery / words.length,
    highestMastery: Math.max(...masteryScores),
    lowestMastery: Math.min(...masteryScores),
  };
}

/**
 * Example usage with Supabase query results
 *
 * const { data: words } = await supabase
 *   .from('vocabulary_words')
 *   .select('*');
 *
 * const categories = aggregateWordsIntoCategories(words || []);
 *
 * <CategoryGrid
 *   categories={categories}
 *   onCategoryPress={handlePress}
 * />
 */
