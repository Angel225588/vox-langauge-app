# Staircase-Scenario Mapping System

> **Status**: Core System Design
> **Created**: 2025-01-02
> **Priority**: P0 - Foundation for all learning
> **Dependencies**: SCENARIO_BASED_LEARNING_ARCHITECTURE.md

---

## Executive Summary

The AI-generated staircase maps users through **scenarios** in a strategic order. The key insight:

> "Even with a specific goal (career, travel), users must dominate universal conversations WHILE specializing. The top 500-2000 most used words cover 80% of all conversations."

**Critical Distinction**: Users learn universal AND field-specific vocabulary simultaneously in every stair - NOT sequentially. This ensures they can handle everyday situations from day one while building expertise in their goal domain.

---

## The Blended Learning Model

**Key Change**: Every stair blends universal + field-specific content simultaneously.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    VOX BLENDED LEARNING MODEL                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  EVERY STAIR INCLUDES BOTH:                                          │
│  ══════════════════════════                                          │
│                                                                      │
│  60% UNIVERSAL SKILLS                    40% FIELD-SPECIFIC SKILLS   │
│  ─────────────────────────               ─────────────────────────   │
│  • Top 2000 most used words              • Goal-related vocabulary   │
│  • Meeting new people                    • Career scenarios          │
│  • Conversations with friends            • Travel situations         │
│  • Daily life situations                 • Relationship contexts     │
│  • Asking for help                       • Domain expertise          │
│  • Survival phrases                      • Specialized terms         │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  PROGRESSION BY VOCABULARY TIER                                      │
│  ══════════════════════════════                                      │
│                                                                      │
│  Steps 1-2: Core 100 words + Basic field vocabulary                  │
│  ├── Universal: greetings, basic verbs, common nouns                │
│  └── Field: essential terms for their goal                          │
│                                                                      │
│  Steps 3-4: Essential 500 words + Intermediate field vocabulary      │
│  ├── Universal: daily life, shopping, directions                    │
│  └── Field: common scenarios in their domain                        │
│                                                                      │
│  Steps 5-6: Fluent 1000 words + Advanced field vocabulary            │
│  ├── Universal: opinions, emotions, complex situations              │
│  └── Field: professional/specialized contexts                       │
│                                                                      │
│  Steps 7-8: Advanced 2000 words + Specialized field vocabulary       │
│  ├── Universal: nuanced expression, cultural contexts               │
│  └── Field: expert-level domain mastery                             │
│                                                                      │
│  Outcome: User handles BOTH everyday AND specialized situations      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Vocabulary Tiers

### Tier System

| Tier | Word Count | Coverage | When Taught |
|------|------------|----------|-------------|
| **Tier 1: Core** | Top 100 | ~50% of speech | Steps 1-2 |
| **Tier 2: Essential** | Top 500 | ~75% of speech | Steps 3-4 |
| **Tier 3: Fluent** | Top 1000 | ~85% of speech | Steps 5-6 |
| **Tier 4: Advanced** | Top 2000 | ~92% of speech | Steps 7-8 |
| **Tier 5: Field-Specific** | Specialized | Domain mastery | Steps 9-12+ |

### Research Basis

Based on frequency analysis of natural speech:
- **100 words** = 50% of all words used in conversation
- **500 words** = 75% coverage
- **1000 words** = 85% coverage
- **2000 words** = 92% coverage
- **Beyond 2000** = Specialized/technical vocabulary

### Implementation

```typescript
interface VocabularyTier {
  tier: 1 | 2 | 3 | 4 | 5;
  name: string;
  wordRange: { min: number; max: number };
  coverage: string;
  type: 'universal' | 'field-specific';
  unlockedAtStep: number;
}

const VOCABULARY_TIERS: VocabularyTier[] = [
  { tier: 1, name: 'Core', wordRange: { min: 1, max: 100 }, coverage: '50%', type: 'universal', unlockedAtStep: 1 },
  { tier: 2, name: 'Essential', wordRange: { min: 101, max: 500 }, coverage: '75%', type: 'universal', unlockedAtStep: 3 },
  { tier: 3, name: 'Fluent', wordRange: { min: 501, max: 1000 }, coverage: '85%', type: 'universal', unlockedAtStep: 5 },
  { tier: 4, name: 'Advanced', wordRange: { min: 1001, max: 2000 }, coverage: '92%', type: 'universal', unlockedAtStep: 7 },
  { tier: 5, name: 'Specialist', wordRange: { min: 2001, max: 5000 }, coverage: 'Domain', type: 'field-specific', unlockedAtStep: 9 },
];
```

---

## Scenario Categories

### Universal Scenarios (Everyone Learns)

These scenarios appear in EVERY user's staircase, regardless of their goal:

```typescript
const UNIVERSAL_SCENARIOS = {
  // SOCIAL FOUNDATIONS
  meetingPeople: {
    id: 'universal-meeting-people',
    name: 'Meeting New People',
    description: 'Introduce yourself, ask about others, make small talk',
    tier: 1,
    vocabularyFocus: ['greetings', 'introductions', 'personal-info'],
    questionPatterns: ['What is...?', 'Where are...?', 'Do you...?'],
    survivalPhrases: ['Nice to meet you', 'How do you spell that?', 'Where are you from?'],
  },

  friendConversation: {
    id: 'universal-friend-conversation',
    name: 'Chatting with Friends',
    description: 'Casual conversation, sharing news, making plans',
    tier: 1,
    vocabularyFocus: ['casual-speech', 'emotions', 'activities'],
    questionPatterns: ['How was...?', 'Did you...?', 'Want to...?'],
    survivalPhrases: ['What\'s up?', 'How\'s it going?', 'Sounds good!'],
  },

  askingForHelp: {
    id: 'universal-asking-help',
    name: 'Asking for Help',
    description: 'Request assistance, clarification, directions',
    tier: 1,
    vocabularyFocus: ['requests', 'directions', 'clarification'],
    questionPatterns: ['Can you...?', 'Could you...?', 'Do you know...?'],
    survivalPhrases: ['Excuse me', 'I\'m sorry, I didn\'t understand', 'Can you repeat that?'],
  },

  // DAILY LIFE
  shopping: {
    id: 'universal-shopping',
    name: 'Shopping & Buying',
    description: 'Stores, prices, sizes, payments',
    tier: 2,
    vocabularyFocus: ['money', 'sizes', 'colors', 'quantities'],
    questionPatterns: ['How much...?', 'Do you have...?', 'Can I pay...?'],
    survivalPhrases: ['Just looking', 'Do you accept cards?', 'Too expensive'],
  },

  foodAndDining: {
    id: 'universal-food-dining',
    name: 'Food & Restaurants',
    description: 'Ordering, preferences, paying the bill',
    tier: 2,
    vocabularyFocus: ['food', 'drinks', 'dining', 'tastes'],
    questionPatterns: ['What do you recommend?', 'Does this have...?', 'Can I have...?'],
    survivalPhrases: ['I\'m allergic to...', 'The check please', 'Delicious!'],
  },

  transportation: {
    id: 'universal-transportation',
    name: 'Getting Around',
    description: 'Buses, taxis, directions, tickets',
    tier: 2,
    vocabularyFocus: ['transport', 'directions', 'time', 'places'],
    questionPatterns: ['How do I get to...?', 'Which bus...?', 'How long...?'],
    survivalPhrases: ['Stop here please', 'I\'m lost', 'Is this the right way?'],
  },

  // DEEPER CONNECTIONS
  talkingAboutYourself: {
    id: 'universal-about-yourself',
    name: 'Talking About Yourself',
    description: 'Background, interests, experiences, opinions',
    tier: 3,
    vocabularyFocus: ['biography', 'hobbies', 'preferences', 'experiences'],
    questionPatterns: ['Have you ever...?', 'What do you think about...?'],
    survivalPhrases: ['In my opinion...', 'I prefer...', 'I\'ve never tried...'],
  },

  expressingOpinions: {
    id: 'universal-opinions',
    name: 'Expressing Opinions',
    description: 'Agree, disagree, discuss topics, debate',
    tier: 3,
    vocabularyFocus: ['opinions', 'agreement', 'contrast', 'reasoning'],
    questionPatterns: ['What do you think?', 'Don\'t you agree?', 'Why do you...?'],
    survivalPhrases: ['I see your point', 'I disagree because...', 'That\'s interesting'],
  },

  phoneAndMessages: {
    id: 'universal-phone-messages',
    name: 'Phone Calls & Messages',
    description: 'Making calls, voicemails, texting etiquette',
    tier: 3,
    vocabularyFocus: ['phone', 'messages', 'communication'],
    questionPatterns: ['Is this...?', 'Can I speak to...?', 'Did you get my...?'],
    survivalPhrases: ['Sorry, bad connection', 'I\'ll call you back', 'Text me'],
  },

  // PROBLEM SOLVING
  problemsAndComplaints: {
    id: 'universal-problems',
    name: 'Handling Problems',
    description: 'Complaints, issues, finding solutions',
    tier: 4,
    vocabularyFocus: ['problems', 'solutions', 'complaints', 'requests'],
    questionPatterns: ['What happened?', 'Can you fix...?', 'Who can help?'],
    survivalPhrases: ['This isn\'t working', 'I\'d like to speak to...', 'This is unacceptable'],
  },

  emergencies: {
    id: 'universal-emergencies',
    name: 'Emergency Situations',
    description: 'Health, safety, urgent help',
    tier: 4,
    vocabularyFocus: ['emergency', 'health', 'safety', 'urgency'],
    questionPatterns: ['Where is the hospital?', 'Can you call...?', 'Is there a...?'],
    survivalPhrases: ['Help!', 'I need a doctor', 'Call the police', 'It\'s an emergency'],
  },
};
```

### Field-Specific Scenarios

Based on user's goal from onboarding:

```typescript
const FIELD_SCENARIOS = {
  career: {
    jobInterview: {
      id: 'career-interview',
      name: 'Job Interview',
      description: 'Answer questions, ask about the role, negotiate',
      tier: 5,
      vocabularyFocus: ['resume', 'experience', 'qualifications', 'salary'],
      questionPatterns: ['Have you worked with...?', 'What are your...?', 'Why do you want...?'],
    },
    businessMeeting: {
      id: 'career-meeting',
      name: 'Business Meeting',
      description: 'Present ideas, discuss projects, make decisions',
      tier: 5,
      vocabularyFocus: ['business', 'projects', 'deadlines', 'goals'],
    },
    workplaceDaily: {
      id: 'career-workplace',
      name: 'Day at the Office',
      description: 'Colleagues, tasks, lunch, small talk',
      tier: 4,
      vocabularyFocus: ['office', 'tasks', 'colleagues', 'schedule'],
    },
    presentation: {
      id: 'career-presentation',
      name: 'Giving a Presentation',
      description: 'Present data, answer questions, handle feedback',
      tier: 5,
      vocabularyFocus: ['data', 'charts', 'conclusions', 'questions'],
    },
    networking: {
      id: 'career-networking',
      name: 'Professional Networking',
      description: 'Events, introductions, exchanging contacts',
      tier: 5,
      vocabularyFocus: ['industry', 'contacts', 'opportunities', 'events'],
    },
  },

  travel: {
    airportCustoms: {
      id: 'travel-airport',
      name: 'Airport & Customs',
      description: 'Check-in, security, immigration questions',
      tier: 4,
      vocabularyFocus: ['airport', 'documents', 'luggage', 'flights'],
    },
    hotelCheckIn: {
      id: 'travel-hotel',
      name: 'Hotel Check-In',
      description: 'Reservations, room requests, amenities',
      tier: 4,
      vocabularyFocus: ['hotel', 'rooms', 'amenities', 'reservations'],
    },
    tourGuide: {
      id: 'travel-tour',
      name: 'Booking Tours',
      description: 'Activities, schedules, prices, recommendations',
      tier: 5,
      vocabularyFocus: ['tourism', 'activities', 'schedules', 'landmarks'],
    },
    localRecommendations: {
      id: 'travel-local',
      name: 'Getting Local Tips',
      description: 'Ask locals for recommendations',
      tier: 5,
      vocabularyFocus: ['local', 'recommendations', 'hidden-gems', 'culture'],
    },
    travelEmergency: {
      id: 'travel-emergency',
      name: 'Travel Emergency',
      description: 'Lost passport, missed flight, health issues abroad',
      tier: 5,
      vocabularyFocus: ['embassy', 'insurance', 'documentation', 'urgent'],
    },
  },

  relationships: {
    familyConversation: {
      id: 'relationships-family',
      name: 'Family Conversations',
      description: 'Discuss life, share news, family events',
      tier: 4,
      vocabularyFocus: ['family', 'events', 'traditions', 'updates'],
    },
    dating: {
      id: 'relationships-dating',
      name: 'Dating & Romance',
      description: 'First dates, getting to know someone, expressing feelings',
      tier: 5,
      vocabularyFocus: ['romance', 'feelings', 'compliments', 'plans'],
    },
    deepConversations: {
      id: 'relationships-deep',
      name: 'Deep Conversations',
      description: 'Life goals, beliefs, meaningful topics',
      tier: 5,
      vocabularyFocus: ['philosophy', 'beliefs', 'dreams', 'values'],
    },
    conflictResolution: {
      id: 'relationships-conflict',
      name: 'Resolving Conflicts',
      description: 'Apologize, explain, find solutions',
      tier: 5,
      vocabularyFocus: ['apology', 'understanding', 'compromise', 'feelings'],
    },
    celebrationEvents: {
      id: 'relationships-celebration',
      name: 'Celebrations & Events',
      description: 'Birthdays, holidays, cultural celebrations',
      tier: 4,
      vocabularyFocus: ['celebrations', 'gifts', 'traditions', 'wishes'],
    },
  },

  academic: {
    classParticipation: {
      id: 'academic-class',
      name: 'Participating in Class',
      description: 'Ask questions, give answers, discuss topics',
      tier: 4,
      vocabularyFocus: ['academic', 'questions', 'discussion', 'topics'],
    },
    professorMeeting: {
      id: 'academic-professor',
      name: 'Meeting with Professor',
      description: 'Office hours, grades, advice',
      tier: 5,
      vocabularyFocus: ['grades', 'assignments', 'feedback', 'advice'],
    },
    groupProject: {
      id: 'academic-group',
      name: 'Group Project Work',
      description: 'Collaborate, divide tasks, present together',
      tier: 5,
      vocabularyFocus: ['collaboration', 'tasks', 'deadlines', 'presentation'],
    },
    researchDiscussion: {
      id: 'academic-research',
      name: 'Discussing Research',
      description: 'Present findings, defend ideas, academic debate',
      tier: 5,
      vocabularyFocus: ['research', 'methodology', 'findings', 'debate'],
    },
  },

  heritage: {
    familyHistory: {
      id: 'heritage-history',
      name: 'Family History Conversations',
      description: 'Talk to relatives about family stories',
      tier: 4,
      vocabularyFocus: ['history', 'ancestors', 'stories', 'traditions'],
    },
    culturalTraditions: {
      id: 'heritage-traditions',
      name: 'Cultural Traditions',
      description: 'Learn and discuss cultural practices',
      tier: 5,
      vocabularyFocus: ['culture', 'traditions', 'customs', 'heritage'],
    },
    connectingWithRoots: {
      id: 'heritage-roots',
      name: 'Connecting with Roots',
      description: 'Visit homeland, meet extended family',
      tier: 5,
      vocabularyFocus: ['homeland', 'relatives', 'community', 'belonging'],
    },
  },
};
```

---

## Staircase Generation Algorithm

### How AI Builds the Path

```typescript
interface StaircaseGenerationInput {
  userId: string;
  targetLanguage: string;
  nativeLanguage: string;

  // From onboarding
  primaryGoal: 'career' | 'travel' | 'relationships' | 'academic' | 'heritage';
  proficiencyLevel: 'beginner' | 'elementary' | 'intermediate' | 'advanced';
  dailyCommitment: number; // minutes
  motivation: string;
  specificScenarios: string[]; // User-selected scenarios
}

interface GeneratedStaircase {
  userId: string;
  totalSteps: number;
  estimatedWeeks: number;

  steps: StaircaseStep[];
}

function generateStaircase(input: StaircaseGenerationInput): GeneratedStaircase {
  const steps: StaircaseStep[] = [];

  // LAYER 1: Foundation (Steps 1-6)
  // Everyone gets these regardless of goal
  steps.push(
    createStep(1, UNIVERSAL_SCENARIOS.meetingPeople, VOCABULARY_TIERS[0]),
    createStep(2, UNIVERSAL_SCENARIOS.askingForHelp, VOCABULARY_TIERS[0]),
    createStep(3, UNIVERSAL_SCENARIOS.friendConversation, VOCABULARY_TIERS[1]),
    createStep(4, UNIVERSAL_SCENARIOS.foodAndDining, VOCABULARY_TIERS[1]),
    createStep(5, UNIVERSAL_SCENARIOS.shopping, VOCABULARY_TIERS[2]),
    createStep(6, UNIVERSAL_SCENARIOS.talkingAboutYourself, VOCABULARY_TIERS[2]),
  );

  // LAYER 2: Mixed Universal + Field (Steps 7-9)
  // Blend advanced universal with introductory field-specific
  const fieldScenarios = FIELD_SCENARIOS[input.primaryGoal];
  steps.push(
    createStep(7, UNIVERSAL_SCENARIOS.expressingOpinions, VOCABULARY_TIERS[3]),
    createStep(8, getIntroFieldScenario(fieldScenarios), VOCABULARY_TIERS[3]),
    createStep(9, UNIVERSAL_SCENARIOS.phoneAndMessages, VOCABULARY_TIERS[3]),
  );

  // LAYER 3: Specialization (Steps 10-12+)
  // Deep dive into field-specific scenarios
  const userSelectedScenarios = mapUserSelectionsToScenarios(input.specificScenarios, fieldScenarios);
  userSelectedScenarios.forEach((scenario, index) => {
    steps.push(createStep(10 + index, scenario, VOCABULARY_TIERS[4]));
  });

  // Always include emergency scenarios at the end
  steps.push(createStep(steps.length + 1, UNIVERSAL_SCENARIOS.emergencies, VOCABULARY_TIERS[3]));

  return {
    userId: input.userId,
    totalSteps: steps.length,
    estimatedWeeks: calculateEstimatedWeeks(steps.length, input.dailyCommitment),
    steps,
  };
}
```

### Step Creation

```typescript
interface StaircaseStep {
  stepNumber: number;
  scenario: Scenario;
  vocabularyTier: VocabularyTier;

  // Blocks (from SCENARIO_BASED_LEARNING_ARCHITECTURE.md)
  vocabularyBlock: VocabularyBlock;
  questionBlock: QuestionMasteryBlock;
  practiceBlock: PracticeBlock;

  // Progress tracking
  status: 'locked' | 'current' | 'completed';
  completionCriteria: CompletionCriteria;
}

function createStep(
  stepNumber: number,
  scenario: Scenario,
  vocabularyTier: VocabularyTier
): StaircaseStep {
  return {
    stepNumber,
    scenario,
    vocabularyTier,

    vocabularyBlock: {
      // Pull words from this tier relevant to the scenario
      essentialWords: getWordsForScenario(scenario.id, vocabularyTier, 'essential'),
      keyPhrases: getPhrasesForScenario(scenario.id, 'key'),
      streetPhrases: getPhrasesForScenario(scenario.id, 'street'),
      survivalPhrases: scenario.survivalPhrases,
    },

    questionBlock: {
      patternFocus: scenario.questionPatterns,
      fieldQuestions: generateFieldQuestions(scenario),
      practiceCount: 5, // Ask 5 questions during practice
    },

    practiceBlock: {
      aiConversation: {
        scenarioId: scenario.id,
        targetTurns: 8,
        difficultyLevel: vocabularyTier.name,
      },
      flashcardSession: {
        wordCount: 10,
        includesListening: true,
        includesSpeaking: true,
      },
    },

    status: stepNumber === 1 ? 'current' : 'locked',

    completionCriteria: {
      vocabularyMastery: 70, // 70% of words at "learned" status
      questionsAsked: 3, // Minimum 3 questions in conversation
      scenarioCompleted: true,
      minimumTurns: 5,
    },
  };
}
```

---

## Example: Complete Staircase for "Career" Goal

```
USER: Maria, learning Spanish for career
GOAL: Career (Job Interview, Business Meetings)
LEVEL: Intermediate

┌─────────────────────────────────────────────────────────────────────┐
│                    MARIA'S LEARNING STAIRCASE                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ FOUNDATION LAYER (Universal Skills)                                  │
│ ═══════════════════════════════════                                  │
│                                                                      │
│ Step 1: "Meeting New People" ⭐ (Current)                            │
│ ├── Tier 1: Core 100 words                                           │
│ ├── Vocab: greetings, names, basic questions                         │
│ ├── Questions: "What is...?", "Where are...?"                        │
│ └── Practice: Meet a new colleague (AI)                              │
│                                                                      │
│ Step 2: "Asking for Help" 🔒                                         │
│ ├── Tier 1: Core 100 words                                           │
│ ├── Vocab: requests, directions, clarification                       │
│ ├── Questions: "Can you...?", "Could you...?"                        │
│ └── Practice: Ask for directions (AI)                                │
│                                                                      │
│ Step 3: "Chatting with Friends" 🔒                                   │
│ ├── Tier 2: Essential 500 words                                      │
│ ├── Vocab: casual speech, activities, plans                          │
│ ├── Questions: "How was...?", "Did you...?"                          │
│ └── Practice: Weekend catch-up (AI)                                  │
│                                                                      │
│ Step 4: "Food & Restaurants" 🔒                                      │
│ ├── Tier 2: Essential 500 words                                      │
│ ├── Vocab: food, ordering, preferences                               │
│ ├── Questions: "What do you recommend?", "Does this have...?"        │
│ └── Practice: Order lunch with colleague (AI)                        │
│                                                                      │
│ Step 5: "Shopping & Buying" 🔒                                       │
│ ├── Tier 3: Fluent 1000 words                                        │
│ ├── Vocab: money, sizes, comparisons                                 │
│ ├── Questions: "How much...?", "Do you have...?"                     │
│ └── Practice: Buy office supplies (AI)                               │
│                                                                      │
│ Step 6: "Talking About Yourself" 🔒                                  │
│ ├── Tier 3: Fluent 1000 words                                        │
│ ├── Vocab: biography, experiences, opinions                          │
│ ├── Questions: "Have you ever...?", "What do you think?"             │
│ └── Practice: Tell your story to new friend (AI)                     │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ MIXED LAYER (Advanced Universal + Intro Field)                       │
│ ══════════════════════════════════════════════                       │
│                                                                      │
│ Step 7: "Expressing Opinions" 🔒                                     │
│ ├── Tier 4: Advanced 2000 words                                      │
│ ├── Vocab: agreement, disagreement, reasoning                        │
│ ├── Questions: "Don't you agree?", "Why do you think...?"            │
│ └── Practice: Discuss a topic with friend (AI)                       │
│                                                                      │
│ Step 8: "Day at the Office" 🔒 [FIELD INTRO]                         │
│ ├── Tier 4: Advanced 2000 words                                      │
│ ├── Vocab: office, tasks, colleagues, schedule                       │
│ ├── Questions: "Where is...?", "When is...?", "Who handles...?"      │
│ └── Practice: First day at work (AI)                                 │
│                                                                      │
│ Step 9: "Phone Calls & Messages" 🔒                                  │
│ ├── Tier 4: Advanced 2000 words                                      │
│ ├── Vocab: calls, voicemail, texting                                 │
│ ├── Questions: "Is this...?", "Can I speak to...?"                   │
│ └── Practice: Schedule meeting by phone (AI)                         │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ SPECIALIZATION LAYER (Career Focus)                                  │
│ ═══════════════════════════════════                                  │
│                                                                      │
│ Step 10: "Job Interview" 🔒 [USER SELECTED]                          │
│ ├── Tier 5: Specialist vocabulary                                    │
│ ├── Vocab: resume, experience, qualifications, salary                │
│ ├── Questions: "What does this role involve?", "What's the team?"    │
│ └── Practice: Full interview simulation (AI)                         │
│                                                                      │
│ Step 11: "Business Meeting" 🔒 [USER SELECTED]                       │
│ ├── Tier 5: Specialist vocabulary                                    │
│ ├── Vocab: agenda, proposals, decisions, action items                │
│ ├── Questions: "What's the status?", "Who's responsible?"            │
│ └── Practice: Project status meeting (AI)                            │
│                                                                      │
│ Step 12: "Giving a Presentation" 🔒                                  │
│ ├── Tier 5: Specialist vocabulary                                    │
│ ├── Vocab: slides, data, conclusions, Q&A                            │
│ ├── Questions: "Any questions?", "Does that make sense?"             │
│ └── Practice: Present to team (AI)                                   │
│                                                                      │
│ Step 13: "Emergency Situations" 🔒 [ALWAYS INCLUDED]                 │
│ ├── Tier 4: Advanced words                                           │
│ ├── Vocab: emergency, health, safety                                 │
│ ├── Questions: "Where is the hospital?", "Can you call...?"          │
│ └── Practice: Handle emergency (AI)                                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Vocabulary-Scenario Connection

### Database Schema

```sql
-- Vocabulary words with tier and frequency
CREATE TABLE vocabulary_words (
  id TEXT PRIMARY KEY,
  word TEXT NOT NULL,
  translation TEXT NOT NULL,
  language TEXT NOT NULL,

  -- Frequency/tier data
  frequency_rank INTEGER NOT NULL,  -- 1 = most common
  tier INTEGER NOT NULL,            -- 1-5

  -- Categorization
  part_of_speech TEXT,
  category TEXT,                    -- 'greetings', 'food', 'business', etc.

  -- Audio/pronunciation
  audio_url TEXT,
  phonetic TEXT,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Scenarios
CREATE TABLE scenarios (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,

  -- Type
  type TEXT NOT NULL,               -- 'universal' or 'field-specific'
  field TEXT,                       -- 'career', 'travel', etc. (null for universal)
  tier INTEGER NOT NULL,            -- Minimum tier to unlock

  -- Content
  setting TEXT,
  user_role TEXT,
  ai_role TEXT,
  objectives JSON,

  -- Survival phrases for this scenario
  survival_phrases JSON,

  -- Question patterns to practice
  question_patterns JSON,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Many-to-many: Which vocabulary belongs to which scenarios
CREATE TABLE scenario_vocabulary (
  id TEXT PRIMARY KEY,
  scenario_id TEXT NOT NULL,
  word_id TEXT NOT NULL,

  -- How important is this word for this scenario?
  importance TEXT NOT NULL,         -- 'essential', 'useful', 'advanced'

  FOREIGN KEY (scenario_id) REFERENCES scenarios(id),
  FOREIGN KEY (word_id) REFERENCES vocabulary_words(id),
  UNIQUE(scenario_id, word_id)
);

-- Phrases (multi-word expressions)
CREATE TABLE phrases (
  id TEXT PRIMARY KEY,
  phrase TEXT NOT NULL,
  translation TEXT NOT NULL,
  language TEXT NOT NULL,

  -- Categorization
  type TEXT NOT NULL,               -- 'key', 'street', 'survival'
  formality TEXT,                   -- 'formal', 'informal', 'neutral'

  -- Audio
  audio_url TEXT,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Many-to-many: Phrases to scenarios
CREATE TABLE scenario_phrases (
  id TEXT PRIMARY KEY,
  scenario_id TEXT NOT NULL,
  phrase_id TEXT NOT NULL,
  phrase_type TEXT NOT NULL,        -- 'key', 'street', 'survival'

  FOREIGN KEY (scenario_id) REFERENCES scenarios(id),
  FOREIGN KEY (phrase_id) REFERENCES phrases(id),
  UNIQUE(scenario_id, phrase_id)
);

-- Question patterns
CREATE TABLE question_patterns (
  id TEXT PRIMARY KEY,
  pattern TEXT NOT NULL,            -- "Do you...?", "Have you...?"
  language TEXT NOT NULL,

  -- Teaching level
  tier INTEGER NOT NULL,            -- When to introduce this pattern

  -- Examples
  examples JSON,                    -- ["Do you speak English?", "Do you have...?"]

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Many-to-many: Patterns to scenarios
CREATE TABLE scenario_question_patterns (
  id TEXT PRIMARY KEY,
  scenario_id TEXT NOT NULL,
  pattern_id TEXT NOT NULL,

  -- Field-specific example questions for this scenario
  field_questions JSON,             -- ["Do you have experience in...?"]

  FOREIGN KEY (scenario_id) REFERENCES scenarios(id),
  FOREIGN KEY (pattern_id) REFERENCES question_patterns(id),
  UNIQUE(scenario_id, pattern_id)
);

-- User's staircase (generated learning path)
CREATE TABLE user_staircases (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,

  -- Generation metadata
  primary_goal TEXT NOT NULL,
  proficiency_level TEXT NOT NULL,
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- Progress
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER NOT NULL,

  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Steps in the user's staircase
CREATE TABLE staircase_steps (
  id TEXT PRIMARY KEY,
  staircase_id TEXT NOT NULL,
  step_number INTEGER NOT NULL,

  -- Linked scenario
  scenario_id TEXT NOT NULL,
  vocabulary_tier INTEGER NOT NULL,

  -- Status
  status TEXT DEFAULT 'locked',     -- 'locked', 'current', 'completed'

  -- Completion tracking
  vocabulary_mastery INTEGER DEFAULT 0,
  questions_asked INTEGER DEFAULT 0,
  scenario_completed BOOLEAN DEFAULT FALSE,
  completed_at DATETIME,

  FOREIGN KEY (staircase_id) REFERENCES user_staircases(id),
  FOREIGN KEY (scenario_id) REFERENCES scenarios(id)
);

-- User's progress on individual words
CREATE TABLE user_vocabulary_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  word_id TEXT NOT NULL,

  -- SM-2 spaced repetition data
  ease_factor REAL DEFAULT 2.5,
  interval INTEGER DEFAULT 0,
  repetitions INTEGER DEFAULT 0,
  next_review DATETIME,

  -- Status
  status TEXT DEFAULT 'new',        -- 'new', 'learning', 'learned', 'mastered'

  -- Stats
  times_reviewed INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (word_id) REFERENCES vocabulary_words(id),
  UNIQUE(user_id, word_id)
);
```

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    USER JOURNEY FLOW                                 │
└─────────────────────────────────────────────────────────────────────┘

                              START
                                │
                                ▼
                    ┌───────────────────────┐
                    │     ONBOARDING        │
                    │                       │
                    │ • Select goal         │
                    │ • Choose scenarios    │
                    │ • Set commitment      │
                    └───────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   AI GENERATES        │
                    │   STAIRCASE           │
                    │                       │
                    │ • Foundation steps    │
                    │ • Field steps         │
                    │ • Vocabulary bundles  │
                    └───────────────────────┘
                                │
                                ▼
         ┌──────────────────────────────────────────────┐
         │                                              │
         │              HOME: STAIRCASE VIEW            │
         │                                              │
         │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐        │
         │  │  1  │→ │  2  │→ │  3  │→ │ ... │        │
         │  │ ⭐  │  │ 🔒  │  │ 🔒  │  │ 🔒  │        │
         │  └─────┘  └─────┘  └─────┘  └─────┘        │
         │                                              │
         └──────────────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   ENTER CURRENT STEP  │
                    │                       │
                    │   "Meeting New        │
                    │    People"            │
                    └───────────────────────┘
                                │
            ┌───────────────────┼───────────────────┐
            │                   │                   │
            ▼                   ▼                   ▼
    ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
    │  VOCABULARY   │  │   QUESTION    │  │   PRACTICE    │
    │    BLOCK      │  │    BLOCK      │  │    BLOCK      │
    │               │  │               │  │               │
    │ • Flashcards  │  │ • Patterns    │  │ • AI Chat     │
    │ • Phrases     │  │ • Field Qs    │  │ • Reading     │
    │ • Survival    │  │ • Drill       │  │ • Writing     │
    └───────────────┘  └───────────────┘  └───────────────┘
            │                   │                   │
            └───────────────────┼───────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   COMPLETION CHECK    │
                    │                       │
                    │ • 70% vocab mastery   │
                    │ • 3+ questions asked  │
                    │ • Scenario complete   │
                    └───────────────────────┘
                                │
                        ┌───────┴───────┐
                        │               │
                        ▼               ▼
                    PASSED          NOT YET
                        │               │
                        ▼               │
              ┌─────────────────┐       │
              │  UNLOCK NEXT    │       │
              │     STEP        │       │
              └─────────────────┘       │
                        │               │
                        └───────┬───────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   BACK TO STAIRCASE   │
                    │       VIEW            │
                    └───────────────────────┘
```

---

## Integration Points

### With Existing Systems

| System | Integration |
|--------|-------------|
| **Flashcard System** | Cards are now scenario-specific vocabulary |
| **Voice Conversation** | AI roleplay uses scenario context |
| **Onboarding** | Captures goal + scenarios for staircase generation |
| **Points System** | Points awarded per step completion |
| **Progress Tracking** | Per-word mastery feeds into step completion |

### API Functions Needed

```typescript
// Generate staircase from onboarding data
async function generateUserStaircase(userId: string, onboardingData: OnboardingData): Promise<Staircase>;

// Get current step with all blocks
async function getCurrentStep(userId: string): Promise<StaircaseStep>;

// Get vocabulary for current step
async function getStepVocabulary(stepId: string): Promise<VocabularyBundle>;

// Get question patterns for current step
async function getStepQuestions(stepId: string): Promise<QuestionBundle>;

// Mark step as complete
async function completeStep(userId: string, stepId: string, stats: StepStats): Promise<NextStep>;

// Get scenario for AI conversation
async function getScenarioForConversation(scenarioId: string): Promise<ConversationScenario>;
```

---

## Success Metrics

| Metric | Target | Rationale |
|--------|--------|-----------|
| Foundation completion rate | >80% | Users finish universal scenarios |
| Step progression rate | >70% | Users advance through staircase |
| Vocabulary retention (1 week) | >60% | Words stick after learning |
| Question usage in practice | >3/scenario | Users actively asking questions |
| Field scenario completion | >60% | Users reach specialization |

---

## Next Steps

1. **Seed Vocabulary Data**: Top 2000 words with tier assignments
2. **Create Scenario Templates**: All universal + field scenarios
3. **Build Question Pattern Library**: Patterns with examples
4. **Implement Staircase Generator**: AI-based path creation
5. **Connect to Existing Systems**: Flashcards, Voice, Progress

---

*Document Version: 1.0*
*Last Updated: 2025-01-02*
