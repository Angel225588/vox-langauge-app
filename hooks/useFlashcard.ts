/**
 * useFlashcard Hook
 *
 * Main hook for managing flashcard review sessions.
 * Handles the 3-card cycle (Learning → Listening → Speaking),
 * session tracking, points calculation, and progress updates.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Flashcard,
  FlashcardWithProgress,
  SimpleQuality,
  ReviewQuality,
  SessionSummary,
} from '@/types/flashcard';
import {
  getFlashcardsDueForReview,
  createReviewSession,
  updateReviewSession,
  recordFlashcardReview,
  updateFlashcardProgress,
} from '@/lib/db/flashcards';
import { simpleToReviewQuality } from '@/lib/spaced-repetition/sm2';

// Card types in the 3-card cycle
export type CardType = 'learning' | 'listening' | 'speaking';

// Points awarded per card type
const POINTS_PER_CARD = {
  learning: 10,
  listening: 15,
  speaking: 20,
};

interface UseFlashcardSessionProps {
  userId: string;
  limit?: number; // Number of flashcards to review (default: 10)
}

interface CurrentCard {
  flashcard: Flashcard;
  cardType: CardType;
  cardIndex: number; // 0, 1, or 2 (within the 3-card cycle)
}

interface UseFlashcardSessionReturn {
  // Session state
  flashcards: Flashcard[];
  currentCard: CurrentCard | null;
  sessionId: string | null;
  isSessionActive: boolean;
  isLoading: boolean;
  error: string | null;

  // Progress tracking
  totalCards: number;
  currentCardNumber: number; // 1-based (e.g., "Card 5 of 30")
  totalFlashcards: number; // Number of unique flashcards
  currentFlashcardNumber: number; // Which flashcard (1-based)
  progressPercentage: number;

  // Points & stats
  pointsEarned: number;
  cardsReviewed: number;

  // Session control
  startSession: () => Promise<void>;
  submitReview: (quality: SimpleQuality) => Promise<void>;
  skipCard: () => void;
  endSession: () => Promise<SessionSummary>;

  // Session summary
  sessionSummary: SessionSummary | null;
}

/**
 * Main hook for flashcard review sessions
 */
export function useFlashcardSession({
  userId,
  limit = 10,
}: UseFlashcardSessionProps): UseFlashcardSessionReturn {
  // Session state
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [currentCardType, setCurrentCardType] = useState<CardType>('learning');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stats tracking
  const [pointsEarned, setPointsEarned] = useState(0);
  const [cardsReviewed, setCardsReviewed] = useState(0);
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);
  const sessionStartTime = useRef<Date | null>(null);

  // Quality tracking for summary
  const qualityCountsRef = useRef({
    forgot: 0,
    hard: 0,
    good: 0,
    easy: 0,
    perfect: 0,
  });

  /**
   * Start a new review session
   */
  const startSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch flashcards due for review
      const dueFlashcards = await getFlashcardsDueForReview(userId, limit);

      if (dueFlashcards.length === 0) {
        setError('No flashcards due for review!');
        setIsLoading(false);
        return;
      }

      // Create session in database
      const newSessionId = await createReviewSession(userId);

      // Initialize session state
      setFlashcards(dueFlashcards);
      setCurrentFlashcardIndex(0);
      setCurrentCardType('learning');
      setSessionId(newSessionId);
      setIsSessionActive(true);
      setPointsEarned(0);
      setCardsReviewed(0);
      setSessionSummary(null);
      sessionStartTime.current = new Date();
      qualityCountsRef.current = {
        forgot: 0,
        hard: 0,
        good: 0,
        easy: 0,
        perfect: 0,
      };

      console.log(`🎯 Session started: ${dueFlashcards.length} flashcards to review`);
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : 'Failed to start session';
      setError(errorMessage);
      console.error('Error starting session:', e);
    } finally {
      setIsLoading(false);
    }
  }, [userId, limit]);

  /**
   * Get the card type order based on index
   */
  const getCardTypeByIndex = (index: number): CardType => {
    const types: CardType[] = ['learning', 'listening', 'speaking'];
    return types[index % 3];
  };

  /**
   * Move to the next card in the session
   */
  const moveToNextCard = useCallback(() => {
    if (currentCardType === 'learning') {
      setCurrentCardType('listening');
    } else if (currentCardType === 'listening') {
      setCurrentCardType('speaking');
    } else {
      // Completed all 3 cards for this flashcard, move to next flashcard
      const nextIndex = currentFlashcardIndex + 1;
      if (nextIndex < flashcards.length) {
        setCurrentFlashcardIndex(nextIndex);
        setCurrentCardType('learning');
      } else {
        // Session complete!
        setIsSessionActive(false);
        console.log('🎉 Session complete!');
      }
    }
  }, [currentCardType, currentFlashcardIndex, flashcards.length]);

  /**
   * Submit a review for the current card
   */
  const submitReview = useCallback(
    async (quality: SimpleQuality) => {
      if (!sessionId || !isSessionActive || flashcards.length === 0) {
        console.warn('No active session');
        return;
      }

      const currentFlashcard = flashcards[currentFlashcardIndex];
      if (!currentFlashcard) {
        console.warn('No current flashcard');
        return;
      }

      setIsLoading(true);

      try {
        // Convert quality
        const reviewQuality = simpleToReviewQuality(quality);

        // Calculate points for this card
        const points = POINTS_PER_CARD[currentCardType];

        // Update quality counts
        const qualityMap: { [key in ReviewQuality]: keyof typeof qualityCountsRef.current } = {
          1: 'forgot',
          2: 'hard',
          3: 'good',
          4: 'easy',
          5: 'perfect',
        };
        const qualityKey = qualityMap[reviewQuality];
        qualityCountsRef.current[qualityKey]++;

        // Record the review in database
        await recordFlashcardReview(
          sessionId,
          currentFlashcard.id,
          userId,
          reviewQuality,
          0, // time_spent_seconds (we'll add timer later)
          currentCardType
        );

        // Update flashcard progress (SM-2 calculation)
        // Only update after all 3 cards are done (on speaking card)
        if (currentCardType === 'speaking') {
          await updateFlashcardProgress(userId, currentFlashcard.id, reviewQuality);
        }

        // Update session stats
        const newPointsEarned = pointsEarned + points;
        const newCardsReviewed = cardsReviewed + 1;

        setPointsEarned(newPointsEarned);
        setCardsReviewed(newCardsReviewed);

        // Update session in database
        await updateReviewSession(
          sessionId,
          Math.floor(newCardsReviewed / 3), // flashcards reviewed (3 cards per flashcard)
          newPointsEarned
        );

        console.log(
          `✅ Review submitted: ${quality} (+${points} pts) | Total: ${newPointsEarned} pts`
        );

        // Move to next card
        moveToNextCard();
      } catch (e) {
        const errorMessage =
          e instanceof Error ? e.message : 'Failed to submit review';
        setError(errorMessage);
        console.error('Error submitting review:', e);
      } finally {
        setIsLoading(false);
      }
    },
    [
      sessionId,
      isSessionActive,
      flashcards,
      currentFlashcardIndex,
      currentCardType,
      userId,
      pointsEarned,
      cardsReviewed,
      moveToNextCard,
    ]
  );

  /**
   * Skip the current card (no review submitted)
   */
  const skipCard = useCallback(() => {
    console.log('⏭️  Card skipped');
    moveToNextCard();
  }, [moveToNextCard]);

  /**
   * End the session and generate summary
   */
  const endSession = useCallback(async (): Promise<SessionSummary> => {
    if (!sessionStartTime.current) {
      throw new Error('Session not started');
    }

    const endTime = new Date();
    const timeSpentSeconds = Math.floor(
      (endTime.getTime() - sessionStartTime.current.getTime()) / 1000
    );

    const totalReviews = Object.values(qualityCountsRef.current).reduce(
      (sum, count) => sum + count,
      0
    );

    // Calculate accuracy (Good, Easy, Perfect = correct)
    const correctReviews =
      qualityCountsRef.current.good +
      qualityCountsRef.current.easy +
      qualityCountsRef.current.perfect;
    const accuracy = totalReviews > 0 ? (correctReviews / totalReviews) * 100 : 0;

    const summary: SessionSummary = {
      flashcards_reviewed: Math.floor(cardsReviewed / 3),
      points_earned: pointsEarned,
      time_spent_seconds: timeSpentSeconds,
      accuracy: Math.round(accuracy),
      cards_by_quality: qualityCountsRef.current,
    };

    setSessionSummary(summary);
    setIsSessionActive(false);

    console.log('📊 Session Summary:', summary);

    return summary;
  }, [cardsReviewed, pointsEarned]);

  // Calculate current card info
  const currentCard: CurrentCard | null =
    flashcards.length > 0 && currentFlashcardIndex < flashcards.length
      ? {
          flashcard: flashcards[currentFlashcardIndex],
          cardType: currentCardType,
          cardIndex: ['learning', 'listening', 'speaking'].indexOf(currentCardType),
        }
      : null;

  // Calculate progress
  const totalCards = flashcards.length * 3; // 3 cards per flashcard
  const currentCardNumber = currentFlashcardIndex * 3 + (currentCard?.cardIndex || 0) + 1;
  const progressPercentage = totalCards > 0 ? (cardsReviewed / totalCards) * 100 : 0;

  // Auto-end session when all cards are done
  useEffect(() => {
    if (
      isSessionActive &&
      flashcards.length > 0 &&
      currentFlashcardIndex >= flashcards.length
    ) {
      endSession();
    }
  }, [isSessionActive, flashcards.length, currentFlashcardIndex, endSession]);

  return {
    // Session state
    flashcards,
    currentCard,
    sessionId,
    isSessionActive,
    isLoading,
    error,

    // Progress
    totalCards,
    currentCardNumber,
    totalFlashcards: flashcards.length,
    currentFlashcardNumber: currentFlashcardIndex + 1,
    progressPercentage,

    // Stats
    pointsEarned,
    cardsReviewed,

    // Control
    startSession,
    submitReview,
    skipCard,
    endSession,

    // Summary
    sessionSummary,
  };
}
