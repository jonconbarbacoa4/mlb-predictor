'use client';

import { useEffect, useState } from 'react';
import { getGamesByDate, getTeamStats, getLiveScore } from '@/lib/mlbApi';

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
    new Date().toISOString().split('T')[0]
  );
  const [statsScores, setStatsScores] = useState<Record<number, { home: number; away: number }>>({});
  const [liveScores, setLiveScores] = useState<Record<number, { home: number; away: number }>>({});
  const [predictions, setPredictions] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      const gameList = await getGamesByDate(selectedDate);
      setGames(gameList);

      const newStatsScores: Record<number, { home: number; away: number }> = {};
      const newPredictions: Record<number, string> = {};
      const newLiveScores: Record<number, { home: number; away: number }> = {};

      for (const game of gameList) {
        const homeStats = await getTeamStats(game.homeTeamId);
        const awayStats = await getTeamStats(game.awayTeamId);

        newStatsScores[game.gamePk] = {
          home: homeStats.rpg,
          away: awayStats.rpg,
        };

        newPredictions[game.gamePk] =
          homeStats.rpg > awayStats.rpg
            ? `Gana ${game.homeTeam}`
            : `Gana ${game.awayTeam}`;

        const live = await getLiveScore(game.gamePk);
        if (live) {
          newLiveScores[game.gamePk] = live;
        }
      }

      setStatsScores(newStatsScores);
      setPredictions(newPredictions);
      setLiveScores(newLiveScores);
    };

    fetchData();
  }, [selectedDate]);

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Predicciones MLB (datos reales + marcador en vivo)</h1>

      <input
        type="date"
        className="border p-2 mb-4"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />

      {games.map((game) => (
        <div key={game.gamePk} className="border rounded p-4 mb-4 shadow">
          <p>
            <strong>{game.awayTeam} @ {game.homeTeam}</strong>
          </p>

          <p>
            <strong>Estadística (rpg):</strong> {statsScores[game.gamePk]?.away?.toFixed(2) || '0.00'} - {statsScores[game.gamePk]?.home?.toFixed(2) || '0.00'}
          </p>

          <p>
            <strong>Marcador en vivo:</strong>{' '}
            {liveScores[game.gamePk]
              ? `${liveScores[game.gamePk].away} - ${liveScores[game.gamePk].home}`
              : 'No disponible'}
          </p>

          <p className="text-green-600 font-semibold">
            Predicción: {predictions[game.gamePk] || 'Cargando...'}
          </p>
        </div>
      ))}
    </main>
  );
}