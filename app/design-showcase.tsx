import { View, ImageBackground } from 'react-native';
import { Stack } from 'expo-router';
import { YStack, XStack, ScrollView } from 'tamagui';
import { GlassCard } from '@/components/ui/GlassCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { ThemedText } from '@/components/ui/ThemedText';

export default function DesignShowcase() {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop' }}
                style={{ flex: 1 }}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(99, 102, 241, 0.8)' }}>
                    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
                        <YStack space="$6" marginTop="$10">

                            {/* Typography Section */}
                            <GlassCard>
                                <YStack space="$4">
                                    <ThemedText variant="h1">Design System</ThemedText>
                                    <ThemedText variant="h2">Heading 2</ThemedText>
                                    <ThemedText variant="h3">Heading 3</ThemedText>
                                    <ThemedText variant="body">
                                        This is body text. It should be legible and comfortable to read.
                                    </ThemedText>
                                    <ThemedText variant="caption">Caption text for small details.</ThemedText>
                                    <ThemedText variant="label">LABEL TEXT</ThemedText>
                                </YStack>
                            </GlassCard>

                            {/* Buttons Section */}
                            <GlassCard>
                                <YStack space="$4">
                                    <ThemedText variant="h3">Buttons</ThemedText>
                                    <PremiumButton>Primary Button</PremiumButton>
                                    <PremiumButton variant="secondary">Secondary Button</PremiumButton>
                                    <PremiumButton variant="outline">Outline Button</PremiumButton>
                                    <PremiumButton variant="ghost">Ghost Button</PremiumButton>
                                    <PremiumButton variant="glass">Glass Button</PremiumButton>
                                    <XStack space="$2">
                                        <PremiumButton size="sm">Small</PremiumButton>
                                        <PremiumButton size="md">Medium</PremiumButton>
                                    </XStack>
                                </YStack>
                            </GlassCard>

                            {/* Cards Section */}
                            <YStack space="$4">
                                <ThemedText variant="h3" color="textInverse">Glass Cards</ThemedText>

                                <GlassCard intensity={40}>
                                    <YStack space="$2">
                                        <ThemedText variant="h3">High Intensity Blur</ThemedText>
                                        <ThemedText variant="body">
                                            This card has a stronger blur effect (intensity 40).
                                        </ThemedText>
                                    </YStack>
                                </GlassCard>

                                <GlassCard intensity={10}>
                                    <YStack space="$2">
                                        <ThemedText variant="h3">Low Intensity Blur</ThemedText>
                                        <ThemedText variant="body">
                                            This card has a subtle blur effect (intensity 10).
                                        </ThemedText>
                                    </YStack>
                                </GlassCard>
                            </YStack>

                        </YStack>
                    </ScrollView>
                </View>
            </ImageBackground>
        </>
    );
}
