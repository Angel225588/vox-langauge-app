import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, shadows, animation } from '@/constants/designSystem';
import { VocabularyHaptics } from '@/lib/utils/haptics';

export type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export function ViewToggle({ mode, onModeChange }: ViewToggleProps) {
  // Handle mode change with haptic feedback
  const handleModeChange = useCallback((newMode: ViewMode) => {
    if (newMode !== mode) {
      VocabularyHaptics.viewModeChanged();
      onModeChange(newMode);
    }
  }, [mode, onModeChange]);
  const gridAnimatedStyle = useAnimatedStyle(() => {
    const isActive = mode === 'grid';
    return {
      transform: [
        {
          scale: withSpring(isActive ? 1 : 0.95, animation.spring.default),
        },
      ],
      opacity: withTiming(isActive ? 1 : 0.6, { duration: animation.duration.normal }),
    };
  });

  const listAnimatedStyle = useAnimatedStyle(() => {
    const isActive = mode === 'list';
    return {
      transform: [
        {
          scale: withSpring(isActive ? 1 : 0.95, animation.spring.default),
        },
      ],
      opacity: withTiming(isActive ? 1 : 0.6, { duration: animation.duration.normal }),
    };
  });

  return (
    <View style={styles.container}>
      {/* Grid Button */}
      <AnimatedTouchableOpacity
        style={[styles.button, gridAnimatedStyle]}
        onPress={() => handleModeChange('grid')}
        activeOpacity={0.7}
      >
        {mode === 'grid' ? (
          <LinearGradient
            colors={colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.activeBackground,
              Platform.OS === 'ios' && mode === 'grid' && shadows.glow.primary,
            ]}
          >
            <Text style={styles.iconActive}>▦</Text>
          </LinearGradient>
        ) : (
          <View style={styles.inactiveBackground}>
            <Text style={styles.iconInactive}>▦</Text>
          </View>
        )}
      </AnimatedTouchableOpacity>

      {/* List Button */}
      <AnimatedTouchableOpacity
        style={[styles.button, listAnimatedStyle]}
        onPress={() => handleModeChange('list')}
        activeOpacity={0.7}
      >
        {mode === 'list' ? (
          <LinearGradient
            colors={colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.activeBackground,
              Platform.OS === 'ios' && mode === 'list' && shadows.glow.primary,
            ]}
          >
            <Text style={styles.iconActive}>☰</Text>
          </LinearGradient>
        ) : (
          <View style={styles.inactiveBackground}>
            <Text style={styles.iconInactive}>☰</Text>
          </View>
        )}
      </AnimatedTouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.full,
    padding: 4,
    gap: 4,
    ...shadows.sm,
  },
  button: {
    width: 44,
    height: 44,
  },
  activeBackground: {
    flex: 1,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.glow.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  inactiveBackground: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconActive: {
    fontSize: 20,
    color: colors.text.primary,
    fontWeight: '600',
  },
  iconInactive: {
    fontSize: 20,
    color: colors.text.tertiary,
    fontWeight: '400',
  },
});
