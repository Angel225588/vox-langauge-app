/**
 * Profile Screen
 *
 * User settings, learning preferences, and account management.
 * Includes editable summary from onboarding for AI personalization.
 */

import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/designSystem';
import { useOnboardingV2, TARGET_LANGUAGES, MOTIVATIONS, PROFICIENCY_LEVELS, TIMELINES } from '@/hooks/useOnboardingV2';
import { getCEFRLevel, isVoiceEnabled, getFeatureAccess, ProficiencyLevel } from '@/lib/utils/levelGating';
import { useAuth } from '@/hooks/useAuth';
import { dbManager } from '@/lib/db/database';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import { LANGUAGES_WITH_TRANSLATIONS, type SupportedLanguageCode } from '@/i18n/types';

export default function ProfileScreen() {
  const router = useRouter();
  const { data, updateData, reset: resetOnboarding } = useOnboardingV2();
  const { signOut, user } = useAuth();
  const { t } = useTranslation('settings');
  const { currentLanguage, currentLanguageInfo, supportedLanguages, changeLanguage } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);

  // Local state for editing
  const [editedMotivation, setEditedMotivation] = useState(data.motivation_custom || '');
  const [editedStakes, setEditedStakes] = useState(data.commitment_stakes || '');

  // Get display values from store data
  const targetLang = TARGET_LANGUAGES.find(l => l.code === data.target_language);
  const motivation = MOTIVATIONS.find(m => m.id === data.motivation);
  const level = PROFICIENCY_LEVELS.find(l => l.id === data.proficiency_level);
  const timeline = TIMELINES.find(t => t.id === data.timeline);

  // Handle language change
  const handleLanguageChange = async (langCode: SupportedLanguageCode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await changeLanguage(langCode);
  };

  const handleSavePreferences = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateData({
      motivation_custom: editedMotivation || null,
      commitment_stakes: editedStakes,
    });
    setIsEditing(false);
    // TODO: Trigger AI analysis to adjust learning path
    Alert.alert(
      t('profile.preferences_saved_title'),
      t('profile.preferences_saved_message'),
      [{ text: 'OK' }]
    );
  };

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      t('profile.logout_confirm_title'),
      t('profile.logout_confirm_message'),
      [
        { text: t('profile.cancel'), style: 'cancel' },
        {
          text: t('profile.logout_button'),
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear onboarding data (Zustand store)
              resetOnboarding();

              // Clear local SQLite database (Word Bank, Flashcards, etc.)
              try {
                const db = await dbManager.initialize();
                await db.execAsync('DELETE FROM flashcards');
                await db.execAsync('DELETE FROM word_bank');
                await db.execAsync('DELETE FROM reading_sessions');
                console.log('Local database cleared');
              } catch (dbError) {
                console.warn('Could not clear local database:', dbError);
                // Continue with logout even if DB clear fails
              }

              // Sign out from Supabase
              const { error } = await signOut();

              if (error) {
                console.error('Logout error:', error);
                Alert.alert('Error', t('profile.logout_error'));
                return;
              }

              console.log('Logout successful');
              // Navigate to welcome screen
              router.replace('/');
            } catch (error) {
              console.error('Logout exception:', error);
              Alert.alert('Error', t('profile.unexpected_error'));
            }
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('profile.title')}</Text>
            <Text style={styles.subtitle}>{t('profile.subtitle')}</Text>
          </View>

          {/* User Level Card */}
          <UserLevelCard level={data.proficiency_level as ProficiencyLevel | null} />

          {/* Language Selection Section */}
          <Animated.View entering={FadeInDown.duration(400)} style={styles.section}>
            <Text style={styles.sectionTitle}>🌐 {t('language_selection')}</Text>
            <View style={styles.card}>
              <Text style={styles.languageDescription}>{t('language_description')}</Text>
              <Text style={styles.languageNote}>{t('language_note')}</Text>

              <View style={styles.languageGrid}>
                {supportedLanguages
                  .filter(lang => LANGUAGES_WITH_TRANSLATIONS.includes(lang.code))
                  .map((lang) => {
                    const isSelected = currentLanguage === lang.code;
                    return (
                      <TouchableOpacity
                        key={lang.code}
                        style={[
                          styles.languageOption,
                          isSelected && styles.languageOptionSelected,
                        ]}
                        onPress={() => handleLanguageChange(lang.code)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.languageFlag}>{lang.flag}</Text>
                        <View style={styles.languageTextContainer}>
                          <Text style={[
                            styles.languageName,
                            isSelected && styles.languageNameSelected,
                          ]}>
                            {lang.nativeName}
                          </Text>
                          <Text style={styles.languageNameEnglish}>{lang.name}</Text>
                        </View>
                        {isSelected && (
                          <View style={styles.selectedIndicator}>
                            <Text style={styles.selectedCheckmark}>✓</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
              </View>

              {/* Coming soon languages */}
              <Text style={styles.comingSoonTitle}>{t('coming_soon')}</Text>
              <View style={styles.comingSoonGrid}>
                {supportedLanguages
                  .filter(lang => !LANGUAGES_WITH_TRANSLATIONS.includes(lang.code))
                  .slice(0, 4)
                  .map((lang) => (
                    <View key={lang.code} style={styles.comingSoonItem}>
                      <Text style={styles.comingSoonFlag}>{lang.flag}</Text>
                      <Text style={styles.comingSoonName}>{lang.nativeName}</Text>
                    </View>
                  ))}
              </View>
            </View>
          </Animated.View>

          {/* Learning Preferences Summary */}
          <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🎯 {t('profile.learning_preferences')}</Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsEditing(!isEditing);
                }}
                style={styles.editButton}
              >
                <Text style={styles.editButtonText}>
                  {isEditing ? t('profile.cancel') : t('profile.edit')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              {/* Summary Cards */}
              <View style={styles.summaryGrid}>
                <SummaryItem
                  icon="🌍"
                  label={t('profile.language_label')}
                  value={targetLang ? `${targetLang.flag} ${targetLang.label}` : t('profile.not_set')}
                  onPress={() => router.push('/(auth)/onboarding-v2/languages')}
                />
                <SummaryItem
                  icon="📊"
                  label={t('profile.level_label')}
                  value={level?.label || t('profile.not_set')}
                  onPress={() => router.push('/(auth)/onboarding-v2/your-level')}
                />
                <SummaryItem
                  icon="⏱️"
                  label={t('profile.timeline_label')}
                  value={timeline?.label || t('profile.not_set')}
                  onPress={() => router.push('/(auth)/onboarding-v2/your-commitment')}
                />
                <SummaryItem
                  icon="💡"
                  label={t('profile.why_label')}
                  value={motivation?.label || data.motivation_custom || t('profile.not_set')}
                  onPress={() => router.push('/(auth)/onboarding-v2/your-why')}
                />
              </View>

              {/* Editable Fields */}
              {isEditing && (
                <View style={styles.editSection}>
                  <Text style={styles.editLabel}>{t('profile.edit_section.motivation_label')}</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editedMotivation}
                    onChangeText={setEditedMotivation}
                    placeholder={t('profile.edit_section.motivation_placeholder')}
                    placeholderTextColor={colors.text.tertiary}
                    multiline
                    numberOfLines={3}
                  />

                  <Text style={styles.editLabel}>{t('profile.edit_section.stakes_label')}</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editedStakes}
                    onChangeText={setEditedStakes}
                    placeholder={t('profile.edit_section.stakes_placeholder')}
                    placeholderTextColor={colors.text.tertiary}
                    multiline
                    numberOfLines={3}
                  />

                  <TouchableOpacity
                    onPress={handleSavePreferences}
                    activeOpacity={0.8}
                    style={{ marginTop: spacing.md }}
                  >
                    <LinearGradient
                      colors={colors.gradients.success}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.saveButton}
                    >
                      <Text style={styles.saveButtonText}>{t('profile.edit_section.save_button')}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Developer Tools Section */}
          <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.section}>
            <Text style={styles.sectionTitle}>🧪 {t('profile.developer_tools')}</Text>
            <View style={styles.card}>
              <View style={styles.cardContent}>
                <View style={styles.cardIcon}>
                  <Text style={styles.cardEmoji}>🚀</Text>
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{t('profile.test_onboarding_title')}</Text>
                  <Text style={styles.cardDescription}>
                    {t('profile.test_onboarding_description')}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/onboarding-v2')}
                activeOpacity={0.8}
                style={{ marginTop: spacing.md }}
              >
                <LinearGradient
                  colors={colors.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.button, shadows.glow.primary]}
                >
                  <Text style={styles.buttonText}>{t('profile.test_onboarding_button')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Account Section */}
          <Animated.View entering={FadeInDown.duration(400).delay(300)} style={styles.section}>
            <Text style={styles.sectionTitle}>👤 {t('profile.account_section')}</Text>
            <View style={styles.card}>
              <TouchableOpacity
                onPress={handleLogout}
                activeOpacity={0.8}
                style={styles.logoutButton}
              >
                <Text style={styles.logoutButtonText}>{t('profile.logout_button')}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// User Level Card Component
function UserLevelCard({ level }: { level: ProficiencyLevel | null }) {
  const cefrLevel = getCEFRLevel(level);
  const featureAccess = getFeatureAccess(level);

  const getLevelProgress = () => {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1+'];
    const index = levels.indexOf(cefrLevel);
    return ((index + 1) / levels.length) * 100;
  };

  const getLevelColor = () => {
    switch (cefrLevel) {
      case 'A1': return colors.success.DEFAULT;
      case 'A2': return colors.success.light;
      case 'B1': return colors.primary.DEFAULT;
      case 'B2': return colors.primary.light;
      case 'C1+': return colors.warning.DEFAULT;
      default: return colors.text.tertiary;
    }
  };

  return (
    <Animated.View entering={FadeInDown.duration(400)} style={levelCardStyles.container}>
      <LinearGradient
        colors={[colors.background.card, colors.background.elevated]}
        style={levelCardStyles.gradient}
      >
        {/* Level Badge */}
        <View style={levelCardStyles.header}>
          <View style={[levelCardStyles.levelBadge, { backgroundColor: getLevelColor() + '20' }]}>
            <Text style={[levelCardStyles.levelText, { color: getLevelColor() }]}>
              {cefrLevel}
            </Text>
          </View>
          <View style={levelCardStyles.levelInfo}>
            <Text style={levelCardStyles.levelName}>
              {level ? level.replace('_', ' ').replace(/^\w/, c => c.toUpperCase()) : 'Beginner'}
            </Text>
            <Text style={levelCardStyles.levelSubtext}>CEFR Level</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={levelCardStyles.progressContainer}>
          <View style={levelCardStyles.progressTrack}>
            <View
              style={[
                levelCardStyles.progressFill,
                { width: `${getLevelProgress()}%`, backgroundColor: getLevelColor() }
              ]}
            />
          </View>
          <View style={levelCardStyles.progressLabels}>
            <Text style={levelCardStyles.progressLabel}>A1</Text>
            <Text style={levelCardStyles.progressLabel}>A2</Text>
            <Text style={levelCardStyles.progressLabel}>B1</Text>
            <Text style={levelCardStyles.progressLabel}>B2</Text>
            <Text style={levelCardStyles.progressLabel}>C1+</Text>
          </View>
        </View>

        {/* Feature Unlock Status */}
        <View style={levelCardStyles.featuresRow}>
          <View style={levelCardStyles.featureItem}>
            <Text style={levelCardStyles.featureIcon}>📚</Text>
            <Text style={levelCardStyles.featureLabel}>Flashcards</Text>
            <Text style={[levelCardStyles.featureStatus, { color: colors.success.DEFAULT }]}>✓</Text>
          </View>
          <View style={levelCardStyles.featureItem}>
            <Text style={levelCardStyles.featureIcon}>🎮</Text>
            <Text style={levelCardStyles.featureLabel}>Games</Text>
            <Text style={[levelCardStyles.featureStatus, { color: colors.success.DEFAULT }]}>✓</Text>
          </View>
          <View style={levelCardStyles.featureItem}>
            <Text style={levelCardStyles.featureIcon}>🎙️</Text>
            <Text style={levelCardStyles.featureLabel}>Voice</Text>
            <Text style={[
              levelCardStyles.featureStatus,
              { color: featureAccess.voiceConversation ? colors.success.DEFAULT : colors.text.tertiary }
            ]}>
              {featureAccess.voiceConversation ? '✓' : '🔒'}
            </Text>
          </View>
        </View>

        {/* Voice unlock message for beginners */}
        {!featureAccess.voiceConversation && (
          <View style={levelCardStyles.unlockMessage}>
            <Text style={levelCardStyles.unlockText}>
              🎯 Voice conversations unlock at B1 level
            </Text>
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
}

const levelCardStyles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primary.DEFAULT + '30',
  },
  gradient: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  levelBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  levelText: {
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
  },
  levelInfo: {
    flex: 1,
  },
  levelName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textTransform: 'capitalize',
  },
  levelSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  progressContainer: {
    marginBottom: spacing.lg,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.background.primary,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  progressLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  featureItem: {
    alignItems: 'center',
    gap: 4,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  featureStatus: {
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
  },
  unlockMessage: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    alignItems: 'center',
  },
  unlockText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
});

// Summary item component
function SummaryItem({
  icon,
  label,
  value,
  onPress
}: {
  icon: string;
  label: string;
  value: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.summaryItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.summaryIcon}>{icon}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue} numberOfLines={1}>{value}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  header: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  editButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.elevated,
  },
  editButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary.light,
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    ...shadows.sm,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  summaryItem: {
    width: '48%',
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  summaryIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  editSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  editLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  editInput: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  saveButton: {
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: {
    fontSize: 28,
  },
  cardText: {
    flex: 1,
    paddingTop: spacing.xs,
  },
  cardTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  cardDescription: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  button: {
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error.DEFAULT,
  },
  // Language picker styles
  languageDescription: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  languageNote: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.lg,
    fontStyle: 'italic',
  },
  languageGrid: {
    gap: spacing.sm,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageOptionSelected: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  languageFlag: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  languageTextContainer: {
    flex: 1,
  },
  languageName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  languageNameSelected: {
    color: colors.primary.light,
  },
  languageNameEnglish: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  selectedIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCheckmark: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: typography.fontWeight.bold,
  },
  comingSoonTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.tertiary,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  comingSoonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  comingSoonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    opacity: 0.6,
  },
  comingSoonFlag: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  comingSoonName: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
});
