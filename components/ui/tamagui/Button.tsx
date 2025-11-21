import { Button as TamaguiButton, type ButtonProps as TamaguiButtonProps, styled } from 'tamagui';
import { forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'error';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<TamaguiButtonProps, 'size' | 'variant'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

// Styled button with proper configurations
const StyledButton = styled(TamaguiButton, {
  name: 'VoxButton',
  borderRadius: '$md',
  fontWeight: '600',
  cursor: 'pointer',

  // Animation configurations
  animation: 'quick',
  pressStyle: {
    scale: 0.97,
  },
  hoverStyle: {
    scale: 1.02,
  },
  focusStyle: {
    borderColor: '$borderFocus',
    scale: 1.0,
  },

  variants: {
    variant: {
      primary: {
        backgroundColor: '$primary',
        color: '$textInverse',
        borderWidth: 0,
        hoverStyle: {
          backgroundColor: '$primaryHover',
        },
        pressStyle: {
          backgroundColor: '$primaryPress',
          scale: 0.97,
        },
      },
      secondary: {
        backgroundColor: '$secondary',
        color: '$textInverse',
        borderWidth: 0,
        hoverStyle: {
          backgroundColor: '$secondaryHover',
        },
        pressStyle: {
          backgroundColor: '$secondaryPress',
          scale: 0.97,
        },
      },
      outline: {
        backgroundColor: 'transparent',
        color: '$color',
        borderWidth: 2,
        borderColor: '$borderColor',
        hoverStyle: {
          backgroundColor: '$backgroundHover',
          borderColor: '$borderColorHover',
        },
        pressStyle: {
          backgroundColor: '$backgroundPress',
          borderColor: '$borderColorPress',
          scale: 0.97,
        },
      },
      ghost: {
        backgroundColor: 'transparent',
        color: '$color',
        borderWidth: 0,
        hoverStyle: {
          backgroundColor: '$backgroundHover',
        },
        pressStyle: {
          backgroundColor: '$backgroundPress',
          scale: 0.97,
        },
      },
      success: {
        backgroundColor: '$success',
        color: '$textInverse',
        borderWidth: 0,
        hoverStyle: {
          backgroundColor: '$successHover',
        },
        pressStyle: {
          backgroundColor: '$successPress',
          scale: 0.97,
        },
      },
      error: {
        backgroundColor: '$error',
        color: '$textInverse',
        borderWidth: 0,
        hoverStyle: {
          backgroundColor: '$errorHover',
        },
        pressStyle: {
          backgroundColor: '$errorPress',
          scale: 0.97,
        },
      },
    },
    size: {
      sm: {
        height: '$sm',
        paddingHorizontal: '$4',
        fontSize: 14,
      },
      md: {
        height: '$md',
        paddingHorizontal: '$6',
        fontSize: 16,
      },
      lg: {
        height: '$lg',
        paddingHorizontal: '$8',
        fontSize: 18,
      },
    },
    fullWidth: {
      true: {
        width: '100%',
      },
    },
  } as const,

  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

export const Button = forwardRef<TamaguiButton, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth = false, children, ...props }, ref) => {
    return (
      <StyledButton
        ref={ref}
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        {...props}
      >
        {children}
      </StyledButton>
    );
  }
);

Button.displayName = 'VoxButton';

export default Button;
