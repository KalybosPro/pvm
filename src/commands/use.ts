import fs from 'fs';
import path from 'path';
import { VERSIONS_DIR, CONFIG_FILE } from '../constants';

export function use(version: string): void {
  const versionDir = path.join(VERSIONS_DIR, version);
  if (!fs.existsSync(versionDir)) {
    console.error(`PHP ${version} is not installed. Run: pvm install ${version}`);
    process.exit(1);
  }

  fs.writeFileSync(CONFIG_FILE, `php=${version}\n`);
  console.log(`Project now uses PHP ${version}`);
}
