/**
 * Role Play Card Component - WhatsApp Style Chat
 *
 * Premium chat interface inspired by WhatsApp for language role-play.
 * Features:
 * - WhatsApp-style chat bubbles with tails
 * - Minimal header with scenario info
 * - User options at bottom as quick replies
 * - Smooth animations and haptic feedback
 */
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Animated, { FadeIn, FadeOut, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { colors, borderRadius, spacing, shadows, typography } from '@/constants/designSystem';
import { ResultAnimation } from '@/components/ui';
import { LottieSuccess, LottieError } from '@/components/animations';
import { useHaptics } from '@/hooks/useHaptics';
import { LinearGradient } from 'expo-linear-gradient';

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
  timestamp?: string;
}

interface ConversationTurn {
  aiMessage: string;
  userOptions: { text: string; nextTurnIndex: number; isSuccess?: boolean }[];
  maxTurnsForThisDialogue?: number;
  dialogueId: string;
  isEnd?: boolean;
  isSuccess?: boolean;
}

// Pre-scripted conversations
const CONVERSATION_SCRIPTS: { [key: string]: ConversationTurn[] } = {
  'restaurant_order': [
    {
      dialogueId: 'restaurant_0',
      aiMessage: "Hello! Welcome to our restaurant. What can I get you?",
      userOptions: [
        { text: "I'd like to see the menu.", nextTurnIndex: 1 },
        { text: "Do you have any specials?", nextTurnIndex: 2 },
        { text: "Just water for now, please.", nextTurnIndex: 3 },
      ],
    },
    {
      dialogueId: 'restaurant_1',
      aiMessage: "Certainly, here is our menu. Would you like a moment to look it over?",
      userOptions: [
        { text: "Yes, thank you.", nextTurnIndex: 4 },
        { text: "No, I'm ready to order.", nextTurnIndex: 5 },
      ],
    },
    {
      dialogueId: 'restaurant_2',
      aiMessage: "Today's special is grilled salmon with asparagus. It's very popular!",
      userOptions: [
        { text: "That sounds good, I'll have that.", nextTurnIndex: 6, isSuccess: true },
        { text: "I'll take the menu, please.", nextTurnIndex: 1 },
      ],
    },
    {
      dialogueId: 'restaurant_3',
      aiMessage: "Coming right up! Can I get you anything else?",
      userOptions: [
        { text: "No, that's all for now.", nextTurnIndex: 7, isSuccess: true },
        { text: "I'd like to see the menu.", nextTurnIndex: 1 },
      ],
    },
    {
      dialogueId: 'restaurant_4',
      aiMessage: "Take your time. Let me know when you're ready.",
      userOptions: [
        { text: "I'm ready to order.", nextTurnIndex: 5 },
        { text: "What do you recommend?", nextTurnIndex: 2 },
      ],
    },
    {
      dialogueId: 'restaurant_5',
      aiMessage: "Great! What can I get for you?",
      userOptions: [
        { text: "I'll have the pasta.", nextTurnIndex: 6, isSuccess: true },
        { text: "What do you recommend?", nextTurnIndex: 2 },
      ],
    },
    {
      dialogueId: 'restaurant_6',
      aiMessage: "Excellent choice! Your order will be ready shortly. Enjoy your meal!",
      userOptions: [],
      isEnd: true,
      isSuccess: true,
    },
    {
      dialogueId: 'restaurant_7',
      aiMessage: "Alright, enjoy your water! I'll be back to check on you.",
      userOptions: [],
      isEnd: true,
      isSuccess: true,
    },
  ],
  'directions': [
    {
      dialogueId: 'directions_0',
      aiMessage: "Excuse me, can I help you?",
      userOptions: [
        { text: "Yes, I'm looking for the museum.", nextTurnIndex: 1 },
        { text: "No, thank you.", nextTurnIndex: 99, isSuccess: false },
      ],
    },
    {
      dialogueId: 'directions_1',
      aiMessage: "The museum? It's about a ten-minute walk. Go straight down this street...",
      userOptions: [
        { text: "Go straight, got it. Then?", nextTurnIndex: 2 },
        { text: "Is it far?", nextTurnIndex: 100, isSuccess: false },
      ],
    },
    {
      dialogueId: 'directions_2',
      aiMessage: "You'll see a park on your left. Turn right after the park.",
      userOptions: [
        { text: "Right after the park. Then?", nextTurnIndex: 3 },
        { text: "Left at the park?", nextTurnIndex: 101, isSuccess: false },
      ],
    },
    {
      dialogueId: 'directions_3',
      aiMessage: "After turning right, you'll see the museum directly ahead.",
      userOptions: [
        { text: "Thank you so much!", nextTurnIndex: 4, isSuccess: true },
      ],
    },
    {
      dialogueId: 'directions_4',
      aiMessage: "You're welcome! Have a great day.",
      userOptions: [],
      isEnd: true,
      isSuccess: true,
    },
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
      userOptions: [{ text: "Sorry, what was that?", nextTurnIndex: 1 }],
    },
    {
      dialogueId: 'directions_101',
      aiMessage: "No, turn RIGHT after the park.",
      userOptions: [{ text: "Oh, right! Then?", nextTurnIndex: 3 }],
    },
  ],
};

function formatTime(): string {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export const RolePlayCard: React.FC<RolePlayCardProps> = ({
  scenario,
  userRole,
  scriptId,
  maxTurns = 5,
  onComplete,
  ...baseCardProps
}) => {
  const script = CONVERSATION_SCRIPTS[scriptId];
  const haptics = useHaptics();
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [turnsTaken, setTurnsTaken] = useState(0);
  const [isConversationEnded, setIsConversationEnded] = useState(false);
  const [showResultAnimation, setShowResultAnimation] = useState<'success' | 'error' | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!script || script.length === 0) {
      Alert.alert('Error', 'Conversation script not found.');
      onComplete(false, 0);
      return;
    }
    const starterTurn = script[0];
    setMessages([{
      id: starterTurn.dialogueId,
      sender: 'ai',
      text: starterTurn.aiMessage,
      timestamp: formatTime(),
    }]);
    Speech.speak(starterTurn.aiMessage, { language: 'en-US', rate: 0.9 });
  }, [scriptId]);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleUserOptionSelect = async (optionIndex: number) => {
    if (isConversationEnded || turnsTaken >= maxTurns) return;

    const currentDialogue = script[currentTurnIndex];
    if (!currentDialogue) return;

    const selectedOption = currentDialogue.userOptions[optionIndex];
    if (!selectedOption) return;

    haptics.light();

    // Add user message
    setMessages(prev => [...prev, {
      id: `user_${turnsTaken}`,
      sender: 'user',
      text: selectedOption.text,
      timestamp: formatTime(),
    }]);
    setTurnsTaken(prev => prev + 1);

    // Show typing indicator
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      setIsTyping(false);
      const nextTurn = script[selectedOption.nextTurnIndex];

      if (nextTurn) {
        setMessages(prev => [...prev, {
          id: nextTurn.dialogueId,
          sender: 'ai',
          text: nextTurn.aiMessage,
          timestamp: formatTime(),
        }]);
        Speech.speak(nextTurn.aiMessage, { language: 'en-US', rate: 0.9 });
        setCurrentTurnIndex(selectedOption.nextTurnIndex);

        if (nextTurn.isEnd || (turnsTaken + 1 >= maxTurns)) {
          handleEndConversation(selectedOption.isSuccess || nextTurn.isSuccess || false);
        }
      } else {
        handleEndConversation(false);
      }
    }, 1200);
  };

  const handleEndConversation = (isSuccessFromScript: boolean) => {
    setIsConversationEnded(true);
    onComplete(isSuccessFromScript, turnsTaken);

    if (isSuccessFromScript) {
      haptics.success();
      setShowResultAnimation('success');
    } else {
      haptics.error();
      setShowResultAnimation('error');
    }

    setTimeout(() => {
      setShowResultAnimation(null);
    }, 2000);
  };

  const currentDialogue = script ? script[currentTurnIndex] : null;
  const userCanInteract = !isConversationEnded && turnsTaken < maxTurns && !isTyping;

  return (
    <View style={styles.container}>
      {showResultAnimation && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.lottieOverlay}>
          {showResultAnimation === 'success' ? <LottieSuccess /> : <LottieError />}
        </Animated.View>
      )}

      {/* Minimal Header */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={24} color={colors.primary.DEFAULT} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.partnerName}>{scenario.role}</Text>
            <Text style={styles.scenarioTitle}>{scenario.title}</Text>
          </View>
        </View>
        <View style={styles.turnsCounter}>
          <Text style={styles.turnsText}>{maxTurns - turnsTaken}</Text>
        </View>
      </Animated.View>

      {/* Chat Messages - WhatsApp Style */}
      <View style={styles.chatBackground}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message, index) => (
            <Animated.View
              key={message.id}
              entering={FadeInUp.duration(300).delay(index === messages.length - 1 ? 0 : 0)}
              style={[
                styles.messageRow,
                message.sender === 'user' ? styles.messageRowUser : styles.messageRowAi,
              ]}
            >
              <View style={[
                styles.messageBubble,
                message.sender === 'user' ? styles.userBubble : styles.aiBubble,
              ]}>
                <Text style={styles.messageText}>{message.text}</Text>
                <Text style={styles.messageTime}>{message.timestamp}</Text>
                {/* Bubble tail */}
                <View style={[
                  styles.bubbleTail,
                  message.sender === 'user' ? styles.userTail : styles.aiTail,
                ]} />
              </View>
            </Animated.View>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <Animated.View
              entering={FadeIn.duration(200)}
              style={[styles.messageRow, styles.messageRowAi]}
            >
              <View style={[styles.messageBubble, styles.aiBubble, styles.typingBubble]}>
                <View style={styles.typingDots}>
                  <View style={[styles.dot, styles.dot1]} />
                  <View style={[styles.dot, styles.dot2]} />
                  <View style={[styles.dot, styles.dot3]} />
                </View>
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </View>

      {/* Quick Reply Options - Fixed at Bottom */}
      <View style={styles.bottomContainer}>
        {userCanInteract && currentDialogue && currentDialogue.userOptions.length > 0 ? (
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={styles.optionsContainer}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.optionsScroll}
            >
              {currentDialogue.userOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.optionChip}
                  onPress={() => handleUserOptionSelect(index)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.optionText}>{option.text}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        ) : isConversationEnded && !showResultAnimation ? (
          <View style={styles.endedContainer}>
            <Text style={styles.endedText}>Conversation ended</Text>
          </View>
        ) : null}

        {turnsTaken >= maxTurns && !isConversationEnded && (
          <TouchableOpacity
            style={styles.endButton}
            onPress={() => handleEndConversation(false)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={colors.gradients.primary}
              style={styles.endButtonGradient}
            >
              <Text style={styles.endButtonText}>End Conversation</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary.DEFAULT,
  },
  headerText: {
    gap: 2,
  },
  partnerName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  scenarioTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  turnsCounter: {
    backgroundColor: colors.primary.DEFAULT,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  turnsText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  chatBackground: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  messageRow: {
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  messageRowUser: {
    alignItems: 'flex-end',
  },
  messageRowAi: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingBottom: spacing.xs,
    borderRadius: borderRadius.lg,
    position: 'relative',
  },
  userBubble: {
    backgroundColor: colors.primary.DEFAULT,
    borderBottomRightRadius: borderRadius.xs,
  },
  aiBubble: {
    backgroundColor: colors.background.card,
    borderBottomLeftRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  messageText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    lineHeight: typography.fontSize.base * 1.4,
  },
  messageTime: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
  },
  bubbleTail: {
    position: 'absolute',
    bottom: 0,
    width: 12,
    height: 12,
  },
  userTail: {
    right: -6,
    borderLeftWidth: 12,
    borderLeftColor: colors.primary.DEFAULT,
    borderTopWidth: 12,
    borderTopColor: 'transparent',
  },
  aiTail: {
    left: -6,
    borderRightWidth: 12,
    borderRightColor: colors.background.card,
    borderTopWidth: 12,
    borderTopColor: 'transparent',
  },
  typingBubble: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text.tertiary,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.6,
  },
  dot3: {
    opacity: 0.8,
  },
  bottomContainer: {
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  optionsContainer: {
    paddingHorizontal: spacing.sm,
  },
  optionsScroll: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  optionChip: {
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary.DEFAULT,
  },
  optionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  endedContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  endedText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  endButton: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  endButtonGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  endButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  lottieOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});
