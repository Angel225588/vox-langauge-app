/**
 * Consent Manager
 *
 * Stores and checks user consent flags for privacy-sensitive features.
 * Uses AsyncStorage for persistence. Consent is per-device.
 *
 * Consent types:
 * - voice_recording: User agrees to microphone use + TTS processing
 * - privacy_policy: User has read and accepted privacy policy
 * - terms_of_service: User has accepted terms
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

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

// =============================================================================
// Keys
// =============================================================================

const CONSENT_PREFIX = 'vox_consent_';

function getKey(type: ConsentType): string {
  return `${CONSENT_PREFIX}${type}`;
}

// =============================================================================
// Core Functions
// =============================================================================

/**
 * Check if user has given consent for a specific type.
 */
export async function hasConsent(type: ConsentType): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(getKey(type));
    if (!raw) return false;
    const record: ConsentRecord = JSON.parse(raw);
    return record.accepted === true;
  } catch {
    return false;
  }
}

/**
 * Set consent for a specific type.
 */
export async function setConsent(type: ConsentType, accepted: boolean): Promise<void> {
  const record: ConsentRecord = {
    accepted,
    acceptedAt: accepted ? new Date().toISOString() : null,
  };
  await AsyncStorage.setItem(getKey(type), JSON.stringify(record));
}

/**
 * Get all consent records.
 */
export async function getAllConsents(): Promise<AllConsents> {
  const [voiceRecording, privacyPolicy, termsOfService] = await Promise.all([
    getConsentRecord('voice_recording'),
    getConsentRecord('privacy_policy'),
    getConsentRecord('terms_of_service'),
  ]);

  return { voiceRecording, privacyPolicy, termsOfService };
}

/**
 * Revoke all consents (used on account deletion).
 */
export async function revokeAllConsents(): Promise<void> {
  const types: ConsentType[] = ['voice_recording', 'privacy_policy', 'terms_of_service'];
  await Promise.all(types.map(type => AsyncStorage.removeItem(getKey(type))));
}

// =============================================================================
// Helpers
// =============================================================================

async function getConsentRecord(type: ConsentType): Promise<ConsentRecord> {
  try {
    const raw = await AsyncStorage.getItem(getKey(type));
    if (!raw) return { accepted: false, acceptedAt: null };
    return JSON.parse(raw);
  } catch {
    return { accepted: false, acceptedAt: null };
  }
}
