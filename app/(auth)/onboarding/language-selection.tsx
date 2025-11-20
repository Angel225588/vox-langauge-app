import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const TARGET_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
];

const NATIVE_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
];

export default function LanguageSelectionScreen() {
  const router = useRouter();
  const [targetLanguage, setTargetLanguage] = useState<string | null>(null);
  const [nativeLanguage, setNativeLanguage] = useState<string | null>(null);

  const handleContinue = () => {
    if (targetLanguage && nativeLanguage) {
      // TODO: Save language preferences
      router.push('/(auth)/onboarding/level-assessment');
    }
  };

  const canContinue = targetLanguage && nativeLanguage;

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-16 pb-8">
          {/* Header */}
          <Animated.View
            entering={FadeInDown.duration(600).springify()}
            className="mb-8"
          >
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Choose Your Languages
            </Text>
            <Text className="text-lg text-gray-600">
              What language do you want to learn?
            </Text>
          </Animated.View>

          {/* Target Language Selection */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(100).springify()}
            className="mb-8"
          >
            <Text className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              I want to learn
            </Text>
            <View className="gap-3">
              {TARGET_LANGUAGES.map((lang, index) => (
                <Animated.View
                  key={lang.code}
                  entering={FadeInDown.duration(400)
                    .delay(200 + index * 50)
                    .springify()}
                >
                  <TouchableOpacity
                    className={`flex-row items-center p-4 rounded-2xl border-2 ${
                      targetLanguage === lang.code
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 bg-white'
                    }`}
                    onPress={() => setTargetLanguage(lang.code)}
                    activeOpacity={0.7}
                  >
                    <Text className="text-4xl mr-4">{lang.flag}</Text>
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-gray-900">
                        {lang.name}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {lang.nativeName}
                      </Text>
                    </View>
                    {targetLanguage === lang.code && (
                      <View className="bg-primary w-6 h-6 rounded-full items-center justify-center">
                        <Text className="text-white text-xs font-bold">✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Native Language Selection */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(400).springify()}
            className="mb-8"
          >
            <Text className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              I speak (for translations)
            </Text>
            <View className="gap-3">
              {NATIVE_LANGUAGES.map((lang, index) => (
                <Animated.View
                  key={lang.code}
                  entering={FadeInDown.duration(400)
                    .delay(600 + index * 50)
                    .springify()}
                >
                  <TouchableOpacity
                    className={`flex-row items-center p-4 rounded-2xl border-2 ${
                      nativeLanguage === lang.code
                        ? 'border-success bg-success/5'
                        : 'border-gray-200 bg-white'
                    }`}
                    onPress={() => setNativeLanguage(lang.code)}
                    activeOpacity={0.7}
                  >
                    <Text className="text-4xl mr-4">{lang.flag}</Text>
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-gray-900">
                        {lang.name}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {lang.nativeName}
                      </Text>
                    </View>
                    {nativeLanguage === lang.code && (
                      <View className="bg-success w-6 h-6 rounded-full items-center justify-center">
                        <Text className="text-white text-xs font-bold">✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View className="px-6 pb-8 pt-4 bg-white border-t border-gray-200">
        <Animated.View entering={FadeInUp.duration(600).delay(1000).springify()}>
          <TouchableOpacity
            className={`w-full py-5 rounded-2xl items-center justify-center ${
              canContinue ? 'bg-primary' : 'bg-gray-300'
            }`}
            onPress={handleContinue}
            disabled={!canContinue}
            activeOpacity={0.8}
          >
            <Text
              className={`text-lg font-bold ${
                canContinue ? 'text-white' : 'text-gray-500'
              }`}
            >
              Continue
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Text className="text-center text-gray-400 text-xs mt-3">
          Step 1 of 3
        </Text>
      </View>
    </View>
  );
}
