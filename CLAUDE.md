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
