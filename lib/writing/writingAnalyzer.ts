/**
 * Writing Analyzer - Gemini AI Integration
 *
 * Analyzes user writing for grammar, vocabulary, and style.
 * Returns encouraging, constructive feedback following Vox's philosophy:
 * "Confidence comes from a safe space where evolution is the reward"
 *
 * Key Principles:
 * - Never judgmental, always encouraging
 * - Focus on "better ways to say" not "corrections"
 * - Identify strengths FIRST
 * - Provide clear explanations for improvements
 * - Score effort, not perfection
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { WritingTask, WritingAnalysis, GrammarCorrection } from '@/components/cards/writing/types';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

if (!GEMINI_API_KEY) {
  console.warn('WARNING: GEMINI_API_KEY not found. Writing analysis will use fallback.');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// =============================================================================
// TYPES
// =============================================================================

export interface WritingAnalyzerOptions {
  text: string;
  task: WritingTask;
  targetLanguage?: string;
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
}

interface GeminiAnalysisResponse {
  corrections: Array<{
    type: 'grammar' | 'spelling' | 'vocabulary' | 'style' | 'punctuation';
    original: string;
    corrected: string;
    explanation: string;
    rule?: string;
    betterWayToSay?: string;
  }>;
  correctedText: string;
  overallFeedback: string;
  strengths: string[];
  areasToImprove: string[];
  grammarScore: number;
  vocabularyScore: number;
  clarityScore: number;
  encouragementMessage: string;
}

// =============================================================================
// MAIN ANALYSIS FUNCTION
// =============================================================================

/**
 * Analyze user writing with Gemini AI
 *
 * @param options - The text and context for analysis
 * @returns Structured feedback with corrections, strengths, and encouragement
 *
 * @example
 * ```ts
 * const analysis = await analyzeWriting({
 *   text: "Je va au cafe avec mon famille...",
 *   task: emailTask,
 *   targetLanguage: 'fr',
 *   userLevel: 'intermediate'
 * });
 * ```
 */
export async function analyzeWriting(
  options: WritingAnalyzerOptions
): Promise<WritingAnalysis> {
  const { text, task, targetLanguage = 'en', userLevel = 'intermediate' } = options;

  // Quick validation
  if (!text || text.trim().length === 0) {
    return createEmptyAnalysis();
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const prompt = buildAnalysisPrompt(text, task, targetLanguage, userLevel);

    console.log('Analyzing writing with Gemini AI...', {
      textLength: text.length,
      wordCount: text.trim().split(/\s+/).length,
      taskCategory: task.category,
      targetLanguage,
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const responseText = response.text();

    // Clean up response (remove markdown code blocks if present)
    const cleanedText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Parse JSON response
    const geminiResponse: GeminiAnalysisResponse = JSON.parse(cleanedText);

    // Convert to WritingAnalysis format
    const analysis: WritingAnalysis = {
      corrections: geminiResponse.corrections.map((c, index) => ({
        id: `corr-${Date.now()}-${index}`,
        type: c.type,
        original: c.original,
        corrected: c.corrected,
        explanation: c.explanation,
        rule: c.rule,
        position: findPosition(text, c.original),
      })),
      correctedText: geminiResponse.correctedText,
      overallFeedback: geminiResponse.overallFeedback,
      strengths: geminiResponse.strengths,
      areasToImprove: geminiResponse.areasToImprove,
      grammarScore: Math.max(0, Math.min(100, geminiResponse.grammarScore)),
      vocabularyScore: Math.max(0, Math.min(100, geminiResponse.vocabularyScore)),
      clarityScore: Math.max(0, Math.min(100, geminiResponse.clarityScore)),
    };

    console.log('Writing analysis complete:', {
      correctionsCount: analysis.corrections.length,
      grammarScore: analysis.grammarScore,
      strengthsCount: analysis.strengths.length,
    });

    return analysis;

  } catch (error) {
    console.error('Gemini analysis failed, using fallback:', error);
    return createFallbackAnalysis(text, task);
  }
}

// =============================================================================
// PROMPT BUILDING
// =============================================================================

/**
 * Build the Gemini prompt for writing analysis
 * Uses Vox's encouraging, non-judgmental tone
 */
function buildAnalysisPrompt(
  text: string,
  task: WritingTask,
  targetLanguage: string,
  userLevel: string
): string {
  const languageContext = getLanguageContext(targetLanguage);

  return `You are a supportive, encouraging language teacher analyzing a student's writing.
Your role is to help them improve while celebrating their effort and courage to write.

**PHILOSOPHY**: "Every attempt is progress. Focus on growth, not perfection."

**TONE GUIDELINES**:
- Be encouraging and supportive, NEVER judgmental
- Use "Tip" and "Suggestion" instead of "Error" or "Mistake"
- Frame corrections as "A better way to say this..." not "This is wrong"
- Always acknowledge what they did WELL before suggesting improvements
- Celebrate effort and courage to practice

**STUDENT'S WRITING TASK**:
Category: ${task.category}
Scenario: ${task.scenario}
Goal: ${task.goal}
Target Language: ${targetLanguage}
Student Level: ${userLevel}

**STUDENT'S TEXT**:
"""
${text}
"""

**ANALYSIS INSTRUCTIONS**:
1. First identify 2-4 STRENGTHS (what they did well)
2. Identify corrections needed (grammar, spelling, vocabulary, style, punctuation)
3. For each correction:
   - Show original and corrected version
   - Explain WHY in simple, encouraging terms
   - Provide the grammar rule if applicable
   - Suggest a "better way to say" for vocabulary/style issues
4. Calculate fair scores (0-100) considering their level
5. Provide an encouraging overall message

${languageContext}

Return ONLY valid JSON in this exact format (no markdown, no explanations outside JSON):

{
  "corrections": [
    {
      "type": "grammar",
      "original": "the incorrect phrase",
      "corrected": "the correct phrase",
      "explanation": "Friendly explanation of why this change helps",
      "rule": "Grammar rule name (optional)",
      "betterWayToSay": "Alternative phrasing (for vocab/style)"
    }
  ],
  "correctedText": "The full corrected version of their text",
  "overallFeedback": "2-3 sentences of encouraging, constructive feedback",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "areasToImprove": ["Area 1 with gentle suggestion", "Area 2 with tip"],
  "grammarScore": 75,
  "vocabularyScore": 80,
  "clarityScore": 85,
  "encouragementMessage": "A warm, motivating closing message"
}

Analyze the writing now:`;
}

/**
 * Get language-specific context for the prompt
 */
function getLanguageContext(targetLanguage: string): string {
  const contexts: Record<string, string> = {
    fr: `
**FRENCH-SPECIFIC NOTES**:
- Check for gender agreement (le/la, mon/ma)
- Check verb conjugations (especially être, avoir, aller)
- Check accent marks (é, è, ê, ç)
- Check article usage
- Be aware of false friends (English cognates with different meanings)`,

    es: `
**SPANISH-SPECIFIC NOTES**:
- Check for gender agreement (el/la, un/una)
- Check verb conjugations (ser/estar, regular/irregular)
- Check accent marks and ñ usage
- Check por/para usage
- Check subjunctive usage where appropriate`,

    de: `
**GERMAN-SPECIFIC NOTES**:
- Check for case usage (nominative, accusative, dative, genitive)
- Check verb position (V2 in main clauses)
- Check gender (der/die/das)
- Check compound word formation
- Check adjective endings`,

    en: `
**ENGLISH-SPECIFIC NOTES**:
- Check for subject-verb agreement
- Check article usage (a/an/the)
- Check verb tenses and consistency
- Check preposition usage
- Check word order in sentences`,
  };

  return contexts[targetLanguage] || contexts.en;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Find the position of a phrase in text
 */
function findPosition(text: string, phrase: string): { start: number; end: number } {
  const start = text.toLowerCase().indexOf(phrase.toLowerCase());
  return {
    start: start >= 0 ? start : 0,
    end: start >= 0 ? start + phrase.length : phrase.length,
  };
}

/**
 * Create empty analysis for empty input
 */
function createEmptyAnalysis(): WritingAnalysis {
  return {
    corrections: [],
    correctedText: '',
    overallFeedback: 'Start writing to receive feedback!',
    strengths: ['Ready to practice!'],
    areasToImprove: [],
    grammarScore: 0,
    vocabularyScore: 0,
    clarityScore: 0,
  };
}

/**
 * Create fallback analysis when Gemini fails
 * Uses basic pattern matching for common errors
 */
function createFallbackAnalysis(text: string, task: WritingTask): WritingAnalysis {
  console.log('Using fallback writing analyzer');

  const corrections: GrammarCorrection[] = [];
  let correctedText = text;
  const wordCount = text.trim().split(/\s+/).length;

  // Simple pattern-based corrections
  const patterns = [
    {
      pattern: /\bcafe\b/gi,
      corrected: 'café',
      type: 'spelling' as const,
      explanation: 'In French, "café" requires an accent aigu (é).',
      rule: 'French accents',
    },
    {
      pattern: /\bje va\b/gi,
      corrected: 'je vais',
      type: 'grammar' as const,
      explanation: 'The verb "aller" conjugates to "vais" with "je".',
      rule: 'Verb conjugation - aller',
    },
    {
      pattern: /\bmon famille\b/gi,
      corrected: 'ma famille',
      type: 'grammar' as const,
      explanation: '"Famille" is feminine, so it uses "ma" (not "mon").',
      rule: 'Possessive adjective agreement',
    },
  ];

  patterns.forEach((p, index) => {
    if (p.pattern.test(text)) {
      const match = text.match(p.pattern);
      if (match) {
        corrections.push({
          id: `corr-fallback-${index}`,
          type: p.type,
          original: match[0],
          corrected: p.corrected,
          explanation: p.explanation,
          rule: p.rule,
          position: findPosition(text, match[0]),
        });
        correctedText = correctedText.replace(p.pattern, p.corrected);
      }
    }
  });

  // Check for missing end punctuation
  const trimmed = text.trim();
  if (trimmed.length > 0 && !/[.!?]$/.test(trimmed)) {
    corrections.push({
      id: 'corr-fallback-punct',
      type: 'punctuation',
      original: trimmed.slice(-15),
      corrected: trimmed.slice(-15) + '.',
      explanation: 'Sentences should end with punctuation.',
      rule: 'End punctuation',
      position: { start: text.length - 1, end: text.length },
    });
    correctedText = correctedText.trim() + '.';
  }

  // Calculate scores based on corrections
  const baseScore = 85;
  const grammarDeduction = corrections.filter(c => c.type === 'grammar').length * 10;
  const spellingDeduction = corrections.filter(c => c.type === 'spelling').length * 5;

  return {
    corrections,
    correctedText,
    overallFeedback: corrections.length > 0
      ? `Good effort! I found ${corrections.length} area${corrections.length > 1 ? 's' : ''} where we can polish your writing. Review the suggestions below.`
      : 'Well done! Your writing looks great. Keep practicing to build fluency!',
    strengths: [
      wordCount >= 30 ? 'Good length and detail in your response' : 'Clear and focused writing',
      'You completed the task - that takes courage!',
      'Your message communicates effectively',
    ],
    areasToImprove: corrections.length > 0
      ? ['Review the grammar tips below', 'Practice these patterns for next time']
      : ['Keep expanding your vocabulary', 'Try longer, more complex sentences'],
    grammarScore: Math.max(50, baseScore - grammarDeduction),
    vocabularyScore: Math.min(100, 70 + Math.floor(wordCount / 3)),
    clarityScore: Math.max(60, 90 - corrections.length * 3),
  };
}

// =============================================================================
// BATCH ANALYSIS (for weekly review)
// =============================================================================

/**
 * Analyze patterns across multiple writing sessions
 * Used for weekly feedback and personalization
 *
 * @param sessions - Array of previous writing analyses
 * @returns Summary of patterns and progress
 */
export function analyzeWritingPatterns(
  sessions: WritingAnalysis[]
): {
  commonMistakes: string[];
  improvingAreas: string[];
  consistentStrengths: string[];
  overallProgress: 'improving' | 'stable' | 'needs_attention';
  suggestion: string;
} {
  if (sessions.length === 0) {
    return {
      commonMistakes: [],
      improvingAreas: [],
      consistentStrengths: [],
      overallProgress: 'stable',
      suggestion: 'Complete more writing tasks to see your progress patterns!',
    };
  }

  // Count correction types across all sessions
  const correctionCounts: Record<string, number> = {};
  sessions.forEach(session => {
    session.corrections.forEach(c => {
      const key = `${c.type}:${c.rule || 'general'}`;
      correctionCounts[key] = (correctionCounts[key] || 0) + 1;
    });
  });

  // Find most common mistakes
  const sortedMistakes = Object.entries(correctionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key]) => key.split(':')[1] || key.split(':')[0]);

  // Calculate score trends
  const recentScores = sessions.slice(-5).map(s => s.grammarScore);
  const avgRecent = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

  if (sessions.length >= 3) {
    const olderScores = sessions.slice(0, -2).map(s => s.grammarScore);
    const avgOlder = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;

    const progress = avgRecent > avgOlder + 5
      ? 'improving'
      : avgRecent < avgOlder - 5
        ? 'needs_attention'
        : 'stable';

    return {
      commonMistakes: sortedMistakes,
      improvingAreas: progress === 'improving' ? ['Grammar accuracy', 'Vocabulary range'] : [],
      consistentStrengths: ['Task completion', 'Communication clarity'],
      overallProgress: progress,
      suggestion: progress === 'improving'
        ? 'You\'re making great progress! Keep up the consistent practice.'
        : progress === 'needs_attention'
          ? 'Try focusing on one grammar rule at a time. Review your corrections.'
          : 'Steady progress! Consider trying more challenging writing tasks.',
    };
  }

  return {
    commonMistakes: sortedMistakes,
    improvingAreas: [],
    consistentStrengths: ['Effort and consistency'],
    overallProgress: 'stable',
    suggestion: 'Complete a few more sessions to see your progress trends!',
  };
}
