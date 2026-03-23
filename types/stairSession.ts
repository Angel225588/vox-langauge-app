/**
 * Stair Session Types
 *
 * Defines the complete stair session flow:
 * Mission Briefing → Vocabulary Preview → AI Conversation → Reading → Writing → Summary
 *
 * Hybrid vocabulary strategy:
 * - DB-first: pull from Vox Library + stair content
 * - AI fills gaps: generate scenario-specific words not in the library
 * - No CEFR gatekeeping: users learn words they NEED, regardless of level
 * - Tap-to-add: any word encountered can be saved to personal vocabulary
 */

import type { VocabItem, Scenario, ComprehensionQuestion, WritingPrompt } from './learning';
import type { VocabularyItem } from './vocabulary';

// ============================================================================
// SESSION STEPS
// ============================================================================

/**
 * Steps in the stair session flow, in order.
 *
 * Flow: Briefing → Vocabulary → Listening → Conversation → Reading → Writing → Summary
 *
 * Listening comes BEFORE Conversation intentionally:
 * - User hears a scenario-relevant story/dialogue first (context + motivation)
 * - Then enters the AI conversation with vocabulary + context already loaded
 * - This is the "sell the pen" model: hear how someone did it, then try it yourself
 */
export type SessionStep =
  | 'briefing'
  | 'vocabulary'
  | 'listening'
  | 'conversation'
  | 'reading'
  | 'writing'
  | 'summary';

export const SESSION_STEP_ORDER: SessionStep[] = [
  'briefing',
  'vocabulary',
  'listening',
  'conversation',
  'reading',
  'writing',
  'summary',
];

/**
 * Step metadata for progress display.
 */
export interface StepInfo {
  step: SessionStep;
  label: string;
  icon: string;
  estimatedMinutes: number;
}

export const STEP_INFO: StepInfo[] = [
  { step: 'briefing', label: 'Mission', icon: 'target', estimatedMinutes: 1 },
  { step: 'vocabulary', label: 'Vocabulary', icon: 'book-open', estimatedMinutes: 2 },
  { step: 'listening', label: 'Listening', icon: 'headphones', estimatedMinutes: 3 },
  { step: 'conversation', label: 'Conversation', icon: 'phone', estimatedMinutes: 7 },
  { step: 'reading', label: 'Reading', icon: 'file-text', estimatedMinutes: 4 },
  { step: 'writing', label: 'Writing', icon: 'edit-3', estimatedMinutes: 3 },
  { step: 'summary', label: 'Results', icon: 'bar-chart-2', estimatedMinutes: 1 },
];

// ============================================================================
// SESSION CONTENT (loaded before session starts)
// ============================================================================

/**
 * Complete content for a stair session.
 * Built from hybrid sources: DB + AI generation.
 */
export interface StairSessionContent {
  /** The scenario driving this session */
  scenario: SessionScenario;

  /** Vocabulary for pre-call review (hybrid: DB + AI-created) */
  vocabulary: SessionVocabItem[];

  /** Listening content — scenario story/dialogue played BEFORE conversation */
  listening: SessionListeningContent;

  /** Reading passage (AI-generated using scenario vocabulary) */
  reading: SessionReadingContent;

  /** Writing task (AI-generated based on scenario) */
  writing: SessionWritingContent;

  /** Source breakdown for transparency */
  sources: ContentSources;
}

/**
 * Scenario with AI persona for the conversation step.
 */
export interface SessionScenario {
  title: string;
  description: string;
  context: string;
  objectives: string[];
  key_phrases: KeyPhrase[];
  ai_persona: {
    role: string;
    personality: string;
    speaking_style: string;
  };
}

export interface KeyPhrase {
  phrase: string;
  translation: string;
  when_to_use: string;
}

/**
 * Vocabulary item enriched for the session flow.
 * Extends VocabItem with source tracking and tap-to-add state.
 */
export interface SessionVocabItem extends VocabItem {
  /** Where this word came from */
  source: 'vox_library' | 'stair_content' | 'ai_generated';
  /** Whether this word is in the user's personal vocabulary already */
  in_personal_vocab: boolean;
  /** Whether the user has added this word during the session */
  added_during_session: boolean;
  /** Original CEFR level (null if AI-generated without level) */
  original_cefr?: string;
}

/**
 * Reading content with comprehension questions.
 */
export interface SessionReadingContent {
  /** Title of the reading passage */
  title: string;
  /** The passage text (in target language) */
  passage: string;
  /** Comprehension questions */
  questions: ComprehensionQuestion[];
  /** Words from the passage that can be tapped to learn */
  tappable_words: TappableWord[];
}

/**
 * Listening content — a scenario-relevant story or dialogue.
 *
 * This is the "sell the pen" model:
 * - User hears a compelling story related to the scenario
 * - Story uses the vocabulary they just learned
 * - Motivates them before the conversation step
 * - Can be a monologue (storytelling) or dialogue (two speakers)
 *
 * Examples:
 * - Scenario "selling a pen" → Story about someone who sold a pen for $1000
 * - Scenario "job interview" → A successful interview story
 * - Scenario "ordering food" → A local sharing their favorite restaurant
 */
export interface SessionListeningContent {
  /** Title shown to user */
  title: string;
  /** Brief description of what they'll hear */
  description: string;
  /** 'story' = single narrator, 'dialogue' = two speakers */
  type: 'story' | 'dialogue';
  /** The lines to be spoken by ElevenLabs TTS */
  lines: ListeningLine[];
  /** Comprehension questions after listening */
  questions: ListeningQuestion[];
  /** Key vocabulary from the story (highlights words they just learned) */
  vocabulary_spotlight: string[];
  /** Daily life tip — how to use this in their routine */
  daily_tip: string;
}

/** A single line of the listening content */
export interface ListeningLine {
  /** Speaker identifier: 'narrator', 'A', 'B' */
  speaker: string;
  /** Speaker display name (e.g., 'Sarah', 'The salesman') */
  speaker_name: string;
  /** The text to be spoken */
  text: string;
  /** Translation in user's native language */
  translation: string;
}

/** Comprehension question for listening */
export interface ListeningQuestion {
  question: string;
  options: string[];
  correct_index: number;
}

/**
 * A word in the reading passage that can be tapped to see translation/definition.
 */
export interface TappableWord {
  word: string;
  translation: string;
  pronunciation?: string;
  position_in_text: number;
}

/**
 * Writing task for the session.
 */
export interface SessionWritingContent {
  instruction: string;
  starter?: string;
  target_length: number;
  key_vocabulary: string[];
  /** Context from the scenario to guide writing */
  scenario_context: string;
}

/**
 * Tracks where content came from.
 */
export interface ContentSources {
  vocab_from_library: number;
  vocab_from_stair: number;
  vocab_ai_generated: number;
  reading_source: 'ai_generated';
  writing_source: 'ai_generated';
}

// ============================================================================
// SESSION STATE & RESULTS
// ============================================================================

/**
 * Current state of the stair session.
 */
export interface StairSessionState {
  /** Current step in the flow */
  currentStep: SessionStep;
  /** Index of the current step (0-5) */
  stepIndex: number;
  /** Whether content is still loading */
  isLoading: boolean;
  /** Error if content loading or step failed */
  error: string | null;
  /** Loaded session content */
  content: StairSessionContent | null;
  /** Results accumulated during the session */
  results: SessionStepResults;
  /** Session start time */
  startedAt: number;
  /** Words added to vocabulary during this session */
  wordsAdded: string[];
}

/**
 * Results from each completed step.
 */
export interface SessionStepResults {
  vocabulary?: VocabularyStepResult;
  listening?: ListeningStepResult;
  conversation?: ConversationStepResult;
  reading?: ReadingStepResult;
  writing?: WritingStepResult;
}

export interface VocabularyStepResult {
  words_reviewed: number;
  words_known: number;
  words_to_practice: number;
  time_seconds: number;
}

export interface ListeningStepResult {
  /** How many questions they answered */
  questions_total: number;
  /** How many they got right */
  questions_correct: number;
  /** Comprehension score 0-100 */
  comprehension_score: number;
  /** Did they listen to the full content */
  listened_fully: boolean;
  /** Time spent in seconds */
  time_seconds: number;
}

export interface ConversationStepResult {
  messages_sent: number;
  duration_seconds: number;
  words_used_correctly: string[];
  new_words_encountered: string[];
  fluency_score?: number;
}

export interface ReadingStepResult {
  questions_total: number;
  questions_correct: number;
  words_tapped: number;
  time_seconds: number;
  comprehension_score: number;
}

export interface WritingStepResult {
  word_count: number;
  key_vocab_used: number;
  key_vocab_total: number;
  time_seconds: number;
  grammar_score?: number;
  corrections?: number;
}

/**
 * Final session summary, displayed on the summary step.
 */
export interface SessionSummary {
  /** Overall session score (0-100) */
  overall_score: number;
  /** Time spent on entire session */
  total_time_seconds: number;
  /** Words reviewed in vocabulary step */
  vocab_reviewed: number;
  /** Words added to personal vocabulary */
  vocab_added: number;
  /** Listening comprehension */
  listening_score: number;
  /** Conversation performance */
  conversation_score: number;
  /** Reading comprehension */
  reading_score: number;
  /** Writing performance */
  writing_score: number;
  /** Breakdown by step */
  steps: SessionStepResults;
  /** FSRS cards to schedule */
  fsrs_updates: FsrsUpdate[];
}

/**
 * FSRS update to apply after session.
 */
export interface FsrsUpdate {
  word: string;
  quality: 'again' | 'hard' | 'good' | 'easy';
  source: 'vocabulary_review' | 'conversation_used' | 'conversation_missed' | 'reading_tapped' | 'writing_used';
}
