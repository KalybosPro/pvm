import path from 'path';
import fs from 'fs-extra';
import os from 'os';

export function getPvmDir(): string {
  const envDir = process.env.PVM_DIR;
  if (envDir) return envDir;
  return path.join(os.homedir(), '.pvm');
}

export async function writeJsonAtomic(filePath: string, data: any, options?: { spaces?: number }): Promise<void> {
  const tmpFile = filePath + '.' + Date.now();
  await fs.writeFile(tmpFile, JSON.stringify(data, null, options?.spaces || 2), 'utf-8');
  await fs.move(tmpFile, filePath, { overwrite: true });
}

export async function readJsonAtomic<T>(filePath: string): Promise<T> {
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}

export async function removeDir(dirPath: string): Promise<void> {
  await fs.remove(dirPath);
}
