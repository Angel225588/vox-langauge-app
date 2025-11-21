import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { YStack, XStack, Text, Button, Input, Card } from '@/components/ui/tamagui';
import { supabase } from '@/lib/db/supabase';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    setLoading(true);
    setError('');

    // Basic validation (more comprehensive validation would be in a separate hook or utility)
    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name, // Assuming you have a 'full_name' field in your Supabase user metadata
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      router.replace('/(auth)/onboarding/welcome'); // Redirect to onboarding after successful signup
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
        gap="$5"
      >
        <YStack gap="$2">
          <Text fontSize={32} fontWeight="bold" color="$color">
            Create Account 🚀
          </Text>
          <Text fontSize={16} color="$textSecondary">
            Start your language learning journey today
          </Text>
        </YStack>

        <Card variant="elevated" padding="lg">
          <YStack gap="$4">
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              fullWidth
            />

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

            <Input
              label="Confirm Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              fullWidth
            />

            {error && (
              <Text fontSize={14} color="$error">
                {error}
              </Text>
            )}

            <Button
              onPress={handleSignUp}
              disabled={loading || !name || !email || !password || !confirmPassword}
              fullWidth
              size="lg"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </YStack>
        </Card>

        <XStack justifyContent="center" gap="$2">
          <Text color="$textSecondary">Already have an account?</Text>
          <Text
            color="$primary"
            fontWeight="600"
            onPress={() => router.push('/(auth)/login')}
            cursor="pointer"
          >
            Sign In
          </Text>
        </XStack>
      </YStack>
    </SafeAreaView>
  );
}
