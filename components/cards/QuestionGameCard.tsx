import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Keyboard } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, shadows, typography } from '@/constants/designSystem';
import { LottieSuccess } from '../animations/LottieSuccess';
import { LottieError } from '../animations/LottieError';

interface QuestionGameCardProps {
  secretWord: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  maxQuestions?: number;
  onComplete: (won: boolean, questionsUsed: number) => void;
  // Inherited from BaseCardProps
  [key: string]: any;
}

interface QARound {
  question: string;
  answer: 'Yes' | 'No' | 'Maybe' | 'N/A';
  type: 'question' | 'guess';
}

// Expanded knowledge base for AI responses - 50+ common words
const AI_KNOWLEDGE_BASE: { [key: string]: { properties: string[], negativeProperties: string[] } } = {
  // Food & Drinks
  apple: { properties: ['red', 'fruit', 'round', 'sweet', 'tree', 'food', 'healthy', 'crunchy'], negativeProperties: ['vegetable', 'meat', 'square', 'drink', 'animal'] },
  coffee: { properties: ['drink', 'hot', 'caffeine', 'breakfast', 'liquid', 'brown', 'beverage', 'bitter'], negativeProperties: ['animal', 'cold', 'solid', 'food', 'sweet'] },
  pizza: { properties: ['food', 'hot', 'cheese', 'italian', 'round', 'meal', 'delicious', 'baked', 'salty', 'popular'], negativeProperties: ['drink', 'fruit', 'vegetable', 'cold', 'animal', 'sweet', 'spicy'] },
  water: { properties: ['drink', 'liquid', 'clear', 'essential', 'beverage', 'transparent', 'wet'], negativeProperties: ['solid', 'food', 'hot', 'colored', 'animal'] },
  bread: { properties: ['food', 'baked', 'wheat', 'carbohydrate', 'breakfast', 'soft'], negativeProperties: ['drink', 'fruit', 'meat', 'liquid', 'animal'] },
  banana: { properties: ['fruit', 'yellow', 'food', 'sweet', 'curved', 'soft', 'healthy'], negativeProperties: ['vegetable', 'drink', 'meat', 'round', 'animal'] },

  // Animals
  dog: { properties: ['animal', 'pet', 'fur', 'bark', 'four legs', 'mammal', 'loyal', 'friendly'], negativeProperties: ['fish', 'bird', 'plant', 'insect', 'food'] },
  cat: { properties: ['animal', 'pet', 'fur', 'meow', 'four legs', 'mammal', 'independent'], negativeProperties: ['fish', 'bird', 'plant', 'insect', 'food'] },
  bird: { properties: ['animal', 'fly', 'feathers', 'wings', 'beak', 'eggs', 'chirp'], negativeProperties: ['mammal', 'fur', 'four legs', 'plant', 'food'] },
  fish: { properties: ['animal', 'swim', 'water', 'scales', 'gills', 'fins', 'aquatic'], negativeProperties: ['fur', 'legs', 'feathers', 'plant', 'land'] },
  elephant: { properties: ['animal', 'large', 'trunk', 'gray', 'mammal', 'four legs', 'wild'], negativeProperties: ['small', 'pet', 'bird', 'fish', 'food'] },
  lion: { properties: ['animal', 'wild', 'mammal', 'carnivore', 'roar', 'mane', 'king'], negativeProperties: ['pet', 'small', 'herbivore', 'bird', 'food'] },

  // Vehicles
  car: { properties: ['vehicle', 'drive', 'wheels', 'transport', 'road', 'four wheels', 'engine'], negativeProperties: ['animal', 'plant', 'food', 'building', 'fly'] },
  bicycle: { properties: ['vehicle', 'two wheels', 'pedal', 'transport', 'exercise', 'ride'], negativeProperties: ['motor', 'animal', 'plant', 'food', 'building'] },
  airplane: { properties: ['vehicle', 'fly', 'wings', 'transport', 'sky', 'fast', 'engine'], negativeProperties: ['animal', 'plant', 'food', 'ground', 'slow'] },
  boat: { properties: ['vehicle', 'water', 'float', 'transport', 'sail', 'ocean'], negativeProperties: ['land', 'fly', 'animal', 'plant', 'food'] },
  train: { properties: ['vehicle', 'tracks', 'transport', 'long', 'passenger', 'locomotive'], negativeProperties: ['road', 'fly', 'animal', 'plant', 'food'] },

  // Nature
  tree: { properties: ['plant', 'wood', 'leaves', 'tall', 'roots', 'nature', 'oxygen'], negativeProperties: ['animal', 'vehicle', 'food', 'small', 'metal'] },
  flower: { properties: ['plant', 'beautiful', 'grow', 'garden', 'petals', 'colorful', 'smell'], negativeProperties: ['animal', 'vehicle', 'building', 'ugly', 'metal'] },
  sun: { properties: ['star', 'hot', 'bright', 'yellow', 'light', 'sky', 'energy'], negativeProperties: ['cold', 'dark', 'plant', 'animal', 'ground'] },
  rain: { properties: ['water', 'wet', 'drops', 'weather', 'sky', 'clouds'], negativeProperties: ['dry', 'solid', 'hot', 'animal', 'plant'] },
  mountain: { properties: ['tall', 'rock', 'nature', 'peak', 'climb', 'high', 'solid'], negativeProperties: ['flat', 'low', 'liquid', 'animal', 'small'] },

  // Buildings & Objects
  house: { properties: ['building', 'live in', 'home', 'rooms', 'shelter', 'roof', 'walls'], negativeProperties: ['animal', 'vehicle', 'food', 'plant', 'mobile'] },
  school: { properties: ['building', 'learn', 'education', 'students', 'teachers', 'classroom'], negativeProperties: ['home', 'animal', 'vehicle', 'food', 'plant'] },
  book: { properties: ['paper', 'read', 'pages', 'words', 'knowledge', 'literature'], negativeProperties: ['digital', 'animal', 'food', 'liquid', 'living'] },
  phone: { properties: ['device', 'electronic', 'communication', 'call', 'screen', 'technology'], negativeProperties: ['living', 'natural', 'food', 'large', 'plant'] },
  computer: { properties: ['device', 'electronic', 'technology', 'screen', 'keyboard', 'internet'], negativeProperties: ['living', 'natural', 'food', 'animal', 'plant'] },
  chair: { properties: ['furniture', 'sit', 'legs', 'indoor', 'wood', 'support'], negativeProperties: ['living', 'animal', 'food', 'vehicle', 'lie down'] },
  table: { properties: ['furniture', 'flat', 'surface', 'legs', 'indoor', 'wood'], negativeProperties: ['living', 'animal', 'food', 'vehicle', 'vertical'] },

  // Body & Health
  heart: { properties: ['organ', 'body', 'pump', 'blood', 'vital', 'inside', 'muscle'], negativeProperties: ['external', 'bone', 'plant', 'food', 'electronic'] },
  hand: { properties: ['body part', 'fingers', 'grasp', 'touch', 'five', 'external'], negativeProperties: ['internal', 'organ', 'plant', 'food', 'tool'] },
  eye: { properties: ['body part', 'see', 'vision', 'round', 'external', 'sense'], negativeProperties: ['hear', 'internal', 'plant', 'food', 'limb'] },

  // Weather & Time
  snow: { properties: ['cold', 'white', 'winter', 'frozen', 'water', 'weather'], negativeProperties: ['hot', 'liquid', 'summer', 'animal', 'plant'] },
  cloud: { properties: ['sky', 'white', 'water', 'vapor', 'weather', 'fluffy'], negativeProperties: ['ground', 'solid', 'animal', 'plant', 'hard'] },
  moon: { properties: ['sky', 'night', 'round', 'white', 'celestial', 'satellite'], negativeProperties: ['day', 'sun', 'square', 'animal', 'plant'] },
  star: { properties: ['sky', 'night', 'bright', 'celestial', 'twinkle', 'hot'], negativeProperties: ['day', 'ground', 'dark', 'animal', 'plant'] },

  // Colors (conceptual)
  red: { properties: ['color', 'warm', 'bright', 'primary', 'vibrant'], negativeProperties: ['dull', 'cold', 'object', 'animal', 'plant'] },
  blue: { properties: ['color', 'cool', 'calm', 'primary', 'sky'], negativeProperties: ['warm', 'red', 'object', 'animal', 'plant'] },

  // Emotions & Abstract
  love: { properties: ['emotion', 'feeling', 'positive', 'heart', 'abstract', 'care'], negativeProperties: ['hate', 'physical', 'object', 'animal', 'plant'] },
  happiness: { properties: ['emotion', 'feeling', 'positive', 'joy', 'abstract', 'smile'], negativeProperties: ['sadness', 'physical', 'object', 'animal', 'plant'] },

  // Activities
  running: { properties: ['activity', 'exercise', 'fast', 'movement', 'sport', 'legs'], negativeProperties: ['still', 'slow', 'object', 'sitting', 'sleeping'] },
  swimming: { properties: ['activity', 'exercise', 'water', 'movement', 'sport', 'wet'], negativeProperties: ['dry', 'land', 'object', 'still', 'sleeping'] },

  // Seasons
  summer: { properties: ['season', 'hot', 'vacation', 'sunny', 'warm', 'time'], negativeProperties: ['cold', 'winter', 'object', 'animal', 'plant'] },
  winter: { properties: ['season', 'cold', 'snow', 'ice', 'time', 'dark'], negativeProperties: ['hot', 'summer', 'object', 'animal', 'plant'] },
};

export const QuestionGameCard: React.FC<QuestionGameCardProps> = ({
  secretWord,
  category,
  difficulty,
  maxQuestions = 10,
  onComplete,
  ...baseCardProps
}) => {
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [qaHistory, setQaHistory] = useState<QARound[]>([]);
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userGuess, setUserGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [showResultAnimation, setShowResultAnimation] = useState<'success' | 'error' | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Store the secret word and category at game start to prevent them from changing mid-game
  const [gameSecretWord] = useState(secretWord);
  const [gameCategory] = useState(category);
  const [gameDifficulty] = useState(difficulty);

  useEffect(() => {
    // Scroll to bottom on new QA entry
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [qaHistory]);

  const getAiAnswer = (question: string): 'Yes' | 'No' | 'Maybe' | 'N/A' => {
    const lowerQuestion = question.toLowerCase().trim();
    const wordInfo = AI_KNOWLEDGE_BASE[gameSecretWord.toLowerCase()];

    if (!wordInfo) return 'Maybe'; // Fallback to Maybe instead of N/A

    // Direct question about the word itself (avoid giving it away)
    if (lowerQuestion.includes(`is it ${gameSecretWord.toLowerCase()}`) ||
        lowerQuestion === gameSecretWord.toLowerCase()) {
      return 'Yes';
    }

    // Category-based check
    if (lowerQuestion.includes(gameCategory.toLowerCase())) {
      return 'Yes';
    }

    // CRITICAL: Determine what TYPE of thing this is
    const isAnimal = wordInfo.properties.some(p => ['animal', 'mammal', 'pet', 'wild', 'bird', 'fish'].includes(p));
    const isFood = wordInfo.properties.some(p => ['food', 'fruit', 'meal', 'baked', 'drink', 'beverage'].includes(p));
    const isVehicle = wordInfo.properties.some(p => ['vehicle', 'transport', 'car', 'airplane', 'boat'].includes(p));
    const isPlant = wordInfo.properties.some(p => ['plant', 'tree', 'flower'].includes(p));

    // CONTEXT-AWARE QUESTION HANDLING
    // If it's an animal, reject food-related questions
    if (isAnimal) {
      // Food ingredient questions
      if (lowerQuestion.match(/(?:is it|is|does it have|have) (?:a |an )?(?:food|cheese|tomato|flour|meat|vegetable|fruit|bread|pizza|milk|egg|butter|sugar|salt)/)) {
        return 'No';
      }
      // Single-word food questions (e.g., "Tomato?", "Flour?")
      if (lowerQuestion.match(/^(?:tomato|flour|cheese|bread|pizza|milk|egg|butter|rice|pasta|meat)\??$/)) {
        return 'No';
      }
      // Cuisine questions
      if (lowerQuestion.match(/(?:american|italian|chinese|mexican|french|japanese) food/)) {
        return 'No';
      }
      // "Is it food?" question
      if (lowerQuestion.match(/(?:is it|is) (?:a |an )?food/)) {
        return 'No';
      }
    }

    // If it's food, reject animal questions
    if (isFood) {
      if (lowerQuestion.match(/(?:is it|is) (?:a |an )?(?:animal|mammal|pet|bird|fish|lion|elephant|dog|cat)/)) {
        return 'No';
      }
      // Single-word animal questions (e.g., "Fish?", "Dog?")
      if (lowerQuestion.match(/^(?:fish|dog|cat|bird|lion|elephant|tiger|bear|monkey)\??$/)) {
        return 'No';
      }
    }

    // If it's a vehicle, reject food and animal questions
    if (isVehicle) {
      if (lowerQuestion.match(/(?:is it|is) (?:a |an )?(?:animal|food)/)) {
        return 'No';
      }
    }

    // If it's a plant, reject animal and vehicle questions
    if (isPlant) {
      if (lowerQuestion.match(/(?:is it|is) (?:a |an )?(?:animal|vehicle)/)) {
        return 'No';
      }
    }

    // Check negative properties first (for "No" answers)
    for (const negProp of wordInfo.negativeProperties) {
      // Check for exact word match or word boundaries
      const regex = new RegExp(`\\b${negProp}\\b`, 'i');
      if (regex.test(lowerQuestion)) {
        return 'No';
      }
    }

    // Check positive properties
    for (const prop of wordInfo.properties) {
      const regex = new RegExp(`\\b${prop}\\b`, 'i');
      if (regex.test(lowerQuestion)) {
        return 'Yes';
      }
    }

    // Common question patterns - EXPANDED
    const patterns = [
      { regex: /can (?:you |it )?eat/, checkProps: ['food', 'fruit', 'drink', 'meal', 'baked'] },
      { regex: /is it (?:a )?food/, checkProps: ['food', 'fruit', 'meal', 'baked'] },
      { regex: /is it alive|living/, checkProps: ['animal', 'plant', 'living'] },
      { regex: /can (?:it |you )?fly/, checkProps: ['fly', 'bird', 'airplane', 'wings'] },
      { regex: /can (?:it |you )?swim/, checkProps: ['swim', 'fish', 'water', 'aquatic'] },
      { regex: /is it big|large|huge/, checkProps: ['large', 'big', 'tall', 'huge'] },
      { regex: /is it small|tiny|little/, checkProps: ['small', 'tiny', 'little'] },
      { regex: /can (?:you |it )?drink/, checkProps: ['drink', 'beverage', 'liquid'] },
      { regex: /does it have legs/, checkProps: ['legs', 'four legs', 'two legs'] },
      { regex: /is it an? animal/, checkProps: ['animal', 'mammal', 'pet'] },
      { regex: /is it an? plant/, checkProps: ['plant', 'tree', 'flower'] },
      { regex: /is it an? vehicle/, checkProps: ['vehicle', 'transport', 'car'] },
      { regex: /is it (?:found )?(in|at|inside|outdoor)/, checkProps: ['indoor', 'outdoor', 'nature', 'home'] },
      { regex: /is (?:it )?(?:hot|warm)/, checkProps: ['hot', 'warm', 'heat'] },
      { regex: /is (?:it )?(?:cold|frozen)/, checkProps: ['cold', 'frozen', 'ice'] },
      { regex: /can (?:you |it )?move/, checkProps: ['vehicle', 'animal', 'movement'] },
      { regex: /is (?:it )?spicy/, checkProps: ['spicy', 'hot', 'pepper'] }, // For pizza
      { regex: /(?:is it|does it have) cheese/, checkProps: ['cheese', 'dairy'] },
      { regex: /(?:is it|does it taste) sweet/, checkProps: ['sweet', 'sugar', 'dessert'] },
      { regex: /(?:is it|does it taste) salty/, checkProps: ['salty', 'salt'] },
      { regex: /is it round|circular/, checkProps: ['round', 'circular', 'circle'] },
      { regex: /is it made (?:of|from)/, checkProps: ['made', 'material', 'ingredient'] },
      { regex: /is it italian/, checkProps: ['italian', 'italy'] },
      { regex: /is it (?:a )?(?:known|famous|popular)/, checkProps: ['popular', 'famous', 'known'] }, // Return Maybe for subjective questions
    ];

    for (const pattern of patterns) {
      if (pattern.regex.test(lowerQuestion)) {
        const hasProperty = pattern.checkProps.some(prop =>
          wordInfo.properties.some(p => p.includes(prop) || prop.includes(p))
        );
        return hasProperty ? 'Yes' : 'No';
      }
    }

    // Generic "is it" questions - default to No if we don't know
    if (lowerQuestion.startsWith('is it') || lowerQuestion.startsWith('is ')) {
      // Most random properties are likely false
      return 'No';
    }

    // "Does it" questions - default to No
    if (lowerQuestion.startsWith('does it') || lowerQuestion.startsWith('does ')) {
      return 'No';
    }

    // "Can it/you" questions - default to No
    if (lowerQuestion.startsWith('can it') || lowerQuestion.startsWith('can you')) {
      return 'No';
    }

    return 'Maybe'; // Use Maybe instead of N/A for unknown questions
  };

  const handleAskQuestion = async () => {
    if (!currentQuestion.trim() || questionsUsed >= maxQuestions || gameOver) return;

    setIsSubmitting(true);
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const aiAnswer = getAiAnswer(currentQuestion);

    setQaHistory(prev => [...prev, { question: currentQuestion, answer: aiAnswer, type: 'question' }]);
    setQuestionsUsed(prev => prev + 1);
    setCurrentQuestion('');
    setIsSubmitting(false);

    if (questionsUsed + 1 >= maxQuestions) {
      setGameOver(true);
      // If questions run out without correct guess, it's a loss.
      // Final outcome will be determined by handleGuess or if game over.
    }
  };

  const handleGuess = async () => {
    if (!userGuess.trim() || gameOver) return;

    setIsSubmitting(true);
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const correct = userGuess.toLowerCase() === gameSecretWord.toLowerCase();
    setGameOver(true);

    const finalQuestionsUsed = questionsUsed + (userGuess.trim() ? 1 : 0); // Count the guess as a question

    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowResultAnimation('success');
      onComplete(true, finalQuestionsUsed);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setShowResultAnimation('error');
      onComplete(false, finalQuestionsUsed);
    }

    setIsSubmitting(false);
    setTimeout(() => {
      setShowResultAnimation(null);
    }, 1500);
  };

  useEffect(() => {
    if (gameOver && showResultAnimation === null && questionsUsed >= maxQuestions) {
        // If game ended due to max questions and no correct guess
        if (userGuess.toLowerCase() !== gameSecretWord.toLowerCase()) {
             // onComplete was already called by handleGuess. If no guess was made, call here.
             if (qaHistory.filter(item => item.type === 'guess').length === 0) {
                 onComplete(false, questionsUsed);
             }
        }
    }
  }, [gameOver, showResultAnimation, questionsUsed, maxQuestions, gameSecretWord, userGuess, qaHistory, onComplete]);


  return (
    <View style={[styles.cardContainer, baseCardProps.style]}>
      {showResultAnimation === 'success' && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.lottieOverlay}>
          <LottieSuccess />
        </Animated.View>
      )}
      {showResultAnimation === 'error' && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.lottieOverlay}>
          <LottieError />
        </Animated.View>
      )}

      <View style={styles.header}>
        <Text style={styles.difficultyText}>Difficulty: {gameDifficulty}</Text>
        <Text style={styles.instructionText}>Guess the secret {gameCategory}!</Text>
        <Text style={styles.questionCounter}>Questions Left: {maxQuestions - questionsUsed}/{maxQuestions}</Text>
      </View>

      <ScrollView ref={scrollViewRef} style={styles.qaHistoryContainer}>
        {qaHistory.map((round, index) => (
          <View key={index} style={styles.qaRound}>
            <Text style={styles.questionText}>Q: {round.question}</Text>
            <Text style={styles.answerText}>A: {round.answer}</Text>
          </View>
        ))}
        {gameOver && (
          <Text style={styles.gameOverText}>
            Game Over! The word was "{gameSecretWord}".
          </Text>
        )}
      </ScrollView>

      {!gameOver && (questionsUsed < maxQuestions) && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask a Yes/No question..."
            placeholderTextColor={colors.text.tertiary}
            value={currentQuestion}
            onChangeText={setCurrentQuestion}
            editable={!isSubmitting && questionsUsed < maxQuestions}
            onSubmitEditing={handleAskQuestion}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={styles.askButton}
            onPress={handleAskQuestion}
            disabled={!currentQuestion.trim() || isSubmitting || questionsUsed >= maxQuestions}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.text.primary} />
            ) : (
              <Ionicons name="send" size={typography.fontSize.xl} color={colors.text.primary} />
            )}
          </TouchableOpacity>
        </View>
      )}

      {!gameOver && (
        <View style={styles.guessContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Guess the word..."
            placeholderTextColor={colors.text.tertiary}
            value={userGuess}
            onChangeText={setUserGuess}
            editable={!isSubmitting}
            onSubmitEditing={handleGuess}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={styles.guessButton}
            onPress={handleGuess}
            disabled={!userGuess.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.text.primary} />
            ) : (
              <Text style={styles.guessButtonText}>Guess</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    minHeight: 500,
    ...shadows.md,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: spacing.md,
  },
  difficultyText: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  instructionText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  questionCounter: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  qaHistoryContainer: {
    flexGrow: 1,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  qaRound: {
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.medium,
  },
  questionText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.base,
    marginBottom: spacing.xs,
  },
  answerText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  gameOverText: {
    color: colors.error.DEFAULT,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  askButton: {
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: borderRadius.md,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  guessContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guessButton: {
    backgroundColor: colors.secondary.DEFAULT,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  guessButtonText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  lottieOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    borderRadius: borderRadius.xl,
  },
});
