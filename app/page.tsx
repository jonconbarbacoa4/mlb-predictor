"use client";

import { useEffect, useState } from "react";
import { getGamesByDate, getTeamStats, getLiveScores } from "@/lib/mlbApi";

type Game = {
  gamePk: number;
  homeTeam: string;
  homeTeamId: number;
  awayTeam: string;
  awayTeamId: number;
};

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [predictions, setPredictions] = useState<Record<number, string>>({});
  const [liveScores, setLiveScores] = useState<Record<number, { home: number; away: number }>>({});

  useEffect(() => {
    const fetchData = async () => {
      const games = await getGamesByDate(selectedDate);
      setGames(games);

      const newPredictions: Record<number, string> = {};

      for (const game of games) {
        const homeStats = await getTeamStats(game.homeTeamId);
        const awayStats = await getTeamStats(game.awayTeamId);

        newPredictions[game.gamePk] =
          homeStats.rpg > awayStats.rpg
            ? `Gana ${game.homeTeam}`
            : `Gana ${game.awayTeam}`;
      }

      setPredictions(newPredictions);
    };

    fetchData();
  }, [selectedDate]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const scores = await getLiveScores();
      setLiveScores(scores);
    }, 30000); // actualiza cada 30s

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Predicciones MLB (datos reales)</h1>

      <input
        type="date"
        className="border p-2 mb-4"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />

      {games.map((game) => (
        <div key={game.gamePk} className="border rounded p-4 mb-4 shadow">
          <p className="flex items-center gap-2 mb-2">
            <img
              src={`https://www.mlbstatic.com/team-logos/${game.awayTeamId}.svg`}
              alt={game.awayTeam}
              className="w-6 h-6"
            />
            <span>{game.awayTeam}</span>
            <span className="mx-1">@</span>
            <img
              src={`https://www.mlbstatic.com/team-logos/${game.homeTeamId}.svg`}
              alt={game.homeTeam}
              className="w-6 h-6"
            />
            <span>{game.homeTeam}</span>
          </p>
          <p>
            <strong>Score {game.homeTeam}:</strong> {liveScores[game.gamePk]?.home ?? "-"}
          </p>
          <p>
            <strong>Score {game.awayTeam}:</strong> {liveScores[game.gamePk]?.away ?? "-"}
          </p>
          <p className="text-green-600 font-semibold">
            Predicción: {predictions[game.gamePk] || "Cargando..."}
          </p>
        </div>
      ))}
    </main>
  );
}