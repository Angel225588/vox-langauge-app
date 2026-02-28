# Production Readiness Report — 2026-02-27

## 1. Route Integrity

### BLOCKER: Many screens missing from root Stack layout

The root `app/_layout.tsx` only registers 17 screens in the `<Stack>`, but the app has 30+ top-level routes. The following screens are navigated to via `router.push()` or `router.replace()` but are NOT explicitly registered in the root Stack:

**Missing from Stack (actively navigated):**
- `voice-conversation` — main voice conversation feature, navigated from home, practice, lesson-session
- `practice-reading` — navigated from practice grid + lesson-session
- `practice-writing` — navigated from practice grid + lesson-session
- `practice-listening` — navigated from practice grid + lesson-session
- `privacy-dashboard` — navigated from profile > Privacy & Account
- `vocabulary-dashboard` — navigated from practice grid
- `competency-dashboard` — navigated from practice tab KPI boxes
- `vox-library` — navigated from practice grid
- `flashcard` — folder route, navigated from practice quick actions
- `lesson` — folder route, navigated from home stair press
- `stair-session` — folder route, navigated from staircase tab
- `vocab-practice` — folder route
- `mini-lesson` — folder route
- `conversation-history` — navigated from conversation flows
- `conversation-detail` — folder route
- `recording-feedback` — folder route
- `recordings-library` — screen route
- `notes-library` — screen route
- `writing-feedback` — folder route

**Impact:** In Expo Router, unregistered routes still work via file-based routing, but they get default screen options (e.g., visible header, default animation). Users may see a flash of the default header before it's hidden, or get unexpected transitions. Not a crash, but a visual polish issue.

**Recommendation:** Add `<Stack.Screen>` entries with `headerShown: false` for all actively navigated routes.

### PASS: Dev/test routes

The following test screens exist but are only reachable from collapsed "Developer Tools" sections, so they are not user-facing:
- `test-cards`, `test-voice-system`, `test-elevenlabs`, `test-gemini-live`, `test-interactive-scenario`, `test-writing-task`, `design-showcase`

### PASS: Route references match existing files

All routes referenced via `router.push()` or `router.replace()` correspond to existing files in the `app/` directory. No broken route references found.

### PASS: Practice tab grid routes

All practice grid items route to correct screens:
- Vocabulary -> `/vocabulary-dashboard` (exists)
- Reading -> `/practice-reading` (exists)
- Writing -> `/practice-writing` (exists)
- Listening -> `/practice-listening` (exists)
- Library -> `/vox-library` (exists)
- Flow -> empty route `''`, guarded by `if (card.route)` check (safe no-op)

---

## 2. Error Handling

### WARNING: `loadActiveLessonPlan` lacks try/catch

`app/lesson-session.tsx:50-54` — `JSON.parse()` on raw AsyncStorage data without try/catch. If stored JSON is corrupt, this throws and the `.then()` chain on line 103 has no `.catch()`, causing an unhandled promise rejection.

```typescript
// Current (no error handling)
export async function loadActiveLessonPlan(): Promise<LessonPlan | null> {
  const json = await AsyncStorage.getItem(LESSON_PLAN_KEY);
  if (!json) return null;
  return JSON.parse(json);
}
```

**Fix:** Wrap in try/catch and return null on parse failure.

### WARNING: `loadPreviewStairs().then(setPreviewStairs)` in home.tsx

`app/(tabs)/home.tsx:280` — No `.catch()` on the promise chain. However, `loadPreviewStairs` itself has internal try/catch returning null, so this is low risk. Still, adding `.catch()` is defensive best practice.

### PASS: Main screens have loading and error states

- `_layout.tsx` — Shows initialization error screen with message
- `lesson-session.tsx` — Shows loading spinner, handles missing plan with redirect to home
- `feedback-detail.tsx` — Has fallback default scores
- `index.tsx` — Has status message and handles auth/onboarding edge cases
- `creating-path.tsx` — Has safety cap timer (20s), error states on steps, non-blocking errors

### PASS: Onboarding error resilience

`creating-path.tsx` correctly marks failed steps as 'error' without blocking navigation. The safety timer ensures navigation happens within 20s regardless.

---

## 3. Navigation Flow

### PASS: Onboarding -> Home -> Lesson -> Activity -> Back to session

```
index.tsx → onboarding-v3 (name → language → goal → profession → scenarios → level → first-lesson)
  → creating-path → lesson-session → [vocabulary|listening|reading|writing|voice_call]
  → lesson-session (via returnToSession) → feedback-detail → lesson-complete → home
```

All links in this chain verified. The `returnToSession` pattern uses `storeActivityCompletion()` + `router.replace('/lesson-session')` for clean state hand-off.

### PASS: Practice tab → each practice screen → back

All practice grid items use `router.push()` for forward navigation and `router.back()` for return. Auth gating redirects unauthenticated users to onboarding-v3.

### PASS: Profile → Settings → Privacy

```
profile → edit-profile (back)
profile → privacy-dashboard (back)
profile → activity-dashboard (back)
profile → feedback-history (back)
```

All navigation verified. Delete account properly cascades and redirects to root.

### WARNING: Lesson session missing back/exit UI

`lesson-session.tsx` has `gestureEnabled: false` in Stack options, meaning the user cannot swipe back. The `handleExit` function exists but is only passed to `VocabularyPracticeScreen`. For other activity types (listening, reading, writing, voice_call), the screen replaces to the practice screen which has its own back button. No dead-end, but the transition is via router.replace, not router.back.

---

## 4. Build Configuration

### PASS: app.json configuration

- Bundle ID: `com.voxlanguage.app` (consistent iOS + Android)
- Version: `1.0.0`
- Splash background: `#0A0E1A` (matches design system)
- iOS encryption: `ITSAppUsesNonExemptEncryption: false` (correct for App Store)
- Permissions: Microphone + Speech Recognition properly described
- Audio background mode: enabled (required for voice conversations)
- EAS project ID: configured

### PASS: No debugger statements

Zero `debugger;` statements found in the codebase.

### PASS: __DEV__ usage is appropriate

`__DEV__` is used only in staircase.tsx and onboarding-v2 for dev-only features — correctly guarded.

### PASS: No test/staging endpoints

No references to `localhost`, `127.0.0.1`, `test.api`, or `staging.` in app code.

### WARNING: Developer Tools section ships to production

Both `app/(tabs)/practice.tsx` and `app/(tabs)/profile.tsx` have "Developer Tools" sections that are collapsible but still visible to end users. These expose internal routes like:
- Onboarding V3
- Lesson Screen (dev-test)
- Test All Cards
- Voice System Test
- ElevenLabs Voice Test
- Gemini Live API Test
- Interactive Scenarios

**Recommendation:** Gate behind `__DEV__` or feature flag before production release.

### PASS: .env is gitignored

`.env` file is properly listed in `.gitignore`.

---

## 5. Crash Risks

### WARNING: `loadActiveLessonPlan` — unhandled JSON.parse

As noted in Error Handling section. Corrupt AsyncStorage data → unhandled promise rejection → potential crash.

### PASS: No unguarded array access found

Array operations use `.find()`, `.filter()`, `.map()` which are safe. Optional chaining is used appropriately on potentially null values.

### PASS: useEffect cleanup

- `practice.tsx` AnimNum: `cancelAnimationFrame` in cleanup
- `home.tsx` stagger reveal: `clearTimeout` in cleanup
- `creating-path.tsx` safety timer: `clearTimeout` in cleanup
- Reanimated shared values: cleaned up by the library automatically

### PASS: No setInterval without cleanup

Zero uses of `setInterval` in app code.

### PASS: No addEventListener without cleanup

Zero uses of `addEventListener` in app code.

---

## 6. Performance

### PASS: No memory leaks detected

- No uncleaned event listeners
- No uncleaned intervals
- requestAnimationFrame properly cleaned up with cancelAnimationFrame
- useEffect cleanup functions present where needed

### PASS: No expensive operations on mount

- Database initialization is batched in root `_layout.tsx` before app renders
- Learning path loads are async with loading states
- Discovery content generation is background-deferred

### WARNING: Lesson session generates discovery content on every mount

`lesson-session.tsx` line 151-170 calls `generateDiscoveryLessonContent()` and `generateRemainingActivities()` on mount if `is_discovery` is true. The caching in `discoveryGenerator.ts` mitigates repeated API calls, but each mount still triggers the background generation chain. This is by design for progressive loading, but worth monitoring for unnecessary Gemini API calls.

---

## Summary

| Category | Status | Issues |
|----------|--------|--------|
| Route Integrity | **BLOCKER** | 19 screens missing from root Stack registration |
| Error Handling | WARNING | `loadActiveLessonPlan` JSON.parse unguarded |
| Navigation Flow | PASS | All main flows verified, no dead ends |
| Build Configuration | WARNING | Developer Tools visible to end users |
| Crash Risks | WARNING | 1 unhandled promise rejection path |
| Performance | PASS | No memory leaks, proper cleanup |

### Priority Fixes

1. **BLOCKER**: Add `<Stack.Screen>` entries to `app/_layout.tsx` for all 19 missing routes (visual polish, prevents header flash)
2. **WARNING**: Add try/catch to `loadActiveLessonPlan()` to prevent crash on corrupt data
3. **WARNING**: Gate Developer Tools behind `__DEV__` check
4. **RECOMMENDED**: Add `.catch()` to promise chains in home.tsx and lesson-session.tsx
