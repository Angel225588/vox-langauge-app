/**
 * Key Phrases Screen — Pre-call vocabulary preview
 *
 * Shows scenario-specific phrases the user will need during the call.
 * Each phrase has audio playback. "Start the Call" CTA at bottom.
 */

import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, borderRadius } from '@/constants/designSystem';
import { fonts } from '@/constants/fonts';

interface Phrase {
  text: string;
  translation: string;
}

interface KeyPhrasesScreenProps {
  scenarioTitle: string;
  phrases: Phrase[];
  onStartCall: () => void;
  onBack: () => void;
  onPlayPhrase?: (phrase: string) => void;
}

export function KeyPhrasesScreen({
  scenarioTitle,
  phrases,
  onStartCall,
  onBack,
  onPlayPhrase,
}: KeyPhrasesScreenProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Key Phrases</Text>
          <Text style={styles.headerSubtitle}>{scenarioTitle}</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Section label */}
      <Text style={styles.sectionLabel}>PHRASES YOU'LL NEED</Text>

      {/* Phrases list */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {phrases.map((phrase, i) => (
          <View key={i} style={styles.phraseCard}>
            <View style={styles.phraseText}>
              <Text style={styles.phraseOriginal}>{phrase.text}</Text>
              <Text style={styles.phraseTranslation}>{phrase.translation}</Text>
            </View>
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onPlayPhrase?.(phrase.text);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="play" size={18} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onStartCall();
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="call" size={20} color="#FFFFFF" />
          <Text style={styles.startButtonText}>Start the Call</Text>
        </TouchableOpacity>
        <Text style={styles.footerHint}>You can review these during the call</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: fonts.display.bold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.xs,
    fontFamily: fonts.body.regular,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: fonts.display.semiBold,
    color: colors.secondary.DEFAULT,
    letterSpacing: 1,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  phraseCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  phraseText: {
    flex: 1,
    gap: 4,
  },
  phraseOriginal: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.display.semiBold,
    color: colors.text.primary,
  },
  phraseTranslation: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.body.regular,
    color: colors.text.tertiary,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  startButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 16,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary.DEFAULT,
  },
  startButtonText: {
    fontSize: typography.fontSize.lg,
    fontFamily: fonts.display.bold,
    color: '#FFFFFF',
  },
  footerHint: {
    fontSize: typography.fontSize.xs,
    fontFamily: fonts.body.regular,
    color: colors.text.disabled,
  },
});
