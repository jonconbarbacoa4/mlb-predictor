'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  getGamesByDate,
  getTeamStats,
  getLiveScore,
  getPredictedOffense,
  getProbablePitchersByTeam
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
  console.log('🔄 Montando Home');

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
        const teamResultsYesterday: Record<number, 'ganó' | 'perdió'> = {};

        for (const g of prevGames) {
          teamsPlayedYesterday.add(g.homeTeamId);
          teamsPlayedYesterday.add(g.awayTeamId);

          const score = await getLiveScore(g.gamePk);
          if (score.home > score.away) {
            teamResultsYesterday[g.homeTeamId] = 'ganó';
            teamResultsYesterday[g.awayTeamId] = 'perdió';
          } else if (score.away > score.home) {
            teamResultsYesterday[g.awayTeamId] = 'ganó';
            teamResultsYesterday[g.homeTeamId] = 'perdió';
          }
        }

        const probablePitchersByTeam = await getProbablePitchersByTeam(selectedDate);

        const newLiveScores: Record<number, { home: number; away: number }> = {};
        const newPredictions: Record<number, string> = {};
        const newReasons: Record<number, string> = {};

        for (const game of gameList) {
          const [homeStats, awayStats, live] = await Promise.all([
            getTeamStats(game.homeTeamId),
            getTeamStats(game.awayTeamId),
            getLiveScore(game.gamePk)
          ]);

          const homePlayedYesterday = teamsPlayedYesterday.has(game.homeTeamId);
          const awayPlayedYesterday = teamsPlayedYesterday.has(game.awayTeamId);

          const homeResult = teamResultsYesterday[game.homeTeamId];
          const awayResult = teamResultsYesterday[game.awayTeamId];

          const homePitcher = probablePitchersByTeam[game.homeTeam];
          const awayPitcher = probablePitchersByTeam[game.awayTeam];

          const homeOffense = await getPredictedOffense(game.homeTeamId, awayPitcher?.throws === 'L' ? 'L' : 'R');
          const awayOffense = await getPredictedOffense(game.awayTeamId, homePitcher?.throws === 'L' ? 'L' : 'R');

          const prediction = homeOffense > awayOffense ? `Gana ${game.homeTeam}` : `Gana ${game.awayTeam}`;

          const formatERA = (era: string | undefined) => era && era !== '' ? era : 'N/A';

          const reason = homeOffense > awayOffense
            ? `${game.homeTeam} tiene mejor OPS (${homeOffense.toFixed(3)}) vs lanzador ${awayPitcher?.throws ?? '?'}, y el abridor rival tiene ERA de ${formatERA(awayPitcher?.era)}. ${game.awayTeam} ${awayPlayedYesterday ? `jugó ayer y ${awayResult ?? 'sin resultado'}` : 'descansado'}`
            : `${game.awayTeam} tiene mejor OPS (${awayOffense.toFixed(3)}) vs lanzador ${homePitcher?.throws ?? '?'}, y el abridor rival tiene ERA de ${formatERA(homePitcher?.era)}. ${game.homeTeam} ${homePlayedYesterday ? `jugó ayer y ${homeResult ?? 'sin resultado'}` : 'descansado'}`;

          newLiveScores[game.gamePk] = {
            home: live.home,
            away: live.away,
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