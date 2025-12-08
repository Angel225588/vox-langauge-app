# Feature: Reading & Teleprompter System

**Created**: 2025-12-02
**Last Updated**: 2025-12-02 11:30 AM
**Owner**: Angel Polanco
**Priority**: P1
**Status**: Planned

---

## Overview

### What It Does
A teleprompter-style reading practice where users read text aloud, get pronunciation feedback on articulation (not accent), and problem words automatically flow into their Word Bank for future practice.

### Core Philosophy

> **"Confidence comes from a safe space where evolution is the reward."**

### Pre-Session Motivation Screen

Before entering the teleprompter, users see an encouraging message:

```
┌─────────────────────────────────────────┐
│                                         │
│  🎤 Ready to Practice?                  │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  "Every mistake is a step forward.      │
│   Your courage to try is what           │
│   matters most."                        │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  In this session:                       │
│  ✨ No judgment - just practice         │
│  ✨ Points for every attempt            │
│  ✨ Mistakes = Learning = Points        │
│  ✨ Your improvements are celebrated    │
│                                         │
│  [Start with Full Energy →]             │
│                                         │
└─────────────────────────────────────────┘
```

**Points Philosophy:**
- Points for TRYING (not just succeeding)
- Bonus points for improvements over previous attempts
- "Courage Points" for difficult words attempted
- No penalty for mistakes - only rewards for effort

This feature is NOT about:
- ❌ Judging accents
- ❌ Making users feel inadequate
- ❌ Perfection

This feature IS about:
- ✅ Clear articulation of each word
- ✅ Building confidence through practice
- ✅ Celebrating progress and attempts
- ✅ Creating a safe, private space to practice
- ✅ Making "getting better" feel rewarding

### Why It Matters

**Research Foundation:**
- Reading aloud improves fluency and confidence (Rasinski, 2010)
- Self-monitoring through recording increases metacognitive awareness
- Articulation practice (vs accent correction) reduces anxiety
- Personalized content increases engagement by 40%+

### Your Idea Connection
**From project-ideas.txt (#3)**:
> "Reading Skills with Teleprompter & Speech Recognition - Text displays on screen (teleprompter style) for user to read aloud. Speech recognition captures everything the user says. At the end: feedback report showing words that need work (mispronounced, hesitated, skipped). Those problem words automatically flow into the user's personal learning queue."

---

## User Stories

1. As a learner, I want to practice reading aloud in a safe, private space
2. As a learner, I want to see text scroll at my own pace (not rushed)
3. As a learner, I want feedback on my articulation, not my accent
4. As a learner, I want problem words automatically tracked for practice
5. As a learner, I want to re-record until I'm satisfied
6. As a learner, I want to optionally share my recording publicly
7. As a learner, I want to know exactly what data is being saved
8. As a learner, I want to delete all my data if I choose

---

## Technical Specification

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    READING & TELEPROMPTER SYSTEM                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐                                            │
│  │ Content Sources │                                            │
│  │                 │                                            │
│  │ • AI Stories    │                                            │
│  │ • User Stories  │────────┐                                   │
│  │ • Lesson Text   │        │                                   │
│  │ • Imported Text │        │                                   │
│  └─────────────────┘        ▼                                   │
│                    ┌─────────────────┐                          │
│                    │  TELEPROMPTER   │                          │
│                    │                 │                          │
│                    │ • Auto-scroll   │                          │
│                    │ • Speed control │                          │
│                    │ • Tap to pause  │                          │
│                    │ • Word highlight│                          │
│                    └────────┬────────┘                          │
│                             │                                    │
│              ┌──────────────┴──────────────┐                    │
│              ▼                              ▼                    │
│    ┌─────────────────┐            ┌─────────────────┐           │
│    │ VOICE RECORDING │            │ SPEECH-TO-TEXT  │           │
│    │                 │            │                 │           │
│    │ • expo-av       │            │ • Transcription │           │
│    │ • Audio file    │            │ • Word timing   │           │
│    │ • Playback      │            │ • Confidence %  │           │
│    └────────┬────────┘            └────────┬────────┘           │
│             │                              │                     │
│             └──────────────┬───────────────┘                    │
│                            ▼                                     │
│               ┌─────────────────────┐                           │
│               │ ARTICULATION ENGINE │                           │
│               │                     │                           │
│               │ Compares:           │                           │
│               │ • Expected text     │                           │
│               │ • Spoken text       │                           │
│               │                     │                           │
│               │ Detects:            │                           │
│               │ • Hesitations       │                           │
│               │ • Skipped words     │                           │
│               │ • Mispronunciations │                           │
│               │ • Long pauses       │                           │
│               └──────────┬──────────┘                           │
│                          │                                       │
│         ┌────────────────┼────────────────┐                     │
│         ▼                ▼                ▼                     │
│  ┌────────────┐  ┌────────────────┐  ┌──────────────┐          │
│  │ FEEDBACK   │  │ WORD BANK      │  │ STORAGE      │          │
│  │ REPORT     │  │ (Auto-add)     │  │              │          │
│  │            │  │                │  │ • Recording  │          │
│  │ • Score    │  │ Problem words  │  │ • Text       │          │
│  │ • Tips     │  │ with context   │  │ • Feedback   │          │
│  │ • Progress │  │ and source     │  │ • Timestamp  │          │
│  └────────────┘  └────────────────┘  └──────────────┘          │
│                                              │                   │
│                                              ▼                   │
│                                    ┌──────────────────┐         │
│                                    │ PUBLIC/PRIVATE   │         │
│                                    │ TOGGLE           │         │
│                                    │                  │         │
│                                    │ User decides     │         │
│                                    │ visibility       │         │
│                                    └──────────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Model

```typescript
// /lib/reading/types.ts

interface ReadingSession {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;

  // Content
  sourceType: 'ai_story' | 'user_story' | 'lesson' | 'imported';
  sourceId?: string;              // Reference to story/lesson
  text: string;                   // Full text that was read
  title?: string;

  // Recording
  recordingUrl?: string;          // Local file path
  recordingDurationMs: number;

  // Analysis Results
  transcription?: string;         // What speech-to-text heard
  wordsExpected: number;
  wordsSpoken: number;
  articulationScore: number;      // 0-100
  fluencyScore: number;           // 0-100 (pauses, hesitations)
  overallScore: number;           // 0-100

  // Problem Words
  problemWords: ProblemWord[];

  // User Controls
  isPublic: boolean;              // Default: false
  isDeleted: boolean;             // Soft delete

  // Feedback
  feedback: ReadingFeedback;
}

interface ProblemWord {
  word: string;
  issueType: 'skipped' | 'hesitated' | 'mispronounced' | 'repeated';
  timestamp: number;              // When in recording
  context: string;                // Surrounding sentence
  suggestion?: string;            // How to improve
  addedToWordBank: boolean;
}

interface ReadingFeedback {
  summary: string;                // "Great progress! 3 words to practice"
  strengths: string[];            // What they did well
  improvements: string[];         // Gentle suggestions
  encouragement: string;          // Motivational message
  nextSteps: string[];            // What to practice next
}

// Articulation Analysis (NOT accent judgment)
interface ArticulationAnalysis {
  // We DON'T judge:
  // - Regional accents
  // - Native accent influence
  // - Speed (within reason)

  // We DO analyze:
  wordClarity: number;            // Were words distinguishable?
  syllableCompletion: number;     // Did they finish words?
  pausePlacement: number;         // Natural pauses at punctuation?
  wordBoundaries: number;         // Clear separation between words?
}
```

### Articulation vs Accent

**CRITICAL DESIGN DECISION:**

```typescript
// What we ANALYZE (Articulation):
const articulationFactors = {
  // Did they say all syllables?
  syllableCompletion: true,

  // Were word boundaries clear?
  wordSeparation: true,

  // Did they finish words (not trail off)?
  wordCompletion: true,

  // Appropriate pauses at punctuation?
  punctuationPauses: true,

  // Consistent volume throughout?
  volumeConsistency: true,
};

// What we NEVER judge (Accent):
const neverJudge = {
  // These are NOT errors:
  regionalAccent: false,          // Spanish R, French R, etc.
  nativeInfluence: false,         // Carrying native language sounds
  intonationPattern: false,       // Different melody is OK
  vowelVariation: false,          // Different vowel sounds by region
};

// Feedback language guidelines:
const feedbackGuidelines = {
  never: [
    "Your accent is wrong",
    "That's not how natives say it",
    "You sound foreign",
  ],
  always: [
    "Try completing the full word",
    "Each syllable was clear!",
    "Great job finishing your sentences",
    "Your articulation is improving",
  ],
};
```

---

## Privacy & Data Architecture

### What We Collect

```typescript
interface CollectedData {
  // ALWAYS COLLECTED (Required for feature)
  sessionData: {
    text: string;                 // What they read
    recording: Blob;              // Audio file
    transcription: string;        // What we heard
    problemWords: string[];       // Words to practice
    scores: object;               // Performance metrics
  };

  // COLLECTED FOR PERSONALIZATION (User can opt out)
  personalizationData: {
    readingSpeed: number;         // Avg words per minute
    preferredTopics: string[];    // From story choices
    practicePatterns: object;     // When they practice
    improvementTrends: object;    // Progress over time
  };

  // NEVER COLLECTED
  neverCollected: {
    locationData: false,
    contactList: false,
    otherAppData: false,
    browsingHistory: false,
  };
}
```

### Data Storage Locations

```typescript
interface DataStorage {
  // LOCAL ONLY (Never leaves device by default)
  localOnly: {
    recordings: '/recordings/',           // Audio files
    transcriptions: 'SQLite',             // Text data
    scores: 'SQLite',                     // Performance
  };

  // SYNCED TO CLOUD (If user enables)
  cloudSync: {
    condition: 'user_opted_in',
    destination: 'Supabase (encrypted)',
    purpose: 'Cross-device access',
    userControl: 'Can disable anytime',
  };

  // SHARED WITH COMMUNITY (If user chooses public)
  public: {
    condition: 'user_explicitly_toggles_public',
    shared: ['recording', 'text', 'username'],
    notShared: ['scores', 'problem_words', 'analytics'],
  };
}
```

### Data Deletion Rights

```typescript
// User can delete ALL their data
async function deleteAllUserData(userId: string): Promise<void> {
  // 1. Delete local data
  await deleteLocalRecordings(userId);
  await deleteLocalDatabase(userId);

  // 2. Delete cloud data
  await supabase.from('reading_sessions').delete().eq('user_id', userId);
  await supabase.from('word_bank').delete().eq('user_id', userId);
  await supabase.from('user_analytics').delete().eq('user_id', userId);

  // 3. Delete from public community
  await supabase.from('public_recordings').delete().eq('user_id', userId);

  // 4. Request deletion from any third parties
  if (userUsedGoogleAuth) {
    // Note: Google may retain auth data per their policy
    // We inform user of this
  }

  // 5. Confirm deletion
  return {
    deleted: true,
    timestamp: new Date().toISOString(),
    confirmation: 'All your data has been permanently deleted.',
  };
}
```

### Transparency Dashboard

```typescript
// Show user exactly what we have
interface DataTransparencyView {
  // Your Data Summary
  summary: {
    totalRecordings: number;
    totalReadingSessions: number;
    wordsInWordBank: number;
    dataStorageUsed: string;      // "12.4 MB"
  };

  // What We Use It For
  usageExplanation: {
    recordings: "To let you replay and track progress",
    problemWords: "To create personalized practice",
    scores: "To show your improvement over time",
    patterns: "To suggest best practice times",
  };

  // Your Controls
  controls: {
    downloadAllData: () => void;   // Export everything
    deleteAllData: () => void;     // Permanent deletion
    toggleCloudSync: boolean;      // On/off
    toggleAnalytics: boolean;      // On/off
  };

  // Third Party Sharing
  thirdPartyInfo: {
    shared: "NONE - We never sell or share your data",
    googleAuth: "If you signed in with Google, Google knows you use Vox",
    analytics: "We use anonymous, aggregated data to improve the app",
  };
}
```

---

## UI/UX Design

### Teleprompter Screen

```
┌─────────────────────────────────────────┐
│ Reading Practice            [Settings]  │
│ "My Trip to Barcelona"                  │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │   Yesterday, I went to the     │   │
│  │   beautiful city of Barcelona. │   │
│  │                                 │   │
│  │   → The weather was perfect ←  │   │ ← Current line highlighted
│  │                                 │   │
│  │   and I visited the famous     │   │
│  │   Sagrada Familia cathedral.   │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Speed: [━━━━━●━━━━━] Medium            │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │    🎤 Recording... 0:42        │   │
│  │                                 │   │
│  │    [████████░░░░░░] 65%        │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [⏸️ Pause]  [⏹️ Stop & Review]         │
│                                         │
└─────────────────────────────────────────┘
```

### Results Screen

```
┌─────────────────────────────────────────┐
│ 🎉 Great Practice Session!              │
├─────────────────────────────────────────┤
│                                         │
│  Your Score: 78/100                     │
│  ████████████████████░░░░ 78%           │
│                                         │
│  ✨ Strengths:                          │
│  • Clear word boundaries                │
│  • Good pace throughout                 │
│  • Completed all sentences              │
│                                         │
│  📝 Words to Practice (3):              │
│  ┌─────────────────────────────────┐   │
│  │ cathedral  →  Added to Word Bank│   │
│  │ beautiful  →  Added to Word Bank│   │
│  │ yesterday  →  Added to Word Bank│   │
│  └─────────────────────────────────┘   │
│                                         │
│  💡 Tip: Try slowing down on longer    │
│  words like "cathedral" to articulate  │
│  each syllable: ca-THE-dral            │
│                                         │
├─────────────────────────────────────────┤
│  Share this recording?                  │
│  [🔒 Private]  ←→  [🌍 Public]          │
│                                         │
│  [▶️ Play Recording]  [🔄 Try Again]    │
│                                         │
│  [✅ Done - Save & Continue]            │
└─────────────────────────────────────────┘
```

---

## Research Foundation

### Proven Methods We're Implementing

| Method | Research | How We Use It |
|--------|----------|---------------|
| **Repeated Reading** | Samuels (1979) - Fluency improves with re-reading same text | Users can re-record until satisfied |
| **Self-Monitoring** | Rasinski (2010) - Recording self improves metacognition | Playback feature |
| **Comprehensible Input** | Krashen - i+1 level content | AI generates text at user's level |
| **Low Anxiety Environment** | Horwitz (1986) - Anxiety blocks learning | Private by default, no judgment |
| **Immediate Feedback** | Multiple studies - Quick feedback improves retention | Real-time articulation analysis |
| **Spaced Practice** | Ebbinghaus - Problem words need repetition | Auto-add to Word Bank with SRS |

### What Research Says About Accent vs Articulation

> "Intelligibility and comprehensibility are far more important than accent reduction. A learner can maintain their native accent while being perfectly understood through clear articulation."
> - Derwing & Munro (2009)

**Our Approach:**
- We measure if words are *understandable*, not if they sound "native"
- We celebrate accent as part of identity
- We focus on practical communication success

---

## Files

### Core Files (To Create)
- `/lib/reading/types.ts` - TypeScript interfaces
- `/lib/reading/teleprompter.ts` - Scroll/timing logic
- `/lib/reading/articulation-engine.ts` - Analysis logic
- `/lib/reading/storage.ts` - Data management
- `/lib/reading/privacy.ts` - Data controls

### Components (To Create)
- `/components/reading/TeleprompterView.tsx` - Main reader
- `/components/reading/RecordingControls.tsx` - Record/stop
- `/components/reading/ResultsCard.tsx` - Feedback display
- `/components/reading/PrivacyToggle.tsx` - Public/private
- `/components/reading/DataDashboard.tsx` - Transparency view

### Screens (To Create)
- `/app/reading/index.tsx` - Reading home
- `/app/reading/session.tsx` - Active reading
- `/app/reading/results.tsx` - Post-session feedback
- `/app/settings/privacy.tsx` - Data controls

---

## Implementation Status

### Done
- [x] Concept defined
- [x] Privacy architecture designed
- [x] Research foundation documented

### TODO
- [ ] Create teleprompter component
- [ ] Implement speech-to-text integration
- [ ] Build articulation analysis engine
- [ ] Create results/feedback UI
- [ ] Implement Word Bank integration
- [ ] Build privacy dashboard
- [ ] Add public/private toggle
- [ ] Test full flow

---

## Dependencies

### Requires
- [ ] Speech-to-text API (Google/Whisper)
- [ ] Word Bank system (for auto-add)
- [ ] Audio recording (expo-av - already have)

### Required By
- [ ] Storytelling Flow (feeds into teleprompter)
- [ ] Community Features (public recordings)

---

## Changelog

### 2025-12-02
- Initial documentation created
- Privacy architecture defined
- Research foundation added
- Articulation vs accent philosophy documented
