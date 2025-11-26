import { Button, styled, GetProps, Spinner } from 'tamagui';

const ButtonFrame = styled(Button, {
  borderRadius: '$4',
  paddingVertical: '$3',
  paddingHorizontal: '$5',
  pressStyle: {
    scale: 0.97,
    opacity: 0.9,
  },

  variants: {
    variant: {
      primary: {
        backgroundColor: '$primary',
        color: 'white',
        borderWidth: 0,
      },
      secondary: {
        backgroundColor: '$secondary',
        color: 'white',
        borderWidth: 0,
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: '$border',
        borderWidth: 1,
        color: '$color',
      },
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        color: '$color',
      },
      glass: {
        backgroundColor: '$glassBackground',
        borderColor: '$glassBorder',
        borderWidth: 1,
        color: '$color',
      }
    },
    size: {
      sm: { paddingVertical: '$2', paddingHorizontal: '$3' },
      md: { paddingVertical: '$3', paddingHorizontal: '$5' },
      lg: { paddingVertical: '$4', paddingHorizontal: '$6' },
    }
  } as const,

  defaultVariants: {
    variant: 'primary',
    size: 'md',
  }
});

export type PremiumButtonProps = GetProps<typeof ButtonFrame> & {
  loading?: boolean;
};

export function PremiumButton({ children, loading, ...props }: PremiumButtonProps) {
  return (
    <ButtonFrame {...props}>
      {loading ? <Spinner /> : children}
    </ButtonFrame>
  );
}