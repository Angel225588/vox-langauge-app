# Claude Code Settings for Vox Language

## Project Context

This is the **Vox Language** mobile app project - a language learning application built with React Native (Expo).

**Deadline**: December 8, 2025 (8 days from Nov 30)

## Required Reading Before Any Session

Before starting ANY work, Claude should read:

1. `docs/claude.md` - Main project reference (has quick priority summary at top)
2. `docs/VOX_PRIORITY_MATRIX.md` - Current priorities and deadline
3. `docs/PROJECT_STATUS.md` - What's done, what's in progress

## Available Commands

### Project Management
- `/pm` - Start a project manager session (full status + recommendations)
- `/status` - Quick status check
- `/next` - Get next task recommendation
- `/research` - Look up user research insights
- `/deadline` - Check deadline status and scope

### Code Review Agents (Autonomous)
- `/review-ui` - UI/UX specialized code reviewer
  - Checks design system compliance
  - Validates accessibility
  - Audits component performance
  - Auto-fixes violations
  - Runs tests before committing

- `/master-review` - Master code reviewer (FULL AUTONOMY)
  - Comprehensive code quality audit
  - Documentation verification
  - Test coverage analysis
  - Security scanning
  - Dependency health check
  - Auto-fixes and commits changes
  - Reports to PM via Obsidian
  - Arguments: `full`, `docs`, `tests`, `security`, `quick`

- `/daily-report` - Generate PM daily report
  - Summarizes all development activity
  - Tracks progress toward deadline
  - Saves to Obsidian for PM review
  - Creates quick summary for daily glance

## Automated Hooks

The following automations run without manual intervention:

### Post-Commit Hook
- **Trigger**: After any `git commit` command
- **Action**: Logs commit for review, triggers review reminder
- **Location**: `.claude/hooks/post-commit-review.sh`

### Session End Hook
- **Trigger**: When Claude Code session ends
- **Action**: Generates daily report, appends to `docs/daily-reports/`
- **Location**: `.claude/hooks/session-end-report.sh`

### Review Log
- All review triggers logged to `.claude/review-log.md`
- Daily reports stored in `docs/daily-reports/`

## Development Rules

1. **P0 before P1**: Never work on lower priority items until higher ones are done
2. **Deadline-aware**: We have 8 days - be aggressive but realistic
3. **Offline-first**: Every feature must work offline
4. **Research-backed**: Reference user research for decisions
5. **Test before moving on**: Each feature must work on iOS

## Target User

"Frustrated Intermediate" learner:
- Used Duolingo for 6+ months
- Hit a plateau, can't hold conversations
- Wants grammar explanations, not just drills
- Willing to pay for actual results

## Key Differentiators to Build

1. Grammar explanations (Duolingo's weakness)
2. AI conversation with delayed hints
3. Optional gamification toggles
4. Vocabulary transparency
5. Reward trials, not perfection

## Tech Stack Quick Reference

- React Native + Expo SDK 54
- TypeScript
- SQLite (offline) + Supabase (sync)
- Gemini AI
- NativeWind + Tamagui
- SM-2 Spaced Repetition
