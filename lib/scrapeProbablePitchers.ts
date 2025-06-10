import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

(async () => {
  const url = 'https://baseballsavant.mlb.com/probable-pitchers';
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🌐 Navegando a la página de abridores probables...');
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

  console.log('📷 Capturando screenshot...');
  await page.screenshot({ path: 'debug_probables_full.png', fullPage: true });

  console.log('⏳ Esperando la tabla...');
  await page.waitForSelector('table', { timeout: 60000 });

  console.log('✅ Extrayendo datos...');
  const data = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('table tbody tr'));
    return rows.map(row => {
      const cells = Array.from(row.querySelectorAll('td')).map(td => td.textContent?.trim() || '');
      return cells;
    });
  });

  const header = ['Name', 'Team', 'Throws', 'Opponent', 'ERA', 'Date'];
  const csvRows = [header.join(',')];

  data.forEach(row => {
    const [name, team, throws, opponent, era, date] = row;
    if (name && team && throws && opponent && era && date) {
      csvRows.push([name, team, throws, opponent, era, date].join(','));
    }
  });

  const dirPath = path.join('public', 'data');
  const filePath = path.join(dirPath, 'probable_pitchers_2025.csv');

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  fs.writeFileSync(filePath, csvRows.join('\n'));

  console.log(`📁 CSV de abridores guardado en: ${filePath}`);

  await browser.close();
})();