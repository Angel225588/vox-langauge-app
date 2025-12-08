/**
 * Word Bank Priority Algorithm Tests
 *
 * Comprehensive test suite for the priority calculation system.
 * Tests all functions with edge cases, boundary conditions, and typical scenarios.
 */

import type { BankWord, CEFRLevel, PriorityFactors } from '../types';
import {
  calculatePriority,
  calculateWeaknessScore,
  calculateRecencyPenalty,
  calculateCefrMatch,
  calculateMilestoneUrgency,
  calculatePrioritiesForWords,
  sortByPriority,
  getTopPriorityWords,
  PRIORITY_WEIGHTS,
} from '../priority';

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * Create a mock BankWord for testing
 */
function createMockWord(overrides: Partial<BankWord> = {}): BankWord {
  return {
    id: 'test-word-1',
    word: 'hola',
    translation: 'hello',
    category: 'conversation',
    cefrLevel: 'A1',
    partOfSpeech: 'other',
    masteryScore: 50,
    priority: 5.0,
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    nextReviewDate: new Date().toISOString(),
    timesCorrect: 0,
    timesIncorrect: 0,
    errorTypes: [],
    source: 'lesson',
    milestoneTags: [],
    exampleSentences: [],
    addedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Get a date N days ago
 */
function getDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

/**
 * Get a date N days in the future
 */
function getDaysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

// ============================================================================
// Main Priority Calculation Tests
// ============================================================================

describe('Priority Algorithm', () => {
  describe('calculatePriority', () => {
    it('should return 0-10 range for all valid inputs', () => {
      const factors: PriorityFactors = {
        milestoneUrgency: 50,
        weaknessScore: 50,
        recencyPenalty: 50,
        cefrMatch: 50,
      };

      const priority = calculatePriority(factors);

      expect(priority).toBeGreaterThanOrEqual(0);
      expect(priority).toBeLessThanOrEqual(10);
    });

    it('should return 0 when all factors are 0', () => {
      const factors: PriorityFactors = {
        milestoneUrgency: 0,
        weaknessScore: 0,
        recencyPenalty: 0,
        cefrMatch: 0,
      };

      const priority = calculatePriority(factors);

      expect(priority).toBe(0);
    });

    it('should return 10 when all factors are 100', () => {
      const factors: PriorityFactors = {
        milestoneUrgency: 100,
        weaknessScore: 100,
        recencyPenalty: 100,
        cefrMatch: 100,
      };

      const priority = calculatePriority(factors);

      expect(priority).toBe(10);
    });

    it('should weight weakness score highest (40%)', () => {
      // Test with only weakness score at 100
      const highWeakness: PriorityFactors = {
        milestoneUrgency: 0,
        weaknessScore: 100,
        recencyPenalty: 0,
        cefrMatch: 0,
      };

      const priorityWeakness = calculatePriority(highWeakness);
      expect(priorityWeakness).toBe(4.0); // 100 * 0.4 / 10 = 4.0

      // Test with only milestone urgency at 100
      const highMilestone: PriorityFactors = {
        milestoneUrgency: 100,
        weaknessScore: 0,
        recencyPenalty: 0,
        cefrMatch: 0,
      };

      const priorityMilestone = calculatePriority(highMilestone);
      expect(priorityMilestone).toBe(3.0); // 100 * 0.3 / 10 = 3.0

      // Weakness should have higher impact
      expect(priorityWeakness).toBeGreaterThan(priorityMilestone);
    });

    it('should apply correct weights to each factor', () => {
      const factors: PriorityFactors = {
        milestoneUrgency: 100,
        weaknessScore: 100,
        recencyPenalty: 100,
        cefrMatch: 100,
      };

      // Calculate expected value
      const expected =
        (100 * PRIORITY_WEIGHTS.milestoneUrgency +
          100 * PRIORITY_WEIGHTS.weaknessScore +
          100 * PRIORITY_WEIGHTS.recencyPenalty +
          100 * PRIORITY_WEIGHTS.cefrMatch) /
        10;

      const priority = calculatePriority(factors);
      expect(priority).toBe(expected);
    });

    it('should handle mixed factor values correctly', () => {
      const factors: PriorityFactors = {
        milestoneUrgency: 80, // 0.3 weight = 24
        weaknessScore: 60, // 0.4 weight = 24
        recencyPenalty: 90, // 0.2 weight = 18
        cefrMatch: 100, // 0.1 weight = 10
      };

      // Expected: (24 + 24 + 18 + 10) / 10 = 7.6
      const priority = calculatePriority(factors);
      expect(priority).toBe(7.6);
    });

    it('should round to 1 decimal place', () => {
      const factors: PriorityFactors = {
        milestoneUrgency: 33,
        weaknessScore: 33,
        recencyPenalty: 33,
        cefrMatch: 33,
      };

      const priority = calculatePriority(factors);

      // Result should have at most 1 decimal place
      const decimalPlaces = (priority.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(1);
    });

    it('should throw error if factors are out of range', () => {
      const invalidFactors: PriorityFactors = {
        milestoneUrgency: 150, // Invalid: > 100
        weaknessScore: 50,
        recencyPenalty: 50,
        cefrMatch: 50,
      };

      expect(() => calculatePriority(invalidFactors)).toThrow();
    });

    it('should throw error if weights do not sum to 1.0', () => {
      const factors: PriorityFactors = {
        milestoneUrgency: 50,
        weaknessScore: 50,
        recencyPenalty: 50,
        cefrMatch: 50,
      };

      const invalidWeights = {
        milestoneUrgency: 0.5,
        weaknessScore: 0.3,
        recencyPenalty: 0.1,
        cefrMatch: 0.05, // Sum = 0.95 (not 1.0)
      };

      expect(() => calculatePriority(factors, invalidWeights)).toThrow();
    });
  });

  // ============================================================================
  // Weakness Score Tests
  // ============================================================================

  describe('calculateWeaknessScore', () => {
    it('should return 50 for no attempts', () => {
      const score = calculateWeaknessScore(0, 0);
      expect(score).toBe(50);
    });

    it('should return 0 for 100% correct (no mistakes)', () => {
      const score = calculateWeaknessScore(10, 0);
      expect(score).toBe(0);
    });

    it('should return 100 for 100% incorrect', () => {
      const score = calculateWeaknessScore(0, 10);
      expect(score).toBe(100);
    });

    it('should handle mixed results correctly', () => {
      // 7 correct, 3 incorrect = 30% error rate
      const score = calculateWeaknessScore(7, 3);
      expect(score).toBe(30);
    });

    it('should calculate 50% error rate correctly', () => {
      const score = calculateWeaknessScore(5, 5);
      expect(score).toBe(50);
    });

    it('should calculate 25% error rate correctly', () => {
      const score = calculateWeaknessScore(75, 25);
      expect(score).toBe(25);
    });

    it('should calculate 75% error rate correctly', () => {
      const score = calculateWeaknessScore(25, 75);
      expect(score).toBe(75);
    });

    it('should handle large numbers', () => {
      const score = calculateWeaknessScore(1000, 500);
      expect(score).toBeCloseTo(33.33, 1);
    });

    it('should throw error for negative correct count', () => {
      expect(() => calculateWeaknessScore(-1, 5)).toThrow(
        'Attempt counts cannot be negative'
      );
    });

    it('should throw error for negative incorrect count', () => {
      expect(() => calculateWeaknessScore(5, -1)).toThrow(
        'Attempt counts cannot be negative'
      );
    });

    it('should return value between 0 and 100', () => {
      // Test various combinations
      for (let correct = 0; correct <= 10; correct++) {
        for (let incorrect = 0; incorrect <= 10; incorrect++) {
          const score = calculateWeaknessScore(correct, incorrect);
          expect(score).toBeGreaterThanOrEqual(0);
          expect(score).toBeLessThanOrEqual(100);
        }
      }
    });
  });

  // ============================================================================
  // Recency Penalty Tests
  // ============================================================================

  describe('calculateRecencyPenalty', () => {
    it('should return 100 for never reviewed (null)', () => {
      const penalty = calculateRecencyPenalty(null, 7);
      expect(penalty).toBe(100);
    });

    it('should return 100 for never reviewed (0 interval)', () => {
      const penalty = calculateRecencyPenalty(getDaysAgo(5), 0);
      expect(penalty).toBe(100);
    });

    it('should return 100 for overdue words', () => {
      // Reviewed 10 days ago, interval is 7 days
      const penalty = calculateRecencyPenalty(getDaysAgo(10), 7);
      expect(penalty).toBe(100);
    });

    it('should return low value for recently reviewed', () => {
      // Reviewed 1 day ago, interval is 7 days
      // Penalty should be approximately 14.3%
      const penalty = calculateRecencyPenalty(getDaysAgo(1), 7);
      expect(penalty).toBeLessThan(20);
      expect(penalty).toBeGreaterThan(10);
    });

    it('should return ~50 for halfway through interval', () => {
      // Reviewed 3.5 days ago, interval is 7 days
      const penalty = calculateRecencyPenalty(getDaysAgo(3.5), 7);
      expect(penalty).toBeCloseTo(50, 0);
    });

    it('should calculate correct penalty for various intervals', () => {
      // 3 days into 7-day interval = ~42.8%
      const penalty3of7 = calculateRecencyPenalty(getDaysAgo(3), 7);
      expect(penalty3of7).toBeCloseTo(42.86, 0);

      // 5 days into 10-day interval = 50%
      const penalty5of10 = calculateRecencyPenalty(getDaysAgo(5), 10);
      expect(penalty5of10).toBeCloseTo(50, 0);
    });

    it('should handle same-day review (0 days ago)', () => {
      const today = new Date().toISOString();
      const penalty = calculateRecencyPenalty(today, 7);
      expect(penalty).toBe(0);
    });

    it('should handle future dates gracefully', () => {
      // If lastReviewDate is in the future (shouldn't happen but handle it)
      const futureDate = getDaysFromNow(5);
      const penalty = calculateRecencyPenalty(futureDate, 7);
      expect(penalty).toBe(0); // Future review = no penalty
    });

    it('should handle invalid date strings', () => {
      const penalty = calculateRecencyPenalty('invalid-date', 7);
      expect(penalty).toBe(100); // Treat as needs review
    });

    it('should throw error for negative interval', () => {
      expect(() => calculateRecencyPenalty(getDaysAgo(5), -1)).toThrow(
        'Interval cannot be negative'
      );
    });

    it('should return value between 0 and 100', () => {
      for (let daysAgo = 0; daysAgo <= 30; daysAgo++) {
        for (let interval = 1; interval <= 30; interval++) {
          const penalty = calculateRecencyPenalty(getDaysAgo(daysAgo), interval);
          expect(penalty).toBeGreaterThanOrEqual(0);
          expect(penalty).toBeLessThanOrEqual(100);
        }
      }
    });
  });

  // ============================================================================
  // CEFR Match Tests
  // ============================================================================

  describe('calculateCefrMatch', () => {
    it('should return 100 for exact match', () => {
      expect(calculateCefrMatch('A1', 'A1')).toBe(100);
      expect(calculateCefrMatch('B1', 'B1')).toBe(100);
      expect(calculateCefrMatch('C2', 'C2')).toBe(100);
    });

    it('should return 75 for one level difference', () => {
      expect(calculateCefrMatch('A2', 'A1')).toBe(75); // One level up
      expect(calculateCefrMatch('A1', 'A2')).toBe(75); // One level down
      expect(calculateCefrMatch('B2', 'B1')).toBe(75);
      expect(calculateCefrMatch('B1', 'B2')).toBe(75);
    });

    it('should return 50 for two level difference', () => {
      expect(calculateCefrMatch('B1', 'A1')).toBe(50); // Two levels up
      expect(calculateCefrMatch('A1', 'B1')).toBe(50); // Two levels down
      expect(calculateCefrMatch('C1', 'B1')).toBe(50);
    });

    it('should return 25 for three or more level difference', () => {
      expect(calculateCefrMatch('B2', 'A1')).toBe(25); // Three levels
      expect(calculateCefrMatch('C2', 'A1')).toBe(25); // Five levels
      expect(calculateCefrMatch('A1', 'C2')).toBe(25); // Five levels (opposite)
    });

    it('should handle all CEFR level combinations', () => {
      const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

      for (const wordLevel of levels) {
        for (const userLevel of levels) {
          const match = calculateCefrMatch(wordLevel, userLevel);
          expect(match).toBeGreaterThanOrEqual(25);
          expect(match).toBeLessThanOrEqual(100);
        }
      }
    });

    it('should be symmetrical (same result regardless of order)', () => {
      expect(calculateCefrMatch('A1', 'B1')).toBe(calculateCefrMatch('B1', 'A1'));
      expect(calculateCefrMatch('A2', 'C1')).toBe(calculateCefrMatch('C1', 'A2'));
    });
  });

  // ============================================================================
  // Milestone Urgency Tests
  // ============================================================================

  describe('calculateMilestoneUrgency', () => {
    it('should return 50 for no milestone', () => {
      const urgency = calculateMilestoneUrgency(['travel', 'food'], undefined);
      expect(urgency).toBe(50);
    });

    it('should return 50 for empty tags with no milestone', () => {
      const urgency = calculateMilestoneUrgency([], undefined);
      expect(urgency).toBe(50);
    });

    it('should return 100 when word matches current milestone', () => {
      const urgency = calculateMilestoneUrgency(['travel', 'food'], 'travel');
      expect(urgency).toBe(100);
    });

    it('should return 50 when word does not match current milestone', () => {
      const urgency = calculateMilestoneUrgency(['work', 'business'], 'travel');
      expect(urgency).toBe(50);
    });

    it('should handle multiple matching tags', () => {
      const urgency = calculateMilestoneUrgency(
        ['travel', 'vacation', 'tourism'],
        'travel'
      );
      expect(urgency).toBe(100);
    });

    it('should handle empty milestone tags', () => {
      const urgency = calculateMilestoneUrgency([], 'travel');
      expect(urgency).toBe(50);
    });
  });

  // ============================================================================
  // Batch Operations Tests
  // ============================================================================

  describe('calculatePrioritiesForWords', () => {
    it('should calculate priorities for multiple words', () => {
      const words = [
        createMockWord({
          id: '1',
          cefrLevel: 'A1',
          timesCorrect: 5,
          timesIncorrect: 5,
        }),
        createMockWord({
          id: '2',
          cefrLevel: 'A2',
          timesCorrect: 10,
          timesIncorrect: 0,
        }),
        createMockWord({
          id: '3',
          cefrLevel: 'B1',
          timesCorrect: 0,
          timesIncorrect: 10,
        }),
      ];

      const results = calculatePrioritiesForWords(words, 'A1');

      expect(results).toHaveLength(3);
      expect(results[0].wordId).toBe('1');
      expect(results[1].wordId).toBe('2');
      expect(results[2].wordId).toBe('3');
    });

    it('should return priority results with all required fields', () => {
      const words = [createMockWord()];
      const results = calculatePrioritiesForWords(words, 'A1');

      expect(results[0]).toHaveProperty('wordId');
      expect(results[0]).toHaveProperty('priority');
      expect(results[0]).toHaveProperty('factors');
      expect(results[0]).toHaveProperty('calculatedAt');
      expect(results[0]).toHaveProperty('breakdown');
    });

    it('should include factor breakdown', () => {
      const words = [createMockWord()];
      const results = calculatePrioritiesForWords(words, 'A1');

      expect(results[0].breakdown).toHaveProperty('milestoneContribution');
      expect(results[0].breakdown).toHaveProperty('weaknessContribution');
      expect(results[0].breakdown).toHaveProperty('recencyContribution');
      expect(results[0].breakdown).toHaveProperty('cefrContribution');
    });

    it('should handle milestone parameter', () => {
      const words = [
        createMockWord({
          id: '1',
          milestoneTags: ['travel'],
        }),
      ];

      const results = calculatePrioritiesForWords(words, 'A1', 'travel');

      expect(results[0].factors.milestoneUrgency).toBe(100);
    });

    it('should handle empty word array', () => {
      const results = calculatePrioritiesForWords([], 'A1');
      expect(results).toEqual([]);
    });

    it('should calculate higher priority for weaker words', () => {
      const words = [
        createMockWord({
          id: 'strong',
          timesCorrect: 10,
          timesIncorrect: 0,
          lastReviewDate: getDaysAgo(1),
          interval: 7,
        }),
        createMockWord({
          id: 'weak',
          timesCorrect: 0,
          timesIncorrect: 10,
          lastReviewDate: getDaysAgo(10),
          interval: 7,
        }),
      ];

      const results = calculatePrioritiesForWords(words, 'A1');

      // Weak word should have higher priority
      const strongPriority = results.find((r) => r.wordId === 'strong')?.priority;
      const weakPriority = results.find((r) => r.wordId === 'weak')?.priority;

      expect(weakPriority).toBeGreaterThan(strongPriority!);
    });
  });

  // ============================================================================
  // Sorting Tests
  // ============================================================================

  describe('sortByPriority', () => {
    it('should sort words by priority (highest first)', () => {
      const words = [
        createMockWord({ id: '1', priority: 3.5 }),
        createMockWord({ id: '2', priority: 8.2 }),
        createMockWord({ id: '3', priority: 5.7 }),
      ];

      const sorted = sortByPriority(words);

      expect(sorted[0].id).toBe('2'); // 8.2
      expect(sorted[1].id).toBe('3'); // 5.7
      expect(sorted[2].id).toBe('1'); // 3.5
    });

    it('should not modify original array', () => {
      const words = [
        createMockWord({ id: '1', priority: 3.5 }),
        createMockWord({ id: '2', priority: 8.2 }),
      ];

      const originalOrder = words.map((w) => w.id);
      sortByPriority(words);

      expect(words.map((w) => w.id)).toEqual(originalOrder);
    });

    it('should handle empty array', () => {
      const sorted = sortByPriority([]);
      expect(sorted).toEqual([]);
    });

    it('should handle single word', () => {
      const words = [createMockWord({ id: '1', priority: 5.0 })];
      const sorted = sortByPriority(words);
      expect(sorted).toHaveLength(1);
      expect(sorted[0].id).toBe('1');
    });

    it('should handle equal priorities', () => {
      const words = [
        createMockWord({ id: '1', priority: 5.0 }),
        createMockWord({ id: '2', priority: 5.0 }),
        createMockWord({ id: '3', priority: 5.0 }),
      ];

      const sorted = sortByPriority(words);
      expect(sorted).toHaveLength(3);
      // Order should be stable for equal priorities
    });
  });

  // ============================================================================
  // Top Priority Words Tests
  // ============================================================================

  describe('getTopPriorityWords', () => {
    it('should return top N priority words', () => {
      const words = [
        createMockWord({ id: '1', priority: 3.5 }),
        createMockWord({ id: '2', priority: 8.2 }),
        createMockWord({ id: '3', priority: 5.7 }),
        createMockWord({ id: '4', priority: 9.1 }),
        createMockWord({ id: '5', priority: 2.3 }),
      ];

      const top3 = getTopPriorityWords(words, 3);

      expect(top3).toHaveLength(3);
      expect(top3[0].id).toBe('4'); // 9.1
      expect(top3[1].id).toBe('2'); // 8.2
      expect(top3[2].id).toBe('3'); // 5.7
    });

    it('should handle count larger than array length', () => {
      const words = [
        createMockWord({ id: '1', priority: 5.0 }),
        createMockWord({ id: '2', priority: 7.0 }),
      ];

      const top5 = getTopPriorityWords(words, 5);
      expect(top5).toHaveLength(2);
    });

    it('should handle empty array', () => {
      const top3 = getTopPriorityWords([], 3);
      expect(top3).toEqual([]);
    });

    it('should handle count of 0', () => {
      const words = [createMockWord()];
      const top0 = getTopPriorityWords(words, 0);
      expect(top0).toEqual([]);
    });
  });

  // ============================================================================
  // Performance Tests
  // ============================================================================

  describe('Performance', () => {
    it('single calculation should be fast (<1ms)', () => {
      const factors: PriorityFactors = {
        milestoneUrgency: 75,
        weaknessScore: 60,
        recencyPenalty: 80,
        cefrMatch: 100,
      };

      const start = performance.now();
      calculatePriority(factors);
      const end = performance.now();

      expect(end - start).toBeLessThan(1);
    });

    it('should handle 1000 words efficiently', () => {
      const words = Array.from({ length: 1000 }, (_, i) =>
        createMockWord({ id: `word-${i}` })
      );

      const start = performance.now();
      calculatePrioritiesForWords(words, 'B1');
      const end = performance.now();

      // Should process 1000 words in reasonable time
      expect(end - start).toBeLessThan(100); // 100ms for 1000 words
    });
  });

  // ============================================================================
  // Integration Tests
  // ============================================================================

  describe('Integration: Complete Priority Flow', () => {
    it('should correctly prioritize words in realistic scenario', () => {
      const words = [
        // Word 1: Perfect mastery, recently reviewed, matches level
        createMockWord({
          id: 'perfect',
          cefrLevel: 'B1',
          timesCorrect: 20,
          timesIncorrect: 0,
          lastReviewDate: getDaysAgo(1),
          interval: 30,
        }),
        // Word 2: Weak mastery, never reviewed, matches level
        createMockWord({
          id: 'weak',
          cefrLevel: 'B1',
          timesCorrect: 2,
          timesIncorrect: 8,
          lastReviewDate: undefined,
          interval: 0,
        }),
        // Word 3: Overdue, matches level
        createMockWord({
          id: 'overdue',
          cefrLevel: 'B1',
          timesCorrect: 5,
          timesIncorrect: 5,
          lastReviewDate: getDaysAgo(15),
          interval: 7,
        }),
        // Word 4: Wrong level
        createMockWord({
          id: 'wrong-level',
          cefrLevel: 'C2',
          timesCorrect: 0,
          timesIncorrect: 0,
          lastReviewDate: undefined,
          interval: 0,
        }),
      ];

      const results = calculatePrioritiesForWords(words, 'B1');
      const sorted = sortByPriority(
        words.map((w, i) => ({ ...w, priority: results[i].priority }))
      );

      // Expected order (highest to lowest priority):
      // 1. 'weak' - high weakness, never reviewed, matches level
      // 2. 'overdue' - overdue, medium weakness, matches level
      // 3. 'wrong-level' - never reviewed but wrong level
      // 4. 'perfect' - low weakness, recently reviewed

      expect(sorted[0].id).toBe('weak');
      expect(sorted[sorted.length - 1].id).toBe('perfect');
    });

    it('should prioritize milestone-relevant words higher', () => {
      const words = [
        createMockWord({
          id: 'relevant',
          milestoneTags: ['travel'],
          timesCorrect: 5,
          timesIncorrect: 5,
        }),
        createMockWord({
          id: 'not-relevant',
          milestoneTags: ['work'],
          timesCorrect: 5,
          timesIncorrect: 5,
        }),
      ];

      const results = calculatePrioritiesForWords(words, 'A1', 'travel');

      const relevantPriority = results.find((r) => r.wordId === 'relevant')
        ?.priority;
      const notRelevantPriority = results.find((r) => r.wordId === 'not-relevant')
        ?.priority;

      expect(relevantPriority).toBeGreaterThan(notRelevantPriority!);
    });
  });
});
