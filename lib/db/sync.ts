import { supabase } from '@/lib/db/supabase';
import { getUnsyncedData, markAsSynced } from '@/lib/db/sqlite';
import * as Network from 'expo-network';

export async function syncData() {
  try {
    const state = await Network.getNetworkStateAsync();
    if (!state.isConnected || !state.isInternetReachable) {
      console.log('Offline: Skipping sync.');
      return;
    }
  } catch (error) {
    console.error('Failed to get network state:', error);
    return;
  }

  console.log('Starting data sync...');

  try {
    const { reviews, progress, streaks } = await getUnsyncedData();

    // Sync Flashcard Reviews
    if (reviews.length > 0) {
      console.log(`Syncing ${reviews.length} flashcard reviews...`);
      const { error } = await supabase.from('flashcard_reviews').upsert(reviews.map(review => ({
        id: review.id,
        user_id: review.user_id,
        flashcard_id: review.flashcard_id,
        ease_factor: review.ease_factor,
        interval: review.interval,
        repetitions: review.repetitions,
        next_review: new Date(review.next_review * 1000).toISOString(),
        last_reviewed: new Date(review.last_reviewed * 1000).toISOString(),
        created_at: new Date(review.created_at * 1000).toISOString(),
      })), { onConflict: 'id' }); // Assuming 'id' is the primary key for conflict resolution

      if (error) {
        console.error('Error syncing flashcard reviews:', error);
      } else {
        await markAsSynced('flashcard_reviews', reviews.map(r => r.id));
        console.log('Flashcard reviews synced successfully.');
      }
    }

    // Sync User Progress
    if (progress.length > 0) {
      console.log(`Syncing ${progress.length} user progress entries...`);
      const { error } = await supabase.from('user_progress').upsert(progress.map(p => ({
        id: p.id,
        user_id: p.user_id,
        lesson_id: p.lesson_id,
        points: p.points,
        completed: p.completed,
        completed_at: p.completed_at ? new Date(p.completed_at * 1000).toISOString() : null,
        created_at: new Date(p.created_at * 1000).toISOString(),
      })), { onConflict: 'id' });

      if (error) {
        console.error('Error syncing user progress:', error);
      } else {
        await markAsSynced('user_progress', progress.map(p => p.id));
        console.log('User progress synced successfully.');
      }
    }

    // Sync Streak Data
    // Note: Supabase's streak_data table likely uses user_id as primary key,
    // so we need to handle upsert carefully, or fetch existing and update.
    // For now, assuming direct upsert is fine if the structure allows.
    if (streaks.length > 0) {
      console.log(`Syncing ${streaks.length} streak data entries...`);
      for (const streak of streaks) {
        const { error } = await supabase.from('streak_data').upsert({
          user_id: streak.user_id,
          current_streak: streak.current_streak,
          longest_streak: streak.longest_streak,
          last_practice_date: streak.last_practice_date ? new Date(streak.last_practice_date * 1000).toISOString() : null,
          total_points: streak.total_points,
        }, { onConflict: 'user_id' }); // Assuming user_id is the primary key here

        if (error) {
          console.error(`Error syncing streak data for user ${streak.user_id}:`, error);
        } else {
          await markAsSynced('streak_data', [streak.id]); // Mark as synced using SQLite's ID
          console.log(`Streak data for user ${streak.user_id} synced successfully.`);
        }
      }
    }

    console.log('Data sync completed.');
  } catch (error) {
    console.error('Unhandled error during data sync:', error);
  }
}


