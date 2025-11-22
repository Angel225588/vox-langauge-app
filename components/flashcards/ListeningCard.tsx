import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';

interface ListeningCardProps {
  word: string;
  audioUrl: string;
  onCorrect: () => void;
  onIncorrect: () => void;
  onSkip?: () => void;
}

const ListeningCard: React.FC<ListeningCardProps> = ({
  word,
  audioUrl,
  onCorrect,
  onIncorrect,
  onSkip,
}) => {
  const [userInput, setUserInput] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const player = useAudioPlayer(audioUrl);

  const feedbackOpacity = useSharedValue(0);
  const feedbackScale = useSharedValue(0.8);

  function playSound() {
    if (player) {
      player.play();
    }
  }

  useEffect(() => {
    playSound();
  }, []);

  const showFeedback = (correct: boolean, message: string) => {
    setIsCorrect(correct);
    setFeedbackMessage(message);
    feedbackOpacity.value = withSequence(
      withTiming(1, { duration: 300 }),
      withDelay(1000, withTiming(0, { duration: 300 }))
    );
    feedbackScale.value = withSequence(
      withSpring(1.2),
      withDelay(1000, withSpring(0.8))
    );
  };

  const handleCheck = () => {
    if (userInput.trim().toLowerCase() === word.toLowerCase()) {
      showFeedback(true, 'Correct!');
      setTimeout(onCorrect, 1600); // Call onCorrect after feedback animation
    } else {
      showFeedback(false, `Incorrect. The answer was "${word}".`);
      setTimeout(onIncorrect, 1600); // Call onIncorrect after feedback animation
    }
  };

  const feedbackAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: feedbackOpacity.value,
      transform: [{ scale: feedbackScale.value }],
    };
  });

  return (
    <View className="flex-1 justify-center items-center p-4">
      <View className="w-full aspect-[3/4] max-w-sm bg-white rounded-3xl shadow-lg border border-gray-200 p-6 justify-between">
        <View>
          <Text className="text-xl font-bold text-gray-800 text-center mb-4">
            Listen and type what you hear
          </Text>
          <TouchableOpacity className="items-center my-8" onPress={playSound}>
            <Feather name="volume-2" size={64} color="#2196F3" />
          </TouchableOpacity>
        </View>

        <TextInput
          className="bg-white border border-gray-300 rounded-xl w-full p-4 text-lg text-center"
          placeholder="Type here..."
          value={userInput}
          onChangeText={setUserInput}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View>
          <Animated.View style={feedbackAnimatedStyle} className={`absolute -top-16 self-center p-3 rounded-full ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
            <Text className="text-white font-bold text-base">{feedbackMessage}</Text>
          </Animated.View>

          <TouchableOpacity
            className={`rounded-full p-4 items-center mt-4 ${!userInput ? 'bg-gray-400' : 'bg-green-500'}`}
            onPress={handleCheck}
            disabled={!userInput || feedbackOpacity.value !== 0} // Disable during feedback
          >
            <Text className="text-white font-bold text-lg">Check</Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-4">
            <TouchableOpacity className="p-2" onPress={playSound}>
              <Text className="text-gray-500">Play again</Text>
            </TouchableOpacity>
            {onSkip && (
              <>
                <Text className="text-gray-300 mx-2">|</Text>
                <TouchableOpacity className="p-2" onPress={onSkip}>
                  <Text className="text-gray-500">Skip</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default ListeningCard;
