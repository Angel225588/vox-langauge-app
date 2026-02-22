/**
 * Onboarding V3 Layout
 * Stack layout with slide transitions and dark glassmorphic background.
 */

import { Stack } from 'expo-router';
import { colors } from '@/constants/designSystem';

export default function OnboardingV3Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background.primary },
        gestureEnabled: true,
      }}
    />
  );
}
