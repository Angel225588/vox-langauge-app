/**
 * PureAudioStage — Visual-only listening stage (no text)
 *
 * Shows animated waveform visualization while audio plays.
 * No words, no subtitles — pure ear training.
 * Used in Stage 1 (first listen) and Stage 3 (prove it).
 */

import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LISTENING } from './theme';

interface PureAudioStageProps {
  isSpeaking: boolean;
  /** 'listen' for Stage 1, 'prove' for Stage 3 */
  variant: 'listen' | 'prove';
}

// Waveform bar config (pre-computed heights and delays)
const BARS = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  height: 14 + Math.sin(i * 0.7) * 20 + Math.random() * 12,
  delay: i * 60,
}));

function WaveBar({ height, delay, active }: { height: number; delay: number; active: boolean }) {
  const anim = useSharedValue(0.4);

  useEffect(() => {
    if (active) {
      anim.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 500 + Math.random() * 300, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.4, { duration: 500 + Math.random() * 300, easing: Easing.inOut(Easing.ease) }),
          ),
          -1,
          false,
        ),
      );
    } else {
      anim.value = withTiming(0.3, { duration: 400 });
    }
  }, [active]);

  const style = useAnimatedStyle(() => ({
    height: height * anim.value,
    opacity: interpolate(anim.value, [0.3, 1], [0.3, 1]),
  }));

  return (
    <Animated.View
      style={[
        {
          width: 4,
          borderRadius: 2,
          backgroundColor: LISTENING.teal,
        },
        style,
      ]}
    />
  );
}

function PulseRing({ size, delay }: { size: number; delay: number }) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 0.5, 1], [0.15, 0.5, 0.15]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.08]) }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1.5,
          borderColor: 'rgba(6, 214, 160, 0.15)',
        },
        style,
      ]}
    />
  );
}

export default function PureAudioStage({ isSpeaking, variant }: PureAudioStageProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={styles.container}
    >
      {/* Pulse rings */}
      <View style={styles.waveContainer}>
        <PulseRing size={200} delay={0} />
        <PulseRing size={160} delay={400} />
        <PulseRing size={120} delay={800} />
        <PulseRing size={80} delay={1200} />

        {/* Center icon */}
        <View style={styles.centerIcon}>
          <Ionicons
            name={variant === 'listen' ? 'ear-outline' : 'musical-notes-outline'}
            size={32}
            color="#FFFFFF"
          />
        </View>
      </View>

      {/* Waveform bars */}
      <View style={styles.waveformBars}>
        {BARS.map(bar => (
          <WaveBar
            key={bar.id}
            height={bar.height}
            delay={bar.delay}
            active={isSpeaking}
          />
        ))}
      </View>

      {/* Status text */}
      <Text style={[styles.statusText, isSpeaking && styles.statusTextActive]}>
        {isSpeaking
          ? 'Listening to the dialogue...'
          : variant === 'prove'
            ? 'Now understand it naturally.'
            : 'Tap play to hear the dialogue'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  waveContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: LISTENING.teal,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: LISTENING.tealGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  waveformBars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 72,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
    color: LISTENING.textTertiary,
    textAlign: 'center',
  },
  statusTextActive: {
    color: LISTENING.teal,
  },
});
