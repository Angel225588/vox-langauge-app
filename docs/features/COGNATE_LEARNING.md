# Cognate Learning Module - Feature Specification

**Feature Name**: Vocabulary Unlocked (Cognate Discovery)
**Priority**: P2 (v1.1 Enhancement)
**Status**: Approved by Roundtable (2026-01-21)
**Estimated Effort**: 2 weeks Phase 1

---

## Overview

A cognate-based learning system that teaches users they "already know" thousands of words through pattern recognition. Uses word ending transformations (e.g., "-tion → -ción") to rapidly expand vocabulary confidence.

### The Core Insight
> "If you know English, you already know 3,000+ Spanish words."

English and Spanish share ~30-40% of vocabulary through Latin roots. By teaching users predictable patterns, we can:
- **Reduce language anxiety** (you already know this!)
- **Accelerate vocabulary acquisition** (20-40% faster neural processing)
- **Create early "aha moments"** (strong onboarding hook)

---

## User Stories

### Primary User Story
> As a beginner Spanish learner, I want to discover that I already know many Spanish words, so that I feel confident and motivated to continue learning.

### Supporting Stories
- As a user, I want to see words transform visually from English to Spanish
- As a user, I want to practice pronouncing cognates with audio feedback
- As a user, I want to be warned about false cognates before making embarrassing mistakes
- As a user, I want to track how many words I've "unlocked"

---

## The Science

### Cognate Facilitation Effect
Research shows bilinguals process cognates 20-40% faster than non-cognates due to:
- **Spreading Activation**: Cognates activate two similar neural representations simultaneously
- **Phonological Overlap**: Similar sounds create stronger memory traces
- **Reduced Cognitive Load**: Less new information to encode

### Key Statistics
| Stat | Value | Source |
|------|-------|--------|
| English-Spanish cognate pairs | ~20,000 | NTC's Dictionary |
| Words with same meaning | 90% | SpanishCognates.org |
| English words with Spanish cognates | 30-40% | Research literature |
| Processing speed improvement | 20-40% | Cognate Facilitation Effect studies |

---

## Pattern Library

### Phase 1: -tion → -ción (MVP)
The most reliable and high-frequency pattern.

**Examples**:
| English | Spanish | Phonetic |
|---------|---------|----------|
| nation | nación | /naˈsjon/ |
| information | información | /infoɾmaˈsjon/ |
| situation | situación | /situaˈsjon/ |
| education | educación | /edukaˈsjon/ |
| attention | atención | /atenˈsjon/ |

**Accuracy**: 95%+ of -tion words follow this pattern

### Phase 2: Additional Patterns
| Pattern | English Example | Spanish | Words |
|---------|-----------------|---------|-------|
| -ary → -ario | salary | salario | 200+ |
| -ous → -oso | delicious | delicioso | 150+ |
| -ment → -mento | moment | momento | 100+ |
| -ble → -ble | possible | posible | 200+ |

### False Friends (Critical Warnings)
| English | Looks Like | Actually Means | Correct Translation |
|---------|------------|----------------|---------------------|
| embarrassed | embarazada | PREGNANT | avergonzado/a |
| actual | actual | current | real, verdadero |
| sensible | sensible | sensitive | razonable, sensato |
| eventual | eventual | possible | final, definitivo |
| fabric | fábrica | factory | tela, tejido |

---

## User Experience Flow

### "Vocabulary Unlocked" Onboarding Flow

```
┌─────────────────────────────────────┐
│                                     │
│  🔓 VOCABULARY UNLOCKED             │
│                                     │
│  What if you already know           │
│  3,000+ Spanish words?              │
│                                     │
│  [Discover Now →]                   │
│                                     │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│                                     │
│  You know:                          │
│                                     │
│     ████████████  3,247 words       │
│     [animated counter]              │
│                                     │
│  🎉 [confetti animation]            │
│                                     │
│  [How is this possible? →]          │
│                                     │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│                                     │
│  THE -TION PATTERN                  │
│                                     │
│     nation  →  nación               │
│     [morphing animation]            │
│                                     │
│  English -tion = Spanish -ción      │
│                                     │
│  [🔊 English] [🔊 Spanish]          │
│                                     │
│  [Try More →]                       │
│                                     │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  PRACTICE TIME                      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  information                │   │
│  │         ↓                   │   │
│  │  información               │   │
│  │  [🔊 Play] [🐢 Slow]        │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Say it! 🎤]                       │
│                                     │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│                                     │
│  ⚠️ WATCH OUT!                      │
│                                     │
│  "embarrassed" ≠ "embarazada"       │
│                                     │
│  embarazada = PREGNANT! 😅          │
│                                     │
│  Use: avergonzado/a                 │
│                                     │
│  [Got it! →]                        │
│                                     │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│                                     │
│  🎉 AMAZING!                        │
│                                     │
│  You just unlocked 50 words         │
│  in 5 minutes!                      │
│                                     │
│  There are 12 more patterns         │
│  to discover...                     │
│                                     │
│  [Continue Learning →]              │
│                                     │
└─────────────────────────────────────┘
```

---

## Component Specifications

### CognateDiscoveryCard

```typescript
interface CognateDiscoveryCardProps {
  pattern: CognatePattern;
  words: CognateWord[];
  onComplete: () => void;
  showFalseFriends?: boolean;
}

// Animations:
// 1. Text morphing (tion → ción character by character)
// 2. Glow effect on transformed suffix
// 3. Success confetti on completion
```

### CognateBadge (for existing cards)

```typescript
interface CognateBadgeProps {
  pattern: string; // e.g., "tion-cion"
  hint: string;    // e.g., "Similar to English 'information'"
}

// Small badge shown on vocabulary cards
// Tap to expand → show pattern explanation
```

### cognateEngine.ts

```typescript
// Core functions
export function transformToCognate(word: string, patternId: string): CognateResult;
export function detectCognate(word: string): CognateMatch | null;
export function isFalseFriend(word: string): FalseFriend | null;
export function getPatternWords(patternId: string, limit?: number): CognateWord[];
```

---

## Integration Points

### 1. VocabularyCardFlow
- Detect if current word is a cognate
- Show CognateBadge with pattern hint
- Track cognate usage in analytics

### 2. VoiceCallScreen
- AI tutor mentions patterns naturally
- Example: "Notice how 'situación' sounds like 'situation'?"
- Track cognates used in conversation

### 3. TeleprompterCard
- Highlight cognates in reading passages
- Tap to see pattern explanation
- Different highlight color for cognates vs. new words

### 4. PostCallFeedbackScreen
- Show "Cognates Used" section
- "You used 5 cognates correctly!"
- Reinforce pattern recognition

---

## Success Metrics

### Phase 1 Gates (Must Pass)
| Metric | Target | Measurement |
|--------|--------|-------------|
| Flow Completion | >70% | Users who start complete it |
| 7-Day Retention | +15% | vs. control group |
| User Rating | >4.0/5 | Post-flow survey |
| False Cognate Errors | <5% | Speaking card mistakes |

### Long-term Goals
| Metric | Target |
|--------|--------|
| Cognate Usage in Conversations | 20% of vocabulary |
| Pattern Recognition Accuracy | >85% |
| Feature Engagement | >40% of users |

---

## Competitive Analysis

| Platform | Cognate Teaching | UX Quality | Free? |
|----------|------------------|------------|-------|
| **Language Transfer** | Audio courses, 120+ lessons | Basic (audio only) | Yes |
| **SpanishCognates.org** | Text lists by pattern | Poor (static website) | Yes |
| **Fluent in 3 Months** | Blog posts, tips | N/A (content only) | Yes |
| **Tim Ferriss** | Blog posts | N/A (content only) | Yes |
| **Vox (Proposed)** | Interactive cards, gamified, integrated | Premium | Freemium |

**Our Advantage**: Visual + audio + gamified + integrated into full learning journey

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Over-promising word counts | Medium | High | Start with "50 words", scale messaging after validation |
| False cognate embarrassment | Low | High | Warnings built in from day 1 |
| Feels like a gimmick | Medium | Medium | Integration throughout app, not just onboarding |
| Content quality issues | Low | Medium | Native speaker review before launch |

---

## Implementation Timeline

### Week 1
- Day 1-2: `cognateEngine.ts` with -tion/-ción pattern
- Day 3: `CognateDiscoveryCard` with morphing animation
- Day 4: "Vocabulary Unlocked" flow with confetti
- Day 5: Cognate badges in VocabularyCardFlow

### Week 2
- Day 6-7: Integration testing, polish
- Day 8: Deploy A/B test (10% of new users)
- Day 9-10: Monitor metrics, gather feedback

### Decision Point
If Phase 1 metrics pass → Proceed to Phase 2 (5 patterns, 500 words)
If metrics fail → Iterate or deprioritize

---

## References

- [Language Transfer](https://www.languagetransfer.org) - Free audio cognate courses
- [SpanishCognates.org](https://spanishcognates.org/) - Pattern reference
- [Cognate Facilitation Effect - NIH](https://pmc.ncbi.nlm.nih.gov/articles/PMC10794022/)
- [Tim Ferriss - 12 Rules for Language Learning](https://tim.blog/2014/03/21/how-to-learn-a-foreign-language-2/)
- [Fluent in 3 Months - French Cognates](https://www.fluentin3months.com/french-cognates/)

---

**Roundtable**: [docs/roundtables/2026-01-21-cognate-learning-module/](../roundtables/2026-01-21-cognate-learning-module/)
