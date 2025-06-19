import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { createObjectCsvWriter } from 'csv-writer';

const mergeStats = () => {
  console.log('🧩 Combinando estadísticas de bateo y pitcheo...');

  const battingPath = path.join(__dirname, '../public/data/batting_teams_2025.csv');
  const pitchingPath = path.join(__dirname, '../public/data/pitching_stats_2025.csv');
  const outputPath = path.join(__dirname, '../public/data/mlb_stats_2025_combined.csv');

  const battingCsv = fs.readFileSync(battingPath, 'utf-8');
  const pitchingCsv = fs.readFileSync(pitchingPath, 'utf-8');

  const battingData = parse(battingCsv, {
    columns: true,
    skip_empty_lines: true,
  });

  const pitchingData = parse(pitchingCsv, {
    columns: true,
    skip_empty_lines: true,
  });

  const pitchingMap = new Map<string, any>();
  pitchingData.forEach((row: any) => {
    pitchingMap.set(row.teamName, row);
  });

  const combinedData = battingData.map((bat: any) => {
    const pitch = pitchingMap.get(bat.teamName) || {};
    return {
      teamName: bat.teamName,
      avg: bat.avg,
      obp: bat.obp,
      slg: bat.slg,
      ops: bat.ops,
      era: pitch.era || '',
      whip: pitch.whip || '',
      k9: pitch.k9 || '',
      bb9: pitch.bb9 || '',
    };
  });

  const csvWriter = createObjectCsvWriter({
    path: outputPath,
    header: [
      { id: 'teamName', title: 'teamName' },
      { id: 'avg', title: 'avg' },
      { id: 'obp', title: 'obp' },
      { id: 'slg', title: 'slg' },
      { id: 'ops', title: 'ops' },
      { id: 'era', title: 'era' },
      { id: 'whip', title: 'whip' },
      { id: 'k9', title: 'k9' },
      { id: 'bb9', title: 'bb9' },
    ],
  });

  csvWriter.writeRecords(combinedData).then(() => {
    console.log(`✅ Archivo combinado generado exitosamente en ${outputPath}`);
  });
};

mergeStats();