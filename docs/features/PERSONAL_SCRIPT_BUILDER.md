# Feature: Personal Script Builder

**Created**: 2024-12-09
**Last Updated**: 2024-12-09 21:45
**Owner**: Angel Polanco
**Priority**: P1 (MVP Differentiator)
**Status**: Planned

---

## Overview

### What It Does
Personal Script Builder allows users to write their own scripts (daily routines, self-introductions, interview answers, etc.) which AI then analyzes, corrects, and enhances. The improved script becomes teleprompter content for speaking practice. This creates a complete write-analyze-practice loop.

### Why It Matters
- **Personal Relevance**: Users practice content they actually need (their real routines, real interviews, real introductions)
- **Active Learning**: Writing activates deeper language processing than passive consumption
- **Immediate Application**: The text they write becomes material they practice speaking
- **TBLT Integration**: Connects to Task-Based Language Teaching - real tasks with real outcomes
- **Addresses User Pain Point**: Users struggle to describe daily life, jobs, routines in target language

### TBLT Connection
This feature is a **key implementation of Task-Based Language Teaching**:
- **Authentic Task**: Describe YOUR routine, prepare for YOUR interview
- **Meaningful Output**: Creates usable speaking scripts
- **Incidental Learning**: Grammar/vocabulary acquired through use
- **Real-World Transfer**: Practiced scripts transfer to actual situations

---

## User Stories

1. As a learner preparing for a job interview, I want to write my introduction in the target language, get it corrected, and practice speaking it smoothly.

2. As a beginner learner, I want to describe my daily routine, have AI improve my grammar, and practice saying it until it's natural.

3. As someone moving to a new country, I want to prepare scripts for common situations (doctor visits, banking, shopping) that I can practice and memorize.

4. As an intermediate learner, I want to express complex ideas (opinions, stories, plans) and learn better ways to phrase them.

---

## User Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                     PERSONAL SCRIPT BUILDER                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  STEP 1: CHOOSE SCENARIO                                            │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  What would you like to practice?                             │  │
│  │                                                                │  │
│  │  [Daily Routine]  [Self-Introduction]  [Job Interview]       │  │
│  │  [Travel Scenario]  [Custom Topic]                            │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  STEP 2: WRITE YOUR SCRIPT                                          │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Describe your morning routine in French:                     │  │
│  │                                                                │  │
│  │  "Je me reveille a 7 heures. Je prends le petit dejeuner     │  │
│  │   avec mon famille. Apres, je va au travail en metro..."     │  │
│  │                                                                │  │
│  │  [150 words]                              [Analyze Script →]  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  STEP 3: AI ANALYSIS & ENHANCEMENT                                  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                                                                │  │
│  │  📝 GRAMMAR CORRECTIONS                                       │  │
│  │  ────────────────────────────────────────────────────────────  │
│  │  • "je va" → "je vais" (verb conjugation)                    │  │
│  │  • "reveille" → "réveille" (accent missing)                  │  │
│  │  • "mon famille" → "ma famille" (gender agreement)           │  │
│  │                                                                │  │
│  │  📚 VOCABULARY ENHANCEMENTS                                   │  │
│  │  ────────────────────────────────────────────────────────────  │
│  │  • "petit dejeuner" → Consider: "Je prends mon petit-        │  │
│  │    déjeuner" (more natural phrasing)                         │  │
│  │  • Add: "vers 7h" instead of "a 7 heures" (more casual)      │  │
│  │                                                                │  │
│  │  💡 BETTER WAYS TO SAY IT                                     │  │
│  │  ────────────────────────────────────────────────────────────  │
│  │  Original: "Je va au travail en metro"                       │  │
│  │  Better: "Je prends le métro pour aller au travail"          │  │
│  │  Why: More natural expression, better verb usage             │  │
│  │                                                                │  │
│  │  ✨ YOUR IMPROVED SCRIPT                                      │  │
│  │  ────────────────────────────────────────────────────────────  │
│  │  "Je me réveille vers 7 heures. Je prends mon petit-         │  │
│  │   déjeuner avec ma famille. Ensuite, je prends le métro      │  │
│  │   pour aller au travail..."                                   │  │
│  │                                                                │  │
│  │  [Accept All] [Edit Manually] [Practice in Teleprompter →]   │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  STEP 4: PRACTICE IN TELEPROMPTER                                   │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Your improved script is ready to practice!                   │  │
│  │                                                                │  │
│  │  • Read aloud with smooth scrolling                          │  │
│  │  • Record your voice                                          │  │
│  │  • Get pronunciation feedback                                 │  │
│  │  • Repeat until natural                                       │  │
│  │                                                                │  │
│  │  [Start Practice Session]                                     │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Technical Specification

### Architecture

```
┌────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  Script Input  │ ──▶ │  Gemini AI      │ ──▶ │  Enhanced Script │
│  (User writes) │     │  Analysis       │     │  + Corrections   │
└────────────────┘     └─────────────────┘     └────────┬─────────┘
                                                        │
                                                        ▼
┌────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  Word Bank     │ ◀── │  Save Script    │ ◀── │  User Accepts    │
│  (New vocab)   │     │  to Library     │     │  Changes         │
└────────────────┘     └─────────────────┘     └────────┬─────────┘
                                                        │
                                                        ▼
                                               ┌──────────────────┐
                                               │  Teleprompter    │
                                               │  Practice Mode   │
                                               └──────────────────┘
```

### Data Model

```typescript
interface PersonalScript {
  id: string;
  userId: string;

  // Content
  title: string;
  category: ScriptCategory;
  originalText: string;           // User's original writing
  correctedText: string;          // AI-improved version
  finalText: string;              // User's accepted version

  // Analysis Results
  analysis: ScriptAnalysis;

  // Metadata
  targetLanguage: string;
  wordCount: number;
  difficultyLevel: CEFRLevel;

  // Practice Stats
  practiceCount: number;
  lastPracticed: Date | null;
  averageReadingTime: number;

  // Source
  linkedScenarioId?: string;      // If created from TBLT scenario

  createdAt: Date;
  updatedAt: Date;
}

type ScriptCategory =
  | 'daily_routine'
  | 'self_introduction'
  | 'job_interview'
  | 'travel'
  | 'opinion'
  | 'story'
  | 'custom';

interface ScriptAnalysis {
  // Grammar
  grammarCorrections: GrammarCorrection[];
  grammarScore: number;           // 0-100

  // Vocabulary
  vocabularyEnhancements: VocabularyEnhancement[];
  newWordsIntroduced: string[];   // Words to add to Word Bank

  // Style
  betterPhrasings: BetterPhrasing[];
  styleNotes: string[];

  // Structure
  structureSuggestions: string[];
  improvedStructure?: string;

  // Overall
  overallFeedback: string;
  strengthsIdentified: string[];
  areasToImprove: string[];
}

interface GrammarCorrection {
  original: string;
  corrected: string;
  explanation: string;
  grammarRule: string;            // e.g., "verb conjugation", "gender agreement"
  position: { start: number; end: number };
}

interface VocabularyEnhancement {
  original: string;
  suggested: string;
  reason: string;
  formalityLevel: 'casual' | 'neutral' | 'formal';
}

interface BetterPhrasing {
  original: string;
  suggested: string;
  explanation: string;
  category: 'natural' | 'idiomatic' | 'precise' | 'elegant';
}
```

### Components

| Component | Path | Description |
|-----------|------|-------------|
| ScriptBuilderScreen | `/app/script-builder.tsx` | Main entry screen |
| ScriptEditor | `/components/scripts/ScriptEditor.tsx` | Text input with word count |
| ScriptAnalysisCard | `/components/scripts/ScriptAnalysisCard.tsx` | Display AI analysis |
| CorrectionsList | `/components/scripts/CorrectionsList.tsx` | Interactive corrections |
| EnhancedScriptView | `/components/scripts/EnhancedScriptView.tsx` | Side-by-side comparison |
| CategorySelector | `/components/scripts/CategorySelector.tsx` | Scenario type picker |

### Hooks

| Hook | Path | Description |
|------|------|-------------|
| useScriptAnalysis | `/hooks/useScriptAnalysis.ts` | Gemini AI integration |
| usePersonalScripts | `/hooks/usePersonalScripts.ts` | CRUD operations |
| useScriptToTeleprompter | `/hooks/useScriptToTeleprompter.ts` | Convert to passage |

### API/Database

| Table/Endpoint | Description |
|----------------|-------------|
| personal_scripts | Store user scripts and analyses |
| script_practices | Track practice sessions |

---

## AI Prompt Engineering

### Script Analysis Prompt

```typescript
const SCRIPT_ANALYSIS_PROMPT = `
You are an expert language tutor analyzing a student's written script.
The student is learning ${targetLanguage} at ${proficiencyLevel} level.

THEIR SCRIPT:
"""
${userScript}
"""

CONTEXT: ${category} (e.g., daily routine, job interview, etc.)

Provide a comprehensive analysis in JSON format:

{
  "grammarCorrections": [
    {
      "original": "exact text with error",
      "corrected": "corrected version",
      "explanation": "Brief, friendly explanation",
      "grammarRule": "Rule name (e.g., 'verb conjugation')"
    }
  ],

  "vocabularyEnhancements": [
    {
      "original": "word or phrase",
      "suggested": "better alternative",
      "reason": "Why this is better",
      "formalityLevel": "casual|neutral|formal"
    }
  ],

  "betterPhrasings": [
    {
      "original": "awkward phrase",
      "suggested": "more natural version",
      "explanation": "Why natives say it this way",
      "category": "natural|idiomatic|precise|elegant"
    }
  ],

  "structureSuggestions": [
    "Suggestion for better text organization"
  ],

  "improvedFullScript": "The complete improved version of their script",

  "overallFeedback": "2-3 sentences of encouraging feedback",
  "strengthsIdentified": ["What they did well"],
  "areasToImprove": ["Key areas to focus on"]
}

GUIDELINES:
- Be encouraging, not critical
- Explain WHY corrections are made (learning opportunity)
- Preserve the user's personal meaning and style
- Focus on practical, real-world usage
- For beginners: Focus on basic errors
- For intermediate: Introduce idioms and natural expressions
- For advanced: Polish style and sophistication
`;
```

---

## Integration Points

### With Teleprompter
```typescript
// Convert PersonalScript to Passage for teleprompter
function scriptToPassage(script: PersonalScript): Passage {
  return {
    id: `script-${script.id}`,
    title: script.title,
    text: script.finalText,
    difficulty: mapCEFRToDifficulty(script.difficultyLevel),
    category: 'Personal',
    wordCount: script.wordCount,
    estimatedDuration: calculateReadingTime(script.finalText),
    sourceType: 'personal_script',
  };
}
```

### With Word Bank
```typescript
// Add new vocabulary from script analysis to Word Bank
async function saveNewVocabulary(analysis: ScriptAnalysis) {
  for (const word of analysis.newWordsIntroduced) {
    await addOrReinforceWord({
      word: word,
      source: 'script_builder',
      context: 'personal_script',
    });
  }
}
```

### With TBLT Scenarios
```typescript
// Pre-fill script builder from scenario
function createScriptFromScenario(scenario: Scenario): Partial<PersonalScript> {
  return {
    category: mapScenarioToCategory(scenario.category),
    title: `Practice: ${scenario.title}`,
    linkedScenarioId: scenario.id,
  };
}
```

---

## Implementation Status

### TODO
- [ ] Create database schema for personal_scripts
- [ ] Build ScriptEditor component with word count
- [ ] Implement Gemini AI analysis integration
- [ ] Build ScriptAnalysisCard with interactive corrections
- [ ] Add side-by-side comparison view
- [ ] Integrate with Teleprompter (passage conversion)
- [ ] Integrate with Word Bank (vocabulary saving)
- [ ] Add category templates with prompts
- [ ] Build script library/history view
- [ ] Add practice statistics tracking

---

## Dependencies

### Requires
- [x] Gemini AI Integration (exists)
- [x] Teleprompter Card (exists)
- [x] Word Bank System (exists)
- [ ] SCENARIOS System (partial)

### Required By
- [ ] AI Conversation Practice (can use scripts as topics)
- [ ] Progress Dashboard (script count, practice stats)

---

## UI/UX Considerations

### Writing Experience
- Large, comfortable text input area
- Real-time word count
- Auto-save drafts
- Template suggestions based on category
- Examples button ("Show me an example")

### Analysis Display
- Color-coded corrections (grammar = red, vocab = blue, style = green)
- Tap correction to see explanation
- Toggle between original and improved
- Accept individual changes or all at once

### Practice Loop
- One-tap to teleprompter
- Track practice count per script
- "Master this script" progression (5 practices = mastered)

---

## Success Metrics

| Metric | Target | Rationale |
|--------|--------|-----------|
| Scripts created per user | >3/month | Users find value |
| Script-to-practice rate | >70% | Completing the loop |
| Corrections accepted | >80% | AI quality |
| Return to edit | <20% | Good first analysis |
| Practice sessions per script | >2 avg | Building mastery |

---

## Example Use Cases

### Use Case 1: Job Interview Prep
1. User selects "Job Interview" category
2. Writes: "I have 5 years experience in marketing..."
3. AI corrects grammar, suggests formal vocabulary
4. AI adds: "I specialize in digital campaigns" (more impactful)
5. User practices in teleprompter until confident
6. User nails the real interview!

### Use Case 2: Daily Routine (Beginner)
1. User selects "Daily Routine"
2. Writes basic sentences with errors
3. AI gently corrects verb conjugations
4. AI teaches time expressions ("vers 7h" vs "à 7 heures")
5. New vocabulary added to Word Bank
6. User practices until routine description is natural

### Use Case 3: Travel Preparation
1. User selects "Travel Scenario"
2. Writes: Questions they'll need to ask
3. AI improves politeness ("Could you..." vs "Can you...")
4. AI adds useful phrases ("Where is the nearest...?")
5. User has a ready script for their trip

---

## Changelog

### 2024-12-09
- Initial documentation created
- Feature concept defined
- Technical specification outlined
- Integration points identified

---

*This feature bridges the gap between knowing vocabulary and using it naturally in personal contexts. It transforms the teleprompter from a reading tool into a complete self-expression practice system.*
