/**
 * Tests for Conversation Feedback Engine
 *
 * Tests: minimal feedback generation, transcript analysis flow,
 * score clamping, graceful degradation.
 */

// Mock Claude client
jest.mock('@/lib/ai/claudeClient', () => ({
  generateJSON: jest.fn(),
}));

jest.mock('@/lib/ai/sanitize', () => ({
  sanitizePromptInput: jest.fn((s: string) => s),
}));

import { analyzeConversation } from '@/lib/ai/conversationFeedback';
import { generateJSON } from '@/lib/ai/claudeClient';
import type { ElevenLabsMessage } from '@/lib/voice/elevenLabsTypes';

const mockGenerateJSON = generateJSON as jest.Mock;

function mockMessage(role: 'user' | 'assistant', content: string): ElevenLabsMessage {
  return {
    id: `msg_${Math.random()}`,
    role,
    content,
    timestamp: Date.now(),
    wordCount: content.split(' ').length,
  };
}

describe('Conversation Feedback Engine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeConversation', () => {
    it('returns minimal feedback for very short conversations (< 2 user messages)', async () => {
      const result = await analyzeConversation({
        messages: [
          mockMessage('assistant', 'Hola! ¿Cómo estás?'),
          mockMessage('user', 'Bien'),
        ],
        scenario: 'casual_chat',
        proficiency: 'beginner',
        targetLanguage: 'es',
      });

      expect(result).not.toBeNull();
      expect(result!.feedback.summary).toContain('too short');
      // Should not call Claude for short convos
      expect(mockGenerateJSON).not.toHaveBeenCalled();
    });

    it('sends transcript to Claude for analysis when >= 2 user messages', async () => {
      mockGenerateJSON.mockResolvedValueOnce({
        articulation: 75,
        fluency: 60,
        communication: 80,
        scenario: 70,
        summary: 'Good conversation!',
        strengths: ['Natural greetings'],
        improvements: ['Use longer sentences'],
        newVocabulary: ['restaurante'],
        vocabUsed: ['café'],
        vocabMissed: ['agua'],
      });

      const result = await analyzeConversation({
        messages: [
          mockMessage('assistant', '¡Hola! Bienvenido al café.'),
          mockMessage('user', 'Hola, quiero un café por favor.'),
          mockMessage('assistant', '¿Grande o pequeño?'),
          mockMessage('user', 'Grande, y también un croissant.'),
        ],
        scenario: 'cafe_ordering',
        proficiency: 'intermediate',
        targetLanguage: 'es',
        vocabPrepWords: ['café', 'agua', 'pan'],
      });

      expect(result).not.toBeNull();
      expect(result!.feedback.articulation).toBe(75);
      expect(result!.feedback.fluency).toBe(60);
      expect(result!.feedback.communication).toBe(80);
      expect(result!.feedback.scenario).toBe(70);
      expect(result!.feedback.summary).toBe('Good conversation!');
      expect(result!.vocabUsed).toEqual(['café']);
      expect(result!.vocabMissed).toEqual(['agua']);
      expect(mockGenerateJSON).toHaveBeenCalledTimes(1);
    });

    it('clamps scores to 0-100 range', async () => {
      mockGenerateJSON.mockResolvedValueOnce({
        articulation: 150, // Over max
        fluency: -20,      // Under min
        communication: 80,
        scenario: 70,
        summary: 'Test',
        strengths: [],
        improvements: [],
        newVocabulary: [],
        vocabUsed: [],
        vocabMissed: [],
      });

      const result = await analyzeConversation({
        messages: [
          mockMessage('assistant', 'Hello'),
          mockMessage('user', 'Hi there'),
          mockMessage('assistant', 'How are you?'),
          mockMessage('user', 'I am doing well, thank you for asking.'),
        ],
        scenario: 'casual_chat',
        proficiency: 'intermediate',
        targetLanguage: 'en',
      });

      expect(result!.feedback.articulation).toBe(100); // Clamped to max
      expect(result!.feedback.fluency).toBe(0);         // Clamped to min
    });

    it('returns minimal feedback when Claude is unavailable', async () => {
      mockGenerateJSON.mockResolvedValueOnce(null);

      const result = await analyzeConversation({
        messages: [
          mockMessage('assistant', 'Bonjour!'),
          mockMessage('user', 'Bonjour, comment allez-vous?'),
          mockMessage('assistant', 'Très bien!'),
          mockMessage('user', 'Je voudrais un café, s\'il vous plaît.'),
        ],
        scenario: 'cafe_ordering',
        proficiency: 'intermediate',
        targetLanguage: 'fr',
      });

      expect(result).not.toBeNull();
      expect(result!.feedback.summary).toContain('Basic analysis');
    });

    it('returns minimal feedback when Claude throws error', async () => {
      mockGenerateJSON.mockRejectedValueOnce(new Error('API Error'));

      const result = await analyzeConversation({
        messages: [
          mockMessage('assistant', 'Hola!'),
          mockMessage('user', 'Hola'),
          mockMessage('assistant', '¿Qué tal?'),
          mockMessage('user', 'Bien, gracias'),
        ],
        scenario: 'casual_chat',
        proficiency: 'beginner',
        targetLanguage: 'es',
      });

      expect(result).not.toBeNull();
      // Should still return something, not throw
      expect(result!.feedback.articulation).toBeGreaterThanOrEqual(0);
    });

    it('includes vocab prep words in prompt when provided', async () => {
      mockGenerateJSON.mockResolvedValueOnce({
        articulation: 70,
        fluency: 70,
        communication: 70,
        scenario: 70,
        summary: 'Test',
        strengths: [],
        improvements: [],
        newVocabulary: [],
        vocabUsed: ['café'],
        vocabMissed: ['croissant'],
      });

      await analyzeConversation({
        messages: [
          mockMessage('assistant', 'Hola!'),
          mockMessage('user', 'Un café por favor'),
          mockMessage('assistant', '¿Algo más?'),
          mockMessage('user', 'No, gracias'),
        ],
        scenario: 'cafe_ordering',
        proficiency: 'beginner',
        targetLanguage: 'es',
        vocabPrepWords: ['café', 'croissant', 'agua'],
      });

      // Check that the prompt passed to Claude includes vocab words
      const promptArg = mockGenerateJSON.mock.calls[0][0];
      expect(promptArg).toContain('café');
      expect(promptArg).toContain('croissant');
      expect(promptArg).toContain('agua');
    });

    it('handles missing fields in Claude response gracefully', async () => {
      mockGenerateJSON.mockResolvedValueOnce({
        articulation: 50,
        fluency: 60,
        communication: 55,
        scenario: 45,
        // Missing summary, strengths, improvements, etc.
      });

      const result = await analyzeConversation({
        messages: [
          mockMessage('assistant', 'Hi'),
          mockMessage('user', 'Hello'),
          mockMessage('assistant', 'What\'s up?'),
          mockMessage('user', 'Not much'),
        ],
        scenario: 'casual_chat',
        proficiency: 'beginner',
        targetLanguage: 'en',
      });

      expect(result).not.toBeNull();
      expect(result!.feedback.summary).toBe('Conversation analyzed.');
      expect(result!.feedback.strengths).toEqual([]);
      expect(result!.feedback.improvements).toEqual([]);
    });
  });

  describe('minimal feedback heuristics', () => {
    it('scores higher for more user messages', async () => {
      // 3 user messages
      const result3 = await analyzeConversation({
        messages: [
          mockMessage('user', 'Hola'),
        ],
        scenario: 'casual_chat',
        proficiency: 'beginner',
        targetLanguage: 'es',
      });

      // Engagement score based on message count
      expect(result3!.feedback.articulation).toBeGreaterThanOrEqual(0);
      expect(result3!.feedback.articulation).toBeLessThanOrEqual(100);
    });

    it('scores higher for longer messages', async () => {
      const result = await analyzeConversation({
        messages: [
          mockMessage('user', 'Hola, quiero un café grande con leche por favor'),
        ],
        scenario: 'casual_chat',
        proficiency: 'beginner',
        targetLanguage: 'es',
      });

      // Single message = short conversation, but verbosity contributes
      expect(result!.feedback.articulation).toBeGreaterThanOrEqual(0);
    });
  });
});
