/**
 * SubtitleDisplay — Dialogue line renderer with 3 display modes
 *
 * Modes:
 * - hidden: centered atmospheric prompt (stages 1 & 4)
 * - target: target language dialogue lines (stage 2)
 * - translation: native language translations (stage 3)
 */

import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LISTENING, HIDDEN_PROMPTS } from './theme';

interface DialogueLine {
  speaker: string;
  text: string;
  translation: string;
}

interface SubtitleDisplayProps {
  /** Display mode */
  mode: 'hidden' | 'target' | 'translation';
  /** Dialogue lines to render */
  dialogueLines: DialogueLine[];
}

export default function SubtitleDisplay({
  mode,
  dialogueLines,
}: SubtitleDisplayProps) {
  // Pick a random prompt for hidden mode (stable per render cycle)
  const hiddenPrompt = useMemo(
    () => HIDDEN_PROMPTS[Math.floor(Math.random() * HIDDEN_PROMPTS.length)],
    [],
  );

  if (mode === 'hidden') {
    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        key="hidden"
        style={styles.hiddenContainer}
      >
        <Text
          style={styles.hiddenPrompt}
          accessibilityLabel={hiddenPrompt}
        >
          {hiddenPrompt}
        </Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      key={mode}
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {dialogueLines.map((line, index) => (
          <Animated.View
            key={`${mode}-${index}`}
            entering={FadeInDown.delay(index * 100).duration(300).springify()}
            style={styles.lineCard}
          >
            <Text style={styles.speakerName}>{line.speaker}</Text>
            <Text
              style={
                mode === 'target'
                  ? styles.lineTextTarget
                  : styles.lineTextTranslation
              }
            >
              {mode === 'target' ? line.text : line.translation}
            </Text>
          </Animated.View>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  hiddenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  hiddenPrompt: {
    fontSize: 16,
    fontWeight: '500',
    color: LISTENING.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  lineCard: {
    backgroundColor: LISTENING.glassBg,
    borderColor: LISTENING.glassBorder,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  speakerName: {
    fontSize: 12,
    fontWeight: '700',
    color: LISTENING.teal,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  lineTextTarget: {
    fontSize: 16,
    fontWeight: '600',
    color: LISTENING.textPrimary,
    lineHeight: 22,
  },
  lineTextTranslation: {
    fontSize: 16,
    fontWeight: '500',
    color: LISTENING.textSecondary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
});
