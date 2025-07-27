import os from 'os';
import path from 'path';
import fs from 'fs-extra';
import logger from '../utils/logger';
import { execSync, spawnSync } from 'child_process';

export class PathManager {
  constructor() { }

  private getShellProfilePath(): string | null {
    const home = os.homedir();
    switch (process.platform) {
      case 'win32': {
        // PowerShell profile by default
        const psProfile = process.env['PROFILE'] || path.join(home, 'Documents', 'PowerShell', 'Microsoft.PowerShell_profile.ps1');
        return psProfile;
      }
      case 'darwin':
      case 'linux': {
        const shell = process.env.SHELL || '';
        if (shell.includes('bash')) return path.join(home, '.bashrc');
        if (shell.includes('zsh')) return path.join(home, '.zshrc');
        if (shell.includes('fish')) return path.join(home, '.config', 'fish', 'config.fish');
        return path.join(home, '.profile');
      }
      default:
        return null;
    }
  }

  async addPathPersistently(phpBinPath: string): Promise<void> {
    try {
      if (process.platform === 'win32') {
        await this._addPathWindows(phpBinPath);
      } else {
        await this._addPathUnix(phpBinPath);
      }
      logger.info(`Added ${phpBinPath} to PATH persistently.`);
    } catch (error) {
      logger.error(`Failed to add to PATH persistently: ${(error as Error).message}`);
      throw error;
    }
  }

  private async _addPathUnix(phpBinPath: string): Promise<void> {
    const profilePath = this.getShellProfilePath();
    if (!profilePath) {
      throw new Error('Unable to detect shell profile');
    }
    await fs.ensureFile(profilePath);
    const exportLine = `export PATH="${phpBinPath}:$PATH"`;
    const content = await fs.readFile(profilePath, 'utf-8');
    if (!content.includes(exportLine)) {
      await fs.appendFile(profilePath, `\n# Added by pvm\n${exportLine}\n`);
    }
  }

  private async _addPathWindows(phpBinPath: string): Promise<void> {
    const pvmBasePath = path.resolve('.pvm/versions/'); // e.g., C:/Users/user/.pvm/versions

    const psCommand = `
  $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
  $split = $userPath -split ';' | Where-Object { \$_ -and (\$_ -notlike "${pvmBasePath}*") }
  if (-not $split.Contains("${phpBinPath}")) {
    $split += "${phpBinPath}"
  }
  $newPath = ($split -join ';').TrimEnd(';')
  [Environment]::SetEnvironmentVariable('Path', $newPath, 'User')
  `;

    const result = spawnSync('powershell.exe', ['-NoProfile', '-Command', psCommand], { encoding: 'utf-8' });

    if (result.error) {
      throw result.error;
    }
  }


  addTemporaryPath(phpBinPath: string): void {
    const currentPath = process.env.PATH || '';
    if (!currentPath.startsWith(phpBinPath)) {
      process.env.PATH = phpBinPath + path.delimiter + currentPath;
      logger.info(`Added ${phpBinPath} to PATH for current session.`);
    }
  }
}
