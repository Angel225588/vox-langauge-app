/**
 * Mini-Lesson List Screen
 *
 * Displays 5 mini-lessons when user taps a stair
 * Full-width image banner with gradient overlay + vertical card list
 * All cards same size with type badges
 */

import { View, Text, ScrollView, TouchableOpacity, Dimensions, ImageBackground } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';
import {
  getMiniLessonsForStair,
  getUserProgressForMiniLessons
} from '@/lib/db/mock-mini-lessons';
import { MiniLesson, UserMiniLessonProgress, MiniLessonCategory } from '@/lib/types/mini-lesson';

const { width, height } = Dimensions.get('window');

export default function LessonScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Get mini-lessons for this stair
  const miniLessons = getMiniLessonsForStair(id);
  const miniLessonIds = miniLessons.map(ml => ml.id);
  const userProgress = getUserProgressForMiniLessons('user-123', miniLessonIds);

  // Find the stair info from the mock data (in real app, fetch from DB)
  const MOCK_STAIRS = [
    {
      id: '1',
      title: 'Professional Greetings',
      emoji: '👋',
      description: 'Master formal introductions for job interviews',
    },
    {
      id: '2',
      title: 'Self Introduction',
      emoji: '💼',
      description: 'Present your background and experience confidently',
    },
  ];

  const stair = MOCK_STAIRS.find(s => s.id === id) || MOCK_STAIRS[0];

  // Calculate progress
  const completedCount = userProgress.filter(p => p.status === 'completed').length;
  const totalCount = miniLessons.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  const handleMiniLessonPress = (miniLesson: MiniLesson, progress?: UserMiniLessonProgress) => {
    if (progress?.status === 'locked') {
      // Show locked message or do nothing
      return;
    }

    // Navigate to mini-lesson flow screen
    router.push(`/mini-lesson/${miniLesson.id}`);
  };

  const handleBackPress = () => {
    router.back();
  };

  // Get banner image URL (from Unsplash - business/professional theme)
  const bannerImageUrl = `https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=400&fit=crop`; // Team meeting

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Hero Banner with Image */}
        <ImageBackground
          source={{ uri: bannerImageUrl }}
          style={{ width: width, height: 300 }}
          resizeMode="cover"
        >
          {/* Dark Gradient Overlay */}
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
            style={{ flex: 1, justifyContent: 'space-between', padding: spacing.xl, paddingTop: spacing['2xl'] }}
          >
            {/* Back Button */}
            <TouchableOpacity
              onPress={handleBackPress}
              style={{
                width: spacing.xl + spacing.sm,
                height: spacing.xl + spacing.sm,
                borderRadius: borderRadius.full,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: typography.fontSize.xl, color: colors.text.primary }}>←</Text>
            </TouchableOpacity>

            {/* Banner Content */}
            <View>
              <Text
                style={{
                  fontSize: typography.fontSize['4xl'],
                  fontWeight: typography.fontWeight.bold,
                  color: colors.text.primary,
                  marginBottom: spacing.xs,
                }}
              >
                {stair.title}
              </Text>
              <Text
                style={{
                  fontSize: typography.fontSize.base,
                  color: colors.text.secondary,
                  marginBottom: spacing.lg,
                }}
              >
                {stair.description}
              </Text>

              {/* Progress Bar */}
              <View style={{ marginBottom: spacing.xs }}>
                <Text
                  style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.text.secondary,
                    marginBottom: spacing.sm,
                  }}
                >
                  {completedCount}/{totalCount} completed · {Math.round(progressPercentage)}%
                </Text>
                <View
                  style={{
                    width: '100%',
                    height: spacing.sm,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: borderRadius.full,
                    overflow: 'hidden',
                  }}
                >
                  <Animated.View
                    entering={FadeIn.duration(800).delay(200)}
                    style={{
                      width: `${progressPercentage}%`,
                      height: '100%',
                      backgroundColor: colors.success.DEFAULT,
                    }}
                  />
                </View>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* Mini-Lessons List - All Same Size */}
        <LinearGradient
          colors={[colors.background.primary, colors.background.secondary]}
          style={{
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.xl,
            paddingBottom: spacing['3xl'] + spacing.xl,
          }}
        >
          {miniLessons.map((miniLesson, index) => {
            const progress = userProgress.find(p => p.mini_lesson_id === miniLesson.id);
            return (
              <MiniLessonCard
                key={miniLesson.id}
                miniLesson={miniLesson}
                progress={progress}
                index={index}
                onPress={() => handleMiniLessonPress(miniLesson, progress)}
              />
            );
          })}
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

// Helper function to get category badge color and label
const getCategoryBadge = (category: MiniLessonCategory) => {
  switch (category) {
    case 'vocabulary':
      return { color: colors.accent.blue, label: 'Vocabulary' }; // Blue
    case 'listening':
      return { color: colors.success.DEFAULT, label: 'Listening' }; // Green
    case 'speaking':
      return { color: colors.accent.purple, label: 'Speaking' }; // Purple
    case 'reading':
      return { color: colors.warning.DEFAULT, label: 'Reading' }; // Amber
    case 'grammar':
      return { color: colors.accent.pink, label: 'Grammar' }; // Pink
    case 'test':
      return { color: colors.warning.DEFAULT, label: 'Test' }; // Amber
    default:
      return { color: colors.text.disabled, label: 'Lesson' }; // Gray
  }
};

function MiniLessonCard({
  miniLesson,
  progress,
  index,
  onPress,
}: {
  miniLesson: MiniLesson;
  progress?: UserMiniLessonProgress;
  index: number;
  onPress: () => void;
}) {
  const status = progress?.status || 'locked';
  const isLocked = status === 'locked';
  const isCurrent = status === 'current';
  const isCompleted = status === 'completed';

  const categoryBadge = getCategoryBadge(miniLesson.category);

  const getGradientColors = () => {
    if (isCompleted) {
      return colors.gradients.success;
    }
    if (isCurrent) {
      return colors.gradients.primary;
    }
    return ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)'];
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(500).delay(100 + index * 80).springify()}
      style={{
        marginBottom: spacing.md,
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        disabled={isLocked}
        activeOpacity={0.9}
        style={{
          borderRadius: borderRadius.xl,
          borderWidth: isCurrent ? 3 : 1,
          borderColor: isCurrent
            ? colors.gradients.primary[0]
            : isLocked
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(255, 255, 255, 0.2)',
          overflow: 'hidden',
          opacity: isLocked ? 0.6 : 1,
        }}
      >
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingVertical: spacing.lg,
            paddingHorizontal: spacing.lg,
            height: 120, // Fixed height for all cards
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: isCurrent ? colors.glow.primary : 'transparent',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isCurrent ? 0.6 : 0,
            shadowRadius: isCurrent ? 16 : 0,
            elevation: isCurrent ? 10 : 0,
          }}
        >
          {/* Icon */}
          <View
            style={{
              width: spacing['3xl'],
              height: spacing['3xl'],
              borderRadius: borderRadius.full,
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: spacing.lg,
            }}
          >
            {isLocked ? (
              <Text style={{ fontSize: typography.fontSize['3xl'] + 2 }}>🔒</Text>
            ) : isCompleted ? (
              <Text style={{ fontSize: typography.fontSize['3xl'] + 2 }}>✅</Text>
            ) : (
              <Text style={{ fontSize: typography.fontSize['3xl'] + 2 }}>{miniLesson.icon}</Text>
            )}
          </View>

          {/* Content */}
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Text
              style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
                marginBottom: spacing.xs,
              }}
            >
              {miniLesson.title}
            </Text>

            {/* Metadata Row */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                marginBottom: spacing.xs,
              }}
            >
              {/* Category Badge */}
              <View
                style={{
                  backgroundColor: categoryBadge.color,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 2,
                  borderRadius: borderRadius.sm,
                }}
              >
                <Text
                  style={{
                    fontSize: typography.fontSize.xs - 2,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.text.primary,
                  }}
                >
                  {categoryBadge.label.toUpperCase()}
                </Text>
              </View>

              {/* Duration */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: typography.fontSize.sm, marginRight: spacing.xs }}>⏱️</Text>
                <Text
                  style={{
                    fontSize: typography.fontSize.xs,
                    color: colors.text.secondary,
                  }}
                >
                  {miniLesson.estimated_minutes} min
                </Text>
              </View>

              {/* Card Count */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: typography.fontSize.sm, marginRight: spacing.xs }}>📝</Text>
                <Text
                  style={{
                    fontSize: typography.fontSize.xs,
                    color: colors.text.secondary,
                  }}
                >
                  {miniLesson.card_count} cards
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}
