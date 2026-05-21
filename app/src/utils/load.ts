import { ROLES } from '../constants/roles';
import type { Persona, RoleKey, LoadMap } from '../types';

export function computeLoad(persona: Persona): LoadMap {
  const init: LoadMap = Object.fromEntries(
    persona.members.map(m => [m.id, { planner: 0, organizer: 0, reminder: 0, executor: 0, total: 0 }])
  );
  persona.tasks.forEach(t => {
    ROLES.forEach(r => {
      const who = t[r.key as RoleKey];
      if (who && init[who]) {
        init[who][r.key as RoleKey] += t.weight;
        init[who].total             += t.weight;
      }
    });
  });
  return init;
}

export function memberBg(hue: number): string {
  return `hsl(${hue}, 38%, 76%)`;
}

export function memberInk(hue: number): string {
  return `hsl(${hue}, 45%, 26%)`;
}

export function memberArc(hue: number): string {
  return `hsl(${hue}, 35%, 73%)`;
}

export function memberPlate(hue: number, index: number): string {
  return `hsl(${hue}, 32%, ${74 - index * 8}%)`;
}
