# Cognate Learning Module - Implementation Plan

**Status**: Approved by Roundtable (2026-01-21)
**Priority**: P2 Feature (post-MVP)
**Estimated Effort**: 2 weeks Phase 1

---

## Overview

Build a cognate-based learning system that teaches users they "already know" thousands of words through pattern recognition. Uses the "-tion → -ción" transformation as proof of concept.

### The Science Behind It
- **Cognate Facilitation Effect**: 20-40% faster neural processing
- **Statistics**: 30-40% of English words have Spanish cognates
- **Psychological Impact**: Reduces language anxiety, builds confidence

---

## Phase 1: MVP (2 Weeks)

### Track 1: Standalone Module

#### New Files to Create

```
lib/learning/cognateEngine.ts       # Pattern transformation logic
lib/data/cognatePatterns.ts         # Curated word lists
components/cards/CognateDiscoveryCard.tsx  # Main reveal card
```

#### cognateEngine.ts

```typescript
// Pattern definitions
export const COGNATE_PATTERNS = {
  'tion-cion': {
    id: 'tion-cion',
    name: 'The -tion Pattern',
    englishSuffix: 'tion',
    spanishSuffix: 'ción',
    description: 'English words ending in -tion become -ción in Spanish',
    examples: [
      { english: 'nation', spanish: 'nación', phonetic: '/naˈsjon/' },
      { english: 'information', spanish: 'información', phonetic: '/infoɾmaˈsjon/' },
      { english: 'situation', spanish: 'situación', phonetic: '/situaˈsjon/' },
    ],
    falseFriends: [
      {
        english: 'embarrassed',
        wrongSpanish: 'embarazada',
        correctSpanish: 'avergonzado/a',
        warning: 'embarazada means PREGNANT!'
      },
    ],
    accuracy: 0.95, // 95% of -tion words follow this pattern
  },
};

// Transform function
export function transformToCognate(
  englishWord: string,
  patternId: string
): CognateResult | null;

// Check if word is a false friend
export function isFalseFriend(englishWord: string): FalseFriend | null;
```

#### cognatePatterns.ts (50 High-Frequency Words)

```typescript
export const TION_CION_WORDS = [
  // High frequency, daily use
  { english: 'information', spanish: 'información', frequency: 'high' },
  { english: 'situation', spanish: 'situación', frequency: 'high' },
  { english: 'education', spanish: 'educación', frequency: 'high' },
  { english: 'communication', spanish: 'comunicación', frequency: 'high' },
  { english: 'attention', spanish: 'atención', frequency: 'high' },
  // ... 45 more words
];

export const FALSE_FRIENDS = [
  { english: 'embarrassed', wrongSpanish: 'embarazada', correct: 'avergonzado/a' },
  { english: 'actual', wrongSpanish: 'actual', correct: 'real/verdadero' },
  { english: 'sensible', wrongSpanish: 'sensible', correct: 'razonable/sensato' },
  { english: 'eventual', wrongSpanish: 'eventual', correct: 'final/definitivo' },
  { english: 'fabric', wrongSpanish: 'fábrica', correct: 'tela/tejido' },
];
```

#### CognateDiscoveryCard.tsx

```typescript
interface CognateDiscoveryCardProps {
  pattern: CognatePattern;
  onComplete: (correct: boolean) => void;
}

// Features:
// 1. Morphing text animation (nation → nación)
// 2. Audio playback for both languages
// 3. Pattern explanation overlay
// 4. False friend warning popup
// 5. Practice mode with FillInBlank
```

### Track 2: Integration Badges

#### Modify VocabularyCardFlow

Add cognate detection to existing vocabulary cards:

```typescript
// In VocabularyCardFlow.tsx
const isCognate = cognateEngine.detectCognate(word.english);

{isCognate && (
  <CognateBadge
    pattern={isCognate.pattern}
    hint={`Similar to English "${isCognate.englishWord}"`}
  />
)}
```

### Track 3: UX Polish

#### "Vocabulary Unlocked" Flow

```
Screen 1: Hook
"What if you already know 3,000 Spanish words?"
[Discover Now →]

Screen 2: Reveal (animated counter)
"You know: 0 → 50 → 500 → 3,000 words!"
[Confetti animation]

Screen 3: First Pattern
"The -tion → -ción Pattern"
[Morphing animation: nation → nación]
[🔊 Play English] [🔊 Play Spanish]

Screen 4: Practice
[3 ComparisonCards with audio]
[2 SpeakingCards]

Screen 5: Celebration
"You just unlocked 50 words!"
[🎉 Confetti]
"There are 12 more patterns to discover..."
[Continue Learning →]
```

---

## Phase 2: Full Module (If Phase 1 Validates)

### Additional Patterns (5 Total)

| Pattern | English | Spanish | Words |
|---------|---------|---------|-------|
| -tion | nation | nación | 500+ |
| -ary | salary | salario | 200+ |
| -ous | delicious | delicioso | 150+ |
| -ment | moment | momento | 100+ |
| -ble | possible | posible | 200+ |

### Personalization Engine

```typescript
// Detect user's profession/interests from onboarding
const userProfile = await getUserProfile();

// Show relevant cognates first
if (userProfile.profession === 'lawyer') {
  prioritize(['objection', 'declaration', 'constitution']);
}
if (userProfile.interests.includes('cooking')) {
  prioritize(['preparation', 'combination', 'decoration']);
}
```

### Integration Points

1. **VoiceCallScreen**: AI tutor mentions patterns naturally
   - "Notice how 'situación' sounds like 'situation'?"

2. **TeleprompterCard**: Highlight cognates in reading passages
   - Tap highlighted word → show pattern explanation

3. **PostCallFeedbackScreen**: Show cognates used in conversation
   - "You used 5 cognates correctly!"

---

## Phase 3: Premium Feature (Future)

### Multi-Language Expansion

| Language | Shared Patterns with English |
|----------|------------------------------|
| Spanish | -tion/-ción, -ary/-ario, -ous/-oso |
| French | -tion/-tion (same!), -ty/-té, -ment/-ment |
| Portuguese | -tion/-ção, -ary/-ário |
| Italian | -tion/-zione, -ary/-ario |

### Cognate Mastery Certification
- Complete all 12+ patterns
- Pass pattern recognition quiz (90%+)
- Use 100 cognates in voice conversations
- Badge: "Cognate Master"

---

## Technical Architecture

### Database Schema

```sql
-- Cognate patterns table
CREATE TABLE cognate_patterns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  english_suffix TEXT NOT NULL,
  target_suffix TEXT NOT NULL,
  language TEXT NOT NULL,
  accuracy_rate REAL,
  word_count INTEGER
);

-- User cognate progress
CREATE TABLE user_cognate_progress (
  user_id TEXT NOT NULL,
  pattern_id TEXT NOT NULL,
  words_learned INTEGER DEFAULT 0,
  words_practiced INTEGER DEFAULT 0,
  last_practiced TIMESTAMP,
  mastery_level REAL DEFAULT 0,
  PRIMARY KEY (user_id, pattern_id)
);

-- False friend encounters (to track errors)
CREATE TABLE false_friend_encounters (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  false_friend TEXT NOT NULL,
  context TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoints (if backend needed)

```typescript
// Get user's cognate progress
GET /api/cognates/progress

// Record pattern completion
POST /api/cognates/complete
{ patternId: string, wordsLearned: number, score: number }

// Get personalized cognate recommendations
GET /api/cognates/recommendations
```

---

## Success Metrics

### Phase 1 Gates (Must Pass to Proceed)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Completion Rate | >70% | Users who start finish the flow |
| 7-Day Retention | +15% vs control | A/B test cohort comparison |
| User Rating | >4.0/5 | Post-flow survey |
| False Cognate Errors | <5% | Speaking card error rate |

### Phase 2 Goals

| Metric | Target |
|--------|--------|
| Cognate Usage in Conversations | 20% of vocabulary |
| Pattern Recognition Accuracy | >85% |
| Feature Engagement | >40% of users try it |

---

## Risk Mitigation

### Risk 1: Over-promising "3,000 words"
**Mitigation**: Start with "50 words" claim, only scale messaging after validation

### Risk 2: False Cognate Embarrassment
**Mitigation**: Build warning system from day one, show warnings BEFORE teaching similar-looking words

### Risk 3: Users Skip to Grammar Struggles
**Mitigation**: Ensure cognate flow leads into verb conjugation practice, not just vocabulary

### Risk 4: Content Quality
**Mitigation**: Have native Spanish speaker review all 50 words before launch

---

## Timeline

### Week 1
| Day | Task | Owner |
|-----|------|-------|
| 1 | Create cognateEngine.ts with -tion/-ción pattern | Dev |
| 2 | Build CognateDiscoveryCard with morphing animation | Dev |
| 3 | Curate 50 words + 5 false friends | Content |
| 4 | Create "Vocabulary Unlocked" flow | Dev |
| 5 | Add cognate badges to VocabularyCardFlow | Dev |

### Week 2
| Day | Task | Owner |
|-----|------|-------|
| 6-7 | Integration testing, polish animations | Dev |
| 8 | Deploy A/B test to 10% of new users | Dev |
| 9-10 | Monitor metrics, gather feedback | PM |

### Decision Point (End of Week 2)
- If metrics pass: Proceed to Phase 2
- If metrics fail: Iterate or deprioritize

---

## Resources

### Research Sources
- [Language Transfer](https://www.languagetransfer.org)
- [SpanishCognates.org](https://spanishcognates.org/)
- [Cognate Facilitation Effect - NIH](https://pmc.ncbi.nlm.nih.gov/articles/PMC10794022/)
- [Tim Ferriss - Language Learning](https://tim.blog/2014/03/21/how-to-learn-a-foreign-language-2/)

### Existing Components to Leverage
- `ComparisonCard.tsx` - Side-by-side word comparison
- `AudioButton.tsx` - Audio playback
- `confetti.json` - Celebration animation
- `VocabularyCardFlow.tsx` - Integration point
