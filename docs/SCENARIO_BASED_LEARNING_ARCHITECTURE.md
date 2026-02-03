# Scenario-Based Learning Architecture

> **Status**: Core Philosophy Document
> **Created**: 2025-01-02
> **Author**: Angel Polanco
> **Research Base**: TBLT (d = 0.93 effect size), Personal Language Learning Experience

---

## Executive Summary

Vox Language uses a **Scenario-Based Learning Architecture** where every element of the app serves one purpose: **preparing users to handle real-world situations with confidence**.

The core insight comes from proven language acquisition:
> "Fluency comes from scenarios. The vocabulary you need, the phrases you'll use, and the questions you must ask—all connected to situations you'll actually face."

---

## The Three Pillars

```
┌─────────────────────────────────────────────────────────────────────┐
│                 VOX SCENARIO-BASED LEARNING MODEL                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   PILLAR 1: VOCABULARY PREPARATION                                   │
│   ════════════════════════════════                                   │
│   Flashcards as scenario-specific building blocks                    │
│   └─ Words you NEED for each situation                               │
│   └─ Phrases for the field and street                                │
│   └─ Survival expressions (clarification, repetition)               │
│                                                                      │
│   PILLAR 2: QUESTION MASTERY                                         │
│   ═════════════════════════════                                      │
│   Dedicated block in every staircase step                            │
│   └─ Essential questions for user's field/life                       │
│   └─ Question patterns (Do you? Did you? Have you?)                  │
│   └─ Situation-specific inquiries                                    │
│                                                                      │
│   PILLAR 3: REAL-WORLD PRACTICE                                      │
│   ═════════════════════════════                                      │
│   Apply vocabulary with practice partners                            │
│   └─ AI Conversations (judgment-free practice)                       │
│   └─ Human Partners (real interaction)                               │
│   └─ Reading & Writing (comprehension + production)                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Pillar 1: Vocabulary Preparation

### Philosophy

Vocabulary isn't learned in isolation—it's learned FOR situations. Every word in Vox belongs to a scenario context.

### Scenario Vocabulary Bundles

Each scenario has a dedicated vocabulary bundle:

```typescript
interface ScenarioVocabularyBundle {
  scenarioId: string;
  scenarioName: string;  // "Ordering Coffee", "Job Interview", "Doctor Visit"

  // Core vocabulary for this situation
  essentialWords: VocabularyItem[];      // Must-know words
  usefulPhrases: PhraseItem[];           // Common expressions
  streetPhrases: StreetPhraseItem[];     // Informal/colloquial versions

  // Survival phrases (universal across scenarios)
  clarificationPhrases: ClarificationPhrase[];

  // Question patterns relevant to this scenario
  questionPatterns: QuestionPattern[];
}
```

### Street Phrases & Survival Expressions

Every user MUST learn these universal survival phrases early:

#### Clarification Phrases (Critical for Real Conversations)

| English | Spanish | Use Case |
|---------|---------|----------|
| "Speak slowly, please" | "Habla más despacio, por favor" | When they speak too fast |
| "I didn't catch that" | "No entendí eso" / "No lo pillé" | Missed what they said |
| "What was that again?" | "¿Qué dijiste?" / "¿Cómo?" | Need repetition |
| "What did you say?" | "¿Qué dijiste?" / "¿Perdona?" | Polite repetition request |
| "Do you know...?" | "¿Sabes...?" / "¿Conoces...?" | Asking for information |
| "Can you repeat that?" | "¿Puedes repetir?" | Direct request |
| "I don't understand" | "No entiendo" | Honest admission |
| "How do you say...?" | "¿Cómo se dice...?" | Learning in the moment |
| "What does X mean?" | "¿Qué significa X?" | Asking for meaning |
| "Sorry, my Spanish is limited" | "Perdón, mi español es limitado" | Setting expectations |

#### Street vs. Formal Versions

```
┌─────────────────────────────────────────────────────────────┐
│ FORMAL (Textbook)          │  STREET (Real Conversations)   │
├─────────────────────────────────────────────────────────────┤
│ "¿Podría repetir?"         │  "¿Cómo?" / "¿Qué?"            │
│ "No he comprendido"        │  "No pillé" / "No entendí"     │
│ "¿Disculpe?"               │  "¿Eh?" / "¿Mande?" (Mexico)   │
│ "Hable más despacio"       │  "Más lento, porfa"            │
│ "¿Sería tan amable de...?" │  "¿Me puedes...?"              │
└─────────────────────────────────────────────────────────────┘
```

### Implementation: Vocabulary in Staircase Steps

Each step in the AI-generated staircase includes:

```typescript
interface StaircaseStep {
  id: string;
  title: string;
  scenario: ScenarioContext;

  // VOCABULARY BLOCK
  vocabularyBlock: {
    essentialWords: Word[];        // 5-10 core words
    keyPhrases: Phrase[];          // 3-5 key expressions
    streetVersions: Phrase[];      // Informal alternatives
    survivalPhrases: Phrase[];     // Clarification expressions
  };

  // QUESTION BLOCK (New - see Pillar 2)
  questionBlock: QuestionMasteryBlock;

  // PRACTICE BLOCK
  practiceBlock: {
    flashcardSession: FlashcardConfig;
    conversationScenario: ScenarioConfig;
    readingExercise?: ReadingConfig;
    writingTask?: WritingConfig;
  };
}
```

---

## Pillar 2: Question Mastery Block

### Philosophy

**Questions are the key to conversations.** A person who can ask questions controls the conversation, learns actively, and never gets stuck. Every staircase step includes a dedicated Question Mastery Block.

### The Question Mastery Block Structure

```typescript
interface QuestionMasteryBlock {
  stepId: string;
  userField: string;           // "career", "travel", "relationships", etc.
  userSituation: string;       // Specific context from onboarding

  // Question patterns to master in this step
  questionPatterns: QuestionPattern[];

  // Field-specific questions
  fieldQuestions: FieldQuestion[];

  // Life situation questions
  lifeQuestions: LifeQuestion[];

  // Practice exercises
  exercises: QuestionExercise[];
}
```

### Universal Question Patterns

These patterns are taught progressively across the staircase:

#### Pattern Categories

| Pattern | English Example | Spanish Example | When to Teach |
|---------|-----------------|-----------------|---------------|
| **Present Simple** | "Do you...?" | "¿Tú...?" / "¿Usted...?" | A1 (Steps 1-3) |
| **Past Simple** | "Did you...?" | "¿...aste?" / "¿...iste?" | A2 (Steps 4-6) |
| **Present Perfect** | "Have you...?" | "¿Has...?" | A2-B1 (Steps 5-8) |
| **Conditional** | "Would you...?" | "¿...rías?" | B1 (Steps 7-10) |
| **Future** | "Will you...?" | "¿Vas a...?" / "¿...rás?" | A2 (Steps 4-6) |
| **Modal Verbs** | "Can you...?" | "¿Puedes...?" | A1 (Steps 2-4) |

#### Pattern Deep Dive: "Do you...?" Family

```
┌─────────────────────────────────────────────────────────────┐
│ PATTERN: Present Simple Questions                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ STRUCTURE:  Do/Does + Subject + Verb (base form) + ?        │
│                                                              │
│ EXAMPLES:                                                    │
│ • Do you speak English?     → ¿Hablas inglés?               │
│ • Do you know where...?     → ¿Sabes dónde...?              │
│ • Do you have...?           → ¿Tienes...?                   │
│ • Do you want...?           → ¿Quieres...?                  │
│ • Do you like...?           → ¿Te gusta...?                 │
│ • Do you understand?        → ¿Entiendes?                   │
│ • Do you need...?           → ¿Necesitas...?                │
│                                                              │
│ FIELD-SPECIFIC (Career - Business):                          │
│ • Do you have experience in...?                              │
│ • Do you work with...?                                       │
│ • Do you know the deadline?                                  │
│                                                              │
│ FIELD-SPECIFIC (Travel):                                     │
│ • Do you accept cards?                                       │
│ • Do you have a room available?                              │
│ • Do you know a good restaurant?                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Pattern Deep Dive: "Did you...?" Family

```
┌─────────────────────────────────────────────────────────────┐
│ PATTERN: Past Simple Questions                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ STRUCTURE:  Did + Subject + Verb (base form) + ?            │
│                                                              │
│ EXAMPLES:                                                    │
│ • Did you see...?           → ¿Viste...?                    │
│ • Did you go to...?         → ¿Fuiste a...?                 │
│ • Did you try...?           → ¿Probaste...?                 │
│ • Did you understand?       → ¿Entendiste?                  │
│ • Did you finish...?        → ¿Terminaste...?               │
│ • Did you receive...?       → ¿Recibiste...?                │
│                                                              │
│ FIELD-SPECIFIC (Relationships):                              │
│ • Did you talk to your family?                               │
│ • Did you meet anyone new?                                   │
│                                                              │
│ FIELD-SPECIFIC (Work):                                       │
│ • Did you send the email?                                    │
│ • Did you finish the project?                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Pattern Deep Dive: "Have you...?" Family

```
┌─────────────────────────────────────────────────────────────┐
│ PATTERN: Present Perfect Questions                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ STRUCTURE:  Have/Has + Subject + Past Participle + ?        │
│                                                              │
│ EXAMPLES:                                                    │
│ • Have you been to...?      → ¿Has estado en...?            │
│ • Have you tried...?        → ¿Has probado...?              │
│ • Have you ever...?         → ¿Alguna vez has...?           │
│ • Have you finished...?     → ¿Has terminado...?            │
│ • Have you heard...?        → ¿Has oído...?                 │
│ • Have you seen...?         → ¿Has visto...?                │
│                                                              │
│ FIELD-SPECIFIC (Travel):                                     │
│ • Have you been to this city before?                         │
│ • Have you tried the local food?                             │
│                                                              │
│ FIELD-SPECIFIC (Career):                                     │
│ • Have you worked with this technology?                      │
│ • Have you managed a team before?                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Field-Specific Question Banks

Based on user's goal from onboarding, provide targeted questions:

#### Career Field Questions

```typescript
const careerQuestions = {
  interview: [
    "What does this position involve?",
    "What are the working hours?",
    "Is there room for growth?",
    "What's the team like?",
    "When can I expect to hear back?",
  ],
  workplace: [
    "Where is the meeting room?",
    "Do you have the report?",
    "When is the deadline?",
    "Can you help me with this?",
    "Who should I talk to about...?",
  ],
  networking: [
    "What do you do?",
    "How long have you worked here?",
    "What projects are you working on?",
    "Do you know anyone in...?",
  ],
};
```

#### Travel Field Questions

```typescript
const travelQuestions = {
  navigation: [
    "Where is the...?",
    "How do I get to...?",
    "Is it far from here?",
    "Which bus goes to...?",
    "Can you show me on the map?",
  ],
  accommodation: [
    "Do you have rooms available?",
    "How much per night?",
    "Is breakfast included?",
    "What time is checkout?",
    "Is there WiFi?",
  ],
  dining: [
    "Do you have a table for...?",
    "What do you recommend?",
    "Is this dish spicy?",
    "Can I have the bill?",
    "Do you accept cards?",
  ],
};
```

#### Relationships Field Questions

```typescript
const relationshipQuestions = {
  gettingToKnow: [
    "Where are you from?",
    "What do you like to do?",
    "Do you have siblings?",
    "What's your favorite...?",
    "How did you learn...?",
  ],
  makingPlans: [
    "Are you free this weekend?",
    "Do you want to go to...?",
    "What time works for you?",
    "Where should we meet?",
    "Have you been there before?",
  ],
  family: [
    "How is your family?",
    "Did you talk to your parents?",
    "What are your plans for...?",
    "Are you coming home for...?",
  ],
};
```

### Question Block in Staircase Step (Example)

```
┌─────────────────────────────────────────────────────────────┐
│ STAIRCASE STEP 3: "Your First Day at Work"                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ 📚 VOCABULARY BLOCK                                          │
│ ├─ Essential: office, meeting, colleague, desk, computer    │
│ ├─ Phrases: "Nice to meet you", "Where is...?"              │
│ └─ Street: "What's up?", "Cool, thanks"                     │
│                                                              │
│ ❓ QUESTION MASTERY BLOCK                                    │
│ ├─ Pattern Focus: "Do you...?" + "Where is...?"             │
│ ├─ Field Questions:                                          │
│ │   • "Do you know where the meeting room is?"              │
│ │   • "Do you have the WiFi password?"                      │
│ │   • "Where is the bathroom?"                              │
│ │   • "Do you know what time lunch is?"                     │
│ │   • "Is there a coffee machine?"                          │
│ └─ Practice: Ask 5 questions to AI colleague                │
│                                                              │
│ 🗣️ PRACTICE BLOCK                                           │
│ ├─ Flashcard Session: 10 workplace words                    │
│ ├─ AI Scenario: Meet your new colleague                     │
│ └─ Writing Task: Introduce yourself via email               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Pillar 3: Real-World Practice

### Philosophy

Vocabulary and questions are TOOLS. Practice is where they become SKILLS. Users practice with two types of partners:

### Practice Partner Types

```
┌─────────────────────────────────────────────────────────────┐
│                    PRACTICE PARTNERS                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🤖 AI PARTNERS (Available Now)                              │
│  ══════════════════════════════                              │
│  • Judgment-free practice environment                        │
│  • Available 24/7                                            │
│  • Multiple accents and personalities                        │
│  • Infinite patience for repetition                          │
│  • Consistent feedback                                       │
│  • Scenario-specific roleplay                                │
│                                                              │
│  USE CASES:                                                  │
│  • Initial practice before human interaction                 │
│  • Building confidence with survival phrases                 │
│  • Mastering question patterns                               │
│  • Low-stakes mistake-making                                 │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  👥 HUMAN PARTNERS (Future Feature)                          │
│  ══════════════════════════════════                          │
│  • Real cultural context                                     │
│  • Authentic reactions and emotions                          │
│  • Unpredictable conversation flow                           │
│  • Community connection                                      │
│  • Mutual learning (language exchange)                       │
│                                                              │
│  USE CASES:                                                  │
│  • Real-world conversation simulation                        │
│  • Cultural nuance learning                                  │
│  • Building relationships                                    │
│  • Testing skills in authentic context                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### The Practice Progression

```
STEP 1: Vocabulary Preparation
         └─ Learn words + phrases for scenario
         └─ Master survival/clarification phrases
         └─ Practice question patterns
                    ↓
STEP 2: AI Practice (Safe Environment)
         └─ Roleplay the scenario with AI
         └─ Use vocabulary in context
         └─ Ask questions to AI partner
         └─ Get feedback, repeat until confident
                    ↓
STEP 3: Human Practice (Real Environment)
         └─ Apply skills with real people
         └─ Navigate authentic conversation
         └─ Use clarification phrases when needed
         └─ Build genuine connections
                    ↓
STEP 4: Real World (The Goal)
         └─ Handle actual situations
         └─ Confidence from preparation
         └─ Survival phrases as safety net
         └─ Questions keep conversation flowing
```

### Reading & Writing Integration

| Mode | Purpose | Scenario Connection |
|------|---------|---------------------|
| **Reading** | Comprehension + exposure | Read dialogues from scenarios before practicing |
| **Writing** | Production + accuracy | Write scripts for upcoming scenarios |
| **Speaking** | Fluency + confidence | Live practice with partners |
| **Listening** | Understanding + recognition | Hear vocabulary in context |

---

## The Complete Staircase Step Structure

Every step in the AI-generated learning path follows this structure:

```typescript
interface CompleteStaircaseStep {
  // Metadata
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  estimatedTime: number;  // minutes

  // Scenario Context
  scenario: {
    name: string;           // "Ordering at a Restaurant"
    setting: string;        // "Casual restaurant in Madrid"
    userRole: string;       // "Customer dining alone"
    partnerRole: string;    // "Waiter/Waitress"
    objectives: string[];   // ["Order a meal", "Ask about ingredients", "Pay the bill"]
  };

  // BLOCK 1: Vocabulary Preparation
  vocabularyBlock: {
    essentialWords: Word[];           // 5-10 must-know words
    keyPhrases: Phrase[];             // 3-5 scenario phrases
    streetPhrases: Phrase[];          // Informal versions
    survivalPhrases: Phrase[];        // Clarification expressions

    // Exercises
    flashcardSession: {
      wordCount: number;
      includesListening: boolean;
      includesSpeaking: boolean;
    };
  };

  // BLOCK 2: Question Mastery (NEW)
  questionBlock: {
    patternFocus: string[];           // ["Do you...?", "Can I...?"]
    fieldQuestions: Question[];       // Based on user's goal
    lifeQuestions: Question[];        // Based on user's situation

    // Exercises
    questionDrill: {
      formQuestions: number;          // Form X questions using pattern
      answerQuestions: number;        // Answer questions from AI
      freeFormPractice: boolean;      // Open conversation focused on questions
    };
  };

  // BLOCK 3: Practice
  practiceBlock: {
    // AI Practice (primary)
    aiConversation: {
      scenarioId: string;
      targetTurns: number;            // 5-10 exchanges
      difficultyLevel: string;
      hintsEnabled: boolean;
    };

    // Reading (optional)
    readingExercise?: {
      type: 'dialogue' | 'story' | 'article';
      previewsScenario: boolean;
    };

    // Writing (optional)
    writingTask?: {
      type: 'script' | 'email' | 'message' | 'journal';
      relatedToScenario: boolean;
    };

    // Human Practice (future)
    humanPractice?: {
      matchingCriteria: string[];
      suggestedTopics: string[];
    };
  };

  // Completion Criteria
  completion: {
    vocabularyMastery: number;        // % of words at "learned" status
    questionsAsked: number;           // Minimum questions used in practice
    scenarioCompleted: boolean;       // Finished AI conversation
    pointsEarned: number;
  };
}
```

---

## Alignment Checklist

All Vox features must align with this architecture:

### Feature Alignment

| Feature | Aligned? | How It Fits |
|---------|----------|-------------|
| **Flashcards** | ✅ | Vocabulary preparation for scenarios |
| **AI Conversations** | ✅ | Practice scenarios with AI partner |
| **Reading Practice** | ✅ | Comprehension of scenario dialogues |
| **Writing Practice** | ✅ | Production before/after scenarios |
| **Staircase/Learning Path** | ✅ | Progression through scenarios |
| **Points System** | ✅ | Rewards trying in scenarios |
| **Onboarding** | ✅ | Identifies user's target scenarios (field, goals) |
| **Voice Accents** | ✅ | Regional scenario authenticity |

### Questions to Ask for New Features

1. **What scenario does this prepare the user for?**
2. **Does it include survival/clarification phrases?**
3. **Are there question patterns to master?**
4. **Can the user practice with AI and/or humans?**
5. **Does it connect to the user's field/life situation?**

---

## Success Metrics

| Metric | Target | Rationale |
|--------|--------|-----------|
| Scenario completion rate | >70% | Users finishing scenario practice |
| Survival phrase usage | >50% of users | Using clarification phrases |
| Questions asked per scenario | >3 | Active questioning in practice |
| Field relevance rating | >4/5 | Vocabulary feels relevant to user |
| "Ready for real world" confidence | >70% | Users feel prepared |

---

## Summary

**Vox is not a vocabulary app that has conversations. It's a scenario preparation system that uses vocabulary, questions, and practice to prepare users for real-world situations.**

The three pillars work together:
1. **Vocabulary** = The words you need
2. **Questions** = The tools to navigate any conversation
3. **Practice** = The confidence to use them

Every feature, every staircase step, every exercise serves one goal: **Get the user ready to handle real situations with real people.**

---

## Related Documents

| Document | Description |
|----------|-------------|
| [STAIRCASE_SCENARIO_MAPPING.md](./features/STAIRCASE_SCENARIO_MAPPING.md) | Complete system design for how AI builds learning paths through scenarios |
| [SCENARIOS.md](./features/SCENARIOS.md) | TBLT research and scenario system details |
| [PROJECT_STATUS.md](./PROJECT_STATUS.md) | Current project status with architecture summary |

---

*Document Version: 1.1*
*Last Updated: 2025-01-02*
*Next Review: After implementation begins*
