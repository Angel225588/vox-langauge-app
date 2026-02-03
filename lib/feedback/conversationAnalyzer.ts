/**
 * Conversation Feedback Analyzer
 *
 * Analyzes completed voice conversations to extract insights for learning optimization.
 * This data feeds into:
 * - Gemini daily analysis (real-time content adjustments)
 * - Claude weekly review (strategic path restructuring)
 *
 * Captures:
 * - Pronunciation patterns and issues
 * - Vocabulary usage and gaps
 * - Fluency metrics
 * - Confidence signals
 * - Suggested focus areas
 */

import { ElevenLabsMessage, ConversationSession } from '@/lib/voice/elevenLabsTypes';
import { AccentType, SupportedLanguage } from '@/lib/voice/types';

// =============================================================================
// Types
// =============================================================================

/** Conversation feedback ready for storage */
export interface ConversationFeedback {
  sessionId: string;
  scenarioId: string;
  voiceUsed: string;
  accentUsed: AccentType;
  durationSeconds: number;
  userTurns: number;
  aiObservations: AIObservations;
  transcript: TranscriptEntry[];
  pointsEarned: number;
}

/** AI-generated observations about the conversation */
export interface AIObservations {
  /** Detected pronunciation issues */
  pronunciationIssues: string[];
  /** Vocabulary words used by the user */
  vocabularyUsed: string[];
  /** Vocabulary that seemed to cause difficulty */
  vocabularyGaps: string[];
  /** Overall fluency score (0-1) */
  fluencyScore: number;
  /** User's apparent confidence level */
  confidenceSignals: 'low' | 'moderate' | 'high';
  /** Suggested areas to focus on next */
  suggestedFocus: string[];
  /** Average response time in seconds */
  averageResponseTime: number;
  /** Words per minute (speaking rate) */
  wordsPerMinute: number;
  /** Sentiment analysis of user messages */
  userSentiment: 'frustrated' | 'neutral' | 'engaged' | 'enthusiastic';
}

/** Individual transcript entry */
export interface TranscriptEntry {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  wordCount: number;
}

/** Language-specific common pronunciation issues to detect */
interface PronunciationPattern {
  pattern: RegExp;
  issue: string;
  language: SupportedLanguage;
}

// =============================================================================
// Pronunciation Detection Patterns
// =============================================================================

/**
 * Common pronunciation patterns to detect in transcripts
 * These are based on typical learner mistakes per language
 */
const PRONUNCIATION_PATTERNS: PronunciationPattern[] = [
  // Spanish patterns
  { pattern: /\brr?\b/gi, issue: 'r-rolling', language: 'es' },
  { pattern: /\b(ll|y)\b/gi, issue: 'll-y-distinction', language: 'es' },
  { pattern: /\b(c|z)e|i\b/gi, issue: 'ce-ci-sound', language: 'es' },
  { pattern: /\bñ\b/gi, issue: 'ñ-sound', language: 'es' },
  { pattern: /\b(gue|gui)\b/gi, issue: 'gu-sound', language: 'es' },

  // French patterns
  { pattern: /\b(r)\b/gi, issue: 'french-r', language: 'fr' },
  { pattern: /\b(u)\b/gi, issue: 'french-u', language: 'fr' },
  { pattern: /\b(eu|œu)\b/gi, issue: 'eu-sound', language: 'fr' },
  { pattern: /\b(on|en|an|in)\b/gi, issue: 'nasal-vowels', language: 'fr' },
  { pattern: /\b(oi)\b/gi, issue: 'oi-sound', language: 'fr' },

  // English patterns (for ESL learners)
  { pattern: /\bth\b/gi, issue: 'th-sound', language: 'en' },
  { pattern: /\b(v|w)\b/gi, issue: 'v-w-distinction', language: 'en' },
  { pattern: /\b(ch|sh)\b/gi, issue: 'ch-sh-distinction', language: 'en' },
];

// =============================================================================
// Vocabulary Analysis
// =============================================================================

/**
 * Common vocabulary categories for tracking
 */
const VOCABULARY_CATEGORIES: Record<string, string[]> = {
  greetings: ['hola', 'buenos', 'buenas', 'bonjour', 'salut', 'hello', 'hi', 'hey'],
  farewells: ['adiós', 'hasta', 'chao', 'au revoir', 'goodbye', 'bye', 'see you'],
  politeness: ['por favor', 'gracias', 'perdón', 's\'il vous plaît', 'merci', 'please', 'thank you', 'sorry'],
  questions: ['qué', 'cómo', 'dónde', 'cuándo', 'quoi', 'comment', 'où', 'what', 'how', 'where', 'when'],
  numbers: ['uno', 'dos', 'tres', 'un', 'deux', 'trois', 'one', 'two', 'three'],
  food: ['café', 'agua', 'comida', 'pan', 'café', 'eau', 'pain', 'coffee', 'water', 'food', 'bread'],
  directions: ['izquierda', 'derecha', 'recto', 'gauche', 'droite', 'tout droit', 'left', 'right', 'straight'],
};

/**
 * Extract vocabulary words from text
 */
function extractVocabulary(text: string): string[] {
  // Simple word extraction - lowercase and split
  const words = text
    .toLowerCase()
    .replace(/[^\w\sáéíóúàèìòùâêîôûäëïöüñç]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2);

  return [...new Set(words)];
}

/**
 * Categorize vocabulary usage
 */
function categorizeVocabulary(words: string[]): Record<string, string[]> {
  const categorized: Record<string, string[]> = {};

  for (const [category, categoryWords] of Object.entries(VOCABULARY_CATEGORIES)) {
    const matches = words.filter(word =>
      categoryWords.some(cw => word.includes(cw) || cw.includes(word))
    );
    if (matches.length > 0) {
      categorized[category] = matches;
    }
  }

  return categorized;
}

// =============================================================================
// Fluency Analysis
// =============================================================================

/**
 * Calculate fluency score based on conversation patterns
 */
function calculateFluencyScore(
  messages: ElevenLabsMessage[],
  durationSeconds: number
): number {
  const userMessages = messages.filter(m => m.role === 'user');

  if (userMessages.length === 0) {
    return 0;
  }

  // Factors for fluency
  const totalWords = userMessages.reduce((sum, m) => sum + (m.wordCount || 0), 0);
  const avgWordsPerMessage = totalWords / userMessages.length;

  // Expected words per minute for different levels
  // Native: 150-180 wpm, Advanced: 120-150, Intermediate: 80-120, Beginner: 40-80
  const wordsPerMinute = durationSeconds > 0 ? (totalWords / durationSeconds) * 60 : 0;

  // Score components
  let score = 0;

  // Words per message (more words = more fluent)
  if (avgWordsPerMessage >= 10) score += 0.3;
  else if (avgWordsPerMessage >= 5) score += 0.2;
  else if (avgWordsPerMessage >= 3) score += 0.1;

  // Speaking rate
  if (wordsPerMinute >= 80) score += 0.3;
  else if (wordsPerMinute >= 50) score += 0.2;
  else if (wordsPerMinute >= 30) score += 0.1;

  // Turn count (more turns = more engaged)
  if (userMessages.length >= 8) score += 0.2;
  else if (userMessages.length >= 5) score += 0.15;
  else if (userMessages.length >= 3) score += 0.1;

  // Message variety (not just one-word responses)
  const hasLongResponses = userMessages.some(m => (m.wordCount || 0) >= 8);
  if (hasLongResponses) score += 0.2;

  return Math.min(1, Math.max(0, score));
}

/**
 * Analyze confidence signals from message patterns
 */
function analyzeConfidenceSignals(messages: ElevenLabsMessage[]): 'low' | 'moderate' | 'high' {
  const userMessages = messages.filter(m => m.role === 'user');

  if (userMessages.length === 0) {
    return 'low';
  }

  // Confidence indicators
  let confidenceScore = 0;

  // Longer messages suggest confidence
  const avgLength = userMessages.reduce((sum, m) => sum + (m.wordCount || 0), 0) / userMessages.length;
  if (avgLength >= 8) confidenceScore += 2;
  else if (avgLength >= 5) confidenceScore += 1;

  // More turns suggest engagement/confidence
  if (userMessages.length >= 6) confidenceScore += 2;
  else if (userMessages.length >= 4) confidenceScore += 1;

  // Check for question-asking (shows engagement)
  const hasQuestions = userMessages.some(m =>
    m.content.includes('?') || /\b(qué|cómo|dónde|quoi|comment|what|how)\b/i.test(m.content)
  );
  if (hasQuestions) confidenceScore += 1;

  // Determine level
  if (confidenceScore >= 4) return 'high';
  if (confidenceScore >= 2) return 'moderate';
  return 'low';
}

/**
 * Analyze user sentiment from message content
 */
function analyzeUserSentiment(
  messages: ElevenLabsMessage[]
): 'frustrated' | 'neutral' | 'engaged' | 'enthusiastic' {
  const userMessages = messages.filter(m => m.role === 'user');

  if (userMessages.length === 0) {
    return 'neutral';
  }

  // Look for sentiment signals
  const allText = userMessages.map(m => m.content.toLowerCase()).join(' ');

  // Frustration signals
  const frustrationWords = ['no sé', 'no entiendo', 'difícil', 'je ne sais pas', 'i don\'t know', 'difficult', 'hard', 'confusing'];
  const hasFrustration = frustrationWords.some(word => allText.includes(word));

  // Enthusiasm signals
  const enthusiasmWords = ['genial', 'perfecto', 'increíble', 'super', 'génial', 'parfait', 'great', 'awesome', 'amazing', 'cool', '!'];
  const hasEnthusiasm = enthusiasmWords.some(word => allText.includes(word));

  // Engagement signals (questions, longer responses)
  const hasQuestions = allText.includes('?');
  const avgLength = userMessages.reduce((sum, m) => sum + (m.wordCount || 0), 0) / userMessages.length;

  // Determine sentiment
  if (hasFrustration && !hasEnthusiasm) return 'frustrated';
  if (hasEnthusiasm || (hasQuestions && avgLength > 5)) return 'enthusiastic';
  if (hasQuestions || avgLength > 4) return 'engaged';
  return 'neutral';
}

// =============================================================================
// Main Analysis Function
// =============================================================================

/**
 * Analyze a completed conversation session
 *
 * @param session - The completed conversation session
 * @param scenarioId - The scenario that was practiced
 * @param voiceId - The voice ID used
 * @param accent - The accent used
 * @param targetLanguage - The target language being learned
 */
export function analyzeConversation(
  session: ConversationSession,
  scenarioId: string,
  voiceId: string,
  accent: AccentType,
  targetLanguage: SupportedLanguage
): ConversationFeedback {
  const messages = session.messages || [];
  const userMessages = messages.filter(m => m.role === 'user');
  const durationSeconds = session.duration || 0;

  // Build transcript
  const transcript: TranscriptEntry[] = messages.map(m => ({
    role: m.role,
    content: m.content,
    timestamp: m.timestamp,
    wordCount: m.wordCount || m.content.split(' ').length,
  }));

  // Extract all user text
  const allUserText = userMessages.map(m => m.content).join(' ');

  // Vocabulary analysis
  const vocabularyUsed = extractVocabulary(allUserText);
  const categorizedVocab = categorizeVocabulary(vocabularyUsed);

  // Detect pronunciation patterns that might be issues
  const pronunciationIssues: string[] = [];
  for (const pattern of PRONUNCIATION_PATTERNS) {
    if (pattern.language === targetLanguage) {
      if (pattern.pattern.test(allUserText)) {
        pronunciationIssues.push(pattern.issue);
      }
    }
  }

  // Calculate metrics
  const fluencyScore = calculateFluencyScore(messages, durationSeconds);
  const confidenceSignals = analyzeConfidenceSignals(messages);
  const userSentiment = analyzeUserSentiment(messages);

  // Calculate words per minute
  const totalWords = userMessages.reduce((sum, m) => sum + (m.wordCount || 0), 0);
  const wordsPerMinute = durationSeconds > 0 ? (totalWords / durationSeconds) * 60 : 0;

  // Calculate average response time (simplified - assume even distribution)
  const averageResponseTime = userMessages.length > 0
    ? durationSeconds / (userMessages.length * 2) // Rough estimate
    : 0;

  // Identify vocabulary gaps (what they should have used but didn't)
  const vocabularyGaps = suggestVocabularyGaps(scenarioId, vocabularyUsed);

  // Generate suggested focus areas
  const suggestedFocus = generateSuggestedFocus(
    fluencyScore,
    confidenceSignals,
    pronunciationIssues,
    vocabularyGaps,
    categorizedVocab
  );

  // Build AI observations
  const aiObservations: AIObservations = {
    pronunciationIssues,
    vocabularyUsed,
    vocabularyGaps,
    fluencyScore,
    confidenceSignals,
    suggestedFocus,
    averageResponseTime,
    wordsPerMinute,
    userSentiment,
  };

  return {
    sessionId: session.id,
    scenarioId,
    voiceUsed: voiceId,
    accentUsed: accent,
    durationSeconds,
    userTurns: userMessages.length,
    aiObservations,
    transcript,
    pointsEarned: session.pointsEarned || 0,
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Suggest vocabulary gaps based on scenario
 */
function suggestVocabularyGaps(
  scenarioId: string,
  vocabularyUsed: string[]
): string[] {
  const scenarioVocab: Record<string, string[]> = {
    cafe_ordering: ['café', 'agua', 'por favor', 'gracias', 'cuenta', 'menu'],
    directions: ['izquierda', 'derecha', 'recto', 'cerca', 'lejos'],
    shopping: ['precio', 'caro', 'barato', 'talla', 'color'],
    job_interview: ['experiencia', 'trabajo', 'habilidades', 'equipo'],
    casual_chat: ['bien', 'mal', 'interesante', 'genial'],
  };

  const expectedVocab = scenarioVocab[scenarioId] || [];
  const gaps = expectedVocab.filter(word =>
    !vocabularyUsed.some(used => used.includes(word) || word.includes(used))
  );

  return gaps.slice(0, 5); // Return top 5 gaps
}

/**
 * Generate suggested focus areas based on analysis
 */
function generateSuggestedFocus(
  fluencyScore: number,
  confidence: 'low' | 'moderate' | 'high',
  pronunciationIssues: string[],
  vocabularyGaps: string[],
  categorizedVocab: Record<string, string[]>
): string[] {
  const suggestions: string[] = [];

  // Fluency-based suggestions
  if (fluencyScore < 0.3) {
    suggestions.push('response_length');
    suggestions.push('speaking_confidence');
  } else if (fluencyScore < 0.6) {
    suggestions.push('conversation_flow');
  }

  // Confidence-based suggestions
  if (confidence === 'low') {
    suggestions.push('basic_phrases');
    suggestions.push('common_responses');
  }

  // Pronunciation suggestions
  if (pronunciationIssues.length > 0) {
    suggestions.push(`pronunciation: ${pronunciationIssues[0]}`);
  }

  // Vocabulary gaps
  if (vocabularyGaps.length >= 3) {
    suggestions.push('scenario_vocabulary');
  }

  // Missing categories
  const usedCategories = Object.keys(categorizedVocab);
  if (!usedCategories.includes('questions')) {
    suggestions.push('question_formation');
  }
  if (!usedCategories.includes('politeness')) {
    suggestions.push('polite_expressions');
  }

  return suggestions.slice(0, 5); // Return top 5 suggestions
}

// =============================================================================
// Utility Exports
// =============================================================================

/**
 * Quick feedback summary for display
 */
export function getQuickFeedbackSummary(feedback: ConversationFeedback): {
  fluencyLevel: string;
  confidence: string;
  topSuggestion: string;
  vocabularyCount: number;
} {
  const { aiObservations } = feedback;

  let fluencyLevel: string;
  if (aiObservations.fluencyScore >= 0.7) fluencyLevel = 'Excellent';
  else if (aiObservations.fluencyScore >= 0.5) fluencyLevel = 'Good';
  else if (aiObservations.fluencyScore >= 0.3) fluencyLevel = 'Developing';
  else fluencyLevel = 'Beginner';

  const confidence =
    aiObservations.confidenceSignals === 'high' ? 'Confident' :
    aiObservations.confidenceSignals === 'moderate' ? 'Comfortable' : 'Building';

  const topSuggestion = aiObservations.suggestedFocus[0] || 'Keep practicing!';

  return {
    fluencyLevel,
    confidence,
    topSuggestion,
    vocabularyCount: aiObservations.vocabularyUsed.length,
  };
}

// =============================================================================
// Export
// =============================================================================

export default analyzeConversation;
