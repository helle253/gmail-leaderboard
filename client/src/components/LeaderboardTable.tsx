import type { LeaderboardRow } from '../leaderboard';

type Props = {
  rows: LeaderboardRow[];
};

export function LeaderboardTable({ rows }: Props): React.ReactElement {
  return (
    <div>
      <div className="grid grid-cols-3 gap-1">
        <div className="text-left">Sender</div>
        <div>Email count</div>
        <div>Unsubscribe links</div>

        {rows.map((row, idx) => (
          <div key={`${row.sender}-${idx}`} className="contents">
            <div className="text-left truncate">{row.sender}</div>
            <div>{row.emailCount}</div>
            <div>
              {row.unsubscribeLinks.length > 0 ? (
                <div className="flex flex-col gap-1 text-xs max-w-55">
                  {row.unsubscribeLinks.map((link, linkIdx) => (
                    <a key={`${link}-${linkIdx}`} className="truncate text-blue-300 hover:underline" href={link}>
                      {link}
                    </a>
                  ))}
                </div>
              ) : (
                <span>—</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
