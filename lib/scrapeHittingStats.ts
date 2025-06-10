import fs from 'fs';
import puppeteer from 'puppeteer';

(async () => {
  const url = 'https://baseballsavant.mlb.com/league?view=statcast&nav=hitting&season=2025';
  const outputPath = 'public/data/batting_teams_2025.csv';

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Esperar que cargue la tabla
  await page.waitForSelector('.rt-table');

  const { header, rows } = await page.evaluate(() => {
    const headerCells = Array.from(document.querySelectorAll('.rt-table .rt-thead.-header .rt-th'));
    const header = headerCells.map(cell => (cell.textContent || '').trim());

    const rowGroups = Array.from(document.querySelectorAll('.rt-tbody .rt-tr-group'));
    const rows = rowGroups.map(rowGroup => {
      const cells = rowGroup.querySelectorAll('.rt-td');
      return Array.from(cells).map(cell => (cell.textContent || '').trim());
    }).filter(row => row.length > 0);

    return { header, rows };
  });

  const csv = [header.join(','), ...rows.map(row => row.join(','))].join('\n');
  fs.mkdirSync('public/data', { recursive: true });
  fs.writeFileSync(outputPath, csv);

  console.log(`✅ Datos de bateo guardados en: ${outputPath}`);
  await browser.close();
})();