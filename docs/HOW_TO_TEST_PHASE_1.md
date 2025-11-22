# How to Test Phase 1 - Complete User Flow

## Prerequisites

✅ **Metro Bundler Status**: Metro should be running with `npx expo start --clear`
✅ **Database**: Supabase tables created (run `docs/vox-staircase-schema.sql`)
✅ **Environment**: `.env` file with `EXPO_PUBLIC_GEMINI_API_KEY`

---

## Quick Start (5 minutes)

```bash
# 1. Start Expo dev server
npx expo start --clear

# 2. Open on your device
# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# OR scan QR code with Expo Go app
```

---

## Complete User Flow Testing

###  Step 1: Initial App Launch

**Expected behavior:**
- App launches to home screen
- **Modal appears** with fancy card:
  - Title: "Let's Discover What You Like"
  - Features list with icons (🎯 AI-generated, ⚡ Personalized, 🚀 Track progress)
  - Big "I'm Ready! 🚀" button
  - "Takes less than 1 minute" text at bottom

**Screenshot locations:**
- iOS: Notch/Dynamic Island respected (safe area)
- Android: System UI doesn't overlap content

**What to check:**
✅ Modal animation is smooth (fades in + bounces)
✅ Modal has dark backdrop (85% opacity black)
✅ Card has glow effect (indigo shadow)
✅ Button has gradient (indigo → purple)

---

###  Step 2: Start Onboarding

**Action:** Tap "I'm Ready! 🚀"

**Expected:**
- Modal closes smoothly
- **Navigate to Onboarding Welcome** (`/app/(auth)/onboarding/index.tsx`)
- Welcome screen shows:
  - "Welcome to Vox" title
  - App description
  - 3 feature cards with icons:
    - 🤖 AI-Powered Feedback
    - 📚 Personalized Lessons
    - 🎯 Track Your Progress
  - "Get Started" button

**What to check:**
✅ Smooth transition from modal to onboarding
✅ Gradients render correctly (deep space background)
✅ All text is readable
✅ Button is clickable

---

###  Step 3: Goal Selection

**Action:** Tap "Get Started"

**Expected:**
- Navigate to **Goal Selection** screen
- Shows "Step 1 of 4" progress indicator
- Title: "What's your learning goal?"
- **6 goal cards**:
  - 💼 Job Interviews
  - ✈️ Travel
  - 💼 Business Communication
  - 💬 Daily Conversation
  - 📚 Academic Studies
  - 👥 Making Friends
- "Continue" button (disabled until selection)

**Actions to test:**
1. Tap a goal card → card highlights with gradient
2. Tap another goal → previous deselects, new one highlights
3. **Haptic feedback** should vibrate on tap
4. "Continue" button becomes active (gradient + glow)

**What to check:**
✅ Only one goal selected at a time
✅ Haptic vibration on tap (iOS/Android)
✅ Button changes from gray to indigo gradient
✅ Animations are smooth (60fps)

---

###  Step 4: Level Assessment

**Action:** Tap "Continue"

**Expected:**
- Navigate to **Level Assessment** screen
- Shows "Step 2 of 4"
- Title: "What's your current level?"
- **5 level cards**:
  - 🌱 Beginner - "I'm just starting"
  - 🌿 Elementary - "I know basics"
  - 🌳 Intermediate - "I can hold conversations"
  - 🌲 Upper Intermediate - "I'm fluent but want to improve"
  - 🏔️ Advanced - "I'm nearly native"

**What to check:**
✅ Progress bar shows 2/4 filled
✅ Each level has descriptive subtitle
✅ Selection works correctly
✅ Gradient color varies per level (green → teal → indigo → purple)

---

###  Step 5: Time Commitment

**Action:** Tap "Continue"

**Expected:**
- Navigate to **Time Commitment** screen
- Shows "Step 3 of 4"
- Title: "How much time daily?"
- **4 time options**:
  - ⚡ 10 minutes - "Quick sessions"
  - ⭐ 20 minutes - "Recommended" (has special badge)
  - 🔥 30 minutes - "Accelerated"
  - 🚀 45+ minutes - "Intensive"

**What to check:**
✅ "Recommended" badge shows on 20 minutes
✅ Time cards have different colors
✅ Progress shows 3/4

---

###  Step 6: Scenario Selection

**Action:** Tap "Continue"

**Expected:**
- Navigate to **Scenarios** screen
- Shows "Step 4 of 4" (all 4 dots filled)
- Title: "Which scenarios matter most?"
- **Subtitle**: "Select all that apply"
- **5-6 scenario cards** (based on your goal selection):
  - Example for "Job Interviews":
    - 👋 Self Introduction
    - 💼 Discussing Experience
    - 💪 Strengths & Weaknesses
    - 💰 Salary Negotiation
    - ❓ Asking Questions
- "Finish & Create My Path" button (disabled initially)

**Actions to test:**
1. Tap scenarios → **checkmarks appear** (multi-select!)
2. Select at least 1 scenario → button becomes active
3. Tap "Finish & Create My Path"

**What to check:**
✅ **Multiple scenarios** can be selected
✅ Checkmark icon shows on selected cards
✅ Button text: "Finish & Create My Path"
✅ Button disabled until at least 1 scenario selected

---

###  Step 7: Gemini AI Generation (Critical!)

**Action:** Tap "Finish & Create My Path"

**Expected:**
- Button text changes to **"Generating your path..."**
- **Loading spinner** appears next to text
- **Background process** (~2-5 seconds):
  1. Saves onboarding profile to `user_onboarding_profiles` table
  2. Calls Gemini AI to generate 8-12 stairs
  3. Saves staircase to `user_staircases` table
  4. Saves individual steps to `staircase_steps` table
  5. Initializes progress in `user_stair_progress` table
- **Auto-navigates** to Staircase tab when complete

**What to check:**
✅ Loading spinner shows
✅ Button becomes inactive during generation
✅ No errors in console (check Metro logs)
✅ Gemini API called successfully
✅ Navigates to `/(tabs)/staircase` automatically

**If errors occur:**
- Check `.env` has valid `EXPO_PUBLIC_GEMINI_API_KEY`
- Check Supabase connection (network tab)
- Check console for detailed error messages

---

###  Step 8: Staircase Homepage (Your Personalized Path!)

**Expected:**
- **Header**:
  - Language selector (🇬🇧 English)
  - Weekly points (⚡ 1000)
  - Streak (🔥 8 Day Streak)
- **Title**: "Your Learning Path"
- **Medal Section** (if any medals earned):
  - Gold gradient card (3D style)
  - Latest medal with "NEW!" badge
  - "View All →" link
- **Vertical Staircase**:
  - **8-12 stairs** generated by Gemini
  - **First stair** = 👑 **Current** (purple gradient + glow + crown icon)
  - **Rest** = 🔒 **Locked** (gray faded)
- **Stats on each stair**:
  - Emoji (e.g., 👋, 💼, 📊)
  - Title (e.g., "Professional Greetings")
  - Description
  - 📝 Vocabulary count (e.g., "25 words")
  - ⏱️ Estimated days (e.g., "2 days")

**What to check:**
✅ Stairs are **AI-generated** (unique to your profile!)
✅ First stair has **purple gradient** + **crown** 👑
✅ Locked stairs are **faded** with 🔒 icon
✅ Smooth scroll (vertical ScrollView)
✅ Safe area insets work (iOS dock not covering content)

---

###  Step 9: Start First Lesson

**Action:** Tap on the **current stair** (purple with crown)

**Expected:**
- Navigate to `/lesson/[stepId]`
- **Lesson screen** loads:
  - **Header**:
    - Progress bar (shows card X of Y)
    - 📝 Vocabulary learned counter
    - ⏱️ Practice time (in minutes)
  - **Card type indicator**:
    - 📖 Learn / 🎯 Practice / 🎤 Speak
  - **First card**: `SingleVocabCard`
    - Large image
    - Word in big font
    - Phonetic pronunciation
    - Translation
    - Audio button (plays TTS)
  - **"Continue →" button** at bottom

**What to check:**
✅ Lesson loads mock vocabulary (Professional, Interview, Confident)
✅ Images display correctly
✅ Audio button works (TTS plays word)
✅ "Continue" button visible

---

###  Step 10: Progress Through Cards

**Action:** Tap "Continue →"

**Expected:**
- **Card 2**: `ImageMultipleChoiceCard`
  - Image displayed
  - 4 multiple choice options
  - Tap correct answer → **green gradient** + ✓ icon
  - Tap wrong answer → **red gradient** + ✗ icon + shake animation
  - **Auto-advances** after 1.5 seconds
- **Card 3**: `SpeakingCard` (if audio URL exists)
  - Shows word to speak
  - Record button
  - Tap to record pronunciation

**What to check:**
✅ Smooth card transitions (FadeIn/FadeOut)
✅ Progress bar updates (e.g., "Card 2 of 9")
✅ Vocabulary learned count increases
✅ Practice time increments every minute
✅ Haptic feedback on correct/wrong answers

---

###  Step 11: Complete Lesson

**Action:** Progress through all cards (9 total for 3 vocabulary words)

**Expected:**
- After last card, **`completeStep()`** API called
- Database updates:
  - Current step marked as `completed`
  - Next step unlocked (status → `current`)
- **Alert shows**:
  - Title: "Lesson Complete! 🎉"
  - Message: "You learned X words and reviewed Y cards!"
  - "🔓 Next step unlocked!"
  - Button: "Continue"

**What to check:**
✅ Alert appears with completion message
✅ Next stair unlocks (check database or re-open staircase tab)
✅ Progress saved to `user_stair_progress` table

**Action:** Tap "Continue"

**Expected:**
- Navigate back to **Staircase tab** (`/(tabs)/staircase`)
- **Staircase updated**:
  - First stair now shows ✅ **Completed** (green gradient)
  - Second stair now has 👑 **Current** (purple gradient + crown)

---

## iOS-Specific Testing

### Safe Area Insets (Critical for iOS!)

**Devices to test:**
- iPhone with notch (11, 12, 13, 14, 15)
- iPhone with Dynamic Island (14 Pro, 15 Pro, 16 Pro)
- iPad

**What to check:**
✅ Top content doesn't overlap with notch/island
✅ Bottom content doesn't overlap with home indicator
✅ Tab bar sits above home indicator
✅ Modal respects safe areas
✅ `SafeAreaView` with `edges={['top', 'bottom']}` used correctly

**Test screens:**
- Home screen
- Onboarding screens
- Staircase homepage
- Lesson screen

---

## Android-Specific Testing

### System UI Handling

**What to check:**
✅ Status bar transparent (shows app content behind it)
✅ Navigation bar doesn't overlap bottom tabs
✅ Safe area insets applied consistently
✅ Back button works (hardware + gesture)

**Test on:**
- Android 12+ (Material You)
- Different screen sizes (phone, tablet)
- Gesture navigation mode

---

## Database Verification

### Check Supabase Tables

**Navigate to**: https://app.supabase.com → Your Project → Table Editor

**Tables to check:**

1. **`user_onboarding_profiles`**
   - ✅ New row with your `user_id`
   - ✅ `learning_goal`, `proficiency_level`, `daily_time_minutes`, `scenarios` saved

2. **`user_staircases`**
   - ✅ New row with `user_id`
   - ✅ `is_active = TRUE`
   - ✅ `total_stairs` = 8-12
   - ✅ `generation_parameters` has JSON with your profile

3. **`staircase_steps`**
   - ✅ 8-12 rows for your staircase
   - ✅ `step_order` = 1, 2, 3, ..., 12
   - ✅ Each has `title`, `emoji`, `description`, `difficulty`, `vocabulary_count`

4. **`user_stair_progress`**
   - ✅ 8-12 rows (one per step)
   - ✅ First step: `status = 'current'`, `started_at` set
   - ✅ Other steps: `status = 'locked'`, `started_at` NULL

**After completing first lesson:**
- ✅ First step: `status = 'completed'`, `completed_at` set
- ✅ Second step: `status = 'current'`, `started_at` set

---

## Network & API Testing

### Check Metro Logs

**Expected logs:**

```
✅ Onboarding complete! Staircase created: { id: "...", total_stairs: 10, ... }
```

**Check for errors:**
- ❌ `Unable to resolve "../supabase"` → Import path wrong (should be fixed)
- ❌ `Gemini API error` → Check `.env` has valid API key
- ❌ `Supabase error` → Check database schema deployed

### Network Tab (Chrome DevTools)

**Expected API calls:**
1. **POST** to Supabase: Save onboarding profile
2. **Gemini AI** request (via library, may not show)
3. **POST** to Supabase: Save staircase
4. **POST** to Supabase: Save steps
5. **POST** to Supabase: Initialize progress

---

## Common Issues & Fixes

### Issue 1: Modal Doesn't Appear

**Cause**: User already has onboarding profile in database

**Fix**:
- Delete row from `user_onboarding_profiles` table
- Restart app
- Modal should appear

### Issue 2: Gemini Generation Fails

**Symptoms**: Button stuck on "Generating..." or shows error alert

**Fixes**:
1. Check `.env` file has `EXPO_PUBLIC_GEMINI_API_KEY`
2. Verify Gemini API key is valid (test in Google AI Studio)
3. Check network connection
4. Check Metro logs for detailed error

**Fallback**: If Gemini fails, app should show 3-stair fallback (basic stairs)

### Issue 3: Staircase Shows Mock Data

**Cause**: Database API not returning data correctly

**Fix**:
- Check `getUserStaircaseProgress()` API call
- Verify Supabase RLS policies allow reading
- Check user is logged in (`user?.id` exists)

### Issue 4: Safe Area Issues on iOS

**Symptoms**: Content overlaps notch or home indicator

**Fix**:
- Ensure `SafeAreaView` imported from `react-native-safe-area-context`
- Add `edges={['top', 'bottom']}` prop
- Check `<SafeAreaProvider>` wraps app in `_layout.tsx`

### Issue 5: Metro Build Errors

**Error**: `Unable to resolve "@/lib/..."`

**Fix**:
- Check `tsconfig.json` has `"@/*": ["*"]` path alias
- Restart Metro: `npx expo start --clear`
- Kill all Metro processes: `pkill -f "expo start"`

---

## Performance Benchmarks

**Expected performance:**

| Metric | Target | Acceptable |
|--------|--------|------------|
| App Launch | < 1s | < 2s |
| Modal Animation | 60fps | 50fps |
| Onboarding Screen Transitions | < 300ms | < 500ms |
| Gemini Generation | 2-5s | < 10s |
| Lesson Card Transitions | 60fps | 50fps |
| Database Queries | < 50ms | < 200ms |

**Tools to measure:**
- **React DevTools Profiler**: Check render times
- **Flipper**: Network requests timing
- **Metro logs**: Bundle size and load time

---

## Video Recording for Bug Reports

**If you encounter bugs**, record a video showing:

1. **What you did** (screen recording)
2. **What happened** (bug behavior)
3. **Metro logs** (console errors)
4. **Database state** (Supabase table data)

**Screen recording:**
- **iOS**: Screenshot toolbar → Record Screen
- **Android**: Quick Settings → Screen Record
- **Simulator**: `Cmd + R` (iOS) or `Ctrl + M` (Android)

---

## Success Criteria

✅ **All steps completed** without errors
✅ **Onboarding saves** to database
✅ **Gemini generates** personalized stairs
✅ **Staircase displays** correctly
✅ **Lesson flows** through cards
✅ **Progress updates** in database
✅ **Next stair unlocks** after completion
✅ **Safe areas** work on iOS/Android
✅ **Animations smooth** (60fps)
✅ **No console errors** in Metro

---

## Next Testing Phase

Once Phase 1 is verified, you can test:

- **Real vocabulary** (link to existing flashcard database)
- **Multiple staircases** (regeneration)
- **Medal awarding** (when milestones reached)
- **Offline support** (test with airplane mode)

---

**Last Updated**: November 22, 2025
**Status**: ✅ Ready for Testing
**Estimated Testing Time**: 15-20 minutes for complete flow

---

## Quick Test Checklist

Use this for rapid testing:

- [ ] App launches without crashes
- [ ] Onboarding modal appears
- [ ] Can complete all 4 onboarding steps
- [ ] Gemini generates staircase (no errors)
- [ ] Staircase shows AI-generated stairs
- [ ] Can tap current stair to start lesson
- [ ] Lesson shows vocabulary cards
- [ ] Can complete lesson
- [ ] Next stair unlocks
- [ ] iOS safe areas work
- [ ] Android system UI handled correctly
- [ ] No errors in Metro logs
- [ ] Database has correct data

**If all checked ✅ → Phase 1 is working perfectly!**
