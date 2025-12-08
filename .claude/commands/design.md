# Design Reference

Quick reference for Vox Language UI design system.

## Instructions

Read `docs/UI_DESIGN_SYSTEM.md` and provide design guidance.

## Quick Reference

### Color Palette (Dark Mode - Primary)

```
Background:    #0F172A (Slate 900)
Surface:       #1E293B (Slate 800)
Card:          #334155 (Slate 700)

Text:          #F1F5F9 (Slate 100)
Text Muted:    #94A3B8 (Slate 400)

Primary:       #3B82F6 (Blue 500)
Success:       #10B981 (Green 500)
Error:         #EF4444 (Red 500)
Warning:       #F59E0B (Amber 500)
```

### Spacing Scale (Tailwind)
- `p-1` = 4px
- `p-2` = 8px
- `p-4` = 16px
- `p-6` = 24px
- `p-8` = 32px

### Typography
- Headings: `font-bold`
- `text-4xl` = 36px (h1)
- `text-2xl` = 24px (h3)
- `text-base` = 16px (body)
- `text-sm` = 14px (small)

### Component Patterns

**Card**:
```tsx
<View className="bg-slate-800 rounded-2xl p-4 shadow-lg">
  {/* content */}
</View>
```

**Button Primary**:
```tsx
<TouchableOpacity className="bg-blue-500 py-4 px-6 rounded-xl">
  <Text className="text-white font-semibold text-center">
    Button Text
  </Text>
</TouchableOpacity>
```

**Input**:
```tsx
<TextInput
  className="bg-slate-700 text-white p-4 rounded-xl border border-slate-600"
  placeholderTextColor="#94A3B8"
/>
```

### Animation Guidelines
- Duration: 200-400ms
- Use spring physics: `withSpring(value, { damping: 15 })`
- Always 60fps

### Existing Components
Location: `/components/ui/tamagui/`
- Button, Card, Input, Stack (XStack/YStack)

### Design Principles
1. **Dark mode first** - Light mode secondary
2. **Smooth animations** - Everything animates
3. **Touch targets** - Minimum 44x44px
4. **Accessible** - All buttons have labels
5. **Premium feel** - No cheap-looking elements

## If Asked About Specific Screen

Reference the wireframes in `docs/UI_DESIGN_SYSTEM.md` or `docs/claude.md` for:
- Home Screen layout
- Flashcard designs
- Session summary
- Onboarding flow
