# CalibratorBanner Component

A prominent banner component that appears on the Vox Language App home screen after every 5-7 stairs completed. Prompts users to take a calibration assessment to test their listening, speaking, and comprehension skills before unlocking the next learning section.

## Features

- **Three States**: Locked, Ready, and Completed with distinct visual styles
- **Animated Effects**: Pulsing animation and glowing border when ready
- **Glass-morphism Design**: Gradient backgrounds matching the app's design system
- **Skills Preview**: Shows the three skills to be tested (Listening, Speaking, Comprehension)
- **Score Display**: Shows assessment score when completed
- **Haptic Feedback**: Provides tactile response for user interactions

## Usage

```tsx
import { CalibratorBanner } from '@/components/learning';

// Locked state - user hasn't completed all stairs yet
<CalibratorBanner
  sectionNumber={1}
  status="locked"
  onStart={handleStartAssessment}
/>

// Ready state - user can take the assessment
<CalibratorBanner
  sectionNumber={2}
  status="ready"
  onStart={handleStartAssessment}
/>

// Completed state - user has taken the assessment
<CalibratorBanner
  sectionNumber={3}
  status="completed"
  onStart={handleRetakeAssessment}
  completedAt="2025-12-10T14:30:00Z"
  score={85}
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `sectionNumber` | `number` | Yes | The section/level number for this assessment |
| `status` | `'locked' \| 'ready' \| 'completed'` | Yes | Current state of the calibration test |
| `onStart` | `() => void` | Yes | Callback when user taps to start/retake assessment |
| `completedAt` | `string` | No | ISO date string of when assessment was completed (required for 'completed' state) |
| `score` | `number` | No | Assessment score percentage (0-100, required for 'completed' state) |

## States

### Locked State
- **Visual**: Grayed out appearance with lock icon 🔒
- **Subtitle**: "Complete all stairs to unlock"
- **Button**: Disabled with "Locked" text
- **Behavior**: Shows warning haptic feedback when tapped

### Ready State
- **Visual**: Vibrant colors with animated glow and pulse
- **Icon**: Target emoji 🎯
- **Badge**: Blue "Ready" badge in header
- **Subtitle**: "Ready to level up? Test your skills to unlock your next learning section."
- **Skills**: Shows listening, speaking, and comprehension icons
- **Button**: Gradient button with "Start Assessment →"
- **Animations**:
  - Pulsing scale animation (1.0 → 1.02)
  - Glowing border animation (opacity 0.3 → 0.6)
- **Behavior**: Triggers assessment start on tap

### Completed State
- **Visual**: Neutral style with checkmark icon ✅
- **Subtitle**: Shows completion date
- **Score**: Displays percentage score in header
- **Button**: "Retake Assessment" with bordered style
- **Behavior**: Allows user to retake the assessment

## Design System Integration

The component uses tokens from `@/constants/designSystem`:

- **Colors**: `colors.background`, `colors.gradients.primary`, `colors.text.*`, etc.
- **Spacing**: `spacing.xs`, `spacing.sm`, `spacing.md`, `spacing.lg`, `spacing.xl`
- **Border Radius**: `borderRadius.lg`, `borderRadius.xl`, `borderRadius.full`
- **Typography**: `typography.fontSize.*`, `typography.fontWeight.*`
- **Shadows**: `shadows.glow.primary`

## Animations

Built with `react-native-reanimated` for smooth, performant animations:

1. **Glow Border** (Ready state only):
   - Infinite loop animation
   - Opacity: 0.3 → 0.6 → 0.3
   - Duration: 1500ms per transition
   - Easing: In-out ease

2. **Pulse Effect** (Ready state only):
   - Infinite loop animation
   - Scale: 1.0 → 1.02 → 1.0
   - Duration: 1500ms per transition
   - Easing: In-out ease

3. **Entrance Animation**:
   - FadeInDown from react-native-reanimated
   - Duration: 600ms
   - Delay: 200ms

## Haptic Feedback

- **Ready/Completed State**: Medium impact when tapped
- **Locked State**: Warning notification when tapped (prevents accidental taps)

## Skills Tested

The component displays three skill categories:

1. 👂 **Listening** - Audio comprehension
2. 🗣️ **Speaking** - Pronunciation and fluency
3. 📖 **Comprehension** - Reading and understanding

## Example Implementation

```tsx
import React, { useState } from 'react';
import { CalibratorBanner } from '@/components/learning';

function HomeScreen() {
  const [assessmentStatus, setAssessmentStatus] = useState<'locked' | 'ready' | 'completed'>('ready');
  const [assessmentScore, setAssessmentScore] = useState<number | undefined>(undefined);
  const [completedDate, setCompletedDate] = useState<string | undefined>(undefined);

  const handleStartAssessment = () => {
    // Navigate to assessment screen
    navigation.navigate('CalibrationAssessment', {
      sectionNumber: 1,
      onComplete: (score: number) => {
        setAssessmentStatus('completed');
        setAssessmentScore(score);
        setCompletedDate(new Date().toISOString());
      }
    });
  };

  return (
    <View>
      {/* Other home screen content */}

      <CalibratorBanner
        sectionNumber={1}
        status={assessmentStatus}
        onStart={handleStartAssessment}
        completedAt={completedDate}
        score={assessmentScore}
      />

      {/* More content */}
    </View>
  );
}
```

## Styling Notes

- Uses `LinearGradient` from `expo-linear-gradient` for smooth color transitions
- Glass-morphism effect with gradient backgrounds
- Border width and color adjust based on state
- Responsive to touch with `activeOpacity={0.8}`
- Proper overflow handling for rounded corners

## Accessibility

Consider adding the following for better accessibility:

```tsx
<CalibratorBanner
  // ... other props
  accessibilityLabel={`Calibration assessment for section ${sectionNumber}, status: ${status}`}
  accessibilityHint={status === 'ready' ? 'Double tap to start assessment' : undefined}
  accessibilityRole="button"
/>
```

## Testing

Example test cases:

```tsx
describe('CalibratorBanner', () => {
  it('shows lock icon when status is locked', () => {
    const { getByText } = render(
      <CalibratorBanner sectionNumber={1} status="locked" onStart={jest.fn()} />
    );
    expect(getByText('🔒')).toBeTruthy();
  });

  it('calls onStart when ready state is tapped', () => {
    const onStart = jest.fn();
    const { getByText } = render(
      <CalibratorBanner sectionNumber={1} status="ready" onStart={onStart} />
    );
    fireEvent.press(getByText('Start Assessment →'));
    expect(onStart).toHaveBeenCalled();
  });

  it('displays score when completed', () => {
    const { getByText } = render(
      <CalibratorBanner
        sectionNumber={1}
        status="completed"
        onStart={jest.fn()}
        score={85}
        completedAt="2025-12-10T14:30:00Z"
      />
    );
    expect(getByText('Score: 85%')).toBeTruthy();
  });
});
```

## Performance Considerations

- Animations use `useSharedValue` and `useAnimatedStyle` for optimal performance
- Animations automatically stop when component unmounts
- Gradient rendering is optimized with `StyleSheet.absoluteFillObject`
- Conditional rendering based on state reduces unnecessary elements

## Related Components

- `components/cards/*` - Learning card components
- `components/ui/GlassCard` - Glass-morphism card base
- `components/ui/PremiumButton` - Gradient button component
