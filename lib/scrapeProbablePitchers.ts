import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

(async () => {
  console.log('🌐 Navegando a la página...');

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://baseballsavant.mlb.com/probable-pitchers', {
    waitUntil: 'networkidle0',
  });

  await page.waitForSelector('.player-info');

  const data = await page.evaluate(() => {
    const entries: { Date: string; Name: string; Team: string; Opponent: string; Throws: string; AVG: string }[] = [];

    const gameBlocks = document.querySelectorAll('.mod');
    const today = new Date();
    const todayFormatted = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

    gameBlocks.forEach((game) => {
      const teams = game.querySelector('h2')?.textContent?.split('@').map(t => t.trim()) || [];
      const playerBlocks = game.querySelectorAll('.player-info');

      playerBlocks.forEach((player, i) => {
        const name = player.querySelector('h3')?.textContent?.trim() || '';
        const throws = player.querySelector('.throws')?.textContent?.replace('Throws:', '').trim() || '';

        // Buscar tabla con AVG en el DOM relativo al bloque del jugador
        let avg = '';
        const matchupTable = player.parentElement?.querySelector('table');
        if (matchupTable) {
          const headers = Array.from(matchupTable.querySelectorAll('thead th')).map(th => th.textContent?.trim());
          const avgIndex = headers.findIndex(h => h === 'AVG');
          if (avgIndex >= 0) {
            const value = matchupTable.querySelector(`tbody tr td:nth-child(${avgIndex + 1})`)?.textContent?.trim();
            if (value) avg = value;
          }
        }

        if (name && teams.length === 2) {
          entries.push({
            Date: todayFormatted,
            Name: name,
            Team: i === 0 ? teams[0] : teams[1],
            Opponent: i === 0 ? teams[1] : teams[0],
            Throws: throws,
            AVG: avg,
          });
        }
      });
    });

    return entries;
  });

  await browser.close();

  const csvContent = ['Date,Name,Team,Opponent,Throws,AVG']
    .concat(data.map(p =>
      [p.Date, p.Name, p.Team, p.Opponent, p.Throws, p.AVG].join(',')
    ))
    .join('\n');

  const filePath = path.resolve('public/data/probable_pitchers_2025.csv');
  fs.writeFileSync(filePath, csvContent, 'utf-8');

  console.log(`✅ CSV generado con ${data.length} pitchers (con AVG) en ${filePath}`);
})();