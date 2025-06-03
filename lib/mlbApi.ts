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

export async function getTeamStats(teamId: number) {
  const url = `https://statsapi.mlb.com/api/v1/teams/stats?season=2025&group=hitting`
  const res = await fetch(url)
  const data = await res.json()

  const allStats = data.stats?.[0]?.splits || []
  const teamData = allStats.find((entry: any) => entry.team?.id === teamId)

  const stats = teamData?.stat || {}

  return {
    rpg: parseFloat(stats.runsPerGame) || 0,
    avg: parseFloat(stats.avg) || 0,
    obp: parseFloat(stats.obp) || 0,
    slg: parseFloat(stats.slg) || 0,
    ops: parseFloat(stats.ops) || 0,
  }
}