import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { YStack, XStack, Text, Button, Input, Card } from '@/components/ui/tamagui';
import { supabase } from '@/lib/db/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.replace('/(tabs)/home');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack
        flex={1}
        backgroundColor="$background"
        paddingHorizontal="$6"
        paddingTop="$10"
        gap="$6"
      >
        <YStack gap="$2">
          <Text fontSize={32} fontWeight="bold" color="$color">
            Welcome Back
          </Text>
          <Text fontSize={16} color="$textSecondary">
            Sign in to continue learning
          </Text>
        </YStack>

        <Card variant="elevated" padding="lg">
          <YStack gap="$5">
            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              fullWidth
            />

            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              fullWidth
            />

            {error && (
              <Text fontSize={14} color="$error">
                {error}
              </Text>
            )}

            <Button
              onPress={handleLogin}
              disabled={loading || !email || !password}
              fullWidth
              size="lg"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </YStack>
        </Card>

        <XStack justifyContent="center" gap="$2">
          <Text color="$textSecondary">Don't have an account?</Text>
          <Text
            color="$primary"
            fontWeight="600"
            onPress={() => router.push('/(auth)/signup')}
            cursor="pointer"
          >
            Sign Up
          </Text>
        </XStack>
      </YStack>
    </SafeAreaView>
  );
}
