// lib/fetchTeams.ts
import fs from 'fs';
import path from 'path';

async function fetchTeams() {
  const res = await fetch('https://statsapi.mlb.com/api/v1/teams?sportId=1');
  const data = await res.json();
  const teams = data.teams;

  console.log('🧠 Equipos encontrados:', teams.length);

  const rows = teams.map((t: any) => `${t.id},${t.name}`);
  const csv = ['teamId,teamName', ...rows].join('\n');

  console.log('📝 CSV generado:\n', csv);

  const filePath = path.resolve('public/data/mlb_teams.csv');
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, csv, 'utf-8');

  console.log(`✅ Archivo generado en ${filePath}`);
}

fetchTeams();