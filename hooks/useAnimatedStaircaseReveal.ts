/**
 * Animated Staircase Reveal Hook
 *
 * Orchestrates the theatrical reveal of staircase cards after onboarding.
 * Uses a 50% threshold trigger to start revealing before all stairs are ready,
 * creating a smooth progressive reveal experience.
 *
 * @example
 * ```tsx
 * const {
 *   phase,
 *   stairs,
 *   isCardRevealed,
 *   progress,
 *   shouldShowSkeleton,
 * } = useAnimatedStaircaseReveal({
 *   userId: user?.id ?? null,
 *   isFirstVisit: !hasSeenReveal,
 *   onComplete: () => console.log('Reveal complete!'),
 *   onCelebrate: () => triggerConfetti(),
 * });
 * ```
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLearningPath, StairForDisplay } from './useLearningPath';

// ============================================================================
// MMKV Storage (with fallback for Expo Go)
// ============================================================================

// Storage interface that works with both MMKV and fallback
interface StorageInterface {
  getBoolean: (key: string) => boolean | undefined;
  set: (key: string, value: boolean) => void;
  delete: (key: string) => void;
}

// MMKV requires a development build - won't work in Expo Go
let storage: StorageInterface;

try {
  const { MMKV } = require('react-native-mmkv');
  storage = new MMKV({ id: 'vox-staircase-reveal' });
  console.log('[StaircaseReveal] Using MMKV storage');
} catch (e) {
  console.log('[StaircaseReveal] MMKV not available - using in-memory fallback');
  // In-memory fallback for Expo Go
  const memoryStore: Record<string, boolean> = {};
  storage = {
    getBoolean: (key: string) => memoryStore[key],
    set: (key: string, value: boolean) => { memoryStore[key] = value; },
    delete: (key: string) => { delete memoryStore[key]; },
  };
}

const STORAGE_KEYS = {
  HAS_SEEN_REVEAL: 'hasSeenStaircaseReveal',
} as const;

// ============================================================================
// Types
// ============================================================================

/**
 * State machine phases for the staircase reveal animation
 */
export type RevealPhase =
  | 'idle' // Initial state, waiting for data
  | 'generating' // AI is generating stairs
  | 'revealing' // Revealing cards one by one
  | 'celebrating' // All revealed, showing celebration
  | 'complete'; // Animation finished

/**
 * Configuration options for the hook
 */
export interface UseAnimatedStaircaseRevealOptions {
  /** The user's ID (null if not authenticated) */
  userId: string | null;
  /** Only animate on first visit after onboarding */
  isFirstVisit: boolean;
  /** Called when all animations are done */
  onComplete?: () => void;
  /** Called when celebration should trigger */
  onCelebrate?: () => void;
}

/**
 * Return value from the hook
 */
export interface AnimatedStaircaseRevealResult {
  /** Current phase of the reveal animation */
  phase: RevealPhase;
  /** All stairs data for display */
  stairs: StairForDisplay[];
  /** Indices of stairs that have been revealed */
  revealedIndices: number[];
  /** Check if a specific card has been revealed */
  isCardRevealed: (index: number) => boolean;
  /** Progress from 0 to 1 indicating how many stairs have been revealed */
  progress: number;
  /** Whether to show skeleton loading placeholders */
  shouldShowSkeleton: boolean;
  /** Error message if something went wrong */
  error: string | null;
  /** Manually mark the reveal as seen (useful for skip button) */
  markRevealAsSeen: () => void;
  /** Check if user has previously seen the reveal */
  hasSeenReveal: boolean;
  /** Reset the reveal animation (for testing) */
  resetReveal: () => void;
}

// ============================================================================
// Timing Constants
// ============================================================================

/** Delay between each card reveal in milliseconds */
const STAGGER_DELAY_MS = 200;

/** Duration of card reveal animation in milliseconds */
const CARD_REVEAL_DURATION_MS = 300;

/** Wait time after last card before celebration in milliseconds */
const CELEBRATION_DELAY_MS = 500;

/** Threshold percentage of stairs that must be ready before starting reveal */
const REVEAL_THRESHOLD = 0.5; // 50%

/** Minimum stairs needed before we consider starting the reveal */
const MIN_STAIRS_FOR_REVEAL = 3;

/** Polling interval to check for new stairs during generation */
const POLL_INTERVAL_MS = 500;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if user has seen the staircase reveal animation
 */
function getHasSeenReveal(userId: string | null): boolean {
  if (!userId) return false;
  const key = `${STORAGE_KEYS.HAS_SEEN_REVEAL}_${userId}`;
  return storage.getBoolean(key) ?? false;
}

/**
 * Mark that user has seen the staircase reveal animation
 */
function setHasSeenReveal(userId: string | null): void {
  if (!userId) return;
  const key = `${STORAGE_KEYS.HAS_SEEN_REVEAL}_${userId}`;
  storage.set(key, true);
}

/**
 * Clear the has seen reveal flag (for testing/reset)
 */
function clearHasSeenReveal(userId: string | null): void {
  if (!userId) return;
  const key = `${STORAGE_KEYS.HAS_SEEN_REVEAL}_${userId}`;
  storage.delete(key);
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useAnimatedStaircaseReveal(
  options: UseAnimatedStaircaseRevealOptions
): AnimatedStaircaseRevealResult {
  const { userId, isFirstVisit, onComplete, onCelebrate } = options;

  // Get stairs data from the learning path hook
  const {
    stairs,
    isLoading: isLoadingStairs,
    error: stairsError,
    hasPath,
    refreshPath,
  } = useLearningPath(userId);

  // ============================================================================
  // State
  // ============================================================================

  const [phase, setPhase] = useState<RevealPhase>('idle');
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [hasSeenReveal, setHasSeenRevealState] = useState<boolean>(() =>
    getHasSeenReveal(userId)
  );

  // Track the expected total number of stairs (for progress calculation)
  const [expectedTotalStairs, setExpectedTotalStairs] = useState<number>(0);

  // Refs for managing timers
  const revealTimerRef = useRef<NodeJS.Timeout | null>(null);
  const celebrationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track previous stairs length to detect new stairs arriving
  const previousStairsLengthRef = useRef<number>(0);

  // ============================================================================
  // Computed Values
  // ============================================================================

  /**
   * Calculate progress (0 to 1) based on revealed indices
   */
  const progress = useMemo(() => {
    if (stairs.length === 0) return 0;
    return revealedIndices.length / stairs.length;
  }, [revealedIndices.length, stairs.length]);

  /**
   * Determine if skeleton should be shown
   * Show skeleton when:
   * - Loading stairs AND in idle/generating phase
   * - OR in generating phase with no stairs yet
   */
  const shouldShowSkeleton = useMemo(() => {
    if (phase === 'idle' || phase === 'generating') {
      return isLoadingStairs || stairs.length === 0;
    }
    return false;
  }, [phase, isLoadingStairs, stairs.length]);

  // ============================================================================
  // Callbacks
  // ============================================================================

  /**
   * Check if a specific card index has been revealed
   */
  const isCardRevealed = useCallback(
    (index: number): boolean => {
      // If not first visit or already seen, all cards are revealed
      if (!isFirstVisit || hasSeenReveal) {
        return true;
      }
      // During animation, check if index is in revealed list
      return revealedIndices.includes(index);
    },
    [isFirstVisit, hasSeenReveal, revealedIndices]
  );

  /**
   * Mark the reveal as seen manually (useful for skip button)
   */
  const markRevealAsSeen = useCallback(() => {
    setHasSeenReveal(userId);
    setHasSeenRevealState(true);
    setPhase('complete');

    // Reveal all remaining cards immediately
    if (stairs.length > 0) {
      setRevealedIndices(stairs.map((_, i) => i));
    }

    onComplete?.();
  }, [userId, stairs.length, onComplete]);

  /**
   * Reset the reveal animation (for testing purposes)
   */
  const resetReveal = useCallback(() => {
    clearHasSeenReveal(userId);
    setHasSeenRevealState(false);
    setPhase('idle');
    setRevealedIndices([]);
    setExpectedTotalStairs(0);
    previousStairsLengthRef.current = 0;

    // Clear all timers
    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
    if (celebrationTimerRef.current) {
      clearTimeout(celebrationTimerRef.current);
      celebrationTimerRef.current = null;
    }
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, [userId]);

  /**
   * Reveal the next card in sequence
   */
  const revealNextCard = useCallback(() => {
    setRevealedIndices((prev) => {
      const nextIndex = prev.length;

      // Check if we've revealed all available stairs
      if (nextIndex >= stairs.length) {
        // All current stairs revealed, but more might be coming
        // Check again shortly
        return prev;
      }

      return [...prev, nextIndex];
    });
  }, [stairs.length]);

  /**
   * Start the sequential reveal animation
   */
  const startRevealSequence = useCallback(() => {
    setPhase('revealing');

    let currentIndex = 0;

    const revealNext = () => {
      if (currentIndex < stairs.length) {
        setRevealedIndices((prev) => {
          if (!prev.includes(currentIndex)) {
            return [...prev, currentIndex];
          }
          return prev;
        });
        currentIndex++;

        // Schedule next reveal
        revealTimerRef.current = setTimeout(revealNext, STAGGER_DELAY_MS);
      } else {
        // All stairs revealed, start celebration
        celebrationTimerRef.current = setTimeout(() => {
          setPhase('celebrating');
          onCelebrate?.();

          // After celebration, mark as complete
          setTimeout(() => {
            setHasSeenReveal(userId);
            setHasSeenRevealState(true);
            setPhase('complete');
            onComplete?.();
          }, CARD_REVEAL_DURATION_MS);
        }, CELEBRATION_DELAY_MS);
      }
    };

    // Start the reveal sequence
    revealNext();
  }, [stairs.length, userId, onCelebrate, onComplete]);

  // ============================================================================
  // Effects
  // ============================================================================

  /**
   * Update hasSeenReveal state when userId changes
   */
  useEffect(() => {
    setHasSeenRevealState(getHasSeenReveal(userId));
  }, [userId]);

  /**
   * Main effect to orchestrate the reveal animation
   */
  useEffect(() => {
    // Skip animation if not first visit or already seen
    if (!isFirstVisit || hasSeenReveal) {
      // Immediately reveal all stairs
      if (stairs.length > 0) {
        setRevealedIndices(stairs.map((_, i) => i));
      }
      setPhase('complete');
      return;
    }

    // No user, stay idle
    if (!userId) {
      setPhase('idle');
      return;
    }

    // Still loading initial data
    if (isLoadingStairs && stairs.length === 0) {
      setPhase('generating');
      return;
    }

    // Error occurred
    if (stairsError) {
      setPhase('idle');
      return;
    }

    // No path yet, user needs to complete onboarding
    if (!hasPath) {
      setPhase('idle');
      return;
    }

    // Check if we have enough stairs to start revealing (50% threshold)
    const currentStairsCount = stairs.length;
    const previousStairsCount = previousStairsLengthRef.current;

    // Update the expected total if we're still generating
    if (currentStairsCount > expectedTotalStairs) {
      setExpectedTotalStairs(currentStairsCount);
    }

    // Detect new stairs arriving
    const hasNewStairs = currentStairsCount > previousStairsCount;
    previousStairsLengthRef.current = currentStairsCount;

    // Calculate if we've met the threshold to start revealing
    // Use a minimum of 3 stairs and 50% of expected total
    const meetsMinimum = currentStairsCount >= MIN_STAIRS_FOR_REVEAL;
    const meetsThreshold =
      expectedTotalStairs > 0
        ? currentStairsCount / expectedTotalStairs >= REVEAL_THRESHOLD
        : meetsMinimum;

    // Start reveal sequence if conditions are met and not already revealing
    if (
      phase === 'generating' &&
      meetsMinimum &&
      meetsThreshold &&
      !isLoadingStairs
    ) {
      startRevealSequence();
      return;
    }

    // If we're in revealing phase and new stairs arrived, continue revealing them
    if (phase === 'revealing' && hasNewStairs) {
      // The reveal sequence will automatically pick up new stairs
      // as it checks stairs.length in each iteration
      return;
    }

    // If generating phase and we have some stairs but not loading,
    // we might be done generating - start reveal
    if (
      phase === 'generating' &&
      currentStairsCount > 0 &&
      !isLoadingStairs &&
      meetsMinimum
    ) {
      startRevealSequence();
      return;
    }

    // Set to generating if we're still in idle and waiting for stairs
    if (phase === 'idle' && (isLoadingStairs || currentStairsCount === 0)) {
      setPhase('generating');
    }
  }, [
    userId,
    isFirstVisit,
    hasSeenReveal,
    stairs.length,
    isLoadingStairs,
    stairsError,
    hasPath,
    phase,
    expectedTotalStairs,
    startRevealSequence,
  ]);

  /**
   * Handle ongoing reveal when new stairs come in during the reveal phase
   */
  useEffect(() => {
    if (phase !== 'revealing') return;

    // Check if there are unrevealed stairs
    const lastRevealedIndex =
      revealedIndices.length > 0
        ? Math.max(...revealedIndices)
        : -1;
    const hasUnrevealedStairs = lastRevealedIndex < stairs.length - 1;

    if (hasUnrevealedStairs && !revealTimerRef.current) {
      // Continue revealing new stairs
      let nextIndex = lastRevealedIndex + 1;

      const revealRemaining = () => {
        if (nextIndex < stairs.length) {
          setRevealedIndices((prev) => {
            if (!prev.includes(nextIndex)) {
              return [...prev, nextIndex];
            }
            return prev;
          });
          nextIndex++;
          revealTimerRef.current = setTimeout(revealRemaining, STAGGER_DELAY_MS);
        } else if (!isLoadingStairs) {
          // All current stairs revealed and not loading more
          // Trigger celebration
          revealTimerRef.current = null;
          celebrationTimerRef.current = setTimeout(() => {
            setPhase('celebrating');
            onCelebrate?.();

            setTimeout(() => {
              setHasSeenReveal(userId);
              setHasSeenRevealState(true);
              setPhase('complete');
              onComplete?.();
            }, CARD_REVEAL_DURATION_MS);
          }, CELEBRATION_DELAY_MS);
        }
      };

      revealRemaining();
    }
  }, [
    phase,
    stairs.length,
    revealedIndices,
    isLoadingStairs,
    userId,
    onCelebrate,
    onComplete,
  ]);

  /**
   * Cleanup timers on unmount
   */
  useEffect(() => {
    return () => {
      if (revealTimerRef.current) {
        clearTimeout(revealTimerRef.current);
      }
      if (celebrationTimerRef.current) {
        clearTimeout(celebrationTimerRef.current);
      }
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
      }
    };
  }, []);

  // ============================================================================
  // Return Value
  // ============================================================================

  return {
    phase,
    stairs,
    revealedIndices,
    isCardRevealed,
    progress,
    shouldShowSkeleton,
    error: stairsError,
    markRevealAsSeen,
    hasSeenReveal,
    resetReveal,
  };
}

// ============================================================================
// Utility Exports
// ============================================================================

/**
 * Check if a user has seen the staircase reveal (standalone utility)
 */
export function checkHasSeenStaircaseReveal(userId: string | null): boolean {
  return getHasSeenReveal(userId);
}

/**
 * Clear the staircase reveal flag for a user (standalone utility for testing)
 */
export function clearStaircaseRevealFlag(userId: string | null): void {
  clearHasSeenReveal(userId);
}

/**
 * Timing constants exported for use in animations
 */
export const REVEAL_TIMING = {
  STAGGER_DELAY_MS,
  CARD_REVEAL_DURATION_MS,
  CELEBRATION_DELAY_MS,
} as const;
