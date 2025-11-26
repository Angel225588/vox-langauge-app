// @ts-nocheck - Temporary: Tamagui prop type issues
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PremiumButton } from '@/components/ui/PremiumButton';

describe('PremiumButton', () => {
    it('renders correctly with default props', () => {
        const { getByText } = render(
            <PremiumButton onPress={() => { }}>
                Click Me
            </PremiumButton>
        );

        expect(getByText('Click Me')).toBeTruthy();
    });

    it('calls onPress when pressed', () => {
        const onPressMock = jest.fn();
        const { getByText } = render(
            <PremiumButton onPress={onPressMock}>
                Press Me
            </PremiumButton>
        );

        fireEvent.press(getByText('Press Me'));
        expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('does not call onPress when disabled', () => {
        const onPressMock = jest.fn();
        const { getByText } = render(
            <PremiumButton onPress={onPressMock} disabled>
                Disabled Button
            </PremiumButton>
        );

        fireEvent.press(getByText('Disabled Button'));
        expect(onPressMock).not.toHaveBeenCalled();
    });

    it('renders with different variants', () => {
        const variants = ['primary', 'secondary', 'outline', 'ghost', 'glass'] as const;

        variants.forEach((variant) => {
            const { getByText } = render(
                <PremiumButton onPress={() => { }} variant={variant}>
                    {variant} Button
                </PremiumButton>
            );

            expect(getByText(`${variant} Button`)).toBeTruthy();
        });
    });

    it('shows loading state', () => {
        const { getByTestId, queryByText } = render(
            <PremiumButton onPress={() => { }} loading>
                Loading Button
            </PremiumButton>
        );

        // When loading, text might be hidden
        // This depends on your implementation
        expect(queryByText('Loading Button')).toBeTruthy();
    });

    it('renders with icon', () => {
        const { getByText } = render(
            <PremiumButton onPress={() => { }} icon="🚀">
                With Icon
            </PremiumButton>
        );

        expect(getByText('🚀')).toBeTruthy();
        expect(getByText('With Icon')).toBeTruthy();
    });
});
