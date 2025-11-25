# Tomorrow's Session Plan - November 26, 2025

## 🎯 Main Goals

### 1. Fix Safe Area Issues ✅ (DONE)
- [x] Add SafeAreaView to Home tab
- [ ] Verify safe area on iOS (notch devices)
- [ ] Verify safe area on Android
- [ ] Test on different screen sizes

### 2. Implement Mini-Lessons Inside Each Stair ⭐ PRIORITY
**Concept:** Each stair contains 5 mini-lessons that users must complete

#### Structure:
```
Stair (e.g., "Professional Greetings")
├── Mini-Lesson 1: Basic greetings
├── Mini-Lesson 2: Formal greetings
├── Mini-Lesson 3: Introduction phrases
├── Mini-Lesson 4: Practice conversation
└── Mini-Lesson 5: Assessment

Each mini-lesson = 5-10 cards/exercises
```

#### Implementation Tasks:
- [ ] Design mini-lesson data structure
- [ ] Update database schema to support mini-lessons
- [ ] Create mini-lesson screen/modal
- [ ] Show 5 mini-lessons when user taps a stair
- [ ] Track progress within each mini-lesson
- [ ] Unlock next mini-lesson only after completing previous one
- [ ] Update stair status based on mini-lesson completion

#### Files to Create/Update:
- `lib/db/schema.sql` - Add mini-lessons tables
- `app/lesson/[id].tsx` - Show mini-lessons list
- `app/mini-lesson/[id].tsx` - Individual mini-lesson flow
- `components/lesson/MiniLessonCard.tsx` - Display mini-lesson card
- Mock data for testing

### 3. Enhance Onboarding - Time Commitment
**Add two new fields:**
- [ ] Minimum practice time per day (5, 10, 15, 20, 30 min)
- [ ] Maximum practice time per day (20, 30, 45, 60 min)

**Why:** Use this data to:
- Determine how many cards per mini-lesson
- Adjust stair length and vocabulary count
- Create realistic completion estimates
- Better personalization

#### Implementation:
- [ ] Add new onboarding screen after time-commitment.tsx
- [ ] Update database schema with min/max time fields
- [ ] Pass time data to Gemini AI for staircase generation
- [ ] Adjust lesson content based on time availability

#### Files to Update:
- `app/(auth)/onboarding/time-commitment.tsx` - Split into min/max
- `lib/db/schema.sql` - Add columns to user_onboarding_profiles
- `lib/gemini/staircase-generator.ts` - Use time data in prompt
- `lib/api/staircases.ts` - Include time in API calls

### 4. Create Product Roadmap & Timeline
**Define:**
- [ ] Core features for MVP (Minimum Viable Product)
- [ ] Nice-to-have features for v1.1
- [ ] Testing timeline
- [ ] Launch date target

#### Discussion Points:
1. **MVP Features (Must Have):**
   - Onboarding flow ✅
   - Personalized staircase ✅
   - 5 mini-lessons per stair
   - Basic card types (vocab, multiple choice, audio)
   - Progress tracking
   - Streak system

2. **Post-MVP (Nice to Have):**
   - Community features
   - Practice with others
   - Advanced analytics
   - Social sharing
   - Leaderboards

3. **Timeline Estimation:**
   - Week 1-2: Mini-lessons + Core content
   - Week 3: Testing & bug fixes
   - Week 4: Beta testing with real users
   - Week 5: Launch preparation
   - Week 6: Public launch?

### 5. Daily Work Plan Template
Create a structure for each day's work to stay organized

#### Format:
```markdown
## Day [Date]
**Goal:** [Main objective]

### Tasks:
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

### Completed:
- [x] What we finished
- [x] What works

### Blockers:
- Issues encountered
- Questions to resolve

### Tomorrow:
- Next priorities
```

---

## 📋 Detailed Task Breakdown for Tomorrow

### Morning Session (2-3 hours)

#### Task 1: Mini-Lesson Data Structure (45 min)
1. Design the data model
2. Create mock data for 1 complete stair with 5 mini-lessons
3. Update TypeScript types

#### Task 2: Database Schema (30 min)
1. Add `mini_lessons` table
2. Add `user_mini_lesson_progress` table
3. Link mini-lessons to stairs
4. Add min/max time to onboarding profiles

#### Task 3: Mini-Lesson List Screen (60 min)
1. Update `/lesson/[id].tsx`
2. Display 5 mini-lessons in a list
3. Show progress (0/5, 3/5, 5/5)
4. Lock/unlock logic
5. Tap mini-lesson → Navigate to exercises

### Afternoon Session (2-3 hours)

#### Task 4: Mini-Lesson Flow (90 min)
1. Create `/mini-lesson/[id].tsx`
2. Load cards for that mini-lesson
3. Show progress (Card 1 of 10)
4. Navigate between cards
5. Mark mini-lesson complete
6. Return to mini-lesson list

#### Task 5: Onboarding Time Enhancement (45 min)
1. Add min/max time selection screens
2. Update database calls
3. Test full onboarding flow

#### Task 6: Safe Area Testing (15 min)
1. Test on iOS simulator
2. Test on Android emulator
3. Verify tab bar positioning
4. Check all screens

---

## 🗂️ Files We'll Touch Tomorrow

### New Files:
```
app/mini-lesson/[id].tsx              # Individual mini-lesson screen
components/lesson/MiniLessonCard.tsx  # Mini-lesson card component
components/lesson/MiniLessonList.tsx  # List of 5 mini-lessons
lib/db/mock-mini-lessons.ts           # Mock data for testing
docs/MINI_LESSON_SPEC.md              # Specification document
docs/PRODUCT_ROADMAP.md               # Product plan & timeline
```

### Files to Update:
```
app/lesson/[id].tsx                   # Show mini-lessons instead of cards
lib/db/schema.sql                     # Add mini-lesson tables
lib/api/staircases.ts                 # Add mini-lesson APIs
app/(auth)/onboarding/time-commitment.tsx  # Add min/max
app/(tabs)/home.tsx                   # Already fixed safe area ✅
```

---

## 💡 Design Specifications

### Mini-Lesson Card Design:
```
┌────────────────────────────────────┐
│  🔒  Mini-Lesson 1: Basic Greetings│
│                                    │
│  Progress: ████████░░  8/10 cards │
│                                    │
│  ⏱️ 5 minutes  📝 10 new words     │
│                                    │
│  [Status: Locked/Current/Complete] │
└────────────────────────────────────┘
```

### States:
- **Locked:** Gray, lock icon, can't tap
- **Current:** Glowing indigo, crown icon, can tap
- **Completed:** Green, checkmark, can replay

### Time Commitment Screen:
```
┌────────────────────────────────────┐
│  How much time can you commit?     │
│                                    │
│  Minimum per day:                  │
│  ○ 5 min   ● 10 min   ○ 15 min    │
│  ○ 20 min  ○ 30 min                │
│                                    │
│  Maximum per day:                  │
│  ○ 20 min  ● 30 min   ○ 45 min    │
│  ○ 60 min  ○ 90 min                │
│                                    │
│  [Continue →]                      │
└────────────────────────────────────┘
```

---

## 🎯 Success Criteria for Tomorrow

### Must Complete:
- ✅ Safe area issues fixed
- ✅ Mini-lesson data structure defined
- ✅ Database schema updated
- ✅ Can see 5 mini-lessons when tapping a stair
- ✅ Basic mini-lesson flow works (tap → see cards → complete)

### Nice to Have:
- Product roadmap documented
- Daily work template created
- Onboarding time enhancement started

### Testing Checklist:
- [ ] Tap completed stair → See 5 mini-lessons
- [ ] Tap current stair → See 5 mini-lessons (some locked)
- [ ] Tap mini-lesson → See card flow
- [ ] Complete all cards → Mini-lesson marked complete
- [ ] Complete all 5 mini-lessons → Stair marked complete
- [ ] Safe area looks good on iOS
- [ ] Safe area looks good on Android
- [ ] Tab navigation works smoothly

---

## 📝 Questions to Resolve Tomorrow

1. **Mini-Lesson Content:**
   - Should we use Gemini AI to generate mini-lesson content?
   - Or use pre-defined templates?
   - How to ensure quality and relevance?

2. **Time-Based Adaptation:**
   - How exactly do we adjust content based on min/max time?
   - If user sets 5 min minimum, how many cards per mini-lesson?
   - Should we dynamically adjust difficulty?

3. **Progress Persistence:**
   - When does progress save? (after each card, or at end?)
   - Can users resume a partially completed mini-lesson?
   - What happens if they quit mid-lesson?

4. **Launch Timeline:**
   - When do we want to have beta testers?
   - What's the realistic launch date?
   - What features can we cut if needed?

---

## 🚀 End Goal Vision

By end of tomorrow, user should be able to:
1. ✅ Open app with proper safe areas
2. ✅ See staircase homepage
3. ✅ Tap a stair
4. ✅ See 5 mini-lessons
5. ✅ Tap an unlocked mini-lesson
6. ✅ Go through 5-10 cards
7. ✅ Complete the mini-lesson
8. ✅ See progress update
9. ✅ Move to next mini-lesson

---

## 📊 Metrics to Track

As we build, let's track:
- Time spent on each task (for better planning)
- Bugs encountered (to improve quality)
- Features completed vs. planned
- User flow completion rate (in testing)

---

## Notes from Today's Session

### What Worked Well:
- ✅ Successfully merged best of both branches
- ✅ Clean 4-tab structure
- ✅ Beautiful staircase design
- ✅ Practice tab with all tools
- ✅ Analytics foundation

### Issues Found:
- ⚠️ Safe area overlay issue (FIXED)
- ⚠️ Tabs not clickable? (Need to investigate)
- ⚠️ designSystem type errors (minor, doesn't affect functionality)

### User Feedback:
- 👍 Loves the personalized approach
- 👍 Likes the dark mode staircase design
- 💡 Wants mini-lessons inside stairs (tomorrow's priority)
- 💡 Wants time customization in onboarding
- 💡 Needs product roadmap and timeline

---

## 🎨 Tomorrow's Design Focus

Keep the dark mode aesthetic:
- Dark backgrounds for Home tab
- Light backgrounds for Practice/Community/Profile
- Consistent indigo/purple accent colors
- Smooth animations and transitions
- iOS-first design principles

---

Let's make tomorrow productive! 🚀
