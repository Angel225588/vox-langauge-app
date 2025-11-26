# Vox Language App - UI/UX Transformation Plan

## 🎯 Goal
Transform the functional Vox Language App into a **premium, aesthetic, and engaging** experience using **Tamagui**.

## 🛠 Technology Strategy
*   **Primary Styling Engine:** **Tamagui** (for performance, themes, and complex animations).
*   **Secondary Styling:** NativeWind (legacy support, will be phased out of core UI components).
*   **Animations:** `react-native-reanimated` (via Tamagui's driver) for smooth, 60fps micro-interactions.
*   **Icons:** Lucide React Native (clean, modern icons).

## 🎨 Design System (Atomic Design)

### 1. Atoms (The Foundation)
*   **Colors:** Define a sophisticated palette.
    *   *Primary:* Indigo/Violet (Intellectual, calm).
    *   *Secondary:* Vibrant Pink/Coral (Playful, for gamification).
    *   *Surface:* Glassmorphism effects (blur, semi-transparent backgrounds).
*   **Typography:** Modern sans-serif (Inter or similar). Clean hierarchy (H1, H2, Body, Caption).
*   **Spacing:** Consistent 4px grid (4, 8, 12, 16, 24, 32...).
*   **Shadows:** Soft, multi-layered shadows for depth.

### 2. Molecules (Reusable Components)
*   **`PremiumButton`:** Gradient backgrounds, press animations, haptic feedback.
*   **`GlassCard`:** The signature look. Semi-transparent background, blur effect, subtle border.
*   **`AnimatedInput`:** Floating labels, smooth focus transitions.
*   **`ProgressBar`:** Smooth filling animation with particles/glow.

### 3. Organisms (Complex Sections)
*   **`FlashcardDeck`:** The interactive card stack.
*   **`StatsOverview`:** Dashboard with charts and metrics.
*   **`AuthForm`:** Login/Signup container.

---

## 📅 Implementation Phases

### Phase 1: The Foundation (Design System)
*   [ ] **Refine `tamagui.config.ts`:** Update colors, shadows, and animations to be "Premium".
*   [ ] **Create Base Components:** Build `GlassCard`, `PremiumButton`, `ThemedText` in `components/ui`.
*   [ ] **Test Drive:** Create a "Design System Showcase" screen to verify looks.

### Phase 2: Onboarding & Auth (First Impressions)
*   [ ] **Welcome Screen:** Engaging illustration/animation, clear value prop.
*   [ ] **Login/Signup:** Clean forms, social login buttons (Google), smooth transitions.
*   [ ] **Onboarding Flow:** Language selection with visual flair.

### Phase 3: The Home Screen (The Hub)
*   [ ] **Header:** User greeting, streak flame (animated).
*   [ ] **Dashboard:** "Next Lesson" card, "Daily Progress" ring.
*   [ ] **Navigation:** Custom Tab Bar (floating, glass effect).

### Phase 4: Flashcard Session (The Core)
*   [ ] **Card Redesign:** Use `GlassCard` style.
*   [ ] **Flip Animation:** Physics-based 3D flip.
*   [ ] **Micro-interactions:**
    *   Success/Fail particles.
    *   Progress bar glow.
    *   Haptic feedback on every interaction.

---

## 🚀 Next Action
**Start Phase 1:** Refine the Tamagui Configuration and build the `GlassCard` component.
