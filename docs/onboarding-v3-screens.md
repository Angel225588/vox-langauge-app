# Vox Language App — Onboarding V3 Screen Prompts
## For use with Google Stitch

**Last updated**: Feb 20, 2026
**Research basis**: VOX Onboarding & Brand Identity Research Document (Perplexity, Revolut, Claude, Pinterest, Cosmos benchmarks)

---

## Design Context

### Visual Identity: "Premium Depth with Warm Glow"

The research document recommends a warm, human aesthetic that rejects both "cold tech blue" and "childish gamification." Our brand uses Electric Blue (#0036FF) as primary accent, but we layer warmth through:

- **Background**: `#0A0E1A` (Deep Space) — warm-dark, NOT pure black
- **Cards**: Glassmorphism effect — frosted glass over subtle gradients, semi-transparent (`rgba(26, 31, 58, 0.85)`) with blur backdrop
- **Primary accent**: Electric Blue `#0036FF` — used sparingly for CTAs and active states
- **Warm secondary**: Soft purple glow `#8B5CF6` — adds human warmth to the palette
- **Text primary**: `#F9FAFB` (near-white)
- **Text secondary**: `#9CA3AF` (warm muted gray)
- **Borders**: Subtle glass edges `rgba(255, 255, 255, 0.08)`
- **Spacing**: Generous — "let content breathe, never cramped" (Cosmos principle)
- **Border radius**: 20px on cards (soft, approachable), 12px on chips
- **Shadows**: Soft, layered depth — neumorphism 2.0 influence

### Brand Personality

**Vox is a supportive coach and wise mentor** — not a gamified owl, not an intimidating professor.

- Voice: Confident, direct, respectful. Like a knowledgeable colleague who happens to be a language expert.
- Tone: Warm but never patronizing. Professional but never cold.
- Copy style: Second person, short sentences, active voice. No exclamation marks. No "Great job!!!" energy.
- Inspired by: Claude's "thoughtful friend" approach + Perplexity's "intellectual confidence"

### Flow Philosophy

**Collect → Value → Convert** (inspired by Perplexity + Duolingo)

The research is clear: **value before friction**. Users must experience a "magic moment" — saying something in a new language and feeling understood — BEFORE being asked to create an account.

- Perplexity's activation metric: "3 queries in first session"
- Duolingo's rule: "First lesson before signup, magic moment within 60 seconds"
- Our target: **Under 90 seconds from "Get Started" to free lesson**

---

## The Flow: 7 Screens

```
┌────────────────────────────────────────────────────────────────┐
│                     ONBOARDING V3 FLOW                          │
│                                                                 │
│  COLLECT (4 screens, ~60-90 seconds)                            │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ 1. Welcome        → Brand moment, cultural warmth       │     │
│  │ 2. Languages       → Target + Native (2 quick taps)     │     │
│  │ 3. You & Your Goal → Field + Goal + Level (visual flow) │     │
│  │ 4. Your Scenarios  → Multi-select real situations        │     │
│  └────────────────────────────────────────────────────────┘     │
│                          │                                      │
│                          ▼                                      │
│  VALUE (1 screen — the magic moment)                            │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ 5. First Lesson    → Personalized mini-lesson            │     │
│  │                      Vocab + dialogue + speak             │     │
│  │                      "I just said something real"         │     │
│  └────────────────────────────────────────────────────────┘     │
│                          │                                      │
│                          ▼                                      │
│  CONVERT (2 screens)                                            │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ 6. Signup          → "Save your progress"                │     │
│  │ 7. Your Path       → Personalized dashboard reveal       │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

**Compared to V2**: 12 screens (signup first) → **7 screens** (signup after value)
**Time to magic moment**: ~90 seconds (vs V2's ~5+ minutes)

---

## Screen 1: Welcome

**Purpose**: First impression. Cultural warmth. Set the "this is different" tone in 3 seconds.

**Research references**:
- Perplexity: "The restraint. It looks expensive because it does NOT try to look expensive."
- Claude: "The first interaction feels like meeting a thoughtful friend."
- Research synthesis: "Splash screen with warm, cultural imagery and a single line."

**Data collected**: None.

**Prompt for Stitch**:
> Design a mobile welcome screen for "Vox" — a professional language learning app. This should feel premium, warm, and calm — like opening a high-end instrument, not a game.
>
> **Background**: Dark (#0A0E1A) with a subtle, slow-moving ambient gradient — a warm glow that shifts softly between deep blue and muted purple, barely perceptible. The effect should feel alive but calm, like light shifting through a room.
>
> **Center**: The Vox logo — a geometric crystal/starburst mark in Electric Blue (#0036FF) with a soft luminous glow radiating outward. Below the mark, "Vox" in large, confident, clean sans-serif white text.
>
> **Tagline**: Below the name, a single line in warm muted gray (#9CA3AF): "Your voice, in any language."
>
> **CTA**: One button at the bottom — "Get Started" — full-width, rounded corners (20px), blue gradient (#0036FF to #2563EB) with a subtle glass effect. Bold white text.
>
> **Secondary**: Small text link below the button in muted gray: "Already have an account? Sign in"
>
> **Feel**: Premium calm. No illustrations, no mascots, no confetti, no busy graphics. The negative space IS the design. The screen should breathe.

**Navigation**: "Get Started" → Screen 2. "Sign in" → Login flow.

**Micro-interaction**: The crystal logo has a subtle, continuous pulse glow — rhythmic and calming, like breathing.

---

## Screen 2: Languages

**Purpose**: What do they want to learn, and what do they speak? Two selections on one screen. Quick, visual, zero typing.

**Research references**:
- Pinterest: "Visual interest picker — image-backed cards, not dropdowns"
- Research synthesis: "Language selection with visual flags/cultural icons, not dropdown"

**Data collected**:
- `target_language`: "english" | "french" | "spanish"
- `native_language`: string

**Prompt for Stitch**:
> Design a mobile screen on dark background (#0A0E1A).
>
> **Top section** — Header: "What language do you need?" in large white text.
>
> Below, 3 large tappable cards arranged horizontally, each taking roughly a third of the screen width. Each card is a glassmorphic card (frosted glass effect, semi-transparent background with subtle blur) showing:
> - A cultural image or pattern at the top (not just a flag — think: a snippet of a city skyline, a cultural motif, or a warm photograph representing the language's world)
> - The language name below: **English**, **French**, **Spanish**
> - A small flag icon in the corner
>
> Cards have rounded corners (20px). When selected, the card lifts slightly (subtle scale + shadow increase) and gets a glowing blue border (#0036FF). Single-select.
>
> **Bottom section** — After tapping a target language, a second section smoothly slides up: "You speak..." with a single row of scrollable language pills: Spanish, English, French, Portuguese, German, Italian, Chinese, Japanese, Korean, Arabic, Hindi, Russian, Other.
>
> Pills are compact, dark (#1A1F3A) with white text. Selected pill gets blue fill (#0036FF). If "Other" tapped, a small text input slides in.
>
> **Progress**: Thin progress line at top — step 1 of 4, blue fill. Subtle, not distracting.
>
> **CTA**: "Continue" button at bottom — disabled (muted gray) until both selections made, then activates as blue gradient.

**Navigation**: "Continue" → Screen 3.

**Micro-interaction**: When a language card is selected, a gentle haptic pulse + the card scales up by 2% with a spring animation. The "You speak" section reveals with a smooth slide-up (300ms, ease-out).

---

## Screen 3: You & Your Goal

**Purpose**: Understand WHO they are and WHAT they need — profession, goal, and level on one flowing screen. This replaces three separate screens from V2 by using progressive reveal: each section appears after the previous one is completed, creating a conversational rhythm.

**Research references**:
- Revolut: "Storytelling onboarding — frame as journey, not a form"
- Pinterest: "Image-backed cards for interest selection"
- Claude: "Progressive feature discovery — don't overwhelm"
- Research synthesis: "Goal selection with image-backed cards, select 1-3"

**Data collected**:
- `profession`: string
- `goal`: string
- `goal_custom`?: string
- `proficiency_level`: "starting_fresh" | "basics" | "conversational" | "confident" | "near_fluent"

**Prompt for Stitch**:
> Design a mobile screen on dark background (#0A0E1A) that scrolls vertically. Three sections reveal progressively — each appears with a smooth slide-down animation after the previous section is completed. The screen feels like a conversation, not a form.
>
> **Section 1 — "What's your world?"**
>
> Header: "What's your world?" in large white text. Subtitle in gray (#9CA3AF): "We'll shape your vocabulary around what you actually do."
>
> A wrapped grid (2 columns) of profession cards. Each card is a glassmorphic rectangle with:
> - A subtle, abstract background image or pattern that evokes the profession (not literal clipart — think: a grid pattern for tech, a stethoscope silhouette for healthcare, a gavel shadow for legal)
> - The profession name in white: **Business & Finance**, **Tech & Engineering**, **Healthcare**, **Legal**, **Education**, **Government & Diplomacy**, **Creative & Media**, **Hospitality & Tourism**, **Sales & Retail**, **Other**
>
> Cards are dark glassmorphic (#1A1F3A with blur), rounded (16px), compact. Single-select with blue border glow. If "Other" tapped, text input appears.
>
> **Section 2 — "What do you need to do?"** (reveals after profession selected)
>
> Header: "What do you need to do?" in white text. This section shows 4 goal cards stacked vertically, each a full-width glassmorphic card with a one-line goal:
>
> - "Lead meetings and present with confidence"
> - "Hold professional conversations fluently"
> - "Write and communicate clearly at work"
> - "Live and function in a new country"
>
> Single-select with blue border. Below the cards, a subtle text link: "Something else?" → reveals text input.
>
> **Section 3 — "How much do you know?"** (reveals after goal selected)
>
> Header: "How much [target language] do you know?" in white text. Five compact horizontal pills in a single row (or two rows if needed):
>
> - **Fresh start** · **Basics** · **Conversational** · **Confident** · **Near fluent**
>
> Each pill is dark, rounded. Selected = blue fill with white text. Below the pills, a one-line description updates dynamically based on selection (e.g., "I can hold basic conversations" for Conversational).
>
> **Progress**: Step 2 of 4. "Continue" button at bottom (requires all three sections completed).

**Navigation**: "Continue" → Screen 4.

**Micro-interactions**:
- Each section reveals with a 400ms slide-down + fade-in animation
- Selected profession card scales up 2% with spring animation
- Level description text fades in when pill is selected
- The screen auto-scrolls to keep the active section centered

**Design note**: This screen is the key innovation — three data points that previously took three separate screens, delivered in one flowing conversation. The progressive reveal prevents overwhelm while the visual cards (Pinterest pattern) make selection feel like discovery, not form-filling.

---

## Screen 4: Your Scenarios

**Purpose**: THE most important screen for content generation. This is where the user tells us exactly what real-world situations they face. These scenarios drive everything: vocabulary lists, conversation simulations, reading passages, listening exercises, and the staircase structure.

**Research references**:
- Pinterest: "Require users to select at least 3-5 learning interests for meaningful personalization"
- Perplexity: "Guided depth — suggest follow-ups to help users go deeper"
- Research synthesis: "Then immediately deliver a personalized learning path"

**Data collected**:
- `scenarios`: string[] (min 1, max 5)
- `custom_scenario`?: string
- `schedule_time`: number (minutes per day)
- `schedule_days`: number (days per week)

**Prompt for Stitch**:
> Design a mobile screen on dark background (#0A0E1A).
>
> **Header**: "What situations do you face?" in large white text. Subtitle in gray: "Pick the ones that matter most. We'll train you for these."
>
> **Scenario grid**: A scrollable area of scenario chips/pills arranged in a flowing wrap layout. Multi-select — tap to toggle on/off.
>
> Unselected chips: dark glassmorphic (#1A1F3A with blur), gray text (#9CA3AF), rounded (12px).
> Selected chips: blue fill (#0036FF), white text, subtle glow. A small checkmark appears inside selected chips.
>
> The scenarios are **dynamic based on profession** from Screen 3. Show 8-10 relevant options.
>
> **Examples (Business & Finance):**
> Client meetings · Presentations & pitches · Negotiating deals · Networking events · Team leadership · Email & reports · Phone & video calls · Job interviews · Small talk · Conferences
>
> **Examples (Healthcare):**
> Patient consultations · Medical histories · Explaining procedures · Colleague handoffs · Emergency communication · Documentation · Family conversations · Pharmacy interactions · Rounds
>
> Selection counter near the header: "3 of 5" in small blue text.
>
> At the bottom of the chips: "+ Add your own" text link → reveals text input for custom scenario.
>
> **Schedule section** — Below the scenarios, separated by a subtle divider line, a compact section:
> "How much time can you invest?" in white text.
>
> Two rows of pills:
> - **Per day**: 10 min · 20 min · 30 min · 45+ min (single-select, blue fill)
> - **Days/week**: 3 · 4 · 5 · 6 · 7 (single-select, blue fill)
>
> Small calculated text below in gray: "That's about X hours per week"
>
> **Progress**: Step 3 of 4. CTA button is special — not "Continue" but **"See my first lesson"** in bold blue gradient. This signals the payoff is next.

**Navigation**: "See my first lesson" → Screen 5.

**Micro-interactions**:
- Chips toggle with a satisfying spring animation + subtle haptic
- Counter updates with a number-flip animation
- When 5th chip is selected, remaining unselected chips slightly dim
- The "See my first lesson" button has a subtle shimmer/pulse when all required fields are complete

---

## Screen 5: First Lesson (The Magic Moment)

**Purpose**: DELIVER VALUE. This is the moment the user feels "this app was built for me." They get a real, personalized mini-lesson generated from their onboarding data — their profession, their scenario, their level. No signup wall. No paywall. Pure value.

The research is unanimous: **the magic moment must come before any commitment.**
- Duolingo: "I can understand something in a new language!"
- Perplexity: "Getting a trustworthy answer within seconds"
- Our magic moment: **"I just said something professional in [language] and it felt real."**

**Research references**:
- Duolingo: "First lesson before signup. Magic moment within 60 seconds."
- Perplexity: "Users experience the magic moment before any friction is introduced."
- Claude: "The product IS the onboarding."
- Cosmos: "Strip away everything that is not the lesson."

**Data collected**: None — pure output.

**Prompt for Stitch**:
> Design a mobile lesson experience screen on dark background (#0A0E1A). This should feel immersive — like the user has already entered the app. No onboarding chrome, no progress bars. They're IN the experience now.
>
> **Top**: A small, subtle label: "Your first lesson" in muted gray text, with a glassmorphic tag/badge next to it showing the scenario (e.g., "Client Meetings") in blue pill.
>
> **Lesson card** — A large glassmorphic card (frosted glass, semi-transparent with blur backdrop) taking up most of the screen:
>
> **Scenario title**: "Opening a client meeting" — bold white text, top of card.
>
> **Vocabulary section**: 3 key professional terms, each in a mini-row:
> - Target language word in bold, larger text (e.g., "Enchanté")
> - Phonetic guide below in smaller muted text (e.g., "/ɑ̃.ʃɑ̃.te/")
> - Small circular play button (blue, 36px) at the right to hear pronunciation
> - Translation is HIDDEN — shown only on tap. First word has a subtle "tap to reveal" hint.
>
> **Dialogue section**: A short realistic dialogue (2-3 exchanges) styled as alternating chat bubbles:
> - Left bubbles (the "professional" speaker) in blue-tinted glass
> - Right bubbles (the "colleague/client") in neutral glass
> - Each bubble has a small play icon for audio
> - A "Show translation" toggle at the bottom of the dialogue (off by default — immersion first)
>
> **Try it section**: Below the dialogue, a prominent action area:
> - A large "Try saying this" prompt showing one key phrase from the dialogue
> - A microphone button — large (60px), blue gradient, with a subtle pulse animation inviting interaction
> - When pressed: records user's voice, plays back, shows encouraging result
>
> **After interaction**: A result panel slides up from the bottom (glassmorphic):
> - A warm, encouraging message: "Good start — you're on track." (NOT "Great job!!!")
> - A subtle preview line: "Your full path includes [X] scenarios like this, built for [profession]"
>
> **Bottom buttons**:
> - Primary: **"Create my account"** — full-width, blue gradient, bold white text
> - Secondary: "Try another lesson" — subtle text link or ghost button below

**Navigation**: "Create my account" → Screen 6. "Try another lesson" → regenerate with different scenario.

**Micro-interactions**:
- Vocabulary words slide in one by one (staggered, 200ms apart)
- Play buttons have a ripple effect on tap
- Translation reveals with a smooth fade-in
- Mic button pulses gently when idle, stops and shows recording animation when pressed
- Result panel slides up with spring animation + haptic feedback
- The whole screen feels alive but calm — every interaction has subtle, satisfying feedback

**Design note (from research)**: "Zero-noise philosophy" (Cosmos) — this screen has NO navigation chrome, NO tab bars, NO settings icons. It's pure lesson. The user is fully immersed.

---

## Screen 6: Signup

**Purpose**: Convert. The user has experienced real value. Now they save their progress to unlock the full AI-generated path. This should feel like a natural next step, not a gate.

**Research references**:
- Perplexity: "Delayed signup prompt — only after the user has already experienced value"
- Revolut: "Compliance becomes confidence — frame as personalizing, not gatekeeping"
- Research synthesis: "Save your progress and keep going."

**Data collected**: `full_name`, `email`, `password`

**Prompt for Stitch**:
> Design a mobile signup screen on dark background (#0A0E1A).
>
> **Header**: "Save your progress" in large white text. Subtitle: "Unlock your personalized learning path."
>
> **Value reminder** — 3 compact lines with small, minimal line icons (NOT emojis):
> - [shield icon] "Your data stays private — always"
> - [target icon] "Built around your real scenarios"
> - [chart icon] "Tracks your actual communication ability"
>
> **Social signup options** (top, most prominent):
> - "Continue with Google" — full-width button, dark glass card style, Google logo
> - "Continue with Apple" — full-width button, dark glass card style, Apple logo
>
> **Divider**: "or" in muted gray text with subtle lines on each side.
>
> **Form fields** (below social options):
> - Full name — glassmorphic input field (dark #1A1F3A with blur), white text, rounded (12px)
> - Email — same styling
> - Password — secure input, same styling. Small hint below: "Min 6 characters" in muted gray
>
> **CTA**: "Create account" — full-width, blue gradient (#0036FF to #2563EB), rounded (20px), bold white text.
>
> Below: "Already have an account? Sign in" text link in muted gray.
>
> **Privacy line** at the very bottom in small muted gray (#6B7280): "We never sell your data or show ads."
>
> **Progress**: Step 4 of 4 — final step. The progress bar fills completely.

**Navigation**: "Create account" / Social signup → triggers AI path generation → Screen 7.

**Micro-interaction**: After successful account creation, a subtle success animation — the progress bar fills to 100% with a satisfying blue glow pulse.

---

## Screen 7: Your Path (Personalized Dashboard Reveal)

**Purpose**: The payoff. After signup, the AI generates the user's personalized staircase, and we reveal it with a moment of ceremony. This is the "personalized dashboard reveal" from the Pinterest pattern — the user sees that everything they told us has been transformed into a path built specifically for them.

**Research references**:
- Pinterest: "Immediately show a fully personalized feed — the 'aha moment'"
- Research synthesis: "Based on your goals, here is your first week. Content immediately reflects their selections."
- Revolut: "Home screen arrival with animated visuals adding motion and energy"

**Data collected**: None — this is the output of AI path generation.

**Prompt for Stitch**:
> Design a mobile screen that transitions from a loading state to a reveal.
>
> **Loading state** (shown while AI generates the staircase, 5-10 seconds):
> A dark background with a centered animation — the Vox crystal logo assembling or crystallizing, with small text below cycling through phases:
> - "Analyzing your scenarios..."
> - "Building your vocabulary..."
> - "Crafting your learning path..."
>
> Each phase text fades in/out smoothly. The animation feels purposeful and premium — like something real is being built, not a fake progress bar.
>
> **Reveal state** (when path is ready):
> The loading animation transitions into the user's personalized staircase dashboard. The transition should feel like a curtain lifting.
>
> The dashboard shows:
> - A header: "Your path is ready" in bold white text
> - The user's profession and language displayed: e.g., "Healthcare · Learning English"
> - A visual staircase preview — the first 3-4 steps of their learning path, each step showing:
>   - A step number
>   - The topic (from their selected scenarios)
>   - An estimated duration
>   - "Step 1" is highlighted as "Start here"
>
> Below the staircase: A single prominent button: **"Begin Step 1"** in blue gradient.
>
> The screen should evoke the feeling: "This was made for me."

**Navigation**: "Begin Step 1" → Main app, first lesson.

**Micro-interactions**:
- Loading text phases fade in/out with 2-second cycles
- Crystal logo animation builds piece by piece during loading
- On reveal: staircase steps slide in from below, staggered (200ms apart), with a satisfying spring animation
- The first step has a subtle glow/pulse inviting the tap
- A small confetti or particle burst on reveal — subtle, not childish. Think: light particles dispersing, not balloons.

---

## Data Schema

```typescript
interface OnboardingV3Data {
  // Screen 2: Languages
  target_language: 'english' | 'french' | 'spanish';
  native_language: string;

  // Screen 3: You & Your Goal
  profession: string;
  profession_custom?: string;
  goal: string;
  goal_custom?: string;
  proficiency_level: 'starting_fresh' | 'basics' | 'conversational' | 'confident' | 'near_fluent';

  // Screen 4: Scenarios & Schedule
  scenarios: string[];           // min 1, max 5
  custom_scenario?: string;
  schedule_time: number;         // minutes per day (10, 20, 30, 45)
  schedule_days: number;         // days per week (3-7)
}
```

**Compared to V2** (which had 15+ fields): **10 core fields**. Everything else is progressive profiling after the user is active.

### What We Deferred (Collected Later via Progressive Profiling)

These fields from V2 are not in the onboarding anymore. They'll be collected naturally as the user engages:

| Deferred Field | When We Collect It |
|---|---|
| `timeline` (urgency) | After first week — prompt in settings or AI conversation |
| `why` / `motivation` | Organically through AI conversations — the system learns |
| `stakes` / `commitment` | Not needed for content generation — removed |
| `why_now` | Removed — never used by the AI |
| `previous_attempts` | Inferred from level selection + first lesson performance |
| `min_time` / `max_time` range | Simplified to single `schedule_time` |

---

## Scenario Banks (Per Profession)

Dynamic multi-select options for Screen 4, based on Screen 3 profession:

### Business & Finance
Client meetings · Presentations & pitches · Negotiating deals · Networking events · Team leadership · Email & reports · Phone & video calls · Job interviews · Small talk · Conferences

### Tech & Engineering
Stand-ups & sprints · Code reviews & tech discussions · Demo presentations · Client calls · Documentation · Onboarding teammates · Tech conferences · Interview panels · Cross-team coordination

### Healthcare
Patient consultations · Medical histories · Explaining procedures · Colleague handoffs · Emergency communication · Charting · Family conversations · Pharmacy interactions · Interdisciplinary rounds

### Legal
Client consultations · Court proceedings · Contract negotiations · Depositions · Legal writing · Mediation · Regulatory discussions · Cross-border cases · Colleague briefings

### Education
Classroom instruction · Parent-teacher meetings · Student counseling · Academic presentations · Curriculum discussions · Staff meetings · Research collaboration · Grant writing · Conferences

### Government & Diplomacy
Diplomatic negotiations · Press briefings · Policy discussions · Constituent meetings · Cross-agency coordination · Protocol · Report writing · Summits · Public speaking

### Creative & Media
Client pitches · Creative direction · Content planning · Interviewing · Script & copywriting · Brand presentations · Production coordination · Partnerships · Reviews

### Hospitality & Tourism
Guest check-in/out · Concierge service · Complaint resolution · Staff coordination · Tour guiding · Menu explanations · Event coordination · VIP handling · Emergencies

### Sales & Retail
Product demos · Cold outreach · Price negotiations · Customer consultations · Team meetings · Trade shows · Follow-ups · Complaint handling · Training reps

### Other (Generic Professional)
Meetings & calls · Presentations · Email & writing · Networking · Job interviews · Small talk · Phone conversations · Team collaboration · Client interactions

---

## Mapping: What Data Drives What

| Onboarding Data | What It Powers |
|---|---|
| `target_language` | All content, TTS voice, accent coaching |
| `native_language` | Translations, phonetic guides, progressive immersion ratio |
| `profession` | Vocabulary tracks, scenario themes, industry terminology |
| `goal` | Staircase endpoint, milestone definitions |
| `proficiency_level` | Vocabulary complexity, grammar depth, CEFR calibration |
| `scenarios` | Specific lessons, call topics, reading passages, vocabulary lists |
| `schedule_time` | Lesson length, content density per session |
| `schedule_days` | Staircase spread, review scheduling, FSRS intervals |

---

## Design Principles Applied (From Research)

### 1. Value Before Friction (Perplexity + Duolingo)
Screen 5 delivers a real personalized lesson before any signup. The user's magic moment: "I just said something professional in a new language."

### 2. Personalization as Play (Pinterest + Revolut)
Screens 3 and 4 use visual, image-backed cards and flowing reveal — it feels like discovery, not form-filling. Pinterest's visual interest picker pattern.

### 3. Warm Premium Aesthetic (Claude + Cosmos)
Glassmorphic cards, generous whitespace, warm dark tones. The UI disappears — content and learning moments are the hero. "Invisible design" (Perplexity).

### 4. Storytelling, Not Forms (Revolut)
Each screen has a conversational header ("What's your world?", "What situations do you face?") instead of clinical labels. The flow reads like a dialogue.

### 5. Progressive Discovery (Claude + Pinterest)
Only essential data is collected during onboarding. Timeline, motivation, advanced settings — discovered later through use. "Don't show everything at once" (Pinterest's Ladder of Engagement).

### 6. Zero-Noise Lesson (Cosmos)
Screen 5 strips away ALL chrome. No nav bars, no settings, no distractions. Pure lesson. "Just pure harmonious expression."

### 7. Emotional Ownership (Revolut)
The path reveal (Screen 7) creates ownership — "this was built for me." Future: add avatar/theme customization as post-signup reward.

### 8. Micro-Interactions as Feedback (2025-2026 Trend)
Every selection has subtle, satisfying feedback — spring animations, haptic pulses, smooth reveals. "Satisfying but not childish." The animations serve function (confirming actions) not decoration.

---

## Future Additions (Post-MVP)

From the research, features to add progressively after launch:

1. **Emotional customization** (Revolut): Let users pick a theme accent color or customize their profile card during the first week. Creates emotional investment.

2. **Rotating prompt suggestions** (Perplexity): Home screen shows different "Try saying this" prompts each visit to eliminate blank-state paralysis.

3. **Ladder of engagement** (Pinterest): Day 1 = core lessons. Day 3 = introduce review streaks (optional). Week 1 = unlock community. Week 2 = discover AI conversation practice. Each feels like a reward.

4. **Behavioral adaptation** (Revolut): Detect user's sophistication from their first few interactions and adjust UI complexity accordingly.

5. **Guided depth** (Perplexity): After completing a vocabulary exercise, suggest deeper dives — cultural context, pronunciation variations, formal vs. informal usage.
