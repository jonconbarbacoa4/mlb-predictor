// lib/mlbApi.ts

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

let statsMap: Map<number, any> | null = null;

export async function getTeamStats(teamId: number) {
  if (!statsMap) {
    const url = 'https://statsapi.mlb.com/api/v1/teams/stats?season=2025&group=hitting';
    const res = await fetch(url);
    const data = await res.json();
    const splits = data.stats?.[0]?.splits || [];

    statsMap = new Map<number, any>();
    splits.forEach((split: any) => {
      const id = split?.team?.id;
      if (id !== undefined) {
        statsMap!.set(id, split.stat);
      }
    });

    console.log(`✅ Stats cargadas: ${splits.length}`);
    console.log("🧾 IDs disponibles:", [...statsMap.keys()]);
  }

  const stat = statsMap.get(teamId);
  if (!stat) {
    console.warn(`❌ No se encontraron stats para teamId: ${teamId}`);
    return {
      rpg: 0, avg: 0, obp: 0, slg: 0, ops: 0,
    };
  }

  return {
    rpg: parseFloat(stat.runsPerGame) || 0,
    avg: parseFloat(stat.avg) || 0,
    obp: parseFloat(stat.obp) || 0,
    slg: parseFloat(stat.slg) || 0,
    ops: parseFloat(stat.ops) || 0,
  };
}