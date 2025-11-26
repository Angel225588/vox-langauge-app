/**
 * Mock Mini-Lessons Data
 *
 * Complete data for 1 stair (Professional Greetings) with 5 mini-lessons
 */

import { MiniLesson, UserMiniLessonProgress, MiniLessonCard } from '../types/mini-lesson';

// Professional Greetings Stair - 5 Mini-Lessons
export const MOCK_MINI_LESSONS: MiniLesson[] = [
  {
    id: 'ml-1',
    stair_id: '1', // Professional Greetings
    order: 1,
    title: 'Basic Greetings',
    description: 'Learn hello, goodbye, and thank you',
    icon: '👋',
    type: 'lesson',
    category: 'vocabulary',
    estimated_minutes: 5,
    card_count: 8,
  },
  {
    id: 'ml-2',
    stair_id: '1',
    order: 2,
    title: 'Formal Introductions',
    description: 'Professional meeting etiquette',
    icon: '🤝',
    type: 'lesson',
    category: 'speaking',
    estimated_minutes: 6,
    card_count: 10,
  },
  {
    id: 'ml-3',
    stair_id: '1',
    order: 3,
    title: 'Small Talk',
    description: 'Break the ice professionally',
    icon: '💬',
    type: 'lesson',
    category: 'listening',
    estimated_minutes: 7,
    card_count: 10,
  },
  {
    id: 'ml-4',
    stair_id: '1',
    order: 4,
    title: 'Closing Conversations',
    description: 'End meetings gracefully',
    icon: '🙋',
    type: 'lesson',
    category: 'grammar',
    estimated_minutes: 6,
    card_count: 8,
  },
  {
    id: 'ml-5',
    stair_id: '1',
    order: 5,
    title: 'Greetings Assessment',
    description: 'Test your knowledge',
    icon: '🎯',
    type: 'test',
    category: 'test',
    estimated_minutes: 10,
    card_count: 15,
  },
];

// User progress for these mini-lessons
export const MOCK_USER_PROGRESS: UserMiniLessonProgress[] = [
  {
    id: 'up-1',
    user_id: 'user-123',
    mini_lesson_id: 'ml-1',
    status: 'completed',
    cards_completed: 8,
    total_cards: 8,
    accuracy_percentage: 95,
    time_spent_seconds: 285, // 4:45
    xp_earned: 24,
    completed_at: new Date().toISOString(),
    started_at: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 'up-2',
    user_id: 'user-123',
    mini_lesson_id: 'ml-2',
    status: 'current',
    cards_completed: 6,
    total_cards: 10,
    accuracy_percentage: 90,
    time_spent_seconds: 210, // 3:30
    xp_earned: 18,
    started_at: new Date(Date.now() - 210000).toISOString(),
  },
  {
    id: 'up-3',
    user_id: 'user-123',
    mini_lesson_id: 'ml-3',
    status: 'locked',
    cards_completed: 0,
    total_cards: 10,
    accuracy_percentage: 0,
    time_spent_seconds: 0,
    xp_earned: 0,
  },
  {
    id: 'up-4',
    user_id: 'user-123',
    mini_lesson_id: 'ml-4',
    status: 'locked',
    cards_completed: 0,
    total_cards: 8,
    accuracy_percentage: 0,
    time_spent_seconds: 0,
    xp_earned: 0,
  },
  {
    id: 'up-5',
    user_id: 'user-123',
    mini_lesson_id: 'ml-5',
    status: 'locked',
    cards_completed: 0,
    total_cards: 15,
    accuracy_percentage: 0,
    time_spent_seconds: 0,
    xp_earned: 0,
  },
];

// Sample cards for Mini-Lesson 1 (Basic Greetings)
export const MOCK_MINI_LESSON_CARDS: MiniLessonCard[] = [
  {
    id: 'card-1',
    mini_lesson_id: 'ml-1',
    order: 1,
    type: 'single-vocab',
    content: {
      word: 'Hello',
      translation: 'Hola',
      phonetic: '/həˈloʊ/',
      image_url: 'https://example.com/hello.jpg',
      audio_url: 'https://example.com/hello.mp3',
      example_sentence: 'Hello, nice to meet you!',
    },
  },
  {
    id: 'card-2',
    mini_lesson_id: 'ml-1',
    order: 2,
    type: 'single-vocab',
    content: {
      word: 'Good morning',
      translation: 'Buenos días',
      phonetic: '/ɡʊd ˈmɔːrnɪŋ/',
      audio_url: 'https://example.com/good-morning.mp3',
      example_sentence: 'Good morning, how are you today?',
    },
  },
  {
    id: 'card-3',
    mini_lesson_id: 'ml-1',
    order: 3,
    type: 'multiple-choice',
    content: {
      word: 'Thank you',
      translation: 'Gracias',
      options: ['Thanks', 'Please', 'Sorry', 'Welcome'],
      correct_answer: 0,
    },
  },
  {
    id: 'card-4',
    mini_lesson_id: 'ml-1',
    order: 4,
    type: 'single-vocab',
    content: {
      word: 'Goodbye',
      translation: 'Adiós',
      phonetic: '/ɡʊdˈbaɪ/',
      audio_url: 'https://example.com/goodbye.mp3',
      example_sentence: 'Goodbye, have a great day!',
    },
  },
  {
    id: 'card-5',
    mini_lesson_id: 'ml-1',
    order: 5,
    type: 'image-quiz',
    content: {
      word: 'Handshake',
      options: [
        'Shake hands',
        'Wave goodbye',
        'Bow',
        'High five',
      ],
      correct_answer: 0,
      image_url: 'https://example.com/handshake.jpg',
    },
  },
  {
    id: 'card-6',
    mini_lesson_id: 'ml-1',
    order: 6,
    type: 'text-input',
    content: {
      word: 'Please',
      translation: 'Por favor',
      correct_answer: 'please',
    },
  },
  {
    id: 'card-7',
    mini_lesson_id: 'ml-1',
    order: 7,
    type: 'audio',
    content: {
      word: 'Excuse me',
      translation: 'Disculpe',
      audio_url: 'https://example.com/excuse-me.mp3',
      options: ['Excuse me', 'Sorry', 'Pardon', 'Forgive me'],
      correct_answer: 0,
    },
  },
  {
    id: 'card-8',
    mini_lesson_id: 'ml-1',
    order: 8,
    type: 'speaking',
    content: {
      word: 'Nice to meet you',
      translation: 'Encantado de conocerte',
      phonetic: '/naɪs tə miːt juː/',
      audio_url: 'https://example.com/nice-to-meet-you.mp3',
      example_sentence: 'Nice to meet you, I\'m looking forward to working together.',
    },
  },
];

// Helper function to get mini-lessons for a stair
export function getMiniLessonsForStair(stairId: string): MiniLesson[] {
  return MOCK_MINI_LESSONS.filter(ml => ml.stair_id === stairId);
}

// Helper function to get user progress for mini-lessons
export function getUserProgressForMiniLessons(
  userId: string,
  miniLessonIds: string[]
): UserMiniLessonProgress[] {
  return MOCK_USER_PROGRESS.filter(
    up => up.user_id === userId && miniLessonIds.includes(up.mini_lesson_id)
  );
}

// Helper function to get cards for a mini-lesson
export function getCardsForMiniLesson(miniLessonId: string): MiniLessonCard[] {
  return MOCK_MINI_LESSON_CARDS.filter(card => card.mini_lesson_id === miniLessonId);
}

// Helper to calculate completion stats
export function calculateCompletionStats(
  cardsCompleted: number,
  totalCards: number,
  accuracy: number,
  timeSpentSeconds: number
): { xp: number; timeFormatted: string; stars: number } {
  // XP calculation: base XP * accuracy multiplier
  const baseXP = cardsCompleted * 3;
  const accuracyMultiplier = accuracy / 100;
  const xp = Math.round(baseXP * accuracyMultiplier);

  // Format time as M:SS
  const minutes = Math.floor(timeSpentSeconds / 60);
  const seconds = timeSpentSeconds % 60;
  const timeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // Stars (1-3 based on accuracy)
  let stars = 1;
  if (accuracy >= 90) stars = 3;
  else if (accuracy >= 70) stars = 2;

  return { xp, timeFormatted, stars };
}
