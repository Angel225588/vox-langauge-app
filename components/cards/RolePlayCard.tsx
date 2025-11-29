import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, shadows, typography } from '@/constants/designSystem';
import { LottieSuccess } from '../animations/LottieSuccess';
import { LottieError } from '../animations/LottieError';

interface RolePlayCardProps {
  scenario: {
    title: string;
    role: string; // AI's role
    goal: string;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  userRole: string; // User's role
  scriptId: string; // Identifier for the conversation script
  maxTurns?: number;
  onComplete: (isSuccess: boolean, turnsTaken: number) => void;
  [key: string]: any;
}

interface ConversationMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

interface ConversationTurn {
  aiMessage: string;
  userOptions: { text: string; nextTurnIndex: number; isSuccess?: boolean }[];
  maxTurnsForThisDialogue?: number; // Override global maxTurns for specific dialogue points
  dialogueId: string; // Unique ID for this turn
}

// Pre-scripted conversations
const CONVERSATION_SCRIPTS: { [key: string]: ConversationTurn[] } = {
  'restaurant_order': [
    // Turn 0 (AI initiates)
    {
      dialogueId: 'restaurant_0',
      aiMessage: "Hello! Welcome to our restaurant. What can I get you?",
      userOptions: [
        { text: "I'd like to see the menu.", nextTurnIndex: 1 },
        { text: "Do you have any specials?", nextTurnIndex: 2 },
        { text: "Just water for now, please.", nextTurnIndex: 3 },
      ],
    },
    // Turn 1 (User asks for menu)
    {
      dialogueId: 'restaurant_1',
      aiMessage: "Certainly, here is our menu. Would you like a moment to look it over?",
      userOptions: [
        { text: "Yes, thank you.", nextTurnIndex: 4 },
        { text: "No, I'm ready to order.", nextTurnIndex: 5 },
      ],
    },
    // Turn 2 (User asks for specials)
    {
      dialogueId: 'restaurant_2',
      aiMessage: "Today's special is grilled salmon with asparagus. It's very popular!",
      userOptions: [
        { text: "That sounds good, I'll have that.", nextTurnIndex: 6, isSuccess: true },
        { text: "I'll take the menu, please.", nextTurnIndex: 1 },
      ],
    },
    // Turn 3 (User asks for water)
    {
      dialogueId: 'restaurant_3',
      aiMessage: "Coming right up! Can I get you anything else?",
      userOptions: [
        { text: "No, that's all for now.", nextTurnIndex: 7, isSuccess: true },
        { text: "I'd like to see the menu.", nextTurnIndex: 1 },
      ],
    },
    // Turn 4 (User takes moment to look at menu) - Leads to ordering or asking questions
    {
      dialogueId: 'restaurant_4',
      aiMessage: "Take your time. Let me know when you're ready.",
      userOptions: [
        { text: "I'm ready to order.", nextTurnIndex: 5 },
        { text: "What do you recommend?", nextTurnIndex: 2 },
      ],
    },
    // Turn 5 (User is ready to order) - Direct order (assuming they saw menu or know)
    {
      dialogueId: 'restaurant_5',
      aiMessage: "Great! What can I get for you?",
      userOptions: [
        { text: "I'll have the pasta.", nextTurnIndex: 6, isSuccess: true },
        { text: "What do you recommend?", nextTurnIndex: 2 },
      ],
    },
    // Turn 6 (Order placed - Success scenario)
    {
      dialogueId: 'restaurant_6',
      aiMessage: "Excellent choice! Your order will be ready shortly. Enjoy your meal!",
      userOptions: [],
      isEnd: true,
      isSuccess: true,
    },
    // Turn 7 (Water only - Success scenario)
    {
      dialogueId: 'restaurant_7',
      aiMessage: "Alright, enjoy your water! I'll be back to check on you.",
      userOptions: [],
      isEnd: true,
      isSuccess: true,
    },
    // Failures/Loops - Can add more complex branching here
  ],
  'directions': [
    // Turn 0
    {
      dialogueId: 'directions_0',
      aiMessage: "Excuse me, can I help you?",
      userOptions: [
        { text: "Yes, I'm a bit lost. Can you tell me how to get to the museum?", nextTurnIndex: 1 },
        { text: "No, thank you, I'm fine.", nextTurnIndex: 99, isSuccess: false }, // End, not helpful
      ],
    },
    // Turn 1
    {
      dialogueId: 'directions_1',
      aiMessage: "The museum? Of course. It's about a ten-minute walk from here. Go straight down this street...",
      userOptions: [
        { text: "Go straight, got it. Then what?", nextTurnIndex: 2 },
        { text: "Is it far?", nextTurnIndex: 100, isSuccess: false }, // User not following
      ],
    },
    // Turn 2
    {
      dialogueId: 'directions_2',
      aiMessage: "Then you'll see a large park on your left. Turn right after the park.",
      userOptions: [
        { text: "Right after the park. And after that?", nextTurnIndex: 3 },
        { text: "Left at the park?", nextTurnIndex: 101, isSuccess: false }, // User confused
      ],
    },
    // Turn 3
    {
      dialogueId: 'directions_3',
      aiMessage: "After turning right, you'll see the museum directly in front of you.",
      userOptions: [
        { text: "Thank you so much! You've been very helpful.", nextTurnIndex: 4, isSuccess: true },
      ],
    },
    // Turn 4 (Success)
    {
      dialogueId: 'directions_4',
      aiMessage: "You're very welcome! Have a great day.",
      userOptions: [],
      isEnd: true,
      isSuccess: true,
    },
    // Failure points
    {
      dialogueId: 'directions_99',
      aiMessage: "Alright, let me know if you change your mind.",
      userOptions: [],
      isEnd: true,
      isSuccess: false,
    },
    {
      dialogueId: 'directions_100',
      aiMessage: "As I said, about ten minutes. Are you listening?",
      userOptions: [{ text: "Sorry, what was that again?", nextTurnIndex: 1 }],
    },
    {
      dialogueId: 'directions_101',
      aiMessage: "No, no, turn RIGHT after the park.",
      userOptions: [{ text: "Oh, right! Then?", nextTurnIndex: 3 }],
    },
  ],
};


export const RolePlayCard: React.FC<RolePlayCardProps> = ({
  scenario,
  userRole,
  scriptId,
  maxTurns = 5,
  onComplete,
  ...baseCardProps
}) => {
  const script = CONVERSATION_SCRIPTS[scriptId];
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [turnsTaken, setTurnsTaken] = useState(0);
  const [isConversationEnded, setIsConversationEnded] = useState(false);
  const [showResultAnimation, setShowResultAnimation] = useState<'success' | 'error' | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!script || script.length === 0) {
      Alert.alert('Error', 'Conversation script not found or empty.');
      onComplete(false, 0);
      return;
    }
    // Start with the AI's first message from the script
    const starterTurn = script[0];
    setMessages([{ id: starterTurn.dialogueId, sender: 'ai', text: starterTurn.aiMessage }]);
    Speech.speak(starterTurn.aiMessage, { language: 'en-US' });
  }, [scriptId]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleUserOptionSelect = async (optionIndex: number) => {
    if (isConversationEnded || turnsTaken >= maxTurns) return;

    const currentDialogue = script[currentTurnIndex];
    if (!currentDialogue) return;

    const selectedOption = currentDialogue.userOptions[optionIndex];
    if (!selectedOption) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Add user's message to history
    setMessages(prev => [...prev, { id: `user_${turnsTaken}`, sender: 'user', text: selectedOption.text }]);
    setTurnsTaken(prev => prev + 1);

    // Determine next AI message
    const nextTurn = script[selectedOption.nextTurnIndex];

    setTimeout(() => {
      if (nextTurn) {
        setMessages(prev => [...prev, { id: nextTurn.dialogueId, sender: 'ai', text: nextTurn.aiMessage }]);
        Speech.speak(nextTurn.aiMessage, { language: 'en-US' });
        setCurrentTurnIndex(selectedOption.nextTurnIndex);

        if (nextTurn.isEnd || (turnsTaken + 1 >= maxTurns)) {
          handleEndConversation(selectedOption.isSuccess || false); // Pass success from selected option if end
        }
      } else {
        // Fallback if nextTurnIndex is invalid (e.g., end of an unexpected branch)
        handleEndConversation(false);
      }
    }, 1000); // Simulate AI thinking time
  };

  const handleEndConversation = (isSuccessFromScript: boolean) => {
    setIsConversationEnded(true);
    // Determine overall success, possibly combining script-defined success with other metrics
    const finalSuccess = isSuccessFromScript; // For MVP, rely on script success
    onComplete(finalSuccess, turnsTaken);

    if (finalSuccess) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowResultAnimation('success');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setShowResultAnimation('error');
    }

    setTimeout(() => {
      setShowResultAnimation(null);
    }, 2000);
  };

  const currentDialogue = script ? script[currentTurnIndex] : null;
  const userCanInteract = !isConversationEnded && turnsTaken < maxTurns;

  return (
    <View style={[styles.cardContainer, baseCardProps.style]}>
      {showResultAnimation && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.lottieOverlay}>
          {showResultAnimation === 'success' ? <LottieSuccess /> : <LottieError />}
        </Animated.View>
      )}

      <View style={styles.header}>
        <Text style={styles.difficultyText}>Difficulty: {scenario.difficulty}</Text>
        <Text style={styles.scenarioText}>Scenario: {scenario.title}</Text>
        <Text style={styles.roleText}>Your role: {userRole}. Partner's role: {scenario.role}.</Text>
        <Text style={styles.goalText}>Goal: {scenario.goal}.</Text>
        <Text style={styles.turnsText}>Turns left: {maxTurns - turnsTaken}</Text>
      </View>

      <ScrollView style={styles.chatHistoryContainer} ref={scrollViewRef}>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.sender === 'user' ? styles.userBubble : styles.aiBubble,
            ]}
          >
            <Text style={styles.messageSender}>{message.sender === 'user' ? userRole : scenario.role}:</Text>
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        ))}
        {userCanInteract && currentDialogue && currentDialogue.userOptions.length > 0 && (
          <View style={[styles.messageBubble, styles.aiBubble]}>
            <Text style={styles.messageSender}>{scenario.role}:</Text>
            <ActivityIndicator size="small" color={colors.text.secondary} />
          </View>
        )}
        {!userCanInteract && !showResultAnimation && (
          <Text style={styles.conversationEndedText}>Conversation Ended. Tap Next to continue.</Text>
        )}
      </ScrollView>

      {userCanInteract && currentDialogue && currentDialogue.userOptions.length > 0 && (
        <View style={styles.userOptionsContainer}>
          {currentDialogue.userOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionButton}
              onPress={() => handleUserOptionSelect(index)}
              disabled={!userCanInteract}
            >
              <Text style={styles.optionButtonText}>{option.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      {turnsTaken >= maxTurns && !isConversationEnded && (
        <TouchableOpacity style={styles.endConversationButton} onPress={() => handleEndConversation(false)}>
          <Text style={styles.endConversationButtonText}>End Conversation (Out of Turns)</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.md,
    minHeight: 550,
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
  scenarioText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  roleText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.base,
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  goalText: {
    color: colors.secondary.light,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.sm,
  },
  turnsText: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.sm,
  },
  chatHistoryContainer: {
    flexGrow: 1,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary.dark,
    borderBottomRightRadius: borderRadius.sm,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background.secondary,
    borderBottomLeftRadius: borderRadius.sm,
  },
  messageSender: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: spacing.xs / 2,
    fontWeight: typography.fontWeight.bold,
  },
  messageText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
  },
  conversationEndedText: {
    color: colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: spacing.md,
  },
  userOptionsContainer: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  optionButton: {
    backgroundColor: colors.primary.DEFAULT,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  optionButtonText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  endConversationButton: {
    marginTop: spacing.md,
    backgroundColor: colors.accent.purple,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  endConversationButtonText: {
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
