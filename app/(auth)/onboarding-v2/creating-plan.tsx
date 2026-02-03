/**
 * Creating Your Plan - Countdown Screen
 * Shows a 10-second countdown with animations before revealing the staircase
 */

import React from 'react';
import { useRouter } from 'expo-router';
import { CreatingYourPlanScreen } from '@/components/onboarding';

export default function CreatingPlanRoute() {
  const router = useRouter();

  const handleComplete = () => {
    // Navigate to the staircase tab with first visit flag
    router.replace('/(tabs)/staircase');
  };

  return (
    <CreatingYourPlanScreen
      duration={10}
      onComplete={handleComplete}
    />
  );
}
