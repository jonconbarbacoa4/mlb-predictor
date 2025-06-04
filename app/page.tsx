'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  getGamesByDate,
  getTeamStats,
  getLiveScore,
} from '@/lib/mlbApi';

interface Game {
  gamePk: number;
  homeTeam: string;
  homeTeamId: number;
  awayTeam: string;
  awayTeamId: number;
}

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [scores, setScores] = useState<Record<number, { home: number; away: number }>>({});
  const [liveScores, setLiveScores] = useState<Record<number, { home: number; away: number }>>({});
  const [predictions, setPredictions] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchGames = async () => {
      const games = await getGamesByDate(selectedDate);
      setGames(games);

      const newScores: Record<number, { home: number; away: number }> = {};
      const newPredictions: Record<number, string> = {};
      const newLiveScores: Record<number, { home: number; away: number }> = {};

      for (const game of games) {
        const homeStats = await getTeamStats(game.homeTeamId);
        const awayStats = await getTeamStats(game.awayTeamId);

        newScores[game.gamePk] = {
          home: homeStats.rpg,
          away: awayStats.rpg,
        };

        const live = await getLiveScore(game.gamePk);
        newLiveScores[game.gamePk] = {
          home: live.home,
          away: live.away,
        };

        newPredictions[game.gamePk] =
          homeStats.rpg > awayStats.rpg
            ? `Gana ${game.homeTeam}`
            : `Gana ${game.awayTeam}`;
      }

      setScores(newScores);
      setLiveScores(newLiveScores);
      setPredictions(newPredictions);
    };

    fetchGames();
  }, [selectedDate]);

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">
        Predicciones MLB (datos reales + marcador en vivo)
      </h1>

      <input
        type="date"
        className="border p-2 mb-4"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />

      {games.map((game) => (
        <div key={game.gamePk} className="border rounded p-4 mb-4 shadow">
          <div className="flex items-center gap-2 mb-2">
            <Image
              src={`https://www.mlbstatic.com/team-logos/${game.awayTeamId}.svg`}
              alt={`Logo de ${game.awayTeam}`}
              width={30}
              height={30}
              unoptimized
            />
            <span className="font-semibold">{game.awayTeam}</span>
            <span className="mx-1">@</span>
            <span className="font-semibold">{game.homeTeam}</span>
            <Image
              src={`https://www.mlbstatic.com/team-logos/${game.homeTeamId}.svg`}
              alt={`Logo de ${game.homeTeam}`}
              width={30}
              height={30}
              unoptimized
            />
          </div>

          <p>
            <strong>Estadística (rpg):</strong>{' '}
            {scores[game.gamePk]?.away?.toFixed(2) || '0.00'} -{' '}
            {scores[game.gamePk]?.home?.toFixed(2) || '0.00'}
          </p>
          <p>
            <strong>Marcador en vivo:</strong>{' '}
            {liveScores[game.gamePk]?.away ?? 0} - {liveScores[game.gamePk]?.home ?? 0}
          </p>
          <p className="text-green-600 font-semibold">
            Predicción: {predictions[game.gamePk] || 'Cargando...'}
          </p>
        </div>
      ))}
    </main>
  );
}