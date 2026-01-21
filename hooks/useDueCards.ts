/**
 * useDueCards Hook
 *
 * React hook for managing vocabulary cards due for spaced repetition review.
 * Filters vocabulary items by due date, sorts by priority, and provides
 * review submission functionality.
 *
 * Designed to work with:
 * - In-memory sample data (current implementation)
 * - Future SQLite/database integration (interface ready)
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  calculateSM2,
  simpleToReviewQuality,
  isDueForReview,
  getDaysUntilReview,
  SM2Result,
} from '@/lib/spaced-repetition/sm2';
import { VocabularyItem } from '@/types/vocabulary';
import { SimpleQuality, ReviewQuality } from '@/types/flashcard';

/**
 * Configuration options for the hook
 */
export interface UseDueCardsOptions {
  /** Filter items by category (optional) */
  category?: string;
  /** Maximum number of due cards to return (optional, default: all) */
  limit?: number;
  /** Include items that have never been reviewed (nextReviewDate not set) */
  includeNew?: boolean;
}

/**
 * Interface for persisting review results
 * Implement this for database integration
 */
export interface DueCardsRepository {
  /** Save updated vocabulary item after review */
  saveVocabularyItem: (item: VocabularyItem) => Promise<void>;
  /** Batch save multiple items */
  saveVocabularyItems?: (items: VocabularyItem[]) => Promise<void>;
}

/**
 * Statistics about due cards
 */
export interface DueCardsStats {
  /** Total number of due cards */
  totalDue: number;
  /** Cards that are overdue (past their review date) */
  overdueCount: number;
  /** Cards due today */
  dueTodayCount: number;
  /** New cards (never reviewed) */
  newCardsCount: number;
  /** Cards by category */
  byCategory: Record<string, number>;
  /** Average days overdue for overdue cards */
  averageDaysOverdue: number;
}

/**
 * Return type for the useDueCards hook
 */
export interface UseDueCardsReturn {
  /** Vocabulary items due for review, sorted by priority */
  dueCards: VocabularyItem[];
  /** Statistics about the due cards */
  stats: DueCardsStats;
  /** Whether the hook is processing */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;

  /** Mark a card as reviewed with the given quality */
  markReviewed: (itemId: string, quality: SimpleQuality) => Promise<VocabularyItem | null>;
  /** Mark a card as reviewed with ReviewQuality enum directly */
  markReviewedWithQuality: (itemId: string, quality: ReviewQuality) => Promise<VocabularyItem | null>;
  /** Preview what the next review would be without saving */
  previewNextReview: (itemId: string, quality: SimpleQuality) => SM2Result | null;
  /** Refresh the due cards list */
  refresh: () => void;
  /** Get a specific card by ID */
  getCard: (itemId: string) => VocabularyItem | undefined;
  /** Check if a specific card is due */
  isCardDue: (itemId: string) => boolean;
}

/**
 * Calculate the sort priority for a vocabulary item
 * Lower values = higher priority (shown first)
 *
 * Sorting criteria:
 * 1. Overdue items first (more days overdue = higher priority)
 * 2. Then by priority field (higher priority = lower sort value)
 * 3. Then new items (never reviewed)
 * 4. Then by mastery score (lower mastery = higher priority)
 */
function calculateSortPriority(item: VocabularyItem): number {
  const daysUntil = getDaysUntilReview(item.nextReviewDate);

  // Base priority from the item's priority field (0-10, inverted so higher = lower sort value)
  const basePriority = 10 - (item.priority || 5);

  // Overdue factor: negative daysUntil means overdue
  // More overdue = lower (higher priority) sort value
  // Scale: -30 days overdue would add -300 to sort value
  const overdueFactor = daysUntil < 0 ? daysUntil * 10 : 0;

  // New card bonus: slight priority boost for new cards
  const newCardBonus = item.repetitions === 0 ? -5 : 0;

  // Mastery factor: lower mastery = higher priority (but less weight than overdue)
  const masteryFactor = (item.masteryScore || 0) / 100 * 5;

  return basePriority + overdueFactor + newCardBonus + masteryFactor;
}

/**
 * Hook for managing vocabulary cards due for spaced repetition review
 *
 * @param vocabularyItems - Array of vocabulary items to filter
 * @param options - Configuration options
 * @param repository - Optional repository for persisting changes
 * @returns Due cards state and control functions
 *
 * @example
 * ```tsx
 * // Basic usage with sample data
 * const { dueCards, stats, markReviewed } = useDueCards(SAMPLE_VOCABULARY);
 *
 * // With category filter
 * const { dueCards } = useDueCards(SAMPLE_VOCABULARY, { category: 'Job Interview' });
 *
 * // With limit
 * const { dueCards } = useDueCards(SAMPLE_VOCABULARY, { limit: 10 });
 *
 * // Mark a card as reviewed
 * await markReviewed('vocab-1', 'remembered');
 * ```
 */
export function useDueCards(
  vocabularyItems: VocabularyItem[],
  options: UseDueCardsOptions = {},
  repository?: DueCardsRepository
): UseDueCardsReturn {
  const { category, limit, includeNew = true } = options;

  // Local state for tracking reviewed items (in-memory updates)
  const [localItems, setLocalItems] = useState<Map<string, VocabularyItem>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Merge vocabulary items with local updates
  const mergedItems = useMemo(() => {
    return vocabularyItems.map(item => {
      const localUpdate = localItems.get(item.id);
      return localUpdate || item;
    });
  }, [vocabularyItems, localItems]);

  // Filter and sort due cards
  const dueCards = useMemo(() => {
    let filtered = mergedItems.filter(item => {
      // Check if due for review
      const isDue = isDueForReview(item.nextReviewDate);
      const isNew = item.repetitions === 0 && includeNew;

      if (!isDue && !isNew) {
        return false;
      }

      // Apply category filter if specified
      if (category && item.category !== category) {
        return false;
      }

      return true;
    });

    // Sort by priority
    filtered.sort((a, b) => calculateSortPriority(a) - calculateSortPriority(b));

    // Apply limit if specified
    if (limit !== undefined && limit > 0) {
      filtered = filtered.slice(0, limit);
    }

    return filtered;
  }, [mergedItems, category, limit, includeNew, refreshTrigger]);

  // Calculate statistics
  const stats = useMemo((): DueCardsStats => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let overdueCount = 0;
    let dueTodayCount = 0;
    let newCardsCount = 0;
    let totalDaysOverdue = 0;
    const byCategory: Record<string, number> = {};

    dueCards.forEach(item => {
      const daysUntil = getDaysUntilReview(item.nextReviewDate);

      // Count overdue vs due today
      if (daysUntil < 0) {
        overdueCount++;
        totalDaysOverdue += Math.abs(daysUntil);
      } else if (daysUntil === 0) {
        dueTodayCount++;
      }

      // Count new cards
      if (item.repetitions === 0) {
        newCardsCount++;
      }

      // Count by category
      const cat = item.category || 'Uncategorized';
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    });

    return {
      totalDue: dueCards.length,
      overdueCount,
      dueTodayCount,
      newCardsCount,
      byCategory,
      averageDaysOverdue: overdueCount > 0 ? totalDaysOverdue / overdueCount : 0,
    };
  }, [dueCards]);

  /**
   * Get a card by ID from the merged items
   */
  const getCard = useCallback(
    (itemId: string): VocabularyItem | undefined => {
      return mergedItems.find(item => item.id === itemId);
    },
    [mergedItems]
  );

  /**
   * Check if a specific card is due
   */
  const isCardDue = useCallback(
    (itemId: string): boolean => {
      const item = getCard(itemId);
      if (!item) return false;
      return isDueForReview(item.nextReviewDate);
    },
    [getCard]
  );

  /**
   * Preview what the next review would be without saving
   */
  const previewNextReview = useCallback(
    (itemId: string, quality: SimpleQuality): SM2Result | null => {
      const item = getCard(itemId);
      if (!item) return null;

      const reviewQuality = simpleToReviewQuality(quality);

      return calculateSM2({
        quality: reviewQuality,
        easeFactor: item.easeFactor,
        interval: item.interval,
        repetitions: item.repetitions,
      });
    },
    [getCard]
  );

  /**
   * Mark a card as reviewed with ReviewQuality enum
   */
  const markReviewedWithQuality = useCallback(
    async (itemId: string, quality: ReviewQuality): Promise<VocabularyItem | null> => {
      const item = getCard(itemId);
      if (!item) {
        setError(`Vocabulary item not found: ${itemId}`);
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Calculate new SM-2 values
        const result = calculateSM2({
          quality,
          easeFactor: item.easeFactor,
          interval: item.interval,
          repetitions: item.repetitions,
        });

        // Create updated item
        const updatedItem: VocabularyItem = {
          ...item,
          easeFactor: result.easeFactor,
          interval: result.interval,
          repetitions: result.repetitions,
          nextReviewDate: result.nextReview.toISOString(),
          // Update tracking fields
          timesCorrect: quality >= ReviewQuality.GOOD
            ? item.timesCorrect + 1
            : item.timesCorrect,
          timesIncorrect: quality < ReviewQuality.GOOD
            ? item.timesIncorrect + 1
            : item.timesIncorrect,
          // Update mastery score (simple calculation based on correct ratio)
          masteryScore: calculateMasteryScore(
            item.timesCorrect + (quality >= ReviewQuality.GOOD ? 1 : 0),
            item.timesIncorrect + (quality < ReviewQuality.GOOD ? 1 : 0)
          ),
        };

        // Save to repository if provided
        if (repository?.saveVocabularyItem) {
          await repository.saveVocabularyItem(updatedItem);
        }

        // Update local state
        setLocalItems(prev => {
          const next = new Map(prev);
          next.set(itemId, updatedItem);
          return next;
        });

        console.log(
          `✅ Card reviewed: "${item.word}" | Quality: ${quality} | Next review: ${result.nextReview.toDateString()} (${result.interval} days)`
        );

        return updatedItem;
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to mark card as reviewed';
        setError(errorMessage);
        console.error('Error marking card as reviewed:', e);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [getCard, repository]
  );

  /**
   * Mark a card as reviewed with simple quality (forgot/remembered/easy)
   */
  const markReviewed = useCallback(
    async (itemId: string, quality: SimpleQuality): Promise<VocabularyItem | null> => {
      const reviewQuality = simpleToReviewQuality(quality);
      return markReviewedWithQuality(itemId, reviewQuality);
    },
    [markReviewedWithQuality]
  );

  /**
   * Refresh the due cards list (force recalculation)
   */
  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return {
    dueCards,
    stats,
    isLoading,
    error,
    markReviewed,
    markReviewedWithQuality,
    previewNextReview,
    refresh,
    getCard,
    isCardDue,
  };
}

/**
 * Calculate mastery score based on correct/incorrect ratio
 * Returns a value between 0-100
 */
function calculateMasteryScore(correct: number, incorrect: number): number {
  const total = correct + incorrect;
  if (total === 0) return 0;

  // Base score from accuracy
  const accuracy = correct / total;

  // Weight by total reviews (more reviews = more confidence)
  // Caps at 20 reviews for full weight
  const confidenceWeight = Math.min(total / 20, 1);

  // Calculate score: accuracy * confidence * 100
  const score = accuracy * confidenceWeight * 100;

  return Math.round(Math.min(score, 100));
}

/**
 * Type-only export for external repository implementations
 */
export type { VocabularyItem };
