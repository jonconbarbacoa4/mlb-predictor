import Papa from 'papaparse';

let localStats: Record<number, any> | null = null;

export async function getGamesByDate(date: string) {
  const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${date}`;
  const res = await fetch(url);
  const data = await res.json();

  const games = data.dates?.[0]?.games || [];

  return games.map((game: any) => ({
    gamePk: game.gamePk,
    homeTeam: game.teams.home.team.name,
    homeTeamId: game.teams.home.team.id,
    awayTeam: game.teams.away.team.name,
    awayTeamId: game.teams.away.team.id,
    homePitcher: game.teams.home.probablePitcher?.fullName || null,
    awayPitcher: game.teams.away.probablePitcher?.fullName || null,
  }));
}

async function loadCsvStats(): Promise<Record<number, any>> {
  if (localStats) return localStats;

  try {
    const res = await fetch('/data/mlb_stats_2025.csv');
    const csvText = await res.text();

    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    const stats: Record<number, any> = {};
    for (const row of parsed.data as any[]) {
      const teamId = parseInt(row.teamId);
      if (!isNaN(teamId)) {
        stats[teamId] = {
          rpg: parseFloat(row.runsPerGame ?? '0'),
          avg: parseFloat(row.avg ?? '0'),
          obp: parseFloat(row.obp ?? '0'),
          slg: parseFloat(row.slg ?? '0'),
          ops: parseFloat(row.ops ?? '0'),
          vsRHP: parseFloat(row.vsRHP ?? '0'),
          vsLHP: parseFloat(row.vsLHP ?? '0'),
        };
      }
    }
    localStats = stats;
    return stats;
  } catch (error) {
    console.error('❌ Error al cargar el CSV desde /public/data:', error);
    return {};
  }
}

export async function getTeamStats(teamId: number) {
  const stats = await loadCsvStats();
  const stat = stats[teamId];
  if (!stat) {
    console.warn(`⚠️ No se encontró CSV para el equipo ${teamId}`);
    return { rpg: 0, avg: 0, obp: 0, slg: 0, ops: 0, vsRHP: 0, vsLHP: 0 };
  }
  return stat;
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

export async function getPitchersFromBoxscore(gamePk: number) {
  try {
    const res = await fetch(`https://statsapi.mlb.com/api/v1/game/${gamePk}/boxscore`);
    const data = await res.json();

    const homePitcherId = data.teams?.home?.pitchers?.[0];
    const awayPitcherId = data.teams?.away?.pitchers?.[0];

    if (!homePitcherId || !awayPitcherId) {
      return {
        homePitcher: 'Por anunciar',
        awayPitcher: 'Por anunciar',
      };
    }

    const players = data.players ?? {};
    const homeKey = `ID${homePitcherId}`;
    const awayKey = `ID${awayPitcherId}`;

    const homePitcher = players[homeKey]?.person?.fullName ?? 'Por anunciar';
    const awayPitcher = players[awayKey]?.person?.fullName ?? 'Por anunciar';

    return {
      homePitcher,
      awayPitcher,
    };
  } catch {
    return {
      homePitcher: 'Por anunciar',
      awayPitcher: 'Por anunciar',
    };
  }
}

export async function getPitcherEra(pitcherName: string): Promise<number | string> {
  try {
    const url = `https://statsapi.mlb.com/api/v1/people/search?names=${encodeURIComponent(pitcherName)}`;
    const res = await fetch(url);
    const data = await res.json();

    const playerId = data?.people?.[0]?.id;
    if (!playerId) return 'N/A';

    const statsUrl = `https://statsapi.mlb.com/api/v1/people/${playerId}/stats?stats=season&season=2025`;
    const statsRes = await fetch(statsUrl);
    const statsData = await statsRes.json();

    const era = statsData?.stats?.[0]?.splits?.[0]?.stat?.era;
    return era ? parseFloat(era) : 'N/A';
  } catch {
    return 'N/A';
  }
}

// 🔁 NUEVA FUNCIÓN: Predicción ofensiva vs tipo de pitcher
export async function getPredictedOffense(teamId: number, pitcherHandedness: 'R' | 'L') {
  const stats = await getTeamStats(teamId);
  if (pitcherHandedness === 'R') {
    return stats.vsRHP ?? 0;
  } else if (pitcherHandedness === 'L') {
    return stats.vsLHP ?? 0;
  } else {
    return stats.ops ?? 0; // fallback
  }
}