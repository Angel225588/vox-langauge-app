import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAudioPlayer, useAudioRecorder, AudioModule } from 'expo-audio';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface SpeakingCardProps {
  word: string;              // Word to pronounce
  phonetic?: string;        // IPA pronunciation guide
  exampleAudioUrl?: string; // Optional reference audio
  onComplete: (audioUri: string) => void; // Called when recording is done
  onSkip?: () => void;       // Called when user skips
}

const SpeakingCard: React.FC<SpeakingCardProps> = ({
  word,
  phonetic,
  exampleAudioUrl,
  onComplete,
  onSkip,
}) => {
  const audioRecorder = useAudioRecorder();
  const examplePlayer = useAudioPlayer(exampleAudioUrl || '');
  const recordedPlayer = useAudioPlayer();
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const pulse = useSharedValue(1);

  const isRecording = audioRecorder.isRecording;

  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setRecordingDuration((prevDuration) => prevDuration + 1);
      }, 1000);
      pulse.value = withRepeat(
        withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setRecordingDuration(0);
      pulse.value = 1;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording]);


  const animatedRecordButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulse.value }],
    };
  });

  async function startRecording() {
    try {
      const permissionStatus = await AudioModule.requestRecordingPermissionsAsync();
      if (!permissionStatus.granted) {
        Alert.alert('Permission required', 'Please grant microphone access to record audio.');
        return;
      }

      await audioRecorder.record();
      setRecordedUri(null);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Recording Error', 'Failed to start recording. Please try again.');
    }
  }

  async function stopRecording() {
    try {
      const uri = await audioRecorder.stop();
      if (uri) {
        setRecordedUri(uri);
        // Replace the recorded player with the new recording
        recordedPlayer.replace(uri);
      }
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  }

  function playRecordedSound() {
    if (recordedUri && recordedPlayer) {
      recordedPlayer.play();
    }
  }

  function playExampleSound() {
    if (exampleAudioUrl && examplePlayer) {
      examplePlayer.play();
    }
  }

  const handleRecordButtonPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleDone = () => {
    if (recordedUri) {
      onComplete(recordedUri);
    } else {
      Alert.alert('No Recording', 'Please record your pronunciation before marking as done.');
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <View className="flex-1 justify-center items-center p-4">
      <View className="w-full aspect-[3/4] max-w-sm bg-white rounded-3xl shadow-lg border border-gray-200 p-6 justify-between items-center">
        <View className="w-full items-center">
          <Text className="text-3xl font-bold text-gray-800 text-center">{word}</Text>
          {phonetic && <Text className="text-lg text-gray-500 mt-2">{phonetic}</Text>}
        </View>

        {exampleAudioUrl && (
          <TouchableOpacity className="my-4 p-2 flex-row items-center rounded-full bg-blue-100" onPress={playExampleSound}>
            <Feather name="headphones" size={24} color="#2196F3" />
            <Text className="text-blue-500 ml-2">Play Example</Text>
          </TouchableOpacity>
        )}

        {!recordedUri ? (
          <>
            <AnimatedTouchableOpacity
              className={`w-24 h-24 rounded-full items-center justify-center my-8 ${isRecording ? 'bg-red-500' : 'bg-blue-500'}`}
              onPress={handleRecordButtonPress}
              style={animatedRecordButtonStyle}
            >
              <Feather name="mic" size={48} color="white" />
            </AnimatedTouchableOpacity>
            {isRecording && (
              <Text className="text-red-500 font-bold text-lg">
                {formatDuration(recordingDuration)}
              </Text>
            )}
          </>
        ) : (
          <View className="my-8 items-center">
            <TouchableOpacity className="p-4 rounded-full bg-green-500" onPress={playRecordedSound}>
              <Feather name="play" size={32} color="white" />
            </TouchableOpacity>
            <Text className="text-gray-500 mt-2">Your recording</Text>
          </View>
        )}

        <View className="w-full">
          {recordedUri ? (
            <View className="flex-row justify-between mt-4">
              <TouchableOpacity className="flex-1 bg-gray-200 rounded-full p-3 items-center mr-2" onPress={() => setRecordedUri(null)}>
                <Text className="text-gray-700 font-bold">Try Again</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-blue-500 rounded-full p-3 items-center ml-2" onPress={handleDone}>
                <Text className="text-white font-bold">Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity className="w-full bg-gray-200 rounded-full p-3 items-center mt-4" onPress={onSkip}>
              <Text className="text-gray-700 font-bold">Skip</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default SpeakingCard;
