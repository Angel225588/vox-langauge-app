# Listening Scaffolding Loop - UI Specifications

> **Status**: Production-Ready Style Specs
> **Author**: Claude (UI/UX Agent)
> **Date**: 2026-02-27
> **Design System**: `constants/designSystem.ts`

---

## Listening Theme Constants

All four components share these theme-level constants. Define them once at the top of each component file or in a shared `listeningTheme.ts`.

```typescript
// ─── Listening Theme ─────────────────────────────────────────
const LISTENING = {
  // Teal is the listening color throughout the app
  teal: '#06D6A0',
  tealLight: '#4ECDC4',
  tealGradient: ['#06D6A0', '#4ECDC4'] as const,
  tealGlow: 'rgba(6, 214, 160, 0.5)',
  tealSubtle: 'rgba(6, 214, 160, 0.10)',
  tealBorder: 'rgba(6, 214, 160, 0.18)',

  // Glass surfaces (from designSystem glass tokens)
  glassBg: 'rgba(255, 255, 255, 0.06)',       // glass.card.default.backgroundColor
  glassBorder: 'rgba(255, 255, 255, 0.10)',    // glass.card.default.borderColor
  glassElevated: 'rgba(255, 255, 255, 0.10)',  // glass.card.elevated.backgroundColor
  glassBorderBright: 'rgba(255, 255, 255, 0.16)', // glass.card.elevated.borderColor

  // Backgrounds
  bg: '#0A0E1A',           // colors.background.primary
  bgSecondary: '#0F1729',  // colors.background.secondary
  card: '#1A1F3A',         // colors.background.card

  // Text
  textPrimary: '#F9FAFB',   // colors.text.primary
  textSecondary: '#D1D5DB',  // colors.text.secondary
  textTertiary: '#9CA3AF',   // colors.text.tertiary
  textDisabled: '#6B7280',   // colors.text.disabled

  // Feedback
  green: '#10B981',
  greenLight: '#34D399',
  greenSubtle: 'rgba(16, 185, 129, 0.15)',
  greenBorder: 'rgba(16, 185, 129, 0.30)',

  red: '#EF4444',
  redLight: '#F87171',
  redSubtle: 'rgba(239, 68, 68, 0.15)',
  redBorder: 'rgba(239, 68, 68, 0.30)',

  // Muted (for "before" score)
  gray: 'rgba(255, 255, 255, 0.10)',
  grayBorder: 'rgba(255, 255, 255, 0.20)',
};
```

---

## 1. StageIndicator

**Purpose**: Shows the user's position across the 4 listening stages. Appears at the top of the screen, below the header.

**Layout**: Horizontal row of 4 dots with a label below. Centered horizontally.

**Animation**: Active dot widens from 8px to 24px with spring animation. Completed dots fill with solid teal. Use `withSpring` from Reanimated for the width transition.

### Stage Labels

| Stage | Label |
|-------|-------|
| 1 | "Listen" |
| 2 | "Read Along" |
| 3 | "Understand" |
| 4 | "Prove It" |

### StyleSheet

```typescript
import { StyleSheet } from 'react-native';

const stageIndicatorStyles = StyleSheet.create({
  // ─── Outer container ───
  container: {
    alignItems: 'center',
    paddingVertical: 16,       // spacing.md
    paddingHorizontal: 24,     // spacing.lg
  },

  // ─── Dot row ───
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,                    // spacing.sm
  },

  // ─── Base dot (upcoming/inactive) ───
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,           // full circle
    backgroundColor: 'rgba(255, 255, 255, 0.10)',  // gray, upcoming
  },

  // ─── Completed dot ───
  dotCompleted: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#06D6A0',  // solid teal
  },

  // ─── Active dot (pill shape) ───
  // Use Animated.View for width interpolation (8 → 24)
  dotActive: {
    height: 8,
    borderRadius: 4,
    // width is animated — default rest state:
    width: 24,
    // overflow hidden is needed for the gradient fill
    overflow: 'hidden',
  },

  // ─── Active dot gradient fill ───
  // Render a LinearGradient inside dotActive
  dotActiveGradient: {
    flex: 1,
    borderRadius: 4,
    // colors: ['#06D6A0', '#4ECDC4']
    // start: { x: 0, y: 0 }, end: { x: 1, y: 0 }
  },

  // ─── Stage label text ───
  label: {
    marginTop: 8,              // spacing.sm
    fontSize: 14,              // typography.fontSize.sm
    fontWeight: '600',         // typography.fontWeight.semibold
    color: '#D1D5DB',          // colors.text.secondary
    textAlign: 'center',
  },

  // ─── Stage number prefix ───
  labelStageNum: {
    color: '#06D6A0',          // teal accent for "Stage X:"
    fontWeight: '700',         // typography.fontWeight.bold
  },
});
```

### Animation Spec

```typescript
// Active dot width animation (Reanimated)
import { useAnimatedStyle, withSpring } from 'react-native-reanimated';

// Spring config: use animation.spring.default from design system
const DOT_SPRING = { damping: 15, stiffness: 150 };

// When stage changes, animate the active dot:
// - Previous active dot: width 24 → 8, fill solid teal
// - New active dot: width 8 → 24, fill gradient

// Entering animation for label text:
// FadeIn.duration(300) — matches stage transition timing
```

### Layout Notes

- Container sits directly below the screen header, full width
- Dots are horizontally centered using `alignItems: 'center'` on container
- Active pill dot uses `overflow: 'hidden'` to clip the LinearGradient inside
- Label uses `textAlign: 'center'`, secondary color
- Stage number within label (e.g., "Stage 1:") is teal, bold — use a nested `<Text>` with `labelStageNum` style
- Total height: ~52px (16 top padding + 8 dot + 8 gap + 14 label + 16 bottom padding, collapsed from line height)

---

## 2. SubtitleDisplay

**Purpose**: Renders dialogue lines below the audio controls. Three modes control what is visible.

**Modes**:
- `'hidden'` (Stage 1 & 4): No dialogue text. Show a centered atmospheric prompt.
- `'target'` (Stage 2): Show each dialogue line in the target language.
- `'translation'` (Stage 3): Show each dialogue line in the user's native language.

### StyleSheet

```typescript
const subtitleDisplayStyles = StyleSheet.create({
  // ─── Outer container ───
  container: {
    flex: 1,
    paddingHorizontal: 24,     // spacing.lg
    paddingTop: 16,            // spacing.md
  },

  // ─── Hidden mode: centered prompt ───
  hiddenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,     // spacing.xl
  },

  hiddenPrompt: {
    fontSize: 16,              // typography.fontSize.base
    fontWeight: '500',         // typography.fontWeight.medium
    color: '#D1D5DB',          // colors.text.secondary
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
  },

  // ─── Dialogue lines scroll container ───
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 24,         // spacing.lg — room above action button
  },

  // ─── Individual dialogue line card ───
  lineCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',  // glass.card.default.backgroundColor
    borderColor: 'rgba(255, 255, 255, 0.10)',       // glass.card.default.borderColor
    borderWidth: 1,
    borderRadius: 12,          // borderRadius.md
    paddingHorizontal: 16,     // spacing.md
    paddingVertical: 12,       // spacing.md - 4
    marginBottom: 8,           // spacing.sm
  },

  // ─── Speaker name ───
  speakerName: {
    fontSize: 12,              // typography.fontSize.xs
    fontWeight: '700',         // typography.fontWeight.bold
    color: '#06D6A0',          // teal — listening theme accent
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,           // spacing.xs
  },

  // ─── Target language dialogue text ───
  lineTextTarget: {
    fontSize: 16,              // typography.fontSize.base
    fontWeight: '600',         // typography.fontWeight.semibold
    color: '#F9FAFB',          // colors.text.primary
    lineHeight: 22,
  },

  // ─── Native translation dialogue text ───
  lineTextTranslation: {
    fontSize: 16,              // typography.fontSize.base
    fontWeight: '500',         // typography.fontWeight.medium
    color: '#D1D5DB',          // colors.text.secondary
    lineHeight: 22,
    fontStyle: 'italic',
  },
});
```

### Animation Spec

```typescript
// Each dialogue line enters with staggered FadeInDown
import { FadeInDown } from 'react-native-reanimated';

// Per-line animation:
// entering={FadeInDown.delay(index * 100).duration(300).springify()}
//
// - delay: 100ms per line index (0, 100, 200, 300...)
// - duration: 300ms (animation.duration.normal)
// - springify: adds slight bounce
//
// This creates a cascading reveal effect as lines appear one by one.

// Mode transition (hidden → target, target → translation):
// Wrap the entire subtitle area in an Animated.View with:
// entering={FadeIn.duration(300)}
// key={mode}  ← forces remount & re-animation on mode change
```

### Layout Notes

- In `'hidden'` mode, the container centers the prompt vertically and horizontally
- Hidden mode prompts (rotate for variety):
  - "Focus on the sounds..."
  - "What can you understand?"
  - "Listen for familiar words..."
  - "Let the rhythm guide you..."
- In `'target'` and `'translation'` modes, lines are in a ScrollView (in case >4 lines)
- `lineCard` uses default glass card styling — subtle, not elevated
- Speaker name is always teal, regardless of mode
- Text style differs: target text is white/semibold (primary focus), translation is secondary/italic (meaning support)
- Max visible lines without scroll: ~4 on iPhone (depends on line length)
- ScrollView has `showsVerticalScrollIndicator={false}`

---

## 3. ComprehensionQuiz

**Purpose**: Full-screen quiz that replaces the listening UI during Stage 1 quiz and Stage 4 quiz. Shows 3 MCQ questions sequentially.

**Behavior differences between Stage 1 and Stage 4**:
- Stage 1: No "correct answer" reveal after wrong answer (don't spoil learning). Just show green/red briefly, move on.
- Stage 4: Full reveal — show correct answer highlighted green, wrong answer highlighted red. Show checkmark on correct.

### StyleSheet

```typescript
const comprehensionQuizStyles = StyleSheet.create({
  // ─── Full-screen container ───
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',  // colors.background.primary
    paddingHorizontal: 24,        // spacing.lg
    paddingTop: 16,               // spacing.md
  },

  // ─── Question counter ───
  counter: {
    fontSize: 14,                // typography.fontSize.sm
    fontWeight: '600',           // typography.fontWeight.semibold
    color: '#9CA3AF',            // colors.text.tertiary
    textAlign: 'center',
    marginBottom: 24,            // spacing.lg
  },

  counterHighlight: {
    color: '#06D6A0',            // teal for current number
    fontWeight: '700',
  },

  // ─── Question text ───
  questionText: {
    fontSize: 20,                // typography.fontSize.xl
    fontWeight: '700',           // typography.fontWeight.bold
    color: '#F9FAFB',            // colors.text.primary
    lineHeight: 28,
    textAlign: 'left',
    marginBottom: 32,            // spacing.xl
  },

  // ─── Options container ───
  optionsContainer: {
    gap: 12,                     // spacing.md - 4
  },

  // ─── Individual option card (default / unselected) ───
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,                     // spacing.md - 4
    paddingHorizontal: 16,       // spacing.md
    paddingVertical: 16,         // spacing.md
    borderRadius: 16,            // borderRadius.lg
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',  // glass.card.default.backgroundColor
    borderColor: 'rgba(255, 255, 255, 0.10)',       // glass.card.default.borderColor
  },

  // ─── Option: correct answer ───
  optionCorrect: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',   // greenSubtle
    borderColor: 'rgba(16, 185, 129, 0.30)',        // greenBorder
  },

  // ─── Option: wrong answer ───
  optionWrong: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',    // redSubtle
    borderColor: 'rgba(239, 68, 68, 0.30)',         // redBorder
  },

  // ─── Letter prefix (A, B, C, D) ───
  optionLetter: {
    width: 28,
    height: 28,
    borderRadius: 8,             // borderRadius.sm
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  optionLetterText: {
    fontSize: 14,                // typography.fontSize.sm
    fontWeight: '700',           // typography.fontWeight.bold
    color: '#9CA3AF',            // colors.text.tertiary
  },

  optionLetterCorrect: {
    backgroundColor: 'rgba(16, 185, 129, 0.20)',
  },

  optionLetterTextCorrect: {
    color: '#34D399',            // success.light
  },

  optionLetterWrong: {
    backgroundColor: 'rgba(239, 68, 68, 0.20)',
  },

  optionLetterTextWrong: {
    color: '#F87171',            // error.light
  },

  // ─── Option text ───
  optionText: {
    flex: 1,
    fontSize: 16,                // typography.fontSize.base
    fontWeight: '500',           // typography.fontWeight.medium
    color: '#F9FAFB',            // colors.text.primary
    lineHeight: 22,
  },

  // ─── Checkmark icon container (correct answer, Stage 4 only) ───
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,            // full circle
    backgroundColor: 'rgba(16, 185, 129, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── X icon container (wrong answer) ───
  crossIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── Progress dots (reuse StageIndicator dot styles) ───
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,                      // spacing.sm
    marginBottom: 24,            // spacing.lg
  },

  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },

  progressDotActive: {
    width: 20,
    borderRadius: 4,
    backgroundColor: '#06D6A0',  // solid teal for active question
  },

  progressDotCompleted: {
    backgroundColor: '#10B981',  // green for answered
  },

  progressDotWrong: {
    backgroundColor: '#EF4444',  // red for wrong answer
  },
});
```

### Animation Spec

```typescript
// Question transition:
// entering={FadeIn.duration(300)}
// key={currentQuestionIndex}  ← remount per question

// Option selection feedback:
// 1. User taps option → immediately apply correct/wrong style
// 2. Wait 600ms (setTimeout)
// 3. Auto-advance to next question
// 4. After last question: transition to next stage or results

// No explicit exit animation — FadeIn on the next question handles the visual reset

// Haptics:
// Correct answer → Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
// Wrong answer → Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
```

### Layout Notes

- Full-screen replacement: when quiz is active, the subtitle display and audio controls are hidden
- Counter format: "Question **1** of 3" — bold the number, use teal color via `counterHighlight`
- Options: 4 MCQ choices, each is a glass card row
- Letter prefix (A/B/C/D) is inside a small rounded square, left of text
- Checkmark icon: Ionicons `checkmark` size 16, color `#34D399`, inside `checkIcon` circle — only shown in Stage 4
- Cross icon: Ionicons `close` size 16, color `#F87171`, inside `crossIcon` circle
- Options are disabled (non-interactive) after an answer is selected
- Minimum touch target: each option is 48px tall minimum (16 padding top + 16 padding bottom + content)

---

## 4. ResultsComparison

**Purpose**: Full-screen results display shown after the Stage 4 quiz. Compares "before" (Stage 1) and "after" (Stage 4) scores side by side, with a motivational message and action buttons.

### Score Circle Specs

| Property | Before Circle | After Circle |
|----------|--------------|-------------|
| Size | 100 x 100 | 100 x 100 |
| Border width | 3 | 3 |
| Border color | `rgba(255,255,255,0.20)` (muted gray) | `#06D6A0` (teal) |
| Shadow/glow | None | Teal glow (see `glowAfter` style) |
| Score color | `#9CA3AF` (tertiary) | `#06D6A0` (teal) |
| Label color | `#9CA3AF` (tertiary) | `#D1D5DB` (secondary) |

### Message Logic

```typescript
function getResultMessage(before: number, after: number, total: number): string {
  const delta = after - before;
  const pctBefore = before / total;
  const pctAfter = after / total;

  if (pctAfter === 1 && pctBefore === 1) return 'Mastery from the start!';
  if (pctAfter === 1) return 'Perfect score!';
  if (delta > total * 0.5) return 'Impressive growth!';
  if (delta > 0) return "You're getting it!";
  if (delta === 0 && pctAfter >= 0.5) return 'Solid comprehension.';
  return 'Listening takes practice. Keep going.';
}
```

### StyleSheet

```typescript
const resultsComparisonStyles = StyleSheet.create({
  // ─── Full-screen container ───
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',    // colors.background.primary
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,          // spacing.lg
  },

  // ─── Title ───
  title: {
    fontSize: 14,                  // typography.fontSize.sm
    fontWeight: '600',             // typography.fontWeight.semibold
    color: '#9CA3AF',              // colors.text.tertiary
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 32,              // spacing.xl
  },

  // ─── Score circles row ───
  scoresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,                       // spacing.xl — space for delta badge
    marginBottom: 24,              // spacing.lg
  },

  // ─── Individual score column ───
  scoreColumn: {
    alignItems: 'center',
  },

  // ─── Before score circle ───
  circleBefore: {
    width: 100,
    height: 100,
    borderRadius: 50,              // full circle
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.20)',  // muted gray border
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── After score circle ───
  circleAfter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#06D6A0',        // teal border
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── Teal glow behind After circle ───
  glowAfter: {
    shadowColor: 'rgba(6, 214, 160, 0.5)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  },

  // ─── Score number inside circle ───
  scoreNumberBefore: {
    fontSize: 30,                  // typography.fontSize['3xl']
    fontWeight: '800',             // typography.fontWeight.extrabold
    color: '#9CA3AF',              // muted for before
  },

  scoreNumberAfter: {
    fontSize: 30,
    fontWeight: '800',
    color: '#06D6A0',              // teal for after
  },

  // ─── "of 3" denominator ───
  scoreDenominator: {
    fontSize: 14,                  // typography.fontSize.sm
    fontWeight: '500',
    color: '#6B7280',              // colors.text.disabled
    marginTop: 2,
  },

  // ─── Circle label ("Before" / "After") ───
  circleLabelBefore: {
    fontSize: 12,                  // typography.fontSize.xs
    fontWeight: '600',
    color: '#9CA3AF',              // tertiary
    marginTop: 8,                  // spacing.sm
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  circleLabelAfter: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D1D5DB',              // secondary (brighter)
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ─── Delta badge (between circles) ───
  deltaBadge: {
    position: 'absolute',
    // Positioned between the two circles, vertically centered
    // Calculate: center of scoresRow
    alignSelf: 'center',
    backgroundColor: 'rgba(6, 214, 160, 0.15)',
    borderColor: 'rgba(6, 214, 160, 0.30)',
    borderWidth: 1,
    borderRadius: 12,              // borderRadius.md
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 10,
  },

  deltaBadgeText: {
    fontSize: 14,                  // typography.fontSize.sm
    fontWeight: '800',             // typography.fontWeight.extrabold
    color: '#06D6A0',              // teal
  },

  // ─── Delta badge: no change ───
  deltaBadgeNeutral: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },

  deltaBadgeTextNeutral: {
    color: '#9CA3AF',
  },

  // ─── Motivational message ───
  message: {
    fontSize: 20,                  // typography.fontSize.xl
    fontWeight: '700',             // typography.fontWeight.bold
    color: '#F9FAFB',              // colors.text.primary
    textAlign: 'center',
    marginBottom: 8,               // spacing.sm
  },

  // ─── Sub-message ───
  subMessage: {
    fontSize: 14,                  // typography.fontSize.sm
    fontWeight: '500',
    color: '#D1D5DB',              // colors.text.secondary
    textAlign: 'center',
    marginBottom: 24,              // spacing.lg
  },

  // ─── Points badge ───
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(6, 214, 160, 0.12)',
    borderColor: 'rgba(6, 214, 160, 0.25)',
    borderWidth: 1,
    borderRadius: 24,              // borderRadius.xl (pill shape)
    paddingHorizontal: 16,         // spacing.md
    paddingVertical: 8,            // spacing.sm
    marginBottom: 32,              // spacing.xl
  },

  pointsBadgeText: {
    fontSize: 14,                  // typography.fontSize.sm
    fontWeight: '700',             // typography.fontWeight.bold
    color: '#06D6A0',              // teal
  },

  pointsBadgeIcon: {
    // Ionicons 'star' or custom Vox icon
    // color: '#06D6A0', size: 16
  },

  // ─── Action buttons container ───
  actionsContainer: {
    width: '100%',
    gap: 12,                       // spacing.md - 4
    paddingHorizontal: 24,         // spacing.lg
  },

  // ─── Primary action: "New Exercise" — teal gradient ───
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,                        // spacing.sm
    borderRadius: 16,              // borderRadius.lg
    paddingVertical: 16,           // spacing.md
    // Wrap in <LinearGradient colors={['#06D6A0', '#4ECDC4']}>
  },

  primaryButtonText: {
    fontSize: 16,                  // typography.fontSize.base
    fontWeight: '700',             // typography.fontWeight.bold
    color: '#FFFFFF',
  },

  // ─── Secondary action: "Continue" — glass card ───
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,              // borderRadius.lg
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',  // glass.button.secondary.backgroundColor
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',      // glass.button.secondary.borderColor
  },

  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D1D5DB',              // colors.text.secondary
  },
});
```

### Animation Spec

```typescript
// Results screen entrance:
// The entire results container uses FadeIn.duration(500)

// Score circles: staggered entrance
// Before circle: FadeInDown.delay(0).duration(400).springify()
// After circle: FadeInDown.delay(200).duration(400).springify()

// Delta badge: scale-in after circles settle
// Entering: ZoomIn.delay(500).duration(300)

// Message: FadeIn.delay(600).duration(300)

// Points badge: FadeInDown.delay(700).duration(300)

// Buttons: FadeInDown.delay(800).duration(300)

// Optional: After circle score number animates up from 0
// Use a counter animation (step through 0 → final in 400ms)
// Use animation.duration.counterStep = 30ms per step
```

### Layout Notes

- Full-screen centered vertically, so it feels like a "celebration" moment
- Score circles sit side by side in `scoresRow` with `gap: 32`
- Delta badge is absolutely positioned in the center of the `scoresRow`, overlapping both circles
  - If delta > 0: teal badge with "+N" text
  - If delta = 0: neutral gray badge with "=" or "0"
  - If delta < 0 (unlikely): neutral gray with "-N"
- Delta badge arrow: Ionicons `arrow-forward` size 12 color teal, or just the number
- Points calculation: `10 + Math.round((afterScore / totalQuestions) * 10)` = 10-20 pts
- Points badge shows "+N pts" with a star icon
- "New Exercise" button is wrapped in `<LinearGradient colors={['#06D6A0', '#4ECDC4']}>` with `start={{ x: 0, y: 0 }}` `end={{ x: 1, y: 0 }}`
- "Continue" button text changes based on context:
  - In lesson session: "Continue Lesson"
  - In practice tab: "Back to Practice"
- Buttons are full width within `actionsContainer`

---

## Shared: Teal Glass Container (New Addition)

The listening feature would benefit from a teal glass container in the design system (similar to `glass.container.green`). Here is the spec for reference when implementing:

```typescript
// Potential addition to glass.container in designSystem.ts
teal: {
  gradient: ['rgba(6, 214, 160, 0.10)', 'rgba(6, 214, 160, 0.03)'] as const,
  border: 'rgba(6, 214, 160, 0.18)',
  iconBg: 'rgba(6, 214, 160, 0.15)',
  chipBg: 'rgba(6, 214, 160, 0.06)',
  chipBorder: 'rgba(6, 214, 160, 0.10)',
  accent: '#06D6A0',
  accentLight: '#4ECDC4',
  countBg: 'rgba(6, 214, 160, 0.18)',
  countColor: '#4ECDC4',
  glow: 'rgba(6, 214, 160, 0.06)',
},
```

Note: The existing `glass.container.green` uses `#10B981` (success green), which is visually close but not the same as our listening teal (`#06D6A0`). For brand consistency, the listening feature should use teal values directly rather than reusing the green container.

---

## Component File Structure

```
components/listening/
  StageIndicator.tsx        ← 4-dot progress + label
  SubtitleDisplay.tsx       ← Dialogue lines with hidden/target/translation modes
  ComprehensionQuiz.tsx     ← MCQ quiz (used after Stage 1 and Stage 4)
  ResultsComparison.tsx     ← Before/after score display + actions
```

Each component should import the shared `LISTENING` theme constants. Consider placing them in a `components/listening/theme.ts` file to avoid duplication.

---

## Accessibility Notes

- All interactive elements have minimum 44x44 touch targets
- Score circles include `accessibilityLabel` (e.g., "Before score: 1 out of 3")
- Quiz options include letter prefix in accessibility label (e.g., "Option A: The meeting was canceled")
- Stage indicator dots have `accessibilityLabel` (e.g., "Stage 2 of 4, Read Along, current")
- Color is never the only indicator of state — correct/wrong options also show icons (checkmark/cross)
- Hidden subtitle prompt is announced by screen reader

---

_Spec version: 1.0 — Written: 2026-02-27_
