import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  SingleVocabCard,
  ComparisonCard,
  ImageMultipleChoiceCard,
  AudioToImageCard,
  TextInputCard,
  SpeakingCard,
} from '@/components/cards';
import { colors, spacing, typography } from '@/constants/designSystem';

// Placeholder images from Unsplash
const PLACEHOLDER_IMAGES = {
  apple: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600',
  coffee: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600',
  book: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600',
  car: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600',
  dog: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600',
  cat: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600',
  house: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600',
  flower: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600',
};

export default function TestCardsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Card Component Gallery</Text>
          <Text style={styles.subtitle}>All reusable card types for Vox Language App</Text>
        </View>

        {/* 1. Single Vocab Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Single Vocabulary Card</Text>
          <Text style={styles.sectionDescription}>
            Image + word + phonetic + audio controls
          </Text>
          <SingleVocabCard
            word="apple"
            phonetic="/ˈæp.əl/"
            translation="manzana"
            imageUrl={PLACEHOLDER_IMAGES.apple}
            language="en-US"
            variant="default"
            showTranslation={false}
            tag="Vocabulary"
          />
        </View>

        {/* 2. Comparison Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Comparison Card (Stacked)</Text>
          <Text style={styles.sectionDescription}>
            Compare similar words (past/present, synonyms, etc.)
          </Text>
          <ComparisonCard
            title="Past vs Present Tense"
            items={[
              {
                label: 'PRESENT',
                word: 'watch',
                phonetic: '/wɒtʃ/',
              },
              {
                label: 'PAST',
                word: 'watched',
                phonetic: '/wɒtʃt/',
              },
            ]}
            language="en-US"
          />
        </View>

        {/* 3. Image Multiple Choice Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Image Multiple Choice</Text>
          <Text style={styles.sectionDescription}>
            See image, select correct word
          </Text>
          <ImageMultipleChoiceCard
            question="What is this?"
            imageUrl={PLACEHOLDER_IMAGES.coffee}
            options={['coffee', 'tea', 'water', 'juice']}
            correctAnswer="coffee"
            onAnswer={(isCorrect) => console.log('Answered:', isCorrect)}
          />
        </View>

        {/* 4. Audio to Image Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Audio to Image Card</Text>
          <Text style={styles.sectionDescription}>
            Listen to audio, select matching image
          </Text>
          <AudioToImageCard
            question="Select the image that matches the word you hear"
            audioText="dog"
            language="en-US"
            images={[
              { id: '1', url: PLACEHOLDER_IMAGES.dog, label: 'dog' },
              { id: '2', url: PLACEHOLDER_IMAGES.cat, label: 'cat' },
              { id: '3', url: PLACEHOLDER_IMAGES.house, label: 'house' },
              { id: '4', url: PLACEHOLDER_IMAGES.car, label: 'car' },
            ]}
            correctImageId="1"
            onAnswer={(isCorrect) => console.log('Answered:', isCorrect)}
          />
        </View>

        {/* 5. Text Input Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Text Input Card</Text>
          <Text style={styles.sectionDescription}>
            Type the answer with instant feedback
          </Text>
          <TextInputCard
            question="Translate to English:"
            prompt="Spanish: libro"
            imageUrl={PLACEHOLDER_IMAGES.book}
            correctAnswer="book"
            acceptedAnswers={['books', 'a book']}
            caseSensitive={false}
            onAnswer={(isCorrect, answer) =>
              console.log('Answered:', isCorrect, answer)
            }
          />
        </View>

        {/* 6. Speaking Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Speaking/Pronunciation Card</Text>
          <Text style={styles.sectionDescription}>
            Record your pronunciation
          </Text>
          <SpeakingCard
            question="Say this word out loud:"
            targetWord="flower"
            phonetic="/ˈflaʊ.ər/"
            imageUrl={PLACEHOLDER_IMAGES.flower}
            language="en-US"
            onRecordingComplete={(uri) => console.log('Recording saved:', uri)}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🎨 All cards use the new design system with gradients and depth effects
          </Text>
          <Text style={styles.footerText}>
            🔊 Audio controls: Normal speed + Slow speed
          </Text>
          <Text style={styles.footerText}>
            📱 Optimized for mobile with haptic feedback
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  content: {
    padding: spacing.lg,
    gap: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  sectionDescription: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
  },
  footer: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.background.card,
    borderRadius: 12,
    gap: spacing.sm,
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});
