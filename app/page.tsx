import { getTodayGames, getBoxScore } from "@/lib/mlbApi";

export default async function Home() {
  const games = await getTodayGames();

  const gamesWithScores = await Promise.all(
    games.map(async (game) => {
      const { homeScore, awayScore } = await getBoxScore(game.gamePk);
      return {
        ...game,
        homeScore,
        awayScore,
      };
    })
  );

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Predicciones MLB (datos reales)</h1>
      <div className="space-y-4">
        {gamesWithScores.map((game) => (
          <div key={game.gamePk} className="border p-4 rounded">
            <p>
              <strong>{game.homeTeam} @ {game.awayTeam}</strong>
            </p>
            <p><strong>Score {game.awayTeam}:</strong> {game.awayScore.toFixed(2)}</p>
            <p><strong>Score {game.homeTeam}:</strong> {game.homeScore.toFixed(2)}</p>
            <p className="text-green-700 font-semibold">
              Predicción: Gana {game.homeScore > game.awayScore ? game.homeTeam : game.awayTeam}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}