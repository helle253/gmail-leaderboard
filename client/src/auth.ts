export async function beginGoogleAuth(): Promise<boolean> {
  const session = await window.auth.beginGoogle();
  return !!session.authenticated;
}

async function verifyWorkerSession(): Promise<boolean> {
  const workerUrl = import.meta.env.VITE_WORKER_URL ?? 'http://localhost:8787';
  const response = await fetch(`${workerUrl}/api/auth/status`);
  if (!response.ok) return false;
  const data = (await response.json()) as { authenticated?: boolean };
  return !!data.authenticated;
}

export async function verifySession(): Promise<boolean> {
  const [localSession, workerSession] = await Promise.allSettled([window.auth.session(), verifyWorkerSession()]);

  const localAuthenticated = localSession.status === 'fulfilled' ? !!localSession.value.authenticated : false;
  const workerAuthenticated = workerSession.status === 'fulfilled' ? !!workerSession.value : false;

  return localAuthenticated || workerAuthenticated;
}

export async function logout(): Promise<void> {
  await window.auth.logout();
}
