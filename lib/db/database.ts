/**
 * Database Manager - Singleton Pattern
 *
 * Centralized database management to prevent multiple database connections
 * and handle Android/iOS quirks with proper error handling and retry logic.
 */

import * as SQLite from 'expo-sqlite';

const DB_NAME = 'vox_language.db';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Singleton database manager class
 */
class DatabaseManager {
  private static instance: DatabaseManager;
  private db: SQLite.SQLiteDatabase | null = null;
  private initPromise: Promise<SQLite.SQLiteDatabase> | null = null;
  private isInitialized = false;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Initialize database with retry logic
   */
  async initialize(): Promise<SQLite.SQLiteDatabase> {
    // If already initialized, return existing database
    if (this.isInitialized && this.db) {
      return this.db;
    }

    // If initialization is in progress, wait for it
    if (this.initPromise) {
      return this.initPromise;
    }

    // Start new initialization
    this.initPromise = this.initializeWithRetry();

    try {
      this.db = await this.initPromise;
      this.isInitialized = true;
      return this.db;
    } finally {
      this.initPromise = null;
    }
  }

  /**
   * Initialize with exponential backoff retry
   */
  private async initializeWithRetry(
    attempt = 1
  ): Promise<SQLite.SQLiteDatabase> {
    try {
      console.log(`📦 Opening database (attempt ${attempt}/${MAX_RETRIES})...`);
      const database = await SQLite.openDatabaseAsync(DB_NAME);
      console.log('✅ Database opened successfully');
      return database;
    } catch (error) {
      console.error(`❌ Database open failed (attempt ${attempt}):`, error);

      if (attempt >= MAX_RETRIES) {
        throw new Error(
          `Failed to open database after ${MAX_RETRIES} attempts: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
      console.log(`⏳ Retrying in ${delay}ms...`);
      await this.sleep(delay);

      return this.initializeWithRetry(attempt + 1);
    }
  }

  /**
   * Get database instance (must be initialized first)
   */
  async getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (!this.isInitialized || !this.db) {
      throw new Error(
        'Database not initialized. Call initialize() first from app/_layout.tsx'
      );
    }
    return this.db;
  }

  /**
   * Check if database is ready
   */
  isReady(): boolean {
    return this.isInitialized && this.db !== null;
  }

  /**
   * Close database (cleanup on app unmount)
   */
  async close(): Promise<void> {
    if (this.db) {
      try {
        await this.db.closeAsync();
        console.log('✅ Database closed');
      } catch (error) {
        console.error('❌ Error closing database:', error);
      } finally {
        this.db = null;
        this.isInitialized = false;
      }
    }
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const dbManager = DatabaseManager.getInstance();

// Export database name for reference
export { DB_NAME };
