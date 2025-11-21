import React, { useState, useEffect } from 'react';
import { YStack, XStack, Text, Card, Button, Image } from '@/components/ui/tamagui';
import { Audio } from 'expo-av';
import { AntDesign } from '@expo/vector-icons'; // Assuming expo-vector-icons is available for check/x

interface QuestionOption {
  id: string;
  imageUri: string;
  label: string;
}

interface MultipleChoiceQuestion {
  id: string;
  audioUri: string;
  correctImageUri: string;
  word: string; // Spanish word
  translation: string; // English
  options: QuestionOption[];
}

interface MultipleChoiceCardProps {
  questions: MultipleChoiceQuestion[];
  onComplete: (score: number) => void;
}

export function MultipleChoiceCard({ questions, onComplete }: MultipleChoiceCardProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const isCorrect = selectedOptionId === currentQuestion?.correctImageUri;

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const playSound = async (uri: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      setSound(newSound);
    } catch (error) {
      // console.error('Error playing sound:', error);
    }
  };

  const handleOptionPress = (optionId: string) => {
    if (isAnswered) return;

    setSelectedOptionId(optionId);
    setIsAnswered(true);

    if (optionId === currentQuestion.correctImageUri) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
    } else {
      onComplete(score);
    }
  };

  if (!currentQuestion) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text fontSize="$5">No questions available.</Text>
      </YStack>
    );
  }

  return (
    <YStack flex={1} padding="$4" gap="$4">
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontSize="$4" fontWeight="bold" color="$color">
          Multiple Choice 🎧
        </Text>
        <Text fontSize="$4" fontWeight="bold" color="$color">
          Question {currentQuestionIndex + 1}/{questions.length}
        </Text>
      </XStack>

      <YStack alignItems="center" gap="$4">
        <Button onPress={() => playSound(currentQuestion.audioUri)} size="lg" icon={<AntDesign name="sound" size={24} />}>
          Listen to the word
        </Button>
        {isAnswered && (
          <Text fontSize="$5" fontWeight="bold" color={isCorrect ? '$green10' : '$red10'}>
            {isCorrect ? 'Correct!' : 'Incorrect!'} ({currentQuestion.word} - {currentQuestion.translation})
          </Text>
        )}
      </YStack>

      <XStack flexWrap="wrap" justifyContent="center" gap="$3">
        {currentQuestion.options.map(option => (
          <Card
            key={option.id}
            width={150}
            height={150}
            // interactive={!isAnswered} // Make it clickable only if not answered
            onPress={() => handleOptionPress(option.id)}
            animation="bouncy"
            pressStyle={{ scale: 0.95 }}
            borderColor={
              isAnswered && selectedOptionId === option.id
                ? (isCorrect ? '$green10' : '$red10')
                : (isAnswered && option.imageUri === currentQuestion.correctImageUri ? '$green10' : '$borderColor') // Highlight correct answer after selection
            }
            borderWidth={isAnswered ? 2 : 1}
            position="relative"
            justifyContent="center"
            alignItems="center"
          >
            <Image
              source={{ uri: option.imageUri }}
              alt={option.label}
              width={100}
              height={100}
              resizeMode="contain"
            />
            {isAnswered && selectedOptionId === option.id && (
              <YStack position="absolute" top="$1" right="$1">
                <AntDesign
                  name={isCorrect ? 'checkcircle' : 'closecircle'}
                  size={24}
                  color={isCorrect ? '$green10' : '$red10'}
                />
              </YStack>
            )}
            <Text fontSize="$3" textAlign="center" color="$color" marginTop="$2">
              {option.label}
            </Text>
          </Card>
        ))}
      </XStack>

      {isAnswered && (
        <Button
          onPress={handleNextQuestion}
          marginTop="$4"
          size="lg"
          alignSelf="center"
        >
          {currentQuestionIndex < questions.length - 1 ? 'Next Question →' : 'Finish Quiz'}
        </Button>
      )}
    </YStack>
  );
}
