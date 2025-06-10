import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

(async () => {
  const url = 'https://baseballsavant.mlb.com/league?view=statcast&nav=pitching&season=2025';
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🌐 Navegando a la página de pitcheo...');
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

  console.log('📷 Capturando screenshot...');
  await page.screenshot({ path: 'debug_pitching_full.png', fullPage: true });

  console.log('⏳ Esperando que cargue la tabla...');
  await page.waitForSelector('table tbody tr', { timeout: 60000 });

  console.log('✅ Extrayendo datos...');
  const data = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('table tbody tr'));
    return rows.map(row => {
      const cells = Array.from(row.querySelectorAll('td')).map(td => td.textContent?.trim() || '');
      return cells;
    });
  });

  // 👉 inspecciona el primer row para ajustar índices si es necesario
  console.log('🔍 Primer fila de datos:', data[0]);

  const header = ['Team', 'ERA', 'FIP', 'xERA', 'K%', 'BB%'];
  const csvRows = [header.join(',')];

  data.forEach(row => {
    // AJUSTA estos índices si tu consola muestra otra estructura
    const team = row[0];
    const era = row[5];
    const fip = row[6];
    const xera = row[7];
    const kperc = row[14];
    const bbperc = row[15];

    if (team && era && fip && xera && kperc && bbperc) {
      csvRows.push([team, era, fip, xera, kperc, bbperc].join(','));
    }
  });

  const dirPath = path.join('public', 'data');
  const filePath = path.join(dirPath, 'pitching_stats_2025.csv');

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  fs.writeFileSync(filePath, csvRows.join('\n'));

  console.log(`✅ CSV de pitcheo guardado en: ${filePath}`);

  await browser.close();
})();