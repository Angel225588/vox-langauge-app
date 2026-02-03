# Skeleton Loader Quick Reference

## 🎯 Quick Imports

```tsx
import {
  SkeletonBox,
  SkeletonText,
  SkeletonCircle,
  SkeletonCard,
  SkeletonList,
  SkeletonButton,
} from '@/components/ui/Skeleton';
```

## 📦 Component Quick Reference

| Component | Use For | Common Props |
|-----------|---------|--------------|
| `SkeletonBox` | Any rectangle | `width`, `height`, `borderRadius` |
| `SkeletonText` | Text paragraphs | `lines`, `lineHeight`, `lastLineWidth` |
| `SkeletonCircle` | Avatars, icons | `size` |
| `SkeletonCard` | Full cards | `showImage`, `showAvatar`, `lines` |
| `SkeletonList` | Lists | `count`, `showAvatar`, `showThumbnail` |
| `SkeletonButton` | Buttons | `width`, `height` |

## ⚡ Quick Examples

### Basic Loading State
```tsx
{isLoading ? <SkeletonCard /> : <ActualCard data={data} />}
```

### Custom Layout
```tsx
<View style={{ flexDirection: 'row' }}>
  <SkeletonCircle size={48} />
  <View style={{ flex: 1, marginLeft: 12 }}>
    <SkeletonBox width="70%" height={18} />
    <SkeletonText lines={2} />
  </View>
</View>
```

### List Loading
```tsx
{isLoading ? (
  <SkeletonList count={5} />
) : (
  items.map(item => <ListItem key={item.id} item={item} />)
)}
```

## 🎨 Common Patterns

### Profile Header
```tsx
<SkeletonCircle size={80} />
<SkeletonBox width={150} height={24} style={{ marginTop: 12 }} />
<SkeletonBox width={200} height={16} style={{ marginTop: 8 }} />
```

### Article
```tsx
<SkeletonBox width="90%" height={28} /> {/* Title */}
<SkeletonBox width={120} height={14} style={{ marginTop: 8 }} /> {/* Author */}
<SkeletonText lines={8} style={{ marginTop: 24 }} /> {/* Content */}
```

### Form
```tsx
<SkeletonBox width="100%" height={48} /> {/* Input */}
<SkeletonBox width="100%" height={48} style={{ marginTop: 12 }} />
<SkeletonBox width="100%" height={120} style={{ marginTop: 12 }} /> {/* Textarea */}
<SkeletonButton style={{ marginTop: 24 }} />
```

### Grid
```tsx
<View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
  {Array.from({ length: 6 }).map((_, i) => (
    <SkeletonBox
      key={i}
      width="48%"
      height={150}
      style={{ margin: '1%' }}
    />
  ))}
</View>
```

## 🔧 Customization Tips

### Match Your Design
```tsx
// Use your component's exact spacing and sizing
<SkeletonBox
  width={CARD_WIDTH}
  height={CARD_HEIGHT}
  borderRadius={YOUR_BORDER_RADIUS}
/>
```

### Multiple Variants
```tsx
// Different skeletons for different card types
{cardType === 'featured' ? (
  <SkeletonCard imageHeight={250} lines={4} />
) : (
  <SkeletonCard imageHeight={150} lines={2} />
)}
```

### Conditional Elements
```tsx
<View>
  <SkeletonBox width="100%" height={200} />
  {showStats && (
    <View style={{ flexDirection: 'row', marginTop: 16 }}>
      <SkeletonBox width={60} height={40} />
      <SkeletonBox width={60} height={40} style={{ marginLeft: 12 }} />
    </View>
  )}
</View>
```

## 🚀 Performance Tips

1. **Use FlatList's `ListEmptyComponent`**
   ```tsx
   <FlatList
     data={items}
     ListEmptyComponent={<SkeletonList count={10} />}
   />
   ```

2. **Memoize Skeleton Components**
   ```tsx
   const LoadingSkeleton = React.memo(() => <SkeletonCard />);
   ```

3. **Reuse Count with Array**
   ```tsx
   const SKELETON_COUNT = 5;
   Array.from({ length: SKELETON_COUNT }).map((_, i) => (
     <SkeletonBox key={i} />
   ))
   ```

## 🎭 Animation Details

- **Duration**: 1500ms
- **Effect**: Left-to-right shimmer
- **Colors**:
  - Base: `#222845` (colors.background.elevated)
  - Shimmer: `#2A3050` (lighter variant)

## 📱 Responsive Sizing

```tsx
// Percentage widths for responsive layouts
<SkeletonBox width="100%" height={80} />
<SkeletonBox width="80%" height={60} />
<SkeletonBox width="60%" height={40} />

// Fixed widths for consistent sizing
<SkeletonCircle size={48} />
<SkeletonBox width={200} height={100} />
```

## 🐛 Common Mistakes to Avoid

❌ **Don't** use string numbers:
```tsx
<SkeletonBox width="200" height="100" /> // Wrong
```

✅ **Do** use actual numbers or percentages:
```tsx
<SkeletonBox width={200} height={100} />   // Correct
<SkeletonBox width="80%" height={100} />   // Correct
```

❌ **Don't** forget keys in loops:
```tsx
{Array.from({ length: 5 }).map((_, i) => (
  <SkeletonBox /> // Missing key
))}
```

✅ **Do** add keys:
```tsx
{Array.from({ length: 5 }).map((_, i) => (
  <SkeletonBox key={i} />
))}
```

## 🔗 Related Files

- Implementation: `components/ui/Skeleton.tsx`
- Examples: `components/ui/Skeleton.example.tsx`
- Usage Patterns: `components/ui/Skeleton.usage-guide.tsx`
- Full Docs: `components/ui/Skeleton.README.md`
- Tests: `__tests__/Skeleton.test.tsx`

## 💡 Pro Tips

1. **Match skeleton to actual component dimensions** for smoothest transition
2. **Use `SkeletonCard` for quick prototypes**, customize later if needed
3. **Combine with React Suspense** for automatic loading states
4. **Test with slow network** to ensure skeletons appear correctly
5. **Keep skeleton simpler than actual content** - it's just a placeholder

## 🆘 Need Help?

- Check `Skeleton.example.tsx` for visual examples
- Check `Skeleton.usage-guide.tsx` for integration patterns
- Check `Skeleton.README.md` for full documentation
- Search for existing usage: `grep -r "SkeletonBox" app/`
