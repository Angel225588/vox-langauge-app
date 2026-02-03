# Vox Color Palette

## Primary Brand Colors

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ████████████████████  VOX INDIGO  #6366F1                      │
│  ████████████████████  Primary brand color                      │
│                                                                  │
│  ████████████████████  VOX PURPLE  #8B5CF6                      │
│  ████████████████████  Gradient partner, accents                │
│                                                                  │
│  PRIMARY GRADIENT: #6366F1 → #8B5CF6                            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Background Colors

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ░░░░░░░░░░░░░░░░░░░░  DEEP SPACE    #0A0E1A                    │
│  ░░░░░░░░░░░░░░░░░░░░  Primary background                       │
│                                                                  │
│  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  DARK NAVY     #0F1729                    │
│  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  Secondary background                     │
│                                                                  │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  CARD BG       #1A1F3A                    │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  Card/elevated elements                   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Secondary Colors (Skill Currencies)

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ████████████████████  TEAL          #06D6A0  (Comprehension)   │
│  ████████████████████  TURQUOISE     #4ECDC4                    │
│                                                                  │
│  ████████████████████  CORAL         #FF6B6B  (Fluency/Speaking)│
│  ████████████████████  SALMON        #FFA07A                    │
│                                                                  │
│  ████████████████████  VIOLET        #8B5CF6  (Expression)      │
│  ████████████████████  LIGHT VIOLET  #A78BFA                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Accent Colors

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ████████████████████  AMBER         #F59E0B  (Warning/Gold)    │
│  ████████████████████  PINK          #EC4899  (Special)         │
│  ████████████████████  CYAN          #06B6D4  (Info)            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Text Colors

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ████████████████████  PRIMARY       #F9FAFB  (Almost white)    │
│  ████████████████████  SECONDARY     #D1D5DB  (Light gray)      │
│  ████████████████████  TERTIARY      #9CA3AF  (Medium gray)     │
│  ████████████████████  DISABLED      #6B7280  (Dark gray)       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## CSS Variables

```css
:root {
  /* Primary */
  --vox-indigo: #6366F1;
  --vox-purple: #8B5CF6;
  --vox-indigo-light: #818CF8;
  --vox-indigo-dark: #4F46E5;

  /* Backgrounds */
  --vox-bg-primary: #0A0E1A;
  --vox-bg-secondary: #0F1729;
  --vox-bg-card: #1A1F3A;
  --vox-bg-elevated: #222845;

  /* Secondary - Skills */
  --vox-teal: #06D6A0;
  --vox-turquoise: #4ECDC4;
  --vox-coral: #FF6B6B;
  --vox-salmon: #FFA07A;
  --vox-violet: #8B5CF6;
  --vox-violet-light: #A78BFA;

  /* Text */
  --vox-text-primary: #F9FAFB;
  --vox-text-secondary: #D1D5DB;
  --vox-text-tertiary: #9CA3AF;
  --vox-text-disabled: #6B7280;

  /* Accents */
  --vox-amber: #F59E0B;
  --vox-pink: #EC4899;
  --vox-cyan: #06B6D4;

  /* Glow Effects */
  --vox-glow-primary: rgba(99, 102, 241, 0.5);
  --vox-glow-teal: rgba(6, 214, 160, 0.5);
  --vox-glow-coral: rgba(255, 107, 107, 0.5);
}
```

---

## Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        vox: {
          indigo: '#6366F1',
          purple: '#8B5CF6',
          teal: '#06D6A0',
          coral: '#FF6B6B',
          amber: '#F59E0B',
        },
        background: {
          primary: '#0A0E1A',
          secondary: '#0F1729',
          card: '#1A1F3A',
        },
      },
    },
  },
};
```

---

## Usage Guidelines

### Do's

- Use Vox Indigo for primary CTAs and interactive elements
- Apply gradients (Indigo → Purple) for premium feel
- Use Teal for success states and comprehension-related features
- Use Coral for speaking/fluency-related features
- Maintain high contrast ratios for text readability (WCAG AA)

### Don'ts

- Don't use pure black (#000000) for backgrounds
- Don't use primary colors for large background areas
- Don't combine Coral and Indigo directly (use with neutrals)
- Don't use low-contrast text on colored backgrounds

---

## Accessibility Notes

| Combination | Contrast Ratio | WCAG Level |
|-------------|----------------|------------|
| White on Indigo | 4.6:1 | AA |
| White on Deep Space | 16.1:1 | AAA |
| Indigo on Deep Space | 3.5:1 | AA Large |
| Teal on Deep Space | 6.2:1 | AA |

---

## Brand Personality in Color

| Color | Personality Trait |
|-------|-------------------|
| **Indigo** | Trust, Intelligence, Depth |
| **Purple** | Creativity, Premium, Achievement |
| **Teal** | Understanding, Clarity, Growth |
| **Coral** | Energy, Voice, Confidence |
| **Deep Space** | Focus, Calm, Professional |
