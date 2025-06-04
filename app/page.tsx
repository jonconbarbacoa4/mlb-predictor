'use client';

import { useEffect, useState } from 'react';
import { getGamesByDate, getTeamStats } from '@/lib/mlbApi';

type Game = {
  gamePk: number;
  homeTeam: string;
  homeTeamId: number;
  awayTeam: string;
  awayTeamId: number;
};

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [scores, setScores] = useState<Record<number, { home: number; away: number }>>({});
  const [predictions, setPredictions] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchGames = async () => {
      const games = await getGamesByDate(selectedDate);
      setGames(games);

      const newScores: Record<number, { home: number; away: number }> = {};
      const newPredictions: Record<number, string> = {};

      for (const game of games) {
        const homeStats = await getTeamStats(game.homeTeamId);
        const awayStats = await getTeamStats(game.awayTeamId);

        newScores[game.gamePk] = {
          home: homeStats.rpg,
          away: awayStats.rpg,
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
      <h1 className="text-xl font-bold mb-4">Predicciones MLB (datos reales)</h1>

      <input
        type="date"
        className="border p-2 mb-4"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />

      {games.map((game) => (
        <div key={game.gamePk} className="border rounded p-4 mb-4 shadow">
          <div className="flex items-center mb-2">
            <img
              src={`https://www.mlbstatic.com/team-logos/${game.awayTeamId}.svg`}
              alt={game.awayTeam}
              className="w-10 h-10 mr-2"
            />
            <span className="font-semibold mr-2">{game.awayTeam}</span>
            <span className="mx-1">@</span>
            <img
              src={`https://www.mlbstatic.com/team-logos/${game.homeTeamId}.svg`}
              alt={game.homeTeam}
              className="w-10 h-10 mx-2"
            />
            <span className="font-semibold">{game.homeTeam}</span>
          </div>

          <p>
            <strong>Score {game.homeTeam}:</strong> {scores[game.gamePk]?.home?.toFixed(2) || '0.00'}
          </p>
          <p>
            <strong>Score {game.awayTeam}:</strong> {scores[game.gamePk]?.away?.toFixed(2) || '0.00'}
          </p>
          <p className="text-green-600 font-semibold">
            Predicción: {predictions[game.gamePk] || 'Cargando...'}
          </p>
        </div>
      ))}
    </main>
  );
}