export async function beginGoogleAuth(): Promise<boolean> {
  const session = await window.auth.beginGoogle();
  return !!session.authenticated;
}

export async function verifySession(): Promise<boolean> {
  const session = await window.auth.session();
  return !!session.authenticated;
}

export async function logout(): Promise<void> {
  await window.auth.logout();
}
