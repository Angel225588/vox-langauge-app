/**
 * Tests for Conversation Persistence Layer
 *
 * Tests: saveConversationSession, getRecentSessions, updateSessionFeedback,
 * getConversationStats, row mappers.
 */

// Mock Supabase
const mockFrom = jest.fn();
const mockInsert = jest.fn();
const mockSelect = jest.fn();
const mockUpdate = jest.fn();
const mockEq = jest.fn();
const mockOrder = jest.fn();
const mockRange = jest.fn();
const mockSingle = jest.fn();

jest.mock('@/lib/db/supabase', () => ({
  supabase: {
    from: (...args: any[]) => {
      mockFrom(...args);
      return {
        insert: (...iArgs: any[]) => {
          mockInsert(...iArgs);
          return {
            select: (...sArgs: any[]) => {
              mockSelect(...sArgs);
              return {
                single: () => {
                  mockSingle();
                  return mockSingleResult;
                },
              };
            },
          };
        },
        select: (...sArgs: any[]) => {
          mockSelect(...sArgs);
          return {
            eq: (...eArgs: any[]) => {
              mockEq(...eArgs);
              return {
                ...mockQueryResult,
                order: (...oArgs: any[]) => {
                  mockOrder(...oArgs);
                  return {
                    range: (...rArgs: any[]) => {
                      mockRange(...rArgs);
                      return mockQueryResult;
                    },
                  };
                },
                single: () => {
                  mockSingle();
                  return mockSingleResult;
                },
                eq: (...eArgs2: any[]) => {
                  mockEq(...eArgs2);
                  return {
                    ...mockQueryResult,
                    order: (...oArgs: any[]) => {
                      mockOrder(...oArgs);
                      return mockQueryResult;
                    },
                    single: () => {
                      mockSingle();
                      return mockSingleResult;
                    },
                  };
                },
              };
            },
          };
        },
        update: (...uArgs: any[]) => {
          mockUpdate(...uArgs);
          return {
            eq: (...eArgs: any[]) => {
              mockEq(...eArgs);
              return mockUpdateResult;
            },
          };
        },
      };
    },
  },
}));

let mockSingleResult: any = { data: null, error: null };
let mockQueryResult: any = { data: [], error: null };
let mockUpdateResult: any = { error: null };

import {
  saveConversationSession,
  updateSessionFeedback,
  updateSessionVocabResults,
  getRecentSessions,
  getSession,
  getSessionMessages,
  getConversationStats,
} from '@/lib/db/conversations';

describe('Conversation Persistence Layer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSingleResult = { data: null, error: null };
    mockQueryResult = { data: [], error: null };
    mockUpdateResult = { error: null };
  });

  describe('saveConversationSession', () => {
    it('saves session and messages to Supabase', async () => {
      mockSingleResult = { data: { id: 'session_123' }, error: null };
      mockQueryResult = { error: null };

      const result = await saveConversationSession({
        userId: 'user_1',
        scenario: 'cafe_ordering',
        proficiency: 'intermediate',
        targetLanguage: 'es',
        startedAt: Date.now() - 60000,
        durationSeconds: 60,
        turnCount: 5,
        userWordCount: 30,
        avgWordsPerTurn: 6,
        pointsEarned: 50,
        messages: [
          { id: 'msg_1', role: 'user', content: 'Hola', timestamp: Date.now(), wordCount: 1 },
          { id: 'msg_2', role: 'assistant', content: 'Hola! Bienvenido.', timestamp: Date.now(), wordCount: 2 },
        ],
      });

      expect(result).toBe('session_123');
      // Should call from('conversation_sessions') for session
      expect(mockFrom).toHaveBeenCalledWith('conversation_sessions');
    });

    it('returns null when session insert fails', async () => {
      mockSingleResult = { data: null, error: { message: 'insert failed' } };

      const result = await saveConversationSession({
        userId: 'user_1',
        scenario: 'casual_chat',
        proficiency: 'beginner',
        targetLanguage: 'es',
        startedAt: Date.now(),
        durationSeconds: 30,
        turnCount: 2,
        userWordCount: 5,
        avgWordsPerTurn: 2.5,
        pointsEarned: 10,
        messages: [],
      });

      expect(result).toBeNull();
    });
  });

  describe('updateSessionFeedback', () => {
    it('updates feedback on existing session', async () => {
      mockUpdateResult = { error: null };

      const result = await updateSessionFeedback('session_123', {
        articulation: 75,
        fluency: 60,
        communication: 80,
        scenario: 70,
        summary: 'Good job!',
        strengths: ['Natural greetings'],
        improvements: ['Longer sentences'],
        newVocabulary: ['restaurante'],
      });

      expect(result).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ feedback: expect.objectContaining({ articulation: 75 }) })
      );
    });

    it('returns false when update fails', async () => {
      mockUpdateResult = { error: { message: 'update failed' } };

      const result = await updateSessionFeedback('bad_id', {
        articulation: 0,
        fluency: 0,
        communication: 0,
        scenario: 0,
        summary: 'Error',
        strengths: [],
        improvements: [],
        newVocabulary: [],
      });

      expect(result).toBe(false);
    });
  });

  describe('updateSessionVocabResults', () => {
    it('updates vocab used and missed words', async () => {
      mockUpdateResult = { error: null };

      const result = await updateSessionVocabResults(
        'session_123',
        ['café', 'pan'],
        ['agua']
      );

      expect(result).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith({
        vocab_used_words: ['café', 'pan'],
        vocab_missed_words: ['agua'],
      });
    });
  });

  describe('getRecentSessions', () => {
    it('fetches sessions ordered by date descending', async () => {
      mockQueryResult = {
        data: [
          {
            id: 's1',
            user_id: 'u1',
            scenario: 'cafe_ordering',
            proficiency: 'intermediate',
            target_language: 'es',
            started_at: '2026-02-11T10:00:00Z',
            duration_seconds: 120,
            turn_count: 8,
            user_word_count: 40,
            avg_words_per_turn: 5,
            points_earned: 75,
            feedback: null,
            vocab_prep_words: [],
            vocab_used_words: [],
            vocab_missed_words: [],
            created_at: '2026-02-11T10:00:00Z',
          },
        ],
        error: null,
      };

      const sessions = await getRecentSessions('u1', 20);

      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe('s1');
      expect(sessions[0].scenario).toBe('cafe_ordering');
      expect(sessions[0].durationSeconds).toBe(120);
    });

    it('returns empty array on error', async () => {
      mockQueryResult = { data: null, error: { message: 'network error' } };

      const sessions = await getRecentSessions('u1');

      expect(sessions).toEqual([]);
    });
  });

  describe('getConversationStats', () => {
    it('calculates aggregate stats correctly', async () => {
      mockQueryResult = {
        data: [
          { duration_seconds: 120, turn_count: 5, feedback: { articulation: 80, fluency: 70, communication: 90, scenario: 60 } },
          { duration_seconds: 180, turn_count: 8, feedback: { articulation: 70, fluency: 60, communication: 80, scenario: 50 } },
          { duration_seconds: 60, turn_count: 3, feedback: null }, // No feedback
        ],
        error: null,
      };

      const stats = await getConversationStats('u1');

      expect(stats).not.toBeNull();
      expect(stats!.totalSessions).toBe(3);
      expect(stats!.totalMinutes).toBe(6); // (120+180+60)/60 = 6
      expect(stats!.totalTurns).toBe(16); // 5+8+3
      // Averages only from sessions with feedback (2 sessions)
      expect(stats!.avgArticulation).toBe(75); // (80+70)/2
      expect(stats!.avgFluency).toBe(65);      // (70+60)/2
      expect(stats!.avgCommunication).toBe(85); // (90+80)/2
      expect(stats!.avgScenario).toBe(55);      // (60+50)/2
    });

    it('returns zeros when no sessions have feedback', async () => {
      mockQueryResult = {
        data: [
          { duration_seconds: 60, turn_count: 3, feedback: null },
        ],
        error: null,
      };

      const stats = await getConversationStats('u1');

      expect(stats!.avgArticulation).toBe(0);
      expect(stats!.avgFluency).toBe(0);
    });
  });
});
