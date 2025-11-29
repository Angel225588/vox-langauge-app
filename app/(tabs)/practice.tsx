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
];

export default function PracticeScreen() {
  const router = useRouter();

  const handleCardPress = (cardId: string) => {
    console.log('[Practice] Testing card:', cardId);
    router.push(`/test-cards?type=${cardId}`);
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
