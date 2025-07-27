import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import logger from '../utils/logger';
import { VersionsManager } from '../core/versionsManager';
import { getPvmDir } from '../utils/fileHelpers';

export default async function uninstallCommand(version?: string): Promise<void> {
  if (!version) {
    logger.error(chalk.red('Please specify a PHP version to uninstall.'));
    process.exit(1);
  }
  const versionsManager = new VersionsManager();

  try {
    const installed = await versionsManager.isVersionInstalled(version);
    if (!installed) {
      logger.error(chalk.red(`Version ${version} is not installed.`));
      process.exit(1);
    }

    const versionPath = path.join(getPvmDir(), 'versions', version);

    await fs.remove(versionPath);

    await versionsManager.removeVersion(version);

    logger.info(chalk.green(`PHP version ${version} uninstalled successfully.`));
  } catch (error) {
    logger.error(chalk.red(`Failed to uninstall version ${version}: ${(error as Error).message}`));
    process.exit(1);
  }
}
