import { PERSONAS } from '../tokens';

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// We'll use the existing PERSONAS flat data as our "database"
let db = {
  persona: { ...PERSONAS['flat'] },
  tasks: [...PERSONAS['flat'].tasks],
  members: [...PERSONAS['flat'].members],
};

export const api = {
  // Fetch the active household/persona
  getPersona: async (personaKey = 'flat') => {
    await delay(600);
    // If we switch persona, we load it from tokens and simulate db overwrite
    if (db.persona.id !== PERSONAS[personaKey].id) {
      db = {
        persona: { ...PERSONAS[personaKey] },
        tasks: [...PERSONAS[personaKey].tasks],
        members: [...PERSONAS[personaKey].members],
      };
    }
    return { ...db.persona, tasks: db.tasks, members: db.members };
  },

  // Update task status (e.g. pick up, hand off)
  updateTask: async (taskId, updates) => {
    await delay(400);
    db.tasks = db.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
    return db.tasks.find(t => t.id === taskId);
  },

  // Add a new task
  createTask: async (taskInput) => {
    await delay(500);
    const newTask = {
      id: `task-${Date.now()}`,
      ...taskInput,
      status: 'todo',
    };
    db.tasks = [newTask, ...db.tasks];
    return newTask;
  },

  // Update user preference/setting
  updateMember: async (memberId, updates) => {
    await delay(400);
    db.members = db.members.map(m => m.id === memberId ? { ...m, ...updates } : m);
    return db.members.find(m => m.id === memberId);
  }
};
