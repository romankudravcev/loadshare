import { supabase } from './db';

const TASK_WITH_ROLES = `
  *,
  planner:profiles!tasks_planner_id_fkey   ( id, name, hue ),
  organizer:profiles!tasks_organizer_id_fkey ( id, name, hue ),
  reminder:profiles!tasks_reminder_id_fkey  ( id, name, hue ),
  executor:profiles!tasks_executor_id_fkey  ( id, name, hue )
`;

export const tasks = {
  listByCircle: async (circleId) => {
    const { data, error } = await supabase
      .from('tasks')
      .select(TASK_WITH_ROLES)
      .eq('circle_id', circleId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  create: async (taskData) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...taskData, created_by: user.id })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
  },
};

// Maps a Supabase circle + task list to the persona shape the UI expects
export function circleToPersona(circle, taskList) {
  const members = (circle.circle_members ?? []).map(cm => ({
    id:    cm.user_id,
    name:  cm.profiles?.name  ?? 'Unknown',
    short: (cm.profiles?.name ?? '?')[0].toUpperCase(),
    hue:   cm.profiles?.hue   ?? 200,
  }));

  const mapped = taskList.map(t => ({
    id:        t.id,
    title:     t.title,
    note:      t.note ?? '',
    weight:    t.weight,
    status:    t.status,
    category:  t.category ?? '',
    when:      t.due_date ?? '',
    planner:   t.planner_id,
    organizer: t.organizer_id,
    reminder:  t.reminder_id,
    executor:  t.executor_id,
  }));

  return {
    id:      circle.id,
    label:   circle.name,
    members,
    tasks: mapped,
  };
}
