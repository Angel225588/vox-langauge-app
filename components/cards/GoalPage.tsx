/**
 * Goal Page Component
 *
 * Pre-call briefing screen that shows:
 * - Mission/Scenario overview
 * - Skills you'll practice
 * - Your gain (how it helps fluency)
 * - Motivational quote
 * - Start Call CTA
 *
 * Part of the Voice Call flow:
 * Scenario Selection → Goal Page → Calling Screen → Feedback
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';
import { VoiceScenario } from '@/lib/voice';

// =============================================================================
// Types
// =============================================================================

export interface GoalPageProps {
  scenario: VoiceScenario;
  onStartCall: () => void;
  onBack: () => void;
}

// =============================================================================
// Motivational Quotes
// =============================================================================

const MOTIVATIONAL_QUOTES = [
  "The only failure is not trying.",
  "Every conversation is a step forward.",
  "Fluency comes from practice, not perfection.",
  "Your voice is your superpower. Use it.",
  "Mistakes are proof you're trying.",
  "Speak today. Understand tomorrow.",
  "The best time to practice was yesterday. The second best is now.",
];

const getRandomQuote = () => {
  return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
};

// =============================================================================
// Scenario Skills Mapping
// =============================================================================

const getScenarioSkills = (scenario: VoiceScenario): string[] => {
  const categorySkills: Record<string, string[]> = {
    'food': ['Food vocabulary', 'Polite requests', 'Numbers & prices'],
    'travel': ['Direction vocabulary', 'Asking for help', 'Location descriptions'],
    'shopping': ['Product descriptions', 'Negotiation phrases', 'Numbers & sizes'],
    'social': ['Introductions', 'Small talk', 'Question forms'],
    'business': ['Formal language', 'Professional expressions', 'Meeting vocabulary'],
    'emergency': ['Urgent requests', 'Medical vocabulary', 'Clear communication'],
  };

  const difficultySkills: Record<string, string[]> = {
    'beginner': ['Basic greetings', 'Simple sentences', 'Common phrases'],
    'intermediate': ['Complex sentences', 'Expressing opinions', 'Past/future tense'],
    'advanced': ['Idiomatic expressions', 'Nuanced vocabulary', 'Natural flow'],
  };

  const skills = categorySkills[scenario.category || 'social'] || categorySkills.social;
  const levelSkill = difficultySkills[scenario.difficulty || 'beginner']?.[0];

  return levelSkill ? [levelSkill, ...skills.slice(0, 2)] : skills.slice(0, 3);
};

const getScenarioGain = (scenario: VoiceScenario): string => {
  const gains: Record<string, string> = {
    'beginner': 'Build confidence with basic interactions',
    'intermediate': 'Handle real-world situations independently',
    'advanced': 'Sound natural and fluent in any context',
  };

  return gains[scenario.difficulty || 'beginner'] || gains.beginner;
};

// =============================================================================
// Animated Call Button
// =============================================================================

const AnimatedCallButton: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  React.useEffect(() => {
    // Pulse animation
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Glow animation
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && { transform: [{ scale: 0.97 }] }}>
      <View style={callButtonStyles.container}>
        {/* Glow effect */}
        <Animated.View style={[callButtonStyles.glow, glowStyle]} />

        {/* Button */}
        <Animated.View style={[callButtonStyles.button, pulseStyle]}>
          <LinearGradient
            colors={colors.gradients.primary}
            style={callButtonStyles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="call" size={28} color="#FFFFFF" />
            <Text style={callButtonStyles.text}>Start Call</Text>
          </LinearGradient>
        </Animated.View>
      </View>
    </Pressable>
  );
};

const callButtonStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary.DEFAULT,
    transform: [{ scale: 1.1 }],
  },
  button: {
    width: '100%',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  text: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
});

// =============================================================================
// Info Card Component
// =============================================================================

interface InfoCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  content: string | string[];
  iconColor?: string;
  delay?: number;
}

const InfoCard: React.FC<InfoCardProps> = ({
  icon,
  title,
  content,
  iconColor = colors.primary.DEFAULT,
  delay = 0,
}) => {
  return (
    <Animated.View
      entering={FadeInUp.duration(400).delay(delay)}
      style={infoCardStyles.container}
    >
      <View style={[infoCardStyles.iconContainer, { backgroundColor: iconColor + '15' }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <View style={infoCardStyles.content}>
        <Text style={infoCardStyles.title}>{title}</Text>
        {Array.isArray(content) ? (
          <View style={infoCardStyles.bulletList}>
            {content.map((item, index) => (
              <View key={index} style={infoCardStyles.bulletItem}>
                <View style={infoCardStyles.bullet} />
                <Text style={infoCardStyles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={infoCardStyles.text}>{content}</Text>
        )}
      </View>
    </Animated.View>
  );
};

const infoCardStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  text: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    lineHeight: typography.fontSize.base * 1.5,
  },
  bulletList: {
    gap: spacing.xs,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary.DEFAULT,
  },
  bulletText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
});

// =============================================================================
// Main Component
// =============================================================================

export const GoalPage: React.FC<GoalPageProps> = ({
  scenario,
  onStartCall,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const quote = React.useMemo(() => getRandomQuote(), []);
  const skills = React.useMemo(() => getScenarioSkills(scenario), [scenario]);
  const gain = React.useMemo(() => getScenarioGain(scenario), [scenario]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View
        entering={FadeIn}
        style={[styles.header, { paddingTop: insets.top + spacing.sm }]}
      >
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Your Mission</Text>
        </View>
        <TouchableOpacity onPress={onStartCall} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Scenario Overview */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.scenarioHeader}>
          <View style={styles.scenarioIconContainer}>
            <Ionicons name="chatbubbles" size={32} color={colors.primary.DEFAULT} />
          </View>
          <Text style={styles.scenarioTitle}>{scenario.title}</Text>
          <Text style={styles.scenarioDescription}>{scenario.description}</Text>
        </Animated.View>

        {/* Info Cards */}
        <View style={styles.cardsContainer}>
          <InfoCard
            icon="locate-outline"
            title="Scenario"
            content={scenario.description || 'Practice real conversation skills in this interactive scenario.'}
            iconColor={colors.primary.DEFAULT}
            delay={200}
          />

          <InfoCard
            icon="sparkles-outline"
            title="What You'll Practice"
            content={skills}
            iconColor={colors.secondary.DEFAULT}
            delay={300}
          />

          <InfoCard
            icon="trophy-outline"
            title="Your Gain"
            content={gain}
            iconColor={colors.warning.DEFAULT}
            delay={400}
          />
        </View>

        {/* Motivational Quote */}
        <Animated.View entering={FadeInUp.duration(400).delay(500)} style={styles.quoteContainer}>
          <View style={styles.quoteLine} />
          <Text style={styles.quoteText}>"{quote}"</Text>
          <View style={styles.quoteLine} />
        </Animated.View>
      </ScrollView>

      {/* Bottom CTA */}
      <Animated.View
        entering={FadeInUp.duration(400).delay(600)}
        style={[styles.bottomContainer, { paddingBottom: insets.bottom + spacing.md }]}
      >
        <AnimatedCallButton onPress={onStartCall} />
      </Animated.View>
    </View>
  );
};

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  skipButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  skipText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.medium,
  },

  // Scroll Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.lg,
  },

  // Scenario Header
  scenarioHeader: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  scenarioIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary.DEFAULT + '30',
  },
  scenarioTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  scenarioDescription: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.base * 1.5,
    paddingHorizontal: spacing.lg,
  },

  // Cards
  cardsContainer: {
    gap: spacing.md,
  },

  // Quote
  quoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  quoteLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.light,
  },
  quoteText: {
    fontSize: typography.fontSize.sm,
    fontStyle: 'italic',
    color: colors.text.tertiary,
    textAlign: 'center',
    maxWidth: '60%',
  },

  // Bottom CTA
  bottomContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background.primary,
  },
});

export default GoalPage;
