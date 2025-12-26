/**
 * PreSessionScreen - Usage Examples
 *
 * This file demonstrates various ways to use the PreSessionScreen component
 * in different scenarios within the Vox Language app.
 */

import React, { useState } from 'react';
import { View } from 'react-native';
import { PreSessionScreen } from './PreSessionScreen';

// ============================================================================
// Example 1: Reading Session
// ============================================================================
export function ReadingSessionExample() {
  return (
    <PreSessionScreen
      title="My Trip to Barcelona"
      subtitle="A story about discovering Spanish culture"
      category="Travel"
      difficulty="intermediate"
      imageUrl="https://example.com/barcelona.jpg"
      metaValue1="3 min"
      metaLabel1="duration"
      metaValue2="250"
      metaLabel2="words"
      expectations={[
        { icon: '🎯', text: 'Read at your own pace with auto-scrolling' },
        { icon: '🎤', text: 'Record your voice for pronunciation feedback' },
        { icon: '⭐', text: 'Track your progress and earn points' },
      ]}
      primaryButtonText="Start Reading"
      secondaryButtonText="Preview Vocabulary"
      onPrimaryPress={() => console.log('Starting reading session...')}
      onSecondaryPress={() => console.log('Showing vocabulary...')}
      onBack={() => console.log('Going back...')}
    />
  );
}

// ============================================================================
// Example 2: Voice Call Session
// ============================================================================
export function VoiceCallExample() {
  return (
    <PreSessionScreen
      title="Ordering at a Restaurant"
      subtitle="Practice ordering food and drinks in Spanish"
      category="Food"
      difficulty="beginner"
      icon="call-outline"
      metaValue1="~5 min"
      metaLabel1="duration"
      expectations={[
        { icon: '🎯', text: 'Practice beginner level conversation' },
        { icon: '🗣️', text: 'Speak naturally with an AI tutor' },
        { icon: '✨', text: 'Get real-time feedback on your responses' },
      ]}
      primaryButtonText="Start Call"
      onPrimaryPress={() => console.log('Starting voice call...')}
      onBack={() => console.log('Going back...')}
    />
  );
}

// ============================================================================
// Example 3: Advanced Session with Custom Quote
// ============================================================================
export function AdvancedExample() {
  return (
    <PreSessionScreen
      title="Business Negotiations"
      subtitle="Handle complex business discussions with confidence"
      category="Business"
      difficulty="advanced"
      icon="briefcase-outline"
      metaValue1="10 min"
      metaLabel1="duration"
      metaValue2="Advanced"
      metaLabel2="level"
      quote="The limits of my language mean the limits of my world."
      expectations={[
        { icon: '💼', text: 'Master professional vocabulary' },
        { icon: '🎯', text: 'Handle complex negotiations' },
        { icon: '🏆', text: 'Build business communication skills' },
      ]}
      primaryButtonText="Begin Session"
      onPrimaryPress={() => console.log('Starting advanced session...')}
      onBack={() => console.log('Going back...')}
    />
  );
}

// ============================================================================
// Example 4: Without Image (Icon-based header)
// ============================================================================
export function IconBasedExample() {
  return (
    <PreSessionScreen
      title="Daily Conversation Practice"
      subtitle="Practice common phrases for everyday situations"
      category="Social"
      difficulty="beginner"
      icon="chatbubbles-outline"
      metaValue1="5 min"
      metaLabel1="duration"
      primaryButtonText="Start Practice"
      onPrimaryPress={() => console.log('Starting practice...')}
      onBack={() => console.log('Going back...')}
    />
  );
}

// ============================================================================
// Example 5: Minimal Configuration
// ============================================================================
export function MinimalExample() {
  return (
    <PreSessionScreen
      title="Quick Practice Session"
      primaryButtonText="Start"
      onPrimaryPress={() => console.log('Starting...')}
      onBack={() => console.log('Back...')}
    />
  );
}
