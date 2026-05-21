import type { Circle } from '../types';
import { supabase } from './db';

const CIRCLE_WITH_MEMBERS = `
  *,
  circle_members (
    user_id,
    joined_at,
    profiles ( id, name, hue, avatar_url )
  )
`;

export const circles = {
  list: async (): Promise<Circle[]> => {
    const { data, error } = await supabase
      .from('circles')
      .select(CIRCLE_WITH_MEMBERS)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []) as Circle[];
  },

  get: async (id: string): Promise<Circle> => {
    const { data, error } = await supabase
      .from('circles')
      .select(CIRCLE_WITH_MEMBERS)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Circle;
  },

  getDefault: async (): Promise<Circle | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('circle_members')
      .select(`circles(${CIRCLE_WITH_MEMBERS})`)
      .eq('user_id', user!.id)
      .order('joined_at', { ascending: true })
      .limit(1)
      .single();
    if (error) throw error;
    return (data?.circles ?? null) as unknown as Circle | null;
  },

  create: async (name: string): Promise<Circle> => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('circles')
      .insert({ name, owner_id: user!.id })
      .select()
      .single();
    if (error) throw error;
    return data as Circle;
  },

  update: async (id: string, updates: Partial<Circle>): Promise<Circle> => {
    const { data, error } = await supabase
      .from('circles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Circle;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('circles').delete().eq('id', id);
    if (error) throw error;
  },

  addMember: async (circleId: string, userId: string): Promise<void> => {
    const { error } = await supabase
      .from('circle_members')
      .insert({ circle_id: circleId, user_id: userId });
    if (error) throw error;
  },

  removeMember: async (circleId: string, userId: string): Promise<void> => {
    const { error } = await supabase
      .from('circle_members')
      .delete()
      .match({ circle_id: circleId, user_id: userId });
    if (error) throw error;
  },
};
