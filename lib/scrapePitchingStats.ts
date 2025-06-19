import puppeteer from 'puppeteer';
import cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { createObjectCsvWriter } from 'csv-writer';

const scrapePitchingStats = async () => {
  console.log('🧽 Obteniendo estadísticas de pitcheo por equipo...');

  const url = 'https://baseballsavant.mlb.com/leaderboard/statcast?type=pitcher-team&year=2025&position=&team=&min=q&sort=barrels_per_pa&sortDir=desc';

  const browser = await puppeteer.launch({
    headless: 'new',
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  await page.waitForTimeout(5000); // tiempo extra por si tarda en cargar

  const content = await page.content();
  fs.writeFileSync('debug_pitching_full.html', content);
  const $ = cheerio.load(content);

  const table = $('#leaderboard-wrapper table');
  if (!table.length) {
    console.error('❌ Tabla no encontrada');
    await browser.close();
    return;
  }

  const rows = table.find('tbody tr');
  const data: { teamName: string; avg: number; obp: number; slg: number; ops: number }[] = [];

  rows.each((_, row) => {
    const cells = $(row).find('td');
    const teamName = $(cells[1]).text().trim();
    const avg = parseFloat($(cells[5]).text().trim()) || 0;
    const obp = parseFloat($(cells[6]).text().trim()) || 0;
    const slg = parseFloat($(cells[7]).text().trim()) || 0;
    const ops = parseFloat($(cells[8]).text().trim()) || 0;

    if (teamName) {
      data.push({ teamName, avg, obp, slg, ops });
    }
  });

  const outputPath = path.join(__dirname, '../public/data/pitching_stats_2025.csv');

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
  console.log(`✅ CSV generado exitosamente en ${outputPath}`);

  await browser.close();
};

scrapePitchingStats().catch((error) => {
  console.error('❌ Error en scrapePitchingStats:', error);
});