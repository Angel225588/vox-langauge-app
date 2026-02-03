/**
 * Card Components Index
 *
 * Barrel file that exports all card components.
 * Each card is in its own file for better maintainability and team collaboration.
 *
 * Core cards:
 * - QuizCard: Unified quiz card supporting image and translation modes
 * - AudioCard: Listen to audio and select matching word
 * - TextInputCard: Type the English word for a translation
 * - SpeakingCard: Record pronunciation of a word
 * - ComparisonCard: Side-by-side word comparison
 *
 * Grammar & Sentence cards:
 * - FillInBlankCard: Fill in the blank with correct grammar
 * - SentenceScrambleCard: Drag & drop sentence ordering
 *
 * Conversation cards:
 * - RolePlayCard: Interactive conversation scenarios
 */

// Core cards
export { QuizCard } from './QuizCard';
export { AudioCard } from './AudioCard';
export { TextInputCard } from './TextInputCard';
export { SpeakingCard } from './SpeakingCard';
// ComparisonCard - V2 is now the default (vertical full-width layout)
export { ComparisonCardV2 as ComparisonCard } from './ComparisonCardV2';
export type { ComparisonCardV2Props as ComparisonCardProps, ComparisonItemV2 as ComparisonItem } from './ComparisonCardV2';
// Legacy V1 (side-by-side layout) - deprecated
export { ComparisonCard as ComparisonCardLegacy } from './ComparisonCard';
export type { ComparisonCardProps as ComparisonCardLegacyProps, ComparisonItem as ComparisonItemLegacy } from './ComparisonCard';

// Grammar & Sentence cards
export { FillInBlankCard } from './FillInBlankCard';
export { SentenceScrambleCard } from './SentenceScrambleCard';

// Conversation cards
export { RolePlayCard } from './RolePlayCard';
export { VoiceRolePlayCard } from './VoiceRolePlayCard';
export type { VoiceRolePlayCardProps, VoiceConversationMode } from './VoiceRolePlayCard';
export { GoalPage } from './GoalPage';
export type { GoalPageProps } from './GoalPage';
export { VoiceCallScreen } from './VoiceCallScreen';
export type { VoiceCallScreenProps } from './VoiceCallScreen';
export { VoiceCallScreenElevenLabs } from './VoiceCallScreenElevenLabs';
export type { VoiceCallScreenElevenLabsProps, VoiceCallCompletionResult } from './VoiceCallScreenElevenLabs';
export { PostCallFeedbackScreen } from './PostCallFeedbackScreen';
export type { PostCallFeedbackScreenProps } from './PostCallFeedbackScreen';
export { MissionBriefingScreen } from './MissionBriefingScreen';
export type { MissionBriefingScreenProps } from './MissionBriefingScreen';
export { TranscriptPage } from './TranscriptPage';
export type { TranscriptPageProps } from './TranscriptPage';

// Reading Practice cards
export { TeleprompterCard } from './TeleprompterCard';
export type { TeleprompterResults, TeleprompterMode, FontSizeOption } from './TeleprompterCard';
export { ReadingResultsCard } from './ReadingResultsCard';

// Dialogue Practice cards (Interactive Scenarios)
export { DialogueTeleprompterCard } from './DialogueTeleprompterCard';
export type { DialogueResults, DialogueMode } from './DialogueTeleprompterCard';

// Speaking Feedback cards (Honest feedback + Effort points)
export { SpeakingResultsCard } from './SpeakingResultsCard';

// Vocabulary cards (Premium)
export {
  VocabCardBase,
  IntroductionCard,
  IntroductionCardV2,
  ListeningCard as VocabListeningCard,
  TypingCard as VocabTypingCard,
  SpeakingCard as VocabSpeakingCard,
  AudioQuizCard as VocabAudioQuizCard,
  VocabularyCardFlow,
  VocabularyPracticeScreen,
  useVocabCard,
  selectNextVariant,
  getFlowSequence,
} from './vocabulary';
export type {
  VocabularyItem,
  VocabCardVariant,
  VocabCardResult,
  VocabCardProps,
  ExampleSentence,
} from './vocabulary';

// Writing Task cards (Personal Script Builder)
export {
  TaskBriefCard,
  WritingEditor,
  CorrectionCard,
  WritingAnalysisView,
  WritingTaskFlow,
} from './writing';
export type {
  WritingTask,
  WritingAnalysis,
  WritingTaskResult,
  GrammarCorrection,
  CorrectionType,
  TaskCategory,
  UserNote,
} from './writing';
