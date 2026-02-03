/**
 * VoxLogo Component
 *
 * Official Vox logo component with multiple variants and sizes.
 * Use this component for consistent brand representation throughout the app.
 *
 * NOTE: This component renders a stylized placeholder until you add the actual
 * logo images to assets/branding/. Once images are added, update the
 * IMAGES_AVAILABLE flag below to true.
 *
 * @example
 * // Crystal icon only
 * <VoxLogo variant="crystal" size="large" />
 *
 * // Wordmark only
 * <VoxLogo variant="wordmark" size="medium" />
 *
 * // Full logo (crystal + wordmark)
 * <VoxLogo variant="full" size="splash" />
 */

import React from 'react';
import { View, Image, StyleSheet, ViewStyle, ImageStyle, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  useSharedValue,
  withDelay,
} from 'react-native-reanimated';
import { brandColors, logoDimensions } from '@/constants/branding';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Set to true once you've added the logo images to assets/branding/
 * Files needed:
 *   - vox-logo-crystal-dark.png
 *   - vox-logo-crystal-transparent.png
 *   - vox-wordmark-dark.png
 */
const IMAGES_AVAILABLE = false;

// ============================================================================
// TYPES
// ============================================================================

export type LogoVariant = 'crystal' | 'wordmark' | 'full';
export type LogoSize = 'small' | 'medium' | 'large' | 'xlarge' | 'splash' | 'auth' | 'header';
export type LogoBackground = 'dark' | 'transparent' | 'auto';

interface VoxLogoProps {
  /** Logo variant to display */
  variant?: LogoVariant;
  /** Predefined size or custom number */
  size?: LogoSize | number;
  /** Background style */
  background?: LogoBackground;
  /** Enable subtle glow animation */
  animated?: boolean;
  /** Additional container styles */
  style?: ViewStyle;
  /** Additional image styles */
  imageStyle?: ImageStyle;
}

// ============================================================================
// SIZE MAPPINGS
// ============================================================================

const getSizeValue = (size: LogoSize | number): number => {
  if (typeof size === 'number') return size;

  const sizeMap: Record<LogoSize, number> = {
    small: logoDimensions.appIcon.small,
    medium: logoDimensions.appIcon.medium,
    large: logoDimensions.appIcon.large,
    xlarge: logoDimensions.appIcon.xlarge,
    splash: logoDimensions.splash.icon,
    auth: logoDimensions.auth.icon,
    header: logoDimensions.header.icon,
  };

  return sizeMap[size];
};

const getWordmarkSize = (size: LogoSize | number): { width: number; height: number } => {
  if (typeof size === 'number') {
    return { width: size * 2.5, height: size * 0.75 };
  }

  const sizeMap: Record<LogoSize, { width: number; height: number }> = {
    small: { width: 60, height: 18 },
    medium: { width: 80, height: 24 },
    large: { width: 100, height: 30 },
    xlarge: { width: 120, height: 36 },
    splash: logoDimensions.splash.wordmark,
    auth: logoDimensions.auth.wordmark,
    header: logoDimensions.header.wordmark,
  };

  return sizeMap[size];
};

// ============================================================================
// PLACEHOLDER COMPONENTS (used when images aren't added yet)
// ============================================================================

/**
 * Placeholder crystal logo - a styled hexagon with sound waves
 */
function CrystalPlaceholder({ size, animated }: { size: number; animated?: boolean }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.8);

  React.useEffect(() => {
    if (animated) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1500 }),
          withTiming(1, { duration: 1500 })
        ),
        -1,
        true
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500 }),
          withTiming(0.8, { duration: 1500 })
        ),
        -1,
        true
      );
    }
  }, [animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animated ? animatedStyle : undefined}>
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          {
            width: size,
            height: size,
            borderRadius: size * 0.2,
            alignItems: 'center',
            justifyContent: 'center',
            // Hexagon-like shape approximation with border radius
            transform: [{ rotate: '0deg' }],
          },
        ]}
      >
        {/* Sound wave lines */}
        <View style={{ alignItems: 'flex-start' }}>
          {[0.5, 0.7, 0.9].map((scale, i) => (
            <View
              key={i}
              style={{
                width: size * scale * 0.3,
                height: size * 0.08,
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderRadius: size * 0.04,
                marginVertical: size * 0.02,
                marginLeft: i * size * 0.05,
              }}
            />
          ))}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

/**
 * Placeholder wordmark - styled "VOX" text
 */
function WordmarkPlaceholder({ width, height }: { width: number; height: number }) {
  return (
    <LinearGradient
      colors={['#6366F1', '#8B5CF6']}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={{
        width,
        height,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontSize: height * 0.7,
          fontWeight: '800',
          color: '#FFFFFF',
          letterSpacing: 2,
        }}
      >
        VOX
      </Text>
    </LinearGradient>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function VoxLogo({
  variant = 'crystal',
  size = 'medium',
  background = 'auto',
  animated = false,
  style,
  imageStyle,
}: VoxLogoProps) {
  // Calculate dimensions
  const iconSize = getSizeValue(size);
  const wordmarkDimensions = getWordmarkSize(size);

  // Determine which image source to use
  const useTransparent = background === 'transparent' ||
    (background === 'auto' && variant === 'full');

  // Render crystal icon
  const renderCrystal = () => {
    if (!IMAGES_AVAILABLE) {
      return <CrystalPlaceholder size={iconSize} animated={animated} />;
    }

    // When images are available, uncomment this:
    // return (
    //   <Image
    //     source={
    //       useTransparent
    //         ? require('@/assets/branding/vox-logo-crystal-transparent.png')
    //         : require('@/assets/branding/vox-logo-crystal-dark.png')
    //     }
    //     style={[{ width: iconSize, height: iconSize }, imageStyle]}
    //     resizeMode="contain"
    //   />
    // );

    return <CrystalPlaceholder size={iconSize} animated={animated} />;
  };

  // Render wordmark
  const renderWordmark = () => {
    if (!IMAGES_AVAILABLE) {
      return <WordmarkPlaceholder width={wordmarkDimensions.width} height={wordmarkDimensions.height} />;
    }

    // When images are available, uncomment this:
    // return (
    //   <Image
    //     source={require('@/assets/branding/vox-wordmark-dark.png')}
    //     style={[{ width: wordmarkDimensions.width, height: wordmarkDimensions.height }, imageStyle]}
    //     resizeMode="contain"
    //   />
    // );

    return <WordmarkPlaceholder width={wordmarkDimensions.width} height={wordmarkDimensions.height} />;
  };

  // Render based on variant
  const renderContent = () => {
    switch (variant) {
      case 'crystal':
        return renderCrystal();

      case 'wordmark':
        return renderWordmark();

      case 'full':
        return (
          <View style={styles.fullContainer}>
            {renderCrystal()}
            <View style={{ width: iconSize * 0.3 }} />
            {renderWordmark()}
          </View>
        );

      default:
        return renderCrystal();
    }
  };

  return (
    <View style={[styles.container, style]}>
      {renderContent()}
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

/**
 * Pre-configured logo for splash/welcome screens
 */
export function VoxSplashLogo(props: Omit<VoxLogoProps, 'size' | 'variant'>) {
  return <VoxLogo variant="full" size="splash" animated {...props} />;
}

/**
 * Pre-configured logo for auth screens
 */
export function VoxAuthLogo(props: Omit<VoxLogoProps, 'size' | 'variant'>) {
  return <VoxLogo variant="crystal" size="auth" animated {...props} />;
}

/**
 * Pre-configured logo for headers/navigation
 */
export function VoxHeaderLogo(props: Omit<VoxLogoProps, 'size' | 'variant'>) {
  return <VoxLogo variant="crystal" size="header" {...props} />;
}

export default VoxLogo;
