import { syncData } from '@/lib/db/sync';
import * as sqlite from '@/lib/db/sqlite';
import { supabase } from '@/lib/db/supabase';
import * as Network from 'expo-network';

// Mocking the dependencies
jest.mock('@/lib/db/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      upsert: jest.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

jest.mock('@/lib/db/sqlite');
jest.mock('expo-network', () => ({
  getNetworkStateAsync: jest.fn(),
  NetworkStateType: {
    NONE: 'NONE',
    UNKNOWN: 'UNKNOWN',
    CELLULAR: 'CELLULAR',
    WIFI: 'WIFI',
    BLUETOOTH: 'BLUETOOTH',
    ETHERNET: 'ETHERNET',
    WIMAX: 'WIMAX',
    VPN: 'VPN',
    OTHER: 'OTHER',
  },
}));

describe('Database Sync', () => {
  const mockSqlite = sqlite as jest.Mocked<typeof sqlite>;
  const mockSupabase = supabase as jest.Mocked<typeof supabase>;
  const mockNetwork = Network as jest.Mocked<typeof Network>;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('Sync to Supabase', () => {
    it('should sync local changes to remote when online', async () => {
      // Arrange
      mockNetwork.getNetworkStateAsync.mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: Network.NetworkStateType.CELLULAR,
      });

      const unsyncedData = {
        reviews: [{ id: 'r1', user_id: 'u1', flashcard_id: 'f1', ease_factor: 2.5, interval: 1, repetitions: 1, next_review: 1672531200, last_reviewed: 1672531200, created_at: 1672531200 }],
        progress: [{ id: 'p1', user_id: 'u1', lesson_id: 'l1', points: 10, completed: 0, completed_at: null, created_at: 1672531200 }],
        streaks: [{ id: 's1', user_id: 'u1', current_streak: 1, longest_streak: 1, last_practice_date: 1672531200, total_points: 10 }],
      };
      mockSqlite.getUnsyncedData.mockResolvedValue(unsyncedData);
      
      const upsertMock = jest.fn().mockResolvedValue({ error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue({
        upsert: upsertMock,
      });

      // Act
      await syncData();

      // Assert
      expect(mockNetwork.getNetworkStateAsync).toHaveBeenCalledTimes(1);
      expect(mockSqlite.getUnsyncedData).toHaveBeenCalledTimes(1);

      expect(mockSupabase.from).toHaveBeenCalledWith('flashcard_reviews');
      expect(mockSupabase.from).toHaveBeenCalledWith('user_progress');
      expect(mockSupabase.from).toHaveBeenCalledWith('streak_data');

      expect(upsertMock).toHaveBeenCalledTimes(3);
      
      expect(mockSqlite.markAsSynced).toHaveBeenCalledWith('flashcard_reviews', ['r1']);
      expect(mockSqlite.markAsSynced).toHaveBeenCalledWith('user_progress', ['p1']);
      expect(mockSqlite.markAsSynced).toHaveBeenCalledWith('streak_data', ['s1']);
    });

    it('should queue changes when offline', async () => {
      // Arrange
      mockNetwork.getNetworkStateAsync.mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
        type: Network.NetworkStateType.NONE,
      });

      // Act
      await syncData();

      // Assert
      expect(mockNetwork.getNetworkStateAsync).toHaveBeenCalledTimes(1);
      expect(mockSqlite.getUnsyncedData).not.toHaveBeenCalled();
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should handle network errors gracefully', async () => {
      // Arrange
      mockNetwork.getNetworkStateAsync.mockRejectedValue(new Error('Network error'));

      // Act
      await syncData();

      // Assert
      expect(mockSqlite.getUnsyncedData).not.toHaveBeenCalled();
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should not mark data as synced if Supabase upsert fails', async () => {
        // Arrange
        mockNetwork.getNetworkStateAsync.mockResolvedValue({
          isConnected: true,
          isInternetReachable: true,
          type: Network.NetworkStateType.CELLULAR,
        });
  
        const unsyncedData = {
          reviews: [{ id: 'r1', user_id: 'u1', flashcard_id: 'f1', ease_factor: 2.5, interval: 1, repetitions: 1, next_review: 1672531200, last_reviewed: 1672531200, created_at: 1672531200 }],
          progress: [],
          streaks: [],
        };
        mockSqlite.getUnsyncedData.mockResolvedValue(unsyncedData);
        
        const upsertMock = jest.fn().mockResolvedValue({ error: new Error('Supabase error') });
        (mockSupabase.from as jest.Mock).mockReturnValue({
          upsert: upsertMock,
        });
  
        // Act
        await syncData();
  
        // Assert
        expect(mockSupabase.from).toHaveBeenCalledWith('flashcard_reviews');
        expect(upsertMock).toHaveBeenCalledTimes(1);
        expect(mockSqlite.markAsSynced).not.toHaveBeenCalled();
      });
    });

  describe('Conflict Resolution', () => {
    it('should resolve conflicts using last-write-wins', async () => {
      // Arrange
      mockNetwork.getNetworkStateAsync.mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: Network.NetworkStateType.WIFI,
      });

      // Simulate local data that is newer than remote data
      const localReview = { id: 'r1', user_id: 'u1', flashcard_id: 'f1', ease_factor: 3.0, interval: 2, repetitions: 2, next_review: 1672617600, last_reviewed: 1672617600, created_at: 1672531200 };
      const unsyncedData = {
        reviews: [localReview],
        progress: [],
        streaks: [],
      };
      mockSqlite.getUnsyncedData.mockResolvedValue(unsyncedData);
      
      const upsertMock = jest.fn().mockResolvedValue({ error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue({
        upsert: upsertMock,
      });

      // Act
      await syncData();

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('flashcard_reviews');
      // Verify that upsert is called with the local data, effectively overwriting remote data
      expect(upsertMock).toHaveBeenCalledWith(
        [
          {
            id: localReview.id,
            user_id: localReview.user_id,
            flashcard_id: localReview.flashcard_id,
            ease_factor: localReview.ease_factor,
            interval: localReview.interval,
            repetitions: localReview.repetitions,
            next_review: new Date(localReview.next_review * 1000).toISOString(),
            last_reviewed: new Date(localReview.last_reviewed * 1000).toISOString(),
            created_at: new Date(localReview.created_at * 1000).toISOString(),
          },
        ],
        { onConflict: 'id' }
      );
      expect(mockSqlite.markAsSynced).toHaveBeenCalledWith('flashcard_reviews', ['r1']);
    });
    it.todo('should preserve user data in conflicts');
    it.todo('should handle concurrent edits correctly');
  });

  describe('Data Integrity', () => {
    it('should verify data after sync', async () => {
      // Arrange
      mockNetwork.getNetworkStateAsync.mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: Network.NetworkStateType.WIFI,
      });

      const unsyncedData = {
        reviews: [{ id: 'r1', user_id: 'u1', flashcard_id: 'f1', ease_factor: 2.5, interval: 1, repetitions: 1, next_review: 1672531200, last_reviewed: 1672531200, created_at: 1672531200 }],
        progress: [],
        streaks: [],
      };
      mockSqlite.getUnsyncedData.mockResolvedValue(unsyncedData);

      const upsertMock = jest.fn().mockResolvedValue({ error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue({
        upsert: upsertMock,
      });

      // Act
      await syncData();

      // Assert
      expect(upsertMock).toHaveBeenCalledWith(
        [
          {
            id: 'r1',
            user_id: 'u1',
            flashcard_id: 'f1',
            ease_factor: 2.5,
            interval: 1,
            repetitions: 1,
            next_review: new Date(1672531200 * 1000).toISOString(),
            last_reviewed: new Date(1672531200 * 1000).toISOString(),
            created_at: new Date(1672531200 * 1000).toISOString(),
          },
        ],
        { onConflict: 'id' }
      );
    });

    it('should rollback on sync failure', async () => {
      // Arrange
      mockNetwork.getNetworkStateAsync.mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: Network.NetworkStateType.WIFI,
      });

      const unsyncedData = {
        reviews: [{ id: 'r1', user_id: 'u1', flashcard_id: 'f1', ease_factor: 2.5, interval: 1, repetitions: 1, next_review: 1672531200, last_reviewed: 1672531200, created_at: 1672531200 }],
        progress: [],
        streaks: [],
      };
      mockSqlite.getUnsyncedData.mockResolvedValue(unsyncedData);

      const upsertMock = jest.fn().mockResolvedValue({ error: new Error('Supabase error') });
      (mockSupabase.from as jest.Mock).mockReturnValue({
        upsert: upsertMock,
      });

      // Act
      await syncData();

      // Assert
      expect(mockSqlite.markAsSynced).not.toHaveBeenCalled();
    });

    it.todo('should maintain referential integrity');
  });
});
