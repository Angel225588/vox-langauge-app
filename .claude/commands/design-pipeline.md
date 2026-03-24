# Design Pipeline — AI Screen Generation + Multi-Agent Review

You are the **Design Pipeline Orchestrator**. You generate app screen mockups
using Nano Banana (Gemini image generation), then run them through a review
chain before handing off to the UI/UX and dev teams.

## Architecture

```
PROMPT + REQUIREMENTS
        │
        ▼
┌─────────────────┐
│  NANO BANANA    │  Generate screen mockups
│  (Image Gen)    │  Save to /mockups/screens/
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  REVIEW AGENT   │  Check coherence, brand, flow
│  (Agent 1)      │  Mark: REFINE or READY
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
 REFINE    READY
    │         │
    ▼         ▼
 Re-prompt  ┌─────────────────┐
 + retry    │  TRIPLE VERIFY   │  /verify on the designs
            │  (3 Agents)      │
            └────────┬────────┘
                     │
                     ▼
            ┌─────────────────┐
            │  HANDOFF PACKAGE │  Designs + specs + notes
            │  → UI/UX Team    │  → Dev Team
            │  → CEO/Ops       │
            └─────────────────┘
```

## Arguments

- `/design-pipeline <screen-name>` — Generate a single screen
- `/design-pipeline flow <flow-name>` — Generate a full user flow (multiple screens)
- `/design-pipeline all` — Generate all core screens
- `/design-pipeline review` — Review existing mockups in /mockups/screens/

## Screen Catalog (generate with `/design-pipeline all`)

### Onboarding Flow
1. Welcome / Splash
2. Name Input
3. Language Selection (French/Spanish/English)
4. Goal Selection
5. Profession Selection
6. Scenario Picker (multi-select)
7. Proficiency Level
8. Creating Your Path (loading/animation)

### Core App
9. Home — Staircase View (learning path)
10. Lesson Preview (stair detail)
11. Lesson Session — Vocabulary Activity
12. Lesson Session — Listening Activity
13. Lesson Session — Reading Activity
14. Lesson Session — Writing Activity
15. Lesson Session — Voice Call Briefing
16. Lesson Complete / Results
17. Discovery Sign-up Wall

### Practice Tab
18. Practice Hub (grid: Vocab, Reading, Writing, Listening, Voice)
19. Flashcard Session (FSRS)
20. Vocabulary Dashboard
21. Reading Library (2x2 grid)
22. Listening Library (2x2 vinyl grid)
23. Teleprompter (reading practice)

### Profile & Settings
24. Profile Screen
25. Competency Dashboard (4 KPI rings)
26. Privacy Dashboard
27. Settings

### Conversations
28. Voice Conversation (active call)
29. Conversation History
30. Conversation Detail + Feedback

## Execution Protocol

### Phase 1: Generate

For each screen, use `lib/ai/imageGen.ts`:

```typescript
import { generateScreenMockup } from '@/lib/ai/imageGen';

const mockup = await generateScreenMockup({
  screenName: 'Home — Staircase View',
  description: 'Main home screen showing the learning path as a vertical staircase. Each stair is a lesson card with gradient (blue=current, gray=locked, green=complete). User name and flag emoji at top. Skill carousel above the staircase.',
  elements: ['staircase cards', 'progress indicators', 'skill carousel', 'user greeting', 'language flag'],
  userFlow: 'User lands here after onboarding. Taps a stair to enter lesson.',
  targetLanguage: 'french',
});
```

Save each generated image to:
```
mockups/screens/{flow}/{nn}-{screen-name}.png
mockups/screens/{flow}/{nn}-{screen-name}.json  (metadata: prompt, model, timestamp)
```

Example:
```
mockups/screens/onboarding/01-welcome.png
mockups/screens/onboarding/01-welcome.json
mockups/screens/core/09-home-staircase.png
mockups/screens/core/09-home-staircase.json
```

### Phase 2: Review Agent

Launch a single review agent that evaluates ALL generated screens:

```
You are the Design Review Agent for Vox Language App.

Review each screen mockup for:

1. BRAND COHERENCE
   - Dark theme (#0A0E1A background)?
   - Electric blue (#0036FF) accents?
   - Professional tone — no childish elements?
   - Consistent visual language across screens?

2. FLOW LOGIC
   - Does each screen connect to the next logically?
   - Are CTAs clear and obvious?
   - Can a user navigate without instructions?
   - Is the back/exit path clear?

3. CONTENT ACCURACY
   - Is text in the correct language?
   - Are labels professional and clear?
   - No placeholder or lorem ipsum text?

4. PREMIUM FEEL
   - Does this look like a $20/month app?
   - Would a doctor/lawyer feel comfortable using it?
   - Is the visual hierarchy clear?

For each screen, output:
- ✅ APPROVED — ready for verification
- 🔄 REFINE — [specific issue] + [refined prompt to fix it]
- ❌ REJECT — [fundamental problem] + [recommendation]
```

Re-generate any screens marked REFINE with the updated prompt (max 2 retries).

### Phase 3: Triple Verify

Run `/verify` on the approved designs package.
The 3 agents evaluate from Functional, Quality, and User Advocate perspectives.

### Phase 4: Handoff Package

Create a handoff document at `mockups/HANDOFF.md`:

```markdown
# Vox Design Handoff — [date]

## Screen Index
| # | Screen | Status | File | Notes |
|---|--------|--------|------|-------|
| 1 | Welcome | ✅ Approved | onboarding/01-welcome.png | — |
| 2 | ... | ... | ... | ... |

## Flow Diagrams
[Screen-to-screen navigation map]

## Design Requirements
- Font: DM Sans (display), Source Sans 3 (body), DM Mono (code)
- Border radius: 12-24px
- Touch targets: minimum 44x44px
- Animations: spring-based, 250ms stagger for lists
- All content in target language (translations hidden by default)

## Implementation Notes
[Per-screen notes for the dev team]

## Approved By
- Review Agent: [verdict]
- Triple Verification: [verdict]
- Date: [date]
```

This package goes to:
- **UI/UX Team** — for pixel-perfect implementation specs
- **Dev Team** — for component building
- **CEO / Operations** — for approval and stakeholder alignment

---

## Quick Commands

```bash
/design-pipeline home              # Generate home screen
/design-pipeline flow onboarding   # Generate full onboarding flow
/design-pipeline all               # Generate all 30 screens
/design-pipeline review            # Review existing mockups
```

## Prerequisites

- `@google/genai` SDK installed (✅ done)
- `lib/ai/imageGen.ts` module ready (✅ done)
- `EXPO_PUBLIC_GEMINI_API_KEY` set (✅ done)
- `/mockups/screens/` directory exists
