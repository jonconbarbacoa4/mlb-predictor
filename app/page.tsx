// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getTodayGames, getTeamStats } from '../lib/mlbApi';

interface Game {
  gamePk: number;
  homeTeam: string;
  awayTeam: string;
  homeTeamId: number;
  awayTeamId: number;
  homeScore: number;
  awayScore: number;
}

interface Stats {
  rpg: number;
  avg: number;
  obp: number;
  slg: number;
  ops: number;
}

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [predictions, setPredictions] = useState<Record<number, string>>({});

  useEffect(() => {
    async function fetchData() {
      const games = await getTodayGames();
      setGames(games);

      const newPredictions: Record<number, string> = {};
      for (const game of games) {
        const homeStats: Stats = await getTeamStats(game.homeTeamId);
        const awayStats: Stats = await getTeamStats(game.awayTeamId);

        const homeScore = homeStats.rpg + homeStats.ops * 10;
        const awayScore = awayStats.rpg + awayStats.ops * 10;

        newPredictions[game.gamePk] =
          homeScore > awayScore ? `Gana ${game.homeTeam}` : `Gana ${game.awayTeam}`;
      }
      setPredictions(newPredictions);
    }

    fetchData();
  }, []);

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Predicciones MLB (datos reales)</h1>
      {games.map((game) => (
        <div key={game.gamePk} style={{ border: '1px solid #ccc', marginBottom: '1rem', padding: '1rem', borderRadius: '8px' }}>
          <div><strong>{game.awayTeam} @ {game.homeTeam}</strong></div>
          <div><strong>Score {game.homeTeam}:</strong> {game.homeScore.toFixed(2)}</div>
          <div><strong>Score {game.awayTeam}:</strong> {game.awayScore.toFixed(2)}</div>
          <div style={{ marginTop: '0.5rem', color: 'green' }}><strong>Predicción:</strong> {predictions[game.gamePk]}</div>
        </div>
      ))}
    </main>
  );
}