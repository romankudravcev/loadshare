import { supabase } from './db';

const API_BASE = `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1`;

async function request(method, path, body) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Not authenticated');

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed (${res.status})`);
  }

  return res.json();
}

export const backendApi = {
  // ── Profile ───────────────────────────────────────────────────────────────
  getMe: ()           => request('GET',    '/me'),
  updateMe: (data)    => request('PATCH',  '/me', data),

  // ── Circles (households) ──────────────────────────────────────────────────
  getCircles: ()              => request('GET',    '/circles'),
  createCircle: (data)        => request('POST',   '/circles', data),
  getCircle: (id)             => request('GET',    `/circles/${id}`),
  updateCircle: (id, data)    => request('PATCH',  `/circles/${id}`, data),
  deleteCircle: (id)          => request('DELETE', `/circles/${id}`),

  // ── Tasks ─────────────────────────────────────────────────────────────────
  createTask: (data)          => request('POST',   '/tasks', data),
  getTasksByCircle: (circleId)=> request('GET',    `/circles/${circleId}/tasks`),
  updateTask: (id, data)      => request('PATCH',  `/tasks/${id}`, data),
  deleteTask: (id)            => request('DELETE', `/tasks/${id}`),
};
