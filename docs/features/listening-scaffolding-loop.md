# Feature Spec: Listening Scaffolding Loop

> **Status**: Approved
> **Author**: Angel + Claude
> **Date**: 2026-02-27
> **Spec file**: `docs/features/listening-scaffolding-loop.md`

---

## Layer 1 — Feature Brief

### 1. What is it?
A 4-stage listening exercise that progressively adds and removes subtitles to train real-world comprehension, proving measurable improvement within a single session.

### 2. Who gets the gift?
Professionals at any level who freeze when native speakers talk at real speed — the person who reads well but panics in meetings, calls, or conversations because spoken language is faster and messier than written.

### 3. What's the gift?
Confidence that they can understand without reading. Stage 4 is the proof — they heard it with no help, couldn't get it, went through scaffolding, and now they understand. The measurable delta (before/after score) IS the gift.

### 4. Feature Gate Check
- [x] Helps the user articulate better (you can't speak what you can't hear)
- [x] Prepares them for a real-world scenario (meetings, calls, conversations are listening-first)
- [x] Measures or improves communication ability (comprehension accuracy per stage)
- [x] Respects their time and intelligence (4 focused stages, no fluff)

### 5. What happens if we don't build it?
Listening stays a flat single-pass experience — TTS plays, user answers questions, done. No scaffolding, no progression, no proof of improvement. Users who struggle feel stuck with no path forward.

**Brief verdict**: PROCEED

---

## Layer 2 — Full Spec

### Identity

| Field | Value |
|-------|-------|
| **Name** | Listening Scaffolding Loop |
| **One-liner** | 4-stage progressive listening that proves comprehension improvement |
| **Category** | Core Learning |
| **Phase** | Phase 4 — Professional Polish |

### Purpose

**Problem statement**: Current listening practice is a single shot — you either get it or you don't. No scaffolding helps users bridge the gap between "I heard sounds" and "I understood meaning." Users who score poorly have no path to improve within the same exercise.

**User story**: As a professional learning a new language, I want listening practice that gradually reveals meaning so that I can train my ear and prove to myself that my comprehension is improving.

**Success metric**:
- Average comprehension delta (Stage 4 score minus Stage 1 score) > 30%
- Users who complete all 4 stages (completion rate) > 70%
- Listening exercise engagement (sessions per user per week) increases vs current flat mode

### User Experience

**Entry point**: Same as current — lesson-session listening activity OR practice tab listening grid item. The 4-stage flow replaces the current single-pass flow.

**Step-by-step flow**:

1. **Loading** — Content generates (dialogue + comprehension questions). ElevenLabs audio generates and caches.

2. **Stage 1: Pure Audio** — ElevenLabs plays the dialogue. Screen shows only audio controls (Play, Replay, Slow). No text visible. After user is ready, they tap "Continue" to answer 3 comprehension questions. Score saved as "before" score. Then proceeds to Stage 2.

3. **Stage 2: Audio + Target Language Subtitles** — Same cached audio replays. Target language text appears as subtitles, synced to dialogue lines. User connects sounds to written words. Replay available. User taps "Next Stage" when ready.

4. **Stage 3: Audio + Native Translation Subtitles** — Same cached audio replays. Native language translations shown as subtitles. User now understands full meaning. Replay available. User taps "Next Stage" when ready.

5. **Stage 4: Pure Audio (Proof)** — Audio plays one final time. No text. User taps "Continue" to answer the SAME 3 comprehension questions. Score saved as "after" score.

6. **Results** — Before/after comparison displayed. "Your comprehension improved from X% to Y%". Points awarded. Return to lesson-session or practice tab.

**Edge cases**:
- User gets 3/3 on Stage 1 → Still go through all stages (reinforcement is valuable), but results screen celebrates mastery: "Perfect from the start!"
- User gets 0/3 on Stage 4 → Encouraging message: "Listening takes practice. Try replaying stages 2-3." Offer "Try Again" button.
- ElevenLabs fails → Fall back to expo-speech (device TTS). Log the fallback for monitoring.
- User exits mid-exercise → Progress NOT saved. Must complete all 4 stages for score to count.
- Network loss after audio cached → Stages 2-4 still work (audio is local). Only initial generation needs network.

**Stage transition UX**:
- User-controlled: explicit "Next Stage" button between each stage
- Replay available at every stage (same cached audio)
- Stage indicator shows progress: `● ○ ○ ○` → `● ● ○ ○` → etc.
- No back-navigation between stages (forward only — the scaffolding is progressive)

### Design

**Visual description**:

Each stage is the SAME screen with different render modes. The screen has:

1. **Stage indicator** (top) — 4 dots showing current stage, with stage label
2. **Audio controls** (center) — Large play button, slow button, replay button
3. **Subtitle area** (below audio) — Shows/hides based on stage:
   - Stage 1 & 4: Empty or minimal "Listen carefully..." prompt
   - Stage 2: Target language text, line by line, highlighted as audio plays
   - Stage 3: Native translation text, line by line
4. **Action area** (bottom) — "Next Stage" or "Answer Questions" button
5. **Vocabulary sidebar** (optional, horizontal scroll) — Key words from the dialogue

**Comprehension quiz** (after Stage 1 and Stage 4):
- Same 3 MCQ questions both times
- Options shuffled between Stage 1 and Stage 4 (prevent pattern memory)
- Visual feedback: green (correct), red (wrong)
- No "correct answer" reveal after Stage 1 (don't spoil the learning)
- Full reveal after Stage 4

**Results screen**:
- Two score circles side by side: Before | After
- Delta highlighted: "+2 questions" or "33% → 100%"
- Points awarded badge
- Two buttons: "New Exercise" | "Back"

**Design system alignment**:
- Colors: Teal (`#06D6A0`) for listening activities (existing convention)
- Background: `colors.background.primary` (`#0A0E1A`)
- Cards: `colors.background.card` (`#1A1F3A`)
- Stage dots: active = teal gradient, inactive = gray
- Audio button: large (60x60), teal gradient, pulse animation while playing
- Slow button: purple gradient with turtle icon (existing pattern)
- Subtitles: `colors.text.primary` for target language, `colors.text.secondary` for translations
- Stage transitions: fade animation (300ms)

**New components needed**:
- `StageIndicator` — 4-dot progress with label (reusable for other multi-stage flows)
- `SubtitleDisplay` — Renders dialogue lines with show/hide modes
- Refactor of existing `practice-listening.tsx` to support staged flow

### Technical Approach

**Files to modify**:
- `app/practice-listening.tsx` — Replace single-pass flow with 4-stage state machine
- `hooks/useElevenLabsTTS.ts` — Ensure caching works for replay across stages
- `lib/lesson/discoveryGenerator.ts` — No changes needed (dialogue data already has text + translation)
- `lib/ai/practiceGenerator.ts` — No changes needed (same data structure)

**Files to create**:
- `components/listening/StageIndicator.tsx` — Stage progress dots + label
- `components/listening/SubtitleDisplay.tsx` — Dialogue line renderer with modes
- `components/listening/ComprehensionQuiz.tsx` — Extract quiz logic from practice-listening (reuse)
- `components/listening/ResultsComparison.tsx` — Before/after score display

**State machine**:
```typescript
type ListeningStage =
  | 'loading'
  | 'stage1_listen'      // Pure audio
  | 'stage1_quiz'        // Comprehension check (before)
  | 'stage2_subtitles'   // Audio + target text
  | 'stage3_translation' // Audio + native text
  | 'stage4_listen'      // Pure audio (proof)
  | 'stage4_quiz'        // Comprehension check (after)
  | 'results'            // Before/after comparison

interface ListeningState {
  stage: ListeningStage;
  beforeScore: number | null;
  afterScore: number | null;
  audioUri: string | null;    // Cached ElevenLabs audio
  content: ListeningContent;  // Dialogue + questions
}
```

**Audio strategy**:
- Generate all dialogue audio via ElevenLabs on initial load
- Cache audio URI locally (already supported by ttsCache)
- Replay from cache on stages 2-4 (zero additional API cost)
- Fallback: expo-speech if ElevenLabs fails

**Dependencies**:
- No new packages needed
- ElevenLabs API key (already configured)
- Existing: expo-speech, expo-av, useElevenLabsTTS hook

**Data model changes**: None. Existing `ListeningContent` and `DialogueLine` interfaces already contain all needed fields (text, translation, speaker).

**Points integration**:
- Listen/Read formula: 10 + score/10 = 10-20pts
- Score = Stage 4 quiz percentage (the "after" score)
- Delta tracked but not used for points (used for user motivation display)

### Risks & Guardrails

**Privacy**: No new data collection. Audio generated on-demand, cached locally, no user audio recorded. Comprehension scores stored same as current (competencyMetrics).

**Performance**:
- ElevenLabs generation adds 1-3 seconds loading time on Stage 1
- Mitigation: Loading screen with progress indicator during audio generation
- All subsequent stages are instant (cached audio)

**Breaking changes**:
- Replaces the current single-pass listening flow
- Users who were used to the old flow will see a different experience
- Mitigation: The new flow is strictly better — more engagement, same content

**Scope traps**:
- DO NOT add real-time subtitle syncing (word-by-word highlight). Line-by-line is sufficient for v1.
- DO NOT add speed selection UI. Use existing slow (0.6x) and normal (0.85x) only.
- DO NOT add different voices per speaker in dialogue. Single voice is fine for v1.
- DO NOT build offline pre-generation. Network required for first load, cached after.

### Definition of Done

- [ ] 4-stage flow works end-to-end (loading → stage1 → quiz → stage2 → stage3 → stage4 → quiz → results)
- [ ] ElevenLabs audio generates and caches on first stage
- [ ] Audio replays from cache on stages 2-4 (no re-generation)
- [ ] Fallback to expo-speech works when ElevenLabs unavailable
- [ ] Target language subtitles display correctly in Stage 2
- [ ] Native translation subtitles display correctly in Stage 3
- [ ] Comprehension quiz works after Stage 1 (before score)
- [ ] Same quiz works after Stage 4 (after score) with shuffled options
- [ ] Results screen shows before/after comparison
- [ ] Points awarded based on Stage 4 score
- [ ] Score saved to competency metrics
- [ ] Activity completion signals back to lesson-session
- [ ] Stage indicator shows progress accurately
- [ ] Replay button works at every stage
- [ ] Stage transitions animate smoothly
- [ ] Design follows listening teal theme + design system tokens
- [ ] Works in both lesson mode and practice tab mode
- [ ] No new TypeScript errors
- [ ] Edge cases handled (ElevenLabs failure, perfect Stage 1, exit mid-exercise)

---

_Spec version: 1.0 — Approved: 2026-02-27_
