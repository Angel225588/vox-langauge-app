import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Audio } from 'expo-av';

interface LearningCardProps {
  word: string;
  translation: string;
  phonetic?: string;
  imageUrl?: string;
  audioUrl?: string;
  exampleSentence?: string;
  onFlip?: () => void;
}

const LearningCard: React.FC<LearningCardProps> = ({
  word,
  translation,
  phonetic,
  imageUrl,
  audioUrl,
  exampleSentence,
  onFlip,
}) => {
  const rotateY = useSharedValue(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const tap = Gesture.Tap().onEnd(() => {
    rotateY.value = withTiming(rotateY.value === 0 ? 180 : 0, { duration: 500 });
    if (onFlip) {
      onFlip();
    }
  });

  async function playSound() {
    if (audioUrl) {
      console.log('Loading Sound');
      const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
      setSound(sound);

      console.log('Playing Sound');
      await sound.playAsync();
    }
  }

  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const frontRotate = interpolate(
      rotateY.value,
      [0, 180],
      [0, 180],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ rotateY: `${frontRotate}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const backRotate = interpolate(
      rotateY.value,
      [0, 180],
      [180, 360],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ rotateY: `${backRotate}deg` }],
      backfaceVisibility: 'hidden',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    };
  });

  const FrontCard = () => (
    <Animated.View style={frontAnimatedStyle} className="w-full h-full">
      <View
        className="w-full h-full p-6 bg-white rounded-3xl shadow-lg border border-gray-200 justify-between items-center"
      >
        <View className="w-full">
          <Text className="text-3xl font-bold text-gray-800 text-center">{word}</Text>
        </View>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} className="w-48 h-48 my-4" resizeMode="contain" />
        ) : (
          <View className="w-48 h-48 my-4 justify-center items-center bg-gray-100 rounded-2xl">
            <Feather name="image" size={48} color="#9CA3AF" />
          </View>
        )}
        <View className="w-full items-center">
          {phonetic && <Text className="text-lg text-gray-500 mb-4">{phonetic}</Text>}
          <Text className="text-base text-blue-500">Tap to reveal translation</Text>
        </View>
      </View>
    </Animated.View>
  );

  const BackCard = () => (
    <Animated.View style={backAnimatedStyle} className="w-full h-full">
      <View
        className="w-full h-full p-6 bg-white rounded-3xl shadow-lg border border-gray-200 justify-between items-center"
      >
        <View className="w-full">
          <Text className="text-3xl font-bold text-gray-800 text-center">{translation}</Text>
        </View>
        {exampleSentence && (
          <Text className="text-lg text-gray-600 my-4 text-center">{exampleSentence}</Text>
        )}
        {audioUrl && (
          <Pressable onPress={playSound} className="my-4">
            <Feather name="play-circle" size={48} color="#2196F3" />
          </Pressable>
        )}
        <View className="w-full items-center">
          <Text className="text-base text-blue-500">Tap to flip back</Text>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <GestureDetector gesture={tap}>
      <View className="flex-1 justify-center items-center p-4" style={{ perspective: 1000 }}>
        <View className="w-full aspect-[3/4] max-w-sm">
          <FrontCard />
          <BackCard />
        </View>
      </View>
    </GestureDetector>
  );
};

export default LearningCard;
