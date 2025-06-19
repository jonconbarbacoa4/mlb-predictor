import puppeteer from 'puppeteer';
import { writeFileSync } from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

async function scrapePitchingStats() {
  console.log('🧽 Obteniendo estadísticas de pitcheo por equipo...');

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const url = 'https://baseballsavant.mlb.com/leaderboard/statcast?type=pitcher-team&year=2025&position=&team=&min=q&sort=barrels_per_pa&sortDir=desc';

  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // Espera a que la tabla esté cargada
  await page.waitForSelector('#evLeaderboard table tbody tr', { timeout: 60000 });

  // Extrae el HTML de la tabla
  const html = await page.content();
  writeFileSync('debug_pitching_full.html', html); // útil para debug

  const $ = cheerio.load(html);
  const rows = $('#evLeaderboard table tbody tr');

  const data: { teamName: string; avg: number; obp: number; slg: number; ops: number }[] = [];

  rows.each((i, el) => {
    const cols = $(el).find('td');

    const teamName = $(cols[1]).text().trim();
    const avg = parseFloat($(cols[2]).text()) || 0;
    const obp = parseFloat($(cols[3]).text()) || 0;
    const slg = parseFloat($(cols[4]).text()) || 0;
    const ops = parseFloat($(cols[5]).text()) || 0;

    if (teamName) {
      data.push({ teamName, avg, obp, slg, ops });
    }
  });

  const csvPath = path.resolve('public/data/pitching_stats_2025.csv');
  const header = 'teamName,avg,obp,slg,ops\n';
  const rowsText = data.map(row =>
    `${row.teamName},${row.avg},${row.obp},${row.slg},${row.ops}`
  );

  writeFileSync(csvPath, header + rowsText.join('\n'), 'utf-8');
  console.log(`✅ CSV generado exitosamente en ${csvPath}`);

  await browser.close();
}

scrapePitchingStats().catch((err) => {
  console.error('❌ Error en scrapePitchingStats:', err);
});