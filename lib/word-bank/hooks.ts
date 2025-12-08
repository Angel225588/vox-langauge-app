/**
 * Word Bank React Hooks
 *
 * Custom hooks for interacting with the Word Bank system.
 * Provides reactive state management with loading/error handling.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BankWord,
  AddWordInput,
  UpdateWordInput,
  WordFilter,
  WordBankStats,
  CEFRLevel,
} from './types';
import * as storage from './storage';

// ============================================================================
// MAIN WORD BANK HOOK
// ============================================================================

export interface UseWordBankOptions {
  /** Initial filter to apply */
  filter?: WordFilter;
  /** Auto-refresh interval in ms (0 = disabled) */
  autoRefreshInterval?: number;
}

export interface UseWordBankReturn {
  /** All words matching the current filter */
  words: BankWord[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Add a new word */
  addWord: (input: AddWordInput) => Promise<BankWord>;
  /** Update an existing word */
  updateWord: (id: string, input: UpdateWordInput) => Promise<BankWord | null>;
  /** Delete a word */
  deleteWord: (id: string) => Promise<boolean>;
  /** Refresh the word list */
  refreshWords: () => Promise<void>;
  /** Update the filter */
  setFilter: (filter: WordFilter) => void;
  /** Current filter */
  filter: WordFilter;
}

/**
 * Main hook for Word Bank operations
 *
 * @example
 * ```tsx
 * const { words, loading, addWord, deleteWord } = useWordBank();
 *
 * const handleAdd = async () => {
 *   await addWord({
 *     word: 'bonjour',
 *     translation: 'hello',
 *     source: 'manual',
 *   });
 * };
 * ```
 */
export function useWordBank(options: UseWordBankOptions = {}): UseWordBankReturn {
  const [words, setWords] = useState<BankWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<WordFilter>(options.filter || {});

  // Fetch words
  const fetchWords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedWords = await storage.getWords(filter);
      setWords(fetchedWords);
    } catch (err) {
      console.error('Error fetching words:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch words'));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Initial fetch and filter changes
  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  // Auto-refresh
  useEffect(() => {
    if (options.autoRefreshInterval && options.autoRefreshInterval > 0) {
      const interval = setInterval(fetchWords, options.autoRefreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchWords, options.autoRefreshInterval]);

  // Add word
  const addWord = useCallback(async (input: AddWordInput): Promise<BankWord> => {
    const newWord = await storage.addWord(input);
    setWords((prev) => [newWord, ...prev]);
    return newWord;
  }, []);

  // Update word
  const updateWord = useCallback(
    async (id: string, input: UpdateWordInput): Promise<BankWord | null> => {
      const updated = await storage.updateWord(id, input);
      if (updated) {
        setWords((prev) =>
          prev.map((w) => (w.id === id ? updated : w))
        );
      }
      return updated;
    },
    []
  );

  // Delete word
  const deleteWord = useCallback(async (id: string): Promise<boolean> => {
    const success = await storage.deleteWord(id);
    if (success) {
      setWords((prev) => prev.filter((w) => w.id !== id));
    }
    return success;
  }, []);

  return {
    words,
    loading,
    error,
    addWord,
    updateWord,
    deleteWord,
    refreshWords: fetchWords,
    setFilter,
    filter,
  };
}

// ============================================================================
// PRIORITY WORDS HOOK
// ============================================================================

export interface UseWordPriorityOptions {
  /** Maximum number of words to return */
  limit?: number;
  /** Filter by CEFR level */
  cefrLevel?: CEFRLevel;
  /** Only return words due for review */
  onlyDueWords?: boolean;
}

export interface UseWordPriorityReturn {
  /** Words sorted by priority (highest first) */
  priorityWords: BankWord[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Recalculate all priorities */
  recalculatePriorities: (userLevel?: CEFRLevel, milestone?: string) => Promise<void>;
  /** Refresh the list */
  refresh: () => Promise<void>;
}

/**
 * Hook for getting priority-sorted words
 *
 * @example
 * ```tsx
 * const { priorityWords, loading } = useWordPriority({ limit: 10 });
 *
 * // Get top 10 priority words for practice
 * return priorityWords.map(word => <WordCard key={word.id} word={word} />);
 * ```
 */
export function useWordPriority(
  options: UseWordPriorityOptions = {}
): UseWordPriorityReturn {
  const { limit = 20, cefrLevel, onlyDueWords = false } = options;

  const [priorityWords, setPriorityWords] = useState<BankWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPriorityWords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let words: BankWord[];
      if (onlyDueWords) {
        words = await storage.getWordsDueForReview(limit);
      } else {
        words = await storage.getWordsByPriority(limit);
      }

      // Filter by CEFR level if specified
      if (cefrLevel) {
        words = words.filter((w) => w.cefrLevel === cefrLevel);
      }

      setPriorityWords(words);
    } catch (err) {
      console.error('Error fetching priority words:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch priority words'));
    } finally {
      setLoading(false);
    }
  }, [limit, cefrLevel, onlyDueWords]);

  useEffect(() => {
    fetchPriorityWords();
  }, [fetchPriorityWords]);

  const recalculatePriorities = useCallback(
    async (userLevel: CEFRLevel = 'A1', milestone?: string) => {
      setLoading(true);
      try {
        await storage.recalculateAllPriorities(userLevel, milestone);
        await fetchPriorityWords();
      } catch (err) {
        console.error('Error recalculating priorities:', err);
        setError(err instanceof Error ? err : new Error('Failed to recalculate priorities'));
      } finally {
        setLoading(false);
      }
    },
    [fetchPriorityWords]
  );

  return {
    priorityWords,
    loading,
    error,
    recalculatePriorities,
    refresh: fetchPriorityWords,
  };
}

// ============================================================================
// WORD SEARCH HOOK
// ============================================================================

export interface UseWordSearchReturn {
  /** Search results */
  results: BankWord[];
  /** Current search query */
  query: string;
  /** Update search query */
  setQuery: (query: string) => void;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Clear search */
  clearSearch: () => void;
}

/**
 * Hook for searching words
 *
 * @example
 * ```tsx
 * const { results, query, setQuery, loading } = useWordSearch();
 *
 * return (
 *   <>
 *     <TextInput value={query} onChangeText={setQuery} />
 *     {results.map(word => <WordCard key={word.id} word={word} />)}
 *   </>
 * );
 * ```
 */
export function useWordSearch(): UseWordSearchReturn {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BankWord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const searchResults = await storage.searchWords(query);
        setResults(searchResults);
      } catch (err) {
        console.error('Error searching words:', err);
        setError(err instanceof Error ? err : new Error('Search failed'));
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
  }, []);

  return {
    results,
    query,
    setQuery,
    loading,
    error,
    clearSearch,
  };
}

// ============================================================================
// WORD BANK STATS HOOK
// ============================================================================

export interface UseWordBankStatsReturn {
  /** Aggregate statistics */
  stats: WordBankStats | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Refresh stats */
  refresh: () => Promise<void>;
}

/**
 * Hook for Word Bank statistics
 *
 * @example
 * ```tsx
 * const { stats, loading } = useWordBankStats();
 *
 * if (loading) return <Loading />;
 *
 * return (
 *   <View>
 *     <Text>Total words: {stats?.totalWords}</Text>
 *     <Text>Mastery: {stats?.averageMastery}%</Text>
 *   </View>
 * );
 * ```
 */
export function useWordBankStats(): UseWordBankStatsReturn {
  const [stats, setStats] = useState<WordBankStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedStats = await storage.getWordBankStats();
      setStats(fetchedStats);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch stats'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  };
}

// ============================================================================
// SINGLE WORD HOOK
// ============================================================================

export interface UseWordReturn {
  /** The word data */
  word: BankWord | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Update this word */
  update: (input: UpdateWordInput) => Promise<void>;
  /** Record a review */
  recordReview: (quality: number, errorType?: string) => Promise<void>;
  /** Refresh */
  refresh: () => Promise<void>;
}

/**
 * Hook for a single word by ID
 *
 * @example
 * ```tsx
 * const { word, loading, recordReview } = useWord(wordId);
 *
 * const handleCorrect = () => recordReview(5); // Perfect
 * const handleIncorrect = () => recordReview(2, 'pronunciation');
 * ```
 */
export function useWord(wordId: string | null): UseWordReturn {
  const [word, setWord] = useState<BankWord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWord = useCallback(async () => {
    if (!wordId) {
      setWord(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fetchedWord = await storage.getWord(wordId);
      setWord(fetchedWord);
    } catch (err) {
      console.error('Error fetching word:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch word'));
    } finally {
      setLoading(false);
    }
  }, [wordId]);

  useEffect(() => {
    fetchWord();
  }, [fetchWord]);

  const update = useCallback(
    async (input: UpdateWordInput) => {
      if (!wordId) return;
      const updated = await storage.updateWord(wordId, input);
      if (updated) {
        setWord(updated);
      }
    },
    [wordId]
  );

  const recordReview = useCallback(
    async (quality: number, errorType?: string) => {
      if (!wordId) return;
      const updated = await storage.recordReview(wordId, quality, errorType);
      if (updated) {
        setWord(updated);
      }
    },
    [wordId]
  );

  return {
    word,
    loading,
    error,
    update,
    recordReview,
    refresh: fetchWord,
  };
}

// ============================================================================
// REVIEW SESSION HOOK
// ============================================================================

export interface UseReviewSessionOptions {
  /** Maximum words per session */
  maxWords?: number;
  /** Only include due words */
  onlyDueWords?: boolean;
  /** Filter by CEFR level */
  cefrLevel?: CEFRLevel;
}

export interface UseReviewSessionReturn {
  /** Words for this session */
  sessionWords: BankWord[];
  /** Current word index */
  currentIndex: number;
  /** Current word */
  currentWord: BankWord | null;
  /** Session progress (0-100) */
  progress: number;
  /** Is session complete */
  isComplete: boolean;
  /** Record answer and move to next */
  answer: (quality: number, errorType?: string) => Promise<void>;
  /** Skip current word */
  skip: () => void;
  /** Reset session */
  reset: () => Promise<void>;
  /** Loading state */
  loading: boolean;
}

/**
 * Hook for managing a review session
 *
 * @example
 * ```tsx
 * const {
 *   currentWord,
 *   progress,
 *   isComplete,
 *   answer
 * } = useReviewSession({ maxWords: 10 });
 *
 * if (isComplete) return <SessionComplete />;
 *
 * return (
 *   <FlashCard
 *     word={currentWord}
 *     onCorrect={() => answer(5)}
 *     onIncorrect={() => answer(2)}
 *   />
 * );
 * ```
 */
export function useReviewSession(
  options: UseReviewSessionOptions = {}
): UseReviewSessionReturn {
  const { maxWords = 10, onlyDueWords = true, cefrLevel } = options;

  const [sessionWords, setSessionWords] = useState<BankWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const currentWord = useMemo(
    () => sessionWords[currentIndex] || null,
    [sessionWords, currentIndex]
  );

  const progress = useMemo(
    () => (sessionWords.length > 0 ? (currentIndex / sessionWords.length) * 100 : 0),
    [currentIndex, sessionWords.length]
  );

  const isComplete = useMemo(
    () => sessionWords.length > 0 && currentIndex >= sessionWords.length,
    [currentIndex, sessionWords.length]
  );

  const loadSession = useCallback(async () => {
    try {
      setLoading(true);
      let words: BankWord[];

      if (onlyDueWords) {
        words = await storage.getWordsDueForReview(maxWords);
      } else {
        words = await storage.getWordsByPriority(maxWords);
      }

      if (cefrLevel) {
        words = words.filter((w) => w.cefrLevel === cefrLevel);
      }

      setSessionWords(words);
      setCurrentIndex(0);
    } finally {
      setLoading(false);
    }
  }, [maxWords, onlyDueWords, cefrLevel]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const answer = useCallback(
    async (quality: number, errorType?: string) => {
      if (!currentWord) return;
      await storage.recordReview(currentWord.id, quality, errorType);
      setCurrentIndex((prev) => prev + 1);
    },
    [currentWord]
  );

  const skip = useCallback(() => {
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const reset = useCallback(async () => {
    await loadSession();
  }, [loadSession]);

  return {
    sessionWords,
    currentIndex,
    currentWord,
    progress,
    isComplete,
    answer,
    skip,
    reset,
    loading,
  };
}
