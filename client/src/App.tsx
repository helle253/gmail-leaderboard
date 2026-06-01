import { useEffect, useState } from 'react';

import { beginGoogleAuth, logout, verifySession } from './auth';
import { LeaderboardTable } from './components/LeaderboardTable';
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
    <main className="grid min-h-screen place-items-center p-2">
      <section>
        <div className="flex flex-row justify-between">
          <h1 className="text-2xl">Gmail Stats</h1>

          <div>
            {authenticated ? (
              <button
                className="rounded bg-slate-700 p-2 hover:bg-slate-600"
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
                className="bg-blue-600 p-2 hover:bg-blue-500"
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
        </div>

        {authenticated && <LeaderboardTable rows={rows} />}
      </section>
    </main>
  );
}
