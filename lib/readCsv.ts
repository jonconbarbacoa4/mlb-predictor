import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';

export function readTeamStatsFromCSV(): Record<number, any> {
  const filePath = path.join(process.cwd(), 'public/data/mlb_stats_2025.csv');

  const file = fs.readFileSync(filePath, 'utf8');
  const parsed = Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
  });

  const stats: Record<number, any> = {};
  for (const row of parsed.data as any[]) {
    const teamId = parseInt(row.teamId);
    if (!isNaN(teamId)) {
      stats[teamId] = {
        rpg: parseFloat(row.runsPerGame ?? '0'),
        avg: parseFloat(row.avg ?? '0'),
        obp: parseFloat(row.obp ?? '0'),
        slg: parseFloat(row.slg ?? '0'),
        ops: parseFloat(row.ops ?? '0'),
        vsRHP: parseFloat(row.vsRHP ?? '0'),
        vsLHP: parseFloat(row.vsLHP ?? '0'),
      };
    }
  }

  return stats;
}