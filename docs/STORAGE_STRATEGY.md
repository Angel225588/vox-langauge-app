# Storage Strategy - Vox Language App

**Last Updated**: 2025-11-20
**Status**: 📦 Three-Tier Architecture
**Priority**: HIGH - Foundation for offline-first approach

---

## 🎯 Storage Philosophy

Vox Language uses a **three-tier storage strategy** optimized for different data types:

1. **React Native MMKV** - Lightning-fast key-value storage
2. **SQLite** - Structured relational data with complex queries
3. **React Native Encrypted Storage** - Sensitive credentials and tokens

Each storage layer serves a specific purpose, chosen based on **access patterns, performance requirements, and security needs**.

---

## 📊 Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
├──────────────────┬─────────────────┬────────────────────────┤
│                  │                 │                        │
│   MMKV Layer     │  SQLite Layer   │  Encrypted Layer      │
│   (Key-Value)    │  (Relational)   │  (Secure)             │
│                  │                 │                        │
│  • User prefs    │  • Flashcards   │  • Auth tokens        │
│  • Session data  │  • Progress     │  • API keys           │
│  • UI state      │  • Reviews      │  • User credentials   │
│  • Cache flags   │  • Lessons      │  • Sensitive PII      │
│  • Temp data     │  • AI chat log  │                       │
│                  │  • Categories   │                       │
│                  │                 │                        │
│  Speed: ~30x     │  Speed: Normal  │  Speed: Moderate      │
│  faster than     │  relational DB  │  encrypted I/O        │
│  AsyncStorage    │                 │                        │
│                  │                 │                        │
└──────────────────┴─────────────────┴────────────────────────┘
                            │
                            │ Sync Layer
                            ↓
                    ┌───────────────┐
                    │   Supabase    │
                    │  (Cloud Sync) │
                    └───────────────┘
```

---

## 🚀 Tier 1: React Native MMKV

### Overview:
**React Native MMKV** is an ultra-fast key-value storage library (30x faster than AsyncStorage). Perfect for frequently accessed, simple data that doesn't require complex queries.

### When to Use MMKV:
- ✅ User preferences (theme, language, notifications)
- ✅ Session state (current lesson, active streak)
- ✅ UI state (last visited tab, scroll position)
- ✅ Temporary flags (onboarding completed, feature announcements seen)
- ✅ Performance-critical data (app launch config)
- ✅ Cache invalidation flags

### Data Types:
- **Primitives**: strings, numbers, booleans
- **Simple Objects**: JSON-serialized (small objects only)
- **Binary Data**: Small blobs (icons, small images)

### Example Usage:

```typescript
// lib/storage/mmkv.ts
import { MMKV } from 'react-native-mmkv';

// Initialize MMKV instance
export const storage = new MMKV({
  id: 'vox-language-app',
  encryptionKey: 'your-encryption-key', // Optional: encrypt all data
});

// Wrapper functions for type safety
export const mmkvStorage = {
  // Get value
  getString: (key: string): string | undefined => storage.getString(key),
  getNumber: (key: string): number | undefined => storage.getNumber(key),
  getBoolean: (key: string): boolean | undefined => storage.getBoolean(key),

  // Set value
  setString: (key: string, value: string) => storage.set(key, value),
  setNumber: (key: string, value: number) => storage.set(key, value),
  setBoolean: (key: string, value: boolean) => storage.set(key, value),

  // JSON objects
  getObject: <T>(key: string): T | undefined => {
    const jsonString = storage.getString(key);
    return jsonString ? JSON.parse(jsonString) : undefined;
  },
  setObject: <T>(key: string, value: T) => {
    storage.set(key, JSON.stringify(value));
  },

  // Delete
  delete: (key: string) => storage.delete(key),

  // Clear all (use with caution!)
  clearAll: () => storage.clearAll(),
};

// Constants for keys (prevent typos)
export const MMKV_KEYS = {
  // User Preferences
  USER_THEME: 'user_theme', // 'dark' | 'light' | 'system'
  USER_LANGUAGE: 'user_language', // 'en' | 'es' | 'fr' etc.
  TARGET_LANGUAGE: 'target_language',
  NATIVE_LANGUAGE: 'native_language',

  // Session State
  CURRENT_STREAK: 'current_streak',
  LAST_PRACTICE_DATE: 'last_practice_date',
  TOTAL_POINTS: 'total_points',
  CURRENT_LESSON_ID: 'current_lesson_id',

  // UI State
  LAST_VISITED_TAB: 'last_visited_tab',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  FEATURE_ANNOUNCEMENTS_SEEN: 'feature_announcements_seen',

  // Performance
  APP_LAUNCH_COUNT: 'app_launch_count',
  LAST_SYNC_TIMESTAMP: 'last_sync_timestamp',

  // Cache Flags
  FLASHCARDS_CACHE_VALID: 'flashcards_cache_valid',
  LESSONS_CACHE_VALID: 'lessons_cache_valid',
};
```

### Practical Examples:

```typescript
// Get user's theme preference
const theme = mmkvStorage.getString(MMKV_KEYS.USER_THEME) || 'dark';

// Update streak
const currentStreak = mmkvStorage.getNumber(MMKV_KEYS.CURRENT_STREAK) || 0;
mmkvStorage.setNumber(MMKV_KEYS.CURRENT_STREAK, currentStreak + 1);

// Store complex object (small only!)
interface UserPreferences {
  notifications: boolean;
  soundEffects: boolean;
  hapticFeedback: boolean;
}
mmkvStorage.setObject<UserPreferences>('user_prefs', {
  notifications: true,
  soundEffects: false,
  hapticFeedback: true,
});
```

### Migration from AsyncStorage:

```typescript
// lib/storage/migrate-to-mmkv.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mmkvStorage, MMKV_KEYS } from './mmkv';

export async function migrateAsyncStorageToMMKV() {
  try {
    // Get all keys from AsyncStorage
    const keys = await AsyncStorage.getAllKeys();

    // Migrate each key
    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        mmkvStorage.setString(key, value);
      }
    }

    // Clear AsyncStorage after successful migration
    await AsyncStorage.clear();
    console.log('✅ Migrated AsyncStorage to MMKV');
  } catch (error) {
    console.error('❌ AsyncStorage migration failed:', error);
  }
}
```

---

## 💾 Tier 2: SQLite (expo-sqlite)

### Overview:
**SQLite** is perfect for structured, relational data that requires complex queries, joins, and transactions. Our primary offline database.

### When to Use SQLite:
- ✅ Flashcards and vocabulary
- ✅ User progress tracking (SM-2 spaced repetition data)
- ✅ Review sessions and history
- ✅ Lessons and categories
- ✅ AI conversation logs
- ✅ Game scores and achievements
- ✅ Any data that needs filtering, sorting, or aggregation

### Database Architecture:

**See**: `/lib/db/flashcards.ts` and `/lib/db/database.ts` for implementation.

**Key Tables**:
- `flashcards` - Vocabulary words
- `user_flashcard_progress` - SM-2 algorithm data
- `review_sessions` - Practice session history
- `flashcard_reviews` - Individual review records
- `ai_conversations` - Chat history with AI tutor
- `ai_content_cache` - Cached AI-generated content

### Singleton Pattern:

```typescript
// lib/db/database.ts (already implemented!)
import { dbManager } from '@/lib/db/database';

// Initialize once in app/_layout.tsx
await dbManager.initialize();

// Use throughout the app
const db = await dbManager.getDatabase();
const flashcards = await db.getAllAsync('SELECT * FROM flashcards LIMIT 10');
```

### Performance Optimizations:
- **Indexes**: Created on frequently queried columns
- **Batch Inserts**: Use transactions for multiple inserts
- **Prepared Statements**: Reuse compiled queries
- **Connection Pooling**: Singleton pattern prevents multiple connections
- **Lazy Loading**: Only query data when needed

### Example Queries:

```typescript
// Complex query with joins
const flashcardsWithProgress = await db.getAllAsync(`
  SELECT
    f.*,
    p.ease_factor,
    p.next_review,
    p.total_reviews
  FROM flashcards f
  LEFT JOIN user_flashcard_progress p
    ON f.id = p.flashcard_id AND p.user_id = ?
  WHERE p.next_review <= ? OR p.next_review IS NULL
  ORDER BY p.next_review ASC NULLS FIRST
  LIMIT ?
`, [userId, now, limit]);

// Aggregation query
const stats = await db.getFirstAsync(`
  SELECT
    COUNT(*) as total_reviews,
    AVG(quality) as avg_quality,
    SUM(CASE WHEN quality >= 4 THEN 1 ELSE 0 END) as correct_count
  FROM flashcard_reviews
  WHERE user_id = ? AND DATE(reviewed_at) = DATE('now')
`, [userId]);
```

---

## 🔐 Tier 3: React Native Encrypted Storage

### Overview:
**React Native Encrypted Storage** provides secure, encrypted storage for sensitive data. Uses iOS Keychain and Android Keystore under the hood.

### When to Use Encrypted Storage:
- ✅ Authentication tokens (JWT, refresh tokens)
- ✅ API keys (Supabase, Gemini)
- ✅ User credentials (if stored locally)
- ✅ Sensitive PII (personally identifiable information)
- ✅ Payment information (if applicable)
- ⚠️ **Never** store passwords in plain text!

### Installation:

```bash
npm install react-native-encrypted-storage
```

### Usage:

```typescript
// lib/storage/secure.ts
import EncryptedStorage from 'react-native-encrypted-storage';

export const secureStorage = {
  // Store encrypted data
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await EncryptedStorage.setItem(key, value);
    } catch (error) {
      console.error('Secure storage set error:', error);
      throw error;
    }
  },

  // Retrieve encrypted data
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await EncryptedStorage.getItem(key);
    } catch (error) {
      console.error('Secure storage get error:', error);
      return null;
    }
  },

  // Remove encrypted data
  removeItem: async (key: string): Promise<void> => {
    try {
      await EncryptedStorage.removeItem(key);
    } catch (error) {
      console.error('Secure storage remove error:', error);
    }
  },

  // Clear all secure data
  clear: async (): Promise<void> => {
    try {
      await EncryptedStorage.clear();
    } catch (error) {
      console.error('Secure storage clear error:', error);
    }
  },
};

// Constants for secure keys
export const SECURE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  SUPABASE_SESSION: 'supabase_session',
  USER_CREDENTIALS: 'user_credentials', // If needed
};
```

### Example Usage:

```typescript
// Store auth token after login
await secureStorage.setItem(SECURE_KEYS.AUTH_TOKEN, token);

// Retrieve token for API calls
const token = await secureStorage.getItem(SECURE_KEYS.AUTH_TOKEN);

// Clear on logout
await secureStorage.removeItem(SECURE_KEYS.AUTH_TOKEN);
await secureStorage.removeItem(SECURE_KEYS.REFRESH_TOKEN);
```

---

## 🔄 Sync Strategy (Offline-First)

### Philosophy:
**Local-first, sync when online.** All data operations happen locally first, then sync to Supabase when internet is available.

### Sync Flow:

```
User Action → Local Storage (SQLite/MMKV) → Success Response
                     ↓
              [Queue for Sync]
                     ↓
              Check Network Status
                     ↓
          Online? → Sync to Supabase
                     ↓
              Update Local State
```

### Implementation:

```typescript
// lib/sync/sync-manager.ts
import NetInfo from '@react-native-community/netinfo';
import { dbManager } from '@/lib/db/database';
import { supabase } from '@/lib/db/supabase';

interface SyncQueue {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  data: any;
  timestamp: Date;
}

export const syncManager = {
  // Queue item for sync
  queueSync: async (item: Omit<SyncQueue, 'id' | 'timestamp'>) => {
    const db = await dbManager.getDatabase();
    await db.runAsync(
      `INSERT INTO sync_queue (id, table_name, operation, data, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [
        `sync_${Date.now()}`,
        item.table,
        item.operation,
        JSON.stringify(item.data),
        new Date().toISOString(),
      ]
    );
  },

  // Process sync queue
  processQueue: async () => {
    // Check network status
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      console.log('⏸️  Offline - skipping sync');
      return;
    }

    const db = await dbManager.getDatabase();
    const queue = await db.getAllAsync<SyncQueue>(
      'SELECT * FROM sync_queue ORDER BY created_at ASC LIMIT 50'
    );

    for (const item of queue) {
      try {
        // Sync to Supabase based on operation
        if (item.operation === 'insert') {
          await supabase.from(item.table).insert(JSON.parse(item.data));
        } else if (item.operation === 'update') {
          const data = JSON.parse(item.data);
          await supabase.from(item.table).update(data).eq('id', data.id);
        } else if (item.operation === 'delete') {
          const data = JSON.parse(item.data);
          await supabase.from(item.table).delete().eq('id', data.id);
        }

        // Remove from queue after successful sync
        await db.runAsync('DELETE FROM sync_queue WHERE id = ?', [item.id]);
        console.log(`✅ Synced ${item.operation} on ${item.table}`);
      } catch (error) {
        console.error(`❌ Sync failed for ${item.id}:`, error);
        // Leave in queue, will retry next sync
      }
    }
  },

  // Auto-sync on network change
  startAutoSync: () => {
    NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        console.log('🌐 Online - processing sync queue');
        syncManager.processQueue();
      }
    });
  },
};
```

### Conflict Resolution:
- **Last Write Wins**: Latest timestamp wins in conflicts
- **User Data Priority**: Local user changes always take precedence
- **Merge Strategy**: Some data (like points) can be additive

---

## 📦 Data Migration Strategy

### Version Management:

```typescript
// lib/storage/migrations.ts
import { dbManager } from '@/lib/db/database';
import { mmkvStorage, MMKV_KEYS } from '@/lib/storage/mmkv';

const CURRENT_DB_VERSION = 3;

export async function runMigrations() {
  const db = await dbManager.getDatabase();
  const currentVersion = mmkvStorage.getNumber('db_version') || 0;

  if (currentVersion < 1) {
    // Migration 1: Add AI conversations table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS ai_conversations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        message_role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
    mmkvStorage.setNumber('db_version', 1);
  }

  if (currentVersion < 2) {
    // Migration 2: Add indexes
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_conversations_user
      ON ai_conversations(user_id, created_at DESC);
    `);
    mmkvStorage.setNumber('db_version', 2);
  }

  if (currentVersion < 3) {
    // Migration 3: Add sync queue table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        table_name TEXT NOT NULL,
        operation TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
    mmkvStorage.setNumber('db_version', 3);
  }

  console.log(`✅ Database migrated to version ${CURRENT_DB_VERSION}`);
}
```

---

## 🎯 Best Practices

### DO's:
- ✅ Use MMKV for simple, frequently accessed data
- ✅ Use SQLite for complex, relational data
- ✅ Use Encrypted Storage for sensitive credentials
- ✅ Always handle errors gracefully
- ✅ Test offline scenarios extensively
- ✅ Batch database operations in transactions
- ✅ Create indexes on frequently queried columns
- ✅ Use singleton pattern for database connections

### DON'Ts:
- ❌ Don't store large objects in MMKV (use SQLite)
- ❌ Don't store sensitive data in MMKV unencrypted
- ❌ Don't use AsyncStorage (use MMKV instead)
- ❌ Don't open multiple database connections
- ❌ Don't store plaintext passwords anywhere
- ❌ Don't forget to handle sync conflicts
- ❌ Don't assume network is always available

---

## 📊 Storage Comparison Table

| Feature | MMKV | SQLite | Encrypted Storage |
|---------|------|--------|-------------------|
| **Speed** | ⚡⚡⚡ Ultra-fast | ⚡⚡ Fast | ⚡ Moderate |
| **Data Type** | Key-Value | Relational | Key-Value |
| **Queries** | ❌ No | ✅ Yes (SQL) | ❌ No |
| **Security** | ⚠️ Optional | ⚠️ None | ✅ Encrypted |
| **Size Limit** | ~100MB | ~GB | ~10KB |
| **Use Case** | Prefs, cache | Structured data | Credentials |
| **Complexity** | Low | Medium | Low |
| **Offline** | ✅ Always | ✅ Always | ✅ Always |

---

## 🚀 Implementation Checklist

- [x] ✅ SQLite implemented with singleton pattern (`/lib/db/database.ts`)
- [ ] ⏳ Install React Native MMKV
- [ ] ⏳ Migrate AsyncStorage keys to MMKV
- [ ] ⏳ Install React Native Encrypted Storage
- [ ] ⏳ Move auth tokens to encrypted storage
- [ ] ⏳ Create sync queue table in SQLite
- [ ] ⏳ Implement sync manager with NetInfo
- [ ] ⏳ Add database migrations system
- [ ] ⏳ Test offline scenarios thoroughly

---

**Created by**: Claude Code
**Date**: 2025-11-20
**Status**: 📦 Architecture Defined - Ready for MMKV Migration
**Next Steps**: Install MMKV and migrate AsyncStorage usage

---

**See Also**:
- `/docs/CLAUDE.md` - Main project reference
- `/docs/GEMINI_API_INTEGRATION.md` - AI features using storage
- `/lib/db/database.ts` - SQLite singleton implementation
