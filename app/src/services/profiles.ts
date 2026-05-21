import type { Profile } from '../types';
import { supabase } from './db';

export const profiles = {
  getMe: async (): Promise<Profile> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .single();
    if (error) throw error;
    return data as Profile;
  },

  updateMe: async (updates: Partial<Profile>): Promise<Profile> => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user!.id)
      .select()
      .single();
    if (error) throw error;
    return data as Profile;
  },

  getById: async (id: string): Promise<Profile> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Profile;
  },
};
