# Vox Language App - Offline-First Architecture

## Philosophy

**"Learn anywhere, sync everywhere"**

Users should be able to practice and learn even without internet connection. Poor connectivity shouldn't block progress.

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│              User Interface                  │
│         (React Native Components)            │
└──────────────┬─────────────────────┬────────┘
               │                     │
               ▼                     ▼
┌──────────────────────┐  ┌──────────────────────┐
│   React Query        │  │    Zustand           │
│   (Data Layer)       │  │    (Global State)    │
│   + Persistence      │  │                      │
└──────────┬───────────┘  └──────────────────────┘
           │
           ▼
┌───────────────────────────────────────────────┐
│           Offline-First Data Flow             │
│                                               │
│  ┌──────────────┐         ┌───────────────┐  │
│  │   SQLite     │◄───────►│   Supabase    │  │
│  │  (Primary)   │  Sync   │   (Backup)    │  │
│  │              │         │               │  │
│  │ - Lessons    │         │ - Lessons     │  │
│  │ - Flashcards │         │ - Flashcards  │  │
│  │ - Progress   │         │ - Progress    │  │
│  │ - Reviews    │         │ - Reviews     │  │
│  └──────────────┘         └───────────────┘  │
└───────────────────────────────────────────────┘
           │
           ▼
┌───────────────────────────────────────────────┐
│        File System (expo-file-system)         │
│                                               │
│  /documentDirectory/                          │
│    ├── images/                                │
│    │   ├── lesson_1_apple.jpg                 │
│    │   └── lesson_1_bread.jpg                 │
│    ├── audio/                                 │
│    │   ├── apple_pronunciation.mp3            │
│    │   └── bread_pronunciation.mp3            │
│    └── recordings/                            │
│        ├── user_reading_1.m4a                 │
│        └── user_practice_2.m4a                │
└───────────────────────────────────────────────┘
```

## Data Flow Strategy

### 1. Read Operations (Offline-First)

```typescript
// Priority: Local → Remote → Cache

async function getData(id: string) {
  // 1. Try local SQLite first
  const localData = await db.getFirstAsync('SELECT * FROM items WHERE id = ?', [id]);

  if (localData) {
    return localData; // Return immediately
  }

  // 2. If not found and online, fetch from Supabase
  if (isOnline) {
    const { data } = await supabase.from('items').select('*').eq('id', id).single();

    if (data) {
      // 3. Save to local for future offline use
      await db.runAsync('INSERT OR REPLACE INTO items VALUES (?, ?)', [id, JSON.stringify(data)]);
      return data;
    }
  }

  return null; // Not found
}
```

### 2. Write Operations (Queue & Sync)

```typescript
// Strategy: Write locally, sync when online

async function saveData(data: any) {
  // 1. Save to local SQLite immediately
  await db.runAsync(
    'INSERT INTO items (id, data, synced) VALUES (?, ?, 0)',
    [data.id, JSON.stringify(data), 0] // synced = 0 (not synced yet)
  );

  // 2. If online, sync immediately
  if (isOnline) {
    await syncToSupabase();
  } else {
    // 3. If offline, queue for later sync
    console.log('Queued for sync when online');
  }
}
```

### 3. Network Change Detection

```typescript
import NetInfo from '@react-native-community/netinfo';

// Monitor network status
NetInfo.addEventListener(state => {
  const isConnected = state.isConnected && state.isInternetReachable;

  if (isConnected && !wasConnected) {
    // Just came online - sync pending changes
    syncPendingData();
    downloadPendingContent();
  }

  wasConnected = isConnected;
});
```

## Preload System

### When to Preload

1. **On App Start** (if online):
   - Download next 5 lessons
   - Download media for upcoming flashcards
   - Fetch updated leaderboard

2. **After Lesson Completion** (if online):
   - Download next lesson
   - Preload media for next session

3. **Background Fetch** (periodic, when online):
   - Check for new content
   - Download updates
   - Sync user progress

### What to Preload

```typescript
// lib/offline/preload.ts

export async function preloadLessons(userId: string, count: number = 5) {
  if (!isOnline) return;

  // 1. Fetch next lessons from Supabase
  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .eq('target_language', userLanguage)
    .gte('sequence', nextSequence)
    .order('sequence')
    .limit(count);

  for (const lesson of lessons) {
    // 2. Save lesson to local DB
    await db.runAsync(
      'INSERT OR REPLACE INTO lessons (id, title, category, content, downloaded_at) VALUES (?, ?, ?, ?, ?)',
      [lesson.id, lesson.title, lesson.category, JSON.stringify(lesson.content), Date.now()]
    );

    // 3. Download flashcards for this lesson
    const { data: flashcards } = await supabase
      .from('flashcards')
      .select('*')
      .eq('lesson_id', lesson.id);

    for (const card of flashcards) {
      // 4. Save flashcard to local DB
      await db.runAsync(
        'INSERT OR REPLACE INTO flashcards VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [card.id, card.lesson_id, card.front_text, card.back_text, card.image_url, card.audio_url, card.phonetics, JSON.stringify(card.examples), card.category]
      );

      // 5. Download images
      if (card.image_url) {
        const localPath = await downloadMedia(card.image_url, 'images');
        await db.runAsync(
          'UPDATE flashcards SET local_image_path = ? WHERE id = ?',
          [localPath, card.id]
        );
      }

      // 6. Download audio
      if (card.audio_url) {
        const localPath = await downloadMedia(card.audio_url, 'audio');
        await db.runAsync(
          'UPDATE flashcards SET local_audio_path = ? WHERE id = ?',
          [localPath, card.id]
        );
      }
    }
  }

  console.log(`Preloaded ${count} lessons with media`);
}
```

### Media Download Helper

```typescript
async function downloadMedia(url: string, type: 'images' | 'audio'): Promise<string> {
  const filename = url.split('/').pop() || `${Date.now()}`;
  const localPath = `${FileSystem.documentDirectory}${type}/${filename}`;

  try {
    // Check if already downloaded
    const info = await FileSystem.getInfoAsync(localPath);
    if (info.exists) {
      return localPath;
    }

    // Download
    const { uri } = await FileSystem.downloadAsync(url, localPath);

    // Track download
    await db.runAsync(
      'INSERT INTO downloaded_media (id, url, local_path, type, size, downloaded_at) VALUES (?, ?, ?, ?, ?, ?)',
      [filename, url, uri, type, info.size || 0, Date.now()]
    );

    return uri;
  } catch (error) {
    console.error('Failed to download media:', error);
    return url; // Fall back to remote URL
  }
}
```

## Sync System

### Sync Strategy

**When to Sync:**
1. App comes online after being offline
2. After completing a lesson/session
3. Periodically (every 5 minutes if online)
4. User manually triggers (pull to refresh)

**What to Sync:**
1. Flashcard reviews (spaced repetition data)
2. User progress (completed lessons, points)
3. Streak data
4. Audio recordings (if user wants to share)

### Sync Implementation

```typescript
// lib/offline/sync.ts

export async function syncToSupabase() {
  if (!isOnline) {
    console.log('Cannot sync: offline');
    return;
  }

  try {
    // 1. Get unsynced data
    const unsyncedReviews = await db.getAllAsync(
      'SELECT * FROM flashcard_reviews WHERE synced = 0'
    );

    const unsyncedProgress = await db.getAllAsync(
      'SELECT * FROM user_progress WHERE synced = 0'
    );

    const unsyncedStreaks = await db.getAllAsync(
      'SELECT * FROM streak_data WHERE synced = 0'
    );

    // 2. Sync flashcard reviews
    for (const review of unsyncedReviews) {
      await supabase
        .from('flashcard_reviews')
        .upsert({
          user_id: review.user_id,
          flashcard_id: review.flashcard_id,
          ease_factor: review.ease_factor,
          interval: review.interval,
          repetitions: review.repetitions,
          next_review: new Date(review.next_review * 1000).toISOString(),
          last_reviewed: review.last_reviewed ? new Date(review.last_reviewed * 1000).toISOString() : null,
        });

      // Mark as synced
      await db.runAsync(
        'UPDATE flashcard_reviews SET synced = 1 WHERE id = ?',
        [review.id]
      );
    }

    // 3. Sync user progress
    for (const progress of unsyncedProgress) {
      await supabase
        .from('user_progress')
        .upsert({
          user_id: progress.user_id,
          lesson_id: progress.lesson_id,
          points: progress.points,
          completed: progress.completed === 1,
          completed_at: progress.completed_at ? new Date(progress.completed_at * 1000).toISOString() : null,
        });

      await db.runAsync(
        'UPDATE user_progress SET synced = 1 WHERE id = ?',
        [progress.id]
      );
    }

    // 4. Sync streak data
    for (const streak of unsyncedStreaks) {
      // Update leaderboard
      await supabase.rpc('update_leaderboard');

      await db.runAsync(
        'UPDATE streak_data SET synced = 1 WHERE user_id = ?',
        [streak.user_id]
      );
    }

    console.log('Sync complete');
  } catch (error) {
    console.error('Sync failed:', error);
    // Don't mark as synced, will retry later
  }
}
```

### Conflict Resolution

**Strategy: Last Write Wins (LWW)**

```typescript
// When syncing, check timestamps
async function syncWithConflictResolution(localData: any) {
  const { data: remoteData } = await supabase
    .from('items')
    .select('*, updated_at')
    .eq('id', localData.id)
    .single();

  if (!remoteData) {
    // Not on server, upload local
    await supabase.from('items').insert(localData);
  } else {
    const localTimestamp = localData.updated_at;
    const remoteTimestamp = new Date(remoteData.updated_at).getTime();

    if (localTimestamp > remoteTimestamp) {
      // Local is newer, update server
      await supabase.from('items').update(localData).eq('id', localData.id);
    } else {
      // Remote is newer, update local
      await db.runAsync(
        'UPDATE items SET data = ?, updated_at = ? WHERE id = ?',
        [JSON.stringify(remoteData), remoteTimestamp, localData.id]
      );
    }
  }
}
```

## Storage Management

### Disk Space Monitoring

```typescript
// Check available storage
async function checkStorageSpace() {
  const { totalSize, availableSize } = await FileSystem.getFreeDiskStorageAsync();

  const usedPercentage = ((totalSize - availableSize) / totalSize) * 100;

  if (usedPercentage > 90) {
    // Warn user about low storage
    // Offer to clean old lessons
    return 'low';
  }

  return 'ok';
}
```

### Cleanup Strategy

```typescript
// Clean old downloaded content
async function cleanupOldContent() {
  // 1. Find lessons not accessed in 30 days
  const oldLessons = await db.getAllAsync(
    'SELECT id FROM lessons WHERE downloaded_at < ?',
    [Date.now() - (30 * 24 * 60 * 60 * 1000)]
  );

  for (const lesson of oldLessons) {
    // 2. Delete associated media
    const flashcards = await db.getAllAsync(
      'SELECT local_image_path, local_audio_path FROM flashcards WHERE lesson_id = ?',
      [lesson.id]
    );

    for (const card of flashcards) {
      if (card.local_image_path) {
        await FileSystem.deleteAsync(card.local_image_path, { idempotent: true });
      }
      if (card.local_audio_path) {
        await FileSystem.deleteAsync(card.local_audio_path, { idempotent: true });
      }
    }

    // 3. Delete from database
    await db.runAsync('DELETE FROM flashcards WHERE lesson_id = ?', [lesson.id]);
    await db.runAsync('DELETE FROM lessons WHERE id = ?', [lesson.id]);
  }

  console.log(`Cleaned up ${oldLessons.length} old lessons`);
}
```

## Offline UI Indicators

### Network Status Banner

```typescript
// Show banner when offline
export function OfflineBanner() {
  const isOnline = useNetworkStatus();

  if (isOnline) return null;

  return (
    <View className="bg-yellow-500 p-2">
      <Text className="text-center text-white">
        📡 You're offline. Some features are limited.
      </Text>
    </View>
  );
}
```

### Sync Status Indicator

```typescript
// Show sync status
export function SyncIndicator() {
  const { isSyncing, lastSyncTime } = useSyncStatus();

  if (isSyncing) {
    return <Text>🔄 Syncing...</Text>;
  }

  return <Text>✓ Synced {formatTimeAgo(lastSyncTime)}</Text>;
}
```

## React Query Configuration

### Offline-First Setup

```typescript
// lib/react-query.ts
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
      networkMode: 'offlineFirst', // Try cache first
      retry: 3,
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});

// Persist query cache
const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

persistQueryClient({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
});
```

## Testing Offline Functionality

### Manual Testing Checklist

- [ ] Turn off WiFi and cellular
- [ ] Launch app → should work
- [ ] Review flashcards → should work
- [ ] Complete lesson → should work
- [ ] View home screen → should show cached data
- [ ] Try to view leaderboard → should show "offline" message
- [ ] Try to generate new AI story → should show "online required"
- [ ] Turn on network → should auto-sync
- [ ] Verify synced data appears on server

### Network Simulation (Development)

```typescript
// For testing, simulate offline mode
if (__DEV__) {
  // Force offline mode
  // NetInfo.configure({ reachabilityUrl: 'http://localhost:9999' });
}
```

## Performance Considerations

### Database Indexing

```sql
-- Critical indexes for fast queries
CREATE INDEX idx_flashcard_reviews_next_review ON flashcard_reviews(next_review);
CREATE INDEX idx_flashcard_reviews_user_id ON flashcard_reviews(user_id);
CREATE INDEX idx_flashcards_lesson_id ON flashcards(lesson_id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
```

### Batch Operations

```typescript
// Instead of individual inserts, use transactions
await db.withTransactionAsync(async () => {
  for (const card of flashcards) {
    await db.runAsync('INSERT INTO flashcards VALUES (...)', [...]);
  }
});
```

### Lazy Loading Media

```typescript
// Load images on demand, not all at once
<Image
  source={{ uri: card.local_image_path || card.image_url }}
  onError={() => {
    // Fallback to remote if local is corrupted
    setImageUri(card.image_url);
  }}
/>
```

## Future Improvements

1. **Delta Sync**: Only sync changed fields, not entire records
2. **Compression**: Compress media before storing locally
3. **Smart Preload**: ML-based prediction of what user will study next
4. **P2P Sync**: Sync between user's own devices via Bluetooth
5. **Incremental Sync**: Sync in background without blocking UI

---

**Last Updated**: 2025-11-19
**Related Docs**: `claude.md`, `database-schema.sql`
