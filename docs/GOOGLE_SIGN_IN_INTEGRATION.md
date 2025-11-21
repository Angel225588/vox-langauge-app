# Google Sign-In Integration Guide
## Vox Language App

**Status:** 📋 Documentation Complete - Ready for Implementation
**Owner:** User (Angel)
**Last Updated:** November 21, 2025

---

## Overview

This document provides step-by-step instructions for integrating Google Sign-In with the Vox Language App. The integration uses Supabase Auth with Google OAuth provider, eliminating the need for third-party libraries.

---

## Benefits of Google Sign-In

1. **Faster Onboarding**: Users sign in with one tap
2. **Reduced Friction**: No password management required
3. **Higher Conversion**: OAuth typically has 2-3x better conversion than email/password
4. **Better Security**: Google handles authentication security
5. **User Trust**: Users trust Google's login more than unknown apps

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                   Vox Language App (React Native)            │
├──────────────────────────────────────────────────────────────┤
│  1. User taps "Sign in with Google" button                   │
│  2. App calls: supabase.auth.signInWithOAuth({               │
│       provider: 'google',                                     │
│       options: { redirectTo: 'voxlang://auth/callback' }     │
│     })                                                        │
│  3. Opens Google OAuth in browser                            │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│              Google OAuth (accounts.google.com)              │
├──────────────────────────────────────────────────────────────┤
│  4. User selects Google account                              │
│  5. User grants permissions                                  │
│  6. Google redirects to: voxlang://auth/callback?code=XXX    │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                   Supabase Auth Backend                      │
├──────────────────────────────────────────────────────────────┤
│  7. Supabase exchanges code for Google tokens                │
│  8. Supabase creates/updates user record                     │
│  9. Supabase issues session token                            │
│  10. Returns user + session to app                           │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                   App Receives Session                       │
├──────────────────────────────────────────────────────────────┤
│  11. Store session in AsyncStorage                           │
│  12. Navigate to home screen                                 │
│  13. Sync user data                                          │
└──────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

### 1. Google Cloud Console Setup

**Steps:**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one: **"Vox Language App"**
3. Enable APIs:
   - Go to **APIs & Services** → **Library**
   - Search for **"Google+ API"** → Enable
   - Search for **"Google Identity Toolkit API"** → Enable

4. Create OAuth 2.0 Credentials:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth 2.0 Client ID**
   - Configure OAuth consent screen (if first time):
     - User Type: **External**
     - App Name: **Vox Language**
     - User Support Email: your-email@example.com
     - Scopes: email, profile, openid
     - Add Test Users (your email for testing)

5. Create OAuth Client IDs (you need 3 for React Native):

   **a) Web Client ID** (for Supabase)
   - Application Type: **Web application**
   - Name: **Vox Web Client**
   - Authorized redirect URIs:
     - `https://your-project-ref.supabase.co/auth/v1/callback`
   - Copy **Client ID** and **Client Secret** → Save for Supabase config

   **b) iOS Client ID**
   - Application Type: **iOS**
   - Name: **Vox iOS Client**
   - Bundle ID: `com.yourcompany.voxlanguage` (from app.json)
   - Copy **Client ID** → Save for app config

   **c) Android Client ID**
   - Application Type: **Android**
   - Name: **Vox Android Client**
   - Package name: `com.yourcompany.voxlanguage` (from app.json)
   - SHA-1 certificate fingerprint:
     ```bash
     # Get SHA-1 for development
     keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
     ```
   - Copy **Client ID** → Save for app config

---

### 2. Supabase Configuration

**Steps:**

1. Open Supabase Dashboard: https://app.supabase.com
2. Select your **Vox Language** project
3. Go to **Authentication** → **Providers**
4. Find **Google** provider → Click **Enable**
5. Configure:
   - **Client ID**: Paste **Web Client ID** from Google Console
   - **Client Secret**: Paste **Client Secret** from Google Console
   - **Authorized Client IDs**: Add iOS and Android Client IDs (comma-separated)
   - **Redirect URL**: Should auto-fill as `https://your-project-ref.supabase.co/auth/v1/callback`
6. Click **Save**

**Verify Configuration:**
- Status should show **Enabled** with green checkmark
- Test by clicking **"Test Provider"** button

---

### 3. App Configuration (app.json)

Update `/app.json`:

```json
{
  "expo": {
    "name": "Vox Language",
    "slug": "vox-language-app",
    "scheme": "voxlang",
    "ios": {
      "bundleIdentifier": "com.yourcompany.voxlanguage",
      "googleServicesFile": "./GoogleService-Info.plist"
    },
    "android": {
      "package": "com.yourcompany.voxlanguage",
      "googleServicesFile": "./google-services.json"
    },
    "plugins": [
      [
        "expo-auth-session",
        {
          "schemes": ["voxlang"]
        }
      ]
    ]
  }
}
```

**Key Changes:**
- `"scheme": "voxlang"` → Deep link scheme for OAuth callback
- iOS `bundleIdentifier` → Must match Google Console
- Android `package` → Must match Google Console

---

## Implementation

### 1. Install Dependencies

```bash
npm install expo-auth-session expo-crypto expo-web-browser
```

These are built-in Expo packages that handle OAuth flow.

---

### 2. Update Supabase Client

File: `/lib/db/supabase.ts`

```typescript
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // Important for OAuth
  },
});
```

---

### 3. Create Google Sign-In Hook

File: `/hooks/useGoogleSignIn.ts`

```typescript
import { useState } from 'react';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/lib/db/supabase';

// Required for OAuth to work properly
WebBrowser.maybeCompleteAuthSession();

export function useGoogleSignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate redirect URI for OAuth callback
  const redirectTo = makeRedirectUri({
    scheme: 'voxlang',
    path: 'auth/callback',
  });

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: false,
        },
      });

      if (error) throw error;

      // OAuth URL will be in data.url
      // expo-auth-session will handle the browser redirect automatically

    } catch (err) {
      console.error('Google Sign-In Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return {
    signInWithGoogle,
    loading,
    error,
  };
}
```

---

### 4. Add Google Button to Login Screen

File: `/app/(auth)/login.tsx`

```typescript
import { useGoogleSignIn } from '@/hooks/useGoogleSignIn';
import { Button, YStack, XStack, Text } from '@/components/ui/tamagui';
import { Image } from 'react-native';

export default function LoginScreen() {
  const { signInWithGoogle, loading, error } = useGoogleSignIn();

  return (
    <YStack flex={1} padding="$6" gap="$4">
      {/* Existing email/password form */}

      {/* Divider */}
      <XStack alignItems="center" gap="$3" paddingVertical="$4">
        <View flex={1} height={1} backgroundColor="$borderColor" />
        <Text color="$textSecondary" fontSize={14}>OR</Text>
        <View flex={1} height={1} backgroundColor="$borderColor" />
      </XStack>

      {/* Google Sign-In Button */}
      <Button
        variant="outline"
        size="lg"
        fullWidth
        onPress={signInWithGoogle}
        disabled={loading}
      >
        <XStack alignItems="center" gap="$3">
          <Image
            source={require('@/assets/icons/google-logo.png')}
            style={{ width: 20, height: 20 }}
          />
          <Text fontWeight="600">
            {loading ? 'Signing in...' : 'Continue with Google'}
          </Text>
        </XStack>
      </Button>

      {error && (
        <Text color="$error" fontSize={14} textAlign="center">
          {error}
        </Text>
      )}
    </YStack>
  );
}
```

---

### 5. Handle OAuth Callback

File: `/app/(auth)/callback.tsx`

**Create this new file to handle the redirect:**

```typescript
import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/db/supabase';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    handleCallback();
  }, []);

  async function handleCallback() {
    try {
      // Supabase will automatically exchange the code for a session
      // Check if we have a session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) throw error;

      if (session) {
        // Successfully authenticated
        router.replace('/(tabs)/home');
      } else {
        // No session, redirect to login
        router.replace('/(auth)/login');
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      router.replace('/(auth)/login');
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 16 }}>Completing sign in...</Text>
    </View>
  );
}
```

---

### 6. Update App Layout to Handle Auth State

File: `/app/_layout.tsx`

Add session listener:

```typescript
useEffect(() => {
  // Listen for auth state changes
  const { data: authListener } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log('Auth event:', event);

      if (event === 'SIGNED_IN' && session) {
        // User signed in successfully
        router.replace('/(tabs)/home');
      } else if (event === 'SIGNED_OUT') {
        // User signed out
        router.replace('/(auth)/login');
      }
    }
  );

  return () => {
    authListener.subscription.unsubscribe();
  };
}, []);
```

---

## Testing

### 1. Local Testing (Expo Go)

**Steps:**
1. Start dev server: `npx expo start`
2. Open on device with Expo Go
3. Tap "Continue with Google" button
4. Verify browser opens with Google login
5. Select account and grant permissions
6. Verify redirect back to app
7. Check if user is logged in (home screen loads)

**Common Issues:**
- **"Redirect URI mismatch"**: Check `redirectTo` matches Supabase config
- **"Invalid Client"**: Verify Client IDs in Supabase match Google Console
- **Browser doesn't redirect**: Ensure `scheme` is set correctly in app.json

---

### 2. Production Testing (Build)

**iOS:**
```bash
eas build --platform ios --profile preview
```

**Android:**
```bash
eas build --platform android --profile preview
```

Test on real devices to verify deep linking works correctly.

---

## Environment Variables

Add to `.env`:

```env
# Google OAuth (for reference, actual config in Supabase)
GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
```

**Note:** You don't need these in the app code since Supabase handles OAuth. They're just for documentation.

---

## Security Best Practices

### 1. Never Expose Client Secrets
- ✅ **Client Secret** stored in Supabase (server-side)
- ❌ **DO NOT** include Client Secret in app code
- ✅ **Client IDs** can be in app (they're public)

### 2. Validate Redirect URIs
- Ensure only your app's scheme can receive callbacks
- Check Supabase dashboard for correct `redirectTo` URL

### 3. Use PKCE (Proof Key for Code Exchange)
- Expo Auth Session enables this by default
- Protects against authorization code interception

### 4. Handle Token Refresh
- Supabase auto-refreshes tokens
- Ensure `autoRefreshToken: true` in Supabase client

---

## Troubleshooting

### Issue: "Sign in with Google" button does nothing

**Solution:**
1. Check console logs for errors
2. Verify `expo-auth-session` is installed
3. Ensure `scheme` is set in app.json
4. Test `makeRedirectUri()` output matches Supabase config

---

### Issue: "Invalid OAuth State" error

**Solution:**
1. Clear app data and try again
2. Verify Supabase session storage is enabled
3. Check `detectSessionInUrl: true` in Supabase client

---

### Issue: Browser redirects but app doesn't respond

**Solution:**
1. Verify deep link scheme is registered: `voxlang://`
2. Test deep link manually:
   ```bash
   # iOS
   xcrun simctl openurl booted voxlang://auth/callback

   # Android
   adb shell am start -W -a android.intent.action.VIEW -d "voxlang://auth/callback"
   ```
3. Check `/app/(auth)/callback.tsx` exists and handles redirect

---

### Issue: Works in dev but not in production build

**Solution:**
1. Ensure production Bundle ID/Package name matches Google Console
2. Use production SHA-1 fingerprint for Android
3. Rebuild with `eas build` after config changes

---

## UI Design

### Google Button Design Guidelines

**Per Google Brand Guidelines:**

1. **Button Style:**
   - White background
   - Google logo on left
   - "Continue with Google" text
   - Border or shadow for definition

2. **Colors:**
   - Background: `#FFFFFF`
   - Border: `#747775` or `#E8EAED`
   - Text: `#1F1F1F`

3. **Logo:**
   - Use official Google logo SVG
   - Download from: [Google Brand Resource Center](https://about.google/brand-resource-center/)
   - Size: 20x20px

**Example (Tamagui):**
```typescript
<Button
  backgroundColor="white"
  borderWidth={1}
  borderColor="#E8EAED"
  pressStyle={{
    backgroundColor: '#F8F9FA',
    borderColor: '#DADCE0',
  }}
>
  <XStack gap="$3" alignItems="center">
    <Image source={GoogleLogo} style={{ width: 20, height: 20 }} />
    <Text color="#1F1F1F" fontWeight="500" fontSize={16}>
      Continue with Google
    </Text>
  </XStack>
</Button>
```

---

## Next Steps

After Google Sign-In is working:

1. **Apple Sign-In** (required for iOS App Store)
2. **Facebook Login** (optional, for broader reach)
3. **Profile Completion**: Prompt users to set language/interests after OAuth
4. **Analytics**: Track conversion rates (email vs Google vs Apple)

---

## Resources

- [Supabase Google OAuth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Expo Auth Session Docs](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Google Identity Platform](https://developers.google.com/identity)
- [Google Brand Guidelines](https://developers.google.com/identity/branding-guidelines)

---

**Status:** 📋 Ready for implementation by user (Angel)

**Estimated Implementation Time:** 2-3 hours

**Complexity:** 🟡 Medium (mostly configuration, minimal code)
