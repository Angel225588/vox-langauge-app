/**
 * Practice Tab - Free Practice Zone
 *
 * Users come here to practice freely, following their goals passively,
 * earn points and build confidence.
 *
 * Structure:
 * - Header with Points (VoxIcon) + Streak
 * - My Content (Notes & Recordings)
 * - Today's Progress (collapsed = progress bar only, expandable)
 * - Quick Practice (premium horizontal cards)
 * - Practice Activities with XP badges
 * - Dev tools hidden at bottom (collapsible)
 */

import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { VoxIcon } from '@/components/ui/rewards';
import { Icon } from '@/components/ui/Icon';

const { width } = Dimensions.get('window');

// Revolut-inspired brand colors (single accent on dark backgrounds)
// Following Vox brand: Electric Blue (#0036FF) and VoxIcon purple (#6366F1)
const brandAccent = {
  primary: '#6366F1',      // VoxIcon purple - our accent color
  glow: 'rgba(99, 102, 241, 0.15)',  // Subtle glow
  border: 'rgba(99, 102, 241, 0.2)', // Very subtle border
  iconBg: 'rgba(99, 102, 241, 0.08)', // Ultra subtle icon background
};

// Quick practice actions data - differentiated by subtle elevation, not color
const quickActions = [
  { id: '5min', emoji: '⚡', label: '5-Min Sprint', sublabel: 'Quick workout', xp: 15 },
  { id: 'random', emoji: '🎲', label: 'Random Word', sublabel: 'Surprise me', xp: 5 },
  { id: 'weak', emoji: '💪', label: 'Weak Words', sublabel: 'Need practice', xp: 20 },
];

export default function PracticeScreen() {
  const router = useRouter();
  const [showDevTools, setShowDevTools] = useState(false);
  const [progressExpanded, setProgressExpanded] = useState(false);

  // Mock data - replace with real data from context/store
  const [todayXP, setTodayXP] = useState(45);
  const totalPoints = 1250;
  const dailyGoal = 100;
  const streak = 5;
  const minutesPracticed = 12;
  const activitiesCompleted = 3;

  // Animated progress bar
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withDelay(300, withSpring((todayXP / dailyGoal) * 100, { damping: 15 }));
  }, [todayXP]);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  // Navigation handlers
  const handleReadingPractice = () => router.push('/library');
  const handleWritingTask = () => router.push('/test-writing-task');
  const handleVocabPractice = () => router.push('/vocab-practice/vocab-1');
  const handleVoiceConversation = () => router.push('/voice-conversation');
  const handleNotesLibrary = () => router.push('/notes-library');
  const handleRecordingsLibrary = () => router.push('/recordings-library');

  // Quick practice handlers
  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case '5min':
        router.push('/vocab-practice/vocab-1');
        break;
      case 'random':
        router.push('/vocab-practice/vocab-1');
        break;
      case 'weak':
        router.push('/vocab-practice/vocab-1');
        break;
    }
  };

  // Dev tools
  const handleVoiceSystemTest = () => router.push('/test-voice-system');
  const handleElevenLabsTest = () => router.push('/test-elevenlabs');
  const handleGeminiTest = () => router.push('/test-gemini-live');
  const handleTestCards = () => router.push('/test-cards');
  const handleInteractiveScenario = () => router.push('/test-interactive-scenario');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }} edges={['top', 'bottom']}>
      {/* Header with Points + Streak */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.md,
      }}>
        {/* Title */}
        <Text style={{
          fontSize: typography.fontSize['2xl'],
          fontWeight: typography.fontWeight.bold,
          color: colors.text.primary,
        }}>
          Practice Zone
        </Text>

        {/* Points + Streak (same as Home page) */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
          {/* Vox Points */}
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center' }}
            activeOpacity={0.7}
          >
            <VoxIcon size="sm" />
            <Text style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              marginLeft: spacing.xs,
            }}>
              {totalPoints}
            </Text>
          </TouchableOpacity>

          {/* Streak */}
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center' }}
            activeOpacity={0.7}
          >
            <Icon name="flame" size="lg" color="warning" />
            <Text style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              marginLeft: spacing.xs,
            }}>
              {streak}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing['3xl'] }}
      >
        {/* My Content Section - FIRST */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <Text style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            marginBottom: spacing.md,
          }}>
            My Content
          </Text>

          <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg }}>
            {/* Notes Library */}
            <TouchableOpacity
              onPress={handleNotesLibrary}
              activeOpacity={0.9}
              style={{ flex: 1 }}
            >
              <View style={{
                borderRadius: borderRadius.xl,
                backgroundColor: colors.background.card,
                borderWidth: 1,
                borderColor: colors.primary.DEFAULT + '40',
                padding: spacing.lg,
                alignItems: 'center',
                ...shadows.sm,
              }}>
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: borderRadius.lg,
                  backgroundColor: colors.primary.DEFAULT + '15',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: spacing.sm,
                }}>
                  <Ionicons name="document-text" size={24} color={colors.primary.DEFAULT} />
                </View>
                <Text style={{
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                }}>
                  My Notes
                </Text>
              </View>
            </TouchableOpacity>

            {/* Recordings Library */}
            <TouchableOpacity
              onPress={handleRecordingsLibrary}
              activeOpacity={0.9}
              style={{ flex: 1 }}
            >
              <View style={{
                borderRadius: borderRadius.xl,
                backgroundColor: colors.background.card,
                borderWidth: 1,
                borderColor: colors.error.DEFAULT + '40',
                padding: spacing.lg,
                alignItems: 'center',
                ...shadows.sm,
              }}>
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: borderRadius.lg,
                  backgroundColor: colors.error.DEFAULT + '15',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: spacing.sm,
                }}>
                  <Ionicons name="mic" size={24} color={colors.error.DEFAULT} />
                </View>
                <Text style={{
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                }}>
                  Recordings
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Today's Progress - Collapsible */}
        <Animated.View entering={FadeInDown.duration(400).delay(50)}>
          <TouchableOpacity
            onPress={() => setProgressExpanded(!progressExpanded)}
            activeOpacity={0.9}
            style={{ marginBottom: spacing.lg }}
          >
            <View style={{
              backgroundColor: colors.background.card,
              borderRadius: borderRadius.xl,
              padding: spacing.md,
              borderWidth: 1,
              borderColor: colors.success.DEFAULT + '30',
              ...shadows.sm,
            }}>
              {/* Collapsed View - Just Progress Bar with Points */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
              }}>
                {/* Progress Bar */}
                <View style={{
                  flex: 1,
                  height: 10,
                  backgroundColor: colors.background.elevated,
                  borderRadius: borderRadius.full,
                  overflow: 'hidden',
                }}>
                  <Animated.View style={[{ height: '100%', borderRadius: borderRadius.full }, progressBarStyle]}>
                    <LinearGradient
                      colors={colors.gradients.success}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ flex: 1, borderRadius: borderRadius.full }}
                    />
                  </Animated.View>
                </View>

                {/* XP with VoxIcon */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <VoxIcon size="xs" />
                  <Text style={{
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.success.DEFAULT,
                    marginLeft: spacing.xs,
                  }}>
                    {todayXP}/{dailyGoal}
                  </Text>
                </View>

                {/* Expand Indicator */}
                <Ionicons
                  name={progressExpanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.text.tertiary}
                />
              </View>

              {/* Expanded View - Full Stats */}
              {progressExpanded && (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  style={{
                    marginTop: spacing.md,
                    paddingTop: spacing.md,
                    borderTopWidth: 1,
                    borderTopColor: colors.border.light,
                  }}
                >
                  <Text style={{
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    marginBottom: spacing.md,
                  }}>
                    Today's Progress
                  </Text>

                  <View style={{ flexDirection: 'row', gap: spacing.xl }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="time-outline" size={16} color={colors.text.secondary} />
                      <Text style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.text.secondary,
                        marginLeft: spacing.xs,
                      }}>
                        {minutesPracticed} min
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.success.DEFAULT} />
                      <Text style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.text.secondary,
                        marginLeft: spacing.xs,
                      }}>
                        {activitiesCompleted} activities
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Practice Section - Premium Cards */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <Text style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            marginBottom: spacing.md,
          }}>
            Quick Practice
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: spacing.lg }}
            style={{ marginHorizontal: -spacing.lg, paddingHorizontal: spacing.lg, marginBottom: spacing.lg }}
          >
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={action.id}
                onPress={() => handleQuickAction(action.id)}
                activeOpacity={0.85}
                style={{ marginRight: spacing.md }}
              >
                {/* Revolut-style Card - Dark with single brand accent */}
                <View style={{
                  width: 140,
                  backgroundColor: colors.background.card,
                  borderRadius: borderRadius.xl,
                  padding: spacing.lg,
                  borderWidth: 1,
                  borderColor: brandAccent.border,
                  // Subtle brand glow
                  shadowColor: brandAccent.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 16,
                  elevation: 3,
                }}>
                  {/* Emoji - large, no background (clean like Revolut) */}
                  <View style={{
                    width: 52,
                    height: 52,
                    borderRadius: borderRadius.xl,
                    backgroundColor: brandAccent.iconBg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: spacing.md,
                  }}>
                    <Text style={{ fontSize: 28 }}>{action.emoji}</Text>
                  </View>

                  {/* Label - Clean white */}
                  <Text style={{
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    marginBottom: spacing.xs,
                    lineHeight: 20,
                  }}>
                    {action.label}
                  </Text>

                  {/* Sublabel - Grey (Revolut style hierarchy) */}
                  <Text style={{
                    fontSize: typography.fontSize.xs,
                    color: colors.text.tertiary,
                    marginBottom: spacing.md,
                  }}>
                    {action.sublabel}
                  </Text>

                  {/* XP Badge - Brand accent */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: brandAccent.iconBg,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs,
                    borderRadius: borderRadius.md,
                    alignSelf: 'flex-start',
                  }}>
                    <VoxIcon size="xs" />
                    <Text style={{
                      fontSize: typography.fontSize.xs,
                      fontWeight: typography.fontWeight.bold,
                      color: brandAccent.primary,
                      marginLeft: spacing.xs,
                    }}>
                      +{action.xp}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Practice Activities Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(150)}>
          <Text style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            marginBottom: spacing.md,
          }}>
            Practice Activities
          </Text>

          {/* Voice Conversation - Hero Card */}
          <TouchableOpacity
            onPress={handleVoiceConversation}
            activeOpacity={0.9}
            style={{ marginBottom: spacing.md }}
          >
            <LinearGradient
              colors={colors.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: borderRadius.xl,
                padding: spacing.lg,
                ...shadows.glow.primary,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 56,
                  height: 56,
                  borderRadius: borderRadius.xl,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: spacing.md,
                }}>
                  <Ionicons name="mic" size={28} color={colors.text.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
                    <Text style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.bold,
                      color: colors.text.primary,
                    }}>
                      Voice Conversation
                    </Text>
                    <View style={{
                      backgroundColor: colors.secondary.DEFAULT,
                      paddingHorizontal: spacing.sm,
                      paddingVertical: 2,
                      borderRadius: borderRadius.sm,
                      marginLeft: spacing.sm,
                    }}>
                      <Text style={{ fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, color: colors.background.primary }}>
                        AI
                      </Text>
                    </View>
                  </View>
                  <Text style={{
                    fontSize: typography.fontSize.sm,
                    color: 'rgba(255, 255, 255, 0.8)',
                  }}>
                    Practice speaking with AI tutor
                  </Text>
                </View>
                {/* XP Badge */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xs,
                  borderRadius: borderRadius.md,
                }}>
                  <VoxIcon size="xs" />
                  <Text style={{
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.text.primary,
                    marginLeft: spacing.xs,
                  }}>
                    +30
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Vocabulary Practice */}
          <TouchableOpacity
            onPress={handleVocabPractice}
            activeOpacity={0.9}
            style={{ marginBottom: spacing.md }}
          >
            <LinearGradient
              colors={colors.gradients.warning}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: borderRadius.xl,
                padding: spacing.lg,
                ...shadows.md,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: borderRadius.lg,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: spacing.md,
                }}>
                  <Ionicons name="fitness" size={24} color={colors.background.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.background.primary,
                    marginBottom: spacing.xs,
                  }}>
                    Vocabulary Practice
                  </Text>
                  <Text style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.background.primary + 'B3',
                  }}>
                    5-card flow
                  </Text>
                </View>
                {/* XP Badge */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xs,
                  borderRadius: borderRadius.md,
                }}>
                  <VoxIcon size="xs" />
                  <Text style={{
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.background.primary,
                    marginLeft: spacing.xs,
                  }}>
                    +25
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Reading Practice */}
          <TouchableOpacity
            onPress={handleReadingPractice}
            activeOpacity={0.9}
            style={{ marginBottom: spacing.md }}
          >
            <View style={{
              borderRadius: borderRadius.xl,
              backgroundColor: colors.background.card,
              borderWidth: 1,
              borderColor: colors.primary.DEFAULT + '30',
              padding: spacing.lg,
              ...shadows.sm,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: borderRadius.lg,
                  backgroundColor: colors.primary.DEFAULT + '15',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: spacing.md,
                }}>
                  <Ionicons name="book" size={24} color={colors.primary.DEFAULT} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    marginBottom: spacing.xs,
                  }}>
                    Reading Practice
                  </Text>
                  <Text style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.text.secondary,
                  }}>
                    Teleprompter & pronunciation
                  </Text>
                </View>
                {/* XP Badge */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.primary.DEFAULT + '20',
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xs,
                  borderRadius: borderRadius.md,
                }}>
                  <VoxIcon size="xs" />
                  <Text style={{
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.primary.DEFAULT,
                    marginLeft: spacing.xs,
                  }}>
                    +20
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Writing Tasks */}
          <TouchableOpacity
            onPress={handleWritingTask}
            activeOpacity={0.9}
            style={{ marginBottom: spacing.md }}
          >
            <View style={{
              borderRadius: borderRadius.xl,
              backgroundColor: colors.background.card,
              borderWidth: 1,
              borderColor: colors.secondary.DEFAULT + '30',
              padding: spacing.lg,
              ...shadows.sm,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: borderRadius.lg,
                  backgroundColor: colors.secondary.DEFAULT + '15',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: spacing.md,
                }}>
                  <Ionicons name="create" size={24} color={colors.secondary.DEFAULT} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    marginBottom: spacing.xs,
                  }}>
                    Writing Tasks
                  </Text>
                  <Text style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.text.secondary,
                  }}>
                    Personal Script Builder
                  </Text>
                </View>
                {/* XP Badge */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.secondary.DEFAULT + '20',
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xs,
                  borderRadius: borderRadius.md,
                }}>
                  <VoxIcon size="xs" />
                  <Text style={{
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.secondary.DEFAULT,
                    marginLeft: spacing.xs,
                  }}>
                    +15
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Developer Tools Section - Collapsible */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)} style={{ marginTop: spacing.xl }}>
          <TouchableOpacity
            onPress={() => setShowDevTools(!showDevTools)}
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: spacing.sm,
            }}
          >
            <Text style={{
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.tertiary,
            }}>
              Developer Tools
            </Text>
            <Ionicons
              name={showDevTools ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.text.tertiary}
            />
          </TouchableOpacity>

          {showDevTools && (
            <View style={{
              marginTop: spacing.sm,
              gap: spacing.sm,
            }}>
              {/* Test Cards */}
              <TouchableOpacity
                onPress={handleTestCards}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.background.card,
                  borderRadius: borderRadius.md,
                  padding: spacing.md,
                  borderWidth: 1,
                  borderColor: colors.border.light,
                }}
              >
                <Ionicons name="grid" size={20} color={colors.text.tertiary} style={{ marginRight: spacing.sm }} />
                <Text style={{ flex: 1, color: colors.text.secondary, fontSize: typography.fontSize.sm }}>
                  Test All Cards
                </Text>
                <View style={{
                  backgroundColor: colors.text.tertiary + '30',
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 2,
                  borderRadius: borderRadius.sm,
                }}>
                  <Text style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary }}>DEV</Text>
                </View>
              </TouchableOpacity>

              {/* Voice System Test */}
              <TouchableOpacity
                onPress={handleVoiceSystemTest}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.background.card,
                  borderRadius: borderRadius.md,
                  padding: spacing.md,
                  borderWidth: 1,
                  borderColor: colors.border.light,
                }}
              >
                <Ionicons name="mic-outline" size={20} color={colors.text.tertiary} style={{ marginRight: spacing.sm }} />
                <Text style={{ flex: 1, color: colors.text.secondary, fontSize: typography.fontSize.sm }}>
                  Voice System Test
                </Text>
                <View style={{
                  backgroundColor: colors.success.DEFAULT + '30',
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 2,
                  borderRadius: borderRadius.sm,
                }}>
                  <Text style={{ fontSize: typography.fontSize.xs, color: colors.success.DEFAULT }}>REC</Text>
                </View>
              </TouchableOpacity>

              {/* ElevenLabs Test */}
              <TouchableOpacity
                onPress={handleElevenLabsTest}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.background.card,
                  borderRadius: borderRadius.md,
                  padding: spacing.md,
                  borderWidth: 1,
                  borderColor: colors.border.light,
                }}
              >
                <Ionicons name="chatbubble-outline" size={20} color={colors.text.tertiary} style={{ marginRight: spacing.sm }} />
                <Text style={{ flex: 1, color: colors.text.secondary, fontSize: typography.fontSize.sm }}>
                  ElevenLabs Voice Test
                </Text>
                <View style={{
                  backgroundColor: colors.primary.DEFAULT + '30',
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 2,
                  borderRadius: borderRadius.sm,
                }}>
                  <Text style={{ fontSize: typography.fontSize.xs, color: colors.primary.light }}>NEW</Text>
                </View>
              </TouchableOpacity>

              {/* Gemini Test */}
              <TouchableOpacity
                onPress={handleGeminiTest}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.background.card,
                  borderRadius: borderRadius.md,
                  padding: spacing.md,
                  borderWidth: 1,
                  borderColor: colors.border.light,
                }}
              >
                <Ionicons name="flash-outline" size={20} color={colors.text.tertiary} style={{ marginRight: spacing.sm }} />
                <Text style={{ flex: 1, color: colors.text.secondary, fontSize: typography.fontSize.sm }}>
                  Gemini Live API Test
                </Text>
                <View style={{
                  backgroundColor: colors.text.tertiary + '30',
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 2,
                  borderRadius: borderRadius.sm,
                }}>
                  <Text style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary }}>DEV</Text>
                </View>
              </TouchableOpacity>

              {/* Interactive Scenario Test */}
              <TouchableOpacity
                onPress={handleInteractiveScenario}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.background.card,
                  borderRadius: borderRadius.md,
                  padding: spacing.md,
                  borderWidth: 1,
                  borderColor: colors.secondary.DEFAULT + '40',
                }}
              >
                <Ionicons name="chatbubbles-outline" size={20} color={colors.secondary.DEFAULT} style={{ marginRight: spacing.sm }} />
                <Text style={{ flex: 1, color: colors.text.secondary, fontSize: typography.fontSize.sm }}>
                  Interactive Scenarios
                </Text>
                <View style={{
                  backgroundColor: colors.secondary.DEFAULT + '30',
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 2,
                  borderRadius: borderRadius.sm,
                }}>
                  <Text style={{ fontSize: typography.fontSize.xs, color: colors.secondary.DEFAULT }}>NEW</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
