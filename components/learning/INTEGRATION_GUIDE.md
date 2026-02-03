# CalibratorBanner Integration Guide

## Quick Start

### 1. Import the Component

```tsx
import { CalibratorBanner } from '@/components/learning';
```

### 2. Basic Implementation

```tsx
function HomeScreen() {
  const handleStartAssessment = () => {
    navigation.navigate('CalibrationAssessment');
  };

  return (
    <ScrollView>
      {/* Other content */}

      <CalibratorBanner
        sectionNumber={1}
        status="ready"
        onStart={handleStartAssessment}
      />

      {/* More content */}
    </ScrollView>
  );
}
```

## Integration with Home Screen

### Recommended Placement

The CalibratorBanner should appear:
- After every 5-7 completed stairs
- Between learning sections
- Before locked content in the stair list

```tsx
function HomeScreen() {
  const { stairs, currentSection } = useLearningProgress();

  return (
    <ScrollView>
      {/* Header */}
      <HomeHeader />

      {/* Learning Path */}
      {stairs.map((stair, index) => {
        // Show calibration banner every 7 stairs
        const shouldShowBanner = (index + 1) % 7 === 0;

        return (
          <React.Fragment key={stair.id}>
            <StairCard stair={stair} />

            {shouldShowBanner && (
              <CalibratorBanner
                sectionNumber={Math.floor(index / 7) + 1}
                status={getCalibrationStatus(index)}
                onStart={() => handleStartCalibration(index)}
                completedAt={stair.calibrationCompletedAt}
                score={stair.calibrationScore}
              />
            )}
          </React.Fragment>
        );
      })}
    </ScrollView>
  );
}
```

## State Management

### With React State

```tsx
function HomeScreen() {
  const [calibrationStatus, setCalibrationStatus] = useState<'locked' | 'ready' | 'completed'>('locked');
  const [score, setScore] = useState<number | undefined>(undefined);
  const [completedAt, setCompletedAt] = useState<string | undefined>(undefined);

  // Update status based on stairs completed
  useEffect(() => {
    const stairsCompleted = getCompletedStairs();
    if (stairsCompleted >= 7) {
      setCalibrationStatus('ready');
    }
  }, []);

  const handleStartAssessment = () => {
    navigation.navigate('CalibrationAssessment', {
      onComplete: handleAssessmentComplete,
    });
  };

  const handleAssessmentComplete = (assessmentScore: number) => {
    setCalibrationStatus('completed');
    setScore(assessmentScore);
    setCompletedAt(new Date().toISOString());
    // Unlock next section
    unlockNextSection();
  };

  return (
    <CalibratorBanner
      sectionNumber={1}
      status={calibrationStatus}
      onStart={handleStartAssessment}
      completedAt={completedAt}
      score={score}
    />
  );
}
```

### With Context/Redux

```tsx
// Using Context
const { calibration } = useLearningContext();

<CalibratorBanner
  sectionNumber={calibration.sectionNumber}
  status={calibration.status}
  onStart={() => dispatch({ type: 'START_CALIBRATION' })}
  completedAt={calibration.completedAt}
  score={calibration.score}
/>

// Using Redux
const calibration = useSelector(state => state.learning.calibration);

<CalibratorBanner
  sectionNumber={calibration.sectionNumber}
  status={calibration.status}
  onStart={() => dispatch(startCalibration())}
  completedAt={calibration.completedAt}
  score={calibration.score}
/>
```

## Navigation Flow

### Recommended Flow

```
Home Screen
    ↓
[User taps "Start Assessment"]
    ↓
CalibrationAssessment Screen
    ↓
[User completes assessment]
    ↓
Results Screen
    ↓
[Automatic unlock of next section]
    ↓
Home Screen (with "completed" state)
```

### Navigation Setup

```tsx
// In your navigation stack
function LearningStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="CalibrationAssessment"
        component={CalibrationAssessmentScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CalibrationResults"
        component={CalibrationResultsScreen}
        options={{
          presentation: 'modal',
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}

// In HomeScreen
const handleStartAssessment = () => {
  navigation.navigate('CalibrationAssessment', {
    sectionNumber: currentSection,
    onComplete: (score: number) => {
      navigation.navigate('CalibrationResults', {
        score,
        onContinue: () => {
          navigation.navigate('Home');
          // Update state to show completed
          updateCalibrationStatus('completed', score);
        },
      });
    },
  });
};
```

## Data Persistence

### Save to Backend/Database

```tsx
const handleAssessmentComplete = async (score: number) => {
  const completedAt = new Date().toISOString();

  // Update local state
  setCalibrationStatus('completed');
  setScore(score);
  setCompletedAt(completedAt);

  // Save to database
  try {
    await supabase
      .from('user_calibrations')
      .insert({
        user_id: userId,
        section_number: sectionNumber,
        score: score,
        completed_at: completedAt,
        skills_tested: ['listening', 'speaking', 'comprehension'],
      });

    // Unlock next section
    await unlockSection(sectionNumber + 1);
  } catch (error) {
    console.error('Failed to save calibration:', error);
  }
};
```

### Load from Backend

```tsx
useEffect(() => {
  const loadCalibrationStatus = async () => {
    const { data } = await supabase
      .from('user_calibrations')
      .select('*')
      .eq('user_id', userId)
      .eq('section_number', sectionNumber)
      .single();

    if (data) {
      setCalibrationStatus('completed');
      setScore(data.score);
      setCompletedAt(data.completed_at);
    } else {
      // Check if ready based on stairs completed
      const stairsCompleted = await getCompletedStairsCount();
      if (stairsCompleted >= REQUIRED_STAIRS) {
        setCalibrationStatus('ready');
      } else {
        setCalibrationStatus('locked');
      }
    }
  };

  loadCalibrationStatus();
}, [userId, sectionNumber]);
```

## Triggering Logic

### When to Show the Banner

```tsx
function shouldShowCalibrationBanner(stairIndex: number, totalStairs: number): boolean {
  // Show every 7 stairs
  const isCalibrationPoint = (stairIndex + 1) % 7 === 0;

  // Don't show after the last stair
  const isNotLastStair = stairIndex < totalStairs - 1;

  return isCalibrationPoint && isNotLastStair;
}

// Usage
{stairs.map((stair, index) => (
  <React.Fragment key={stair.id}>
    <StairCard stair={stair} />

    {shouldShowCalibrationBanner(index, stairs.length) && (
      <CalibratorBanner {...calibrationProps} />
    )}
  </React.Fragment>
))}
```

### Status Determination Logic

```tsx
function getCalibrationStatus(
  stairsCompleted: number,
  requiredStairs: number,
  isCompleted: boolean
): 'locked' | 'ready' | 'completed' {
  if (isCompleted) {
    return 'completed';
  }

  if (stairsCompleted >= requiredStairs) {
    return 'ready';
  }

  return 'locked';
}
```

## Testing Integration

### Example Test

```tsx
import { render, fireEvent } from '@testing-library/react-native';
import { CalibratorBanner } from '@/components/learning';

describe('CalibratorBanner Integration', () => {
  it('navigates to assessment when ready', () => {
    const onStart = jest.fn();

    const { getByText } = render(
      <CalibratorBanner
        sectionNumber={1}
        status="ready"
        onStart={onStart}
      />
    );

    fireEvent.press(getByText('Start Assessment →'));
    expect(onStart).toHaveBeenCalled();
  });

  it('shows warning for locked state', () => {
    const onStart = jest.fn();

    const { getByText } = render(
      <CalibratorBanner
        sectionNumber={1}
        status="locked"
        onStart={onStart}
      />
    );

    fireEvent.press(getByText('Locked'));
    // onStart should not be called for locked state
    // (component handles this internally with haptic warning)
  });
});
```

## Customization Examples

### Custom Section Numbers

```tsx
// For different learning paths
<CalibratorBanner
  sectionNumber={getCurrentSectionNumber()}
  status={status}
  onStart={handleStart}
/>
```

### Conditional Rendering

```tsx
{userProgress.stairsCompleted >= 7 && (
  <CalibratorBanner
    sectionNumber={1}
    status={getStatus()}
    onStart={handleStart}
  />
)}
```

### Multiple Banners (Different Sections)

```tsx
{sections.map(section => (
  <CalibratorBanner
    key={section.id}
    sectionNumber={section.number}
    status={section.calibrationStatus}
    onStart={() => handleStartCalibration(section.id)}
    completedAt={section.calibrationCompletedAt}
    score={section.calibrationScore}
  />
))}
```

## Common Issues & Solutions

### Issue: Animation not smooth
**Solution**: Ensure `react-native-reanimated` is properly configured in `babel.config.js`

### Issue: Banner doesn't respond to taps
**Solution**: Check parent ScrollView has proper touch handling

### Issue: Gradient not showing
**Solution**: Verify `expo-linear-gradient` is installed

### Issue: Haptics not working
**Solution**: Test on physical device (haptics don't work in simulator)

## Performance Optimization

### Memoization

```tsx
const CalibratorBannerMemo = React.memo(CalibratorBanner);

// Usage
<CalibratorBannerMemo
  sectionNumber={section}
  status={status}
  onStart={handleStart}
/>
```

### Conditional Rendering

```tsx
// Only render when needed
{showCalibrationBanner && (
  <CalibratorBanner {...props} />
)}
```

## Accessibility

```tsx
<CalibratorBanner
  sectionNumber={1}
  status="ready"
  onStart={handleStart}
  // Add these for better accessibility
  accessible={true}
  accessibilityLabel={`Calibration assessment for section 1, status: ready`}
  accessibilityHint="Double tap to start the assessment"
  accessibilityRole="button"
/>
```

## Next Steps

1. Create the CalibrationAssessment screen
2. Implement the scoring logic
3. Set up database schema for storing calibration results
4. Add analytics tracking for calibration events
5. Create retake flow with cooldown period (optional)
