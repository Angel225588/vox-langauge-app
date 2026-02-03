# Vox Branding Documentation Index

**Last Updated**: December 14, 2025
**Status**: Complete

---

## Documentation Files

| File | Description | Purpose |
|------|-------------|---------|
| [VOX_BRAND_IDENTITY.md](./VOX_BRAND_IDENTITY.md) | Complete brand guide | Brand story, values, personality |
| [LOGO_GENERATION_PROMPTS.md](./LOGO_GENERATION_PROMPTS.md) | AI generation prompts | Recreate logos with Gemini |
| [COLOR_PALETTE.md](./COLOR_PALETTE.md) | Color system guide | Color codes, usage guidelines |
| [INDEX.md](./INDEX.md) | This file | Navigation |

---

## Code Files

| File | Description | Import |
|------|-------------|--------|
| `constants/branding.ts` | Brand constants | `import { logos, brandColors } from '@/constants/branding'` |
| `components/ui/VoxLogo.tsx` | Logo component | `import { VoxLogo } from '@/components/ui'` |

---

## Asset Files

| File | Location | Description |
|------|----------|-------------|
| `vox-logo-crystal-dark.png` | `assets/branding/` | Crystal on dark BG |
| `vox-logo-crystal-transparent.png` | `assets/branding/` | Crystal transparent |
| `vox-wordmark-dark.png` | `assets/branding/` | Text wordmark |

---

## Quick Usage

```tsx
// Import components
import { VoxLogo, VoxSplashLogo, VoxAuthLogo, VoxHeaderLogo } from '@/components/ui';
import { brandColors, brandGradients, logos } from '@/constants/branding';

// Splash screen
<VoxSplashLogo />

// Auth/Login screen
<VoxAuthLogo />

// Header navigation
<VoxHeaderLogo />

// Custom usage
<VoxLogo
  variant="crystal"      // 'crystal' | 'wordmark' | 'full'
  size="large"           // 'small' | 'medium' | 'large' | 'xlarge' | 'splash' | 'auth' | 'header' | number
  animated={true}        // Enable pulse animation
  background="dark"      // 'dark' | 'transparent' | 'auto'
/>

// Use brand colors
<View style={{ backgroundColor: brandColors.background.space }}>
  <Text style={{ color: brandColors.text.primary }}>Vox</Text>
</View>

// Use gradients
<LinearGradient colors={brandGradients.primary.colors} />
```

---

## Logo Concepts Designed

### 1. Vox Crystal (Primary)
- 3D hexagonal gem with sound waves inside
- Represents "voice as something precious"
- Premium, valuable, earned through effort

### 2. Conversation Circle (Requested)
- Round table with people dots
- Sound waves connecting participants
- Community, dialogue, safe space

### 3. V-Wave (Minimal)
- Letter V transforming into sound wave
- Ultra-modern, scalable
- Tech-forward feel

### 4. Speech Bubble Echo (Bonus)
- Tilted speech bubble with echo rings
- Friendly, communication-focused
- App-native aesthetic

---

## Brand Summary

| Attribute | Value |
|-----------|-------|
| **Name** | Vox (Latin for "Voice") |
| **Tagline** | "Show up. Try. Win." |
| **Philosophy** | "The only failure is not trying" |
| **Primary Color** | Indigo #6366F1 |
| **Secondary** | Purple #8B5CF6 |
| **Background** | Deep Space #0A0E1A |
| **Font (Display)** | Poppins Bold |
| **Font (Body)** | Inter |
| **Target** | "Frustrated Intermediates" |
| **Personality** | Coach, Mentor, Friend |

---

## Generated With

- **Brand Strategy**: Claude Opus 4.5
- **Logo Generation**: Gemini 2.5 Flash Image
- **Date**: December 14, 2025
