import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { ENV } from '@/lib/config/env';

// Validate environment on import
if (!ENV.isSupabaseConfigured) {
  throw new Error(
    'Supabase is not configured. Please check your .env file.\n' +
    'Required: EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY'
  );
}

// Try to load SecureStore — unavailable in Expo Go
let SecureStore: typeof import('expo-secure-store') | null = null;
try {
  SecureStore = require('expo-secure-store');
} catch {
  console.warn('[Auth] expo-secure-store unavailable, falling back to AsyncStorage');
}

/**
 * Secure Storage Adapter for Supabase Auth
 *
 * Uses expo-secure-store (Keychain on iOS, Keystore on Android) for
 * encrypted token storage. Falls back to AsyncStorage in Expo Go
 * or on web where SecureStore is unavailable.
 */
const SecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') return null;
    try {
      if (SecureStore) {
        return await SecureStore.getItemAsync(key);
      }
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') return;
    try {
      if (SecureStore) {
        await SecureStore.setItemAsync(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch {
      console.warn('[SecureStore] Failed to save item:', key);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') return;
    try {
      if (SecureStore) {
        await SecureStore.deleteItemAsync(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
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
