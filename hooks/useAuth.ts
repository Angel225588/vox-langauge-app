import { useState, useEffect } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/db/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    initialized: false,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false,
        initialized: true,
      });
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
          initialized: true,
        });
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true }));
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setAuthState(prev => ({ ...prev, loading: false }));
    return { data, error };
  };

  const signUp = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true }));
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    setAuthState(prev => ({ ...prev, loading: false }));
    return { data, error };
  };

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, loading: true }));
    const { error } = await supabase.auth.signOut();
    setAuthState(prev => ({ ...prev, loading: false }));
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'vox-language-app://reset-password',
    });
    return { data, error };
  };

  return {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    initialized: authState.initialized,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
}
