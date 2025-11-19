import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types (will be generated from Supabase)
export interface Profile {
  id: string;
  username: string;
  target_language: string;
  level: string;
  interests: string[];
  created_at: string;
}

export interface Lesson {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  sequence: number;
  content: any;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  points: number;
  completed: boolean;
  completed_at?: string;
  streak_count: number;
  last_practice_date?: string;
  created_at: string;
}

export interface Flashcard {
  id: string;
  lesson_id: string;
  front_text: string;
  back_text: string;
  image_url?: string;
  audio_url?: string;
  phonetics?: string;
  examples?: string[];
  category: string;
  created_at: string;
}

export interface FlashcardReview {
  id: string;
  user_id: string;
  flashcard_id: string;
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review: string;
  last_reviewed?: string;
  created_at: string;
}
