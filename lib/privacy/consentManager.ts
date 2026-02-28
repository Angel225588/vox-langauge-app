/**
 * Consent Manager
 *
 * Stores and checks user consent flags for privacy-sensitive features.
 * Uses AsyncStorage as local cache for fast reads and offline support.
 * Syncs to Supabase `user_consents` table for GDPR audit trail.
 *
 * Consent types:
 * - voice_recording: User agrees to microphone use + TTS processing
 * - privacy_policy: User has read and accepted privacy policy
 * - terms_of_service: User has accepted terms
 *
 * Architecture:
 * - AsyncStorage = fast path for reads, works offline
 * - Supabase = audit trail, cross-device source of truth
 * - Cloud operations are best-effort (never block on failure)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/db/supabase';

// =============================================================================
// Types
// =============================================================================

export type ConsentType = 'voice_recording' | 'privacy_policy' | 'terms_of_service';

export interface ConsentRecord {
  accepted: boolean;
  acceptedAt: string | null;
}

export interface AllConsents {
  voiceRecording: ConsentRecord;
  privacyPolicy: ConsentRecord;
  termsOfService: ConsentRecord;
}

/** Row shape from the Supabase `user_consents` table. */
export interface CloudConsentRow {
  id: string;
  user_id: string;
  consent_type: string;
  granted: boolean;
  granted_at: string | null;
  revoked_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// =============================================================================
// Constants
// =============================================================================

const CONSENT_PREFIX = 'vox_consent_';
const ALL_CONSENT_TYPES: ConsentType[] = [
  'voice_recording',
  'privacy_policy',
  'terms_of_service',
];

// =============================================================================
// Helpers
// =============================================================================

function getKey(type: ConsentType): string {
  return `${CONSENT_PREFIX}${type}`;
}

/**
 * Return the authenticated user's ID, or null if not signed in.
 * All cloud operations silently skip when there is no user.
 */
async function getAuthUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id ?? null;
  } catch {
    return null;
  }
}

// =============================================================================
// Local (AsyncStorage) Operations
// =============================================================================

async function getLocalConsentRecord(type: ConsentType): Promise<ConsentRecord> {
  try {
    const raw = await AsyncStorage.getItem(getKey(type));
    if (!raw) return { accepted: false, acceptedAt: null };
    return JSON.parse(raw);
  } catch {
    return { accepted: false, acceptedAt: null };
  }
}

async function setLocalConsentRecord(type: ConsentType, record: ConsentRecord): Promise<void> {
  await AsyncStorage.setItem(getKey(type), JSON.stringify(record));
}

async function removeLocalConsentRecords(): Promise<void> {
  await Promise.all(ALL_CONSENT_TYPES.map(type => AsyncStorage.removeItem(getKey(type))));
}

// =============================================================================
// Cloud (Supabase) Operations — best-effort, never throw
// =============================================================================

/**
 * Upsert a granted consent to Supabase.
 * Uses the UNIQUE(user_id, consent_type) constraint for conflict resolution.
 */
async function upsertCloudConsent(
  userId: string,
  type: ConsentType,
  granted: boolean,
  timestamp: string
): Promise<void> {
  try {
    const row: Record<string, unknown> = {
      user_id: userId,
      consent_type: type,
      granted,
      created_at: new Date().toISOString(),
    };

    if (granted) {
      row.granted_at = timestamp;
      row.revoked_at = null;
    } else {
      row.revoked_at = timestamp;
    }

    const { error } = await supabase
      .from('user_consents')
      .upsert(row, { onConflict: 'user_id,consent_type' });

    if (error) {
      console.warn(`[ConsentManager] Cloud upsert failed for ${type}:`, error.message);
    }
  } catch (err) {
    console.warn(`[ConsentManager] Cloud upsert error for ${type}:`, err);
  }
}

/**
 * Delete all consent rows for a user from Supabase.
 */
async function deleteCloudConsents(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_consents')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.warn('[ConsentManager] Cloud delete failed:', error.message);
    }
  } catch (err) {
    console.warn('[ConsentManager] Cloud delete error:', err);
  }
}

/**
 * Fetch all consent rows for a user from Supabase.
 */
async function fetchCloudConsents(userId: string): Promise<CloudConsentRow[]> {
  try {
    const { data, error } = await supabase
      .from('user_consents')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.warn('[ConsentManager] Cloud fetch failed:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('[ConsentManager] Cloud fetch error:', err);
    return [];
  }
}

// =============================================================================
// Core Public Functions
// =============================================================================

/**
 * Check if user has given consent for a specific type.
 * Reads from local cache (AsyncStorage) for speed.
 */
export async function hasConsent(type: ConsentType): Promise<boolean> {
  const record = await getLocalConsentRecord(type);
  return record.accepted === true;
}

/**
 * Grant consent for a specific type.
 * Saves locally (fast) then syncs to Supabase (audit trail).
 */
export async function grantConsent(type: ConsentType): Promise<void> {
  const now = new Date().toISOString();
  const record: ConsentRecord = { accepted: true, acceptedAt: now };

  // 1. Save to AsyncStorage (fast, always works)
  await setLocalConsentRecord(type, record);

  // 2. Sync to Supabase if authenticated (best-effort)
  const userId = await getAuthUserId();
  if (userId) {
    await upsertCloudConsent(userId, type, true, now);
  }
}

/**
 * Revoke consent for a specific type.
 * Updates locally then syncs revocation to Supabase.
 */
export async function revokeConsent(type: ConsentType): Promise<void> {
  const now = new Date().toISOString();
  const record: ConsentRecord = { accepted: false, acceptedAt: null };

  // 1. Update AsyncStorage
  await setLocalConsentRecord(type, record);

  // 2. Sync revocation to Supabase if authenticated
  const userId = await getAuthUserId();
  if (userId) {
    await upsertCloudConsent(userId, type, false, now);
  }
}

/**
 * Set consent for a specific type.
 * Convenience wrapper — delegates to grantConsent or revokeConsent.
 *
 * @deprecated Prefer grantConsent() / revokeConsent() for clarity.
 */
export async function setConsent(type: ConsentType, accepted: boolean): Promise<void> {
  if (accepted) {
    await grantConsent(type);
  } else {
    await revokeConsent(type);
  }
}

/**
 * Get all consent records from local cache.
 */
export async function getAllConsents(): Promise<AllConsents> {
  const [voiceRecording, privacyPolicy, termsOfService] = await Promise.all([
    getLocalConsentRecord('voice_recording'),
    getLocalConsentRecord('privacy_policy'),
    getLocalConsentRecord('terms_of_service'),
  ]);

  return { voiceRecording, privacyPolicy, termsOfService };
}

/**
 * Revoke all consents (used on account deletion).
 * Clears local records and deletes cloud records.
 */
export async function revokeAllConsents(): Promise<void> {
  // 1. Remove all local consent records
  await removeLocalConsentRecords();

  // 2. Delete cloud records if authenticated
  const userId = await getAuthUserId();
  if (userId) {
    await deleteCloudConsents(userId);
  }
}

// =============================================================================
// Cloud Sync Functions
// =============================================================================

/**
 * Sync all local consents to Supabase.
 *
 * Call this after login/signup to ensure the cloud audit trail
 * has the latest consent state from the device.
 */
export async function syncConsentsToCloud(): Promise<void> {
  const userId = await getAuthUserId();
  if (!userId) {
    console.warn('[ConsentManager] syncConsentsToCloud skipped — no authenticated user');
    return;
  }

  try {
    const localConsents = await getAllConsents();
    const entries: Array<{ type: ConsentType; record: ConsentRecord }> = [
      { type: 'voice_recording', record: localConsents.voiceRecording },
      { type: 'privacy_policy', record: localConsents.privacyPolicy },
      { type: 'terms_of_service', record: localConsents.termsOfService },
    ];

    await Promise.all(
      entries.map(({ type, record }) =>
        upsertCloudConsent(
          userId,
          type,
          record.accepted,
          record.acceptedAt || new Date().toISOString()
        )
      )
    );
  } catch (err) {
    console.warn('[ConsentManager] syncConsentsToCloud failed:', err);
  }
}

/**
 * Load consent records from Supabase and merge with local state.
 *
 * Cloud is source of truth for granted_at timestamps (audit accuracy).
 * If a consent exists in the cloud but not locally, it is written locally.
 * If a consent exists locally but not in the cloud, local state is preserved
 * (and will be synced on next syncConsentsToCloud call).
 */
export async function loadCloudConsents(): Promise<void> {
  const userId = await getAuthUserId();
  if (!userId) {
    console.warn('[ConsentManager] loadCloudConsents skipped — no authenticated user');
    return;
  }

  try {
    const cloudRows = await fetchCloudConsents(userId);
    if (cloudRows.length === 0) return;

    for (const row of cloudRows) {
      const consentType = row.consent_type as ConsentType;
      if (!ALL_CONSENT_TYPES.includes(consentType)) continue;

      const localRecord = await getLocalConsentRecord(consentType);

      // Cloud is source of truth for timestamps
      const mergedRecord: ConsentRecord = {
        accepted: row.granted,
        acceptedAt: row.granted ? (row.granted_at || localRecord.acceptedAt) : null,
      };

      await setLocalConsentRecord(consentType, mergedRecord);
    }
  } catch (err) {
    console.warn('[ConsentManager] loadCloudConsents failed:', err);
  }
}

// =============================================================================
// Cloud Data Access (for data export)
// =============================================================================

/**
 * Fetch raw consent rows from Supabase for a given user.
 * Used by dataExport to include the full audit trail in GDPR exports.
 */
export async function getCloudConsentRecords(userId: string): Promise<CloudConsentRow[]> {
  return fetchCloudConsents(userId);
}
