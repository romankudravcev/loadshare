import type { RoleConfig, WeightConfig } from '../types';

export const ROLES: RoleConfig[] = [
  { key: 'planner',   name: 'Planner',   verb: 'Thought of it', desc: 'Noticed it needed doing', glyph: '◐' },
  { key: 'organizer', name: 'Organizer', verb: 'Scheduled it',  desc: 'Put it on the calendar',  glyph: '◑' },
  { key: 'reminder',  name: 'Reminder',  verb: 'Followed up',   desc: 'Nudged it forward',       glyph: '◒' },
  { key: 'executor',  name: 'Executor',  verb: 'Did it',        desc: 'Completed the task',      glyph: '●' },
];

export const WEIGHTS: WeightConfig[] = [
  { value: 1, label: 'Quick',  sub: 'under 15 min',         bars: 1 },
  { value: 2, label: 'Normal', sub: '15–45 min',            bars: 2 },
  { value: 3, label: 'Effort', sub: '1–2 hrs · focus',      bars: 3 },
  { value: 4, label: 'Heavy',  sub: 'half a day',           bars: 4 },
  { value: 5, label: 'Epic',   sub: 'multi-day / draining', bars: 5 },
];

export const weightOf = (v: number): WeightConfig =>
  WEIGHTS.find(w => w.value === v) ?? WEIGHTS[1];
