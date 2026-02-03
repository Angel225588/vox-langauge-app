/**
 * Toast Provider
 *
 * Context provider for managing toast notifications throughout the app.
 * Features:
 * - Global toast state management
 * - Toast queue (shows one at a time)
 * - Convenient useToast hook
 * - Auto-dismiss functionality
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Toast, ToastVariant, ToastProps } from './Toast';
import { View, StyleSheet } from 'react-native';

interface ToastOptions {
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastContextType {
  showToast: (message: string, variant?: ToastVariant, options?: ToastOptions) => void;
}

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
  action?: ToastProps['action'];
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [currentToast, setCurrentToast] = useState<ToastItem | null>(null);

  const showToast = useCallback((
    message: string,
    variant: ToastVariant = 'info',
    options?: ToastOptions
  ) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastItem = {
      id,
      message,
      variant,
      duration: options?.duration,
      action: options?.action,
    };

    setToasts(prev => [...prev, newToast]);
  }, []);

  // Process toast queue
  React.useEffect(() => {
    if (!currentToast && toasts.length > 0) {
      const [nextToast, ...remainingToasts] = toasts;
      setCurrentToast(nextToast);
      setToasts(remainingToasts);
    }
  }, [toasts, currentToast]);

  const handleDismiss = useCallback(() => {
    setCurrentToast(null);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {currentToast && (
        <View style={styles.toastContainer}>
          <Toast
            key={currentToast.id}
            message={currentToast.message}
            variant={currentToast.variant}
            duration={currentToast.duration}
            action={currentToast.action}
            onDismiss={handleDismiss}
          />
        </View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    pointerEvents: 'box-none',
  },
});
