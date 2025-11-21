import { useRouter } from 'expo-router';
import { YStack, XStack, Text, Button, Theme, Card } from '@/components/ui/tamagui'; // Added Card and Theme for potential future use or consistency

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/(auth)/onboarding/language-selection');
  };

  const handleSkip = () => {
    // TODO: Save progress to continue later
    router.replace('/(tabs)/home');
  };

  return (
    <Theme> {/* Wrap in Theme to ensure theme tokens work if not already at root */}
      <YStack
        flex={1}
        backgroundColor="$background"
        paddingHorizontal="$6"
        paddingVertical="$8"
        justifyContent="space-between"
      >
        {/* Top Section - Logo & Title */}
        <YStack alignItems="center" paddingTop="$10">
          <Text fontSize={60} marginBottom="$4">🗣️</Text>
          <Text fontSize={40} fontWeight="bold" color="$color" marginBottom="$3" textAlign="center">
            Welcome to Vox!
          </Text>
          <Text fontSize={18} color="$textSecondary" textAlign="center" paddingHorizontal="$4">
            Learn languages through practice, not perfection
          </Text>
        </YStack>

        {/* Middle Section - Value Props */}
        <YStack gap="$6">
          <XStack alignItems="flex-start" gap="$4">
            <YStack backgroundColor="$primary/10" width={50} height={50} borderRadius="$round" alignItems="center" justifyContent="center">
              <Text fontSize={24}>🎯</Text>
            </YStack>
            <YStack flex={1}>
              <Text fontSize={20} fontWeight="bold" color="$color" marginBottom="$1">
                Jump Right In
              </Text>
              <Text fontSize={16} color="$textSecondary">
                Start practicing immediately. No boring lessons—just real conversations.
              </Text>
            </YStack>
          </XStack>

          <XStack alignItems="flex-start" gap="$4">
            <YStack backgroundColor="$green5" width={50} height={50} borderRadius="$round" alignItems="center" justifyContent="center">
              <Text fontSize={24}>🔥</Text>
            </YStack>
            <YStack flex={1}>
              <Text fontSize={20} fontWeight="bold" color="$color" marginBottom="$1">
                Practice Makes Progress
              </Text>
              <Text fontSize={16} color="$textSecondary">
                Earn points for every attempt. We reward effort, not perfection.
              </Text>
            </YStack>
          </XStack>

          <XStack alignItems="flex-start" gap="$4">
            <YStack backgroundColor="$yellow5" width={50} height={50} borderRadius="$round" alignItems="center" justifyContent="center">
              <Text fontSize={24}>📱</Text>
            </YStack>
            <YStack flex={1}>
              <Text fontSize={20} fontWeight="bold" color="$color" marginBottom="$1">
                Learn Anywhere
              </Text>
              <Text fontSize={16} color="$textSecondary">
                Works offline. Practice on the bus, subway, or anywhere.
              </Text>
            </YStack>
          </XStack>

          <XStack alignItems="flex-start" gap="$4">
            <YStack backgroundColor="$blue5" width={50} height={50} borderRadius="$round" alignItems="center" justifyContent="center">
              <Text fontSize={24}>⚡</Text>
            </YStack>
            <YStack flex={1}>
              <Text fontSize={20} fontWeight="bold" color="$color" marginBottom="$1">
                See Results Fast
              </Text>
              <Text fontSize={16} color="$textSecondary">
                Build confidence from day one with bite-sized, focused lessons.
              </Text>
            </YStack>
          </XStack>
        </YStack>

        {/* Bottom Section - CTA Buttons */}
        <YStack>
          <Button
            onPress={handleGetStarted}
            size="lg"
            theme="active" // Using active theme for primary button feel
            marginBottom="$4"
          >
            Let's Get Started! 🚀
          </Button>

          <Button
            onPress={handleSkip}
            variant="outlined" // Using outlined variant for secondary action
            size="md"
            marginBottom="$4"
          >
            Skip for now
          </Button>

          <Text textAlign="center" color="$textSecondary" fontSize={12}>
            Takes only 5-10 minutes to personalize your experience
          </Text>
        </YStack>
      </YStack>
    </Theme>
  );
}
