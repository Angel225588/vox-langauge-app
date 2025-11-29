/**
 * Card Components Index
 *
 * Barrel file that exports all card components.
 * Each card is in its own file for better maintainability and team collaboration.
 *
 * Working polished cards (6 original):
 * - SingleVocabCard: Display word with image, phonetics, translation
 * - MultipleChoiceCard: Select correct translation from 4 options
 * - ImageQuizCard: Identify image from 4 word options
 * - AudioCard: Listen to audio and select matching word
 * - TextInputCard: Type the English word for a translation
 * - SpeakingCard: Record pronunciation of a word
 *
 * New cards (6 Gemini-generated - all fixed and working):
 * - FillInBlankCard: ✅ Fill in the blank with correct grammar
 * - SentenceScrambleCard: ✅ Drag & drop sentence ordering
 * - DescribeImageCard: ✅ Describe images with text/audio
 * - StorytellingCard: ✅ Creative narrative building
 * - QuestionGameCard: ✅ 20 questions word guessing game
 * - RolePlayCard: ✅ Interactive conversation scenarios
 */

// Working polished cards (extracted from monolithic file)
export { SingleVocabCard } from './SingleVocabCard';
export { MultipleChoiceCard } from './MultipleChoiceCard';
export { ImageQuizCard } from './ImageQuizCard';
export { AudioCard } from './AudioCard';
export { TextInputCard } from './TextInputCard';
export { SpeakingCard } from './SpeakingCard';
export { ComparisonCard } from './ComparisonCard';

// New cards (all fixed - BaseCard dependency removed)
export { FillInBlankCard } from './FillInBlankCard';
export { SentenceScrambleCard } from './SentenceScrambleCard';
export { DescribeImageCard } from './DescribeImageCard';
export { StorytellingCard } from './StorytellingCard';
export { QuestionGameCard } from './QuestionGameCard';
export { RolePlayCard } from './RolePlayCard';
