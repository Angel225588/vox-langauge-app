import { YStack, type YStackProps, styled } from 'tamagui';
import { forwardRef } from 'react';

export type CardVariant = 'elevated' | 'outlined' | 'flat';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends YStackProps {
  variant?: CardVariant;
  padding?: CardPadding;
  interactive?: boolean;
}

// Styled card with proper configurations
const StyledCard = styled(YStack, {
  name: 'VoxCard',
  borderRadius: '$lg',
  overflow: 'hidden',

  // Default animation
  animation: 'lazy',

  variants: {
    variant: {
      elevated: {
        backgroundColor: '$background',
        shadowColor: '$shadowColor',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 0,
      },
      outlined: {
        backgroundColor: '$background',
        borderWidth: 1,
        borderColor: '$borderColor',
        shadowColor: 'transparent',
        elevation: 0,
      },
      flat: {
        backgroundColor: '$backgroundSecondary',
        borderWidth: 0,
        shadowColor: 'transparent',
        elevation: 0,
      },
    },
    padding: {
      none: {
        padding: 0,
      },
      sm: {
        padding: '$4',
      },
      md: {
        padding: '$6',
      },
      lg: {
        padding: '$8',
      },
    },
    interactive: {
      true: {
        cursor: 'pointer',
        pressStyle: {
          scale: 0.98,
          opacity: 0.9,
        },
        hoverStyle: {
          scale: 1.01,
          borderColor: '$borderColorHover',
        },
        focusStyle: {
          borderColor: '$borderFocus',
          shadowColor: '$primary',
          shadowOpacity: 0.2,
        },
      },
    },
  } as const,

  defaultVariants: {
    variant: 'elevated',
    padding: 'md',
    interactive: false,
  },
});

export const Card = forwardRef<YStack, CardProps>(
  ({ variant = 'elevated', padding = 'md', interactive = false, children, ...props }, ref) => {
    return (
      <StyledCard
        ref={ref}
        variant={variant}
        padding={padding}
        interactive={interactive}
        {...props}
      >
        {children}
      </StyledCard>
    );
  }
);

Card.displayName = 'VoxCard';

export default Card;
