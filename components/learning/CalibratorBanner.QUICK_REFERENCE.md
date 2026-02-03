# CalibratorBanner - Quick Reference

## Import

```tsx
import { CalibratorBanner } from '@/components/learning';
```

## States Overview

```
┌─────────────────────────────────────────────────────────┐
│  🔒  CALIBRATION TEST                                   │  LOCKED
│  Complete all stairs to unlock                          │  - Grayed out
│  ○ Listening  ○ Speaking  ○ Comprehension              │  - Disabled
│  ┌─────────────────────────────────────────────────┐   │  - Warning haptic
│  │                  Locked                          │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  🎯  CALIBRATION TEST                          [Ready]  │  READY
│  Ready to level up? Test your skills to unlock          │  - Animated glow
│  your next learning section.                            │  - Pulsing effect
│  👂 Listening  🗣️ Speaking  📖 Comprehension             │  - Gradient button
│  ┌─────────────────────────────────────────────────┐   │  - Interactive
│  │          Start Assessment →                      │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  ✅  ASSESSMENT COMPLETE                                │  COMPLETED
│      Score: 85%                                         │  - Shows score
│  Completed on 12/10/2025                                │  - Shows date
│                                                         │  - Retake option
│  ┌─────────────────────────────────────────────────┐   │
│  │          Retake Assessment                       │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Props

```tsx
interface CalibratorBannerProps {
  sectionNumber: number;              // Required: Section/level number
  status: 'locked' | 'ready' | 'completed';  // Required: Current state
  onStart: () => void;                // Required: Callback function
  completedAt?: string;               // Optional: ISO date string
  score?: number;                     // Optional: 0-100 percentage
}
```

## Basic Usage

```tsx
// Locked
<CalibratorBanner
  sectionNumber={1}
  status="locked"
  onStart={() => console.log('Locked - cannot start')}
/>

// Ready
<CalibratorBanner
  sectionNumber={2}
  status="ready"
  onStart={() => navigation.navigate('Assessment')}
/>

// Completed
<CalibratorBanner
  sectionNumber={3}
  status="completed"
  onStart={() => navigation.navigate('Assessment')}
  completedAt="2025-12-10T14:30:00Z"
  score={85}
/>
```

## State Machine Logic

```tsx
const [status, setStatus] = useState<'locked' | 'ready' | 'completed'>('locked');
const [stairsCompleted, setStairsCompleted] = useState(0);
const REQUIRED_STAIRS = 7;

useEffect(() => {
  if (stairsCompleted >= REQUIRED_STAIRS) {
    setStatus('ready');
  }
}, [stairsCompleted]);

const handleComplete = (score: number) => {
  setStatus('completed');
  // Save score, unlock next section, etc.
};
```

## Key Features by State

| Feature | Locked | Ready | Completed |
|---------|--------|-------|-----------|
| **Icon** | 🔒 | 🎯 | ✅ |
| **Badge** | - | "Ready" | - |
| **Glow Border** | ❌ | ✅ (animated) | ❌ |
| **Pulse Effect** | ❌ | ✅ (animated) | ❌ |
| **Skills Display** | ✅ (muted) | ✅ (vibrant) | ❌ |
| **Score Display** | ❌ | ❌ | ✅ |
| **Button Style** | Muted | Gradient | Bordered |
| **Interactive** | ⚠️ Warning | ✅ | ✅ |
| **Haptic** | Warning | Medium | Medium |

## Animation Details

```tsx
// Glow Border (Ready state only)
Opacity: 0.3 ──▶ 0.6 ──▶ 0.3 (loop)
Duration: 1500ms each transition
Easing: ease-in-out

// Pulse Effect (Ready state only)
Scale: 1.0 ──▶ 1.02 ──▶ 1.0 (loop)
Duration: 1500ms each transition
Easing: ease-in-out

// Entrance
FadeInDown, 600ms, 200ms delay
```

## Design Tokens Used

```tsx
// Colors
colors.background.card
colors.background.elevated
colors.gradients.primary       // ['#6366F1', '#8B5CF6']
colors.text.primary
colors.text.secondary
colors.text.tertiary
colors.text.disabled
colors.border.light
colors.border.dark
colors.primary.DEFAULT
colors.success.light

// Spacing
spacing.xs    // 4
spacing.sm    // 8
spacing.md    // 16
spacing.lg    // 24
spacing.xl    // 32

// Border Radius
borderRadius.lg    // 16
borderRadius.xl    // 24
borderRadius.full  // 9999

// Typography
typography.fontSize.sm      // 14
typography.fontSize.base    // 16
typography.fontSize.lg      // 18
typography.fontSize.xl      // 20
typography.fontWeight.medium    // '500'
typography.fontWeight.semibold  // '600'
typography.fontWeight.bold      // '700'

// Shadows
shadows.glow.primary
```

## Common Patterns

### Navigation Integration
```tsx
const handleStartAssessment = () => {
  navigation.navigate('CalibrationAssessment', {
    sectionNumber,
    onComplete: handleAssessmentComplete,
  });
};

<CalibratorBanner
  status="ready"
  onStart={handleStartAssessment}
  {...otherProps}
/>
```

### With State Management
```tsx
const { calibrationStatus, score, completedAt } = useSelector(
  state => state.learning.calibration
);

<CalibratorBanner
  sectionNumber={currentSection}
  status={calibrationStatus}
  onStart={() => dispatch(startCalibration())}
  score={score}
  completedAt={completedAt}
/>
```

### Conditional Rendering
```tsx
{shouldShowCalibration && (
  <CalibratorBanner
    sectionNumber={sectionNumber}
    status={getCalibrationStatus()}
    onStart={handleStart}
  />
)}
```

## Troubleshooting

### Animation not working?
- Ensure `react-native-reanimated` is properly installed
- Check that babel plugin is configured in `babel.config.js`

### Button not responding?
- Verify `status` is 'ready' or 'completed' (not 'locked')
- Check that `onStart` callback is defined

### Styling looks off?
- Ensure design system is imported correctly
- Check that `LinearGradient` from `expo-linear-gradient` is installed

### Date not displaying?
- Pass `completedAt` as ISO string format
- Example: `new Date().toISOString()`

## Dependencies

```json
{
  "react-native-reanimated": "^3.x",
  "expo-linear-gradient": "^13.x",
  "expo-haptics": "^13.x"
}
```
