import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const db = {
  saveTask: async (task) => {
    const { data, error } = await supabase.from('tasks').insert([task]);
    if (error) throw error;
    return data;
  },
  getTasks: async () => {
    const { data, error } = await supabase.from('tasks').select('*');
    if (error) throw error;
    return data;
  }
};
