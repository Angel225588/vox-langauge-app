import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { Feather } from '@expo/vector-icons';
import { Audio } from 'expo-av';
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

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const AnimatedView = styled(Animated.View);

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
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);

  const feedbackOpacity = useSharedValue(0);
  const feedbackScale = useSharedValue(0.8);

  async function playSound() {
    if (sound) {
      await sound.replayAsync();
      return;
    }

    if (audioUrl) {
      console.log('Loading Sound');
      const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
      setSound(sound);

      console.log('Playing Sound');
      await sound.playAsync();
    }
  }

  useEffect(() => {
    playSound();
  }, []);

  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

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
    <StyledView className="flex-1 justify-center items-center p-4">
      <StyledView className="w-full aspect-[3/4] max-w-sm bg-white rounded-3xl shadow-lg border border-gray-200 p-6 justify-between">
        <StyledView>
          <StyledText className="text-xl font-bold text-gray-800 text-center mb-4">
            Listen and type what you hear
          </StyledText>
          <StyledTouchableOpacity className="items-center my-8" onPress={playSound}>
            <Feather name="volume-2" size={64} color="#2196F3" />
          </StyledTouchableOpacity>
        </StyledView>

        <StyledTextInput
          className="bg-white border border-gray-300 rounded-xl w-full p-4 text-lg text-center"
          placeholder="Type here..."
          value={userInput}
          onChangeText={setUserInput}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <StyledView>
          <AnimatedView style={feedbackAnimatedStyle} className={`absolute -top-16 self-center p-3 rounded-full ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
            <StyledText className="text-white font-bold text-base">{feedbackMessage}</StyledText>
          </AnimatedView>

          <StyledTouchableOpacity
            className={`rounded-full p-4 items-center mt-4 ${!userInput ? 'bg-gray-400' : 'bg-green-500'}`}
            onPress={handleCheck}
            disabled={!userInput || feedbackOpacity.value !== 0} // Disable during feedback
          >
            <StyledText className="text-white font-bold text-lg">Check</StyledText>
          </StyledTouchableOpacity>

          <StyledView className="flex-row justify-center mt-4">
            <StyledTouchableOpacity className="p-2" onPress={playSound}>
              <StyledText className="text-gray-500">Play again</StyledText>
            </StyledTouchableOpacity>
            {onSkip && (
              <>
                <StyledText className="text-gray-300 mx-2">|</StyledText>
                <StyledTouchableOpacity className="p-2" onPress={onSkip}>
                  <StyledText className="text-gray-500">Skip</StyledText>
                </StyledTouchableOpacity>
              </>
            )}
          </StyledView>
        </StyledView>
      </StyledView>
    </StyledView>
  );
};

export default ListeningCard;
