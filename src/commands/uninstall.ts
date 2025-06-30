import fs from 'fs';
import path from 'path';
import { VERSIONS_DIR } from '../constants';
import promptSync from 'prompt-sync';

const prompt = promptSync({ sigint: true });

export function uninstall(version: string): void {
  const versionDir = path.join(VERSIONS_DIR, version);
  if (!fs.existsSync(versionDir)) {
    console.error(`PHP ${version} is not installed.`);
    process.exit(1);
  }

  const answer = prompt(`Are you sure you want to uninstall PHP ${version}? [y/N]: `);
  if (answer.toLowerCase() !== 'y') {
    console.log('Aborted.');
    process.exit(0);
  }

  try {
    fs.rmSync(versionDir, { recursive: true, force: true });
    console.log(`PHP ${version} uninstalled successfully.`);
  } catch (err: any) {
    console.error(`Failed to uninstall PHP ${version}: ${err.message}`);
    process.exit(1);
  }
}
