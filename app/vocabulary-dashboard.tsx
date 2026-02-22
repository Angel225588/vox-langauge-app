/**
 * Vocabulary Dashboard — Stack Route
 *
 * Accessible from the Practice grid. Renders the full vocabulary dashboard
 * with a native back header via Expo Router's Stack.
 */

import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/designSystem';
import { VocabularyDashboard } from '@/components/vocabulary/VocabularyDashboard';

export default function VocabularyDashboardScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Vocabulary',
          headerStyle: { backgroundColor: colors.background.primary },
          headerTintColor: colors.text.primary,
          headerShadowVisible: false,
        }}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }} edges={['bottom']}>
        <VocabularyDashboard />
      </SafeAreaView>
    </>
  );
}
