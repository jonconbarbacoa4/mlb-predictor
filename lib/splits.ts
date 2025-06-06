// lib/splits.ts

export async function getOffensiveSplits(teamId: number) {
  try {
    const url = `https://statsapi.mlb.com/api/v1/teams/${teamId}/stats?stats=vsHanded&type=season&season=2025`;
    const res = await fetch(url);
    const data = await res.json();

    const splits = data.stats?.[0]?.splits || [];
    const vsRHP = splits.find((s: any) => s.hand === 'R')?.stat || {};
    const vsLHP = splits.find((s: any) => s.hand === 'L')?.stat || {};

    return {
      vsRHP: {
        avg: parseFloat(vsRHP.avg ?? '0'),
        ops: parseFloat(vsRHP.ops ?? '0'),
      },
      vsLHP: {
        avg: parseFloat(vsLHP.avg ?? '0'),
        ops: parseFloat(vsLHP.ops ?? '0'),
      },
    };
  } catch (err) {
    console.error(`❌ Error al obtener splits del equipo ${teamId}`, err);
    return {
      vsRHP: { avg: 0, ops: 0 },
      vsLHP: { avg: 0, ops: 0 },
    };
  }
}