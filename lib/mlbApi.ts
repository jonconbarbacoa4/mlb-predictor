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
    const url = 'https://statsapi.mlb.com/api/v1/teams/stats?season=2025&group=hitting';
    const res = await fetch(url);
    const data = await res.json();
    cachedStats = data.stats?.[0]?.splits || [];

    console.log("✅ Stats cargadas:", cachedStats.length);
    console.log("📌 IDs disponibles:", cachedStats.map(s => s.team?.id));
    const ejemplo = cachedStats.find(s => s.team?.id === teamId);
    console.log("📌 Ejemplo de stat:", ejemplo);
  }

  const teamData = cachedStats.find((s) => s.team?.id === teamId);
  if (!teamData) {
    console.warn(`⚠️ No se encontró stats para el equipo ${teamId}`);
    return {
      rpg: 0,
      avg: 0,
      obp: 0,
      slg: 0,
      ops: 0,
    };
  }

  const stat = teamData.stat || {};

  return {
    rpg: parseFloat(stat.runsPerGame ?? stat.runs_per_game ?? "0") || 0,
    avg: parseFloat(stat.avg ?? "0") || 0,
    obp: parseFloat(stat.obp ?? "0") || 0,
    slg: parseFloat(stat.slg ?? "0") || 0,
    ops: parseFloat(stat.ops ?? "0") || 0,
  };
}

export async function getLiveScore(gamePk: number) {
  try {
    const res = await fetch(`https://statsapi.mlb.com/api/v1/game/${gamePk}/linescore`);
    const data = await res.json();

    return {
      home: data.teams?.home?.runs ?? 0,
      away: data.teams?.away?.runs ?? 0,
    };
  } catch (error) {
    console.warn(`⚠️ Error al obtener marcador en vivo para el juego ${gamePk}`);
    return { home: 0, away: 0 };
  }
}