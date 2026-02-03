# Learning Components

Components related to the learning experience and user progression in the Vox Language App.

## Components

### CalibratorBanner

A prominent banner component that appears after every 5-7 stairs to prompt users to take a calibration assessment. Tests listening, speaking, and comprehension skills before unlocking the next learning section.

**Location**: `/components/learning/CalibratorBanner.tsx`

**Quick Usage**:
```tsx
import { CalibratorBanner } from '@/components/learning';

<CalibratorBanner
  sectionNumber={1}
  status="ready"
  onStart={handleStartAssessment}
/>
```

## Files in this Directory

### Core Component
- **`CalibratorBanner.tsx`** - Main component implementation (11KB)
  - Three states: locked, ready, completed
  - Animated glow and pulse effects
  - Glass-morphism design
  - Full haptic feedback integration

### Exports
- **`index.ts`** - Clean exports for easy importing

### Documentation
- **`CalibratorBanner.README.md`** - Comprehensive component documentation
  - Features overview
  - Props API reference
  - States explanation
  - Design system integration
  - Animation details
  - Accessibility guidelines

- **`CalibratorBanner.QUICK_REFERENCE.md`** - Quick reference cheat sheet
  - Visual ASCII diagrams of all states
  - Props at a glance
  - Common usage patterns
  - Troubleshooting tips

- **`INTEGRATION_GUIDE.md`** - Step-by-step integration guide
  - Home screen integration
  - State management patterns
  - Navigation flow
  - Data persistence
  - Testing examples

### Examples & Demos
- **`CalibratorBanner.example.tsx`** - Basic usage examples
  - All three states shown
  - Different score scenarios
  - Simple implementations

- **`CalibratorBanner.demo.tsx`** - Interactive demo component
  - Live state switching
  - Score adjustment controls
  - Visual testing interface
  - Can be used in development screens

## Features

### Visual Design
- Glass-morphism background with gradient accents
- Animated glow border (ready state)
- Pulsing scale effect (ready state)
- Dark theme with indigo/purple accents
- Follows app design system

### Three States

#### 🔒 Locked
- Grayed out appearance
- "Complete all stairs to unlock" message
- Disabled button
- Warning haptic feedback

#### 🎯 Ready
- Vibrant colors with animations
- "Ready to level up!" message
- Shows skill icons (👂 🗣️ 📖)
- Gradient CTA button
- Medium impact haptic

#### ✅ Completed
- Shows score percentage
- Displays completion date
- "Retake Assessment" option
- No animations

### Animations
- **Glow Border**: Infinite opacity animation (0.3 → 0.6)
- **Pulse Effect**: Infinite scale animation (1.0 → 1.02)
- **Entrance**: FadeInDown with 200ms delay
- Built with `react-native-reanimated` for performance

### Skills Tested
1. 👂 Listening - Audio comprehension
2. 🗣️ Speaking - Pronunciation and fluency
3. 📖 Comprehension - Reading and understanding

## Installation & Setup

### Dependencies
The component requires these packages (already installed in Vox App):
```json
{
  "react-native-reanimated": "^3.x",
  "expo-linear-gradient": "^13.x",
  "expo-haptics": "^13.x"
}
```

### Import Paths
```tsx
// Import component
import { CalibratorBanner } from '@/components/learning';

// Import types
import type { CalibratorBannerProps } from '@/components/learning';
```

## Usage Examples

### Basic Implementation
```tsx
<CalibratorBanner
  sectionNumber={1}
  status="ready"
  onStart={() => navigation.navigate('Assessment')}
/>
```

### With State Management
```tsx
const [status, setStatus] = useState<'locked' | 'ready' | 'completed'>('locked');

<CalibratorBanner
  sectionNumber={1}
  status={status}
  onStart={handleStart}
  completedAt="2025-12-10T14:30:00Z"
  score={85}
/>
```

### In ScrollView (Recommended)
```tsx
<ScrollView>
  {stairs.map((stair, index) => (
    <React.Fragment key={stair.id}>
      <StairCard stair={stair} />

      {(index + 1) % 7 === 0 && (
        <CalibratorBanner
          sectionNumber={Math.floor(index / 7) + 1}
          status={getStatus(index)}
          onStart={() => handleStart(index)}
        />
      )}
    </React.Fragment>
  ))}
</ScrollView>
```

## Props API

```typescript
interface CalibratorBannerProps {
  sectionNumber: number;              // Required: Section/level number
  status: 'locked' | 'ready' | 'completed';  // Required: Current state
  onStart: () => void;                // Required: Callback when tapped
  completedAt?: string;               // Optional: ISO date string
  score?: number;                     // Optional: 0-100 percentage
}
```

## Design System

Uses tokens from `@/constants/designSystem`:

- **Colors**: `colors.background.*`, `colors.gradients.primary`, `colors.text.*`
- **Spacing**: `spacing.xs` through `spacing.xl`
- **Typography**: `typography.fontSize.*`, `typography.fontWeight.*`
- **Border Radius**: `borderRadius.lg`, `borderRadius.xl`
- **Shadows**: `shadows.glow.primary`

## Testing

### Run Demo
To test the component interactively:

1. Add to a demo screen:
```tsx
import { CalibratorBannerDemo } from '@/components/learning/CalibratorBanner.demo';

<CalibratorBannerDemo />
```

2. Or use individual examples:
```tsx
import CalibratorBannerExamples from '@/components/learning/CalibratorBanner.example';

<CalibratorBannerExamples />
```

### Unit Tests
Example test setup:
```tsx
import { render, fireEvent } from '@testing-library/react-native';
import { CalibratorBanner } from '@/components/learning';

test('calls onStart when ready', () => {
  const onStart = jest.fn();
  const { getByText } = render(
    <CalibratorBanner sectionNumber={1} status="ready" onStart={onStart} />
  );

  fireEvent.press(getByText('Start Assessment →'));
  expect(onStart).toHaveBeenCalled();
});
```

## Performance

- Animations use `useSharedValue` and `useAnimatedStyle` for 60fps
- Animations automatically stop when component unmounts
- Conditional rendering based on state
- No unnecessary re-renders

## Accessibility

Add accessibility props for better screen reader support:
```tsx
<CalibratorBanner
  {...props}
  accessible={true}
  accessibilityLabel="Calibration assessment, ready to start"
  accessibilityHint="Double tap to start assessment"
  accessibilityRole="button"
/>
```

## Future Enhancements

Potential improvements:
- [ ] Add confetti animation on completion
- [ ] Add progress ring showing skills tested
- [ ] Add sound effects for state transitions
- [ ] Add "Skip for now" option (with penalty)
- [ ] Add countdown timer for retake cooldown
- [ ] Support for custom skill sets per section
- [ ] Localization support for different languages

## Related Components

- `components/cards/*` - Learning card components
- `components/ui/GlassCard` - Glass-morphism base
- `components/ui/PremiumButton` - Gradient buttons
- `components/ui/Icon` - Icon system

## Support

For questions or issues:
1. Check the `CalibratorBanner.README.md` for detailed documentation
2. See `INTEGRATION_GUIDE.md` for integration patterns
3. Use `CalibratorBanner.demo.tsx` to test different states
4. Refer to `CalibratorBanner.QUICK_REFERENCE.md` for quick lookups

## License

Part of the Vox Language App codebase.
