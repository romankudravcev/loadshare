import { PERSONAS } from '../constants/personas';
import type { Persona, Task } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let db: Persona = { ...PERSONAS['flat'], tasks: [...PERSONAS['flat'].tasks] };

export const api = {
  getPersona: async (personaKey = 'flat'): Promise<Persona> => {
    await delay(600);
    const p = PERSONAS[personaKey] ?? PERSONAS['flat'];
    db = { ...p, tasks: [...p.tasks] };
    return { ...db };
  },

  updateTask: async (taskId: string | number, updates: Partial<Task>): Promise<Task | undefined> => {
    await delay(400);
    db.tasks = db.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
    return db.tasks.find(t => t.id === taskId);
  },

  createTask: async (taskInput: Omit<Task, 'id'>): Promise<Task> => {
    await delay(500);
    const newTask: Task = { id: `task-${Date.now()}`, ...taskInput, status: 'todo' };
    db.tasks = [newTask, ...db.tasks];
    return newTask;
  },

  updateMember: async (memberId: string, updates: Record<string, unknown>) => {
    await delay(400);
    db.members = db.members.map(m => m.id === memberId ? { ...m, ...updates } : m);
    return db.members.find(m => m.id === memberId);
  },
};
