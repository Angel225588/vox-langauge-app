# Progressive Immersion - Quick Reference

## TL;DR

The app gradually switches UI from native to target language as users level up.

## CEFR Levels & Immersion

| Level | % Target | Tier 1 | Tier 2 | Tier 3 |
|-------|----------|--------|--------|--------|
| A1    | 10%      | Native | Native | Native |
| A2    | 30%      | **Target** | Native | Native |
| B1    | 50%      | **Target** | **Target** | Native |
| B2    | 70%      | **Target** | **Target** | Native |
| C1    | 90%      | **Target** | **Target** | **Target** |
| C2    | 100%     | **Target** | **Target** | **Target** |

## Tiers Explained

```
Tier 1 (Easy)     → Buttons, navigation, simple labels
Tier 2 (Medium)   → Headers, feedback, short instructions
Tier 3 (Hard)     → Grammar explanations, complex errors
```

## Usage

### Basic Component

```tsx
import { ImmersiveText } from '@/lib/immersion';

<ImmersiveText
  native="Continue"
  target="Continuar"
  tier="tier1"
/>
```

### Convenience Components

```tsx
// Buttons (tier1)
<ImmersiveButtonLabel native="Next" target="Siguiente" />

// Feedback (tier2)
<ImmersiveFeedback native="Correct!" target="¡Correcto!" />

// Explanations (tier3)
<ImmersiveExplanation
  native="Use the subjunctive for doubt"
  target="Usa el subjuntivo para la duda"
/>
```

### Hook for Custom Logic

```tsx
const {
  currentLevel,      // "B1"
  immersionPercentage, // 50
  shouldUseTargetLanguage, // (tier) => boolean
} = useImmersion();
```

## Files

- `lib/immersion/types.ts` - Types and constants
- `lib/immersion/useImmersion.ts` - Main hook
- `lib/immersion/ImmersiveText.tsx` - UI component
- `docs/features/PROGRESSIVE_IMMERSION_SYSTEM.md` - Full docs
