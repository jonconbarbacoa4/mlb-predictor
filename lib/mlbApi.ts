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

const statsCache: Record<number, any> = {};

export async function getTeamStats(teamId: number) {
  const url = `https://statsapi.mlb.com/api/v1/teams/${teamId}/stats?season=2024&group=hitting`;
  try {
    const res = await fetch(url);
    const data = await res.json();

    const stats = data.stats?.[0]?.splits?.[0]?.stat || {};

    return {
      rpg: parseFloat(stats.runsPerGame) || 0,
      avg: parseFloat(stats.avg) || 0,
      obp: parseFloat(stats.obp) || 0,
      slg: parseFloat(stats.slg) || 0,
      ops: parseFloat(stats.ops) || 0,
    };
  } catch (error) {
    console.error(`❌ Error al obtener stats para el equipo ${teamId}:`, error);
    return {
      rpg: 0, avg: 0, obp: 0, slg: 0, ops: 0
    };
  }
}