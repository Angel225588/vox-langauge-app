import { useEffect, useState, ReactNode } from 'react';
import { View, Text, ActivityIndicator, useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TamaguiProvider } from 'tamagui';
import { validateEnvironment, logEnvironmentStatus } from '@/lib/config/env';
import { colors } from '@/constants/designSystem';
import { initializeFlashcardDB, insertSampleFlashcards } from '@/lib/db/flashcards';
import { initializeWordBankDatabase } from '@/lib/word-bank';
import { initializeReadingSessionsTable } from '@/lib/reading';
import { dbManager } from '@/lib/db/database';
import { initializeDatabase } from '@/lib/db/sqlite';
import { initializeI18n } from '@/i18n';
import tamaguiConfig from '../tamagui.config';
import '../global.css';

// Conditional ElevenLabs provider - only works in development builds, not Expo Go
let ElevenLabsProvider: React.ComponentType<{ children: ReactNode }> | null = null;
try {
  // This will throw in Expo Go since native modules aren't linked
  ElevenLabsProvider = require('@elevenlabs/react-native').ElevenLabsProvider;
} catch (e) {
  console.log('[ElevenLabs] Native module not available - using Expo Go or missing dev build');
}

// Wrapper component that conditionally uses ElevenLabsProvider
function ConditionalElevenLabsProvider({ children }: { children: ReactNode }) {
  if (ElevenLabsProvider) {
    return <ElevenLabsProvider>{children}</ElevenLabsProvider>;
  }
  return <>{children}</>;
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();

  useEffect(() => {
    async function prepare() {
      try {
        // Validate environment variables
        console.log('🚀 Initializing Vox Language App...');
        logEnvironmentStatus();

        // Initialize i18n
        console.log('🌍 Initializing internationalization...');
        await initializeI18n();

        const envValidation = validateEnvironment();
        if (!envValidation.valid) {
          throw new Error(
            'Environment configuration errors:\n' + envValidation.errors.join('\n')
          );
        }

        // Initialize flashcard database
        console.log('📦 Initializing database...');
        await initializeFlashcardDB();

        // Initialize core SQLite tables (streak_data, user_progress, etc.)
        await initializeDatabase();

        // Initialize Word Bank database
        console.log('📚 Initializing Word Bank...');
        const db = await dbManager.initialize();
        await initializeWordBankDatabase(db);

        // Initialize Reading Sessions table
        console.log('🎤 Initializing Reading Sessions...');
        await initializeReadingSessionsTable(db);

        // Insert sample flashcards
        console.log('📚 Loading vocabulary...');
        await insertSampleFlashcards();

        console.log('✅ App initialized successfully!');
        setIsReady(true);
      } catch (e) {
        console.error('❌ Initialization error:', e);
        setError(e instanceof Error ? e.message : 'Unknown error occurred');
      }
    }

    prepare();
  }, []);

  // Show error screen if initialization failed
  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-2xl font-bold text-red-500 mb-4">
          Initialization Error
        </Text>
        <Text className="text-base text-gray-700 text-center mb-4">
          {error}
        </Text>
        <Text className="text-sm text-gray-500 text-center">
          Please check your configuration and restart the app.
        </Text>
      </View>
    );
  }

  // Show loading screen while initializing
  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={colors.accent.blue} />
        <Text className="text-lg text-gray-600 mt-4">
          Initializing...
        </Text>
      </View>
    );
  }

  // App is ready, show normal navigation
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0A0E1A' }}>
      <ConditionalElevenLabsProvider>
        <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme === 'dark' ? 'dark' : 'light'}>
          <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: '#0A0E1A', // Deep space blue-black (matches design system)
            },
            animation: 'slide_from_right',
          }}
        >
          {/* ─── Core ─── */}
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* ─── Practice screens ─── */}
          <Stack.Screen name="practice-reading" options={{ headerShown: false }} />
          <Stack.Screen name="practice-writing" options={{ headerShown: false }} />
          <Stack.Screen name="practice-listening" options={{ headerShown: false }} />
          <Stack.Screen name="voice-conversation" options={{ headerShown: false }} />

          {/* ─── Dashboards ─── */}
          <Stack.Screen name="vocabulary-dashboard" options={{ headerShown: false }} />
          <Stack.Screen name="competency-dashboard" options={{ headerShown: false }} />
          <Stack.Screen name="activity-dashboard" options={{ headerShown: false }} />
          <Stack.Screen name="privacy-dashboard" options={{ headerShown: false }} />

          {/* ─── Lesson flow ─── */}
          <Stack.Screen name="lesson-session" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="lesson-complete" options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="lesson-carousel" options={{ headerShown: false }} />
          <Stack.Screen name="feedback-detail" options={{ headerShown: false }} />
          <Stack.Screen name="feedback-history" options={{ headerShown: false }} />
          <Stack.Screen name="discovery-signup" options={{ headerShown: false, gestureEnabled: false }} />

          {/* ─── Content ─── */}
          <Stack.Screen name="library" options={{ headerShown: false }} />
          <Stack.Screen name="vox-library" options={{ headerShown: false }} />
          <Stack.Screen name="about-lecture" options={{ headerShown: false }} />
          <Stack.Screen name="teleprompter" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
          <Stack.Screen name="recordings" options={{ headerShown: false }} />
          <Stack.Screen name="recordings-library" options={{ headerShown: false }} />
          <Stack.Screen name="notes-library" options={{ headerShown: false }} />
          <Stack.Screen name="completion" options={{ headerShown: false }} />
          <Stack.Screen name="conversation-history" options={{ headerShown: false }} />
          <Stack.Screen name="design-showcase" options={{ headerShown: false }} />

          {/* ─── Profile ─── */}
          <Stack.Screen name="edit-profile" options={{ headerShown: false }} />

          {/* ─── Dev/test (only accessible via Developer Tools) ─── */}
          <Stack.Screen name="test-cards" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="test-elevenlabs" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="test-voice-system" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="test-gemini-live" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="test-interactive-scenario" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="test-writing-task" options={{ headerShown: false, presentation: 'modal' }} />
          </Stack>
        </TamaguiProvider>
      </ConditionalElevenLabsProvider>
    </GestureHandlerRootView>
  );
}
