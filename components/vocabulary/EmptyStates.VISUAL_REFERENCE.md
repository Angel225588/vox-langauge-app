# Empty States - Visual Reference Guide

Visual representation of all empty state components in the Vox Language App.

---

## 1. EmptyWordBank

```
┌─────────────────────────────────────────────┐
│                                             │
│                                             │
│                     📚                      │
│                   (72px)                    │
│                                             │
│              Start Your Journey             │
│                  (30px bold)                │
│                                             │
│     Add your first word to begin building   │
│      your vocabulary and mastering the      │
│                  language                   │
│              (16px secondary)               │
│                                             │
│  ┌─────────────────────────────────────┐  │
│  │   [Gradient: Indigo → Purple]       │  │
│  │      Add Your First Word            │  │
│  │     (Primary Gradient Button)       │  │
│  └─────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

**Colors:**
- Emoji: 72px
- Title: #F9FAFB (white), 30px, bold
- Description: #D1D5DB (light gray), 16px
- Button: Gradient `#6366F1` → `#8B5CF6`

**Animation:** FadeInUp with spring

---

## 2. EmptySearchResults

```
┌─────────────────────────────────────────────┐
│                                             │
│                                             │
│                     🔍                      │
│                   (72px)                    │
│                                             │
│             No Results Found                │
│                  (30px bold)                │
│                                             │
│      Try a different search term or         │
│            check your spelling              │
│              (16px secondary)               │
│                                             │
│  ┌─────────────────────────────────────┐  │
│  │         [Outline Button]            │  │
│  │          Clear Search               │  │
│  │     (2px border, transparent)       │  │
│  └─────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

**Colors:**
- Emoji: 72px
- Title: #F9FAFB (white), 30px, bold
- Description: #D1D5DB (light gray), 16px
- Button: Outline with `#4B5563` border

**Animation:** FadeInUp with spring

---

## 3. EmptyCategoryWords

```
┌─────────────────────────────────────────────┐
│                                             │
│                                             │
│                     📂                      │
│                   (72px)                    │
│                                             │
│              Category Empty                 │
│                  (30px bold)                │
│                                             │
│       Add words to this category to         │
│          see them here and start            │
│                 learning                    │
│              (16px secondary)               │
│                                             │
│  ┌─────────────────────────────────────┐  │
│  │   [Gradient: Teal → Turquoise]      │  │
│  │           Add Words                 │  │
│  │    (Secondary Gradient Button)      │  │
│  └─────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

**Colors:**
- Emoji: 72px
- Title: #F9FAFB (white), 30px, bold
- Description: #D1D5DB (light gray), 16px
- Button: Gradient `#06D6A0` → `#4ECDC4`

**Animation:** FadeInUp with spring

---

## 4. EmptyDueForReview

```
┌─────────────────────────────────────────────┐
│                                             │
│                                             │
│                     🎉                      │
│                   (72px)                    │
│                                             │
│         ┌───────────────────────┐          │
│         │  All Caught Up!       │          │
│         │ [Gradient Text]       │          │
│         └───────────────────────┘          │
│                  (30px bold)                │
│                                             │
│      No words need review right now.        │
│      Great job on staying consistent!       │
│              (16px secondary)               │
│                                             │
│    ┌─────────────────────────────────┐    │
│    │ 🟢 You're on track              │    │
│    │   (Success indicator badge)     │    │
│    └─────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐  │
│  │         [Outline Button]            │  │
│  │       Browse Vocabulary             │  │
│  │     (2px border, transparent)       │  │
│  └─────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

**Colors:**
- Emoji: 72px
- Title: Gradient `#10B981` → `#34D399` (success)
- Description: #D1D5DB (light gray), 16px
- Success Badge: `#10B981` bg with 20% opacity
- Button: Outline with `#4B5563` border

**Special Features:**
- Gradient title text
- Success indicator badge
- Celebration theme

**Animation:** FadeInUp with spring

---

## 5. EmptyState (Generic)

```
┌─────────────────────────────────────────────┐
│                                             │
│                                             │
│                    [EMOJI]                  │
│                   (72px)                    │
│                                             │
│                 [TITLE]                     │
│                  (30px bold)                │
│                                             │
│               [DESCRIPTION]                 │
│              (16px secondary)               │
│                                             │
│  ┌─────────────────────────────────────┐  │
│  │       [Variant-based button]        │  │
│  │         [ACTION LABEL]              │  │
│  └─────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

**Variants:**

### Primary
- Button: Gradient `#6366F1` → `#8B5CF6` (Indigo → Purple)

### Secondary
- Button: Gradient `#06D6A0` → `#4ECDC4` (Teal → Turquoise)

### Success
- Button: Gradient `#10B981` → `#34D399` (Green shades)

### Outline
- Button: 2px border `#4B5563`, transparent background

---

## Layout Specifications

### Container
- Flex: 1
- Centered (vertical & horizontal)
- Padding: 32px horizontal, 64px vertical
- Min Height: 400px
- Max Width: 400px

### Emoji Container
- Margin Bottom: 24px
- Centered alignment

### Title
- Font Size: 30px
- Font Weight: Bold (700)
- Color: #F9FAFB
- Text Align: Center
- Margin Bottom: 16px

### Description
- Font Size: 16px
- Font Weight: Normal (400)
- Color: #D1D5DB
- Text Align: Center
- Line Height: 24px
- Margin Bottom: 32px
- Padding Horizontal: 16px

### Button Container
- Width: 100%
- Max Width: 280px
- Margin Top: 16px

### Gradient Button
- Padding Vertical: 16px
- Padding Horizontal: 32px
- Border Radius: 16px
- Shadow: Medium depth with glow

### Outline Button
- Padding Vertical: 16px
- Padding Horizontal: 32px
- Border Radius: 16px
- Border Width: 2px
- Border Color: #4B5563
- Background: Transparent

---

## Animation Details

### Entrance Animation
```typescript
entering={FadeInUp.springify()}
```

**Properties:**
- Type: FadeInUp
- Duration: Automatic (springify)
- Easing: Spring (natural, bouncy)
- Delay: None (or staggered for lists)

### Spring Configuration
```typescript
spring: {
  damping: 15,
  stiffness: 150,
}
```

---

## Spacing System

Using design system tokens:

- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px
- `2xl`: 48px
- `3xl`: 64px

**Component Spacing:**
- Emoji margin: `lg` (24px)
- Title margin: `md` (16px)
- Description margin: `xl` (32px)
- Button margin: `md` (16px)
- Container padding: `xl` & `3xl` (32px & 64px)

---

## Color Palette

### Gradients
```typescript
primary: ['#6366F1', '#8B5CF6']      // Indigo → Purple
secondary: ['#06D6A0', '#4ECDC4']    // Teal → Turquoise
success: ['#10B981', '#34D399']      // Green shades
warning: ['#F59E0B', '#FBBF24']      // Amber shades
error: ['#EF4444', '#F87171']        // Red shades
```

### Text Colors
```typescript
primary: '#F9FAFB'      // Almost white
secondary: '#D1D5DB'    // Light gray
tertiary: '#9CA3AF'     // Medium gray
disabled: '#6B7280'     // Dark gray
```

### Background Colors
```typescript
primary: '#0A0E1A'      // Deep space blue-black
secondary: '#0F1729'    // Dark navy
card: '#1A1F3A'         // Card background
elevated: '#222845'     // Elevated elements
```

---

## Responsive Behavior

### Small Screens (< 375px)
- Emoji size: 64px
- Title size: 24px
- Description size: 14px
- Button padding: 14px vertical

### Medium Screens (375px - 768px)
- Standard sizes (as specified above)

### Large Screens (> 768px)
- Max width constraint: 400px
- Centered in available space

---

## Accessibility Features

### Text Contrast
- Title: 15:1 contrast ratio
- Description: 8:1 contrast ratio
- Button text: 12:1 contrast ratio

### Touch Targets
- Button minimum: 44x44pt
- Active opacity: 0.8

### Screen Readers
- Semantic structure
- Descriptive labels
- Proper heading hierarchy

---

## Usage in Different Contexts

### 1. Full Screen
```
┌─────────────────────────────────────────────┐
│ ← Back            Vocabulary        [+]     │ Header
├─────────────────────────────────────────────┤
│                                             │
│            [Empty State Component]          │
│                   (Centered)                │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

### 2. In Tab View
```
┌─────────────────────────────────────────────┐
│   All    |   Review   |   Mastered          │ Tabs
├─────────────────────────────────────────────┤
│                                             │
│            [Empty State Component]          │
│                   (Centered)                │
│                                             │
└─────────────────────────────────────────────┘
```

### 3. In Modal/Sheet
```
┌─────────────────────────────────────────────┐
│ Modal Title                          [X]    │
├─────────────────────────────────────────────┤
│                                             │
│        [Empty State Component]              │
│            (Scrollable)                     │
│                                             │
└─────────────────────────────────────────────┘
```

---

## State Transitions

### Loading → Empty
```
[Spinner] → FadeOut → FadeInUp → [Empty State]
```

### Empty → Content
```
[Empty State] → FadeOut → FadeIn → [Content List]
```

### Filtered → Empty
```
[Content] → FadeOut → FadeInUp → [Empty Search]
```

---

## Best Practices Summary

1. **Always animate** - Use FadeInUp entrance
2. **Center content** - Vertical and horizontal
3. **Generous spacing** - Don't crowd the elements
4. **Clear hierarchy** - Emoji → Title → Description → Action
5. **Actionable** - Provide clear next steps
6. **Consistent** - Follow design system
7. **Accessible** - High contrast, large targets

---

## Component Comparison

| Component | Emoji | Gradient | Special Feature |
|-----------|-------|----------|----------------|
| EmptyWordBank | 📚 | Primary (Indigo→Purple) | - |
| EmptySearchResults | 🔍 | - | Outline button |
| EmptyCategoryWords | 📂 | Secondary (Teal→Turquoise) | - |
| EmptyDueForReview | 🎉 | Success (Green) | Gradient title + badge |
| EmptyState | Custom | Variable | Fully customizable |

---

**Last Updated:** December 2024
**Design System:** Vox Language App
**Component Version:** 1.0.0
