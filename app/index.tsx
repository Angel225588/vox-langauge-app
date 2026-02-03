import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/db/supabase';
import { colors } from '@/constants/designSystem';

export default function Index() {
  const router = useRouter();
  const { user, initialized } = useAuth();
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);

  useEffect(() => {
    if (!initialized) return;

    // If user is authenticated, check if they've completed onboarding
    if (user) {
      checkOnboardingStatus();
    }
  }, [user, initialized]);

  const checkOnboardingStatus = async () => {
    if (!user) return;

    setCheckingOnboarding(true);
    try {
      // Check if user has an active learning path (staircase)
      const { data: staircase, error } = await supabase
        .from('user_staircases')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is expected for new users
        console.error('Error checking onboarding status:', error);
      }

      if (staircase) {
        // User has completed onboarding, go to home
        console.log('User has completed onboarding, navigating to home');
        router.replace('/(tabs)/home');
      } else {
        // User hasn't completed onboarding, go to onboarding
        console.log('User needs to complete onboarding, navigating to onboarding');
        router.replace('/(auth)/onboarding-v2/languages');
      }
    } catch (error) {
      console.error('Error in checkOnboardingStatus:', error);
      // On error, default to onboarding
      router.replace('/(auth)/onboarding-v2/languages');
    } finally {
      setCheckingOnboarding(false);
    }
  };

  // Show loading while checking auth or onboarding status
  if (!initialized || checkingOnboarding) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background.primary }}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        <Text style={{ color: colors.text.secondary, marginTop: 16, fontSize: 16 }}>
          {checkingOnboarding ? 'Checking your progress...' : 'Loading...'}
        </Text>
      </View>
    );
  }

  // Only show welcome screen if not authenticated
  if (!user) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background.primary, padding: 24 }}>
        <Text style={{ fontSize: 40, fontWeight: 'bold', color: colors.primary.DEFAULT, marginBottom: 16 }}>
          🗣️ Vox Language
        </Text>

        <Text style={{ fontSize: 18, color: colors.text.secondary, textAlign: 'center', marginBottom: 32 }}>
          Learn through practice, not perfection
        </Text>

        <TouchableOpacity
          style={{
            backgroundColor: colors.primary.DEFAULT,
            paddingHorizontal: 32,
            paddingVertical: 16,
            borderRadius: 12,
          }}
          onPress={() => router.push('/(auth)/onboarding-v2')}
        >
          <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '600' }}>
            Get Started
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show loading while redirecting (should be brief)
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background.primary }}>
      <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
    </View>
  );
}
