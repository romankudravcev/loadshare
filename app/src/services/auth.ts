import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './db';

WebBrowser.maybeCompleteAuthSession();

export async function getSession(): Promise<Session | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export function onAuthStateChange(callback: (session: Session | null) => void): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return () => subscription.unsubscribe();
}

export async function signUp({ email, password, name }: { email: string; password: string; name: string }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });
  if (error) throw error;
  return data;
}

export async function signIn({ email, password }: { email: string; password: string }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email: string): Promise<void> {
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

  const result = await WebBrowser.openAuthSessionAsync(data.url!, redirectTo);
  if (result.type !== 'success') return null;

  const params = parseUrlParams(result.url);
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

function parseUrlParams(url: string): Record<string, string> {
  const fragment = url.includes('#') ? url.split('#')[1] : url.split('?')[1] ?? '';
  return Object.fromEntries(
    fragment.split('&').map(p => p.split('=').map(decodeURIComponent))
  );
}
