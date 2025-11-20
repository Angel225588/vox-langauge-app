import { useState, useEffect } from 'react';

export interface ProgressData {
  streak: number;
  totalPoints: number;
  todayStats: {
    flashcardsReviewed: number;
    gamesCompleted: number;
    practiceMinutes: number;
  };
  nextLesson: {
    id: string;
    title: string;
    category: string;
    emoji: string;
    progress: number; // 0-100
    newWords: number;
    games: number;
  };
  recentStories: Array<{
    id: string;
    title: string;
    readingTime: number; // minutes
    thumbnail: string;
  }>;
}

// Mock data for demo purposes
// TODO: Replace with actual API calls to Supabase
export function useProgress(userId?: string) {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setData({
        streak: 7,
        totalPoints: 245,
        todayStats: {
          flashcardsReviewed: 15,
          gamesCompleted: 2,
          practiceMinutes: 10,
        },
        nextLesson: {
          id: 'lesson-1',
          title: 'Food & Dining',
          category: 'food',
          emoji: '🍽️',
          progress: 40,
          newWords: 5,
          games: 3,
        },
        recentStories: [
          {
            id: 'story-1',
            title: 'A Day at the Restaurant',
            readingTime: 5,
            thumbnail: '🍕',
          },
          {
            id: 'story-2',
            title: 'Shopping for Groceries',
            readingTime: 4,
            thumbnail: '🛒',
          },
        ],
      });
      setLoading(false);
    }, 500);
  }, [userId]);

  return { data, loading };
}
