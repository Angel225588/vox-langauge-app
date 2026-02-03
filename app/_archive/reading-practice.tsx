import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';
import { BackButton } from '@/components/ui/BackButton';

export default function ReadingPracticeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleTeleprompterMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/library');
  };

  const handleNormalMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Implement normal reading mode
    console.log('Normal reading mode - coming soon');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Full-screen gradient background */}
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary, '#1A1F3A']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header with safe area */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(100)}
        style={[styles.header, { paddingTop: insets.top + spacing.md }]}
      >
        <BackButton onPress={handleBack} />
      </Animated.View>

      {/* Description */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(200)}
        style={styles.descriptionContainer}
      >
        <Text style={styles.title}>Choose Your Mode</Text>
        <Text style={styles.description}>
          Select how you want to practice your reading skills today
        </Text>
      </Animated.View>

      {/* Mode Buttons */}
      <View style={styles.modesContainer}>
        {/* Teleprompter Mode */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(300)}
        >
          <TouchableOpacity
            onPress={handleTeleprompterMode}
            activeOpacity={0.9}
            style={styles.modeCard}
          >
            <LinearGradient
              colors={colors.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modeCardGradient}
            >
              <View style={styles.modeIconContainer}>
                <Text style={styles.modeIcon}>📺</Text>
              </View>
              <View style={styles.modeContent}>
                <Text style={styles.modeTitle}>Teleprompter Mode</Text>
                <Text style={styles.modeDescription}>
                  Read aloud with auto-scrolling text. Record your voice and get
                  feedback on pronunciation.
                </Text>
                <View style={styles.modeFeatures}>
                  <View style={styles.featureTag}>
                    <Text style={styles.featureText}>🎤 Voice Recording</Text>
                  </View>
                  <View style={styles.featureTag}>
                    <Text style={styles.featureText}>🔊 Pronunciation Help</Text>
                  </View>
                  <View style={styles.featureTag}>
                    <Text style={styles.featureText}>⏱️ Adjustable Speed</Text>
                  </View>
                </View>
              </View>
              <View style={styles.arrowContainer}>
                <Text style={styles.arrow}>→</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Normal Reading Mode */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(400)}
        >
          <TouchableOpacity
            onPress={handleNormalMode}
            activeOpacity={0.9}
            style={[styles.modeCard, styles.modeCardDisabled]}
          >
            <LinearGradient
              colors={colors.gradients.dark}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modeCardGradient}
            >
              <View style={styles.modeIconContainer}>
                <Text style={styles.modeIcon}>📖</Text>
              </View>
              <View style={styles.modeContent}>
                <View style={styles.modeTitleRow}>
                  <Text style={styles.modeTitle}>Passive Reading Mode</Text>
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>Coming Soon</Text>
                  </View>
                </View>
                <Text style={styles.modeDescription}>
                  Read at your own pace. Tap words to see meanings and add them
                  to your vocabulary bank.
                </Text>
                <View style={styles.modeFeatures}>
                  <View style={[styles.featureTag, styles.featureTagDisabled]}>
                    <Text style={styles.featureTextDisabled}>👆 Tap for Meaning</Text>
                  </View>
                  <View style={[styles.featureTag, styles.featureTagDisabled]}>
                    <Text style={styles.featureTextDisabled}>📚 Word Bank</Text>
                  </View>
                  <View style={[styles.featureTag, styles.featureTagDisabled]}>
                    <Text style={styles.featureTextDisabled}>🎯 Comprehension</Text>
                  </View>
                </View>
              </View>
              <View style={styles.arrowContainer}>
                <Text style={[styles.arrow, styles.arrowDisabled]}>→</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Bottom Tip */}
      <Animated.View
        entering={FadeIn.duration(400).delay(500)}
        style={[styles.tipContainer, { paddingBottom: insets.bottom + spacing.lg }]}
      >
        <Text style={styles.tipText}>
          💡 Tip: Start with Teleprompter Mode to practice speaking fluency!
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  descriptionContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    color: colors.text.primary,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  description: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.base,
    lineHeight: 24,
  },
  modesContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  modeCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: colors.glow.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modeCardDisabled: {
    opacity: 0.7,
    shadowOpacity: 0.1,
  },
  modeCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.xl,
  },
  modeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  modeIcon: {
    fontSize: 28,
  },
  modeContent: {
    flex: 1,
  },
  modeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  modeTitle: {
    color: colors.text.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  modeDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  modeFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  featureTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  featureTagDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  featureText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  featureTextDisabled: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  comingSoonBadge: {
    backgroundColor: colors.warning.DEFAULT,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  comingSoonText: {
    color: colors.background.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  arrowContainer: {
    width: 40,
    alignItems: 'center',
  },
  arrow: {
    color: colors.text.primary,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
  },
  arrowDisabled: {
    color: colors.text.disabled,
  },
  tipContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  tipText: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
