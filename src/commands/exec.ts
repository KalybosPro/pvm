import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { CONFIG_FILE, VERSIONS_DIR } from '../constants';

export function execPhp(cmdArgs: string[]): void {
  if (!fs.existsSync(CONFIG_FILE)) {
    console.error('No .pvmrc file found. Use "pvm use <version>" first.');
    process.exit(1);
  }

  const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
  const match = content.match(/php=(.+)/);
  if (!match) {
    console.error('Malformed .pvmrc file.');
    process.exit(1);
  }

  const version = match[1];
  const phpBin = path.join(VERSIONS_DIR, version, 'bin', 'php');

  if (!fs.existsSync(phpBin)) {
    console.error(`PHP binary not found for version ${version}.`);
    process.exit(1);
  }

  const result = spawnSync(phpBin, cmdArgs, { stdio: 'inherit' });
  process.exit(result.status || 0);
}
