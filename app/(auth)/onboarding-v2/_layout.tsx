/**
 * Onboarding V2 Layout
 * Simple stack layout for the new onboarding flow
 */

import { Stack } from 'expo-router';

export default function OnboardingV2Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: '#0A0E1A' },
      }}
    />
  );
}
