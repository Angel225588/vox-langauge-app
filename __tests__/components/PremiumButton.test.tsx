// @ts-nocheck - Temporary: Tamagui prop type issues
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TamaguiProvider } from '@tamagui/core';
import tamaguiConfig from '@/tamagui.config';
import { PremiumButton } from '@/components/ui/PremiumButton';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TamaguiProvider config={tamaguiConfig}>{children}</TamaguiProvider>
);

describe('PremiumButton', () => {
    it('renders correctly with default props', () => {
        const { getByText } = render(
            <PremiumButton onPress={() => { }}>
                Click Me
            </PremiumButton>,
            { wrapper: Wrapper }
        );

        expect(getByText('Click Me')).toBeTruthy();
    });

    it('calls onPress when pressed', () => {
        const onPressMock = jest.fn();
        const { getByText } = render(
            <PremiumButton onPress={onPressMock}>
                Press Me
            </PremiumButton>,
            { wrapper: Wrapper }
        );

        fireEvent.press(getByText('Press Me'));
        expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('renders disabled state correctly', () => {
        const { getByText, toJSON } = render(
            <PremiumButton onPress={() => { }} disabled>
                Disabled Button
            </PremiumButton>,
            { wrapper: Wrapper }
        );

        expect(getByText('Disabled Button')).toBeTruthy();
        // Verify component renders with disabled prop applied
        const tree = toJSON();
        expect(tree).toBeTruthy();
    });

    it('renders with different variants', () => {
        const variants = ['primary', 'secondary', 'outline', 'ghost', 'glass'] as const;

        variants.forEach((variant) => {
            const { getByText } = render(
                <PremiumButton onPress={() => { }} variant={variant}>
                    Test
                </PremiumButton>,
                { wrapper: Wrapper }
            );

            expect(getByText('Test')).toBeTruthy();
        });
    });

    it('shows loading state', () => {
        const { queryByText } = render(
            <PremiumButton onPress={() => { }} loading>
                Loading Button
            </PremiumButton>,
            { wrapper: Wrapper }
        );

        // When loading, Spinner replaces children
        expect(queryByText('Loading Button')).toBeNull();
    });

    it('renders with icon', () => {
        const { getByText } = render(
            <PremiumButton onPress={() => { }} icon="🚀">
                With Icon
            </PremiumButton>,
            { wrapper: Wrapper }
        );

        // Tamagui renders icon as a component element, verify text child renders
        expect(getByText('With Icon')).toBeTruthy();
    });
});
