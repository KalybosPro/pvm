import fs from 'fs';
import { VERSIONS_DIR, CONFIG_FILE } from '../constants';
import { ensureDirs } from '../utils/fs';

export function list(): void {
  ensureDirs();

  const versions = fs.readdirSync(VERSIONS_DIR);
  if (!versions.length) {
    console.log('No PHP versions installed yet.');
    return;
  }

  let currentVersion: string | null = null;
  if (fs.existsSync(CONFIG_FILE)) {
    const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
    const match = content.match(/php=(.+)/);
    if (match) currentVersion = match[1];
  }

  console.log('Installed versions:');
  for (const v of versions) {
    if (v === currentVersion) {
      console.log(` * ${v} (current)`);
    } else {
      console.log(`   ${v}`);
    }
  }
}
