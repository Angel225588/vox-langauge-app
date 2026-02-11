import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';

export default function CommunityScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background.primary, padding: spacing.lg }}>
      <Text style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.text.primary, marginBottom: spacing.md }}>
        Community
      </Text>
      <Text style={{ fontSize: typography.fontSize.sm, color: colors.text.disabled, marginBottom: spacing.xl, textAlign: 'center' }}>
        Phase 7: To be implemented
      </Text>

      <Link href="/design-showcase" asChild>
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary.DEFAULT,
            paddingVertical: spacing.md - 4,
            paddingHorizontal: spacing.lg,
            borderRadius: borderRadius.md,
          }}
        >
          <Text style={{ color: colors.text.primary, fontWeight: typography.fontWeight.semibold, fontSize: typography.fontSize.base }}>
            View Design Showcase
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
