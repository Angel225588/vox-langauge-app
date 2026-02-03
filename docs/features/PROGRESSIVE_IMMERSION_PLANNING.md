# Progressive Immersion System - Project Planning

**Created**: December 16, 2025
**Status**: 📋 Planned
**Priority**: P2 (Enhancement) → Consider P1.5 for differentiation
**Owner**: Vox Language Team

---

## 📊 Executive Summary

### What Is It?
A system that gradually transitions the app's UI from the user's native language to their target language as they advance through CEFR proficiency levels (A1→C2).

### Why Does It Matter?
- **Unique Differentiator**: NO major language app currently does this
- **Research-Backed**: Krashen's i+1 theory, Vygotsky's ZPD
- **User Value**: UI becomes part of the learning experience

### Market Gap
| App | Approach |
|-----|----------|
| Duolingo | Fixed UI language (user chooses) |
| Rosetta Stone | 100% immersion from day 1 (overwhelming) |
| Babbel | Always native language |
| **Vox** | **Progressive immersion based on level** |

---

## 📋 Feature Prioritization

### Current Assessment

| Factor | Score | Notes |
|--------|-------|-------|
| User Demand | 6/10 | Not explicitly requested, but solves "plateau" problem |
| Research Support | 9/10 | Strong academic backing (i+1, ZPD, scaffolding) |
| Competitive Gap | 10/10 | No one does this - clear differentiation |
| Business Impact | 7/10 | Retention improvement for intermediate+ users |
| Implementation Effort | Medium | Core infrastructure built, needs UI integration |
| **Overall Priority** | **P1.5** | Between critical differentiators and enhancements |

### Recommendation: **Implement After Voice AI (P1.3)**

**Rationale**:
1. Voice AI is #1 user-requested feature → higher immediate impact
2. Progressive Immersion builds on i18n infrastructure (✅ already built)
3. Most impactful for B1+ users → not needed for MVP launch
4. Can be added incrementally without breaking existing features

---

## 📅 Implementation Timeline

### When to Implement

```
Current Focus (Dec 2025)
├── Voice AI System (P1.3) ← IN PROGRESS
├── Core Flashcard System (P0)
└── Games (P0)

v1.0 Launch (Target: Jan 2026)
├── Grammar Explanations (P1.1)
├── Word Detail Popups (P1.2)
└── Vocabulary Dashboard (P1.4)

v1.1 Enhancement (Target: Feb 2026)
├── ⭐ Progressive Immersion (P1.5) ← RECOMMENDED
├── Writing Practice (P1.5)
└── CEFR Level Tracking (P2.2)

v1.2+ Future
├── Additional Language Translations
├── Native Speaker Videos
└── Advanced Games
```

### Why v1.1?
1. **Builds on foundation**: i18n infrastructure already in place
2. **Targets right users**: B1+ learners who've been using app for weeks
3. **Reinforces retention**: Keeps intermediate users engaged
4. **Clean separation**: Doesn't complicate MVP launch

---

## 🌍 Language Translation Priorities

Based on Duolingo 2024-2025 data, here are the languages we should prioritize for app translations:

### Current State
- ✅ English (EN) - Complete
- ✅ Spanish (ES) - Complete
- ⏳ 8 languages defined but not translated

### Priority Order for New Translations

| Priority | Language | Code | Native Speakers Learning EN | Rationale |
|----------|----------|------|------------------------------|-----------|
| **P1** | Mandarin Chinese | zh | #1 group | 55% of English learners from Asia |
| **P1** | Arabic | ar | #3 group | Fastest growing (Africa +20% YoY) |
| **P2** | Portuguese | pt | Large market | Brazil = huge potential |
| **P2** | Japanese | ja | Most dedicated | Highest time spent per user |
| **P3** | Korean | ko | Fast growing | K-culture driving interest |
| **P3** | German | de | European base | Serious learners |
| **P4** | French | fr | Already learning | May want Spanish/English |
| **P4** | Hindi | hi | Large population | Growing middle class |

### Translation Effort Estimate

| Language | Difficulty | Est. Strings | Notes |
|----------|------------|--------------|-------|
| Chinese | High | ~500 | Character set, cultural nuances |
| Arabic | High | ~500 | RTL layout, formal/informal |
| Portuguese | Medium | ~500 | Similar to Spanish |
| Japanese | High | ~500 | Honorifics, politeness levels |
| Korean | Medium | ~500 | Similar structure to Japanese |
| German | Low | ~500 | Latin alphabet, similar grammar |

---

## 🔑 Key Questions & Decisions

### Q1: Should Progressive Immersion be opt-in or automatic?

**Recommendation**: **Automatic with opt-out**

| Option | Pros | Cons |
|--------|------|------|
| Automatic (recommended) | Seamless experience, research-backed | May surprise some users |
| Opt-in | User control | Most won't enable it |
| Hybrid | Best of both | More complex UI |

**Implementation**:
```
Settings > Learning > Immersion Mode
[●] Automatic (recommended) - UI adapts to your level
[○] Off - Always use [Native Language]
[○] Full - Challenge mode (100% target language)
```

### Q2: How do we handle users who struggle with immersed UI?

**Safeguards**:
1. **Long-press to reveal**: Any immersed text can be long-pressed to show native translation
2. **Settings override**: User can always switch back in settings
3. **Critical content exempt**: Error messages, legal, account info stay in native language
4. **Gradual transition**: Never switch more than 20% at a level boundary

### Q3: How do we detect user level for immersion?

**Options**:
1. **Explicit selection** (onboarding) ← Current approach
2. **Assessment test** (planned P2)
3. **AI inference** from performance ← Future enhancement

**Recommendation**: Start with explicit selection, add AI inference later.

### Q4: What happens when user's level changes?

**Transition Flow**:
```
User completes enough B1 content → System detects level up
                ↓
        Level-up celebration modal
                ↓
    "Your app is upgrading! You'll now see more [Target Language]"
                ↓
        [Sounds great!] [Adjust settings]
                ↓
          Gradual UI transition over next 24 hours
```

---

## 📦 Implementation Breakdown

### Phase 1: Foundation (2-3 days)
- [x] Create types (`lib/immersion/types.ts`)
- [x] Create useImmersion hook (`lib/immersion/useImmersion.ts`)
- [x] Create ImmersiveText component (`lib/immersion/ImmersiveText.tsx`)
- [ ] Connect to user profile (real level detection)
- [ ] Add immersion settings to user preferences

### Phase 2: UI Integration (3-4 days)
- [ ] Migrate buttons/navigation to ImmersiveText (Tier 1)
- [ ] Migrate headers/feedback to ImmersiveText (Tier 2)
- [ ] Keep explanations in native (Tier 3 - later)
- [ ] Add "peek" feature (long-press to reveal native)

### Phase 3: Settings & Controls (1-2 days)
- [ ] Add Immersion settings screen
- [ ] Implement manual override controls
- [ ] Add "Challenge Mode" toggle

### Phase 4: Level Transitions (2-3 days)
- [ ] Create level-up celebration modal
- [ ] Implement gradual transition animation
- [ ] Add immersion percentage indicator (optional)
- [ ] Analytics tracking for immersion engagement

### Total Estimated Effort: 8-12 days

---

## 📊 Success Metrics

### Primary Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| B1+ Retention | +15% | 30-day retention for B1+ users |
| Session Length | +10% | Average session duration |
| Immersion Opt-out Rate | <20% | Users who disable immersion |

### Secondary Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| UI Vocabulary Retention | Measurable | Do users learn UI words faster? |
| User Satisfaction | >4.0/5 | In-app survey for B1+ users |
| Support Tickets | No increase | Confusion-related tickets |

---

## 🚀 Next Steps

### Immediate (This Session)
1. ✅ Document research findings
2. ✅ Create planning document
3. [ ] Add to VOX_PRIORITY_MATRIX.md as P1.5
4. [ ] Update PROJECT_STATUS.md with new feature

### Short-term (Next Sprint)
1. Connect useImmersion hook to real user profile
2. Add immersion settings to profile screen
3. Migrate one screen as proof-of-concept

### Medium-term (v1.1)
1. Full Tier 1 migration (buttons, navigation)
2. Tier 2 migration (headers, feedback)
3. Level-up celebration flow
4. Analytics integration

---

## 📚 Related Documents

- [PROGRESSIVE_IMMERSION_SYSTEM.md](./PROGRESSIVE_IMMERSION_SYSTEM.md) - Full research and design
- [PROGRESSIVE_IMMERSION_QUICK_REF.md](./PROGRESSIVE_IMMERSION_QUICK_REF.md) - Developer reference
- `lib/immersion/` - Implementation code

---

## ❓ Open Questions for User

1. **Priority Confirmation**: Should this be P1.5 (v1.1) or defer to P2 (later)?
2. **Languages**: Which 2 languages should we translate next after confirming approach?
3. **Scope**: Start with just buttons (Tier 1) or include feedback messages (Tier 2)?

---

**Document Version**: 1.0
**Last Updated**: December 16, 2025

