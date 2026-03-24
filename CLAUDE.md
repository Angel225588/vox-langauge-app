# CLAUDE.md - Project Instructions for Claude Code

## Premium Quality Standard — Zero-Tolerance for Mistakes

**Vox targets top professionals who need fast, functional, premium services.**
These users pay for quality and have zero patience for broken experiences.

### The Premium Rule

Every screen, every interaction, every piece of content must work correctly
**the first time**. Professionals don't debug apps — they delete them.

```
BEFORE writing any code, ask:
1. Will this work in ALL supported languages? (EN/FR/ES)
2. Will this work on first launch? (no stale cache, no race conditions)
3. Will this work offline? (graceful degradation, never a blank screen)
4. Would a lawyer/doctor trust this with their time?
```

### Language Integrity — CRITICAL

The user's selected target language is **sacred**. Showing English content
to someone learning French is a product-breaking bug, not a minor issue.

- **NEVER hardcode 'english' as a fallback** in content generators
- **ALWAYS read language from AsyncStorage** if Zustand isn't hydrated
- **ALWAYS include language in cache keys** so content doesn't get served in the wrong language
- **ALL fallback/template content must be language-aware** — no English-only fallbacks
- Test the full chain: onboarding selection → store → cache key → AI prompt → rendered content

### Simplicity Over Features

- Premium means **less but perfect**, not more features
- Every tap should feel intentional and responsive
- If it takes more than 2 taps to do something common, redesign it
- Loading states should feel premium (calm transitions, not spinners)
- Error states should offer a clear next action, never a dead end

### Known Anti-Patterns to Avoid

1. **Zustand hydration race**: Always `await` profile from AsyncStorage as fallback
2. **Stale content cache**: Include language + version in ALL cache keys
3. **Wrong-language content**: Log CRITICAL errors when fallback profile is used
4. **Template English**: Fallback content templates must support all target languages

---

## NotebookLM — Single Source of Truth

**Notebook ID**: `2bf69003-b9cb-4d10-a40f-68b60777cb95`
**URL**: https://notebooklm.google.com/notebook/2bf69003-b9cb-4d10-a40f-68b60777cb95

All project knowledge, architectural decisions, feature specs, and documentation live in this NotebookLM notebook. It is the **first source of truth** for the Vox Language App.

### How to Use
- **Query before searching**: When you need project context (architecture, features, decisions, brand guidelines), query the notebook first via the `nlm` CLI before searching files or the web.
- **Update after implementing**: After completing a feature or making an architectural decision, add a source or note to the notebook documenting what was done and why.
- **Debugging**: Query the notebook for context on how systems work before diving into code.

### CLI Commands (Quick Reference)
```bash
# Query the notebook (RAG-powered answers from all sources)
nlm notebook query 2bf69003-b9cb-4d10-a40f-68b60777cb95 "your question here"

# Add a new source (after feature completion)
nlm source add 2bf69003-b9cb-4d10-a40f-68b60777cb95 --file path/to/doc.md --title "Title"
nlm source add 2bf69003-b9cb-4d10-a40f-68b60777cb95 --text "Decision: We chose X because Y" --title "Architecture Decision"

# List all sources in the notebook
nlm source list 2bf69003-b9cb-4d10-a40f-68b60777cb95
```

### Current Sources (17)
- CLAUDE.md, Product Roadmap, Master Features, Feature Specs
- AI Conversation, Voice Conversation, Word Bank & FSRS, Scenarios
- Data Privacy & GDPR, Progressive Immersion, Learning Path System
- Storage Strategy, UI Design System, Gemini API Integration
- Brand Identity, Color Palette, Phase 1 Onboarding & Staircase

---

## Git Workflow

**Always push commits to GitHub after committing.** After any commit, run:
```bash
git push origin <branch-name>
```

When merging feature branches to main:
1. Commit any pending changes
2. Merge the feature branch into main
3. Push main to GitHub: `git push origin main`

## Project Overview

Vox Language App - A language learning mobile app built with React Native (Expo).

## Tech Stack

- **Framework**: React Native with Expo
- **UI**: Tamagui + custom design system
- **Navigation**: Expo Router (file-based routing)
- **State**: React hooks + context
- **Backend**: Supabase (auth, database)
- **AI**: Google Gemini for personalise lesson generation
- **Testing**: Jest + React Native Testing Library, Tdd

## Key Directories

- `app/` - Expo Router pages and layouts
- `components/cards/` - Learning card components (vocab, quiz, speaking, etc.)
- `components/ui/` - Reusable UI components
- `lib/` - Business logic, API clients, utilities
- `constants/` - Design system tokens, config
- `__tests__/` - Jest test files

## Common Commands

```bash
# Start development server
npx expo start

# Run tests
npm test

# Type check
npx tsc --noEmit

# Install dependencies
npm install --legacy-peer-deps
```

## Important Notes

- Using React 18.3.1 LTS (not React 19) for stability
- Some files have `@ts-nocheck` due to Tamagui v1.138.0 type issues
- Design system tokens in `constants/designSystem.ts`

## UI/UX & Design System

**CRITICAL**: When making UI changes, ALWAYS use the `/ui-ux` skill first to ensure design consistency.

### Design System Location
- **Tokens**: `constants/designSystem.ts`
- **Colors**: Dark theme with purple/indigo accents
- **Components**: `components/ui/`

### Key Design Tokens
```typescript
// Primary colors
colors.primary.DEFAULT     // #6366F1 (Indigo)
colors.secondary.DEFAULT   // #06D6A0 (Teal)
colors.background.primary  // #0A0E1A (Deep space blue-black)
colors.background.card     // #1A1F3A (Card background)

// Text colors
colors.text.primary        // #F9FAFB (Almost white)
colors.text.secondary      // #D1D5DB (Light gray)

// Gradients
colors.gradients.primary   // ['#6366F1', '#8B5CF6']

// Spacing
spacing.sm = 8, spacing.md = 16, spacing.lg = 24

// Border radius
borderRadius.md = 12, borderRadius.lg = 16, borderRadius.xl = 24
```

### When to Use /ui-ux Skill
- Creating new UI components
- Modifying existing screens
- Adding buttons, cards, modals
- Any visual changes

This ensures all UI follows the established neomorphic dark theme with purple accents.

### Card Design Rules

**All learning cards MUST follow these design patterns:**

1. **Type Badge (Top-Right Fixed)**
   - Every card displays its type/category badge at top-right
   - Position: `position: absolute, top: spacing.md, right: spacing.lg, zIndex: 100`
   - Use gradient matching the card type theme
   - Text: uppercase, `typography.fontSize.xs`, bold
   - Example: "VERB TENSE", "HOMOPHONE", "VOCABULARY"

2. **Translations Hidden by Default**
   - Translations should NEVER be shown automatically
   - User must intentionally tap to reveal (for immersion)
   - Use "Show translation" button with eye icon

3. **Audio Always Accessible**
   - Audio buttons (Play + Slow) should be visible without expanding
   - Minimum touch target: 44x44px
   - Use success gradient for Play, purple gradient for Slow (🐢)

4. **Action Buttons (Bottom Fixed)**
   - 2 buttons preferred: "Again" (error gradient) / "Got it" (success gradient)
   - Full-width, equal size, `borderRadius.lg`
   - Position: fixed at bottom with safe area padding

5. **Card Expansion**
   - Cards should be tappable to expand/collapse
   - Use spring animations (`animation.spring.default`)
   - Expanded state shows: definition, example, audio controls

```typescript
// Type badge style pattern
typeBadgeContainer: {
  position: 'absolute',
  top: spacing.md,
  right: spacing.lg,
  zIndex: 100,
},
typeBadge: {
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
  borderRadius: borderRadius.md,
}
```

### ComparisonCard Design Rules

**CRITICAL RULES:**

1. **MAX 2 ITEMS per card!** Never more - users shouldn't need to scroll.
2. **NOT for direct translations!** Only for comparing similar sounds.
3. **Use sequences** for 3+ tenses (Card 1: go/went, Card 2: went/gone)

The ComparisonCard (ComparisonCardV2) is specifically designed to help users:
- **Hear and understand differences** between similar-sounding words
- **Compare verb tenses**: go vs went, went vs gone (2 cards in sequence)
- **Learn homophones**: there vs their, their vs they're (2 cards in sequence)
- **Distinguish similar words**: affect vs effect
- **Recognize formal vs informal**: shall vs will

**Wrong usage:**
```typescript
// DON'T use for simple translations:
items: [
  { label: 'English', word: 'apple' },
  { label: 'Spanish', word: 'manzana' },
]

// DON'T use 3 items (requires scrolling):
items: [
  { label: 'Present', word: 'go' },
  { label: 'Past', word: 'went' },
  { label: 'Past Participle', word: 'gone' }, // TOO MANY!
]
```

**Correct usage:**
```typescript
// Card 1: Present vs Past
type: 'verb-tense',
items: [
  { label: 'Present', word: 'go', phonetic: '/ɡoʊ/', nativeApprox: 'góu' },
  { label: 'Past', word: 'went', phonetic: '/wɛnt/', nativeApprox: 'uent' },
]

// Card 2 (sequence): Past vs Past Participle
type: 'verb-tense',
items: [
  { label: 'Past', word: 'went', phonetic: '/wɛnt/', nativeApprox: 'uent' },
  { label: 'Past Participle', word: 'gone', phonetic: '/ɡɔːn/', nativeApprox: 'gon' },
]
```

**Audio buttons**: Big (60x60), high contrast, theme color for Play, subtle border for Slow (🐢).

## Security

**CRITICAL**: Run `/security` regularly to ensure the app remains secure.

### Security Skill
The `/security` skill provides comprehensive security auditing with 6 expert agents:
- **DVS Agent** - Dependency Vulnerability Scanner
- **CSA Agent** - Code Security Auditor
- **SSA Agent** - Supabase Security Auditor
- **DPG Agent** - Data Privacy Guardian
- **MSS Agent** - Mobile Security Specialist
- **ASG Agent** - AI/API Security Guardian

### Quick Security Commands
```bash
/security full   # Complete security audit
/security quick  # Dependencies + secrets scan
/security deps   # Dependency audit only
/security code   # Code security scan only
```

### Security Documentation
- **Main Doc**: `docs/SECURITY.md`
- **Audit Reports**: `.claude/security-reports/`
- **Skill Definition**: `.claude/commands/security.md`

### Security Best Practices
- Never commit secrets to repository
- Use `EXPO_PUBLIC_*` environment variables
- Run `npm audit` before each release
- Keep dependencies updated

---

## Product Vision & Positioning

### Who We Are
**Vox Language — The professional language learning tool built for people who need real results.**

Vox is the "Claude of language learning" — professional, AI-driven, privacy-first. We respect our users' intelligence and time. No mascots, no guilt-tripping streaks, no ads, no data selling. A precision instrument, not a toy.

### Our Client (Primary)
**Professionals who NEED the language:**
- Business professionals relocating internationally
- Workers in international roles (sales, consulting, management)
- Medical and legal professionals serving multilingual communities
- Diplomats and government workers
- Remote workers on global teams
- Entrepreneurs expanding to new markets

### Our Client (Secondary)
- Serious self-learners committed to real fluency
- Travelers who want genuine conversations, not tourist phrases
- Anyone who values quality, privacy, and results over gamification

### What We Are NOT
- We are NOT a gamified engagement trap
- We are NOT optimizing for daily streak metrics
- We are NOT selling user data or showing ads
- We are NOT dumbing down language learning

### Core KPIs — What We Measure
Our success metrics are about **real communication ability**, not engagement:

1. **Articulation Score** — Can you pronounce clearly and be understood?
2. **Fluency Rating** — Can you speak without excessive pausing/hesitation?
3. **Idea Communication** — Can you express your intended meaning?
4. **Scenario Competency** — Can you handle real-world situations?

### Real-World Scenarios We Train For
Every lesson and conversation is built around situations our clients actually face:

- **Business**: Pitching ideas, negotiating deals, presenting to stakeholders, leading meetings
- **Professional**: Job interviews, networking events, client calls, email/written communication
- **Social**: Making friends, small talk, debating opinions, telling stories
- **Daily Life**: Medical appointments, legal matters, banking, housing, transportation
- **Travel**: Navigating airports, restaurants, asking for directions, emergencies

### Learning Philosophy
```
Phase 1: AI Conversations (safe space to practice and fail)
    → Build vocabulary, grammar, pronunciation with AI tutor
    → Scenario-based practice with real-world contexts
    → Immediate feedback on articulation and fluency

Phase 2: Practice Partners (structured human interaction)
    → Matched with other learners at similar level
    → Guided conversation topics and scenarios
    → Peer feedback and cultural exchange

Phase 3: Real-World Fluency
    → Confidence to use the language professionally
    → Measurable improvement in articulation and communication
    → Ready for the situations that matter to you
```

### Gamification Philosophy
Gamification exists to **support learning**, not replace it:
- Progress indicators that show real skill growth (not arbitrary XP)
- Achievements tied to actual milestones (first conversation, first debate, etc.)
- Streaks are optional encouragement, NEVER guilt-tripping
- No hearts/lives system — learning from mistakes is encouraged
- Leaderboards based on skill metrics, not time spent

### Build Principles — The Feature Gate

**MANDATORY**: Before building ANY feature, change, or component, run it through this gate:

```
┌─────────────────────────────────────────────────────────┐
│                   VOX FEATURE GATE                       │
│                                                          │
│  Does this feature answer YES to at least ONE?           │
│                                                          │
│  1. Does this help the user articulate better?           │
│  2. Does this prepare them for a real-world scenario?    │
│  3. Does this measure or improve communication ability?  │
│  4. Does this respect their time and intelligence?       │
│                                                          │
│  ALL NO → DO NOT BUILD. Explain why and suggest          │
│           what would pass the gate instead.               │
│                                                          │
│  ANY YES → Proceed. Document which principle it serves.  │
└─────────────────────────────────────────────────────────┘
```

**CRITICAL GUARDRAILS — Call these out immediately if violated:**

1. **Privacy Violation Alert**: If a proposed feature collects new data, sends data to a new third party, adds tracking/analytics, or weakens user privacy in any way — **STOP and flag it**. Say: "This change affects our privacy promise. Our clients chose us because we don't track them. Here's the impact: [explain]. Do you want to proceed?"

2. **Generic Path Alert**: If a proposed change makes learning paths more generic instead of more personalized — **STOP and flag it**. Say: "This change makes the experience more generic. Our professionals need personalized paths for their specific scenarios. Here's a better approach: [suggest]."

3. **Gamification Creep Alert**: If a proposed feature adds engagement mechanics over learning value (unnecessary streaks, XP inflation, artificial urgency, hearts/lives) — **STOP and flag it**. Say: "This adds engagement mechanics that don't serve learning. Our clients find this patronizing. Here's how to achieve the same goal through actual skill measurement: [suggest]."

4. **Professional Tone Alert**: If copy, UI text, or notifications use childish language, excessive enthusiasm, guilt-tripping, or emojis where icons should be — **STOP and flag it**. Say: "This doesn't match our professional tone. Our brand voice is confident, direct, and respectful. Here's the professional alternative: [suggest]."

### Feature Spec Framework — RECOMMENDED Before Building

For any feature that touches 3+ files or adds new UI/routes, define it before building it.

**Process**: Use `/feature` or manually fill out the template.

```
Layer 1: Feature Brief (5 questions, 5 min)
  1. What is it? (one sentence)
  2. Who gets the gift? (specific user + moment)
  3. What's the gift? (value, not feature)
  4. Feature Gate check (which criteria?)
  5. What if we don't build it?
  → Verdict: PROCEED / KILL / NEEDS MORE THINKING

Layer 2: Full Spec (7 sections, 15-30 min)
  Identity → Purpose → User Experience → Design →
  Technical → Risks → Definition of Done
```

- **Template**: `docs/features/TEMPLATE.md`
- **Completed specs**: `docs/features/[feature-slug].md`
- **Skill**: `/feature [idea]` — interactive wizard that walks through both layers
- After completion, spec is added to NotebookLM as a source

**Skip threshold**: Single-file fixes, color changes, typos, and bug fixes under 3 files don't need a spec.

## Change Impact Analysis — MANDATORY Before Editing

Before modifying ANY screen, component, or route file, Claude MUST perform this analysis:

### 1. Trace Navigation Chains
- What routes/screens link TO this file? (grep for the file's route path)
- What routes/screens does this file link TO? (check all router.push/navigate calls)
- Is this file the ONLY entry point for a downstream flow?

### 2. Evaluate Scope
- If changing a route path: what was the old path, and does anything else use it?
- If changing grid items/buttons: what flows do the current routes power?
- If archiving/removing a file: is it the only bridge to other features?

### 3. Change Only What Was Asked
- UI-only requests (colors, icons, layout) must NOT change route paths or feature wiring
- Route changes require explicit confirmation: "This changes [card] from [old route] to [new route]. The old route powered [feature flow]. Proceed?"
- Never archive or remove a screen without verifying no other screen depends on it

### 4. Orphan Check (Post-Edit)
After editing, grep to verify that every route referenced in the change is still reachable from at least one navigation path. If a route loses its only entry point, flag it: "Warning: [route] has no UI entry point after this change."

---

## Claude Code Permissions — Whitelist & Escalation

### AUTO-APPROVED (No permission needed)
These actions are safe, reversible, and standard development work:

```
# File Operations
- Read any file in the project
- Edit existing files (components, lib, constants, tests)
- Create new files in existing directories
- Delete files confirmed as dead code by audit

# Git Operations
- git status, git diff, git log
- git add <specific files>
- git commit (with descriptive message)
- git push origin <feature-branch>
- git checkout -b <new-feature-branch>
- git stash / git stash pop

# Development Commands
- npm test (run tests)
- npx tsc --noEmit (type checking)
- npm install --legacy-peer-deps <package>
- npx expo start (dev server)
- npm audit

# Team Operations
- Create/manage teams for multi-agent work
- Assign tasks to teammates
- Run research agents in background
- Write to Obsidian (Vox Strategy/ folder)

# Code Quality
- Fix lint errors, type errors
- Remove dead code (confirmed unused)
- Update imports and barrel exports
- Write and update tests
```

### REQUIRES CONFIRMATION (Ask before proceeding)
These actions have consequences that should be reviewed:

```
# Git - Destructive/Shared
- git push origin main              → "Pushing to main. This is visible to all collaborators."
- git merge <branch> into main      → "Merging to main. Changes: [summary]. Proceed?"
- git branch -D <branch>            → "Deleting branch permanently. It has [n] unmerged commits."
- git reset / git revert            → "This will undo commits. Here's what changes: [list]."

# Dependencies
- npm install <new-package>         → "Adding new dependency: [package]. Size: [x]. Why: [reason]."
- npm uninstall <package>           → "Removing [package]. Used in [files]. Safe to remove because: [reason]."
- Major version upgrades            → "Upgrading [package] from v[x] to v[y]. Breaking changes: [list]."

# Database / Backend
- Supabase schema changes           → "Modifying DB schema. This affects production data. Change: [detail]."
- Migration files                   → "Creating migration. This will run on next deploy. SQL: [preview]."
- RLS policy changes                → "Changing security policy on [table]. Impact: [explain]."

# Architecture Changes
- New directory structure            → "Creating new module at [path]. Architectural reason: [why]."
- Changing core algorithms (SM-2, priority) → "Modifying [algorithm]. Before/after behavior: [diff]."
- API route changes                  → "Changing API contract. Affected clients: [list]."

# Privacy-Sensitive
- Adding new EXPO_PUBLIC_ env vars   → "New client-exposed env var. Contains: [what]. Visible to users: yes."
- Sending data to new third party    → "PRIVACY ALERT: This sends [data type] to [service]. User consent needed."
- Changing auth flow                 → "Modifying authentication. Impact: [explain]."
```

### NEVER DO (Always refuse)
```
- Delete .env or credential files
- Commit secrets or API keys
- Force push to main
- Drop database tables without explicit instruction
- Add analytics/tracking SDKs
- Add advertising integrations
- Share or log user conversation content
- Bypass security checks (--no-verify)
- Remove privacy-related code or consent flows
```

---

## Staircase Generation Lifecycle

The staircase (learning path) uses a progressive generation model to balance instant UX with personalized AI content.

### Path Skeleton (Template-Based, Instant, $0)
- Generated from onboarding scenarios in `lib/services/previewStairs.ts`
- Each scenario expands into 2-3 progressive lessons:
  - **Beginners** (`starting_fresh`, `basics`): 3 per scenario — Essentials → In Practice → Fluency
  - **Intermediate+** (`conversational`, `confident`, `near_fluent`): 2 per scenario — Core Skills → Advanced
- Recalibration stair appended at end. Total capped at 12 (DB constraint).
- Stored in AsyncStorage for unauthenticated display.

### Content Generation (AI, On-Demand)
- **Stair 1 content**: Generated via Gemini after skeleton is displayed on home screen (future)
- **Subsequent stairs**: Generated at ~80% completion of previous stair (future)
- **Feedback loop**: Each lesson uses previous lesson's performance data to personalize (future)
- **Cost model**: 1 API call per active lesson, not bulk generation

### Reveal Animation
- Cards appear one-by-one with 250ms stagger (orchestrated in `home.tsx`)
- Title types character-by-character (30ms/char) in `CondensedStairCard.tsx`
- Description fades in after title completes (200ms)
- Icon scales in with spring animation

### Key Files
- `lib/services/previewStairs.ts` — skeleton generation from onboarding data
- `components/staircase/CondensedStairCard.tsx` — card with typing reveal animation
- `app/(tabs)/home.tsx` — stagger orchestration
- `app/(auth)/onboarding-v3/creating-path.tsx` — 3-second calm screen before reveal

---

## Vocabulary System — Anki-Grade SRS

### Philosophy
Our flashcard/vocabulary system should match Anki's rigor for professionals:
- **FSRS algorithm** (Free Spaced Repetition Scheduler) — more accurate than SM-2
- **Custom decks per profession** — medical, legal, business, tech vocabulary
- **Contextual learning** — words learned in phrases and scenarios, not isolation
- **User-controlled content** — professionals can add their own terms and phrases
- **Import/Export** — interoperability with existing study materials

### Current State
- Basic SM-2 in `lib/spaced-repetition/sm2.ts`
- Word bank in `lib/word-bank/` (best-architected module)
- Priority algorithm: `(milestoneUrgency*0.3 + weaknessScore*0.4 + recencyPenalty*0.2 + cefrMatch*0.1)`

### Target State
- FSRS algorithm replacing SM-2 (`ts-fsrs` package, MIT license)
- Professional vocabulary tracks (medical, legal, business, tech)
- Phrase-based cards (not just single words)
- Anki-style card types: cloze deletion, reversed cards, type-in (built natively, NOT Anki code)
- Anki deck import/export (`.apkg` via `anki-reader` / `anki-apkg-export`)
- User-added content with AI-assisted definitions and examples
- Cross-device sync via Supabase

### The Vocabulary-to-Conversation Loop (Core Innovation)
```
Flashcards (FSRS) → Pre-call vocab review → AI Conversation Call
    ↑                                              ↓
    └──── Post-call analysis feeds back ←──────────┘
          (used words = Good, missed = Again)
```
This closed loop is our #1 differentiator. No competitor has it.

### Anki Integration Rules
- **USE**: FSRS algorithm (`ts-fsrs`, MIT license) — safe
- **USE**: Anki concepts (cloze, reversed, note types) — ideas, not code
- **USE**: .apkg import/export for interoperability — separate libraries
- **NEVER USE**: Anki source code (AGPL-3.0) — would force open-sourcing our entire app
- All card UI is native React Native using our design system — never HTML/WebView
