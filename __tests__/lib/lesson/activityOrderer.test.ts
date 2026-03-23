/**
 * Activity Orderer Tests
 *
 * Verifies that the dynamic lesson ordering system correctly:
 * - Orders activities by user weakness (lowest scores first)
 * - Keeps discovery lessons static (no reordering)
 * - Generates keep-going activities based on weakness priority
 */

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock('@/lib/db/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock('@/lib/db/competencyMetrics');
jest.mock('@/lib/metrics/competencyEngine');

import {
  getWeaknessOrder,
  reorderActivities,
  getKeepGoingActivities,
} from '@/lib/lesson/activityOrderer';
import type { ActivityTemplate, LevelGroup, ActivityType } from '@/lib/lesson/lessonTemplates';
import * as competencyMetrics from '@/lib/db/competencyMetrics';
import * as competencyEngine from '@/lib/metrics/competencyEngine';

describe('ActivityOrderer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── getWeaknessOrder Tests ──────────────────────────────

  describe('getWeaknessOrder', () => {
    it('returns default order when no scores exist', async () => {
      (competencyMetrics.getAllScores as jest.Mock).mockResolvedValue([]);

      const order = await getWeaknessOrder('user-123');

      expect(order).toEqual(['vocabulary', 'listening', 'reading', 'voice_call', 'writing']);
    });

    it('orders activities by weakness (lowest scores first)', async () => {
      const mockScores = [
        { type: 'listening' as const, articulation: 30, fluency: 0, communication: 0, scenario: 0 },
        { type: 'reading' as const, articulation: 80, fluency: 0, communication: 0, scenario: 0 },
        { type: 'writing' as const, articulation: 50, fluency: 0, communication: 0, scenario: 0 },
        { type: 'conversation' as const, articulation: 40, fluency: 0, communication: 0, scenario: 0 },
      ];

      (competencyMetrics.getAllScores as jest.Mock).mockResolvedValue(mockScores);
      (competencyEngine.computeByType as jest.Mock).mockReturnValue({
        listening: { avg: 30, count: 1 },
        reading: { avg: 80, count: 1 },
        writing: { avg: 50, count: 1 },
        conversation: { avg: 40, count: 1 },
        vocabulary: { avg: 0, count: 0 },
      });

      const order = await getWeaknessOrder('user-123');

      expect(order[0]).toBe('listening');
      expect(order.indexOf('voice_call')).toBeLessThan(order.indexOf('writing'));
      expect(order.indexOf('writing')).toBeLessThan(order.indexOf('reading'));
    });

    it('breaks ties by least-practiced activity', async () => {
      (competencyMetrics.getAllScores as jest.Mock).mockResolvedValue([
        { type: 'listening' as const, articulation: 50 },
        { type: 'reading' as const, articulation: 50 },
      ]);
      (competencyEngine.computeByType as jest.Mock).mockReturnValue({
        listening: { avg: 50, count: 10 },
        reading: { avg: 50, count: 2 },
        writing: { avg: 0, count: 0 },
        conversation: { avg: 0, count: 0 },
        vocabulary: { avg: 0, count: 0 },
      });

      const order = await getWeaknessOrder('user-123');

      expect(order.indexOf('reading')).toBeLessThan(order.indexOf('listening'));
    });

    it('falls back to default order on error', async () => {
      (competencyMetrics.getAllScores as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      const order = await getWeaknessOrder('user-123');

      expect(order).toEqual(['vocabulary', 'listening', 'reading', 'voice_call', 'writing']);
    });
  });

  // ─── reorderActivities Tests ────────────────────────────

  describe('reorderActivities', () => {
    const mockActivities: ActivityTemplate[] = [
      {
        type: 'vocabulary',
        title: 'Vocabulary',
        description: 'Learn words',
        icon: 'book',
        estimated_seconds: 180,
        config: { type: 'vocabulary', word_count: 5, show_translations: true },
      },
      {
        type: 'listening',
        title: 'Listening',
        description: 'Listen to audio',
        icon: 'headset',
        estimated_seconds: 120,
        config: { type: 'listening', sentence_count: 5, speed: 'normal' },
      },
      {
        type: 'reading',
        title: 'Reading',
        description: 'Read passage',
        icon: 'reader',
        estimated_seconds: 150,
        config: { type: 'reading', word_count: 200, question_count: 3 },
      },
      {
        type: 'writing',
        title: 'Writing',
        description: 'Write response',
        icon: 'create',
        estimated_seconds: 120,
        config: { type: 'writing', prompt_type: 'response', word_target: 50 },
      },
    ];

    it('keeps discovery lessons unchanged (static order)', () => {
      const weaknessOrder: ActivityType[] = ['reading', 'listening', 'writing', 'vocabulary'];

      const reordered = reorderActivities(
        mockActivities,
        weaknessOrder,
        true,
        'intermediate',
      );

      expect(reordered).toEqual(mockActivities);
    });

    it('reorders non-discovery lessons by weakness for intermediate/advanced', () => {
      const weaknessOrder: ActivityType[] = ['reading', 'listening', 'writing', 'vocabulary'];

      const reordered = reorderActivities(
        mockActivities,
        weaknessOrder,
        false,
        'advanced',
      );

      const types = reordered.map((a) => a.type);
      expect(types[0]).toBe('reading');
      expect(types[1]).toBe('listening');
    });

    it('keeps vocabulary first for beginners, reorders rest', () => {
      const weaknessOrder: ActivityType[] = ['reading', 'listening', 'writing', 'vocabulary'];

      const reordered = reorderActivities(
        mockActivities,
        weaknessOrder,
        false,
        'beginner',
      );

      const types = reordered.map((a) => a.type);

      expect(types[0]).toBe('vocabulary');
      expect(types[1]).toBe('reading');
      expect(types[2]).toBe('listening');
      expect(types[3]).toBe('writing');
    });

    it('returns original order if no weakness data', () => {
      const reordered = reorderActivities(mockActivities, [], false, 'intermediate');

      expect(reordered).toEqual(mockActivities);
    });

    it('preserves activity metadata during reordering', () => {
      const weaknessOrder: ActivityType[] = ['reading', 'listening', 'writing', 'vocabulary'];

      const reordered = reorderActivities(
        mockActivities,
        weaknessOrder,
        false,
        'advanced',
      );

      const readingActivity = reordered.find((a) => a.type === 'reading');
      expect(readingActivity?.title).toBe('Reading');
      expect(readingActivity?.description).toBe('Read passage');
      expect(readingActivity?.icon).toBe('reader');
      expect(readingActivity?.config).toEqual({
        type: 'reading',
        word_count: 200,
        question_count: 3,
      });
    });
  });

  // ─── getKeepGoingActivities Tests ────────────────────────

  describe('getKeepGoingActivities', () => {
    it('returns new activity types not yet completed', () => {
      const completedTypes: ActivityType[] = ['vocabulary', 'listening'];
      const weaknessOrder: ActivityType[] = ['reading', 'writing', 'voice_call'];

      const keepGoing = getKeepGoingActivities(
        completedTypes,
        weaknessOrder,
        'intermediate',
        2,
      );

      expect(keepGoing.length).toBe(2);

      const types = keepGoing.map((a) => a.type);

      expect(types[0]).toBe('reading');
      expect(types[1]).toBe('writing');
    });

    it('cycles back to weakest types when all exhausted', () => {
      const completedTypes: ActivityType[] = ['vocabulary', 'listening', 'reading', 'writing', 'voice_call'];
      const weaknessOrder: ActivityType[] = ['reading', 'voice_call', 'vocabulary'];

      const keepGoing = getKeepGoingActivities(
        completedTypes,
        weaknessOrder,
        'beginner',
        2,
      );

      expect(keepGoing.length).toBe(2);

      const types = keepGoing.map((a) => a.type);
      expect(types[0]).toBe('reading');
    });

    it('respects level group for activity configs', () => {
      const completedTypes: ActivityType[] = [];
      const weaknessOrder: ActivityType[] = ['reading', 'writing', 'listening'];

      const beginnerKeepGoing = getKeepGoingActivities(
        completedTypes,
        weaknessOrder,
        'beginner',
        1,
      );

      const advancedKeepGoing = getKeepGoingActivities(
        completedTypes,
        weaknessOrder,
        'advanced',
        1,
      );

      expect(beginnerKeepGoing[0].type).toBe(advancedKeepGoing[0].type);

      const beginnerReading = beginnerKeepGoing[0];
      const advancedReading = advancedKeepGoing[0];

      if (beginnerReading.config.type === 'reading' && advancedReading.config.type === 'reading') {
        expect(beginnerReading.config.word_count).toBeLessThanOrEqual(
          advancedReading.config.word_count,
        );
      }
    });

    it('returns requested count of activities', () => {
      const completedTypes: ActivityType[] = [];
      const weaknessOrder: ActivityType[] = ['listening', 'reading', 'writing', 'voice_call', 'vocabulary'];

      const keepGoing2 = getKeepGoingActivities(
        completedTypes,
        weaknessOrder,
        'intermediate',
        2,
      );

      const keepGoing4 = getKeepGoingActivities(
        completedTypes,
        weaknessOrder,
        'intermediate',
        4,
      );

      expect(keepGoing2.length).toBe(2);
      expect(keepGoing4.length).toBe(4);
    });

    it('uses default order if weakness order empty', () => {
      const completedTypes: ActivityType[] = [];
      const weaknessOrder: ActivityType[] = [];

      const keepGoing = getKeepGoingActivities(
        completedTypes,
        weaknessOrder,
        'beginner',
        2,
      );

      expect(keepGoing.length).toBe(2);
      const types = keepGoing.map((a) => a.type);
      expect(types[0]).toBe('vocabulary');
    });
  });

  // ─── Integration Tests ───────────────────────────────────

  describe('Integration: Discovery vs Non-Discovery', () => {
    it('discovery lessons never reorder activities', () => {
      const activities: ActivityTemplate[] = [
        {
          type: 'vocabulary',
          title: 'Vocab',
          description: 'Words',
          icon: 'book',
          estimated_seconds: 180,
          config: { type: 'vocabulary', word_count: 5, show_translations: true },
        },
        {
          type: 'listening',
          title: 'Listen',
          description: 'Audio',
          icon: 'headset',
          estimated_seconds: 120,
          config: { type: 'listening', sentence_count: 5, speed: 'normal' },
        },
      ];

      const weaknessOrder: ActivityType[] = ['listening', 'vocabulary'];

      const discoveryReordered = reorderActivities(
        activities,
        weaknessOrder,
        true,
        'intermediate',
      );

      const nonDiscoveryReordered = reorderActivities(
        activities,
        weaknessOrder,
        false,
        'advanced',
      );

      expect(discoveryReordered).toEqual(activities);
      expect(nonDiscoveryReordered[0].type).toBe('listening');
    });

    it('beginner lessons keep vocabulary first, others reorder', () => {
      const activities: ActivityTemplate[] = [
        {
          type: 'vocabulary',
          title: 'Vocab',
          description: 'Words',
          icon: 'book',
          estimated_seconds: 180,
          config: { type: 'vocabulary', word_count: 5, show_translations: true },
        },
        {
          type: 'listening',
          title: 'Listen',
          description: 'Audio',
          icon: 'headset',
          estimated_seconds: 120,
          config: { type: 'listening', sentence_count: 5, speed: 'normal' },
        },
      ];

      const weaknessOrder: ActivityType[] = ['listening', 'vocabulary'];

      const beginnerReordered = reorderActivities(
        activities,
        weaknessOrder,
        false,
        'beginner',
      );

      const advancedReordered = reorderActivities(
        activities,
        weaknessOrder,
        false,
        'advanced',
      );

      expect(beginnerReordered[0].type).toBe('vocabulary');
      expect(advancedReordered[0].type).toBe('listening');
    });
  });

  // ─── Edge Cases ──────────────────────────────────────────

  describe('Edge Cases', () => {
    it('handles single activity template', () => {
      const single: ActivityTemplate[] = [
        {
          type: 'voice_call',
          title: 'Voice Call',
          description: 'Conversation',
          icon: 'mic',
          estimated_seconds: 60,
          config: { type: 'voice_call', duration_seconds: 60, is_discovery: false },
        },
      ];

      const reordered = reorderActivities(single, ['voice_call'], false, 'intermediate');
      expect(reordered.length).toBe(1);
      expect(reordered[0].type).toBe('voice_call');
    });

    it('handles missing activity types in weakness order', () => {
      const activities: ActivityTemplate[] = [
        {
          type: 'vocabulary',
          title: 'Vocabulary',
          description: 'Learn words',
          icon: 'book',
          estimated_seconds: 180,
          config: { type: 'vocabulary', word_count: 5, show_translations: true },
        },
      ];

      const weaknessOrder: ActivityType[] = ['listening', 'reading'];

      const reordered = reorderActivities(
        activities,
        weaknessOrder,
        false,
        'intermediate',
      );

      expect(reordered[0].type).toBe('vocabulary');
    });

    it('handles activity request beyond available types', () => {
      const completedTypes: ActivityType[] = ['reading'];
      const weaknessOrder: ActivityType[] = ['writing', 'listening', 'voice_call', 'reading', 'vocabulary'];

      const keepGoing = getKeepGoingActivities(
        completedTypes,
        weaknessOrder,
        'intermediate',
        3,
      );

      const types = keepGoing.map((a) => a.type);

      expect(types[0]).toBe('writing');
    });
  });
});
