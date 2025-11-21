import { Input as TamaguiInput, type InputProps as TamaguiInputProps, styled, YStack, Text } from 'tamagui';
import { forwardRef } from 'react';

export type InputState = 'default' | 'error' | 'success';
export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<TamaguiInputProps, 'size'> {
  state?: InputState;
  size?: InputSize;
  label?: string;
  helperText?: string;
  errorText?: string;
  fullWidth?: boolean;
}

// Styled input with proper configurations
const StyledInput = styled(TamaguiInput, {
  name: 'VoxInput',
  borderRadius: '$md',
  backgroundColor: '$background',
  color: '$color',
  borderWidth: 1,
  borderColor: '$borderColor',
  fontWeight: '400',

  // Animation
  animation: 'quick',

  // Focus state
  focusStyle: {
    borderColor: '$borderFocus',
    borderWidth: 2,
    outlineWidth: 0,
  },

  // Placeholder
  placeholderTextColor: '$placeholderColor',

  variants: {
    state: {
      default: {
        borderColor: '$borderColor',
        focusStyle: {
          borderColor: '$borderFocus',
        },
      },
      error: {
        borderColor: '$error',
        focusStyle: {
          borderColor: '$error',
        },
      },
      success: {
        borderColor: '$success',
        focusStyle: {
          borderColor: '$success',
        },
      },
    },
    size: {
      sm: {
        height: '$sm',
        paddingHorizontal: '$3',
        fontSize: 14,
      },
      md: {
        height: '$md',
        paddingHorizontal: '$4',
        fontSize: 16,
      },
      lg: {
        height: '$lg',
        paddingHorizontal: '$5',
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
    state: 'default',
    size: 'md',
  },
});

export const Input = forwardRef<TamaguiInput, InputProps>(
  (
    {
      state = 'default',
      size = 'md',
      label,
      helperText,
      errorText,
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    const displayState = errorText ? 'error' : state;
    const displayHelperText = errorText || helperText;

    return (
      <YStack gap="$2" width={fullWidth ? '100%' : undefined}>
        {label && (
          <Text
            fontSize={size === 'sm' ? 14 : size === 'md' ? 16 : 18}
            fontWeight="600"
            color="$color"
          >
            {label}
          </Text>
        )}
        <StyledInput
          ref={ref}
          state={displayState}
          size={size}
          fullWidth={fullWidth}
          {...props}
        />
        {displayHelperText && (
          <Text
            fontSize={12}
            color={displayState === 'error' ? '$error' : displayState === 'success' ? '$success' : '$textSecondary'}
          >
            {displayHelperText}
          </Text>
        )}
      </YStack>
    );
  }
);

Input.displayName = 'VoxInput';

export default Input;
