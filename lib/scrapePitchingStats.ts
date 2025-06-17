import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { createObjectCsvWriter } from 'csv-writer';

const OUTPUT_PATH = path.join(process.cwd(), 'public', 'data', 'pitching_stats_2025.csv');

export async function scrapePitchingStats() {
  console.log('🧽 Obteniendo estadísticas de pitcheo por equipo...');

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto('https://baseballsavant.mlb.com/leaderboard/statcast?type=pitcher-team&year=2025&position=&team=&min=q&sort=barrels_per_pa&sortDir=desc', {
    waitUntil: 'domcontentloaded',
  });

  try {
    await page.waitForSelector('#evLeaderboard', { timeout: 60000 });

    const tableHTML = await page.evaluate(() => {
      const container = document.querySelector('#evLeaderboard');
      return container ? container.outerHTML : '';
    });

    fs.writeFileSync('debug_pitching_full.html', tableHTML);
    console.log('✅ HTML completo guardado en debug_pitching_full.html');

    const data = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('#evLeaderboard table tbody tr'));
      return rows.map(row => {
        const cells = row.querySelectorAll('td');
        return {
          teamName: cells[1]?.textContent?.trim() ?? '',
          avg: parseFloat(cells[5]?.textContent?.trim() ?? '0'),
          obp: parseFloat(cells[7]?.textContent?.trim() ?? '0'),
          slg: parseFloat(cells[9]?.textContent?.trim() ?? '0'),
          ops: parseFloat(cells[11]?.textContent?.trim() ?? '0'),
        };
      }).filter(row => row.teamName); // elimina filas vacías
    });

    const csvWriter = createObjectCsvWriter({
      path: OUTPUT_PATH,
      header: [
        { id: 'teamName', title: 'teamName' },
        { id: 'avg', title: 'avg' },
        { id: 'obp', title: 'obp' },
        { id: 'slg', title: 'slg' },
        { id: 'ops', title: 'ops' },
      ],
    });

    await csvWriter.writeRecords(data);
    console.log(`✅ CSV generado exitosamente en ${OUTPUT_PATH}`);
  } catch (error) {
    console.error('❌ Error en scrapePitchingStats:', error);
  } finally {
    await browser.close();
  }
}

scrapePitchingStats();