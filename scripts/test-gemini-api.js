#!/usr/bin/env node

/**
 * Simple Test Script for Gemini API Connection
 *
 * Tests that the Gemini API is configured and working correctly.
 *
 * Usage:
 *   node scripts/test-gemini-api.js
 *
 * Requirements:
 *   - EXPO_PUBLIC_GEMINI_API_KEY in .env
 */

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiConnection() {
  console.log('\n🔧 Environment Check:');
  console.log('  EXPO_PUBLIC_GEMINI_API_KEY:', process.env.EXPO_PUBLIC_GEMINI_API_KEY ? '✅ Set' : '❌ Missing');

  if (!process.env.EXPO_PUBLIC_GEMINI_API_KEY) {
    console.error('\n❌ EXPO_PUBLIC_GEMINI_API_KEY is required. Set it in .env');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  });

  console.log('\n🚀 Testing Gemini 2.0 Flash Connection...');

  const stairBrief = {
    theme: 'Survival Spanish for Travelers',
    cefrLevel: 'A1',
    vocabularyFocus: ['hello', 'goodbye', 'please', 'thank you', 'help'],
    grammarPatterns: ['Present tense of ser/estar', 'Basic questions'],
    communicativeGoals: ['Greet people', 'Ask for help', 'Express gratitude'],
    constraints: {
      wordFrequencyBand: [1, 3000],
      maxSentenceLength: 10,
      avoidTopics: [],
    },
  };

  const prompt = `You are an expert language learning content creator.
Generate vocabulary content for a language learning stair with this brief:

Theme: ${stairBrief.theme}
CEFR Level: ${stairBrief.cefrLevel}
Target Language: Spanish
Native Language: English

Generate 5 vocabulary items with translations and example sentences.
Respond with JSON only:
{
  "vocabulary": [
    {
      "word": "Spanish word",
      "translation": "English translation",
      "pronunciation": "phonetic guide",
      "example_sentence": "Example in Spanish",
      "example_translation": "English translation of example",
      "part_of_speech": "noun/verb/etc",
      "difficulty": "easy/medium/hard"
    }
  ]
}`;

  try {
    const startTime = Date.now();
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    const duration = Date.now() - startTime;

    console.log('\n✅ Gemini API Connected Successfully!');
    console.log(`\n⏱️ Response Time: ${duration}ms`);

    // Estimate cost (Gemini Flash is much cheaper)
    const estimatedCost = 0.001; // Very rough estimate
    console.log(`\n💰 Estimated cost: ~$${estimatedCost.toFixed(4)} per stair`);

    // Try to parse JSON from response
    console.log('\n📝 Response Preview:');
    try {
      const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonString = jsonMatch ? jsonMatch[1].trim() : response.trim();
      const parsed = JSON.parse(jsonString);
      console.log(JSON.stringify(parsed, null, 2));
    } catch {
      console.log(response.substring(0, 500));
    }

    console.log('\n✅ Test Complete!');

  } catch (error) {
    console.error('\n❌ Gemini API Error:');
    console.error('  Message:', error.message);
    process.exit(1);
  }
}

testGeminiConnection().catch(console.error);
