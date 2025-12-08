/**
 * usePassages Hook
 *
 * React hook for managing reading passages across all sources:
 * curated, AI-generated, and user-imported.
 */

import { useState, useEffect, useCallback } from 'react';
import { Passage } from '@/lib/reading/types';
import {
  CuratedPassage,
  getPassagesByDifficulty as getCuratedByDifficulty,
  getRandomPassage as getRandomCurated,
  searchPassages as searchCurated,
  getAllCuratedPassages,
  getPassagesByCategory as getCuratedByCategory,
  getMostPopularPassages,
} from '@/lib/reading/curatedPassages';
import {
  generatePassage,
  generatePassageWithTargetWords,
  generatePassageBatch,
  getTopicSuggestions,
  PassageGeneratorOptions,
} from '@/lib/reading/passageGenerator';
import {
  UserPassage,
  saveUserPassage,
  getUserPassages,
  getUserPassage,
  deleteUserPassage,
  updateUserPassage,
  searchUserPassages,
  getUserPassagesByDifficulty,
  getUserPassagesByCategory,
  getUserPassageStats,
  validatePassage,
  clearUserPassages,
} from '@/lib/reading/passageStorage';

// ============================================================================
// TYPES
// ============================================================================

export interface UsePassagesReturn {
  // Curated passages
  curatedPassages: CuratedPassage[];
  getCuratedByDifficulty: (difficulty: string) => CuratedPassage[];
  getCuratedByCategory: (category: string) => CuratedPassage[];
  searchCuratedPassages: (query: string) => CuratedPassage[];
  getRandomCuratedPassage: (difficulty?: string) => CuratedPassage | null;
  getPopularPassages: (limit?: number) => CuratedPassage[];

  // User passages
  userPassages: UserPassage[];
  savePassage: (passage: Omit<UserPassage, 'id' | 'sourceType' | 'createdAt'>) => Promise<string>;
  getPassage: (id: string) => Promise<UserPassage | undefined>;
  deletePassage: (id: string) => Promise<boolean>;
  updatePassage: (id: string, updates: Partial<UserPassage>) => Promise<UserPassage | undefined>;
  searchUserPassagesByQuery: (query: string) => Promise<UserPassage[]>;
  getUserPassagesByDifficultyLevel: (difficulty: string) => Promise<UserPassage[]>;
  getUserPassagesByCategoryName: (category: string) => Promise<UserPassage[]>;
  clearAllUserPassages: () => Promise<boolean>;
  getUserStats: () => Promise<any>;

  // AI generation
  generateAIPassage: (options: PassageGeneratorOptions) => Promise<Passage>;
  generateWithWords: (words: string[], difficulty: string) => Promise<Passage>;
  generateBatch: (count: number, options: PassageGeneratorOptions) => Promise<Passage[]>;
  topicSuggestions: string[];
  isGenerating: boolean;

  // Combined operations
  getAllPassages: () => (Passage | CuratedPassage | UserPassage)[];
  getPassagesByDifficulty: (difficulty: string) => (Passage | CuratedPassage | UserPassage)[];
  searchAllPassages: (query: string) => Promise<(Passage | CuratedPassage | UserPassage)[]>;

  // Loading states
  loading: boolean;
  error: string | null;

  // Refresh
  refreshUserPassages: () => Promise<void>;
}

// ============================================================================
// HOOK
// ============================================================================

export function usePassages(): UsePassagesReturn {
  const [userPassages, setUserPassages] = useState<UserPassage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Curated passages (static, always available)
  const curatedPassages = getAllCuratedPassages();
  const topicSuggestions = getTopicSuggestions();

  // Load user passages on mount
  useEffect(() => {
    loadUserPassages();
  }, []);

  // Load user passages
  const loadUserPassages = async () => {
    try {
      setLoading(true);
      setError(null);
      const passages = await getUserPassages();
      setUserPassages(passages);
    } catch (err) {
      console.error('Failed to load user passages:', err);
      setError('Failed to load your custom passages');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // CURATED PASSAGES OPERATIONS
  // ============================================================================

  const getCuratedByDifficultyWrapper = useCallback((difficulty: string): CuratedPassage[] => {
    try {
      return getCuratedByDifficulty(difficulty);
    } catch (err) {
      console.error('Error getting curated passages:', err);
      return [];
    }
  }, []);

  const getCuratedByCategoryWrapper = useCallback((category: string): CuratedPassage[] => {
    try {
      return getCuratedByCategory(category);
    } catch (err) {
      console.error('Error getting passages by category:', err);
      return [];
    }
  }, []);

  const searchCuratedPassagesWrapper = useCallback((query: string): CuratedPassage[] => {
    try {
      return searchCurated(query);
    } catch (err) {
      console.error('Error searching curated passages:', err);
      return [];
    }
  }, []);

  const getRandomCuratedPassageWrapper = useCallback((difficulty?: string): CuratedPassage | null => {
    try {
      return getRandomCurated(difficulty);
    } catch (err) {
      console.error('Error getting random passage:', err);
      return null;
    }
  }, []);

  const getPopularPassagesWrapper = useCallback((limit?: number): CuratedPassage[] => {
    try {
      return getMostPopularPassages(limit);
    } catch (err) {
      console.error('Error getting popular passages:', err);
      return [];
    }
  }, []);

  // ============================================================================
  // USER PASSAGES OPERATIONS
  // ============================================================================

  const savePassageWrapper = useCallback(async (
    passage: Omit<UserPassage, 'id' | 'sourceType' | 'createdAt'>
  ): Promise<string> => {
    try {
      setError(null);
      const id = await saveUserPassage(passage);
      await loadUserPassages(); // Refresh list
      return id;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save passage';
      setError(message);
      throw err;
    }
  }, []);

  const getPassageWrapper = useCallback(async (id: string): Promise<UserPassage | undefined> => {
    try {
      return await getUserPassage(id);
    } catch (err) {
      console.error('Error getting passage:', err);
      return undefined;
    }
  }, []);

  const deletePassageWrapper = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await deleteUserPassage(id);
      if (success) {
        await loadUserPassages(); // Refresh list
      }
      return success;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete passage';
      setError(message);
      throw err;
    }
  }, []);

  const updatePassageWrapper = useCallback(async (
    id: string,
    updates: Partial<UserPassage>
  ): Promise<UserPassage | undefined> => {
    try {
      setError(null);
      const updated = await updateUserPassage(id, updates);
      if (updated) {
        await loadUserPassages(); // Refresh list
      }
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update passage';
      setError(message);
      throw err;
    }
  }, []);

  const searchUserPassagesByQueryWrapper = useCallback(async (query: string): Promise<UserPassage[]> => {
    try {
      return await searchUserPassages(query);
    } catch (err) {
      console.error('Error searching user passages:', err);
      return [];
    }
  }, []);

  const getUserPassagesByDifficultyLevelWrapper = useCallback(async (difficulty: string): Promise<UserPassage[]> => {
    try {
      return await getUserPassagesByDifficulty(difficulty as any);
    } catch (err) {
      console.error('Error getting user passages by difficulty:', err);
      return [];
    }
  }, []);

  const getUserPassagesByCategoryNameWrapper = useCallback(async (category: string): Promise<UserPassage[]> => {
    try {
      return await getUserPassagesByCategory(category);
    } catch (err) {
      console.error('Error getting user passages by category:', err);
      return [];
    }
  }, []);

  const clearAllUserPassagesWrapper = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const success = await clearUserPassages();
      if (success) {
        await loadUserPassages(); // Refresh list
      }
      return success;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to clear passages';
      setError(message);
      throw err;
    }
  }, []);

  const getUserStatsWrapper = useCallback(async () => {
    try {
      return await getUserPassageStats();
    } catch (err) {
      console.error('Error getting user stats:', err);
      return {
        total: 0,
        byDifficulty: {},
        byCategory: {},
        totalWords: 0,
        averageWordCount: 0,
        totalDuration: 0,
      };
    }
  }, []);

  // ============================================================================
  // AI GENERATION OPERATIONS
  // ============================================================================

  const generateAIPassageWrapper = useCallback(async (options: PassageGeneratorOptions): Promise<Passage> => {
    try {
      setIsGenerating(true);
      setError(null);
      const passage = await generatePassage(options);
      return passage;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate passage';
      setError(message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const generateWithWordsWrapper = useCallback(async (
    words: string[],
    difficulty: string
  ): Promise<Passage> => {
    try {
      setIsGenerating(true);
      setError(null);
      const passage = await generatePassageWithTargetWords(words, difficulty as any);
      return passage;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate passage';
      setError(message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const generateBatchWrapper = useCallback(async (
    count: number,
    options: PassageGeneratorOptions
  ): Promise<Passage[]> => {
    try {
      setIsGenerating(true);
      setError(null);
      const passages = await generatePassageBatch(count, options);
      return passages;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate passages';
      setError(message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // ============================================================================
  // COMBINED OPERATIONS
  // ============================================================================

  const getAllPassagesWrapper = useCallback((): (Passage | CuratedPassage | UserPassage)[] => {
    return [...curatedPassages, ...userPassages];
  }, [curatedPassages, userPassages]);

  const getPassagesByDifficultyWrapper = useCallback((
    difficulty: string
  ): (Passage | CuratedPassage | UserPassage)[] => {
    const curated = getCuratedByDifficulty(difficulty);
    const user = userPassages.filter(p => p.difficulty === difficulty);
    return [...curated, ...user];
  }, [userPassages]);

  const searchAllPassagesWrapper = useCallback(async (
    query: string
  ): Promise<(Passage | CuratedPassage | UserPassage)[]> => {
    const curated = searchCurated(query);
    const user = await searchUserPassages(query);
    return [...curated, ...user];
  }, []);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Curated passages
    curatedPassages,
    getCuratedByDifficulty: getCuratedByDifficultyWrapper,
    getCuratedByCategory: getCuratedByCategoryWrapper,
    searchCuratedPassages: searchCuratedPassagesWrapper,
    getRandomCuratedPassage: getRandomCuratedPassageWrapper,
    getPopularPassages: getPopularPassagesWrapper,

    // User passages
    userPassages,
    savePassage: savePassageWrapper,
    getPassage: getPassageWrapper,
    deletePassage: deletePassageWrapper,
    updatePassage: updatePassageWrapper,
    searchUserPassagesByQuery: searchUserPassagesByQueryWrapper,
    getUserPassagesByDifficultyLevel: getUserPassagesByDifficultyLevelWrapper,
    getUserPassagesByCategoryName: getUserPassagesByCategoryNameWrapper,
    clearAllUserPassages: clearAllUserPassagesWrapper,
    getUserStats: getUserStatsWrapper,

    // AI generation
    generateAIPassage: generateAIPassageWrapper,
    generateWithWords: generateWithWordsWrapper,
    generateBatch: generateBatchWrapper,
    topicSuggestions,
    isGenerating,

    // Combined operations
    getAllPassages: getAllPassagesWrapper,
    getPassagesByDifficulty: getPassagesByDifficultyWrapper,
    searchAllPassages: searchAllPassagesWrapper,

    // Loading states
    loading,
    error,

    // Refresh
    refreshUserPassages: loadUserPassages,
  };
}

export default usePassages;
