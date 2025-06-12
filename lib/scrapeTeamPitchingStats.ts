import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { createObjectCsvWriter } from 'csv-writer';

async function scrapeTeamPitchingStats() {
  console.log('🧽 Obteniendo estadísticas de pitcheo por equipo...');

  const url = 'https://baseballsavant.mlb.com/leaderboard/statcast?type=pitcher-team&year=2025&position=&team=&min=q&sort=barrels_per_pa&sortDir=desc';

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  await page.waitForSelector('#evLeaderboard table', { timeout: 60000 });

  const data = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('#evLeaderboard table tbody tr'));
    return rows.map(row => {
      const cells = row.querySelectorAll('td');
      const teamName = cells[1]?.textContent?.trim() || '';
      const avg = parseFloat(cells[7]?.textContent?.trim() || '0') / 1000;
      const obp = parseFloat(cells[9]?.textContent?.trim() || '0') / 1000;
      const slg = parseFloat(cells[10]?.textContent?.trim() || '0') / 1000;
      const ops = parseFloat(cells[11]?.textContent?.trim() || '0') / 1000;

      return { teamName, avg, obp, slg, ops };
    }).filter(d => d.teamName !== '');
  });

  const outputPath = path.join('public', 'data', 'pitching_stats_2025.csv');
  const csvWriter = createObjectCsvWriter({
    path: outputPath,
    header: [
      { id: 'teamName', title: 'teamName' },
      { id: 'avg', title: 'avg' },
      { id: 'obp', title: 'obp' },
      { id: 'slg', title: 'slg' },
      { id: 'ops', title: 'ops' },
    ],
  });

  await csvWriter.writeRecords(data);
  console.log(`✅ CSV guardado en ${outputPath}`);

  await browser.close();
}

scrapeTeamPitchingStats().catch(error => {
  console.error('❌ Error:', error);
});