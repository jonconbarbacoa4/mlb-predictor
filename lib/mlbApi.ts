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

let allStatsCache: Record<number, any> | null = null;

export async function getTeamStats(teamId: number) {
  if (!allStatsCache) {
    const url = `https://statsapi.mlb.com/api/v1/teams/stats?season=2025&group=hitting`;
    const res = await fetch(url);
    const data = await res.json();

    allStatsCache = {};

    for (const split of data.stats?.[0]?.splits || []) {
      allStatsCache[split.team?.id] = split.stat;
    }
  }

  const stats = allStatsCache[teamId] || {};

  return {
    rpg: parseFloat(stats.runsPerGame) || 0,
    avg: parseFloat(stats.avg) || 0,
    obp: parseFloat(stats.obp) || 0,
    slg: parseFloat(stats.slg) || 0,
    ops: parseFloat(stats.ops) || 0,
  };
}