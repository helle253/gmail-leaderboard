const workerUrl = import.meta.env.VITE_WORKER_URL ?? 'http://localhost:8787';

export const apiUrl = (path: string): string => `${workerUrl}${path}`;

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(apiUrl(path), {
    ...init,
    credentials: 'include',
  });
}
