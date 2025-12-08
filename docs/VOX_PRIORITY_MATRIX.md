# Vox Language - Feature Priority Matrix

**Created**: 2025-11-30
**Purpose**: Prioritized implementation roadmap based on user research, market data, and business impact
**Target**: Launch with competitive advantage against Duolingo

---

## 🚨 PROJECT DEADLINE: December 8, 2025

**Days from Nov 30**: 8 days
**Working Days**: ~8 days (includes weekend)

### Scope for Dec 8 Launch

| Category | Status | Must Complete |
|----------|--------|---------------|
| **P0 Core** | 🚧 | ALL items |
| **P1 Differentiators** | 📅 | At least 3 of 6 |
| **Onboarding** | 🚧 | Complete flow |
| **P2+ Features** | ❌ | DEFERRED to post-launch |

### Daily Goals (Aggressive)
- **Day 1-2**: Complete flashcard 3-card cycle
- **Day 3**: Add both games (Tap-to-Match, Multiple Choice)
- **Day 4**: Session flow + Points system
- **Day 5**: Complete onboarding flow
- **Day 6-7**: Grammar popups + Word details (P1)
- **Day 8**: Testing, bug fixes, polish

---

---

## Priority Framework

### Scoring Criteria

| Factor | Weight | Description |
|--------|--------|-------------|
| **User Demand** | 30% | Reddit mention frequency, survey data |
| **Research Support** | 25% | Academic validation for learning effectiveness |
| **Competitive Gap** | 25% | What competitors fail to deliver |
| **Business Impact** | 20% | Revenue potential, retention improvement |

### Priority Levels

| Level | Description | Timeline |
|-------|-------------|----------|
| **P0** | Must-have for MVP launch | Current Sprint |
| **P1** | Critical differentiator, launch-blocking | v1.0 Launch |
| **P2** | Important enhancement | v1.1 (1 month post-launch) |
| **P3** | Nice-to-have, future roadmap | v1.2+ (3+ months) |

---

## Part 1: P0 - Current Sprint (MUST COMPLETE)

### Already In Progress
These are actively being built and must complete before anything else:

| Feature | Status | Owner | Notes |
|---------|--------|-------|-------|
| 3-Card Flashcard Cycle | 🚧 In Progress | Claude | Learning + Listening + Speaking |
| SM-2 Spaced Repetition | ✅ Done | - | Core algorithm implemented |
| SQLite Offline Database | ✅ Done | - | Foundation complete |
| Basic Audio Playback | 🚧 In Progress | - | expo-av |
| Points System | 🚧 Partial | - | Track trials not perfection |
| Tap-to-Match Game | 📅 Next | - | First game mechanic |
| Multiple Choice Game | 📅 Next | - | Second game mechanic |
| Session Flow (10/20 min) | 📅 Planned | - | Time-based lesson structure |

### P0 Acceptance Criteria
- [ ] User can complete 10-card flashcard session
- [ ] All 3 card types work (Learning, Listening, Speaking)
- [ ] SM-2 correctly schedules next review
- [ ] Points awarded for every attempt
- [ ] 2 games playable
- [ ] Everything works offline
- [ ] Session summary displayed

---

## Part 2: P1 - Critical Differentiators (MVP Launch)

These features MUST be in v1.0 to compete with Duolingo:

### P1.1: Grammar Explanation System
**Priority Score**: 9.2/10
**User Demand**: 85% of complaints mention grammar gaps
**Research Support**: Explicit + implicit = best outcomes
**Competitive Gap**: Duolingo's #1 weakness
**Business Impact**: Key differentiator for conversion

| Sub-Feature | Effort | Impact | Priority |
|-------------|--------|--------|----------|
| Grammar Popup on Word Tap | Medium | High | P1 |
| Conjugation Charts | Medium | High | P1 |
| "Why This Form?" Explanations | Medium | High | P1 |
| Grammar Reference Library | High | Medium | P2 |
| Grammar Practice Exercises | High | Medium | P2 |

**Implementation**:
```typescript
// Every word should have grammar data
interface WordGrammar {
  partOfSpeech: 'noun' | 'verb' | 'adjective' | ...;
  gender?: 'masculine' | 'feminine' | 'neutral';
  conjugations?: ConjugationTable;
  grammarNotes: string[];  // "Why -a ending"
  examples: SentenceExample[];
}
```

---

### P1.2: Word Detail Popups
**Priority Score**: 9.0/10
**User Demand**: "Click any word and see all conjugations and examples"
**Research Support**: Context-rich vocabulary acquisition
**Competitive Gap**: No app does this well
**Business Impact**: Reduces "why?" frustration that causes churn

| Sub-Feature | Effort | Impact | Priority |
|-------------|--------|--------|----------|
| Tap Word → Definition | Low | High | P1 |
| Tap Word → Pronunciation | Low | High | P1 |
| Tap Word → Conjugation Table | Medium | High | P1 |
| Tap Word → Example Sentences | Medium | High | P1 |
| Tap Word → Add to Review | Low | Medium | P1 |
| Long Press → Full Details Screen | Medium | Medium | P2 |

---

### P1.3: AI Conversation Partner
**Priority Score**: 9.5/10
**User Demand**: #1 most requested feature (75% of feature discussions)
**Research Support**: 19% speaking improvement, reduced anxiety
**Competitive Gap**: No app does this well with judgment-free AI
**Business Impact**: Major conversion driver

| Sub-Feature | Effort | Impact | Priority |
|-------------|--------|--------|----------|
| Basic AI Chat (Gemini) | Medium | Critical | P1 |
| Voice Input | Medium | High | P1 |
| Text-to-Speech Response | Low | High | P1 |
| 5-10 Second Hint Delay | Low | High | P1 |
| Contextual Corrections | Medium | High | P1 |
| Daily Free Credits (10 min) | Low | Medium | P1 |
| Scenario Types (Casual/Interview) | Medium | Medium | P2 |

**Key Design Decision**:
- AI must WAIT 5-10 seconds before offering hints
- Corrections are contextual ("Try saying it like...") not binary (wrong!)
- Never interrupt - let user finish

---

### P1.4: Vocabulary Dashboard
**Priority Score**: 8.5/10
**User Demand**: "Duolingo hides your vocabulary list"
**Research Support**: Metacognitive awareness improves learning
**Competitive Gap**: Most apps hide this data
**Business Impact**: Power users need this to stay

| Sub-Feature | Effort | Impact | Priority |
|-------------|--------|--------|----------|
| View All Learned Words | Medium | High | P1 |
| Filter by Category | Low | Medium | P1 |
| Filter by CEFR Level | Medium | Medium | P1 |
| Search Vocabulary | Low | Medium | P1 |
| Export to CSV/Anki | Medium | Medium | P2 |
| Word Strength Indicator | Medium | Medium | P2 |

---

### P1.5: Writing Practice Module
**Priority Score**: 8.0/10
**User Demand**: Productive skills require productive practice
**Research Support**: Output Hypothesis - must produce, not just receive
**Competitive Gap**: Most apps ignore writing
**Business Impact**: Complete skill coverage = premium positioning

| Sub-Feature | Effort | Impact | Priority |
|-------------|--------|--------|----------|
| Prompted Writing Exercises | Medium | High | P1 |
| AI Writing Feedback | Medium | High | P1 |
| Translation Practice (Native → Target) | Medium | Medium | P2 |
| Free Writing/Journal | Low | Medium | P2 |
| Peer Corrections | High | Medium | P3 |

---

### P1.6: Optional Gamification Toggles
**Priority Score**: 8.5/10
**User Demand**: 40% hate gamification, 60% love it
**Research Support**: Autonomy improves motivation
**Competitive Gap**: No one offers this
**Business Impact**: Reduces churn from gamification haters

| Sub-Feature | Effort | Impact | Priority |
|-------------|--------|--------|----------|
| Toggle Streaks On/Off | Low | High | P1 |
| Toggle Leaderboard Visibility | Low | Medium | P1 |
| Toggle Points Display | Low | Medium | P1 |
| "Focus Mode" (no gamification) | Low | High | P1 |
| Streak Freeze / Restoration | Medium | High | P1 |

---

### P1.7: Onboarding Completion
**Priority Score**: 9.0/10
**User Demand**: Get users to value quickly
**Research Support**: First impression = retention predictor
**Competitive Gap**: Most onboarding is too slow
**Business Impact**: 80% completion target

| Sub-Feature | Effort | Impact | Priority |
|-------------|--------|--------|----------|
| Welcome Screen | ✅ Done | High | P0 |
| Language Selection | ✅ Done | High | P0 |
| Interests Selection | 🚧 In Progress | High | P0 |
| First Lesson Launch | 📅 Planned | Critical | P1 |
| Skip Assessment (Start Beginner) | ✅ Decided | High | P0 |
| Optional Level Test | Medium | Medium | P2 |

---

## Part 3: P2 - Important Enhancements (v1.1)

### P2.1: Native Speaker Videos
**Priority Score**: 7.5/10
**User Demand**: "Videos of native speakers saying sentences at normal speed"
**Research Support**: Facial expressions + body language crucial
**Competitive Gap**: Only Memrise does this well

| Sub-Feature | Effort | Impact | Priority |
|-------------|--------|--------|----------|
| Video Content for Core Words | High | High | P2 |
| Multiple Speakers per Word | High | Medium | P2 |
| Regional Variants (Spain vs LatAm) | High | High | P2 |
| Slow Motion Playback | Low | Medium | P2 |

---

### P2.2: CEFR Level Tracking
**Priority Score**: 7.5/10
**User Demand**: "Can't verify actual level after months of practice"
**Research Support**: Clear milestones improve motivation
**Competitive Gap**: XP ≠ proficiency

| Sub-Feature | Effort | Impact | Priority |
|-------------|--------|--------|----------|
| Estimated CEFR Level Display | Medium | High | P2 |
| Progress Toward Next Level | Medium | High | P2 |
| Level-Based Achievements | Low | Medium | P2 |
| Official Test Preparation | High | Medium | P3 |

---

### P2.3: Advanced Games
**Priority Score**: 7.0/10
**User Demand**: Variety keeps engagement
**Research Support**: Gamification increases proficiency 20-45%
**Competitive Gap**: Most apps have limited game variety

| Sub-Feature | Effort | Impact | Priority |
|-------------|--------|--------|----------|
| Sentence Building (Word Order) | Medium | Medium | P2 |
| Picture Description | Medium | Medium | P2 |
| Drag-and-Drop Matching | Medium | Medium | P2 |
| Memory/Concentration | Medium | Low | P3 |
| Timed Challenges | Low | Medium | P2 |

---

### P2.4: Import Own Content
**Priority Score**: 7.0/10
**User Demand**: Advanced learners want their own materials
**Research Support**: Relevant content = better retention
**Competitive Gap**: Only LingQ does this

| Sub-Feature | Effort | Impact | Priority |
|-------------|--------|--------|----------|
| Paste Text → Create Lesson | High | Medium | P2 |
| URL Import → Parse Content | High | Medium | P3 |
| Auto-Create Flashcards | Medium | Medium | P2 |
| User Content Library | Medium | Medium | P2 |

---

### P2.5: Historical Progress Graphs
**Priority Score**: 6.5/10
**User Demand**: "Show improvement over time"
**Research Support**: Visual progress = motivation
**Competitive Gap**: Limited in most apps

| Sub-Feature | Effort | Impact | Priority |
|-------------|--------|--------|----------|
| Weekly/Monthly Charts | Medium | Medium | P2 |
| Skill Balance Radar | Medium | Medium | P2 |
| Streak History | Low | Medium | P2 |
| Time Spent Analytics | Low | Medium | P2 |

---

## Part 4: P3 - Future Roadmap (v1.2+)

### P3.1: Live Video/Audio Practice (Phase 8)
**Priority Score**: 8.0/10 (Future)
**Effort**: Very High (LiveKit infrastructure)
**Target**: v1.2+

| Sub-Feature | Notes |
|-------------|-------|
| Peer Matching System | By language, level, interests |
| Video Call | Full video + audio |
| Audio Only Mode | For shy users |
| Session Recording (consent) | Personal review |
| Mutual Feedback | Rate each other |
| AI Conversation Analysis | Post-session insights |

---

### P3.2: Community & Social (Phase 7)
**Priority Score**: 7.0/10 (Future)
**Effort**: High

| Sub-Feature | Notes |
|-------------|-------|
| Public Recordings | Share practice |
| Community Feedback | Comments on recordings |
| Leaderboard | Ranked by attempts |
| Discord-Style Communities | By language/level |
| Study Groups | Private groups |
| Mentorship Program | Advanced help beginners |

---

### P3.3: Podcasting & UGC (Phase 11)
**Priority Score**: 6.0/10 (Future)
**Effort**: Very High

| Sub-Feature | Notes |
|-------------|-------|
| User-Created Content | Lessons, stories, tips |
| Audio Editor | Built-in tools |
| Monetization (Future) | Revenue share for creators |

---

### P3.4: Adaptive Learning ML (Phase 14)
**Priority Score**: 7.5/10 (Future)
**Effort**: Very High

| Sub-Feature | Notes |
|-------------|-------|
| Real-Time Difficulty Adjustment | ML-based |
| Learning Style Detection | Visual/auditory/kinesthetic |
| Vocabulary Prioritization | Predict needed words |
| Personalized Review Schedules | ML-enhanced SM-2 |

---

## Part 5: Implementation Roadmap

### Phase 1: MVP Core (Current - 4 weeks)
```
Week 1-2: Complete Flashcard System
- [x] SM-2 Algorithm
- [ ] Learning Card
- [ ] Listening Card
- [ ] Speaking Card
- [ ] Session Flow

Week 3: Add Games
- [ ] Tap-to-Match
- [ ] Multiple Choice
- [ ] Points Integration

Week 4: Onboarding + Polish
- [ ] Complete Onboarding Flow
- [ ] First Lesson Launch
- [ ] Bug Fixes
```

### Phase 2: Differentiators (v1.0 Launch - 4 weeks)
```
Week 5-6: Grammar System
- [ ] Grammar Popup System
- [ ] Word Detail Screens
- [ ] Conjugation Tables
- [ ] Example Sentences

Week 7: AI Conversation
- [ ] Gemini Integration
- [ ] Voice Input
- [ ] Text-to-Speech
- [ ] Credit System

Week 8: Dashboard + Settings
- [ ] Vocabulary Dashboard
- [ ] Gamification Toggles
- [ ] Progress Analytics
```

### Phase 3: Enhancements (v1.1 - 4 weeks)
```
Week 9-10: Content Depth
- [ ] Native Speaker Videos
- [ ] More Games
- [ ] Writing Module

Week 11-12: Polish
- [ ] CEFR Tracking
- [ ] Progress Graphs
- [ ] Performance Optimization
```

### Phase 4: Social (v1.2+ - 6+ weeks)
```
- [ ] Live Video Practice (LiveKit)
- [ ] Community Features
- [ ] Peer Corrections
```

---

## Part 6: Success Metrics by Phase

### MVP Launch Targets
| Metric | Target | Current |
|--------|--------|---------|
| Onboarding Completion | >80% | - |
| First Lesson Completion | >70% | - |
| Day 1 Retention | >55% | - |
| Day 7 Retention | >40% | - |
| Flashcards Work Offline | 100% | - |

### v1.0 Launch Targets
| Metric | Target | Notes |
|--------|--------|-------|
| Day 30 Retention | >25% | Industry: 2% |
| Free → Paid Conversion | >5% | Duolingo: 8.8% |
| DAU/MAU Ratio | >20% | Duolingo: 34.7% |
| AI Conversation Usage | >30% | Key differentiator |
| Grammar Feature Usage | >50% | Unique feature |

### v1.1+ Targets
| Metric | Target | Notes |
|--------|--------|-------|
| Speaking Practice Completion | >25% | Hardest to get users to do |
| Community Engagement | >15% | |
| CEFR Level Advancement | Measurable | Real learning proof |

---

## Part 7: Risk Assessment

### High Risk Items

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| AI Conversation too expensive | Medium | High | Credit limits, caching, backend proxy |
| Grammar content takes too long | Medium | High | Start with top 100 patterns |
| Users don't find AI helpful | Low | High | 5-10s delay, gentle corrections |
| Offline sync issues | Medium | Medium | Extensive testing, conflict resolution |

### Dependencies

| Feature | Depends On |
|---------|------------|
| AI Conversation | Gemini API stable |
| Grammar Popups | Complete vocabulary database |
| Writing Feedback | AI integration complete |
| Video Content | Content production budget |
| Live Practice | LiveKit infrastructure |

---

## Part 8: Resource Allocation

### Recommended Focus
| Phase | Engineering | Content | Design |
|-------|-------------|---------|--------|
| MVP | 80% | 15% | 5% |
| v1.0 | 60% | 30% | 10% |
| v1.1 | 50% | 35% | 15% |
| v1.2+ | 40% | 40% | 20% |

### Critical Path
1. **Flashcard System** → Everything builds on this
2. **AI Integration** → Core differentiator
3. **Grammar Content** → Fills Duolingo gap
4. **Onboarding** → First impression determines retention

---

## Appendix: Competitive Positioning Summary

### What Vox Does That Duolingo Doesn't
1. ✅ Explains grammar (not just pattern matching)
2. ✅ Shows word details on tap
3. ✅ AI conversation without judgment
4. ✅ Rewards trials, not perfection
5. ✅ Optional gamification
6. ✅ Transparent vocabulary progress
7. ✅ Writing practice with feedback

### Target User: "Frustrated Intermediate"
- Used Duolingo 6+ months
- Hit plateau, can't hold conversations
- Willing to pay for actual results
- Wants to understand "why" not just "what"
- Needs speaking practice without anxiety

---

**Document Version**: 1.0
**Next Review**: After MVP completion
**Owner**: Angel Polanco
