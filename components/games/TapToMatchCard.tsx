import React, { useState, useEffect, useRef } from 'react';
import { YStack, XStack, Card, Text, Button } from '@/components/ui/tamagui';
import * as Haptics from 'expo-haptics'; // Assuming expo-haptics is available
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { LottieSuccess } from '../animations/LottieSuccess';

interface Pair {
  id: string;
  spanish: string;
  english: string;
}

interface CardData {
  id: string;
  pairId: string; // To link spanish and english words
  content: string; // The word to display
  type: 'spanish' | 'english';
  isFlipped: boolean;
  isMatched: boolean;
}

interface TapToMatchCardProps {
  pairs: Pair[];
  onComplete: (timeInSeconds: number) => void;
}

const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export function TapToMatchCard({ pairs, onComplete }: TapToMatchCardProps) {
  const [cards, setCards] = useState<CardData[]>([]);
  const [flippedCards, setFlippedCards] = useState<CardData[]>([]);
  const [matchedPairsCount, setMatchedPairsCount] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const startTime = useRef<number>(0);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    initializeGame();
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [pairs]);

  useEffect(() => {
    if (gameStarted && !gameComplete) {
      startTime.current = Date.now();
      timerInterval.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.current) / 1000));
      }, 1000);
    } else if (gameComplete && timerInterval.current) {
      clearInterval(timerInterval.current);
    }
  }, [gameStarted, gameComplete]);

  const initializeGame = () => {
    const initialCards: CardData[] = [];
    pairs.forEach(pair => {
      initialCards.push({
        id: `${pair.id}-spanish`,
        pairId: pair.id,
        content: pair.spanish,
        type: 'spanish',
        isFlipped: false,
        isMatched: false,
      });
      initialCards.push({
        id: `${pair.id}-english`,
        pairId: pair.id,
        content: pair.english,
        type: 'english',
        isFlipped: false,
        isMatched: false,
      });
    });
    setCards(shuffleArray(initialCards));
    setFlippedCards([]);
    setMatchedPairsCount(0);
    setGameStarted(true);
    setGameComplete(false);
    setElapsedTime(0);
  };

  const handleCardPress = (tappedCard: CardData) => {
    if (gameComplete || tappedCard.isFlipped || tappedCard.isMatched || flippedCards.length === 2) {
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newCards = cards.map(card =>
      card.id === tappedCard.id ? { ...card, isFlipped: true } : card
    );
    setCards(newCards);

    const newFlippedCards = [...flippedCards, { ...tappedCard, isFlipped: true }];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      const [card1, card2] = newFlippedCards;

      if (card1.pairId === card2.pairId) {
        // Match found
        setMatchedPairsCount(prev => prev + 1);
        setCards(prevCards =>
          prevCards.map(card =>
            card.pairId === card1.pairId ? { ...card, isMatched: true, isFlipped: true } : card
          )
        );
        setFlippedCards([]);
        if (matchedPairsCount + 1 === pairs.length) {
          setGameComplete(true);
          onComplete(elapsedTime);
        }
      } else {
        // No match, flip back after a delay
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map(card =>
              card.id === card1.id || card.id === card2.id ? { ...card, isFlipped: false } : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  if (gameComplete) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <LottieSuccess message="You matched all pairs!" onComplete={() => {}} />
        <Text fontSize="$6" fontWeight="bold" color="$textSecondary" marginTop="$4">
          Time: {elapsedTime} seconds
        </Text>
        <Button onPress={initializeGame} marginTop="$4" size="lg">
          Play Again
        </Button>
      </YStack>
    );
  }

  return (
    <YStack flex={1} padding="$4" gap="$4">
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontSize="$4" fontWeight="bold" color="$color">
          Matches: {matchedPairsCount}/{pairs.length}
        </Text>
        <Text fontSize="$4" fontWeight="bold" color="$color">
          ⏱️ {elapsedTime}s
        </Text>
      </XStack>

      <YStack flex={1} justifyContent="center" alignItems="center">
        <XStack flexWrap="wrap" justifyContent="center" gap="$3">
          {cards.map(card => (
            <FlipCard
              key={card.id}
              card={card}
              onPress={() => handleCardPress(card)}
            />
          ))}
        </XStack>
      </YStack>
    </YStack>
  );
}

interface FlipCardProps {
  card: CardData;
  onPress: () => void;
}

function FlipCard({ card, onPress }: FlipCardProps) {
  const rotation = useSharedValue(0);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = rotation.value < 90 ? `${rotation.value}deg` : `${180 - rotation.value}deg`;
    return {
      transform: [{ rotateY: rotateY }],
      opacity: rotation.value < 90 ? 1 : 0,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = rotation.value >= 90 ? `${rotation.value - 180}deg` : `${rotation.value}deg`;
    return {
      transform: [{ rotateY: rotateY }],
      opacity: rotation.value >= 90 ? 1 : 0,
    };
  });

  useEffect(() => {
    if (card.isFlipped) {
      rotation.value = withTiming(180, { duration: 300, easing: Easing.linear });
    } else {
      rotation.value = withTiming(0, { duration: 300, easing: Easing.linear });
    }
  }, [card.isFlipped]);

  return (
    <Card
      key={card.id}
      size="$6"
      width={120}
      height={120}
      pressStyle={{ scale: 0.95 }}
      animation="bouncy" // Use Tamagui animation prop for press
      onPress={onPress}
      overflow="hidden"
      position="relative"
      backgroundColor={card.isMatched ? '$greenTransparent' : '$backgroundStrong'}
    >
      <Animated.View
        style={[{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden' }, frontAnimatedStyle]}
      >
        <YStack f={1} justifyContent="center" alignItems="center">
          <Text fontSize="$5" fontWeight="bold" color={card.isMatched ? '$green10' : '$color'}>
            {card.isMatched ? card.content : '?'}
          </Text>
        </YStack>
      </Animated.View>
      <Animated.View
        style={[{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', transform: [{ rotateY: '180deg' }] }, backAnimatedStyle]}
      >
        <YStack f={1} justifyContent="center" alignItems="center">
          <Text fontSize="$5" fontWeight="bold" color="$color">
            {card.content}
          </Text>
        </YStack>
      </Animated.View>
    </Card>
  );
}
