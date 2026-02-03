---
date: 2026-01-21
topic: Cognate-Based Learning Module
decision: accept
confidence: high
experts: [Technical Architect, UX Strategist, Product Analyst, Devil's Advocate]
rounds: 5
status: decided
tags: [roundtable, cognates, vocabulary, learning-method, neuroscience]
---

# Roundtable: Cognate-Based Learning Module

## Quick Answer
Implement a cognate learning system using a parallel-track MVP approach: standalone "Vocabulary Unlocked" module + ambient cognate badges in existing cards, validated over 2 weeks before Phase 2 expansion.

## Key Points
- **30-40% of English words** have Spanish cognates (~20,000 words)
- **Cognate Facilitation Effect**: 20-40% faster neural processing (neuroscience-backed)
- **Market Gap**: No premium app owns this space with modern UX (Language Transfer is free but audio-only)
- **Low Technical Risk**: Uses existing ComparisonCard, can prototype in 1 week
- **Differentiation**: Integration with voice calls, reading practice, and vocabulary flow

## Resolved Questions
- **Animation feasibility**: Yes, 2-3 days with existing tools (Reanimated, Lottie)
- **Value vs Language Transfer**: Experience + gamification + integration, not just information
- **Pattern vs contextual learning**: Complementary approach, patterns bootstrap confidence
- **Minimum viable test**: 50 words, 1 pattern (-tion/-ción), 2-week scope

## Decision
**APPROVED** - Build a Cognate Learning System with parallel validation tracks:
1. **Module Track**: CognateDiscoveryCard with "Vocabulary Unlocked" reveal
2. **Integration Track**: Cognate badges in existing VocabularyCardFlow
3. **Polish Track**: Morphing animation + confetti celebration

## Implementation Scope

### Phase 1: MVP (2 weeks)
- ONE pattern: -tion → -ción (50 curated words)
- 5 false cognate warnings (embarazada, actual, sensible, etc.)
- A/B test with 10% of new users

### Phase 2: Full Module (if Phase 1 validates)
- 500 high-frequency cognates across 5 patterns
- Personalization by user interests
- Integration with VoiceCallScreen and TeleprompterCard

### Phase 3: Premium Feature (future)
- All 12+ patterns
- French, Portuguese, Italian expansion
- "Cognate Mastery" certification

## Success Metrics
| Metric | Target |
|--------|--------|
| Completion Rate | >70% |
| 7-Day Retention | +15% vs control |
| User Rating | >4.0/5 |
| False Cognate Errors | <5% in speaking |

## Next Actions
- [ ] Create `lib/learning/cognateEngine.ts` with pattern rules
- [ ] Build `CognateDiscoveryCard.tsx` with morphing animation
- [ ] Curate 50 high-frequency -tion/-ción words
- [ ] Add 5 false cognate warnings
- [ ] Create "Vocabulary Unlocked" flow with confetti
- [ ] Add cognate badges to VocabularyCardFlow
- [ ] Deploy A/B test to 10% of users
- [ ] Monitor metrics for 2 weeks

## Expert Final Quotes (Voice-Ready)

### Technical Architect
> "We can build this in 2 weeks using components we already have. The key is starting small—50 words, one pattern—and letting the data tell us whether to expand. I'm confident in the engineering; the question is whether users respond."

### UX Strategist
> "I'm excited about the psychological impact here. Telling someone they already know thousands of words is a powerful confidence boost. We just need enough polish—the animation, the confetti—to make it feel like a discovery, not a grammar lesson."

### Product Analyst
> "Nobody owns this space with a premium experience yet. Language Transfer is free but audio-only. We can be the app that makes cognates visual, gamified, and integrated into real conversations. Phase 1 will tell us if users agree."

### Devil's Advocate
> "I've come around on this, but with guardrails. We need false cognate warnings from day one, and we shouldn't overpromise. Test with 50 words, measure what happens, then decide. If it works, great. If not, we've only spent two weeks."

## Research Sources
- [Language Transfer](https://www.languagetransfer.org) - Free audio cognate courses
- [Fluent in 3 Months - French Cognates](https://www.fluentin3months.com/french-cognates/)
- [Tim Ferriss - 12 Rules for Learning Languages](https://tim.blog/2014/03/21/how-to-learn-a-foreign-language-2/)
- [Cognate Facilitation Effect - NIH](https://pmc.ncbi.nlm.nih.gov/articles/PMC10794022/)
- [SpanishCognates.org](https://spanishcognates.org/)

## Links
- [[01-full-roundtable|Full Roundtable Debate]]
- [[02-implementation-plan|Implementation Plan]]
