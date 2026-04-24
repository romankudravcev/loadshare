import { db } from '../db';

describe('db service', () => {
  it('has saveTask and getTasks defined', () => {
    expect(db.saveTask).toBeDefined();
    expect(db.getTasks).toBeDefined();
  });
});
