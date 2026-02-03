# CLAUDE.md - Project Instructions for Claude Code

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
- **AI**: Google Gemini for lesson generation
- **Testing**: Jest + React Native Testing Library

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
