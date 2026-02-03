# Skeleton Loader Components

A comprehensive set of animated skeleton loader components with shimmer effect for the Vox Language App. These components provide smooth loading states that match the app's design system.

## Features

- **Smooth Animations**: Uses React Native Reanimated for 60fps animations
- **Shimmer Effect**: Left-to-right shimmer using expo-linear-gradient
- **Design System Integration**: Uses tokens from `constants/designSystem.ts`
- **Flexible Composition**: Build custom loading states with basic components
- **Pre-composed Components**: Ready-to-use card, list, and button skeletons
- **TypeScript Support**: Full type definitions included

## Components

### SkeletonBox

Basic rectangular skeleton with shimmer animation.

```tsx
import { SkeletonBox } from '@/components/ui/Skeleton';

// Basic usage
<SkeletonBox width={200} height={20} />

// Full width
<SkeletonBox width="100%" height={100} />

// Custom border radius
<SkeletonBox width={150} height={150} borderRadius={24} />
```

**Props:**
- `width?: number | string` - Width in pixels or percentage (default: `"100%"`)
- `height?: number | string` - Height in pixels or percentage (default: `20`)
- `borderRadius?: number` - Border radius (default: `borderRadius.sm`)
- `style?: ViewStyle` - Additional styles

---

### SkeletonText

Text line skeleton with configurable number of lines.

```tsx
import { SkeletonText } from '@/components/ui/Skeleton';

// Single line
<SkeletonText />

// Multiple lines
<SkeletonText lines={3} />

// Custom last line width
<SkeletonText lines={3} lastLineWidth="60%" />

// Custom line height and spacing
<SkeletonText
  lines={4}
  lineHeight={18}
  lineSpacing={12}
/>
```

**Props:**
- `lines?: number` - Number of lines (default: `1`)
- `lastLineWidth?: number | string` - Width of last line (default: `"80%"`)
- `lineSpacing?: number` - Space between lines (default: `spacing.sm`)
- `lineHeight?: number` - Height of each line (default: `16`)
- `width?: number | string` - Width of all lines (default: `"100%"`)
- `style?: ViewStyle` - Additional styles for container

---

### SkeletonCircle

Circular skeleton for avatars and circular images.

```tsx
import { SkeletonCircle } from '@/components/ui/Skeleton';

// Default size (48px)
<SkeletonCircle />

// Custom size
<SkeletonCircle size={80} />

// Multiple sizes
<View style={{ flexDirection: 'row' }}>
  <SkeletonCircle size={40} />
  <SkeletonCircle size={60} />
  <SkeletonCircle size={80} />
</View>
```

**Props:**
- `size?: number` - Diameter of circle (default: `48`)
- `style?: ViewStyle` - Additional styles

---

### SkeletonCard

Pre-composed card skeleton with optional image, avatar, and text lines.

```tsx
import { SkeletonCard } from '@/components/ui/Skeleton';

// Default card with image and 3 text lines
<SkeletonCard />

// Card without image
<SkeletonCard showImage={false} lines={2} />

// Card with avatar
<SkeletonCard showAvatar lines={3} />

// Custom image height
<SkeletonCard imageHeight={200} />

// All options
<SkeletonCard
  showImage
  showAvatar
  imageHeight={180}
  lines={4}
/>
```

**Props:**
- `showImage?: boolean` - Show image area (default: `true`)
- `imageHeight?: number` - Image height (default: `160`)
- `lines?: number` - Number of text lines (default: `3`)
- `showAvatar?: boolean` - Show avatar (default: `false`)
- `style?: ViewStyle` - Additional styles

---

### SkeletonList

Pre-composed list item skeleton with optional avatars or thumbnails.

```tsx
import { SkeletonList } from '@/components/ui/Skeleton';

// Default list (3 items with avatars)
<SkeletonList />

// Custom count
<SkeletonList count={5} />

// With thumbnails instead of avatars
<SkeletonList count={4} showAvatar={false} showThumbnail />

// Without avatar or thumbnail
<SkeletonList count={3} showAvatar={false} />
```

**Props:**
- `count?: number` - Number of list items (default: `3`)
- `showAvatar?: boolean` - Show circular avatar (default: `true`)
- `showThumbnail?: boolean` - Show square thumbnail (default: `false`)
- `style?: ViewStyle` - Additional styles

---

### SkeletonButton

Button-shaped skeleton.

```tsx
import { SkeletonButton } from '@/components/ui/Skeleton';

// Full width button
<SkeletonButton />

// Custom width and height
<SkeletonButton width={200} height={48} />

// Percentage width
<SkeletonButton width="80%" height={56} />
```

**Props:**
- `width?: number | string` - Width (default: `"100%"`)
- `height?: number` - Height (default: `48`)
- `style?: ViewStyle` - Additional styles

---

## Usage Examples

### Loading Vocabulary Card

```tsx
import { SkeletonBox, SkeletonText, SkeletonButton } from '@/components/ui/Skeleton';

function LoadingVocabularyCard() {
  return (
    <View style={styles.card}>
      <SkeletonBox width="100%" height={200} />
      <View style={{ marginTop: 16 }}>
        <SkeletonBox width="60%" height={24} />
        <SkeletonText lines={2} style={{ marginTop: 12 }} />
      </View>
      <SkeletonButton style={{ marginTop: 24 }} />
    </View>
  );
}
```

### Loading Lesson List

```tsx
import { SkeletonBox, SkeletonText } from '@/components/ui/Skeleton';

function LoadingLessonList() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <View key={index} style={styles.lessonItem}>
          <SkeletonBox width={60} height={60} borderRadius={12} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <SkeletonBox width="70%" height={18} />
            <SkeletonBox width="90%" height={14} style={{ marginTop: 6 }} />
          </View>
        </View>
      ))}
    </>
  );
}
```

### Loading Profile Header

```tsx
import { SkeletonCircle, SkeletonBox } from '@/components/ui/Skeleton';

function LoadingProfileHeader() {
  return (
    <View style={styles.header}>
      <SkeletonCircle size={100} />
      <SkeletonBox width={150} height={24} style={{ marginTop: 16 }} />
      <SkeletonBox width={200} height={16} style={{ marginTop: 8 }} />

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <SkeletonBox width={60} height={24} />
          <SkeletonBox width={80} height={14} style={{ marginTop: 4 }} />
        </View>
        <View style={styles.stat}>
          <SkeletonBox width={60} height={24} />
          <SkeletonBox width={80} height={14} style={{ marginTop: 4 }} />
        </View>
      </View>
    </View>
  );
}
```

### Conditional Loading State

```tsx
import { SkeletonCard } from '@/components/ui/Skeleton';
import { VocabularyCard } from '@/components/cards/VocabularyCard';

function LessonScreen() {
  const { data, isLoading } = useLessonData();

  if (isLoading) {
    return <SkeletonCard />;
  }

  return <VocabularyCard data={data} />;
}
```

### Custom Composition

```tsx
import { SkeletonBox, SkeletonCircle, SkeletonText, SkeletonButton } from '@/components/ui/Skeleton';

function CustomSkeletonCard() {
  return (
    <View style={styles.card}>
      {/* Header with avatar and title */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <SkeletonCircle size={56} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <SkeletonBox width="70%" height={18} />
          <SkeletonBox width="50%" height={14} style={{ marginTop: 6 }} />
        </View>
      </View>

      {/* Content */}
      <View style={{ marginTop: 16 }}>
        <SkeletonText lines={3} />
      </View>

      {/* Actions */}
      <View style={{ flexDirection: 'row', marginTop: 16 }}>
        <SkeletonButton width={100} height={36} />
        <SkeletonButton width={100} height={36} style={{ marginLeft: 8 }} />
      </View>
    </View>
  );
}
```

## Design System Integration

The skeleton components use the following design system tokens:

- **Base Color**: `colors.background.elevated` (#222845)
- **Shimmer Color**: #2A3050 (slightly lighter)
- **Border Radius**: `borderRadius.sm`, `borderRadius.md`, `borderRadius.lg`
- **Spacing**: `spacing.xs`, `spacing.sm`, `spacing.md`, etc.
- **Card Background**: `colors.background.card`

## Animation Details

- **Duration**: 1500ms per cycle
- **Easing**: Linear
- **Loop**: Infinite
- **Direction**: Left to right
- **Effect**: Shimmer gradient overlay

The shimmer effect uses a 5-stop gradient:
1. Transparent
2. Semi-transparent
3. Most opaque (80%)
4. Semi-transparent
5. Transparent

This creates a smooth, natural-looking shimmer that travels across the skeleton.

## Performance Considerations

- Uses React Native Reanimated for native-thread animations (60fps)
- Lightweight gradient implementation
- Minimal re-renders
- Efficient for large lists (use with `FlatList` or `FlashList`)

## Testing

Tests are included in `__tests__/Skeleton.test.tsx`. Run tests with:

```bash
npm test Skeleton.test.tsx
```

## Examples File

See `Skeleton.example.tsx` for a complete showcase of all skeleton components and usage patterns. You can use this file as a reference or import specific examples into your Storybook/dev screens.

## Migration Guide

If you're replacing existing loading states:

### Before (Placeholder)
```tsx
<View style={{ width: 200, height: 20, backgroundColor: '#333' }} />
```

### After (Skeleton)
```tsx
<SkeletonBox width={200} height={20} />
```

### Before (Multiple placeholders)
```tsx
<>
  <View style={{ width: '100%', height: 16, backgroundColor: '#333', marginBottom: 8 }} />
  <View style={{ width: '100%', height: 16, backgroundColor: '#333', marginBottom: 8 }} />
  <View style={{ width: '80%', height: 16, backgroundColor: '#333' }} />
</>
```

### After (Skeleton)
```tsx
<SkeletonText lines={3} />
```

## Browser Support

- iOS 13+
- Android 5.0+ (API 21+)
- React Native 0.70+
- Expo SDK 47+

## Dependencies

- `react-native-reanimated`: ^4.1.1
- `expo-linear-gradient`: ^15.0.7

Both are already included in the Vox Language App.

## Credits

Designed and implemented for the Vox Language App following the design system in `constants/designSystem.ts`.
