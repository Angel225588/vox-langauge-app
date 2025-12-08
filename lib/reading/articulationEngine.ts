/**
 * Articulation Analysis Engine
 *
 * PHILOSOPHY: We analyze articulation (clarity), NOT accent.
 * - We DON'T judge: Regional accents, native language influence, intonation
 * - We DO analyze: Word completion, syllable clarity, pauses, hesitations
 *
 * This engine compares expected text with transcribed speech to provide
 * encouraging, actionable feedback focused on clarity and fluency.
 *
 * @example
 * ```typescript
 * const result = await analyzeArticulation({
 *   expectedText: "The quick brown fox jumps over the lazy dog",
 *   transcription: whisperResult,
 *   audioDuration: 3500
 * });
 *
 * console.log(result.overallScore); // 85
 * console.log(result.feedback.summary); // "Great progress! You read 95% of words clearly."
 * ```
 */

import { TranscriptionResult, TranscriptionWord } from './speechToText';
import { ProblemWord, ArticulationAnalysis, ReadingFeedback, IssueType } from './types';

// ============================================================================
// Types
// ============================================================================

/**
 * Input for articulation analysis
 */
export interface AnalysisInput {
  /** What they were supposed to read */
  expectedText: string;

  /** What Whisper heard */
  transcription: TranscriptionResult;

  /** Total duration in ms */
  audioDuration: number;
}

/**
 * Complete analysis result
 */
export interface AnalysisResult {
  // Scores (0-100)
  /** Overall clarity */
  articulationScore: number;

  /** Flow/smoothness */
  fluencyScore: number;

  /** Combined (60% articulation, 40% fluency) */
  overallScore: number;

  // Detailed breakdown
  /** Detailed articulation metrics */
  analysis: ArticulationAnalysis;

  // Problem words found
  /** Words that had issues */
  problemWords: ProblemWord[];

  // AI-generated feedback
  /** Encouraging feedback */
  feedback: ReadingFeedback;

  // Stats
  /** Number of words in expected text */
  wordsExpected: number;

  /** Number of words actually spoken */
  wordsSpoken: number;

  /** Percentage of expected words spoken correctly */
  accuracy: number;
}

/**
 * Status of a word match
 * Aligned with IssueType from types.ts
 */
type WordMatchStatus = 'correct' | IssueType;

/**
 * Match between expected and spoken word
 */
interface WordMatch {
  /** Expected word from text */
  expected: string;

  /** Spoken word (null if skipped) */
  spoken: string | null;

  /** Timestamp in ms (if spoken) */
  timestamp?: number;

  /** Match status */
  status: WordMatchStatus;

  /** Confidence from speech recognition */
  confidence: number;

  /** Index in expected text */
  expectedIndex: number;

  /** Index in transcription (if spoken) */
  spokenIndex?: number;
}

/**
 * Detected hesitation event
 */
interface HesitationEvent {
  /** Timestamp of hesitation */
  timestamp: number;

  /** Duration of pause/hesitation in ms */
  duration: number;

  /** Type of hesitation */
  type: 'long_pause' | 'repeated_word' | 'filler_word';

  /** The word involved (if applicable) */
  word?: string;

  /** Context (surrounding words) */
  context: string;
}

// ============================================================================
// Constants
// ============================================================================

/** Filler words to detect (language-agnostic common ones) */
const FILLER_WORDS = new Set([
  'um', 'uh', 'er', 'ah', 'hmm', 'like', 'you know', 'so', 'well', 'actually'
]);

/** Maximum Levenshtein distance for fuzzy matching */
const FUZZY_MATCH_THRESHOLD = 2;

/** Minimum confidence score to consider a word */
const MIN_CONFIDENCE = 0.3;

/** Multiplier for detecting long pauses (vs average) */
const LONG_PAUSE_MULTIPLIER = 1.5;

/** Minimum pause duration to consider (ms) */
const MIN_PAUSE_DURATION = 500;

// ============================================================================
// Main Analysis Function
// ============================================================================

/**
 * Analyze articulation quality of speech recording
 *
 * Compares expected text with transcribed speech to identify:
 * - Skipped words
 * - Hesitations and pauses
 * - Mispronunciations (significant deviations)
 * - Repeated words
 *
 * Returns detailed scores and encouraging feedback.
 *
 * @param input - Analysis input with expected text and transcription
 * @returns Complete analysis with scores and feedback
 *
 * @example
 * ```typescript
 * const result = await analyzeArticulation({
 *   expectedText: "Hello world, how are you?",
 *   transcription: {
 *     text: "Hello world how are you",
 *     words: [...],
 *     confidence: 0.95,
 *     language: "en",
 *     duration: 2000
 *   },
 *   audioDuration: 2000
 * });
 * ```
 */
export async function analyzeArticulation(input: AnalysisInput): Promise<AnalysisResult> {
  const { expectedText, transcription, audioDuration } = input;

  // Normalize and tokenize
  const expectedWords = tokenizeText(expectedText);
  const transcribedWords = transcription.words;

  // Step 1: Match expected words with spoken words
  const matches = matchWords(expectedWords, transcribedWords);

  // Step 2: Detect hesitations
  // Convert ms to seconds for consistency with Whisper timestamps
  const hesitations = detectHesitations(transcribedWords, audioDuration / 1000);

  // Step 3: Calculate articulation score
  const articulationScore = calculateArticulationScore(matches);

  // Step 4: Calculate fluency score
  const fluencyScore = calculateFluencyScore(transcribedWords, hesitations, audioDuration / 1000);

  // Step 5: Calculate overall score (weighted average)
  const overallScore = Math.round(articulationScore * 0.6 + fluencyScore * 0.4);

  // Step 6: Identify problem words
  const problemWords = identifyProblemWords(matches, hesitations, expectedText);

  // Step 7: Generate detailed analysis
  const analysis = generateDetailedAnalysis(matches, hesitations, transcribedWords);

  // Step 8: Generate feedback
  const feedback = generateFeedback(
    { articulation: articulationScore, fluency: fluencyScore },
    problemWords,
    { wordsExpected: expectedWords.length, wordsSpoken: transcribedWords.length }
  );

  // Calculate accuracy
  const correctWords = matches.filter(m => m.status === 'correct').length;
  const accuracy = expectedWords.length > 0
    ? Math.round((correctWords / expectedWords.length) * 100)
    : 0;

  return {
    articulationScore,
    fluencyScore,
    overallScore,
    analysis,
    problemWords,
    feedback,
    wordsExpected: expectedWords.length,
    wordsSpoken: transcribedWords.length,
    accuracy,
  };
}

// ============================================================================
// Word Matching Algorithm
// ============================================================================

/**
 * Match expected words with transcribed words using fuzzy matching
 *
 * Algorithm:
 * 1. Try exact matches first
 * 2. Try fuzzy matches (Levenshtein distance)
 * 3. Detect skipped words
 * 4. Detect repeated words
 * 5. Detect hesitations
 *
 * @param expectedWords - Words from expected text
 * @param transcribedWords - Words from transcription with timestamps
 * @returns Array of word matches with status
 */
function matchWords(
  expectedWords: string[],
  transcribedWords: TranscriptionWord[]
): WordMatch[] {
  const matches: WordMatch[] = [];
  let transcribedIndex = 0;

  for (let expectedIndex = 0; expectedIndex < expectedWords.length; expectedIndex++) {
    const expected = expectedWords[expectedIndex];

    // Skip if we've exhausted transcribed words
    if (transcribedIndex >= transcribedWords.length) {
      matches.push({
        expected,
        spoken: null,
        status: 'skipped',
        confidence: 0,
        expectedIndex,
      });
      continue;
    }

    const transcribed = transcribedWords[transcribedIndex];
    const spoken = transcribed.word;

    // Check for exact match
    if (wordsMatchExactly(expected, spoken)) {
      matches.push({
        expected,
        spoken,
        timestamp: transcribed.start,
        status: 'correct',
        confidence: transcribed.confidence ?? 1.0,
        expectedIndex,
        spokenIndex: transcribedIndex,
      });
      transcribedIndex++;
      continue;
    }

    // Check for fuzzy match (handles pronunciation variations)
    if (wordsMatchFuzzy(expected, spoken)) {
      matches.push({
        expected,
        spoken,
        timestamp: transcribed.start,
        status: 'correct',
        confidence: transcribed.confidence ?? 1.0,
        expectedIndex,
        spokenIndex: transcribedIndex,
      });
      transcribedIndex++;
      continue;
    }

    // Check if next word is a better match (word was skipped)
    if (transcribedIndex + 1 < transcribedWords.length) {
      const nextSpoken = transcribedWords[transcribedIndex + 1].word;
      if (wordsMatchExactly(expected, nextSpoken) || wordsMatchFuzzy(expected, nextSpoken)) {
        // Current word was likely a filler or mistake
        transcribedIndex++;
        continue;
      }
    }

    // Check for repeated word
    if (expectedIndex > 0 && wordsMatchExactly(expectedWords[expectedIndex - 1], spoken)) {
      matches.push({
        expected,
        spoken,
        timestamp: transcribed.start,
        status: 'repeated',
        confidence: transcribed.confidence ?? 1.0,
        expectedIndex,
        spokenIndex: transcribedIndex,
      });
      transcribedIndex++;
      continue;
    }

    // Check if it's significantly different (mispronunciation)
    const distance = levenshteinDistance(expected, spoken);
    if (distance > FUZZY_MATCH_THRESHOLD && distance <= expected.length / 2) {
      matches.push({
        expected,
        spoken,
        timestamp: transcribed.start,
        status: 'mispronounced',
        confidence: transcribed.confidence ?? 0.5,
        expectedIndex,
        spokenIndex: transcribedIndex,
      });
      transcribedIndex++;
      continue;
    }

    // Word was skipped
    matches.push({
      expected,
      spoken: null,
      status: 'skipped',
      confidence: 0,
      expectedIndex,
    });
  }

  return matches;
}

// ============================================================================
// Hesitation Detection
// ============================================================================

/**
 * Detect hesitations in speech
 *
 * Identifies:
 * - Long pauses between words
 * - Repeated words
 * - Filler words (um, uh, etc.)
 *
 * @param words - Transcribed words with timestamps
 * @param totalDuration - Total audio duration in seconds (Whisper uses seconds)
 * @returns Array of hesitation events
 */
function detectHesitations(
  words: TranscriptionWord[],
  totalDuration: number
): HesitationEvent[] {
  const hesitations: HesitationEvent[] = [];

  if (words.length === 0) return hesitations;

  // Calculate average pause duration
  const pauses: number[] = [];
  for (let i = 1; i < words.length; i++) {
    const pause = words[i].start - words[i - 1].end;
    if (pause > 0) pauses.push(pause);
  }

  const avgPause = pauses.length > 0
    ? pauses.reduce((sum, p) => sum + p, 0) / pauses.length
    : 0;

  // Convert MIN_PAUSE_DURATION from ms to seconds
  const longPauseThreshold = Math.max(
    avgPause * LONG_PAUSE_MULTIPLIER,
    MIN_PAUSE_DURATION / 1000
  );

  // Detect long pauses
  for (let i = 1; i < words.length; i++) {
    const pause = words[i].start - words[i - 1].end;
    if (pause >= longPauseThreshold) {
      hesitations.push({
        timestamp: words[i - 1].end,
        duration: pause,
        type: 'long_pause',
        context: getWordContext(words, i - 1, 2),
      });
    }
  }

  // Detect repeated words and filler words
  for (let i = 0; i < words.length; i++) {
    const word = normalizeText(words[i].word);

    // Check for filler words
    if (FILLER_WORDS.has(word)) {
      hesitations.push({
        timestamp: words[i].start,
        duration: words[i].end - words[i].start,
        type: 'filler_word',
        word: words[i].word,
        context: getWordContext(words, i, 2),
      });
    }

    // Check for repeated words
    if (i > 0 && normalizeText(words[i - 1].word) === word) {
      hesitations.push({
        timestamp: words[i].start,
        duration: words[i].end - words[i].start,
        type: 'repeated_word',
        word: words[i].word,
        context: getWordContext(words, i, 2),
      });
    }
  }

  return hesitations;
}

// ============================================================================
// Scoring Functions
// ============================================================================

/**
 * Calculate articulation score (0-100)
 *
 * Based on:
 * - Percentage of words spoken correctly (40%)
 * - Word completion (30%)
 * - Word boundaries/clarity (30%)
 *
 * @param matches - Word matches
 * @returns Articulation score (0-100)
 */
function calculateArticulationScore(matches: WordMatch[]): number {
  if (matches.length === 0) return 0;

  // Component 1: Correct words percentage (40%)
  const correctCount = matches.filter(m => m.status === 'correct').length;
  const correctPercentage = (correctCount / matches.length) * 100;
  const correctScore = correctPercentage * 0.4;

  // Component 2: Word completion (30%)
  // Penalize skipped and severely mispronounced words
  const completedCount = matches.filter(
    m => m.status !== 'skipped' && m.status !== 'mispronounced'
  ).length;
  const completionPercentage = (completedCount / matches.length) * 100;
  const completionScore = completionPercentage * 0.3;

  // Component 3: Word boundaries (30%)
  // Based on confidence scores (high confidence = clear boundaries)
  // Note: Whisper may not always provide confidence scores, default to 0.9
  const spokenMatches = matches.filter(m => m.spoken !== null);
  const avgConfidence = spokenMatches.length > 0
    ? spokenMatches.reduce((sum, m) => sum + (m.confidence || 0.9), 0) / spokenMatches.length
    : 0.9;
  const boundaryScore = avgConfidence * 100 * 0.3;

  return Math.round(correctScore + completionScore + boundaryScore);
}

/**
 * Calculate fluency score (0-100)
 *
 * Based on:
 * - Pace consistency (40%)
 * - Pause appropriateness (30%)
 * - Hesitation frequency (30%)
 *
 * @param words - Transcribed words
 * @param hesitations - Detected hesitations
 * @param totalDuration - Total audio duration in seconds (Whisper uses seconds)
 * @returns Fluency score (0-100)
 */
function calculateFluencyScore(
  words: TranscriptionWord[],
  hesitations: HesitationEvent[],
  totalDuration: number
): number {
  if (words.length === 0) return 0;

  // Component 1: Pace consistency (40%)
  // Calculate word durations and check for consistency
  const wordDurations = words.map(w => w.end - w.start);
  const avgDuration = wordDurations.reduce((sum, d) => sum + d, 0) / wordDurations.length;
  const variance = wordDurations.reduce((sum, d) => sum + Math.pow(d - avgDuration, 2), 0) / wordDurations.length;
  const stdDev = Math.sqrt(variance);
  const consistencyScore = Math.max(0, 100 - (stdDev / avgDuration) * 50) * 0.4;

  // Component 2: Pause appropriateness (30%)
  // Pauses are good at natural boundaries, bad in middle of words
  const longPauses = hesitations.filter(h => h.type === 'long_pause').length;
  const pauseScore = Math.max(0, 100 - (longPauses / Math.max(1, words.length / 10)) * 100) * 0.3;

  // Component 3: Hesitation frequency (30%)
  // Fewer hesitations = better fluency
  const hesitationRate = hesitations.length / Math.max(1, words.length);
  const hesitationScore = Math.max(0, 100 - hesitationRate * 500) * 0.3;

  return Math.round(consistencyScore + pauseScore + hesitationScore);
}

// ============================================================================
// Problem Word Detection
// ============================================================================

/**
 * Identify problem words from matches and hesitations
 *
 * @param matches - Word matches
 * @param hesitations - Detected hesitations
 * @param expectedText - Original expected text for context
 * @returns Array of problem words
 */
function identifyProblemWords(
  matches: WordMatch[],
  hesitations: HesitationEvent[],
  expectedText: string
): ProblemWord[] {
  const problems: ProblemWord[] = [];
  const expectedWords = tokenizeText(expectedText);

  // Add problems from matches
  for (const match of matches) {
    if (match.status === 'correct') continue;

    const issueType = match.status as IssueType;
    const context = getSentenceContext(expectedText, match.expectedIndex);

    problems.push({
      word: match.expected,
      issueType,
      timestamp: Math.round((match.timestamp || 0) * 1000), // Convert seconds to ms
      context,
      suggestion: generateSuggestion(match.expected, issueType),
      addedToWordBank: false,
    });
  }

  // Add problems from hesitations
  for (const hesitation of hesitations) {
    if (hesitation.type === 'long_pause' || !hesitation.word) continue;

    const issueType: IssueType = hesitation.type === 'repeated_word' ? 'repeated' : 'hesitated';

    problems.push({
      word: hesitation.word,
      issueType,
      timestamp: Math.round(hesitation.timestamp * 1000), // Convert seconds to ms
      context: hesitation.context,
      suggestion: generateSuggestion(hesitation.word, issueType),
      addedToWordBank: false,
    });
  }

  // Remove duplicates (prefer first occurrence)
  const seen = new Set<string>();
  return problems.filter(p => {
    const key = `${p.word}-${p.issueType}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ============================================================================
// Detailed Analysis
// ============================================================================

/**
 * Generate detailed articulation analysis
 *
 * @param matches - Word matches
 * @param hesitations - Detected hesitations
 * @param words - Transcribed words
 * @returns Detailed analysis metrics
 */
function generateDetailedAnalysis(
  matches: WordMatch[],
  hesitations: HesitationEvent[],
  words: TranscriptionWord[]
): ArticulationAnalysis {
  // Word clarity: based on confidence scores
  // Note: Whisper may not provide confidence, default to 0.9
  const avgConfidence = words.length > 0
    ? words.reduce((sum, w) => sum + (w.confidence || 0.9), 0) / words.length
    : 0;
  const wordClarity = Math.round(avgConfidence * 100);

  // Syllable completion: estimate based on match quality
  const completedWords = matches.filter(m => m.status === 'correct' || m.status === 'repeated').length;
  const syllableCompletion = matches.length > 0
    ? Math.round((completedWords / matches.length) * 100)
    : 0;

  // Pause placement: fewer inappropriate long pauses = better
  const longPauses = hesitations.filter(h => h.type === 'long_pause').length;
  const pausePlacement = Math.max(0, 100 - (longPauses / Math.max(1, words.length / 10)) * 50);

  // Word boundaries: based on confidence and clarity
  const wordBoundaries = wordClarity;

  // Hesitation count
  const hesitationCount = hesitations.length;

  // Average pause duration (convert from seconds to ms for storage)
  const pauses = [];
  for (let i = 1; i < words.length; i++) {
    const pause = words[i].start - words[i - 1].end;
    if (pause > 0) pauses.push(pause);
  }
  const averagePauseDuration = pauses.length > 0
    ? Math.round((pauses.reduce((sum, p) => sum + p, 0) / pauses.length) * 1000)
    : 0;

  return {
    wordClarity,
    syllableCompletion,
    pausePlacement: Math.round(pausePlacement),
    wordBoundaries,
    hesitationCount,
    averagePauseDuration,
  };
}

// ============================================================================
// Feedback Generation
// ============================================================================

/**
 * Generate encouraging, actionable feedback
 *
 * PHILOSOPHY: Always encouraging, never discouraging
 * - Focus on progress and strengths
 * - Frame improvements as opportunities
 * - Provide specific, actionable suggestions
 *
 * @param scores - Articulation and fluency scores
 * @param problemWords - Identified problem words
 * @param stats - Reading statistics
 * @returns Encouraging feedback
 */
function generateFeedback(
  scores: { articulation: number; fluency: number },
  problemWords: ProblemWord[],
  stats: { wordsExpected: number; wordsSpoken: number }
): ReadingFeedback {
  const { articulation, fluency } = scores;
  const accuracy = stats.wordsExpected > 0
    ? Math.round((stats.wordsSpoken / stats.wordsExpected) * 100)
    : 0;

  // Generate summary
  const summary = generateSummary(accuracy, articulation, fluency);

  // Identify strengths
  const strengths = identifyStrengths(articulation, fluency, accuracy);

  // Identify improvements
  const improvements = identifyImprovements(articulation, fluency, problemWords);

  // Generate encouragement
  const encouragement = generateEncouragement(articulation, fluency);

  // Generate next steps
  const nextSteps = generateNextSteps(problemWords, articulation, fluency);

  return {
    summary,
    strengths,
    improvements,
    encouragement,
    nextSteps,
  };
}

/**
 * Generate summary message
 */
function generateSummary(accuracy: number, articulation: number, fluency: number): string {
  if (accuracy >= 95 && articulation >= 85) {
    return `Excellent work! You read ${accuracy}% of words clearly with great articulation.`;
  } else if (accuracy >= 80 && articulation >= 70) {
    return `Great progress! You read ${accuracy}% of words clearly.`;
  } else if (accuracy >= 60) {
    return `Good effort! You read ${accuracy}% of words. Keep practicing!`;
  } else {
    return `Nice try! You're building your reading skills. Keep going!`;
  }
}

/**
 * Identify user's strengths
 */
function identifyStrengths(articulation: number, fluency: number, accuracy: number): string[] {
  const strengths: string[] = [];

  if (articulation >= 80) {
    strengths.push('Clear word pronunciation');
  }
  if (fluency >= 80) {
    strengths.push('Smooth, natural flow');
  }
  if (accuracy >= 90) {
    strengths.push('High word completion rate');
  }
  if (articulation >= 70 && fluency >= 70) {
    strengths.push('Good balance of clarity and pace');
  }

  // Always have at least one strength
  if (strengths.length === 0) {
    strengths.push('Willingness to practice and improve');
  }

  return strengths;
}

/**
 * Identify areas for improvement
 */
function identifyImprovements(
  articulation: number,
  fluency: number,
  problemWords: ProblemWord[]
): string[] {
  const improvements: string[] = [];

  if (articulation < 70) {
    improvements.push('Focus on pronouncing each word completely');
  }
  if (fluency < 70) {
    improvements.push('Try to maintain a steady, consistent pace');
  }

  const skippedWords = problemWords.filter(p => p.issueType === 'skipped');
  if (skippedWords.length > 3) {
    improvements.push('Take your time - don\'t skip words');
  }

  const hesitations = problemWords.filter(p => p.issueType === 'hesitated');
  if (hesitations.length > 5) {
    improvements.push('Practice challenging words beforehand to build confidence');
  }

  return improvements;
}

/**
 * Generate encouraging message
 */
function generateEncouragement(articulation: number, fluency: number): string {
  const overall = (articulation + fluency) / 2;

  if (overall >= 85) {
    return 'You\'re doing fantastic! Your reading skills are really strong. Keep up the excellent work!';
  } else if (overall >= 70) {
    return 'You\'re making great progress! Every practice session makes you stronger. Keep it up!';
  } else if (overall >= 50) {
    return 'You\'re on the right track! Remember, improvement comes with practice. You\'ve got this!';
  } else {
    return 'Every expert was once a beginner. You\'re building important skills with each practice session!';
  }
}

/**
 * Generate next steps
 */
function generateNextSteps(
  problemWords: ProblemWord[],
  articulation: number,
  fluency: number
): string[] {
  const steps: string[] = [];

  // Practice specific problem words
  const uniqueProblems = Array.from(new Set(problemWords.map(p => p.word))).slice(0, 5);
  if (uniqueProblems.length > 0) {
    steps.push(`Practice these words: ${uniqueProblems.join(', ')}`);
  }

  // Targeted practice based on scores
  if (articulation < 70) {
    steps.push('Practice reading slowly and clearly, focusing on each word');
  }
  if (fluency < 70) {
    steps.push('Try reading the same passage multiple times to build fluency');
  }

  // Always have a general practice suggestion
  if (steps.length === 0) {
    steps.push('Continue practicing regularly to maintain your excellent progress');
  }

  return steps;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Normalize text for comparison
 * - Lowercase
 * - Remove punctuation
 * - Trim whitespace
 *
 * @param text - Text to normalize
 * @returns Normalized text
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"()[\]{}]/g, '')
    .trim();
}

/**
 * Tokenize text into words
 *
 * @param text - Text to tokenize
 * @returns Array of normalized words
 */
function tokenizeText(text: string): string[] {
  return text
    .split(/\s+/)
    .map(normalizeText)
    .filter(w => w.length > 0);
}

/**
 * Check if two words match exactly (after normalization)
 *
 * @param word1 - First word
 * @param word2 - Second word
 * @returns True if words match
 */
function wordsMatchExactly(word1: string, word2: string): boolean {
  return normalizeText(word1) === normalizeText(word2);
}

/**
 * Check if two words match with fuzzy matching
 *
 * Handles:
 * - Contractions (I'm vs I am)
 * - Common speech patterns
 * - Minor pronunciation differences
 *
 * @param expected - Expected word
 * @param spoken - Spoken word
 * @param threshold - Maximum Levenshtein distance
 * @returns True if words are close enough
 */
function wordsMatchFuzzy(
  expected: string,
  spoken: string,
  threshold = FUZZY_MATCH_THRESHOLD
): boolean {
  const exp = normalizeText(expected);
  const spk = normalizeText(spoken);

  // Exact match
  if (exp === spk) return true;

  // Levenshtein distance
  const distance = levenshteinDistance(exp, spk);
  return distance <= threshold;
}

/**
 * Calculate Levenshtein distance between two strings
 *
 * Measures the minimum number of single-character edits needed
 * to change one word into another.
 *
 * @param a - First string
 * @param b - Second string
 * @returns Edit distance
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Get context around a word (surrounding words)
 *
 * @param words - Array of words
 * @param index - Index of target word
 * @param radius - Number of words before/after
 * @returns Context string
 */
function getWordContext(words: TranscriptionWord[], index: number, radius = 2): string {
  const start = Math.max(0, index - radius);
  const end = Math.min(words.length, index + radius + 1);
  return words.slice(start, end).map(w => w.word).join(' ');
}

/**
 * Get sentence containing a word from the original text
 *
 * @param text - Original text
 * @param wordIndex - Index of word in tokenized text
 * @returns Sentence containing the word
 */
export function getSentenceContext(text: string, wordIndex: number): string {
  // Split into sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

  // Find which sentence contains the word at wordIndex
  let currentWordIndex = 0;
  for (const sentence of sentences) {
    const wordsInSentence = tokenizeText(sentence).length;
    if (currentWordIndex + wordsInSentence > wordIndex) {
      return sentence.trim();
    }
    currentWordIndex += wordsInSentence;
  }

  // Fallback: return first sentence or the text itself
  return sentences[0] || text;
}

/**
 * Generate improvement suggestion for a word
 *
 * @param word - The problem word
 * @param issueType - Type of issue
 * @returns Actionable suggestion
 */
export function generateSuggestion(word: string, issueType: string): string {
  switch (issueType) {
    case 'skipped':
      return `Try practicing "${word}" slowly before reading the full passage.`;
    case 'hesitated':
      return `Build confidence with "${word}" by saying it several times clearly.`;
    case 'mispronounced':
      return `Focus on each syllable in "${word}" - break it down if needed.`;
    case 'repeated':
      return `When you say "${word}" correctly, trust yourself and move on.`;
    default:
      return `Practice "${word}" to improve clarity.`;
  }
}
