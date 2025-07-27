import path from 'path';
import chalk from 'chalk';
import logger from '../utils/logger';
import os from 'os';
import { VersionsManager } from '../core/versionsManager';
import { ConfigManager, loadGlobalConfig } from '../config/configManager';
import { PathManager } from '../core/pathManager';
import { getPvmDir } from '../utils/fileHelpers';

export default async function useCommand(
  version?: string,
  options?: { temporary?: boolean }
): Promise<void> {
  const platform = os.platform();
  if (!version) {
    logger.error(chalk.red('Please specify a PHP version to use.'));
    process.exit(1);
  }
  const versionsManager = new VersionsManager();
  const isInstalled = await versionsManager.isVersionInstalled(version);
  if (!isInstalled) {
    logger.error(chalk.red(`Version ${version} is not installed.`));
    process.exit(1);
  }

  try {
    const configManager = ConfigManager.getInstance();
    await loadGlobalConfig();

    const pathManager = new PathManager();
    let phpBinPath = path.join(getPvmDir(), 'versions', version, 'bin');

    if(platform==='win32'){
      phpBinPath = path.join(getPvmDir(), 'versions', version);
    }

    if (options?.temporary) {
      // Modify PATH temporarily only
      pathManager.addTemporaryPath(phpBinPath);
      logger.info(chalk.green(`Temporarily using PHP ${version} at ${phpBinPath}`));
    } else {
      // Permanent global usage update
      await configManager.setGlobal('globalVersion', version);

      // Update PATH in shell profile
      await pathManager.addPathPersistently(phpBinPath);

      logger.info(chalk.green(`Now using PHP ${version} globally.`));
      logger.info(`PHP binary at: ${chalk.cyan(phpBinPath)}`);
    }
  } catch (error) {
    logger.error(chalk.red(`Failed to switch PHP version: ${(error as Error).message}`));
    process.exit(1);
  }
}
