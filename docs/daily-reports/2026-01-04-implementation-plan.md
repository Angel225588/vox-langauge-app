# Implementation Plan: Voice Conversation System Polish
**Date**: 2026-01-04
**Goal**: Prepare app for first real user test

---

## Priority Matrix

### P0 - Critical for First Test (Do First)

| Task | Effort | Impact | Notes |
|------|--------|--------|-------|
| 1. Verify ElevenLabs voices | 30 min | Critical | Need actual voice IDs from dashboard |
| 2. Fix avatar name mismatch | 15 min | High | CharacterVoice name ≠ ElevenLabs agent name |
| 3. Connect onboarding → scenarios | 2-3 hrs | Critical | Scenarios must match user goals |

### P1 - Important for Quality (Do Second)

| Task | Effort | Impact | Notes |
|------|--------|--------|-------|
| 4. Transcript as separate page | 1-2 hrs | High | Better UX for reviewing conversations |
| 5. Deep feedback system | 3-4 hrs | Critical | Real practice partner feedback |

---

## Detailed Implementation Plan

### 1. Verify ElevenLabs Voice Configuration (P0)

**File**: `lib/voice/elevenLabsConfig.ts`

**Current State**: All voice IDs are `REPLACE_WITH_ACTUAL_ID`

**Action Required**:
1. User needs to provide voice IDs from ElevenLabs dashboard for:
   - **English**: At least 1 voice (Sarah or Michael)
   - **Spanish**: At least 1 voice (Lucía or Carlos)
   - **French**: At least 1 voice (Marie or Thomas)

2. Update the config with actual IDs:
```typescript
// Example - User needs to provide these
{
  id: 'en-US-sarah',
  name: 'Sarah',
  elevenLabsVoiceId: 'actual_id_from_dashboard',  // <-- Replace
  ...
}
```

**User Action**:
- Go to ElevenLabs dashboard
- Copy voice IDs for selected voices
- Provide them for me to update the config

---

### 2. Fix Avatar Name to Match Voice Agent (P0)

**Problem**: The avatar shows character name (e.g., "María") but ElevenLabs agent might have different name.

**Files to Update**:
- `lib/voice/scenarios.ts` - Character definitions
- `components/cards/VoiceCallScreenElevenLabs.tsx` - Avatar display

**Solution Options**:

**Option A**: Sync character names with ElevenLabs agents
- Update `scenarios.ts` character names to match ElevenLabs agent names
- Simplest approach if we control both sides

**Option B**: Pass character name dynamically to ElevenLabs
- Modify the system prompt to include character name
- More flexible but requires API changes

**Recommendation**: Option A - Sync the names in our data

---

### 3. Connect Onboarding Goals to Scenario Selection (P0)

**Current Onboarding Data** (from `useOnboardingV2.ts`):
```typescript
interface OnboardingV2Data {
  target_language: string;      // 'es', 'en', 'fr'
  motivation: string;           // 'travel', 'career', 'education', 'love', 'relocation', 'challenge'
  proficiency_level: string;    // 'beginner', 'elementary', 'intermediate', 'upper_intermediate', 'advanced'
  timeline: string;             // '1-3_months', '3-6_months', '6-12_months', 'no_deadline'
}
```

**Current Scenarios** (from `scenarios.ts`):
```typescript
// Spanish scenarios exist for: greeting-basic, cafe-order, directions-basic, shopping-market, restaurant-dining, job-interview
// Categories: social, food, travel, shopping, professional
```

**Implementation Plan**:

1. **Create motivation-to-category mapping**:
```typescript
const MOTIVATION_CATEGORIES = {
  travel: ['travel', 'food', 'social'],           // Directions, ordering, meeting people
  career: ['professional', 'social'],              // Job interviews, networking
  education: ['social', 'professional'],           // Academic settings
  love: ['social', 'food'],                        // Dating, casual conversation
  relocation: ['travel', 'shopping', 'social'],    // Daily life scenarios
  challenge: ['travel', 'food', 'social'],         // Variety
};
```

2. **Create new file**: `lib/voice/scenarioMatcher.ts`
```typescript
export function getScenariosForUser(onboardingData: OnboardingV2Data): VoiceScenario[] {
  // 1. Filter by language
  // 2. Filter by proficiency level (difficulty)
  // 3. Prioritize by motivation categories
  // 4. Return sorted list
}
```

3. **Update `voice-conversation.tsx`**:
- Load onboarding data
- Use scenarioMatcher to get personalized scenarios
- Show most relevant scenarios first

---

### 4. Transcript as Separate Scrollable Page (P1)

**Current**: Toggle collapse in PostCallFeedbackScreen
**Desired**: Separate full-screen page

**New Files**:
- `components/cards/TranscriptPage.tsx`

**Implementation**:

```typescript
// TranscriptPage.tsx
interface TranscriptPageProps {
  messages: ConversationMessage[];
  scenarioTitle: string;
  duration: number;
  onClose: () => void;
}

// Features:
// - Full-screen modal
// - Message bubbles with proper styling
// - Scroll to any point in conversation
// - Close button (X) or swipe down to dismiss
// - Optional: Export/share transcript
```

**Update PostCallFeedbackScreen**:
- Replace toggle with button: "View Full Transcript →"
- On press, navigate to TranscriptPage

---

### 5. Deep Feedback System (P1)

**Current**: Basic skill cards with placeholder metrics
**Desired**: Real practice partner feedback

**Architecture**:

```
PostCallFeedbackScreen
├── Success Animation
├── Quick Summary Card
│   ├── Duration
│   ├── Messages exchanged
│   └── Overall performance indicator
├── "View Full Transcript" Button → TranscriptPage
├── Key Highlights Section (clickable)
│   └── Opens → DetailedFeedbackPage
└── Action Buttons
    ├── Practice Weak Words
    ├── Try Again
    └── Continue
```

**New File**: `components/cards/DetailedFeedbackPage.tsx`

```typescript
interface DetailedFeedbackPageProps {
  // Positive feedback
  positives: FeedbackItem[];

  // Areas to improve
  improvements: FeedbackItem[];

  // Tips and tricks
  tips: TipItem[];

  onClose: () => void;
}

interface FeedbackItem {
  title: string;
  description: string;
  examples?: string[];  // From the actual conversation
  severity?: 'minor' | 'moderate' | 'major';
}

interface TipItem {
  title: string;
  description: string;
  vocabulary?: string[];  // Simple words to help understand
}
```

**Feedback Categories**:

1. **Positives** (What they did well):
   - Correct vocabulary usage
   - Natural flow of conversation
   - Appropriate politeness level
   - Good pronunciation (if detectable)
   - Completed objectives

2. **Improvements** (What to work on):
   - Grammar mistakes with corrections
   - Vocabulary gaps
   - Unnatural phrasing
   - Missed opportunities
   - Pronunciation issues

3. **Tips & Tricks**:
   - Simple vocabulary explanations
   - Cultural context
   - Memory techniques
   - Common patterns to practice

**AI Analysis Integration**:
- After conversation ends, send transcript to Gemini for analysis
- Generate structured feedback
- Store for user to review

---

## Execution Order

### Session 1: P0 Tasks (Today)
1. [ ] Get voice IDs from user
2. [ ] Update `elevenLabsConfig.ts` with real IDs
3. [ ] Fix avatar name sync
4. [ ] Create `scenarioMatcher.ts`
5. [ ] Connect onboarding to voice-conversation

### Session 2: P1 Tasks
1. [ ] Build TranscriptPage component
2. [ ] Update PostCallFeedbackScreen
3. [ ] Build DetailedFeedbackPage component
4. [ ] Integrate AI analysis for feedback generation

---

## Questions for User

1. **Voice IDs**: Can you provide the ElevenLabs voice IDs you've selected for:
   - English voice(s)?
   - Spanish voice(s)?
   - French voice(s)?

2. **Agent Names**: What names are your ElevenLabs agents configured with? We need to match them to our character data.

3. **Priority**: Should I start with voice configuration (blocking for test) or the onboarding-scenario connection?
