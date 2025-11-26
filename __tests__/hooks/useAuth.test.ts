import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/db/supabase';

// Mocking the dependencies
// Mocking the dependencies
jest.mock('@/lib/db/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(), // Will be mocked in beforeEach
      onAuthStateChange: jest.fn(), // Will be mocked in beforeEach
    },
  },
}));

describe('useAuth Hook', () => {
  const mockSupabase = supabase as jest.Mocked<typeof supabase>;
  let onAuthStateChangeCallback: (event: string, session: any) => void;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock onAuthStateChange to capture the callback
    (mockSupabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
      onAuthStateChangeCallback = callback;
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });

    // Mock getSession to return null by default, simulating no active session initially
    (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session: null }, error: null });
  });

  it('should sign up new user successfully', async () => {
    // Arrange
    const { result } = renderHook(() => useAuth());
    const email = 'test@example.com';
    const password = 'password123';
    const user = { id: '123', email: email };
    const session = { access_token: '123', refresh_token: '456', user };

    (mockSupabase.auth.signUp as jest.Mock).mockResolvedValue({ data: { user, session }, error: null });

    // Act
    await act(async () => {
      await result.current.signUp(email, password);
      // Manually trigger the auth state change
      if (onAuthStateChangeCallback) {
        onAuthStateChangeCallback('SIGNED_IN', session);
      }
    });

    // Assert
    expect(result.current.user).toEqual(user);
    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({ email, password });
  });

  it('should log in existing user', async () => {
    // Arrange
    const { result } = renderHook(() => useAuth());
    const email = 'test@example.com';
    const password = 'password123';
    const user = { id: '123', email: email };
    const session = { access_token: '123', refresh_token: '456', user };

    (mockSupabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({ data: { session, user }, error: null });

    // Act
    await act(async () => {
      await result.current.signIn(email, password);
      if (onAuthStateChangeCallback) {
        onAuthStateChangeCallback('SIGNED_IN', session);
      }
    });

    // Assert
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({ email, password });
    expect(result.current.user).toEqual(user);
    expect(result.current.session).toEqual(session);
  });

  it('should maintain session after app restart', async () => {
    // Arrange
    const user = { id: '123', email: 'test@example.com' };
    const session = { access_token: '123', refresh_token: '456', user };
    // getSession will return this session initially
    (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session }, error: null });

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.initialized).toBe(true));

    // Assert
    expect(mockSupabase.auth.getSession).toHaveBeenCalled();
    expect(result.current.user).toEqual(user);
    expect(result.current.session).toEqual(session);
    expect(result.current.initialized).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  it('should sign out user', async () => {
    // Arrange
    const { result } = renderHook(() => useAuth());
    // Simulate a user being logged in initially
    act(() => {
      if (onAuthStateChangeCallback) {
        onAuthStateChangeCallback('SIGNED_IN', { access_token: '123', refresh_token: '456', user: { id: 'initial', email: 'initial@example.com' } });
      }
    });

    (mockSupabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null });

    // Act
    await act(async () => {
      await result.current.signOut();
      if (onAuthStateChangeCallback) {
        onAuthStateChangeCallback('SIGNED_OUT', null); // Simulate Supabase triggering auth state change
      }
    });

    // Assert
    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it('should refresh expired tokens', async () => {
    // Arrange
    const initialUser = { id: '123', email: 'test@example.com' };
    const expiredSession = { access_token: 'expired_token', refresh_token: 'valid_refresh', user: initialUser };
    const refreshedSession = { access_token: 'new_valid_token', refresh_token: 'valid_refresh', user: initialUser };

    // Mock getSession to return an expired session initially
    (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session: expiredSession }, error: null });

    const { result } = renderHook(() => useAuth());
    
    // Wait for initial session to be processed
    await act(async () => {
      if (onAuthStateChangeCallback) {
        onAuthStateChangeCallback('INITIAL_SESSION', expiredSession);
      }
    });
    
    expect(result.current.session?.access_token).toBe('expired_token');

    // Simulate token refresh
    await act(async () => {
      if (onAuthStateChangeCallback) {
        onAuthStateChangeCallback('TOKEN_REFRESHED', refreshedSession);
      }
    });

    // Assert
    expect(result.current.session?.access_token).toBe('new_valid_token');
    expect(result.current.user).toEqual(initialUser);
  });

  it('should handle wrong password error', async () => {
    // Arrange
    const { result } = renderHook(() => useAuth());
    const email = 'test@example.com';
    const password = 'wrong_password';
    const authError = { message: 'Invalid login credentials', status: 400 };

    (mockSupabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({ data: { session: null, user: null }, error: authError });

    // Act
    const { data, error } = await act(async () => {
      return await result.current.signIn(email, password);
    });

    // Assert
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({ email, password });
    expect(error).toEqual(authError);
    expect(data.user).toBeNull();
    expect(data.session).toBeNull();
    // Verify that the hook's state hasn't changed to a logged-in state
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it('should handle network errors during auth', async () => {
    // Arrange
    const { result } = renderHook(() => useAuth());
    const email = 'test@example.com';
    const password = 'password123';
    const networkError = { message: 'Failed to fetch', status: 500 }; // Simulate a network error

    (mockSupabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({ data: { session: null, user: null }, error: networkError });

    // Act
    const { error } = await act(async () => {
      return await result.current.signIn(email, password);
    });

    // Assert
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({ email, password });
    expect(error).toEqual(networkError);
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });
});
