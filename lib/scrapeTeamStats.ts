import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function scrapeTeamStats() {
  console.log('🧽 Obteniendo estadísticas ofensivas por equipo...');

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://baseballsavant.mlb.com/leaderboard/statcast?type=batter-team&year=2025&position=&team=&min=q&sort=barrels_per_pa&sortDir=desc', {
    waitUntil: 'domcontentloaded'
  });

  await page.waitForSelector('#evLeaderboard'); // ✅ ESTE es el selector correcto

  const stats = await page.evaluate(() => {
    const rows = document.querySelectorAll('#evLeaderboard tbody tr');
    const data: { teamName: string; avg: string; obp: string; slg: string; ops: string }[] = [];

    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      const teamName = cells[1]?.textContent?.trim() ?? '';
      const avg = cells[8]?.textContent?.trim() ?? '';
      const obp = cells[9]?.textContent?.trim() ?? '';
      const slg = cells[10]?.textContent?.trim() ?? '';
      const ops = cells[11]?.textContent?.trim() ?? '';

      if (teamName && avg && obp && slg && ops) {
        data.push({ teamName, avg, obp, slg, ops });
      }
    });

    return data;
  });

  await browser.close();

  const csv = ['teamName,avg,obp,slg,ops']
    .concat(stats.map(d => `${d.teamName},${d.avg},${d.obp},${d.slg},${d.ops}`))
    .join('\n');

  const filePath = path.join('public', 'data', 'mlb_stats_2025.csv');
  fs.writeFileSync(filePath, csv, 'utf-8');

  console.log(`✅ Archivo guardado en ${filePath} con ${stats.length} equipos`);
}

scrapeTeamStats();