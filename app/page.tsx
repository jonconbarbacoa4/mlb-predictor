// app/page.tsx

import { getTodayGames, getBoxScore } from "@/lib/mlbApi";

export default async function Home() {
  const games = await getTodayGames();

  const gameStats = await Promise.all(
    games.map(async (game) => {
      const score = await getBoxScore(game.gamePk);
      return {
        ...game,
        homeScore: score.homeScore,
        awayScore: score.awayScore,
      };
    })
  );

  function predictWinner(homeScore: number, awayScore: number, homeTeam: string, awayTeam: string) {
    if (homeScore > awayScore) return `Gana ${homeTeam}`;
    if (awayScore > homeScore) return `Gana ${awayTeam}`;
    return "Empate";
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Predicciones MLB (datos reales)</h1>
      {gameStats.map((game) => (
        <div key={game.gamePk} className="mb-4 p-4 border rounded shadow">
          <p className="font-semibold">
            {game.awayTeam} @ {game.homeTeam}
          </p>
          <p>
            <strong>Score {game.awayTeam}:</strong> {game.awayScore.toFixed(2)}
          </p>
          <p>
            <strong>Score {game.homeTeam}:</strong> {game.homeScore.toFixed(2)}
          </p>
          <p className="text-green-600 font-semibold">
            Predicción: {predictWinner(game.homeScore, game.awayScore, game.homeTeam, game.awayTeam)}
          </p>
        </div>
      ))}
    </main>
  );
}