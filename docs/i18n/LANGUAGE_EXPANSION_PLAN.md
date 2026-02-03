# Language Expansion Plan - Vox Language App

**Created**: December 17, 2025
**Status**: 📋 Planned (After Voice Conversation)
**Decision**: Add French, Portuguese, Arabic for MVP

---

## Current State

| Language | Code | Status | RTL |
|----------|------|--------|-----|
| English | en | ✅ Complete | No |
| Spanish | es | ✅ Complete | No |
| French | fr | 📋 Planned | No |
| Portuguese | pt | 📋 Planned | No |
| Arabic | ar | 📋 Planned | Yes |

---

## MVP Language Decision

### Selected: French + Portuguese + Arabic

**Rationale**:
- **French**: Europe/Africa market, many testers understand it, easy to translate
- **Portuguese**: Brazil (200M+ people), 80% similar to Spanish translations
- **Arabic**: Fastest growing market, validates RTL infrastructure

### Markets Covered After MVP

| Region | Languages | Population Reach |
|--------|-----------|------------------|
| North America | EN, ES | 400M+ |
| Europe | EN, ES, FR | 450M+ |
| South America | ES, PT | 500M+ |
| Middle East | AR | 400M+ |
| Africa | EN, FR, AR | 600M+ |

**Total potential reach**: 1.5B+ people

---

## Implementation Plan

### Prerequisites
- [x] i18n infrastructure (i18next, react-i18next)
- [x] RTL support in useLanguage hook
- [x] Language picker in profile
- [ ] Voice Conversation feature complete

### Phase 1: French (2-3 hours)

**Files to create**:
```
i18n/locales/fr/
├── common.json      (~50 strings)
├── onboarding.json  (~100 strings)
├── settings.json    (~80 strings)
├── home.json        (~40 strings)
├── lessons.json     (~60 strings)
└── cards.json       (~70 strings)
```

**Translation approach**:
1. Copy Spanish files as starting point (many cognates)
2. Use AI to translate with review
3. Native speaker review (if available)

### Phase 2: Portuguese (2-3 hours)

**Files to create**: Same structure as French

**Translation approach**:
1. Copy Spanish files (80% similar vocabulary)
2. Adjust for Portuguese grammar (verb conjugations, articles)
3. Brazilian Portuguese dialect preferred (larger market)

### Phase 3: Arabic (4-5 hours)

**Files to create**: Same structure + RTL considerations

**Special considerations**:
- Formal Arabic (Modern Standard Arabic) for UI
- RTL text direction (already supported in useLanguage hook)
- Test all UI components for RTL layout
- Numbers remain LTR in Arabic

**RTL Testing checklist**:
- [ ] Navigation flows right-to-left
- [ ] Icons flip correctly
- [ ] Text alignment correct
- [ ] Progress bars fill from right
- [ ] Swipe gestures reversed

---

## Translation String Count

| Namespace | Strings | Notes |
|-----------|---------|-------|
| common.json | ~50 | Buttons, labels, errors |
| onboarding.json | ~100 | All onboarding screens |
| settings.json | ~80 | Profile, preferences |
| home.json | ~40 | Dashboard, navigation |
| lessons.json | ~60 | Lesson UI, progress |
| cards.json | ~70 | Flashcards, games |
| **Total** | **~400** | Per language |

**Total for 3 languages**: ~1,200 strings

---

## Quality Assurance

### Translation Review Process
1. **AI Translation**: Initial pass using Claude/GPT
2. **Technical Review**: Check placeholders, formatting
3. **Native Review**: If available, have native speaker review
4. **In-App Testing**: Test all screens with new language

### RTL Testing (Arabic)
1. Switch app to Arabic
2. Navigate all screens
3. Check text alignment
4. Verify icon directions
5. Test gestures (swipe)
6. Verify number formatting

---

## Timeline

```
Voice Conversation (Current Sprint)
        ↓
French Translation (Day 1, 2-3 hrs)
        ↓
Portuguese Translation (Day 1, 2-3 hrs)
        ↓
Arabic Translation (Day 2, 4-5 hrs)
        ↓
RTL Testing (Day 2, 1-2 hrs)
        ↓
QA & Polish (Day 3, 2-3 hrs)
        ↓
MVP Ready with 5 Languages ✅
```

**Total estimated time**: 12-15 hours over 2-3 days

---

## Post-MVP Languages (v1.1+)

| Priority | Language | Code | When |
|----------|----------|------|------|
| P2 | Chinese (Simplified) | zh | v1.1 |
| P2 | Chinese (Traditional) | zh-TW | v1.1 |
| P3 | Japanese | ja | v1.2 |
| P3 | Korean | ko | v1.2 |
| P3 | German | de | v1.2 |
| P3 | Italian | it | v1.2 |
| P4 | Hindi | hi | v1.3 |
| P4 | Hebrew | he | v1.3 (RTL) |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Translation accuracy | >95% (native review) |
| UI consistency | All screens render correctly |
| RTL functionality | 100% of components work |
| User satisfaction | >4.0/5 rating from Arabic users |

---

## Notes

- All translations should maintain Vox's friendly, encouraging tone
- Avoid overly formal language (we're not a textbook)
- Keep placeholder syntax: `{{variable}}`
- Test with longest translations to catch overflow issues

---

**Document Version**: 1.0
**Approved By**: Angel Polanco
**Implementation**: After Voice Conversation Sprint

