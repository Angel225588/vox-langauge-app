# UI Design System - Vox Language App

**Last Updated**: 2025-11-20
**Status**: 🎨 Planning Phase
**Priority**: HIGH (After core features work)

---

## 🎯 Design Vision

Create a **modern, accessible, beautiful** language learning app that:
- Prioritizes **dark mode** (with light mode support)
- Uses **smooth animations** and **delightful interactions**
- Feels **premium** but **approachable**
- Works perfectly on all screen sizes
- Supports accessibility (screen readers, high contrast, etc.)

---

## 🎨 Design System Stack

### Current Setup
- **NativeWind** (Tailwind CSS for React Native) ✅
- **React Native Reanimated 3** for animations ✅
- Custom components (basic styling)

### Planned Upgrades
- **GlueStack UI v2** (component library) 🎯 NEXT
- **Dark Mode** as default 🎯 PRIORITY
- **Custom icon set** (3D icons mentioned in requirements)
- **Haptic feedback** for interactions
- **Smooth transitions** between screens

---

## 🌙 Dark Mode Strategy

### Implementation Plan

**Priority**: Dark mode FIRST, light mode second

**Approach**:
1. Use NativeWind dark mode classes: `dark:bg-gray-900`
2. Create theme provider for consistent colors
3. Store user preference in AsyncStorage
4. Default to system preference (with dark as fallback)

**Color Palette**:

**Dark Mode (Primary)**:
```typescript
const darkTheme = {
  // Backgrounds
  background: '#0F172A',      // Slate 900
  surface: '#1E293B',         // Slate 800
  card: '#334155',            // Slate 700

  // Text
  text: '#F1F5F9',            // Slate 100
  textSecondary: '#CBD5E1',   // Slate 300
  textMuted: '#94A3B8',       // Slate 400

  // Primary (Blue)
  primary: '#3B82F6',         // Blue 500
  primaryLight: '#60A5FA',    // Blue 400
  primaryDark: '#2563EB',     // Blue 600

  // Accent Colors
  success: '#10B981',         // Green 500
  error: '#EF4444',           // Red 500
  warning: '#F59E0B',         // Amber 500
  info: '#06B6D4',            // Cyan 500
};
```

**Light Mode (Secondary)**:
```typescript
const lightTheme = {
  // Backgrounds
  background: '#FFFFFF',
  surface: '#F8FAFC',         // Slate 50
  card: '#FFFFFF',

  // Text
  text: '#0F172A',            // Slate 900
  textSecondary: '#475569',   // Slate 600
  textMuted: '#94A3B8',       // Slate 400

  // Primary (Blue)
  primary: '#2563EB',         // Blue 600
  primaryLight: '#3B82F6',    // Blue 500
  primaryDark: '#1D4ED8',     // Blue 700

  // Accent Colors (same as dark mode)
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#06B6D4',
};
```

---

## 📦 GlueStack UI Integration

### Why GlueStack?

1. **Universal**: Works on React Native + Web
2. **Accessible**: Built-in ARIA support
3. **Customizable**: Fully themeable
4. **Modern**: Uses Tailwind-style props
5. **Type-safe**: Full TypeScript support

### Installation Plan

```bash
npm install @gluestack-ui/themed @gluestack-style/react react-native-svg
```

### Components We'll Use

**Essential**:
- `Button` - Consistent buttons across app
- `Input` - Form inputs with validation
- `Card` - Content containers
- `Text`, `Heading` - Typography
- `Icon` - Icon system
- `Toast` - Notifications

**Advanced**:
- `Modal` - Dialogs and overlays
- `ActionSheet` - Bottom sheets
- `Progress` - Progress bars
- `Spinner` - Loading states
- `Badge` - Status indicators

### Migration Strategy

**Phase 1**: Install GlueStack + setup theme
**Phase 2**: Migrate existing components one-by-one
**Phase 3**: Create custom components using GlueStack primitives
**Phase 4**: Polish and optimize

---

## 🎭 Component Design Patterns

### Screen Layout Pattern

```typescript
<SafeArea>
  <Header title="Screen Name" />
  <ScrollView>
    <ContentArea>
      {/* Main content */}
    </ContentArea>
  </ScrollView>
  <FloatingButton /> {/* If needed */}
</SafeArea>
```

### Card Pattern

```typescript
<Card variant="elevated" className="dark:bg-slate-800">
  <CardHeader>
    <Heading>Title</Heading>
  </CardHeader>
  <CardBody>
    {/* Content */}
  </CardBody>
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>
```

### Button Patterns

```typescript
// Primary action
<Button variant="solid" colorScheme="primary">
  Continue
</Button>

// Secondary action
<Button variant="outline" colorScheme="primary">
  Skip
</Button>

// Destructive action
<Button variant="solid" colorScheme="error">
  Delete
</Button>
```

---

## 🎬 Animation Guidelines

### Principles
1. **Fast but noticeable** (200-400ms)
2. **Spring physics** for natural feel
3. **Purposeful** - every animation has meaning
4. **Performant** - 60fps on all devices

### Common Animations

**Enter/Exit**:
```typescript
FadeIn.duration(300).springify()
FadeOut.duration(200)
SlideInRight.duration(400)
```

**Interactions**:
```typescript
// Button press
withSpring(scale, { damping: 15, stiffness: 150 })

// Card flip
rotateY.value = withTiming(180, { duration: 400 })

// Progress
width.value = withTiming(percentage, { duration: 500 })
```

**Page Transitions**:
```typescript
// Native feeling
useSharedTransition()
```

---

## 📐 Spacing & Typography

### Spacing Scale (Tailwind-based)
- `xs`: 4px (p-1)
- `sm`: 8px (p-2)
- `md`: 16px (p-4)
- `lg`: 24px (p-6)
- `xl`: 32px (p-8)
- `2xl`: 48px (p-12)

### Typography Scale

**Headings**:
- `h1`: text-4xl font-bold (36px)
- `h2`: text-3xl font-bold (30px)
- `h3`: text-2xl font-bold (24px)
- `h4`: text-xl font-semibold (20px)

**Body**:
- `body-lg`: text-lg (18px)
- `body`: text-base (16px)
- `body-sm`: text-sm (14px)
- `caption`: text-xs (12px)

---

## 🎨 Screen-Specific Designs

### Welcome Screen (Index)
**Goal**: Make it beautiful and inviting

**Improvements Needed**:
```typescript
// Current: Plain white background
// Future: Gradient background with illustration

<LinearGradient colors={['#0F172A', '#1E293B', '#334155']}>
  <AnimatedLogo />
  <Heading>Vox Language</Heading>
  <Text>Learn through practice, not perfection</Text>
  <Button size="lg" variant="solid">Get Started</Button>
</LinearGradient>
```

### Login/Signup
- Dark cards on gradient background
- Smooth input animations
- Error states with icons
- Social login buttons (Google, Apple)

### Flashcard Session
- **Current**: Good structure ✅
- **Improvements**:
  - Add subtle background gradient
  - Smooth card transitions
  - Haptic feedback on ratings
  - Particle effects on "Easy" rating

### Session Summary
- **Current**: Good stats layout ✅
- **Improvements**:
  - Animated counters (count up effect)
  - Confetti animation on completion
  - Share button for achievements

---

## 🌟 3D Icons & Illustrations

### Icon Strategy

**Option 1**: Use 3D icon library
- **Iconify** with 3D icon sets
- **Lucide React Native** (consistent, modern)
- **Custom SVG** animations

**Option 2**: Use Lottie animations
- Animated 3D-looking icons
- Smooth, performant
- Can be interactive

**Recommended**: Combination
- Static screens: SVG icons
- Interactive elements: Lottie animations
- Celebrations: Particle effects

### Where to Use 3D Icons
- Category cards (Food 🍎, Travel ✈️, etc.)
- Achievement badges
- Empty states
- Loading states
- Onboarding illustrations

---

## ♿ Accessibility

### Requirements
- **Color contrast**: WCAG AA minimum (AAA preferred)
- **Touch targets**: Minimum 44×44 pixels
- **Screen reader**: All interactive elements labeled
- **Keyboard navigation**: Full support on web
- **High contrast mode**: Support system preferences

### Implementation
```typescript
<Button
  accessible={true}
  accessibilityLabel="Start review session"
  accessibilityRole="button"
  accessibilityHint="Tap to begin reviewing flashcards"
>
  Start Review
</Button>
```

---

## 📱 Responsive Design

### Breakpoints
- `sm`: 640px (small phones)
- `md`: 768px (large phones, small tablets)
- `lg`: 1024px (tablets)
- `xl`: 1280px (desktop/web)

### Strategy
- Design for mobile first
- Scale up for tablets
- Optimize for web view

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (NEXT)
- [ ] Install GlueStack UI
- [ ] Set up dark mode theme provider
- [ ] Create base components (Button, Card, Input)
- [ ] Migrate login/signup screens

### Phase 2: Core Screens
- [ ] Update welcome screen (gradient + illustration)
- [ ] Enhance flashcard session (animations)
- [ ] Polish session summary
- [ ] Update tab navigation styling

### Phase 3: Advanced Features
- [ ] Add 3D icons to categories
- [ ] Implement haptic feedback
- [ ] Add particle effects for celebrations
- [ ] Create custom loading states

### Phase 4: Polish
- [ ] Micro-interactions everywhere
- [ ] Smooth page transitions
- [ ] Light mode polish
- [ ] Accessibility audit

---

## 📊 Design Tokens

### Colors (Exported for consistency)
```typescript
export const colors = {
  // Dark theme
  dark: { /* ... */ },

  // Light theme
  light: { /* ... */ },

  // Semantic colors
  semantic: {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#06B6D4',
  },

  // Category colors
  category: {
    food: '#F59E0B',      // Amber
    travel: '#06B6D4',    // Cyan
    verbs: '#8B5CF6',     // Purple
    objects: '#EC4899',   // Pink
  },
};
```

---

## 🎯 Success Metrics

**User Experience**:
- [ ] Smooth animations (60fps)
- [ ] Fast load times (<2s)
- [ ] Intuitive navigation
- [ ] Delightful interactions
- [ ] Consistent design language

**Technical**:
- [ ] Dark mode works perfectly
- [ ] Light mode is polished
- [ ] Accessible to all users
- [ ] Responsive on all devices
- [ ] Performant (no janky animations)

---

## 📝 Design Review Checklist

Before merging UI changes, check:
- [ ] Dark mode looks great
- [ ] Light mode looks great
- [ ] Animations are smooth
- [ ] Text is readable (contrast)
- [ ] Touch targets are big enough
- [ ] Works on small and large screens
- [ ] Accessibility labels present
- [ ] No hardcoded colors (use theme)

---

**Note**: This is a living document. Update as we make design decisions and implement features.

**Next Steps**:
1. Install GlueStack UI
2. Set up theme provider with dark mode
3. Update welcome screen
4. Migrate components one-by-one

---

**Maintained by**: Claude Code
**Reviewed by**: Angel Polanco
