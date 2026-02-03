/**
 * Semantic Matcher
 *
 * Adds semantic understanding to word matching.
 * Distinguishes between:
 * - Exact matches (perfect)
 * - Comprehensible variations (understood, just different form)
 * - Actual errors (wrong word, affects meaning)
 *
 * Philosophy: "gonna" = "going to" is CORRECT for communication.
 * We only mark errors that affect comprehension.
 */

// ============================================================================
// Common Equivalent Words/Phrases
// ============================================================================

/**
 * Words that are semantically equivalent
 * Key = spoken form, Value = acceptable written forms
 */
export const EQUIVALENT_WORDS: Record<string, string[]> = {
  // Contractions and expansions
  'gonna': ['going to', 'going'],
  'wanna': ['want to', 'want'],
  'gotta': ['got to', 'have to', 'got'],
  'kinda': ['kind of', 'kind'],
  'sorta': ['sort of', 'sort'],
  'lemme': ['let me'],
  'gimme': ['give me'],
  'dunno': ['don\'t know', 'do not know'],
  'coulda': ['could have', 'could\'ve'],
  'shoulda': ['should have', 'should\'ve'],
  'woulda': ['would have', 'would\'ve'],
  'oughta': ['ought to'],
  'hafta': ['have to'],
  'tryna': ['trying to'],
  'finna': ['fixing to', 'going to'],
  'ima': ['i\'m going to', 'i am going to'],
  'ain\'t': ['isn\'t', 'is not', 'aren\'t', 'are not', 'am not', 'haven\'t', 'hasn\'t'],

  // Common reductions
  'cause': ['because'],
  'cuz': ['because', 'cause'],
  'bout': ['about'],
  'em': ['them'],
  'til': ['until'],
  'ya': ['you', 'your'],
  'yer': ['your', 'you\'re'],

  // Number variations
  'ok': ['okay'],
  'okay': ['ok'],
  'alright': ['all right'],

  // Reverse mappings (written -> spoken)
  'going to': ['gonna'],
  'want to': ['wanna'],
  'got to': ['gotta'],
  'have to': ['gotta', 'hafta'],
  'kind of': ['kinda'],
  'sort of': ['sorta'],
  'let me': ['lemme'],
  'give me': ['gimme'],
  'could have': ['coulda'],
  'should have': ['shoulda'],
  'would have': ['woulda'],
  'because': ['cause', 'cuz'],
  'about': ['bout'],
  'them': ['em'],
  'until': ['til'],
};

/**
 * Words that can be safely dropped without changing meaning
 * (articles, filler words)
 */
export const DROPPABLE_WORDS = new Set([
  'a', 'an', 'the',       // Articles (often dropped in casual speech)
  'um', 'uh', 'er', 'ah', // Filler sounds
  'like', 'you know',      // Filler phrases
  'well', 'so', 'now',    // Discourse markers
  'just', 'really',       // Intensifiers (sometimes dropped)
]);

/**
 * Common word substitutions that don't change meaning
 */
export const ACCEPTABLE_SUBSTITUTIONS: Record<string, string[]> = {
  // Be verbs
  'is': ['\'s'],
  'are': ['\'re'],
  'am': ['\'m'],
  'have': ['\'ve'],
  'has': ['\'s'],
  'had': ['\'d'],
  'will': ['\'ll'],
  'would': ['\'d'],
  'not': ['n\'t'],

  // Common synonyms in casual speech
  'very': ['really', 'so'],
  'really': ['very', 'so'],
  'big': ['large', 'huge'],
  'small': ['little', 'tiny'],
  'good': ['great', 'nice', 'fine'],
  'bad': ['terrible', 'awful'],
  'said': ['says', 'told'],
  'went': ['go', 'goes'],
  'got': ['get', 'have'],
};

// ============================================================================
// Semantic Match Result
// ============================================================================

export type SemanticMatchType =
  | 'exact'           // Perfect match
  | 'equivalent'      // Different form, same meaning (gonna = going to)
  | 'comprehensible'  // Understood despite variation
  | 'minor_error'     // Small error, meaning preserved
  | 'error';          // Actual error affecting comprehension

export interface SemanticMatchResult {
  /** Type of match */
  matchType: SemanticMatchType;

  /** Is this considered "correct" for communication? */
  isComprehensible: boolean;

  /** Should this count against accuracy? */
  countsAsError: boolean;

  /** Explanation of the match/mismatch */
  explanation: string;

  /** Confidence in this assessment (0-1) */
  confidence: number;
}

// ============================================================================
// Main Matching Functions
// ============================================================================

/**
 * Check if two words/phrases are semantically equivalent
 *
 * @param expected - What was supposed to be said
 * @param spoken - What was actually said
 * @returns Semantic match result
 *
 * @example
 * ```ts
 * checkSemanticMatch('going to', 'gonna')
 * // { matchType: 'equivalent', isComprehensible: true, countsAsError: false, ... }
 *
 * checkSemanticMatch('restaurant', 'restrant')
 * // { matchType: 'minor_error', isComprehensible: true, countsAsError: false, ... }
 *
 * checkSemanticMatch('cat', 'dog')
 * // { matchType: 'error', isComprehensible: false, countsAsError: true, ... }
 * ```
 */
export function checkSemanticMatch(
  expected: string,
  spoken: string | null
): SemanticMatchResult {
  // Handle null/missing spoken word
  if (!spoken) {
    // Check if expected word is droppable
    const normalizedExpected = normalizeWord(expected);
    if (DROPPABLE_WORDS.has(normalizedExpected)) {
      return {
        matchType: 'comprehensible',
        isComprehensible: true,
        countsAsError: false,
        explanation: `"${expected}" is optional and can be dropped in natural speech`,
        confidence: 0.9,
      };
    }

    return {
      matchType: 'error',
      isComprehensible: false,
      countsAsError: true,
      explanation: `Word "${expected}" was not spoken`,
      confidence: 1.0,
    };
  }

  const normalizedExpected = normalizeWord(expected);
  const normalizedSpoken = normalizeWord(spoken);

  // 1. Exact match
  if (normalizedExpected === normalizedSpoken) {
    return {
      matchType: 'exact',
      isComprehensible: true,
      countsAsError: false,
      explanation: 'Perfect match',
      confidence: 1.0,
    };
  }

  // 2. Check equivalent words
  const expectedEquivalents = EQUIVALENT_WORDS[normalizedExpected] || [];
  const spokenEquivalents = EQUIVALENT_WORDS[normalizedSpoken] || [];

  if (
    expectedEquivalents.some(eq => normalizeWord(eq) === normalizedSpoken) ||
    spokenEquivalents.some(eq => normalizeWord(eq) === normalizedExpected)
  ) {
    return {
      matchType: 'equivalent',
      isComprehensible: true,
      countsAsError: false,
      explanation: `"${spoken}" is equivalent to "${expected}" in natural speech`,
      confidence: 0.95,
    };
  }

  // 3. Check acceptable substitutions
  const acceptableSubs = ACCEPTABLE_SUBSTITUTIONS[normalizedExpected] || [];
  if (acceptableSubs.some(sub => normalizeWord(sub) === normalizedSpoken)) {
    return {
      matchType: 'comprehensible',
      isComprehensible: true,
      countsAsError: false,
      explanation: `"${spoken}" is an acceptable variation of "${expected}"`,
      confidence: 0.9,
    };
  }

  // 4. Check phonetic similarity (sounds similar)
  const phoneticSimilarity = getPhoneticSimilarity(normalizedExpected, normalizedSpoken);
  if (phoneticSimilarity > 0.8) {
    return {
      matchType: 'comprehensible',
      isComprehensible: true,
      countsAsError: false,
      explanation: `"${spoken}" sounds similar to "${expected}" and is understandable`,
      confidence: phoneticSimilarity,
    };
  }

  // 5. Check Levenshtein distance for minor typos/variations
  const distance = levenshteinDistance(normalizedExpected, normalizedSpoken);
  const maxLength = Math.max(normalizedExpected.length, normalizedSpoken.length);
  const similarity = 1 - (distance / maxLength);

  if (similarity >= 0.7) {
    return {
      matchType: 'minor_error',
      isComprehensible: true,
      countsAsError: false, // Still comprehensible
      explanation: `"${spoken}" is close enough to "${expected}" to be understood`,
      confidence: similarity,
    };
  }

  if (similarity >= 0.5) {
    return {
      matchType: 'minor_error',
      isComprehensible: true,
      countsAsError: true, // Count but acknowledge it's understandable
      explanation: `"${spoken}" differs from "${expected}" but may still be understood`,
      confidence: similarity,
    };
  }

  // 6. Actual error
  return {
    matchType: 'error',
    isComprehensible: false,
    countsAsError: true,
    explanation: `"${spoken}" does not match "${expected}"`,
    confidence: 1.0 - similarity,
  };
}

/**
 * Batch check semantic matches for a full sentence
 */
export function checkSentenceSemantics(
  expectedWords: string[],
  spokenWords: (string | null)[]
): {
  overallComprehensible: boolean;
  comprehensionScore: number; // 0-100
  exactMatchScore: number; // 0-100
  matches: SemanticMatchResult[];
} {
  const matches = expectedWords.map((expected, i) =>
    checkSemanticMatch(expected, spokenWords[i] || null)
  );

  const comprehensibleCount = matches.filter(m => m.isComprehensible).length;
  const exactCount = matches.filter(m => m.matchType === 'exact' || m.matchType === 'equivalent').length;

  const comprehensionScore = Math.round((comprehensibleCount / expectedWords.length) * 100);
  const exactMatchScore = Math.round((exactCount / expectedWords.length) * 100);

  return {
    overallComprehensible: comprehensionScore >= 70, // 70%+ = understood
    comprehensionScore,
    exactMatchScore,
    matches,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Normalize word for comparison
 */
function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .replace(/[.,!?;:'"()[\]{}]/g, '')
    .trim();
}

/**
 * Simple Levenshtein distance
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

/**
 * Get phonetic similarity between two words
 * Uses simplified phonetic rules
 */
function getPhoneticSimilarity(word1: string, word2: string): number {
  const phonetic1 = toPhonetic(word1);
  const phonetic2 = toPhonetic(word2);

  if (phonetic1 === phonetic2) return 1.0;

  const distance = levenshteinDistance(phonetic1, phonetic2);
  const maxLen = Math.max(phonetic1.length, phonetic2.length);

  return 1 - (distance / maxLen);
}

/**
 * Convert word to simplified phonetic representation
 * Based on Soundex-like rules
 */
function toPhonetic(word: string): string {
  let result = word.toLowerCase();

  // Common phonetic equivalences
  const replacements: [RegExp, string][] = [
    // Silent letters
    [/^kn/, 'n'],      // knight -> night
    [/^gn/, 'n'],      // gnome -> nome
    [/^wr/, 'r'],      // write -> rite
    [/mb$/, 'm'],      // lamb -> lam
    [/gh/, ''],        // night -> nit

    // Vowel equivalences
    [/[aeiou]+/g, 'a'], // Reduce all vowels to 'a'

    // Consonant equivalences
    [/[bp]/g, 'b'],    // b/p similar
    [/[cksqx]/g, 'k'], // c/k/s/q/x similar
    [/[dt]/g, 'd'],    // d/t similar
    [/[fvph]/g, 'f'],  // f/v/ph similar
    [/[gj]/g, 'g'],    // g/j similar
    [/[mn]/g, 'm'],    // m/n similar
    [/[sz]/g, 's'],    // s/z similar

    // Double consonants
    [/(.)\1+/g, '$1'], // Remove repeated letters
  ];

  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }

  return result;
}

/**
 * Check if a word can be safely ignored
 */
export function isDroppableWord(word: string): boolean {
  return DROPPABLE_WORDS.has(normalizeWord(word));
}

/**
 * Get semantic feedback for display
 */
export function getSemanticFeedback(result: SemanticMatchResult): {
  icon: string;
  color: 'success' | 'warning' | 'error';
  shortMessage: string;
} {
  switch (result.matchType) {
    case 'exact':
      return { icon: '✓', color: 'success', shortMessage: 'Perfect' };
    case 'equivalent':
      return { icon: '≈', color: 'success', shortMessage: 'Equivalent' };
    case 'comprehensible':
      return { icon: '~', color: 'success', shortMessage: 'Understood' };
    case 'minor_error':
      return { icon: '!', color: 'warning', shortMessage: 'Close' };
    case 'error':
      return { icon: '✗', color: 'error', shortMessage: 'Review' };
  }
}
