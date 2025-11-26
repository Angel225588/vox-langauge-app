# Changelog

All notable changes to the Vox Language App project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Date picker component for motivation timeline question using `@react-native-community/datetimepicker` (`app/(auth)/onboarding/motivation.tsx`)
- Tomorrow's session planning document for 8 homepage component cards (`docs/SESSION_HOMEPAGE_CARDS.md`)
- Database migration file for `motivation_data` column (`docs/migrations/add_motivation_data.sql`)
- This CHANGELOG.md file to document all project changes

### Changed
- Updated `user_onboarding_profiles` table schema to include `motivation_data` JSONB column (`docs/vox-staircase-schema.sql:42`)

---

## [1.0.0] - 2025-11-24

### Added
- **Motivation Data Integration**: Deep motivation questions (why, fear, stakes, timeline) now integrated into Gemini AI staircase generation
  - Added `MotivationData` interface to `lib/gemini/staircase-generator.ts:29-34`
  - Updated `UserProfile` interface to include optional `motivation_data` field
  - Enhanced Gemini prompt with motivation context for highly personalized learning paths
- **Database Schema**: Added `motivation_data` JSONB column to `user_onboarding_profiles` table
  - Created migration: `docs/migrations/add_motivation_data.sql`
  - Updated schema: `docs/vox-staircase-schema.sql:42`
  - Added GIN index for faster querying
- **Comprehensive Testing**: Authentication flow testing completed by Gemini
  - Created `__tests__/hooks/useAuth.test.ts` with 7 comprehensive test cases
  - All auth tests passing (sign up, login, session persistence, sign out, token refresh, error handling)
- **Session Documentation**: Created `docs/ONBOARDING_COMPLETION_SUMMARY.md` documenting all completion criteria

### Fixed
- **Staircase Generator Tests**: Fixed 5 failing tests (now 10/10 passing)
  - Refactored `lib/gemini/staircase-generator.ts` to use lazy initialization pattern
  - Added `getGenAI()` function to defer instance creation
  - Added `__setGenAIForTesting()` helper for dependency injection in tests
  - Updated all test mocks in `__tests__/lib/staircase-generator.test.ts`
- **Motivation Screen Scrolling**: Fixed inability to see all 4 questions
  - Changed `KeyboardAvoidingView` from `flex: 0.7` to `flex: 1` (`app/(auth)/onboarding/motivation.tsx:143`)
  - Increased `ScrollView` `paddingBottom` from `spacing.lg` to `200` (`app/(auth)/onboarding/motivation.tsx:149`)
  - All questions (why, fear, stakes, timeline) now accessible via scrolling

### Technical Improvements
- **Lazy Initialization Pattern**: Singleton instances now fully testable
- **Dependency Injection**: `__setGenAIForTesting()` allows proper mocking of external APIs
- **Enhanced AI Personalization**: Gemini receives 4 additional motivation data points for context-aware learning paths
- **Database Schema Evolution**: JSONB column with GIN index enables flexible motivation data structure

### Test Results
```
Test Suites: 4 passed, 4 total
Tests:       5 todo, 41 passed, 46 total
Execution Time: ~1.07s
```

**Test Coverage:**
- ✅ 10/10 Staircase Generator tests passing
- ✅ 15/15 Database Sync tests passing (3 todo for future)
- ✅ 9/9 Onboarding hook tests passing
- ✅ 7/7 Authentication tests passing (newly completed by Gemini)

### Files Modified
1. `lib/gemini/staircase-generator.ts` - Motivation data integration + lazy initialization
2. `__tests__/lib/staircase-generator.test.ts` - Fixed test mocks
3. `app/(auth)/onboarding/motivation.tsx` - Scrolling fix + date picker implementation
4. `docs/vox-staircase-schema.sql` - Added motivation_data column
5. `__tests__/hooks/useAuth.test.ts` - Comprehensive auth testing (created by Gemini)

### Files Created
1. `docs/migrations/add_motivation_data.sql` - Database migration
2. `docs/ONBOARDING_COMPLETION_SUMMARY.md` - Session completion documentation
3. `docs/SESSION_HOMEPAGE_CARDS.md` - Tomorrow's session planning (created by Gemini)
4. `CHANGELOG.md` - This file

---

## Project Context

**Platform:** iOS-first (iPhone optimized), Android secondary
**Tech Stack:** React Native (Expo SDK 54+), TypeScript, Tamagui, Supabase, SQLite, Google Gemini AI
**Current Phase:** Phase 1 - Authentication & Onboarding (Complete)
**Next Phase:** Phase 2 - Home Screen & Dashboard (8 component cards)

---

## Version History

- **1.0.0** (2025-11-24) - Onboarding flow complete with motivation integration
- **0.1.0** (2025-11-22) - Initial project setup and Tamagui configuration

---

**Last Updated:** November 24, 2025
**Maintained By:** Claude Code + Gemini AI
