# Onboarding V3 — Implementation Plan

**Date**: February 21, 2026
**Status**: APPROVED — Ready for implementation
**Design System**: Glassmorphism (`glass` tokens in `constants/designSystem.ts`)

---

## Agreed Flow

```
PRE-SIGNUP (Collect → Value)
═══════════════════════════════════════════════
Screen 0: Welcome
  Crystal logo + "Your voice, in any language."
  Phone language auto-detected as native language (changeable)
  [Get Started] | "Already have an account? Sign in"

Screen 1: Name
  "First, what should we call you?"
  Single glass input, first name only, auto-focused

Screen 2: Target Language
  "[Name], what language do you need?"
  3 vertical glass cards: English, French, Spanish
  Cultural imagery + flag + glass overlay

Screen 3: Goal
  "What do you need [language] for?"
  4-5 pre-written goal cards + "Something else?" custom input
  Subtitle: "Be specific — it shapes your entire path"

Screen 4: Profession
  "What's your world, [Name]?"
  2-column glass grid (10 professions) with subtle icons
  + Search/type input with "Add new" option
  Ref: Stitch-style dark glass cards with muted icons

Screen 5: Scenarios
  "What situations matter most?"
  Pre-populated from profession, glass badges, multi-select
  [+ Add your own] first position
  Min 1, encouraged 3. "We'll handle the rest."

Screen 6: Level
  "How much [language] do you know?"
  5 glass pills: Fresh start | Basics | Conversational | Confident | Near fluent

      ↓

Screen 7: FIRST LESSON (Magic Moment)
  AI-generated personalized mini-lesson
  Zero chrome — pure immersion
  Built from: language + profession + scenarios + level
  → "Save your progress" CTA

      ↓

Screen 8: Signup
  "Save your progress"
  Google / Apple SSO + email form
  Value reminder: privacy, personalization, real metrics

      ↓

POST-SIGNUP
═══════════════════════════════════════════════
Screen 9: Schedule
  "How much time can you invest?"
  Time per session (10/20/30/45+ min)
  Days per week (3-7)

Screen 10: Your Path (Staircase Reveal)
  Loading animation → AI generates first lesson fully
  Staircase shows TITLES ONLY for steps 2+
  First lesson = fully built and ready
  [Begin Step 1]
  Background: Signup triggers building phases 2-4
```

---

## Data Schema

```typescript
interface OnboardingV3Data {
  // Screen 0: Auto-detected
  native_language: string;          // From device locale, user-changeable
  onboarding_locale: string;        // Language the onboarding renders in

  // Screen 1: Name
  first_name: string;

  // Screen 2: Target Language
  target_language: 'english' | 'french' | 'spanish';

  // Screen 3: Goal
  goal: string;                     // Pre-written or custom
  goal_custom?: string;             // If "Something else?"

  // Screen 4: Profession
  profession: string;
  profession_custom?: string;       // If typed/searched custom

  // Screen 5: Scenarios
  scenarios: string[];              // Min 1, max 5
  custom_scenarios?: string[];      // User-added scenarios

  // Screen 6: Level
  proficiency_level: 'starting_fresh' | 'basics' | 'conversational' | 'confident' | 'near_fluent';

  // Screen 8: Signup
  email?: string;
  auth_provider: 'email' | 'google' | 'apple';

  // Screen 9: Schedule (post-signup)
  schedule_time: number;            // Minutes per session (10, 20, 30, 45)
  schedule_days: number;            // Days per week (3-7)
}
```

---

## File Structure

```
app/(auth)/onboarding-v3/
├── _layout.tsx              # Stack layout, fade transitions, dark bg
├── index.tsx                # Screen 0: Welcome
├── name.tsx                 # Screen 1: Name
├── language.tsx             # Screen 2: Target Language
├── goal.tsx                 # Screen 3: Goal
├── profession.tsx           # Screen 4: Profession
├── scenarios.tsx            # Screen 5: Scenarios
├── level.tsx                # Screen 6: Level
├── first-lesson.tsx         # Screen 7: Magic Moment
├── signup.tsx               # Screen 8: Signup
├── schedule.tsx             # Screen 9: Schedule (post-signup)
└── your-path.tsx            # Screen 10: Staircase Reveal

components/ui/glass/
├── GlassCard.tsx            # Upgraded — uses glass tokens, multiple variants
├── GlassButton.tsx          # BlurView + Pressable, primary/secondary/ghost/danger
├── GlassBadge.tsx           # Chips/pills for scenarios, levels
├── GlassInput.tsx           # Frosted input with focus animation
├── GlassProgressBar.tsx     # Thin frosted progress indicator
└── GlassBackground.tsx      # Ambient gradient background (replaces CometBackground)

hooks/
└── useOnboardingV3.ts       # Zustand store — collects data across screens

lib/ai/
└── onboardingLessonGenerator.ts  # Generates first lesson from onboarding data
```

---

## Glass Design Tokens (Reference)

All glassmorphism tokens live in `constants/designSystem.ts` under `export const glass = {...}`.

Key presets:
- `glass.card.default` — Standard glass card (most screens)
- `glass.card.elevated` — Modals, sheets, first lesson card
- `glass.card.onboarding` — Extra prominent for onboarding steps
- `glass.card.accent` — Blue-tinted for selected/active states
- `glass.button.primary` — Blue glass CTA
- `glass.button.secondary` — Neutral glass (social auth buttons)
- `glass.badge.*` — Scenario chips, level pills
- `glass.input.*` — Form fields
- `glass.blur.medium` (40) — Standard card frost
- `glass.blur.heavy` (60) — Modals, navigation

---

## Profession List (With Icons)

| Profession | Icon (Ionicons) |
|---|---|
| Business & Finance | `briefcase-outline` |
| Tech & Engineering | `code-slash-outline` |
| Healthcare | `medkit-outline` |
| Legal | `shield-checkmark-outline` |
| Education | `school-outline` |
| Government & Diplomacy | `flag-outline` |
| Creative & Media | `color-palette-outline` |
| Hospitality & Tourism | `bed-outline` |
| Sales & Retail | `cart-outline` |
| Other | `ellipsis-horizontal-outline` |

---

## Scenario Banks (Per Profession)

### Business & Finance
Client meetings · Presentations & pitches · Negotiating deals · Networking events · Team leadership · Email & reports · Phone & video calls · Job interviews · Small talk · Conferences

### Tech & Engineering
Stand-ups & sprints · Code reviews · Demo presentations · Client calls · Documentation · Onboarding teammates · Tech conferences · Interview panels · Cross-team coordination

### Healthcare
Patient consultations · Medical histories · Explaining procedures · Colleague handoffs · Emergency communication · Charting · Family conversations · Pharmacy interactions · Rounds

### Legal
Client consultations · Court proceedings · Contract negotiations · Depositions · Legal writing · Mediation · Regulatory discussions · Cross-border cases · Colleague briefings

### Education
Classroom instruction · Parent meetings · Student counseling · Presentations · Curriculum discussions · Staff meetings · Research collaboration · Grant writing · Conferences

### Government & Diplomacy
Diplomatic negotiations · Press briefings · Policy discussions · Constituent meetings · Cross-agency coordination · Protocol · Report writing · Summits · Public speaking

### Creative & Media
Client pitches · Creative direction · Content planning · Interviewing · Script & copywriting · Brand presentations · Production coordination · Partnerships · Reviews

### Hospitality & Tourism
Guest check-in · Concierge service · Complaint resolution · Staff coordination · Tour guiding · Menu explanations · Event coordination · VIP handling · Emergencies

### Sales & Retail
Product demos · Cold outreach · Price negotiations · Customer consultations · Team meetings · Trade shows · Follow-ups · Complaint handling · Training

### Other (Generic)
Meetings & calls · Presentations · Email & writing · Networking · Job interviews · Small talk · Phone conversations · Team collaboration · Client interactions

---

## Goal Options (Pre-written)

1. "Lead meetings and present with confidence"
2. "Hold professional conversations fluently"
3. "Write and communicate clearly at work"
4. "Live and function in a new country"
5. "Connect with people in their language"

+ "Something else?" → opens custom text input

---

## Level Descriptions

| Level | Label | Description |
|---|---|---|
| starting_fresh | Fresh start | "I'm starting from zero" |
| basics | Basics | "I know some words and simple phrases" |
| conversational | Conversational | "I can hold basic conversations" |
| confident | Confident | "I communicate well but want to refine" |
| near_fluent | Near fluent | "I'm advanced but need professional polish" |

---

## Implementation Order

### Phase A: Foundation (Parallel)
1. Glass primitive components (`components/ui/glass/`)
2. Onboarding V3 layout + navigation (`app/(auth)/onboarding-v3/_layout.tsx`)
3. State management hook (`hooks/useOnboardingV3.ts`)
4. i18n keys for V3 onboarding

### Phase B: Pre-signup Screens (Sequential)
5. Screen 0: Welcome
6. Screen 1: Name
7. Screen 2: Target Language
8. Screen 3: Goal
9. Screen 4: Profession
10. Screen 5: Scenarios
11. Screen 6: Level

### Phase C: Value + Conversion
12. Screen 7: First Lesson (Magic Moment)
13. Screen 8: Signup

### Phase D: Post-signup
14. Screen 9: Schedule
15. Screen 10: Your Path (Staircase Reveal)
16. Background staircase generation trigger

---

## Key Design References

- **Welcome**: Crystal/starburst logo, Electric Blue glow, ambient dark gradient, glass CTA
- **Professions**: 2-column grid, dark glass cards with subtle semi-transparent icons (Stitch reference)
- **Languages**: 3 cards with cultural imagery, glass overlay, flags, vertical stacked on mobile
- **All screens**: `glass.card.onboarding` preset, generous spacing, staggered FadeInUp animations
- **Safe areas**: Always `useSafeAreaInsets()` — CTA bottom padding = `insets.bottom + spacing.lg`
- **Transitions**: `slide_from_right`, 300ms
- **Haptics**: Light on selections, Medium on CTA, Success on lesson completion

---

## Post-Signup Background Actions

When user creates account:
1. Save all onboarding data to Supabase
2. Generate staircase structure (titles for all steps)
3. Build first lesson fully (vocabulary + dialogue + exercise)
4. Queue background generation for steps 2-4
5. Show "Your Path" screen with first lesson ready

When user taps "Begin Step 1":
1. Navigate to main app
2. Continue background generation of remaining steps
3. Steps build progressively as user works through Step 1
