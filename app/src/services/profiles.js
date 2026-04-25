import { supabase } from './db';

export const profiles = {
  getMe: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  updateMe: async (updates) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },
};
