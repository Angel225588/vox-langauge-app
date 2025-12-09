/**
 * Notes Library Screen
 *
 * Display all saved writing tasks/notes from the Personal Script Builder.
 * Each note card has a "View Feedback" button that navigates to the full feedback detail.
 *
 * Features:
 * - Stats bar (total notes, total practice time, average score)
 * - Category filter pills (horizontal scroll)
 * - Notes list with preview, score, and feedback button
 * - Empty state
 * - FAB to create new writing task
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/designSystem';
import { BackButton } from '@/components/ui/BackButton';
import * as NotesStorage from '@/lib/storage/notesStorage';

// Note data interface
interface Note {
  id: string;
  title: string;
  category: 'email' | 'daily_routine' | 'job_interview' | 'travel' | 'social' | 'other';
  label: string;
  preview: string;
  fullText: string;
  createdAt: Date;
  score?: number;
  practiceCount: number;
  hasFeedback: boolean;
  timeSpentMinutes: number;
}

const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'grid-outline' },
  { id: 'email', label: 'Email', icon: 'mail-outline' },
  { id: 'daily_routine', label: 'Daily Routine', icon: 'sunny-outline' },
  { id: 'job_interview', label: 'Interview', icon: 'briefcase-outline' },
  { id: 'travel', label: 'Travel', icon: 'airplane-outline' },
  { id: 'social', label: 'Social', icon: 'people-outline' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
];

export default function NotesLibraryScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Note editor state
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  // Load notes from storage when screen is focused
  const loadNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const storedNotes = await NotesStorage.getAllNotes();
      const convertedNotes: Note[] = storedNotes.map(n => ({
        id: n.id,
        title: n.title,
        category: n.category,
        label: n.label,
        preview: n.preview,
        fullText: n.fullText,
        createdAt: new Date(n.createdAt),
        score: n.score,
        practiceCount: n.practiceCount,
        hasFeedback: n.hasFeedback,
        timeSpentMinutes: n.timeSpentMinutes,
      }));
      setNotes(convertedNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [loadNotes])
  );

  const handleBack = () => {
    router.back();
  };

  const handleCategoryPress = useCallback((categoryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(categoryId);
  }, []);

  const handleNotePress = useCallback((note: Note) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Open note in editor
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.fullText);
    setShowEditor(true);
  }, []);

  const handleViewFeedback = useCallback((noteId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/writing-feedback/${noteId}` as any);
  }, [router]);

  const handleCreateNew = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Open empty editor for new note
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
    setShowEditor(true);
  }, []);

  const handleSaveNote = useCallback(async () => {
    if (!noteTitle.trim() || !noteContent.trim()) {
      Alert.alert('Empty Note', 'Please add a title and some content to your note.');
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (editingNote) {
        // Update existing note in storage
        await NotesStorage.updateNote(editingNote.id, {
          title: noteTitle.trim(),
          content: noteContent.trim(),
        });
      } else {
        // Create new note in storage
        await NotesStorage.createNote({
          title: noteTitle.trim(),
          content: noteContent.trim(),
          category: 'other',
          label: 'Personal',
        });
      }

      // Reload notes from storage
      await loadNotes();

      setShowEditor(false);
      setEditingNote(null);
      setNoteTitle('');
      setNoteContent('');

      Alert.alert(
        editingNote ? 'Note Updated!' : 'Note Created!',
        'Your note has been saved as a txt file on your device.',
        [{ text: 'Great!', style: 'default' }]
      );
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error', 'Failed to save your note. Please try again.');
    }
  }, [noteTitle, noteContent, editingNote, loadNotes]);

  const handleCloseEditor = useCallback(() => {
    if (noteTitle.trim() || noteContent.trim()) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              setShowEditor(false);
              setEditingNote(null);
              setNoteTitle('');
              setNoteContent('');
            },
          },
        ]
      );
    } else {
      setShowEditor(false);
      setEditingNote(null);
    }
  }, [noteTitle, noteContent]);

  const handleAnalyzeNote = useCallback(() => {
    if (!noteContent.trim()) {
      Alert.alert('Empty Note', 'Please write some content first.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to writing task flow with this content for analysis
    router.push('/test-writing-task');
  }, [noteContent, router]);

  // Filter notes by category
  const filteredNotes = selectedCategory === 'all'
    ? notes
    : notes.filter(note => note.category === selectedCategory);

  // Calculate stats
  const totalNotes = notes.length;
  const totalPracticeTime = notes.reduce((sum, note) => sum + note.timeSpentMinutes, 0);
  const averageScore = notes.filter(n => n.score).length > 0
    ? Math.round(notes.filter(n => n.score).reduce((sum, n) => sum + (n.score || 0), 0) / notes.filter(n => n.score).length)
    : 0;

  const getCategoryIcon = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId);
    return category?.icon || 'document-text-outline';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'email': return colors.primary.DEFAULT;
      case 'daily_routine': return colors.warning.DEFAULT;
      case 'job_interview': return colors.accent.purple;
      case 'travel': return colors.secondary.DEFAULT;
      case 'social': return colors.accent.pink;
      default: return colors.text.tertiary;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Note Editor View (Notion-style)
  if (showEditor) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={[colors.background.primary, colors.background.secondary]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            {/* Editor Header */}
            <Animated.View entering={FadeIn.duration(300)} style={styles.editorHeader}>
              <BackButton onPress={handleCloseEditor} />
              <View style={styles.editorHeaderCenter}>
                <Text style={styles.editorHeaderTitle}>
                  {editingNote ? 'Edit Note' : 'New Note'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleSaveNote}
                style={styles.saveButton}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Editor Content */}
            <ScrollView
              style={styles.editorScroll}
              contentContainerStyle={styles.editorScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <Animated.View entering={FadeInDown.duration(400).delay(100)}>
                {/* Title Input */}
                <TextInput
                  style={styles.noteTitleInput}
                  placeholder="Note Title..."
                  placeholderTextColor={colors.text.disabled}
                  value={noteTitle}
                  onChangeText={setNoteTitle}
                  maxLength={100}
                  autoFocus={!editingNote}
                />

                {/* Content Input */}
                <TextInput
                  style={styles.noteContentInput}
                  placeholder="Start writing your thoughts, practice text, or anything you want to remember..."
                  placeholderTextColor={colors.text.disabled}
                  value={noteContent}
                  onChangeText={setNoteContent}
                  multiline
                  textAlignVertical="top"
                  scrollEnabled={false}
                />
              </Animated.View>
            </ScrollView>

            {/* Editor Footer */}
            <Animated.View entering={FadeIn.duration(300).delay(200)} style={styles.editorFooter}>
              <View style={styles.wordCountContainer}>
                <Ionicons name="document-text-outline" size={16} color={colors.text.tertiary} />
                <Text style={styles.wordCountText}>
                  {noteContent.trim().split(/\s+/).filter(Boolean).length} words
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleAnalyzeNote}
                style={styles.analyzeButton}
                activeOpacity={0.8}
              >
                <Ionicons name="sparkles" size={18} color={colors.primary.DEFAULT} />
                <Text style={styles.analyzeButtonText}>Get AI Feedback</Text>
              </TouchableOpacity>
            </Animated.View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background gradient */}
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary, '#1A1F3A']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <BackButton onPress={handleBack} />
        </Animated.View>

        {/* Title Section */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.titleSection}>
          <Text style={styles.title}>My Notes</Text>
          <Text style={styles.subtitle}>Personal scripts & writing tasks</Text>
        </Animated.View>

        {/* Stats Bar */}
        {notes.length > 0 && (
          <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="document-text" size={20} color={colors.primary.DEFAULT} />
              <Text style={styles.statValue}>{totalNotes}</Text>
              <Text style={styles.statLabel}>Notes</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="time" size={20} color={colors.secondary.DEFAULT} />
              <Text style={styles.statValue}>{totalPracticeTime}m</Text>
              <Text style={styles.statLabel}>Practice</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trophy" size={20} color={colors.warning.DEFAULT} />
              <Text style={styles.statValue}>{averageScore}%</Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
          </Animated.View>
        )}

        {/* Category Filter Pills */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => handleCategoryPress(category.id)}
                style={[
                  styles.categoryPill,
                  selectedCategory === category.id && styles.categoryPillActive,
                ]}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={category.icon as any}
                  size={16}
                  color={selectedCategory === category.id ? colors.text.primary : colors.text.tertiary}
                />
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.id && styles.categoryTextActive,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Notes List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredNotes.length === 0 ? (
            // Empty State
            <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="pencil-outline" size={48} color={colors.text.tertiary} />
              </View>
              <Text style={styles.emptyTitle}>Your writing journey starts here</Text>
              <Text style={styles.emptyText}>
                Create your first writing task to practice your language skills and get AI feedback
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={handleCreateNew}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={20} color={colors.text.primary} />
                <Text style={styles.emptyButtonText}>Create Writing Task</Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            // Notes List
            filteredNotes.map((note, index) => (
              <Animated.View
                key={note.id}
                entering={FadeInDown.delay(250 + index * 50).duration(300)}
              >
                <TouchableOpacity
                  style={styles.noteCard}
                  onPress={() => handleNotePress(note)}
                  activeOpacity={0.9}
                >
                  {/* Note Header */}
                  <View style={styles.noteHeader}>
                    <View style={styles.noteHeaderLeft}>
                      <Text style={styles.noteTitle}>{note.title}</Text>
                      <View style={styles.noteBadges}>
                        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(note.category) + '20' }]}>
                          <Ionicons
                            name={getCategoryIcon(note.category) as any}
                            size={12}
                            color={getCategoryColor(note.category)}
                          />
                          <Text style={[styles.categoryBadgeText, { color: getCategoryColor(note.category) }]}>
                            {CATEGORIES.find(c => c.id === note.category)?.label}
                          </Text>
                        </View>
                        <View style={styles.labelBadge}>
                          <Text style={styles.labelBadgeText}>{note.label}</Text>
                        </View>
                      </View>
                    </View>
                    {note.score && (
                      <View style={styles.scoreBadge}>
                        <Text style={styles.scoreText}>{note.score}%</Text>
                      </View>
                    )}
                  </View>

                  {/* Preview Text */}
                  <Text style={styles.previewText} numberOfLines={2}>
                    {note.preview}
                  </Text>

                  {/* Note Footer */}
                  <View style={styles.noteFooter}>
                    <View style={styles.noteFooterLeft}>
                      <Ionicons name="calendar-outline" size={14} color={colors.text.tertiary} />
                      <Text style={styles.noteMetaText}>{formatDate(note.createdAt)}</Text>
                      <View style={styles.metaDivider} />
                      <Ionicons name="repeat-outline" size={14} color={colors.text.tertiary} />
                      <Text style={styles.noteMetaText}>{note.practiceCount}x</Text>
                    </View>
                    {note.hasFeedback && (
                      <TouchableOpacity
                        style={styles.feedbackButton}
                        onPress={() => handleViewFeedback(note.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.feedbackButtonText}>View Feedback</Text>
                        <Ionicons name="arrow-forward" size={14} color={colors.primary.DEFAULT} />
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>

      {/* FAB - Create New Writing Task */}
      <Animated.View entering={FadeIn.delay(400).duration(400)} style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreateNew}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={28} color={colors.text.primary} />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    zIndex: 10,
  },

  // Title Section
  titleSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
  },

  // Stats Bar
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },

  // Category Pills
  categoriesContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: spacing.sm,
  },
  categoryPillActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  categoryText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
  },
  categoryTextActive: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },

  // Scrollable Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'] + 60, // Extra space for FAB
  },

  // Note Card
  noteCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  noteHeaderLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  noteTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  noteBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  categoryBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  labelBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  labelBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  scoreBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.DEFAULT + '20',
    borderWidth: 2,
    borderColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.DEFAULT,
  },
  previewText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    lineHeight: typography.fontSize.sm * 1.5,
    marginBottom: spacing.md,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  noteMetaText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  metaDivider: {
    width: 1,
    height: 12,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.xs,
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary.DEFAULT + '15',
  },
  feedbackButtonText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.DEFAULT,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.xl,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: typography.fontSize.base * 1.5,
    marginBottom: spacing.xl,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary.DEFAULT,
    ...shadows.md,
  },
  emptyButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },

  // FAB
  fabContainer: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    zIndex: 100,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    ...shadows.lg,
  },
  fabGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Note Editor Styles
  editorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  editorHeaderCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editorHeaderTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  saveButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: borderRadius.md,
  },
  saveButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  editorScroll: {
    flex: 1,
  },
  editorScrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  noteTitleInput: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    padding: 0,
  },
  noteContentInput: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.base * 1.7,
    padding: 0,
    minHeight: 300,
  },
  editorFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  wordCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  wordCountText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary.DEFAULT + '15',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary.DEFAULT + '30',
  },
  analyzeButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary.DEFAULT,
  },
});
