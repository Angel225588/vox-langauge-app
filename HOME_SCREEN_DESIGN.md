# Home Screen Design - Duolingo-Style Path
## Vox Language App - iOS-First Design

**Date:** November 21, 2025
**Inspiration:** Duolingo's learning path with levels
**Platform:** iOS-first (with safe area considerations)

---

## 🎯 Concept: Stairs to Fluency

Instead of a vertical path like Duolingo, we'll use **STAIRS** going upward from the bottom of the screen (ground floor) to the top (fluency).

### Visual Metaphor:
```
┌─────────────────────────────────────┐
│                                     │
│         🏆 FLUENCY                  │  ← Top goal
│            ╱                        │
│           ╱ Level 5                │
│          ╱                          │
│         ╱ Level 4                  │
│        ╱                            │
│       ╱ Level 3                    │
│      ╱                              │
│     ╱ Level 2                      │
│    ╱                                │
│   ╱ Level 1 (Current)              │
│  ╱                                  │
│ 🚶 START                            │  ← Bottom (you are here)
│                                     │
└─────────────────────────────────────┘
```

---

## 📐 Design Specifications

### Layout Structure

**Scrollable Vertical View:**
- User scrolls up to see higher levels
- Current level is highlighted/glowing
- Completed levels are colored (green)
- Locked levels are grayed out
- Each level has depth/shadow for 3D effect

### Staircase Elements

**Each Step (Level) Contains:**
1. **Level Number** - "Level 1", "Level 2", etc.
2. **Icon/Image** - Visual representation (food, travel, etc.)
3. **Progress Indicator** - "3/5 lessons" or circular progress
4. **Star/Badge** - Shows completion
5. **Unlock State** - Locked/Unlocked/Current/Completed

---

## 🎨 Visual Design

### Step/Level Card Design

```
┌─────────────────────────────────────┐
│  ╔═══════════════════════════════╗  │
│  ║                               ║  │
│  ║   🍎  Level 1: Food           ║  │  ← Current level (glowing)
│  ║                               ║  │
│  ║   Progress: ████░ 3/5         ║  │
│  ║                               ║  │
│  ║   [Continue Lesson →]         ║  │
│  ║                               ║  │
│  ╚═══════════════════════════════╝  │
│        ╱                            │  ← Stair connection
│       ╱                             │
│      ╱ ═══════════════════════     │  ← Completed level (green)
│     ╱  ✓ Level 1: Basics           │
│    ╱   5/5 lessons ⭐⭐⭐          │
│   ╱                                 │
└─────────────────────────────────────┘
```

### Color Scheme

**State Colors:**
- **Current Level:** Indigo (#6366F1) with glow effect
- **Completed:** Green (#10B981) with checkmark
- **Locked:** Gray (#9CA3AF) with lock icon
- **In Progress:** Yellow accent (#F59E0B)

**Depth Effects:**
- Shadow below each step
- Gradient on stair face
- Subtle 3D perspective

---

## 📊 Level Structure

### Progression Model

**Each Level = 3-5 Lessons:**
- Lesson 1: New vocabulary (5-10 words)
- Lesson 2: Practice with games
- Lesson 3: Listening comprehension
- Lesson 4: Speaking practice
- Lesson 5: Review all (unlock next level)

### Lesson Types per Level

**Level 1: Food & Dining (Beginner)**
- 🍎 Lesson 1: Basic food words (apple, water, bread)
- 🍕 Lesson 2: Ordering food phrases
- 🎧 Lesson 3: Listen and identify
- 🎤 Lesson 4: Say menu items
- 🎮 Lesson 5: Food vocabulary game

**Level 2: Greetings & Introductions**
- 👋 Lesson 1: Hello, goodbye, thank you
- 🗣️ Lesson 2: "My name is...", "I am from..."
- 🎧 Lesson 3: Listen to conversations
- 🎤 Lesson 4: Practice introductions
- 🎮 Lesson 5: Conversation game

**Level 3: Travel Essentials**
- ✈️ Lesson 1: Airport, hotel, taxi
- 🗺️ Lesson 2: Asking for directions
- 🎧 Lesson 3: Listen to instructions
- 🎤 Lesson 4: Practice asking questions
- 🎮 Lesson 5: Travel scenario game

*(Continue pattern for 10-15 levels)*

---

## 🖼️ iOS-Specific Considerations

### Safe Area

**iPhone Notch/Dynamic Island:**
- Top padding: 50-60px for safe area
- Bottom padding: 34px for home indicator
- Use `SafeAreaView` from `react-native-safe-area-context`

**Example:**
```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
  {/* Staircase content */}
</SafeAreaView>
```

### Dock Awareness

**Bottom Tab Bar:**
- Height: ~80px (standard iOS tab bar)
- Accounts for home indicator on iPhone X+
- Content should scroll ABOVE the tab bar
- Last level should have bottom padding to avoid overlap

---

## 🎬 Animations

### Scroll Behavior
- **Parallax Effect:** Background moves slower than stairs
- **Level Reveal:** Fade in as user scrolls up
- **Current Level Pulse:** Subtle glow animation
- **Unlock Animation:** Lock breaks, confetti burst

### Level Completion
- Checkmark appears with bounce
- Stars fill in sequentially
- Green color transition
- Sound effect (optional)

### Level Unlock
- Lock icon shakes
- Breaks open with particles
- Next level lights up
- Haptic feedback

---

## 📱 Interaction Design

### Tapping a Level

**Current Level:**
- Opens lesson selection modal
- Shows 5 lessons with progress
- "Continue" goes to next incomplete lesson

**Completed Level:**
- Shows summary (words learned, accuracy)
- Option to "Review" or "Practice Again"
- Displays earned stars/badges

**Locked Level:**
- Shows lock icon
- Message: "Complete Level X first"
- No interaction

---

## 🏗️ Component Structure

### File Organization

```
/components/home/
├── StaircasePath.tsx          # Main scrollable staircase
├── LevelStep.tsx              # Individual level card
├── LessonModal.tsx            # Modal showing lessons in a level
├── ProgressRing.tsx           # Circular progress indicator
├── UnlockAnimation.tsx        # Confetti/celebration
└── ParallaxBackground.tsx     # Moving background
```

### Data Structure

```typescript
interface Level {
  id: string;
  levelNumber: number;
  title: string;
  icon: string; // emoji or icon name
  category: string; // "Food", "Travel", etc.
  lessons: Lesson[];
  isLocked: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  totalStars: number; // 0-3 stars
  progress: {
    completed: number;
    total: number;
  };
}

interface Lesson {
  id: string;
  lessonNumber: number;
  title: string;
  type: 'vocabulary' | 'game' | 'listening' | 'speaking' | 'review';
  isCompleted: boolean;
  flashcardIds: string[]; // Which flashcards to review
}
```

---

## 🎯 Implementation Priority

### Phase 1: Basic Structure (Week 1)
- [ ] Create scrollable staircase layout
- [ ] Design level card component
- [ ] Add static levels (5 levels)
- [ ] Wire up navigation to lessons

### Phase 2: Data & Logic (Week 2)
- [ ] Define level progression rules
- [ ] Track user progress per level
- [ ] Unlock/lock logic based on completion
- [ ] Calculate progress percentages

### Phase 3: Polish & Animations (Week 3)
- [ ] Add stair depth effect
- [ ] Parallax background
- [ ] Unlock animations
- [ ] Completion celebrations
- [ ] Haptic feedback

### Phase 4: Content (Week 4)
- [ ] Create 10-15 levels
- [ ] Map flashcards to lessons
- [ ] Define lesson sequences
- [ ] Add category icons

---

## 💡 Key Features

### Motivation System
- **Streak Display:** "7-day streak 🔥" at top
- **Daily Goal:** "2/3 lessons today"
- **Next Milestone:** "5 more lessons to unlock Level 3!"

### Social Proof
- **Friends on Path:** See where friends are
- **Leaderboard Link:** Tap to see rankings
- **Achievement Badges:** Display earned badges

### Personalization
- **Custom Path:** User can choose focus (travel, business, etc.)
- **Skip Option:** Test out of levels
- **Review Anytime:** Go back to any completed level

---

## 🚀 Quick Start Implementation

### Step 1: Create Mock Data
```typescript
// /constants/levels.ts
export const LEVELS = [
  {
    id: '1',
    levelNumber: 1,
    title: 'Food & Dining',
    icon: '🍎',
    lessons: 5,
    isLocked: false,
    isCurrent: true,
  },
  {
    id: '2',
    levelNumber: 2,
    title: 'Greetings',
    icon: '👋',
    lessons: 5,
    isLocked: true,
    isCurrent: false,
  },
  // ... more levels
];
```

### Step 2: Build StaircasePath Component
```typescript
// /components/home/StaircasePath.tsx
import { ScrollView } from 'react-native';
import LevelStep from './LevelStep';

export function StaircasePath({ levels }) {
  return (
    <ScrollView>
      {levels.map((level, index) => (
        <LevelStep
          key={level.id}
          level={level}
          position={index} // For stair offset
        />
      ))}
    </ScrollView>
  );
}
```

### Step 3: Replace Home Screen
```typescript
// /app/(tabs)/home.tsx
import { StaircasePath } from '@/components/home/StaircasePath';
import { LEVELS } from '@/constants/levels';

export default function HomeScreen() {
  return (
    <SafeAreaView>
      <StaircasePath levels={LEVELS} />
    </SafeAreaView>
  );
}
```

---

## 📸 Visual References

### Inspiration Sources
1. **Duolingo:** Vertical path progression
2. **Khan Academy:** Level system
3. **Monument Valley:** Stair aesthetic with depth
4. **Candy Crush:** Level map with stars

### Design Tools
- Figma mockup (optional)
- Sketch level layouts first
- Use emoji for quick prototyping
- Test on real iOS device

---

## ✅ Success Criteria

**A Great Home Screen:**
- [ ] User immediately understands where they are
- [ ] Next action is obvious ("Continue Lesson")
- [ ] Progress feels rewarding (visual feedback)
- [ ] Unlocking levels is exciting (celebration)
- [ ] Works smoothly on all iOS devices
- [ ] Respects safe areas (notch, home indicator)
- [ ] Loads instantly (no lag)

---

## 🎊 Future Enhancements

### Advanced Features (Later)
- **Branching Paths:** Choose your focus area
- **Boss Battles:** End-of-level challenges
- **Hidden Levels:** Unlock with achievements
- **Time Challenges:** Complete level in 7 days
- **Collaborative Levels:** Practice with friends

---

**Status:** 📋 Design documented, ready to implement
**Priority:** HIGH - Core user experience
**Estimated Time:** 2-3 weeks for full implementation
**MVP Time:** 1 week for basic staircase with 5 levels

---

**Next Steps:**
1. Test flashcards work (Priority 1)
2. Create mock level data (1 hour)
3. Build basic staircase layout (1 day)
4. Wire up navigation (1 day)
5. Add polish and animations (1 week)
