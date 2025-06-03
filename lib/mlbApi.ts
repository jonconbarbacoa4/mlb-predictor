let cachedStats: any[] = []

export async function getTeamStats(teamId: number) {
  if (cachedStats.length === 0) {
    const url = 'https://statsapi.mlb.com/api/v1/teams/stats?season=2025&group=hitting';
    const res = await fetch(url);
    const data = await res.json();
    cachedStats = data.stats?.[0]?.splits || [];

    console.log("⚾ Stats cargadas:", cachedStats.length);
    console.log("✅ IDs disponibles:", cachedStats.map(s => s.team?.id));
  }

  console.log("🔍 Buscando stats para el equipo:", teamId);

  const teamStats = cachedStats.find((split: any) => split.team?.id === teamId)?.stat || {};

  return {
    rpg: parseFloat(teamStats.runsPerGame) || 0,
    avg: parseFloat(teamStats.avg) || 0,
    obp: parseFloat(teamStats.obp) || 0,
    slg: parseFloat(teamStats.slg) || 0,
    ops: parseFloat(teamStats.ops) || 0,
  };
}