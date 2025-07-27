import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import logger from '../utils/logger';
import { ConfigManager } from '../config/configManager';
import { PathManager } from '../core/pathManager';
import { getPvmDir } from '../utils/fileHelpers';

async function findPhpvmrc(startDir: string): Promise<string | null> {
  let currentDir = startDir;
  while (true) {
    const rcPath = path.join(currentDir, '.pvmrc');
    if (await fs.pathExists(rcPath)) {
      return rcPath;
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break;
    currentDir = parentDir;
  }
  return null;
}

export default async function autoCommand(): Promise<void> {
  try {
    const startDir = process.cwd();
    const rcPath = await findPhpvmrc(startDir);
    const configManager = ConfigManager.getInstance();
    const pathManager = new PathManager();

    if (rcPath) {
      const content = await fs.readFile(rcPath, 'utf-8');
      let localVersion: string | undefined;
      try {
        if (content.trim().startsWith('{')) {
          const parsed = JSON.parse(content);
          localVersion = parsed.version;
        } else {
          localVersion = content.trim();
        }
      } catch {
        localVersion = content.trim();
      }

      if (!localVersion) {
        logger.warn(chalk.yellow(`No version found in .phpvmrc at ${rcPath}. Falling back to global.`));
      } else {
        const installed = await new (await import('../core/versionsManager')).VersionsManager().isVersionInstalled(localVersion);
        if (!installed) {
          logger.warn(chalk.yellow(`Local version ${localVersion} from .pvmrc is not installed. Falling back to global.`));
        } else {
          const phpBinPath = getPath(localVersion);
          pathManager.addTemporaryPath(phpBinPath);
          logger.info(chalk.green(`Activated local PHP version ${localVersion} from ${rcPath}`));
          return;
        }
      }
    }

    // fallback global
    const globalVersion = configManager.getGlobal('globalVersion');
    if (globalVersion) {
      const phpBinPath = getPath(globalVersion);
      pathManager.addTemporaryPath(phpBinPath);
      logger.info(chalk.green(`Activated global PHP version ${globalVersion}`));
    } else {
      logger.warn(chalk.yellow('No global PHP version set. Please set one using pvm use or pvm global.'));
    }
  } catch (error) {
    logger.error(chalk.red(`Failed to auto activate PHP version: ${(error as Error).message}`));
  }
}


function getPath(v: string): string {
  let p = '';
  if (process.platform === 'win32') {
    p = path.join(getPvmDir(), 'versions', v);
  } else {
    p = path.join(getPvmDir(), 'versions', v, 'bin');
  }
  return p;
}