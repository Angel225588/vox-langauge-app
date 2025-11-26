import { Card, styled, GetProps } from 'tamagui';
import { BlurView } from 'expo-blur';
import { useColorScheme } from 'react-native';

const GlassFrame = styled(Card, {
    padding: '$4',
    borderRadius: '$4',
    borderWidth: 1,

    variants: {
        variant: {
            default: {
                backgroundColor: '$glassBackground',
                borderColor: '$glassBorder',
                shadowColor: '$glassShadow',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 12,
            },
            dark: {
                backgroundColor: '$glassBackgroundDark',
                borderColor: '$glassBorderDark',
                shadowColor: '$glassShadowDark',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 12,
            }
        }
    } as const
});

export type GlassCardProps = GetProps<typeof GlassFrame> & {
    intensity?: number;
};

export function GlassCard({ children, intensity = 20, ...props }: GlassCardProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <GlassFrame
            variant={isDark ? 'dark' : 'default'}
            overflow="hidden" // Ensure blur doesn't leak
            {...props}
        >
            <BlurView
                intensity={intensity}
                tint={isDark ? 'dark' : 'light'}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: -1,
                }}
            />
            {children}
        </GlassFrame>
    );
}
