import { readTeamStatsFromCSV } from './readCsv';
import { getGamesByDate } from './mlbApi';

export async function verifyCsvTeamIds(date: string) {
  const csvStats = readTeamStatsFromCSV();
  const csvIds = Object.keys(csvStats).map(Number);

  const games = await getGamesByDate(date);
  console.log('🧪 Verificando teamIds de los partidos del día:', date);

  for (const game of games) {
    const ids = [
      { label: 'Home', id: game.homeTeamId, team: game.homeTeam },
      { label: 'Away', id: game.awayTeamId, team: game.awayTeam },
    ];

    ids.forEach(({ label, id, team }) => {
      if (csvIds.includes(id)) {
        console.log(`✅ ${label} (${team}) está en el CSV (ID: ${id})`);
      } else {
        console.warn(`❌ ${label} (${team}) NO está en el CSV (ID: ${id})`);
      }
    });
  }
}