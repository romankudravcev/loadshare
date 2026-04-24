import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';
import { supabase } from './db';

// Required so the browser session can redirect back into the app on Android
WebBrowser.maybeCompleteAuthSession();

// ── Google ────────────────────────────────────────────────────────────────────

export async function signInWithGoogle() {
  const redirectTo = makeRedirectUri({ scheme: 'loadshare' });

  // Ask Supabase for a Google OAuth URL (browser-based flow)
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true, // we open the browser ourselves below
    },
  });
  if (error) throw error;

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return null; // user cancelled

  // Supabase returns tokens as URL fragments or query params after redirect
  const url = result.url;
  const params = extractUrlParams(url);

  if (!params.access_token || !params.refresh_token) {
    throw new Error('No tokens returned from Google sign-in');
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: params.access_token,
    refresh_token: params.refresh_token,
  });
  if (sessionError) throw sessionError;

  return supabase.auth.getUser();
}

// ── Apple ─────────────────────────────────────────────────────────────────────

export async function signInWithApple() {
  if (Platform.OS !== 'ios') {
    throw new Error('Apple Sign In is only available on iOS');
  }

  // Generate a random nonce; Apple embeds its SHA-256 in the identity token
  // so Supabase can verify the token hasn't been replayed.
  const rawNonce = generateNonce(32);
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce
  );

  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce: hashedNonce,
  });

  // Apple only returns name on the very first sign-in; cache it before it disappears
  const displayName = credential.fullName
    ? [credential.fullName.givenName, credential.fullName.familyName]
        .filter(Boolean)
        .join(' ')
    : null;

  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
    nonce: rawNonce,
  });
  if (error) throw error;

  // If Supabase didn't get a name from Apple's token, update the profile ourselves
  if (displayName) {
    await supabase.auth.updateUser({ data: { full_name: displayName } });
  }

  return supabase.auth.getUser();
}

// ── Session helpers ───────────────────────────────────────────────────────────

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => callback(session)
  );
  return () => subscription.unsubscribe();
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function generateNonce(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Parse both fragment (#) and query (?) params from a redirect URL
function extractUrlParams(url) {
  const hash = url.split('#')[1] || '';
  const query = url.split('?')[1]?.split('#')[0] || '';
  const source = hash || query;
  return Object.fromEntries(new URLSearchParams(source));
}
