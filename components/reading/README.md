# Reading Components

Premium reading practice components for the Vox Language learning app's teleprompter feature.

## Overview

These components provide a complete reading practice experience with:
- Pre-session motivation and expectation setting
- Teleprompter-style reading interface
- Speech recording and analysis
- Pronunciation feedback
- Progress tracking

## Components

### PreSessionScreen

A premium pre-session motivation screen that appears BEFORE the teleprompter starts.

**Purpose:** Build confidence and set positive expectations before practice begins.

**Key Features:**
- 🎨 **Glassmorphic Design** - Modern, depth-focused UI with blur effects
- ✨ **Animated Entrance** - Staggered FadeIn animations for smooth introduction
- 💫 **Pulse Animation** - Eye-catching start button that draws attention
- 🎯 **Points Philosophy** - Clear explanation of the reward system
- 📱 **Haptic Feedback** - Tactile responses for all interactions
- 🔄 **Random Quotes** - 7 motivational quotes rotate randomly
- 📊 **Passage Preview** - Shows title, difficulty, word count, and duration

#### Usage

```tsx
import { PreSessionScreen } from '@/components/reading';

<PreSessionScreen
  passage={{
    title: "My Trip to Barcelona",
    difficulty: "intermediate",
    wordCount: 250,
    estimatedDuration: 180 // seconds
  }}
  onStart={() => startTeleprompter()}
  onBack={() => navigation.goBack()}
  sessionNumber={3} // Optional
/>
```

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `passage` | `PassageInfo` | Yes | Information about the reading passage |
| `onStart` | `() => void` | Yes | Called when user taps "Start with Full Energy" |
| `onBack` | `() => void` | Yes | Called when user taps back button |
| `sessionNumber` | `number` | No | Shows "session X of today" |

#### PassageInfo Type

```typescript
interface PassageInfo {
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  wordCount: number;
  estimatedDuration: number; // in seconds
}
```

#### Difficulty Color Coding

- **Beginner**: Green (`colors.success`)
- **Intermediate**: Yellow/Amber (`colors.warning`)
- **Advanced**: Orange (`colors.accent.orange`)

## Design Philosophy

### Motivation Over Intimidation

The PreSessionScreen follows the Vox app's core principle: **"Reward effort over perfection"**

**What we emphasize:**
- ✅ No judgment - just practice
- ✅ Points for every attempt
- ✅ Mistakes = Learning = Points
- ✅ Your improvements are celebrated

**What we avoid:**
- ❌ Intimidating language
- ❌ Focus on perfection
- ❌ Pressure or stress
- ❌ Comparison to "native" speakers

### Visual Design

**Glassmorphism:**
- Semi-transparent cards with blur effects
- Gradient overlays for depth
- Subtle border glow effects
- Dark theme consistency

**Animations:**
- `FadeInDown` for header elements (top to bottom)
- `FadeInUp` for content (bottom to top)
- Staggered delays (100ms increments) for sequential appearance
- Continuous pulse on start button (1000ms cycle)
- Spring physics for natural movement

**Color Gradients:**
- Primary gradient: Indigo to Purple (`#6366F1` → `#8B5CF6`)
- Used for badges, buttons, and emphasis
- Matches app-wide design system

### Typography Hierarchy

1. **Quote Title**: 30px, extrabold - Main attention grabber
2. **Section Titles**: 20px, bold - Content organization
3. **Body Text**: 18px, medium - Easy reading
4. **Metadata**: 14px, medium - Supporting information
5. **Badges**: 12px, bold - Labels and tags

## Animation Details

### Entrance Sequence

1. **Header** (100ms delay): Back button + Badge fade in from top
2. **Quote Section** (200ms delay): Glassmorphic card with emoji and quote
3. **Philosophy Section** (300ms delay): "In this session" title appears
4. **Bullet Points** (400-700ms): Each point fades in sequentially
5. **Passage Card** (800ms delay): Preview card slides up
6. **Start Button** (1000ms delay): Final element with pulse

### Interactive Feedback

- **Button Press**: Medium haptic feedback
- **Start Action**: Strong haptic feedback (fab pressed)
- **Scale Animation**: Spring physics on touch
- **Opacity**: 0.9 on active press

## Haptic Feedback

Integrated with `VocabularyHaptics` utility:

```typescript
import { VocabularyHaptics } from '@/lib/utils/haptics';

// On back button
await VocabularyHaptics.cardPressed();

// On start button
await VocabularyHaptics.fabPressed();
```

## Motivational Quotes

7 rotating quotes selected randomly on mount:

1. "Every mistake is a step forward. Your courage to try is what matters most."
2. "Progress happens one word at a time. You're already improving by showing up."
3. "Your voice matters. Every practice session makes you stronger."
4. "Confidence grows through practice, not perfection. Let's begin."
5. "The journey of a thousand words begins with a single attempt."
6. "Mistakes are proof you're learning. Embrace them, celebrate them."
7. "Every great speaker started exactly where you are now."

## Accessibility

**Built-in Features:**
- High contrast text (WCAG AA compliant)
- Large touch targets (44pt minimum)
- Clear visual hierarchy
- Readable font sizes
- Haptic feedback for actions
- ScrollView for content overflow

**Future Enhancements:**
- Screen reader labels
- Voice-over descriptions
- Dynamic type support
- Reduced motion mode

## Performance

**Optimization Techniques:**
- Reanimated for 60fps animations
- LinearGradient with expo-linear-gradient (native performance)
- Memoized quote selection (useState initialization)
- Lazy-loaded animations (entrance only on mount)

**Bundle Size:**
- Main component: ~8KB
- Dependencies: Reanimated, expo-linear-gradient (already in app)
- Total impact: Minimal (shared dependencies)

## Integration with App

### File Locations

```
components/reading/
├── PreSessionScreen.tsx         # Main component
├── PreSessionScreen.example.tsx # Usage examples
├── index.ts                     # Exports
└── README.md                    # This file
```

### Import Paths

```typescript
// Recommended (from index)
import { PreSessionScreen } from '@/components/reading';

// Alternative (direct)
import { PreSessionScreen } from '@/components/reading/PreSessionScreen';
```

### Design System Integration

Uses tokens from `@/constants/designSystem`:
- `colors` - All color values
- `spacing` - Consistent spacing scale
- `borderRadius` - Rounded corners
- `typography` - Font sizes and weights
- `shadows` - Depth and glow effects

## Future Components

The reading feature will include:

1. **TeleprompterView** - Main reading interface
2. **RecordingControls** - Audio recording buttons
3. **ResultsCard** - Post-session feedback
4. **PrivacyToggle** - Public/private recording toggle
5. **DataDashboard** - Transparency and data controls

See `/docs/features/READING_TELEPROMPTER.md` for full feature specification.

## Testing

### Manual Testing Checklist

- [ ] Component renders without errors
- [ ] Animations play smoothly (60fps)
- [ ] Back button triggers onBack callback
- [ ] Start button triggers onStart callback
- [ ] Haptic feedback works on button press
- [ ] Difficulty badges show correct colors
- [ ] Word count and duration display correctly
- [ ] Session number appears when provided
- [ ] ScrollView works for overflow content
- [ ] Responsive to different screen sizes

### Example Test Cases

```typescript
// Test 1: Basic rendering
const passage = {
  title: "Test",
  difficulty: "beginner",
  wordCount: 100,
  estimatedDuration: 90
};

// Test 2: Callbacks fire
const onStartSpy = jest.fn();
const onBackSpy = jest.fn();

// Test 3: Session number appears
sessionNumber={5} // Should show "Session 5 of today"

// Test 4: Different difficulties render correct colors
difficulty="beginner" // Green
difficulty="intermediate" // Yellow
difficulty="advanced" // Orange
```

## Related Documentation

- [READING_TELEPROMPTER.md](/docs/features/READING_TELEPROMPTER.md) - Full feature spec
- [designSystem.ts](/constants/designSystem.ts) - Design tokens
- [haptics.ts](/lib/utils/haptics.ts) - Haptic feedback utilities

## Contributing

When extending these components:

1. **Follow design system** - Use existing tokens, don't add new colors
2. **Match animation style** - Use FadeIn/FadeOut with spring physics
3. **Include haptics** - Add tactile feedback for all interactions
4. **Type safety** - Use TypeScript interfaces
5. **Document examples** - Add to .example.tsx file
6. **Update README** - Keep documentation current

## Questions?

For questions or issues with these components, see:
- `/docs/features/READING_TELEPROMPTER.md` - Feature specification
- `/docs/CLAUDE.md` - Project documentation
- GitHub Issues - Report bugs or request features
