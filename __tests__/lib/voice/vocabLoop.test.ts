/**
 * Tests for the Vocabulary ↔ Conversation Loop
 *
 * Tests: scenarioToCategory mapping, pre-call vocab retrieval,
 * post-call processing logic.
 */

// Mock the word bank storage
jest.mock('@/lib/word-bank/storage', () => ({
  getWords: jest.fn(),
  findWordByText: jest.fn(),
  addOrReinforceWord: jest.fn(),
  recordReview: jest.fn(),
}));

import { getPreCallVocab, processPostCallVocab } from '@/lib/voice/vocabLoop';
import { getWords, findWordByText, addOrReinforceWord, recordReview } from '@/lib/word-bank/storage';

const mockGetWords = getWords as jest.Mock;
const mockFindWordByText = findWordByText as jest.Mock;
const mockAddOrReinforce = addOrReinforceWord as jest.Mock;
const mockRecordReview = recordReview as jest.Mock;

// Helper to create a mock BankWord
function mockWord(id: string, word: string, category: string = 'general') {
  return {
    id,
    word,
    translation: `${word}_translation`,
    category,
    cefrLevel: 'A1',
    partOfSpeech: 'noun',
    masteryScore: 50,
    priority: 5,
    easeFactor: 2.5,
    interval: 1,
    repetitions: 1,
    nextReviewDate: new Date().toISOString(),
    timesCorrect: 1,
    timesIncorrect: 0,
    errorTypes: [],
    source: 'lesson',
    milestoneTags: [],
    exampleSentences: [],
    addedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

describe('Vocabulary ↔ Conversation Loop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // Pre-Call Vocab
  // ==========================================================================

  describe('getPreCallVocab', () => {
    it('returns category-matched words for cafe_ordering', async () => {
      const foodWords = [
        mockWord('1', 'café', 'food'),
        mockWord('2', 'agua', 'food'),
        mockWord('3', 'pan', 'food'),
      ];
      mockGetWords.mockResolvedValueOnce(foodWords);

      const result = await getPreCallVocab('cafe_ordering', 'es', 3);

      expect(result).toHaveLength(3);
      expect(mockGetWords).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'food', needsReview: true })
      );
    });

    it('fills remaining slots with due-for-review words', async () => {
      // First call (category) returns 1 word
      mockGetWords
        .mockResolvedValueOnce([mockWord('1', 'café', 'food')])
        // Second call (due words) returns more
        .mockResolvedValueOnce([
          mockWord('2', 'hola', 'greetings'),
          mockWord('3', 'gracias', 'greetings'),
        ]);

      const result = await getPreCallVocab('cafe_ordering', 'es', 3);

      expect(result).toHaveLength(3);
      expect(result[0].word).toBe('café');
    });

    it('returns empty array when no words available', async () => {
      mockGetWords.mockResolvedValue([]);

      const result = await getPreCallVocab('casual_chat', 'es', 5);

      expect(result).toHaveLength(0);
    });

    it('respects limit parameter', async () => {
      const manyWords = Array.from({ length: 10 }, (_, i) =>
        mockWord(`${i}`, `word_${i}`, 'food')
      );
      mockGetWords.mockResolvedValueOnce(manyWords);

      const result = await getPreCallVocab('cafe_ordering', 'es', 3);

      expect(result).toHaveLength(3);
    });

    it('maps shopping scenario to shopping category', async () => {
      mockGetWords.mockResolvedValue([]);

      await getPreCallVocab('shopping', 'es', 5);

      expect(mockGetWords).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'shopping' })
      );
    });

    it('maps directions scenario to travel category', async () => {
      mockGetWords.mockResolvedValue([]);

      await getPreCallVocab('directions', 'fr', 5);

      expect(mockGetWords).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'travel' })
      );
    });

    it('maps job_interview scenario to work category', async () => {
      mockGetWords.mockResolvedValue([]);

      await getPreCallVocab('job_interview', 'en', 5);

      expect(mockGetWords).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'work' })
      );
    });

    it('maps unknown scenario to general category', async () => {
      mockGetWords.mockResolvedValue([]);

      await getPreCallVocab('unknown_scenario', 'es', 5);

      expect(mockGetWords).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'general' })
      );
    });
  });

  // ==========================================================================
  // Post-Call Vocab Processing
  // ==========================================================================

  describe('processPostCallVocab', () => {
    it('reinforces words that were used correctly', async () => {
      mockFindWordByText.mockResolvedValueOnce(mockWord('1', 'café', 'food'));
      mockRecordReview.mockResolvedValueOnce(mockWord('1', 'café', 'food'));

      const result = await processPostCallVocab({
        vocabUsed: ['café'],
        vocabMissed: [],
        newVocabulary: [],
        targetLanguage: 'es',
        scenario: 'cafe_ordering',
      });

      expect(result.wordsReinforced).toBe(1);
      expect(mockRecordReview).toHaveBeenCalledWith('1', 4); // quality 4 = correct
    });

    it('weakens words that were missed', async () => {
      mockFindWordByText.mockResolvedValueOnce(mockWord('2', 'agua', 'food'));
      mockRecordReview.mockResolvedValueOnce(mockWord('2', 'agua', 'food'));

      const result = await processPostCallVocab({
        vocabUsed: [],
        vocabMissed: ['agua'],
        newVocabulary: [],
        targetLanguage: 'es',
        scenario: 'cafe_ordering',
      });

      expect(result.wordsWeakened).toBe(1);
      expect(mockRecordReview).toHaveBeenCalledWith('2', 1, 'usage'); // quality 1 = wrong
    });

    it('adds new vocabulary discovered in conversation', async () => {
      mockFindWordByText.mockResolvedValueOnce(null); // Word doesn't exist
      mockAddOrReinforce.mockResolvedValueOnce({
        word: mockWord('new', 'restaurante', 'food'),
        isNew: true,
        encounterCount: 1,
      });

      const result = await processPostCallVocab({
        vocabUsed: [],
        vocabMissed: [],
        newVocabulary: ['restaurante'],
        targetLanguage: 'es',
        scenario: 'cafe_ordering',
      });

      expect(result.wordsAdded).toBe(1);
      expect(mockAddOrReinforce).toHaveBeenCalledWith(
        expect.objectContaining({
          word: 'restaurante',
          source: 'ai_conversation',
          category: 'food',
        })
      );
    });

    it('does not add new vocab if word already exists', async () => {
      mockFindWordByText.mockResolvedValueOnce(mockWord('x', 'hola', 'greetings'));

      const result = await processPostCallVocab({
        vocabUsed: [],
        vocabMissed: [],
        newVocabulary: ['hola'],
        targetLanguage: 'es',
        scenario: 'casual_chat',
      });

      expect(result.wordsAdded).toBe(0);
      expect(mockAddOrReinforce).not.toHaveBeenCalled();
    });

    it('handles mixed results correctly', async () => {
      // Used word
      mockFindWordByText
        .mockResolvedValueOnce(mockWord('1', 'café', 'food'))
        // Missed word
        .mockResolvedValueOnce(mockWord('2', 'agua', 'food'))
        // New word (doesn't exist)
        .mockResolvedValueOnce(null);

      mockRecordReview.mockResolvedValue({});
      mockAddOrReinforce.mockResolvedValue({ isNew: true, encounterCount: 1, word: {} });

      const result = await processPostCallVocab({
        vocabUsed: ['café'],
        vocabMissed: ['agua'],
        newVocabulary: ['zumo'],
        targetLanguage: 'es',
        scenario: 'cafe_ordering',
      });

      expect(result.wordsReinforced).toBe(1);
      expect(result.wordsWeakened).toBe(1);
      expect(result.wordsAdded).toBe(1);
    });

    it('handles empty inputs gracefully', async () => {
      const result = await processPostCallVocab({
        vocabUsed: [],
        vocabMissed: [],
        newVocabulary: [],
        targetLanguage: 'es',
        scenario: 'casual_chat',
      });

      expect(result.wordsReinforced).toBe(0);
      expect(result.wordsWeakened).toBe(0);
      expect(result.wordsAdded).toBe(0);
      expect(mockRecordReview).not.toHaveBeenCalled();
      expect(mockAddOrReinforce).not.toHaveBeenCalled();
    });

    it('skips reinforcement when word not found in bank', async () => {
      mockFindWordByText.mockResolvedValueOnce(null); // Word not in bank

      const result = await processPostCallVocab({
        vocabUsed: ['nonexistent'],
        vocabMissed: [],
        newVocabulary: [],
        targetLanguage: 'es',
        scenario: 'casual_chat',
      });

      expect(result.wordsReinforced).toBe(0);
      expect(mockRecordReview).not.toHaveBeenCalled();
    });
  });
});
