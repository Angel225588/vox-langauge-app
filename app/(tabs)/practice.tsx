/**
 * Practice Tab - Card Component Testing Grid
 *
 * Simple 2-column grid to test all 12 card components
 */

import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 columns with padding

// Card data with metadata
const CARD_COMPONENTS = [
  // Original 6 cards
  {
    id: 'single-vocab',
    emoji: '📝',
    name: 'Single Vocab',
    time: '1 min',
    color: ['#6366F1', '#8B5CF6'],
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
  {
    id: 'multiple-choice',
    emoji: '✅',
    name: 'Multiple Choice',
    time: '1 min',
    color: ['#10B981', '#34D399'],
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    id: 'image-quiz',
    emoji: '🖼️',
    name: 'Image Quiz',
    time: '1 min',
    color: ['#8B5CF6', '#A78BFA'],
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  {
    id: 'audio-to-image',
    emoji: '🔊',
    name: 'Audio Quiz',
    time: '1 min',
    color: ['#3B82F6', '#60A5FA'],
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'text-input',
    emoji: '⌨️',
    name: 'Text Input',
    time: '2 min',
    color: ['#F59E0B', '#FBBF24'],
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  {
    id: 'speaking',
    emoji: '🎤',
    name: 'Speaking',
    time: '2 min',
    color: ['#EF4444', '#F87171'],
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  // NEW 6 cards from Gemini
  {
    id: 'sentence-scramble',
    emoji: '🧩',
    name: 'Sentence Scramble',
    time: '2 min',
    color: ['#EC4899', '#F472B6'],
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    isNew: true,
  },
  {
    id: 'fill-in-blank',
    emoji: '📄',
    name: 'Fill in Blank',
    time: '2 min',
    color: ['#14B8A6', '#2DD4BF'],
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    isNew: true,
  },
  {
    id: 'describe-image',
    emoji: '🎨',
    name: 'Describe Image',
    time: '3 min',
    color: ['#F59E0B', '#FB923C'],
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    isNew: true,
  },
  {
    id: 'storytelling',
    emoji: '📖',
    name: 'Storytelling',
    time: '4 min',
    color: ['#A855F7', '#C084FC'],
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    isNew: true,
  },
  {
    id: 'question-game',
    emoji: '❓',
    name: 'Question Game',
    time: '5 min',
    color: ['#06B6D4', '#22D3EE'],
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    isNew: true,
  },
  {
    id: 'role-play',
    emoji: '🎭',
    name: 'Role Play',
    time: '5 min',
    color: ['#F43F5E', '#FB7185'],
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    isNew: true,
  },
  {
    id: 'comparison',
    emoji: '⚖️',
    name: 'Comparison',
    time: '1 min',
    color: ['#22C55E', '#4ADE80'],
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  // NEW: Premium Vocabulary Cards
  {
    id: 'vocab-introduction',
    emoji: '📚',
    name: 'New Word',
    time: '1 min',
    color: ['#8B5CF6', '#A78BFA'],
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    isNew: true,
  },
  {
    id: 'vocab-listening',
    emoji: '🎧',
    name: 'Listen & Write',
    time: '2 min',
    color: ['#06B6D4', '#22D3EE'],
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    isNew: true,
  },
  {
    id: 'vocab-typing',
    emoji: '✍️',
    name: 'Translation',
    time: '2 min',
    color: ['#F59E0B', '#FBBF24'],
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    isNew: true,
  },
  // NEW: Listen & Speak, Audio Quiz, Full Flow
  {
    id: 'vocab-speaking',
    emoji: '🗣️',
    name: 'Listen & Speak',
    time: '2 min',
    color: ['#EF4444', '#F87171'],
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    isNew: true,
  },
  {
    id: 'vocab-audio-quiz',
    emoji: '👂',
    name: 'Audio Quiz',
    time: '1 min',
    color: ['#3B82F6', '#60A5FA'],
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    isNew: true,
  },
  {
    id: 'vocab-flow',
    emoji: '🔄',
    name: 'Vocab Flow',
    time: '5 min',
    color: ['#8B5CF6', '#C084FC'],
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    isNew: true,
  },
];

export default function PracticeScreen() {
  const router = useRouter();

  const handleCardPress = (cardId: string) => {
    console.log('[Practice] Testing card:', cardId);
    router.push(`/test-cards?type=${cardId}`);
  };

  const handleReadingPractice = () => {
    router.push('/reading-practice');
  };

  const handleWritingTask = () => {
    router.push('/test-writing-task');
  };

  const handleNotesLibrary = () => {
    router.push('/notes-library');
  };

  const handleRecordingsLibrary = () => {
    router.push('/recordings-library');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0E1A' }} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 64, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: '#1A1F3A' }}>
        <Text style={{ fontSize: 30, fontWeight: '700', color: '#F9FAFB', marginBottom: 8 }}>
          🎨 Card Components
        </Text>
        <Text style={{ fontSize: 16, color: '#9CA3AF' }}>
          Test all 12 mini-games • Tap to try
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
      >
        {/* Reading Practice Button */}
        <Animated.View
          entering={FadeInDown.duration(400).springify()}
          style={{ marginBottom: 16 }}
        >
          <TouchableOpacity
            onPress={handleReadingPractice}
            activeOpacity={0.9}
            style={{
              borderRadius: 20,
              overflow: 'hidden',
              shadowColor: '#6366F1',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                padding: 20,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 20,
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 16,
                }}
              >
                <Text style={{ fontSize: 28 }}>📖</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{ color: '#F9FAFB', fontSize: 18, fontWeight: '700' }}>
                    Reading Practice
                  </Text>
                  <View
                    style={{
                      backgroundColor: '#FF006E',
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 6,
                      marginLeft: 8,
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 10, fontWeight: '700' }}>NEW</Text>
                  </View>
                </View>
                <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 14 }}>
                  Teleprompter & pronunciation training
                </Text>
              </View>
              <Text style={{ color: '#F9FAFB', fontSize: 24, fontWeight: '700' }}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Writing Task Button */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(100).springify()}
          style={{ marginBottom: 16 }}
        >
          <TouchableOpacity
            onPress={handleWritingTask}
            activeOpacity={0.9}
            style={{
              borderRadius: 20,
              overflow: 'hidden',
              shadowColor: '#06D6A0',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <LinearGradient
              colors={['#06D6A0', '#4ECDC4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                padding: 20,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 20,
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 16,
                }}
              >
                <Text style={{ fontSize: 28 }}>✍️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{ color: '#0A0E1A', fontSize: 18, fontWeight: '700' }}>
                    Writing Tasks
                  </Text>
                  <View
                    style={{
                      backgroundColor: '#FF006E',
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 6,
                      marginLeft: 8,
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 10, fontWeight: '700' }}>NEW</Text>
                  </View>
                </View>
                <Text style={{ color: 'rgba(10, 14, 26, 0.7)', fontSize: 14 }}>
                  Personal Script Builder & AI feedback
                </Text>
              </View>
              <Text style={{ color: '#0A0E1A', fontSize: 24, fontWeight: '700' }}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Library Buttons Row */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(200).springify()}
          style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}
        >
          {/* Notes Library */}
          <TouchableOpacity
            onPress={handleNotesLibrary}
            activeOpacity={0.9}
            style={{
              flex: 1,
              borderRadius: 16,
              overflow: 'hidden',
              backgroundColor: '#1A1F3A',
              borderWidth: 1,
              borderColor: '#6366F1',
            }}
          >
            <View style={{ padding: 16, alignItems: 'center' }}>
              <Text style={{ fontSize: 28, marginBottom: 8 }}>📝</Text>
              <Text style={{ color: '#F9FAFB', fontSize: 14, fontWeight: '600' }}>
                My Notes
              </Text>
              <Text style={{ color: '#9CA3AF', fontSize: 12 }}>
                Writing library
              </Text>
            </View>
          </TouchableOpacity>

          {/* Recordings Library */}
          <TouchableOpacity
            onPress={handleRecordingsLibrary}
            activeOpacity={0.9}
            style={{
              flex: 1,
              borderRadius: 16,
              overflow: 'hidden',
              backgroundColor: '#1A1F3A',
              borderWidth: 1,
              borderColor: '#EF4444',
            }}
          >
            <View style={{ padding: 16, alignItems: 'center' }}>
              <Text style={{ fontSize: 28, marginBottom: 8 }}>🎙️</Text>
              <Text style={{ color: '#F9FAFB', fontSize: 14, fontWeight: '600' }}>
                Recordings
              </Text>
              <Text style={{ color: '#9CA3AF', fontSize: 12 }}>
                Audio library
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* 2-Column Grid */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          {CARD_COMPONENTS.map((card, index) => (
            <Animated.View
              key={card.id}
              entering={FadeInDown.duration(400).delay(index * 50).springify()}
              style={{ width: cardWidth }}
            >
              <TouchableOpacity
                onPress={() => handleCardPress(card.id)}
                activeOpacity={0.8}
                style={{
                  borderRadius: 20,
                  overflow: 'hidden',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <LinearGradient
                  colors={card.color}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    padding: 20,
                    minHeight: 160,
                    justifyContent: 'space-between',
                  }}
                >
                  {/* NEW Badge */}
                  {card.isNew && (
                    <View
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        backgroundColor: '#FF006E',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ color: 'white', fontSize: 10, fontWeight: '700' }}>
                        NEW
                      </Text>
                    </View>
                  )}

                  {/* Emoji */}
                  <Text style={{ fontSize: 48, marginBottom: 8 }}>
                    {card.emoji}
                  </Text>

                  {/* Card Info */}
                  <View>
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 16,
                        fontWeight: '700',
                        marginBottom: 6,
                      }}
                      numberOfLines={2}
                    >
                      {card.name}
                    </Text>

                    {/* Time Badge */}
                    <View
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 12,
                        alignSelf: 'flex-start',
                      }}
                    >
                      <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                        ⏱ {card.time}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Info Footer */}
        <View
          style={{
            marginTop: 24,
            padding: 16,
            backgroundColor: '#1A1F3A',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: '#222845',
          }}
        >
          <Text style={{ fontSize: 14, color: '#9CA3AF', textAlign: 'center' }}>
            💡 Tap any card to test the component
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
