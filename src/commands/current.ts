import fs from 'fs';
import { CONFIG_FILE } from '../constants';

export function current(): void {
  if (!fs.existsSync(CONFIG_FILE)) {
    console.log('No .pvmrc file found.');
    return;
  }
  const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
  const match = content.match(/php=(.+)/);
  if (match) {
    console.log(`Current PHP version: ${match[1]}`);
  } else {
    console.log('Malformed .pvmrc file.');
  }
}
