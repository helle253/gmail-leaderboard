export type LeaderboardRow = { sender: string; emailCount: number; unsubscribeLinks: string[] };

export async function fetchLeaderboard(): Promise<LeaderboardRow[]> {
  const workerUrl = import.meta.env.VITE_WORKER_URL ?? 'http://localhost:8787';
  const response = await fetch(`${workerUrl}/api/leaderboard`);
  if (!response.ok) throw new Error(`Failed to fetch leaderboard: ${response.status}`);
  const data = (await response.json()) as { rows?: LeaderboardRow[] };
  return data.rows ?? [];
}
