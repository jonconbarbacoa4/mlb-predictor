import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

(async () => {
  const url = 'https://baseballsavant.mlb.com/league?view=statcast&nav=hitting&season=2025';
  const browser = await puppeteer.launch({ headless: true }); // usa true en vez de 'new'
  const page = await browser.newPage();

  console.log('🌐 Navegando a la página...');
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });

  console.log('⏳ Esperando que cargue el contenedor principal...');
  await page.waitForSelector('#savantLeaderBoard', { timeout: 60000 });

  console.log('📷 Tomando captura de pantalla...');
  await page.screenshot({ path: 'batting_table_debug.png', fullPage: true });

  console.log('✅ Tabla visible. Listo para extraer los datos.');

  const data = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('table tbody tr'));
    return rows.map(row => {
      const cells = Array.from(row.querySelectorAll('td')).map(td => td.textContent?.trim() || '');
      return cells;
    });
  });

  const header = ['Team', 'AVG', 'OBP', 'SLG', 'OPS'];
  const csvRows = [header.join(',')];

  data.forEach(row => {
    const [team, , , , avg, obp, slg, ops] = row;
    if (team && avg && obp && slg && ops) {
      csvRows.push([team, avg, obp, slg, ops].join(','));
    }
  });

  const dirPath = path.join('public', 'data');
  const filePath = path.join(dirPath, 'batting_teams_2025.csv');

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  fs.writeFileSync(filePath, csvRows.join('\n'));

  console.log(`📁 CSV guardado en: ${filePath}`);

  await browser.close();
})();