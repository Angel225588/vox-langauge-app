/**
 * Vox Language App - Tamagui UI Components
 *
 * This file exports all custom Tamagui components for easy importing throughout the app.
 *
 * Usage:
 * import { Button, Card, Input, XStack, YStack } from '@/components/ui/tamagui';
 *
 * Features:
 * - Button: Primary, secondary, outline, ghost, success, error variants
 * - Card: Elevated, outlined, flat variants with interactive support
 * - Input: Text input with label, helper text, error states
 * - Stacks: XStack (horizontal), YStack (vertical), ZStack (layered)
 */

// Button component
export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

// Card component
export { Card } from './Card';
export type { CardProps, CardVariant, CardPadding } from './Card';

// Input component
export { Input } from './Input';
export type { InputProps, InputState, InputSize } from './Input';

// Stack components
export { XStack, YStack, ZStack } from './Stack';
export type { XStackProps, YStackProps, ZStackProps } from './Stack';

// Re-export commonly used Tamagui primitives for convenience
export { Text, View, ScrollView, Image } from 'tamagui';
