import { Text, styled, GetProps } from 'tamagui';

export const ThemedText = styled(Text, {
    color: '$color',
    fontFamily: 'System', // Replace with your custom font if added

    variants: {
        variant: {
            h1: {
                fontSize: 32,
                fontWeight: '800',
                lineHeight: 40,
                letterSpacing: -0.5,
            },
            h2: {
                fontSize: 24,
                fontWeight: '700',
                lineHeight: 32,
                letterSpacing: -0.25,
            },
            h3: {
                fontSize: 20,
                fontWeight: '600',
                lineHeight: 28,
            },
            body: {
                fontSize: 16,
                fontWeight: '400',
                lineHeight: 24,
            },
            caption: {
                fontSize: 14,
                fontWeight: '400',
                lineHeight: 20,
                color: '$textSecondary',
            },
            label: {
                fontSize: 12,
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                color: '$textTertiary',
            }
        },
        color: {
            primary: { color: '$primary' },
            secondary: { color: '$secondary' },
            success: { color: '$success' },
            error: { color: '$error' },
            default: { color: '$color' },
            muted: { color: '$textSecondary' },
        }
    } as const,

    defaultVariants: {
        variant: 'body',
        color: 'default',
    }
});

export type ThemedTextProps = GetProps<typeof ThemedText>;
