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
  // Usar caché si ya se consultó
  if (statsCache[teamId]) {
    return statsCache[teamId];
  }

  const url = `https://statsapi.mlb.com/api/v1/teams/${teamId}/stats?season=2024&group=hitting`;
  const res = await fetch(url);
  const data = await res.json();

  const stat = data?.stats?.[0]?.splits?.[0]?.stat || {};

  const parsed = {
    rpg: parseFloat(stat.runsPerGame) || 0,
    avg: parseFloat(stat.avg) || 0,
    obp: parseFloat(stat.obp) || 0,
    slg: parseFloat(stat.slg) || 0,
    ops: parseFloat(stat.ops) || 0,
  };

  // Guardar en caché
  statsCache[teamId] = parsed;
  return parsed;
}