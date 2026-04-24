import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Platform, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useApp } from '../AppContext';
import { Display } from '../components/primitives';
import { signInWithGoogle, signInWithApple } from '../services/auth';

// ── Apple Sign In button ──────────────────────────────────────────────────────
// Uses the native Apple button component that meets Apple's HIG requirements.
// Apple requires apps using Sign In with Apple to show the official button style.
function AppleSignInButton({ onPress, loading }) {
  const { palette } = useApp();

  if (Platform.OS !== 'ios') return null;

  if (loading) {
    return (
      <View style={[styles.button, { backgroundColor: '#000' }]}>
        <ActivityIndicator color="#fff" size="small" />
      </View>
    );
  }

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={27}
      style={styles.appleButton}
      onPress={onPress}
    />
  );
}

// ── Generic outlined button ───────────────────────────────────────────────────
function OutlinedButton({ label, onPress, loading, disabled }) {
  const { palette } = useApp();
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={[styles.button, { borderWidth: 1, borderColor: palette.lineStrong }]}
      onPress={onPress}
      disabled={loading || disabled}
    >
      {loading ? (
        <ActivityIndicator color={palette.ink} size="small" />
      ) : (
        <Text style={[styles.buttonText, { color: palette.ink }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export function AuthScreen() {
  const { palette } = useApp();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(null); // 'apple' | 'google' | null

  async function handleApple() {
    setLoading('apple');
    try {
      await signInWithApple();
      // AppContext picks up the session change via onAuthStateChange — no manual state set needed
    } catch (err) {
      if (err.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Sign in failed', err.message);
      }
    } finally {
      setLoading(null);
    }
  }

  async function handleGoogle() {
    setLoading('google');
    try {
      await signInWithGoogle();
    } catch (err) {
      Alert.alert('Sign in failed', err.message);
    } finally {
      setLoading(null);
    }
  }

  const busy = loading !== null;

  return (
    <View style={[styles.container, { backgroundColor: palette.bg, paddingTop: insets.top }]}>
      <View style={styles.content}>

        {/* Brand */}
        <Display size={48} style={{ color: palette.ink, textAlign: 'center' }}>
          loadshare
        </Display>
        <Text style={[styles.tagline, { color: palette.muted }]}>
          Shared home, shared load.
        </Text>

        <View style={{ flex: 1 }} />

        {/* Auth buttons */}
        <View style={styles.buttons}>
          {/* Apple — native button, iOS only */}
          <AppleSignInButton onPress={handleApple} loading={loading === 'apple'} />

          {/* Google — works on iOS + Android */}
          <OutlinedButton
            label="Continue with Google"
            onPress={handleGoogle}
            loading={loading === 'google'}
            disabled={busy}
          />

          {/* Android fallback: show a plain button where Apple isn't available */}
          {Platform.OS !== 'ios' && (
            <Text style={[styles.hint, { color: palette.muted }]}>
              Apple Sign In is only available on iOS devices.
            </Text>
          )}
        </View>

        {/* Fine print */}
        <Text style={[styles.terms, { color: palette.muted }]}>
          By continuing you agree to our Terms of Service and Privacy Policy.
          Your data stays in your household — we never sell it.
        </Text>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingBottom: 36,
    alignItems: 'stretch',
  },
  tagline: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 17,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  buttons: { gap: 12, marginBottom: 28 },
  // Apple button must be at least 44pt tall (HIG)
  appleButton: { width: '100%', height: 54 },
  button: {
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  buttonText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
  },
  hint: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    textAlign: 'center',
  },
  terms: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
