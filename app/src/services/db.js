import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = process.env.EXPO_PUBLIC_SUPABASE_URL      || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key';

// Supabase session tokens exceed SecureStore's 2048-byte per-key limit,
// so we split them into chunks.
const CHUNK = 1900;

const ChunkedSecureStore = {
  async getItem(key) {
    const n = await SecureStore.getItemAsync(`${key}.n`);
    if (!n) return null;
    let value = '';
    for (let i = 0; i < parseInt(n, 10); i++) {
      const part = await SecureStore.getItemAsync(`${key}.${i}`);
      if (part == null) return null;
      value += part;
    }
    return value;
  },
  async setItem(key, value) {
    const chunks = [];
    for (let i = 0; i < value.length; i += CHUNK) chunks.push(value.slice(i, i + CHUNK));
    await SecureStore.setItemAsync(`${key}.n`, String(chunks.length));
    await Promise.all(chunks.map((c, i) => SecureStore.setItemAsync(`${key}.${i}`, c)));
  },
  async removeItem(key) {
    const n = await SecureStore.getItemAsync(`${key}.n`);
    if (!n) return;
    await Promise.all([
      SecureStore.deleteItemAsync(`${key}.n`),
      ...Array.from({ length: parseInt(n, 10) }, (_, i) => SecureStore.deleteItemAsync(`${key}.${i}`)),
    ]);
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage:            ChunkedSecureStore,
    autoRefreshToken:   true,
    persistSession:     true,
    detectSessionInUrl: false,
  },
});
