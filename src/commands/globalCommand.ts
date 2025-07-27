import path from 'path';
import chalk from 'chalk';
import logger from '../utils/logger';
import { ConfigManager, loadGlobalConfig } from '../config/configManager';
import { VersionsManager } from '../core/versionsManager';
import { PathManager } from '../core/pathManager';
import { getPvmDir } from '../utils/fileHelpers';

export default async function globalCommand(version?: string): Promise<void> {
  const configManager = ConfigManager.getInstance();

  try {
    await loadGlobalConfig();

    if (!version) {
      const globalVersion = configManager.getGlobal('globalVersion');
      if (globalVersion) {
        logger.info(chalk.green(`Global PHP version: ${globalVersion}`));
      } else {
        logger.info(chalk.yellow('No global version set.'));
      }
      return;
    }

    const versionsManager = new VersionsManager();
    const installed = await versionsManager.isVersionInstalled(version);
    if (!installed) {
      logger.error(chalk.red(`Version ${version} is not installed.`));
      process.exit(1);
    }

    await configManager.setGlobal('globalVersion', version);

    const phpBinPath = getPhpBinPath(version);
    const pathManager = new PathManager();
    await pathManager.addPathPersistently(phpBinPath);

    logger.info(chalk.green(`Global PHP version set to ${version}.`));
    logger.info(`PHP binary at: ${chalk.cyan(phpBinPath)}`);
  } catch (error) {
    logger.error(chalk.red(`Failed to set global PHP version: ${(error as Error).message}`));
  }
}

function getPhpBinPath(version: string): string {
  let p = '';
  if (process.platform === 'win32') {
    p = path.join(getPvmDir(), 'versions', version);
  } else {
    p = path.join(getPvmDir(), 'versions', version, 'bin');
  }

  return p;
}
