import { twMerge } from "tailwind-merge";

export type HistoryItem = {
  result: "WON" | "LOST";
  betAmount: number;
  payout: number;
newBalance: number;
  currentLoseStreak: number;
  currentWinStreak: number;
  highestLoseStreak: number;
  highestWinStreak: number;
};

interface IDiceHistory {
  history: HistoryItem[] | null;
}

const DiceHistory: React.FC<IDiceHistory> = ({ history }) => {
  const limitedHistory = history ? [...history].slice(-100).reverse() : null;

  return (
    <div className="flex-1 overflow-y-auto">
      <table className="w-full table-auto border-collapse">
        <thead className="sticky top-0 bg-black/40">
          <tr className="text-white text-xs font-semibold">
            <th className="p-4 text-center">Result</th>
            <th className="p-4 text-center">Bet Amount</th>
            <th className="p-4 text-center">Payout</th>
            <th className="p-4 text-center">New Balance</th>
            <th className="p-4 text-center">Lose Streak</th>
            <th className="p-4 text-center">Win Streak</th>
            <th className="p-4 text-center">Highest Lose Streak</th>
            <th className="p-4 text-center">Highest Win Streak</th>
          </tr>
        </thead>
        <tbody>
          {limitedHistory?.map((item, index) => (
            <tr
              key={index}
              className={twMerge(
                "",
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              )}
            >
              <td className="p-4 text-center">{item.result}</td>
              <td className="p-4 text-center">{item.betAmount}</td>
              <td className="p-4 text-center">{item.payout}</td>
              <td className="p-4 text-center">{item.newBalance}</td>
              <td className="p-4 text-center">{item.currentLoseStreak}</td>
              <td className="p-4 text-center">{item.currentWinStreak}</td>
              <td className="p-4 text-center">{item.highestLoseStreak}</td>
              <td className="p-4 text-center">{item.highestWinStreak}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DiceHistory;
