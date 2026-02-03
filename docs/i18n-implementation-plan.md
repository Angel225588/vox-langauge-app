# i18n Implementation Plan - PM Guide for Agent Coordination

## Vox Language App - Internationalization

**Document Version:** 1.1
**Created:** December 16, 2025
**Status:** Phase 1 Complete - Executing Phase 2
**PM Reference:** i18n-master-plan.md

---

## Phase Status Tracker

| Phase | Status | Agent | Completed |
|-------|--------|-------|-----------|
| **Phase 1: Foundation** | COMPLETE | Agent A | Dec 16, 2025 |
| Phase 2: Core Screens | IN PROGRESS | Agent B + C | - |
| Phase 3: Practice Cards | PENDING | Agent B + C | - |
| Phase 4: Language Switcher | PENDING | Agent C | - |
| Phase 5: RTL Support | PENDING | Agent D | - |
| Phase 6: Testing & QA | PENDING | Agent E | - |
| Phase 7: Add Languages | PENDING | Agent B | - |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Agent Workstream Assignments](#2-agent-workstream-assignments)
3. [Phase Breakdown with Dependencies](#3-phase-breakdown-with-dependencies)
4. [Critical Path Analysis](#4-critical-path-analysis)
5. [Risk Assessment & Mitigation](#5-risk-assessment--mitigation)
6. [Acceptance Criteria per Phase](#6-acceptance-criteria-per-phase)
7. [Communication Protocol](#7-communication-protocol)
8. [Appendix: File Inventory](#appendix-file-inventory)

---

## 1. Executive Summary

### Project Overview

The i18n implementation will enable the Vox Language App to support **10+ interface languages** including RTL (Right-to-Left) languages like Arabic and Hebrew. This is critical for user adoption in non-English markets.

### Master Plan Assessment

| Aspect | Status | Notes |
|--------|--------|-------|
| Library Selection | Approved | i18next + react-i18next + expo-localization |
| Folder Structure | Approved | Namespace-based organization |
| RTL Support | Approved | I18nManager with app restart flow |
| Testing Strategy | Approved | Unit + Component + Manual + E2E |
| Performance Budget | Approved | <50KB/language, <200ms switch |

### Success Metrics

- **Primary:** All UI text translatable within 7 phases
- **Secondary:** RTL layouts functional for Arabic/Hebrew
- **Tertiary:** Language switch without data loss

---

## 2. Agent Workstream Assignments

### Workstream Overview

```
                    ┌─────────────────────┐
                    │     PM (You)        │
                    │  Coordination Hub   │
                    └──────────┬──────────┘
                               │
       ┌───────────┬───────────┼───────────┬───────────┐
       │           │           │           │           │
       ▼           ▼           ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Agent A  │ │ Agent B  │ │ Agent C  │ │ Agent D  │ │ Agent E  │
│ Infra    │ │ Content  │ │ UI/UX    │ │ RTL      │ │ QA       │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
```

---

### Agent A: Infrastructure Agent

**Role:** Core i18n setup and configuration

**Responsibilities:**
1. Install dependencies (expo-localization, i18next, react-i18next)
2. Create `/i18n/index.ts` configuration
3. Create `/lib/storage/languageStorage.ts`
4. Update `app/_layout.tsx` for i18n initialization
5. Create utility files:
   - `/i18n/utils/formatters.ts`
   - `/i18n/utils/rtl.ts`
   - `/i18n/utils/languageDetector.ts`
6. Create hooks:
   - `/i18n/hooks/useLanguage.ts`
   - `/i18n/hooks/useRTL.ts`

**Deliverables:**
```
i18n/
├── index.ts                    ← Main config
├── types.ts                    ← TypeScript types
├── utils/
│   ├── formatters.ts           ← Date, number, currency
│   ├── rtl.ts                  ← RTL detection
│   └── languageDetector.ts     ← Device locale
└── hooks/
    ├── useLanguage.ts          ← Language switching
    └── useRTL.ts               ← RTL state
lib/storage/
└── languageStorage.ts          ← AsyncStorage persistence
```

**Dependencies:** None (starts first)

**Estimated Work:** Phase 1 (Foundation)

---

### Agent B: Content/Translation Agent

**Role:** Create and manage translation files

**Responsibilities:**
1. Extract all hardcoded strings from codebase
2. Create English (en) translation files:
   - `common.json` - Buttons, validation, common UI
   - `onboarding.json` - Onboarding screens
   - `home.json` - Home screen, staircase
   - `practice.json` - All card types
   - `settings.json` - Settings screen
   - `errors.json` - Error messages
   - `rewards.json` - Gamification text
3. Create Spanish (es) translations
4. Create French (fr) translations
5. Create Arabic (ar) translations
6. Create Hebrew (he) translations
7. Document translation keys and naming conventions

**Deliverables:**
```
i18n/locales/
├── en/
│   ├── common.json
│   ├── onboarding.json
│   ├── home.json
│   ├── practice.json
│   ├── settings.json
│   ├── errors.json
│   └── rewards.json
├── es/
│   └── ... (same structure)
├── fr/
│   └── ... (same structure)
├── ar/
│   └── ... (same structure)
└── he/
    └── ... (same structure)
```

**Dependencies:** Agent A (must complete index.ts first)

**Estimated Work:** Phase 2-3 (Core Screens + Practice Cards)

---

### Agent C: UI/UX Migration Agent

**Role:** Update components to use translations

**Responsibilities:**
1. Migrate onboarding screens:
   - `app/(auth)/onboarding-v2/index.tsx`
   - `app/(auth)/onboarding-v2/languages.tsx`
   - `app/(auth)/onboarding-v2/login.tsx`
   - `app/(auth)/onboarding-v2/signup.tsx`
   - `app/(auth)/onboarding-v2/ready.tsx`
   - `app/(auth)/onboarding-v2/your-commitment.tsx`
   - `app/(auth)/onboarding-v2/your-level.tsx`
   - `app/(auth)/onboarding-v2/your-why.tsx`
2. Migrate tab screens:
   - `app/(tabs)/home.tsx`
   - `app/(tabs)/practice.tsx`
   - `app/(tabs)/profile.tsx`
3. Migrate practice cards (all in `components/cards/`)
4. Migrate UI components (all in `components/ui/`)
5. Create LanguageSwitcher component
6. Add language selection to settings

**Migration Pattern:**
```typescript
// BEFORE
<Text>My Roadmap</Text>

// AFTER
import { useTranslation } from 'react-i18next';
const { t } = useTranslation('home');
<Text>{t('title')}</Text>
```

**Deliverables:**
- All screens using `useTranslation` hook
- `components/LanguageSwitcher.tsx`
- Settings integration for language selection

**Dependencies:** Agent A + Agent B (need both config and translations)

**Estimated Work:** Phase 3-4 (Component Migration + Language Switcher)

---

### Agent D: RTL Support Agent

**Role:** Implement Right-to-Left language support

**Responsibilities:**
1. Audit all styles for hardcoded left/right
2. Convert to start/end equivalents:
   ```typescript
   // BAD
   paddingLeft: 16, marginRight: 24

   // GOOD
   paddingStart: 16, marginEnd: 24
   ```
3. Implement directional icon flipping
4. Handle RTL language switch with app restart
5. Test layouts in Arabic and Hebrew
6. Update `app.json` for RTL configuration
7. Create RTL testing documentation

**Files to Audit:**
- All files in `components/`
- All files in `app/`
- `constants/designSystem.ts`

**Deliverables:**
- RTL-compatible styles throughout codebase
- Working Arabic and Hebrew layouts
- RTL testing guide

**Dependencies:** Agent C (needs migrated components)

**Estimated Work:** Phase 5 (RTL Support)

---

### Agent E: QA & Testing Agent

**Role:** Test and validate i18n implementation

**Responsibilities:**
1. Create i18n unit tests:
   - Translation key existence
   - Pluralization rules
   - Interpolation
2. Create component tests:
   - LanguageSwitcher functionality
   - Translation rendering
3. Create RTL visual tests
4. Manual testing checklist execution:
   - All screens in all languages
   - Text overflow verification
   - Date/number formatting
5. Performance testing:
   - Bundle size measurement
   - Language switch timing
6. Create E2E tests with Detox/Maestro

**Deliverables:**
```
__tests__/i18n/
├── translations.test.ts
├── rtl.test.ts
├── formatters.test.ts
└── components/
    ├── LanguageSwitcher.test.tsx
    └── TranslatedComponents.test.tsx
```

**Dependencies:** All agents (tests entire implementation)

**Estimated Work:** Phase 6 (Testing & QA)

---

## 3. Phase Breakdown with Dependencies

### Phase Execution Timeline

```
Phase 1 (Foundation)     ████████████████░░░░░░░░░░░░░░░░░░░░
                         Agent A: Infrastructure

Phase 2 (Core Screens)   ░░░░░░░░████████████████░░░░░░░░░░░░
                         Agent B: EN translations + Agent C: Migration starts

Phase 3 (Practice Cards) ░░░░░░░░░░░░░░░░████████████████░░░░
                         Agent B: Practice translations + Agent C: Card migration

Phase 4 (Lang Switcher)  ░░░░░░░░░░░░░░░░░░░░░░░░████████░░░░
                         Agent C: LanguageSwitcher UI

Phase 5 (RTL Support)    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████
                         Agent D: RTL implementation

Phase 6 (Testing & QA)   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████
                         Agent E: Full test suite

Phase 7 (Add Languages)  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
                         Agent B: Additional translations (ongoing)
```

### Dependency Matrix

| Phase | Depends On | Blocks | Agent(s) |
|-------|------------|--------|----------|
| 1 Foundation | - | 2, 3, 4, 5, 6 | A |
| 2 Core Screens | 1 | 4, 5, 6 | B, C |
| 3 Practice Cards | 1, 2 | 4, 5, 6 | B, C |
| 4 Language Switcher | 2, 3 | 5, 6 | C |
| 5 RTL Support | 4 | 6 | D |
| 6 Testing & QA | 5 | 7 | E |
| 7 Add Languages | 6 | - | B |

---

## 4. Critical Path Analysis

### Critical Path (Must Complete Sequentially)

```
[Phase 1: Foundation] → [Phase 2: Core Screens] → [Phase 4: Lang Switcher] → [Phase 5: RTL] → [Phase 6: QA]
     Agent A                Agent B + C               Agent C                  Agent D          Agent E
```

### Parallel Opportunities

| Phase | Can Run In Parallel With |
|-------|--------------------------|
| Agent B: ES/FR translations | Agent C: Component migration |
| Agent D: Style audit | Agent E: Writing test cases |
| Agent B: AR/HE translations | Agent D: RTL implementation |

### Bottlenecks

1. **Phase 1 completion** - All other work blocked until i18n config exists
2. **Translation file availability** - UI migration needs translation keys
3. **RTL testing** - Requires Arabic/Hebrew translations complete

---

## 5. Risk Assessment & Mitigation

### Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **R1:** Tamagui i18n conflicts | Medium | High | Test Tamagui components early; fallback to manual text extraction |
| **R2:** RTL breaking existing layouts | High | Medium | Use `I18nManager.isRTL` checks; test incrementally |
| **R3:** Bundle size exceeds budget | Medium | Medium | Lazy load translations per language |
| **R4:** Missing translation keys | High | Low | Create script to detect untranslated strings |
| **R5:** App restart UX for RTL | Low | Medium | Clear user messaging; smooth transition flow |
| **R6:** Translation quality (AI/MT) | Medium | Medium | Professional review for high-priority languages |

### Technical Risks Deep Dive

#### R1: Tamagui + i18n Integration

**Issue:** Tamagui uses optimizing compiler that may not play well with dynamic translation keys.

**Detection:**
```typescript
// This might break Tamagui optimization:
<TamaguiText>{t('dynamic.key')}</TamaguiText>
```

**Mitigation:**
- Test early with one Tamagui component
- If issues: extract text content outside Tamagui wrapper
- Fallback: Use standard React Native Text for translated content

#### R2: RTL Layout Breakage

**Issue:** Many components have hardcoded left/right positioning.

**Detection:** Search codebase for:
```bash
grep -r "Left\|Right" components/ app/
grep -r "paddingLeft\|paddingRight\|marginLeft\|marginRight" components/ app/
```

**Mitigation:**
- Systematic audit before RTL phase
- Create RTL snapshot tests
- Test on real Arabic device

---

## 6. Acceptance Criteria per Phase

### Phase 1: Foundation - Acceptance Criteria

- [ ] `npm install` succeeds with expo-localization, i18next, react-i18next
- [ ] `i18n/index.ts` exports `initializeI18n()` function
- [ ] `SUPPORTED_LANGUAGES` array includes all 10 languages
- [ ] `lib/storage/languageStorage.ts` can save/retrieve language preference
- [ ] App loads with i18n initialized (no errors in console)
- [ ] `useLanguage` hook returns current language
- [ ] Type safety: SupportedLanguage type enforced

**Verification Command:**
```bash
npx expo start # App should load without i18n errors
```

---

### Phase 2: Core Screens - Acceptance Criteria

- [ ] `i18n/locales/en/common.json` has 50+ keys
- [ ] `i18n/locales/en/onboarding.json` covers all onboarding screens
- [ ] `i18n/locales/en/home.json` covers home screen
- [ ] All onboarding screens use `useTranslation` hook
- [ ] Home screen displays translated text
- [ ] Pluralization works (e.g., "1 word" vs "5 words")
- [ ] No hardcoded English text visible on migrated screens

**Verification:**
```typescript
// In-app test:
i18n.changeLanguage('es');
// All migrated screens should show Spanish
```

---

### Phase 3: Practice Cards - Acceptance Criteria

- [ ] `i18n/locales/en/practice.json` covers all card types
- [ ] All cards in `components/cards/` use translations:
  - [ ] ComparisonCard.tsx
  - [ ] FillInBlankCard.tsx
  - [ ] ReadingResultsCard.tsx
  - [ ] RolePlayCard.tsx
  - [ ] SentenceScrambleCard.tsx
  - [ ] SpeakingCard.tsx
  - [ ] TeleprompterCard.tsx
  - [ ] TextInputCard.tsx
- [ ] Vocabulary cards (`components/cards/vocabulary/`) use translations
- [ ] Feedback messages translated
- [ ] Spanish (es) practice translations complete

**Verification:**
```bash
grep -r "\"[A-Z]" components/cards/ # Should return minimal hardcoded strings
```

---

### Phase 4: Language Switcher - Acceptance Criteria

- [ ] `components/LanguageSwitcher.tsx` renders all 10 languages
- [ ] Current language shows checkmark
- [ ] Tapping language changes `i18n.language`
- [ ] Language preference saved to AsyncStorage
- [ ] On next app launch, saved language loads
- [ ] Language switcher accessible from Settings/Profile
- [ ] French (fr) translations complete

**Verification:**
1. Select Spanish
2. Close app completely
3. Reopen app
4. App should be in Spanish

---

### Phase 5: RTL Support - Acceptance Criteria

- [ ] Arabic (ar) translations complete
- [ ] Hebrew (he) translations complete
- [ ] No `paddingLeft/Right` in migrated components (use start/end)
- [ ] Back navigation button flips in RTL
- [ ] Icons flip appropriately (chevrons, arrows)
- [ ] Text aligns to right in RTL mode
- [ ] Switching to Arabic shows RTL restart prompt
- [ ] After restart, layout mirrors correctly
- [ ] `app.json` has `CFBundleAllowMixedLocalizations: true`

**Verification:**
1. Set device to Arabic
2. Launch app
3. All text right-aligned
4. Navigation feels natural RTL

---

### Phase 6: Testing & QA - Acceptance Criteria

- [ ] Unit tests pass: `npm test` (i18n tests)
- [ ] Component tests: LanguageSwitcher renders correctly
- [ ] Manual checklist: All 5 languages verified
- [ ] No text overflow in any language (German notoriously longer)
- [ ] Bundle size < 50KB per language
- [ ] Language switch < 200ms
- [ ] E2E test passes: Switch to Spanish, verify home screen text

**Verification:**
```bash
npm test -- --coverage # i18n tests should have >80% coverage
```

---

### Phase 7: Additional Languages - Acceptance Criteria

- [ ] German (de) translations complete
- [ ] Portuguese (pt) translations complete
- [ ] Chinese (zh) translations complete
- [ ] Japanese (ja) translations complete
- [ ] Korean (ko) translations complete
- [ ] All languages pass manual QA checklist
- [ ] Translation workflow documented

---

## 7. Communication Protocol

### Agent Reporting Structure

Each agent should report:

1. **Daily Status:** Brief update on progress
2. **Blockers:** Immediately escalate dependencies not met
3. **Completion:** Clear "Phase X complete" signal

### Status Template

```
## Agent [A/B/C/D/E] Status Update

**Phase:** [Current Phase]
**Progress:** [X% complete]

### Completed Today:
- Item 1
- Item 2

### In Progress:
- Item 1 (X% done)

### Blockers:
- [None / List blockers]

### Ready for Review:
- [ ] Yes / [ ] No
```

### Handoff Protocol

When completing a phase:

1. **Commit all changes** with clear message
2. **Update this document** with completion status
3. **Create PR** (if applicable)
4. **Notify dependent agents**
5. **PM verifies** acceptance criteria met

### File Modification Rules

| Agent | Can Modify | Cannot Modify |
|-------|------------|---------------|
| A (Infra) | `i18n/`, `lib/storage/`, `app/_layout.tsx` | `components/`, translations |
| B (Content) | `i18n/locales/` | Core config, components |
| C (UI/UX) | `app/`, `components/` | `i18n/` config |
| D (RTL) | Styles in all files | Translation content |
| E (QA) | `__tests__/` | Production code (report bugs) |

---

## Appendix: File Inventory

### Files to Create (New)

```
i18n/
├── index.ts
├── types.ts
├── locales/
│   ├── en/
│   │   ├── common.json
│   │   ├── onboarding.json
│   │   ├── home.json
│   │   ├── practice.json
│   │   ├── settings.json
│   │   ├── errors.json
│   │   └── rewards.json
│   ├── es/ (same structure)
│   ├── fr/ (same structure)
│   ├── de/ (same structure)
│   ├── ar/ (same structure)
│   ├── he/ (same structure)
│   ├── zh/ (same structure)
│   ├── ja/ (same structure)
│   ├── ko/ (same structure)
│   └── pt/ (same structure)
├── utils/
│   ├── formatters.ts
│   ├── rtl.ts
│   └── languageDetector.ts
└── hooks/
    ├── useLanguage.ts
    └── useRTL.ts

lib/storage/
└── languageStorage.ts

components/
└── LanguageSwitcher.tsx

__tests__/i18n/
├── translations.test.ts
├── rtl.test.ts
├── formatters.test.ts
└── components/
    └── LanguageSwitcher.test.tsx
```

### Files to Modify (Existing)

**High Priority (Phase 2-3):**
- `app/_layout.tsx` - Add i18n initialization
- `app/(auth)/onboarding-v2/*.tsx` - All onboarding screens
- `app/(tabs)/home.tsx`
- `app/(tabs)/practice.tsx`
- `app/(tabs)/profile.tsx`
- `components/cards/*.tsx` - All card components
- `components/ui/*.tsx` - UI components with text

**Medium Priority (Phase 4-5):**
- `app.json` - RTL configuration
- `constants/designSystem.ts` - RTL-aware spacing

**Low Priority (Phase 6):**
- `package.json` - Test scripts

### Current Hardcoded String Count (Estimated)

| Location | Estimated Strings |
|----------|-------------------|
| Onboarding screens | ~50 |
| Home screen | ~20 |
| Practice cards | ~100 |
| UI components | ~40 |
| Error messages | ~30 |
| **Total** | **~240** |

---

## Quick Reference: Agent Commands

### Agent A (Infrastructure)
```bash
# Install dependencies
npx expo install expo-localization
npm install --legacy-peer-deps i18next react-i18next

# Create i18n folder structure
mkdir -p i18n/locales/en i18n/utils i18n/hooks
```

### Agent B (Content)
```bash
# Find hardcoded strings
grep -r "\"[A-Z]" app/ components/ --include="*.tsx"

# Validate JSON syntax
npx jsonlint i18n/locales/en/common.json
```

### Agent C (UI/UX)
```bash
# Find components needing migration
grep -rL "useTranslation" app/ --include="*.tsx"
```

### Agent D (RTL)
```bash
# Find hardcoded left/right
grep -r "Left\|Right" components/ app/ --include="*.tsx"
```

### Agent E (QA)
```bash
# Run i18n tests
npm test -- --testPathPattern=i18n

# Measure bundle size
npx expo export --platform ios && du -h dist/
```

---

**Document Status:** Ready for Agent Assignment
**Last Updated:** December 16, 2025
**PM Contact:** Project Lead
**Reference:** i18n-master-plan.md
