/**
 * VocabProbe Example Usage
 *
 * This file demonstrates how to use the VocabProbe component
 * in a calibration flow.
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { VocabProbe } from './VocabProbe';
import type { VocabProbeItem, ProbeResponse } from '@/types/calibration';

// Example vocabulary items for testing
const EXAMPLE_VOCAB_ITEMS: VocabProbeItem[] = [
  {
    id: 'vocab-1',
    word: 'Hello',
    translation: 'Hola',
    phonetic: '/həˈloʊ/',
    difficulty: 'A1',
    category: 'Greetings',
    partOfSpeech: 'interjection',
  },
  {
    id: 'vocab-2',
    word: 'Serendipity',
    translation: 'Serendipia',
    phonetic: '/ˌserənˈdɪpəti/',
    difficulty: 'C1',
    category: 'Abstract',
    partOfSpeech: 'noun',
  },
  {
    id: 'vocab-3',
    word: 'Restaurant',
    translation: 'Restaurante',
    phonetic: '/ˈrestərɑːnt/',
    difficulty: 'A2',
    category: 'Places',
    partOfSpeech: 'noun',
  },
];

export default function VocabProbeExample() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<ProbeResponse[]>([]);

  const currentItem = EXAMPLE_VOCAB_ITEMS[currentIndex];

  const handleComplete = (response: Omit<ProbeResponse, 'probeType' | 'timestamp'>) => {
    // Add probeType and timestamp
    const fullResponse: ProbeResponse = {
      ...response,
      probeType: 'vocabulary',
      timestamp: Date.now(),
    };

    setResponses((prev) => [...prev, fullResponse]);

    // Move to next item or finish
    if (currentIndex < EXAMPLE_VOCAB_ITEMS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      console.log('Calibration complete!', responses);
      // Navigate to results or next probe type
    }
  };

  const handleSkip = () => {
    // Move to next item
    if (currentIndex < EXAMPLE_VOCAB_ITEMS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  if (!currentItem) {
    return null;
  }

  return (
    <View style={styles.container}>
      <VocabProbe
        item={currentItem}
        onComplete={handleComplete}
        onSkip={handleSkip}
        showHints={true}
        nativeLanguage="Spanish"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
