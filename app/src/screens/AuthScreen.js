import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../AppContext';
import { Display } from '../components/primitives';
import { signIn, signUp, resetPassword } from '../services/auth';

function AuthInput({ label, value, onChangeText, secureTextEntry, autoCapitalize, palette, keyboardType }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={[styles.inputLabel, { color: palette.muted }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize ?? 'none'}
        autoCorrect={false}
        keyboardType={keyboardType}
        style={[styles.input, {
          backgroundColor: palette.surface,
          borderColor: palette.lineStrong,
          color: palette.ink,
        }]}
        placeholderTextColor={palette.muted}
      />
    </View>
  );
}

function PrimaryButton({ label, onPress, loading, palette }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.button, { backgroundColor: palette.ink }]}
      onPress={onPress}
      disabled={loading}
    >
      {loading
        ? <ActivityIndicator color={palette.surface} size="small" />
        : <Text style={[styles.buttonText, { color: palette.surface }]}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

function TextButton({ label, onPress, palette }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.textBtn}>
      <Text style={[styles.textBtnLabel, { color: palette.muted }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function AuthScreen() {
  const { palette } = useApp();
  const insets = useSafeAreaInsets();

  const [mode, setMode]       = useState('signin'); // 'signin' | 'signup' | 'reset'
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    if (!email || !password) return Alert.alert('Fill in all fields');
    setLoading(true);
    try {
      await signIn({ email, password });
      // onAuthStateChange in AppContext picks up the new session automatically
    } catch (err) {
      Alert.alert('Sign in failed', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp() {
    if (!name || !email || !password) return Alert.alert('Fill in all fields');
    if (password.length < 6) return Alert.alert('Password must be at least 6 characters');
    setLoading(true);
    try {
      await signUp({ email, password, name });
      Alert.alert(
        'Check your email',
        'We sent a confirmation link. Click it to activate your account, then sign in.',
        [{ text: 'OK', onPress: () => setMode('signin') }]
      );
    } catch (err) {
      Alert.alert('Sign up failed', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    if (!email) return Alert.alert('Enter your email address first');
    setLoading(true);
    try {
      await resetPassword(email);
      Alert.alert('Email sent', 'Check your inbox for a password reset link.', [
        { text: 'OK', onPress: () => setMode('signin') },
      ]);
    } catch (err) {
      Alert.alert('Failed', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: palette.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand */}
        <Display size={48} style={{ color: palette.ink, textAlign: 'center', marginBottom: 6 }}>
          loadshare
        </Display>
        <Text style={[styles.tagline, { color: palette.muted }]}>
          Shared home, shared load.
        </Text>

        {/* Form card */}
        <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.line }]}>
          <Text style={[styles.cardTitle, { color: palette.ink }]}>
            {mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Reset password'}
          </Text>

          {mode === 'signup' && (
            <AuthInput
              label="Your name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              palette={palette}
            />
          )}

          <AuthInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            palette={palette}
          />

          {mode !== 'reset' && (
            <AuthInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              palette={palette}
            />
          )}

          <PrimaryButton
            label={mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}
            onPress={mode === 'signin' ? handleSignIn : mode === 'signup' ? handleSignUp : handleReset}
            loading={loading}
            palette={palette}
          />
        </View>

        {/* Mode switchers */}
        <View style={styles.links}>
          {mode === 'signin' && (
            <>
              <TextButton
                label="No account yet? Sign up"
                onPress={() => setMode('signup')}
                palette={palette}
              />
              <TextButton
                label="Forgot password?"
                onPress={() => setMode('reset')}
                palette={palette}
              />
            </>
          )}
          {mode !== 'signin' && (
            <TextButton
              label="Back to sign in"
              onPress={() => setMode('signin')}
              palette={palette}
            />
          )}
        </View>

        <Text style={[styles.terms, { color: palette.muted }]}>
          By continuing you agree to our Terms of Service.{'\n'}
          Your data stays in your household — we never sell it.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    alignItems: 'stretch',
  },
  tagline: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 40,
  },
  card: {
    borderRadius: 20,
    borderWidth: 0.5,
    padding: 24,
    marginBottom: 20,
  },
  cardTitle: {
    fontFamily: 'InstrumentSerif_400Regular',
    fontSize: 24,
    marginBottom: 22,
  },
  inputLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 0.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
  },
  button: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
  },
  links: {
    gap: 4,
    marginBottom: 28,
  },
  textBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  textBtnLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
  },
  terms: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
