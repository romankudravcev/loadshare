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
  list: async () => {
    const { data, error } = await supabase
      .from('circles')
      .select(CIRCLE_WITH_MEMBERS)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  get: async (id) => {
    const { data, error } = await supabase
      .from('circles')
      .select(CIRCLE_WITH_MEMBERS)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  create: async (name) => {
    // getSession() ensures the JWT is loaded into the client before we insert.
    // Without this the first request after app launch can go out as anon.
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error('Not authenticated');

    // No .select() here — the SELECT policy checks circle_members, which the
    // trigger populates in the same transaction. PostgREST evaluates RETURNING
    // before the trigger result is visible to RLS, so we'd get a false denial.
    // The caller always calls refreshPersona() after this anyway.
    const { error } = await supabase
      .from('circles')
      .insert({ name, owner_id: session.user.id });
    if (error) throw error;
  },

  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('circles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id) => {
    const { error } = await supabase.from('circles').delete().eq('id', id);
    if (error) throw error;
  },

  addMember: async (circleId, userId) => {
    const { error } = await supabase
      .from('circle_members')
      .insert({ circle_id: circleId, user_id: userId });
    if (error) throw error;
  },

  removeMember: async (circleId, userId) => {
    const { error } = await supabase
      .from('circle_members')
      .delete()
      .match({ circle_id: circleId, user_id: userId });
    if (error) throw error;
  },
};
