# PreSessionScreen Component Showcase

## Visual Preview

```
┌─────────────────────────────────────────┐
│  ← Back                                 │
│  ┌────────────────────┐                 │
│  │ READING PRACTICE   │ ← Gradient Badge│
│  └────────────────────┘                 │
│  Session 1 of today                     │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  ╔═══════════════════════════╗  │   │
│  │  ║                           ║  │   │
│  │  ║          🎤              ║  │   │ ← Glassmorphic
│  │  ║   Ready to Practice?     ║  │   │   Card
│  │  ║   ─────────────────────  ║  │   │
│  │  ║   "Every mistake is a    ║  │   │
│  │  ║    step forward..."      ║  │   │
│  │  ║                           ║  │   │
│  │  ╚═══════════════════════════╝  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  In this session:                       │
│  ✨ No judgment - just practice         │
│  ✨ Points for every attempt            │
│  ✨ Mistakes = Learning = Points        │
│  ✨ Your improvements are celebrated    │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  My Trip to Barcelona           │   │ ← Passage Preview
│  │  ┌──────────┐  250 words · 3m  │   │
│  │  │ Medium   │                   │   │
│  │  └──────────┘                   │   │
│  │  📖 250 words    ⏱️ ~3m        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Start with Full Energy →      │   │ ← Pulsing Button
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

## Component Features

### 1. Animated Header
- **Back Button**: Chevron left with haptic feedback
- **Gradient Badge**: "READING PRACTICE" with primary gradient
- **Session Counter**: Optional "Session X of today" text
- **Animation**: FadeInDown with 100ms delay

### 2. Motivational Quote Section
- **Emoji**: Large 🎤 icon (64px)
- **Title**: "Ready to Practice?" with gradient effect
- **Quote**: Random selection from 7 inspirational quotes
- **Styling**: Glassmorphic card with blur and gradients
- **Animation**: FadeInDown with 200ms delay

### 3. Points Philosophy
- **Title**: "In this session:"
- **4 Bullet Points**:
  1. No judgment - just practice
  2. Points for every attempt
  3. Mistakes = Learning = Points
  4. Your improvements are celebrated
- **Icon**: ✨ sparkle with glow effect
- **Animation**: FadeInUp staggered (300-700ms)

### 4. Passage Preview Card
- **Title**: Passage name
- **Difficulty Badge**: Color-coded (green/yellow/orange)
- **Metadata**: Word count and duration
- **Stats Row**: 📖 and ⏱️ icons with counts
- **Styling**: Glassmorphic card with dark gradient
- **Animation**: FadeInUp with 800ms delay

### 5. Start Button
- **Text**: "Start with Full Energy →"
- **Gradient**: Primary gradient (indigo to purple)
- **Animation**: Continuous pulse (1s cycle)
- **Haptic**: Strong feedback on press
- **Animation**: FadeInUp with 1000ms delay

### 6. Background Elements
- **Gradient**: Primary → Secondary → Card colors
- **Particles**: 6 floating particles (optional)
- **ScrollView**: Handles overflow content

## Color Coding

### Difficulty Levels

| Level | Color | Background | Badge Text |
|-------|-------|------------|------------|
| Beginner | `#10B981` (Green) | `rgba(16, 185, 129, 0.2)` | "Beginner" |
| Intermediate | `#F59E0B` (Amber) | `rgba(245, 158, 11, 0.2)` | "Intermediate" |
| Advanced | `#F97316` (Orange) | `rgba(249, 115, 22, 0.2)` | "Advanced" |

### UI Elements

| Element | Color/Gradient |
|---------|----------------|
| Badge | Primary gradient (`#6366F1` → `#8B5CF6`) |
| Start Button | Primary gradient (`#6366F1` → `#8B5CF6`) |
| Quote Card Border | `rgba(99, 102, 241, 0.3)` |
| Quote Card Background | `rgba(99, 102, 241, 0.1)` → `rgba(139, 92, 246, 0.1)` |
| Passage Card | `rgba(26, 31, 58, 0.8)` → `rgba(34, 40, 69, 0.8)` |
| Sparkle Glow | Primary glow color with 0.3 opacity |

## Typography Scale

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Quote Title | 30px | 800 | Primary Text |
| Section Title | 20px | 700 | Primary Text |
| Bullet Text | 18px | 500 | Secondary Text |
| Quote | 18px | 400 | Secondary Text (Italic) |
| Passage Title | 24px | 700 | Primary Text |
| Badge Text | 14px | 700 | Primary Text |
| Metadata | 14px | 500 | Tertiary Text |
| Start Button | 20px | 700 | Primary Text |

## Spacing System

| Element | Padding/Margin |
|---------|----------------|
| Container | 24px all sides |
| Header → Quote | 32px margin |
| Quote → Philosophy | 32px margin |
| Philosophy → Passage | 32px margin |
| Passage → Button | 32px margin |
| Button Text | 24px vertical, 32px horizontal |
| Card Padding | 32px all sides (quote), 24px (passage) |

## Animation Timeline

```
0ms    ─┐
100ms  ─┼─► Header (FadeInDown)
200ms  ─┼─► Quote Section (FadeInDown)
300ms  ─┼─► Philosophy Title (FadeInUp)
400ms  ─┼─► Bullet Point 1 (FadeInUp)
500ms  ─┼─► Bullet Point 2 (FadeInUp)
600ms  ─┼─► Bullet Point 3 (FadeInUp)
700ms  ─┼─► Bullet Point 4 (FadeInUp)
800ms  ─┼─► Passage Card (FadeInUp)
1000ms ─┴─► Start Button (FadeInUp + Pulse)
```

**Continuous:**
- Start button pulse: 1000ms cycle (scale 1 → 1.05 → 1)

## Glassmorphism Effect

### Quote Card
```typescript
{
  borderRadius: 24px,
  borderWidth: 1,
  borderColor: 'rgba(99, 102, 241, 0.3)',
  background: LinearGradient([
    'rgba(99, 102, 241, 0.1)',
    'rgba(139, 92, 246, 0.1)'
  ]),
  shadow: {
    color: 'rgba(99, 102, 241, 0.5)',
    offset: { width: 0, height: 8 },
    opacity: 0.4,
    radius: 16
  }
}
```

### Passage Card
```typescript
{
  borderRadius: 24px,
  borderWidth: 1,
  borderColor: '#374151',
  background: LinearGradient([
    'rgba(26, 31, 58, 0.8)',
    'rgba(34, 40, 69, 0.8)'
  ]),
  shadow: {
    color: 'rgba(99, 102, 241, 0.5)',
    offset: { width: 0, height: 4 },
    opacity: 0.3,
    radius: 8
  }
}
```

## Motivational Quotes

1. "Every mistake is a step forward. Your courage to try is what matters most."
2. "Progress happens one word at a time. You're already improving by showing up."
3. "Your voice matters. Every practice session makes you stronger."
4. "Confidence grows through practice, not perfection. Let's begin."
5. "The journey of a thousand words begins with a single attempt."
6. "Mistakes are proof you're learning. Embrace them, celebrate them."
7. "Every great speaker started exactly where you are now."

**Selection:** Random quote chosen on component mount (useState initialization)

## Haptic Feedback

| Action | Haptic Type | Implementation |
|--------|-------------|----------------|
| Back Button | Light | `VocabularyHaptics.cardPressed()` |
| Start Button | Medium | `VocabularyHaptics.fabPressed()` |

## Responsive Behavior

### ScrollView
- Enabled when content exceeds viewport
- `showsVerticalScrollIndicator={false}` for clean UI
- Content padding: 24px bottom (extra for scroll)

### SafeAreaView
- Respects iOS notch and home indicator
- Prevents content from being hidden
- Background matches container

## Accessibility Features

| Feature | Implementation |
|---------|----------------|
| Large Touch Targets | 44pt minimum (buttons) |
| High Contrast Text | WCAG AA compliant |
| Clear Hierarchy | Size and weight differentiation |
| Readable Fonts | 16px+ for body text |
| Haptic Feedback | Tactile responses |

## Performance Optimizations

1. **Memoized Quote**: `useState(() => random())` prevents re-calculation
2. **Reanimated**: 60fps animations on native thread
3. **LinearGradient**: Native implementation (expo-linear-gradient)
4. **Shared Values**: `useSharedValue` for pulse animation
5. **Lazy Animations**: Entrance animations only run once

## File Size

- **Main Component**: 14KB (524 lines)
- **Example File**: 10KB (351 lines)
- **Demo File**: 8.6KB (298 lines)
- **README**: 8.6KB
- **Integration Guide**: 13KB
- **Total Package**: ~55KB (well-documented)

## Dependencies

- `react-native` - Core framework
- `expo-linear-gradient` - Native gradients
- `react-native-reanimated` - 60fps animations
- `@/constants/designSystem` - Design tokens
- `@/lib/utils/haptics` - Haptic feedback

## Browser Compatibility

- ✅ iOS (primary target)
- ✅ Android (full support)
- ⚠️ Web (animations may differ)

## Related Components

**Coming Soon:**
- `TeleprompterView` - Reading interface
- `RecordingControls` - Audio controls
- `ResultsCard` - Post-session feedback
- `PrivacyToggle` - Public/private toggle

## Version History

- **v1.0.0** (2025-12-05): Initial release
  - 7 motivational quotes
  - Glassmorphic design
  - Staggered animations
  - Pulse button effect
  - Haptic feedback
  - Full TypeScript support
  - Comprehensive documentation

## Support

For issues or questions:
- See `/components/reading/README.md` for detailed docs
- See `/components/reading/INTEGRATION_GUIDE.md` for setup
- See `/docs/features/READING_TELEPROMPTER.md` for feature spec
- See `/components/reading/PreSessionScreen.example.tsx` for usage examples

---

**Design Credits**: Based on Vox Language App design system
**Philosophy**: "Reward effort over perfection"
**Target**: Language learners seeking confidence through practice
