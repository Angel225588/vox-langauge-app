import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { ENV } from '@/lib/config/env';

// Validate environment on import
if (!ENV.isSupabaseConfigured) {
  throw new Error(
    'Supabase is not configured. Please check your .env file.\n' +
    'Required: EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY'
  );
}

/**
 * Secure Storage Adapter for Supabase Auth
 *
 * Uses expo-secure-store (Keychain on iOS, Keystore on Android) for
 * encrypted token storage. Falls back to a no-op on web where
 * SecureStore is unavailable.
 */
const SecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') return null;
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') return;
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      console.warn('[SecureStore] Failed to save item:', key);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') return;
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      console.warn('[SecureStore] Failed to remove item:', key);
    }
  },
};

export const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
  auth: {
    storage: SecureStoreAdapter,
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
