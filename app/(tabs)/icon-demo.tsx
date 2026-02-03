/**
 * Icon System Demo Screen
 *
 * A demonstration screen showing all Icon and IconButton variants
 * for testing and documentation purposes.
 *
 * To access: Add this to your tab navigator or visit /icon-demo
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Icon,
  IconButton,
  BackButton,
  VoxIcon,
  VoxCounter,
  FluencyFlame,
  ComprehensionCrystal,
  ExpressionEmber,
} from '@/components/ui';
import { colors, spacing, typography, borderRadius } from '@/constants/designSystem';
import { useRouter } from 'expo-router';

export default function IconDemoScreen() {
  const router = useRouter();
  const [likeCount, setLikeCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.title}>Icon System Demo</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Size Variants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Size Variants</Text>
          <View style={styles.row}>
            <View style={styles.item}>
              <Icon name="star" size="sm" color="warning" />
              <Text style={styles.label}>SM (16px)</Text>
            </View>
            <View style={styles.item}>
              <Icon name="star" size="md" color="warning" />
              <Text style={styles.label}>MD (20px)</Text>
            </View>
            <View style={styles.item}>
              <Icon name="star" size="lg" color="warning" />
              <Text style={styles.label}>LG (24px)</Text>
            </View>
            <View style={styles.item}>
              <Icon name="star" size="xl" color="warning" />
              <Text style={styles.label}>XL (32px)</Text>
            </View>
          </View>
        </View>

        {/* Color Variants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Color Variants</Text>
          <View style={styles.row}>
            <View style={styles.item}>
              <Icon name="heart" size="lg" color="primary" />
              <Text style={styles.label}>Primary</Text>
            </View>
            <View style={styles.item}>
              <Icon name="heart" size="lg" color="secondary" />
              <Text style={styles.label}>Secondary</Text>
            </View>
            <View style={styles.item}>
              <Icon name="heart" size="lg" color="success" />
              <Text style={styles.label}>Success</Text>
            </View>
            <View style={styles.item}>
              <Icon name="heart" size="lg" color="error" />
              <Text style={styles.label}>Error</Text>
            </View>
            <View style={styles.item}>
              <Icon name="heart" size="lg" color="warning" />
              <Text style={styles.label}>Warning</Text>
            </View>
          </View>
        </View>

        {/* Common Icons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Common Icons</Text>
          <View style={styles.iconGrid}>
            {[
              'checkmark',
              'close',
              'add',
              'play',
              'pause',
              'mic',
              'volume-high',
              'heart',
              'bookmark',
              'star',
              'chevron-back',
              'chevron-forward',
              'settings',
              'help',
              'info',
              'warning',
              'home',
              'search',
              'person',
              'menu',
              'book',
              'library',
              'trophy',
              'flame',
            ].map((iconName) => (
              <View key={iconName} style={styles.iconItem}>
                <Icon name={iconName as any} size="lg" color="text-secondary" />
                <Text style={styles.iconLabel} numberOfLines={1}>
                  {iconName}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* IconButton Variants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>IconButton Variants</Text>

          <Text style={styles.subsectionTitle}>Default</Text>
          <View style={styles.row}>
            <IconButton
              name="settings"
              onPress={() => console.log('Settings')}
              accessibilityLabel="Settings"
            />
            <IconButton
              name="search"
              onPress={() => console.log('Search')}
              accessibilityLabel="Search"
            />
            <IconButton
              name="menu"
              onPress={() => console.log('Menu')}
              accessibilityLabel="Menu"
            />
          </View>

          <Text style={styles.subsectionTitle}>Filled</Text>
          <View style={styles.row}>
            <IconButton
              name="play"
              variant="filled"
              backgroundColor="primary"
              onPress={() => console.log('Play')}
              accessibilityLabel="Play"
            />
            <IconButton
              name="mic"
              variant="filled"
              backgroundColor="error"
              onPress={() => console.log('Record')}
              accessibilityLabel="Record"
            />
            <IconButton
              name="heart"
              variant="filled"
              backgroundColor="accent-pink"
              onPress={() => console.log('Like')}
              accessibilityLabel="Like"
            />
          </View>

          <Text style={styles.subsectionTitle}>Outlined</Text>
          <View style={styles.row}>
            <IconButton
              name="checkmark"
              variant="outlined"
              borderColor="success"
              color="success"
              onPress={() => console.log('Confirm')}
              accessibilityLabel="Confirm"
            />
            <IconButton
              name="close"
              variant="outlined"
              borderColor="error"
              color="error"
              onPress={() => console.log('Close')}
              accessibilityLabel="Close"
            />
            <IconButton
              name="warning"
              variant="outlined"
              borderColor="warning"
              color="warning"
              onPress={() => console.log('Warning')}
              accessibilityLabel="Warning"
            />
          </View>

          <Text style={styles.subsectionTitle}>Ghost</Text>
          <View style={styles.row}>
            <IconButton
              name="info"
              variant="ghost"
              color="primary"
              onPress={() => console.log('Info')}
              accessibilityLabel="Info"
            />
            <IconButton
              name="help"
              variant="ghost"
              color="secondary"
              onPress={() => console.log('Help')}
              accessibilityLabel="Help"
            />
            <IconButton
              name="settings"
              variant="ghost"
              color="text-secondary"
              onPress={() => console.log('Settings')}
              accessibilityLabel="Settings"
            />
          </View>
        </View>

        {/* Shapes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shapes</Text>
          <View style={styles.row}>
            <View style={styles.item}>
              <IconButton
                name="star"
                shape="circle"
                variant="filled"
                backgroundColor="warning"
                onPress={() => console.log('Circle')}
                accessibilityLabel="Circle shape"
              />
              <Text style={styles.label}>Circle</Text>
            </View>
            <View style={styles.item}>
              <IconButton
                name="star"
                shape="rounded"
                variant="filled"
                backgroundColor="warning"
                onPress={() => console.log('Rounded')}
                accessibilityLabel="Rounded shape"
              />
              <Text style={styles.label}>Rounded</Text>
            </View>
            <View style={styles.item}>
              <IconButton
                name="star"
                shape="square"
                variant="filled"
                backgroundColor="warning"
                onPress={() => console.log('Square')}
                accessibilityLabel="Square shape"
              />
              <Text style={styles.label}>Square</Text>
            </View>
          </View>
        </View>

        {/* Interactive Examples */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interactive Examples</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Audio Player</Text>
            <View style={styles.row}>
              <IconButton
                name={isPlaying ? 'pause-circle' : 'play-circle'}
                size="xl"
                variant="filled"
                backgroundColor="primary"
                onPress={() => setIsPlaying(!isPlaying)}
                accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
              />
              <IconButton
                name={isMuted ? 'volume-mute' : 'volume-high'}
                variant="ghost"
                color="text-secondary"
                onPress={() => setIsMuted(!isMuted)}
                accessibilityLabel={isMuted ? 'Unmute' : 'Mute'}
              />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Like Button</Text>
            <View style={styles.row}>
              <IconButton
                name={likeCount > 0 ? 'heart' : 'heart-outline'}
                variant="filled"
                backgroundColor={likeCount > 0 ? 'accent-pink' : 'text-disabled'}
                onPress={() => setLikeCount(likeCount + 1)}
                accessibilityLabel="Like"
                hapticStyle="medium"
              />
              <Text style={styles.likeCount}>{likeCount} likes</Text>
            </View>
          </View>
        </View>

        {/* Status Indicators */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status Indicators</Text>
          <View style={styles.statusList}>
            <View style={styles.statusItem}>
              <Icon name="checkmark-circle" size="md" color="success" />
              <Text style={styles.statusText}>Lesson completed</Text>
            </View>
            <View style={styles.statusItem}>
              <Icon name="flame" size="md" color="warning" />
              <Text style={styles.statusText}>5 day streak</Text>
            </View>
            <View style={styles.statusItem}>
              <Icon name="trophy" size="md" color="accent-cyan" />
              <Text style={styles.statusText}>Level 3 achieved</Text>
            </View>
            <View style={styles.statusItem}>
              <Icon name="book" size="md" color="primary" />
              <Text style={styles.statusText}>12 lessons remaining</Text>
            </View>
          </View>
        </View>

        {/* ============================================= */}
        {/* VOX REWARDS SYSTEM ICONS */}
        {/* ============================================= */}

        {/* Main Vox Icon */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vox Currency Icon</Text>
          <Text style={styles.sectionDescription}>
            The main currency - earned by trying. "The only failure is not trying."
          </Text>

          <Text style={styles.subsectionTitle}>Size Variants</Text>
          <View style={styles.row}>
            <View style={styles.item}>
              <VoxIcon size="xs" />
              <Text style={styles.label}>XS (16px)</Text>
            </View>
            <View style={styles.item}>
              <VoxIcon size="sm" />
              <Text style={styles.label}>SM (24px)</Text>
            </View>
            <View style={styles.item}>
              <VoxIcon size="md" />
              <Text style={styles.label}>MD (32px)</Text>
            </View>
            <View style={styles.item}>
              <VoxIcon size="lg" />
              <Text style={styles.label}>LG (48px)</Text>
            </View>
            <View style={styles.item}>
              <VoxIcon size="xl" />
              <Text style={styles.label}>XL (64px)</Text>
            </View>
          </View>

          <Text style={styles.subsectionTitle}>Color Variants (Tiers)</Text>
          <View style={styles.row}>
            <View style={styles.item}>
              <VoxIcon size="lg" color="bronze" />
              <Text style={styles.label}>Bronze</Text>
            </View>
            <View style={styles.item}>
              <VoxIcon size="lg" color="silver" />
              <Text style={styles.label}>Silver</Text>
            </View>
            <View style={styles.item}>
              <VoxIcon size="lg" color="gold" />
              <Text style={styles.label}>Gold</Text>
            </View>
            <View style={styles.item}>
              <VoxIcon size="lg" color="primary" />
              <Text style={styles.label}>Primary</Text>
            </View>
          </View>

          <Text style={styles.subsectionTitle}>Animated & Glowing</Text>
          <View style={styles.row}>
            <View style={styles.item}>
              <VoxIcon size="lg" animated />
              <Text style={styles.label}>Animated</Text>
            </View>
            <View style={styles.item}>
              <VoxIcon size="lg" glowing />
              <Text style={styles.label}>Glowing</Text>
            </View>
            <View style={styles.item}>
              <VoxIcon size="lg" animated glowing />
              <Text style={styles.label}>Both</Text>
            </View>
          </View>
        </View>

        {/* Vox Counter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vox Counter Display</Text>
          <Text style={styles.sectionDescription}>
            Animated counters for showing Vox points in UI
          </Text>

          <View style={styles.counterGrid}>
            <View style={styles.counterItem}>
              <VoxCounter value={1250} variant="default" />
              <Text style={styles.label}>Default</Text>
            </View>
            <View style={styles.counterItem}>
              <VoxCounter value={500} variant="compact" />
              <Text style={styles.label}>Compact</Text>
            </View>
            <View style={styles.counterItem}>
              <VoxCounter value={42} variant="badge" />
              <Text style={styles.label}>Badge</Text>
            </View>
          </View>

          <View style={styles.counterItem}>
            <VoxCounter value={9999} variant="large" glowing />
            <Text style={styles.label}>Large + Glowing</Text>
          </View>
        </View>

        {/* Skill Currency Icons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skill Currency Icons</Text>
          <Text style={styles.sectionDescription}>
            Earned from specific skill activities alongside Vox points
          </Text>

          {/* Fluency Flame */}
          <View style={styles.skillCard}>
            <View style={styles.skillHeader}>
              <FluencyFlame size="lg" animated />
              <View style={styles.skillInfo}>
                <Text style={styles.skillName}>Fluency Flames</Text>
                <Text style={styles.skillDesc}>Speaking & Pronunciation</Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.item}>
                <FluencyFlame size="sm" />
                <Text style={styles.label}>SM</Text>
              </View>
              <View style={styles.item}>
                <FluencyFlame size="md" />
                <Text style={styles.label}>MD</Text>
              </View>
              <View style={styles.item}>
                <FluencyFlame size="lg" />
                <Text style={styles.label}>LG</Text>
              </View>
              <View style={styles.item}>
                <FluencyFlame size="lg" glowing />
                <Text style={styles.label}>Glow</Text>
              </View>
            </View>
          </View>

          {/* Comprehension Crystal */}
          <View style={styles.skillCard}>
            <View style={styles.skillHeader}>
              <ComprehensionCrystal size="lg" animated />
              <View style={styles.skillInfo}>
                <Text style={styles.skillName}>Comprehension Crystals</Text>
                <Text style={styles.skillDesc}>Listening & Reading</Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.item}>
                <ComprehensionCrystal size="sm" />
                <Text style={styles.label}>SM</Text>
              </View>
              <View style={styles.item}>
                <ComprehensionCrystal size="md" />
                <Text style={styles.label}>MD</Text>
              </View>
              <View style={styles.item}>
                <ComprehensionCrystal size="lg" />
                <Text style={styles.label}>LG</Text>
              </View>
              <View style={styles.item}>
                <ComprehensionCrystal size="lg" glowing />
                <Text style={styles.label}>Glow</Text>
              </View>
            </View>
          </View>

          {/* Expression Ember */}
          <View style={styles.skillCard}>
            <View style={styles.skillHeader}>
              <ExpressionEmber size="lg" animated />
              <View style={styles.skillInfo}>
                <Text style={styles.skillName}>Expression Embers</Text>
                <Text style={styles.skillDesc}>Writing & Production</Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.item}>
                <ExpressionEmber size="sm" />
                <Text style={styles.label}>SM</Text>
              </View>
              <View style={styles.item}>
                <ExpressionEmber size="md" />
                <Text style={styles.label}>MD</Text>
              </View>
              <View style={styles.item}>
                <ExpressionEmber size="lg" />
                <Text style={styles.label}>LG</Text>
              </View>
              <View style={styles.item}>
                <ExpressionEmber size="lg" glowing />
                <Text style={styles.label}>Glow</Text>
              </View>
            </View>
          </View>
        </View>

        {/* All Together */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Currency Comparison</Text>
          <View style={styles.currencyRow}>
            <View style={styles.currencyItem}>
              <VoxIcon size="xl" glowing />
              <Text style={styles.currencyLabel}>VOX</Text>
              <Text style={styles.currencyValue}>Main Currency</Text>
            </View>
            <View style={styles.currencyItem}>
              <FluencyFlame size="xl" glowing />
              <Text style={[styles.currencyLabel, { color: '#FF6B6B' }]}>FLUENCY</Text>
              <Text style={styles.currencyValue}>Speaking</Text>
            </View>
            <View style={styles.currencyItem}>
              <ComprehensionCrystal size="xl" glowing />
              <Text style={[styles.currencyLabel, { color: '#06D6A0' }]}>COMP</Text>
              <Text style={styles.currencyValue}>Listening</Text>
            </View>
            <View style={styles.currencyItem}>
              <ExpressionEmber size="xl" glowing />
              <Text style={[styles.currencyLabel, { color: '#8B5CF6' }]}>EXPR</Text>
              <Text style={styles.currencyValue}>Writing</Text>
            </View>
          </View>
        </View>

        <View style={{ height: spacing['2xl'] }} />
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.dark,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  subsectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    flexWrap: 'wrap',
  },
  item: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  iconItem: {
    width: 70,
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  cardTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  likeCount: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  statusList: {
    gap: spacing.md,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },

  // Vox Rewards Section Styles
  sectionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.lg,
    fontStyle: 'italic',
  },
  counterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  counterItem: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  skillCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  skillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  skillInfo: {
    flex: 1,
  },
  skillName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  skillDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  currencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  currencyItem: {
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    minWidth: 75,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  currencyLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.DEFAULT,
    marginTop: spacing.sm,
  },
  currencyValue: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
});
