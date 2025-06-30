import fs from 'fs';
import { PVM_DIR, VERSIONS_DIR } from '../constants';

export function ensureDirs(): void {
  if (!fs.existsSync(PVM_DIR)) fs.mkdirSync(PVM_DIR, { recursive: true });
  if (!fs.existsSync(VERSIONS_DIR)) fs.mkdirSync(VERSIONS_DIR, { recursive: true });
}
