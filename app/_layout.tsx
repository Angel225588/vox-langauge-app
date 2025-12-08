import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TamaguiProvider } from 'tamagui';
import { validateEnvironment, logEnvironmentStatus } from '@/lib/config/env';
import { initializeFlashcardDB, insertSampleFlashcards } from '@/lib/db/flashcards';
import { initializeWordBankDatabase } from '@/lib/word-bank';
import { initializeReadingSessionsTable } from '@/lib/reading';
import { dbManager } from '@/lib/db/database';
import tamaguiConfig from '../tamagui.config';
import '../global.css';

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

        const envValidation = validateEnvironment();
        if (!envValidation.valid) {
          throw new Error(
            'Environment configuration errors:\n' + envValidation.errors.join('\n')
          );
        }

        // Initialize flashcard database
        console.log('📦 Initializing database...');
        await initializeFlashcardDB();

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
        <ActivityIndicator size="large" color="#2196F3" />
        <Text className="text-lg text-gray-600 mt-4">
          Initializing...
        </Text>
      </View>
    );
  }

  // App is ready, show normal navigation
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0A0E1A' }}>
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
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="test-cards" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="reading-practice" options={{ headerShown: false }} />
          <Stack.Screen name="library" options={{ headerShown: false }} />
          <Stack.Screen name="about-lecture" options={{ headerShown: false }} />
          <Stack.Screen name="teleprompter" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
          <Stack.Screen name="recordings" options={{ headerShown: false }} />
          <Stack.Screen name="completion" options={{ headerShown: false }} />
        </Stack>
      </TamaguiProvider>
    </GestureHandlerRootView>
  );
}
