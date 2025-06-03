export async function getTodayGames() {
  const today = new Date().toISOString().split("T")[0];
  const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${today}`;
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

    console.log("⚾ Stats cargadas:", cachedStats.length);
    console.log("✅ IDs disponibles:", cachedStats.map(s => s.team?.id));
  }

  const split = cachedStats.find((s) => s.team?.id === teamId);
  if (!split) {
    console.warn(`⚠️ No se encontró stats para el equipo ${teamId}`);
  }

  const stat = split?.stat || {};

  return {
    rpg: parseFloat(stat.runsPerGame) || 0,
    avg: parseFloat(stat.avg) || 0,
    obp: parseFloat(stat.obp) || 0,
    slg: parseFloat(stat.slg) || 0,
    ops: parseFloat(stat.ops) || 0,
  };
}