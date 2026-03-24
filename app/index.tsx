import { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/db/supabase';
import { createPersonalizedPath } from '@/lib/services/pathGeneration';
import { adaptV3ToOnboardingData } from '@/lib/services/v3DataAdapter';
import { loadProfileFromSupabase } from '@/lib/db/profileSync';
import { colors } from '@/constants/designSystem';

const ONBOARDING_COMPLETED_KEY = 'vox-onboarding-completed';

export default function Index() {
  const router = useRouter();
  const { user, initialized } = useAuth();
  const [statusMessage, setStatusMessage] = useState('Loading...');
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (!initialized || hasNavigated.current) return;

    if (user) {
      checkOnboardingStatus();
    } else {
      // Not authenticated — go directly to V3 onboarding welcome
      hasNavigated.current = true;
      router.replace('/(auth)/onboarding-v3');
    }
  }, [user, initialized]);

  const checkOnboardingStatus = async () => {
    if (!user || hasNavigated.current) return;

    setStatusMessage('Checking your progress...');
    try {
      // Check if user has an active learning path (staircase)
      const { data: staircase, error } = await supabase
        .from('user_staircases')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking onboarding status:', error);
      }

      if (staircase) {
        // User has completed onboarding — load profile from Supabase into Zustand
        await loadProfileFromSupabase(user.id);
        hasNavigated.current = true;
        router.replace('/(tabs)/home');
        return;
      }

      // No staircase found — check if they completed onboarding but path failed
      const savedData = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);

      if (savedData) {
        // User completed onboarding but path wasn't created — retry
        console.log('[Index] Retrying path generation from saved onboarding data');
        setStatusMessage('Finishing your setup...');

        try {
          const onboardingData = JSON.parse(savedData);
          const adaptedData = adaptV3ToOnboardingData(onboardingData);
          const result = await createPersonalizedPath(user.id, adaptedData);

          if (result.success) {
            console.log('[Index] Path retry succeeded');
            await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
            hasNavigated.current = true;
            router.replace('/(tabs)/home');
          } else {
            console.warn('[Index] Path retry failed:', result.error);
            // Clear stale data and send to onboarding
            await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
            hasNavigated.current = true;
            router.replace('/(auth)/onboarding-v3');
          }
        } catch (retryError) {
          console.error('[Index] Path retry error:', retryError);
          await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
          hasNavigated.current = true;
          router.replace('/(auth)/onboarding-v3');
        }
      } else {
        // No saved data — fresh user, send to onboarding
        hasNavigated.current = true;
        router.replace('/(auth)/onboarding-v3');
      }
    } catch (error) {
      console.error('Error in checkOnboardingStatus:', error);
      hasNavigated.current = true;
      router.replace('/(auth)/onboarding-v3');
    }
  };

  // Show loading while checking auth/onboarding status
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background.primary }}>
      <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      <Text style={{ color: colors.text.secondary, marginTop: 16, fontSize: 16 }}>
        {statusMessage}
      </Text>
    </View>
  );
}
