# Vox Brand Assets

This folder contains the official Vox brand assets.

## Required Files

Please add the following image files to this folder:

### Logo Files

| Filename | Description | Source |
|----------|-------------|--------|
| `vox-logo-crystal-dark.png` | Crystal logo on dark background | Image 1 from Gemini |
| `vox-logo-crystal-transparent.png` | Crystal logo with transparent BG | Image 2 from Gemini |
| `vox-wordmark-dark.png` | "VOX" text wordmark | Image 3 from Gemini |

### How to Add

1. Save the generated images with these exact filenames
2. Place them in this folder (`assets/branding/`)
3. Recommended resolution: 1024x1024 for logos, appropriate width for wordmark

## Usage in Code

```tsx
import { VoxLogo, VoxSplashLogo, VoxAuthLogo } from '@/components/ui';
import { logos, brandColors, brandGradients } from '@/constants/branding';

// Basic usage
<VoxLogo variant="crystal" size="large" />

// Pre-configured variants
<VoxSplashLogo />     // For splash screens
<VoxAuthLogo />       // For login/auth screens
<VoxHeaderLogo />     // For navigation headers

// With animation
<VoxLogo variant="crystal" size="xlarge" animated />

// Full logo (crystal + wordmark)
<VoxLogo variant="full" size="splash" />

// Direct image access
<Image source={logos.crystal.dark} />
<Image source={logos.wordmark.dark} />
```

## Logo Variants

### Crystal (Main Logo)
- 3D hexagonal crystal with sound waves
- Premium, valuable aesthetic
- Works at all sizes

### Wordmark
- "VOX" text with indigo-to-purple gradient
- Clean, modern typography
- Use alongside crystal for full branding

### Full
- Crystal + Wordmark combined
- For splash screens, marketing materials
- Maximum brand impact

## Sizes

| Size | Pixel Value | Use Case |
|------|-------------|----------|
| `small` | 32px | Tab bar, inline |
| `medium` | 48px | Default |
| `large` | 64px | Cards, sections |
| `xlarge` | 96px | Feature highlights |
| `header` | 32px | Navigation |
| `auth` | 80px | Login screens |
| `splash` | 120px | Welcome screens |

## Brand Colors

The logo uses these colors from the design system:

- **Indigo**: `#6366F1`
- **Purple**: `#8B5CF6`
- **Background**: `#0A0E1A`

See `constants/branding.ts` for full color palette.
