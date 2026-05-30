import { useEffect, useState } from 'react';

import { beginGoogleAuth, logout, verifySession } from './auth';

export function App(): React.ReactElement {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    verifySession()
      .then(setAuthenticated)
      .catch(() => setAuthenticated(false));
  }, []);

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 text-slate-100">
      <section className="text-center">
        <h1 className="text-4xl font-semibold">gmail leaderboard</h1>
        <p className="mt-3 text-slate-300">Google OAuth + IMAP worker</p>

        <div className="mt-6 flex items-center justify-center gap-3">
          {authenticated ? (
            <button
              className="rounded bg-slate-700 px-4 py-2 text-sm hover:bg-slate-600"
              onClick={() => {
                logout().finally(() => setAuthenticated(false));
              }}
            >
              Log out
            </button>
          ) : (
            <button
              className="rounded bg-blue-600 px-4 py-2 text-sm hover:bg-blue-500"
              onClick={() => {
                beginGoogleAuth()
                  .then(setAuthenticated)
                  .catch(() => setAuthenticated(false));
              }}
            >
              Continue with Google
            </button>
          )}
        </div>

        <p className="mt-4 text-xs text-slate-400">
          auth: {authenticated === null ? 'checking…' : authenticated ? 'signed in' : 'signed out'}
        </p>
      </section>
    </main>
  );
}
