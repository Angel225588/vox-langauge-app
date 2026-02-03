/**
 * Feedback Module Exports
 *
 * Personalized feedback system that adapts to user level and domain.
 * Includes conversation analysis for voice learning sessions.
 */

// Personalized feedback for learning cards
export {
  // Functions
  generatePersonalizedFeedback,
  quickCorrectFeedback,
  quickIncorrectFeedback,
  getFeedbackPromptModifier,
  // Types
  type UserLevel,
  type UserDomain,
  type FeedbackContext,
  type FeedbackOptions,
  type PersonalizedFeedback,
} from './personalizedFeedback';

// Conversation analysis for voice sessions
export {
  analyzeConversation,
  getQuickFeedbackSummary,
  type ConversationFeedback,
  type AIObservations,
  type TranscriptEntry,
} from './conversationAnalyzer';

// Feedback capture hook
export {
  useConversationFeedback,
  createFeedbackInput,
  type CaptureFeedbackInput,
  type QuickFeedback,
  type UseConversationFeedbackReturn,
} from './useConversationFeedback';
