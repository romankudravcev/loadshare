// Placeholder for Database
export const db = {
  saveTask: async (task) => {
    console.log('Postponed DB save for task', task);
    return Promise.resolve(task);
  },
  getTasks: async () => {
    console.log('Postponed DB fetch');
    return Promise.resolve([]);
  }
};
