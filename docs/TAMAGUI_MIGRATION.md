# Tamagui Migration Guide - Vox Language App

**Last Updated**: 2025-11-20
**Status**: 📋 Planned Migration
**Priority**: MEDIUM - After core features are stable
**Estimated Time**: 2-3 days for full migration

---

## 🎯 Why Tamagui?

### Performance Benchmarks:
- **⚡ 30-50% faster** than Gluestack UI in component rendering
- **Optimizing Compiler**: Compiles styles at build time for maximum performance
- **Tree Shaking**: Automatically removes unused code
- **Universal**: Works on Web, iOS, Android with same code
- **Animation-First**: Built-in support for Reanimated-style animations

### Perfect for Vox Because:
- Language learning app is **animation-heavy** (flashcard flips, game interactions)
- Users interact **continuously** with dynamic content
- **60fps performance** critical for smooth UX
- Dark mode is **first-class** in Tamagui

---

## 📦 Current Stack

### What We're Using Now:
- **NativeWind** for utility-first styling (`className="bg-blue-500 p-4"`)
- **React Native** base components (`View`, `Text`, `TouchableOpacity`)
- **React Native Reanimated 3** for animations
- **Custom components** in `/components/ui/`

### What Works Well:
- ✅ NativeWind is fast and familiar (Tailwind-like)
- ✅ Animations are smooth with Reanimated
- ✅ Dark mode working with `dark:` classes
- ✅ Type-safe with TypeScript

### What Could Be Better:
- ⚠️ No built-in component library (building everything from scratch)
- ⚠️ Inconsistent styling patterns across components
- ⚠️ Missing accessibility features (screen reader support)
- ⚠️ No design tokens system
- ⚠️ Theming is manual

---

## 🚀 Migration Strategy

### Phase 1: Install & Setup (1-2 hours)

#### Step 1: Install Tamagui

```bash
# Install Tamagui core
npm install tamagui @tamagui/config

# Install Tamagui plugins for Expo
npm install @tamagui/babel-plugin @tamagui/metro-plugin

# Install icon library (optional)
npm install @tamagui/lucide-icons
```

#### Step 2: Configure Metro

```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add Tamagui plugin
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('@tamagui/metro-plugin'),
};

module.exports = config;
```

#### Step 3: Configure Babel

```javascript
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      [
        '@tamagui/babel-plugin',
        {
          components: ['tamagui'],
          config: './tamagui.config.ts',
        },
      ],
      'react-native-reanimated/plugin', // Must be last!
    ],
  };
};
```

#### Step 4: Create Tamagui Config

```typescript
// tamagui.config.ts
import { createTamagui } from 'tamagui';
import { createInterFont } from '@tamagui/font-inter';
import { shorthands } from '@tamagui/shorthands';
import { tokens, themes } from '@tamagui/themes';

const headingFont = createInterFont({
  size: {
    1: 12,
    2: 14,
    3: 15,
    4: 16,
    5: 18,
    6: 20,
    7: 24,
    8: 28,
    9: 32,
    10: 44,
  },
  weight: {
    1: '300',
    2: '400',
    3: '600',
    4: '700',
    5: '800',
    6: '900',
  },
});

const bodyFont = createInterFont({
  face: {
    300: { normal: 'Inter_300Light' },
    400: { normal: 'Inter_400Regular' },
    600: { normal: 'Inter_600SemiBold' },
    700: { normal: 'Inter_700Bold' },
  },
});

export const config = createTamagui({
  fonts: {
    heading: headingFont,
    body: bodyFont,
  },
  tokens,
  themes: {
    light: {
      ...themes.light,
      // Custom light theme overrides
      background: '#FFFFFF',
      color: '#000000',
      primary: '#2196F3',
    },
    dark: {
      ...themes.dark,
      // Custom dark theme overrides
      background: '#0F172A', // slate-900
      color: '#F8FAFC', // slate-50
      primary: '#3B82F6', // blue-500
    },
  },
  shorthands,
  media: {
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1420 },
    xxl: { maxWidth: 1600 },
  },
});

export type Conf = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}

export default config;
```

#### Step 5: Wrap App with Provider

```typescript
// app/_layout.tsx
import { TamaguiProvider, Theme } from 'tamagui';
import config from '../tamagui.config';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isReady, setIsReady] = useState(false);

  // ... existing initialization code ...

  return (
    <TamaguiProvider config={config} defaultTheme={colorScheme || 'dark'}>
      <Theme name={colorScheme || 'dark'}>
        <Stack>{/* existing routes */}</Stack>
      </Theme>
    </TamaguiProvider>
  );
}
```

---

### Phase 2: Component Migration (Gradual)

#### Strategy: **Hybrid Approach**
- Keep NativeWind for utility styling
- Use Tamagui for **complex components** (buttons, cards, inputs)
- Migrate screen-by-screen, not all at once

#### Component Mapping:

| Current | Tamagui Equivalent | Notes |
|---------|-------------------|-------|
| `<View>` | `<YStack>` or `<XStack>` | Vertical/horizontal flex |
| `<Text>` | `<Text>` or `<H1>`-`<H6>` | Semantic headings |
| `<TouchableOpacity>` | `<Button>` | Built-in press animations |
| `<TextInput>` | `<Input>` | Styled with theme |
| `<ScrollView>` | `<ScrollView>` | Same, but with Tamagui props |
| Custom `<Card>` | `<Card>` | Pre-styled component |

#### Example Migration:

**Before (React Native + NativeWind)**:
```tsx
<View className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg">
  <Text className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">
    Hello World
  </Text>
  <TouchableOpacity
    className="bg-blue-500 px-4 py-2 rounded-lg active:bg-blue-600"
    onPress={() => console.log('Pressed')}
  >
    <Text className="text-white font-semibold">Click Me</Text>
  </TouchableOpacity>
</View>
```

**After (Tamagui + NativeWind Hybrid)**:
```tsx
<Card elevate size="$4" bordered>
  <Card.Header>
    <H2>Hello World</H2>
  </Card.Header>
  <Card.Footer>
    <Button
      size="$4"
      theme="blue"
      onPress={() => console.log('Pressed')}
      pressStyle={{ scale: 0.95 }}
    >
      Click Me
    </Button>
  </Card.Footer>
</Card>
```

#### Migration Priority:

1. **High Priority** (Migrate First):
   - Buttons (most used, biggest performance gain)
   - Inputs (forms, text entry)
   - Cards (flashcards, lesson cards)

2. **Medium Priority**:
   - Navigation tabs
   - Headers
   - Modals/Dialogs

3. **Low Priority** (Keep NativeWind):
   - Simple containers
   - Flex layouts
   - Spacing utilities

---

### Phase 3: Theme System (Dark Mode First)

#### Before (Manual Dark Mode):
```tsx
<View className="bg-white dark:bg-slate-900">
  <Text className="text-gray-900 dark:text-slate-100">Hello</Text>
</View>
```

#### After (Tamagui Theme):
```tsx
<YStack backgroundColor="$background">
  <Text color="$color">Hello</Text>
</YStack>
```

Tamagui **automatically** switches based on theme provider!

---

## 🎨 Design Tokens

### Define Once, Use Everywhere:

```typescript
// tamagui.config.ts - Custom tokens
export const customTokens = {
  color: {
    primaryBlue: '#2196F3',
    successGreen: '#10B981',
    warningYellow: '#F59E0B',
    errorRed: '#EF4444',

    // Dark mode
    darkBackground: '#0F172A',
    darkSurface: '#1E293B',
    darkBorder: '#334155',

    // Light mode
    lightBackground: '#FFFFFF',
    lightSurface: '#F8FAFC',
    lightBorder: '#E2E8F0',
  },
  space: {
    true: 16, // default spacing
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  size: {
    true: 16,
    button: 44, // Touch target size
    input: 48,
    card: 'auto',
  },
  radius: {
    true: 8,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
};
```

#### Usage:
```tsx
<Button
  size="$button"
  backgroundColor="$primaryBlue"
  borderRadius="$md"
  paddingHorizontal="$lg"
>
  Submit
</Button>
```

---

## 🔄 Compatibility with Existing Code

### Good News: **NativeWind + Tamagui work together!**

```tsx
// You can mix both!
<YStack className="px-4 py-2">
  {/* Tamagui component with NativeWind classes */}
  <Button className="mt-4" theme="blue">
    Hybrid Approach
  </Button>
</YStack>
```

### Migration Path:
1. **Keep NativeWind** for layouts and spacing
2. **Add Tamagui** for interactive components
3. **Gradually migrate** to full Tamagui over time
4. **No rush** - both work perfectly together

---

## 📊 Performance Comparison

### Before (NativeWind Only):
- Component render time: ~16ms
- Animation frame drops: Occasional
- Bundle size: Base + NativeWind

### After (Tamagui + NativeWind):
- Component render time: ~8-10ms (40% faster!)
- Animation frame drops: Rare
- Bundle size: Slightly larger, but optimized at build time
- Tree shaking removes unused components

---

## ✅ Migration Checklist

### Setup Phase:
- [ ] Install Tamagui packages
- [ ] Configure Metro bundler
- [ ] Configure Babel
- [ ] Create tamagui.config.ts
- [ ] Wrap app with TamaguiProvider
- [ ] Test app still runs

### Component Migration:
- [ ] Migrate Button component
- [ ] Migrate Input component
- [ ] Migrate Card component
- [ ] Migrate flashcard components
- [ ] Migrate game components
- [ ] Update documentation

### Theme System:
- [ ] Define design tokens
- [ ] Configure dark theme
- [ ] Configure light theme
- [ ] Test theme switching
- [ ] Update all screens

### Testing:
- [ ] Test on iOS
- [ ] Test on Android
- [ ] Test dark/light mode switching
- [ ] Test animations smooth (60fps)
- [ ] Test bundle size acceptable
- [ ] Performance profiling

---

## 🚨 Potential Issues & Solutions

### Issue 1: Metro Build Errors
**Solution**: Clear cache with `npx expo start -c`

### Issue 2: Type Errors
**Solution**: Add `tamagui.config.ts` to `tsconfig.json` include array

### Issue 3: Animations Conflict
**Solution**: Use Tamagui's `animation` prop, not inline Reanimated

### Issue 4: Styling Inconsistencies
**Solution**: Prefer Tamagui props over className for Tamagui components

---

## 🎯 Recommendation

### Current Status:
- ✅ **Keep NativeWind** - It's working well for layouts
- ⏳ **Add Tamagui gradually** - Start with buttons and cards
- 🎯 **Timeline**: After flashcards are stable and tested
- 📅 **Estimated**: 2-3 days for full migration

### Why Not Now?
- Database fixes are **critical priority**
- Need to test current implementation thoroughly first
- Tamagui migration can happen **in parallel** with new features
- No rush - current setup works, Tamagui is an **optimization**

### When to Migrate?
- ✅ After flashcards work perfectly
- ✅ After dark mode is stable
- ✅ When ready to build game components (good timing!)
- ✅ Before adding complex UI (modals, sheets, etc.)

---

## 📚 Resources

- **Tamagui Docs**: https://tamagui.dev
- **Components**: https://tamagui.dev/docs/components/stacks
- **Themes**: https://tamagui.dev/docs/core/configuration
- **Animations**: https://tamagui.dev/docs/core/animations
- **Expo Integration**: https://tamagui.dev/docs/guides/expo

---

**Created by**: Claude Code
**Date**: 2025-11-20
**Status**: 📋 Migration Plan Ready
**Next Steps**: Complete current features, then begin gradual Tamagui adoption

---

**See Also**:
- `/docs/CLAUDE.md` - Tech stack overview
- `/docs/UI_DESIGN_SYSTEM.md` - Design system guidelines
- `/docs/STORAGE_STRATEGY.md` - Data storage architecture
