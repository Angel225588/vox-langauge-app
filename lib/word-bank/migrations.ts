/**
 * Word Bank Migration System
 *
 * Handles database schema versioning and migrations for the word_bank table.
 * Ensures safe, incremental schema updates across app versions.
 */

import * as SQLite from 'expo-sqlite';
import {
  CREATE_WORD_BANK_TABLE,
  CREATE_INDEXES,
  WORD_BANK_TABLE,
} from './schema';

// ============================================================================
// MIGRATION VERSION TRACKING
// ============================================================================

const MIGRATION_TABLE = 'word_bank_migrations';
const CURRENT_VERSION = 1;

/**
 * Migration metadata
 */
interface Migration {
  version: number;
  name: string;
  up: (db: SQLite.SQLiteDatabase) => Promise<void>;
  down?: (db: SQLite.SQLiteDatabase) => Promise<void>;
}

/**
 * Migration history entry
 */
interface MigrationRecord {
  version: number;
  name: string;
  applied_at: string;
}

// ============================================================================
// MIGRATION TABLE SETUP
// ============================================================================

/**
 * Create migration tracking table
 */
async function createMigrationTable(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS ${MIGRATION_TABLE} (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);
}

/**
 * Get current migration version
 */
async function getCurrentVersion(
  db: SQLite.SQLiteDatabase
): Promise<number> {
  try {
    const result = await db.getFirstAsync<{ version: number }>(
      `SELECT MAX(version) as version FROM ${MIGRATION_TABLE};`
    );
    return result?.version ?? 0;
  } catch (error) {
    // Table doesn't exist yet
    return 0;
  }
}

/**
 * Record a migration as applied
 */
async function recordMigration(
  db: SQLite.SQLiteDatabase,
  version: number,
  name: string
): Promise<void> {
  const timestamp = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO ${MIGRATION_TABLE} (version, name, applied_at)
     VALUES (?, ?, ?);`,
    [version, name, timestamp]
  );
}

/**
 * Remove migration record (for rollback)
 */
async function removeMigrationRecord(
  db: SQLite.SQLiteDatabase,
  version: number
): Promise<void> {
  await db.runAsync(
    `DELETE FROM ${MIGRATION_TABLE} WHERE version = ?;`,
    [version]
  );
}

/**
 * Get all applied migrations
 */
export async function getAppliedMigrations(
  db: SQLite.SQLiteDatabase
): Promise<MigrationRecord[]> {
  try {
    const rows = await db.getAllAsync<MigrationRecord>(
      `SELECT version, name, applied_at
       FROM ${MIGRATION_TABLE}
       ORDER BY version ASC;`
    );
    return rows || [];
  } catch (error) {
    return [];
  }
}

// ============================================================================
// MIGRATION DEFINITIONS
// ============================================================================

/**
 * V1 - Initial schema
 * Creates word_bank table with full SM-2 spaced repetition support
 */
const migration_v1: Migration = {
  version: 1,
  name: 'initial_word_bank_schema',

  async up(db: SQLite.SQLiteDatabase) {
    console.log('Running migration v1: Initial word_bank schema');

    // Create main table
    await db.execAsync(CREATE_WORD_BANK_TABLE);
    console.log('  Created word_bank table');

    // Create all indexes
    for (const indexSQL of CREATE_INDEXES) {
      await db.execAsync(indexSQL);
    }
    console.log(`  Created ${CREATE_INDEXES.length} indexes`);
  },

  async down(db: SQLite.SQLiteDatabase) {
    console.log('Rolling back migration v1');
    await db.execAsync(`DROP TABLE IF EXISTS ${WORD_BANK_TABLE};`);
  },
};

/**
 * V2 - Example future migration (template)
 * Uncomment and modify when needed
 */
/*
const migration_v2: Migration = {
  version: 2,
  name: 'add_column_example',

  async up(db: SQLite.SQLiteDatabase) {
    console.log('Running migration v2: Add new column');
    await db.execAsync(`
      ALTER TABLE ${WORD_BANK_TABLE}
      ADD COLUMN new_field TEXT DEFAULT NULL;
    `);
  },

  async down(db: SQLite.SQLiteDatabase) {
    console.log('Rolling back migration v2');
    // SQLite doesn't support DROP COLUMN easily
    // Would need to recreate table without the column
  },
};
*/

/**
 * All migrations in order
 */
const MIGRATIONS: Migration[] = [
  migration_v1,
  // migration_v2, // Add future migrations here
];

// ============================================================================
// MIGRATION RUNNER
// ============================================================================

/**
 * Run all pending migrations
 */
export async function runMigrations(
  db: SQLite.SQLiteDatabase
): Promise<void> {
  try {
    console.log('Starting Word Bank migrations...');

    // Ensure migration table exists
    await createMigrationTable(db);

    // Get current version
    const currentVersion = await getCurrentVersion(db);
    console.log(`Current database version: ${currentVersion}`);

    // Find pending migrations
    const pendingMigrations = MIGRATIONS.filter(
      (m) => m.version > currentVersion
    );

    if (pendingMigrations.length === 0) {
      console.log('No pending migrations - database is up to date');
      return;
    }

    console.log(`Found ${pendingMigrations.length} pending migration(s)`);

    // Run each migration in order
    for (const migration of pendingMigrations) {
      console.log(
        `Applying migration v${migration.version}: ${migration.name}`
      );

      try {
        // Run migration
        await migration.up(db);

        // Record success
        await recordMigration(db, migration.version, migration.name);

        console.log(
          `  Migration v${migration.version} applied successfully`
        );
      } catch (error) {
        console.error(
          `Migration v${migration.version} failed:`,
          error
        );
        throw new Error(
          `Migration v${migration.version} (${migration.name}) failed: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    }

    console.log(
      `All migrations completed successfully. Database version: ${CURRENT_VERSION}`
    );
  } catch (error) {
    console.error('Migration process failed:', error);
    throw error;
  }
}

/**
 * Rollback to a specific version
 * WARNING: This may cause data loss!
 */
export async function rollbackToVersion(
  db: SQLite.SQLiteDatabase,
  targetVersion: number
): Promise<void> {
  try {
    console.warn(`Rolling back to version ${targetVersion}...`);

    const currentVersion = await getCurrentVersion(db);

    if (targetVersion >= currentVersion) {
      console.log('Target version is current or newer - nothing to rollback');
      return;
    }

    // Get migrations to rollback (in reverse order)
    const migrationsToRollback = MIGRATIONS.filter(
      (m) => m.version > targetVersion && m.version <= currentVersion
    ).reverse();

    if (migrationsToRollback.length === 0) {
      console.log('No migrations to rollback');
      return;
    }

    console.warn(
      `Rolling back ${migrationsToRollback.length} migration(s) - DATA MAY BE LOST`
    );

    for (const migration of migrationsToRollback) {
      if (!migration.down) {
        throw new Error(
          `Migration v${migration.version} has no rollback function`
        );
      }

      console.log(`Rolling back v${migration.version}: ${migration.name}`);

      try {
        await migration.down(db);
        await removeMigrationRecord(db, migration.version);
        console.log(`  v${migration.version} rolled back successfully`);
      } catch (error) {
        console.error(
          `Rollback of v${migration.version} failed:`,
          error
        );
        throw error;
      }
    }

    console.log(`Rollback complete. Database version: ${targetVersion}`);
  } catch (error) {
    console.error('Rollback process failed:', error);
    throw error;
  }
}

/**
 * Reset database - drop everything and start fresh
 * WARNING: This deletes ALL data!
 */
export async function resetDatabase(
  db: SQLite.SQLiteDatabase
): Promise<void> {
  try {
    console.warn('RESETTING DATABASE - ALL DATA WILL BE LOST');

    // Drop word bank table
    await db.execAsync(`DROP TABLE IF EXISTS ${WORD_BANK_TABLE};`);
    console.log('  Dropped word_bank table');

    // Drop migration table
    await db.execAsync(`DROP TABLE IF EXISTS ${MIGRATION_TABLE};`);
    console.log('  Dropped migration table');

    // Run migrations from scratch
    await runMigrations(db);

    console.log('Database reset complete');
  } catch (error) {
    console.error('Database reset failed:', error);
    throw error;
  }
}

/**
 * Check if database needs migration
 */
export async function needsMigration(
  db: SQLite.SQLiteDatabase
): Promise<boolean> {
  try {
    await createMigrationTable(db);
    const currentVersion = await getCurrentVersion(db);
    return currentVersion < CURRENT_VERSION;
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
}

/**
 * Get migration status information
 */
export async function getMigrationStatus(db: SQLite.SQLiteDatabase): Promise<{
  currentVersion: number;
  latestVersion: number;
  needsMigration: boolean;
  appliedMigrations: MigrationRecord[];
}> {
  await createMigrationTable(db);
  const currentVersion = await getCurrentVersion(db);
  const appliedMigrations = await getAppliedMigrations(db);

  return {
    currentVersion,
    latestVersion: CURRENT_VERSION,
    needsMigration: currentVersion < CURRENT_VERSION,
    appliedMigrations,
  };
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Initialize word bank database (run migrations if needed)
 * Call this on app startup
 */
export async function initializeWordBankDatabase(
  db: SQLite.SQLiteDatabase
): Promise<void> {
  try {
    console.log('Initializing Word Bank database...');

    // Run any pending migrations
    await runMigrations(db);

    console.log('Word Bank database ready');
  } catch (error) {
    console.error('Failed to initialize Word Bank database:', error);
    throw error;
  }
}

/**
 * Print migration status to console (for debugging)
 */
export async function printMigrationStatus(
  db: SQLite.SQLiteDatabase
): Promise<void> {
  const status = await getMigrationStatus(db);

  console.log('\n=== Word Bank Migration Status ===');
  console.log(`Current Version: ${status.currentVersion}`);
  console.log(`Latest Version:  ${status.latestVersion}`);
  console.log(`Needs Migration: ${status.needsMigration ? 'YES' : 'NO'}`);
  console.log('\nApplied Migrations:');

  if (status.appliedMigrations.length === 0) {
    console.log('  (none)');
  } else {
    status.appliedMigrations.forEach((m) => {
      console.log(`  v${m.version} - ${m.name} (${m.applied_at})`);
    });
  }

  console.log('==================================\n');
}
