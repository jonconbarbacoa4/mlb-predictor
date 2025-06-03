export async function getTeamStats(teamId: number) {
  const url = `https://statsapi.mlb.com/api/v1/teams/stats?season=2024&teamId=${teamId}`;
  const res = await fetch(url);
  const data = await res.json();

  const stats = data.stats?.[0]?.splits?.[0]?.stat;

  if (!stats) {
    console.warn(`⚠️ No hay estadísticas disponibles para el equipo ${teamId}`);
    return {
      rpg: 0,
      avg: 0,
      obp: 0,
      slg: 0,
      ops: 0,
    };
  }

  return {
    rpg: parseFloat(stats.runsPerGame) || 0,
    avg: parseFloat(stats.avg) || 0,
    obp: parseFloat(stats.obp) || 0,
    slg: parseFloat(stats.slg) || 0,
    ops: parseFloat(stats.ops) || 0,
  };
}