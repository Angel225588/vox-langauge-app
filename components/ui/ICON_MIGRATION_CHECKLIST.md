# Icon System Migration Checklist

Use this checklist to migrate existing icon usage to the new centralized Icon system.

## Pre-Migration

- [ ] Read `Icon.README.md` for comprehensive documentation
- [ ] Review `Icon.examples.tsx` for code examples
- [ ] Test the demo screen at `/icon-demo` to see all variants
- [ ] Check `ICON_QUICK_REFERENCE.md` for quick syntax lookup

## Migration Steps

### Step 1: Identify Current Icon Usage

Search for direct Ionicons usage in your codebase:

```bash
# Find all Ionicons imports
grep -r "from '@expo/vector-icons'" --include="*.tsx" --include="*.ts"

# Find Ionicons components
grep -r "<Ionicons" --include="*.tsx"
```

### Step 2: Update Imports

**Before:**
```tsx
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/designSystem';
```

**After:**
```tsx
import { Icon, IconButton } from '@/components/ui';
```

### Step 3: Replace Icon Components

#### Simple Icons

**Before:**
```tsx
<Ionicons name="checkmark" size={24} color={colors.success.DEFAULT} />
```

**After:**
```tsx
<Icon name="checkmark" size="lg" color="success" />
```

#### Touchable Icons

**Before:**
```tsx
<TouchableOpacity onPress={handlePress}>
  <Ionicons name="settings" size={24} color={colors.text.secondary} />
</TouchableOpacity>
```

**After:**
```tsx
<IconButton
  name="settings"
  onPress={handlePress}
  accessibilityLabel="Settings"
/>
```

#### Custom Sizes

**Before:**
```tsx
<Ionicons name="star" size={28} color="#FFC107" />
```

**After:**
```tsx
<Icon name="star" size={28} color="warning" />
```

### Step 4: Size Mapping

| Old Size (px) | New Size Variant | Actual Size |
|---------------|------------------|-------------|
| 12-16 | `sm` | 16px |
| 18-22 | `md` | 20px |
| 24-28 | `lg` | 24px |
| 30-36 | `xl` | 32px |
| Other | Use number directly | Custom |

### Step 5: Color Mapping

| Old Color | New Color Variant |
|-----------|-------------------|
| `colors.primary.DEFAULT` | `"primary"` |
| `colors.success.DEFAULT` | `"success"` |
| `colors.error.DEFAULT` | `"error"` |
| `colors.warning.DEFAULT` | `"warning"` |
| `colors.text.primary` | `"text-primary"` |
| `colors.text.secondary` | `"text-secondary"` |
| Custom hex | Keep as string |

### Step 6: Add Accessibility

For all `IconButton` components, add accessibility labels:

```tsx
<IconButton
  name="play"
  onPress={handlePlay}
  accessibilityLabel="Play lesson audio"  // Add this
  accessibilityHint="Plays the audio for this lesson"  // Optional
/>
```

### Step 7: Update Tests

**Before:**
```tsx
const icon = screen.getByTestId('icon');
expect(icon.props.name).toBe('checkmark');
```

**After:**
```tsx
const button = screen.getByA11yLabel('Settings button');
expect(button).toBeTruthy();
```

## Common Patterns

### Pattern 1: Header Navigation

**Before:**
```tsx
<View style={styles.header}>
  <TouchableOpacity onPress={() => router.back()}>
    <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
  </TouchableOpacity>
  <Text>Title</Text>
</View>
```

**After:**
```tsx
<View style={styles.header}>
  <IconButton
    name="chevron-back"
    onPress={() => router.back()}
    variant="ghost"
    accessibilityLabel="Go back"
  />
  <Text>Title</Text>
</View>
```

### Pattern 2: Status Icons

**Before:**
```tsx
{isComplete && (
  <Ionicons name="checkmark-circle" size={20} color={colors.success.DEFAULT} />
)}
```

**After:**
```tsx
{isComplete && (
  <Icon name="checkmark-circle" size="md" color="success" />
)}
```

### Pattern 3: Action Buttons

**Before:**
```tsx
<TouchableOpacity
  onPress={handlePlay}
  style={styles.playButton}
>
  <Ionicons name="play" size={32} color="#FFFFFF" />
</TouchableOpacity>
```

**After:**
```tsx
<IconButton
  name="play"
  size="xl"
  variant="filled"
  backgroundColor="primary"
  onPress={handlePlay}
  accessibilityLabel="Play"
/>
```

### Pattern 4: Conditional Icons

**Before:**
```tsx
<Ionicons
  name={isPlaying ? "pause" : "play"}
  size={24}
  color={colors.primary.DEFAULT}
/>
```

**After:**
```tsx
<Icon
  name={isPlaying ? "pause" : "play"}
  size="lg"
  color="primary"
/>
```

## Testing Checklist

After migration, verify:

- [ ] All icons render correctly
- [ ] Icon sizes are consistent with design
- [ ] Colors match the design system
- [ ] Touch targets are at least 44x44px
- [ ] Haptic feedback works on button press
- [ ] Accessibility labels are present and accurate
- [ ] Animations are smooth (60fps)
- [ ] Icons work in both light and dark modes (if applicable)

## File-by-File Checklist

Create a list of files to migrate:

### High Priority (User-facing screens)
- [ ] `app/(tabs)/index.tsx` - Home screen
- [ ] `app/(tabs)/lessons.tsx` - Lessons screen
- [ ] `app/(tabs)/profile.tsx` - Profile screen
- [ ] Navigation headers
- [ ] Card components

### Medium Priority (Component library)
- [ ] `components/cards/*.tsx` - Card components
- [ ] `components/ui/*.tsx` - UI components
- [ ] Modal/Dialog components
- [ ] Form components

### Low Priority (Admin/Dev screens)
- [ ] Settings screens
- [ ] Debug screens
- [ ] Demo screens

## Post-Migration

- [ ] Remove unused Ionicons imports
- [ ] Update component documentation
- [ ] Run type checking: `npx tsc --noEmit`
- [ ] Run tests: `npm test`
- [ ] Test on iOS and Android devices
- [ ] Update team documentation
- [ ] Create PR with migration changes

## Rollback Plan

If issues arise, you can easily rollback:

1. The Icon system doesn't modify existing code
2. Direct Ionicons usage still works
3. Gradually migrate files one at a time
4. Keep both approaches until fully migrated

## Benefits After Migration

✅ Consistent icon sizing across the app
✅ Type-safe icon names and colors
✅ Better accessibility support
✅ Easier maintenance and updates
✅ Improved developer experience
✅ Better code readability
✅ Centralized icon management

## Common Issues & Solutions

### Issue: Icon not showing
**Solution:** Check if icon name exists in Ionicons. Use common icon names or check [Ionicons directory](https://ionic.io/ionicons).

### Issue: Wrong size
**Solution:** Verify size variant mapping. Use custom number if needed.

### Issue: Wrong color
**Solution:** Check color variant mapping in `ICON_COLORS`. Use custom hex if needed.

### Issue: TypeScript errors
**Solution:** Import types: `import type { IconProps } from '@/components/ui';`

### Issue: Button not responding
**Solution:** Ensure `onPress` prop is provided and function is valid.

### Issue: No haptic feedback
**Solution:** Check device settings, or set `haptics={true}` explicitly.

## Need Help?

- **Documentation**: `components/ui/Icon.README.md`
- **Examples**: `components/ui/Icon.examples.tsx`
- **Quick Reference**: `components/ui/ICON_QUICK_REFERENCE.md`
- **Demo**: Navigate to `/icon-demo`
- **Source**: `components/ui/Icon.tsx`, `components/ui/IconButton.tsx`

## Estimated Migration Time

- **Single file**: 5-10 minutes
- **Component folder**: 30-60 minutes
- **Full app**: 2-4 hours (depending on size)

Migrate incrementally for best results!
