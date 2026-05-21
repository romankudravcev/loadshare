import type { Circle, Member, Persona, Task } from '../types';
import { supabase } from './db';

const TASK_WITH_ROLES = `
  *,
  planner:profiles!tasks_planner_id_fkey   ( id, name, hue ),
  organizer:profiles!tasks_organizer_id_fkey ( id, name, hue ),
  reminder:profiles!tasks_reminder_id_fkey  ( id, name, hue ),
  executor:profiles!tasks_executor_id_fkey  ( id, name, hue )
`;

export interface CreateTaskInput {
  circle_id: string;
  title: string;
  due_date?: string;
  category?: string;
  weight?: number;
  planner_id?: string;
  organizer_id?: string;
  reminder_id?: string;
  executor_id?: string;
}

export const tasks = {
  listByCircle: async (circleId: string): Promise<unknown[]> => {
    const { data, error } = await supabase
      .from('tasks')
      .select(TASK_WITH_ROLES)
      .eq('circle_id', circleId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  create: async (taskData: CreateTaskInput): Promise<unknown> => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...taskData, created_by: user!.id })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: Partial<CreateTaskInput>): Promise<unknown> => {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
  },
};

// Maps a Supabase circle + task list to the persona shape the UI expects
export function circleToPersona(circle: Circle, taskList: unknown[]): Persona {
  const members: Member[] = (circle.circle_members ?? []).map(cm => ({
    id:    cm.user_id,
    name:  cm.profiles?.name  ?? 'Unknown',
    short: (cm.profiles?.name ?? '?')[0].toUpperCase(),
    hue:   cm.profiles?.hue   ?? 200,
  }));

  const mapped: Task[] = (taskList as Record<string, unknown>[]).map(t => ({
    id:        t.id as string,
    title:     t.title as string,
    note:      (t.note as string | undefined) ?? '',
    weight:    t.weight as number,
    status:    t.status as string,
    category:  (t.category as string | undefined) ?? '',
    when:      (t.due_date as string | undefined) ?? '',
    planner:   (t.planner_id as string | null) ?? null,
    organizer: (t.organizer_id as string | null) ?? null,
    reminder:  (t.reminder_id as string | null) ?? null,
    executor:  (t.executor_id as string | null) ?? null,
  }));

  return {
    id:      circle.id,
    label:   circle.name,
    members,
    tasks: mapped,
  };
}
