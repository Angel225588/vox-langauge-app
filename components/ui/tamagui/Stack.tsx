import {
  XStack as TamaguiXStack,
  YStack as TamaguiYStack,
  ZStack as TamaguiZStack,
  type XStackProps,
  type YStackProps,
  type ZStackProps,
} from 'tamagui';
import { forwardRef } from 'react';

/**
 * XStack - Horizontal Stack Component
 * Arranges children in a row (flex-direction: row)
 */
export const XStack = forwardRef<typeof TamaguiXStack, XStackProps>((props, ref) => {
  return <TamaguiXStack ref={ref} {...props} />;
});

XStack.displayName = 'VoxXStack';

/**
 * YStack - Vertical Stack Component
 * Arranges children in a column (flex-direction: column)
 */
export const YStack = forwardRef<typeof TamaguiYStack, YStackProps>((props, ref) => {
  return <TamaguiYStack ref={ref} {...props} />;
});

YStack.displayName = 'VoxYStack';

/**
 * ZStack - Layered Stack Component
 * Stacks children on top of each other (position: absolute)
 */
export const ZStack = forwardRef<typeof TamaguiZStack, ZStackProps>((props, ref) => {
  return <TamaguiZStack ref={ref} {...props} />;
});

ZStack.displayName = 'VoxZStack';

// Re-export types for convenience
export type { XStackProps, YStackProps, ZStackProps };

export default { XStack, YStack, ZStack };
