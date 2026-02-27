/**
 * Gemini Speaking Analyzer
 *
 * AI-powered speaking feedback that provides HONEST, BALANCED feedback.
 * No more "always positive" - tells the truth while still being encouraging.
 *
 * Philosophy:
 * - Honest about mistakes (this is how we learn)
 * - Specific about what went wrong (actionable)
 * - Recognizes effort, not just results
 * - Compares to previous attempts (celebrates real progress)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV } from '@/lib/config/env';
import type {
  GeminiSpeakingInput,
  GeminiSpeakingAnalysis,
  WordAnalysis,
  HonestFeedback,
  IssueSeverity,
} from './speakingFeedbackTypes';

// ============================================================================
// Gemini Client
// ============================================================================

const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp',
  generationConfig: {
    temperature: 0.3, // Lower temperature for more consistent analysis
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 4096,
  },
});

// ============================================================================
// Main Analysis Function
// ============================================================================

/**
 * Analyze speaking performance with Gemini AI
 *
 * Provides honest, detailed feedback comparing expected vs actual speech.
 *
 * @param input - Speaking analysis input
 * @returns AI-generated honest analysis
 *
 * @example
 * ```ts
 * const analysis = await analyzeSpeakingWithGemini({
 *   expectedText: "The quick brown fox jumps over the lazy dog",
 *   transcribedText: "The quick brown fox jump over lazy dog",
 *   transcriptionWords: [...],
 *   proficiencyLevel: 'intermediate',
 *   targetLanguage: 'English'
 * });
 *
 * console.log(analysis.honestSummary);
 * // "You read 78% of words correctly. 'jumps' was missing the 's' ending,
 * //  and 'the' was skipped before 'lazy'. These are common patterns to practice."
 * ```
 */
export async function analyzeSpeakingWithGemini(
  input: GeminiSpeakingInput
): Promise<GeminiSpeakingAnalysis> {
  console.log('[GeminiSpeakingAnalyzer] Starting analysis...', {
    expectedWords: input.expectedText.split(/\s+/).length,
    transcribedWords: input.transcribedText.split(/\s+/).length,
    proficiency: input.proficiencyLevel,
  });

  try {
    const prompt = buildAnalysisPrompt(input);
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse JSON response
    const analysis = parseGeminiResponse(text, input);

    console.log('[GeminiSpeakingAnalyzer] Analysis complete:', {
      accuracy: analysis.overallAccuracy,
      issueCount: analysis.wordAnalysis.filter(w => !w.isCorrect).length,
    });

    return analysis;
  } catch (error) {
    console.error('[GeminiSpeakingAnalyzer] Error:', error);
    // Return fallback analysis
    return generateFallbackAnalysis(input);
  }
}

// ============================================================================
// Prompt Builder
// ============================================================================

/**
 * Build the Gemini prompt for honest speaking analysis
 */
function buildAnalysisPrompt(input: GeminiSpeakingInput): string {
  const {
    expectedText,
    transcribedText,
    transcriptionWords,
    userGoal,
    proficiencyLevel,
    targetLanguage,
    previousAccuracy,
  } = input;

  const previousContext = previousAccuracy !== undefined
    ? `\n\n**Previous Attempt:** User scored ${previousAccuracy}% on this same content before.`
    : '';

  const goalContext = userGoal
    ? `\n**Learning Goal:** ${userGoal} (consider which words are most important for this goal)`
    : '';

  return `You are an expert language coach providing HONEST, BALANCED feedback on speaking practice.

## CRITICAL INSTRUCTIONS

Your job is to be TRUTHFUL and HELPFUL, not just positive:
- If they made mistakes, SAY SO clearly
- If words were skipped, LIST them
- If pronunciation was off, EXPLAIN what happened
- NEVER say "great job" if accuracy is below 70%
- ALWAYS provide specific, actionable feedback

Being honest IS being helpful. Learners need to know what to fix.

---

## INPUT DATA

**Expected Text:**
"${expectedText}"

**What Was Actually Said (Whisper Transcription):**
"${transcribedText}"

**Word-Level Timing Data:**
${JSON.stringify(transcriptionWords, null, 2)}

**Proficiency Level:** ${proficiencyLevel}
**Target Language:** ${targetLanguage}
${goalContext}
${previousContext}

---

## ANALYSIS TASKS

1. **Compare word-by-word**: Match expected words to spoken words
2. **Identify issues**: Skipped words, mispronunciations, substitutions, hesitations
3. **Calculate TRUE accuracy**: (correct words / expected words) × 100
4. **Be honest**: If they struggled, say so kindly but clearly
5. **Be specific**: "You skipped 'the' before 'dog'" not "some words were missed"
6. **Recognize effort**: Even if accuracy is low, acknowledge they tried

---

## ISSUE SEVERITY GUIDE

- **minor**: Small variation that doesn't affect understanding (e.g., "gonna" vs "going to")
- **moderate**: Noticeable error but word recognizable (e.g., "jumps" → "jump")
- **significant**: Word unclear or wrong (e.g., "restaurant" → "restrant")
- **critical**: Word completely missing or substituted with different word

---

## OUTPUT FORMAT

Return ONLY valid JSON (no markdown, no code blocks):

{
  "wordAnalysis": [
    {
      "expected": "the",
      "spoken": "the",
      "isCorrect": true
    },
    {
      "expected": "jumps",
      "spoken": "jump",
      "isCorrect": false,
      "severity": "moderate",
      "issueType": "mispronounced",
      "explanation": "Missing the 's' ending - the verb should be 'jumps' for third person singular",
      "pronunciationHint": "jumps (with a clear 's' sound at the end)",
      "practiceAdvice": "Practice saying 'he jumps, she jumps, it jumps' to build the habit"
    },
    {
      "expected": "lazy",
      "spoken": null,
      "isCorrect": false,
      "severity": "significant",
      "issueType": "skipped",
      "explanation": "This word was not said at all",
      "practiceAdvice": "Try reading more slowly to ensure you don't skip words"
    }
  ],
  "overallAccuracy": 78,
  "honestSummary": "You read 78% of words correctly. You skipped 'the' and 'lazy', and said 'jump' instead of 'jumps'. The -s ending on verbs is a common challenge - focus on this pattern.",
  "strengths": ["Good pace and rhythm", "Clear pronunciation of most words"],
  "areasToImprove": ["Third person singular verb endings (-s)", "Don't skip articles (the, a, an)"],
  "priorityWords": ["jumps", "lazy", "the"],
  "pronunciationPatterns": ["Verb endings with -s", "Articles before nouns"],
  "effortEncouragement": "You attempted all the challenging words and kept going - that takes courage. Every practice session builds your skills.",
  "recommendedNextStep": "Practice this same passage again, reading slowly. Focus on the -s ending on 'jumps'.",
  "showedImprovement": false
}

---

## HONESTY GUIDELINES BY ACCURACY

**90-100%**: "Excellent accuracy! [Specific praise for what was done well]"
**80-89%**: "Good work with room to improve. [Specific issues to address]"
**70-79%**: "You're getting there, but several areas need practice. [Be specific]"
**60-69%**: "This passage was challenging. Let's break down what needs work. [List issues]"
**Below 60%**: "This needs more practice. Here's exactly what to focus on: [Detailed breakdown]"

NEVER give generic praise. ALWAYS be specific.

Now analyze the speaking sample:`;
}

// ============================================================================
// Response Parser
// ============================================================================

/**
 * Parse Gemini's JSON response
 */
function parseGeminiResponse(
  text: string,
  input: GeminiSpeakingInput
): GeminiSpeakingAnalysis {
  // Clean up response
  let cleanText = text.trim();
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  } else if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/```\n?/g, '');
  }

  try {
    const parsed = JSON.parse(cleanText);

    return {
      wordAnalysis: parsed.wordAnalysis || [],
      overallAccuracy: parsed.overallAccuracy || calculateFallbackAccuracy(input),
      honestSummary: parsed.honestSummary || 'Analysis completed.',
      strengths: parsed.strengths || [],
      areasToImprove: parsed.areasToImprove || [],
      priorityWords: parsed.priorityWords || [],
      pronunciationPatterns: parsed.pronunciationPatterns || [],
      effortEncouragement: parsed.effortEncouragement || 'Thank you for practicing!',
      recommendedNextStep: parsed.recommendedNextStep || 'Try again and focus on accuracy.',
      showedImprovement: parsed.showedImprovement,
    };
  } catch (error) {
    console.error('[GeminiSpeakingAnalyzer] JSON parse error:', error);
    throw new Error('Failed to parse Gemini response');
  }
}

// ============================================================================
// Fallback Analysis
// ============================================================================

/**
 * Generate fallback analysis when Gemini fails
 */
function generateFallbackAnalysis(input: GeminiSpeakingInput): GeminiSpeakingAnalysis {
  const { expectedText, transcribedText } = input;

  const expectedWords = expectedText.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const spokenWords = transcribedText.toLowerCase().split(/\s+/).filter(w => w.length > 0);

  // Simple word matching
  const wordAnalysis: WordAnalysis[] = [];
  let correctCount = 0;

  const spokenSet = new Set(spokenWords);

  for (const expected of expectedWords) {
    const normalizedExpected = expected.replace(/[.,!?;:'"]/g, '');
    const found = spokenWords.find(s =>
      s.replace(/[.,!?;:'"]/g, '') === normalizedExpected ||
      levenshteinDistance(s.replace(/[.,!?;:'"]/g, ''), normalizedExpected) <= 2
    );

    if (found) {
      const isExact = found.replace(/[.,!?;:'"]/g, '') === normalizedExpected;
      wordAnalysis.push({
        expected: expected,
        spoken: found,
        isCorrect: isExact,
        severity: isExact ? undefined : 'minor',
        issueType: isExact ? undefined : 'mispronounced',
      });
      if (isExact) correctCount++;
    } else {
      wordAnalysis.push({
        expected: expected,
        spoken: null,
        isCorrect: false,
        severity: 'significant',
        issueType: 'skipped',
        explanation: 'This word was not detected in your speech.',
        practiceAdvice: `Practice saying "${expected}" clearly.`,
      });
    }
  }

  const accuracy = expectedWords.length > 0
    ? Math.round((correctCount / expectedWords.length) * 100)
    : 0;

  const skippedWords = wordAnalysis.filter(w => w.issueType === 'skipped').map(w => w.expected);
  const mispronounced = wordAnalysis.filter(w => w.issueType === 'mispronounced').map(w => w.expected);

  // Generate honest summary based on accuracy
  let honestSummary: string;
  if (accuracy >= 90) {
    honestSummary = `Excellent! You read ${accuracy}% of words correctly.`;
  } else if (accuracy >= 80) {
    honestSummary = `Good effort with ${accuracy}% accuracy. ${skippedWords.length > 0 ? `You skipped: ${skippedWords.join(', ')}.` : ''}`;
  } else if (accuracy >= 70) {
    honestSummary = `You read ${accuracy}% correctly. ${skippedWords.length > 0 ? `Missing words: ${skippedWords.join(', ')}.` : ''} Keep practicing!`;
  } else if (accuracy >= 50) {
    honestSummary = `This was challenging - ${accuracy}% accuracy. Focus on these words: ${skippedWords.slice(0, 5).join(', ')}.`;
  } else {
    honestSummary = `Let's work on this together. ${accuracy}% of words were captured. Try reading more slowly and clearly.`;
  }

  return {
    wordAnalysis,
    overallAccuracy: accuracy,
    honestSummary,
    strengths: accuracy >= 70 ? ['Completed the practice attempt'] : [],
    areasToImprove: [
      skippedWords.length > 0 && 'Some words were skipped - try reading more slowly',
      mispronounced.length > 0 && 'Some words need clearer pronunciation',
    ].filter(Boolean) as string[],
    priorityWords: skippedWords.slice(0, 5),
    pronunciationPatterns: [],
    effortEncouragement: 'Every practice attempt builds your skills. Keep trying!',
    recommendedNextStep: accuracy < 80
      ? 'Try this passage again, reading more slowly.'
      : 'Great! Move on to a new passage or try a harder difficulty.',
    showedImprovement: undefined,
  };
}

/**
 * Calculate fallback accuracy
 */
function calculateFallbackAccuracy(input: GeminiSpeakingInput): number {
  const expectedWords = input.expectedText.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const spokenWords = input.transcribedText.toLowerCase().split(/\s+/).filter(w => w.length > 0);

  let matches = 0;
  for (const expected of expectedWords) {
    const normalized = expected.replace(/[.,!?;:'"]/g, '');
    if (spokenWords.some(s => s.replace(/[.,!?;:'"]/g, '') === normalized)) {
      matches++;
    }
  }

  return expectedWords.length > 0 ? Math.round((matches / expectedWords.length) * 100) : 0;
}

/**
 * Levenshtein distance for fuzzy matching
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// ============================================================================
// Convert to HonestFeedback Format
// ============================================================================

/**
 * Convert Gemini analysis to HonestFeedback structure
 */
export function convertToHonestFeedback(
  analysis: GeminiSpeakingAnalysis,
  wpm: number,
  technicalMetrics?: {
    articulationScore: number;
    fluencyScore: number;
    completionRate: number;
    hesitationCount: number;
    averagePauseDuration: number;
  }
): HonestFeedback {
  const wordsCorrect = analysis.wordAnalysis.filter(w => w.isCorrect).length;
  const wordsTotal = analysis.wordAnalysis.length;

  return {
    // Raw Performance Data
    accuracyPercent: analysis.overallAccuracy,
    wordsCorrect,
    wordsTotal,
    wpm,

    // Honest Assessment
    honestSummary: analysis.honestSummary,
    actualStrengths: analysis.strengths,
    areasNeedingWork: analysis.areasToImprove,
    wordsToFocus: analysis.wordAnalysis.filter(w => !w.isCorrect),

    // Balanced Encouragement
    effortRecognition: analysis.effortEncouragement,
    progressNote: analysis.showedImprovement
      ? 'You improved from your last attempt!'
      : undefined,
    nextStep: analysis.recommendedNextStep,

    // Detailed Mode
    detailedAnalysis: analysis.wordAnalysis,
    technicalMetrics,
  };
}
