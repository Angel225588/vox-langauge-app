/**
 * Mini-Lesson TypeScript Types
 *
 * Each stair contains 5 mini-lessons (4 lessons + 1 test)
 * Each mini-lesson contains 5-10 cards
 */

export type MiniLessonStatus = 'locked' | 'current' | 'completed';

export type MiniLessonType = 'lesson' | 'test';

export type MiniLessonCategory = 'vocabulary' | 'listening' | 'speaking' | 'reading' | 'grammar' | 'test';

export interface MiniLesson {
  id: string;
  stair_id: string;
  order: number; // 1-5
  title: string;
  description: string;
  icon: string; // emoji
  type: MiniLessonType;
  category: MiniLessonCategory; // What type of learning activity
  estimated_minutes: number;
  card_count: number;
  created_at?: string;
}

export interface UserMiniLessonProgress {
  id: string;
  user_id: string;
  mini_lesson_id: string;
  status: MiniLessonStatus;
  cards_completed: number;
  total_cards: number;
  accuracy_percentage: number;
  time_spent_seconds: number;
  xp_earned: number;
  completed_at?: string;
  started_at?: string;
}

export interface MiniLessonCard {
  id: string;
  mini_lesson_id: string;
  order: number;
  type: 'single-vocab' | 'multiple-choice' | 'image-quiz' | 'audio' | 'text-input' | 'speaking';
  content: {
    word?: string;
    translation?: string;
    image_url?: string;
    audio_url?: string;
    phonetic?: string;
    example_sentence?: string;
    options?: string[];
    correct_answer?: string | number;
  };
}

export interface CompletionStats {
  xp_earned: number;
  time_spent: string; // "4:54"
  accuracy: number; // 91
  perfect_score: boolean;
  cards_completed: number;
  cards_total: number;
}
