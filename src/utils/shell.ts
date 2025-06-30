import { execSync, spawnSync, ExecSyncOptions, SpawnSyncOptions } from 'child_process';

export function run(cmd: string, options: ExecSyncOptions = {}): string {
  return execSync(cmd, { stdio: 'pipe', ...options }).toString().trim();
}

export function runInteractive(cmd: string, options: ExecSyncOptions = {}): void {
  execSync(cmd, { stdio: 'inherit', ...options });
}

export function runSpawn(bin: string, args: string[], options: SpawnSyncOptions = {}): number {
  const result = spawnSync(bin, args, { stdio: 'inherit', ...options });
  return result.status || 0;
}
