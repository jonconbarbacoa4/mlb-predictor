'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  getTeamStats,
  getLiveScore,
  getPredictedOffense
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
  const [liveScores, setLiveScores] = useState<Record<number, { home: number; away: number }>>({});
  const [predictions, setPredictions] = useState<Record<number, string>>({});
  const [reasons, setReasons] = useState<Record<number, string>>({});

  useEffect(() => {
    const dummyGames: Game[] = [
      {
        gamePk: 1,
        homeTeam: 'Miami Marlins',
        homeTeamId: 146,
        awayTeam: 'Pittsburgh Pirates',
        awayTeamId: 134
      },
      {
        gamePk: 2,
        homeTeam: 'Philadelphia Phillies',
        homeTeamId: 143,
        awayTeam: 'Chicago Cubs',
        awayTeamId: 112
      }
    ];

    const fetchData = async () => {
      try {
        setGames(dummyGames);

        const newLiveScores: Record<number, { home: number; away: number }> = {};
        const newPredictions: Record<number, string> = {};
        const newReasons: Record<number, string> = {};

        for (const game of dummyGames) {
          const [homeStats, awayStats, live] = await Promise.all([
            getTeamStats(game.homeTeamId),
            getTeamStats(game.awayTeamId),
            getLiveScore(game.gamePk)
          ]);

          const prediction = homeStats.ops > awayStats.ops
            ? `Gana ${game.homeTeam}`
            : `Gana ${game.awayTeam}`;

          const reason = homeStats.ops > awayStats.ops
            ? `${game.homeTeam} tiene mejor OPS (${homeStats.ops.toFixed(3)}) que ${game.awayTeam} (${awayStats.ops.toFixed(3)})`
            : `${game.awayTeam} tiene mejor OPS (${awayStats.ops.toFixed(3)}) que ${game.homeTeam} (${homeStats.ops.toFixed(3)})`;

          newLiveScores[game.gamePk] = {
            home: live.home,
            away: live.away
          };

          newPredictions[game.gamePk] = prediction;
          newReasons[game.gamePk] = reason;
        }

        setLiveScores(newLiveScores);
        setPredictions(newPredictions);
        setReasons(newReasons);
      } catch (err) {
        console.error('❌ Error al obtener datos:', err);
      }
    };

    fetchData();
  }, [selectedDate]);

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">
        Predicciones MLB (solo OPS ofensivo + marcador en vivo)
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
            <strong>Marcador en vivo:</strong>{' '}
            {liveScores[game.gamePk]?.away ?? 0} - {liveScores[game.gamePk]?.home ?? 0}
          </p>

          <p className="text-green-600 font-semibold">
            Predicción: {predictions[game.gamePk] || 'Cargando...'}
          </p>

          <p className="text-sm text-gray-600">
            {reasons[game.gamePk] || 'Calculando razones...'}
          </p>
        </div>
      ))}
    </main>
  );
}