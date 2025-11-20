import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { useAuth } from '@/hooks/useAuth';

export default function SignupScreen() {
  const router = useRouter();
  const { signUp, user, loading: authLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      // After signup, user should go to onboarding
      router.replace('/(auth)/onboarding/welcome');
    }
  }, [user]);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    // Name validation
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const { data, error } = await signUp(email, password);
    setLoading(false);

    if (error) {
      Alert.alert(
        'Signup Failed',
        error.message || 'An error occurred during signup. Please try again.',
        [{ text: 'OK' }]
      );
    } else {
      // Success! User will be auto-redirected via useEffect
      // We could also save the name to the profile here
      Alert.alert(
        'Welcome! 🎉',
        'Your account has been created successfully.',
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/(auth)/onboarding/welcome'),
          },
        ]
      );
    }
  };

  const handleLogin = () => {
    router.back();
  };

  if (authLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-16 pb-8">
          {/* Header */}
          <Animated.View
            entering={FadeInDown.duration(600).springify()}
            className="mb-8"
          >
            <Text className="text-4xl font-bold text-gray-900 mb-2">
              Create Account 🚀
            </Text>
            <Text className="text-lg text-gray-600">
              Start your language learning journey today
            </Text>
          </Animated.View>

          {/* Name Input */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(100).springify()}
            className="mb-4"
          >
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Full Name
            </Text>
            <TextInput
              className={`w-full px-4 py-4 rounded-xl bg-gray-50 text-gray-900 text-base ${
                errors.name ? 'border-2 border-red-500' : 'border border-gray-200'
              }`}
              placeholder="John Doe"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              autoCapitalize="words"
              autoComplete="name"
              autoCorrect={false}
            />
            {errors.name && (
              <Text className="text-red-500 text-sm mt-1">{errors.name}</Text>
            )}
          </Animated.View>

          {/* Email Input */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(200).springify()}
            className="mb-4"
          >
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </Text>
            <TextInput
              className={`w-full px-4 py-4 rounded-xl bg-gray-50 text-gray-900 text-base ${
                errors.email ? 'border-2 border-red-500' : 'border border-gray-200'
              }`}
              placeholder="your.email@example.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
            />
            {errors.email && (
              <Text className="text-red-500 text-sm mt-1">{errors.email}</Text>
            )}
          </Animated.View>

          {/* Password Input */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(300).springify()}
            className="mb-4"
          >
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Password
            </Text>
            <TextInput
              className={`w-full px-4 py-4 rounded-xl bg-gray-50 text-gray-900 text-base ${
                errors.password ? 'border-2 border-red-500' : 'border border-gray-200'
              }`}
              placeholder="Create a strong password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
              autoCorrect={false}
            />
            {errors.password && (
              <Text className="text-red-500 text-sm mt-1">{errors.password}</Text>
            )}
            {!errors.password && password.length > 0 && (
              <Text className="text-gray-500 text-xs mt-1">
                Must be 8+ characters with uppercase, lowercase, and number
              </Text>
            )}
          </Animated.View>

          {/* Confirm Password Input */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(400).springify()}
            className="mb-6"
          >
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Confirm Password
            </Text>
            <TextInput
              className={`w-full px-4 py-4 rounded-xl bg-gray-50 text-gray-900 text-base ${
                errors.confirmPassword
                  ? 'border-2 border-red-500'
                  : 'border border-gray-200'
              }`}
              placeholder="Re-enter your password"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword)
                  setErrors({ ...errors, confirmPassword: undefined });
              }}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
              autoCorrect={false}
            />
            {errors.confirmPassword && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.confirmPassword}
              </Text>
            )}
          </Animated.View>

          {/* Sign Up Button */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(500).springify()}
            className="mb-6"
          >
            <TouchableOpacity
              className={`w-full py-4 rounded-xl ${
                loading ? 'bg-primary/70' : 'bg-primary'
              } items-center justify-center`}
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white text-base font-bold">
                  Create Account
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Divider */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(600).springify()}
            className="flex-row items-center mb-6"
          >
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-gray-500 text-sm">or</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </Animated.View>

          {/* Login Link */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(700).springify()}
            className="flex-row justify-center"
          >
            <Text className="text-gray-600 text-base">
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text className="text-primary text-base font-bold">Sign In</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Bottom Spacing */}
          <View className="flex-1" />

          {/* Footer */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(800).springify()}
            className="mt-8"
          >
            <Text className="text-center text-gray-400 text-xs">
              By creating an account, you agree to our{'\n'}
              <Text className="text-primary">Terms of Service</Text> and{' '}
              <Text className="text-primary">Privacy Policy</Text>
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
