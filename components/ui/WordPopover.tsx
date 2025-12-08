import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Simple phonetic mapping for common words (MVP)
const PHONETICS: Record<string, string> = {
  'she': '/ʃiː/',
  'sells': '/selz/',
  'seashells': '/ˈsiːʃelz/',
  'by': '/baɪ/',
  'the': '/ðə/',
  'seashore': '/ˈsiːʃɔːr/',
  'quick': '/kwɪk/',
  'brown': '/braʊn/',
  'fox': '/fɒks/',
  'jumps': '/dʒʌmps/',
  'over': '/ˈoʊvər/',
  'lazy': '/ˈleɪzi/',
  'dog': '/dɒɡ/',
  'peter': '/ˈpiːtər/',
  'piper': '/ˈpaɪpər/',
  'picked': '/pɪkt/',
  'peck': '/pek/',
  'pickled': '/ˈpɪkld/',
  'peppers': '/ˈpepərz/',
  'how': '/haʊ/',
  'much': '/mʌtʃ/',
  'wood': '/wʊd/',
  'would': '/wʊd/',
  'woodchuck': '/ˈwʊdtʃʌk/',
  'chuck': '/tʃʌk/',
  'if': '/ɪf/',
  'could': '/kʊd/',
  'betty': '/ˈbeti/',
  'botter': '/ˈbɒtər/',
  'bought': '/bɔːt/',
  'some': '/sʌm/',
  'butter': '/ˈbʌtər/',
  'but': '/bʌt/',
  'said': '/sed/',
  'bitter': '/ˈbɪtər/',
  'put': '/pʊt/',
  'it': '/ɪt/',
  'in': '/ɪn/',
  'my': '/maɪ/',
  'batter': '/ˈbætər/',
  'will': '/wɪl/',
  'make': '/meɪk/',
  'bit': '/bɪt/',
  'better': '/ˈbetər/',
  'so': '/soʊ/',
  'than': '/ðæn/',
  'her': '/hɜːr/',
};

interface WordPopoverProps {
  word: string;
  x: number;
  y: number;
  onClose: () => void;
  onPlay: () => void;
  onPlaySlow: () => void;
  onResume?: () => void;
}

export function WordPopover({
  word,
  x,
  y,
  onClose,
  onPlay,
  onPlaySlow,
  onResume,
}: WordPopoverProps) {
  const cleanWord = word.toLowerCase().replace(/[.,!?;:'"]/g, '');
  const phonetic = PHONETICS[cleanWord] || '/.../' ;

  // Calculate popover position
  const POPOVER_WIDTH = 200;
  const POPOVER_HEIGHT = 120;
  const ARROW_SIZE = 10;

  // Position popover above the word, centered
  let popoverX = x - POPOVER_WIDTH / 2;
  let popoverY = y - POPOVER_HEIGHT - ARROW_SIZE - 20;
  let arrowPosition: 'bottom' | 'top' = 'bottom';

  // Keep within screen bounds
  if (popoverX < spacing.md) {
    popoverX = spacing.md;
  } else if (popoverX + POPOVER_WIDTH > SCREEN_WIDTH - spacing.md) {
    popoverX = SCREEN_WIDTH - POPOVER_WIDTH - spacing.md;
  }

  // If not enough space above, show below
  if (popoverY < 100) {
    popoverY = y + 30;
    arrowPosition = 'top';
  }

  // Arrow x position relative to popover
  const arrowX = Math.max(20, Math.min(x - popoverX - ARROW_SIZE, POPOVER_WIDTH - 40));

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        style={[
          styles.popoverContainer,
          {
            left: popoverX,
            top: popoverY,
            width: POPOVER_WIDTH,
          },
        ]}
      >
        {/* Arrow pointing to word */}
        <View
          style={[
            styles.arrow,
            arrowPosition === 'bottom' ? styles.arrowBottom : styles.arrowTop,
            { left: arrowX },
          ]}
        />

        <BlurView intensity={40} tint="dark" style={styles.blurContainer}>
          <View style={styles.popoverContent}>
            {/* Word */}
            <Text style={styles.wordText}>{word}</Text>

            {/* Phonetic */}
            <Text style={styles.phoneticText}>{phonetic}</Text>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              {/* Play Normal */}
              <TouchableOpacity
                onPress={onPlay}
                activeOpacity={0.8}
                style={styles.playButton}
              >
                <LinearGradient
                  colors={colors.gradients.success}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.playButtonGradient}
                >
                  <Text style={styles.playButtonIcon}>🔊</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Play Slow */}
              <TouchableOpacity
                onPress={onPlaySlow}
                activeOpacity={0.8}
                style={styles.playButton}
              >
                <LinearGradient
                  colors={colors.gradients.secondary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.playButtonGradient}
                >
                  <Text style={styles.playButtonIcon}>🐢</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Resume (if handler provided) */}
              {onResume && (
                <TouchableOpacity
                  onPress={onResume}
                  activeOpacity={0.8}
                  style={styles.playButton}
                >
                  <LinearGradient
                    colors={colors.gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.playButtonGradient}
                  >
                    <Text style={styles.playButtonIcon}>▶️</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </BlurView>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  popoverContainer: {
    position: 'absolute',
    zIndex: 1001,
  },
  blurContainer: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  popoverContent: {
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: 'rgba(26, 31, 58, 0.85)',
  },
  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    zIndex: 1002,
  },
  arrowBottom: {
    bottom: -10,
    borderTopWidth: 10,
    borderTopColor: 'rgba(26, 31, 58, 0.9)',
  },
  arrowTop: {
    top: -10,
    borderBottomWidth: 10,
    borderBottomColor: 'rgba(26, 31, 58, 0.9)',
  },
  wordText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  phoneticText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.base,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  playButton: {
    shadowColor: colors.glow.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  playButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonIcon: {
    fontSize: 20,
  },
});
