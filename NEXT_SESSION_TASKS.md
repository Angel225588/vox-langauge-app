# 🚀 Next Session - Task Assignments

**Date**: 2025-11-20
**Target Duration**: 3-4 hours
**Goal**: Dark Mode + Game Components (Phase 3.2)

---

## 📋 Quick Reference

**Total Tasks**: 9
**Your Tasks**: 1 (Testing)
**Claude Tasks**: 4
**Gemini Tasks**: 4

---

# 👤 YOUR TASKS (Angel)

## ✅ Task 0: Test Flashcard Flow (15 min) - DONE NOW!

**Status**: Ready to test now!
**Priority**: HIGH

### Steps:
1. Reload app (should work after Text import fix)
2. Login with your account
3. Go to "Practice" tab
4. Tap "Start Review Session"
5. Test each card type:
   - **LearningCard**: Tap to flip, see front/back, play audio
   - **ListeningCard**: Listen to audio, type answer, validate
   - **SpeakingCard**: Record your voice, play back, try again
6. Rate quality (Forgot/Remembered/Easy)
7. Complete full session
8. View session summary

### What to Look For:
- ✅ All animations smooth
- ✅ Audio playback works
- ✅ Recording works
- ✅ Validation correct
- ✅ Progress bar updates
- ✅ Points accumulate
- ✅ Session summary shows

### Report Back:
- Any bugs or crashes
- Anything confusing
- What feels good vs what doesn't

---

# 🤖 CLAUDE'S TASKS

## Task 1: Install & Setup GlueStack UI v2 (15 min)

**Priority**: HIGH - Required for all other tasks

### Steps:
```bash
# Install GlueStack UI v2
npm install @gluestack-ui/themed @gluestack-style/react react-native-svg

# Install peer dependencies
npx expo install react-native-svg
```

### Create Files:
1. `/lib/theme/gluestack-config.ts` - Theme configuration
2. `/lib/theme/colors.ts` - Color tokens (dark/light)

### Update Files:
1. `/app/_layout.tsx` - Wrap app with GluestackUIProvider
2. `/docs/UI_DESIGN_SYSTEM.md` - Add GlueStack component mappings

### Acceptance Criteria:
- [ ] GlueStack UI installed
- [ ] Theme provider configured
- [ ] Dark/light themes defined
- [ ] App wraps with provider
- [ ] Test with basic Button component

---

## Task 2: Convert Flashcard Session to Dark Mode (30 min)

**Priority**: MEDIUM
**Depends On**: Task 1

### Files to Update:
1. `/app/flashcard/session.tsx`
   - Header background: `dark:bg-slate-900`
   - Progress bar container: `dark:bg-slate-800`
   - Progress fill: Keep blue (stands out)
   - Card type badge: Dark mode variants
   - Quality buttons: Dark mode hover states
   - Footer: `dark:bg-slate-900`

2. **Keep card components light** - They should stand out against dark background

### Design:
- Dark background (#0F172A - slate-900)
- Cards remain white (contrast)
- Blue accents (#3B82F6)
- White text on dark
- Smooth transitions

### Acceptance Criteria:
- [ ] Dark mode as default
- [ ] Light mode toggle works
- [ ] Cards contrast well
- [ ] All text readable
- [ ] Animations smooth
- [ ] No accessibility issues

---

## Task 3: Build Game Session Screen (45 min)

**Priority**: MEDIUM
**Depends On**: Gemini's game components

### Create File:
`/app/games/session.tsx`

### Features:
1. **Game Selection Screen**:
   - Choose Tap-to-Match or Multiple Choice
   - Show game descriptions
   - "Start Game" button
   - Back to practice

2. **Game Play Screen**:
   - Load selected game component
   - Progress tracking (games completed)
   - Score display
   - Timer
   - Exit button (with confirmation)

3. **Game Summary Screen**:
   - Games completed
   - Total score
   - Accuracy percentage
   - Time taken
   - Points earned
   - "Play Again" / "Done" buttons

### Integration:
1. Update `/app/(tabs)/practice.tsx`:
   - Add "Play Games" button (below flashcards)
   - Navigate to games session

2. Create `/types/games.ts`:
   - GameType enum
   - GameSession interface
   - GameResult interface

### Acceptance Criteria:
- [ ] Can select game type
- [ ] Game loads correctly
- [ ] Score tracking works
- [ ] Session summary displays
- [ ] Navigation flows smoothly
- [ ] Dark mode compatible

---

## Task 4: Review & Integration (30 min)

**Priority**: HIGH
**Depends On**: All Gemini tasks

### Review Checklist:
For each Gemini component:
- [ ] No `styled()` usage (CRITICAL)
- [ ] No console.log statements
- [ ] Dark mode classes present (`dark:`)
- [ ] TypeScript types correct
- [ ] Animations smooth (60fps)
- [ ] Proper error handling
- [ ] Props match specs
- [ ] Component exports correctly

### Integration Steps:
1. Import game components into session
2. Test Tap-to-Match flow
3. Test Multiple Choice flow
4. Fix any bugs found
5. Polish animations
6. Test dark/light mode toggle

### Final Testing:
- Complete game session (both types)
- Check score calculation
- Verify session summary
- Test edge cases
- Performance check

---

# 🔷 GEMINI'S TASKS

## Task 1: Convert Auth Screens to Dark Mode (30 min)

**Priority**: HIGH
**Depends On**: Claude's GlueStack setup

### Files to Update:

#### 1. `/app/(auth)/login.tsx`
**Changes**:
- Replace plain components with GlueStack UI:
  - `View` → `Box`
  - `TextInput` → `Input`
  - `TouchableOpacity` → `Button`
- Add dark mode classes:
  - Background: `className="bg-white dark:bg-slate-900"`
  - Text: `className="text-gray-900 dark:text-slate-100"`
  - Input: `className="bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-700"`
  - Button: `className="bg-blue-500 dark:bg-blue-600"`
- Keep all existing functionality
- Keep all animations

#### 2. `/app/(auth)/signup.tsx`
**Same changes as login**

### Acceptance Criteria:
- [ ] Uses GlueStack UI components
- [ ] Dark mode as default
- [ ] Light mode works
- [ ] All animations preserved
- [ ] Form validation works
- [ ] Error handling intact
- [ ] No console.log statements
- [ ] NO styled() usage ❌

**READ FIRST**: `/GEMINI_TASKS.md` - BANNED PATTERNS section

---

## Task 2: Build TapToMatchCard Component (45 min)

**Priority**: HIGH

### Create File:
`/components/games/TapToMatchCard.tsx`

### Props Interface:
```typescript
interface TapToMatchCardProps {
  pairs: Array<{
    id: string;
    word: string;
    translation: string;
  }>;
  onComplete: (score: number, timeSeconds: number) => void;
  onSkip?: () => void;
}
```

### Functionality:
1. **Game Setup**:
   - Receive 6 word/translation pairs
   - Create 12 cards (6 words + 6 translations)
   - Shuffle cards randomly
   - Start timer on mount

2. **Game Play**:
   - Display 12 cards in 3x4 grid (mobile) or 4x3 (tablet)
   - Cards show text face-up (not traditional memory game)
   - Tap card to SELECT (highlight border)
   - Tap selected card again to DESELECT
   - Tap second card to attempt MATCH
   - If match: Cards disappear with celebration animation
   - If no match: Cards shake, deselect, try again
   - Continue until all pairs matched

3. **Scoring**:
   - Base score: 100 points per pair
   - Bonus: -5 points per incorrect attempt
   - Time bonus: +10 points if under 60 seconds

4. **Animations**:
   - Select: Scale up + blue border
   - Match: Green pulse + fade out
   - Wrong: Red shake + reset
   - Complete: Confetti celebration

### Visual Design (Dark Mode First):
- Background: Dark gradient (`bg-slate-900`)
- Cards: White with shadow (`bg-white dark:bg-slate-800`)
- Selected: Blue border (`border-blue-500`)
- Matched: Green fade (`bg-green-500`)
- Wrong: Red shake (`bg-red-500`)
- Timer: Top right, yellow text
- Score: Top left, green text

### Layout:
```
┌─────────────────────────┐
│ Score: 450   Timer: 1:23│
├─────────────────────────┤
│  [Card] [Card] [Card]   │
│  [Card] [Card] [Card]   │
│  [Card] [Card] [Card]   │
│  [Card] [Card] [Card]   │
├─────────────────────────┤
│       [Skip Button]      │
└─────────────────────────┘
```

### Acceptance Criteria:
- [ ] Cards shuffle on mount
- [ ] Select/deselect works
- [ ] Match detection correct
- [ ] Score calculation works
- [ ] Timer displays mm:ss format
- [ ] All animations smooth (60fps)
- [ ] Dark mode compatible
- [ ] Responsive grid layout
- [ ] Celebration on complete
- [ ] NO styled() usage ❌
- [ ] NO console.log ❌
- [ ] TypeScript types correct
- [ ] Self-reviewed against GEMINI_TASKS.md

---

## Task 3: Build MultipleChoiceCard Component (45 min)

**Priority**: HIGH

### Create File:
`/components/games/MultipleChoiceCard.tsx`

### Props Interface:
```typescript
interface MultipleChoiceCardProps {
  word: string;
  correctTranslation: string;
  incorrectOptions: string[]; // Array of 3 wrong answers
  audioUrl?: string;
  onCorrect: () => void;
  onIncorrect: () => void;
  onSkip?: () => void;
}
```

### Functionality:
1. **Setup**:
   - Display word at top
   - Optional audio playback button
   - Shuffle 4 options (1 correct + 3 wrong)
   - Show 4 answer buttons

2. **Game Play**:
   - User taps an answer
   - Disable all buttons during feedback
   - If correct:
     - Button turns green
     - Show "Correct!" message
     - Delay 1.5s, call onCorrect()
   - If incorrect:
     - Selected button turns red
     - Correct button pulses green
     - Show "Incorrect! Answer: [correct]"
     - Delay 2s, call onIncorrect()

3. **Audio** (Optional):
   - Play button next to word
   - Auto-play on mount (optional)
   - Replay anytime

### Visual Design (Dark Mode First):
- Background: Dark (`bg-slate-900`)
- Card container: White/dark (`bg-white dark:bg-slate-800`)
- Word: Large, bold, centered
- Audio button: Blue circle with speaker icon
- Answer buttons: 2x2 grid, large touch targets
- Correct: Green background (`bg-green-500`)
- Incorrect: Red background (`bg-red-500`)

### Layout:
```
┌─────────────────────────┐
│   🔊  "Hola"            │
│                         │
│  [How are you?]  [Hi!] │
│                         │
│  [Goodbye]   [Thank you]│
│                         │
│       [Skip →]          │
└─────────────────────────┘
```

### Animations:
- Answer tap: Scale down (0.95)
- Correct: Pulse green
- Incorrect: Shake animation
- All smooth transitions

### Acceptance Criteria:
- [ ] Options shuffle randomly
- [ ] Correct answer detected
- [ ] Feedback animations work
- [ ] Audio playback works (if URL provided)
- [ ] Delays callback appropriately
- [ ] Dark mode compatible
- [ ] Large touch targets (min 60px)
- [ ] Accessible colors (WCAG AA)
- [ ] NO styled() usage ❌
- [ ] NO console.log ❌
- [ ] TypeScript types correct
- [ ] Self-reviewed against GEMINI_TASKS.md

---

## Task 4: Self-Review & Documentation (15 min)

**Priority**: CRITICAL - Do this BEFORE marking tasks complete

### Review Checklist:

For EACH component you built:

1. **Code Review**:
   - [ ] Read `/GEMINI_TASKS.md` - BANNED PATTERNS section
   - [ ] Confirm NO `styled()` usage anywhere
   - [ ] Confirm NO `console.log` statements
   - [ ] All TypeScript types correct
   - [ ] All imports exist and correct
   - [ ] Props interface matches usage

2. **Dark Mode Review**:
   - [ ] All backgrounds have `dark:` variant
   - [ ] All text has `dark:` variant
   - [ ] All borders have `dark:` variant
   - [ ] Test looks good in dark mode
   - [ ] Test looks good in light mode

3. **Animation Review**:
   - [ ] All animations use `useSharedValue`
   - [ ] All animations use `withSpring` or `withTiming`
   - [ ] No layout shift during animations
   - [ ] Smooth 60fps performance

4. **Documentation**:
   - [ ] Update `GEMINI_TASKS.md` - Mark tasks complete
   - [ ] Add completion notes to tasks
   - [ ] Document any issues encountered
   - [ ] Document any decisions made

### Questions to Ask Yourself:
1. Did I use `styled()` anywhere? (If yes, STOP and fix)
2. Did I remove all console.log? (If no, remove them)
3. Does it work in dark mode? (If no, add dark: classes)
4. Did I test my TypeScript types? (If no, check them)
5. Did I read the BANNED PATTERNS? (If no, read it now)

---

# 📊 Progress Tracking

## Session Goals:
- [ ] Dark mode implemented (auth screens + session)
- [ ] GlueStack UI v2 installed and configured
- [ ] Tap-to-Match game working
- [ ] Multiple Choice game working
- [ ] Game session screen complete
- [ ] All components reviewed and tested
- [ ] Git commit created
- [ ] Documentation updated

## Success Metrics:
- **Functionality**: All games playable, dark mode works
- **Code Quality**: No styled(), no console.log, TypeScript clean
- **Performance**: 60fps animations, smooth transitions
- **Documentation**: All tasks documented, lessons learned recorded

---

# 🎯 Expected Outcomes

By end of session, we should have:

### Working Features:
1. ✅ Beautiful dark mode across app
2. ✅ Two fun, playable games
3. ✅ Complete game session flow
4. ✅ Professional UI with GlueStack

### Code Quality:
1. ✅ Zero `styled()` usage
2. ✅ Zero console.log statements
3. ✅ Complete dark mode support
4. ✅ Smooth animations

### Progress:
- **Phase 3.2**: 70% → 100%
- **Overall**: 45% → 55%

---

# 💡 Tips for Success

## For Gemini:
1. **READ GEMINI_TASKS.md FIRST** - Especially BANNED PATTERNS
2. **Use className directly** - NEVER use styled()
3. **Dark mode FIRST** - Add dark: classes to everything
4. **Remove debug code** - No console.log in final code
5. **Self-review** - Check against all criteria before submitting

## For Claude:
1. **Review carefully** - Check for styled(), console.log, dark mode
2. **Test thoroughly** - All edge cases, animations, performance
3. **Document issues** - Note any problems found
4. **Help Gemini** - Provide clear feedback if issues found

## For Angel:
1. **Test on device** - Simulator can hide issues
2. **Give feedback** - UX, design, gameplay
3. **Report bugs** - Immediately, don't wait
4. **Approve work** - Final say on quality

---

# 📝 Communication Protocol

## Gemini → Claude:
- Document completion in GEMINI_TASKS.md
- List any questions in Notes section
- Mention any issues encountered

## Claude → Angel:
- Report progress after each task
- Show working features
- Ask for feedback on UX
- Report any blockers

## Angel → Team:
- Approve/reject work
- Request changes
- Provide UX feedback
- Test and report bugs

---

**Created by**: Claude Code
**Date**: 2025-11-20
**Status**: Ready to start! 🚀
**Next Review**: After Gemini completes first task

---

**See also**:
- `NEXT_SESSION_PLAN.md` - Detailed plan
- `GEMINI_TASKS.md` - Guidelines for Gemini
- `SESSION_2_SUMMARY.md` - What we just completed
