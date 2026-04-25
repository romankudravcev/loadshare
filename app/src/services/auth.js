import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from './db';

WebBrowser.maybeCompleteAuthSession();

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return () => subscription.unsubscribe();
}

export async function signUp({ email, password, name }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });
  if (error) throw error;
  return data;
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'loadshare://reset-password',
  });
  if (error) throw error;
}

export async function signInWithGoogle() {
  const redirectTo = makeRedirectUri({ scheme: 'loadshare' });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return null;

  // Extract tokens from the redirect URL (Supabase returns them as hash fragments)
  const url = result.url;
  const params = parseUrlParams(url);

  if (!params.access_token || !params.refresh_token) {
    throw new Error('No tokens returned from Google sign-in');
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token:  params.access_token,
    refresh_token: params.refresh_token,
  });
  if (sessionError) throw sessionError;

  return supabase.auth.getUser();
}

function parseUrlParams(url) {
  const fragment = url.includes('#') ? url.split('#')[1] : url.split('?')[1] ?? '';
  return Object.fromEntries(
    fragment.split('&').map(p => p.split('=').map(decodeURIComponent))
  );
}
