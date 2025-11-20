import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Audio } from 'expo-av';
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
  const [recording, setRecording] = useState<Audio.Recording | undefined>();
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [recordingDuration, setRecordingDuration] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const pulse = useSharedValue(1);

  useEffect(() => {
    if (recording) {
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
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [recording]);

  const animatedRecordButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulse.value }],
    };
  });

  async function startRecording() {
    try {
      if (permissionResponse?.status !== 'granted') {
        console.log('Requesting permissions..');
        const response = await requestPermission();
        if (response.status !== 'granted') {
          Alert.alert('Permission required', 'Please grant microphone access to record audio.');
          return;
        }
      }
      
      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setRecordedUri(null); // Clear previous recording when starting new one
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Recording Error', 'Failed to start recording. Please try again.');
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    setRecording(undefined);
    await recording?.stopAndUnloadAsync();
    const uri = recording?.getURI();
    console.log('Recording stopped and stored at', uri);
    if (uri) {
      setRecordedUri(uri);
    }
  }

  async function playRecordedSound() {
    if (recordedUri) {
      try {
        console.log('Loading recorded sound..');
        const { sound } = await Audio.Sound.createAsync({ uri: recordedUri });
        console.log('Playing recorded sound..');
        await sound.playAsync();
        // Don't unload immediately, allow user to replay
      } catch (error) {
        console.error('Failed to play recorded sound', error);
        Alert.alert('Playback Error', 'Could not play your recording.');
      }
    }
  }

  async function playExampleSound() {
    if (exampleAudioUrl) {
      try {
        console.log('Loading example sound..');
        const { sound } = await Audio.Sound.createAsync({ uri: exampleAudioUrl });
        console.log('Playing example sound..');
        await sound.playAsync();
        // Don't unload immediately, allow user to replay
      } catch (error) {
        console.error('Failed to play example sound', error);
        Alert.alert('Playback Error', 'Could not play example audio.');
      }
    }
  }

  const handleRecordButtonPress = () => {
    if (recording) {
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
              className={`w-24 h-24 rounded-full items-center justify-center my-8 ${recording ? 'bg-red-500' : 'bg-blue-500'}`}
              onPress={handleRecordButtonPress}
              style={animatedRecordButtonStyle}
            >
              <Feather name="mic" size={48} color="white" />
            </AnimatedTouchableOpacity>
            {recording && (
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
