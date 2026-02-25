/**
 * Profile Screen
 *
 * Professional, data-driven profile with competency metrics,
 * learning preferences, and account management.
 */

import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/designSystem';
import { useOnboardingV2, TARGET_LANGUAGES, MOTIVATIONS, PROFICIENCY_LEVELS, TIMELINES } from '@/hooks/useOnboardingV2';
import { getCEFRLevel, getFeatureAccess, ProficiencyLevel } from '@/lib/utils/levelGating';
import { useAuth } from '@/hooks/useAuth';
import { dbManager } from '@/lib/db/database';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import { exportUserDataAsString } from '@/lib/privacy/dataExport';
import { deleteAllUserData } from '@/lib/privacy/dataDelete';
import { LANGUAGES_WITH_TRANSLATIONS, type SupportedLanguageCode } from '@/i18n/types';
import { IdentityCard } from '@/components/profile/IdentityCard';
import { CompetencyDashboard } from '@/components/profile/CompetencyDashboard';
import { SettingRow } from '@/components/profile/SettingRow';
import { useUserMetrics } from '@/hooks/useUserMetrics';

export default function ProfileScreen() {
  const router = useRouter();
  const { data, updateData, reset: resetOnboarding } = useOnboardingV2();
  const { signOut, user } = useAuth();
  const { metrics } = useUserMetrics();
  const { t } = useTranslation('settings');
  const { currentLanguage, supportedLanguages, changeLanguage } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [showLanguageGrid, setShowLanguageGrid] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);

  // Local state for editing
  const [editedMotivation, setEditedMotivation] = useState(data.motivation_custom || '');
  const [editedStakes, setEditedStakes] = useState(data.commitment_stakes || '');

  // Get display values from store data
  const targetLang = TARGET_LANGUAGES.find(l => l.code === data.target_language);
  const motivation = MOTIVATIONS.find(m => m.id === data.motivation);
  const level = PROFICIENCY_LEVELS.find(l => l.id === data.proficiency_level);
  const timeline = TIMELINES.find(t => t.id === data.timeline);
  const cefrLevel = getCEFRLevel(data.proficiency_level as ProficiencyLevel | null);
  const featureAccess = getFeatureAccess(data.proficiency_level);

  // User display name
  const displayName = user?.email?.split('@')[0] || 'Learner';

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
              resetOnboarding();
              try {
                const db = await dbManager.initialize();
                await db.execAsync('DELETE FROM flashcards');
                await db.execAsync('DELETE FROM word_bank');
                await db.execAsync('DELETE FROM reading_sessions');
                console.log('Local database cleared');
              } catch (dbError) {
                console.warn('Could not clear local database:', dbError);
              }
              const { error } = await signOut();
              if (error) {
                console.error('Logout error:', error);
                Alert.alert('Error', t('profile.logout_error'));
                return;
              }
              console.log('Logout successful');
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

  const handleExportData = async () => {
    if (!user?.id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const json = await exportUserDataAsString(user.id);
      await Share.share({
        message: json,
        title: 'Vox Language — Your Data Export',
      });
    } catch (err) {
      Alert.alert('Export Failed', 'Could not export your data. Please try again.');
    }
  };

  const handleDeleteAccount = () => {
    if (!user?.id) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Alert.alert(
      'Delete All Data',
      'This will permanently delete your account and all data — conversations, vocabulary, scores, and preferences. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteAllUserData(user.id);
              if (result.success) {
                resetOnboarding();
                await signOut();
                router.replace('/');
              } else {
                Alert.alert(
                  'Partial Deletion',
                  `Some data could not be deleted: ${result.errors.join(', ')}. Please contact support.`
                );
              }
            } catch {
              Alert.alert('Error', 'Could not delete your data. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Level color helper
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
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Identity Card */}
          <IdentityCard
            name={displayName}
            subtitle={targetLang ? `Learning ${targetLang.label}` : 'Set up your profile'}
            onEdit={() => router.push('/(auth)/onboarding-v2')}
          />

          {/* 2. Level Strip */}
          <Animated.View entering={FadeInDown.duration(400)} style={styles.levelStrip}>
            <View style={[styles.levelBadge, { backgroundColor: getLevelColor() + '20' }]}>
              <Text style={[styles.levelBadgeText, { color: getLevelColor() }]}>
                {cefrLevel}
              </Text>
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.levelName}>
                {level?.label || 'Beginner'}
              </Text>
              <Text style={styles.levelSubtext}>CEFR Level</Text>
            </View>
            <View style={styles.levelStats}>
              <View style={styles.levelStat}>
                <Text style={styles.levelStatValue}>{metrics.totalPoints.toLocaleString()}</Text>
                <Text style={styles.levelStatLabel}>XP</Text>
              </View>
              <View style={[styles.levelStatDivider]} />
              <View style={styles.levelStat}>
                <Text style={styles.levelStatValue}>{metrics.streak}</Text>
                <Text style={styles.levelStatLabel}>Streak</Text>
              </View>
            </View>
          </Animated.View>

          {/* 3. Competency Dashboard */}
          <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.section}>
            <Text style={styles.sectionTitle}>Performance</Text>
            <CompetencyDashboard
              data={{
                articulation: metrics.articulation,
                fluency: metrics.fluency,
                ideaCommunication: metrics.communication,
                scenariosCompleted: metrics.snapshot.byType.conversation.count,
              }}
              trends={metrics.trends}
            />

            {/* Activity Dashboard */}
            <View style={{ marginTop: spacing.md }}>
              <View style={styles.card}>
                <SettingRow
                  iconName="stats-chart-outline"
                  label="Activity"
                  value="View history"
                  onPress={() => router.push('/activity-dashboard' as any)}
                  color={colors.secondary.DEFAULT}
                  isLast
                />
              </View>
            </View>

            {/* Scenarios Mastered */}
            <View style={{ marginTop: spacing.md }}>
              <Text style={styles.scenariosLabel}>SCENARIOS MASTERED</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.scenarioBadgeRow}>
                  {['Job Interview', 'Client Call', 'Team Meeting', 'Negotiation', 'Networking'].map((s, i) => (
                    <View
                      key={s}
                      style={[
                        styles.scenarioBadge,
                        i < 3 && styles.scenarioBadgeCompleted,
                      ]}
                    >
                      <Text style={[
                        styles.scenarioBadgeText,
                        { color: i < 3 ? colors.success.DEFAULT : colors.text.disabled },
                      ]}>
                        {i < 3 ? '✓ ' : ''}{s}
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </Animated.View>

          {/* 4. Learning Preferences */}
          <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Learning Preferences</Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsEditing(!isEditing);
                }}
                style={styles.editToggle}
              >
                <Text style={styles.editToggleText}>
                  {isEditing ? t('profile.cancel') : t('profile.edit')}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.card}>
              <SettingRow
                iconName="language-outline"
                label="Language"
                value={targetLang ? `${targetLang.flag} ${targetLang.label}` : 'Not set'}
                onPress={() => router.push('/(auth)/onboarding-v2/languages')}
                color={colors.accent.cyan}
              />
              <SettingRow
                iconName="bar-chart-outline"
                label="Level"
                value={level?.label || 'Not set'}
                onPress={() => router.push('/(auth)/onboarding-v2/your-level')}
                color={colors.primary.DEFAULT}
              />
              <SettingRow
                iconName="flag-outline"
                label="Goal"
                value={motivation?.label || data.motivation_custom || 'Not set'}
                onPress={() => router.push('/(auth)/onboarding-v2/your-why')}
                color={colors.success.DEFAULT}
              />
              <SettingRow
                iconName="time-outline"
                label="Timeline"
                value={timeline?.label || 'Not set'}
                onPress={() => router.push('/(auth)/onboarding-v2/your-commitment')}
                color={colors.warning.DEFAULT}
              />
              <SettingRow
                iconName="flash-outline"
                label="Motivation"
                value={data.commitment_stakes ? 'Set' : 'Not set'}
                onPress={() => router.push('/(auth)/onboarding-v2/your-stakes')}
                color={colors.accent.purple}
                isLast
              />

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

          {/* 5. App Language */}
          <Animated.View entering={FadeInDown.duration(400).delay(300)} style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => setShowLanguageGrid(!showLanguageGrid)}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionTitle}>{t('language_selection')}</Text>
              <Text style={styles.collapseIcon}>{showLanguageGrid ? '−' : '+'}</Text>
            </TouchableOpacity>

            {showLanguageGrid && (
              <View style={styles.card}>
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
            )}
          </Animated.View>

          {/* 6. Privacy & Account */}
          <Animated.View entering={FadeInDown.duration(400).delay(400)} style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy & Account</Text>
            <View style={styles.card}>
              <SettingRow
                iconName="shield-checkmark-outline"
                label="Your Data"
                value="Protected"
                onPress={() => router.push('/privacy-dashboard')}
                color={colors.success.DEFAULT}
              />
              <SettingRow
                iconName="download-outline"
                label="Export Data"
                onPress={handleExportData}
                color={colors.primary.DEFAULT}
              />
              <SettingRow
                iconName="log-out-outline"
                label="Sign Out"
                onPress={handleLogout}
                color={colors.warning.DEFAULT}
              />
              <SettingRow
                iconName="trash-outline"
                label="Delete Account"
                onPress={handleDeleteAccount}
                danger
                isLast
              />
            </View>
          </Animated.View>

          {/* 7. Developer Tools (collapsed) */}
          <Animated.View entering={FadeInDown.duration(400).delay(500)} style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => setShowDevTools(!showDevTools)}
              activeOpacity={0.7}
            >
              <Text style={[styles.sectionTitle, { color: colors.text.tertiary }]}>
                Developer Tools
              </Text>
              <Text style={styles.collapseIcon}>{showDevTools ? '−' : '+'}</Text>
            </TouchableOpacity>

            {showDevTools && (
              <View style={styles.card}>
                <View style={styles.devToolContent}>
                  <Text style={styles.devToolTitle}>{t('profile.test_onboarding_title')}</Text>
                  <Text style={styles.devToolDesc}>
                    {t('profile.test_onboarding_description')}
                  </Text>
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
                    style={[styles.actionButton, shadows.glow.primary]}
                  >
                    <Text style={styles.actionButtonText}>{t('profile.test_onboarding_button')}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
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

  // Level strip
  levelStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.overlay.light8,
  },
  levelBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  levelBadgeText: {
    fontSize: 20,
    fontWeight: typography.fontWeight.bold,
  },
  levelInfo: {
    flex: 1,
  },
  levelName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textTransform: 'capitalize',
  },
  levelSubtext: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 1,
  },
  levelStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelStat: {
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  levelStatValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  levelStatLabel: {
    fontSize: 9,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  levelStatDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.overlay.light10,
  },

  // Sections
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  collapseIcon: {
    fontSize: typography.fontSize.xl,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.bold,
  },

  // Cards
  card: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.overlay.light8,
  },

  // Edit toggle
  editToggle: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.elevated,
  },
  editToggleText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary.light,
  },

  // Edit section
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

  // Action buttons
  actionButton: {
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },

  // Dev tools
  devToolContent: {
    marginBottom: spacing.xs,
  },
  devToolTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  devToolDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },

  // Scenarios
  scenariosLabel: {
    fontSize: 9,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.disabled,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  scenarioBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    paddingBottom: spacing.xs,
  },
  scenarioBadge: {
    backgroundColor: colors.overlay.light5,
    borderWidth: 1,
    borderColor: colors.overlay.light8,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  scenarioBadgeCompleted: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderColor: 'rgba(16,185,129,0.2)',
  },
  scenarioBadgeText: {
    fontSize: 10.5,
    fontWeight: typography.fontWeight.semibold,
  },

  // Language picker styles
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
    backgroundColor: colors.overlay.primary10,
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
