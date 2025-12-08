# Feature: Storytelling Flow

**Created**: 2025-12-02
**Last Updated**: 2025-12-02 12:00 PM
**Owner**: Angel Polanco
**Priority**: P1
**Status**: Planned

---

## Overview

### What It Does
Users tell their personal story through guided prompts. Using proven storytelling methods, the system helps them craft a meaningful narrative that becomes personalized teleprompter content for reading practice.

### Core Philosophy

> **"Your story matters. Practice reading YOUR words."**

The most engaging content is content that matters to YOU. By helping users craft their own stories, we create:
- Highly relevant vocabulary (words they actually need)
- Emotional connection to the content
- Motivation to practice (it's THEIR story)
- Real-world communication preparation

### Why It Matters

**Research Foundation:**
- Personal relevance increases retention by 40%+ (Self-Reference Effect)
- Narrative structure aids memory (Story Grammar Theory)
- Emotional content is remembered better (Flashbulb Memory research)
- Output practice (writing/speaking) consolidates learning

### Connection to Teleprompter
```
User Story Creation → AI Enhancement → Teleprompter Practice → Public/Private Share
```

---

## The Complete Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    STORYTELLING → TELEPROMPTER FLOW              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  STEP 1: STORY PROMPT                                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ "Tell us about a meaningful experience"                  │   │
│  │                                                          │   │
│  │ Choose a prompt:                                         │   │
│  │ • A trip that changed you                               │   │
│  │ • Someone who inspired you                              │   │
│  │ • A challenge you overcame                              │   │
│  │ • A dream you're working toward                         │   │
│  │ • Write your own topic                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  STEP 2: GUIDED CREATION (Proven Method)                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Using the STAR Method + Hero's Journey:                  │   │
│  │                                                          │   │
│  │ 1. SITUATION: Where/when did this happen?               │   │
│  │    [User writes 1-2 sentences]                          │   │
│  │                                                          │   │
│  │ 2. CHALLENGE: What was the problem or goal?             │   │
│  │    [User writes 1-2 sentences]                          │   │
│  │                                                          │   │
│  │ 3. ACTION: What did you do?                             │   │
│  │    [User writes 2-3 sentences]                          │   │
│  │                                                          │   │
│  │ 4. RESULT: What happened? How did you feel?             │   │
│  │    [User writes 1-2 sentences]                          │   │
│  │                                                          │   │
│  │ 5. REFLECTION: What did you learn?                      │   │
│  │    [User writes 1-2 sentences]                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  STEP 3: AI ENHANCEMENT                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Gemini AI improves the story while keeping user's voice: │   │
│  │                                                          │   │
│  │ • Fixes grammar (gently)                                │   │
│  │ • Suggests vocabulary upgrades (with explanations)       │   │
│  │ • Maintains user's authentic voice                       │   │
│  │ • Adjusts to user's CEFR level                          │   │
│  │ • Creates 3 versions: Simple / Original / Advanced       │   │
│  │                                                          │   │
│  │ User reviews and approves changes                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  STEP 4: TELEPROMPTER PRACTICE                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ User's story appears in teleprompter:                    │   │
│  │                                                          │   │
│  │ • Read at their own pace                                │   │
│  │ • Record their voice                                    │   │
│  │ • Get articulation feedback                              │   │
│  │ • Problem words → Word Bank                             │   │
│  │ • Re-record until satisfied                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  STEP 5: SAVE & SHARE                                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ User decides what to keep:                               │   │
│  │                                                          │   │
│  │ Saved (Always):                                          │   │
│  │ ✓ Final story text                                      │   │
│  │ ✓ Audio recording                                       │   │
│  │ ✓ Articulation feedback                                 │   │
│  │ ✓ Problem words (in Word Bank)                          │   │
│  │                                                          │   │
│  │ Visibility Toggle:                                       │   │
│  │ [🔒 Private - Only you can see]                         │   │
│  │ [🌍 Public - Share with community]                      │   │
│  │                                                          │   │
│  │ If Public:                                               │   │
│  │ • Recording shared (with username)                      │   │
│  │ • Story text shared                                     │   │
│  │ • Scores/feedback NOT shared (private)                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Proven Storytelling Methods

### 1. STAR Method (Situation-Task-Action-Result)
**Origin**: Interview preparation technique, proven effective for structured narratives

```typescript
const STARPrompts = {
  situation: "Set the scene. Where and when did this happen?",
  task: "What was the challenge or goal you faced?",
  action: "What specific steps did you take?",
  result: "What was the outcome? How did it affect you?",
};
```

### 2. Hero's Journey (Simplified)
**Origin**: Joseph Campbell's monomyth, adapted for personal storytelling

```typescript
const HeroJourneyPrompts = {
  ordinaryWorld: "Describe your life before this experience",
  callToAdventure: "What happened that changed things?",
  challenges: "What obstacles did you face?",
  transformation: "How did you change or grow?",
  return: "What wisdom do you carry now?",
};
```

### 3. Emotion-Action-Reflection
**Origin**: Therapeutic narrative techniques

```typescript
const EARPrompts = {
  emotion: "How did you feel at the start?",
  action: "What happened? What did you do?",
  reflection: "Looking back, what do you understand now?",
};
```

### Implementation: Adaptive Prompting

```typescript
// System chooses prompts based on user's level and goal
function selectPromptMethod(user: User): PromptMethod {
  if (user.goal === 'job_interview') {
    return 'STAR'; // Best for professional stories
  } else if (user.level === 'beginner') {
    return 'EAR';  // Simpler structure
  } else {
    return 'HERO_JOURNEY'; // Richer narrative
  }
}
```

---

## Technical Specification

### Data Model

```typescript
// /lib/storytelling/types.ts

interface UserStory {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;

  // Prompt & Method
  promptCategory: 'trip' | 'person' | 'challenge' | 'dream' | 'custom';
  promptMethod: 'STAR' | 'HERO_JOURNEY' | 'EAR';
  customPrompt?: string;

  // User's Raw Input (preserved exactly)
  rawSections: {
    section1: string;
    section2: string;
    section3: string;
    section4: string;
    section5?: string;
  };

  // AI-Enhanced Versions
  versions: {
    simple: string;      // Simplified vocabulary
    original: string;    // User's voice, light corrections
    advanced: string;    // Vocabulary upgrades
  };

  // User's Choice
  selectedVersion: 'simple' | 'original' | 'advanced';
  finalText: string;

  // Vocabulary Extracted
  keyVocabulary: {
    word: string;
    context: string;      // Sentence it appeared in
    definition: string;
    addedToWordBank: boolean;
  }[];

  // Reading Sessions (linked)
  readingSessions: string[];  // IDs of teleprompter sessions

  // Sharing
  isPublic: boolean;
  publicTitle?: string;
}

interface StoryCreationSession {
  storyId: string;
  currentStep: 1 | 2 | 3 | 4 | 5;
  startedAt: string;
  completedAt?: string;

  // Progress through sections
  sectionsCompleted: number;

  // AI Enhancement tracking
  aiSuggestionsShown: number;
  aiSuggestionsAccepted: number;
  aiSuggestionsModified: number;
}
```

### AI Enhancement Prompts

```typescript
const storyEnhancementPrompt = `
You are helping a ${userLevel} language learner improve their personal story.

USER'S ORIGINAL STORY:
${userRawText}

YOUR TASK:
1. Create THREE versions of this story:

VERSION 1 - SIMPLE (for beginners):
- Use A1-A2 vocabulary only
- Shorter sentences
- Keep the meaning and emotion

VERSION 2 - ORIGINAL (light polish):
- Keep user's authentic voice
- Fix only clear grammar errors
- Don't change vocabulary unless wrong
- Preserve their style and personality

VERSION 3 - ADVANCED (vocabulary upgrade):
- Suggest richer vocabulary
- More complex sentence structures
- Keep the same meaning
- Mark upgraded words with [new word]

CRITICAL RULES:
- This is THEIR story - don't change the facts
- Preserve emotional authenticity
- Don't make it sound "textbook perfect"
- Explain any changes you suggest
- Be encouraging, not critical

OUTPUT FORMAT:
{
  "simple": "...",
  "original": "...",
  "advanced": "...",
  "suggestions": [
    {
      "original": "word/phrase",
      "suggested": "better option",
      "reason": "why this is better",
      "keepOriginal": true/false  // Is original also acceptable?
    }
  ],
  "encouragement": "Positive feedback about their story"
}
`;
```

---

## Data Storage & Privacy

### What We Store

```typescript
interface StoredStoryData {
  // ALWAYS STORED (Required)
  story: {
    rawInput: string;           // Their original words (never modified)
    finalVersion: string;       // What they approved
    recordingUrl: string;       // Their voice reading it
  };

  // STORED FOR IMPROVEMENT
  learningData: {
    vocabularyExtracted: string[];
    readingScores: number[];
    problemWords: string[];
  };

  // USER CONTROLS
  visibility: {
    isPublic: boolean;          // Default: false
    showRecording: boolean;     // If public, show audio?
    showText: boolean;          // If public, show story text?
  };
}
```

### Transparency Commitment

```typescript
// Shown to user before they start
const dataTransparencyNotice = `
📊 What happens with your story:

SAVED LOCALLY (on your device):
• Your original story text
• Your voice recording
• Your practice scores

SAVED TO CLOUD (if you enable sync):
• Same data, encrypted
• Accessible on other devices

IF YOU CHOOSE "PUBLIC":
• Recording shared with community
• Story text visible to others
• Your scores stay PRIVATE

WE NEVER:
• Share your data with advertisers
• Sell your story to third parties
• Use your voice for AI training without consent

YOU CAN ALWAYS:
• Download all your data
• Delete everything permanently
• Change public → private anytime
`;
```

---

## UI/UX Design

### Story Creation Screen (Step 2)

```
┌─────────────────────────────────────────┐
│ ← Create Your Story                     │
│                                         │
│ Step 2 of 5: The Challenge              │
│ [●●○○○]                                 │
├─────────────────────────────────────────┤
│                                         │
│ 💡 "What challenge or goal did you      │
│    face in this experience?"            │
│                                         │
│ ┌─────────────────────────────────┐     │
│ │                                 │     │
│ │ I wanted to learn how to cook   │     │
│ │ but I was scared of the kitchen.│     │
│ │ My grandmother always said I    │     │
│ │ would burn everything...        │     │
│ │                                 │     │
│ │                                 │     │
│ └─────────────────────────────────┘     │
│                                         │
│ Words: 23 / 50 suggested                │
│                                         │
│ 💬 Writing Tips:                        │
│ • What was difficult?                   │
│ • What did you want to achieve?         │
│ • What fears did you have?              │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│         [← Back]    [Next →]            │
│                                         │
└─────────────────────────────────────────┘
```

### AI Enhancement Review Screen (Step 3)

```
┌─────────────────────────────────────────┐
│ ← Review Your Story                     │
│                                         │
│ Step 3 of 5: AI Suggestions             │
├─────────────────────────────────────────┤
│                                         │
│ 🎉 Beautiful story! Here are some       │
│ options for your final version:         │
│                                         │
│ ┌─────────────────────────────────┐     │
│ │ [○] SIMPLE                      │     │
│ │ For easier reading practice     │     │
│ │ ─────────────────────────────── │     │
│ │ I wanted to learn cooking. But  │     │
│ │ I was scared. My grandmother    │     │
│ │ said I would burn things...     │     │
│ └─────────────────────────────────┘     │
│                                         │
│ ┌─────────────────────────────────┐     │
│ │ [●] ORIGINAL (Recommended)      │     │
│ │ Your voice, light polish        │     │
│ │ ─────────────────────────────── │     │
│ │ I wanted to learn how to cook,  │     │
│ │ but I was scared of the kitchen.│     │
│ │ My grandmother always said I    │     │
│ │ would burn everything...        │     │
│ └─────────────────────────────────┘     │
│                                         │
│ ┌─────────────────────────────────┐     │
│ │ [○] ADVANCED                    │     │
│ │ Vocabulary upgrade              │     │
│ │ ─────────────────────────────── │     │
│ │ I [aspired] to master cooking,  │     │
│ │ yet I was [intimidated by] the  │     │
│ │ kitchen. My grandmother would   │     │
│ │ [constantly remind] me that...  │     │
│ │                                 │     │
│ │ 📚 New words: aspired,          │     │
│ │    intimidated, constantly      │     │
│ └─────────────────────────────────┘     │
│                                         │
├─────────────────────────────────────────┤
│         [← Back]    [Use This →]        │
└─────────────────────────────────────────┘
```

### Final Save Screen (Step 5)

```
┌─────────────────────────────────────────┐
│ 🎉 Your Story is Ready!                 │
├─────────────────────────────────────────┤
│                                         │
│ "Learning to Cook with Grandma"         │
│                                         │
│ ┌─────────────────────────────────┐     │
│ │ Your story has been saved!      │     │
│ │                                 │     │
│ │ ✓ Story text saved              │     │
│ │ ✓ Recording saved               │     │
│ │ ✓ 5 words added to Word Bank    │     │
│ │ ✓ Articulation score: 82%       │     │
│ └─────────────────────────────────┘     │
│                                         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                         │
│ Share with community?                   │
│                                         │
│ [🔒 Keep Private]  ←━━━━●━━━→  [🌍 Public]
│                                         │
│ If public:                              │
│ • Others can hear your recording        │
│ • Others can read your story            │
│ • Your scores stay private              │
│                                         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                         │
│ 📊 Your Data                            │
│ [See what's saved] [Delete this story]  │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│    [🏠 Home]    [📖 Practice Again]     │
│                                         │
└─────────────────────────────────────────┘
```

---

## Research Citations

### Storytelling & Learning

| Study | Finding | How We Apply It |
|-------|---------|-----------------|
| **Self-Reference Effect** (Rogers et al., 1977) | Information relating to self is remembered better | Users write about their OWN experiences |
| **Story Grammar Theory** (Mandler & Johnson, 1977) | Structured narratives are easier to recall | STAR/Hero's Journey provide structure |
| **Emotional Memory** (Cahill & McGaugh, 1995) | Emotional content has stronger memory traces | Prompts encourage emotional stories |
| **Output Hypothesis** (Swain, 1985) | Producing language forces deeper processing | Writing their story = active learning |
| **Personalization Effect** (Moreno & Mayer, 2000) | Personalized content increases engagement 40%+ | Content is literally THEIR story |

### Reading Aloud & Fluency

| Study | Finding | How We Apply It |
|-------|---------|-----------------|
| **Repeated Reading** (Samuels, 1979) | Re-reading improves fluency | Users can re-record multiple times |
| **Self-Monitoring** (Rasinski, 2010) | Hearing oneself improves metacognition | Playback feature for self-review |

---

## Files

### Core Files (To Create)
- `/lib/storytelling/types.ts` - Interfaces
- `/lib/storytelling/prompts.ts` - Story prompts
- `/lib/storytelling/ai-enhancement.ts` - Gemini integration
- `/lib/storytelling/storage.ts` - Save/load stories

### Components (To Create)
- `/components/storytelling/PromptSelector.tsx`
- `/components/storytelling/StoryEditor.tsx`
- `/components/storytelling/VersionPicker.tsx`
- `/components/storytelling/PrivacyToggle.tsx`

### Screens (To Create)
- `/app/storytelling/index.tsx` - Start
- `/app/storytelling/create.tsx` - Step-by-step creation
- `/app/storytelling/review.tsx` - AI suggestions
- `/app/storytelling/practice.tsx` - Teleprompter
- `/app/storytelling/complete.tsx` - Save & share

---

## Connection to Other Features

```
┌─────────────────────────────────────────────────────────────┐
│                    FEATURE CONNECTIONS                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  STORYTELLING ──────────────────► TELEPROMPTER               │
│       │                                │                     │
│       │                                ▼                     │
│       │                          WORD BANK                   │
│       │                          (problem words)             │
│       │                                │                     │
│       │                                ▼                     │
│       │                          AI CONVERSATION             │
│       │                          (uses story vocabulary)     │
│       │                                │                     │
│       ▼                                ▼                     │
│  COMMUNITY ◄───────────────────────────┘                    │
│  (public stories)                                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Status

### Done
- [x] Concept defined
- [x] Story structure methods researched
- [x] Privacy architecture designed
- [x] Documentation created

### TODO
- [ ] Create prompt library
- [ ] Build story editor UI
- [ ] Implement AI enhancement
- [ ] Connect to teleprompter
- [ ] Add Word Bank integration
- [ ] Build privacy controls
- [ ] Test full flow

---

## Changelog

### 2025-12-02
- Initial documentation created
- STAR/Hero's Journey methods documented
- Privacy architecture defined
- Research citations added
