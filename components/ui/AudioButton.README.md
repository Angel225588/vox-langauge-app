# AudioButton Component

A unified audio control component for consistent audio playback across the Vox Language App.

## Features

- **Two Variants**: Normal speed (`play`) and slow speed (`slow` - 0.5x)
- **Multiple States**: Idle, playing, and loading
- **Animations**: Pulse ring animation when playing, button scale on press
- **Haptic Feedback**: Light haptic feedback on button press
- **Flexible Sizing**: Three sizes (sm: 36px, md: 48px, lg: 56px)
- **Neomorphic Design**: Follows the app's design system with primary color accent
- **Accessibility**: Supports disabled state

## Usage

### Basic Example

```tsx
import { AudioButton } from '@/components/ui';

function MyAudioCard() {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    // Your audio playback logic here
  };

  return (
    <AudioButton
      variant="play"
      isPlaying={isPlaying}
      onPress={handlePlay}
      size="md"
    />
  );
}
```

### Slow Playback

```tsx
<AudioButton
  variant="slow"
  isPlaying={isSlowPlaying}
  onPress={handleSlowPlay}
  size="md"
/>
```

### Loading State

```tsx
<AudioButton
  variant="play"
  isLoading={true}
  onPress={handlePlay}
  size="md"
/>
```

### Different Sizes

```tsx
<View style={{ flexDirection: 'row', gap: 16 }}>
  <AudioButton variant="play" onPress={handlePlay} size="sm" />
  <AudioButton variant="play" onPress={handlePlay} size="md" />
  <AudioButton variant="play" onPress={handlePlay} size="lg" />
</View>
```

### Audio Controls Pattern (Common Use Case)

```tsx
import { AudioButton } from '@/components/ui';

function ListeningCard() {
  const [isPlayingNormal, setIsPlayingNormal] = useState(false);
  const [isPlayingSlow, setIsPlayingSlow] = useState(false);

  return (
    <View style={styles.audioControls}>
      <AudioButton
        variant="play"
        size="md"
        isPlaying={isPlayingNormal}
        onPress={() => playAudio(1.0)}
      />
      <AudioButton
        variant="slow"
        size="md"
        isPlaying={isPlayingSlow}
        onPress={() => playAudio(0.5)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    padding: 16,
    borderRadius: 24,
    gap: 16,
  },
});
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `variant` | `'play' \| 'slow'` | Yes | - | Button variant - 'play' for normal speed, 'slow' for 0.5x speed |
| `isPlaying` | `boolean` | No | `false` | Whether audio is currently playing |
| `isLoading` | `boolean` | No | `false` | Whether audio is loading |
| `onPress` | `() => void` | Yes | - | Callback when button is pressed |
| `size` | `'sm' \| 'md' \| 'lg'` | No | `'md'` | Button size (sm: 36px, md: 48px, lg: 56px) |
| `disabled` | `boolean` | No | `false` | Whether button is disabled |
| `style` | `ViewStyle` | No | - | Additional custom styles |

## Visual States

### Idle State
- Elevated background with border
- Primary color icon
- No animation

### Playing State
- Primary color background
- White icon (pause)
- Pulse ring animation
- Primary glow shadow

### Loading State
- Shows ActivityIndicator
- No icon
- No animation

### Disabled State
- Reduced opacity (0.5)
- No haptic feedback
- Inactive icon color

## Animations

1. **Button Press**: Scale animation (0.9 → 1.0) with spring physics
2. **Pulse Ring**: Continuous scale and opacity animation when playing
3. **State Transitions**: Smooth spring animations

## Design Tokens Used

- `colors.primary.DEFAULT` - Main accent color
- `colors.background.elevated` - Button background
- `colors.border.light` - Border color
- `shadows.md` - Default shadow
- `shadows.glow.primary` - Active state glow
- `borderRadius.full` - Circular button shape

## Integration with Existing Cards

Replace inline audio buttons in:
- `ListeningCard.tsx`
- `AudioQuizCard.tsx`
- `IntroductionCard.tsx`
- `VocabularyCardFlow.tsx`
- Any other cards with audio playback

### Before

```tsx
<TouchableOpacity
  onPress={() => handlePlayAudio(false)}
  style={[styles.audioButton, isPlaying && styles.audioButtonActive]}
>
  <Ionicons name={isPlaying ? "pause" : "play"} size={24} color={...} />
</TouchableOpacity>
```

### After

```tsx
<AudioButton
  variant="play"
  isPlaying={isPlaying}
  onPress={() => handlePlayAudio(false)}
  size="md"
/>
```

## Examples

See `AudioButton.example.tsx` for comprehensive usage examples.
