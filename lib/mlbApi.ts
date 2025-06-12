// ✅ Versión mejorada de mlbApi.ts que lee el archivo combinado con datos ofensivos y de pitcheo

import Papa from 'papaparse';

let combinedStats: Record<number, any> | null = null;

async function loadCombinedStats(): Promise<Record<number, any>> {
  if (combinedStats) return combinedStats;

  try {
    const res = await fetch('/data/mlb_stats_2025.csv');
    const text = await res.text();
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });

    const stats: Record<number, any> = {};

    for (const row of parsed.data as any[]) {
      const teamId = parseInt(row.teamId);
      if (!isNaN(teamId)) {
        stats[teamId] = {
          avg: parseFloat(row.avg || '0'),
          obp: parseFloat(row.obp || '0'),
          slg: parseFloat(row.slg || '0'),
          ops: parseFloat(row.ops || '0'),
          era: parseFloat(row.era || '0'),
          whip: parseFloat(row.whip || '0'),
          oppAvg: parseFloat(row.oppAvg || '0'),
        };
      }
    }

    combinedStats = stats;
    return stats;
  } catch (error) {
    console.error('❌ Error al cargar mlb_stats_2025.csv:', error);
    return {};
  }
}

export async function getTeamStats(teamId: number) {
  const stats = await loadCombinedStats();
  const team = stats[teamId];
  if (!team) {
    console.warn(`⚠️ No se encontraron stats para teamId ${teamId}`);
    return {
      avg: 0,
      obp: 0,
      slg: 0,
      ops: 0,
      era: 0,
      whip: 0,
      oppAvg: 0,
    };
  }
  return team;
}
export async function getLiveScore(gamePk: number) {
  try {
    const res = await fetch(`https://statsapi.mlb.com/api/v1/game/${gamePk}/linescore`);
    const data = await res.json();
    return {
      home: data.teams?.home?.runs ?? 0,
      away: data.teams?.away?.runs ?? 0,
    };
  } catch {
    return { home: 0, away: 0 };
  }
}
export async function getPredictedOffense(teamId: number, pitcherHandedness: 'R' | 'L') {
  const stats = await getTeamStats(teamId);
  if (pitcherHandedness === 'R') {
    return stats.vsRHP ?? 0;
  } else if (pitcherHandedness === 'L') {
    return stats.vsLHP ?? 0;
  } else {
    return stats.ops ?? 0;
  }
}