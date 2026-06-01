import { useEffect, useState } from 'react';

import { beginGoogleAuth, logout, verifySession } from './auth';
import { fetchLeaderboard, type LeaderboardRow } from './leaderboard';

export function App(): React.ReactElement {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [rows, setRows] = useState<LeaderboardRow[]>([]);

  useEffect(() => {
    verifySession()
      .then(async (isAuthenticated) => {
        setAuthenticated(isAuthenticated);
        if (isAuthenticated) setRows(await fetchLeaderboard());
      })
      .catch(() => setAuthenticated(false));
  }, []);

  useEffect(() => {
    if (!authenticated) return;

    const timer = setInterval(() => {
      fetchLeaderboard().then(setRows).catch();
    }, 10_000);

    return (): void => clearInterval(timer);
  }, [authenticated]);

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
                logout().finally(() => {
                  setAuthenticated(false);
                  setRows([]);
                });
              }}
            >
              Log out
            </button>
          ) : (
            <button
              className="rounded bg-blue-600 px-4 py-2 text-sm hover:bg-blue-500"
              onClick={() => {
                beginGoogleAuth()
                  .then(async (isAuthed) => {
                    setAuthenticated(isAuthed);
                    if (isAuthed) setRows(await fetchLeaderboard());
                  })
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

        {authenticated && (
          <>
            <ol className="mt-6 space-y-2 text-left text-sm">
              {rows.map((row, idx) => (
                <li key={`${row.sender}-${idx}`} className="rounded bg-slate-900 px-3 py-2">
                  <div className="flex items-center justify-between gap-6">
                    <span className="truncate">
                      {idx + 1}. {row.sender}
                    </span>
                    <span className="font-mono text-slate-300">{row.emailCount}</span>
                  </div>
                  {row.unsubscribeLinks.length > 0 && (
                    <div className="mt-2 flex flex-col gap-1 text-xs">
                      {row.unsubscribeLinks.map((link, linkIdx) => (
                        <a
                          key={`${link}-${linkIdx}`}
                          className="truncate text-blue-300 hover:underline"
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {link}
                        </a>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </>
        )}
      </section>
    </main>
  );
}
