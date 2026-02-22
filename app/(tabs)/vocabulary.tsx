/**
 * Vocabulary Tab — Hidden tab wrapper
 *
 * This tab is hidden from the tab bar (href: null in _layout.tsx).
 * The vocabulary dashboard is now accessible via the Practice grid
 * at /vocabulary-dashboard. This file remains for Expo Router compatibility.
 */

import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/designSystem';
import { VocabularyDashboard } from '@/components/vocabulary/VocabularyDashboard';

export default function VocabularyScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }} edges={['top']}>
      <VocabularyDashboard />
    </SafeAreaView>
  );
}
