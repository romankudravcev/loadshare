import { ROLES } from '../../tokens';

export const H_PAD = 20; // px-5 in Tailwind
export const GAP   = 8;  // gap-2 in Tailwind
export const TOTAL_STEPS = 3;

export type RoleKey = 'planner' | 'organizer' | 'reminder' | 'executor';
export type RoleAssign = Record<RoleKey, string>;
export type WhenValue = 'Today' | 'Tomorrow' | 'This week' | 'Next week';
export type CategoryValue = 'Home' | 'Food' | 'Kids' | 'Admin' | 'Family' | 'Errands';

export type Member = {
  id: string;
  name: string;
  short: string;
  hue: number;
};

export type Persona = {
  members: Member[];
  tasks: any[];
};

export const CATEGORIES: CategoryValue[] = ['Home', 'Food', 'Kids', 'Admin', 'Family', 'Errands'];

export const WHEN_OPTIONS: { label: string; value: WhenValue; icon: string }[] = [
  { label: 'Today',     value: 'Today',     icon: 'sun' },
  { label: 'Tomorrow',  value: 'Tomorrow',  icon: 'moon' },
  { label: 'This week', value: 'This week', icon: 'calendar' },
  { label: 'Next week', value: 'Next week', icon: 'check-square' },
];

export const CATEGORY_ICONS: Record<CategoryValue, string> = {
  Home:    'home',
  Food:    'coffee',
  Kids:    'star',
  Admin:   'file-text',
  Family:  'users',
  Errands: 'shopping-bag',
};

export const DEFAULT_ASSIGN = (defaultId: string): RoleAssign => ({
  planner: defaultId, organizer: defaultId, reminder: defaultId, executor: defaultId,
});

export function whenToDate(label: WhenValue): Date {
  const d = new Date();
  if (label === 'Tomorrow')  { d.setDate(d.getDate() + 1); return d; }
  if (label === 'This week') { d.setDate(d.getDate() + (7 - d.getDay())); return d; }
  if (label === 'Next week') { d.setDate(d.getDate() + (7 - d.getDay()) + 7); return d; }
  return d;
}

export function toISODate(d: Date): string {
  return d.toISOString().split('T')[0];
}

export { ROLES };
