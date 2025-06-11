import { teamCities } from './teamCities';
import Papa from 'papaparse';

let localStats: Record<number, any> | null = null;
let pitcherStats: Record<string, any> | null = null;
let teamPitchingStats: Record<string, any> | null = null;

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
    const [res1, res2] = await Promise.all([
      fetch('/data/mlb_stats_2025.csv'),
      fetch('/data/batting_teams_2025.csv'),
    ]);

    const [text1, text2] = await Promise.all([res1.text(), res2.text()]);

    const parsed1 = Papa.parse(text1, { header: true, skipEmptyLines: true });
    const parsed2 = Papa.parse(text2, { header: true, skipEmptyLines: true });

    const stats: Record<number, any> = {};

    for (const row of parsed1.data as any[]) {
      const teamId = parseInt(row.teamId);
      if (!isNaN(teamId)) {
        stats[teamId] = {
          rpg: parseFloat(row.runsPerGame ?? '0'),
          avg: parseFloat(row.avg ?? '0'),
          obp: parseFloat(row.obp ?? '0'),
          slg: parseFloat(row.slg ?? '0'),
          ops: parseFloat(row.ops ?? '0'),
        };
      }
    }

    for (const row of parsed2.data as any[]) {
      const teamId = parseInt(row.teamId);
      if (!isNaN(teamId)) {
        if (!stats[teamId]) stats[teamId] = {};
        stats[teamId].vsRHP = parseFloat(row.vsRHP ?? '0');
        stats[teamId].vsLHP = parseFloat(row.vsLHP ?? '0');
      }
    }

    localStats = stats;
    return stats;
  } catch (error) {
    console.error('❌ Error al cargar los CSV:', error);
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

export async function getProbablePitchersByTeam(date: string): Promise<Record<string, { name: string; throws: string; avg: string }>> {
  try {
    const res = await fetch('/data/probable_pitchers_2025.csv');
    const text = await res.text();
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });

    const pitchers: Record<string, { name: string; throws: string; avg: string }> = {};
    for (const row of parsed.data as any[]) {
      if (row.Date === date) {
        pitchers[row.Team] = {
          name: row.Name,
          throws: row.Throws,
          avg: row.AVG,
        };
      }
    }

    return pitchers;
  } catch (error) {
    console.error('❌ Error al cargar probable_pitchers_2025.csv:', error);
    return {};
  }
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
}import { teamCities } from './teamCities';
import Papa from 'papaparse';

let localStats: Record<number, any> | null = null;
let pitcherStats: Record<string, any> | null = null;
let teamPitchingStats: Record<string, any> | null = null;

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
    const [res1, res2] = await Promise.all([
      fetch('/data/mlb_stats_2025.csv'),
      fetch('/data/batting_teams_2025.csv'),
    ]);

    const [text1, text2] = await Promise.all([res1.text(), res2.text()]);

    const parsed1 = Papa.parse(text1, { header: true, skipEmptyLines: true });
    const parsed2 = Papa.parse(text2, { header: true, skipEmptyLines: true });

    const stats: Record<number, any> = {};

    for (const row of parsed1.data as any[]) {
      const teamId = parseInt(row.teamId);
      if (!isNaN(teamId)) {
        stats[teamId] = {
          rpg: parseFloat(row.runsPerGame ?? '0'),
          avg: parseFloat(row.avg ?? '0'),
          obp: parseFloat(row.obp ?? '0'),
          slg: parseFloat(row.slg ?? '0'),
          ops: parseFloat(row.ops ?? '0'),
        };
      }
    }

    for (const row of parsed2.data as any[]) {
      const teamId = parseInt(row.teamId);
      if (!isNaN(teamId)) {
        if (!stats[teamId]) stats[teamId] = {};
        stats[teamId].vsRHP = parseFloat(row.vsRHP ?? '0');
        stats[teamId].vsLHP = parseFloat(row.vsLHP ?? '0');
      }
    }

    localStats = stats;
    return stats;
  } catch (error) {
    console.error('❌ Error al cargar los CSV:', error);
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

export async function getProbablePitchersByTeam(date: string): Promise<Record<string, { name: string; throws: string; avg: string }>> {
  try {
    const res = await fetch('/data/probable_pitchers_2025.csv');
    const text = await res.text();
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });

    const pitchers: Record<string, { name: string; throws: string; avg: string }> = {};
    for (const row of parsed.data as any[]) {
      if (row.Date === date) {
        pitchers[row.Team] = {
          name: row.Name,
          throws: row.Throws,
          avg: row.AVG,
        };
      }
    }

    return pitchers;
  } catch (error) {
    console.error('❌ Error al cargar probable_pitchers_2025.csv:', error);
    return {};
  }
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