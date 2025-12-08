/**
 * Passage Storage
 *
 * Store and manage user-imported passages locally using AsyncStorage.
 * Provides CRUD operations for custom reading content.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Passage } from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = '@vox_user_passages';

// ============================================================================
// TYPES
// ============================================================================

export interface UserPassage extends Passage {
  sourceType: 'user_imported';
}

// ============================================================================
// STORAGE OPERATIONS
// ============================================================================

/**
 * Save a user-imported passage
 *
 * @param passage - Passage to save (id will be generated if not provided)
 * @returns The passage ID
 *
 * @example
 * ```ts
 * const id = await saveUserPassage({
 *   title: 'My Custom Text',
 *   text: 'This is my custom reading passage...',
 *   difficulty: 'intermediate',
 *   category: 'custom'
 * });
 * ```
 */
export async function saveUserPassage(
  passage: Omit<UserPassage, 'id' | 'sourceType' | 'createdAt'> & { id?: string }
): Promise<string> {
  try {
    const passages = await getUserPassages();

    const newPassage: UserPassage = {
      id: passage.id || generatePassageId(),
      title: passage.title,
      text: passage.text,
      difficulty: passage.difficulty,
      category: passage.category || 'custom',
      wordCount: passage.wordCount || countWords(passage.text),
      estimatedDuration: passage.estimatedDuration || estimateReadingTime(passage.text),
      sourceType: 'user_imported',
      targetWords: passage.targetWords,
      createdAt: new Date().toISOString(),
    };

    // Add to beginning of array (most recent first)
    passages.unshift(newPassage);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(passages));

    console.log('Saved user passage:', {
      id: newPassage.id,
      title: newPassage.title,
      wordCount: newPassage.wordCount,
    });

    return newPassage.id;

  } catch (error) {
    console.error('Failed to save user passage:', error);
    throw new Error('Failed to save passage. Please try again.');
  }
}

/**
 * Get all user passages
 *
 * @returns Array of user-imported passages (most recent first)
 *
 * @example
 * ```ts
 * const myPassages = await getUserPassages();
 * console.log(`You have ${myPassages.length} custom passages`);
 * ```
 */
export async function getUserPassages(): Promise<UserPassage[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);

    if (!data) {
      return [];
    }

    const passages: UserPassage[] = JSON.parse(data);
    return passages;

  } catch (error) {
    console.error('Failed to get user passages:', error);
    return [];
  }
}

/**
 * Get a specific user passage by ID
 *
 * @param id - Passage ID
 * @returns The passage, or undefined if not found
 *
 * @example
 * ```ts
 * const passage = await getUserPassage('passage_123');
 * if (passage) {
 *   console.log('Found:', passage.title);
 * }
 * ```
 */
export async function getUserPassage(id: string): Promise<UserPassage | undefined> {
  try {
    const passages = await getUserPassages();
    return passages.find(p => p.id === id);
  } catch (error) {
    console.error('Failed to get user passage:', error);
    return undefined;
  }
}

/**
 * Delete a user passage
 *
 * @param id - ID of passage to delete
 * @returns True if deleted, false if not found
 *
 * @example
 * ```ts
 * const deleted = await deleteUserPassage('passage_123');
 * if (deleted) {
 *   console.log('Passage deleted successfully');
 * }
 * ```
 */
export async function deleteUserPassage(id: string): Promise<boolean> {
  try {
    const passages = await getUserPassages();
    const initialLength = passages.length;

    const filteredPassages = passages.filter(p => p.id !== id);

    if (filteredPassages.length === initialLength) {
      // Passage not found
      return false;
    }

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredPassages));

    console.log('Deleted user passage:', id);
    return true;

  } catch (error) {
    console.error('Failed to delete user passage:', error);
    throw new Error('Failed to delete passage. Please try again.');
  }
}

/**
 * Update a user passage
 *
 * @param id - ID of passage to update
 * @param updates - Fields to update
 * @returns Updated passage, or undefined if not found
 *
 * @example
 * ```ts
 * const updated = await updateUserPassage('passage_123', {
 *   title: 'Updated Title',
 *   difficulty: 'advanced'
 * });
 * ```
 */
export async function updateUserPassage(
  id: string,
  updates: Partial<Omit<UserPassage, 'id' | 'sourceType' | 'createdAt'>>
): Promise<UserPassage | undefined> {
  try {
    const passages = await getUserPassages();
    const index = passages.findIndex(p => p.id === id);

    if (index === -1) {
      return undefined;
    }

    // Update the passage
    const updatedPassage: UserPassage = {
      ...passages[index],
      ...updates,
      // Recalculate word count and duration if text changed
      wordCount: updates.text ? countWords(updates.text) : passages[index].wordCount,
      estimatedDuration: updates.text
        ? estimateReadingTime(updates.text)
        : passages[index].estimatedDuration,
    };

    passages[index] = updatedPassage;

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(passages));

    console.log('Updated user passage:', {
      id: updatedPassage.id,
      title: updatedPassage.title,
    });

    return updatedPassage;

  } catch (error) {
    console.error('Failed to update user passage:', error);
    throw new Error('Failed to update passage. Please try again.');
  }
}

/**
 * Delete all user passages
 *
 * @returns True if successful
 *
 * @example
 * ```ts
 * await clearUserPassages();
 * console.log('All custom passages deleted');
 * ```
 */
export async function clearUserPassages(): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('Cleared all user passages');
    return true;
  } catch (error) {
    console.error('Failed to clear user passages:', error);
    throw new Error('Failed to clear passages. Please try again.');
  }
}

/**
 * Search user passages
 *
 * @param query - Search query (searches title, text, and category)
 * @returns Matching passages
 *
 * @example
 * ```ts
 * const results = await searchUserPassages('cooking');
 * ```
 */
export async function searchUserPassages(query: string): Promise<UserPassage[]> {
  try {
    const passages = await getUserPassages();
    const lowercaseQuery = query.toLowerCase();

    return passages.filter(passage => {
      const titleMatch = passage.title.toLowerCase().includes(lowercaseQuery);
      const textMatch = passage.text.toLowerCase().includes(lowercaseQuery);
      const categoryMatch = passage.category.toLowerCase().includes(lowercaseQuery);

      return titleMatch || textMatch || categoryMatch;
    });
  } catch (error) {
    console.error('Failed to search user passages:', error);
    return [];
  }
}

/**
 * Get user passages by difficulty
 *
 * @param difficulty - Difficulty level
 * @returns Passages at that difficulty
 *
 * @example
 * ```ts
 * const advanced = await getUserPassagesByDifficulty('advanced');
 * ```
 */
export async function getUserPassagesByDifficulty(
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): Promise<UserPassage[]> {
  try {
    const passages = await getUserPassages();
    return passages.filter(p => p.difficulty === difficulty);
  } catch (error) {
    console.error('Failed to get passages by difficulty:', error);
    return [];
  }
}

/**
 * Get user passages by category
 *
 * @param category - Category name
 * @returns Passages in that category
 *
 * @example
 * ```ts
 * const workPassages = await getUserPassagesByCategory('work');
 * ```
 */
export async function getUserPassagesByCategory(category: string): Promise<UserPassage[]> {
  try {
    const passages = await getUserPassages();
    return passages.filter(p => p.category.toLowerCase() === category.toLowerCase());
  } catch (error) {
    console.error('Failed to get passages by category:', error);
    return [];
  }
}

/**
 * Get user passage statistics
 *
 * @returns Statistics about user's custom passages
 *
 * @example
 * ```ts
 * const stats = await getUserPassageStats();
 * console.log(`Total: ${stats.total}, Average words: ${stats.averageWordCount}`);
 * ```
 */
export async function getUserPassageStats(): Promise<{
  total: number;
  byDifficulty: Record<string, number>;
  byCategory: Record<string, number>;
  totalWords: number;
  averageWordCount: number;
  totalDuration: number;
}> {
  try {
    const passages = await getUserPassages();

    const byDifficulty: Record<string, number> = {
      beginner: 0,
      intermediate: 0,
      advanced: 0,
    };

    const byCategory: Record<string, number> = {};
    let totalWords = 0;
    let totalDuration = 0;

    passages.forEach(passage => {
      byDifficulty[passage.difficulty]++;
      byCategory[passage.category] = (byCategory[passage.category] || 0) + 1;
      totalWords += passage.wordCount;
      totalDuration += passage.estimatedDuration;
    });

    return {
      total: passages.length,
      byDifficulty,
      byCategory,
      totalWords,
      averageWordCount: passages.length > 0 ? Math.round(totalWords / passages.length) : 0,
      totalDuration,
    };

  } catch (error) {
    console.error('Failed to get passage stats:', error);
    return {
      total: 0,
      byDifficulty: { beginner: 0, intermediate: 0, advanced: 0 },
      byCategory: {},
      totalWords: 0,
      averageWordCount: 0,
      totalDuration: 0,
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate unique passage ID
 */
function generatePassageId(): string {
  return `user_passage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Count words in text
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Estimate reading time in seconds
 * Assumes average reading speed of ~3 words per second
 */
function estimateReadingTime(text: string): number {
  const wordCount = countWords(text);
  return Math.ceil(wordCount / 3);
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate passage data before saving
 *
 * @param passage - Passage to validate
 * @returns Validation result with errors if any
 *
 * @example
 * ```ts
 * const validation = validatePassage(passage);
 * if (!validation.valid) {
 *   console.error('Errors:', validation.errors);
 * }
 * ```
 */
export function validatePassage(passage: Partial<UserPassage>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required fields
  if (!passage.title || passage.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!passage.text || passage.text.trim().length === 0) {
    errors.push('Text content is required');
  }

  // Minimum word count
  if (passage.text && countWords(passage.text) < 20) {
    errors.push('Passage must be at least 20 words long');
  }

  // Maximum word count
  if (passage.text && countWords(passage.text) > 1000) {
    errors.push('Passage must be less than 1000 words');
  }

  // Valid difficulty
  if (passage.difficulty && !['beginner', 'intermediate', 'advanced'].includes(passage.difficulty)) {
    errors.push('Invalid difficulty level');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Export passages to JSON (for backup/sharing)
 *
 * @returns JSON string of all user passages
 */
export async function exportUserPassages(): Promise<string> {
  try {
    const passages = await getUserPassages();
    return JSON.stringify(passages, null, 2);
  } catch (error) {
    console.error('Failed to export passages:', error);
    throw new Error('Failed to export passages');
  }
}

/**
 * Import passages from JSON (for restore/sharing)
 *
 * @param jsonData - JSON string of passages to import
 * @param merge - If true, merge with existing passages. If false, replace all.
 * @returns Number of passages imported
 */
export async function importUserPassages(jsonData: string, merge: boolean = true): Promise<number> {
  try {
    const newPassages: UserPassage[] = JSON.parse(jsonData);

    // Validate all passages
    for (const passage of newPassages) {
      const validation = validatePassage(passage);
      if (!validation.valid) {
        throw new Error(`Invalid passage: ${validation.errors.join(', ')}`);
      }
    }

    if (merge) {
      const existingPassages = await getUserPassages();
      const allPassages = [...newPassages, ...existingPassages];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allPassages));
    } else {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPassages));
    }

    console.log(`Imported ${newPassages.length} passages`);
    return newPassages.length;

  } catch (error) {
    console.error('Failed to import passages:', error);
    throw new Error('Failed to import passages. Please check the file format.');
  }
}
