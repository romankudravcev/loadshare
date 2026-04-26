import { supabase } from './db';

export const joinRequests = {
  create: async (circleId) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('circle_join_requests')
      .insert({ circle_id: circleId, requester_id: user.id })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  listPending: async (circleId) => {
    const { data, error } = await supabase
      .from('circle_join_requests')
      .select(`*, requester:profiles!circle_join_requests_requester_id_fkey (id, name, hue)`)
      .eq('circle_id', circleId)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  accept: async (requestId, circleId, requesterId) => {
    const { error: memberErr } = await supabase
      .from('circle_members')
      .insert({ circle_id: circleId, user_id: requesterId });
    if (memberErr) throw memberErr;

    const { error } = await supabase
      .from('circle_join_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId);
    if (error) throw error;
  },

  reject: async (requestId) => {
    const { error } = await supabase
      .from('circle_join_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId);
    if (error) throw error;
  },
};
