'use client';

import { useEffect, useState } from "react";
import { getGamesByDate, getTeamStats, getLiveScores } from "@/lib/mlbApi";

interface Game {
  gamePk: number;
  homeTeam: string;
  homeTeamId: number;
  awayTeam: string;
  awayTeamId: number;
}

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [scores, setScores] = useState<Record<number, { home: number; away: number; status: string }>>({});
  const [predictions, setPredictions] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchGames = async () => {
      const games = await getGamesByDate(selectedDate);
      setGames(games);

      const newScores: Record<number, { home: number; away: number; status: string }> = {};
      const newPredictions: Record<number, string> = {};

      for (const game of games) {
        const homeStats = await getTeamStats(game.homeTeamId);
        const awayStats = await getTeamStats(game.awayTeamId);
        const liveScore = await getLiveScores(game.gamePk);

        newScores[game.gamePk] = {
          home: liveScore.home,
          away: liveScore.away,
          status: liveScore.status,
        };

        newPredictions[game.gamePk] =
          homeStats.rpg > awayStats.rpg
            ? `Gana ${game.homeTeam}`
            : `Gana ${game.awayTeam}`;
      }

      setScores(newScores);
      setPredictions(newPredictions);
    };

    fetchGames();
  }, [selectedDate]);

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Predicciones MLB + Marcadores en Vivo</h1>

      <input
        type="date"
        className="border p-2 mb-4"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />

      {games.map((game) => (
        <div key={game.gamePk} className="border rounded p-4 mb-4 shadow">
          <p className="font-semibold">{game.awayTeam} @ {game.homeTeam}</p>
          <p>🏟️ Estado: <strong>{scores[game.gamePk]?.status || 'Sin datos'}</strong></p>
          <p>🔢 Resultado: {scores[game.gamePk]?.away ?? 0} - {scores[game.gamePk]?.home ?? 0}</p>
          <p className="text-green-600 font-semibold">
            🔮 Predicción: {predictions[game.gamePk] || 'Cargando...'}
          </p>
        </div>
      ))}
    </main>
  );
}