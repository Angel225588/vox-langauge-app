# Feature: AI Conversation Partner

**Created**: 2025-12-02
**Last Updated**: 2025-12-02 10:45 AM
**Owner**: Angel Polanco
**Priority**: P0
**Status**: Planned

---

## Overview

### What It Does
Loora-style AI conversation agent where users practice speaking with an AI tutor. Has credit system (10 min free/day), progress bar, judgment-free corrections, and adapts to user's vocabulary and goals.

### Why It Matters
- Research: AI conversation partners reduce speaking anxiety by 19%
- Research: #1 most requested feature (75% of Reddit discussions)
- Research: 5-10 second hint delay improves learning outcomes
- Competitive gap: No app does judgment-free AI conversation well

### Your Idea Connection
**From project-ideas.txt (#2)**:
> "There is this app call loora that is an AI agent with you can talk to and it will answer you and make you some questions. This is with a limited credits and a progress bar, so the users know that'll finish and is not unlimited. We can implement similar, taylor to each student and what they want to accomplished."

---

## User Stories

1. As a learner, I want to practice speaking without fear of judgment
2. As a learner, I want the AI to wait before giving hints (not rush me)
3. As a learner, I want corrections that feel supportive, not critical
4. As a learner, I want to see how many minutes I have left today
5. As a learner, I want conversations relevant to my learning goals
6. As a learner, I want both voice and text input options

---

## Technical Specification

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  AI CONVERSATION SYSTEM                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐         ┌──────────────┐              │
│  │ User Input   │         │ Credit       │              │
│  │ (Voice/Text) │         │ Tracker      │              │
│  └──────┬───────┘         └──────┬───────┘              │
│         │                        │                       │
│         ▼                        ▼                       │
│  ┌──────────────┐         ┌──────────────┐              │
│  │ Speech-to-   │         │ Usage Check  │              │
│  │ Text (STT)   │         │ (10 min/day) │              │
│  └──────┬───────┘         └──────────────┘              │
│         │                                                │
│         ▼                                                │
│  ┌─────────────────────────────────────────┐            │
│  │           GEMINI AI                      │            │
│  │  ┌─────────────────────────────────┐    │            │
│  │  │ System Prompt:                  │    │            │
│  │  │ - User's level                  │    │            │
│  │  │ - User's goals/milestones       │    │            │
│  │  │ - Recent vocabulary (Word Bank) │    │            │
│  │  │ - 5-10s hint delay rule         │    │            │
│  │  │ - Gentle correction style       │    │            │
│  │  └─────────────────────────────────┘    │            │
│  └──────────────┬──────────────────────────┘            │
│                 │                                        │
│                 ▼                                        │
│  ┌──────────────────────────┐                           │
│  │ Text-to-Speech (TTS)     │                           │
│  │ AI speaks response       │                           │
│  └──────────────────────────┘                           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Data Model

```typescript
// /lib/ai-conversation/types.ts

interface ConversationSession {
  id: string;
  userId: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  type: 'casual' | 'interview' | 'scenario';
  scenario?: string;
  messagesCount: number;
  wordsUsed: string[];          // Words from user's bank that appeared
  newWordsEncountered: string[]; // Words to add to bank
}

interface ConversationMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  correction?: {
    original: string;
    suggested: string;
    explanation: string;
  };
}

interface CreditUsage {
  userId: string;
  date: string;                  // YYYY-MM-DD
  minutesUsed: number;
  sessionsCount: number;
}

interface ConversationSettings {
  dailyFreeMinutes: number;      // Default: 10
  hintDelaySeconds: number;      // Default: 7
  autoPlayAudio: boolean;
  voiceInputEnabled: boolean;
}
```

### Key Design Decisions

**1. 5-10 Second Hint Delay**
```typescript
// Don't give hints immediately - let user think
const HINT_DELAY_MS = 7000;

// After user stops speaking, start timer
// Only show "Need a hint?" button after delay
```

**2. Gentle Corrections**
```typescript
const CORRECTION_STYLE = `
NEVER say: "Wrong!" or "Incorrect!"
ALWAYS say: "You could also say..." or "Another way to express that..."
ALWAYS acknowledge what the user meant first.
`;
```

**3. Credit System**
```typescript
// Free tier: 10 minutes per day
// Premium: Unlimited
// Credits reset at midnight local time
// Show clear progress bar: "7:32 remaining"
```

### Components

| Component | Path | Description |
|-----------|------|-------------|
| ConversationScreen | `/app/conversation/index.tsx` | Main chat interface |
| MessageBubble | `/components/ai/MessageBubble.tsx` | Chat message display |
| CreditDisplay | `/components/ai/CreditDisplay.tsx` | Minutes remaining bar |
| VoiceInput | `/components/ai/VoiceInput.tsx` | Hold-to-speak button |
| HintButton | `/components/ai/HintButton.tsx` | Delayed hint request |
| CorrectionCard | `/components/ai/CorrectionCard.tsx` | Gentle correction display |

### Hooks

| Hook | Path | Description |
|------|------|-------------|
| useConversation | `/hooks/useConversation.ts` | Chat logic, Gemini API |
| useCredits | `/hooks/useCredits.ts` | Credit tracking |
| useSpeechInput | `/hooks/useSpeechInput.ts` | Voice recording + STT |
| useTextToSpeech | `/hooks/useTextToSpeech.ts` | AI voice output |

### Gemini Prompt

```typescript
const systemPrompt = `
You are a friendly, patient language tutor helping a ${level} learner practice ${targetLanguage}.

USER CONTEXT:
- Level: ${userLevel}
- Goal: ${userGoal}
- Recent vocabulary: ${recentWords.join(', ')}
- Current milestone: ${currentMilestone}

CRITICAL RULES:
1. WAIT for the user to finish before responding
2. NEVER give hints immediately - wait at least 5-10 seconds of silence
3. Corrections must be GENTLE: "You could also say..." NOT "Wrong!"
4. Acknowledge what user MEANT before correcting
5. Adapt vocabulary to their level
6. Ask follow-up questions to keep conversation flowing
7. Use vocabulary from their recent lessons when possible
8. Celebrate attempts: "Great try! I understood you meant..."
9. If user is stuck, simplify YOUR language, don't give answers

CONVERSATION TYPE: ${sessionType}
- casual: Friendly everyday chat
- interview: Mock job interview practice
- scenario: ${scenarioDescription}

Respond naturally in ${targetLanguage}.
Occasionally provide ${nativeLanguage} hints if user seems stuck.
`;
```

---

## Files

### Core Files (To Create)
- `/lib/ai-conversation/types.ts` - TypeScript interfaces
- `/lib/ai-conversation/gemini-client.ts` - Gemini API wrapper
- `/lib/ai-conversation/prompts.ts` - System prompts
- `/lib/ai-conversation/credits.ts` - Usage tracking
- `/lib/ai-conversation/index.ts` - Exports

### Components (To Create)
- `/components/ai/MessageBubble.tsx`
- `/components/ai/CreditDisplay.tsx`
- `/components/ai/VoiceInput.tsx`
- `/components/ai/HintButton.tsx`
- `/components/ai/CorrectionCard.tsx`

### Screens (To Create)
- `/app/conversation/index.tsx` - Main conversation
- `/app/conversation/history.tsx` - Past conversations

### Related Files (Existing)
- `/lib/gemini/` - Already has Gemini setup
- `/docs/GEMINI_IMPLEMENTATION_GUIDE.md` - Reference

---

## Implementation Status

### Done
- [x] Gemini SDK installed
- [x] Basic prompt design
- [x] Documentation created

### In Progress
- [ ] Nothing yet

### TODO
- [ ] Create `/lib/ai-conversation/` folder structure
- [ ] Implement credit tracking system
- [ ] Create conversation screen UI
- [ ] Implement voice input (expo-speech-recognition)
- [ ] Implement text-to-speech output (expo-speech)
- [ ] Add hint delay timer
- [ ] Create gentle correction display
- [ ] Connect to Word Bank (use user's vocabulary)
- [ ] Add conversation history
- [ ] Test full conversation flow

---

## Dependencies

### Requires
- [x] Gemini SDK (already installed)
- [x] expo-speech (already installed)
- [ ] Speech-to-text solution (expo-speech-recognition or Google API)
- [ ] Word Bank system (for personalized vocabulary)

### Required By
- [ ] Nothing yet (standalone feature)

---

## Testing

### Manual Test Steps
1. Start conversation
2. Check credit display shows correctly
3. Send text message, verify AI responds
4. Try voice input
5. Make grammar mistake, verify gentle correction
6. Wait for hint button to appear (7+ seconds)
7. Use all credits, verify limit works
8. Check next day credits reset

### Automated Tests
- [ ] Credit calculation tests
- [ ] Prompt generation tests
- [ ] Timer behavior tests

---

## UI Mockup

```
┌─────────────────────────────────────────┐
│ AI Conversation           ⏱️ 7:32       │
│ ████████░░░░░░░░░ 7 min remaining       │
├─────────────────────────────────────────┤
│                                         │
│  🤖 "Hola! Como estas hoy?"            │
│                                         │
│  👤 "Estoy... um... bien?"             │
│                                         │
│  🤖 "Muy bien! 'Estoy bien' es         │
│      perfecto. What did you do         │
│      today?"                            │
│                                         │
│  💡 Tip: You could also say            │
│     "Estoy muy bien" for emphasis      │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  [🎤 Hold to Speak]                     │
│                                         │
│  ────── OR ──────                       │
│                                         │
│  [Type your message...           ] [📤] │
│                                         │
└─────────────────────────────────────────┘
```

---

## Changelog

### 2025-12-02
- Initial documentation created
- System prompt designed
- Architecture defined
- Credit system specified
