// lib/mlbApi.ts

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
  }));
}

let cachedStats: any[] = [];

export async function getTeamStats(teamId: number) {
  if (cachedStats.length === 0) {
    const url = 'https://statsapi.mlb.com/api/v1/teams/stats?season=2024&group=hitting';
    const res = await fetch(url);
    const data = await res.json();
    cachedStats = data.stats?.[0]?.splits || [];
  }

  const teamData = cachedStats.find((s) => s.team?.id === teamId);
  const stat = teamData?.stat || {};

  return {
    rpg: parseFloat(stat.runsPerGame) || 0,
    avg: parseFloat(stat.avg) || 0,
    obp: parseFloat(stat.obp) || 0,
    slg: parseFloat(stat.slg) || 0,
    ops: parseFloat(stat.ops) || 0,
  };
}

export async function getLiveScore(gamePk: number) {
  const url = `https://statsapi.mlb.com/api/v1/game/${gamePk}/linescore`;
  const res = await fetch(url);

  if (!res.ok) {
    return { home: 0, away: 0 };
  }

  const data = await res.json();
  return {
    home: data.teams?.home?.runs ?? 0,
    away: data.teams?.away?.runs ?? 0,
  };
}