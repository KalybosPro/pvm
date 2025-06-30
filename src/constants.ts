import path from 'path';
import os from 'os';

export const HOME = process.env.HOME || process.env.USERPROFILE || '';
export const PVM_DIR = path.join(HOME, '.pvm');
export const VERSIONS_DIR = path.join(PVM_DIR, 'versions');
export const CONFIG_FILE = '.pvmrc';
