import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../colors';
import { signIn, signUp, resetPassword, signInWithGoogle } from '../services/auth';

function AuthInput({ label, value, onChangeText, secureTextEntry, autoCapitalize, keyboardType }) {
  return (
    <View className="mb-3.5">
      <Text className="font-sans-md text-2xs tracking-kicker uppercase text-muted mb-1.5">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize ?? 'none'}
        autoCorrect={false}
        keyboardType={keyboardType}
        className="h-12 border-half border-line-strong rounded-xl px-3.5 font-sans text-lg text-ink bg-surface"
        placeholderTextColor={COLORS.muted}
      />
    </View>
  );
}

function PrimaryButton({ label, onPress, loading }) {
  return (
    <TouchableOpacity activeOpacity={0.8} className="h-[52px] rounded-[26px] bg-ink items-center justify-center mt-2" onPress={onPress} disabled={loading}>
      {loading
        ? <ActivityIndicator color={COLORS.surface} size="small" />
        : <Text className="font-sans-bold text-lg text-surface">{label}</Text>
      }
    </TouchableOpacity>
  );
}

function OutlinedButton({ label, onPress, loading, disabled }) {
  return (
    <TouchableOpacity activeOpacity={0.75} className="h-[52px] rounded-[26px] border-half border-line-strong items-center justify-center mt-2" onPress={onPress} disabled={loading || disabled}>
      {loading
        ? <ActivityIndicator color={COLORS.ink} size="small" />
        : <Text className="font-sans-bold text-lg text-ink">{label}</Text>
      }
    </TouchableOpacity>
  );
}

function TextButton({ label, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} className="py-2.5 items-center">
      <Text className="font-sans text-xl text-muted">{label}</Text>
    </TouchableOpacity>
  );
}

export function AuthScreen() {
  const insets = useSafeAreaInsets();
  const [mode, setMode]       = useState('signin');
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(null);

  async function handleSignIn() {
    if (!email || !password) return Alert.alert('Fill in all fields');
    setLoading('email');
    try { await signIn({ email, password }); }
    catch (err) { Alert.alert('Sign in failed', err.message); }
    finally { setLoading(null); }
  }

  async function handleSignUp() {
    if (!name || !email || !password) return Alert.alert('Fill in all fields');
    if (password.length < 6) return Alert.alert('Password must be at least 6 characters');
    setLoading('email');
    try {
      await signUp({ email, password, name });
      Alert.alert('Check your email', 'We sent a confirmation link. Click it to activate your account, then sign in.', [{ text: 'OK', onPress: () => setMode('signin') }]);
    } catch (err) { Alert.alert('Sign up failed', err.message); }
    finally { setLoading(null); }
  }

  async function handleReset() {
    if (!email) return Alert.alert('Enter your email address first');
    setLoading('email');
    try {
      await resetPassword(email);
      Alert.alert('Email sent', 'Check your inbox for a password reset link.', [{ text: 'OK', onPress: () => setMode('signin') }]);
    } catch (err) { Alert.alert('Failed', err.message); }
    finally { setLoading(null); }
  }

  async function handleGoogle() {
    setLoading('google');
    try { await signInWithGoogle(); }
    catch (err) { Alert.alert('Google sign in failed', err.message); }
    finally { setLoading(null); }
  }

  const busy = loading !== null;

  return (
    <KeyboardAvoidingView className="flex-1 bg-canvas" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="font-serif text-8xl text-ink text-center mb-1.5">loadshare</Text>
        <Text className="font-sans text-xl text-muted text-center mb-10">Shared home, shared load.</Text>

        <View className="rounded-[20px] border-half border-line bg-surface p-6 mb-5">
          <Text className="font-serif text-2xl text-ink mb-5">
            {mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Reset password'}
          </Text>

          {mode === 'signup' && <AuthInput label="Your name" value={name} onChangeText={setName} autoCapitalize="words" />}
          <AuthInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          {mode !== 'reset' && <AuthInput label="Password" value={password} onChangeText={setPassword} secureTextEntry />}

          <PrimaryButton
            label={mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}
            onPress={mode === 'signin' ? handleSignIn : mode === 'signup' ? handleSignUp : handleReset}
            loading={loading === 'email'}
          />
        </View>

        {mode !== 'reset' && (
          <View className="mb-3">
            <View className="flex-row items-center my-4 gap-3">
              <View className="flex-1 h-[0.5px] bg-line-strong" />
              <Text className="font-sans text-base text-muted">or</Text>
              <View className="flex-1 h-[0.5px] bg-line-strong" />
            </View>
            <OutlinedButton label="Continue with Google" onPress={handleGoogle} loading={loading === 'google'} disabled={busy} />
          </View>
        )}

        <View className="gap-1 mb-7">
          {mode === 'signin' && <>
            <TextButton label="No account yet? Sign up" onPress={() => setMode('signup')} />
            <TextButton label="Forgot password?" onPress={() => setMode('reset')} />
          </>}
          {mode !== 'signin' && <TextButton label="Back to sign in" onPress={() => setMode('signin')} />}
        </View>

        <Text className="font-sans text-sm text-muted text-center leading-[18px]">
          By continuing you agree to our Terms of Service.{'\n'}Your data stays in your household — we never sell it.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
