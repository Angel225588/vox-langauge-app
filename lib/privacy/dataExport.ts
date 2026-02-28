/**
 * Data Export Module
 *
 * Exports all user data as structured JSON for GDPR Article 20 compliance.
 * Collects from Supabase, AsyncStorage, and SQLite.
 */

import { supabase } from '@/lib/db/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllConsents, getCloudConsentRecords, CloudConsentRow } from './consentManager';

// =============================================================================
// Types
// =============================================================================

export interface UserDataExport {
  exportedAt: string;
  format: 'json';
  version: 1;

  account: {
    id: string;
    email: string | null;
  };

  conversations: {
    totalSessions: number;
    sessions: any[];
  };

  aiMemory: any | null;

  practiceScores: any[];

  consents: {
    voiceRecording: { accepted: boolean; acceptedAt: string | null };
    privacyPolicy: { accepted: boolean; acceptedAt: string | null };
    termsOfService: { accepted: boolean; acceptedAt: string | null };
  };

  /** Full audit trail from Supabase — includes granted_at, revoked_at timestamps. */
  consentAuditTrail: CloudConsentRow[];

  preferences: any | null;
}

// =============================================================================
// Export Function
// =============================================================================

/**
 * Export all user data as a JSON object.
 * Suitable for GDPR data portability (Article 20).
 */
export async function exportUserData(userId: string): Promise<UserDataExport> {
  // Fetch all data in parallel
  const [sessions, aiMemory, practiceScores, consents, consentAuditTrail, userInfo] = await Promise.all([
    fetchConversationSessions(userId),
    fetchAIMemory(userId),
    fetchPracticeScores(userId),
    getAllConsents(),
    getCloudConsentRecords(userId),
    fetchUserInfo(userId),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    format: 'json',
    version: 1,

    account: {
      id: userId,
      email: userInfo?.email || null,
    },

    conversations: {
      totalSessions: sessions.length,
      sessions,
    },

    aiMemory,

    practiceScores,

    consents: {
      voiceRecording: consents.voiceRecording,
      privacyPolicy: consents.privacyPolicy,
      termsOfService: consents.termsOfService,
    },

    consentAuditTrail,

    preferences: null,
  };
}

/**
 * Export user data as a JSON string (for sharing/downloading).
 */
export async function exportUserDataAsString(userId: string): Promise<string> {
  const data = await exportUserData(userId);
  return JSON.stringify(data, null, 2);
}

// =============================================================================
// Data Fetchers
// =============================================================================

async function fetchConversationSessions(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('conversation_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false });

    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

async function fetchAIMemory(userId: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('user_ai_memory')
      .select('memory_data')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;
    return data.memory_data;
  } catch {
    return null;
  }
}

async function fetchPracticeScores(userId: string): Promise<any[]> {
  try {
    const raw = await AsyncStorage.getItem(`vox_practice_scores_${userId}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function fetchUserInfo(userId: string): Promise<{ email: string | null } | null> {
  try {
    const { data } = await supabase.auth.getUser();
    return { email: data?.user?.email || null };
  } catch {
    return null;
  }
}
