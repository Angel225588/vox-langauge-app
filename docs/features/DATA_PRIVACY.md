# Feature: Data Privacy & Transparency

**Created**: 2025-12-02
**Last Updated**: 2025-12-02 12:15 PM
**Owner**: Angel Polanco
**Priority**: P0 (Core Principle)
**Status**: Design Complete

---

## Overview

### Core Commitment

> **"Your data is YOURS. We're just helping you learn."**

Vox Language is built on a foundation of radical transparency. Users always know:
- What data we collect
- Why we collect it
- Where it's stored
- Who can see it
- How to delete it

### Why This Matters

- Trust is essential for language learning (users share their voice, mistakes, personal stories)
- GDPR/CCPA compliance is legally required
- Differentiation from competitors who exploit user data
- Users who trust the app practice more

---

## Data Collection Summary

### What We Collect

| Data Type | Purpose | Stored Where | User Control |
|-----------|---------|--------------|--------------|
| **Voice Recordings** | Playback, feedback | Local + Cloud (opt-in) | Delete anytime |
| **Written Text** | Stories, answers | Local + Cloud (opt-in) | Delete anytime |
| **Progress Scores** | Track improvement | Local + Cloud (opt-in) | Delete anytime |
| **Problem Words** | Personalized practice | Word Bank | Remove words |
| **Usage Patterns** | Suggest practice times | Local only | Opt-out |
| **App Crashes** | Fix bugs | Anonymous only | - |

### What We NEVER Collect

| Data Type | Why Not |
|-----------|---------|
| Location (GPS) | Not needed for learning |
| Contacts | Not relevant |
| Photos (except imported) | Not needed |
| Other app usage | Privacy violation |
| Browsing history | Not relevant |
| Biometric data | Not needed |

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATA FLOW ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  USER DEVICE (Primary Storage)                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │  SQLite Database                                          │  │
│  │  ├── word_bank                                            │  │
│  │  ├── reading_sessions                                     │  │
│  │  ├── stories                                              │  │
│  │  ├── conversation_history                                 │  │
│  │  └── progress_data                                        │  │
│  │                                                           │  │
│  │  Local Files                                              │  │
│  │  └── /recordings/ (audio files)                          │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              │ ONLY IF USER ENABLES SYNC         │
│                              ▼                                   │
│  CLOUD (Supabase - Encrypted)                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │  Purpose: Cross-device access, backup                     │  │
│  │                                                           │  │
│  │  Stored (encrypted):                                      │  │
│  │  • Progress data                                          │  │
│  │  • Word bank                                              │  │
│  │  • Stories (user's own)                                   │  │
│  │  • Recordings (if user enables)                           │  │
│  │                                                           │  │
│  │  Row Level Security (RLS):                                │  │
│  │  • Users can ONLY access their own data                   │  │
│  │  • No admin access without explicit request               │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              │ ONLY IF USER CHOOSES PUBLIC       │
│                              ▼                                   │
│  COMMUNITY (Public Content)                                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │  Shared (by user's explicit choice):                      │  │
│  │  • Recording (audio)                                      │  │
│  │  • Story text                                             │  │
│  │  • Display name                                           │  │
│  │                                                           │  │
│  │  NEVER shared:                                            │  │
│  │  • Scores                                                 │  │
│  │  • Problem words                                          │  │
│  │  • Practice patterns                                      │  │
│  │  • Personal analytics                                     │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## User Controls

### Privacy Dashboard

```typescript
interface PrivacyDashboard {
  // Data Summary
  dataSummary: {
    totalRecordings: number;
    totalStories: number;
    wordsInBank: number;
    conversationSessions: number;
    storageUsed: string;          // "45.2 MB"
    cloudSyncEnabled: boolean;
    publicItemsCount: number;
  };

  // Controls
  controls: {
    // Cloud Sync
    toggleCloudSync: (enabled: boolean) => void;

    // Analytics
    toggleAnalytics: (enabled: boolean) => void;

    // Public Content
    makeAllPrivate: () => void;

    // Data Export
    downloadAllData: () => Promise<DataExport>;

    // Data Deletion
    deleteAllData: () => Promise<DeletionConfirmation>;

    // Selective Deletion
    deleteRecordings: () => Promise<void>;
    deleteStories: () => Promise<void>;
    deleteWordBank: () => Promise<void>;
    deleteConversations: () => Promise<void>;
  };
}
```

### Data Export Format

```typescript
interface DataExport {
  exportedAt: string;
  format: 'json';

  user: {
    id: string;
    email: string;
    createdAt: string;
  };

  wordBank: BankWord[];

  readingSessions: {
    id: string;
    text: string;
    recordingFile: string;      // Included in ZIP
    scores: object;
    problemWords: string[];
    createdAt: string;
  }[];

  stories: {
    id: string;
    rawInput: string;
    finalVersion: string;
    recordingFile: string;
    isPublic: boolean;
    createdAt: string;
  }[];

  conversations: {
    id: string;
    messages: object[];
    wordsUsed: string[];
    createdAt: string;
  }[];

  analytics: {
    totalPracticeTime: number;
    sessionsCompleted: number;
    averageScore: number;
  };
}
```

### Data Deletion Flow

```typescript
async function deleteAllUserData(userId: string): Promise<DeletionResult> {
  // Step 1: Confirm with user
  const confirmed = await showConfirmationDialog({
    title: "Delete All Data?",
    message: `
      This will permanently delete:
      • ${stats.recordings} recordings
      • ${stats.stories} stories
      • ${stats.words} words in your Word Bank
      • ${stats.conversations} conversation sessions
      • All your progress and scores

      This action CANNOT be undone.
    `,
    confirmText: "Yes, Delete Everything",
    cancelText: "Cancel",
  });

  if (!confirmed) return { deleted: false };

  // Step 2: Delete local data
  await SQLite.deleteAllUserData(userId);
  await FileSystem.deleteDirectory(`/recordings/${userId}`);

  // Step 3: Delete cloud data (if synced)
  if (cloudSyncEnabled) {
    await supabase.from('word_bank').delete().eq('user_id', userId);
    await supabase.from('reading_sessions').delete().eq('user_id', userId);
    await supabase.from('stories').delete().eq('user_id', userId);
    await supabase.from('conversations').delete().eq('user_id', userId);
    await supabase.from('user_progress').delete().eq('user_id', userId);
    await supabase.storage.from('recordings').remove([`${userId}/*`]);
  }

  // Step 4: Delete public content
  await supabase.from('public_recordings').delete().eq('user_id', userId);
  await supabase.from('public_stories').delete().eq('user_id', userId);

  // Step 5: Log deletion (for compliance)
  await logDeletionEvent(userId, new Date());

  // Step 6: Confirm to user
  return {
    deleted: true,
    timestamp: new Date().toISOString(),
    message: "All your data has been permanently deleted.",
  };
}
```

---

## Third-Party Considerations

### Google Sign-In

```typescript
const googleAuthDisclosure = `
When you sign in with Google:

GOOGLE KNOWS:
• That you use Vox Language
• When you log in
• Basic account info (name, email)

GOOGLE DOES NOT KNOW:
• Your learning progress
• Your recordings
• Your stories
• What you practice

VOX DOES NOT SHARE:
• Any learning data with Google
• Any usage patterns with Google
• Any content you create with Google

To revoke Google's access:
1. Go to myaccount.google.com
2. Security → Third-party apps
3. Remove Vox Language
`;
```

### Analytics (If Implemented)

```typescript
const analyticsPolicy = {
  // What we track (anonymous, aggregated)
  tracked: [
    "App crashes (to fix bugs)",
    "Feature usage counts (to improve app)",
    "Session lengths (to understand engagement)",
  ],

  // What we NEVER track
  neverTracked: [
    "Individual user behavior",
    "Content of recordings",
    "Content of stories",
    "Personal vocabulary",
    "Scores or performance",
  ],

  // User control
  userControl: {
    optOut: true,                // Users can disable
    defaultState: "opt-in",      // Can change based on region
    granular: false,             // All or nothing for simplicity
  },
};
```

---

## UI Screens

### Privacy Dashboard

```
┌─────────────────────────────────────────┐
│ ← Settings                              │
│                                         │
│ 🔒 Privacy & Data                       │
├─────────────────────────────────────────┤
│                                         │
│ YOUR DATA SUMMARY                       │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                         │
│ 🎤 Recordings: 23                       │
│ 📖 Stories: 5                           │
│ 📚 Words in Bank: 342                   │
│ 💬 AI Conversations: 12                 │
│                                         │
│ 💾 Storage Used: 45.2 MB                │
│                                         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                         │
│ SYNC & STORAGE                          │
│                                         │
│ Cloud Sync                    [●━━━━━]  │
│ Backup data to access on other devices  │
│                                         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                         │
│ PUBLIC CONTENT                          │
│                                         │
│ 3 items are currently public            │
│ [View Public Items]                     │
│ [Make All Private]                      │
│                                         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                         │
│ YOUR DATA RIGHTS                        │
│                                         │
│ [📥 Download All My Data]               │
│                                         │
│ [🗑️ Delete All My Data]                 │
│ ⚠️ This cannot be undone               │
│                                         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                         │
│ WHAT WE COLLECT & WHY                   │
│                                         │
│ [📄 View Full Privacy Policy]           │
│                                         │
└─────────────────────────────────────────┘
```

### First-Time Consent Screen

```
┌─────────────────────────────────────────┐
│                                         │
│ 🔒 Your Privacy Matters                │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│ Before you start, here's how we         │
│ handle your data:                       │
│                                         │
│ ✅ YOUR DATA STAYS YOURS                │
│ • Recordings saved on your device       │
│ • Stories are private by default        │
│ • You choose what to share              │
│                                         │
│ ✅ WE NEVER SELL YOUR DATA              │
│ • No advertising                        │
│ • No data brokers                       │
│ • No third-party sharing                │
│                                         │
│ ✅ YOU'RE IN CONTROL                    │
│ • Download your data anytime            │
│ • Delete everything anytime             │
│ • Change privacy settings anytime       │
│                                         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                         │
│ Optional: Enable cloud sync?            │
│ (Access your progress on any device)    │
│                                         │
│ [Skip for Now]    [Enable Sync]         │
│                                         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                         │
│           [Continue to App →]           │
│                                         │
│ By continuing, you agree to our         │
│ [Terms of Service] & [Privacy Policy]   │
│                                         │
└─────────────────────────────────────────┘
```

---

## Implementation Checklist

### Required for Launch
- [ ] Privacy dashboard screen
- [ ] Data export functionality
- [ ] Data deletion functionality
- [ ] Consent flow for new users
- [ ] Privacy policy document
- [ ] Terms of service document

### Technical Requirements
- [ ] Supabase RLS policies for user isolation
- [ ] Local encryption for sensitive data
- [ ] Secure file storage for recordings
- [ ] Audit logging for data access
- [ ] GDPR-compliant deletion (30-day retention for backups)

---

## Changelog

### 2025-12-02
- Initial privacy architecture designed
- Data flow documented
- User controls specified
- UI mockups created
