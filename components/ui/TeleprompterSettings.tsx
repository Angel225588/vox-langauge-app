import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Switch,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';
import { FontSize, ScrollSpeed } from '@/components/cards/TeleprompterCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Speed levels matching TeleprompterCard
const SPEED_LEVELS = [
  { label: '🐢', wpm: 80, name: 'Very Slow' },
  { label: '🐌', wpm: 100, name: 'Slow' },
  { label: '🚶', wpm: 130, name: 'Steady' },
  { label: '🏃', wpm: 160, name: 'Normal' },
  { label: '🚀', wpm: 200, name: 'Fast' },
  { label: '⚡', wpm: 250, name: 'Very Fast' },
];

interface TeleprompterSettingsProps {
  visible: boolean;
  fontSize: FontSize;
  scrollSpeed: ScrollSpeed;
  speedLevelIndex?: number;
  autoScroll: boolean;
  onClose: () => void;
  onApply: (fontSize: FontSize, scrollSpeed: ScrollSpeed, autoScroll: boolean, speedLevelIndex?: number) => void;
}

export function TeleprompterSettings({
  visible,
  fontSize: initialFontSize,
  scrollSpeed: initialScrollSpeed,
  speedLevelIndex: initialSpeedLevelIndex = 3,
  autoScroll: initialAutoScroll,
  onClose,
  onApply,
}: TeleprompterSettingsProps) {
  const insets = useSafeAreaInsets();

  // Local state for editing
  const [fontSize, setFontSize] = useState<FontSize>(initialFontSize);
  const [scrollSpeed, setScrollSpeed] = useState<ScrollSpeed>(initialScrollSpeed);
  const [speedLevelIndex, setSpeedLevelIndex] = useState(initialSpeedLevelIndex);
  const [autoScroll, setAutoScroll] = useState(initialAutoScroll);

  // Reset when opened
  useEffect(() => {
    if (visible) {
      setFontSize(initialFontSize);
      setScrollSpeed(initialScrollSpeed);
      setSpeedLevelIndex(initialSpeedLevelIndex);
      setAutoScroll(initialAutoScroll);
    }
  }, [visible, initialFontSize, initialScrollSpeed, initialSpeedLevelIndex, initialAutoScroll]);

  const handleFontSizeChange = (size: FontSize) => {
    Haptics.selectionAsync();
    setFontSize(size);
  };

  const handleSpeedLevelChange = (index: number) => {
    Haptics.selectionAsync();
    setSpeedLevelIndex(index);
  };

  const handleAutoScrollToggle = (value: boolean) => {
    Haptics.selectionAsync();
    setAutoScroll(value);
  };

  const handleApply = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onApply(fontSize, scrollSpeed, autoScroll, speedLevelIndex);
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.backdrop}
        />
      </Pressable>

      <Animated.View
        entering={SlideInDown.duration(300).springify()}
        exiting={SlideOutDown.duration(200)}
        style={[styles.container, { paddingBottom: insets.bottom + spacing.lg }]}
      >
        <BlurView intensity={60} tint="dark" style={styles.blurContainer}>
          <View style={styles.content}>
            {/* Drag Handle */}
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>

            {/* Title */}
            <Text style={styles.title}>Settings</Text>

            {/* Text Size */}
            <View style={styles.settingSection}>
              <Text style={styles.settingLabel}>TEXT SIZE</Text>
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  onPress={() => handleFontSizeChange('small')}
                  style={[
                    styles.optionButton,
                    fontSize === 'small' && styles.optionButtonActive,
                  ]}
                >
                  <Text style={[
                    styles.fontSizeSmall,
                    fontSize === 'small' && styles.optionTextActive,
                  ]}>A</Text>
                  <Text style={[
                    styles.optionSubtext,
                    fontSize === 'small' && styles.optionSubtextActive,
                  ]}>Small</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleFontSizeChange('medium')}
                  style={[
                    styles.optionButton,
                    fontSize === 'medium' && styles.optionButtonActive,
                  ]}
                >
                  <Text style={[
                    styles.fontSizeMedium,
                    fontSize === 'medium' && styles.optionTextActive,
                  ]}>A</Text>
                  <Text style={[
                    styles.optionSubtext,
                    fontSize === 'medium' && styles.optionSubtextActive,
                  ]}>Medium</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleFontSizeChange('large')}
                  style={[
                    styles.optionButton,
                    fontSize === 'large' && styles.optionButtonActive,
                  ]}
                >
                  <Text style={[
                    styles.fontSizeLarge,
                    fontSize === 'large' && styles.optionTextActive,
                  ]}>A</Text>
                  <Text style={[
                    styles.optionSubtext,
                    fontSize === 'large' && styles.optionSubtextActive,
                  ]}>Large</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Scroll Speed - 6 levels */}
            <View style={styles.settingSection}>
              <Text style={styles.settingLabel}>SCROLL SPEED</Text>
              <View style={styles.speedSliderContainer}>
                {/* Speed track */}
                <View style={styles.speedTrack}>
                  {SPEED_LEVELS.map((level, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleSpeedLevelChange(index)}
                      style={[
                        styles.speedStep,
                        index <= speedLevelIndex && styles.speedStepActive,
                      ]}
                    >
                      <Text style={[
                        styles.speedStepIcon,
                        index === speedLevelIndex && styles.speedStepIconActive,
                      ]}>
                        {level.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {/* Current speed label */}
                <Text style={styles.currentSpeedLabel}>
                  {SPEED_LEVELS[speedLevelIndex].name}
                </Text>
              </View>
            </View>

            {/* Auto-Scroll Toggle */}
            <View style={styles.settingSection}>
              <View style={styles.toggleRow}>
                <View>
                  <Text style={styles.toggleLabel}>Auto-scroll</Text>
                  <Text style={styles.toggleDescription}>
                    Automatically advance text while reading
                  </Text>
                </View>
                <Switch
                  value={autoScroll}
                  onValueChange={handleAutoScrollToggle}
                  trackColor={{
                    false: colors.background.elevated,
                    true: colors.primary.DEFAULT,
                  }}
                  thumbColor={colors.text.primary}
                  ios_backgroundColor={colors.background.elevated}
                />
              </View>
            </View>

            {/* Apply Button */}
            <TouchableOpacity
              onPress={handleApply}
              activeOpacity={0.8}
              style={styles.applyButton}
            >
              <LinearGradient
                colors={colors.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.applyButtonGradient}
              >
                <Text style={styles.applyButtonText}>Apply Settings</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  blurContainer: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  content: {
    padding: spacing.lg,
    backgroundColor: 'rgba(26, 31, 58, 0.9)',
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingBottom: spacing.md,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border.light,
  },
  title: {
    color: colors.text.primary,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  settingSection: {
    marginBottom: spacing.lg,
  },
  settingLabel: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  optionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.card,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    gap: spacing.xs,
  },
  optionButtonActive: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  fontSizeSmall: {
    color: colors.text.secondary,
    fontSize: 16,
    fontWeight: typography.fontWeight.bold,
  },
  fontSizeMedium: {
    color: colors.text.secondary,
    fontSize: 22,
    fontWeight: typography.fontWeight.bold,
  },
  fontSizeLarge: {
    color: colors.text.secondary,
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
  },
  optionTextActive: {
    color: colors.primary.light,
  },
  optionSubtext: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  optionSubtextActive: {
    color: colors.primary.light,
  },
  speedIcon: {
    fontSize: 24,
  },
  speedSliderContainer: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  speedTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  speedStep: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedStepActive: {
    backgroundColor: 'rgba(6, 214, 160, 0.2)',
  },
  speedStepIcon: {
    fontSize: 20,
    opacity: 0.5,
  },
  speedStepIconActive: {
    opacity: 1,
    transform: [{ scale: 1.2 }],
  },
  currentSpeedLabel: {
    color: colors.secondary.DEFAULT,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.card,
  },
  toggleLabel: {
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  toggleDescription: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  applyButton: {
    marginTop: spacing.md,
    shadowColor: colors.glow.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  applyButtonGradient: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  applyButtonText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
});
