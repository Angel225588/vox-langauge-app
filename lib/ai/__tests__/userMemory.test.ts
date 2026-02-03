/**
 * AI Memory System - Unit Tests
 *
 * Tests for the user memory system functionality.
 */

import {
  initializeUserMemory,
  getUserMemory,
  updateUserMemory,
  updateMemoryAfterLesson,
  updateMemoryAfterCalibrator,
  generateMemorySummary,
  analyzePatterns,
  calculateCEFRLevel,
  type UserAIMemory,
  type LessonResult,
  type LessonProgress,
} from '../userMemory';

import type { CalibrationResult } from '../../../types/calibration';

describe('User Memory System', () => {
  const TEST_USER_ID = 'test_user_123';

  beforeEach(() => {
    // Reset memory store before each test
    // In a real implementation, this would clear the database
  });

  describe('initializeUserMemory', () => {
    it('should initialize user memory with correct defaults', async () => {
      const memory = await initializeUserMemory({
        user_id: TEST_USER_ID,
        native_language: 'Spanish',
        target_language: 'English',
        motivation: 'Job interviews',
        proficiency_level: 'intermediate',
        commitment_stakes: 'Career',
      });

      expect(memory.user_id).toBe(TEST_USER_ID);
      expect(memory.native_language).toBe('Spanish');
      expect(memory.target_language).toBe('English');
      expect(memory.current_cefr_level).toBe('B1');
      expect(memory.declared_level).toBe('intermediate');
      expect(memory.total_lessons_completed).toBe(0);
      expect(memory.total_vocab_learned).toBe(0);
      expect(memory.current_streak).toBe(0);
    });

    it('should map proficiency levels correctly', async () => {
      const testCases = [
        { proficiency: 'beginner', expected_cefr: 'A0', expected_declared: 'beginner' },
        { proficiency: 'basics', expected_cefr: 'A1', expected_declared: 'basics' },
        { proficiency: 'intermediate', expected_cefr: 'B1', expected_declared: 'intermediate' },
        { proficiency: 'advanced', expected_cefr: 'C1', expected_declared: 'advanced' },
      ];

      for (const testCase of testCases) {
        const memory = await initializeUserMemory({
          user_id: `${TEST_USER_ID}_${testCase.proficiency}`,
          native_language: 'Spanish',
          target_language: 'English',
          motivation: 'Test',
          proficiency_level: testCase.proficiency,
          commitment_stakes: 'Test',
        });

        expect(memory.current_cefr_level).toBe(testCase.expected_cefr);
        expect(memory.declared_level).toBe(testCase.expected_declared);
      }
    });
  });

  describe('getUserMemory', () => {
    it('should retrieve existing memory', async () => {
      await initializeUserMemory({
        user_id: TEST_USER_ID,
        native_language: 'Spanish',
        target_language: 'English',
        motivation: 'Test',
        proficiency_level: 'intermediate',
        commitment_stakes: 'Test',
      });

      const memory = await getUserMemory(TEST_USER_ID);
      expect(memory).not.toBeNull();
      expect(memory?.user_id).toBe(TEST_USER_ID);
    });

    it('should return null for non-existent user', async () => {
      const memory = await getUserMemory('non_existent_user');
      expect(memory).toBeNull();
    });
  });

  describe('updateMemoryAfterLesson', () => {
    beforeEach(async () => {
      await initializeUserMemory({
        user_id: TEST_USER_ID,
        native_language: 'Spanish',
        target_language: 'English',
        motivation: 'Test',
        proficiency_level: 'intermediate',
        commitment_stakes: 'Test',
      });
    });

    it('should update lesson stats correctly', async () => {
      const lessonResult: LessonResult = {
        lesson_type: 'vocabulary',
        cards_good: 8,
        cards_total: 10,
        vocab_learned: ['word1', 'word2', 'word3'],
        time_spent: 300,
      };

      await updateMemoryAfterLesson(TEST_USER_ID, lessonResult);

      const memory = await getUserMemory(TEST_USER_ID);
      expect(memory?.total_lessons_completed).toBe(1);
      expect(memory?.total_vocab_learned).toBe(3);
      expect(memory?.total_time_spent).toBe(300);
      expect(memory?.current_streak).toBe(1);
    });

    it('should update skill scores based on lesson performance', async () => {
      const lessonResult: LessonResult = {
        lesson_type: 'vocabulary',
        cards_good: 9,
        cards_total: 10, // 90% accuracy
        vocab_learned: [],
        time_spent: 300,
      };

      await updateMemoryAfterLesson(TEST_USER_ID, lessonResult);

      const memory = await getUserMemory(TEST_USER_ID);
      // Vocabulary score should increase (weighted average)
      expect(memory?.skill_scores.vocabulary).toBeGreaterThan(0);
    });

    it('should track lesson completion streaks', async () => {
      // Day 1
      await updateMemoryAfterLesson(TEST_USER_ID, {
        lesson_type: 'vocabulary',
        cards_good: 8,
        cards_total: 10,
        vocab_learned: [],
        time_spent: 300,
      });

      let memory = await getUserMemory(TEST_USER_ID);
      expect(memory?.current_streak).toBe(1);

      // Same day - streak shouldn't change
      await updateMemoryAfterLesson(TEST_USER_ID, {
        lesson_type: 'listening',
        cards_good: 7,
        cards_total: 10,
        vocab_learned: [],
        time_spent: 300,
      });

      memory = await getUserMemory(TEST_USER_ID);
      expect(memory?.current_streak).toBe(1);
    });

    it('should add AI observations for high performance', async () => {
      await updateMemoryAfterLesson(TEST_USER_ID, {
        lesson_type: 'vocabulary',
        cards_good: 9,
        cards_total: 10, // 90% accuracy
        vocab_learned: ['word1'],
        time_spent: 300,
      });

      const memory = await getUserMemory(TEST_USER_ID);
      expect(memory?.ai_observations.observations.length).toBeGreaterThan(0);
      expect(memory?.ai_observations.wins.length).toBeGreaterThan(0);
    });
  });

  describe('updateMemoryAfterCalibrator', () => {
    beforeEach(async () => {
      await initializeUserMemory({
        user_id: TEST_USER_ID,
        native_language: 'Spanish',
        target_language: 'English',
        motivation: 'Test',
        proficiency_level: 'intermediate',
        commitment_stakes: 'Test',
      });
    });

    it('should update CEFR level and skill scores', async () => {
      const calibrationResult: CalibrationResult = {
        declaredLevel: 'intermediate',
        calibratedLevel: 'B2',
        calibrationDate: new Date().toISOString(),
        skills: {
          vocabulary: {
            skill: 'vocabulary',
            estimatedLevel: 'B2',
            confidence: 0.85,
            insights: {
              strengths: ['Business vocabulary'],
              areasToExplore: ['Idioms'],
              suggestedFocus: ['Practice idioms'],
            },
          },
          listening: {
            skill: 'listening',
            estimatedLevel: 'B1',
            confidence: 0.75,
            insights: {
              strengths: ['Clear speech'],
              areasToExplore: ['Fast speech'],
              suggestedFocus: ['Watch videos'],
            },
          },
          speaking: {
            skill: 'speaking',
            estimatedLevel: 'A2',
            confidence: 0.7,
            insights: {
              strengths: ['Basic sentences'],
              areasToExplore: ['Pronunciation'],
              suggestedFocus: ['Practice speaking'],
            },
          },
        },
        responses: [],
        recommendations: {
          startingPoint: 'Focus on speaking',
          focusAreas: ['Speaking fluency', 'Pronunciation'],
          contentTypes: ['speaking', 'listening'],
          estimatedTimeToNextLevel: '2-3 months',
        },
        pointsEarned: 70,
        probesCompleted: 3,
        totalTime: 180000,
      };

      const memory = await updateMemoryAfterCalibrator(TEST_USER_ID, calibrationResult);

      expect(memory.current_cefr_level).toBe('B2');
      expect(memory.skill_scores.vocabulary).toBe(80); // B2 = 80
      expect(memory.skill_scores.speaking).toBe(50); // A2 = 50
      expect(memory.insights.strengths).toContain('vocabulary');
      expect(memory.insights.weaknesses).toContain('speaking');
      expect(memory.calibration_history.length).toBe(1);
    });
  });

  describe('generateMemorySummary', () => {
    it('should generate markdown summary', async () => {
      const memory = await initializeUserMemory({
        user_id: TEST_USER_ID,
        native_language: 'Spanish',
        target_language: 'English',
        motivation: 'Job interviews',
        proficiency_level: 'intermediate',
        commitment_stakes: 'Career',
      });

      const summary = generateMemorySummary(memory);

      expect(summary).toContain('## User Profile');
      expect(summary).toContain('Spanish');
      expect(summary).toContain('English');
      expect(summary).toContain('Job interviews');
      expect(summary).toContain('## Learning Progress');
      expect(summary).toContain('## Skill Levels');
      expect(summary).toContain('## Recommendations');
    });
  });

  describe('analyzePatterns', () => {
    it('should identify strengths and weaknesses', () => {
      const lessonHistory: LessonProgress[] = [
        {
          lesson_id: '1',
          lesson_type: 'vocabulary',
          cards_good: 9,
          cards_total: 10,
          accuracy: 90,
          time_spent: 300,
          vocab_learned: ['word1'],
          completed_at: '2025-12-10T09:00:00Z',
        },
        {
          lesson_id: '2',
          lesson_type: 'vocabulary',
          cards_good: 8,
          cards_total: 10,
          accuracy: 80,
          time_spent: 300,
          vocab_learned: ['word2'],
          completed_at: '2025-12-10T10:00:00Z',
        },
        {
          lesson_id: '3',
          lesson_type: 'speaking',
          cards_good: 5,
          cards_total: 10,
          accuracy: 50,
          time_spent: 600,
          vocab_learned: [],
          completed_at: '2025-12-10T11:00:00Z',
        },
      ];

      const patterns = analyzePatterns(lessonHistory);

      expect(patterns.strengths).toContain('vocabulary');
      expect(patterns.weaknesses).toContain('speaking');
      expect(patterns.observations.length).toBeGreaterThan(0);
    });

    it('should return empty arrays for no history', () => {
      const patterns = analyzePatterns([]);

      expect(patterns.strengths).toEqual([]);
      expect(patterns.weaknesses).toEqual([]);
      expect(patterns.observations).toEqual([]);
    });
  });

  describe('calculateCEFRLevel', () => {
    it('should calculate correct CEFR levels', () => {
      const testCases = [
        { scores: { vocabulary: 10, grammar: 10, speaking: 10, listening: 10 }, expected: 'A0' },
        { scores: { vocabulary: 30, grammar: 30, speaking: 30, listening: 30 }, expected: 'A1' },
        { scores: { vocabulary: 50, grammar: 50, speaking: 50, listening: 50 }, expected: 'A2' },
        { scores: { vocabulary: 65, grammar: 65, speaking: 65, listening: 65 }, expected: 'B1' },
        { scores: { vocabulary: 80, grammar: 80, speaking: 80, listening: 80 }, expected: 'B2' },
        { scores: { vocabulary: 90, grammar: 90, speaking: 90, listening: 90 }, expected: 'C1' },
        { scores: { vocabulary: 100, grammar: 100, speaking: 100, listening: 100 }, expected: 'C2' },
      ];

      testCases.forEach(({ scores, expected }) => {
        const level = calculateCEFRLevel(scores);
        expect(level).toBe(expected);
      });
    });
  });
});
