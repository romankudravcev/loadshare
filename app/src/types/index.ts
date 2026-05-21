export type RoleKey = 'planner' | 'organizer' | 'reminder' | 'executor';
export type WeightLevel = 1 | 2 | 3 | 4 | 5;
export type WhenValue = 'Today' | 'Tomorrow' | 'This week' | 'Next week';
export type CategoryValue = 'Home' | 'Food' | 'Kids' | 'Admin' | 'Family' | 'Errands';

export type RoleAssign = Record<RoleKey, string>;

export interface Member {
  id: string;
  name: string;
  short: string;
  hue: number;
}

// Roles on a Task are stored as member IDs
export type TaskRoles = Record<RoleKey, string | null>;

export interface Task extends TaskRoles {
  id: string | number;
  title: string;
  note?: string;
  weight: number;
  status: string;
  category: string;
  when: string;
}

export interface Persona {
  id?: string;
  label: string;
  members: Member[];
  tasks: Task[];
}

export interface Profile {
  id?: string;
  name?: string;
  display_name?: string;
  hue?: number;
  avatar_url?: string;
}

export interface Circle {
  id: string;
  name: string;
  owner_id: string;
  circle_members: CircleMember[];
}

export interface CircleMember {
  user_id: string;
  joined_at: string;
  profiles: Profile | null;
}

export interface JoinRequest {
  id: string;
  circle_id: string;
  requester_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  requester?: Profile & { name: string; hue: number };
}

export interface RoleConfig {
  key: RoleKey;
  name: string;
  verb: string;
  desc: string;
  glyph: string;
}

export interface WeightConfig {
  value: number;
  label: string;
  sub: string;
  bars: number;
}

export type LoadMap = Record<string, {
  planner: number;
  organizer: number;
  reminder: number;
  executor: number;
  total: number;
}>;
