'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  getGamesByDate,
  getTeamStats,
  getLiveScore,
  getPitcherEra,
} from '@/lib/mlbApi';

interface Game {
  gamePk: number;
  homeTeam: string;
  homeTeamId: number;
  awayTeam: string;
  awayTeamId: number;
  homePitcher: string | null;
  awayPitcher: string | null;
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
    const fetchData = async () => {
      try {
        const gameList = await getGamesByDate(selectedDate);
        setGames(gameList);

        const yesterday = new Date(selectedDate);
        yesterday.setDate(yesterday.getDate() - 1);
        const prevDate = yesterday.toISOString().split('T')[0];
        const prevGames = await getGamesByDate(prevDate);
        const teamsPlayedYesterday = new Set<number>();
        for (const g of prevGames) {
          teamsPlayedYesterday.add(g.homeTeamId);
          teamsPlayedYesterday.add(g.awayTeamId);
        }

        const newLiveScores: Record<number, { home: number; away: number }> = {};
        const newPredictions: Record<number, string> = {};
        const newReasons: Record<number, string> = {};

        for (const game of gameList) {
          const [homeStats, awayStats, live, homeEra, awayEra] = await Promise.all([
            getTeamStats(game.homeTeamId),
            getTeamStats(game.awayTeamId),
            getLiveScore(game.gamePk),
            getPitcherEra(game.homePitcher ?? ''),
            getPitcherEra(game.awayPitcher ?? ''),
          ]);

          newLiveScores[game.gamePk] = {
            home: live.home,
            away: live.away,
          };

          const homePlayedYesterday = teamsPlayedYesterday.has(game.homeTeamId);
          const awayPlayedYesterday = teamsPlayedYesterday.has(game.awayTeamId);

          // 🧠 Predicción basada en OPS global (ya cargado desde el CSV)
          const homeOps = homeStats.ops ?? 0;
          const awayOps = awayStats.ops ?? 0;

          const prediction = homeOps > awayOps ? `Gana ${game.homeTeam}` : `Gana ${game.awayTeam}`;

          const reason = `🏠 Localía: ${game.homeTeam} ${!homePlayedYesterday ? 'descansado' : 'jugó ayer'} | ERA: ${homeEra} vs ${awayEra} | OPS: ${homeOps.toFixed(3)} vs ${awayOps.toFixed(3)}`;

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