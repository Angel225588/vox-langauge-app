/**
 * Lesson Module
 *
 * Level-adaptive lesson planning system.
 * Generates personalized lesson plans based on user proficiency.
 */

export {
  // Templates
  getLessonTemplate,
  getLevelGroup,
  getActivityColor,
  getActivityLabel,
  type ActivityType,
  type ActivityStatus,
  type ActivityConfig,
  type ActivityTemplate,
  type LessonTemplate,
  type LevelGroup,
  type VocabularyConfig,
  type ListeningConfig,
  type ReadingConfig,
  type VoiceCallConfig,
  type WritingConfig,
} from './lessonTemplates';

export {
  // Engine
  generateLessonPlan,
  advanceActivity,
  calculateLessonScores,
  getLessonQuote,
  type LessonPlan,
  type LessonActivity,
  type LessonScores,
} from './lessonEngine';
