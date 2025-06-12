import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

(async () => {
  console.log('🧽 Obteniendo estadísticas de bateo por equipo...');

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://baseballsavant.mlb.com/leaderboard/statcast?type=batter-team&year=2025', {
    waitUntil: 'networkidle2',
  });

  // Espera a que cargue la tabla
  await page.waitForSelector('#savant-leaderboard-table', { timeout: 60000 });

  const data = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('#savant-leaderboard-table tbody tr'));
    return rows.map(row => {
      const cells = row.querySelectorAll('td');
      const teamName = cells[1]?.textContent?.trim() || '';
      const avg = cells[5]?.textContent?.trim() || '';
      const obp = cells[6]?.textContent?.trim() || '';
      const slg = cells[7]?.textContent?.trim() || '';
      const ops = cells[8]?.textContent?.trim() || '';

      return {
        teamName,
        avg,
        obp,
        slg,
        ops
      };
    });
  });

  await browser.close();

  const csv = ['teamName,avg,obp,slg,ops']
    .concat(data.map(row => `${row.teamName},${row.avg},${row.obp},${row.slg},${row.ops}`))
    .join('\n');

  const filePath = path.resolve('public/data/hitting_teams_2025.csv');
  fs.writeFileSync(filePath, csv, 'utf-8');
  console.log(`✅ Archivo CSV generado: ${filePath}`);
})();